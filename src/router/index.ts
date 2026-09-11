import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginView from '@/views/LoginView.vue'

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
        { path: 'profile', component: () => import('@/views/ProfileView.vue') },
        {
          path: '',
          redirect: '/doctor/dashboard',
        },
        {
          path: 'dashboard',
          name: 'doctor-dashboard',
          component: () => import('@/views/doctor/DoctorDashboardView.vue'),
        },
        {
          path: 'patients',
          name: 'doctor-patients',
          redirect: { name: 'doctor-dashboard' },
        },
        {
          path: 'patients/:id',
          component: () => import('@/views/doctor/PatientDetailView.vue'),
          children: [
            {
              path: '',
              name: 'doctor-patient-overview',
              component: () => import('@/views/doctor/PatientOverviewView.vue'),
            },
            {
              path: 'overview',
              redirect: { name: 'doctor-patient-overview' },
            },
            {
              path: 'imaging',
              name: 'doctor-patient-imaging',
              component: () => import('@/views/doctor/PatientImagingView.vue'),
            },
            {
              path: 'ai',
              name: 'doctor-patient-ai',
              component: () => import('@/views/doctor/PatientAIView.vue'),
            },
            {
              path: 'report',
              name: 'doctor-patient-report',
              component: () => import('@/views/doctor/PatientReportView.vue'),
            },
            {
              path: '3d',
              name: 'doctor-patient-3d',
              component: () => import('@/views/doctor/Patient3DView.vue'),
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
        { path: 'profile', component: () => import('@/views/ProfileView.vue') },
        {
          path: '',
          redirect: '/patient/dashboard',
        },
        {
          path: 'dashboard',
          name: 'patient-dashboard',
          component: () => import('@/views/patient/PatientDashboardView.vue'),
        },
        {
          path: 'examinations',
          name: 'patient-examinations',
          component: () => import('@/views/patient/ExaminationsView.vue'),
        },
        {
          path: 'examinations/:id',
          name: 'patient-examination-detail',
          component: () => import('@/views/patient/ExaminationDetailView.vue'),
        },
        {
          path: 'reports',
          name: 'patient-reports',
          component: () => import('@/views/patient/ReportsView.vue'),
        },
        {
          path: 'body',
          name: 'patient-body',
          component: () => import('@/views/patient/BodyView.vue'),
        },
        {
          path: 'assistant',
          name: 'patient-ai',
          component: () => import('@/views/doctor/PatientAIView.vue'),
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
