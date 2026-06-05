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
