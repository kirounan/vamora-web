import { lazy, Suspense, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DeleteAccount from "./pages/DeleteAccount";
import NotFound from "./pages/NotFound";
import {
  CaptainInvitePage,
  TeamInvitePage,
  CompetitionFallbackPage,
  JoinInvitePage,
  OpenAppFallback,
} from "./pages/DeepLinkFallbacks";
const AdminApp = lazy(() => import("./admin/AdminApp"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      try {
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView();
      } catch {
        /* Ignore malformed fragment encoding. */
      }
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function RedirectToJoin() {
  const { competitionCode } = useParams();
  const { search, hash } = useLocation();
  return (
    <Navigate
      to={`/join/${encodeURIComponent(competitionCode ?? "")}${search}${hash}`}
      replace
    />
  );
}

function RedirectToCompetition() {
  const { competitionId } = useParams();
  const { search, hash } = useLocation();
  return (
    <Navigate
      to={`/competition/${encodeURIComponent(competitionId ?? "")}${search}${hash}`}
      replace
    />
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="admin/*" element={<Suspense fallback={<div role="status">Loading administration…</div>}><AdminApp /></Suspense>} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="en" element={<Home />} />
          <Route path="home" element={<OpenAppFallback screen="home" />} />
          <Route
            path="upcoming"
            element={<OpenAppFallback screen="upcoming" />}
          />
          <Route path="play" element={<OpenAppFallback screen="play" />} />
          <Route
            path="profile"
            element={<OpenAppFallback screen="profile" />}
          />
          <Route
            path="settings"
            element={<OpenAppFallback screen="settings" />}
          />
          <Route path="join" element={<JoinInvitePage />} />
          <Route path="join/:competitionCode" element={<JoinInvitePage />} />
          <Route path="team-invite/:token" element={<TeamInvitePage />} />
          <Route path="captain-invite/:token" element={<CaptainInvitePage />} />
          <Route path="c/:competitionCode" element={<RedirectToJoin />} />
          <Route
            path="competition/:competitionId"
            element={<CompetitionFallbackPage />}
          />
          <Route
            path="competitions/:competitionId"
            element={<RedirectToCompetition />}
          />
          <Route path="play/join" element={<RedirectToJoin />} />
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
          <Route path="en/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="delete-account" element={<DeleteAccount />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
