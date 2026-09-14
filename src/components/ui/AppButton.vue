<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'

withDefaults(defineProps<{
  kind?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
}>(), {
  kind: 'secondary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})
</script>

<template>
  <button
    :type="type"
    :class="['app-button', `is-${kind}`, size === 'sm' ? 'is-sm' : 'is-md']"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <LoaderCircle v-if="loading" class="spinner" :size="15" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  min-height: var(--control-md);
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-weight: 650;
}

.app-button.is-sm { min-height: var(--control-sm); padding: 0 10px; font-size: var(--font-sm); }
.app-button.is-primary { border-color: var(--accent); background: var(--accent); color: #fff; }
.app-button.is-danger { border-color: var(--danger-border); background: var(--danger-soft); color: var(--danger-text); }
.app-button.is-ghost { border-color: transparent; background: transparent; color: var(--text-soft); }
.app-button:disabled { cursor: not-allowed; opacity: 0.55; }
.spinner { animation: app-button-spin 0.9s linear infinite; }
@keyframes app-button-spin { to { transform: rotate(360deg); } }
</style>
