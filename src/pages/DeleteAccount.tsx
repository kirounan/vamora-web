import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, deleteMyAccount, signIn } from '../lib/api';
import { APP_NAME, SUPPORT_EMAIL } from '../config';

type Step = 'signin' | 'confirm' | 'done';

interface AuthedUser {
  id: string;
  email: string;
  name?: string | null;
  nickname?: string | null;
}

const PREFILLED_EMAIL = 'delete_vamora@gmail.com';
const PREFILLED_PASSWORD = 'Test123?';

export default function DeleteAccount() {
  const [step, setStep] = useState<Step>('signin');

  const [email, setEmail] = useState(PREFILLED_EMAIL);
  const [password, setPassword] = useState(PREFILLED_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthedUser | null>(null);

  const [acknowledged, setAcknowledged] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn(trimmedEmail, password);
      setAccessToken(res.accessToken);
      setUser(res.user);
      setStep('confirm');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'We could not reach the server. Please check your connection and try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!accessToken) return;
    setError(null);
    setLoading(true);
    try {
      await deleteMyAccount(accessToken);
      setAccessToken(null);
      setPassword('');
      setStep('done');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          'We could not delete your account. Please try again in a few minutes.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setAccessToken(null);
    setUser(null);
    setEmail(PREFILLED_EMAIL);
    setPassword(PREFILLED_PASSWORD);
    setAcknowledged(false);
    setError(null);
    setStep('signin');
  }

  return (
    <section className="section container-narrow">
      <span className="eyebrow">Account</span>
      <h1>Delete your {APP_NAME} account</h1>
      <p className="text-muted">
        Permanently delete your account and the personal data associated with
        it. To verify it&rsquo;s really you, please sign in first.
      </p>

      {step === 'signin' && (
        <SignInStep
          email={email}
          password={password}
          showPassword={showPassword}
          loading={loading}
          error={error}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
          onSubmit={handleSignIn}
        />
      )}

      {step === 'confirm' && user && (
        <ConfirmStep
          user={user}
          acknowledged={acknowledged}
          loading={loading}
          error={error}
          onAcknowledgeChange={setAcknowledged}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />
      )}

      {step === 'done' && <DoneStep />}
    </section>
  );
}

interface SignInStepProps {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  error: string | null;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function SignInStep({
  email,
  password,
  showPassword,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: SignInStepProps) {
  return (
    <div className="card card-strong" style={{ marginTop: 24 }}>
      <h2 style={{ marginTop: 0 }}>Step 1 — Verify your identity</h2>
      <p className="text-muted">
        Sign in with the email and password you use in the {APP_NAME} app.
      </p>

      <div className="alert alert-info" role="note">
        Test credentials are pre-filled below for app store reviewers. Just
        click <strong>Sign in to continue</strong>.
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="form-input"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              className="form-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={loading}
              required
              style={{ paddingRight: 70 }}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              disabled={loading}
              style={{
                position: 'absolute',
                top: '50%',
                right: 8,
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '4px 8px',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            'Sign in to continue'
          )}
        </button>
      </form>

      <p className="form-help" style={{ marginTop: 16 }}>
        Your credentials are sent securely to our API and are not stored in
        this browser. After signing in, you will be asked to confirm before any
        data is deleted.
      </p>
    </div>
  );
}

interface ConfirmStepProps {
  user: AuthedUser;
  acknowledged: boolean;
  loading: boolean;
  error: string | null;
  onAcknowledgeChange: (v: boolean) => void;
  onDelete: () => void;
  onCancel: () => void;
}

function ConfirmStep({
  user,
  acknowledged,
  loading,
  error,
  onAcknowledgeChange,
  onDelete,
  onCancel,
}: ConfirmStepProps) {
  const canDelete = acknowledged && !loading;

  return (
    <div className="card card-strong" style={{ marginTop: 24 }}>
      <h2 style={{ marginTop: 0 }}>Step 2 — Confirm deletion</h2>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        You&rsquo;re signed in as{' '}
        <strong style={{ color: 'var(--text)' }}>{user.email}</strong>
        {user.nickname ? ` (${user.nickname})` : ''}. This action is permanent.
      </p>

      <div className="alert alert-warning" role="alert">
        <strong>This will permanently delete:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          <li>Your account, profile, and login credentials</li>
          <li>Your nickname, avatar, position and other profile data</li>
          <li>Your match participations, ratings and personal stats</li>
        </ul>
        <p style={{ margin: '10px 0 0' }}>
          Aggregate or anonymized records used to keep historical leaderboards
          consistent for other players may be retained, as described in our
          Privacy Policy.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '4px 0 18px',
          cursor: loading ? 'not-allowed' : 'pointer',
          color: 'var(--text-soft)',
          fontSize: '0.92rem',
          lineHeight: 1.5,
        }}
      >
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => onAcknowledgeChange(e.target.checked)}
          disabled={loading}
          style={{ marginTop: 4 }}
        />
        <span>
          I understand that this action is permanent and that my account and
          personal data cannot be recovered after deletion.
        </span>
      </label>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onDelete}
          disabled={!canDelete}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Deleting…
            </>
          ) : (
            'Permanently delete my account'
          )}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DoneStep() {
  return (
    <div className="card card-strong" style={{ marginTop: 24 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.15)',
          color: '#4ade80',
          display: 'grid',
          placeItems: 'center',
          marginBottom: 18,
        }}
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ marginTop: 0 }}>Your account has been deleted</h2>
      <p>
        Your {APP_NAME} account and personal data have been permanently
        deleted from our active systems. Backup copies will be purged within
        30 days as described in our{' '}
        <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
      <p className="text-muted">
        If you have any questions, contact us at{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
        <Link to="/" className="btn btn-ghost">
          Back to home
        </Link>
      </div>
    </div>
  );
}
