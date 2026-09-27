import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { APP_NAME } from '../config';

type AppScreen =
  | 'home'
  | 'upcoming'
  | 'play'
  | 'profile'
  | 'settings'
  | 'login'
  | 'signup';

type OpenAppFallbackProps = {
  screen: AppScreen;
};

const screenLabels: Record<AppScreen, string> = {
  home: 'Home',
  upcoming: 'Upcoming Games',
  play: 'Play',
  profile: 'Profile',
  settings: 'Settings',
  login: 'Log In',
  signup: 'Sign Up',
};

const authRequiredScreens = new Set<AppScreen>([
  'profile',
  'settings',
  'login',
  'signup',
]);

function buildAppUrl(path: string) {
  return `vamora://open/${path}`;
}

function AutoOpenApp({ appUrl }: { appUrl: string }) {
  const lastAttempt = useRef<string | null>(null);
  useEffect(() => {
    if (lastAttempt.current === appUrl) return;
    lastAttempt.current = appUrl;
    try {
      window.location.assign(appUrl);
    } catch {
      // Some browsers require a user gesture. Keep the app-open button usable.
    }
  }, [appUrl]);

  return null;
}

function AppActions({ appUrl }: { appUrl: string }) {
  return (
    <div className="hero-actions">
      <a href={appUrl} className="btn btn-primary">
        Open in {APP_NAME} App
      </a>
      <Link to="/" className="btn btn-ghost">
        Learn about {APP_NAME}
      </Link>
    </div>
  );
}

export function OpenAppFallback({ screen }: OpenAppFallbackProps) {
  const title = screenLabels[screen];
  const appUrl = buildAppUrl(screen);
  const requiresLogin = authRequiredScreens.has(screen);

  return (
    <section className="hero container-narrow">
      <AutoOpenApp appUrl={appUrl} />
      <span className="eyebrow">{APP_NAME} app link</span>
      <h1>Open {title} in {APP_NAME}</h1>
      <p>
        Opening the {title.toLowerCase()} screen in the mobile app. If the app
        does not open, install {APP_NAME} and return to this page.
      </p>
      {requiresLogin && (
        <p className="text-muted">
          You may need to log in before this screen is available in the app.
        </p>
      )}
      <AppActions appUrl={appUrl} />
    </section>
  );
}

export function JoinInvitePage() {
  const { competitionCode } = useParams();
  const code = competitionCode?.toUpperCase() ?? '';
  const appUrl = code
    ? buildAppUrl(`join/${encodeURIComponent(code)}`)
    : buildAppUrl('join');

  return (
    <>
      <section className="hero container-narrow">
        <AutoOpenApp appUrl={appUrl} />
        <span className="eyebrow">Competition invite</span>
        <h1>Join a {APP_NAME} Competition</h1>
        <p>
          Opening this invitation in the {APP_NAME} app to join the
          competition. If you do not have the app installed yet, install it
          first and then return to this page.
        </p>
        <AppActions appUrl={appUrl} />
      </section>

      <section className="section-tight container-narrow">
        <article className="card card-strong text-center">
          <h2>{code ? 'Invite code' : 'Have an invite code?'}</h2>
          {code ? (
            <p className="invite-code" aria-label="Competition invite code">
              {code}
            </p>
          ) : (
            <p className="text-muted">
              Enter your invite code inside the {APP_NAME} app to join a
              competition.
            </p>
          )}
        </article>
      </section>
    </>
  );
}

export function CaptainInvitePage() {
  const { token } = useParams();
  // Invitation tokens are case-sensitive; never treat them as join codes.
  const appUrl = buildAppUrl(`captain-invite/${encodeURIComponent(token ?? '')}`);

  return (
    <section className="hero container-narrow">
      <AutoOpenApp appUrl={appUrl} />
      <span className="eyebrow">Captain invitation</span>
      <h1>Set up your team in {APP_NAME}</h1>
      <p>
        Opening your captain invitation in the {APP_NAME} app. Sign in there
        to accept the invitation and add your team.
      </p>
      <p className="text-muted">
        If the app does not open automatically, tap the button below. If you
        have not installed {APP_NAME} yet, install it and reopen this link.
        In an in-app browser, you may need to open this page in Safari or Chrome.
      </p>
      <AppActions appUrl={appUrl} />
    </section>
  );
}

export function CompetitionFallbackPage() {
  const { competitionId } = useParams();
  const id = competitionId ?? '';
  const appUrl = buildAppUrl(`competition/${encodeURIComponent(id)}`);

  return (
    <section className="hero container-narrow">
      <AutoOpenApp appUrl={appUrl} />
      <span className="eyebrow">Competition</span>
      <h1>Open Competition</h1>
      <p>
        Opening this competition in the {APP_NAME} mobile app so you can see
        competition details, fixtures, and standings.
      </p>
      {id && (
        <p className="text-muted">
          Competition ID: <strong>{id}</strong>
        </p>
      )}
      <AppActions appUrl={appUrl} />
    </section>
  );
}
