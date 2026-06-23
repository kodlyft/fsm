# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class ServiceTerritory(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		description: DF.SmallText | None
		disabled: DF.Check
		parent_territory: DF.Link | None
		territory_name: DF.Data
	# end: auto-generated types

	pass
