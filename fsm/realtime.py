# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe

SERVICE_JOB_EVENT = "fsm_service_job_update"
TECHNICIAN_EVENT = "fsm_technician_update"


def on_service_job_update(doc, method=None):
	"""Broadcast a compact Service Job summary to dispatch dashboards."""
	frappe.publish_realtime(
		SERVICE_JOB_EVENT,
		{
			"name": doc.name,
			"customer_name": doc.customer_name,
			"status": doc.status,
			"priority": doc.priority,
			"scheduled_date": str(doc.scheduled_date) if doc.scheduled_date else None,
			"primary_technician": doc.primary_technician,
			"sla_breached": doc.sla_breached,
		},
		after_commit=True,
	)


def on_technician_update(doc, method=None):
	"""Broadcast technician availability / location changes to the dispatch board."""
	frappe.publish_realtime(
		TECHNICIAN_EVENT,
		{
			"name": doc.name,
			"technician_name": doc.technician_name,
			"status": doc.status,
			"clocked_in": doc.clocked_in,
			"last_seen_latitude": doc.last_seen_latitude,
			"last_seen_longitude": doc.last_seen_longitude,
			"last_seen_on": str(doc.last_seen_on) if doc.last_seen_on else None,
		},
		after_commit=True,
	)
