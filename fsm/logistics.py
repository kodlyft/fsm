# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import json

import frappe
from frappe import _
from frappe.utils import nowdate


@frappe.whitelist()
def request_parts(
	job: str,
	items,
	warehouse: str | None = None,
	material_request_type: str = "Material Transfer",
	schedule_date: str | None = None,
):
	"""Raise a (draft) Material Request for parts needed on a job, linked back to it.

	items: list of {"item_code", "qty"} (JSON string when called over HTTP).
	warehouse: target stock location; defaults to the assigned technician's van, then
	the Service Settings default warehouse.
	"""
	rows = json.loads(items) if isinstance(items, str) else items
	if not rows:
		frappe.throw(_("Add at least one item to request."))

	target = warehouse or _job_warehouse(job)
	if not target:
		frappe.throw(_("No warehouse to deliver to. Set a van warehouse on the technician or a default in Service Settings."))

	sched = schedule_date or nowdate()
	mr = frappe.new_doc("Material Request")
	mr.material_request_type = material_request_type
	mr.transaction_date = nowdate()
	mr.schedule_date = sched
	mr.fsm_service_job = job
	for r in rows:
		mr.append(
			"items",
			{
				"item_code": r["item_code"],
				"qty": r["qty"],
				"schedule_date": sched,
				"warehouse": target,
			},
		)
	mr.insert(ignore_permissions=True)
	return {"name": mr.name, "warehouse": target}


@frappe.whitelist()
def get_job_logistics(job: str):
	"""Parts requests and deliveries linked to a job, for the job timeline."""
	material_requests = frappe.get_all(
		"Material Request",
		filters={"fsm_service_job": job},
		fields=[
			"name",
			"status",
			"material_request_type",
			"transaction_date",
			"schedule_date",
			"per_ordered",
			"per_received",
		],
		order_by="creation desc",
	)
	delivery_notes = frappe.get_all(
		"Delivery Note",
		filters={"fsm_service_job": job},
		fields=["name", "status", "posting_date", "per_billed"],
		order_by="creation desc",
	)
	return {"material_requests": material_requests, "delivery_notes": delivery_notes}


def _job_warehouse(job: str) -> str | None:
	"""Resolve the delivery warehouse for a job: technician van → settings default."""
	technician = frappe.db.get_value("Service Job", job, "primary_technician")
	if technician:
		van = frappe.db.get_value("Technician", technician, "warehouse")
		if van:
			return van
	return frappe.db.get_single_value("Service Settings", "default_warehouse")
