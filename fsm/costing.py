# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import now_datetime


def sum_job_hours(job: str) -> float:
	"""Total logged labour hours for a job."""
	hours = frappe.get_all("Service Time Log", filters={"service_job": job}, pluck="hours")
	return round(sum(h or 0 for h in hours), 2)


def compute_costs(doc) -> dict:
	"""Derive the cost fields for a Service Job document (in-memory, no write)."""
	actual = sum_job_hours(doc.name) if doc.name else (doc.actual_hours or 0)
	materials = sum((i.amount or 0) for i in doc.items)
	labor = (actual or 0) * (doc.labor_rate or 0)
	total = labor + materials + (doc.overhead_cost or 0)
	return {
		"actual_hours": actual,
		"materials_cost": materials,
		"labor_cost": labor,
		"total_cost": total,
	}


def recompute_job_costs(job: str):
	"""Recompute & persist a job's costs (used when a Service Time Log changes, which
	happens outside a job save)."""
	doc = frappe.get_doc("Service Job", job)
	doc.db_set(compute_costs(doc), update_modified=False)


@frappe.whitelist()
def start_timer(job: str, activity: str | None = None):
	"""Open a labour timer on a job for the signed-in technician."""
	from fsm.tracking import _technician_for_user

	technician = _technician_for_user()
	existing = _open_log(job, technician)
	if existing:
		return {"name": existing, "already_running": True}

	log = frappe.get_doc(
		{
			"doctype": "Service Time Log",
			"service_job": job,
			"technician": technician,
			"from_time": now_datetime(),
			"activity": activity,
		}
	).insert(ignore_permissions=True)
	return {"name": log.name, "already_running": False}


@frappe.whitelist()
def stop_timer(job: str):
	"""Close the open labour timer for the signed-in technician on a job."""
	from fsm.tracking import _technician_for_user

	technician = _technician_for_user()
	name = _open_log(job, technician)
	if not name:
		frappe.throw(_("No running timer to stop on this job."))
	log = frappe.get_doc("Service Time Log", name)
	log.to_time = now_datetime()
	log.save(ignore_permissions=True)
	return {"name": log.name, "hours": log.hours, "actual_hours": sum_job_hours(job)}


def _open_log(job: str, technician: str) -> str | None:
	"""The technician's running (no end time) timer on a job, if any."""
	return frappe.db.get_value(
		"Service Time Log",
		{"service_job": job, "technician": technician, "to_time": ["is", "not set"]},
		"name",
	)


@frappe.whitelist()
def estimate_job(service_type: str, technician: str | None = None):
	"""Average actual hours of comparable completed jobs, to price/schedule a new one.

	Per-technician when a technician is given (their own pace), otherwise the team
	average across everyone who has done this service type."""
	filters = [
		["status", "=", "Completed"],
		["service_type", "=", service_type],
		["actual_hours", ">", 0],
	]
	if technician:
		filters.append(["primary_technician", "=", technician])

	rows = frappe.get_all("Service Job", filters=filters, fields=["actual_hours"])
	if not rows:
		return {"service_type": service_type, "sample_size": 0, "avg_hours": None}

	avg = sum(r.actual_hours for r in rows) / len(rows)
	return {
		"service_type": service_type,
		"sample_size": len(rows),
		"avg_hours": round(avg, 2),
		"basis": "technician" if technician else "team",
	}


@frappe.whitelist()
def get_job_cost_summary(job: str):
	"""Cost breakdown for a job (estimate vs actual), for the console costing panel."""
	doc = frappe.get_doc("Service Job", job)
	costs = compute_costs(doc)
	return {
		"estimated_hours": doc.estimated_hours,
		"labor_rate": doc.labor_rate,
		"overhead_cost": doc.overhead_cost,
		**costs,
	}
