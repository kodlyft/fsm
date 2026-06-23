# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import now_datetime

from fsm.scheduling import _haversine_km, has_coords


@frappe.whitelist()
def update_location(latitude: float, longitude: float, accuracy: float | None = None, job: str | None = None):
	"""Record a GPS ping for the signed-in technician (called periodically by the
	mobile app). The Technician's last-known location is updated via the log's
	`after_insert` hook."""
	technician = _technician_for_user()
	frappe.get_doc(
		{
			"doctype": "Technician Location Log",
			"technician": technician,
			"latitude": float(latitude),
			"longitude": float(longitude),
			"accuracy": float(accuracy) if accuracy is not None else None,
			"service_job": job,
			"source": "Mobile",
			"recorded_on": now_datetime(),
		}
	).insert(ignore_permissions=True)
	return {"technician": technician, "recorded_on": now_datetime()}


@frappe.whitelist()
def clock_in():
	"""Technician starts their shift; marks them Available if they were Off Duty."""
	technician = _technician_for_user()
	updates = {"clocked_in": 1, "last_clock_in": now_datetime()}
	if frappe.db.get_value("Technician", technician, "status") == "Off Duty":
		updates["status"] = "Available"
	frappe.db.set_value("Technician", technician, updates)
	return {"technician": technician, "clocked_in": True}


@frappe.whitelist()
def clock_out():
	"""Technician ends their shift; marks them Off Duty."""
	technician = _technician_for_user()
	frappe.db.set_value(
		"Technician",
		technician,
		{"clocked_in": 0, "last_clock_out": now_datetime(), "status": "Off Duty"},
	)
	return {"technician": technician, "clocked_in": False}


@frappe.whitelist()
def nearest_technicians(job: str, limit: int = 5):
	"""Active technicians ranked by distance from the job site. Requires the job to
	have geocoded coordinates and technicians to have reported a location."""
	j_lat, j_lng = frappe.db.get_value("Service Job", job, ["service_latitude", "service_longitude"])
	if not has_coords(j_lat, j_lng):
		frappe.throw(_("This job has no coordinates yet, so distance can't be calculated."))

	rows = frappe.get_all(
		"Technician",
		filters={"active": 1, "status": ["!=", "Off Duty"]},
		fields=[
			"name",
			"technician_name",
			"status",
			"last_seen_latitude",
			"last_seen_longitude",
			"last_seen_on",
		],
	)
	out = []
	for r in rows:
		if not has_coords(r.last_seen_latitude, r.last_seen_longitude):
			continue
		out.append(
			{
				"technician": r.name,
				"technician_name": r.technician_name,
				"status": r.status,
				"last_seen_on": r.last_seen_on,
				"distance_km": round(
					_haversine_km(r.last_seen_latitude, r.last_seen_longitude, j_lat, j_lng), 2
				),
			}
		)
	out.sort(key=lambda r: r["distance_km"])
	return out[: int(limit)]


def _technician_for_user(user: str | None = None) -> str:
	"""Resolve the Technician record linked to the signed-in (or given) user."""
	user = user or frappe.session.user
	if not user or user == "Guest":
		raise frappe.AuthenticationError(_("Please sign in to continue."))
	technician = frappe.db.get_value("Technician", {"user": user})
	if not technician:
		frappe.throw(_("No technician profile is linked to your account."))
	return technician
