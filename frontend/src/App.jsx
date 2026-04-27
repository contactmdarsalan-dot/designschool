import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { isAdminUser, isAuthenticated, isMentorUser } from './lib/auth';

const Home = lazy(() => import('./pages/Home.jsx'));
const CoursesPage = lazy(() => import('./pages/CoursesPage.jsx'));
const CourseDetail = lazy(() => import('./pages/CourseDetail.jsx'));
const LearningPathsPage = lazy(() => import('./pages/LearningPathsPage.jsx'));
const AssessSkillsPage = lazy(() => import('./pages/AssessSkillsPage.jsx'));
const LearningExperiencePage = lazy(() => import('./pages/LearningExperiencePage.jsx'));
const BlogListPage = lazy(() => import('./pages/BlogListPage.jsx'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage.jsx'));
const FreeResourcesPage = lazy(() => import('./pages/FreeResourcesPage.jsx'));
const FreeResourceDetailPage = lazy(() => import('./pages/FreeResourceDetailPage.jsx'));
const RequestCallbackPage = lazy(() => import('./pages/RequestCallbackPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const PhoneVerificationPage = lazy(() => import('./pages/PhoneVerificationPage.jsx'));
const StudentWorkspaceLayout = lazy(() => import('./pages/StudentWorkspaceLayout.jsx'));
const StudentOverviewPage = lazy(() => import('./pages/StudentOverviewPage.jsx'));
const StudentCoursesPage = lazy(() => import('./pages/StudentCoursesPage.jsx'));
const StudentJoinCoursePage = lazy(() => import('./pages/StudentJoinCoursePage.jsx'));
const StudentAssignmentsPage = lazy(() => import('./pages/StudentAssignmentsPage.jsx'));
const StudentRecordingsPage = lazy(() => import('./pages/StudentRecordingsPage.jsx'));
const StudentVideoPlayerPage = lazy(() => import('./pages/StudentVideoPlayerPage.jsx'));
const StudentAttendancePage = lazy(() => import('./pages/StudentAttendancePage.jsx'));
const StudentCertificatesPage = lazy(() => import('./pages/StudentCertificatesPage.jsx'));
const StudentNotificationsPage = lazy(() => import('./pages/StudentNotificationsPage.jsx'));
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage.jsx'));
const InstructorPanelPage = lazy(() => import('./pages/InstructorPanelPage.jsx'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage.jsx'));

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdminUser()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const MentorRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isMentorUser()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-black text-white">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-white/70">
              Loading experience...
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/paths" element={<LearningPathsPage />} />
          <Route path="/assess-skills" element={<AssessSkillsPage />} />
          <Route path="/assess/skills" element={<Navigate to="/assess-skills" replace />} />
          <Route path="/learn/:id" element={<LearningExperiencePage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/free-resources" element={<FreeResourcesPage />} />
          <Route path="/free-resources/:resourceId" element={<FreeResourceDetailPage />} />
          <Route path="/play-code-game" element={<Navigate to="/free-resources" replace />} />
          <Route path="/play-code-game/:gameId" element={<Navigate to="/free-resources" replace />} />
          <Route path="/request-callback" element={<RequestCallbackPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-phone" element={<PhoneVerificationPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentWorkspaceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentOverviewPage />} />
            <Route path="courses" element={<StudentCoursesPage />} />
            <Route path="join-course" element={<StudentJoinCoursePage />} />
            <Route path="assignments" element={<StudentAssignmentsPage />} />
            <Route path="recordings" element={<StudentRecordingsPage />} />
            <Route path="recordings/:recordingId" element={<StudentVideoPlayerPage />} />
            <Route path="attendance" element={<StudentAttendancePage />} />
            <Route path="certificates" element={<StudentCertificatesPage />} />
            <Route path="notifications" element={<StudentNotificationsPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>
          <Route
            path="/instructor-panel"
            element={
              <MentorRoute>
                <InstructorPanelPage />
              </MentorRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <AdminRoute>
                <AdminPanelPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-panel/:resourceKey"
            element={
              <AdminRoute>
                <AdminPanelPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
