import Logo from './Logo.jsx';

export default function SplashScreen() {
  return (
    <div className="splash" role="status" aria-live="polite">
      <Logo size={44} />
      <p>Carregando o universo…</p>
    </div>
  );
}
