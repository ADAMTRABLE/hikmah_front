// import { createBrowserRouter, Navigate } from "react-router-dom";

// import PublicLayout from '../layouts/PublicLayout';
// import AdminLayout from "../layouts/AdminLayout";

// import PulicHome from '../pages/public/landing/Home';
// import Dashboard from "../pages/admin/dashboard/Dashboard";
// import User from "../pages/admin/users/User";

// // New imports
// import CoursesHome from '../pages/public/courses/Course/CourseHome';
// import EventsPage from "../pages/public/Events/EventsPage";

// import LibraryPage from "../pages/public/Library/LibraryPage";

// import QuranArabicCourse from "../pages/public/courses/Course/QuranArabicCourse";

// import Home from "../pages/public/landing/Home";


// export const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <PublicLayout />,
//     children: [
//       {
//         index: true,
//         element: <PulicHome />,
//       },
//       {
//         path: "/courses",
//         children: [
//           {
//             index: true,
//             element: <CoursesHome />,
//           },
//                     {
//             path: "quranic-arabic",
//             element: <QuranArabicCourse />,
//           },
      
//         ]
//       },
//       {
//         path: "/events",
//         children: [
//           {
//               index: true,
//             element: <EventsPage/>,
//           },
      
//         ]
//       },
//       {
//         path: "/library",
//         children: [
//           {
//               index: true,
//             element: <LibraryPage/>,
//           },
      
//         ]
//       },

//         {
//         path: "/dashboard",
//         children: [
//           {
//               index: true,
//             element: <Home/>,
//           },
      
//         ]
//       }
//     ]
//   },
//   {
//     path: "/admin",
//     element: <AdminLayout />,
//     children: [
//       {
//         index: true,
//         element: <Dashboard />
//       },
//       {
//         path: "users",
//         element: <User />
//       }
//     ]
//   },
//   {
//     path: "*",
//     element: <Navigate to="/" replace />
//   }
// ]);

import { createBrowserRouter, Navigate } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'

import PulicHome from '../pages/public/landing/Home'
import Dashboard from '../pages/admin/dashboard/Dashboard'
import User from '../pages/admin/users/User'
import CoursesAdmin from '../pages/admin/courses/CoursesAdmin'
import CourseBuilder from '../pages/admin/courses/CourseBuilder'
import AssessmentsAdmin from '../pages/admin/courses/AssessmentsAdmin'
import QuestionsAdmin from '../pages/admin/courses/QuestionsAdmin'
import LibraryAdmin from '../pages/admin/library/LibraryAdmin'
import LibrarySubmissionDetail from '../pages/admin/library/LibrarySubmissionDetail'
import EventsAdmin from '../pages/admin/events/EventsAdmin'
import BookingDetail from '../pages/admin/events/BookingDetail'
import SubscriptionSettings from '../pages/admin/settings/SubscriptionSettings'
import CoursesHome from '../pages/public/courses/Course/CourseHome'
import EventsPage from '../pages/public/Events/EventsPage'
import LibraryPage from '../pages/public/Library/LibraryPage'
import MyLearningPage from '../pages/public/MyLearning/MyLearningPage'
import TakeAssessment from '../pages/public/Assessments/TakeAssessment'
import AssessmentReview from '../pages/public/Assessments/AssessmentReview'
import QuranArabicCourse from '../pages/public/courses/Course/QuranArabicCourse'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Subscribe from '../pages/subscription/Subscribe'
import PaymentCallback from '../pages/subscription/PaymentCallback'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <PulicHome /> },
  {
  path: '/courses',
  children: [
    { index: true, element: <CoursesHome /> },
    { path: ':id', element: <QuranArabicCourse /> },
  ],
},
      { path: '/events', element: <EventsPage /> },
      { path: '/library', element: <LibraryPage /> },
      { path: '/my/learning', element: <MyLearningPage /> },
      { path: '/assessments/:id/take', element: <TakeAssessment /> },
      { path: '/assessments/attempts/:attemptId/review', element: <AssessmentReview /> },
      { path: '/subscribe', element: <Subscribe /> },
      { path: '/payment/callback', element: <PaymentCallback /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <User /> },
      { path: 'courses', element: <CoursesAdmin /> },
      { path: 'courses/:id/builder', element: <CourseBuilder /> },
      { path: 'courses/:id/assessments', element: <AssessmentsAdmin /> },
      { path: 'assessments/:id/questions', element: <QuestionsAdmin /> },
      { path: 'library', element: <LibraryAdmin /> },
      { path: 'library/submissions/:id', element: <LibrarySubmissionDetail /> },
      { path: 'events', element: <EventsAdmin /> },
      { path: 'events/bookings/:id', element: <BookingDetail /> },
      { path: 'settings', element: <SubscriptionSettings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])