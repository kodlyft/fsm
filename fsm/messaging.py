# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _

STAFF_ROLES = {"FSM Manager", "FSM Technician", "System Manager"}


@frappe.whitelist()
def get_messages(job: str):
	"""The message thread for a job (oldest first). Customers see only their own."""
	_assert_job_access(job)
	return frappe.get_all(
		"Service Job Message",
		filters={"service_job": job},
		fields=["name", "author_role", "author_name", "message", "creation"],
		order_by="creation asc",
	)


@frappe.whitelist()
def post_message(job: str, message: str, author_role: str | None = None):
	"""Post a message to a job thread. Role is inferred from the caller unless given."""
	_assert_job_access(job)
	if not (message or "").strip():
		frappe.throw(_("Message can't be empty."))
	doc = frappe.get_doc(
		{
			"doctype": "Service Job Message",
			"service_job": job,
			"message": message,
			"author_role": author_role or _role_for_current_user(),
		}
	).insert(ignore_permissions=True)
	return {"name": doc.name, "creation": str(doc.creation)}


def post_system_message(job: str, message: str):
	"""Post a System message (used by controllers, e.g. reschedule notices)."""
	frappe.get_doc(
		{
			"doctype": "Service Job Message",
			"service_job": job,
			"message": message,
			"author_role": "System",
			"author_name": "System",
		}
	).insert(ignore_permissions=True)


def _assert_job_access(job: str):
	"""Staff see every thread; a customer only threads for their own jobs."""
	if STAFF_ROLES & set(frappe.get_roles()):
		return
	from fsm.api import _current_customer

	customer = _current_customer(optional=True)
	owner = frappe.db.get_value("Service Job", job, "customer")
	if not customer or owner != customer:
		raise frappe.PermissionError(_("This job is not on your account."))


def _role_for_current_user() -> str:
	roles = set(frappe.get_roles())
	if {"FSM Manager", "System Manager"} & roles:
		return "Dispatcher"
	if "FSM Technician" in roles:
		return "Technician"
	return "Customer"
