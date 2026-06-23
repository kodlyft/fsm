# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class Subcontractor(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		contact_person: DF.Data | None
		email: DF.Data | None
		hourly_rate: DF.Currency
		notes: DF.Text | None
		phone: DF.Data | None
		status: DF.Literal["Active", "Inactive"]
		subcontractor_name: DF.Data
		territory: DF.Link | None
	# end: auto-generated types

	pass
