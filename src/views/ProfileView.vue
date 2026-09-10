<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Camera, Download, FileText, Save, Trash2, Upload, UserRound } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { api, request } from '@/api/client'
import { useProfileStore, type ProfileFile } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
const profile = useProfileStore()
const auth = useAuthStore(), router = useRouter()
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
async function save() { await run(() => profile.save(form), '个人资料已保存') }
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
    <header class="profile-heading">
      <button class="back-link" type="button" @click="router.push('/' + auth.portal + '/dashboard')"><ArrowLeft :size="16" /> 返回工作台</button>
      <div><span class="profile-eyebrow">YOUR PROFILE</span><h1>个人资料</h1><p class="muted">您的头像、联系方式与专业信息。</p></div>
    </header>
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
          <div class="form-heading"><div><span>ACCOUNT DETAILS</span><h3>基本信息</h3></div><p>这些信息将显示在您的报告和临床协作记录中。</p></div>
          <div class="profile-fields">
            <label><span>显示姓名</span><input v-model="form.display_name" class="profile-input" maxlength="100" placeholder="请输入显示姓名" required /></label>
            <label><span>职称 / 身份</span><input v-model="form.title" class="profile-input" maxlength="100" placeholder="例如：主治医师" /></label>
            <label><span>科室 / 机构</span><input v-model="form.department" class="profile-input" maxlength="100" placeholder="例如：胸部影像科" /></label>
            <label><span>联系电话</span><input v-model="form.phone" class="profile-input" type="tel" maxlength="40" placeholder="请输入联系电话" /></label>
            <label class="wide"><span>邮箱</span><input v-model="form.email" class="profile-input" type="email" maxlength="254" placeholder="name@example.com" /></label>
            <label class="wide"><span>个人介绍</span><textarea v-model="form.bio" class="profile-input profile-textarea" maxlength="2000" rows="4" placeholder="简要介绍专业方向或工作职责" /></label>
          </div>
          <div class="form-footer"><span>修改仅影响当前账号资料。</span><button class="btn btn-primary" :disabled="busy || !form.display_name.trim()"><Save :size="16" />{{ busy ? '处理中…' : '保存资料' }}</button></div>
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
.profile-page{display:grid;gap:24px}.profile-heading{display:grid;gap:18px}.back-link{display:inline-flex;width:max-content;align-items:center;gap:7px;padding:0;border:0;background:transparent;color:var(--text-soft);font-size:13px}.back-link:hover{color:var(--accent-strong)}.profile-eyebrow,.form-heading span{font-size:11px;letter-spacing:.16em;color:var(--accent);font-weight:750}.profile-page h1{margin:6px 0 7px;font-size:27px}.profile-grid{display:grid;grid-template-columns:280px minmax(0,1fr);gap:24px;align-items:start}.identity-card{position:sticky;top:calc(var(--topbar-height) + 24px);padding:38px 24px;display:flex;align-items:center;flex-direction:column;gap:15px;background:linear-gradient(180deg,#fff 0,#f7fbfa 100%)}.identity-card h2,.identity-card p{margin:0}.identity-card p,.identity-card small{color:var(--text-muted);font-size:12px}.avatar-upload{border:6px solid #edf5f3;background:#dcecea;color:var(--accent);width:118px;height:118px;border-radius:50%;position:relative;display:grid;place-items:center;box-shadow:0 8px 28px #214d4520}.avatar-upload img{width:100%;height:100%;border-radius:50%;object-fit:cover}.avatar-upload span{position:absolute;bottom:-2px;right:-2px;border:4px solid white;border-radius:50%;padding:8px;background:var(--accent);color:white;display:flex}.text-action{border:0;background:none;color:var(--text-muted);font-size:12px}.profile-form,.attachments{padding:28px}.profile-form{display:grid;gap:25px}.form-heading{display:flex;justify-content:space-between;gap:24px;padding-bottom:20px;border-bottom:1px solid var(--border)}.form-heading h3{margin:5px 0 0;font-size:18px}.form-heading p{max-width:340px;margin:0;color:var(--text-muted);font-size:12px;line-height:1.7}.profile-fields{display:grid;grid-template-columns:1fr 1fr;gap:20px}.profile-fields label{display:grid;gap:8px;color:var(--text-soft);font-size:13px;font-weight:650}.profile-input{width:100%;min-height:46px;padding:11px 13px;border:1px solid #d6e2e2;border-radius:10px;outline:0;background:#f9fbfb;color:var(--text);font-size:14px;transition:border-color 150ms ease,background 150ms ease,box-shadow 150ms ease}.profile-input::placeholder{color:#9aabad}.profile-input:hover{border-color:#bdcecf;background:#fff}.profile-input:focus{border-color:var(--accent);background:#fff;box-shadow:0 0 0 4px rgb(47 143 146 / 11%)}.profile-textarea{min-height:130px;resize:vertical;line-height:1.7}.wide{grid-column:1/-1}.form-footer{display:flex;justify-content:space-between;align-items:center;gap:20px;padding-top:20px;border-top:1px solid var(--border)}.form-footer>span{color:var(--text-muted);font-size:12px}.attachment-heading{display:flex;justify-content:space-between;gap:14px;align-items:center}.attachment-heading p{font-size:12px;margin-bottom:18px}.attachment{display:flex;gap:12px;align-items:center;padding:14px 0;border-top:1px solid var(--border)}.attachment>div{display:grid;gap:5px;flex:1;overflow:hidden}.attachment strong{font-size:13px;overflow-wrap:anywhere}.attachment small{color:var(--text-muted)}.error-message{color:#a24e50}.success-message{color:#277b64;padding:12px 14px;border-radius:8px;background:#e9f5ef}@media(max-width:900px){.profile-grid{grid-template-columns:1fr}.identity-card{position:static}.profile-fields{grid-template-columns:1fr}.attachment-heading,.form-heading,.form-footer{flex-wrap:wrap}}
</style>
