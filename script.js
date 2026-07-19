(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const cfg = window.SJW_CONFIG || {};
  const API = String(cfg.apiBase || '').replace(/\/$/, '');
  const SITE = String(cfg.siteUrl || location.origin).replace(/\/$/, '');

  const templates = [
    {id:'luxury',name:'Luxury Dark',for:'高端装修 · 设计 · 专业服务',img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=84',bg:'#07111d',surface:'#102033',text:'#f7f5ef',muted:'#9aaabd',accent:'#d6b06f'},
    {id:'editorial',name:'Editorial White',for:'品牌 · 贸易 · 咨询',img:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=84',bg:'#f5f3ee',surface:'#ffffff',text:'#161616',muted:'#6f6f6f',accent:'#1f4a37'},
    {id:'warm',name:'Warm Local',for:'餐饮 · 零售 · 生活服务',img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=84',bg:'#f1e9df',surface:'#fffaf5',text:'#32271f',muted:'#7f6b5e',accent:'#b4552d'},
    {id:'factory',name:'Modern Factory',for:'制造 · 设备 · 加工',img:'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=84',bg:'#0c1116',surface:'#151d24',text:'#edf2f5',muted:'#94a0aa',accent:'#ff8a3d'},
    {id:'gallery',name:'Visual Gallery',for:'摄影 · 美容 · 艺术',img:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=84',bg:'#f8f6f2',surface:'#ffffff',text:'#181818',muted:'#77736d',accent:'#8d6a9f'},
    {id:'service',name:'Minimal Service',for:'家政 · 维修 · 安装',img:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=84',bg:'#eef4f7',surface:'#ffffff',text:'#13212a',muted:'#687984',accent:'#168aad'},
    {id:'cabinet',name:'Premium Cabinet',for:'橱柜 · 衣柜 · 家具',img:'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1200&q=84',bg:'#ede8df',surface:'#f9f6f1',text:'#2a241d',muted:'#796f63',accent:'#8a5f36'},
    {id:'glass',name:'Glass & Window',for:'门窗 · 玻璃 · 百叶窗',img:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=84',bg:'#eaf2f6',surface:'#ffffff',text:'#15232b',muted:'#6c7f89',accent:'#277a9b'},
    {id:'restaurant',name:'Restaurant',for:'餐厅 · 咖啡 · 烘焙',img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=84',bg:'#231914',surface:'#31231c',text:'#fff7ef',muted:'#c6b5a8',accent:'#e3a65c'},
    {id:'health',name:'Health Clean',for:'诊所 · 健康 · 护理',img:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=84',bg:'#edf7f6',surface:'#ffffff',text:'#17302e',muted:'#6c8380',accent:'#2a9d8f'},
    {id:'legal',name:'Professional',for:'法律 · 会计 · 咨询',img:'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=84',bg:'#111722',surface:'#1a2230',text:'#f2f3f5',muted:'#9ba6b6',accent:'#9bb5de'},
    {id:'realestate',name:'Real Estate',for:'房产 · 物业 · 经纪',img:'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=84',bg:'#f0f0ec',surface:'#ffffff',text:'#1b2421',muted:'#6d7772',accent:'#315f4f'}
  ];

  const industries = [
    '装修设计','橱柜定制','衣柜定制','门窗安装','百叶窗与窗帘','地板与墙面','屋顶与防水','油漆与翻新','水电维修','空调暖通','园林景观','家政清洁','搬家运输','家具零售','餐厅','咖啡店','烘焙与甜品','食品零售','超市与便利店','服装零售','珠宝与礼品','艺术品与收藏','美容院','美发店','美甲店','按摩与理疗','健身与瑜伽','诊所与护理','牙科服务','康复服务','机械设备','食品设备','包装设备','金属加工','塑料制品','家具制造','建筑材料','电子产品','进出口贸易','批发贸易','律师服务','会计服务','保险服务','企业咨询','翻译服务','摄影服务','设计服务','技术服务','营销服务','语言培训','艺术培训','音乐培训','课后辅导','职业培训','儿童教育','房地产','物业管理','汽车维修','汽车美容','租车服务','物流运输','旅游住宿','活动婚庆','宠物服务','农业食品','个人工作室','其他行业'
  ];

  let selected = 'luxury';
  let heroImage = '';
  let logoImage = '';
  let gallery = [];
  let publicUrl = '';
  const fields = ['name','city','industry','phone','email','tagline','services','about'];

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const phoneHref = value => String(value || '').replace(/[^0-9+]/g,'');
  const selectedTemplate = () => templates.find(t => t.id === selected) || templates[0];
  const industryProfiles = {
    '装修设计':{template:'luxury',tagline:'让空间更清楚，也更适合真实生活',services:'空间设计，旧房翻新，施工管理，安装服务',about:'从需求沟通到落地交付，为本地客户提供清楚、可靠的空间服务。'},
    '橱柜定制':{template:'cabinet',tagline:'为日常生活定制更合适的收纳空间',services:'厨房橱柜，衣柜定制，收纳设计，安装服务',about:'提供设计、选材、制作与安装服务，让每一处空间更实用、更耐用。'},
    '衣柜定制':{template:'cabinet',tagline:'让收纳更自然，让空间更完整',services:'定制衣柜，步入式衣帽间，空间收纳，安装服务',about:'围绕真实使用需求，提供从设计到安装的一体化定制服务。'},
    '门窗安装':{template:'glass',tagline:'更清晰的选择，更可靠的安装',services:'门窗更换，玻璃安装，现场测量，维修服务',about:'为本地住宅与商用空间提供门窗、玻璃及相关安装服务。'},
    '百叶窗与窗帘':{template:'glass',tagline:'让光线、隐私与空间刚刚好',services:'百叶窗，窗帘，遮阳产品，测量安装',about:'提供产品选择、现场测量与安装服务，帮助客户完成更合适的窗饰方案。'},
    '餐厅':{template:'restaurant',tagline:'好味道，也值得被更好地看见',services:'招牌菜品，到店用餐，外带服务，团体预订',about:'专注于稳定的出品、舒适的体验与真诚的本地服务。'},
    '咖啡店':{template:'warm',tagline:'一杯咖啡，也是一段日常',services:'咖啡饮品，甜点轻食，到店体验，活动预订',about:'为城市日常提供轻松、自然、值得停留的空间。'},
    '美容院':{template:'gallery',tagline:'让专业服务呈现得更有质感',services:'美容护理，皮肤管理，预约服务，会员项目',about:'以清楚的项目介绍和舒适体验，为客户提供专业美容服务。'},
    '机械设备':{template:'factory',tagline:'让产品能力更清楚地被看见',services:'设备制造，产品定制，技术支持，商务合作',about:'面向真实业务需求，提供设备、制造与技术支持服务。'},
    '律师服务':{template:'legal',tagline:'复杂问题，需要清楚而可靠的专业支持',services:'法律咨询，合同审查，企业服务，争议支持',about:'为个人与企业客户提供清楚、谨慎、可沟通的专业服务。'},
    '会计服务':{template:'legal',tagline:'让财务与经营信息更清楚',services:'记账服务，税务支持，企业咨询，报表整理',about:'为小型企业和专业机构提供稳定、清晰的财务支持。'},
    '房地产':{template:'realestate',tagline:'让每一次选择，都更接近理想空间',services:'房源展示，买卖咨询，租赁服务，预约看房',about:'提供本地房产信息、沟通与交易支持服务。'},
    '家政清洁':{template:'service',tagline:'让日常生活更轻松一点',services:'家庭清洁，深度清洁，搬家清洁，预约服务',about:'为本地家庭与商家提供清楚、方便的清洁服务。'}
  };
  const profileFor = industry => industryProfiles[industry] || {
    template: /制造|设备|加工|材料|电子|贸易|批发/.test(industry) ? 'factory' : /餐|咖啡|烘焙|食品|零售|超市/.test(industry) ? 'warm' : /美容|美发|美甲|摄影|艺术|婚庆/.test(industry) ? 'gallery' : /装修|橱柜|衣柜|家具|门窗|地板|屋顶|油漆|园林/.test(industry) ? 'luxury' : /律师|会计|保险|咨询|翻译|技术|营销/.test(industry) ? 'legal' : 'editorial',
    tagline:'让真实业务更清楚地被看见',
    services:'核心服务，预约咨询，产品展示，本地支持',
    about:'为本地客户提供清楚、可靠、容易联系的产品与服务。'
  };
  const defaultData = industry => {
    const p = profileFor(industry || '装修设计');
    return {name:'我的商家',city:'本地及周边',industry:industry || '装修设计',phone:'',email:'',tagline:p.tagline,services:p.services,about:p.about};
  };

  function renderTemplates(){
    $('template-grid').innerHTML = templates.map(t => `<button class="template-card ${t.id===selected?'active':''}" data-template="${t.id}" type="button"><div class="template-image" style="background-image:url('${t.img}')"></div><div class="template-meta"><strong>${esc(t.name)}</strong><small>${esc(t.for)}</small></div></button>`).join('');
    document.querySelectorAll('[data-template]').forEach(btn => btn.onclick = () => { selected = btn.dataset.template; renderTemplates(); updatePreview(); const dlg=$('design-dialog'); if(dlg?.open) dlg.close(); $('preview-wrap').scrollIntoView({behavior:'smooth',block:'start'}); });
  }

  function current(){
    const industry = $('industry').value || '装修设计';
    const d = defaultData(industry);
    fields.forEach(id => {
      const value = ($(id).value || '').trim();
      if(value) d[id] = value;
    });
    return {...d,template:selected,heroImage,logoImage,gallery,siteId:getSiteId()};
  }

  function getSiteId(){
    let id = localStorage.getItem('sjw-site-id-v1');
    if(!id){ id = 'sjw_' + cryptoRandom(10); localStorage.setItem('sjw-site-id-v1',id); }
    return id;
  }
  function cryptoRandom(len){
    const chars='abcdefghjkmnpqrstuvwxyz23456789';
    const bytes=new Uint8Array(len); crypto.getRandomValues(bytes);
    return Array.from(bytes,b=>chars[b%chars.length]).join('');
  }

  function buildSite(d, premium=false){
    const t = selectedTemplate();
    const main = d.heroImage || t.img;
    const services = d.services.split(/[，,、\n]/).map(s=>s.trim()).filter(Boolean).slice(0,6);
    const fallback = templates.filter(x=>x.id!==t.id).slice(0,6).map(x=>x.img);
    const galleryImgs = [...d.gallery, main, ...fallback].filter(Boolean).slice(0,6);
    const logo = d.logoImage ? `<img src="${d.logoImage}" alt="${esc(d.name)} Logo">` : esc(d.name.slice(0,1));
    const watermark = premium ? '' : `<a class="watermark" href="${SITE}" target="_blank" rel="noopener">Created with Shangjia Wangzhan</a>`;
    const schema = JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness","name":d.name,"description":d.about,"areaServed":d.city,"telephone":d.phone,"email":d.email});
    return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.name)}｜${esc(d.industry)}</title><meta name="description" content="${esc(d.tagline)}"><meta property="og:title" content="${esc(d.name)}"><meta property="og:description" content="${esc(d.tagline)}"><meta property="og:image" content="${main}"><meta name="theme-color" content="${t.bg}"><script type="application/ld+json">${schema}<\/script><style>*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:${t.bg};color:${t.text};font-family:Inter,"PingFang SC","Microsoft YaHei",Arial,sans-serif;-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}.wrap{width:min(1180px,calc(100% - 40px));margin:auto}header{position:fixed;inset:0 0 auto;z-index:20;background:linear-gradient(180deg,rgba(0,0,0,.46),transparent);color:#fff}.nav{height:82px;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:12px;font-weight:900}.logo{width:42px;height:42px;border-radius:14px;background:${t.accent};display:grid;place-items:center;color:${t.bg};overflow:hidden}.logo img{width:100%;height:100%;object-fit:cover}.links{display:flex;gap:25px;font-size:13px}.cta,.primary{display:inline-flex;padding:14px 21px;border-radius:999px;background:${t.accent};color:${t.bg};font-weight:900}.hero{min-height:760px;background-image:linear-gradient(90deg,rgba(3,8,14,.88),rgba(3,8,14,.15)),url('${main}');background-size:cover;background-position:center;display:flex;align-items:end;color:#fff}.hero-content{padding:170px 0 82px}.kicker{font-size:11px;letter-spacing:.22em;color:${t.accent};font-weight:900}.hero h1{font-size:clamp(58px,8vw,106px);max-width:930px;line-height:.92;letter-spacing:-.06em;margin:18px 0 25px}.hero p{max-width:700px;color:#d7e0e9;font-size:18px;line-height:1.8}.actions{display:flex;gap:12px;margin-top:30px}.outline{display:inline-flex;padding:14px 21px;border:1px solid rgba(255,255,255,.35);border-radius:999px}.stats{display:flex;gap:45px;margin-top:58px;padding-top:28px;border-top:1px solid rgba(255,255,255,.2)}.stats b{display:block;font-size:24px}.stats small{color:#aebdca}.section{padding:105px 0}.section-head{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:end;margin-bottom:42px}.section h2{font-size:clamp(42px,6vw,72px);letter-spacing:-.055em;line-height:1;margin:10px 0}.section-head p,.about-copy{color:${t.muted};line-height:1.9}.services{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.service{min-height:250px;background:${t.surface};border-radius:24px;padding:27px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 20px 55px rgba(0,0,0,.08)}.service i{font-style:normal;color:${t.accent};font-weight:900}.service h3{font-size:25px}.service p{color:${t.muted};line-height:1.7}.gallery{display:grid;grid-template-columns:1.4fr .8fr .8fr;grid-template-rows:260px 260px;gap:12px}.gallery img{width:100%;height:100%;object-fit:cover;border-radius:22px}.gallery img:first-child{grid-row:1/3}.about{display:grid;grid-template-columns:.8fr 1.2fr;gap:70px}.contact{background:${t.surface};padding:58px;border-radius:30px;display:flex;align-items:center;justify-content:space-between;gap:30px}.contact h2{margin:8px 0}.contact-links{display:flex;gap:10px;flex-wrap:wrap}.footer{padding:35px 0;border-top:1px solid rgba(127,127,127,.2);display:flex;justify-content:space-between;color:${t.muted};font-size:12px}.watermark{position:fixed;right:14px;bottom:14px;z-index:30;background:rgba(7,17,29,.88);color:#fff;padding:9px 13px;border-radius:999px;font-size:11px;box-shadow:0 8px 28px rgba(0,0,0,.25)}@media(max-width:850px){.links{display:none}.section-head,.about{grid-template-columns:1fr}.services{grid-template-columns:1fr 1fr}.gallery{grid-template-columns:1fr 1fr}.gallery img:first-child{grid-row:auto}.contact{align-items:flex-start;flex-direction:column}}@media(max-width:560px){.wrap{width:calc(100% - 28px)}.hero{min-height:650px}.hero h1{font-size:54px}.actions,.contact-links{display:grid}.section{padding:72px 0}.services,.gallery{grid-template-columns:1fr}.gallery{grid-template-rows:auto}.gallery img{height:260px}.stats{gap:20px;flex-wrap:wrap}.footer{display:grid;gap:10px}}</style></head><body><header><div class="wrap nav"><a class="brand" href="#top"><span class="logo">${logo}</span>${esc(d.name)}</a><nav class="links"><a href="#services">服务</a><a href="#gallery">案例</a><a href="#about">品牌</a><a href="#contact">联系</a></nav><a class="cta" href="${d.phone?`tel:${esc(phoneHref(d.phone))}`:`#contact`}">${d.phone?`联系商家`:`了解服务`}</a></div></header><main id="top"><section class="hero"><div class="wrap hero-content"><span class="kicker">${esc(d.city)} · ${esc(d.industry)}</span><h1>${esc(d.tagline)}</h1><p>${esc(d.about)}</p><div class="actions"><a class="primary" href="${d.phone?`tel:${esc(phoneHref(d.phone))}`:`#contact`}">${d.phone?`立即咨询`:`了解更多`}</a><a class="outline" href="#services">浏览服务</a></div><div class="stats"><div><b>${String(services.length||3).padStart(2,'0')}</b><small>核心服务</small></div><div><b>${esc(d.city)}</b><small>服务区域</small></div><div><b>${esc(d.name)}</b><small>品牌名称</small></div></div></div></section><section class="section" id="services"><div class="wrap"><div class="section-head"><div><span class="kicker">SERVICES</span><h2>核心服务</h2></div><p>${esc(d.tagline)}</p></div><div class="services">${(services.length?services:['核心服务','预约咨询','专业交付']).map((x,i)=>`<article class="service"><i>${String(i+1).padStart(2,'0')}</i><div><h3>${esc(x)}</h3><p>${esc(d.city)}地区服务，欢迎联系了解详情。</p></div></article>`).join('')}</div></div></section><section class="section" id="gallery"><div class="wrap"><div class="section-head"><div><span class="kicker">GALLERY</span><h2>品牌展示</h2></div><p>${esc(d.industry)} · ${esc(d.city)}</p></div><div class="gallery">${galleryImgs.map(src=>`<img src="${src}" alt="${esc(d.name)}">`).join('')}</div></div></section><section class="section" id="about"><div class="wrap about"><div><span class="kicker">ABOUT</span><h2>${esc(d.name)}</h2></div><p class="about-copy">${esc(d.about)}</p></div></section><section class="section" id="contact"><div class="wrap contact"><div><span class="kicker">CONTACT</span><h2>联系商家</h2><p>${esc(d.name)} · ${esc(d.city)}</p></div><div class="contact-links">${d.phone?`<a class="primary" href="tel:${esc(phoneHref(d.phone))}">${esc(d.phone)}</a>`:''}${d.email?`<a class="outline" href="mailto:${esc(d.email)}">发送邮件</a>`:`<a class="outline" href="#top">返回首页</a>`}</div></div></section></main><div class="wrap footer"><strong>${esc(d.name)}</strong><span>${esc(d.city)} · ${esc(d.industry)}</span></div>${watermark}</body></html>`;
  }

  function updatePreview(){
    const d = current();
    $('preview').srcdoc = buildSite(d,false);
    $('site-url').textContent = publicUrl || `${SITE}/view/${d.siteId.replace('sjw_','')}`;
    localStorage.setItem('sjw-draft-v1', JSON.stringify({...d,heroImage:'',logoImage:'',gallery:[]}));
  }

  async function readFile(file,max=5*1024*1024){
    if(!file) throw new Error('请选择图片');
    if(file.size>max) throw new Error('图片过大');
    return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('无法读取图片'));r.readAsDataURL(file);});
  }

  async function createShare(){
    const d = current();
    if(API){
      try{
        const res = await fetch(`${API}/api/sites`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({siteId:d.siteId,site:d,html:buildSite(d,false)})});
        const data = await res.json();
        if(res.ok && data.url){ publicUrl=data.url; $('site-url').textContent=publicUrl; return publicUrl; }
      }catch(_){ }
    }
    return `${SITE}/view/${d.siteId.replace('sjw_','')}`;
  }

  async function checkout(plan){
    const email = $('checkout-email').value.trim() || $('email').value.trim();
    if(!email){ $('checkout-message').textContent='请输入付款邮箱'; return; }
    if(!API){ $('checkout-message').textContent='支付服务尚未连接'; return; }
    try{
      $('checkout-message').textContent='正在打开安全结账…';
      const res = await fetch(`${API}/api/create-checkout-session`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan,email,siteId:current().siteId,siteName:current().name,returnUrl:`${SITE}/`})});
      const data = await res.json();
      if(!res.ok || !data.url) throw new Error(data.error || '无法创建结账');
      location.href=data.url;
    }catch(e){ $('checkout-message').textContent=e.message || '暂时无法打开结账'; }
  }

  async function portal(){
    const email=$('billing-email').value.trim();
    if(!email){ $('billing-message').textContent='请输入付款邮箱'; return; }
    if(!API){ $('billing-message').textContent='会员服务尚未连接'; return; }
    try{
      $('billing-message').textContent='正在打开会员管理…';
      const res=await fetch(`${API}/api/create-portal-session`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,returnUrl:`${SITE}/`})});
      const data=await res.json();
      if(!res.ok || !data.url) throw new Error(data.error||'无法打开会员管理');
      location.href=data.url;
    }catch(e){ $('billing-message').textContent=e.message || '暂时无法打开会员管理'; }
  }

  $('industry').innerHTML = industries.map(x=>`<option>${esc(x)}</option>`).join('');
  $('industry').value = '装修设计';
  selected = profileFor($('industry').value).template;
  renderTemplates();
  fields.forEach(id => $(id).addEventListener('input',updatePreview));
  $('industry').addEventListener('change',()=>{ selected = profileFor($('industry').value).template; renderTemplates(); updatePreview(); });
  $('toggle-details').onclick=()=>{ const panel=$('advanced-fields'); panel.hidden=!panel.hidden; $('toggle-details').textContent=panel.hidden?'更多内容':'收起'; };
  $('hero-image').onchange = async e => { try{heroImage=await readFile(e.target.files[0]);$('hero-image-state').textContent='已选择';updatePreview();}catch(err){alert(err.message);} };
  $('logo-image').onchange = async e => { try{logoImage=await readFile(e.target.files[0],2*1024*1024);$('logo-image-state').textContent='已选择';updatePreview();}catch(err){alert(err.message);} };
  $('gallery-images').onchange = async e => { try{gallery=await Promise.all([...e.target.files].slice(0,6).map(f=>readFile(f)));$('gallery-state').textContent=`已选择 ${gallery.length} 张`;updatePreview();}catch(err){alert(err.message);} };
  document.querySelectorAll('.device').forEach(b=>b.onclick=()=>{document.querySelectorAll('.device').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('preview').style.width=b.dataset.width;});
  $('generate').onclick=()=>{ const name=$('name').value.trim(); if(!name){ $('create-message').textContent='请输入商家名称'; $('name').focus(); return; } $('create-message').textContent=''; const previewWrap=$('preview-wrap'); previewWrap.classList.remove('preview-hidden'); previewWrap.classList.add('is-visible'); updatePreview(); requestAnimationFrame(()=>previewWrap.scrollIntoView({behavior:'smooth',block:'start'})); };
  $('edit-site').onclick=()=>{$('studio').scrollIntoView({behavior:'smooth',block:'start'}); setTimeout(()=>$('name').focus(),450);};
  $('change-template').onclick=()=>{$('design-dialog').showModal();};
  $('share-site').onclick=async()=>{const d=current();const url=await createShare();try{if(navigator.share)await navigator.share({title:d.name,text:d.tagline,url});else{await navigator.clipboard.writeText(url);$('share-site').textContent='已复制';setTimeout(()=>$('share-site').textContent='转发',1200);}}catch(_){ }};
  $('use-site').onclick=()=>{$('checkout-email').value=$('email').value;$('monthly-price').textContent=cfg.monthlyDisplay||'$15';$('checkout-yearly').textContent=`按年开通 · ${cfg.yearlyDisplay||'$149'}`;$('upgrade-dialog').showModal();};
  $('checkout-monthly').onclick=()=>checkout('monthly');
  $('checkout-yearly').onclick=()=>checkout('yearly');
  $('manage-billing').onclick=()=>{$('billing-email').value=$('email').value;$('billing-dialog').showModal();};
  $('open-portal').onclick=portal;
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
  $('reset').onclick=()=>{fields.forEach(id=>$(id).value='');heroImage='';logoImage='';gallery=[];selected='luxury';publicUrl='';$('hero-image-state').textContent='可选';$('logo-image-state').textContent='选择';$('gallery-state').textContent='最多 6 张';$('create-message').textContent='';$('preview-wrap').classList.add('preview-hidden');$('preview-wrap').classList.remove('is-visible');renderTemplates();localStorage.removeItem('sjw-draft-v1');updatePreview();$('name').focus();};

  try{
    const saved=JSON.parse(localStorage.getItem('sjw-draft-v1')||'null');
    if(saved){fields.forEach(id=>{if(saved[id]!==undefined)$(id).value=saved[id];});selected=saved.template||selected;renderTemplates();}
  }catch(_){ }
  updatePreview();
})();
