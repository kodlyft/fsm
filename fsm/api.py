# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _

from fsm.field_service_management.doctype.service_job.service_job import make_invoice_from_job


@frappe.whitelist()
def get_dispatch_jobs(status: str | None = None, technician: str | None = None, limit: int = 50):
	"""Jobs for the console dispatch board / mobile job list (permission-aware)."""
	filters: dict = {}
	if status:
		filters["status"] = status
	if technician:
		filters["primary_technician"] = technician

	return frappe.get_list(
		"Service Job",
		filters=filters,
		fields=[
			"name",
			"customer_name",
			"status",
			"priority",
			"scheduled_date",
			"primary_technician",
			"total_amount",
			"address_display",
			"sla_breached",
			"promised_response_by",
		],
		order_by="scheduled_date asc",
		limit_page_length=int(limit),
	)


@frappe.whitelist()
def get_dashboard_stats():
	"""Headline metrics for the console dashboard."""
	from frappe.utils import today

	start, end = today() + " 00:00:00", today() + " 23:59:59"
	open_statuses = ["Scheduled", "Assigned", "In Progress", "On Hold"]

	completed_today = frappe.get_all(
		"Service Job",
		filters={"status": "Completed", "completed_on": ["between", [start, end]]},
		fields=["total_amount"],
	)
	revenue_today = sum((row.total_amount or 0) for row in completed_today)

	return {
		"open_jobs": frappe.db.count("Service Job", {"status": ["in", open_statuses]}),
		"in_progress": frappe.db.count("Service Job", {"status": "In Progress"}),
		"completed_today": len(completed_today),
		"revenue_today": revenue_today,
		"sla_breached": frappe.db.count("Service Job", {"sla_breached": 1, "status": ["in", open_statuses]}),
	}


@frappe.whitelist()
def create_invoice_from_job(job: str):
	"""Generate a draft Sales Invoice from a job's parts & services and link it back."""
	return {"name": make_invoice_from_job(job)}


@frappe.whitelist()
def start_job_task(job: str, idx: int):
	"""Begin a checklist step (sequential) and return the refreshed job."""
	return frappe.get_doc("Service Job", job).start_task(idx)


@frappe.whitelist()
def complete_job_task(job: str, idx: int, note: str | None = None):
	"""Finish a checklist step and return the refreshed job."""
	return frappe.get_doc("Service Job", job).complete_task(idx, note)


@frappe.whitelist()
def complete_job(job: str):
	"""Complete a job that has no checklist; returns the refreshed job."""
	return frappe.get_doc("Service Job", job).complete_job()


@frappe.whitelist(allow_guest=True)
def register_customer(full_name: str, email: str, password: str, phone: str | None = None):
	"""Self-service customer signup from the portal.

	Creates a Website User, a linked Customer, and a Contact that ties the two
	together, then signs the new user in so the SPA can load their history."""
	full_name = (full_name or "").strip()
	email = (email or "").strip().lower()
	if not (full_name and email and password):
		frappe.throw(_("Name, email and password are required."))
	if frappe.db.exists("User", email):
		frappe.throw(_("An account with this email already exists. Please sign in."))

	first_name, last_name = [*full_name.split(" ", 1), ""]

	user = frappe.get_doc(
		{
			"doctype": "User",
			"email": email,
			"first_name": first_name,
			"last_name": last_name,
			"send_welcome_email": 0,
			"user_type": "Website User",
			"new_password": password,
		}
	).insert(ignore_permissions=True)
	user.add_roles("FSM Customer")

	customer = frappe.get_doc(
		{
			"doctype": "Customer",
			"customer_name": full_name,
			"customer_type": "Individual",
			"customer_group": _default_customer_group(),
			"territory": _default_territory(),
		}
	).insert(ignore_permissions=True)

	contact = frappe.get_doc({"doctype": "Contact", "first_name": first_name, "last_name": last_name})
	contact.user = email
	contact.append("email_ids", {"email_id": email, "is_primary": 1})
	if phone:
		contact.append("phone_nos", {"phone": phone, "is_primary_mobile_no": 1})
	contact.append("links", {"link_doctype": "Customer", "link_name": customer.name})
	contact.insert(ignore_permissions=True)

	frappe.local.login_manager.login_as(email)
	return {"customer": customer.name, "user": email, "full_name": full_name}


