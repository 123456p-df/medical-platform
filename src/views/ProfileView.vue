<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Camera, Download, FileText, Trash2, Upload, UserRound } from 'lucide-vue-next'
import { api, request } from '@/api/client'
import { useProfileStore, type ProfileFile } from '@/stores/profile'
const profile = useProfileStore()
const form = reactive({ display_name: '', title: '', department: '', phone: '', email: '', bio: '' })
const busy = ref(false), error = ref(''), success = ref(''), avatarInput = ref<HTMLInputElement>(), fileInput = ref<HTMLInputElement>()
function fill() { for (const key of Object.keys(form) as (keyof typeof form)[]) form[key] = profile.data?.[key] || '' }
async function run(action: () => Promise<unknown>, message: string) {
  if (busy.value) return
  busy.value = true; error.value = ''; success.value = ''
  try { await action(); await profile.load(); success.value = message }
  catch (e) { error.value = e instanceof Error ? e.message : '操作失败' }
  finally { busy.value = false }
}
async function save() { await run(() => api('/auth/profile', { method: 'PATCH', body: JSON.stringify(form) }), '个人资料已保存') }
async function upload(event: Event, avatar: boolean) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]
  if (!file) return
  if (file.size > (avatar ? 5 : 10) * 1024 * 1024) { error.value = avatar ? '头像请小于 5 MB' : '附件请小于 10 MB'; input.value = ''; return }
  const body = new FormData(); body.append('file', file)
  await run(() => api('/auth/profile/' + (avatar ? 'avatar' : 'files'), { method: 'POST', body }), avatar ? '头像已更新' : '附件已上传')
  input.value = ''
}
async function download(file: ProfileFile) {
  await run(async () => {
    const blob = await (await request('/auth/profile/files/' + file.id)).blob()
    const url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, '附件已下载')
}
onMounted(async () => { await run(() => Promise.resolve(), ''); fill() })
</script>
<template>
  <div class="page profile-page">
    <div><span class="profile-eyebrow">PERSONAL SPACE</span><h1>个人资料</h1><p class="muted">管理您的头像、工作信息与个人附件。</p></div>
    <div class="profile-grid">
      <aside class="card identity-card">
        <button class="avatar-upload" :disabled="busy" aria-label="上传头像" @click="avatarInput?.click()">
          <img v-if="profile.data?.avatar_url" :src="profile.data.avatar_url" alt="个人头像" /><UserRound v-else :size="50" /><span><Camera :size="16" /></span>
        </button>
        <input ref="avatarInput" hidden type="file" accept="image/png,image/jpeg,image/webp" @change="upload($event, true)" />
        <h2>{{ profile.data?.display_name }}</h2><p>{{ profile.data?.role === 'doctor' ? '医生' : '患者' }} · {{ profile.data?.username }}</p>
        <button class="btn btn-secondary" :disabled="busy" @click="avatarInput?.click()">更换头像</button>
        <button v-if="profile.data?.avatar_url" class="text-action" :disabled="busy" @click="run(() => api('/auth/profile/avatar', { method: 'DELETE' }), '已移除头像')">移除头像</button>
        <small>JPG / PNG / WebP · 最大 5 MB</small>
      </aside>
      <div class="stack">
        <form class="card profile-form" @submit.prevent="save">
          <h3>基本信息</h3>
          <div class="profile-fields">
            <label>显示姓名<input v-model="form.display_name" class="input" maxlength="100" required /></label>
            <label>职称 / 身份<input v-model="form.title" class="input" maxlength="100" /></label>
            <label>科室 / 机构<input v-model="form.department" class="input" maxlength="100" /></label>
            <label>联系电话<input v-model="form.phone" class="input" type="tel" maxlength="40" /></label>
            <label class="wide">邮箱<input v-model="form.email" class="input" type="email" maxlength="254" /></label>
            <label class="wide">个人介绍<textarea v-model="form.bio" class="textarea" maxlength="2000" rows="3" /></label>
          </div>
          <button class="btn btn-primary" :disabled="busy || !form.display_name.trim()">{{ busy ? '处理中…' : '保存资料' }}</button>
        </form>
        <section class="card attachments">
          <div class="attachment-heading"><div><h3>个人附件</h3><p class="muted">证件、资质或其他资料，仅当前账号可访问。</p></div><button class="btn btn-secondary" :disabled="busy" @click="fileInput?.click()"><Upload :size="16" /> 上传附件</button></div>
          <input ref="fileInput" hidden type="file" accept=".pdf,image/jpeg,image/png,image/webp" @change="upload($event, false)" />
          <div v-for="file in profile.data?.files" :key="file.id" class="attachment"><FileText :size="22" /><div><strong>{{ file.name }}</strong><small>{{ (file.size_bytes / 1024).toFixed(0) }} KB</small></div><button class="icon-btn" :disabled="busy" :aria-label="'下载 ' + file.name" @click="download(file)"><Download :size="17" /></button><button class="icon-btn" :disabled="busy" :aria-label="'删除 ' + file.name" @click="run(() => api('/auth/profile/files/' + file.id, { method: 'DELETE' }), '附件已删除')"><Trash2 :size="17" /></button></div>
          <p v-if="!profile.data?.files.length" class="empty-state">尚未上传附件</p><small class="muted">PDF / JPG / PNG / WebP · 每份最大 10 MB · 最多 20 份</small>
        </section>
        <p v-if="error" role="alert" class="error-message">{{ error }}</p><p v-if="success" role="status" class="success-message">{{ success }}</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.profile-page{display:grid;gap:26px}.profile-eyebrow{font-size:11px;letter-spacing:.16em;color:var(--accent);font-weight:700}.profile-page h1{margin:6px 0 10px}.profile-grid{display:grid;grid-template-columns:270px minmax(0,1fr);gap:24px;align-items:start}.identity-card{padding:36px 24px;display:flex;align-items:center;flex-direction:column;gap:15px}.identity-card h2,.identity-card p{margin:0}.identity-card p,.identity-card small{color:var(--text-muted);font-size:12px}.avatar-upload{border:0;background:#e2efed;color:var(--accent);width:112px;height:112px;border-radius:50%;position:relative;display:grid;place-items:center}.avatar-upload img{width:100%;height:100%;border-radius:50%;object-fit:cover}.avatar-upload span{position:absolute;bottom:0;right:0;border:4px solid white;border-radius:50%;padding:7px;background:var(--accent);color:white;display:flex}.text-action{border:0;background:none;color:var(--text-muted);font-size:12px}.profile-form,.attachments{padding:26px}.profile-form{display:grid;gap:22px}.profile-form>.btn{justify-self:start}.profile-fields{display:grid;grid-template-columns:1fr 1fr;gap:18px}.profile-fields label{display:grid;gap:8px;font-size:13px}.wide{grid-column:1/-1}.attachment-heading{display:flex;justify-content:space-between;gap:14px;align-items:center}.attachment-heading p{font-size:12px;margin-bottom:18px}.attachment{display:flex;gap:12px;align-items:center;padding:14px 0;border-top:1px solid var(--border)}.attachment>div{display:grid;gap:5px;flex:1;overflow:hidden}.attachment strong{font-size:13px;overflow-wrap:anywhere}.attachment small{color:var(--text-muted)}.error-message{color:#a24e50}.success-message{color:#277b64}@media(max-width:900px){.profile-grid{grid-template-columns:1fr}.profile-fields{grid-template-columns:1fr}.attachment-heading{flex-wrap:wrap}}
</style>
