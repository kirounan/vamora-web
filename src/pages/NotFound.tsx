import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="hero container-narrow">
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for doesn&rsquo;t exist or has moved.</p>
      <div className="hero-actions">
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
        <Link to="/privacy-policy" className="btn btn-ghost">
          Privacy Policy
        </Link>
      </div>
    </section>
  );
}
