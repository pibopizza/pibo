/* ===========================================================
   PIBO — data engine (no external backend, no Google/Firebase)
   ------------------------------------------------------------
   Everyone visiting the site reads data/store.json, a plain file
   that lives on the same domain as the site itself — so there is
   nothing to filter and no VPN is ever needed to see the menu.

   When you edit something in the admin panel, the change is only
   saved in *your own browser* (as a draft) until you download the
   updated file and replace data/store.json in the project, then
   push it. That one extra step is the trade-off for the site
   having zero dependency on any foreign service.
=========================================================== */
const PIBO_STORE_URL = "data/store.json";
const PIBO_DRAFT_KEY = "pibo_draft_store";

let PIBO_STORE_CACHE = null;

async function pibo_loadStore(){
  if(PIBO_STORE_CACHE) return PIBO_STORE_CACHE;

  let base = { products: {}, settings: {} };
  try{
    const res = await fetch(PIBO_STORE_URL, { cache: "no-store" });
    if(res.ok){
      const data = await res.json();
      base = { products: data.products || {}, settings: data.settings || {} };
    }
  }catch(e){
    console.error("خطا در دریافت اطلاعات سایت:", e);
  }

  let draft = null;
  try{
    const raw = localStorage.getItem(PIBO_DRAFT_KEY);
    if(raw) draft = JSON.parse(raw);
  }catch(e){ /* ignore corrupt draft */ }

  PIBO_STORE_CACHE = draft ? { products: draft.products || {}, settings: draft.settings || {} } : base;
  return PIBO_STORE_CACHE;
}

function pibo_hasUnsavedChanges(){
  return !!localStorage.getItem(PIBO_DRAFT_KEY);
}

function pibo_saveDraft(){
  if(!PIBO_STORE_CACHE) return;
  try{
    localStorage.setItem(PIBO_DRAFT_KEY, JSON.stringify(PIBO_STORE_CACHE));
  }catch(e){ console.error("ذخیره تغییرات محلی با خطا مواجه شد:", e); }
}

function pibo_downloadStoreFile(){
  if(!PIBO_STORE_CACHE) return;
  const blob = new Blob([JSON.stringify(PIBO_STORE_CACHE, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "store.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function pibo_discardDraft(){
  localStorage.removeItem(PIBO_DRAFT_KEY);
  PIBO_STORE_CACHE = null;
}
