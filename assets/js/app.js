(() => {
  "use strict";

  const cfg = window.SJW_CONFIG || {};
  const api = window.SJW_API;
  const ui = window.SJW_UI;
  const $ = ui.byId;

  const fallbackIndustries = [
    ["home-improvement", "家装与装修"],
    ["custom-cabinetry", "橱柜与衣柜定制"],
    ["windows-doors", "门窗与百叶窗"],
    ["restaurant", "餐厅与食品"],
    ["retail", "零售与批发"],
    ["beauty-wellness", "美容与健康服务"],
    ["manufacturing", "制造与设备"],
    ["professional-services", "专业服务"],
    ["education", "教育与培训"],
    ["real-estate", "房地产与物业"],
    ["other", "其他行业"]
  ];

  let currentResult = null;
  let generationInProgress = false;
  let checkoutInProgress = false;
  let portalInProgress = false;

  function siteId() {
    if (crypto && typeof crypto.randomUUID === "function") {
      return `sjw_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    }
    return `sjw_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  function fillIndustries(items) {
    const select = $("industry");
    const normalized = Array.isArray(items) && items.length
      ? items.map(item => [String(item.id || item.value || ""), String(item.label || item.name || "")]).filter(x => x[0] && x[1])
      : fallbackIndustries;
    select.replaceChildren();
    const first = document.createElement("option"); first.value = ""; first.textContent = "请选择行业"; select.append(first);
    normalized.forEach(([value, label]) => { const option=document.createElement("option"); option.value=value; option.textContent=label; select.append(option); });
  }

  async function loadPublicOptions() {
    try {
      const data = await api.getPublicOptions();
      fillIndustries(data.industries);
    } catch (_) {
      fillIndustries(fallbackIndustries.map(([id, label]) => ({ id, label })));
    }
  }

  function validateFile(file, maxBytes, label) {
    if (!file) return;
    const allowed = cfg.allowedImageTypes || ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) throw new Error(`${label}仅支持 JPG、PNG 或 WebP`);
    if (file.size <= 0 || file.size > maxBytes) throw new Error(`${label}文件大小不符合要求`);
  }

  function validateExternalUrl(value, allowedHosts) {
    const url = new URL(value);
    if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname)) throw new Error("服务器返回了无效的安全跳转地址");
    return url.href;
  }

  async function uploadSelectedAssets() {
    const hero = $("hero-image").files[0];
    const logo = $("logo-image").files[0];
    const gallery = [...$("gallery-images").files].slice(0, cfg.maxGalleryImages || 6);

    validateFile(hero, cfg.maxHeroImageBytes || 8388608, "主图");
    validateFile(logo, cfg.maxLogoImageBytes || 3145728, "Logo");
    gallery.forEach(file => validateFile(file, cfg.maxGalleryImageBytes || 8388608, "案例图片"));

    const assets = { heroImageId: null, logoImageId: null, galleryImageIds: [] };
    if (hero) {
      const uploaded = await api.uploadAsset(hero, "hero");
      assets.heroImageId = uploaded.assetId || uploaded.id;
    }
    if (logo) {
      const uploaded = await api.uploadAsset(logo, "logo");
      assets.logoImageId = uploaded.assetId || uploaded.id;
    }
    for (const file of gallery) {
      const uploaded = await api.uploadAsset(file, "gallery");
      const id = uploaded.assetId || uploaded.id;
      if (id) assets.galleryImageIds.push(id);
    }
    return assets;
  }

  function businessPayload(assets) {
    return {
      siteId: siteId(),
      business: {
        name: $("name").value.trim(),
        industry: $("industry").value,
        city: $("city").value.trim(),
        phone: $("phone").value.trim(),
        email: $("email").value.trim(),
        tagline: $("tagline").value.trim(),
        services: $("services").value.trim(),
        about: $("about").value.trim()
      },
      assets,
      requestPreview: true,
      humanConfirmationRequired: true,
      clientVersion: cfg.version || "2.0"
    };
  }

  async function handleGenerate(event) {
    event.preventDefault();
    ui.setMessage("create-message");

    if (!$("site-form").reportValidity()) return;
    if (!$("confirm-content").checked) {
      ui.setMessage("create-message", "请先确认公开信息真实准确。", "error");
      return;
    }

    if (generationInProgress) return;
    generationInProgress = true;
    const button = $("generate");
    ui.setBusy(button, true, "正在生成…");
    $("preview-wrap").hidden = false;
    ui.showPreviewLoading(true);

    try {
      const assets = await uploadSelectedAssets();
      const result = await api.generateSite(businessPayload(assets));
      if (!result.previewUrl && !result.url) throw new Error("服务器未返回预览地址");
      currentResult = result;
      ui.showPreview(result);
      ui.setMessage("create-message", "网站预览已生成，请检查内容和图片。", "success");
    } catch (error) {
      $("preview-wrap").hidden = true;
      ui.setMessage("create-message", error.message || "暂时无法生成，请稍后再试。", "error");
    } finally {
      generationInProgress = false;
      ui.showPreviewLoading(false);
      ui.setBusy(button, false);
    }
  }

  async function checkout(plan) {
    if (checkoutInProgress) return;
    const email = $("checkout-email").value.trim() || $("email").value.trim();
    if (!email) return ui.setMessage("checkout-message", "请输入付款邮箱。", "error");
    if (!currentResult || !currentResult.siteId) return ui.setMessage("checkout-message", "请先生成并确认网站预览。", "error");

    checkoutInProgress = true;
    const button = plan === "yearly" ? $("checkout-yearly") : $("checkout-monthly");
    ui.setBusy(button, true, "正在打开…");
    try {
      ui.setMessage("checkout-message", "正在打开安全结账…");
      const result = await api.createCheckoutSession({
        plan,
        email,
        siteId: currentResult.siteId,
        siteName: $("name").value.trim(),
        returnUrl: `${String(cfg.siteUrl || location.origin).replace(/\/$/, "")}/`
      });
      if (!result.url) throw new Error("无法创建结账页面");
      location.assign(validateExternalUrl(result.url, cfg.allowedStripeHosts || []));
    } catch (error) {
      ui.setMessage("checkout-message", error.message || "暂时无法打开结账。", "error");
    } finally {
      checkoutInProgress = false;
      ui.setBusy(button, false);
    }
  }

  async function portal() {
    if (portalInProgress) return;
    const email = $("billing-email").value.trim();
    if (!email) return ui.setMessage("billing-message", "请输入付款邮箱。", "error");
    portalInProgress = true;
    const button = $("open-portal");
    ui.setBusy(button, true, "正在打开…");
    try {
      ui.setMessage("billing-message", "正在打开会员管理…");
      const result = await api.createPortalSession({
        email,
        returnUrl: `${String(cfg.siteUrl || location.origin).replace(/\/$/, "")}/`
      });
      if (!result.url) throw new Error("无法打开会员管理");
      location.assign(validateExternalUrl(result.url, cfg.allowedStripeHosts || []));
    } catch (error) {
      ui.setMessage("billing-message", error.message || "暂时无法打开会员管理。", "error");
    } finally {
      portalInProgress = false;
      ui.setBusy(button, false);
    }
  }

  function resetForm() {
    $("site-form").reset();
    $("advanced-fields").hidden = true;
    $("toggle-details").setAttribute("aria-expanded", "false");
    $("toggle-details").textContent = "补充更多信息";
    $("hero-image-state").textContent = "尚未选择";
    $("logo-image-state").textContent = "未选择";
    $("gallery-state").textContent = "未选择";
    $("preview-wrap").hidden = true;
    $("preview").src = "about:blank";
    currentResult = null;
    ui.setMessage("create-message");
    $("name").focus();
  }

  $("site-form").addEventListener("submit", handleGenerate);
  $("toggle-details").addEventListener("click", () => {
    const panel = $("advanced-fields");
    const expanded = panel.hidden;
    panel.hidden = !expanded;
    $("toggle-details").setAttribute("aria-expanded", String(expanded));
    $("toggle-details").textContent = expanded ? "收起补充信息" : "补充更多信息";
  });

  $("hero-image").addEventListener("change", () => ui.updateUploadState("hero-image", "hero-image-state"));
  $("logo-image").addEventListener("change", () => ui.updateUploadState("logo-image", "logo-image-state"));
  $("gallery-images").addEventListener("change", () => ui.updateUploadState("gallery-images", "gallery-state", cfg.maxGalleryImages || 6));

  document.querySelectorAll(".device").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".device").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    $("preview").style.width = button.dataset.width;
  }));

  $("edit-site").addEventListener("click", () => $("top").scrollIntoView({ behavior: "smooth" }));
  $("share-site").addEventListener("click", async () => {
    const url = currentResult && (currentResult.previewUrl || currentResult.url);
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: $("name").value.trim(), url });
      else {
        await navigator.clipboard.writeText(url);
        $("share-site").textContent = "已复制";
        setTimeout(() => { $("share-site").textContent = "转发"; }, 1200);
      }
    } catch (_) {}
  });

  $("use-site").addEventListener("click", () => {
    $("checkout-email").value = $("email").value.trim();
    $("monthly-price").textContent = cfg.monthlyDisplay || "$15";
    $("checkout-yearly").textContent = `按年开通 · ${cfg.yearlyDisplay || "$149"}`;
    ui.openDialog("upgrade-dialog");
  });

  $("manage-billing").addEventListener("click", () => {
    $("billing-email").value = $("email").value.trim();
    ui.openDialog("billing-dialog");
  });

  $("checkout-monthly").addEventListener("click", () => checkout("monthly"));
  $("checkout-yearly").addEventListener("click", () => checkout("yearly"));
  $("open-portal").addEventListener("click", portal);
  $("reset").addEventListener("click", resetForm);
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => ui.closeDialog(button.dataset.close)));

  loadPublicOptions();
})();
