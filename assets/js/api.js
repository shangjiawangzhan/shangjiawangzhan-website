(()=>{const c=window.SJW_CONFIG;
function token(){try{return localStorage.getItem('sjw_auth_token')||''}catch{return''}}
async function request(path,{method='GET',body,headers={},timeout=90000}={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{
  const auth=token();
  const r=await fetch(`${c.apiBase}${path}`,{method,body,headers:{'X-SJW-Client-ID':window.SJW_CLIENT_ID,...(auth?{Authorization:`Bearer ${auth}`}:{ }),...headers},signal:controller.signal});
  const data=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(data.error||'Request failed');e.code=data.code;e.status=r.status;e.data=data;throw e}
  return data
 }finally{clearTimeout(timer)}
}
window.SJW_API={
 trial:()=>request('/api/trial-status',{timeout:15000}),
 upload:file=>{const f=new FormData();f.append('file',file);return request('/api/uploads',{method:'POST',body:f,timeout:60000})},
 generate:data=>request('/api/generate-site',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),timeout:90000}),
 checkout:data=>request('/api/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),timeout:30000}),
 portal:data=>request('/api/create-portal-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),timeout:30000}),
 register:(email,password)=>request('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password}),timeout:30000}),
 login:(email,password)=>request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password}),timeout:30000}),
 logout:()=>request('/api/auth/logout',{method:'POST',timeout:15000}),
 me:()=>request('/api/me',{timeout:15000}),
 sites:()=>request('/api/account/sites',{timeout:20000}),
 notifications:()=>request('/api/account/notifications',{timeout:15000}),
 readNotifications:id=>request('/api/account/notifications/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id||''}),timeout:15000})
}})();
