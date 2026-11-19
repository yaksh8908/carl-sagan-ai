import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useMediaQuery, usePrefersReducedMotion } from '../hooks/useMediaQuery.js';
import { useQuality } from '../three/quality.js';
import { getBody } from '../data/celestialObjects.js';
import { systemApi } from '../services/api.js';
import TopBar from '../components/TopBar.jsx';
import ExplorerPanel from '../components/panels/ExplorerPanel.jsx';
import InfoPanel from '../components/panels/InfoPanel.jsx';
import ChatDrawer from '../components/chat/ChatDrawer.jsx';
import ProfileModal from '../components/ProfileModal.jsx';

const SpaceCanvas = lazy(() => import('../three/SpaceCanvas.jsx'));

export default function DashboardPage() {
  const { user, logout, updateProfile, expireSession } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 720px)');
  const reduced = usePrefersReducedMotion();
  const quality = useQuality();

  const [mode, setMode] = useState('galaxy');
  const [selectedId, setSelectedId] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [explorerOpen, setExplorerOpen] = useState(() => window.innerWidth > 720);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [draft, setDraft] = useState({ id: 0, text: '' });
  const [ai, setAi] = useState(null);

  useEffect(() => {
    let active = true;
    systemApi
      .health()
      .then((data) => active && setAi(data.ai))
      .catch(() => active && setAi(null));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && selectedId && !chatOpen && !profileOpen) setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, chatOpen, profileOpen]);

  const switchMode = useCallback((next) => {
    setMode(next);
    setSelectedId(null);
    setResetKey((k) => k + 1);
  }, []);

  const resetView = useCallback(() => {
    setSelectedId(null);
    setResetKey((k) => k + 1);
  }, []);

  const askCarl = useCallback((body) => {
    setDraft({ id: Date.now(), text: `Fale sobre ${body.name}.` });
    setChatOpen(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const selectedBody = selectedId ? getBody(selectedId) : null;
  const sidePanelOpen = Boolean(selectedBody) || explorerOpen;

  return (
    <div className="dash">
      <Suspense fallback={<div className="canvas-loading">Carregando a galáxia…</div>}>
        <SpaceCanvas
          mode={mode}
          level={quality.level}
          onDegrade={quality.degrade}
          selectedId={selectedId}
          onSelect={setSelectedId}
          resetKey={resetKey}
        />
      </Suspense>

      <TopBar
        mode={mode}
        onModeChange={switchMode}
        explorerOpen={explorerOpen}
        onToggleExplorer={() => {
          setSelectedId(null);
          setExplorerOpen((open) => !open);
        }}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen((open) => !open)}
        onReset={resetView}
        quality={quality}
        user={user}
        onOpenProfile={() => setProfileOpen(true)}
        onLogout={handleLogout}
      />

      <AnimatePresence mode="wait">
        {selectedBody ? (
          <InfoPanel
            key="info"
            body={selectedBody}
            mode={mode}
            reduced={reduced}
            onClose={() => {
              setSelectedId(null);
              setExplorerOpen(false);
            }}
            onBack={() => {
              setSelectedId(null);
              setExplorerOpen(true);
            }}
            onAskCarl={askCarl}
            onEnterSolar={() => switchMode('solar')}
            onReset={resetView}
          />
        ) : (
          explorerOpen && (
            <ExplorerPanel key="explorer" mode={mode} reduced={reduced} onSelect={setSelectedId} onClose={() => setExplorerOpen(false)} />
          )
        )}
      </AnimatePresence>

      {!sidePanelOpen && !isMobile && (
        <p className="hint">Arraste para girar, role para aproximar e clique em um objeto para ver os dados.</p>
      )}

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} aiConfigured={ai ? ai.configured : undefined} draft={draft} onUnauthorized={expireSession} />

      <AnimatePresence>
        {profileOpen && (
          <ProfileModal
            user={user}
            onClose={() => setProfileOpen(false)}
            onSave={updateProfile}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
