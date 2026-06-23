# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt
#
# A labour time entry against a Service Job (FSM feature #8). Computes its own duration
# and re-rolls the parent job's actual hours & cost whenever it changes.

import frappe
from frappe.model.document import Document
from frappe.utils import time_diff_in_hours


class ServiceTimeLog(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		activity: DF.Data | None
		from_time: DF.Datetime
		hours: DF.Float
		note: DF.SmallText | None
		service_job: DF.Link
		technician: DF.Link | None
		to_time: DF.Datetime | None
	# end: auto-generated types

	def validate(self):
		if self.from_time and self.to_time:
			if self.to_time < self.from_time:
				frappe.throw("'To' time can't be before 'From' time.")
			self.hours = round(time_diff_in_hours(self.to_time, self.from_time), 2)
		else:
			self.hours = 0

	def on_update(self):
		self._recompute_job()

	def on_trash(self):
		self._recompute_job()

	def _recompute_job(self):
		from fsm.costing import recompute_job_costs

		if self.service_job:
			recompute_job_costs(self.service_job)
