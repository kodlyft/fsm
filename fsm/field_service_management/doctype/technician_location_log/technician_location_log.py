# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class TechnicianLocationLog(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		accuracy: DF.Float
		latitude: DF.Float
		longitude: DF.Float
		recorded_on: DF.Datetime
		service_job: DF.Link | None
		source: DF.Literal["Mobile", "Manual", "System"]
		technician: DF.Link
	# end: auto-generated types

	def before_insert(self):
		if not self.recorded_on:
			self.recorded_on = now_datetime()

	def after_insert(self):
		"""Mirror the latest ping onto the Technician for cheap "last known location"
		lookups by the dispatch engine (avoids scanning the log on every score)."""
		frappe.db.set_value(
			"Technician",
			self.technician,
			{
				"last_seen_latitude": self.latitude,
				"last_seen_longitude": self.longitude,
				"last_seen_on": self.recorded_on,
			},
			update_modified=False,
		)
