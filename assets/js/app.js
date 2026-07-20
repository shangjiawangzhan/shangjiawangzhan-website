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
  let currentLang=storage.get('sjw_lang')==='zh'?'zh':'en';
  const create=$('createView'),workspace=$('workspace'),details=$('detailsDialog'),publish=$('publishDialog'),limit=$('limitDialog'),overlay=$('generatingOverlay'),topbar=document.querySelector('.top'),preview=$('preview');

  const copy={
    en:{
      brand:'Business Website',langButton:'中文',manage:'Manage',trial:n=>`${n} free creation${n===1?'':'s'} remaining`,
      hero:'Describe your business.<br>See your website.',placeholder:'Example: A premium custom cabinet company in Los Angeles',addImages:'Add images',selected:n=>`${n} selected`,generate:'Generate',
      suggestions:[['Restaurant','A warm neighborhood restaurant with online reservations'],['Home services','A premium home remodeling and custom cabinetry company'],['Beauty','A refined beauty salon with appointment booking'],['Professional','A trusted professional consulting business'],['Retail','A modern retail store with product highlights']],
      details:'＋ Add business details',restart:'重新开始',addDetails:'添加资料',addPhotos:'添加图片',newDesign:'换一个',share:'分享',publish:'发布',
      loading:['Creating your website…','Adding your business content…','Matching images and layout…','Preparing the final preview…'],
      optional:'Optional',businessDetails:'Business details',businessName:'Business name',industry:'Industry',city:'City / service area',contact:'Phone or email',services:'Services or products',description:'About your business',save:'Save details',
      publishSmall:'Publish',continuePlan:'Continue with a plan',planIntro:'Your preview is ready to share. Subscribe when you want to keep creating, remove the platform badge, and use your own domain.',monthly:'Monthly',yearly:'Yearly',monthlyDesc:'Continue creating and updating your website with independent branding.',yearlyDesc:'The same features with annual savings.',chooseMonthly:'Choose monthly',chooseYearly:'Choose yearly',continuePreview:'Continue with current preview',
      trialComplete:'Free trial complete',continueCreating:'Continue creating',trialUsed:'Your two free website creations have been used. Subscribe to continue creating and updating websites.',
      describeError:'Describe your business or add a business name.',invalidPreview:'Invalid preview URL',previewTimeout:'The website preview took too long to load. Please try again.',generationTimeout:'Website creation timed out. Please try again.',unableCreate:'Unable to create website.',linkCopied:'Link copied',openingCheckout:'Opening secure checkout…',unableCheckout:'Unable to open checkout.',membershipEmail:'Membership email',unableManage:'Unable to open membership management',appStart:'The app could not start. Please refresh and try again.',somethingWrong:'Something went wrong. Please try again.'
    },
    zh:{
      brand:'商家网站',langButton:'English',manage:'会员管理',trial:n=>`还可免费创建 ${n} 次`,
      hero:'描述你的商家，<br>立即生成网站。',placeholder:'例如：洛杉矶一家高端定制橱柜公司',addImages:'添加图片',selected:n=>`已选择 ${n} 张`,generate:'立即生成',
      suggestions:[['餐厅','一家温馨的社区餐厅，支持在线预约'],['家装服务','一家高端住宅改造与定制橱柜公司'],['美容','一家精致的美容沙龙，支持预约服务'],['专业服务','一家值得信赖的专业咨询公司'],['零售','一家现代零售商店，展示重点产品']],
      details:'＋ 添加商家资料',restart:'重新开始',addDetails:'添加资料',addPhotos:'添加图片',newDesign:'换一个',share:'分享',publish:'发布',
      loading:['正在创建网站…','正在整理商家内容…','正在匹配图片与排版…','正在准备最终预览…'],
      optional:'可选',businessDetails:'商家资料',businessName:'商家名称',industry:'行业',city:'城市 / 服务地区',contact:'电话或邮箱',services:'服务或产品',description:'商家介绍',save:'保存资料',
      publishSmall:'发布',continuePlan:'选择订阅方案',planIntro:'你的网站预览已经可以分享。订阅后可继续创建、移除平台标识并使用自己的域名。',monthly:'月付',yearly:'年付',monthlyDesc:'继续创建和更新网站，并使用独立品牌展示。',yearlyDesc:'功能相同，并享受年度优惠。',chooseMonthly:'选择月付',chooseYearly:'选择年付',continuePreview:'继续查看当前预览',
      trialComplete:'免费试用已完成',continueCreating:'继续创建',trialUsed:'你已经使用了两次免费网站创建机会。订阅后可以继续创建和更新网站。',
      describeError:'请描述你的商家，或填写商家名称。',invalidPreview:'无效的预览地址',previewTimeout:'网站预览加载时间过长，请重试。',generationTimeout:'网站创建超时，请重试。',unableCreate:'暂时无法创建网站。',linkCopied:'链接已复制',openingCheckout:'正在打开安全结账页面…',unableCheckout:'暂时无法打开结账页面。',membershipEmail:'请输入会员邮箱',unableManage:'暂时无法打开会员管理。',appStart:'应用启动失败，请刷新后重试。',somethingWrong:'出现问题，请重试。'
    }
  };
  const t=()=>copy[currentLang];
  function setText(selector,value){const el=typeof selector==='string'?document.querySelector(selector):selector;if(el)el.textContent=value}
  function setHtml(selector,value){const el=typeof selector==='string'?document.querySelector(selector):selector;if(el)el.innerHTML=value}
  function applyLanguage(){
    const c=t();document.documentElement.lang=currentLang==='zh'?'zh-CN':'en';storage.set('sjw_lang',currentLang);
    setText('.brand b',c.brand);setText('#langBtn',c.langButton);setText('#manageBtn',c.manage);setHtml('#heroTitle',c.hero);
    $('prompt').placeholder=c.placeholder;setText('#imageLabel',c.addImages);setText('#generateBtn span',c.generate);setText('#detailsBtn',c.details);
    const suggestionButtons=[...document.querySelectorAll('[data-prompt]')];
    suggestionButtons.forEach((b,i)=>{const item=c.suggestions[i];if(item){b.textContent=item[0];b.dataset.prompt=item[1]}});
    setText('#backBtn span',c.restart);setText('#editBtn span',c.addDetails);setText('#addPhotosBtn span',c.addPhotos);setText('#newDesignBtn span',c.newDesign);setText('#shareBtn span',c.share);setText('#publishBtn',c.publish);
    const detailSmall=details?.querySelector('header small'),detailH2=details?.querySelector('header h2');setText(detailSmall,c.optional);setText(detailH2,c.businessDetails);
    const labels=details?[...details.querySelectorAll('.fields label')]:[];[c.businessName,c.industry,c.city,c.contact,c.services,c.description].forEach((v,i)=>{if(labels[i])labels[i].childNodes[0].nodeValue=v});
    setText(details?.querySelector('.save'),c.save);
    setText(publish?.querySelector('header small'),c.publishSmall);setText(publish?.querySelector('header h2'),c.continuePlan);setText(publish?.querySelector('.plan-intro'),c.planIntro);
    const planArticles=publish?[...publish.querySelectorAll('.plans article')]:[];
    if(planArticles[0]){setText(planArticles[0].querySelector('span'),c.monthly);setText(planArticles[0].querySelector('p'),c.monthlyDesc)}
    if(planArticles[1]){setText(planArticles[1].querySelector('span'),c.yearly);setText(planArticles[1].querySelector('p'),c.yearlyDesc)}
    setText('#monthlyBtn',c.chooseMonthly);setText('#yearlyBtn',c.chooseYearly);setText('#continuePreviewBtn',c.continuePreview);
    setText(limit?.querySelector('header small'),c.trialComplete);setText(limit?.querySelector('header h2'),c.continueCreating);setText(limit?.querySelector('.limit-sheet>p'),c.trialUsed);
    text('trialText',c.trial(trialRemaining));if(files.length)text('imageCount',c.selected(files.length));
  }

  function makeSiteId(){return uid('sjw_').slice(0,20)}
  function show(view){[create,workspace].forEach(v=>v.hidden=v!==view);const inWorkspace=view===workspace;document.body.classList.toggle('preview-mode',inWorkspace);if(topbar)topbar.hidden=inWorkspace}
  function text(id,v){const el=$(id);if(el)el.textContent=v}
  function validUrl(value,kind='preview'){
    const u=new URL(value);if(u.protocol!=='https:')throw Error('Invalid URL');
    if(kind==='preview'&&!((u.hostname==='api.shangjiawangzhan.com')||u.hostname.endsWith('.shangjiawangzhan.com')))throw Error(t().invalidPreview);
    if(kind==='stripe'&&!['checkout.stripe.com','billing.stripe.com'].includes(u.hostname))throw Error('Invalid payment URL');return u.href;
  }
  async function refreshTrial(){try{const r=await SJW_API.trial();trialRemaining=Number.isFinite(r.remaining)?r.remaining:trialRemaining;text('trialText',t().trial(trialRemaining))}catch{}}
  function selectedFiles(list){return [...list].filter(f=>['image/jpeg','image/png','image/webp'].includes(f.type)&&f.size<=8*1024*1024).slice(0,6)}

  $('images').addEventListener('change',e=>{files=selectedFiles(e.target.files);text('imageCount',files.length?t().selected(files.length):'')});
  document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{$('prompt').value=b.dataset.prompt;$('prompt').focus()});
  $('detailsBtn').onclick=()=>details.showModal();
  $('langBtn').onclick=()=>{currentLang=currentLang==='zh'?'en':'zh';applyLanguage()};

  async function uploadAll(){const ids=[];for(const file of files){const r=await SJW_API.upload(file);ids.push(r.assetId)}return ids}
  function startProgress(){let p=8,seconds=0,i=0;const lines=t().loading;overlay.hidden=false;text('loadingText',lines[0]);text('elapsedText','0s');$('progress').style.width='8%';const timer=setInterval(()=>{seconds++;text('elapsedText',`${seconds}s`);p=Math.min(90,p+(seconds<5?8:seconds<12?4:1.5));$('progress').style.width=`${p}%`;if(i<lines.length-1&&seconds>=[3,7,13][i]){i++;text('loadingText',lines[i])}},1000);return success=>{clearInterval(timer);$('progress').style.width=success?'100%':`${p}%`;if(success)setTimeout(()=>{overlay.hidden=true},240)}}
  function clearPreviewTimer(){if(previewTimer){clearTimeout(previewTimer);previewTimer=null}}
  function payloadFromForm(imageIds){return {siteId,prompt:$('prompt').value.trim(),business:{name:$('businessName').value.trim(),industry:$('industry').value.trim(),city:$('city').value.trim(),contact:$('contact').value.trim(),services:$('services').value.trim(),description:$('description').value.trim(),language:currentLang},assets:{heroImageId:imageIds[0]||'',imageIds}}}
  async function generateWebsite(){
    if(busy)return;const promptValue=$('prompt').value.trim(),name=$('businessName').value.trim();
    if(!promptValue&&!name){show(create);text('message',t().describeError);$('prompt').focus();return}
    if(trialRemaining<=0){limit.showModal();return}
    busy=true;$('generateBtn').disabled=true;text('message','');show(workspace);preview.onload=null;preview.removeAttribute('src');clearPreviewTimer();const done=startProgress();
    try{if(!siteId)siteId=makeSiteId();const imageIds=await uploadAll();const r=await SJW_API.generate(payloadFromForm(imageIds));previewUrl=validUrl(r.previewUrl);storage.set('sjw_site_id',siteId);let completed=false;const finish=()=>{if(completed)return;completed=true;clearPreviewTimer();done(true);refreshTrial()};preview.onload=finish;previewTimer=setTimeout(()=>{if(completed)return;completed=true;done(false);overlay.hidden=true;busy=false;$('generateBtn').disabled=false;alert(t().previewTimeout);show(create)},30000);preview.src=previewUrl}
    catch(err){clearPreviewTimer();done(false);overlay.hidden=true;show(create);if(err.code==='TRIAL_LIMIT')limit.showModal();else text('message',err.name==='AbortError'?t().generationTimeout:(err.message||t().unableCreate))}
    finally{busy=false;$('generateBtn').disabled=false}
  }

  $('createForm').addEventListener('submit',e=>{e.preventDefault();generateWebsite()});$('backBtn').onclick=()=>{show(create);$('prompt').focus()};$('editBtn').onclick=()=>details.showModal();$('addPhotosBtn').onclick=()=>$('workspaceImages').click();$('workspaceImages').addEventListener('change',async e=>{files=selectedFiles(e.target.files);if(files.length){text('imageCount',t().selected(files.length));await generateWebsite()}});$('newDesignBtn').onclick=()=>generateWebsite();
  $('shareBtn').onclick=async()=>{if(!previewUrl)return;try{if(navigator.share)await navigator.share({title:$('businessName').value.trim()||t().brand,url:previewUrl});else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(previewUrl);alert(t().linkCopied)}else window.prompt(currentLang==='zh'?'复制此链接':'Copy this link',previewUrl)}catch(e){if(e&&e.name!=='AbortError')window.prompt(currentLang==='zh'?'复制此链接':'Copy this link',previewUrl)}};
  $('publishBtn').onclick=()=>publish.showModal();$('continuePreviewBtn').onclick=()=>{publish.close();if(previewUrl)window.open(previewUrl,'_blank','noopener')};
  async function pay(plan,msgEl){if(busy)return;busy=true;const buttons=['monthlyBtn','yearlyBtn','limitMonthly','limitYearly'].map($).filter(Boolean);buttons.forEach(b=>b.disabled=true);text(msgEl,t().openingCheckout);try{if(!siteId)siteId=makeSiteId();const r=await SJW_API.checkout({plan,email:'',siteId,siteName:$('businessName').value.trim()||t().brand,returnUrl:cfg.siteUrl});location.href=validUrl(r.url,'stripe')}catch(e){text(msgEl,e.message||t().unableCheckout);busy=false;buttons.forEach(b=>b.disabled=false)}}
  $('monthlyBtn').onclick=()=>pay('monthly','publishMessage');$('yearlyBtn').onclick=()=>pay('yearly','publishMessage');$('limitMonthly').onclick=()=>pay('monthly','limitMessage');$('limitYearly').onclick=()=>pay('yearly','limitMessage');
  $('manageBtn').onclick=async()=>{const email=window.prompt(t().membershipEmail);if(!email)return;try{const r=await SJW_API.portal({email,returnUrl:cfg.siteUrl});location.href=validUrl(r.url,'stripe')}catch(e){alert(e.message||t().unableManage)}};

  applyLanguage();refreshTrial();
  window.addEventListener('error',()=>{try{clearPreviewTimer();show(create);text('message',t().appStart)}catch{}});window.addEventListener('unhandledrejection',()=>{try{if(!busy)text('message',t().somethingWrong)}catch{}});
})();
