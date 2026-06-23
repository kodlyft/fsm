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
