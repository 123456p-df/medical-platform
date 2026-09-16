<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Camera, Download, FileText, Save, Trash2, Upload, UserRound } from 'lucide-vue-next'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { request } from '@/api/client'
import { useProfileStore, type ProfileFile } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { localPreview } from '@/utils/runtime'
import { t } from '@/i18n'
import AvatarEditor from '@/components/profile/AvatarEditor.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
const profile = useProfileStore()
const auth = useAuthStore(), router = useRouter()
const form = reactive({ display_name: '', title: '', department: '', phone: '', email: '', bio: '' })
const busy = ref(false), error = ref(''), success = ref(''), avatarInput = ref<HTMLInputElement>(), fileInput = ref<HTMLInputElement>()
const avatarEditor = ref<InstanceType<typeof AvatarEditor>>(), uploadProgress = ref(0), pendingAttachment = ref<File | null>(null)
const attachmentPreviews = reactive<Record<string, string>>({})
const savedSnapshot = ref('')
const dirty = computed(() => JSON.stringify(form) !== savedSnapshot.value)
function fill() {
  for (const key of Object.keys(form) as (keyof typeof form)[]) form[key] = profile.data?.[key] || ''
  savedSnapshot.value = JSON.stringify(form)
}
async function run(action: () => Promise<unknown>, message: string) {
  if (busy.value) return
  busy.value = true; error.value = ''; success.value = ''
  try { await action(); await profile.load(); await loadAttachmentPreviews(); success.value = message }
  catch (e) { error.value = e instanceof Error ? e.message : t('ui.profile.operationFailed') }
  finally { busy.value = false }
}
async function save() {
  const snapshot = { ...form }
  await run(() => profile.save(snapshot), t('ui.profile.saved'))
  fill()
}
async function upload(event: Event, avatar: boolean) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]
  if (!file) return
  const localLimit = localPreview && !avatar ? 2 : avatar ? 5 : 10
  if (file.size > localLimit * 1024 * 1024) {
    error.value = t(avatar ? 'ui.profile.avatarTooLarge' : 'ui.profile.attachmentTooLarge', { size: localLimit })
    input.value = ''
    return
  }
  if (avatar) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { error.value = t('ui.profile.invalidImage'); input.value = ''; return }
    try { await avatarEditor.value?.open(file) }
    catch (reason) { error.value = reason instanceof Error ? reason.message : t('ui.profile.cannotReadImage') }
  } else {
    pendingAttachment.value = file
    await uploadAttachment()
  }
  input.value = ''
}
async function saveAvatar(blob: Blob) {
  uploadProgress.value = 0
  await run(() => profile.saveAvatar(blob, percent => uploadProgress.value = percent), t('ui.profile.avatarSaved'))
}
async function uploadAttachment() {
  if (!pendingAttachment.value) return
  uploadProgress.value = 0
  const file = pendingAttachment.value
  await run(() => profile.uploadFile(file, percent => uploadProgress.value = percent), t('ui.profile.fileUploaded'))
  if (!error.value) pendingAttachment.value = null
}
async function download(file: ProfileFile) {
  await run(async () => {
    const link = document.createElement('a')
    if (file.data_url) link.href = file.data_url
    else {
      const blob = await (await request('/auth/profile/files/' + file.id)).blob()
      link.href = URL.createObjectURL(blob)
      setTimeout(() => URL.revokeObjectURL(link.href), 1000)
    }
    link.download = file.name; link.click()
  }, t('ui.profile.fileDownloaded'))
}
function clearAttachmentPreviews() {
  for (const value of Object.values(attachmentPreviews)) if (value.startsWith('blob:')) URL.revokeObjectURL(value)
  for (const key of Object.keys(attachmentPreviews)) delete attachmentPreviews[key]
}
async function loadAttachmentPreviews() {
  clearAttachmentPreviews()
  await Promise.all((profile.data?.files || []).filter(file => file.media_type.startsWith('image/')).map(async file => {
    if (file.data_url) { attachmentPreviews[file.id] = file.data_url; return }
    try {
      const blob = await (await request('/auth/profile/files/' + file.id)).blob()
      attachmentPreviews[file.id] = URL.createObjectURL(blob)
    } catch { /* A failed preview does not block downloading the attachment. */ }
  }))
}
async function removeAvatar() { await run(() => profile.removeAvatar(), t('ui.profile.avatarRemoved')) }
async function removeFile(file: ProfileFile) { await run(() => profile.removeFile(file.id), t('ui.profile.fileRemoved')) }
onMounted(async () => { await run(() => Promise.resolve(), ''); fill() })
onBeforeUnmount(clearAttachmentPreviews)
onBeforeRouteLeave(() => !dirty.value || window.confirm(t('ui.profile.leaveConfirm')))
</script>
<template>
  <div class="page profile-page">
    <AvatarEditor ref="avatarEditor" @save="saveAvatar" />
    <header class="profile-heading">
      <button class="back-link" type="button" @click="router.push('/' + auth.portal + '/dashboard')"><ArrowLeft :size="16" /> {{ $t('ui.profile.back') }}</button>
      <div><span class="profile-eyebrow">{{ $t('ui.profile.eyebrow') }}</span><h1>{{ $t('ui.profile.title') }}</h1><p class="muted">{{ $t('ui.profile.subtitle') }}</p></div>
    </header>
    <div class="profile-grid">
      <aside class="card identity-card">
        <button class="avatar-upload" :disabled="busy" :aria-label="$t('ui.profile.uploadAvatar')" @click="avatarInput?.click()">
          <img v-if="profile.data?.avatar_url" :src="profile.data.avatar_url" :alt="$t('ui.profile.avatarAlt')" /><UserRound v-else :size="50" /><span><Camera :size="16" /></span>
        </button>
        <input ref="avatarInput" hidden type="file" accept="image/png,image/jpeg,image/webp" @change="upload($event, true)" />
        <h2>{{ profile.data?.display_name }}</h2><p>{{ $t(profile.data?.role === 'doctor' ? 'Doctor' : 'Patient') }} · {{ profile.data?.username }}</p>
        <button class="btn btn-secondary" :disabled="busy" @click="avatarInput?.click()">{{ $t('ui.profile.changeAvatar') }}</button>
        <button v-if="profile.data?.avatar_url" class="text-action" :disabled="busy" @click="removeAvatar">{{ $t('ui.profile.removeAvatar') }}</button>
        <small>{{ $t('ui.profile.avatarLimit') }}</small>
        <small v-if="localPreview">{{ $t('ui.profile.localAvatar') }}</small>
      </aside>
      <div class="stack">
        <form class="card profile-form" @submit.prevent="save">
          <div class="form-heading"><div><span>{{ $t('ui.profile.detailsEyebrow') }}</span><h3>{{ $t('ui.profile.details') }}</h3></div><p>{{ $t('ui.profile.detailsHelp') }}</p></div>
          <fieldset class="profile-fields" :disabled="busy">
            <label><span>{{ $t('ui.profile.displayName') }}</span><input v-model="form.display_name" class="profile-input" maxlength="100" :placeholder="$t('ui.profile.displayNamePlaceholder')" required /></label>
            <label><span>{{ $t('ui.profile.roleTitle') }}</span><input v-model="form.title" class="profile-input" maxlength="100" :placeholder="$t('ui.profile.rolePlaceholder')" /></label>
            <label><span>{{ $t('ui.profile.department') }}</span><input v-model="form.department" class="profile-input" maxlength="100" :placeholder="$t('ui.profile.departmentPlaceholder')" /></label>
            <label><span>{{ $t('ui.profile.phone') }}</span><input v-model="form.phone" class="profile-input" type="tel" maxlength="40" :placeholder="$t('ui.profile.phonePlaceholder')" /></label>
            <label class="wide"><span>{{ $t('ui.profile.email') }}</span><input v-model="form.email" class="profile-input" type="email" maxlength="254" placeholder="name@example.com" /></label>
            <label class="wide"><span>{{ $t('ui.profile.bio') }}</span><textarea v-model="form.bio" class="profile-input profile-textarea" maxlength="2000" rows="4" :placeholder="$t('ui.profile.bioPlaceholder')" /></label>
          </fieldset>
          <div class="form-footer"><span>{{ $t('ui.profile.accountOnly') }}</span><button class="btn btn-primary" :disabled="busy || !form.display_name.trim()"><Save :size="16" />{{ $t(busy ? 'ui.profile.processing' : 'ui.profile.save') }}</button></div>
        </form>
        <section class="card attachments">
          <div class="attachment-heading"><div><h3>{{ $t('ui.profile.attachments') }}</h3><p class="muted">{{ $t('ui.profile.attachmentsHelp') }}</p></div><button class="btn btn-secondary" :disabled="busy || (profile.data?.files.length || 0) >= 20" @click="fileInput?.click()"><Upload :size="16" /> {{ $t('ui.profile.uploadAttachment') }}</button></div>
          <input ref="fileInput" hidden type="file" accept=".pdf,image/jpeg,image/png,image/webp" @change="upload($event, false)" />
          <StatePanel v-if="pendingAttachment" :kind="error ? 'error' : 'loading'" compact :message="`${pendingAttachment.name} · ${(pendingAttachment.size / 1024).toFixed(0)} KB${busy ? ` · ${uploadProgress}%` : ''}`"><template v-if="error" #actions><button class="btn btn-secondary btn-sm" type="button" @click="uploadAttachment">{{ $t('ui.profile.retryUpload') }}</button><button class="btn btn-secondary btn-sm" type="button" @click="pendingAttachment = null; error = ''">{{ $t('Cancel') }}</button></template></StatePanel>
          <div v-for="file in profile.data?.files" :key="file.id" class="attachment"><img v-if="attachmentPreviews[file.id]" class="attachment-preview" :src="attachmentPreviews[file.id]" alt="" /><FileText v-else :size="22" /><div><strong>{{ file.name }}</strong><small>{{ file.media_type }} · {{ (file.size_bytes / 1024).toFixed(0) }} KB</small></div><button class="icon-btn" :disabled="busy" :aria-label="$t('ui.profile.download', { name: file.name })" @click="download(file)"><Download :size="17" /></button><button class="icon-btn" :disabled="busy" :aria-label="$t('ui.profile.remove', { name: file.name })" @click="removeFile(file)"><Trash2 :size="17" /></button></div>
          <StatePanel v-if="!profile.data?.files.length && !pendingAttachment" kind="empty" compact :message="$t('ui.profile.emptyAttachments')" /><small class="muted">{{ $t(localPreview ? 'ui.profile.localFileLimit' : 'ui.profile.remoteFileLimit') }}</small>
        </section>
        <p v-if="error" role="alert" class="error-message">{{ error }}</p><p v-if="success" role="status" class="success-message">{{ success }}</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.profile-fields{margin:0;padding:0;border:0}.attachment-preview{width:40px;height:40px;border-radius:7px;object-fit:cover;border:1px solid var(--border)}
