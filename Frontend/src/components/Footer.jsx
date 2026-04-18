import { Link } from 'react-router-dom'


export default function Footer() {
  return (
    <footer className="footer-ui">
      <div className="footer-main">
        <span className="footer-brand">SpaceLink</span> &copy; {new Date().getFullYear()} &mdash; All rights reserved.
      </div>
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms &amp; Conditions</Link>
      </div>
      <div className="footer-social" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 10}}>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram" className="footer-icon instagram">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.75a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5zm0 1.5a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5zm5.25.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path></svg>
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter" className="footer-icon twitter">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 11.5 9.03c0 .34.04.67.1.98A12.13 12.13 0 0 1 3.1 5.13a4.28 4.28 0 0 0 1.32 5.7c-.7-.02-1.36-.22-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.2c-.33.09-.68.14-1.04.14-.25 0-.5-.02-.74-.07a4.29 4.29 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.7 8.7 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.7z"></path></svg>
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook" className="footer-icon facebook">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"></path></svg>
        </a>
      </div>
      <div className="footer-desc" style={{margin: '10px 0 2px 0', color: 'var(--text-muted, #a1a1aa)', fontSize: '14px'}}>
        SpaceLink is a modern campus resource management platform for booking, browsing, and managing facilities with ease.
      </div>

      <style>{`
        .footer-ui {
          width: 100%;
          background: var(--surface-dark, #18181b);
          color: var(--text-secondary, #a1a1aa);
          padding: 32px 0 16px 0;
          text-align: center;
          margin-top: 48px;
          border-top: 1px solid var(--border, #27272a);
          font-size: 15px;
          letter-spacing: 0.01em;
          z-index: 50;
        }
        .footer-main {
          margin-bottom: 8px;
        }
        .footer-brand {
          font-weight: 700;
          color: var(--accent-blue, #2563eb);
          font-size: 18px;
          letter-spacing: 0.03em;
        }
        .footer-links {
          margin-bottom: 12px;
          display: flex;
          justify-content: center;
          gap: 22px;
          flex-wrap: wrap;
        }
        .footer-links a {
          color: var(--accent-blue, #2563eb);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: var(--accent-pink, #f43f5e);
          text-decoration: underline;
        }
        .footer-social {
          margin-bottom: 10px;
        }
        .footer-icon {
          margin: 0 8px;
          font-size: 22px;
          vertical-align: middle;
          opacity: 0.85;
          transition: transform 0.2s, opacity 0.2s;
        }
        .footer-icon.instagram:hover { color: #e1306c; transform: scale(1.2); opacity: 1; }
        .footer-icon.twitter:hover { color: #1da1f2; transform: scale(1.2); opacity: 1; }
        .footer-icon.facebook:hover { color: #1877f3; transform: scale(1.2); opacity: 1; }

      `}</style>
    </footer>
  )
}
