# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import add_days, nowdate

STAFF_ROLES = {"FSM Manager", "System Manager"}


@frappe.whitelist()
def submit_feedback(job: str, rating, comments: str | None = None, nps_score=None):
	"""Record satisfaction for a job. Customers may only rate their own jobs."""
	owner = frappe.db.get_value("Service Job", job, "customer")
	if not (STAFF_ROLES & set(frappe.get_roles())):
		from fsm.api import _current_customer

		customer = _current_customer(optional=True)
		if not customer or owner != customer:
			raise frappe.PermissionError(_("This job is not on your account."))

	if frappe.db.exists("Service Feedback", {"service_job": job}):
		frappe.throw(_("Feedback has already been submitted for this job."))

	doc = frappe.get_doc(
		{
			"doctype": "Service Feedback",
			"service_job": job,
			"rating": int(rating),
			"comments": comments,
			"nps_score": int(nps_score) if nps_score not in (None, "") else None,
		}
	).insert(ignore_permissions=True)
	return {"name": doc.name}


@frappe.whitelist()
def get_feedback(job: str):
	"""The feedback for a job, if any."""
	return frappe.db.get_value(
		"Service Feedback",
		{"service_job": job},
		["name", "rating", "nps_score", "comments", "submitted_on"],
		as_dict=True,
	)


@frappe.whitelist()
def get_csat_summary(days: int = 90):
	"""Average rating and NPS over a recent window, for the dashboard."""
	since = add_days(nowdate(), -int(days))
	rows = frappe.get_all(
		"Service Feedback", filters={"submitted_on": [">=", since]}, fields=["rating", "nps_score"]
	)
	if not rows:
		return {"responses": 0, "avg_rating": None, "nps": None}

	avg = sum(r.rating for r in rows) / len(rows)
	nps_answers = [r.nps_score for r in rows if r.nps_score is not None]
	nps = None
	if nps_answers:
		promoters = len([n for n in nps_answers if n >= 9])
		detractors = len([n for n in nps_answers if n <= 6])
		nps = round((promoters - detractors) / len(nps_answers) * 100)

	return {"responses": len(rows), "avg_rating": round(avg, 2), "nps": nps}
