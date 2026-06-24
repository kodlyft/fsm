# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import json

import frappe
from frappe import _

ADMIN_ROLES = {"FSM Manager", "System Manager"}


def _require_admin():
	if not (ADMIN_ROLES & set(frappe.get_roles())):
		frappe.throw(_("Only FSM Managers can manage integrations."), frappe.PermissionError)


@frappe.whitelist()
def generate_api_keys(user: str | None = None):
	"""(Re)issue an API key/secret for an integration user. The secret is shown once."""
	_require_admin()
	user = user or frappe.session.user
	user_doc = frappe.get_doc("User", user)

	api_secret = frappe.generate_hash(length=15)
	if not user_doc.api_key:
		user_doc.api_key = frappe.generate_hash(length=15)
	user_doc.api_secret = api_secret
	user_doc.save(ignore_permissions=True)

	return {
		"user": user,
		"api_key": user_doc.api_key,
		"api_secret": api_secret,
		"usage": "Authorization: token {api_key}:{api_secret}".format(
			api_key=user_doc.api_key, api_secret=api_secret
		),
	}


@frappe.whitelist()
def create_job(
	customer: str,
	service_type: str | None = None,
	scheduled_date: str | None = None,
	priority: str | None = None,
	service_address: str | None = None,
	items=None,
):
	"""Create a Service Job from an external system. Respects the caller's permissions."""
	rows = json.loads(items) if isinstance(items, str) else (items or [])
	doc = frappe.get_doc(
		{
			"doctype": "Service Job",
			"customer": customer,
			"service_type": service_type,
			"scheduled_date": scheduled_date,
			"priority": priority,
			"service_address": service_address,
			"items": [
				{"item_code": r["item_code"], "qty": r.get("qty", 1), "rate": r.get("rate", 0)}
				for r in rows
			],
		}
	)
	doc.insert()
	return {"name": doc.name, "status": doc.status}


@frappe.whitelist()
def get_job_status(job: str):
	"""Current status of a job, for an external system to poll."""
	d = frappe.db.get_value(
		"Service Job",
		job,
		["status", "scheduled_date", "primary_technician", "completed_on", "total_amount", "sla_breached"],
		as_dict=True,
	)
	if not d:
		frappe.throw(_("Job not found."))
	return d


@frappe.whitelist()
def list_jobs(status: str | None = None, customer: str | None = None, limit: int = 50):
	"""List jobs (filterable), for external reporting/sync."""
	filters = {}
	if status:
		filters["status"] = status
	if customer:
		filters["customer"] = customer
	return frappe.get_all(
		"Service Job",
		filters=filters,
		fields=[
			"name",
			"customer",
			"status",
			"service_type",
			"scheduled_date",
			"primary_technician",
			"total_amount",
		],
		order_by="creation desc",
		limit_page_length=int(limit),
	)


@frappe.whitelist()
def register_webhook(request_url: str, docevent: str = "on_update"):
	"""Register an outbound webhook that POSTs Service Job changes to an external URL."""
	_require_admin()
	wh = frappe.get_doc(
		{
			"doctype": "Webhook",
			"name": f"FSM Service Job {docevent} {frappe.generate_hash(length=6)}",
			"webhook_doctype": "Service Job",
			"webhook_docevent": docevent,
			"request_url": request_url,
			"request_method": "POST",
			"enabled": 1,
			"webhook_data": [
				{"fieldname": "name", "key": "job"},
				{"fieldname": "status", "key": "status"},
				{"fieldname": "customer_name", "key": "customer"},
				{"fieldname": "primary_technician", "key": "technician"},
			],
		}
	).insert(ignore_permissions=True)
	return {"name": wh.name, "url": request_url, "event": docevent}


@frappe.whitelist()
def list_webhooks():
	"""FSM-related outbound webhooks."""
	_require_admin()
	return frappe.get_all(
		"Webhook",
		filters={"webhook_doctype": "Service Job"},
		fields=["name", "webhook_docevent", "request_url", "enabled"],
	)
