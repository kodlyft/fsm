# Copyright (c) 2026, KodLyft and contributors
# For license information, please see license.txt

import frappe
from frappe import _


@frappe.whitelist()
def get_stock_levels(
	warehouse: str | None = None,
	technician: str | None = None,
	item: str | None = None,
	low_only: int = 0,
):
	"""
	Stock levels for FSM warehouses, each row flagged `low` against its reorder level.

	- warehouse: restrict to one warehouse.
	- technician: restrict to that technician's van warehouse.
	- item: restrict to one item.
	- low_only: when truthy, only return rows at or below their reorder point.
	"""
	if technician:
		warehouse = frappe.db.get_value("Technician", technician, "warehouse") or warehouse
	warehouses = [warehouse] if warehouse else _fsm_warehouses()
	if not warehouses:
		return []

	filters = {"warehouse": ["in", warehouses]}
	if item:
		filters["item_code"] = item

	bins = frappe.get_all(
		"Bin",
		filters=filters,
		fields=["item_code", "warehouse", "actual_qty", "reserved_qty", "projected_qty"],
		order_by="item_code asc",
	)

	rows = []
	for b in bins:
		reorder = _reorder_level(b.item_code, b.warehouse)
		low = _is_low(b.actual_qty, reorder)
		if low_only and not low:
			continue
		rows.append(
			{
				"item_code": b.item_code,
				"item_name": frappe.db.get_value("Item", b.item_code, "item_name"),
				"warehouse": b.warehouse,
				"actual_qty": b.actual_qty,
				"reserved_qty": b.reserved_qty,
				"projected_qty": b.projected_qty,
				"reorder_level": reorder,
				"low": low,
			}
		)
	return rows


@frappe.whitelist()
def get_van_stock(technician: str | None = None):
	"""Stock on the signed-in technician's van (or a given technician's)."""
	if not technician:
		from fsm.tracking import _technician_for_user

		technician = _technician_for_user()
	warehouse = frappe.db.get_value("Technician", technician, "warehouse")
	if not warehouse:
		return []
	return get_stock_levels(warehouse=warehouse)


def low_stock_rows() -> list[dict]:
	"""Every FSM-warehouse item currently at or below its reorder point."""
	out = []
	for wh in _fsm_warehouses():
		out.extend(get_stock_levels(warehouse=wh, low_only=1))
	return out


def _fsm_warehouses() -> list[str]:
	"""Warehouses field service cares about: every technician van + the default."""
	vans = frappe.get_all(
		"Technician",
		filters={"warehouse": ["is", "set"]},
		pluck="warehouse",
	)
	default = frappe.db.get_single_value("Service Settings", "default_warehouse")
	if default:
		vans.append(default)
	return sorted({w for w in vans if w})


def _reorder_level(item_code: str, warehouse: str) -> float | None:
	"""The ERPNext reorder level for this item+warehouse, if configured."""
	level = frappe.db.get_value(
		"Item Reorder",
		{"parent": item_code, "warehouse": warehouse},
		"warehouse_reorder_level",
	)
	return level


def _is_low(actual_qty: float, reorder_level: float | None) -> bool:
	"""Low when below the ERPNext reorder level, else below the Service Settings
	fallback threshold (when one is configured)."""
	if reorder_level is not None:
		return (actual_qty or 0) <= reorder_level
	threshold = frappe.db.get_single_value("Service Settings", "low_stock_threshold") or 0
	return bool(threshold) and (actual_qty or 0) <= threshold
