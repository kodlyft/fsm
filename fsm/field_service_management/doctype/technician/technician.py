# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class Technician(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from fsm.field_service_management.doctype.technician_skill.technician_skill import TechnicianSkill

		active: DF.Check
		clocked_in: DF.Check
		last_clock_in: DF.Datetime | None
		last_clock_out: DF.Datetime | None
		last_seen_latitude: DF.Float
		last_seen_longitude: DF.Float
		last_seen_on: DF.Datetime | None
		phone: DF.Data | None
		skills: DF.Table[TechnicianSkill]
		status: DF.Literal["Available", "On Job", "Off Duty"]
		technician_name: DF.Data
		territory: DF.Link | None
		user: DF.Link | None
	# end: auto-generated types

	pass
