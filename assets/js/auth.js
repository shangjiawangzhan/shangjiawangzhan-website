(()=>{
  let client=null,config=null,initPromise=null;
  async function init(){
    if(initPromise)return initPromise;
    initPromise=(async()=>{
      const response=await fetch(`${window.SJW_CONFIG.apiBase}/api/auth/config`,{
        headers:{'X-SJW-Client-ID':window.SJW_CLIENT_ID||''}
      });
      config=await response.json();
      if(!response.ok||!config.enabled)throw new Error('Sign-in is not configured yet.');
      if(!window.supabase?.createClient)throw new Error('Authentication library failed to load.');
      client=window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
      });
      return client;
    })();
    return initPromise;
  }
  async function session(){const c=await init();const {data,error}=await c.auth.getSession();if(error)throw error;return data.session||null}
  async function accessToken(){try{return (await session())?.access_token||''}catch{return''}}
  async function google(){
    const c=await init();
    const {error}=await c.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:`${location.origin}${location.pathname}`}
    });
    if(error)throw error;
  }
  async function magicLink(email){
    const c=await init();
    const {error}=await c.auth.signInWithOtp({
      email,
      options:{emailRedirectTo:`${location.origin}${location.pathname}`,shouldCreateUser:true}
    });
    if(error)throw error;
  }
  async function signOut(){const c=await init();const {error}=await c.auth.signOut();if(error)throw error}
  async function user(){const c=await init();const {data,error}=await c.auth.getUser();if(error)throw error;return data.user||null}
  async function onChange(callback){const c=await init();return c.auth.onAuthStateChange((_event,current)=>callback(current))}
  window.SJW_AUTH={init,session,getAccessToken:accessToken,google,magicLink,signOut,user,onChange};
})();