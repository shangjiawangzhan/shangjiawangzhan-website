(() => {
  const $ = (id) => document.getElementById(id);
  const cfg = window.SJW_CONFIG;
  const api = window.SJW_API;
  const state = { lang: 'en', siteId: '', previewUrl: '', siteName: '', busy: false, files: [] };
  const copy = {
    en:{manage:'Manage',eyebrow:'Create your business website',title:'Describe your business.<br>See your website.',lead:'A name and a short description are enough to begin.',promptPlaceholder:'Example: A modern website for a Los Angeles custom cabinet company',images:'Images',details:'Add business details',businessName:'Business name',industry:'Industry',city:'City / service area',contact:'Phone or email',services:'Services or products',about:'About your business',generate:'Generate website',creating:'Creating your website',edit:'Edit',share:'Share',publish:'Publish',choosePlan:'Choose how to publish'},
    zh:{manage:'会员管理',eyebrow:'创建你的商家网站',title:'说出你的业务。<br>立即看到网站。',lead:'商家名称和一句描述就可以开始。',promptPlaceholder:'例如：为洛杉矶一家定制橱柜公司创建高级现代网站',images:'图片',details:'添加商家资料',businessName:'商家名称',industry:'行业',city:'城市 / 服务地区',contact:'电话或邮箱',services:'服务或产品',about:'商家介绍',generate:'立即生成网站',creating:'正在创建网站',edit:'修改',share:'分享',publish:'发布',choosePlan:'选择发布方式'}
  };
  function setLang(lang){ state.lang=lang; document.documentElement.lang=lang==='zh'?'zh-CN':'en'; document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(copy[lang][key]) el.innerHTML=copy[lang][key]}); document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{el.placeholder=copy[lang][el.dataset.i18nPlaceholder]||''}); $('languageBtn').textContent=lang==='en'?'中文':'English'; }
  function id(){ return `sjw_${crypto.getRandomValues(new Uint32Array(4)).reduce((s,n)=>s+n.toString(36),'').slice(0,24)}`; }
  function show(name){ ['createView','workspace','loadingView'].forEach(x=>$(x).hidden=x!==name); }
  function message(text=''){ $('formMessage').textContent=text; }
  function inferName(prompt){ const line=String(prompt||'').trim().split(/[.!?。！？\n]/)[0]; return line.slice(0,60)||'Business Website'; }
  async function uploadFiles(){ const ids=[]; for(const file of state.files.slice(0,6)){ const result=await api.upload(file); if(result.assetId) ids.push(result.assetId); } return ids; }
  async function generate(){
    if(state.busy)return; const prompt=$('promptInput').value.trim(); const name=$('businessName').value.trim()||inferName(prompt); if(!prompt&&!name){message(state.lang==='zh'?'请输入商家名称或简单描述。':'Enter a business name or short description.');return;}
    state.busy=true; message(''); show('loadingView'); let progress=12; $('progressBar').style.width=`${progress}%`; const texts=state.lang==='zh'?['理解商家需求…','整理页面内容…','匹配视觉风格…','生成网站预览…']:['Understanding your business…','Shaping the content…','Matching the visual direction…','Preparing your preview…']; let i=0; $('loadingText').textContent=texts[0]; const timer=setInterval(()=>{progress=Math.min(progress+Math.random()*12,88);$('progressBar').style.width=`${progress}%`;i=Math.min(i+1,texts.length-1);$('loadingText').textContent=texts[i]},900);
    try{
      const assetIds=await uploadFiles(); state.siteId=id(); state.siteName=name;
      const payload={siteId:state.siteId,prompt,business:{name,industry:$('industry').value.trim(),city:$('city').value.trim(),contact:$('contact').value.trim(),description:$('description').value.trim(),services:$('services').value.trim(),language:state.lang},assets:{imageIds:assetIds,heroImageId:assetIds[0]||''}};
      const result=await api.generate(payload); state.previewUrl=result.previewUrl||result.url; if(!state.previewUrl)throw new Error('Preview unavailable'); clearInterval(timer);$('progressBar').style.width='100%'; $('workspaceName').textContent=state.siteName; $('previewAddress').textContent=state.previewUrl; $('previewFrame').src=state.previewUrl; setTimeout(()=>show('workspace'),500);
    }catch(error){clearInterval(timer);show('createView');message(error.name==='AbortError'?'Request timed out. Please try again.':error.message||'Unable to generate website.');}finally{state.busy=false;}
  }
  async function checkout(plan){ const email=$('billingEmail').value.trim(); if(!email){$('dialogMessage').textContent='Enter your email.';return;} try{ const result=await api.checkout({plan,email,siteId:state.siteId,siteName:state.siteName,returnUrl:cfg.siteUrl}); const url=new URL(result.url); if(!['checkout.stripe.com','billing.stripe.com'].includes(url.hostname))throw new Error('Invalid payment link'); location.href=url.href; }catch(e){$('dialogMessage').textContent=e.message;}}
  $('createForm').addEventListener('submit',e=>{e.preventDefault();generate()});
  $('detailsToggle').addEventListener('click',()=>{const open=$('detailsPanel').hidden;$('detailsPanel').hidden=!open;$('detailsToggle').setAttribute('aria-expanded',String(open))});
  document.querySelectorAll('.chips button').forEach(btn=>btn.addEventListener('click',()=>{$('promptInput').value=btn.dataset.prompt;$('promptInput').focus()}));
  $('imageInput').addEventListener('change',e=>{state.files=[...e.target.files].filter(f=>['image/jpeg','image/png','image/webp'].includes(f.type)&&f.size<=8*1024*1024).slice(0,6);$('imageCount').textContent=state.files.length?`${state.files.length} selected`:''});
  $('languageBtn').addEventListener('click',()=>setLang(state.lang==='en'?'zh':'en'));
  $('backBtn').addEventListener('click',()=>show('createView')); $('editBtn').addEventListener('click',()=>show('createView'));
  $('shareBtn').addEventListener('click',async()=>{if(!state.previewUrl)return;try{if(navigator.share)await navigator.share({title:state.siteName,url:state.previewUrl});else{await navigator.clipboard.writeText(state.previewUrl);$('workspaceStatus').textContent='Link copied';}}catch{}});
  $('publishBtn').addEventListener('click',()=>$('publishDialog').showModal()); $('freePublishBtn').addEventListener('click',()=>{window.open(state.previewUrl,'_blank','noopener');$('publishDialog').close()}); $('monthlyBtn').addEventListener('click',()=>checkout('monthly')); $('yearlyBtn').addEventListener('click',()=>checkout('yearly'));
  document.querySelectorAll('[data-device]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-device]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('browserFrame').className=`browser-frame ${btn.dataset.device}`}));
  $('manageBtn').addEventListener('click',async()=>{const email=prompt(state.lang==='zh'?'请输入会员邮箱':'Enter membership email');if(!email)return;try{const result=await api.portal({email,returnUrl:cfg.siteUrl});location.href=result.url}catch(e){alert(e.message)}});
  const qs=new URLSearchParams(location.search); if(qs.get('checkout')==='success') $('formMessage').textContent='Membership activated.'; setLang('en');
})();
