import { api } from './client'
import type { AdminStats, AdminUser, PatientAccess, TemplateUsage } from '@/types'

interface AdminUserDTO {
  user_id: number
  username: string
  role: 'admin' | 'doctor' | 'patient'
  is_active: boolean
  department: string
  last_login_at?: string | null
  created_at: string
  deleted_at?: string | null
}

interface PatientAccessDTO {
  doctor_user_id: number
  doctor_username: string
  doctor_name: string
  patient_id: number
  patient_name?: string | null
  status: 'active' | 'revoked'
  created_at: string
}

function mapUser(item: AdminUserDTO): AdminUser {
  return {
    userId: item.user_id,
    username: item.username,
    role: item.role,
    isActive: item.is_active,
    department: item.department,
    lastLoginAt: item.last_login_at,
    createdAt: item.created_at,
    deletedAt: item.deleted_at,
  }
}

function mapAccess(item: PatientAccessDTO): PatientAccess {
  return {
    doctorUserId: item.doctor_user_id,
    doctorUsername: item.doctor_username,
    doctorName: item.doctor_name,
    patientId: item.patient_id,
    patientName: item.patient_name,
    status: item.status,
    createdAt: item.created_at,
  }
}

export const adminApi = {
  async listUsers(query: { page?: number; pageSize?: number; search?: string; role?: string; activeOnly?: boolean } = {}) {
    const params = new URLSearchParams({
      page: String(query.page || 1),
      page_size: String(query.pageSize || 50),
    })
    if (query.search) params.set('search', query.search)
    if (query.role) params.set('role', query.role)
    if (query.activeOnly) params.set('active_only', 'true')
    const result = await api<{ items: AdminUserDTO[]; total: number; page: number; page_size: number }>('/admin/users?' + params)
    return { items: result.items.map(mapUser), total: result.total, page: result.page, pageSize: result.page_size }
  },
  async createDoctor(input: { username: string; password: string; department: string }) {
    return api('/auth/admin/doctors', { method: 'POST', body: JSON.stringify(input) })
  },
  async setUserStatus(userId: number, isActive: boolean) {
    return mapUser(await api<AdminUserDTO>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }))
  },
  async resetPassword(userId: number, newPassword: string) {
    return api(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    })
  },
  async forceLogout(userId: number) {
    return api(`/admin/users/${userId}/force-logout`, { method: 'POST' })
  },
  async deleteUser(userId: number) {
    return api(`/admin/users/${userId}`, { method: 'DELETE' })
  },
  async userPatients(userId: number) {
    const result = await api<{ items: PatientAccessDTO[]; total: number }>(`/admin/users/${userId}/patients`)
    return { items: result.items.map(mapAccess), total: result.total }
  },
  async setPatientAccess(doctorUserId: number, patientId: number, status: 'active' | 'revoked') {
    return mapAccess(await api<PatientAccessDTO>('/admin/patient-access', {
      method: 'PUT',
      body: JSON.stringify({ doctor_user_id: doctorUserId, patient_id: patientId, status }),
    }))
  },
  async stats(days = 30): Promise<AdminStats> {
    const result = await api<{
      days: number
      new_patients: { date: string; count: number }[]
      image_uploads: { date: string; count: number }[]
      ai_tasks: { date: string; count: number }[]
      signed_reports: { date: string; count: number }[]
      doctor_activity: { user_id: number; username: string; display_name: string; signed_reports: number; images_uploaded: number; audit_actions: number }[]
    }>(`/admin/stats?days=${days}`)
    return {
      days: result.days,
      newPatients: result.new_patients,
      imageUploads: result.image_uploads,
      aiTasks: result.ai_tasks,
      signedReports: result.signed_reports,
      doctorActivity: result.doctor_activity.map(item => ({
        userId: item.user_id,
        username: item.username,
        displayName: item.display_name,
        signedReports: item.signed_reports,
        imagesUploaded: item.images_uploaded,
        auditActions: item.audit_actions,
      })),
    }
  },
  async templateUsage(): Promise<TemplateUsage[]> {
    const rows = await api<{ template_id?: string | null; template_name: string; doctor_user_id: number; doctor_name: string; report_count: number }[]>('/admin/report-template-usage')
    return rows.map(item => ({
      templateId: item.template_id,
      templateName: item.template_name,
      doctorUserId: item.doctor_user_id,
      doctorName: item.doctor_name,
      reportCount: item.report_count,
    }))
  },
}
