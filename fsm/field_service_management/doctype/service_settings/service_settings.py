# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class ServiceSettings(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		auto_create_invoice: DF.Check
		default_checklist_template: DF.Link | None
		default_priority: DF.Literal["Low", "Medium", "High", "Urgent"]
		default_territory: DF.Link | None
	# end: auto-generated types

	pass
