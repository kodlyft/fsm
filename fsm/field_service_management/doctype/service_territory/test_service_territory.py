# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestServiceTerritory(FrappeTestCase):
	def test_create_territory(self):
		name = "Test Region"
		if frappe.db.exists("Service Territory", name):
			frappe.delete_doc("Service Territory", name)

		doc = frappe.get_doc({"doctype": "Service Territory", "territory_name": name}).insert()

		self.assertEqual(doc.name, name)
		frappe.delete_doc("Service Territory", name)
