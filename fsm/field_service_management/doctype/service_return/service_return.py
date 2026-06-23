# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import nowdate

STOCKED_DISPOSITIONS = ("Restock", "Refurbish")


class ServiceReturn(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF
		from fsm.field_service_management.doctype.service_return_item.service_return_item import ServiceReturnItem

		customer: DF.Link | None
		items: DF.Table[ServiceReturnItem]
		naming_series: DF.Literal["FSM-RET-.YYYY.-"]
		notes: DF.Text | None
		reason: DF.SmallText | None
		return_date: DF.Date | None
		service_job: DF.Link
		status: DF.Literal["Draft", "Requested", "Approved", "Received", "Closed", "Cancelled"]
		stock_entry: DF.Link | None
		warehouse: DF.Link | None
	# end: auto-generated types

	def validate(self):
		if not self.return_date:
			self.return_date = nowdate()
		if self.status == "Draft" and not self.is_new():
			self.status = "Requested"

	@frappe.whitelist()
	def approve(self):
		self._guard_status(("Requested",), _("Only a requested return can be approved."))
		self.status = "Approved"
		self.save()
		return self.as_dict()

	@frappe.whitelist()
	def receive(self):
		"""Post the stock receipt for restock/refurbish items and mark the return received."""
		self._guard_status(("Approved",), _("Approve the return before receiving it."))
		if not self.warehouse:
			frappe.throw(_("Set a receiving warehouse before receiving the return."))

		receipt_items = [i for i in self.items if i.disposition in STOCKED_DISPOSITIONS]
		if receipt_items and not self.stock_entry:
			self.stock_entry = _make_receipt(self, receipt_items)
		self.status = "Received"
		self.save()
		return self.as_dict()

	@frappe.whitelist()
	def close(self):
		self._guard_status(("Received",), _("Only a received return can be closed."))
		self.status = "Closed"
		self.save()
		return self.as_dict()

	def _guard_status(self, allowed: tuple, message: str):
		if self.status not in allowed:
			frappe.throw(message)


def _make_receipt(doc: "ServiceReturn", items) -> str:
	"""Create & submit a Material Receipt Stock Entry for the returned parts."""
	se = frappe.new_doc("Stock Entry")
	se.stock_entry_type = "Material Receipt"
	se.posting_date = doc.return_date
	for row in items:
		se.append(
			"items",
			{
				"item_code": row.item_code,
				"qty": row.qty,
				"uom": row.uom or None,
				"t_warehouse": doc.warehouse,
				"allow_zero_valuation_rate": 1,
			},
		)
	se.insert(ignore_permissions=True)
	se.submit()
	return se.name
