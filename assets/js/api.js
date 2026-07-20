(() => {
  "use strict";
  const cfg = window.SJW_CONFIG || {};
  const API = String(cfg.apiBase || "").replace(/\/$/, "");

  async function request(path, options = {}, timeoutMs = cfg.requestTimeoutMs || 15000) {
    if (!API) throw new Error("服务地址尚未配置");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${API}${path}`, {
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
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
      if (!response.ok) throw new Error(data.error || data.message || `请求未完成（HTTP ${response.status}）`);
      return data;
    } catch (error) {
      if (error && error.name === "AbortError") throw new Error("请求超时，请检查网络后重试。");
      throw error;
    } finally { clearTimeout(timer); }
  }

  const getPublicOptions = () => request("/api/public-options", { method: "GET" });
  function uploadAsset(file, purpose) {
    const formData = new FormData(); formData.append("file", file); formData.append("purpose", purpose);
    return request("/api/uploads", { method: "POST", body: formData }, cfg.uploadTimeoutMs || 60000);
  }
  const generateSite = payload => request("/api/generate-site", { method: "POST", body: JSON.stringify(payload) }, cfg.generationTimeoutMs || 90000);
  const createCheckoutSession = payload => request("/api/create-checkout-session", { method: "POST", body: JSON.stringify(payload) });
  const createPortalSession = payload => request("/api/create-portal-session", { method: "POST", body: JSON.stringify(payload) });
  window.SJW_API = Object.freeze({ getPublicOptions, uploadAsset, generateSite, createCheckoutSession, createPortalSession });
})();
