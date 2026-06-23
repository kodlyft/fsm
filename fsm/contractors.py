# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe


@frappe.whitelist()
def list_subcontractors(status: str | None = None):
	filters = {"status": status} if status else {}
	return frappe.get_all(
		"Subcontractor",
		filters=filters,
		fields=["name", "subcontractor_name", "status", "territory", "hourly_rate", "phone", "email"],
		order_by="subcontractor_name asc",
	)


@frappe.whitelist()
def get_subcontractor_work(subcontractor: str):
	"""A subcontractor's workers, their jobs and a performance summary."""
	technicians = frappe.get_all(
		"Technician",
		filters={"subcontractor": subcontractor},
		fields=["name", "technician_name", "status", "active"],
	)
	tech_names = [t.name for t in technicians]

	jobs = []
	if tech_names:
		jobs = frappe.get_all(
			"Service Job",
			filters={"primary_technician": ["in", tech_names]},
			fields=[
				"name",
				"customer_name",
				"status",
				"scheduled_date",
				"primary_technician",
				"actual_hours",
				"total_cost",
			],
			order_by="scheduled_date desc",
			limit_page_length=50,
		)

	completed = [j for j in jobs if j.status == "Completed"]
	summary = {
		"technicians": len(technicians),
		"total_jobs": len(jobs),
		"completed_jobs": len(completed),
		"total_hours": round(sum(j.actual_hours or 0 for j in jobs), 2),
		"total_cost": round(sum(j.total_cost or 0 for j in jobs), 2),
	}
	return {"technicians": technicians, "jobs": jobs, "summary": summary}
