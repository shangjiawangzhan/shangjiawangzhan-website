const $ = (id) => document.getElementById(id);
const fields = ['name','city','industry','phone','tagline','services','about','theme','slug'];
let heroImage = '';
let currentShareUrl = '';

const defaults = {
  name:'你的商家名称',city:'所在城市',industry:'本地专业服务',phone:'联系电话',
  tagline:'把真实业务，做成清楚的品牌表达',services:'核心服务，预约咨询，项目交付',
  about:'在这里介绍你的品牌、经验、服务范围与优势。',theme:'midnight',slug:'yourbrand'
};

function cleanSlug(value=''){
  return value.toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,40);
}
function escapeHtml(str=''){
  return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function phoneHref(phone=''){
  const value=String(phone).replace(/[^0-9+]/g,'');
  return value || '#contact';
}
function initials(name=''){
  const clean=String(name).trim();
  if(!clean) return '商';
  const words=clean.split(/\s+/).filter(Boolean);
  return escapeHtml((words.length>1?words.slice(0,2).map(x=>x[0]).join(''):clean.slice(0,2)).toUpperCase());
}
function getData(){
  const data={};
  fields.forEach(id=>data[id]=$(id).value.trim()||defaults[id]);
  data.slug=cleanSlug($('slug').value)||'yourbrand';
  data.heroImage=heroImage;
  return data;
}
function themeTokens(theme){
  if(theme==='ivory') return {bg:'#f5f1e9',surface:'#ffffff',surface2:'#ece5d9',text:'#16201b',muted:'#657168',accent:'#17473a',accent2:'#c89b57',line:'rgba(22,32,27,.12)',button:'#fff'};
  if(theme==='earth') return {bg:'#efe8df',surface:'#fffaf4',surface2:'#e4d1c2',text:'#2d211b',muted:'#74645b',accent:'#8b3f27',accent2:'#cb9564',line:'rgba(45,33,27,.13)',button:'#fff'};
  return {bg:'#07111d',surface:'#0e1b2a',surface2:'#14263a',text:'#f4f7fb',muted:'#a8b6c5',accent:'#51e3b6',accent2:'#7ca8ff',line:'rgba(255,255,255,.11)',button:'#07111d'};
}
function buildSite(data){
  const t=themeTokens(data.theme);
  const items=data.services.split(/[，,、\n]/).map(x=>x.trim()).filter(Boolean).slice(0,6);
  const services=items.length?items:['核心服务','预约咨询','项目交付'];
  const tel=phoneHref(data.phone);
  const schema=JSON.stringify({'@context':'https://schema.org','@type':'LocalBusiness',name:data.name,description:data.about,areaServed:data.city,telephone:data.phone}).replace(/</g,'\\u003c');
  const imageStyle=data.heroImage?`background-image:linear-gradient(90deg,rgba(4,10,18,.88),rgba(4,10,18,.18)),url('${data.heroImage}')`:`background-image:radial-gradient(circle at 75% 25%,rgba(124,168,255,.24),transparent 34%),radial-gradient(circle at 18% 82%,rgba(81,227,182,.16),transparent 30%)`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escapeHtml(data.tagline)}"><meta name="theme-color" content="${t.bg}"><title>${escapeHtml(data.name)}｜${escapeHtml(data.industry)}</title><script type="application/ld+json">${schema}<\/script><style>
:root{--bg:${t.bg};--surface:${t.surface};--surface2:${t.surface2};--text:${t.text};--muted:${t.muted};--accent:${t.accent};--accent2:${t.accent2};--line:${t.line};--button:${t.button}}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,"PingFang SC","Microsoft YaHei",Arial,sans-serif;-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}.wrap{width:min(1180px,calc(100% - 40px));margin:auto}.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 84%,transparent);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.nav{height:76px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{display:flex;align-items:center;gap:12px;font-weight:900}.logo{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--accent2));color:var(--button)}.links{display:flex;gap:26px;color:var(--muted);font-size:14px}.nav-cta,.primary{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--accent);color:var(--button);font-weight:900}.nav-cta{padding:11px 17px}.hero{min-height:720px;display:grid;align-items:end;background-color:var(--bg);${imageStyle};background-size:cover;background-position:center;position:relative;overflow:hidden}.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,var(--bg),transparent 42%);pointer-events:none}.hero-inner{position:relative;z-index:1;padding:130px 0 90px}.eyebrow{display:inline-block;padding:8px 12px;border:1px solid rgba(255,255,255,.16);border-radius:999px;font-size:12px;letter-spacing:.14em;color:#dce7f2;background:rgba(6,14,24,.28);backdrop-filter:blur(12px)}h1{font-size:clamp(54px,8vw,112px);line-height:.94;letter-spacing:-.06em;max-width:980px;margin:24px 0;color:#fff;text-wrap:balance}.lead{max-width:700px;font-size:18px;line-height:1.85;color:#c8d3df}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.primary{padding:15px 22px}.secondary{display:inline-flex;align-items:center;justify-content:center;padding:15px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.22);color:#fff;background:rgba(6,14,24,.22);backdrop-filter:blur(12px);font-weight:800}.signature{display:flex;gap:34px;flex-wrap:wrap;margin-top:50px;padding-top:26px;border-top:1px solid rgba(255,255,255,.15);color:#d7e0ea}.signature b{display:block;font-size:22px}.signature span{font-size:12px;color:#9fb0c2}.section{padding:110px 0}.section-head{display:grid;grid-template-columns:.78fr 1.22fr;gap:56px;align-items:end;margin-bottom:46px}.kicker{font-size:12px;letter-spacing:.18em;color:var(--accent);font-weight:900}.section h2{font-size:clamp(38px,5.4vw,68px);line-height:1;letter-spacing:-.05em;margin:12px 0}.section-head p{margin:0;color:var(--muted);line-height:1.9;font-size:17px}.service-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.service{min-height:250px;padding:28px;border:1px solid var(--line);border-radius:26px;background:linear-gradient(145deg,var(--surface),var(--surface2));display:flex;flex-direction:column;justify-content:space-between;transition:.25s}.service:hover{transform:translateY(-5px)}.service span{color:var(--muted);font-size:12px}.service h3{font-size:25px;line-height:1.25;margin:46px 0 12px}.service p{margin:0;color:var(--muted);line-height:1.75}.about{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:start}.about-copy{font-size:20px;line-height:2;color:var(--muted);margin:0}.facts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px}.fact{padding:22px;border-radius:20px;background:var(--surface);border:1px solid var(--line)}.fact b{display:block;font-size:20px}.fact span{display:block;color:var(--muted);font-size:13px;margin-top:7px}.contact{padding:58px;border-radius:34px;background:linear-gradient(135deg,var(--surface),var(--surface2));border:1px solid var(--line);display:grid;grid-template-columns:1fr auto;align-items:center;gap:32px}.contact h2{font-size:clamp(40px,6vw,72px);line-height:1;margin:12px 0}.contact p{color:var(--muted);line-height:1.8}.contact-actions{display:grid;gap:10px;min-width:220px}.footer{padding:34px 0 44px;border-top:1px solid var(--line);display:flex;justify-content:space-between;color:var(--muted);font-size:12px}.footer b{color:var(--text)}@media(max-width:900px){.links{display:none}.section-head,.about,.contact{grid-template-columns:1fr}.service-grid{grid-template-columns:1fr 1fr}.contact-actions{min-width:0}}@media(max-width:620px){.wrap{width:min(100% - 28px,1180px)}.nav{height:66px}.hero{min-height:620px}.hero-inner{padding:90px 0 58px}h1{font-size:52px}.section{padding:74px 0}.service-grid,.facts{grid-template-columns:1fr}.contact{padding:30px}.actions{display:grid}.actions a{width:100%}.footer{display:grid;gap:10px}}</style></head><body>
<header class="top"><div class="wrap nav"><a class="brand" href="#top"><span class="logo">${initials(data.name)}</span><span>${escapeHtml(data.name)}</span></a><nav class="links"><a href="#services">服务</a><a href="#about">品牌</a><a href="#contact">联系</a></nav><a class="nav-cta" href="tel:${escapeHtml(tel)}">联系商家</a></div></header><main id="top"><section class="hero"><div class="wrap hero-inner"><span class="eyebrow">${escapeHtml(data.city)} · ${escapeHtml(data.industry)}</span><h1>${escapeHtml(data.tagline)}</h1><p class="lead">${escapeHtml(data.about)}</p><div class="actions"><a class="primary" href="tel:${escapeHtml(tel)}">立即咨询</a><a class="secondary" href="#services">浏览服务</a></div><div class="signature"><div><b>${String(services.length).padStart(2,'0')}</b><span>核心服务</span></div><div><b>${escapeHtml(data.city)}</b><span>服务区域</span></div><div><b>${escapeHtml(data.name)}</b><span>品牌名称</span></div></div></div></section><section class="section" id="services"><div class="wrap"><div class="section-head"><div><span class="kicker">SERVICES</span><h2>核心服务</h2></div><p>${escapeHtml(data.tagline)}</p></div><div class="service-grid">${services.map((x,i)=>`<article class="service"><span>${String(i+1).padStart(2,'0')}</span><div><h3>${escapeHtml(x)}</h3><p>${escapeHtml(data.city)}地区服务，欢迎联系了解详情。</p></div></article>`).join('')}</div></div></section><section class="section" id="about"><div class="wrap about"><div><span class="kicker">ABOUT</span><h2>${escapeHtml(data.name)}</h2></div><div><p class="about-copy">${escapeHtml(data.about)}</p><div class="facts"><div class="fact"><b>${escapeHtml(data.industry)}</b><span>业务方向</span></div><div class="fact"><b>${escapeHtml(data.city)}</b><span>服务区域</span></div></div></div></div></section><section class="section" id="contact"><div class="wrap"><div class="contact"><div><span class="kicker">CONTACT</span><h2>开始联系</h2><p>${escapeHtml(data.name)} · ${escapeHtml(data.city)}</p></div><div class="contact-actions"><a class="primary" href="tel:${escapeHtml(tel)}">${escapeHtml(data.phone)}</a><a class="secondary" href="#top">返回顶部</a></div></div></div></section></main><div class="wrap footer"><span><b>${escapeHtml(data.name)}</b></span><span>Created with 商家网站</span></div></body></html>`;
}
function encodePayload(data){
  const payload={...data};
  if(payload.heroImage && payload.heroImage.length>120000) payload.heroImage='';
  const bytes=new TextEncoder().encode(JSON.stringify(payload));
  let binary='';bytes.forEach(b=>binary+=String.fromCharCode(b));
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodePayload(value){
  const base=value.replace(/-/g,'+').replace(/_/g,'/');
  const padded=base+'='.repeat((4-base.length%4)%4);
  const binary=atob(padded);const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function makeShareUrl(data){
  const base=location.href.split('#')[0];
  return `${base}#site=${encodePayload(data)}`;
}
function setShareUrl(data){
  currentShareUrl=makeShareUrl(data);
  history.replaceState(null,'',currentShareUrl);
  $('share-link-output').textContent=currentShareUrl;
  $('share-link-output').title=currentShareUrl;
}
function update(){
  const data=getData();
  $('slug').value=cleanSlug($('slug').value);
  $('slug-output').textContent=data.slug;
  $('dialog-domain').textContent=`${data.slug}.com`;
  $('publish-contact').href=`mailto:shangjiawangzhan@gmail.com?subject=${encodeURIComponent('开通独立链接：'+data.name)}&body=${encodeURIComponent('商家名称：'+data.name+'\n独立链接：'+data.slug+'.com')}`;
  $('site-preview').srcdoc=buildSite(data);
  setShareUrl(data);
  const completed=fields.filter(id=>$(id).value.trim()).length+(heroImage?1:0);
  $('progress-bar').style.width=`${Math.round(completed/(fields.length+1)*100)}%`;
  $('save-state').textContent='已更新';
  localStorage.setItem('sjw-draft-v1',JSON.stringify({...data,heroImage}));
}
function openGeneratedSite(){
  const blob=new Blob([buildSite(getData())],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  window.open(url,'_blank','noopener');
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function shareGeneratedSite(){
  setShareUrl(getData());
  const shareData={title:getData().name,text:getData().tagline,url:currentShareUrl};
  try{
    if(navigator.share){await navigator.share(shareData);return;}
    await navigator.clipboard.writeText(currentShareUrl);
    const old=$('share-site').textContent;$('share-site').textContent='链接已复制';setTimeout(()=>$('share-site').textContent=old,1400);
  }catch(e){}
}
function loadSharedSite(){
  const match=location.hash.match(/^#site=(.+)$/);
  if(!match) return false;
  try{
    const data=decodePayload(match[1]);
    Object.entries(data).forEach(([k,v])=>{if($(k)&&k!=='heroImage')$(k).value=v;});
    heroImage=data.heroImage||'';
    if(heroImage)$('image-state').textContent='已载入图片';
    return true;
  }catch(e){return false;}
}
fields.forEach(id=>$(id).addEventListener('input',update));
$('slug').addEventListener('blur',()=>{$('slug').value=cleanSlug($('slug').value);update();});
$('hero-image').addEventListener('change',e=>{const file=e.target.files&&e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{heroImage=reader.result;$('image-state').textContent=file.name;update();};reader.readAsDataURL(file);});
document.querySelectorAll('.device').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.device').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('site-preview').style.width=btn.dataset.width;}));
$('load-demo').addEventListener('click',()=>{const demo={name:'山海空间设计',city:'成都',industry:'装修与定制',phone:'138 0000 0000',tagline:'让每一寸空间，更适合真实生活',services:'定制橱柜，衣柜设计，空间收纳，安装服务，旧房升级，预约量尺',about:'专注家庭空间的设计、定制与安装，以材质、比例和生活方式为基础，为每个空间建立清楚而耐用的解决方案。',theme:'midnight',slug:'shanhai-design'};Object.entries(demo).forEach(([k,v])=>$(k).value=v);update();location.hash='builder';});
$('clear-form').addEventListener('click',()=>{fields.forEach(id=>$(id).value=id==='industry'?'装修与定制':id==='theme'?'midnight':'');heroImage='';$('hero-image').value='';$('image-state').textContent='选择图片';localStorage.removeItem('sjw-draft-v1');update();});
$('generate-site').addEventListener('click',()=>{$('site-use-bar').scrollIntoView({behavior:'smooth',block:'center'});setShareUrl(getData());});
$('use-site').addEventListener('click',openGeneratedSite);
$('share-site').addEventListener('click',shareGeneratedSite);
$('edit-link').addEventListener('click',()=>$('publish-dialog').showModal());
const loadedFromLink=loadSharedSite();
if(!loadedFromLink){const saved=localStorage.getItem('sjw-draft-v1');if(saved){try{const data=JSON.parse(saved);Object.entries(data).forEach(([k,v])=>{if($(k)&&k!=='heroImage')$(k).value=v;});heroImage=data.heroImage||'';if(heroImage)$('image-state').textContent='已载入图片';$('save-state').textContent='已恢复';}catch(e){}}}
update();
