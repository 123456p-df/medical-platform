<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { CheckCircle2, Clock3, FileText, Printer } from 'lucide-vue-next'
import { organNames } from '@/api/mappers'
import type { Report } from '@/types'
import { locale, t } from '@/i18n'

const props = defineProps<{
  report: Report
  patientFacing?: boolean
  patientName?: string
}>()
const printing = ref(false)

const structuredSections = computed(() => {
  const fields = props.report.reportTemplate?.fields || []
  const data = props.report.structuredData || {}
  const grouped = new Map<string, { label: string; rows: Array<{ label: string; value: string }> }>()
  for (const field of fields) {
    const value = data[field.key]
    if (value === undefined || value === null || value === '') continue
    const section = field.section || 'ui.reportTemplate.section.findings'
    if (!grouped.has(section)) grouped.set(section, { label: section, rows: [] })
    grouped.get(section)?.rows.push({
      label: field.label,
      value: field.type === 'select'
        ? t(String(value))
        : field.type === 'boolean'
          ? value ? t('ui.reportTemplate.yes') : t('ui.reportTemplate.no')
          : `${value}${field.unit ? ` ${field.unit}` : ''}`,
    })
  }
  return [...grouped.entries()].map(([key, value]) => ({ key, ...value }))
})

function formatDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', { year: 'numeric', month: 'short', day: '2-digit' }).format(date)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

async function printReport() {
  printing.value = true
  await nextTick()
  window.print()
  printing.value = false
}
</script>

<template>
  <article :id="`report-${report.id}`" class="report-card" :class="{ printing }">
    <header class="print-heading">
      <div><strong>{{ $t('ui.report.formalTitle') }}</strong><span>{{ $t('ui.report.signedVersion') }}</span></div>
      <dl><dt>{{ $t('ui.report.patient') }}</dt><dd>{{ patientName || report.patientId }}</dd><dt>{{ $t('ui.report.reportId') }}</dt><dd>{{ report.id }}</dd><dt>{{ $t('ui.report.examinationId') }}</dt><dd>{{ report.examinationId || $t('ui.report.unlinked') }}</dd></dl>
    </header>
    <div class="report-header">
      <span class="report-icon"><FileText :size="18" /></span>
      <div class="report-heading">
        <strong>{{ $t("Final Diagnosis") }}</strong>
        <span>{{ formatDate(report.date) }}</span>
      </div>
      <span :class="['review-state', { reviewed: report.reviewed }]">
        <CheckCircle2 v-if="report.reviewed" :size="14" />
        <Clock3 v-else :size="14" />
        {{ $t(report.reviewed ? 'Doctor Reviewed' : 'Pending Review') }}
      </span>
      <button v-if="patientFacing && report.reviewed" type="button" class="print-action" :aria-label="$t('ui.report.printLabel')" @click="printReport"><Printer :size="14" /> {{ $t('ui.report.print') }}</button>
    </div>
    <div class="record-organ-tags"><span v-for="id in report.organIds || [report.organId || 'other']" :key="id">{{ $t(organNames[id]) }}</span></div><h4>{{ report.diagnosis }}</h4>
    <p>{{ report.description }}</p>
    <div v-if="structuredSections.length" class="structured-report-content">
      <section v-for="section in structuredSections" :key="section.key" class="structured-print-section">
        <span>{{ $t(section.label) }}</span>
        <dl>
          <div v-for="row in section.rows" :key="row.label">
            <dt>{{ $t(row.label) }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
      </section>
    </div>
    <div class="report-content">
      <div v-if="report.recommendation" class="report-section">
        <span>{{ $t("Recommendation") }}</span>
        <p>{{ report.recommendation }}</p>
      </div>
      <div v-if="report.addenda?.length" class="report-section addenda">
        <span>{{ $t('ui.report.addenda') }}</span>
        <article v-for="item in report.addenda" :key="item.id">
          <strong>{{ item.reason }}</strong>
          <p>{{ item.content }}</p>
          <small>{{ item.authorName || item.authorUserId }} · {{ formatDateTime(item.createdAt) }}</small>
        </article>
      </div>
      <div class="report-footer">
        <span>{{ $t(report.reviewed ? 'Signed by' : 'Prepared by') }} {{ report.doctor }}</span>
        <span>{{ report.signedAt ? $t('ui.report.signedAt', { time: formatDateTime(report.signedAt) }) : formatDate(report.date) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.record-organ-tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.record-organ-tags span{font-size:10px;color:#1f6f72;background:#e7f0ed;border-radius:4px;padding:4px 7px}

.report-card {
  padding: 17px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.report-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.print-heading{display:none}.print-action{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--accent-strong);font-size:10px;white-space:nowrap}

.report-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 7px;
  background: #edf2f8;
  color: var(--blue);
}

.report-heading {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  line-height: 1.3;
}

.report-heading strong {
  color: var(--text);
  font-size: 13px;
}

.report-heading span {
  color: var(--text-muted);
  font-size: 11px;
}

.review-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f8efe4;
  color: #8a5418;
  font-size: 10px;
  font-weight: 700;
}

.review-state.reviewed {
  background: #e6f1eb;
  color: #2f6a4c;
}

.report-card h4 {
  margin: 14px 0 7px;
  color: var(--text);
  font-size: 15px;
}

.report-card p {
  margin: 0;
  color: var(--text-soft);
  font-size: 13px;
}

.structured-report-content {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

.structured-print-section {
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.structured-print-section > span {
  display: block;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 720;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.structured-print-section dl {
  display: grid;
  gap: 7px;
  margin: 10px 0 0;
}

.structured-print-section dl > div {
  display: grid;
  grid-template-columns: minmax(120px, 0.45fr) 1fr;
  gap: 10px;
}

.structured-print-section dt {
  color: var(--text-muted);
  font-size: 11px;
}

.structured-print-section dd {
  margin: 0;
  color: var(--text-soft);
  font-size: 12px;
  white-space: pre-wrap;
}

.report-section {
  margin-top: 15px;
  padding-top: 13px;
  border-top: 1px solid var(--border);
}

.report-section span {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 720;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.report-section p {
  margin-top: 5px;
}

.addenda article { margin-top: 10px; padding: 10px; border-left: 3px solid var(--accent); background: var(--surface-2); }
.addenda article strong { display: block; margin-bottom: 5px; font-size: 12px; }
.addenda article small { display: block; margin-top: 7px; color: var(--text-muted); font-size: 10px; }

.report-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 15px;
  color: var(--text-muted);
  font-size: 11px;
}

@media print {
  :global(body) { background:#fff!important; }
  :global(body *) { visibility:hidden!important; }
  .report-card.printing,.report-card.printing *{visibility:visible!important}
  .report-card.printing{position:absolute;inset:0 auto auto 0;width:100%;padding:18mm;border:0;color:#111;box-shadow:none}
  .print-heading{display:flex;justify-content:space-between;gap:20px;margin-bottom:12mm;padding-bottom:6mm;border-bottom:2px solid #163d48}.print-heading>div{display:grid;gap:4px}.print-heading>div strong{font-size:20px}.print-heading>div span{font-size:11px}.print-heading dl{display:grid;grid-template-columns:auto auto;gap:3px 9px;margin:0;font-size:10px}.print-heading dt{color:#667}.print-heading dd{margin:0}.print-action{display:none}.report-card h4{font-size:17px}.report-card p{font-size:12px;line-height:1.8}
}
</style>
