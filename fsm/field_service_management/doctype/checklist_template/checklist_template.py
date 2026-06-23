# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class ChecklistTemplate(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from fsm.field_service_management.doctype.checklist_template_item.checklist_template_item import (
			ChecklistTemplateItem,
		)

		disabled: DF.Check
		items: DF.Table[ChecklistTemplateItem]
		service_type: DF.Data | None
		template_name: DF.Data
	# end: auto-generated types

	pass
