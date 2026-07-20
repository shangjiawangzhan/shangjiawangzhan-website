(() => {
  "use strict";
  const cfg = window.SJW_CONFIG || {};
  const API = String(cfg.apiBase || "").replace(/\/$/, "");

  async function request(path, options = {}, timeoutMs = 15000) {
    if (!API) throw new Error("Service unavailable");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${API}${path}`, {
        credentials: "omit",
        cache: "no-store",
        ...options,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
          ...(options.headers || {})
        }
      });
      let data = {};
      try { data = await response.json(); } catch (_) {}
      if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
      return data;
    } catch (error) {
      if (error && error.name === "AbortError") throw new Error("Request timed out");
      throw error;
    } finally { clearTimeout(timer); }
  }

  function uploadAsset(file) {
    const form = new FormData();
    form.append("file", file);
    form.append("purpose", "hero");
    return request("/api/uploads", { method: "POST", body: form }, cfg.uploadTimeoutMs || 60000);
  }

  window.SJW_API = Object.freeze({
    uploadAsset,
    generateSite: payload => request("/api/generate-site", { method: "POST", body: JSON.stringify(payload) }, cfg.generationTimeoutMs || 90000),
    createCheckoutSession: payload => request("/api/create-checkout-session", { method: "POST", body: JSON.stringify(payload) }),
    createPortalSession: payload => request("/api/create-portal-session", { method: "POST", body: JSON.stringify(payload) })
  });
})();
