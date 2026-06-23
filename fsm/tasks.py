# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import now_datetime


def flag_sla_breaches():
	"""Flag jobs whose promised response time has passed without a response.

	Runs hourly so a breach is detected even when the job isn't being edited (the
	controller's `track_sla` only fires on save). Publishes a realtime update so the
	dispatch board reflects the breach immediately."""
	from fsm.realtime import on_service_job_update

	breached = frappe.get_all(
		"Service Job",
		filters=[
			["sla_breached", "=", 0],
			["responded_on", "is", "not set"],
			["promised_response_by", "is", "set"],
			["promised_response_by", "<", now_datetime()],
			["status", "in", ["Draft", "Scheduled"]],
		],
		pluck="name",
	)
	for name in breached:
		frappe.db.set_value("Service Job", name, "sla_breached", 1, update_modified=False)
		on_service_job_update(frappe.get_doc("Service Job", name))

	if breached:
		frappe.db.commit()
	return breached


def notify_low_stock():
	"""Daily: alert FSM Managers about items running low on vans / in FSM warehouses.

	Reordering is handled by ERPNext's native auto-reorder; this is the human heads-up
	so a dispatcher can expedite or reroute parts before a technician runs dry."""
	from fsm.inventory import low_stock_rows

	rows = low_stock_rows()
	if not rows:
		return []

	managers = _fsm_manager_users()
	if not managers:
		return rows

	lines = "\n".join(
		f"- {r['item_name'] or r['item_code']} @ {r['warehouse']}: "
		f"{r['actual_qty']} (reorder {r['reorder_level']})"
		for r in rows
	)
	message = _low_stock_message(len(rows), lines)
	for user in managers:
		frappe.get_doc(
			{
				"doctype": "Notification Log",
				"for_user": user,
				"type": "Alert",
				"subject": f"{len(rows)} FSM stock item(s) running low",
				"email_content": message,
			}
		).insert(ignore_permissions=True)

	frappe.db.commit()
	return rows


def _fsm_manager_users() -> list[str]:
	"""Enabled users holding the FSM Manager role."""
	users = frappe.get_all(
		"Has Role",
		filters={"role": "FSM Manager", "parenttype": "User"},
		pluck="parent",
	)
	return [u for u in set(users) if frappe.db.get_value("User", u, "enabled")]


def _low_stock_message(count: int, lines: str) -> str:
	return f"<p>{count} item(s) are at or below their reorder level:</p><pre>{lines}</pre>"
