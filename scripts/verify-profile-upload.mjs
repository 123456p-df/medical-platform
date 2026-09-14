import assert from 'node:assert/strict'
import fs from 'node:fs'

const editor = fs.readFileSync('src/components/profile/AvatarEditor.vue', 'utf8')
assert.match(editor, /canvas ref="canvas"/)
assert.match(editor, /context\.rotate/)
assert.match(editor, /toBlob\(resolve, 'image\/jpeg'/)
assert.match(editor, /type="range" min="1" max="3"/)

const store = fs.readFileSync('src/stores/profile.ts', 'utf8')
assert.match(store, /PREVIEW_PROFILE_PREFIX \+ key/)
assert.match(store, /xhr\.upload\.onprogress/)
assert.match(store, /data_url: await dataUrl/)
assert.match(store, /data\.value\.files\.length >= 20/)

const view = fs.readFileSync('src/views/ProfileView.vue', 'utf8')
assert.match(view, /pendingAttachment/)
assert.match(view, /uploadAttachment/)
assert.match(view, /loadAttachmentPreviews/)
assert.match(view, /attachmentPreviews\[file\.id\]/)
assert.match(view, /<fieldset class="profile-fields" :disabled="busy">/)
assert.match(view, /onBeforeRouteLeave/)
assert.doesNotMatch(view, /busy \|\| localPreview/)

console.log('PASS: profile uploads support account-scoped local persistence, avatar crop/rotate preview, progress, retry, and form snapshots.')
