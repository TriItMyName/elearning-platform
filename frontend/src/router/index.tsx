import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminCategoriesPage } from '@/pages/admin/categories/AdminCategoriesPage'
import { AdminCoursesPage } from '@/pages/admin/courses/AdminCoursesPage'
import { AdminLessonsPage } from '@/pages/admin/lessons/AdminLessonsPage'
import { AdminQuizzesPage } from '@/pages/admin/quizzes/AdminQuizzesPage'
import { AdminReportsPage } from '@/pages/admin/placeholders/AdminPlaceholderPages'
import { AdminPermissionsPage } from '@/pages/admin/permissions/AdminPermissionsPage'
import { AdminRolesPage } from '@/pages/admin/roles/AdminRolesPage'
import { AdminAccountsPage } from '@/pages/admin/users/AdminAccountsPage'
import { AdminUsersPage } from '@/pages/admin/users/AdminUsersPage'
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage'
import { CoursesPage } from '@/pages/courses/CoursesPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { MyCoursesPage } from '@/pages/MyCoursesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:slug', element: <CourseDetailPage /> },
      { path: 'my-courses', element: <MyCoursesPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin', element: <AdminDashboardPage /> },
          { path: 'admin/users', element: <AdminUsersPage /> },
          { path: 'admin/accounts', element: <AdminAccountsPage /> },
          { path: 'admin/categories', element: <AdminCategoriesPage /> },
          { path: 'admin/roles', element: <AdminRolesPage /> },
          { path: 'admin/permissions', element: <AdminPermissionsPage /> },
          { path: 'admin/courses', element: <AdminCoursesPage /> },
          { path: 'admin/lessons', element: <AdminLessonsPage /> },
          { path: 'admin/quizzes', element: <AdminQuizzesPage /> },
          { path: 'admin/reports', element: <AdminReportsPage /> },
        ],
      },
    ],
  },
  { path: '404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
])
