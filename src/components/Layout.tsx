import { NavLink, Link, Outlet } from 'react-router-dom';
import { APP_NAME } from '../config';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? ' is-active' : ''}`;

export default function Layout() {
  return (
    <div className="site">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand" aria-label={`${APP_NAME} home`}>
            <span className="brand-mark">V</span>
            <span>{APP_NAME}</span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/privacy-policy" className={navLinkClass}>
              Privacy
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
