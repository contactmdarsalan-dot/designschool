import Home from './pages/Home';
import CoursesPage from './pages/CoursesPage';
import CourseDetail from './pages/CourseDetail';
import RequestCallbackPage from './pages/RequestCallbackPage';
import BlogListPage from './pages/BlogListPage';
import FreeResourcesPage from './pages/FreeResourcesPage';
import FreeResourceDetailPage from './pages/FreeResourceDetailPage';
import RegisterPage from './pages/RegisterPage';
import PhoneVerificationPage from './pages/PhoneVerificationPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/free-resources" element={<FreeResourcesPage />} />
        <Route path="/free-resources/:resourceId" element={<FreeResourceDetailPage />} />
        <Route path="/play-code-game" element={<Navigate to="/free-resources" replace />} />
        <Route path="/play-code-game/:gameId" element={<Navigate to="/free-resources" replace />} />
        <Route path="/request-callback" element={<RequestCallbackPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-phone" element={<PhoneVerificationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
