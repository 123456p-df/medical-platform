<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: 'Search patients...',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function update(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <label class="search-bar">
    <Search :size="17" />
    <input
      :value="props.modelValue"
      type="search"
      :placeholder="$t(placeholder)"
      @input="update(($event.target as HTMLInputElement).value)"
    />
    <button v-if="props.modelValue" type="button" :aria-label="$t('Clear search')" @click="update('')">
      <X :size="14" />
    </button>
  </label>
</template>

<style scoped>
.search-bar {
  display: flex;
  width: min(100%, 330px);
  height: 38px;
  align-items: center;
  gap: 9px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text-muted);
}

.search-bar:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgb(47 143 146 / 12%);
}

.search-bar input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
}

.search-bar button {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
}

.search-bar button:hover {
  background: var(--surface-3);
  color: var(--text);
}
</style>
