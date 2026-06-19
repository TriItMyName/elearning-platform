import { createBrowserRouter, Navigate } from 'react-router-dom'



import { AdminGuard } from '@/components/admin/AdminGuard'

import { AdminCourseLayout } from '@/components/admin/AdminCourseLayout'

import { AdminLayout } from '@/components/admin/AdminLayout'

import { MainLayout } from '@/components/layout/MainLayout'

import { AuthLayout } from '@/components/layout/AuthLayout'

import { LearnGuard } from '@/components/learn/LearnGuard'

import { LearnLayout } from '@/components/learn/LearnLayout'

import { TeacherGuard } from '@/components/teacher/TeacherGuard'

import { TeacherLayout } from '@/components/teacher/TeacherLayout'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'

import { AdminCategoriesPage } from '@/pages/admin/categories/AdminCategoriesPage'

import { AdminCoursesPage } from '@/pages/admin/courses/AdminCoursesPage'

import { AdminLessonsPage } from '@/pages/admin/lessons/AdminLessonsPage'

import { AdminQuizzesPage } from '@/pages/admin/quizzes/AdminQuizzesPage'

import { AdminRolesPage } from '@/pages/admin/roles/AdminRolesPage'

import { AdminAccountsPage } from '@/pages/admin/users/AdminAccountsPage'

import { AdminUsersPage } from '@/pages/admin/users/AdminUsersPage'

import { CourseDetailPage } from '@/pages/courses/CourseDetailPage'

import { CoursesPage } from '@/pages/courses/CoursesPage'

import { HomePage } from '@/pages/HomePage'

import { LearnPage } from '@/pages/learn/LearnPage'

import { LoginPage } from '@/pages/LoginPage'

import { MyCoursesPage } from '@/pages/MyCoursesPage'

import { StudentProgressPage } from '@/pages/student/StudentProgressPage'

import { StudentCertificatesPage } from '@/pages/student/StudentCertificatesPage'

import { NotFoundPage } from '@/pages/NotFoundPage'

import { RegisterPage } from '@/pages/RegisterPage'

import { SettingsPage } from '@/pages/settings/SettingsPage'

import { TeacherWorkspacePage } from '@/pages/teacher/TeacherWorkspacePage'



export const router = createBrowserRouter([

  {

    element: <MainLayout />,

    children: [

      { index: true, element: <HomePage /> },

      { path: 'courses', element: <CoursesPage /> },

      { path: 'courses/:slug', element: <CourseDetailPage /> },

      { path: 'my-courses', element: <MyCoursesPage /> },

      { path: 'my-progress', element: <StudentProgressPage /> },

      { path: 'my-certificates', element: <StudentCertificatesPage /> },

      { path: 'settings', element: <SettingsPage /> },

    ],

  },

  {

    element: <LearnGuard />,

    children: [

      {

        element: <LearnLayout />,

        children: [{ path: 'learn/:slug', element: <LearnPage /> }],

      },

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

          { path: 'admin/courses', element: <AdminCoursesPage /> },

          {
            path: 'admin/courses/:courseId',
            element: <AdminCourseLayout />,
            children: [
              { index: true, element: <Navigate to="lessons" replace /> },
              { path: 'lessons', element: <AdminLessonsPage /> },
              { path: 'quizzes', element: <AdminQuizzesPage /> },
            ],
          },

          { path: 'admin/lessons', element: <Navigate to="/admin/courses" replace /> },
          { path: 'admin/quizzes', element: <Navigate to="/admin/courses" replace /> },

          { path: 'admin/reports', element: <Navigate to="/admin" replace /> },

        ],

      },

    ],

  },

  {

    element: <TeacherGuard />,

    children: [

      {

        element: <TeacherLayout />,

        children: [{ path: 'teacher', element: <TeacherWorkspacePage /> }],

      },

    ],

  },

  { path: '404', element: <NotFoundPage /> },

  { path: '*', element: <Navigate to="/404" replace /> },

])