.profile-page{display:grid;gap:24px}.profile-heading{display:grid;gap:18px}.back-link{display:inline-flex;width:max-content;align-items:center;gap:7px;padding:0;border:0;background:transparent;color:var(--text-soft);font-size:13px}.back-link:hover{color:var(--accent-strong)}.profile-eyebrow,.form-heading span{font-size:11px;letter-spacing:.16em;color:var(--accent);font-weight:750}.profile-page h1{margin:6px 0 7px;font-size:27px}.profile-grid{display:grid;grid-template-columns:280px minmax(0,1fr);gap:24px;align-items:start}.identity-card{position:sticky;top:calc(var(--topbar-height) + 24px);padding:38px 24px;display:flex;align-items:center;flex-direction:column;gap:15px;background:linear-gradient(180deg,#fff 0,#f7fbfa 100%)}.identity-card h2,.identity-card p{margin:0}.identity-card p,.identity-card small{color:var(--text-muted);font-size:12px}.avatar-upload{border:6px solid #edf5f3;background:#dcecea;color:var(--accent);width:118px;height:118px;border-radius:50%;position:relative;display:grid;place-items:center;box-shadow:0 8px 28px #214d4520}.avatar-upload img{width:100%;height:100%;border-radius:50%;object-fit:cover}.avatar-upload span{position:absolute;bottom:-2px;right:-2px;border:4px solid white;border-radius:50%;padding:8px;background:var(--accent);color:white;display:flex}.text-action{border:0;background:none;color:var(--text-muted);font-size:12px}.profile-form,.attachments{padding:28px}.profile-form{display:grid;gap:25px}.form-heading{display:flex;justify-content:space-between;gap:24px;padding-bottom:20px;border-bottom:1px solid var(--border)}.form-heading h3{margin:5px 0 0;font-size:18px}.form-heading p{max-width:340px;margin:0;color:var(--text-muted);font-size:12px;line-height:1.7}.profile-fields{display:grid;grid-template-columns:1fr 1fr;gap:20px}.profile-fields label{display:grid;gap:8px;color:var(--text-soft);font-size:13px;font-weight:650}.profile-input{width:100%;min-height:46px;padding:11px 13px;border:1px solid #d6e2e2;border-radius:10px;outline:0;background:#f9fbfb;color:var(--text);font-size:14px;transition:border-color 150ms ease,background 150ms ease,box-shadow 150ms ease}.profile-input::placeholder{color:#9aabad}.profile-input:hover{border-color:#bdcecf;background:#fff}.profile-input:focus{border-color:var(--accent);background:#fff;box-shadow:0 0 0 4px rgb(47 143 146 / 11%)}.profile-textarea{min-height:130px;resize:vertical;line-height:1.7}.wide{grid-column:1/-1}.form-footer{display:flex;justify-content:space-between;align-items:center;gap:20px;padding-top:20px;border-top:1px solid var(--border)}.form-footer>span{color:var(--text-muted);font-size:12px}.attachment-heading{display:flex;justify-content:space-between;gap:14px;align-items:center}.attachment-heading p{font-size:12px;margin-bottom:18px}.attachment{display:flex;gap:12px;align-items:center;padding:14px 0;border-top:1px solid var(--border)}.attachment>div{display:grid;gap:5px;flex:1;overflow:hidden}.attachment strong{font-size:13px;overflow-wrap:anywhere}.attachment small{color:var(--text-muted)}.error-message{color:#a24e50}.success-message{color:#277b64;padding:12px 14px;border-radius:8px;background:#e9f5ef}@media(max-width:900px){.profile-grid{grid-template-columns:1fr}.identity-card{position:static}.profile-fields{grid-template-columns:1fr}.attachment-heading,.form-heading,.form-footer{flex-wrap:wrap}}
</style>
