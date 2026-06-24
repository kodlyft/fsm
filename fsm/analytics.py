# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import add_days, get_datetime, nowdate, time_diff_in_hours


def _since(days: int) -> str:
	return add_days(nowdate(), -int(days))


@frappe.whitelist()
def service_performance(days: int = 90):
	"""Headline service KPIs over a recent window."""
	since = _since(days)
	jobs = frappe.get_all(
		"Service Job",
		filters=[["creation", ">=", since]],
		fields=[
			"name",
			"status",
			"creation",
			"scheduled_date",
			"promised_response_by",
			"responded_on",
			"completed_on",
			"actual_hours",
			"sla_breached",
		],
	)
	total = len(jobs)
	completed = [j for j in jobs if j.status == "Completed"]

	mttr_vals = [
		time_diff_in_hours(j.completed_on, j.creation) for j in completed if j.completed_on
	]
	mttr = round(sum(mttr_vals) / len(mttr_vals), 2) if mttr_vals else None

	hour_vals = [j.actual_hours for j in completed if j.actual_hours]
	avg_completion = round(sum(hour_vals) / len(hour_vals), 2) if hour_vals else None

	punctual_base, punctual_ok = 0, 0
	for j in jobs:
		target = j.promised_response_by or j.scheduled_date
		if target and j.responded_on:
			punctual_base += 1
			if get_datetime(j.responded_on) <= get_datetime(target):
				punctual_ok += 1
	punctuality = round(punctual_ok / punctual_base * 100) if punctual_base else None

	returned = set(
		frappe.get_all(
			"Service Return",
			filters=[["service_job", "in", [j.name for j in completed] or [""]]],
			pluck="service_job",
		)
	)
	ftf = None
	if completed:
		first_time = len([j for j in completed if j.name not in returned])
		ftf = round(first_time / len(completed) * 100)

	return {
		"window_days": int(days),
		"total_jobs": total,
		"completed_jobs": len(completed),
		"completion_rate": round(len(completed) / total * 100) if total else None,
		"first_time_fix_rate": ftf,
		"mttr_hours": mttr,
		"avg_completion_hours": avg_completion,
		"punctuality_pct": punctuality,
		"sla_breaches": len([j for j in jobs if j.sla_breached]),
	}


@frappe.whitelist()
def workorder_volume(days: int = 90):
	"""Volume & mix of work orders: by status, by service type, and a daily trend."""
	since = _since(days)
	jobs = frappe.get_all(
		"Service Job",
		filters=[["creation", ">=", since]],
		fields=["status", "service_type", "creation"],
	)
	by_status = _count_by(jobs, lambda j: j.status)
	by_service_type = _count_by(jobs, lambda j: j.service_type or "Unspecified")
	by_day = _count_by(jobs, lambda j: str(get_datetime(j.creation).date()))

	open_statuses = {"Draft", "Scheduled", "Assigned", "In Progress", "On Hold"}
	return {
		"window_days": int(days),
		"total": len(jobs),
		"open": len([j for j in jobs if j.status in open_statuses]),
		"completed": len([j for j in jobs if j.status == "Completed"]),
		"by_status": by_status,
		"by_service_type": by_service_type,
		"trend": [{"date": d, "count": c} for d, c in sorted(by_day.items())],
	}


@frappe.whitelist()
def inventory_usage(days: int = 90, limit: int = 20):
	"""Parts consumed on completed jobs in the window, ranked by quantity."""
	since = _since(days)
	job_names = frappe.get_all(
		"Service Job",
		filters=[["status", "=", "Completed"], ["completed_on", ">=", since]],
		pluck="name",
	)
	if not job_names:
		return {"window_days": int(days), "items": []}

	rows = frappe.get_all(
		"Service Job Item",
		filters=[["parent", "in", job_names]],
		fields=["item_code", "item_name", "qty", "amount"],
	)
	agg: dict[str, dict] = {}
	for r in rows:
		a = agg.setdefault(
			r.item_code, {"item_code": r.item_code, "item_name": r.item_name, "qty": 0.0, "amount": 0.0}
		)
		a["qty"] += r.qty or 0
		a["amount"] += r.amount or 0

	items = sorted(agg.values(), key=lambda x: x["qty"], reverse=True)[: int(limit)]
	for it in items:
		it["qty"] = round(it["qty"], 2)
		it["amount"] = round(it["amount"], 2)
	return {"window_days": int(days), "items": items}


@frappe.whitelist()
def technician_utilization(days: int = 90):
	"""Per-technician job count, hours, average pace and completion rate."""
	since = _since(days)
	jobs = frappe.get_all(
		"Service Job",
		filters=[["creation", ">=", since], ["primary_technician", "is", "set"]],
		fields=["primary_technician", "status", "actual_hours"],
	)
	agg: dict[str, dict] = {}
	for j in jobs:
		a = agg.setdefault(
			j.primary_technician,
			{"technician": j.primary_technician, "jobs": 0, "completed": 0, "hours": 0.0},
		)
		a["jobs"] += 1
		a["hours"] += j.actual_hours or 0
		if j.status == "Completed":
			a["completed"] += 1

	out = []
	for a in agg.values():
		a["hours"] = round(a["hours"], 2)
		a["avg_hours_per_job"] = round(a["hours"] / a["jobs"], 2) if a["jobs"] else 0
		a["completion_rate"] = round(a["completed"] / a["jobs"] * 100) if a["jobs"] else 0
		out.append(a)
	out.sort(key=lambda x: x["jobs"], reverse=True)
	return {"window_days": int(days), "technicians": out}


def _count_by(rows, key) -> dict:
	out: dict[str, int] = {}
	for r in rows:
		k = key(r)
		out[k] = out.get(k, 0) + 1
	return out
