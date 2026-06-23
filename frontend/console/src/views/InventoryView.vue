<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { PageHeader, EmptyState } from "@kodlyft/ui";
import { getStockLevels, type StockRow } from "@/lib/fsm";

const rows = ref<StockRow[]>([]);
const loading = ref(true);
const error = ref("");
const lowOnly = ref(false);

const visible = computed(() => (lowOnly.value ? rows.value.filter((r) => r.low) : rows.value));
const lowCount = computed(() => rows.value.filter((r) => r.low).length);

const byWarehouse = computed(() => {
	const map = new Map<string, StockRow[]>();
	for (const r of visible.value) {
		const list = map.get(r.warehouse) ?? [];
		list.push(r);
		map.set(r.warehouse, list);
	}
	return [...map.entries()].map(([warehouse, items]) => ({ warehouse, items }));
});

const qty = (n: number) => new Intl.NumberFormat().format(n ?? 0);

async function load() {
	loading.value = true;
	error.value = "";
	try {
		rows.value = await getStockLevels();
	} catch {
		error.value = "Couldn't load stock levels.";
	} finally {
		loading.value = false;
	}
}

onMounted(load);
</script>

<template>
	<div>
		<PageHeader eyebrow="Parts" title="Inventory" subtitle="Van & warehouse stock levels">
			<template #actions>
				<label
					class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg px-3.5 py-2 text-sm font-medium text-fg"
				>
					<input v-model="lowOnly" type="checkbox" class="accent-brand" />
					Low stock only
					<span
						v-if="lowCount"
						class="rounded-full bg-danger/15 px-2 py-0.5 font-mono text-xs text-danger tabular-nums"
					>
						{{ lowCount }}
					</span>
				</label>
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-xl border border-border bg-bg px-3.5 py-2 text-sm font-medium text-fg hover:bg-surface"
					@click="load"
				>
					Refresh
				</button>
			</template>
		</PageHeader>

		<div v-if="loading" class="space-y-3">
			<div
				v-for="n in 4"
				:key="n"
				class="h-12 animate-pulse rounded-xl border border-border bg-white/5"
			/>
		</div>

		<div
			v-else-if="error"
			class="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
		>
			{{ error }}
		</div>

		<EmptyState
			v-else-if="visible.length === 0"
			title="No stock to show"
			:description="
				lowOnly
					? 'Nothing is below its reorder level right now.'
					: 'Set a Van Warehouse on technicians (or a default warehouse in Service Settings) to track stock here.'
			"
		/>

		<div v-else class="space-y-6">
			<section
				v-for="grp in byWarehouse"
				:key="grp.warehouse"
				class="rounded-2xl border border-border bg-bg shadow-card backdrop-blur-xl"
			>
				<h2 class="border-b border-border px-4 py-3 text-sm font-bold text-fg">
					{{ grp.warehouse }}
				</h2>
				<div class="overflow-x-auto">
					<table class="w-full min-w-md text-left text-sm">
						<thead class="border-b border-border text-fg-muted">
							<tr>
								<th class="px-4 py-2 font-medium">Item</th>
								<th class="px-4 py-2 text-right font-medium">On hand</th>
								<th class="px-4 py-2 text-right font-medium">Reserved</th>
								<th class="px-4 py-2 text-right font-medium">Projected</th>
								<th class="px-4 py-2 text-right font-medium">Reorder</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="r in grp.items"
								:key="r.item_code"
								class="border-b border-border last:border-0"
								:class="{ 'bg-danger/5': r.low }"
							>
								<td class="px-4 py-2">
									<span class="text-fg">{{ r.item_name || r.item_code }}</span>
									<span
										v-if="r.low"
										class="ml-2 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger"
									>
										Low
									</span>
								</td>
								<td
									class="px-4 py-2 text-right font-mono tabular-nums"
									:class="r.low ? 'text-danger' : 'text-fg'"
								>
									{{ qty(r.actual_qty) }}
								</td>
								<td
									class="px-4 py-2 text-right font-mono text-fg-muted tabular-nums"
								>
									{{ qty(r.reserved_qty) }}
								</td>
								<td
									class="px-4 py-2 text-right font-mono text-fg-muted tabular-nums"
								>
									{{ qty(r.projected_qty) }}
								</td>
								<td
									class="px-4 py-2 text-right font-mono text-fg-muted tabular-nums"
								>
									{{ r.reorder_level ?? "—" }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</div>
	</div>
</template>
