import { lazy, Suspense } from 'react';
import Logo from '../components/Logo.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

// O 3D carrega depois: o formulário aparece imediatamente.
const SpaceCanvas = lazy(() => import('../three/SpaceCanvas.jsx'));

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="auth">
      <div className="auth-bg" aria-hidden="true">
        <ErrorBoundary fallback={() => null}>
          <Suspense fallback={null}>
            <SpaceCanvas mode="galaxy" level="low" interactive={false} selectedId={null} onSelect={() => {}} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <section className="auth-card glass">
        <div className="auth-brand">
          <Logo size={34} />
          <span>Carl Sagan AI</span>
        </div>
        <h1>{title}</h1>
        <p className="auth-sub">{subtitle}</p>
        {children}
        <p className="auth-foot">{footer}</p>
      </section>
    </main>
  );
}
