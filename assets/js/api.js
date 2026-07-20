(() => {
  const cfg = window.SJW_CONFIG;
  async function request(path, options = {}, timeout = 90000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(`${cfg.apiBase}${path}`, { ...options, signal: controller.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } finally { clearTimeout(timer); }
  }
  window.SJW_API = {
    upload(file) { const body = new FormData(); body.append('file', file); return request('/api/uploads', { method: 'POST', body }, 90000); },
    generate(payload) { return request('/api/generate-site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, 120000); },
    checkout(payload) { return request('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, 45000); },
    portal(payload) { return request('/api/create-portal-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, 45000); }
  };
})();
