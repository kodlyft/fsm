# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt
#
# Whitelisted endpoints consumed by the KodLyft FSM frontends (console, portal, mobile).

import frappe


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
	}


@frappe.whitelist()
def create_invoice_from_job(job: str):
	"""Generate a draft Sales Invoice from a job's parts & services and link it back."""
	doc = frappe.get_doc("Service Job", job)

	if doc.sales_invoice:
		return {"name": doc.sales_invoice}
	if not doc.customer:
		frappe.throw("This job has no customer to invoice.")
	if not doc.items:
		frappe.throw("This job has no parts or services to invoice.")

	company = (
		frappe.defaults.get_user_default("Company")
		or frappe.db.get_single_value("Global Defaults", "default_company")
	)

	invoice = frappe.new_doc("Sales Invoice")
	invoice.customer = doc.customer
	if company:
		invoice.company = company
	for row in doc.items:
		invoice.append("items", {"item_code": row.item_code, "qty": row.qty, "rate": row.rate})
	invoice.insert()

	doc.db_set("sales_invoice", invoice.name)
	return {"name": invoice.name}


@frappe.whitelist(allow_guest=True)
def book_appointment(
	customer_name: str,
	contact_phone: str,
	service_address: str | None = None,
	service_type: str | None = None,
	preferred_date: str | None = None,
	notes: str | None = None,
):
	"""Public booking from the customer portal — creates an open Service Appointment."""
	appointment = frappe.get_doc(
		{
			"doctype": "Service Appointment",
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
