<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RotateCcw, ArchiveRestore } from 'lucide-vue-next'
import PageHeader from '@/components/layout/PageHeader.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import { usePatientStore } from '@/stores/patients'
import { t } from '@/i18n'

const store = usePatientStore()
const search = ref('')
const busy = ref<string | null>(null)
const error = ref('')
const filtered = computed(() => {
  const needle = search.value.trim().toLowerCase()
  if (!needle) return store.archivedPatients
  return store.archivedPatients.filter(item => (
    item.name.toLowerCase().includes(needle) || item.patientId.toLowerCase().includes(needle)
  ))
})

onMounted(async () => {
  try { await store.loadArchivedPatients() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : t('ui.archive.loadFailed') }
})

async function restore(id: string) {
  busy.value = id
  error.value = ''
  try { await store.restoreArchivedPatient(id) }
  catch (reason) { error.value = reason instanceof Error ? reason.message : t('ui.archive.restoreFailed') }
  finally { busy.value = null }
}
</script>

<template>
  <div class="page">
    <PageHeader
      title="Archived Patients"
      subtitle="Review global patient archives and restore records when authorized."
    />
    <section class="card archived-panel">
      <div class="card-header">
        <div>
          <h2>{{ $t('ui.archive.title') }}</h2>
          <p class="muted">{{ $t('ui.archive.subtitle') }}</p>
        </div>
        <span class="patient-count">{{ $t('ui.archive.count', { count: filtered.length }) }}</span>
      </div>
      <SearchBar v-model="search" :placeholder="$t('ui.archive.searchPlaceholder')" />
      <p v-if="error" role="alert">{{ error }}</p>
      <StatePanel v-if="!filtered.length" kind="empty" :message="$t('ui.archive.empty')" />
      <div v-else class="archive-table-wrap">
        <table class="archive-table">
          <thead><tr><th>{{ $t('Patient') }}</th><th>{{ $t('ID') }}</th><th>{{ $t('ui.archive.reason') }}</th><th>{{ $t('ui.archive.archivedAt') }}</th><th><span class="sr-only">{{ $t('Action') }}</span></th></tr></thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.patientId">
              <td><strong>{{ item.name }}</strong></td>
              <td class="mono">{{ item.patientId }}</td>
              <td>{{ item.reason }}</td>
              <td>{{ new Date(item.archivedAt).toLocaleString() }}</td>
              <td><button type="button" class="btn btn-secondary btn-sm" :disabled="busy === item.patientId" @click="restore(item.patientId)"><RotateCcw v-if="busy === item.patientId" :size="14" /><ArchiveRestore v-else :size="14" />{{ $t('ui.archive.restore') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.archived-panel { padding: 24px; }
.archive-table-wrap { overflow-x: auto; margin-top: 14px; }
.archive-table { width: 100%; min-width: 760px; border-collapse: collapse; }
.archive-table th, .archive-table td { padding: 12px; border-bottom: 1px solid var(--border); text-align: left; font-size: 13px; }
.archive-table th { color: var(--text-muted); font-size: 11px; text-transform: uppercase; }
.archive-table strong { color: var(--text); }
.mono { font-variant-numeric: tabular-nums; }
</style>
