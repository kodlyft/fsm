# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class CustomerFieldNote(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		customer: DF.Link
		note: DF.Text
		service_job: DF.Link | None
		technician: DF.Link | None
		visit_date: DF.Date | None
	# end: auto-generated types

	pass
