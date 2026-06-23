# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import nowdate


@frappe.whitelist()
def get_customer_profile(customer: str):
	"""Customer details + service history + stats + field notes."""
	cust = frappe.db.get_value(
		"Customer",
		customer,
		["customer_name", "customer_group", "territory", "mobile_no", "email_id"],
		as_dict=True,
	)
	if not cust:
		frappe.throw(_("Customer not found."))

	jobs = frappe.get_all(
		"Service Job",
		filters={"customer": customer},
		fields=[
			"name",
			"status",
			"service_type",
			"scheduled_date",
			"completed_on",
			"total_amount",
			"total_cost",
			"primary_technician",
		],
		order_by="creation desc",
		limit_page_length=50,
	)
	completed = [j for j in jobs if j.status == "Completed"]
	last_dates = [j.completed_on for j in completed if j.completed_on]
	stats = {
		"total_jobs": len(jobs),
		"completed_jobs": len(completed),
		"total_billed": round(sum(j.total_amount or 0 for j in jobs), 2),
		"last_service": max(last_dates) if last_dates else None,
	}
	return {"customer": cust, "jobs": jobs, "stats": stats, "field_notes": list_field_notes(customer)}


@frappe.whitelist()
def add_field_note(
	customer: str,
	note: str,
	service_job: str | None = None,
	technician: str | None = None,
	visit_date: str | None = None,
):
	"""Record a technician's field note against a customer (and optionally a job)."""
	doc = frappe.get_doc(
		{
			"doctype": "Customer Field Note",
			"customer": customer,
			"service_job": service_job,
			"technician": technician or _current_technician(),
			"visit_date": visit_date or nowdate(),
			"note": note,
		}
	).insert(ignore_permissions=True)
	return {"name": doc.name}


@frappe.whitelist()
def list_field_notes(customer: str):
	return frappe.get_all(
		"Customer Field Note",
		filters={"customer": customer},
		fields=["name", "note", "service_job", "technician", "visit_date", "creation"],
		order_by="creation desc",
	)


def _current_technician() -> str | None:
	"""The Technician linked to the signed-in user, if any (notes from the field)."""
	return frappe.db.get_value("Technician", {"user": frappe.session.user})
