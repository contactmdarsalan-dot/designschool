import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';

const Home = lazy(() => import('./pages/Home.jsx'));
const CoursesPage = lazy(() => import('./pages/CoursesPage.jsx'));
const CourseDetail = lazy(() => import('./pages/CourseDetail.jsx'));
const BlogListPage = lazy(() => import('./pages/BlogListPage.jsx'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage.jsx'));
const FreeResourcesPage = lazy(() => import('./pages/FreeResourcesPage.jsx'));
const FreeResourceDetailPage = lazy(() => import('./pages/FreeResourceDetailPage.jsx'));
const RequestCallbackPage = lazy(() => import('./pages/RequestCallbackPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const PhoneVerificationPage = lazy(() => import('./pages/PhoneVerificationPage.jsx'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage.jsx'));

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
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
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
