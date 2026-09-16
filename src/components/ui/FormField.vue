<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
}>(), {
  required: false,
  error: '',
  hint: '',
})

const errorId = computed(() => `${props.id}-error`)
const hintId = computed(() => `${props.id}-hint`)
const describedBy = computed(() => [props.error && errorId.value, props.hint && hintId.value].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="form-field">
    <label :for="id">
      <span>{{ label }}<i v-if="required" aria-hidden="true">*</i></span>
      <slot />
    </label>
    <small v-if="hint" :id="hintId" class="hint">{{ hint }}</small>
    <small v-if="error" :id="errorId" class="error" role="alert">{{ error }}</small>
    <div class="described-by" :aria-hidden="!describedBy">
      <slot name="input-attributes" :described-by="describedBy" :error-id="errorId" :hint-id="hintId" />
    </div>
  </div>
</template>

<style scoped>
.form-field { display: grid; gap: 7px; }
.form-field label { display: grid; gap: 7px; color: var(--text-soft); font-size: var(--font-sm); font-weight: 680; }
.form-field label > span i { margin-left: 3px; color: var(--red); font-style: normal; }
.hint { color: var(--text-muted); }
.error { color: var(--danger-text); }
.described-by { display: contents; }
</style>
