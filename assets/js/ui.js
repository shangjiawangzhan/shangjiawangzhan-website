(() => {
  "use strict";
  const cfg = window.SJW_CONFIG || {};
  const byId = id => document.getElementById(id);
  function setMessage(id, message = "", type = "") { const el=byId(id); if(!el)return; el.textContent=message; el.dataset.type=type; }
  function setBusy(button,busy,busyText){ if(!button)return; if(busy){ if(!button.dataset.originalText)button.dataset.originalText=button.textContent; button.textContent=busyText||"处理中…"; button.disabled=true;} else {button.textContent=button.dataset.originalText||button.textContent; button.disabled=false;} }
  function showPreviewLoading(show){const l=byId("preview-loading"),f=byId("preview");if(l)l.hidden=!show;if(f)f.style.visibility=show?"hidden":"visible";}
  function isAllowedPreviewUrl(value){ try { const u=new URL(value); if(u.protocol!=="https:") return false; const allowed=cfg.allowedPreviewHosts||[]; return allowed.some(h=>u.hostname===h||u.hostname.endsWith(`.${h}`)); } catch(_){ return false; } }
  function showPreview(result){const w=byId("preview-wrap"),f=byId("preview"),url=result.previewUrl||result.url||"";if(!w||!f)return;if(!isAllowedPreviewUrl(url))throw new Error("服务器返回了无效的预览地址");w.hidden=false;f.removeAttribute("srcdoc");f.src=url;byId("site-url").textContent=url;byId("share-site").disabled=false;byId("use-site").disabled=!result.siteId;requestAnimationFrame(()=>w.scrollIntoView({behavior:"smooth",block:"start"}));}
  function updateUploadState(inputId,stateId,maxCount=1){const i=byId(inputId),s=byId(stateId);if(!i||!s)return;const files=[...(i.files||[])];s.textContent=!files.length?"未选择":maxCount===1?files[0].name:`已选择 ${Math.min(files.length,maxCount)} 张`;}
  function openDialog(id){const d=byId(id);if(d&&typeof d.showModal==="function")d.showModal();}
  function closeDialog(id){const d=byId(id);if(d&&typeof d.close==="function")d.close();}
  window.SJW_UI=Object.freeze({byId,setMessage,setBusy,showPreviewLoading,showPreview,updateUploadState,openDialog,closeDialog,isAllowedPreviewUrl});
})();
