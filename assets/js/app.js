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
  const extended={
    en:{
      detailsSmall:'Business information',detailsTitle:'Improve local visibility',
      businessName:'Business name',industry:'Industry',city:'Primary city',state:'State / region',country:'Country',
      phone:'Phone',email:'Email',hours:'Business hours',serviceAreas:'Service areas',services:'Services or products',
      description:'About your business',trust:'Verified trust information',physical:'Show a physical business address',
      address:'Business address',profiles:'Official profiles (optional)',save:'Save details',
      note:'Only publish information the business has confirmed. The platform does not invent licenses, ratings, years in business, prices or guarantees.',
      account:'Account',signIn:'Sign in',google:'Continue with Google',or:'or',magicEmail:'Email',
      magicButton:'Send sign-in link',magicPrivacy:'No password is required. A secure sign-in link will be sent to your email.',
      linkSent:'Check your email and open the secure sign-in link.',accountLabel:'Account',sites:'My websites',
      notifications:'Notifications',subscription:'Manage subscription',device:'Enable device notifications',signOut:'Sign out',
      loginRequired:'Sign in before choosing a paid plan.',authUnavailable:'Sign-in is not configured yet.'
    },
    zh:{
      detailsSmall:'商家资料',detailsTitle:'完善本地商家信息',
      businessName:'商家名称',industry:'所属行业',city:'主要城市',state:'州 / 地区',country:'国家',
      phone:'联系电话',email:'电子邮箱',hours:'营业时间',serviceAreas:'服务区域',services:'产品或服务',
      description:'商家介绍',trust:'已确认的信任信息',physical:'显示实体经营地址',
      address:'经营地址',profiles:'官方资料链接（可选）',save:'保存资料',
      note:'只发布商家已经确认的信息。平台不会自动编造执照、评分、经营年限、价格或保证。',
      account:'账户',signIn:'登录',google:'使用 Google 继续',or:'或者',magicEmail:'电子邮箱',
      magicButton:'发送登录链接',magicPrivacy:'无需设置密码。系统会向你的邮箱发送安全登录链接。',
      linkSent:'请查看邮箱并打开安全登录链接。',accountLabel:'账户',sites:'我的网站',
      notifications:'通知',subscription:'管理订阅',device:'开启设备通知',signOut:'退出登录',
      loginRequired:'选择付费方案前请先登录。',authUnavailable:'登录功能尚未完成配置。'
    }
  };
  const t=()=>copy[currentLang];
  const x=()=>extended[currentLang];
  function setText(selector,value){const el=typeof selector==='string'?document.querySelector(selector):selector;if(el)el.textContent=value}
  function setHtml(selector,value){const el=typeof selector==='string'?document.querySelector(selector):selector;if(el)el.innerHTML=value}
  function applyLanguage(){
    const c=t();document.documentElement.lang=currentLang==='zh'?'zh-CN':'en';storage.set('sjw_lang',currentLang);
    setText('.brand b',c.brand);setText('#langBtn',c.langButton);setText('#manageBtn',c.manage);setHtml('#heroTitle',c.hero);
    $('prompt').placeholder=c.placeholder;setText('#imageLabel',c.addImages);setText('#generateBtn span',c.generate);setText('#detailsBtn',c.details);
    const suggestionButtons=[...document.querySelectorAll('[data-prompt]')];
    suggestionButtons.forEach((b,i)=>{const item=c.suggestions[i];if(item){b.textContent=item[0];b.dataset.prompt=item[1]}});
    setText('#backBtn',currentLang==='zh'?'重新开始':'Start over');setText('#previewBtn span',currentLang==='zh'?'预览网站':'Preview website');setText('#shareBtn',currentLang==='zh'?'分享网站':'Share website');setText('#siteManageBtn',currentLang==='zh'?'管理网站':'Manage website');setText('#publishBtn',currentLang==='zh'?'发布网站':'Publish website');setText('#workspaceMenuSmall',currentLang==='zh'?'网站':'Website');setText('#workspaceMenuTitle',currentLang==='zh'?'更多操作':'More actions');
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
    const z=x();
    const pairs={
      detailsSmall:z.detailsSmall,detailsTitle:z.detailsTitle,labelBusinessName:z.businessName,labelIndustry:z.industry,
      labelCity:z.city,labelState:z.state,labelCountry:z.country,labelPhone:z.phone,labelEmail:z.email,labelHours:z.hours,
      labelServiceAreas:z.serviceAreas,labelServices:z.services,labelDescription:z.description,labelTrust:z.trust,
      labelPhysical:z.physical,labelAddress:z.address,labelProfiles:z.profiles,saveDetailsBtn:z.save,detailsNote:z.note,
      accountSmall:z.account,accountTitle:z.signIn,googleLoginText:z.google,authOrText:z.or,magicEmailLabel:z.magicEmail,
      magicLinkBtn:z.magicButton,authPrivacyText:z.magicPrivacy,mySitesBtn:z.sites,notificationsBtn:z.notifications,
      manageSubscriptionBtn:z.subscription,restoreSubscriptionBtn:currentLang==='zh'?'恢复订阅':'Restore subscription',exportAccountBtn:currentLang==='zh'?'导出我的数据':'Export my data',deleteAccountBtn:currentLang==='zh'?'删除账户':'Delete account',enableNotificationsBtn:z.device,logoutBtn:z.signOut
    };
    Object.entries(pairs).forEach(([id,value])=>setText('#'+id,value));
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
  $('detailsBtn').onclick=()=>details.showModal(); $('physicalLocation').onchange=()=>{$('addressLabel').hidden=!$('physicalLocation').checked};
  $('langBtn').onclick=()=>{currentLang=currentLang==='zh'?'en':'zh';applyLanguage()};

  async function uploadAll(){const ids=[];for(const file of files){const r=await SJW_API.upload(file);ids.push(r.assetId)}return ids}
  function startProgress(){let p=8,seconds=0,i=0;const lines=t().loading;overlay.hidden=false;text('loadingText',lines[0]);text('elapsedText','0s');$('progress').style.width='8%';const timer=setInterval(()=>{seconds++;text('elapsedText',`${seconds}s`);p=Math.min(90,p+(seconds<5?8:seconds<12?4:1.5));$('progress').style.width=`${p}%`;if(i<lines.length-1&&seconds>=[3,7,13][i]){i++;text('loadingText',lines[i])}},1000);return success=>{clearInterval(timer);$('progress').style.width=success?'100%':`${p}%`;if(success)setTimeout(()=>{overlay.hidden=true},240)}}
  function clearPreviewTimer(){if(previewTimer){clearTimeout(previewTimer);previewTimer=null}}
  function payloadFromForm(imageIds){return {siteId,prompt:$('prompt').value.trim(),business:{
    name:$('businessName').value.trim(),industry:$('industry').value.trim(),city:$('city').value.trim(),
    state:$('state').value.trim(),country:$('country').value.trim(),serviceAreas:$('serviceAreas').value.trim(),
    phone:$('phone').value.trim(),email:$('email').value.trim(),hours:$('hours').value.trim(),
    services:$('services').value.trim(),description:$('description').value.trim(),trust:$('trust').value.trim(),
    physicalLocation:$('physicalLocation').checked,address:$('address').value.trim(),sameAs:$('sameAs').value.trim(),
    language:currentLang},assets:{heroImageId:imageIds[0]||'',imageIds}}}
  async function generateWebsite(){
    if(busy)return;const promptValue=$('prompt').value.trim(),name=$('businessName').value.trim();
    if(!promptValue&&!name){show(create);text('message',t().describeError);$('prompt').focus();return} if(!name){$('businessName').value=currentLang==='zh'?'我的商家':'My Business'}
    if(trialRemaining<=0){limit.showModal();return}
    busy=true;$('generateBtn').disabled=true;text('message','');show(workspace);preview.onload=null;preview.removeAttribute('src');clearPreviewTimer();const done=startProgress();
    try{if(!siteId)siteId=makeSiteId();const imageIds=await uploadAll();const r=await SJW_API.generate(payloadFromForm(imageIds));previewUrl=validUrl(r.previewUrl);storage.set('sjw_site_id',siteId);let completed=false;const finish=()=>{if(completed)return;completed=true;clearPreviewTimer();done(true);refreshTrial()};preview.onload=finish;previewTimer=setTimeout(()=>{if(completed)return;completed=true;done(false);overlay.hidden=true;busy=false;$('generateBtn').disabled=false;alert(t().previewTimeout);show(create)},30000);preview.src=previewUrl}
    catch(err){clearPreviewTimer();done(false);overlay.hidden=true;show(create);if(err.code==='SIGN_IN_REQUIRED_FOR_SECOND_GENERATION'){show(create);accountDialog.showModal();text('authMessage',currentLang==='zh'?'请使用 Google 或邮箱安全链接登录，然后继续第二次免费生成。':'Continue with Google or a secure email link to use your second free generation.')}else if(err.code==='TRIAL_LIMIT')limit.showModal();else text('message',err.name==='AbortError'?t().generationTimeout:(err.message||t().unableCreate))}
    finally{busy=false;$('generateBtn').disabled=false}
  }

  $('createForm').addEventListener('submit',e=>{e.preventDefault();generateWebsite()});
  const workspaceMenuDialog=$('workspaceMenuDialog');
  $('workspaceMenuBtn').onclick=()=>workspaceMenuDialog.showModal();
  $('backBtn').onclick=()=>{workspaceMenuDialog.close();show(create);$('prompt').focus()};
  $('previewBtn').onclick=()=>{if(previewUrl)window.open(previewUrl,'_blank','noopener')};
  $('siteManageBtn').onclick=()=>{workspaceMenuDialog.close();$('siteManageDialog').showModal()};
  $('workspaceImages').addEventListener('change',async e=>{files=selectedFiles(e.target.files);if(files.length){text('imageCount',t().selected(files.length));await generateWebsite()}});
  $('saveDetailsBtn').addEventListener('click',async e=>{e.preventDefault();details.close();if(previewUrl||siteId)await generateWebsite()});
  $('shareBtn').onclick=async()=>{workspaceMenuDialog.close();if(!previewUrl)return;try{if(navigator.share)await navigator.share({title:$('businessName').value.trim()||t().brand,url:previewUrl});else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(previewUrl);alert(t().linkCopied)}else window.prompt(currentLang==='zh'?'复制此链接':'Copy this link',previewUrl)}catch(e){if(e&&e.name!=='AbortError')window.prompt(currentLang==='zh'?'复制此链接':'Copy this link',previewUrl)}};
  $('publishBtn').onclick=async()=>{
    const user=await refreshAccount(false);
    if(!user){accountDialog.showModal();text('authMessage',x().loginRequired);return}
    try{
      const status=await SJW_API.subscriptionStatus();
      if(status.active){
        const r=await SJW_API.publishSite(siteId);
        previewUrl=r?.data?.url||previewUrl;
        $('publishBtn').textContent=currentLang==='zh'?'已发布':'Published';
        alert(currentLang==='zh'?'网站已发布。':'Website published.');
        return;
      }
    }catch{}
    publish.showModal();
  };$('continuePreviewBtn').onclick=()=>{publish.close();if(previewUrl)window.open(previewUrl,'_blank','noopener')};
  async function pay(plan,msgEl){
    if(busy)return;
    const user=await refreshAccount(false);
    if(!user){accountDialog.showModal();text('authMessage',x().loginRequired);return}
    busy=true;
    const buttons=['businessMonthlyBtn','businessYearlyBtn','proMonthlyBtn','proYearlyBtn','limitBusinessMonthly','limitBusinessYearly','limitProMonthly','limitProYearly'].map($).filter(Boolean);
    buttons.forEach(b=>b.disabled=true);text(msgEl,t().openingCheckout);
    try{
      if(!siteId)siteId=makeSiteId();
      const r=await SJW_API.checkout({plan,siteId,siteName:$('businessName').value.trim()||t().brand,returnUrl:cfg.siteUrl});
      location.href=validUrl(r.url,'stripe')
    }catch(e){
      if(e.code==='AUTH_REQUIRED'){accountDialog.showModal();text('authMessage',x().loginRequired)}
      else if(e.code==='SUBSCRIPTION_ALREADY_ACTIVE'){publish.close();accountDialog.showModal();await refreshAccount();text('accountContent',currentLang==='zh'?'此账户已有有效订阅，无需重复付款。':'This account already has an active subscription. No additional payment is needed.')}
      else text(msgEl,e.message||t().unableCheckout);
      busy=false;buttons.forEach(b=>b.disabled=false)
    }
  }
  $('businessMonthlyBtn').onclick=()=>pay('business-monthly','publishMessage');
  $('businessYearlyBtn').onclick=()=>pay('business-yearly','publishMessage');
  $('proMonthlyBtn').onclick=()=>pay('pro-monthly','publishMessage');
  $('proYearlyBtn').onclick=()=>pay('pro-yearly','publishMessage');
  $('limitBusinessMonthly').onclick=()=>pay('business-monthly','limitMessage');
  $('limitBusinessYearly').onclick=()=>pay('business-yearly','limitMessage');
  $('limitProMonthly').onclick=()=>pay('pro-monthly','limitMessage');
  $('limitProYearly').onclick=()=>pay('pro-yearly','limitMessage');
  $('manageBtn').onclick=async()=>{accountDialog.showModal();await refreshAccount()};

  applyLanguage();refreshTrial();
  window.addEventListener('error',()=>{try{clearPreviewTimer();show(create);text('message',t().appStart)}catch{}});window.addEventListener('unhandledrejection',()=>{try{if(!busy)text('message',t().somethingWrong)}catch{}});

  // PWA installation and application shell
  let deferredInstallPrompt=null;
  const installBtn=$('installBtn'),installDialog=$('installDialog');
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;if(installBtn)installBtn.hidden=false});
  window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;if(installBtn)installBtn.hidden=true});
  if(installBtn)installBtn.onclick=async()=>{
    if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;installBtn.hidden=true;return}
    installDialog.showModal();
  };
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}));
  }

  // Supabase Google / Magic Link account, records and notifications
  const accountDialog=$('accountDialog'),authPanel=$('authPanel'),accountPanel=$('accountPanel');
  async function refreshAccount(clearInvalid=true){
    try{
      const session=await window.SJW_AUTH.session();
      if(!session){authPanel.hidden=false;accountPanel.hidden=true;$('accountBtn').textContent=currentLang==='zh'?'登录':'Sign in';return null}
      const r=await SJW_API.me();
      authPanel.hidden=true;accountPanel.hidden=false;$('accountEmail').textContent=r.user.email;
      $('accountBtn').textContent=currentLang==='zh'?'账户':'Account';
      try{const n=await SJW_API.notifications();const unread=n.notifications.filter(x=>!x.read).length;$('notificationCount').textContent=unread?String(unread):''}catch{}
      try{const sub=await SJW_API.subscriptionStatus();$('subscriptionSummary').textContent=sub.active?(currentLang==='zh'?`当前方案：${sub.plan||'有效订阅'} · ${sub.status}`:`Current plan: ${sub.plan||'Active subscription'} · ${sub.status}`):(currentLang==='zh'?'当前没有有效订阅。':'No active subscription.')}catch{$('subscriptionSummary').textContent=''}
      return r.user
    }catch(e){
      if(clearInvalid){authPanel.hidden=false;accountPanel.hidden=true}
      return null
    }
  }
  $('accountBtn').onclick=async()=>{accountDialog.showModal();await refreshAccount()};
  $('googleLoginBtn').onclick=async()=>{
    text('authMessage',currentLang==='zh'?'正在打开 Google 登录…':'Opening Google sign-in…');
    try{await window.SJW_AUTH.google()}catch(e){text('authMessage',e.message||x().authUnavailable)}
  };
  $('magicLinkBtn').onclick=async()=>{
    const email=$('authEmail').value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){text('authMessage',currentLang==='zh'?'请输入有效的电子邮箱。':'Enter a valid email address.');return}
    text('authMessage',currentLang==='zh'?'正在发送…':'Sending…');
    try{await window.SJW_AUTH.magicLink(email);text('authMessage',x().linkSent)}catch(e){text('authMessage',e.message||x().authUnavailable)}
  };
  $('logoutBtn').onclick=async()=>{try{await window.SJW_AUTH.signOut()}catch{}$('accountContent').innerHTML='';await refreshAccount()};
  $('manageSubscriptionBtn').onclick=async()=>{
    try{
      const r=await SJW_API.portal({returnUrl:cfg.siteUrl});
      location.href=validUrl(r.url,'stripe')
    }catch(e){alert(e.message||t().unableManage)}
  };
  $('restoreSubscriptionBtn').onclick=async()=>{
    text('accountContent',currentLang==='zh'?'正在核对订阅…':'Checking subscription…');
    try{const sub=await SJW_API.subscriptionStatus();$('subscriptionSummary').textContent=sub.active?(currentLang==='zh'?`订阅已恢复：${sub.plan||sub.status}`:`Subscription restored: ${sub.plan||sub.status}`):(currentLang==='zh'?'没有找到有效订阅。如付款邮箱不同，请联系支持。':'No active subscription was found. Contact support if a different payment email was used.');$('accountContent').textContent=''}catch(e){$('accountContent').textContent=e.message||t().somethingWrong}
  };
  $('exportAccountBtn').onclick=async()=>{
    try{const data=await SJW_API.exportAccount();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='business-website-account-export.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){alert(e.message||t().somethingWrong)}
  };
  $('deleteAccountBtn').onclick=async()=>{
    const ok=confirm(currentLang==='zh'?'确定删除账户和网站数据吗？此操作无法撤销。有效订阅需要先在会员管理中取消。':'Delete your account and website data? This cannot be undone. Cancel any active subscription in membership management first.');
    if(!ok)return;
    try{await SJW_API.deleteAccount();await window.SJW_AUTH.signOut();location.reload()}catch(e){alert(e.message||t().somethingWrong)}
  };
  $('mySitesBtn').onclick=async()=>{try{const r=await SJW_API.sites();$('accountContent').innerHTML=r.sites.length?r.sites.map(s=>`<a class="record-card" href="${s.url}" target="_blank" rel="noopener"><strong>${escapeHtml(s.name||'Website')}</strong><span>${escapeHtml(s.city||s.industry||'')}</span><small>${new Date(s.updatedAt).toLocaleString()}</small></a>`).join(''):`<p class="empty-state">${currentLang==='zh'?'还没有已保存的网站。':'No saved websites yet.'}</p>`}catch(e){$('accountContent').textContent=e.message}};
  $('notificationsBtn').onclick=async()=>{try{const r=await SJW_API.notifications();$('accountContent').innerHTML=r.notifications.length?r.notifications.map(n=>`<article class="record-card"><strong>${escapeHtml(n.title)}</strong><span>${escapeHtml(n.message)}</span><small>${new Date(n.createdAt).toLocaleString()}</small></article>`).join(''):`<p class="empty-state">${currentLang==='zh'?'暂无通知。':'No notifications yet.'}</p>`;await SJW_API.readNotifications('');$('notificationCount').textContent=''}catch(e){$('accountContent').textContent=e.message}};
  $('enableNotificationsBtn').onclick=async()=>{if(!('Notification'in window))return alert(currentLang==='zh'?'此设备不支持通知。':'Notifications are not supported on this device.');const p=await Notification.requestPermission();if(p==='granted')new Notification(currentLang==='zh'?'通知已开启':'Notifications enabled',{body:currentLang==='zh'?'网站生成完成时可以收到设备提醒。':'You can receive device alerts when website creation finishes.'})};
  function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  window.SJW_AUTH.onChange(()=>{refreshAccount();refreshTrial()}).catch(()=>{});
  refreshAccount();

  // Show a device notification after a successful generation when permission already exists.
  const originalGenerate=generateWebsite;

  preview.addEventListener('load',()=>{if('Notification'in window&&Notification.permission==='granted'&&previewUrl){try{new Notification(currentLang==='zh'?'网站已生成':'Website ready',{body:$('businessName').value.trim()||'Business Website',icon:'/icons/icon-192.png'})}catch{}}});



  // Compact website management: information, service areas, images, domain and quote placeholder.
  const siteManageDialog=$('siteManageDialog'),domainDialog=$('domainDialog');
  function applyManagementLanguage(){
    const zh=currentLang==='zh';
    const values={
      manageSiteSmall:zh?'网站管理':'Website management',manageSiteTitle:zh?'管理你的网站':'Manage your website',manageSiteIntro:zh?'资料、图片、服务地区、域名和报价入口统一收在这里，保持主页面简洁。':'Edit information, images, service areas, domain settings and quote options from one place.',
      manageDetailsTitle:zh?'商家资料':'Business information',manageDetailsDesc:zh?'名称、服务、联系方式和商家介绍':'Name, services, contact and business description',
      manageAreasTitle:zh?'服务地区':'Service areas',manageAreasDesc:zh?'添加商家提供服务的城市和区域':'Add cities and regions where the business serves',
      manageImagesTitle:zh?'图片管理':'Images',manageImagesDesc:zh?'添加或替换网站图片':'Add or replace website images',
      manageDomainTitle:zh?'自定义域名':'Custom domain',manageDomainDesc:zh?'付费客户可提交自己的域名':'Paid customers can request their own domain',
      manageRedesignTitle:zh?'重新设计':'New design',manageRedesignDesc:zh?'使用已确认资料重新生成排版':'Regenerate the layout using confirmed information',
      domainSmall:zh?'付费功能':'Paid feature',domainTitle:zh?'自定义域名':'Custom domain',domainIntro:zh?'填写你拥有的域名。当前版本保存申请并由平台人工确认 DNS，不会自动修改你的域名设置。':'Enter a domain you own. This release records the request for manual DNS confirmation and does not automatically change DNS.',domainLabel:zh?'域名':'Domain name',saveDomainBtn:zh?'保存域名申请':'Save domain request',
    };Object.entries(values).forEach(([id,v])=>text(id,v));
  }
  const originalApplyLanguage=applyLanguage;applyLanguage=function(){originalApplyLanguage();applyManagementLanguage()};applyManagementLanguage();
  $('manageDetailsBtn').onclick=()=>{siteManageDialog.close();details.showModal()};
  $('manageAreasBtn').onclick=()=>{siteManageDialog.close();details.showModal();setTimeout(()=>{$('serviceAreas').focus();$('serviceAreas').scrollIntoView({block:'center'})},120)};
  $('manageImagesBtn').onclick=()=>{siteManageDialog.close();$('workspaceImages').click()};
  $('manageDomainBtn').onclick=()=>{siteManageDialog.close();domainDialog.showModal()};
  $('manageRedesignBtn').onclick=async()=>{siteManageDialog.close();await generateWebsite()};
  function normalizeDomain(value){return String(value||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'')}
  $('saveDomainBtn').onclick=async()=>{const domain=normalizeDomain($('customDomain').value);if(!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)){text('domainMessage',currentLang==='zh'?'请输入有效域名，例如 www.example.com。':'Enter a valid domain such as www.example.com.');return}try{const user=await refreshAccount(false);if(!user){domainDialog.close();accountDialog.showModal();text('authMessage',x().loginRequired);return}await SJW_API.siteSettings(siteId,{customDomain:domain,domainStatus:'requested'});text('domainMessage',currentLang==='zh'?'域名申请已保存，等待 DNS 人工确认。':'Domain request saved for manual DNS confirmation.')}catch(e){text('domainMessage',e.message||t().somethingWrong)}};

  const feedbackDialog=$('feedbackDialog');
  if($('feedbackBtn')) $('feedbackBtn').onclick=()=>feedbackDialog.showModal();
  if($('sendFeedbackBtn')) $('sendFeedbackBtn').onclick=async()=>{
    const message=$('feedbackMessage').value.trim();
    if(!message){text('feedbackMessageState',currentLang==='zh'?'请填写反馈内容。':'Please enter your feedback.');return}
    text('feedbackMessageState',currentLang==='zh'?'正在发送…':'Sending…');
    try{
      await SJW_API.feedback({
        category:$('feedbackCategory').value,
        message,
        email:$('feedbackEmail').value.trim(),
        siteId:siteId||'',
        page:location.href,
        appVersion:window.SJW_CONFIG.version
      });
      text('feedbackMessageState',currentLang==='zh'?'已收到，谢谢你的反馈。':'Received. Thank you for your feedback.');
      $('feedbackMessage').value='';
    }catch(e){text('feedbackMessageState',e.message)}
  };

})();
