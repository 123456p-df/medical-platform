<script setup lang="ts">
import { CircleAlert, CircleCheck, Inbox, LoaderCircle } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  kind: 'loading' | 'empty' | 'error' | 'partial' | 'success'
  title?: string
  message?: string
  compact?: boolean
}>(), {
  title: '',
  message: '',
  compact: false,
})

const icon = {
  loading: LoaderCircle,
  empty: Inbox,
  error: CircleAlert,
  partial: CircleAlert,
  success: CircleCheck,
}
</script>

<template>
  <section
    :class="['state-panel', `state-${kind}`, { compact }]"
    :role="kind === 'error' ? 'alert' : 'status'"
    :aria-live="kind === 'error' ? 'assertive' : 'polite'"
    :aria-busy="kind === 'loading'"
  >
    <component :is="icon[props.kind]" :class="{ spinning: kind === 'loading' }" :size="compact ? 17 : 22" aria-hidden="true" />
    <div class="state-copy">
      <strong v-if="title">{{ title }}</strong>
      <p v-if="message">{{ message }}</p>
      <slot />
    </div>
    <div v-if="$slots.actions" class="state-actions"><slot name="actions" /></div>
  </section>
</template>

<style scoped>
.state-panel{display:flex;align-items:flex-start;gap:var(--space-3);min-height:96px;padding:var(--space-5);border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);color:var(--text-soft)}
.state-panel>svg{flex:0 0 auto;margin-top:1px;color:var(--text-muted)}
.state-panel.compact{min-height:0;padding:var(--space-3) var(--space-4);border-radius:var(--radius)}
.state-copy{display:grid;min-width:0;flex:1;gap:var(--space-1)}
.state-copy strong{color:var(--text);font-size:var(--font-sm)}
.state-copy p,.state-copy :deep(p){margin:0;color:inherit;font-size:var(--font-sm);line-height:1.6}
.state-actions{display:flex;align-items:center;gap:var(--space-2)}
.state-error{border-color:var(--danger-border);background:var(--danger-soft);color:var(--danger-text)}
.state-error>svg{color:var(--danger-text)}
.state-partial{border-color:var(--warning-border);background:var(--warning-soft);color:var(--warning-text)}
.state-partial>svg{color:var(--warning-text)}
.state-success{border-color:var(--success-border);background:var(--success-soft);color:var(--success-text)}
.state-success>svg{color:var(--success-text)}
.spinning{animation:state-spin .9s linear infinite}
@keyframes state-spin{to{transform:rotate(360deg)}}
@media(max-width:600px){.state-panel{flex-wrap:wrap}.state-actions{width:100%;padding-left:calc(22px + var(--space-3))}}
</style>
