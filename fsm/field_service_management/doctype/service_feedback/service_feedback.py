# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime


class ServiceFeedback(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		comments: DF.SmallText | None
		customer: DF.Link | None
		naming_series: DF.Literal["FSM-FB-.YYYY.-"]
		nps_score: DF.Int
		rating: DF.Int
		service_job: DF.Link
		submitted_on: DF.Datetime | None
	# end: auto-generated types

	def validate(self):
		if self.rating is None or not (1 <= self.rating <= 5):
			frappe.throw(_("Rating must be between 1 and 5."))
		if self.nps_score is not None and not (0 <= self.nps_score <= 10):
			frappe.throw(_("NPS must be between 0 and 10."))
		if not self.submitted_on:
			self.submitted_on = now_datetime()
