# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class ServiceJob(Document):
	def validate(self):
		self.apply_checklist_template()
		self.calculate_totals()
		self.set_address_display()
		self.set_completion_timestamp()

	def apply_checklist_template(self):
		"""Seed the task list from the linked template the first time it's set."""
		if self.checklist_template and not self.tasks:
			template = frappe.get_doc("Checklist Template", self.checklist_template)
			for row in template.items:
				self.append("tasks", {"task": row.task, "note": row.description})

	def calculate_totals(self):
		total = 0.0
		for item in self.items:
			item.amount = (item.qty or 0) * (item.rate or 0)
			total += item.amount
		self.total_amount = total

	def set_address_display(self):
		if self.service_address:
			from frappe.contacts.doctype.address.address import get_address_display

			self.address_display = get_address_display(
				frappe.get_doc("Address", self.service_address).as_dict()
			)
		else:
			self.address_display = None

	def set_completion_timestamp(self):
		if self.status == "Completed" and not self.completed_on:
			self.completed_on = now_datetime()
		elif self.status != "Completed":
			self.completed_on = None