@frappe.whitelist(allow_guest=True)
def get_portal_session():
	"""Tell the portal who is signed in (and their linked customer), if anyone."""
	user = frappe.session.user
	if not user or user == "Guest":
		return {"authenticated": False}
	customer = _current_customer(optional=True)
	return {
		"authenticated": True,
		"user": user,
		"full_name": frappe.db.get_value("User", user, "full_name") or user,
		"customer": customer,
	}


@frappe.whitelist()
def get_my_appointments():
	"""Booking history for the signed-in customer."""
	customer = _current_customer()
	return frappe.get_all(
		"Service Appointment",
		filters={"customer": customer},
		fields=[
			"name",
			"status",
			"service_type",
			"preferred_date",
			"service_job",
			"creation",
		],
		order_by="creation desc",
	)


@frappe.whitelist()
def get_my_jobs():
	"""Job history for the signed-in customer."""
	customer = _current_customer()
	return frappe.get_all(
		"Service Job",
		filters={"customer": customer},
		fields=[
			"name",
			"status",
			"priority",
			"service_type",
			"scheduled_date",
			"completed_on",
			"primary_technician",
			"total_amount",
			"sales_invoice",
			"address_display",
		],
		order_by="creation desc",
	)


@frappe.whitelist()
def get_my_job(job: str):
	"""A single job (with checklist + items) — only if it belongs to the caller."""
	customer = _current_customer()
	owner = frappe.db.get_value("Service Job", job, "customer")
	if owner != customer:
		raise frappe.PermissionError(_("This job is not on your account."))

	doc = frappe.get_doc("Service Job", job)
	return {
		"name": doc.name,
		"status": doc.status,
		"priority": doc.priority,
		"service_type": doc.service_type,
		"scheduled_date": doc.scheduled_date,
		"completed_on": doc.completed_on,
		"primary_technician": doc.primary_technician,
		"address_display": doc.address_display,
		"total_amount": doc.total_amount,
		"sales_invoice": doc.sales_invoice,
		"notes": doc.notes,
		"tasks": [{"task": t.task, "completed": t.completed, "note": t.note} for t in doc.tasks],
		"items": [
			{
				"item_code": i.item_code,
				"item_name": i.item_name,
				"qty": i.qty,
				"rate": i.rate,
				"amount": i.amount,
			}
			for i in doc.items
		],
	}


@frappe.whitelist(allow_guest=True)
def book_appointment(
	customer_name: str,
	contact_phone: str,
	service_address: str | None = None,
	service_type: str | None = None,
	preferred_date: str | None = None,
	notes: str | None = None,
):
	"""Create an open Service Appointment.

	Public (guest) bookings capture just a name + phone; a signed-in customer's
	booking is linked straight to their Customer record."""
	appointment = frappe.get_doc(
		{
			"doctype": "Service Appointment",
			"customer": _current_customer(optional=True),
			"customer_name": customer_name,
			"contact_phone": contact_phone,
			"service_address": service_address,
			"service_type": service_type,
			"preferred_date": preferred_date,
			"notes": notes,
			"status": "Open",
		}
	).insert(ignore_permissions=True)

	return {"name": appointment.name}


def _current_customer(optional: bool = False) -> str | None:
	"""Resolve the Customer linked to the signed-in user (via their Contact)."""
	user = frappe.session.user
	if not user or user == "Guest":
		if optional:
			return None
		raise frappe.AuthenticationError(_("Please sign in to continue."))

	contact = frappe.db.get_value("Contact", {"user": user})

	if contact:
		customer = frappe.db.get_value(
			"Dynamic Link",
			{"parent": contact, "parenttype": "Contact", "link_doctype": "Customer"},
			"link_name",
		)
		print(customer)
		if customer:
			return customer

	if optional:
		return None
	raise frappe.ValidationError(_("No customer profile is linked to your account."))


def _default_customer_group() -> str:
	return (
		frappe.db.get_single_value("Selling Settings", "customer_group")
		or frappe.db.get_value("Customer Group", {"is_group": 0})
		or "All Customer Groups"
	)


def _default_territory() -> str:
	return (
		frappe.db.get_single_value("Selling Settings", "territory")
		or frappe.db.get_value("Territory", {"is_group": 0})
		or "All Territories"
	)
