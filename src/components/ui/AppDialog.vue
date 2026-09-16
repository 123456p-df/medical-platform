<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { X } from 'lucide-vue-next'

defineProps<{ title: string; closeLabel?: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
const titleId = `dialog-title-${useId()}`

async function open() {
  await nextTick()
  dialog.value?.showModal()
  const focusTarget = dialog.value?.querySelector<HTMLElement>('input, select, textarea, button:not([data-dialog-close])')
  focusTarget?.focus()
}

function close() {
  dialog.value?.close()
  emit('close')
}

defineExpose({ open, close })
</script>

<template>
  <dialog ref="dialog" class="app-dialog" :aria-labelledby="titleId" @cancel="$event.preventDefault()">
    <header>
      <h2 :id="titleId">{{ title }}</h2>
      <button type="button" data-dialog-close class="icon-btn" :aria-label="closeLabel || 'Close dialog'" @click="close"><X :size="18" /></button>
    </header>
    <div class="app-dialog-body"><slot /></div>
  </dialog>
</template>

<style scoped>
.app-dialog { width: min(620px, calc(100vw - 32px)); max-height: 90vh; padding: 0; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: auto; color: var(--text); box-shadow: 0 28px 90px rgb(16 45 52 / 25%); }
.app-dialog::backdrop { background: rgb(16 40 50 / 45%); }
.app-dialog header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--border); }
.app-dialog h2 { margin: 0; font-size: 18px; }
.app-dialog-body { padding: var(--space-6); }
</style>
