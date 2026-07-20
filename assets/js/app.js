(() => {
  "use strict";
  const cfg = window.SJW_CONFIG || {};
  const api = window.SJW_API;
  const byId = id => document.getElementById(id);
  const value = id => (byId(id)?.value || "").trim();
  let language = "zh";
  let currentResult = null;
  let generating = false;
  let checkoutBusy = false;
  let portalBusy = false;
  let progressTimer = null;

  function setMessage(id, text = "", type = "") {
    const el = byId(id);
    if (!el) return;
    el.textContent = text;
    el.dataset.type = type;
  }

  function setBusy(button, busy, text) {
    if (!button) return;
    if (busy) {
      button.dataset.original = button.innerHTML;
      button.textContent = text;
      button.disabled = true;
    } else {
      button.innerHTML = button.dataset.original || button.innerHTML;
      button.disabled = false;
    }
  }

  function t(zh, en) { return language === "zh" ? zh : en; }

  function applyLanguage() {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-zh][data-en]").forEach(el => {
      el.textContent = el.dataset[language];
    });
    document.querySelectorAll("[data-placeholder-zh][data-placeholder-en]").forEach(el => {
      el.placeholder = el.dataset[`placeholder${language === "zh" ? "Zh" : "En"}`];
    });
    const toggle = byId("language-toggle");
    if (toggle) toggle.textContent = language === "zh" ? "EN" : "中文";
  }

  function makeSiteId() {
    if (globalThis.crypto?.randomUUID) return `sjw_${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    return `sjw_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  function validateImage(file) {
    if (!file) return;
    if (!(cfg.allowedImageTypes || []).includes(file.type)) throw new Error(t("图片仅支持 JPG、PNG 或 WebP", "Use JPG, PNG, or WebP images"));
    if (file.size <= 0 || file.size > (cfg.maxHeroImageBytes || 8388608)) throw new Error(t("图片不能超过 8MB", "Image must be under 8MB"));
  }

  function isAllowedPreview(urlValue) {
    try {
      const url = new URL(urlValue);
      return url.protocol === "https:" && (cfg.allowedPreviewHosts || []).some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
    } catch (_) { return false; }
  }

  function validateStripeUrl(urlValue) {
    const url = new URL(urlValue);
    if (url.protocol !== "https:" || !(cfg.allowedStripeHosts || []).includes(url.hostname)) throw new Error(t("无法打开付款页面", "Unable to open payment page"));
    return url.href;
  }

  async function uploadImage() {
    const file = byId("hero-image")?.files?.[0];
    if (!file) return null;
    validateImage(file);
    const result = await api.uploadAsset(file);
    return result.assetId || result.id || null;
  }

  function payload(heroImageId) {
    return {
      siteId: makeSiteId(),
      business: {
        name: value("name"),
        industry: value("industry"),
        city: value("location"),
        contact: value("contact")
      },
      assets: { heroImageId },
      requestPreview: true,
      clientVersion: "2.0"
    };
  }

  function startProgress() {
    const messages = language === "zh"
      ? ["正在生成…", "正在准备页面…", "马上就好…"]
      : ["Creating…", "Preparing your website…", "Almost ready…"];
    let i = 0;
    const el = byId("progress-text");
    if (el) el.textContent = messages[0];
    progressTimer = setInterval(() => { if (el) el.textContent = messages[++i % messages.length]; }, 1700);
  }

  function stopProgress() { if (progressTimer) clearInterval(progressTimer); progressTimer = null; }

  async function handleGenerate(event) {
    event.preventDefault();
    const form = byId("site-form");
    if (!form?.reportValidity() || generating) return;
    setMessage("create-message");
    generating = true;
    const button = byId("generate");
    setBusy(button, true, t("正在生成…", "Creating…"));
    byId("preview-view").hidden = false;
    byId("preview-loading").hidden = false;
    byId("preview").style.visibility = "hidden";
    startProgress();

    try {
      const heroImageId = await uploadImage();
      const result = await api.generateSite(payload(heroImageId));
      const previewUrl = result.previewUrl || result.url || "";
      if (!previewUrl || !isAllowedPreview(previewUrl)) throw new Error(t("暂时无法显示预览", "Preview is unavailable"));
      currentResult = { ...result, previewUrl };
      byId("preview").src = previewUrl;
      byId("site-url").textContent = previewUrl;
      byId("share-site").disabled = false;
      byId("use-site").disabled = !result.siteId;
      byId("create-view").hidden = true;
      byId("preview-view").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      byId("preview-view").hidden = true;
      setMessage("create-message", error.message || t("暂时无法生成，请稍后重试", "Unable to generate. Please try again."), "error");
    } finally {
      stopProgress();
      byId("preview-loading").hidden = true;
      byId("preview").style.visibility = "visible";
      setBusy(button, false);
      generating = false;
    }
  }

  async function checkout(plan) {
    if (checkoutBusy) return;
    const email = value("checkout-email");
    if (!email || !currentResult?.siteId) return setMessage("checkout-message", t("请输入邮箱并先生成网站", "Enter your email and generate a website first"), "error");
    checkoutBusy = true;
    const button = plan === "yearly" ? byId("checkout-yearly") : byId("checkout-monthly");
    setBusy(button, true, t("正在打开…", "Opening…"));
    try {
      const result = await api.createCheckoutSession({ plan, email, siteId: currentResult.siteId, siteName: value("name"), returnUrl: `${String(cfg.siteUrl || location.origin).replace(/\/$/, "")}/` });
      location.assign(validateStripeUrl(result.url));
    } catch (error) { setMessage("checkout-message", error.message, "error"); }
    finally { setBusy(button, false); checkoutBusy = false; }
  }

  async function openPortal() {
    if (portalBusy) return;
    const email = value("billing-email");
    if (!email) return setMessage("billing-message", t("请输入付款邮箱", "Enter your payment email"), "error");
    portalBusy = true;
    const button = byId("open-portal");
    setBusy(button, true, t("正在打开…", "Opening…"));
    try {
      const result = await api.createPortalSession({ email, returnUrl: `${String(cfg.siteUrl || location.origin).replace(/\/$/, "")}/` });
      location.assign(validateStripeUrl(result.url));
    } catch (error) { setMessage("billing-message", error.message, "error"); }
    finally { setBusy(button, false); portalBusy = false; }
  }

  byId("site-form")?.addEventListener("submit", handleGenerate);
  byId("language-toggle")?.addEventListener("click", () => { language = language === "zh" ? "en" : "zh"; applyLanguage(); });
  byId("hero-image")?.addEventListener("change", () => {
    const file = byId("hero-image")?.files?.[0];
    const state = byId("hero-image-state");
    if (state) state.textContent = file ? file.name : t("可选", "Optional");
  });
  byId("edit-site")?.addEventListener("click", () => { byId("preview-view").hidden = true; byId("create-view").hidden = false; window.scrollTo({ top: 0, behavior: "smooth" }); });
  byId("share-site")?.addEventListener("click", async () => {
    if (!currentResult?.previewUrl) return;
    try {
      if (navigator.share) await navigator.share({ title: value("name"), url: currentResult.previewUrl });
      else await navigator.clipboard.writeText(currentResult.previewUrl);
    } catch (_) {}
  });
  byId("use-site")?.addEventListener("click", () => {
    byId("monthly-price").textContent = cfg.monthlyDisplay || "$15";
    byId("checkout-yearly").textContent = language === "zh" ? `按年开通 · ${cfg.yearlyDisplay || "$149"}` : `Yearly plan · ${cfg.yearlyDisplay || "$149"}`;
    byId("upgrade-dialog")?.showModal();
  });
  byId("manage-billing")?.addEventListener("click", () => byId("billing-dialog")?.showModal());
  byId("checkout-monthly")?.addEventListener("click", () => checkout("monthly"));
  byId("checkout-yearly")?.addEventListener("click", () => checkout("yearly"));
  byId("open-portal")?.addEventListener("click", openPortal);
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => byId(button.dataset.close)?.close()));
  applyLanguage();
})();
