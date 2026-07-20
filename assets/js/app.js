(()=>{
  const $=id=>document.getElementById(id),cfg=window.SJW_CONFIG;
  const storage={
    get(key){try{return window.localStorage?localStorage.getItem(key):null}catch{return null}},
    set(key,value){try{if(window.localStorage)localStorage.setItem(key,value)}catch{}},
    remove(key){try{if(window.localStorage)localStorage.removeItem(key)}catch{}}
  };
  function uid(prefix='id_'){
    try{if(window.crypto&&typeof window.crypto.randomUUID==='function')return prefix+window.crypto.randomUUID().split('-').join('')}catch{}
    const bytes=new Uint8Array(16);
    try{window.crypto.getRandomValues(bytes)}catch{for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256)}
    return prefix+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  }
  let id=storage.get('sjw_client_id')||'';
  if(!id){id=uid('client_');storage.set('sjw_client_id',id)}
  window.SJW_CLIENT_ID=id;

  let siteId=storage.get('sjw_site_id')||'',previewUrl='',busy=false,files=[],trialRemaining=2,previewTimer=null;
  const create=$('createView'),workspace=$('workspace'),details=$('detailsDialog'),publish=$('publishDialog'),limit=$('limitDialog'),overlay=$('generatingOverlay'),topbar=document.querySelector('.top'),preview=$('preview');

  function makeSiteId(){return uid('sjw_').slice(0,20)}
  function show(view){[create,workspace].forEach(v=>v.hidden=v!==view);const inWorkspace=view===workspace;document.body.classList.toggle('preview-mode',inWorkspace);if(topbar)topbar.hidden=inWorkspace}
  function text(id,v){const el=$(id);if(el)el.textContent=v}
  function validUrl(value,kind='preview'){
    const u=new URL(value);
    if(u.protocol!=='https:')throw Error('Invalid URL');
    if(kind==='preview'&&!((u.hostname==='api.shangjiawangzhan.com')||u.hostname.endsWith('.shangjiawangzhan.com')))throw Error('Invalid preview URL');
    if(kind==='stripe'&&!['checkout.stripe.com','billing.stripe.com'].includes(u.hostname))throw Error('Invalid payment URL');
    return u.href;
  }
  async function refreshTrial(){try{const t=await SJW_API.trial();trialRemaining=Number.isFinite(t.remaining)?t.remaining:trialRemaining;text('trialText',`${trialRemaining} free creation${trialRemaining===1?'':'s'} remaining`)}catch{}}
  function selectedFiles(list){return [...list].filter(f=>['image/jpeg','image/png','image/webp'].includes(f.type)&&f.size<=8*1024*1024).slice(0,6)}

  $('images').addEventListener('change',e=>{files=selectedFiles(e.target.files);text('imageCount',files.length?`${files.length} selected`:'')});
  document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{$('prompt').value=b.dataset.prompt;$('prompt').focus()});
  $('detailsBtn').onclick=()=>details.showModal();
  $('langBtn').onclick=()=>{document.documentElement.lang=document.documentElement.lang==='zh-CN'?'en':'zh-CN';$('langBtn').textContent=document.documentElement.lang==='zh-CN'?'English':'中文'};

  async function uploadAll(){const ids=[];for(const file of files){const r=await SJW_API.upload(file);ids.push(r.assetId)}return ids}
  function startProgress(){
    let p=8,seconds=0,i=0;
    const lines=['Creating your website…','Adding your business content…','Matching images and layout…','Preparing the final preview…'];
    overlay.hidden=false;text('loadingText',lines[0]);text('elapsedText','0s');$('progress').style.width='8%';
    const timer=setInterval(()=>{seconds++;text('elapsedText',`${seconds}s`);p=Math.min(90,p+(seconds<5?8:seconds<12?4:1.5));$('progress').style.width=`${p}%`;if(i<lines.length-1&&seconds>=[3,7,13][i]){i++;text('loadingText',lines[i])}},1000);
    return success=>{clearInterval(timer);$('progress').style.width=success?'100%':`${p}%`;if(success)setTimeout(()=>{overlay.hidden=true},240)};
  }
  function clearPreviewTimer(){if(previewTimer){clearTimeout(previewTimer);previewTimer=null}}
  function payloadFromForm(imageIds){
    return {siteId,prompt:$('prompt').value.trim(),business:{name:$('businessName').value.trim(),industry:$('industry').value.trim(),city:$('city').value.trim(),contact:$('contact').value.trim(),services:$('services').value.trim(),description:$('description').value.trim(),language:document.documentElement.lang==='zh-CN'?'zh':'en'},assets:{heroImageId:imageIds[0]||'',imageIds}};
  }
  async function generateWebsite(){
    if(busy)return;
    const promptValue=$('prompt').value.trim(),name=$('businessName').value.trim();
    if(!promptValue&&!name){show(create);text('message','Describe your business or add a business name.');$('prompt').focus();return}
    if(trialRemaining<=0){limit.showModal();return}
    busy=true;$('generateBtn').disabled=true;text('message','');show(workspace);preview.onload=null;preview.removeAttribute('src');clearPreviewTimer();
    const done=startProgress();
    try{
      if(!siteId)siteId=makeSiteId();
      const imageIds=await uploadAll();
      const r=await SJW_API.generate(payloadFromForm(imageIds));
      previewUrl=validUrl(r.previewUrl);storage.set('sjw_site_id',siteId);
      let completed=false;
      const finish=()=>{if(completed)return;completed=true;clearPreviewTimer();done(true);refreshTrial()};
      preview.onload=finish;
      previewTimer=setTimeout(()=>{
        if(completed)return;
        completed=true;done(false);overlay.hidden=true;busy=false;$('generateBtn').disabled=false;
        alert('The website preview took too long to load. Please try again.');show(create);
      },30000);
      preview.src=previewUrl;
    }catch(err){
      clearPreviewTimer();done(false);overlay.hidden=true;show(create);
      if(err.code==='TRIAL_LIMIT')limit.showModal();
      else text('message',err.name==='AbortError'?'Website creation timed out. Please try again.':(err.message||'Unable to create website.'));
    }finally{busy=false;$('generateBtn').disabled=false}
  }

  $('createForm').addEventListener('submit',e=>{e.preventDefault();generateWebsite()});
  $('backBtn').onclick=()=>{show(create);$('prompt').focus()};
  $('editBtn').onclick=()=>details.showModal();
  $('addPhotosBtn').onclick=()=>$('workspaceImages').click();
  $('workspaceImages').addEventListener('change',async e=>{
    files=selectedFiles(e.target.files);
    if(files.length){text('imageCount',`${files.length} selected`);await generateWebsite()}
  });
  $('newDesignBtn').onclick=()=>generateWebsite();
  $('shareBtn').onclick=async()=>{
    if(!previewUrl)return;
    try{
      if(navigator.share)await navigator.share({title:$('businessName').value.trim()||'Business Website',url:previewUrl});
      else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(previewUrl);alert('Link copied')}
      else window.prompt('Copy this link',previewUrl);
    }catch(e){if(e&&e.name!=='AbortError')window.prompt('Copy this link',previewUrl)}
  };
  $('publishBtn').onclick=()=>publish.showModal();
  $('continuePreviewBtn').onclick=()=>{publish.close();if(previewUrl)window.open(previewUrl,'_blank','noopener')};

  async function pay(plan,msgEl){
    if(busy)return;busy=true;
    const buttons=['monthlyBtn','yearlyBtn','limitMonthly','limitYearly'].map($).filter(Boolean);buttons.forEach(b=>b.disabled=true);text(msgEl,'Opening secure checkout…');
    try{if(!siteId)siteId=makeSiteId();const r=await SJW_API.checkout({plan,email:'',siteId,siteName:$('businessName').value.trim()||'Business Website',returnUrl:cfg.siteUrl});location.href=validUrl(r.url,'stripe')}
    catch(e){text(msgEl,e.message||'Unable to open checkout.');busy=false;buttons.forEach(b=>b.disabled=false)}
  }
  $('monthlyBtn').onclick=()=>pay('monthly','publishMessage');$('yearlyBtn').onclick=()=>pay('yearly','publishMessage');$('limitMonthly').onclick=()=>pay('monthly','limitMessage');$('limitYearly').onclick=()=>pay('yearly','limitMessage');
  $('manageBtn').onclick=async()=>{const email=window.prompt('Membership email');if(!email)return;try{const r=await SJW_API.portal({email,returnUrl:cfg.siteUrl});location.href=validUrl(r.url,'stripe')}catch(e){alert(e.message||'Unable to open membership management')}};

  refreshTrial();
  window.addEventListener('error',()=>{try{clearPreviewTimer();show(create);text('message','The app could not start. Please refresh and try again.')}catch{}});
  window.addEventListener('unhandledrejection',()=>{try{if(!busy)text('message','Something went wrong. Please try again.')}catch{}});
})();
