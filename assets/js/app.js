(() => {
  "use strict";
  const cfg = window.SJW_CONFIG || {};
  const api = window.SJW_API;
  const byId = id => document.getElementById(id);
  const value = id => (byId(id)?.value || "").trim();
  let language = (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  let selectedCategory = "home-services";
  let currentResult = null;
  let generating = false;
  let checkoutBusy = false;
  let portalBusy = false;
  let progressTimer = null;
  let progressValue = 7;

  const categories = [
    ["home-services","⌂","家居服务","Home Services"],
    ["food-hospitality","✦","餐饮酒店","Food & Hospitality"],
    ["retail","◇","零售贸易","Retail & Trade"],
    ["professional","○","专业服务","Professional"],
    ["beauty-wellness","✺","美容健康","Beauty & Wellness"],
    ["manufacturing","▦","制造工业","Manufacturing"],
    ["automotive","◈","汽车服务","Automotive"],
    ["other","＋","其他行业","Other"]
  ];

  function t(zh,en){return language === "zh" ? zh : en;}
  function setMessage(id,text="",type=""){const el=byId(id);if(!el)return;el.textContent=text;el.dataset.type=type;}
  function setBusy(button,busy,text){if(!button)return;if(busy){button.dataset.original=button.innerHTML;button.textContent=text;button.disabled=true}else{button.innerHTML=button.dataset.original||button.innerHTML;button.disabled=false}}
  function showView(id){["create-view","building-view","preview-view"].forEach(view=>{const el=byId(view);if(el)el.hidden=view!==id});window.scrollTo({top:0,behavior:"smooth"});}

  function renderCategories(){
    const box=byId("industry-options"); if(!box)return; box.replaceChildren();
    categories.forEach(([id,icon,zh,en])=>{
      const button=document.createElement("button"); button.type="button"; button.className=`industry-option${id===selectedCategory?" selected":""}`; button.dataset.id=id;
      const iconEl=document.createElement("span");iconEl.textContent=icon;
      const label=document.createElement("span");label.textContent=language==="zh"?zh:en;
      button.append(iconEl,label);button.addEventListener("click",()=>{selectedCategory=id;renderCategories()});box.append(button);
    });
  }

  function applyLanguage(){
    document.documentElement.lang=language==="zh"?"zh-CN":"en";
    document.querySelectorAll("[data-zh][data-en]").forEach(el=>el.textContent=el.dataset[language]);
    document.querySelectorAll("[data-placeholder-zh][data-placeholder-en]").forEach(el=>el.placeholder=el.dataset[`placeholder${language==="zh"?"Zh":"En"}`]);
    const toggle=byId("language-toggle");if(toggle)toggle.textContent=language==="zh"?"EN":"中文";renderCategories();
  }

  function makeSiteId(){return `sjw_${crypto.getRandomValues(new Uint32Array(3)).reduce((s,n)=>s+n.toString(36),"").slice(0,22)}`;}
  function validateImage(file){if(!file)return;if(!(cfg.allowedImageTypes||[]).includes(file.type))throw new Error(t("请使用 JPG、PNG 或 WebP 图片","Use a JPG, PNG, or WebP image"));if(file.size>(cfg.maxHeroImageBytes||8388608))throw new Error(t("图片不能超过 8MB","Image must be under 8MB"));}
  async function uploadImage(){const file=byId("hero-image")?.files?.[0];if(!file)return "";validateImage(file);const result=await api.uploadAsset(file);return result.assetId||"";}
  function isAllowedPreview(raw){try{const u=new URL(raw);return u.protocol==="https:"&&(u.hostname==="api.shangjiawangzhan.com"||u.hostname==="shangjiawangzhan.com"||u.hostname.endsWith(".shangjiawangzhan.com"))}catch{return false}}
  function validateStripeUrl(raw){const u=new URL(raw);if(u.protocol!=="https:"||!(cfg.allowedStripeHosts||[]).includes(u.hostname))throw new Error(t("无法打开付款页面","Unable to open checkout"));return u.href;}

  function payload(heroImageId){
    const specific=value("industry");
    return {siteId:makeSiteId(),business:{name:value("name"),categoryId:selectedCategory,industry:specific,city:value("location"),contact:value("contact"),description:value("description"),services:value("services"),serviceArea:value("service-area")},assets:{heroImageId},requestPreview:true,clientVersion:"2.0"};
  }

  function startProgress(){
    const stages=language==="zh"?["正在创建网站","正在准备内容","正在组合页面","正在打开预览"]:["Creating your website","Preparing content","Building the page","Opening the preview"];
    let index=0;progressValue=8;byId("progress-bar").style.width=`${progressValue}%`;byId("progress-text").textContent=stages[0];
    progressTimer=setInterval(()=>{progressValue=Math.min(90,progressValue+Math.max(2,Math.round((92-progressValue)*.09)));byId("progress-bar").style.width=`${progressValue}%`;if(progressValue>28)index=1;if(progressValue>52)index=2;if(progressValue>74)index=3;byId("progress-text").textContent=stages[index];},650);
  }
  function stopProgress(){if(progressTimer)clearInterval(progressTimer);progressTimer=null;}
  function waitForFrame(frame,timeout=20000){return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);frame.removeEventListener("load",finish);resolve()};const timer=setTimeout(finish,timeout);frame.addEventListener("load",finish,{once:true})})}

  async function handleGenerate(event){
    event.preventDefault();if(generating)return;const name=value("name");if(!name){byId("name")?.focus();return setMessage("create-message",t("请填写商家名称","Enter a business name"),"error")}
    generating=true;setMessage("create-message");setBusy(byId("generate"),true,t("正在生成…","Creating…"));showView("building-view");startProgress();
    try{
      const heroImageId=await uploadImage();
      const result=await api.generateSite(payload(heroImageId));
      const previewUrl=result.previewUrl||result.url||"";if(!previewUrl||!isAllowedPreview(previewUrl))throw new Error(t("暂时无法显示预览","Preview is unavailable"));
      currentResult={...result,previewUrl};const frame=byId("preview");frame.src=`${previewUrl}${previewUrl.includes("?")?"&":"?"}t=${Date.now()}`;
      byId("progress-bar").style.width="100%";byId("progress-text").textContent=t("网站已经准备好","Your website is ready");
      await waitForFrame(frame);byId("site-url").textContent=previewUrl;byId("share-site").disabled=false;byId("use-site").disabled=!result.siteId;showView("preview-view");
    }catch(error){showView("create-view");setMessage("create-message",error.message||t("暂时无法生成，请稍后重试","Unable to generate. Please try again."),"error")}
    finally{stopProgress();setBusy(byId("generate"),false);generating=false}
  }

  async function checkout(plan){if(checkoutBusy)return;const email=value("checkout-email");if(!email||!currentResult?.siteId)return setMessage("checkout-message",t("请输入邮箱并先生成网站","Enter your email and generate a website first"),"error");checkoutBusy=true;const button=plan==="yearly"?byId("checkout-yearly"):byId("checkout-monthly");setBusy(button,true,t("正在打开…","Opening…"));try{const result=await api.createCheckoutSession({plan,email,siteId:currentResult.siteId,siteName:value("name"),returnUrl:`${String(cfg.siteUrl||location.origin).replace(/\/$/,"")}/`});location.assign(validateStripeUrl(result.url))}catch(error){setMessage("checkout-message",error.message,"error")}finally{setBusy(button,false);checkoutBusy=false}}
  async function openPortal(){if(portalBusy)return;const email=value("billing-email");if(!email)return setMessage("billing-message",t("请输入付款邮箱","Enter your payment email"),"error");portalBusy=true;const button=byId("open-portal");setBusy(button,true,t("正在打开…","Opening…"));try{const result=await api.createPortalSession({email,returnUrl:`${String(cfg.siteUrl||location.origin).replace(/\/$/,"")}/`});location.assign(validateStripeUrl(result.url))}catch(error){setMessage("billing-message",error.message,"error")}finally{setBusy(button,false);portalBusy=false}}

  byId("site-form")?.addEventListener("submit",handleGenerate);
  byId("language-toggle")?.addEventListener("click",()=>{language=language==="zh"?"en":"zh";applyLanguage()});
  byId("more-toggle")?.addEventListener("click",()=>{const box=byId("more-fields");const open=box.hidden;box.hidden=!open;byId("more-toggle").setAttribute("aria-expanded",String(open));byId("more-toggle").querySelector("b").textContent=open?"−":"＋"});
  byId("hero-image")?.addEventListener("change",()=>{const file=byId("hero-image")?.files?.[0];byId("hero-image-state").textContent=file?file.name:t("可选","Optional")});
  byId("edit-site")?.addEventListener("click",()=>showView("create-view"));
  byId("share-site")?.addEventListener("click",async()=>{if(!currentResult?.previewUrl)return;try{if(navigator.share)await navigator.share({title:value("name"),url:currentResult.previewUrl});else{await navigator.clipboard.writeText(currentResult.previewUrl);alert(t("链接已复制","Link copied"))}}catch{}});
  byId("use-site")?.addEventListener("click",()=>byId("upgrade-dialog")?.showModal());
  byId("manage-billing")?.addEventListener("click",()=>byId("billing-dialog")?.showModal());
  byId("checkout-monthly")?.addEventListener("click",()=>checkout("monthly"));byId("checkout-yearly")?.addEventListener("click",()=>checkout("yearly"));byId("open-portal")?.addEventListener("click",openPortal);
  document.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>byId(button.dataset.close)?.close()));
  applyLanguage();
})();
