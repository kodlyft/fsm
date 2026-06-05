# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ServiceAppointment(Document):
	@frappe.whitelist()
	def create_service_job(self) -> str:
		"""Convert this appointment into a Service Job and link it back."""
		if self.service_job:
			frappe.throw(f"Already converted to {self.service_job}")
		if not self.customer:
			frappe.throw("Set a customer before converting to a job")

		job = frappe.get_doc(
			{
				"doctype": "Service Job",
				"customer": self.customer,
				"service_type": self.service_type,
				"territory": self.territory,
				"scheduled_date": self.preferred_date,
				"status": "Scheduled",
				"notes": self.notes,
			}
		).insert()

		self.service_job = job.name
		self.status = "Converted"
		self.save()
		return job.name
