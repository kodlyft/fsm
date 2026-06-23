# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

FSM_ROLES = (
	("FSM Manager", 1),
	("FSM Technician", 1),
	("FSM Customer", 0),
)

FSM_CUSTOM_FIELDS = {
	"Material Request": [
		{
			"fieldname": "fsm_service_job",
			"label": "Service Job",
			"fieldtype": "Link",
			"options": "Service Job",
			"insert_after": "company",
			"read_only": 1,
		}
	],
	"Delivery Note": [
		{
			"fieldname": "fsm_service_job",
			"label": "Service Job",
			"fieldtype": "Link",
			"options": "Service Job",
			"insert_after": "customer",
		}
	],
}


def ensure_roles():
	for role_name, desk_access in FSM_ROLES:
		if not frappe.db.exists("Role", role_name):
			frappe.get_doc(
				{
					"doctype": "Role",
					"role_name": role_name,
					"desk_access": desk_access,
				}
			).insert(ignore_permissions=True)


def ensure_custom_fields():
	if frappe.db.exists("DocType", "Material Request"):
		create_custom_fields(FSM_CUSTOM_FIELDS, ignore_validate=True)


def after_install():
	ensure_roles()
	ensure_custom_fields()


def after_migrate():
	ensure_roles()
	ensure_custom_fields()
