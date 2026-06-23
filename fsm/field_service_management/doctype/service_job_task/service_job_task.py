# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class ServiceJobTask(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		completed: DF.Check
		completed_on: DF.Datetime | None
		note: DF.SmallText | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		started_on: DF.Datetime | None
		status: DF.Literal["Pending", "In Progress", "Done"]
		task: DF.Data
	# end: auto-generated types

	pass
