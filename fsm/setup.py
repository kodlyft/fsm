# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt
#
# Idempotent install/migrate setup: ensures the FSM roles exist. FSM Manager and
# FSM Technician are also referenced in doctype permissions (so they auto-create
# on migrate), but FSM Customer is only assigned to portal signups, so we create
# all three here to be safe.

import frappe

FSM_ROLES = (
	("FSM Manager", 1),
	("FSM Technician", 1),
	("FSM Customer", 0),  # website/portal users — no desk access
)


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


def after_install():
	ensure_roles()


def after_migrate():
	ensure_roles()
