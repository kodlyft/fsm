# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestServiceJob(FrappeTestCase):
	def test_total_calculation(self):
		# Built in-memory (not inserted) so the test has no ERPNext master dependencies.
		job = frappe.get_doc(
			{
				"doctype": "Service Job",
				"items": [
					{"item_code": "_A", "qty": 2, "rate": 50},
					{"item_code": "_B", "qty": 1, "rate": 30},
				],
			}
		)
		job.calculate_totals()
		self.assertEqual(job.total_amount, 130)
		self.assertEqual(job.items[0].amount, 100)

	def test_checklist_seeded_from_template(self):
		template_name = "_Test Checklist Template"
		if not frappe.db.exists("Checklist Template", template_name):
			frappe.get_doc(
				{
					"doctype": "Checklist Template",
					"template_name": template_name,
					"items": [{"task": "Inspect unit"}, {"task": "Test operation"}],
				}
			).insert()

		job = frappe.get_doc({"doctype": "Service Job", "checklist_template": template_name})
		job.apply_checklist_template()
		self.assertEqual(len(job.tasks), 2)
		self.assertEqual(job.tasks[0].task, "Inspect unit")

		frappe.delete_doc("Checklist Template", template_name)
