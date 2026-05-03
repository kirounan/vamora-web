import { useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DeleteAccount from './pages/DeleteAccount';
import NotFound from './pages/NotFound';
import {
  CompetitionFallbackPage,
  JoinInvitePage,
  OpenAppFallback,
} from './pages/DeepLinkFallbacks';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function RedirectToJoin() {
  const { competitionCode } = useParams();
  return <Navigate to={`/join/${competitionCode ?? ''}`} replace />;
}

function RedirectToCompetition() {
  const { competitionId } = useParams();
  return <Navigate to={`/competition/${competitionId ?? ''}`} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<OpenAppFallback screen="home" />} />
          <Route
            path="upcoming"
            element={<OpenAppFallback screen="upcoming" />}
          />
          <Route path="play" element={<OpenAppFallback screen="play" />} />
          <Route path="profile" element={<OpenAppFallback screen="profile" />} />
          <Route
            path="settings"
            element={<OpenAppFallback screen="settings" />}
          />
          <Route path="join" element={<JoinInvitePage />} />
          <Route path="join/:competitionCode" element={<JoinInvitePage />} />
          <Route path="c/:competitionCode" element={<RedirectToJoin />} />
          <Route
            path="competition/:competitionId"
            element={<CompetitionFallbackPage />}
          />
          <Route
            path="competitions/:competitionId"
            element={<RedirectToCompetition />}
          />
          <Route path="play/join" element={<Navigate to="/join" replace />} />
          <Route
            path="play/join/:competitionCode"
            element={<RedirectToJoin />}
          />
          <Route
            path="competition/join/:competitionCode"
            element={<RedirectToJoin />}
          />
          <Route
            path="competitions/join/:competitionCode"
            element={<RedirectToJoin />}
          />
          <Route path="login" element={<OpenAppFallback screen="login" />} />
          <Route path="signup" element={<OpenAppFallback screen="signup" />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="delete-account" element={<DeleteAccount />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
