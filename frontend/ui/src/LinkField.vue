<script setup lang="ts">
import { ref, watch } from "vue";
import type { LinkOption } from "./types";

const props = withDefaults(
	defineProps<{
		modelValue?: string;
		label?: string;
		placeholder?: string;
		required?: boolean;
		search: (query: string) => Promise<LinkOption[]>;
	}>(),
	{ modelValue: "", placeholder: "Search…" },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const query = ref(props.modelValue ?? "");
const open = ref(false);
const loading = ref(false);
const options = ref<LinkOption[]>([]);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
	() => props.modelValue,
	(v) => {
		if (!v) query.value = "";
	},
);

async function run() {
	loading.value = true;
	try {
		options.value = await props.search(query.value);
	} finally {
		loading.value = false;
	}
}

function onInput() {
	open.value = true;
	emit("update:modelValue", ""); // value is only valid once an option is chosen
	if (timer) clearTimeout(timer);
	timer = setTimeout(run, 250);
}

function onFocus() {
	open.value = true;
	if (options.value.length === 0) run();
}

function select(option: LinkOption) {
	emit("update:modelValue", option.value);
	query.value = option.label;
	open.value = false;
}

function onBlur() {
	// Delay so a click on an option registers before the list closes.
	setTimeout(() => (open.value = false), 150);
}
</script>

<template>
	<div class="relative">
		<span v-if="label" class="mb-1 block text-sm font-medium">{{ label }}</span>
		<input
			v-model="query"
			type="text"
			:placeholder="placeholder"
			:required="required"
			autocomplete="off"
			class="w-full rounded-md border border-border bg-bg px-3 py-2 focus-visible:outline-none focus-visible:[box-shadow:var(--kl-elevation-focus)]"
			@input="onInput"
			@focus="onFocus"
			@blur="onBlur"
		/>
		<ul
			v-if="open && (options.length || loading)"
			class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-bg py-1 shadow-card"
		>
			<li v-if="loading" class="px-3 py-2 text-sm text-fg-muted">Searching…</li>
			<li
				v-for="option in options"
				:key="option.value"
				class="cursor-pointer px-3 py-2 text-sm hover:bg-bg-subtle"
				@mousedown.prevent="select(option)"
			>
				{{ option.label }}
			</li>
		</ul>
	</div>
</template>
