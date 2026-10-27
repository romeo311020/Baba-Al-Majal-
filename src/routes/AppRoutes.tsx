import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// كل صفحة مسار مستقل ويُحمَّل عند الطلب (Lazy Loading)
const Home = lazy(() => import('../pages/Home'));
const Matches = lazy(() => import('../pages/Matches'));
const MatchDetails = lazy(() => import('../pages/MatchDetails'));
const News = lazy(() => import('../pages/News'));
const NewsDetails = lazy(() => import('../pages/NewsDetails'));
const SportPage = lazy(() => import('../pages/SportPage'));
const TeamPage = lazy(() => import('../pages/TeamPage'));
const PlayerPage = lazy(() => import('../pages/PlayerPage'));
const Assistant = lazy(() => import('../pages/Assistant'));
const Store = lazy(() => import('../pages/Store'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Favorites = lazy(() => import('../pages/Favorites'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Profile = lazy(() => import('../pages/Profile'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Settings = lazy(() => import('../pages/Settings'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/:id" element={<MatchDetails />} />
        <Route path="news" element={<News />} />
        <Route path="news/:id" element={<NewsDetails />} />
        <Route path="sports/:sport" element={<SportPage />} />
        <Route path="teams/:id" element={<TeamPage />} />
        <Route path="players/:id" element={<PlayerPage />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="store" element={<Store />} />
        <Route path="store/:id" element={<ProductDetails />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="settings" element={<Settings />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
