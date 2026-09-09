import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileView from '@/views/ProfileView.vue'
import LoginView from '@/views/LoginView.vue'
import DoctorDashboardView from '@/views/doctor/DoctorDashboardView.vue'
import PatientDetailView from '@/views/doctor/PatientDetailView.vue'
import PatientOverviewView from '@/views/doctor/PatientOverviewView.vue'
import PatientImagingView from '@/views/doctor/PatientImagingView.vue'
import PatientAIView from '@/views/doctor/PatientAIView.vue'
import PatientReportView from '@/views/doctor/PatientReportView.vue'
import Patient3DView from '@/views/doctor/Patient3DView.vue'
import PatientDashboardView from '@/views/patient/PatientDashboardView.vue'
import ExaminationsView from '@/views/patient/ExaminationsView.vue'
import ExaminationDetailView from '@/views/patient/ExaminationDetailView.vue'
import ReportsView from '@/views/patient/ReportsView.vue'
import BodyView from '@/views/patient/BodyView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/doctor',
      component: AppLayout,
      meta: { portal: 'doctor', requiresAuth: true },
      children: [
        { path: 'profile', component: ProfileView },
        {
          path: '',
          redirect: '/doctor/dashboard',
        },
        {
          path: 'dashboard',
          name: 'doctor-dashboard',
          component: DoctorDashboardView,
        },
        {
          path: 'patients',
          name: 'doctor-patients',
          redirect: { name: 'doctor-dashboard' },
        },
        {
          path: 'patients/:id',
          component: PatientDetailView,
          children: [
            {
              path: '',
              name: 'doctor-patient-overview',
              component: PatientOverviewView,
            },
            {
              path: 'overview',
              redirect: { name: 'doctor-patient-overview' },
            },
            {
              path: 'imaging',
              name: 'doctor-patient-imaging',
              component: PatientImagingView,
            },
            {
              path: 'ai',
              name: 'doctor-patient-ai',
              component: PatientAIView,
            },
            {
              path: 'report',
              name: 'doctor-patient-report',
              component: PatientReportView,
            },
            {
              path: '3d',
              name: 'doctor-patient-3d',
              component: Patient3DView,
            },
          ],
        },
      ],
    },
    {
      path: '/patient',
      component: AppLayout,
      meta: { portal: 'patient', requiresAuth: true },
      children: [
        { path: 'profile', component: ProfileView },
        {
          path: '',
          redirect: '/patient/dashboard',
        },
        {
          path: 'dashboard',
          name: 'patient-dashboard',
          component: PatientDashboardView,
        },
        {
          path: 'examinations',
          name: 'patient-examinations',
          component: ExaminationsView,
        },
        {
          path: 'examinations/:id',
          name: 'patient-examination-detail',
          component: ExaminationDetailView,
        },
        {
          path: 'reports',
          name: 'patient-reports',
          component: ReportsView,
        },
        {
          path: 'body',
          name: 'patient-body',
          component: BodyView,
        },
        {
          path: 'assistant',
          name: 'patient-ai',
          component: PatientAIView,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const isPublic = Boolean(to.meta.public)

  if (!isPublic && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (isPublic && auth.isAuthenticated) {
    return auth.portal === 'doctor'
      ? { name: 'doctor-dashboard' }
      : { name: 'patient-dashboard' }
  }

  if (to.meta.portal && to.meta.portal !== auth.portal) {
    return auth.portal === 'doctor'
      ? { name: 'doctor-dashboard' }
      : { name: 'patient-dashboard' }
  }

  return true
})

export default router
