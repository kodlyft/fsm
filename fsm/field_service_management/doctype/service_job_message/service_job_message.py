# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ServiceJobMessage(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		author_name: DF.Data | None
		author_role: DF.Literal["Dispatcher", "Technician", "Customer", "System"]
		author_user: DF.Link | None
		message: DF.SmallText
		service_job: DF.Link
	# end: auto-generated types

	def before_insert(self):
		if not self.author_user and frappe.session.user != "Guest":
			self.author_user = frappe.session.user
		if not self.author_name and self.author_user:
			self.author_name = frappe.db.get_value("User", self.author_user, "full_name")

	def after_insert(self):
		"""Push the new message over realtime so an open job thread updates live."""
		frappe.publish_realtime(
			"fsm_job_message",
			{
				"service_job": self.service_job,
				"author_role": self.author_role,
				"author_name": self.author_name,
				"message": self.message,
				"creation": str(self.creation),
			},
			after_commit=True,
		)
