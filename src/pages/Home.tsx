import { Link } from 'react-router-dom';
import { APP_NAME } from '../config';

export default function Home() {
  return (
    <>
      <section className="hero container-narrow">
        <span className="eyebrow">Real Football Fantasy League</span>
        <h1>{APP_NAME}</h1>
        <p>
          Build your squad, compete in real matches, and climb the leaderboard.
          This page hosts our legal documents for the {APP_NAME} mobile app.
        </p>
        <div className="hero-actions">
          <Link to="/privacy-policy" className="btn btn-primary">
            Read Privacy Policy
          </Link>
        </div>
      </section>

      <section className="section container-narrow">
        <div className="grid-2">
          <article className="card feature-card">
            <div className="feature-icon" aria-hidden="true">
              {/* shield */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Privacy Policy</h3>
            <p>
              Learn what data {APP_NAME} collects, how it is used, who it is
              shared with, and how to exercise your rights under GDPR and CCPA.
            </p>
            <Link to="/privacy-policy" className="btn btn-ghost">
              Open policy
            </Link>
          </article>

          <article className="card feature-card">
            <div className="feature-icon" aria-hidden="true">
              {/* trophy */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 21h8M12 17v4" />
                <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
                <path d="M21 5h-4M3 5h4M21 5a3 3 0 0 1-3 3M3 5a3 3 0 0 0 3 3" />
              </svg>
            </div>
            <h3>Real Matches, Real Stats</h3>
            <p>
              {APP_NAME} turns your real-life football matches into competitive
              leaderboards, ratings, and player histories — all from the mobile
              app.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
