export function createRateLimiter({ windowMs, max }) {
  const hits = new Map();

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, Math.min(windowMs, 60_000));
  timer.unref();

  return {
    /** Registra uma tentativa. Retorna { ok, retryAfter } (segundos). */
    hit(key, limit = max) {
      const now = Date.now();
      let entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + windowMs };
        hits.set(key, entry);
      }
      entry.count += 1;
      return { ok: entry.count <= limit, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
    },
    reset(key) {
      hits.delete(key);
    },
  };
}
