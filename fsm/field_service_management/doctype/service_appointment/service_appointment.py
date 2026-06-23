# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ServiceAppointment(Document):
	@frappe.whitelist()
	def create_service_job(self) -> str:
		"""Convert this appointment into a Service Job and link it back.

		If the appointment came in from a public booking (no Customer record yet),
		a Customer — and a Contact for the phone number — is created on the fly so
		the booking → job → invoice flow is never blocked."""
		if self.service_job:
			frappe.throw(f"Already converted to {self.service_job}")

		customer = self.customer or self._ensure_customer()

		job = frappe.get_doc(
			{
				"doctype": "Service Job",
				"customer": customer,
				"contact": _primary_contact(customer),
				"service_type": self.service_type,
				"territory": self.territory,
				"scheduled_date": self.preferred_date,
				"status": "Scheduled",
				"notes": self.notes,
			}
		).insert(ignore_permissions=True)

		self.db_set("service_job", job.name)
		self.db_set("status", "Converted")
		frappe.msgprint(f"Created {job.name}", alert=True)
		return job.name

	def _ensure_customer(self) -> str:
		"""Find or create the Customer for this appointment, then link it."""
		if not self.customer_name:
			frappe.throw("Set a customer name before converting to a job")

		existing = frappe.db.get_value("Customer", {"customer_name": self.customer_name})
		if existing:
			self.db_set("customer", existing)
			return existing

		customer = frappe.get_doc(
			{
				"doctype": "Customer",
				"customer_name": self.customer_name,
				"customer_type": "Individual",
				"customer_group": _default_customer_group(),
				"territory": _default_territory(),
			}
		).insert(ignore_permissions=True)

		if self.contact_phone:
			_create_contact(customer.name, self.customer_name, phone=self.contact_phone)

		self.db_set("customer", customer.name)
		return customer.name


def _default_customer_group() -> str:
	return (
		frappe.db.get_single_value("Selling Settings", "customer_group")
		or frappe.db.get_value("Customer Group", {"is_group": 0})
		or "All Customer Groups"
	)


def _default_territory() -> str:
	return (
		frappe.db.get_single_value("Selling Settings", "territory")
		or frappe.db.get_value("Territory", {"is_group": 0})
		or "All Territories"
	)


def _primary_contact(customer: str) -> str | None:
	row = frappe.db.get_value(
		"Dynamic Link",
		{"link_doctype": "Customer", "link_name": customer, "parenttype": "Contact"},
		"parent",
	)
	return row or None


def _create_contact(customer: str, full_name: str, phone: str | None = None) -> str:
	contact = frappe.get_doc({"doctype": "Contact", "first_name": full_name})
	contact.append("links", {"link_doctype": "Customer", "link_name": customer})
	if phone:
		contact.append("phone_nos", {"phone": phone, "is_primary_mobile_no": 1})
	contact.insert(ignore_permissions=True)
	return contact.name
