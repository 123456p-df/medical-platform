<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { RotateCcw, RotateCw, X } from 'lucide-vue-next'
import { t } from '@/i18n'

const emit = defineEmits<{ save: [blob: Blob] }>()
const dialog = ref<HTMLDialogElement>()
const canvas = ref<HTMLCanvasElement>()
const source = ref<HTMLImageElement>()
const sourceUrl = ref('')
const zoom = ref(1)
const rotation = ref(0)
const busy = ref(false)

async function open(file: File) {
  closeSource()
  sourceUrl.value = URL.createObjectURL(file)
  const image = new Image()
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error(t('ui.profile.cannotReadImage')))
    image.src = sourceUrl.value
  })
  source.value = image
  zoom.value = 1
  rotation.value = 0
  dialog.value?.showModal()
  await nextTick()
  render()
}

function closeSource() {
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
  sourceUrl.value = ''
  source.value = undefined
}

function close() {
  if (busy.value) return
  dialog.value?.close()
  closeSource()
}

function rotate(direction: -1 | 1) {
  rotation.value = (rotation.value + direction * 90 + 360) % 360
  render()
}

function render() {
  const target = canvas.value, image = source.value
  if (!target || !image) return
  const context = target.getContext('2d')
  if (!context) return
  const size = target.width
  const quarterTurn = rotation.value % 180 !== 0
  const visualWidth = quarterTurn ? image.naturalHeight : image.naturalWidth
  const visualHeight = quarterTurn ? image.naturalWidth : image.naturalHeight
  const scale = Math.max(size / visualWidth, size / visualHeight) * zoom.value
  context.clearRect(0, 0, size, size)
  context.save()
  context.translate(size / 2, size / 2)
  context.rotate(rotation.value * Math.PI / 180)
  context.drawImage(image, -image.naturalWidth * scale / 2, -image.naturalHeight * scale / 2, image.naturalWidth * scale, image.naturalHeight * scale)
  context.restore()
}

function updateZoom() { render() }

async function save() {
  if (!canvas.value || busy.value) return
  busy.value = true
  const blob = await new Promise<Blob | null>(resolve => canvas.value?.toBlob(resolve, 'image/jpeg', 0.9))
  busy.value = false
  if (!blob) return
  emit('save', blob)
  dialog.value?.close()
  closeSource()
}

onBeforeUnmount(closeSource)
defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="avatar-editor" aria-labelledby="avatar-editor-title" @cancel.prevent="close">
    <header><div><span>{{ $t('ui.profile.avatarStep') }}</span><h2 id="avatar-editor-title">{{ $t('ui.profile.avatarEditor') }}</h2></div><button class="icon-btn" type="button" :aria-label="$t('ui.profile.closeEditor')" :disabled="busy" @click="close"><X :size="18" /></button></header>
    <div class="avatar-preview"><canvas ref="canvas" width="256" height="256" :aria-label="$t('ui.profile.avatarPreview')" /></div>
    <label class="zoom-control"><span>{{ $t('ui.profile.zoom') }}</span><input v-model.number="zoom" type="range" min="1" max="3" step="0.05" @input="updateZoom" /></label>
    <div class="rotation-actions"><button class="btn btn-secondary" type="button" @click="rotate(-1)"><RotateCcw :size="16" /> {{ $t('ui.profile.rotateLeft') }}</button><button class="btn btn-secondary" type="button" @click="rotate(1)"><RotateCw :size="16" /> {{ $t('ui.profile.rotateRight') }}</button></div>
    <footer><button class="btn btn-secondary" type="button" :disabled="busy" @click="close">{{ $t('Cancel') }}</button><button class="btn btn-primary" type="button" :disabled="busy" @click="save">{{ busy ? $t('Saving...') : $t('ui.profile.useAvatar') }}</button></footer>
  </dialog>
</template>

<style scoped>
.avatar-editor{width:min(520px,calc(100vw - 32px));padding:0;border:1px solid var(--border);border-radius:var(--radius-lg);color:var(--text);box-shadow:0 24px 80px #16393a40}.avatar-editor::backdrop{background:#10283280}.avatar-editor header{display:flex;align-items:center;justify-content:space-between;padding:var(--space-5);border-bottom:1px solid var(--border)}.avatar-editor header span{color:var(--accent);font-size:var(--font-xs);font-weight:750;letter-spacing:.12em}.avatar-editor h2{margin:4px 0 0;font-size:20px}.avatar-preview{display:grid;place-items:center;padding:var(--space-6);background:linear-gradient(45deg,#edf2f2 25%,transparent 25%),linear-gradient(-45deg,#edf2f2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#edf2f2 75%),linear-gradient(-45deg,transparent 75%,#edf2f2 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0}.avatar-preview canvas{width:min(256px,70vw);height:min(256px,70vw);border:6px solid white;border-radius:50%;box-shadow:var(--shadow-md)}.zoom-control{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:var(--space-4);padding:var(--space-4) var(--space-5);font-size:var(--font-sm)}.zoom-control input{accent-color:var(--accent)}.rotation-actions{display:flex;justify-content:center;gap:var(--space-2);padding:0 var(--space-5) var(--space-4)}.avatar-editor footer{display:flex;justify-content:flex-end;gap:var(--space-2);padding:var(--space-4) var(--space-5);border-top:1px solid var(--border)}
</style>
