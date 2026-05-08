(function(){const b=document.createElement("link").relList;if(b&&b.supports&&b.supports("modulepreload"))return;for(const L of document.querySelectorAll('link[rel="modulepreload"]'))S(L);new MutationObserver(L=>{for(const $ of L)if($.type==="childList")for(const m of $.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&S(m)}).observe(document,{childList:!0,subtree:!0});function P(L){const $={};return L.integrity&&($.integrity=L.integrity),L.referrerPolicy&&($.referrerPolicy=L.referrerPolicy),L.crossOrigin==="use-credentials"?$.credentials="include":L.crossOrigin==="anonymous"?$.credentials="omit":$.credentials="same-origin",$}function S(L){if(L.ep)return;L.ep=!0;const $=P(L);fetch(L.href,$)}})();const xe="modulepreload",ke=function(e){return"/"+e},ve={},ge=function(b,P,S){let L=Promise.resolve();if(P&&P.length>0){document.getElementsByTagName("link");const m=document.querySelector("meta[property=csp-nonce]"),l=(m==null?void 0:m.nonce)||(m==null?void 0:m.getAttribute("nonce"));L=Promise.allSettled(P.map(o=>{if(o=ke(o),o in ve)return;ve[o]=!0;const d=o.endsWith(".css"),a=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${o}"]${a}`))return;const r=document.createElement("link");if(r.rel=d?"stylesheet":xe,d||(r.as="script"),r.crossOrigin="",r.href=o,l&&r.setAttribute("nonce",l),document.head.appendChild(r),d)return new Promise((t,s)=>{r.addEventListener("load",t),r.addEventListener("error",()=>s(new Error(`Unable to preload CSS for ${o}`)))})}))}function $(m){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=m,window.dispatchEvent(l),!l.defaultPrevented)throw m}return L.then(m=>{for(const l of m||[])l.status==="rejected"&&$(l.reason);return b().catch($)})},we=(()=>{const e=`${window.location.origin}/api/auth`;let b=null,P=!1;const S={admin:"all",ppic:["schedule","master-sku","master-bom","master-supplier","manual-spb","summary","materials","distribution","distribution-hourly","warehouse-stock","transit-info","dashboard","master-line-sku"],admin_transit:["stock","transit-inbound","transit-verify-reject","transit-outbound","transit-stock-on-hand","transit-opname","transit-master-receh","tv-inbound","materials","distribution","distribution-hourly","master-block","master-line-sku","master-kamus-opname","print-barcode","dashboard","transit-info","transit-mutation","opname-recap","transit-relocation","transit-anomaly","audit-log","manual-spb"],gudang:["warehouse-stock","warehouse-delivery","warehouse-outbound","materials","distribution","distribution-hourly","transit-info","dashboard","print-barcode","tv-inbound"],operator_line:["prod-inbound","prod-outbound","prod-reject","prod-onhand","prod-bpp","prod-mutation","prod-opname","prod-3in1","pack-3in1","materials","distribution","distribution-hourly","transit-info"],supervisor:["prod-inbound","prod-outbound","prod-reject","prod-onhand","prod-bpp","prod-mutation","prod-opname","prod-3in1","pack-3in1","materials","distribution","distribution-hourly","transit-info","manual-spb","dashboard","transit-mutation","opname-recap","transit-relocation","transit-anomaly","audit-log"]},L={admin:"Administrator",ppic:"PPIC",admin_transit:"Admin Transit",gudang:"Gudang",operator_line:"Operator Line",supervisor:"Supervisor Produksi",viewer:"Viewer"},$={admin:"#/dashboard",ppic:"#/dashboard",admin_transit:"#/stock",gudang:"#/warehouse/stock",operator_line:"#/produksi/inbound",supervisor:"#/produksi/inbound",viewer:"#/dashboard"},m={"/dashboard":"dashboard","/master/sku":"master-sku","/master/bom":"master-bom","/master/block":"master-block","/master/line-sku":"master-line-sku","/master/supplier":"master-supplier","/master/kamus-opname":"master-kamus-opname","/schedule":"schedule","/summary":"summary","/materials":"materials","/distribution":"distribution","/distribution/hourly":"distribution-hourly","/stock":"stock","/warehouse/stock":"warehouse-stock","/warehouse/delivery":"warehouse-delivery","/warehouse/outbound":"warehouse-outbound","/transit/inbound":"transit-inbound","/transit/outbound":"transit-outbound","/transit/stock-on-hand":"transit-stock-on-hand","/transit/info":"transit-info","/transit/mutation":"transit-mutation","/transit/manual-spb":"manual-spb","/tv/inbound":"tv-inbound","/transit/relocation":"transit-relocation","/transit/verify-reject":"transit-verify-reject","/transit/master-receh":"transit-master-receh","/transit/opname":"transit-opname","/transit/anomaly":"transit-anomaly","/audit":"audit-log","/produksi/inbound":"prod-inbound","/produksi/outbound":"prod-outbound","/produksi/reject":"prod-reject","/produksi/onhand":"prod-onhand","/produksi/bpp":"prod-bpp","/produksi/mutation":"prod-mutation","/produksi/opname":"prod-opname","/external/onhand-3p2":"pack-3in1","/external/onhand-3f2":"prod-3in1","/opname-recap":"opname-recap","/print-barcode":"print-barcode"};async function l(x,H){const A=await fetch(`${e}/sign-in/email`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({email:x,password:H})});if(!A.ok){const E=await A.json().catch(()=>null);throw new Error((E==null?void 0:E.message)||(E==null?void 0:E.error)||"Email atau password salah")}const f=await A.json();return b=f.user||null,P=!0,b&&(localStorage.setItem("pmc_current_user",b.name||"User"),localStorage.setItem("pmc_current_role",b.role||"viewer"),localStorage.setItem("pmc_current_email",b.email||"")),f}async function o(){try{await fetch(`${e}/sign-out`,{method:"POST",credentials:"include"})}catch{}b=null,P=!1,localStorage.removeItem("pmc_current_user"),localStorage.removeItem("pmc_current_role"),localStorage.removeItem("pmc_current_email")}async function d(){if(P&&b)return b;try{const x=await fetch(`${e}/get-session`,{credentials:"include"});if(!x.ok)return b=null,P=!0,null;const H=await x.json();return b=(H==null?void 0:H.user)||null,P=!0,b&&(localStorage.setItem("pmc_current_user",b.name||"User"),localStorage.setItem("pmc_current_role",b.role||"viewer"),localStorage.setItem("pmc_current_email",b.email||"")),b}catch{const x=localStorage.getItem("pmc_current_role");return x?(b={name:localStorage.getItem("pmc_current_user")||"User",role:x,email:localStorage.getItem("pmc_current_email")||""},P=!0,b):(b=null,P=!0,null)}}function a(){if(b)return b;const x=localStorage.getItem("pmc_current_role");return x?{name:localStorage.getItem("pmc_current_user")||"User",role:x,email:localStorage.getItem("pmc_current_email")||""}:null}function r(x){const H=a();if(!H)return!1;const A=H.role||"viewer",f=S[A];return f==="all"?!0:f?f.includes(x):!1}function t(x){const H=a();if(!H)return!1;const A=H.role||"viewer";if(S[A]==="all")return!0;const f=m[x];return f?r(f):!0}function s(){const x=a(),H=(x==null?void 0:x.role)||"viewer";return $[H]||"#/dashboard"}function y(x){return L[x]||x||"Viewer"}function p(){return!!a()}function T(){b=null,P=!1}return{login:l,logout:o,getSession:d,getCurrentUser:a,hasAccess:r,canAccessRoute:t,getDefaultRoute:s,getRoleLabel:y,isLoggedIn:p,clearCache:T,ROLE_PERMISSIONS:S,ROLE_LABELS:L}})();window.Auth=we;const he=(()=>{const e=`${window.location.origin}/api`,b={};function P(t,s){b[t]||(b[t]=[]),b[t].push(s)}function S(t,s){b[t]&&(b[t]=b[t].filter(y=>y!==s))}function L(t,s){b[t]&&b[t].forEach(y=>y(s))}let $=!0;async function m(){try{const{get:t,set:s}=await ge(async()=>{const{get:x,set:H}=await import("./index-DwnyWBFG.js");return{get:x,set:H}},[]);let y=await t("offline_queue_pmc")||[];if(y.length===0)return;console.log(`[PWA] Processing ${y.length} offline requests...`);const p=[];let T=0;for(const x of y)try{const H=await fetch(x.url,x.options);H.ok?T++:(console.error(`[PWA] Background sync failed for URL: ${x.url}`,await H.text()),p.push(x))}catch{console.warn("[PWA] Still offline, keeping request in queue"),p.push(x)}await s("offline_queue_pmc",p),T>0&&(L("data_sync_required",{source:"background_sync"}),L("toast",{type:"success",message:`${T} data mutasi yang tertunda berhasil diselaraskan.`}))}catch(t){console.warn("[PWA] Offline queue processing skipped:",t.message)}}function l(t){$!==t&&($=t,L("apiStatusChanged",$),o($),t===!0&&m())}function o(t){let s=document.getElementById("global-api-banner");if(t)s&&(s.style.display="none");else{if(!s&&(s=document.createElement("div"),s.id="global-api-banner",s.style.cssText="position:fixed; top:0; left:0; width:100%; background:#f39c12; color:white; text-align:center; padding:8px; font-weight:bold; z-index:9999; box-shadow:0 2px 10px rgba(0,0,0,0.5); font-size:14px; display:flex; justify-content:center; align-items:center; gap:10px;",s.innerHTML=`
          <div style="width:10px; height:10px; background:white; border-radius:50%; animation: pulse 1.5s infinite"></div>
          ⚠️ OFFLINE MODE - Sinyal Terputus. Pemotongan Barcode akan tersimpan otomatis di perangkat ini dan terkirim saat sinyal kembali.
        `,document.body.appendChild(s),!document.getElementById("pulse-anim"))){const y=document.createElement("style");y.id="pulse-anim",y.innerHTML="@keyframes pulse { 0% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.2); } 100% { opacity:1; transform:scale(1); } }",document.head.appendChild(y)}s.style.display="flex"}}async function d(t,s={}){try{const y=await fetch(t,{...s,credentials:"include"});return $||l(!0),y}catch(y){l(!1);const p=s.method?s.method.toUpperCase():"GET";if(["POST","PUT","DELETE"].includes(p))try{const{get:T,set:x}=await ge(async()=>{const{get:A,set:f}=await import("./index-DwnyWBFG.js");return{get:A,set:f}},[]);console.warn(`[PWA] Network error, queuing request: ${p} ${t}`);let H=await T("offline_queue_pmc")||[];return H.push({url:t,options:s,timestamp:Date.now()}),await x("offline_queue_pmc",H),{ok:!0,json:async()=>({success:!0,message:"⚠️ Tersimpan Offline (Menunggu Sinyal Wi-Fi)",offlineQueued:!0}),text:async()=>"Offline Queued"}}catch{console.warn("[PWA] IndexedDB unavailable, cannot queue offline")}throw y}}const a={apiConnected:!0,skuList:[],uomConversions:[{uom:"ROL",unit:"1 Roll",conversion:"1000 meter"},{uom:"PCS",unit:"1 Pieces",conversion:"-"},{uom:"KG",unit:"1 Kilogram",conversion:"1000 gram"},{uom:"LBR",unit:"1 Lembar",conversion:"-"}],supplierList:[],bomData:[],palletQtyMap:{},linePerSku:[],schedules:[],warehouseInventory:[],transitInventory:[],blockLayout:[],transitStock:{},usedBarcodes:new Set,stockMutations:[],activeDeliveries:[],lineStock:[],lineBarcodes:[],pendingReturns:[],transitOutboundPending:[],transitInfoCache:{blocks:[]},materialReceh:[],lineMutations:[],lineMutationReportRaw:{reportList:[]},stockChecks:{},externalOnhand:{"3P2":{stock:{},barcodes:[]},"3F2":{stock:{},barcodes:[]}},_schedulesLoaded:!1,_barcodeCounter:0,_midCounter:0},r={API_BASE:e,on:P,off:S,emit:L,safeFetch:d};return Object.keys(a).forEach(t=>{Object.defineProperty(r,t,{get:()=>a[t],set:s=>{a[t]=s}})}),setTimeout(()=>{if(window.io){const t=window.io(window.location.origin);t.on("connect",()=>{console.log("[Socket] Connected to real-time server:",t.id)}),t.on("transit_stock_updated",s=>{console.log("[Socket] Transit Stock Updated:",s),L("data_sync_required",s)}),t.on("line_stock_updated",s=>{console.log("[Socket] Line Stock Updated:",s),L("data_sync_required",s)}),t.on("warehouse_stock_updated",s=>{console.log("[Socket] Warehouse Stock Updated:",s),L("data_sync_required",s)}),t.on("disconnect",()=>{console.log("[Socket] Disconnected from server")})}else console.warn("[Socket] socket.io client not found. Real-time updates disabled.")},1e3),r})();window.PMCStore=he;(e=>{e.API_BASE,e.safeFetch,e.emit;function b(a){const{id:r,...t}=a;e.safeFetch(`${e.API_BASE}/master/supplier`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(s=>{if(!s.ok)throw new Error("Gagal menyimpan Supplier. Pastikan Kode tidak duplikat.");return e.loadMasterDataFromAPI()}).catch(s=>{console.error("Error adding supplier",s),alert(s.message)})}function P(a,r){e.safeFetch(`${e.API_BASE}/master/supplier/${a}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}).then(t=>{if(!t.ok)throw new Error("Gagal update supplier");return e.loadMasterDataFromAPI()}).catch(t=>{console.error("Error updating supplier",t),alert(t.message)})}function S(a){e.safeFetch(`${e.API_BASE}/master/supplier/${a}`,{method:"DELETE"}).then(r=>{if(!r.ok)throw new Error("Gagal menghapus supplier");return e.loadMasterDataFromAPI()}).catch(r=>{console.error("Error deleting supplier",r),alert(r.message)})}function L(a){const r=new Date;return r.setDate(r.getDate()+a),r.toISOString().split("T")[0]}L(0),L(-1),L(1);async function $(){try{const a=[e.safeFetch(`${e.API_BASE}/master/sku`),e.safeFetch(`${e.API_BASE}/master/supplier`),e.safeFetch(`${e.API_BASE}/master/bom`),e.safeFetch(`${e.API_BASE}/master/line-sku`),e.safeFetch(`${e.API_BASE}/master/pallet-qty`)],[r,t,s,y,p]=await Promise.all(a.map(T=>T.catch(()=>null)));if(r&&r.ok){const T=await r.json();e.skuList=T||[],e.emit("skuChanged")}if(t&&t.ok){const T=await t.json();e.supplierList=T||[],e.emit("supplierChanged")}if(s&&s.ok){const T=await s.json(),x={};(T||[]).forEach(H=>{const A=H.skuId||H.sku_id;x[A]||(x[A]={skuId:A,components:[]}),x[A].components.push({id:H.id,name:H.materialName||H.name,oracleCode:H.oracleCode||H.oracle_code||"",coefficient:parseFloat(H.coefficient)||0,uom:H.uom,rounding:H.rounding||"ceiling",line:H.line||null})}),e.bomData=Object.values(x),e.emit("bomChanged")}if(y&&y.ok){const T=await y.json();e.linePerSku=T||[],e.emit("linePerSkuChanged")}if(p&&p.ok){const T=await p.json();if(T&&Array.isArray(T)){const x={};T.forEach(H=>{x[H.materialName]=H.qtyPerPallet}),e.palletQtyMap=x}e.emit("palletQtyChanged")}console.log("✅ Master data loaded from database.")}catch(a){console.warn("⚠️ Error loading master data:",a)}await e.loadWarehouseStockFromAPI(),await e.loadTransitLayoutFromAPI()}async function m(){try{const a=await e.safeFetch(`${e.API_BASE}/master/block-layout`);if(a.ok){const r=await a.json();r&&r.length>0&&(e.blockLayout=r.map(t=>({id:t.id,blockNumber:t.blockNumber,skuCategories:t.skuCategories||[],rows:(t.rows||[]).map(s=>({id:s.id,rowNumber:s.rowNumber,maxPallets:s.maxPallets,material:s.materialName||"",assignedLines:s.assignedLines||[],lines:s.assignedLines||[],isFlexible:s.isFlexible||!1}))})),e.emit("layoutChanged"))}}catch(a){console.warn("Error loading transit layout:",a)}await e.loadTransitInfoFromAPI(),await e.loadActiveDeliveriesFromAPI(),await e.loadTransitOutboundPendingFromAPI(),await e.loadLineStockFromAPI(),await e.loadLineBarcodesFromAPI(),await e.loadPendingReturnsFromAPI()}async function l(){try{const a=await e.safeFetch(`${e.API_BASE}/warehouse/stock`);if(a.ok){const r=await a.json();e.warehouseInventory=r.map(t=>({...t,material:t.materialName,supplier:t.supplierName,barcodeStart:t.barcode,barcodeEnd:t.barcode})),e.emit("warehouseStockChanged"),console.log("✅ Warehouse stock loaded from database.")}await e.loadWarehouseCountersFromAPI()}catch(a){console.warn("⚠️ Error loading warehouse stock:",a)}}async function o(){try{const a=await e.safeFetch(`${e.API_BASE}/warehouse/counters`);if(a.ok){const r=await a.json();e._barcodeCounter=r.barcodeCounter||0,e._midCounter=r.midCounter||0,console.log(`✅ System counters synced: Barcode=${e._barcodeCounter}, MID=${e._midCounter}`)}}catch(a){console.warn("⚠️ Error syncing warehouse counters:",a)}}async function d(){try{const a=await e.safeFetch(`${e.API_BASE}/schedule`);if(!a.ok)throw new Error("Failed to fetch PMCStore.schedules");const r=await a.json();r&&r.length>0?e.schedules=r.map(t=>({id:t.id,date:typeof t.date=="string"?t.date.split("T")[0]:t.date,line:t.line,skuId:t.skuId||t.sku_id||t.skuCode||t.skuid,sh1:t.sh1||0,sh2:t.sh2||0,sh3:t.sh3||0,status:t.status||"pending"})):e.schedules=[],e._schedulesLoaded=!0,e.emit("scheduleChanged"),console.log(`✅ Schedules loaded from API: ${e.schedules.length} records`)}catch(a){console.warn("⚠️ Could not load PMCStore.schedules from API",a.message),e._schedulesLoaded=!0,e.emit("scheduleChanged")}}e.addSupplier=b,e.updateSupplier=P,e.deleteSupplier=S,e.loadMasterDataFromAPI=$,e.loadTransitLayoutFromAPI=m,e.loadWarehouseStockFromAPI=l,e.loadWarehouseCountersFromAPI=o,e.loadSchedulesFromAPI=d})(window.PMCStore);(e=>{const b=e.API_BASE;e.safeFetch,e.emit;function P(N){const c=e._barcodeCounter+1,w=[];for(let z=0;z<N;z++)e._barcodeCounter++,w.push(String(e._barcodeCounter).padStart(5,"0"));const I=e._barcodeCounter;return{start:String(c).padStart(5,"0"),end:String(I).padStart(5,"0"),barcodes:w}}function S(){e._midCounter++;const N=new Date;return"MID-"+(N.getFullYear().toString()+String(N.getMonth()+1).padStart(2,"0")+String(N.getDate()).padStart(2,"0"))+"-"+String(e._midCounter).padStart(3,"0")}function L(){return[...e.warehouseInventory].sort((N,c)=>new Date(N.dateIn)-new Date(c.dateIn))}function $(N){const c={material:N.material,supplier:N.supplier,qtyPerPallet:N.qtyPerPallet,palletsTotal:N.palletsAvailable,dateIn:N.dateIn};e.safeFetch(`${e.API_BASE}/warehouse/stock`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}).then(w=>{if(!w.ok)throw new Error("Gagal menambah stok gudang");return e.loadWarehouseStockFromAPI()}).catch(w=>{console.error("Error adding warehouse stock",w),alert(w.message)})}function m(N){e.safeFetch(`${e.API_BASE}/warehouse/stock/${N}`,{method:"DELETE"}).then(c=>{if(!c.ok)throw new Error("Gagal menghapus stok");return e.loadWarehouseStockFromAPI()}).catch(c=>{console.error("Error deleting warehouse stock",c),alert(c.message)})}function l(N){return e.skuList.find(c=>c.id===N||c.code===N)}function o(N){return e.bomData.find(c=>c.skuId===N)}function d(){return[...new Set(e.schedules.map(N=>N.date))].sort()}function a(N){for(const c of e.bomData)for(const w of c.components)if(w.name===N)return w.uom;return"PCS"}function r(N){const c=e.schedules.filter(I=>I.date===N),w={};return c.forEach(I=>{const z=`${I.skuId}-${I.line||"global"}`;w[z]||(w[z]={skuId:I.skuId,line:I.line,sh1:0,sh2:0,sh3:0}),w[z].sh1+=I.sh1,w[z].sh2+=I.sh2,w[z].sh3+=I.sh3}),Object.values(w).map(I=>{var z;return{...I,total:I.sh1+I.sh2+I.sh3,skuName:((z=l(I.skuId))==null?void 0:z.name)||I.skuId}})}function t(N,c){return c==="ceiling"?Math.ceil(N):c==="2decimal"?Math.round(N*100)/100:c==="3decimal"?Math.round(N*1e3)/1e3:c==="4decimal"?Math.round(N*1e4)/1e4:N}function s(N){const c={};return(N||[]).forEach(w=>{(w.rows||[]).forEach(I=>{I.material&&(c[I.material]||(c[I.material]=0),Array.isArray(I.pallets)?I.pallets.forEach(z=>{if(z!==""&&z!==null&&z!==void 0){const R=parseFloat(z);isNaN(R)||(c[I.material]+=R)}}):typeof I.pcs=="number"?c[I.material]+=I.pcs:typeof I.qty=="number"&&(c[I.material]+=I.qty))})}),c}function y(N){if(e.stockChecks[N])return s(e.stockChecks[N].blocks);const c=Object.keys(e.stockChecks).sort();let w=null;for(const I of c)if(I<N)w=I;else break;return w&&e.stockChecks[w]?s(e.stockChecks[w].blocks):{}}function p(N,c){if(c<=0)return{batches:[],totalAllocatedPcs:0};const w=L().filter(F=>F.material===N&&F.palletsAvailable>0);let I=c;const z=[];let R=0;for(const F of w){if(I<=0)break;const W=F.qtyPerPallet||B(N)||1,te=W*F.palletsAvailable;let Y=0;te<=I?Y=F.palletsAvailable:Y=Math.ceil(I/W);const X=Y*W;z.push({supplier:F.supplier,qtyPerPallet:W,pallets:Y,pcs:X}),I-=X,R+=X}if(I>0){const F=B(N)||1,W=Math.ceil(I/F),te=W*F;z.push({supplier:"Master Data",qtyPerPallet:F,pallets:W,pcs:te}),R+=te}return{batches:z,totalSPB:R}}async function T(N){try{const F=await e.safeFetch(`${e.API_BASE}/materials/requirements/${N}`);if(F.ok)return await F.json()||{perSku:[],grouped:[]}}catch(F){console.error("Error fetching material requirements",F)}const c=r(N),w=[],I={},z=y(N);c.forEach(F=>{const W=o(F.skuId);if(!W)return;const te=[];W.components.forEach(Y=>{if(Y.line&&Y.line!==F.line)return;const X=t(F.sh1*Y.coefficient,Y.rounding),ee=t(F.sh2*Y.coefficient,Y.rounding),ne=t(F.sh3*Y.coefficient,Y.rounding),se=(F.sh1>0?1:0)+(F.sh2>0?1:0)+(F.sh3>0?1:0),oe=se===0?1:se,ie=(F.sh1+F.sh2+F.sh3)/oe/7*2,le=t(ie*Y.coefficient,Y.rounding),ce=X+ee+ne+le;te.push({...Y,sh1:X,sh2:ee,sh3:ne,buffer:le,total:ce}),I[Y.name]||(I[Y.name]={name:Y.name,uom:Y.uom,sh1:0,sh2:0,sh3:0,buffer:0,rawTotal:0}),I[Y.name].sh1+=X,I[Y.name].sh2+=ee,I[Y.name].sh3+=ne,I[Y.name].buffer+=le,I[Y.name].rawTotal+=ce}),w.push({skuId:F.skuId,skuName:F.skuName,sh1:F.sh1,sh2:F.sh2,sh3:F.sh3,materials:te})});const R=Object.values(I).map(F=>{F.sisaStok=z[F.name]||0,F.total=Math.max(0,F.rawTotal-F.sisaStok);const W=e._allocateFromWMS(F.name,F.total),te=W.batches.length>0?W.batches[0].qtyPerPallet:B(F.name),Y=W.batches.reduce((X,ee)=>X+ee.pallets,0);return{...F,batches:W.batches,palletQty:te,palletCount:Y,totalSPB:W.totalSPB}});return{perSku:w,grouped:R}}async function x(N){try{const c=await e.safeFetch(`${e.API_BASE}/materials/hourly-distribution/${N}`);if(c.ok){const w=await c.json();return Array.isArray(w)?w:[]}}catch(c){console.error("Error fetching hourly distribution",c)}try{const c=await T(N),w=(c==null?void 0:c.grouped)||[],I=[];if(!w||w.length===0)return I;const z={};return w.forEach(R=>{if(R.totalSPB<=0)return;const F=[R.sh1,R.sh2,R.sh3],W=F.filter(se=>se>0).length||1,te=R.buffer/W,Y=[];R.batches.forEach(se=>{for(let oe=0;oe<se.pallets;oe++)Y.push({supplier:se.supplier,qty:se.qtyPerPallet})});let X=R.sisaStok;const ee=[0,0,0],ne={0:[],1:[],2:[]};for(let se=0;se<3;se++){const oe=F[se]+(F[se]>0?te:0);if(X>=oe)ee[se]=0,X-=oe;else{let re=oe-X;for(X=0;re>0&&Y.length>0;){const ie=Y.shift();ne[se].push(ie),ee[se]+=ie.qty,re-=ie.qty}re<0&&(X+=Math.abs(re))}}z[R.name]={kirimSH1:ee[0],kirimSH2:ee[1],kirimSH3:ee[2],bufferPerShift:te,sisaStok:R.sisaStok,shiftPallets:ne}}),w.forEach(R=>{if(R.totalSPB<=0)return;const F=z[R.name];if(!F)return;const W=F.bufferPerShift,te={name:R.name,kirimSH1:F.kirimSH1,kirimSH2:F.kirimSH2,kirimSH3:F.kirimSH3,slots:{SH1:[],SH2:[],SH3:[]}};let Y=F.sisaStok;["SH1","SH2","SH3"].forEach((X,ee)=>{const ne=[R.sh1,R.sh2,R.sh3],se=F[`kirim${X}`],oe=ne[ee]/4;if(se<=0){for(let pe=0;pe<4;pe++)te.slots[X].push({pallets:0,details:[]}),Y=Math.max(0,Y-oe);return}const re=F.shiftPallets[ee],ie=re.length,le=Math.floor(ie/4);let ce=ie%4,ue=0;for(let pe=0;pe<4;pe++){let fe=le+(ce>0?1:0);ce>0&&ce--;const be=[];let ye=0;for(;fe>0&&ue<ie;){const me=re[ue];be.push({supplier:me.supplier,qty:me.qty}),ye+=me.qty,ue++,fe--}te.slots[X].push({pallets:ye,details:be})}}),I.push(te)}),I}catch(c){return console.error("Fallback hourly distribution error",c),[]}}async function H(N){const c=await x(N);let w=Array.isArray(c)?c:[];try{const I=await e.safeFetch(`${e.API_BASE}/manual-spb`);I.ok&&(await I.json()).filter(F=>(F.targetDate?F.targetDate.split("T")[0]:F.createdAt?F.createdAt.split("T")[0]:null)===N).forEach(F=>{const W=F.targetShift?`SH${F.targetShift}`:"SH1";F.items.forEach(te=>{let Y=w.find(ne=>ne.name===te.materialName);Y||(Y={name:te.materialName,kirimSH1:0,kirimSH2:0,kirimSH3:0,slots:{SH1:[],SH2:[],SH3:[]},isManualRow:!0},["SH1","SH2","SH3"].forEach(ne=>{Y.slots[ne]=Array.from({length:4},()=>({pallets:0,details:[]}))}),w.push(Y));const X=B(te.materialName)||1,ee=te.qtyPallets*X;if(Y[`kirim${W}`]+=ee,Y.slots[W]&&Y.slots[W][0]){const ne=Y.slots[W][0];ne.pallets+=ee,ne.details||(ne.details=[]),ne.details.push({supplier:`Manual (${F.spbNumber})`,qty:X,isManual:!0})}})})}catch(I){console.warn("Failed to merge manual SPBs into distribution:",I)}return w.forEach(I=>{["SH1","SH2","SH3"].forEach(z=>{let R=0,F=!1;const W=I.slots[z];if(W)for(let te=1;te<=W.length;te++){const Y=`${N}_${z}_${te}`,X=e.activeDeliveries.find(ne=>ne.id===Y),ee=W[te-1];if(X&&(X.status==="delivering"||X.status==="completed"||X.items.some(ne=>ne.scanned>0))){const ne=X.items.find(se=>se.material===I.name);if(ne){const se=B(I.name)||1,oe=ne.scanned*se;(ne.scanned>0||X.status!=="preparing")&&(ee.pallets=oe,ee.pending=!1,ee.details=Array.from({length:ne.scanned||0}).map(()=>({supplier:"Aktual Gudang",qty:se})),F=!0)}}ee&&ee.pallets&&(R+=ee.pallets)}F&&(I[`kirim${z}`]=R)}),I.totalSPB=I.kirimSH1+I.kirimSH2+I.kirimSH3}),w}async function A(){try{const R=await e.safeFetch(`${e.API_BASE}/dashboard/stats`);if(R.ok)return await R.json()}catch(R){console.error("Error fetching stats",R)}const N=e.skuList.length,c=e.bomData.reduce((R,F)=>R+F.components.length,0),w=d(),I=e.schedules.reduce((R,F)=>R+F.sh1+F.sh2+F.sh3,0),z=e.schedules.filter(R=>R.status==="pending").length>0?[...new Set(e.schedules.filter(R=>R.status==="pending").map(R=>R.date))].length:0;return{totalSKU:N,totalBOM:c,totalBox:I,pending:z,dates:w}}async function f(){try{const c=await e.safeFetch(`${e.API_BASE}/dashboard/daily-production`);if(c.ok)return await c.json()}catch(c){console.error("Error fetching daily production",c)}const N={};return e.schedules.forEach(c=>{N[c.date]||(N[c.date]={sh1:0,sh2:0,sh3:0}),N[c.date].sh1+=c.sh1,N[c.date].sh2+=c.sh2,N[c.date].sh3+=c.sh3}),Object.entries(N).sort(([c],[w])=>c.localeCompare(w)).map(([c,w])=>({date:c,sh1:w.sh1,sh2:w.sh2,sh3:w.sh3,total:w.sh1+w.sh2+w.sh3}))}async function E(){try{const c=await fetch(`${b}/dashboard/recent-PMCStore.schedules`);if(c.ok)return await c.json()}catch(c){console.error("Error fetching recent PMCStore.schedules",c)}const N={};return e.schedules.forEach(c=>{N[c.date]||(N[c.date]={date:c.date,skus:new Set,total:0,status:c.status}),N[c.date].skus.add(c.skuId),N[c.date].total+=c.sh1+c.sh2+c.sh3,c.status==="pending"&&(N[c.date].status="pending")}),Object.values(N).map(c=>({...c,skuCount:c.skus.size})).sort((c,w)=>w.date.localeCompare(c.date))}function g(N){const{id:c,...w}=N;console.log(`DEBUG: PMCStore.addSKU called with URL: ${b}/master/sku`,w),window.alert(`MENYIMPAN KE API: ${b}/master/sku`),e.safeFetch(`${e.API_BASE}/master/sku`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(w)}).then(I=>I.json()).then(I=>{if(I.error)throw new Error(I.error);return e.loadMasterDataFromAPI()}).catch(I=>{console.error("Error adding SKU",I),alert(I.message)})}function h(N,c){e.safeFetch(`${e.API_BASE}/master/sku/${N}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}).then(w=>{if(!w.ok)throw new Error("Gagal update SKU");return e.loadMasterDataFromAPI()}).catch(w=>{console.error("Error updating SKU",w),alert(w.message)})}function i(N){e.safeFetch(`${e.API_BASE}/master/sku/${N}`,{method:"DELETE"}).then(c=>{if(!c.ok)throw new Error("Gagal menghapus SKU");return e.loadMasterDataFromAPI()}).catch(c=>{console.error("Error deleting SKU",c),alert(c.message)})}function n(N,c){const w=e.skuList.find(R=>R.id===N||R.code===N),I=w?w.id:N,z={materialName:c.name,oracleCode:c.oracleCode||"",coefficient:c.coefficient,uom:c.uom,rounding:c.rounding||"ceiling",line:c.line||null};e.safeFetch(`${e.API_BASE}/master/bom/${I}/component`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(z)}).then(R=>{if(!R.ok)throw new Error("Gagal menambah komponen BOM");return e.loadMasterDataFromAPI()}).catch(R=>{console.error("Error adding BOM",R),alert(R.message)})}function k(N,c,w){const I=e.bomData.find(z=>z.skuId===N);if(I&&I.components[c]){const z=I.components[c].id;if(!z)return;const R={materialName:w.name,oracleCode:w.oracleCode||"",coefficient:w.coefficient,uom:w.uom,rounding:w.rounding||"ceiling",line:w.line||null};e.safeFetch(`${e.API_BASE}/master/bom/component/${z}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(R)}).then(F=>{if(!F.ok)throw new Error("Gagal update BOM");return e.loadMasterDataFromAPI()}).catch(F=>{console.error("Error updating BOM",F),alert(F.message)})}}function C(N,c){const w=e.bomData.find(I=>I.skuId===N);if(w){const I=w.components[c].id;if(!I)return;e.safeFetch(`${e.API_BASE}/master/bom/component/${I}`,{method:"DELETE"}).then(z=>{if(!z.ok)throw new Error("Gagal menghapus BOM");return e.loadMasterDataFromAPI()}).catch(z=>{console.error("Error deleting BOM",z),alert(z.message)})}}function u(N){e.schedules.push(...N),e.emit("scheduleChanged"),e.safeFetch(`${e.API_BASE}/schedule/import`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:N})}).then(c=>{if(c.ok)return c.json();throw new Error("Failed to save PMCStore.schedules")}).then(c=>{if(c&&c.length>0){const w=e.schedules.length-N.length;c.forEach((I,z)=>{e.schedules[w+z]&&(e.schedules[w+z].id=I.id)})}console.log("✅ Schedules saved to database")}).catch(c=>{console.warn("⚠️ Failed to persist PMCStore.schedules to DB:",c.message)})}function v(N,c,w){if(e.schedules[N]){e.schedules[N][c]=w,e.emit("scheduleChanged");const I=e.schedules[N];I.id&&e.safeFetch(`${e.API_BASE}/schedule/${I.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({[c]:w})}).catch(z=>console.warn("⚠️ Failed to update schedule in DB:",z.message))}}function D(N){let c=-1;if(typeof N=="string"?c=e.schedules.findIndex(w=>w.id===N):c=N,c>=0&&e.schedules[c]){const w=e.schedules[c];e.schedules.splice(c,1),e.emit("scheduleChanged"),w.id&&e.safeFetch(`${e.API_BASE}/schedule/${w.id}`,{method:"DELETE"}).then(I=>{I.ok?console.log("✅ Schedule deleted from database"):console.warn("⚠️ Failed to delete schedule from DB")}).catch(I=>console.warn("⚠️ Failed to delete schedule from DB:",I.message))}}function M(N){e.schedules.forEach(c=>{c.date===N&&(c.status="converted")}),e.emit("scheduleChanged")}function B(N){const c=e.warehouseInventory.find(w=>w.material===N&&w.palletsAvailable>0);return c&&c.qtyPerPallet?c.qtyPerPallet:e.palletQtyMap[N]||1}function j(N,c){e.palletQtyMap[N]=c,e.emit("palletChanged"),e.safeFetch(`${e.API_BASE}/master/pallet-qty/${encodeURIComponent(N)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({qtyPerPallet:c})}).catch(w=>console.error("Error updating pallet qty",w))}function O(){return{...e.palletQtyMap||{}}}function q(){return[...e.linePerSku||[]]}function G(N){return e.linePerSku.filter(c=>c.skuId===N).map(c=>c.line)}function J(N){return e.linePerSku.filter(c=>c.line===N).map(c=>c.skuId)}function Q(N,c){if(e.linePerSku.find(R=>R.skuId===N&&R.line===c))return!1;e.linePerSku.push({skuId:N,line:c}),e.emit("linePerSkuChanged");const I=e.skuList.find(R=>R.id===N||R.code===N),z=I?I.id:N;return e.safeFetch(`${e.API_BASE}/master/line-sku`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({skuId:z,line:c})}).catch(R=>console.error("Error adding line mapping",R)),!0}function K(N,c){const w=e.skuList.find(z=>z.id===N||z.code===N),I=w?w.id:N;e.safeFetch(`${e.API_BASE}/master/line-sku/${I}/${c}`,{method:"DELETE"}).then(z=>{if(!z.ok)throw new Error("Gagal menghapus line mapping");return e.loadMasterDataFromAPI()}).catch(z=>{console.error("Error deleting line mapping",z),alert(z.message)})}function Z(N){return N==null?"0":N.toLocaleString("id-ID")}function ae(N){if(!N)return"-";let c;if(N instanceof Date)c=N;else if(typeof N=="string"){const w=N.includes("T")?N:N+"T00:00:00";c=new Date(w)}else c=new Date(N);return isNaN(c.getTime())?"Invalid Date":c.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}function U(N){if(!N)return"";const c=new Date(N);return isNaN(c.getTime())?"":c.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",hour12:!1})}function V(N,c=2){return typeof N!="number"?"0":N%1===0?Z(N):N.toFixed(c)}async function _(N={}){try{const c=new URLSearchParams;N.material&&N.material!=="ALL"&&c.append("material",N.material),N.block&&N.block!=="ALL"&&c.append("block",N.block),N.row&&N.row!=="ALL"&&c.append("row",N.row),N.startDate&&c.append("startDate",N.startDate),N.endDate&&c.append("endDate",N.endDate),N.line&&N.line!=="ALL"&&c.append("line",N.line),N.sku&&N.sku!=="ALL"&&c.append("sku",N.sku);const w=c.toString()?`?${c.toString()}`:"",I=await e.safeFetch(`${e.API_BASE}/transit/report/mutation${w}`);if(I.ok){const z=await I.json();e.stockMutations=z.reportList||[],e.transitMutationReportRaw=z,e.emit("mutationsLoaded")}else e.transitMutationReportRaw={reportList:[],summary:{}}}catch(c){console.warn("Failed to load stock mutations from API",c),e.transitMutationReportRaw={reportList:[],summary:{}}}}e.getNextBarcodeRange=P,e.getNextMID=S,e.getWarehouseStock=L,e.addWarehouseStock=$,e.deleteWarehouseStock=m,e.getSKU=l,e.getBOM=o,e.getUniqueDates=d,e.getMaterialUOM=a,e.getShiftSummary=r,e.applyRounding=t,e.getStockBalanceForDate=y,e.getMaterialRequirements=T,e.getHourlyDistribution=x,e.getMergedHourlyDistribution=H,e.getStats=A,e.getDailyProduction=f,e.getRecentSchedules=E,e.addSKU=g,e.updateSKU=h,e.deleteSKU=i,e.addBOMComponent=n,e.updateBOMComponent=k,e.deleteBOMComponent=C,e.addSchedules=u,e.updateScheduleCell=v,e.deleteSchedule=D,e.markDateConverted=M,e.getPalletQty=B,e.setPalletQty=j,e.getAllPalletQty=O,e.getLinePerSku=q,e.getLinesForSku=G,e.getSkusForLine=J,e.addLinePerSku=Q,e.deleteLinePerSku=K,e.formatNumber=Z,e.formatDate=ae,e.formatTime=U,e.formatDecimal=V,e.loadStockMutationsFromAPI=_,e._allocateFromWMS=p})(window.PMCStore);(e=>{e.API_BASE,e.emit;async function b(){try{const c=await e.safeFetch(`${e.API_BASE}/production/stock`);if(c.ok){const w=await c.json();let I={};w.forEach(z=>{I[z.line]||(I[z.line]={}),I[z.line][z.materialName]={qty:z.qtyPallets,pcs:parseFloat(z.pcs||0)}}),e.lineStock=I,e.emit("stockChanged")}}catch(c){console.warn("Failed to load line stock",c)}}async function P(){try{const c=await e.safeFetch(`${e.API_BASE}/production/barcodes`);if(c.ok){const w=await c.json();e.lineBarcodes=w.map(I=>({...I,material:I.materialName}))}}catch(c){console.warn("Failed to load line barcodes",c)}}async function S(){try{const c=await e.safeFetch(`${e.API_BASE}/production/returns/pending`);if(c.ok){const w=await c.json();e.pendingReturns=w.map(I=>({...I,material:I.materialName})),e.emit("returnsChanged")}}catch(c){console.warn("Failed to load pending returns",c)}}async function L(){try{const c=await e.safeFetch(`${e.API_BASE}/transit/inventory`);if(c.ok){const w=await c.json();e.transitInventory=(w||[]).map(I=>({...I,material:I.materialName,rowId:I.blockRowId})),e.emit("transitChanged")}}catch(c){console.warn("Failed to load transit inventory",c)}}function $(){return JSON.parse(JSON.stringify(e.blockLayout))}function m(c){e.blockLayout=JSON.parse(JSON.stringify(c)),e.emit("layoutChanged");const w=c.map(I=>({blockNumber:I.blockNumber||I.id,skuCategories:I.skuCategories||[],rows:I.rows.map(z=>({rowNumber:z.rowNumber||z.id,materialName:z.material,maxPallets:z.maxPallets,assignedLines:z.lines||z.assignedLines||[],isFlexible:z.isFlexible||!1}))}));e.safeFetch(`${e.API_BASE}/master/block-layout`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({layout:w})}).then(I=>{if(!I.ok)throw new Error("Failed to save layout to DB");return e.loadTransitLayoutFromAPI()}).catch(I=>{console.error(I),alert("Opsi simpan gagal ke database: "+I.message)})}function l(c){if(!e.stockChecks[c])e.stockChecks[c]={blocks:e.blockLayout.map(w=>({id:w.id,rows:w.rows.filter(I=>I.material!=="").map(I=>({id:I.id,material:I.material,maxPallets:I.maxPallets,pallets:Array.from({length:I.maxPallets},()=>"")}))}))};else{const w=e.stockChecks[c].blocks;e.blockLayout.forEach(I=>{let z=w.find(R=>R.id===I.id);z||(z={id:I.id,rows:[]},w.push(z)),z.items&&!z.rows&&(z.rows=[],delete z.items),z.rows||(z.rows=[]),I.rows.forEach(R=>{if(R.material!==""){let F=z.rows.find(W=>W.id===R.id);if(!F)z.rows.push({id:R.id,material:R.material,maxPallets:R.maxPallets,pallets:Array.from({length:R.maxPallets},()=>"")});else if(F.material=R.material,F.maxPallets=R.maxPallets,F.pallets.length<R.maxPallets){const W=R.maxPallets-F.pallets.length;F.pallets.push(...Array.from({length:W},()=>""))}else F.pallets.length>R.maxPallets&&(F.pallets.length=R.maxPallets)}}),z.rows=z.rows.filter(R=>I.rows.some(F=>F.id===R.id&&F.material!=="")),z.rows.sort((R,F)=>R.id-F.id)}),e.stockChecks[c].blocks=w.filter(I=>e.blockLayout.some(z=>z.id===I.id)),e.stockChecks[c].blocks.sort((I,z)=>{const R=e.blockLayout.find(Y=>Y.id===I.id),F=e.blockLayout.find(Y=>Y.id===z.id),W=R&&R.blockNumber?R.blockNumber:999,te=F&&F.blockNumber?F.blockNumber:999;return W-te})}return e.stockChecks[c]}function o(c,w){e.stockChecks[c]={blocks:JSON.parse(JSON.stringify(w))};const I=[];w.forEach(z=>{(z.rows||[]).forEach(R=>{R.id&&R.pallets&&R.pallets.forEach((F,W)=>{F!==""&&F!==null&&F!==void 0&&I.push({blockRowId:R.id,palletIndex:W,quantity:String(F)})})})}),e.safeFetch(`${e.API_BASE}/transit/stock-check/${c}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({entries:I})}).then(async z=>{if(z.ok)await e.loadTransitInfoFromAPI(),typeof e.loadStockMutationsFromAPI=="function"&&await e.loadStockMutationsFromAPI(),e.emit("transitChanged"),e.emit("stockChanged");else{const R=await z.json();console.warn("Failed to save stock check to API:",R)}}).catch(z=>console.error("Error saving stock check:",z))}async function d(){try{const c=await e.safeFetch(`${e.API_BASE}/transit/info?t=${Date.now()}`);c.ok&&(e.transitInfoCache=await c.json(),e.transitStock={},e.transitInfoCache.blocks&&e.transitInfoCache.blocks.forEach(I=>{e.transitStock[I.id]={},I.rows.forEach(z=>{e.transitStock[I.id][z.id]={material:z.material,qty:z.qty,pcs:z.qty*e.getPalletQty(z.material)}})}));const w=await e.safeFetch(`${e.API_BASE}/transit/used-barcodes`);if(w.ok){const I=await w.json();Array.isArray(I)&&I.forEach(z=>e.usedBarcodes.add(z.barcode))}}catch(c){console.warn("Error fetching transit info/used barcodes:",c)}await e.loadTransitInventoryFromAPI()}async function a(){try{const c=await e.safeFetch(`${e.API_BASE}/master/material-receh`);if(c.ok){const w=await c.json();e.materialReceh=w.map(I=>I.materialName),e.emit("configChanged")}}catch(c){console.warn("Error fetching material receh list:",c)}}async function r(c,w=1,I="-",z=null,R="Gudang -> Transit",F="-"){try{const te=await(await e.safeFetch(`${e.API_BASE}/transit/receive`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({material:c,qtyPallet:w,barcode:I,actualPcs:z,source:R,supplier:F})})).json();return te.success?(await e.loadTransitInfoFromAPI(),e.usedBarcodes.add(I),e.emit("transitChanged"),te):{success:!1,message:te.message||"Gagal tersimpan di database"}}catch(W){return console.error("Transit API error:",W),{success:!1,message:W.message}}}function t(c,w=1){const I={},z=e.activeDeliveries.filter(W=>W.status==="preparing"||W.status==="delivering");for(const W of z)if(W.scans){for(const te of W.scans)if(te.targetBlockRowId&&!e.usedBarcodes.has(te.barcode)){const Y=te.qtyPallet||1;I[te.targetBlockRowId]=(I[te.targetBlockRowId]||0)+Y}}let R=[];for(const W of e.blockLayout)for(const te of W.rows)if(!te.isFlexible&&te.material===c){e.transitStock[W.id]||(e.transitStock[W.id]={}),e.transitStock[W.id][te.id]||(e.transitStock[W.id][te.id]={material:null,qty:0});const Y=e.transitStock[W.id][te.id],X=Y.qty,ee=I[te.id]||0,ne=X+ee;(Y.material===c||Y.material===null||Y.qty===0)&&R.push({block:W,row:te,qty:ne,physicalQty:X,reservedQty:ee,maxPallets:te.maxPallets})}if(R.length===0)return null;R.sort((W,te)=>W.qty-te.qty);const F=W=>{const te=W.block.blockNumber!==void 0&&W.block.blockNumber!==null?W.block.blockNumber:W.block.id?W.block.id.split("-")[0]:"?",Y=W.row.rowNumber!==void 0&&W.row.rowNumber!==null?W.row.rowNumber:W.row.id?W.row.id.split("-")[0]:"?";return{blockId:te,rowId:Y,_originalBlockId:W.block.id,_originalRowId:W.row.id}};for(const W of R)if(W.qty+w<=W.maxPallets)return{...F(W),isFull:!1};return{...F(R[0]),isFull:!0}}async function s(c,w=1,I=null,z=null){try{const F=await(await e.safeFetch(`${e.API_BASE}/transit/take`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({material:c,qty:w,line:I,skuId:z})})).json();return F.success?(await e.loadTransitInfoFromAPI(),e.emit("transitChanged"),F):{success:!1,message:F.message||"Gagal tersimpan di database"}}catch(R){return console.error("Take API error:",R),{success:!1,message:R.message}}}function y(){return e.transitInfoCache}function p(c={}){return e.transitMutationReportRaw||{reportList:[],summary:{}}}function T(){return e.lineMutationReportRaw||{reportList:[]}}function x(c){if(!c)return c;let w=c.compositeKey;!w&&c.date&&c.shiftKey&&c.slotId&&(w=`${c.date}_${c.shiftKey}_${c.slotId}`);const I=(c.items||[]).map(z=>{const R=(c.scans||[]).filter(F=>F.deliveryItemId===z.id).map(F=>({...F,barcode:F.barcode,pcs:parseFloat(F.pcs)||0,qtyPallet:parseFloat(F.qtyPallet)||0}));return{...z,material:z.materialName||z.material,required:parseFloat(z.requiredPallets||z.required||0),scanned:parseFloat(z.scannedPallets||z.scanned||0),scans:R,details:[]}});return{...c,compositeKey:w,items:I}}async function H(){try{const c=await e.safeFetch(`${e.API_BASE}/delivery`);if(c.ok){const w=await c.json();Array.isArray(w)?e.activeDeliveries=w.map(x):e.activeDeliveries=[],e.emit("deliveryChanged")}}catch(c){console.warn("Error fetching active deliveries",c)}}async function A(c,w,I,z=!1){const R=`${c}_${w}_${I}`;let F=e.activeDeliveries.find(Y=>Y.compositeKey===R);if(F&&!z)return F;const W=await e.getHourlyDistribution(c),te=[];(Array.isArray(W)?W:[]).forEach(Y=>{const X=Y.slots[w]&&Y.slots[w][I-1];if(X&&(X.details&&X.details.length>0||X.pallets>0)){let ee=0;if(X.details&&X.details.length>0)ee=X.details.length;else{const ne=e.getPalletQty(Y.name);ee=ne>0?Math.ceil(X.pallets/ne):0}ee>0&&te.push({material:Y.name,required:ee})}});try{const Y=z?`/delivery/${encodeURIComponent(R)}/refresh`:"/delivery/create",X=await e.safeFetch(`${e.API_BASE}${Y}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date:c,shiftKey:w,slotId:parseInt(I),items:te})});if(X.ok){const ee=await X.json();return await H(),e.activeDeliveries.find(ne=>ne.compositeKey===R)||x(ee)}}catch(Y){console.error("Delivery API Error:",Y)}return null}async function f(c,w,I){return A(c,w,I,!0)}function E(){return e.activeDeliveries}async function g(c,w,I="-",z=1,R="",F=null){try{let W=0;I&&I!=="-"?W=1:(W=e._allocateFromWMS(w,z).batches.reduce((ee,ne)=>ee+ne.pallets,0),W===0&&(W=1));const Y=await(await e.safeFetch(`${e.API_BASE}/delivery/${encodeURIComponent(c)}/scan`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({material:w,barcode:I,qtyPallet:W,pcs:z,supplier:R,targetBlockRowId:F})})).json();return Y.success&&await e.loadActiveDeliveriesFromAPI(),Y}catch(W){return console.error("Scan delivery error:",W),{success:!1,message:W.message}}}function h(c,w,I){if(w<=0)return[];let z=[];if(I&&I!=="-"){const R=e.warehouseInventory.findIndex(F=>F.material===c&&F.palletsAvailable>0&&(F.barcodes&&F.barcodes.includes(I)||F.barcodeStart===I||F.barcode===I));if(R!==-1){let F=Math.min(e.warehouseInventory[R].palletsAvailable,w);z.push({...e.warehouseInventory[R],palletsAvailable:F,id:null}),e.warehouseInventory[R].palletsAvailable-=F,e.warehouseInventory[R].palletsAvailable<=0&&e.warehouseInventory.splice(R,1)}}else{let R=w;for(let F=0;F<e.warehouseInventory.length&&R>0;F++){let W=e.warehouseInventory[F];if(W.material===c&&W.palletsAvailable>0){let te=Math.min(W.palletsAvailable,R);z.push({...W,palletsAvailable:te,id:null}),R-=te,W.palletsAvailable-=te}}e.warehouseInventory=e.warehouseInventory.filter(F=>F.palletsAvailable>0)}return e.emit("warehouseStockChanged"),z}async function i(c){try{const I=await(await e.safeFetch(`${e.API_BASE}/delivery/${encodeURIComponent(c)}/validate`,{method:"POST",headers:{"Content-Type":"application/json"}})).json();return I.success&&(await e.loadActiveDeliveriesFromAPI(),await e.loadWarehouseStockFromAPI(),await e.loadTransitInfoFromAPI()),I}catch(w){return console.error("Validate delivery error:",w),{success:!1,message:w.message}}}async function n(c){if(!c||c==="-")return!1;try{const w=await e.safeFetch(`${e.API_BASE}/delivery/barcode-check/${encodeURIComponent(c)}`);if(w.ok){const I=await w.json();if(I.found&&I.data)return I.data}}catch(w){console.error("Barcode check fail:",w)}return!1}async function k(c,w,I="-"){if(I&&I!=="-"&&e.usedBarcodes.has(I))return{success:!1,message:`Barcode ${I} sudah pernah diterima di area transit. Tidak bisa digunakan lagi.`};let z="-",R=0;if(I&&I!=="-"){const W=await n(I);if(!W)return{success:!1,message:`Barcode ${I} tidak ada di pengiriman aktif dari gudang.`};R=1,W.scan&&W.scan.supplier&&(z=W.scan.supplier)}else{const W=_allocateFromWMS(c,w);R=W.batches.reduce((te,Y)=>te+Y.pallets,0),R===0&&(R=1),W.batches.length>0&&(z=W.batches[0].supplier)}const F=await e.receiveToTransit(c,R,I,w,"Gudang -> Transit",z);if(F.success){try{await e.safeFetch(`${e.API_BASE}/warehouse/consume`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({material:c,qtyPallet:R,barcode:I})})}catch(ee){console.warn("Gagal memotong stok WMS di backend",ee)}const W=h(c,R,I),te=new Date,Y=te.toISOString().split("T")[0],X=te.toLocaleTimeString("id-ID",{hour12:!1});if(W.forEach(ee=>{e.transitInventory.push({id:"TI-"+Date.now()+"-"+Math.random().toString(36).substr(2,5),material:ee.material,barcode:ee.barcode||ee.barcodeStart||I||"-",mid:ee.mid||"-",dateInGudang:ee.dateIn||"-",dateInTrans:Y,timeInTrans:X,palletsAvailable:ee.palletsAvailable,supplier:ee.supplier||"-",blockId:F.blockId||null,rowId:F.rowId||null})}),F.qtyPallet=R,I&&I!=="-"){e.usedBarcodes.add(I);const ee=await n(I);let ne=!1,se=0;if(ee&&ee.delivery){const oe=e.activeDeliveries.find(re=>re.id===ee.delivery.id);if(oe&&oe.items){let re=0,ie=0;oe.items.forEach(le=>{ie+=le.required||le.planned||0,le.scans&&le.scans.forEach(ce=>{ce.barcode&&ce.barcode!=="-"&&e.usedBarcodes.has(ce.barcode)&&re++})}),se=ie-re,ie>0&&re>=ie&&(oe.status="completed",ne=!0,e.emit("deliveryChanged"))}}F.deliveryCompleted=ne,F.remainingPallets=se}}return F}function C(){return e.lineStock}function u(c){return c?e.lineBarcodes.filter(w=>w.line===c):e.lineBarcodes}async function v(c,w,I,z){try{const F=await(await e.safeFetch(`${e.API_BASE}/production/receive`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({line:c,material:w,barcode:I,pcs:z})})).json();return F.success&&(await e.loadTransitInfoFromAPI(),await e.loadLineStockFromAPI(),await e.loadLineBarcodesFromAPI()),F}catch(R){return console.error("Receive to line error:",R),{success:!1,message:R.message}}}async function D(c,w,I,z){try{const F=await(await e.safeFetch(`${e.API_BASE}/production/receive-partial`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({line:c,material:w,barcode:I,pcs:z})})).json();return F.success&&(await e.loadTransitInfoFromAPI(),await e.loadLineStockFromAPI(),await e.loadLineBarcodesFromAPI()),F}catch(R){return console.error("Receive partial to line error:",R),{success:!1,message:R.message}}}async function M(c,w,I,z){try{const F=await(await e.safeFetch(`${e.API_BASE}/production/return`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({barcode:c,pcs:w,targetBlockRowId:I,condition:z})})).json();return F.success&&(e.usedBarcodes.delete(c),await e.loadLineStockFromAPI(),await e.loadLineBarcodesFromAPI(),await e.loadPendingReturnsFromAPI()),F}catch(R){return console.error("Return from line error:",R),{success:!1,message:R.message}}}async function B(c,w,I,z){try{const F=await(await e.safeFetch(`${e.API_BASE}/production/reject`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({line:c,materialName:w,pcs:I,reason:z})})).json();return F.success,F}catch(R){return console.error("Reject from line error:",R),{success:!1,message:R.message}}}async function j(c={}){try{const w=new URLSearchParams;c.line&&w.append("line",c.line);const I=await e.safeFetch(`${e.API_BASE}/production/opname?${w.toString()}`);if(!I.ok)throw new Error("API fetch error");return await I.json()}catch(w){return console.error("Get line opnames error:",w),[]}}async function O(c){try{const I=await(await e.safeFetch(`${e.API_BASE}/production/opname`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)})).json();return I.success&&await e.loadLineStockFromAPI(),I}catch(w){return console.error("Save line opname error:",w),{success:!1,message:w.message}}}async function q(c,w,I,z){try{const F=await(await e.safeFetch(`${e.API_BASE}/production/opname/${encodeURIComponent(c)}/item/${encodeURIComponent(w)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({newQtyPhysical:I,editedBy:z})})).json();return F.success&&await e.loadLineStockFromAPI(),F}catch(R){return console.error("Update opname item error:",R),{success:!1,message:R.message}}}async function G(c=""){try{const w=await e.safeFetch(`${e.API_BASE}/production/reject?date=${c}`);if(!w.ok)throw new Error("API fetch error");return await w.json()}catch(w){return console.error("Get line rejects error:",w),[]}}async function J(c,w,I){try{const R=await(await e.safeFetch(`${e.API_BASE}/production/reject/${encodeURIComponent(c)}/verify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:w,finalPcs:I})})).json();return R.success&&(await e.loadLineStockFromAPI(),await e.loadLineBarcodesFromAPI()),R}catch(z){return console.error("Verify line reject error:",z),{success:!1,message:z.message}}}async function Q(c,w){try{const z=await(await e.safeFetch(`${e.API_BASE}/production/returns/${encodeURIComponent(c)}/verify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:w})})).json();return z.success&&(await e.loadPendingReturnsFromAPI(),await e.loadTransitInfoFromAPI(),await e.loadLineStockFromAPI(),await e.loadLineBarcodesFromAPI()),z}catch(I){return console.error("Verify return error:",I),{success:!1,message:I.message}}}async function K(c={},w=1,I=50){try{const z=new URLSearchParams;c.material&&z.append("material",c.material),c.startDate&&z.append("startDate",c.startDate),c.endDate&&z.append("endDate",c.endDate),c.line&&z.append("line",c.line),z.append("page",String(w)),z.append("limit",String(I));const R=await e.safeFetch(`${e.API_BASE}/production/mutations?${z.toString()}`);if(R.ok){const F=await R.json();e.lineMutations=F.data||F||[],e.emit("lineMutationsLoaded")}}catch(z){console.error("Failed to load line mutations from API",z)}}async function Z(c={}){try{const w=new URLSearchParams;c.material&&w.append("material",c.material),c.startDate&&w.append("startDate",c.startDate),c.endDate&&w.append("endDate",c.endDate),c.line&&w.append("line",c.line);const I=await e.safeFetch(`${e.API_BASE}/production/report/mutation?${w.toString()}`);if(I.ok){const z=await I.json();e.lineMutationReportRaw=z||{reportList:[]},e.emit("lineMutationReportLoaded")}}catch(w){console.error("Failed to load line mutation report:",w),e.lineMutationReportRaw={reportList:[]}}}async function ae(c,w,I,z){try{const F=await(await e.safeFetch(`${e.API_BASE}/production/return-sisa`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({line:c,materialName:w,pcs:I,targetBlockRowId:z})})).json();return F.success&&(await e.loadLineStockFromAPI(),await e.loadLineBarcodesFromAPI(),await e.loadPendingReturnsFromAPI()),F}catch(R){return console.error("Return sisa from line error:",R),{success:!1,message:R.message}}}async function U(c){try{return await(await e.safeFetch(`${e.API_BASE}/transit/opname`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)})).json()}catch(w){return console.error("Save transit opname error:",w),{success:!1,message:w.message}}}async function V(c={}){try{const w=new URLSearchParams;c.blockId&&w.append("blockId",c.blockId);const I=await e.safeFetch(`${e.API_BASE}/transit/opname?${w.toString()}`);if(!I.ok)throw new Error("API fetch error");return await I.json()}catch(w){return console.error("Get transit opnames error:",w),[]}}async function _(c,w,I){try{return await(await e.safeFetch(`${e.API_BASE}/transit/opname/${encodeURIComponent(c)}/item/${encodeURIComponent(w)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({newQtyPhysical:I})})).json()}catch(z){return console.error("Update transit opname item error:",z),{success:!1,message:z.message}}}async function N(c={}){try{const w=new URLSearchParams;c.startDate&&w.append("startDate",c.startDate),c.endDate&&w.append("endDate",c.endDate),c.area&&w.append("area",c.area);const I=await e.safeFetch(`${e.API_BASE}/opname/recap?${w.toString()}`);if(!I.ok)throw new Error("API fetch error");return await I.json()}catch(w){return console.error("Get opname recap error:",w),{lines:[],rows:[]}}}e.loadLineMutationsFromAPI=K,e.loadLineMutationReportFromAPI=Z,e.loadLineStockFromAPI=b,e.loadLineBarcodesFromAPI=P,e.loadPendingReturnsFromAPI=S,e.loadTransitInventoryFromAPI=L,e.getBlockLayout=$,e.saveBlockLayout=m,e.getStockCheck=l,e.saveStockCheck=o,e.loadTransitInfoFromAPI=d,e.loadMaterialRecehFromAPI=a,e.receiveToTransit=r,e.predictTransitAllocation=t,e.takeFromTransit=s,e.getTransitInfo=y,e.getMutationReport=p,e.getLineMutationReport=T,e.loadActiveDeliveriesFromAPI=H,e.getOrCreateDelivery=A,e.refreshDelivery=f,e.getActiveDeliveries=E,e.loadActiveDeliveriesFromAPI=H,e.scanDeliveryItem=g,e.validateDelivery=i,e.isBarcodeInActiveDelivery=n,e.receiveAndConsumeWMS=k,e.getLineStock=C,e.getLineBarcodes=u,e.receiveToLine=v,e.receivePartialToLine=D,e.returnFromLine=M,e.returnSisaFromLine=ae,e.rejectFromLine=B,e.getLineRejects=G,e.verifyLineReject=J,e.verifyReturn=Q,e.saveLineOpname=O,e.getLineOpnames=j,e.updateOpnameItem=q,e.saveTransitOpname=U,e.getTransitOpnames=V,e.updateTransitOpnameItem=_,e.getOpnameRecap=N})(window.PMCStore);(e=>{e.API_BASE,e.emit,e.safeFetch;async function b(){try{const g=await e.safeFetch(`${e.API_BASE}/transit/outbound/pending`);g.ok&&(e.transitOutboundPending=await g.json(),e.emit("outboundPendingChanged"))}catch(g){console.warn("Error fetching transit outbound pending:",g)}}async function P(g,h,i=null){try{const k=await(await e.safeFetch(`${e.API_BASE}/transit/outbound`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({barcode:g,destination:h,targetLine:i})})).json();return k.success&&(await e.loadTransitInfoFromAPI(),await e.loadTransitOutboundPendingFromAPI(),e.emit("stockChanged")),k}catch(n){return console.error("Request transit outbound error:",n),{success:!1,message:n.message}}}async function S(g,h){try{const n=await(await e.safeFetch(`${e.API_BASE}/warehouse/outbound`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({barcode:g,destination:h})})).json();return n.success&&(await e.loadWarehouseStockFromAPI(),await e.loadTransitOutboundPendingFromAPI(),e.emit("stockChanged")),n}catch(i){return console.error("Request warehouse outbound error:",i),{success:!1,message:i.message}}}async function L(g,h){try{const n=await(await e.safeFetch(`${e.API_BASE}/transit/outbound/${encodeURIComponent(g)}/verify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:h})})).json();return n.success&&(await e.loadTransitOutboundPendingFromAPI(),await e.loadWarehouseStockFromAPI(),await e.loadTransitInfoFromAPI(),e.emit("stockChanged")),n}catch(i){return console.error("Verify transit outbound error:",i),{success:!1,message:i.message}}}function $(g){return e.externalOnhand[g]||{stock:{},barcodes:[]}}function m(g){const h=e.schedules.filter(n=>n.date===g),i={};return h.forEach(n=>{const k=e.getBOM(n.skuId);k&&k.components.forEach(C=>{const u=n.line+"_"+C.name;i[u]||(i[u]={line:n.line,material:C.name,sh1:0,sh2:0,sh3:0,buffer:0});const v=e.applyRounding(n.sh1*C.coefficient,C.rounding),D=e.applyRounding(n.sh2*C.coefficient,C.rounding),M=e.applyRounding(n.sh3*C.coefficient,C.rounding),B=(n.sh1>0?1:0)+(n.sh2>0?1:0)+(n.sh3>0?1:0),j=B===0?1:B,q=(n.sh1+n.sh2+n.sh3)/j/7*2,G=e.applyRounding(q*C.coefficient,C.rounding);i[u].sh1+=v,i[u].sh2+=D,i[u].sh3+=M,i[u].buffer+=G})}),Object.values(i)}function l(){e.getTransitInfo();const g={};for(const h in e.transitStock)for(const i in e.transitStock[h]){const n=e.transitStock[h][i];if(!n.material||n.qty<=0)continue;const k=e.blockLayout.find(C=>String(C.id)===String(h));if(k){const C=k.rows.find(u=>String(u.id)===String(i));if(C&&C.lines&&C.lines.length>0)C.lines.forEach(u=>{const v=u+"_"+n.material;g[v]||(g[v]={qty:0,pcs:0}),g[v].qty+=n.qty,g[v].pcs+=n.pcs||0});else{const u="UNASSIGNED_"+n.material;g[u]||(g[u]={qty:0,pcs:0}),g[u].qty+=n.qty,g[u].pcs+=n.pcs||0}}}return g}function o(){const g=new Date;g.getHours()*60+g.getMinutes()<420&&g.setDate(g.getDate()-1);const h=g.getFullYear(),i=String(g.getMonth()+1).padStart(2,"0"),n=String(g.getDate()).padStart(2,"0");return`${h}-${i}-${n}`}async function d(g){const h=g||o();let i=[];try{i=m(h)}catch(u){console.warn("Priority lineReqs error:",u)}const n={};i.forEach(u=>{n[u.material]||(n[u.material]={buffer:0,hasSchedule:!1}),n[u.material].buffer+=u.buffer,(u.sh1>0||u.sh2>0||u.sh3>0)&&(n[u.material].hasSchedule=!0)});const k=e.getBlockLayout(),C=[];return k.forEach(u=>{u.rows.forEach(v=>{if(!v.material)return;const D=v.lines&&v.lines.length>0?v.lines:v.assignedLines&&v.assignedLines.length>0?v.assignedLines:[];let M=0,B=!1;if(D.length>0&&D.forEach(c=>{const w=i.find(I=>I.line===c&&I.material===v.material);w&&(M+=w.buffer,(w.sh1>0||w.sh2>0||w.sh3>0)&&(B=!0))}),M<=0&&n[v.material]&&(M=n[v.material].buffer,B=n[v.material].hasSchedule),!B||M<=0)return;const j=M,O=Math.ceil(j/2),q=e.getPalletQty(v.material)||1,G=Math.ceil(O/q),J=Math.ceil(j/q),Q=O,K=j,Z=e.transitStock,ae=Z[u.id]&&Z[u.id][v.id],U=ae?ae.pcs||(ae.qty||0)*q:0;let V=0;e.activeDeliveries.forEach(c=>{if(c.status==="delivering"||c.status==="preparing"){const w=c.items.find(I=>I.material===v.material);w&&(V+=w.scanned*q)}});const _=U<Q,N=U<K&&!_;(_||N)&&C.push({material:v.material,blockLabel:`B${u.blockNumber||u.id}.${v.rowNumber||v.id}`,actual:Math.round(U),incoming:Math.round(V),bufferPallets:_?G:J,palletQty:q,status:_?"KRITIS":"WARNING"})})}),C.sort((u,v)=>u.status==="KRITIS"&&v.status!=="KRITIS"?-1:1),C}function a(g){if(!g)return"-";const h=e.warehouseInventory.find(i=>(i.material===g||i.materialName===g)&&i.supplier&&i.supplier!=="-");if(h)return h.supplier;for(const i of e.bomData)if(i.components&&i.components.some(n=>n.name===g)){const n=e.getSKU(i.skuId);if(n&&n.supplierName)return n.supplierName}return"-"}function r(g){const h=e.transitInventory.findIndex(n=>n.id===g);if(h===-1)return{success:!1,message:"Item tidak ditemukan"};const i=e.transitInventory[h];return e.transitStock[i.material]!==void 0&&(e.transitStock[i.material]=Math.max(0,(e.transitStock[i.material]||0)-(i.palletsAvailable||1)),e.transitStock[i.material]===0&&delete e.transitStock[i.material]),e.transitInventory.splice(h,1),e.emit("transitChanged"),{success:!0,message:"Item berhasil dihapus dari Transit"}}async function t(g,h){try{return await(await e.safeFetch(`${e.API_BASE}/transit/relocate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({barcode:g,targetBlockRowId:h})})).json()}catch(i){return{success:!1,message:"Gagal menghubungi server: "+i.message}}}function s(){return e.transitInventory=[],e.transitStock={},e.emit("transitChanged"),{success:!0,message:"Semua stok Transit berhasil dihapus"}}async function y(g,h,i=null,n=null){if(!i||!n)throw new Error("Reconcile requires specific Block and Row.");const k=new Date().toISOString().split("T")[0],C=[{blockRowId:n,palletIndex:0,quantity:String(h)}];try{const u=await e.safeFetch(`${e.API_BASE}/transit/stock-check/${k}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({entries:C})}),v=await u.json();return u.ok?(await e.loadTransitInfoFromAPI(),typeof e.loadStockMutationsFromAPI=="function"&&await e.loadStockMutationsFromAPI(),e.emit("transitChanged"),e.emit("stockChanged"),{success:!0}):{success:!1,message:v.message||"Gagal sinkronisasi"}}catch(u){return console.error("Reconcile error:",u),{success:!1,message:u.message}}}async function p(g,h=1,i=50){try{const n=new URL(`${e.API_BASE}/manual-spb`);g&&n.searchParams.append("status",g),n.searchParams.append("page",h),n.searchParams.append("limit",i);const k=await e.safeFetch(n);if(!k.ok)throw new Error("Gagal mengambil data SPB Manual");const C=await k.json();return C.data||C}catch(n){return console.error("getManualSpbs error:",n),[]}}async function T(g){try{return await(await e.safeFetch(`${e.API_BASE}/manual-spb`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(g)})).json()}catch(h){return console.error("saveManualSpb error:",h),{success:!1,message:h.message}}}async function x(g){try{return await(await e.safeFetch(`${e.API_BASE}/manual-spb/${g}`,{method:"DELETE"})).json()}catch(h){return console.error("deleteManualSpb error:",h),{success:!1,message:h.message}}}async function H(g,h,i,n,k){try{const u=await(await e.safeFetch(`${e.API_BASE}/manual-spb/${g}/process`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({barcode:h,pcs:i,supplier:n,targetBlockRowId:k})})).json();return u.success&&e.emit("deliveryChanged"),u}catch(C){return console.error("scanManualSpbItem error:",C),{success:!1,message:C.message}}}async function A(g){try{const h=await e.safeFetch(`${e.API_BASE}/manual-spb/receive?barcode=${encodeURIComponent(g)}`);return h.ok?await h.json():null}catch(h){return console.error("isBarcodeInActiveManualSpb error:",h),null}}async function f(g,h){try{const n=await(await e.safeFetch(`${e.API_BASE}/manual-spb/receive`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({barcode:g,actualPcs:h})})).json();return n&&n.success&&(await e.loadTransitInfoFromAPI(),e.emit("transitChanged"),e.emit("stockChanged")),n}catch(i){return console.error("receiveManualSpbScan error:",i),{success:!1,message:i.message}}}async function E(g,h){h||(h=e.getLogicalDateStr());const i=await e.getHourlyDistribution(h);let n=0;i&&i.length>0&&i.forEach(D=>{D.slots&&D.slots[g]&&D.slots[g].forEach(M=>{n+=M.pallets||0})});const k=e.activeDeliveries,C=`${h}_${g}`,u=k.filter(D=>!!(D.compositeKey&&D.compositeKey.startsWith(C)||D.date===h&&D.shiftKey===g));let v=0;return u.forEach(D=>{let M=1;if(D.compositeKey){const B=D.compositeKey.split("_");B.length>=3&&(M=parseInt(B[2])||1)}(D.items||[]).forEach(B=>{const j=B.materialName||B.material;let O=0;if(B.scans&&B.scans.forEach(q=>{O+=q.qtyPallet||1}),O>0&&i){const q=i.find(G=>G.name===j);if(q&&q.slots&&q.slots[g]&&q.slots[g][M-1]){const G=q.slots[g][M-1].details||[];let J=0;for(let Q=0;Q<Math.min(O,G.length);Q++)J+=G[Q].qty||0;if(O>G.length&&G.length>0){const Q=(q.slots[g][M-1].pallets||0)/G.length;J+=(O-G.length)*Q}v+=J}}})}),n>0?Math.round(v/n*100):0}e.getManualSpbs=p,e.saveManualSpb=T,e.deleteManualSpb=x,e.scanManualSpbItem=H,e.isBarcodeInActiveManualSpb=A,e.receiveManualSpbScan=f,e.calculateShiftProgress=E,e.loadTransitOutboundPendingFromAPI=b,e.requestTransitOutbound=P,e.requestWarehouseOutbound=S,e.verifyTransitOutbound=L,e.getExternalOnhand=$,e.getLineMaterialRequirements=m,e.getTransitStockPerLine=l,e.getLogicalDateStr=o,e.getPriorityAlerts=d,e.getSupplierForMaterial=a,e.deleteTransitInventoryItem=r,e.relocateTransitPallet=t,e.deleteAllTransitInventory=s,e.reconcileStock=y})(window.PMCStore);he.logAuditActivity=async(e,b,P=null)=>{try{const S=localStorage.getItem("pmc_current_user")||"Sistem / Anonymous";await fetch(`${he.API_BASE}/audit/log`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:S,module:e,action:b,details:P})})}catch(S){console.error("Failed to push audit log:",S)}};const de=window.PMCStore;de.loadMasterDataFromAPI();de.loadSchedulesFromAPI();de.loadActiveDeliveriesFromAPI();de.loadTransitInfoFromAPI();de.loadLineStockFromAPI&&de.loadLineStockFromAPI();de.loadLineBarcodesFromAPI&&de.loadLineBarcodesFromAPI();de.loadPendingReturnsFromAPI&&de.loadPendingReturnsFromAPI();de.loadTransitOutboundPendingFromAPI&&de.loadTransitOutboundPendingFromAPI();de.loadStockMutationsFromAPI&&de.loadStockMutationsFromAPI();de.loadTransitInventoryFromAPI&&de.loadTransitInventoryFromAPI();de.loadMaterialRecehFromAPI&&de.loadMaterialRecehFromAPI();const Se=(()=>{const e={SH1:[{id:1,label:"07:30 - 08:30",startMins:450,endMins:510},{id:2,label:"09:00 - 10:00",startMins:540,endMins:600},{id:3,label:"10:30 - 11:30",startMins:630,endMins:690},{id:4,label:"13:00 - 14:00",startMins:780,endMins:840}],SH2:[{id:1,label:"15:30 - 16:30",startMins:930,endMins:990},{id:2,label:"17:00 - 17:30",startMins:1020,endMins:1050},{id:3,label:"19:30 - 20:30",startMins:1170,endMins:1230},{id:4,label:"21:00 - 22:00",startMins:1260,endMins:1320}],SH3:[{id:1,label:"23:30 - 00:30",startMins:1410,endMins:30},{id:2,label:"01:00 - 02:00",startMins:60,endMins:120},{id:3,label:"03:30 - 04:30",startMins:210,endMins:270},{id:4,label:"05:00 - 06:00",startMins:300,endMins:360}]},b={SH1:[{id:1,label:"07:30 - 08:30",startMins:450,endMins:510},{id:2,label:"09:00 - 10:00",startMins:540,endMins:600},{id:3,label:"10:30 - 11:30",startMins:630,endMins:690}],SH2:[{id:1,label:"12:30 - 13:30",startMins:750,endMins:810},{id:2,label:"14:00 - 15:00",startMins:840,endMins:900},{id:3,label:"15:30 - 16:30",startMins:930,endMins:990}],SH3:[{id:1,label:"17:30 - 18:00",startMins:1050,endMins:1080},{id:2,label:"19:30 - 20:30",startMins:1170,endMins:1230},{id:3,label:"21:00 - 22:30",startMins:1260,endMins:1350}]},P={SH1:{start:420,end:900},SH2:{start:900,end:1380},SH3:{start:1380,end:420}},S={SH1:{start:420,end:720},SH2:{start:720,end:1020},SH3:{start:1020,end:1380}};function L(a){return a?new Date(a+"T12:00:00").getDay()===6:!1}function $(a){return L(a)?b:e}function m(a){return L(a)?3:4}function l(a){return L(a)?S:P}function o(a,r){const t=l(a);return t.SH3.start>t.SH3.end?r>=t.SH1.start&&r<t.SH1.end?"SH1":r>=t.SH2.start&&r<t.SH2.end?"SH2":"SH3":r>=t.SH1.start&&r<t.SH1.end?"SH1":r>=t.SH2.start&&r<t.SH2.end?"SH2":r>=t.SH3.start&&r<t.SH3.end?"SH3":"SH1"}function d(a){if(!a)return"";const r=new Date(a+"T12:00:00");return["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][r.getDay()]}return{isSaturday:L,getSlots:$,getGroupCount:m,getShiftRanges:l,detectCurrentShift:o,getDayLabel:d,WEEKDAY_SLOTS:e,SATURDAY_SLOTS:b}})();window.ShiftConfig=Se;const Ee=(()=>{function e({barcodeStart:S,barcodeEnd:L,mid:$,qty:m,materialName:l,dateIn:o,printQty:d=!0}){if(!window.jspdf||!window.jspdf.jsPDF){alert("Library jsPDF belum dimuat. Silakan muat ulang halaman.");return}if(!window.JsBarcode){alert("Library JsBarcode belum dimuat. Silakan muat ulang halaman.");return}const a=S||"",r=L||a,t=a.match(/^(.*?)(\d+)$/),s=r.match(/^(.*?)(\d+)$/);let y=[];if(t&&s&&t[1]===s[1]&&a!==r){const f=t[1],E=parseInt(t[2],10),g=parseInt(s[2],10),h=t[2].length,i=Math.min(E,g),n=Math.max(E,g),k=Math.min(n,i+500);for(let C=i;C<=k;C++)y.push(f+C.toString().padStart(h,"0"))}else y.push(a);const{jsPDF:p}=window.jspdf,T=new p({orientation:"landscape",unit:"mm",format:[60,28]}),x=document.createElement("canvas");for(let f=0;f<y.length;f++){f>0&&T.addPage([60,28],"landscape");const E=y[f];let g=l,h=$,i=m,n=o;if(window.PMCStore){let q=null;Array.isArray(window.PMCStore.transitInventory)&&(q=window.PMCStore.transitInventory.find(G=>G.barcode===E)),!q&&window.PMCStore.getWarehouseStock&&(q=window.PMCStore.getWarehouseStock().find(G=>{if(G.barcode===E||G.barcodeStart===E)return!0;if(G.barcodeStart&&G.barcodeEnd){const J=E.match(/^(.*?)(\d+)$/),Q=G.barcodeStart.match(/^(.*?)(\d+)$/),K=G.barcodeEnd.match(/^(.*?)(\d+)$/);if(J&&Q&&K&&J[1]===Q[1]&&Q[1]===K[1]){const Z=parseInt(J[2],10),ae=parseInt(Q[2],10),U=parseInt(K[2],10);return Z>=Math.min(ae,U)&&Z<=Math.max(ae,U)}}return!1})),q&&(g=q.material||g,h=q.mid||h,i=q.qty||q.qtyPerPallet||i,n=q.dateIn||n)}JsBarcode(x,E,{format:"CODE128",width:3,height:120,displayValue:!1,margin:0});const k=x.toDataURL("image/png");T.setFont("helvetica","bold"),T.setFontSize(6.5),T.text("No. Barcode",21,3,{align:"center"}),T.addImage(k,"PNG",4,4,34,10.5);const C=E.length;let u=9.5;C>20?u=6:C>15&&(u=7.5),T.setFontSize(u),T.text(E,21,17.5,{align:"center"});let v=(g||"").toUpperCase(),D=8;for(T.setFontSize(D);T.getTextWidth(v)>41&&D>3;)D-=.2,T.setFontSize(D);T.text(v,21,21.5,{align:"center"}),T.setFontSize(5.5),T.text("MID:",51.5,3.5,{align:"center"}),T.setFontSize(5);const M=T.splitTextToSize(h||"-",16);T.text(M,51.5,6.5,{align:"center"}),T.setFontSize(5.5),T.text("QTY:",51.5,13.5,{align:"center"});const B=d?(i||"0").toString():" ";T.setFontSize(B.length>5?10:15),T.text(B,51.5,19,{align:"center"}),T.setFontSize(6.5),T.text(d?"PCS":" ",51.5,22.5,{align:"center"});const j=n?new Date(n).toLocaleString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).replace(/\./g,":"):"-",O=new Date().toLocaleString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).replace(/\./g,":");T.setFont("helvetica","normal"),T.setFontSize(4.5),T.text(`Created Date: ${j}`,2,26.5),T.text(`Print Date: ${O}`,58,26.5,{align:"right"})}T.autoPrint();const H=T.output("bloburl");window.open(H,"_blank")||alert("Pop-up diblokir. Harap izinkan pop-up untuk melihat dan mencetak label.")}function b(){let S=document.getElementById("print-label-modal");return S||(S=document.createElement("div"),S.id="print-label-modal",S.className="modal-backdrop",S.style.display="none",S.style.zIndex="9999",S.innerHTML=`
        <div class="modal" style="max-width: 450px; padding: var(--sp-4);">
          <h3 style="margin-bottom: var(--sp-3);">🖨️ Cetak Label Barcode Massal</h3>
          <p style="margin-bottom: var(--sp-4); font-size: 0.9rem; color: var(--text-secondary);">
            Cetak rentang barcode menjadi multi-halaman sekaligus.
          </p>
          
          <div class="form-group" style="margin-bottom: var(--sp-3);">
            <label class="form-label">Material</label>
            <input type="text" id="pl-material" class="form-input" readonly disabled style="background: var(--surface-color);">
          </div>
          
          <div style="display: flex; gap: var(--sp-3); margin-bottom: var(--sp-3);">
            <div class="form-group" style="flex: 1;">
              <label class="form-label" id="pl-label-start">Mulai Barcode</label>
              <input type="text" id="pl-barcode-start" class="form-input" style="font-family: monospace; font-weight: bold; color: var(--primary-color);">
            </div>
            <div class="form-group" id="pl-group-end" style="flex: 1;">
              <label class="form-label">Sampai Barcode</label>
              <input type="text" id="pl-barcode-end" class="form-input" style="font-family: monospace; font-weight: bold; color: var(--primary-color);">
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom: var(--sp-3);">
            <label class="form-label">MID (Nomor Batch)</label>
            <input type="text" id="pl-mid" class="form-input" readonly disabled style="background: var(--surface-color);">
          </div>
          
          <div class="form-group" style="margin-bottom: var(--sp-4);">
            <label class="form-label">Opsi QTY</label>
            <div style="display: flex; gap: var(--sp-3);">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pl_qty_option" value="show" checked> Tampilkan QTY (<span id="pl-qty-val"></span>)
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pl_qty_option" value="hide"> Kosongkan QTY
              </label>
            </div>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: var(--sp-3);">
            <button class="btn btn-secondary" onclick="document.getElementById('print-label-modal').style.display='none'">Batal</button>
            <button class="btn btn-primary" id="btn-do-print">🖨️ Generate PDF & Cetak</button>
          </div>
        </div>
      `,document.body.appendChild(S),document.getElementById("btn-do-print").addEventListener("click",()=>{const L=document.querySelector('input[name="pl_qty_option"]:checked').value,$=S.__data,m=document.getElementById("pl-barcode-start").value,o=document.getElementById("pl-group-end").style.display==="none"?m:document.getElementById("pl-barcode-end").value;e({barcodeStart:m,barcodeEnd:o,mid:document.getElementById("pl-mid").value,qty:$.qty,materialName:$.materialName,dateIn:$.dateIn,printQty:L==="show"}),S.style.display="none"})),S}function P(S){const L=b();L.__data=S,document.getElementById("pl-material").value=S.materialName||"";const $=S.barcodeStart||S.barcode||"",m=S.barcodeEnd||S.barcode||"";document.getElementById("pl-barcode-start").value=$,document.getElementById("pl-barcode-end").value=m;const l=document.getElementById("pl-group-end"),o=document.getElementById("pl-label-start");$===m||!m?(l.style.display="none",o.textContent="No. Barcode"):(l.style.display="block",o.textContent="Mulai Barcode"),document.getElementById("pl-mid").value=S.mid||"",document.getElementById("pl-qty-val").textContent=S.qty||"0",document.querySelector('input[name="pl_qty_option"][value="show"]').checked=!0,L.style.display="flex"}return{printLabel:e,showModal:P}})();window.BarcodePrinter=Ee;const Ce=(()=>{const e=[{group:"🎯 Operasional PPIC",items:[{id:"schedule",icon:"🗓️",text:"Schedule Import",route:"#/schedule"},{id:"master-sku",icon:"📦",text:"Master SKU",route:"#/master/sku"},{id:"master-bom",icon:"🧾",text:"Master BOM",route:"#/master/bom"},{id:"master-supplier",icon:"🏢",text:"Master Supplier",route:"#/master/supplier"},{id:"manual-spb",icon:"📋",text:"SPB Manual",route:"#/transit/manual-spb"},{id:"summary",icon:"📊",text:"Shift Summary",route:"#/summary"}]},{group:"📝 Request Material & SPB",items:[{id:"materials",icon:"🏭",text:"Material Calc",route:"#/materials"},{id:"distribution",icon:"🚚",text:"SPB Harian",route:"#/distribution"},{id:"distribution-hourly",icon:"⏰",text:"Distribusi / Jam",route:"#/distribution/hourly"}]},{group:"📊 Monitoring & Analitik",items:[{id:"dashboard",icon:"📡",text:"Pusat Kendali JIT",route:"#/dashboard"},{id:"transit-info",icon:"📊",text:"Info Distribusi",route:"#/transit/info"},{id:"transit-mutation",icon:"📝",text:"Mutasi Stok",route:"#/transit/mutation"},{id:"opname-recap",icon:"📈",text:"Hasil Rekap Opname",route:"#/opname-recap"},{id:"transit-relocation",icon:"🔄",text:"Relokasi Internal",route:"#/transit/relocation"},{id:"transit-anomaly",icon:"⚠️",text:"Laporan Anomali",route:"#/transit/anomaly"},{id:"audit-log",icon:"🔍",text:"Log Aktivitas",route:"#/audit"}]},{group:"📦 Operasional Transit",items:[{id:"stock",icon:"📋",text:"Cek Stok Awal",route:"#/stock"},{id:"transit-inbound",icon:"📥",text:"Penerimaan",route:"#/transit/inbound"},{id:"transit-verify-reject",icon:"♻️",text:"Verifikasi Rijek",route:"#/transit/verify-reject"},{id:"transit-outbound",icon:"📤",text:"Pengeluaran",route:"#/transit/outbound"},{id:"transit-stock-on-hand",icon:"📦",text:"Stock On Hand",route:"#/transit/stock-on-hand"},{id:"transit-opname",icon:"📋",text:"Opname Blok Transit",route:"#/transit/opname"},{id:"transit-master-receh",icon:"⚙️",text:"Master Receh",route:"#/transit/master-receh"},{id:"tv-inbound",icon:"🖥️",text:"TV Dashboard",route:"#/tv/inbound"}]},{group:"🏢 Operasional Gudang",items:[{id:"warehouse-stock",icon:"📦",text:"Stok Utama/WMS",route:"#/warehouse/stock"},{id:"warehouse-delivery",icon:"🚚",text:"Req. Pengiriman",route:"#/warehouse/delivery"},{id:"warehouse-outbound",icon:"📤",text:"Outbound Gudang",route:"#/warehouse/outbound"}]},{group:"⚙️ Operasional Produksi",items:[{id:"prod-inbound",icon:"📥",text:"Line Inbound",route:"#/produksi/inbound"},{id:"prod-outbound",icon:"📤",text:"Line Outbound",route:"#/produksi/outbound"},{id:"prod-reject",icon:"🗑️",text:"Reject Out",route:"#/produksi/reject"},{id:"prod-onhand",icon:"📦",text:"Line On Hand",route:"#/produksi/onhand"},{id:"prod-bpp",icon:"📝",text:"BPP (Hasil Produksi)",route:"#/produksi/bpp"},{id:"prod-mutation",icon:"📊",text:"Mutasi Stok Produksi",route:"#/produksi/mutation"},{id:"prod-opname",icon:"📋",text:"Opname Line",route:"#/produksi/opname"},{id:"prod-3in1",icon:"🔄",text:"3F2 Produksi",route:"#/external/onhand-3f2"},{id:"pack-3in1",icon:"🔄",text:"3P2 Packing",route:"#/external/onhand-3p2"}]},{group:"🛠️ Pengaturan & Master",items:[{id:"master-block",icon:"🗺️",text:"Master Blok",route:"#/master/block"},{id:"master-line-sku",icon:"🔗",text:"Line per SKU",route:"#/master/line-sku"},{id:"master-kamus-opname",icon:"📖",text:"Kamus Opname",route:"#/master/kamus-opname"},{id:"print-barcode",icon:"🖨️",text:"Cetak Barcode",route:"#/print-barcode"}]}];let b=!1;function P(){const m=document.getElementById("sidebar");m.innerHTML="";const l=document.createElement("div");l.className="sidebar-logo",l.innerHTML=`
      <div class="sidebar-logo-icon">P</div>
      <div class="sidebar-logo-text">
        <span class="logo-title">PMC App</span>
        <span class="logo-subtitle">Material Calculator</span>
      </div>
    `,m.appendChild(l);const o=document.createElement("div");o.className="santos-brand",o.style.cssText="padding:0 var(--sp-4) var(--sp-4) var(--sp-4); text-align:center;",o.innerHTML=`
      <img src="public/santos-logo.png" alt="PT. Santos Jaya Abadi" style="width:100px;height:auto;margin:0 auto -20px auto;display:block;" />
      <div style="font-family:'Segoe UI', Arial, sans-serif;font-size:20px;color:#ffffff;font-size:12px;font-weight:1000;letter-spacing:0.0px;">PT. SANTOS JAYA ABADI</div>
    `,m.appendChild(o);const d=document.createElement("nav");d.className="sidebar-nav",e.forEach(t=>{const s=t.items.filter(p=>window.Auth&&window.Auth.isLoggedIn()?window.Auth.hasAccess(p.id):!0);if(s.length===0)return;const y=document.createElement("div");y.className="nav-section-label",y.style.marginTop="var(--sp-4)",y.style.borderTop="1px solid rgba(255, 255, 255, 0.05)",y.style.paddingTop="var(--sp-4)",y.textContent=t.group,d.appendChild(y),s.forEach(p=>{const T=document.createElement("a");T.className="nav-item",T.href=p.route,T.innerHTML=`
          <span class="nav-item-icon">${p.icon}</span>
          <span class="nav-item-text">${p.text}</span>
        `;const x=window.location.hash||"#/";(x===p.route||p.route==="#/"&&x==="#/")&&T.classList.add("active"),T.addEventListener("click",H=>{H.preventDefault(),window.location.hash=p.route.replace("#",""),L()}),d.appendChild(T)})}),m.appendChild(d);const a=document.createElement("div");if(a.className="sidebar-footer",a.style.cssText="display:flex; flex-direction:column; gap:4px;",window.Auth&&window.Auth.isLoggedIn()){const t=document.createElement("button");t.className="sidebar-collapse-btn",t.style.cssText="color:#ff6b6b; border-top: 1px solid rgba(255,255,255,0.05);",t.innerHTML='<span>🚪</span><span class="nav-item-text">Logout</span>',t.addEventListener("click",async()=>{window.confirm("Apakah Anda yakin ingin keluar?")&&(await window.Auth.logout(),window.location.hash="#/login")}),a.appendChild(t)}const r=document.createElement("button");r.className="sidebar-collapse-btn",r.innerHTML=`<span>${b?"▶":"◀"}</span><span class="nav-item-text">${b?"":"Kecilkan"}</span>`,r.addEventListener("click",S),a.appendChild(r),m.appendChild(a),b?m.classList.add("collapsed"):m.classList.remove("collapsed")}function S(){b=!b,P()}function L(){document.getElementById("sidebar").classList.remove("mobile-open");const l=document.querySelector(".sidebar-overlay");l&&l.classList.remove("visible")}function $(){document.getElementById("sidebar").classList.add("mobile-open");let l=document.querySelector(".sidebar-overlay");l||(l=document.createElement("div"),l.className="sidebar-overlay",document.getElementById("app").appendChild(l),l.addEventListener("click",L)),l.classList.add("visible"),l.style.display="block"}return{render:P,openMobile:$,closeMobile:L}})();window.SidebarComponent=Ce;const Te=(()=>{const e={"/dashboard":{title:"Pusat Kendali JIT",breadcrumb:"Pusat Kendali",icon:"📡"},"/master/sku":{title:"Master SKU",breadcrumb:"Master Data / SKU",icon:"📦"},"/master/bom":{title:"Master BOM",breadcrumb:"Master Data / BOM",icon:"🧾"},"/master/supplier":{title:"Master Supplier",breadcrumb:"Master Data / Supplier",icon:"🏢"},"/schedule":{title:"Smart Schedule Importer",breadcrumb:"Perhitungan / Schedule",icon:"📋"},"/summary":{title:"Shift-Production Summary",breadcrumb:"Perhitungan / Summary",icon:"📊"},"/materials":{title:"Material Requirement",breadcrumb:"Perhitungan / Material",icon:"🏭"}},b={admin:"#ef4444",ppic:"#8b5cf6",admin_transit:"#f59e0b",gudang:"#10b981",operator_line:"#3b82f6",supervisor:"#ec4899",viewer:"#6b7280"};function P(S,L=[]){const $=document.getElementById("topbar"),m=e[S]||e["/dashboard"];$.innerHTML="";const l=document.createElement("div");l.className="topbar-left";const o=document.createElement("button");o.className="topbar-hamburger",o.innerHTML="☰",o.addEventListener("click",()=>SidebarComponent.openMobile()),l.appendChild(o);const d=document.createElement("div");d.innerHTML=`
      <div class="topbar-breadcrumb">${m.icon} ${m.breadcrumb}</div>
      <div class="topbar-page-title">${m.title}</div>
    `,l.appendChild(d),$.appendChild(l);const a=document.createElement("div");a.className="topbar-right";const r=window.Auth?window.Auth.getCurrentUser():null,t=(r==null?void 0:r.name)||localStorage.getItem("pmc_current_user")||"Admin",s=(r==null?void 0:r.role)||localStorage.getItem("pmc_current_role")||"viewer",y=window.Auth?window.Auth.getRoleLabel(s):s,p=b[s]||"#6b7280",T=document.createElement("div");T.className="topbar-account",T.innerHTML=`
      <div class="account-avatar">👨‍💻</div>
      <div class="account-details">
        <span class="account-name">${t}</span>
        <span class="account-role" style="
          background: ${p}22;
          color: ${p};
          padding: 1px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: 1px solid ${p}44;
        ">${y}</span>
      </div>
    `,a.appendChild(T);const x=document.createElement("button");x.className="btn-logout",x.innerHTML="🚪 Logout",x.addEventListener("click",async()=>{window.confirm("Apakah Anda yakin ingin keluar sekarang?")&&(window.Auth&&await window.Auth.logout(),localStorage.removeItem("pmc_current_user"),localStorage.removeItem("pmc_current_role"),localStorage.removeItem("pmc_current_email"),window.location.hash="#/login")}),a.appendChild(x),L.length>0&&L.forEach(H=>a.appendChild(H)),$.appendChild(a)}return{render:P}})();window.TopbarComponent=Te;const Le=(()=>{function e({icon:P,label:S,value:L,colorType:$="accent",noAnim:m=!1}){const l=document.createElement("div");l.className=`stat-card ${m?"":"animate-slide-up"}`;const o=`var(--${$}-glow, rgba(0, 210, 255, 0.2))`;if(l.style.setProperty("--accent-gradient",`linear-gradient(135deg, var(--${$}), var(--${$}-light, var(--${$})))`),l.innerHTML=`
      <div class="stat-card-icon" style="background:var(--${$}-bg); color:var(--${$}); box-shadow:0 0 15px ${o};">
        ${P}
      </div>
      <div class="stat-card-body">
        <div class="stat-card-label">${S}</div>
        <div class="stat-card-value">${L}</div>
      </div>
    `,!m){const d=typeof L=="string"?parseFloat(L.replace(/,/g,"")):L;if(!isNaN(d)&&isFinite(d)){const a=l.querySelector(".stat-card-value");b(a,d)}}return l}function b(P,S){const $=performance.now();function m(l){const o=l-$,d=Math.min(o/1500,1),a=d===1?1:1-Math.pow(2,-10*d),r=Math.floor(a*S);P.textContent=PMCStore.formatNumber?PMCStore.formatNumber(r):r.toLocaleString(),d<1&&requestAnimationFrame(m)}requestAnimationFrame(m)}return{create:e}})();window.StatCardComponent=Le;const $e=(()=>{function e({columns:b,data:P,actions:S,footer:L,editable:$,onCellEdit:m}){const l=document.createElement("div");l.className="table-container";const o=document.createElement("table");o.className="data-table";const d=document.createElement("thead"),a=document.createElement("tr");if(b.forEach(t=>{const s=document.createElement("th");t.labelHtml?s.innerHTML=t.labelHtml:s.textContent=t.label,t.width&&(s.style.width=t.width),t.align&&(s.style.textAlign=t.align),a.appendChild(s)}),S){const t=document.createElement("th");t.textContent="AKSI",t.style.width="100px",t.style.textAlign="center",a.appendChild(t)}d.appendChild(a),o.appendChild(d);const r=document.createElement("tbody");if(P.length===0){const t=document.createElement("tr"),s=document.createElement("td");s.colSpan=b.length+(S?1:0),s.innerHTML=`
        <div style="display:flex; flex-direction:column; align-items:center; gap:var(--sp-2); color:var(--text-muted); padding:var(--sp-10);">
          <div style="font-size:2rem; filter:drop-shadow(0 0 10px rgba(255,255,255,0.1));">📭</div>
          <div style="font-size:var(--fs-xs); font-weight:700; letter-spacing:0.05em;">BELUM ADA DATA TERSEDIA</div>
        </div>
      `,t.appendChild(s),r.appendChild(t)}else P.forEach((t,s)=>{const y=document.createElement("tr");if(b.forEach(p=>{const T=document.createElement("td");if(p.align&&(T.style.textAlign=p.align),$&&p.editable){const x=document.createElement("input");x.className="form-input",x.style.padding="4px 8px",x.style.fontSize="var(--fs-sm)",x.type=p.type||"text",x.value=t[p.key]??"",x.addEventListener("change",()=>{const H=p.type==="number"?parseFloat(x.value)||0:x.value;m&&m(s,p.key,H)}),T.appendChild(x)}else p.render?T.innerHTML=p.render(t[p.key],t,s):T.textContent=t[p.key]??"";y.appendChild(T)}),S){const p=document.createElement("td");p.style.textAlign="center";const T=document.createElement("div");T.className="table-actions",T.style.justifyContent="center",S.forEach(x=>{const H=document.createElement("button");H.className="btn-icon sm btn-ghost",H.innerHTML=x.icon,H.title=x.label,H.addEventListener("click",()=>x.onClick(t,s)),T.appendChild(H)}),p.appendChild(T),y.appendChild(p)}r.appendChild(y)});return o.appendChild(r),l.appendChild(o),l}return{create:e}})();window.DataTableComponent=$e;const Ie=(()=>{function e({title:P,body:S,onSave:L,saveText:$="Simpan",width:m}){b();const l=document.createElement("div");l.className="modal-backdrop",l.addEventListener("click",s=>{s.target===l&&b()});const o=document.createElement("div");o.className="modal",m&&(o.style.maxWidth=m);const d=document.createElement("div");d.className="modal-header",d.innerHTML=`<h3 class="modal-title">${P}</h3>`;const a=document.createElement("button");a.className="modal-close",a.innerHTML="✕",a.addEventListener("click",b),d.appendChild(a),o.appendChild(d);const r=document.createElement("div");if(r.className="modal-body",typeof S=="string"?r.innerHTML=S:r.appendChild(S),o.appendChild(r),L){const s=document.createElement("div");s.className="modal-footer";const y=document.createElement("button");y.className="btn btn-secondary",y.textContent="Batal",y.addEventListener("click",b);const p=document.createElement("button");p.className="btn btn-primary",p.textContent=$,p.addEventListener("click",()=>{L()}),s.appendChild(y),s.appendChild(p),o.appendChild(s)}l.appendChild(o),document.getElementById("modal-root").appendChild(l),setTimeout(()=>{const s=o.querySelector("input, select, textarea");s&&s.focus()},100);const t=s=>{s.key==="Escape"&&(b(),document.removeEventListener("keydown",t))};document.addEventListener("keydown",t)}function b(){const P=document.getElementById("modal-root");P.innerHTML=""}return{open:e,close:b}})();window.ModalComponent=Ie;const Pe=(()=>{function e({onFile:P,accept:S=".xlsx,.xls"}){const L=document.createElement("div");L.className="drop-zone",L.innerHTML=`
      <div class="drop-zone-icon">📁</div>
      <div class="drop-zone-text">Drag & drop file Excel di sini<br>atau <strong>Browse File</strong></div>
      <div class="drop-zone-hint">Format: .xlsx, .xls</div>
    `;const $=document.createElement("input");return $.type="file",$.accept=S,$.style.display="none",L.appendChild($),L.addEventListener("click",()=>$.click()),L.addEventListener("dragover",m=>{m.preventDefault(),L.classList.add("dragover")}),L.addEventListener("dragleave",()=>L.classList.remove("dragover")),L.addEventListener("drop",m=>{m.preventDefault(),L.classList.remove("dragover");const l=m.dataTransfer.files[0];l&&b(l,P,L)}),$.addEventListener("change",()=>{const m=$.files[0];m&&b(m,P,L)}),L}function b(P,S,L){L.innerHTML=`
      <div class="drop-zone-icon">⏳</div>
      <div class="drop-zone-text">Memproses <strong>${P.name}</strong>...</div>
    `;const $=new FileReader;$.onload=m=>{try{const l=XLSX.read(m.target.result,{type:"array"}),o=l.Sheets[l.SheetNames[0]],d=XLSX.utils.sheet_to_json(o);L.innerHTML=`
          <div class="drop-zone-icon">✅</div>
          <div class="drop-zone-text">File <strong>${P.name}</strong> berhasil dimuat</div>
          <div class="drop-zone-hint">${d.length} baris data ditemukan</div>
        `,L.style.borderColor="var(--success)",S&&S(d,P.name)}catch(l){L.innerHTML=`
          <div class="drop-zone-icon">❌</div>
          <div class="drop-zone-text">Gagal membaca file</div>
          <div class="drop-zone-hint">${l.message}</div>
        `,L.style.borderColor="var(--danger)"}},$.readAsArrayBuffer(P)}return{create:e}})();window.DragDropComponent=Pe;const Be=(()=>{function e({totalItems:P,perPage:S=10,currentPage:L=1,onChange:$}){const m=Math.ceil(P/S);if(m<=1)return document.createElement("div");const l=document.createElement("div");l.className="pagination";const o=document.createElement("button");o.className="pagination-btn",o.textContent="‹",o.disabled=L===1,o.addEventListener("click",()=>$(L-1)),l.appendChild(o);const d=5;let a=Math.max(1,L-Math.floor(d/2)),r=Math.min(m,a+d-1);if(r-a<d-1&&(a=Math.max(1,r-d+1)),a>1&&(l.appendChild(b(1,L,$)),a>2)){const s=document.createElement("span");s.textContent="...",s.style.color="var(--text-muted)",s.style.padding="0 4px",l.appendChild(s)}for(let s=a;s<=r;s++)l.appendChild(b(s,L,$));if(r<m){if(r<m-1){const s=document.createElement("span");s.textContent="...",s.style.color="var(--text-muted)",s.style.padding="0 4px",l.appendChild(s)}l.appendChild(b(m,L,$))}const t=document.createElement("button");return t.className="pagination-btn",t.textContent="›",t.disabled=L===m,t.addEventListener("click",()=>$(L+1)),l.appendChild(t),l}function b(P,S,L){const $=document.createElement("button");return $.className=`pagination-btn ${P===S?"active":""}`,$.textContent=P,$.addEventListener("click",()=>L(P)),$}return{create:e}})();window.PaginationComponent=Be;const Me=(()=>{function e(P,S="success",L=3e3){let $=document.querySelector(".toast-container");$||($=document.createElement("div"),$.className="toast-container",document.getElementById("toast-root").appendChild($));const m={success:"✅",error:"❌",warning:"⚠️",info:"ℹ️"},l=document.createElement("div");l.className="toast",l.style.borderLeft=`3px solid var(--${S==="error"?"danger":S})`,l.innerHTML=`
      <span>${m[S]||"📌"}</span>
      <span class="toast-message">${P}</span>
    `;const o=document.createElement("button");o.className="toast-close",o.innerHTML="✕",o.addEventListener("click",()=>b(l)),l.appendChild(o),$.appendChild(l),setTimeout(()=>b(l),L)}function b(P){P.classList.add("toast-exit"),setTimeout(()=>P.remove(),200)}return{show:e}})();window.ToastComponent=Me;const Ae=(()=>{const e={};function b(L,$){const m=document.createElement("div");if(m.className="glass-card",m.style.flex="1",m.style.minWidth="300px",m.style.padding="var(--sp-5)",m.style.borderRadius="var(--radius-lg)",$.title){const d=document.createElement("div");d.style.marginBottom="var(--sp-4)",d.innerHTML=`<h3 style="font-size:var(--fs-base); font-weight:600; color:var(--text-primary);">${$.title}</h3>`,m.appendChild(d)}const l=document.createElement("div");l.style.position="relative",l.style.height=$.height||"260px";const o=document.createElement("canvas");return o.id=L,l.appendChild(o),m.appendChild(l),window.Chart&&(Chart.defaults.color="#f8fafc",Chart.defaults.borderColor="rgba(255, 255, 255, 0.1)",Chart.defaults.font.family="'Inter', system-ui, sans-serif"),setTimeout(()=>{e[L]&&e[L].destroy(),e[L]=new Chart(o,$.chartConfig)},50),m}function P(L){e[L]&&(e[L].destroy(),delete e[L])}function S(){Object.keys(e).forEach(P)}return{create:b,destroy:P,destroyAll:S}})();window.ChartWrapper=Ae;const Ne=(()=>{function e(){const S=document.createElement("div");return S.className="glass-card animate-fade",S.style.padding="var(--sp-5)",S.style.display="flex",S.style.alignItems="center",S.style.gap="var(--sp-4)",S.style.borderRadius="var(--radius-lg)",S.innerHTML=`
      <div class="skeleton-bone" style="width:54px; height:54px; border-radius:var(--radius-md);"></div>
      <div style="flex-grow:1; display:flex; flex-direction:column; gap:8px;">
        <div class="skeleton-bone" style="width:40%; height:10px;"></div>
        <div class="skeleton-bone" style="width:60%; height:20px;"></div>
      </div>
    `,S}function b(){const S=document.createElement("div");return S.className="glass-card animate-fade",S.style.padding="var(--sp-5)",S.style.height="300px",S.style.borderRadius="var(--radius-lg)",S.style.display="flex",S.style.flexDirection="column",S.style.gap="15px",S.innerHTML=`
      <div class="skeleton-bone" style="width:30%; height:15px; margin-bottom:10px;"></div>
      <div style="flex-grow:1; display:flex; align-items:flex-end; gap:10px;">
        <div class="skeleton-bone" style="width:10%; height:40%;"></div>
        <div class="skeleton-bone" style="width:10%; height:70%;"></div>
        <div class="skeleton-bone" style="width:10%; height:50%;"></div>
        <div class="skeleton-bone" style="width:10%; height:90%;"></div>
        <div class="skeleton-bone" style="width:10%; height:60%;"></div>
        <div class="skeleton-bone" style="width:10%; height:80%;"></div>
        <div class="skeleton-bone" style="width:10%; height:30%;"></div>
      </div>
    `,S}function P(S=5){const L=document.createElement("div");L.className="glass-card animate-fade",L.style.padding="var(--sp-5)",L.style.borderRadius="var(--radius-lg)";let $="";for(let m=0;m<S;m++)$+=`
          <div style="display:flex; gap:15px; padding:12px 0; border-bottom:1px solid var(--border);">
            <div class="skeleton-bone" style="width:20%; height:12px;"></div>
            <div class="skeleton-bone" style="width:40%; height:12px;"></div>
            <div class="skeleton-bone" style="width:15%; height:12px;"></div>
            <div class="skeleton-bone" style="width:25%; height:12px;"></div>
          </div>
        `;return L.innerHTML=`
      <div class="skeleton-bone" style="width:20%; height:15px; margin-bottom:20px;"></div>
      ${$}
    `,L}return{createCard:e,createChart:b,createTable:P}})();window.SkeletonComponent=Ne;const He=(()=>{let e=null,b=!1,P=null;function S(l,o={}){if(b)return;if(typeof Html5Qrcode>"u"){alert("Library scanner belum dimuat. Pastikan koneksi internet aktif.");return}if(P=document.createElement("div"),P.id="camera-scanner-modal",P.innerHTML=`
      <div class="cam-scanner-overlay">
        <div class="cam-scanner-container">
          <div class="cam-scanner-header">
            <h3>📷 Scan Barcode</h3>
            <button class="cam-scanner-close" id="cam-close-btn">✕</button>
          </div>
          <div class="cam-scanner-hint">
            Arahkan kamera ke barcode batang / QR Code
          </div>
          <div id="cam-scanner-reader"></div>
          <div class="cam-scanner-status" id="cam-scanner-status">
            Memulai kamera...
          </div>
          <div class="cam-scanner-actions">
            <button class="btn btn-secondary" id="cam-switch-btn" style="display:none;">
              🔄 Ganti Kamera
            </button>
            <button class="btn btn-danger" id="cam-stop-btn">
              ❌ Tutup
            </button>
          </div>
        </div>
      </div>
    `,!document.getElementById("cam-scanner-styles")){const y=document.createElement("style");y.id="cam-scanner-styles",y.textContent=`
        .cam-scanner-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
          padding: 16px;
        }
        .cam-scanner-container {
          background: var(--bg-primary, #0a0e17);
          border: 1px solid var(--glass-border, rgba(0,210,255,0.15));
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(0,210,255,0.1);
        }
        .cam-scanner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .cam-scanner-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #f8fafc;
        }
        .cam-scanner-close {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cam-scanner-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        .cam-scanner-hint {
          padding: 8px 20px;
          font-size: 0.85rem;
          color: #94a3b8;
          text-align: center;
          background: rgba(0,210,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        #cam-scanner-reader {
          width: 100%;
          min-height: 280px;
          background: #000;
        }
        #cam-scanner-reader video {
          border-radius: 0 !important;
        }
        /* Override html5-qrcode internal styles */
        #cam-scanner-reader img[alt="Info icon"] { display: none !important; }
        #cam-scanner-reader > div:last-child { display: none !important; }
        .cam-scanner-status {
          padding: 12px 20px;
          font-size: 0.85rem;
          color: #64748b;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .cam-scanner-status.success {
          color: #00e0a3;
          font-weight: 700;
          background: rgba(0, 224, 163, 0.08);
          animation: pulse-success 0.5s;
        }
        @keyframes pulse-success {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .cam-scanner-actions {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .cam-scanner-actions button {
          flex: 1;
          padding: 10px;
          font-size: 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }

        /* Mobile optimization */
        @media (max-width: 767px) {
          .cam-scanner-overlay {
            padding: 0;
            align-items: stretch;
          }
          .cam-scanner-container {
            max-width: 100%;
            border-radius: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          #cam-scanner-reader {
            flex: 1;
            min-height: unset;
          }
        }
      `,document.head.appendChild(y)}document.body.appendChild(P),document.getElementById("cam-scanner-reader");const d=document.getElementById("cam-scanner-status");e=new Html5Qrcode("cam-scanner-reader"),b=!0;const a={fps:10,qrbox:{width:280,height:120},aspectRatio:1.5,formatsToSupport:[Html5QrcodeSupportedFormats.CODE_128,Html5QrcodeSupportedFormats.CODE_39,Html5QrcodeSupportedFormats.EAN_13,Html5QrcodeSupportedFormats.EAN_8,Html5QrcodeSupportedFormats.UPC_A,Html5QrcodeSupportedFormats.UPC_E,Html5QrcodeSupportedFormats.ITF,Html5QrcodeSupportedFormats.CODE_93,Html5QrcodeSupportedFormats.CODABAR,Html5QrcodeSupportedFormats.QR_CODE]};let r="",t=0;e.start({facingMode:"environment"},a,y=>{const p=Date.now();y===r&&p-t<2e3||(r=y,t=p,navigator.vibrate&&navigator.vibrate(200),d.className="cam-scanner-status success",d.textContent=`✅ Terdeteksi: ${y}`,$(),typeof l=="function"&&l(y),setTimeout(()=>{L()},800))},y=>{}).then(()=>{d.textContent="🔍 Arahkan barcode ke area kotak hijau...",Html5Qrcode.getCameras().then(y=>{y.length>1&&(document.getElementById("cam-switch-btn").style.display="block")})}).catch(y=>{console.error("Camera error:",y),d.textContent=`❌ Gagal akses kamera: ${y.message||y}`,d.style.color="#ef4444"}),document.getElementById("cam-close-btn").addEventListener("click",L),document.getElementById("cam-stop-btn").addEventListener("click",L),document.getElementById("cam-switch-btn").addEventListener("click",async()=>{try{await e.stop();const p=e._currentFacingMode==="environment"?"user":"environment";await e.start({facingMode:p},a,T=>{typeof l=="function"&&l(T),L()},()=>{})}catch(y){console.warn("Switch camera failed:",y)}}),P.querySelector(".cam-scanner-overlay").addEventListener("click",y=>{y.target.classList.contains("cam-scanner-overlay")&&L()});const s=y=>{y.key==="Escape"&&(L(),document.removeEventListener("keydown",s))};document.addEventListener("keydown",s)}function L(){e&&b&&e.stop().then(()=>{e.clear(),e=null}).catch(()=>{e=null}),b=!1,P&&(P.remove(),P=null)}function $(){try{const l=new(window.AudioContext||window.webkitAudioContext),o=l.createOscillator(),d=l.createGain();o.connect(d),d.connect(l.destination),o.frequency.value=1200,o.type="sine",d.gain.value=.3,o.start(),o.stop(l.currentTime+.15)}catch{}}function m(l){const o=document.createElement("button");return o.type="button",o.className="btn btn-accent cam-trigger-btn",o.innerHTML="📷",o.title="Scan via Kamera HP",o.style.cssText=`
      padding: 8px 14px;
      font-size: 1.2rem;
      border-radius: var(--radius-md, 8px);
      border: 1px solid rgba(0, 210, 255, 0.3);
      background: rgba(0, 210, 255, 0.1);
      color: #00d2ff;
      cursor: pointer;
      transition: all 0.15s;
      flex-shrink: 0;
      min-height: 44px;
      min-width: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    `,o.addEventListener("mouseenter",()=>{o.style.background="rgba(0, 210, 255, 0.2)",o.style.borderColor="rgba(0, 210, 255, 0.5)",o.style.transform="translateY(-1px)"}),o.addEventListener("mouseleave",()=>{o.style.background="rgba(0, 210, 255, 0.1)",o.style.borderColor="rgba(0, 210, 255, 0.3)",o.style.transform="translateY(0)"}),o.addEventListener("click",()=>{S(d=>{l.value=d,l.dispatchEvent(new Event("input",{bubbles:!0})),l.focus()})}),o}return{open:S,close:L,createScanButton:m}})();window.CameraScanner=He;const De=(()=>{let e=null,b="LIVE";async function P(){const l=window.location.hash;if(!l.startsWith("#/dashboard")&&l!==""&&l!=="#/")return;const o=l.includes("view=delivery");window._dashboardSocketListener&&PMCStore.off("data_sync_required",window._dashboardSocketListener),window._dashboardSocketListener=()=>{P()},PMCStore.on("data_sync_required",window._dashboardSocketListener),window._dashboardClockTimer&&clearInterval(window._dashboardClockTimer),ChartWrapper.destroyAll();const d=document.getElementById("page-content");d.innerHTML=`
      <div style="padding:var(--sp-6);">
        <div class="alert alert-info">Memuat data dashboard...</div>
      </div>
    `;try{const a=await PMCStore.getStats(),r=await PMCStore.getDailyProduction(),t=await PMCStore.getRecentSchedules();await PMCStore.loadTransitInfoFromAPI(),d.innerHTML="";const s=document.createElement("div");s.className="animate-fade",s.style.padding="var(--sp-6)";const y=document.createElement("div");y.style.cssText="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-6); gap: var(--sp-4); flex-wrap: wrap;";const p=document.createElement("div");p.innerHTML=`
          <h1 style="font-size:var(--fs-xl); font-weight:700; color:var(--text-primary); display:flex; align-items:center;">
            <span class="live-pulse"></span>Pusat Kendali JIT
          </h1>
          <p style="color:var(--text-secondary); font-size:var(--fs-sm);">Sistem pemantauan operasional PMC secara real-time.</p>
      `,y.appendChild(p);const T=document.createElement("div");T.style.cssText="display:flex; gap:var(--sp-3); align-items:center;";const x=PMCStore.getUniqueDates(),H=PMCStore.getLogicalDateStr();e||(e=x.includes(H)?H:x[0]||H);const A=document.createElement("div");A.style.cssText="display:flex; flex-direction:column; gap:4px;",A.innerHTML='<label style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">Lihat Data Tanggal:</label>';const f=document.createElement("select");f.className="filter-select",f.style.minWidth="130px",x.forEach(X=>{f.innerHTML+=`<option value="${X}" ${X===e?"selected":""}>${PMCStore.formatDate(X)}</option>`}),f.addEventListener("change",X=>{e=X.target.value,e!==H&&b==="LIVE"?b="SH1":e===H&&b!=="LIVE"&&(b="LIVE"),P()}),A.appendChild(f);const E=document.createElement("div");E.style.cssText="display:flex; flex-direction:column; gap:4px;",E.innerHTML='<label style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">Shift:</label>';const g=document.createElement("select");g.className="filter-select",g.style.minWidth="120px",g.innerHTML=`
        <option value="LIVE" ${b==="LIVE"?"selected":""}>Real-time</option>
        <option value="SH1" ${b==="SH1"?"selected":""}>Shift 1</option>
        <option value="SH2" ${b==="SH2"?"selected":""}>Shift 2</option>
        <option value="SH3" ${b==="SH3"?"selected":""}>Shift 3</option>
      `,g.addEventListener("change",X=>{b=X.target.value,P()}),E.appendChild(g);const h=document.createElement("button");h.className="btn btn-primary",h.textContent="Jadwal Produksi",h.onclick=()=>location.hash="#/schedule",T.appendChild(A),T.appendChild(E),T.appendChild(h),y.appendChild(T),o||s.appendChild(y);const n=(await PMCStore.getPriorityAlerts(e)).filter(X=>X.status==="danger").length,k=await PMCStore.getMergedHourlyDistribution(e),C=k?k.length:0,u=r.find(X=>X.date===e);let v=u?u.total:0;b!=="LIVE"&&u&&(v=u[b.toLowerCase()]||0);const D=PMCStore.getTransitInfo()||{blocks:[]};let M=0,B=0;(D.blocks||[]).forEach(X=>{X.rows.forEach(ee=>{ee.material&&ee.material.trim()!==""&&(M+=ee.maxPallets||0,B+=ee.qty||0)})});const j=M>0?Math.round(B/M*100):0,O=j>85?"danger":j>70?"warning":"success";let q=0;if(b==="LIVE"&&(!e||e===H))try{const ee=await(await fetch(`${PMCStore.API_BASE}/anomaly/unscanned-transit?hours=3`)).json();ee.success&&ee.data&&(q=ee.data.filter(ne=>ne.status==="Lupa Scan").length)}catch(X){console.warn("Failed to load anomaly data",X)}if(q>0&&!o){const X=document.createElement("div");if(X.style.cssText="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger-color); padding: var(--sp-3) var(--sp-4); border-radius: var(--radius-md); margin-bottom: var(--sp-5); display: flex; justify-content: space-between; align-items: center; cursor: pointer; animation: pulse-red 2s infinite;",X.innerHTML=`
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.5rem;">⚠️</span>
            <div>
              <div style="color:var(--danger-color); font-weight:700; font-size:1.1rem;">${q} Potensi Lupa Scan Transit</div>
              <div style="color:var(--text-secondary); font-size:0.85rem;">Terdeteksi material tertahan di Transit padahal mesin Line sedang produksi.</div>
            </div>
          </div>
          <button class="btn btn-primary" style="background:var(--danger-color); border:none; padding:8px 16px;">Lihat Detail</button>
        `,X.onclick=()=>{window.location.hash="#/transit/anomaly"},!document.getElementById("pulse-red-style")){const ee=document.createElement("style");ee.id="pulse-red-style",ee.innerHTML="@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }",document.head.appendChild(ee)}s.appendChild(X)}const G=document.createElement("div");G.className="grid-4 section";let J="Target Produksi (Harian)";b!=="LIVE"&&(J=`Target Produksi (${b})`),G.appendChild(StatCardComponent.create({icon:"🎯",label:J,value:v,colorType:"accent"})),G.appendChild(StatCardComponent.create({icon:"📦",label:"Varian Material Aktif",value:`${C} Jenis`,colorType:"info"})),G.appendChild(StatCardComponent.create({icon:n>0?"🚨":"✅",label:"Radar Defisit Line",value:n>0?`${n} Kritis`:"Aman",colorType:n>0?"danger":"success"})),G.appendChild(StatCardComponent.create({icon:"🏢",label:"Kapasitas Transit",value:`​${j}%`,colorType:O})),G.querySelectorAll(".stat-card").forEach(X=>X.classList.add("glass-card")),o||s.appendChild(G);const K=document.createElement("div");K.className="dashboard-charts section";const Z=ChartWrapper.create("trendChart",{title:"Tren Produksi Harian",chartConfig:{type:"line",data:{labels:r.map(X=>PMCStore.formatDate(X.date)),datasets:[{label:"Total Box",data:r.map(X=>X.total),borderColor:"#6c5ce7",backgroundColor:"rgba(108, 92, 231, 0.1)",fill:!0,tension:.3}]},options:{color:"#f8fafc",scales:{x:{ticks:{color:"#f8fafc"},grid:{color:"rgba(255,255,255,0.1)"}},y:{ticks:{color:"#f8fafc"},grid:{color:"rgba(255,255,255,0.1)"}}},plugins:{legend:{labels:{color:"#f8fafc"}}}}}});K.appendChild(Z);const ae=r.find(X=>X.date===e)||{sh1:0,sh2:0,sh3:0,total:0},U=ae.sh1||0,V=ae.sh2||0,_=ae.sh3||0,N=ae.total||U+V+_,c=ChartWrapper.create("shiftChart",{title:"Produksi per Shift",chartConfig:{type:"bar",data:{labels:["Shift 1","Shift 2","Shift 3"],datasets:[{label:"Produksi Box",data:[U,V,_],backgroundColor:["#6c5ce7","#00b894","#0984e3"],borderRadius:6}]},options:{color:"#f8fafc",layout:{padding:{top:30}},scales:{x:{ticks:{color:"#f8fafc"},grid:{color:"rgba(255,255,255,0.1)"}},y:{beginAtZero:!0,ticks:{color:"#f8fafc"},grid:{color:"rgba(255,255,255,0.1)"}}},plugins:{legend:{display:!1},tooltip:{callbacks:{label:function(X){const ee=X.raw,ne=N>0?(ee/N*100).toFixed(1)+"%":"0%";return` ${ee} Box (${ne})`}}}}},plugins:[{id:"topLabels",afterDatasetsDraw(X){const{ctx:ee,data:ne}=X;ee.save(),ee.fillStyle="#f8fafc",ee.font="bold 12px Inter, sans-serif",ee.textAlign="center",ee.textBaseline="bottom",X.getDatasetMeta(0).data.forEach((se,oe)=>{const re=ne.datasets[0].data[oe];if(re>0){const ie=N>0?(re/N*100).toFixed(1)+"%":"0%";ee.fillText(ie,se.x,se.y-8)}}),ee.restore()}}]}});K.appendChild(c),o||s.appendChild(K),await PMCStore.loadActiveDeliveriesFromAPI();const w=document.createElement("div");w.className="section",await L(w);const I=window.self!==window.top;(o||!I)&&s.appendChild(w);const z=document.createElement("div");z.className="glass-card section",z.style.padding="var(--sp-5)";const R=document.createElement("h3");R.style.cssText="margin-bottom:var(--sp-6); font-size:var(--fs-md); font-weight:700; color:var(--text-primary); text-align:center;",R.innerHTML="Persentase Pengiriman Harian per Shift",z.appendChild(R);const F=document.createElement("div");F.style.cssText="display:flex; justify-content:space-around; align-items:center; flex-wrap:wrap; gap:var(--sp-5);";const W=[{key:"SH1",label:"Shift 1",color:"#6c5ce7",glow:"rgba(108, 92, 231, 0.7)"},{key:"SH2",label:"Shift 2",color:"#00e0a3",glow:"rgba(0, 224, 163, 0.7)"},{key:"SH3",label:"Shift 3",color:"#00d2ff",glow:"rgba(0, 210, 255, 0.7)"}];for(const X of W){const ee=await PMCStore.calculateShiftProgress(X.key,e),ne=`conic-gradient(${X.color} ${ee}%, transparent 0)`;F.innerHTML+=`
          <div class="radial-ring-container">
            <div class="radial-ring" style="background:${ne}; --ring-glow:${X.glow};">
              <span class="radial-ring-value">${ee}%</span>
            </div>
            <span class="radial-ring-label" style="color:${X.color}; text-shadow:0 0 5px ${X.glow};">${X.label}</span>
          </div>
        `}z.appendChild(F),I||s.appendChild(z);const te=document.createElement("div");te.className="glass-card section",te.style.padding="var(--sp-5)",te.innerHTML=`
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-5);">
          <div>
            <h3 style="font-size:var(--fs-md); font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.2rem;">🚨</span> Status Prioritas Request ke Gudang
            </h3>
            <p style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:2px;">Monitor stok aktual vs buffer pengiriman per jam</p>
          </div>
        </div>
        <div id="priority-grid-container" class="priority-grid">
          <div class="priority-card priority-card--safe">
            <div style="font-size:1.8rem; margin-bottom:var(--sp-2);">✅</div>
            <div style="font-weight:700; font-size:var(--fs-base); color:#00e0a3;">Semua Level Material Aman</div>
            <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:4px;">Stok transit mencukupi kebutuhan buffer pengiriman</div>
          </div>
        </div>
      `,I||s.appendChild(te),(async()=>{try{const X=S(),ee=await PMCStore.getPriorityAlerts(X),ne=document.getElementById("priority-grid-container");if(!ne||ee.length===0)return;ne.innerHTML="",ee.forEach(se=>{const oe=se.status==="KRITIS",re=document.createElement("div");re.className=`priority-card ${oe?"priority-card--kritis":"priority-card--warning"}`,re.innerHTML=`
              <div class="priority-status ${oe?"priority-status--kritis":"priority-status--warning"}">
                ${oe?"🔴":"🟡"} STATUS: ${se.status}
              </div>
              <div class="priority-material">
                ${se.material}
                <span class="priority-block-badge">📍 ${se.blockLabel}</span>
              </div>
              <div class="priority-details">
                <div>Stok: <strong>${PMCStore.formatNumber(se.actual)} Pcs</strong></div>
                ${se.incoming>0?`<div style="color:#00d2ff">OTW: <strong>${PMCStore.formatNumber(se.incoming)}</strong></div>`:""}
              </div>
              <div class="priority-footer">
                Kirim: <strong>${se.bufferPallets} Palet</strong> (@ ${PMCStore.formatNumber(se.palletQty)} pcs)
              </div>
            `,ne.appendChild(re)})}catch(X){console.warn("Priority alerts:",X.message)}})();const Y=document.createElement("div");Y.className="glass-card section",Y.style.padding="var(--sp-5)",Y.innerHTML='<h3 style="margin-bottom:var(--sp-4); font-size:var(--fs-md); font-weight:700;">Jadwal Produksi Terbaru</h3>',Y.appendChild(DataTableComponent.create({columns:[{key:"date",label:"Tanggal",render:X=>PMCStore.formatDate(X)},{key:"skuCount",label:"Total SKU",align:"center"},{key:"total",label:"Total Qty",align:"right",render:X=>PMCStore.formatNumber(X)},{key:"status",label:"Status",align:"center",render:X=>X==="converted"?'<span class="badge badge-success">Selesai</span>':'<span class="badge badge-warning">Draft</span>'}],data:t})),o||s.appendChild(Y),d.appendChild(s)}catch(a){console.error("Dashboard error:",a),d.innerHTML=`<div class="alert alert-danger" style="margin:20px;">Gagal memuat data: ${a.message}</div>`}TopbarComponent.render("/dashboard")}function S(){return e||PMCStore.getLogicalDateStr()}async function L(l){const{shiftKey:o,shiftLabel:d,currentSlot:a,nextSlot:r,now:t,slots:s}=$(),y=S();let p=0;a?p=await m(o,a.id):p=await PMCStore.calculateShiftProgress(o);const T=`${y}_${o}_${a?a.id:1}`;PMCStore.activeDeliveries.find(i=>i.compositeKey===T);const x=i=>String(i).padStart(2,"0"),H=`${x(t.getHours())}:${x(t.getMinutes())}:${x(t.getSeconds())}`,A=PMCStore.getLogicalDateStr(),f=b==="LIVE"&&(!e||e===A);let E=f?`<div id="dashboard-live-clock" style="font-family:'JetBrains Mono', 'Fira Code', monospace; font-size:1.6rem; font-weight:800; color:#00d2ff; text-shadow:0 0 15px rgba(0,210,255,0.5), 0 0 30px rgba(0,210,255,0.2); letter-spacing:2px;">${H}</div>
       <div style="font-size:0.65rem; color:var(--text-secondary); margin-top:2px;" class="live-pulse">🔴 WAKTU SERVER LIVE</div>`:`<div style="font-family:'JetBrains Mono', 'Fira Code', monospace; font-size:1.6rem; font-weight:800; color:var(--text-secondary); text-shadow:0 0 15px rgba(255,255,255,0.1); letter-spacing:2px;">REKAPITULASI</div>
       <div style="font-size:0.65rem; color:var(--text-secondary); margin-top:2px;">MODE RIWAYAT HISTORIS</div>`,g=y;try{const i=y.split("-");g=`${i[2]} ${["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][parseInt(i[1])-1]} ${i[0]}`}catch{}t.getHours()*60+t.getMinutes();let h="";s.forEach(i=>{let n="upcoming",k="⏳";a&&i.id===a.id?(n="active",k="🔴"):a&&i.id<a.id&&(n="completed",k="✅");const C={active:"linear-gradient(135deg, rgba(108,92,231,0.3), rgba(0,210,255,0.15))",completed:"rgba(0,224,163,0.1)",upcoming:"rgba(255,255,255,0.03)"},u={active:"1.5px solid var(--accent)",completed:"1px solid rgba(0,224,163,0.3)",upcoming:"1px solid rgba(255,255,255,0.08)"},v={active:"0 0 12px rgba(108,92,231,0.4)",completed:"none",upcoming:"none"};h+=`
        <div style="
          flex:1; min-width:120px; padding:10px 12px; border-radius:10px;
          background:${C[n]}; border:${u[n]};
          box-shadow:${v[n]}; text-align:center;
          transition: all 0.3s ease;
          ${n==="active"?"transform:scale(1.03);":""}
        ">
          <div style="font-size:0.75rem; margin-bottom:4px;">${k} Group ${i.id}</div>
          <div style="font-weight:700; font-size:0.85rem; color:${n==="active"?"var(--accent)":n==="completed"?"#00e0a3":"var(--text-secondary)"};">${i.label}</div>
          <div style="font-size:0.65rem; margin-top:4px; color:var(--text-secondary);">${n==="active"?"SEDANG BERJALAN":n==="completed"?"Selesai":"Menunggu"}</div>
        </div>
      `}),l.innerHTML=`
      <div class="delivery-track">
        <div class="track-endpoint track-left" title="Gudang Transit">
          <svg width="44" height="40" viewBox="0 0 44 40">
            <rect x="4" y="14" width="36" height="22" rx="2" fill="#0b1628" stroke="#00d2ff" stroke-width="1.2"/>
            <polygon points="22,2 2,14 42,14" fill="#0d1f35" stroke="#00d2ff" stroke-width="1.2"/>
            <rect x="14" y="22" width="16" height="14" rx="1" fill="#0a1929" stroke="#00d2ff" stroke-width="0.8"/>
            <line x1="14" y1="26" x2="30" y2="26" stroke="#00d2ff" opacity="0.3" stroke-width="0.6"/>
            <line x1="14" y1="30" x2="30" y2="30" stroke="#00d2ff" opacity="0.3" stroke-width="0.6"/>
            <line x1="14" y1="34" x2="30" y2="34" stroke="#00d2ff" opacity="0.3" stroke-width="0.6"/>
            <rect x="6" y="18" width="5" height="4" rx="1" fill="#00d2ff" opacity="0.2"/>
            <rect x="33" y="18" width="5" height="4" rx="1" fill="#00d2ff" opacity="0.2"/>
            <rect x="18" y="24" width="8" height="2" rx="0.5" fill="#00d2ff" opacity="0.15"/>
          </svg>
          <span class="track-label">Gudang</span>
        </div>
        <div class="track-road">
          <div class="aurora-trail"></div>
          <div class="animated-truck-wrapper">
            <svg class="truck-svg" width="48" height="32" viewBox="0 0 48 32">
              <rect x="0" y="4" width="28" height="18" rx="3" fill="#1e3a5f" stroke="#00d2ff" stroke-width="1.2"/>
              <rect x="2" y="6" width="24" height="14" rx="2" fill="#0d2137" opacity="0.8"/>
              <line x1="9" y1="6" x2="9" y2="20" stroke="#00d2ff" opacity="0.15" stroke-width="0.8"/>
              <line x1="18" y1="6" x2="18" y2="20" stroke="#00d2ff" opacity="0.15" stroke-width="0.8"/>
              <rect x="28" y="8" width="16" height="14" rx="3" fill="#2a4a6b" stroke="#00d2ff" stroke-width="1.2"/>
              <rect x="34" y="10" width="8" height="6" rx="2" fill="#0a1929" stroke="#38bdf8" stroke-width="0.8"/>
              <circle cx="45" cy="18" r="2" fill="#fbbf24"/>
              <circle cx="45" cy="18" r="4" fill="#fbbf24" opacity="0.15"/>
              <circle cx="8" cy="24" r="5" fill="#1a1a2e" stroke="#64748b" stroke-width="1.5"/>
              <circle cx="8" cy="24" r="2" fill="#334155"/>
              <circle cx="36" cy="24" r="5" fill="#1a1a2e" stroke="#64748b" stroke-width="1.5"/>
              <circle cx="36" cy="24" r="2" fill="#334155"/>
              <rect x="0" y="20" width="3" height="3" rx="1" fill="#475569"/>
            </svg>
            <div class="exhaust-container">
              <div class="exhaust-puff"></div>
              <div class="exhaust-puff"></div>
              <div class="exhaust-puff"></div>
              <div class="exhaust-puff"></div>
            </div>
          </div>
        </div>
        <div class="track-endpoint track-right" title="Line Produksi">
          <svg width="44" height="40" viewBox="0 0 44 40">
            <rect x="4" y="12" width="36" height="24" rx="2" fill="#0b1628" stroke="#00e0a3" stroke-width="1.2"/>
            <polygon points="4,12 12,4 12,12" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <polygon points="12,12 20,4 20,12" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <polygon points="20,12 28,4 28,12" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <polygon points="28,12 36,4 36,12" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <rect x="36" y="2" width="5" height="10" rx="1" fill="#0d1f35" stroke="#00e0a3" stroke-width="1"/>
            <circle cx="15" cy="24" r="5" fill="none" stroke="#00e0a3" stroke-width="1" opacity="0.6"/>
            <circle cx="15" cy="24" r="2" fill="#00e0a3" opacity="0.3"/>
            <line x1="15" y1="19" x2="15" y2="21" stroke="#00e0a3" stroke-width="1" opacity="0.5"/>
            <line x1="15" y1="27" x2="15" y2="29" stroke="#00e0a3" stroke-width="1" opacity="0.5"/>
            <line x1="10" y1="24" x2="12" y2="24" stroke="#00e0a3" stroke-width="1" opacity="0.5"/>
            <line x1="18" y1="24" x2="20" y2="24" stroke="#00e0a3" stroke-width="1" opacity="0.5"/>
            <rect x="24" y="28" width="14" height="3" rx="1" fill="#00e0a3" opacity="0.15"/>
            <circle cx="26" cy="31" r="2" fill="#0b1628" stroke="#00e0a3" stroke-width="0.8" opacity="0.4"/>
            <circle cx="36" cy="31" r="2" fill="#0b1628" stroke="#00e0a3" stroke-width="0.8" opacity="0.4"/>
            <rect x="27" y="20" width="6" height="8" rx="1" fill="#0a1929" stroke="#00e0a3" stroke-width="0.8"/>
          </svg>
          <span class="track-label" style="color:#00e0a3;">Produksi</span>
        </div>
      </div>
      <div class="glass-card" style="border-left:4px solid var(--accent); padding:var(--sp-5);">
        <!-- Live Clock & Date Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4); padding-bottom:var(--sp-3); border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>
            <div style="display:flex; align-items:center; gap:var(--sp-3); margin-bottom:4px;">
              <h3 style="color:var(--accent); font-size:var(--fs-base); font-weight:700; display:flex; align-items:center; margin: 0;">
                <span class="live-pulse" style="width:6px; height:6px; background-color:var(--accent);"></span> Aktual Pengiriman ${d}
              </h3>
              <a href="#/distribution/hourly" style="background:rgba(108, 92, 231, 0.1); color:var(--accent); border:1px solid rgba(108, 92, 231, 0.3); padding: 3px 8px; font-size: 0.7rem; border-radius: 4px; text-decoration:none; transition:all 0.2s;">Detail ↗</a>
            </div>
            <div style="font-size:var(--fs-xs); color:var(--text-secondary);" id="dashboard-live-date">${g}</div>
          </div>
          <div style="text-align:right;">
            ${E}
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-3);">
          <span style="font-size:var(--fs-sm); color:var(--text-secondary);">Progress Pengiriman</span>
          <span style="font-weight:700; font-size:var(--fs-lg); text-shadow: 0 0 10px var(--accent-glow);">${p}%</span>
        </div>
        <div style="height:10px; background:var(--bg-surface-2); border-radius:5px; overflow:hidden; margin-bottom:var(--sp-5);">
          <div style="height:100%; width:${p}%; background:var(--accent); transition: width 0.5s ease;"></div>
        </div>

        <!-- Slot Timeline -->
        <div style="margin-bottom:var(--sp-3);">
          <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-bottom:var(--sp-3); font-weight:600; text-transform:uppercase; letter-spacing:1px;">📋 Timeline Pengiriman ${d}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${h}
          </div>
        </div>

        <!-- Current & Next Info -->
        <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm); color:var(--text-secondary); padding-top:var(--sp-3); border-top:1px solid rgba(255,255,255,0.06);">
          <span>🟢 Aktif: ${a?`Group ${a.id} (${a.label})`:"N/A"}</span>
          <span>⏭️ Selanjutnya: ${r?`Group ${r.id} (${r.label})`:"Shift Selesai"}</span>
        </div>
      </div>
    `,window._dashboardClockTimer&&clearInterval(window._dashboardClockTimer),f&&(window._dashboardClockTimer=setInterval(()=>{const i=document.getElementById("dashboard-live-clock"),n=document.getElementById("dashboard-live-date");if(!i){clearInterval(window._dashboardClockTimer);return}const k=new Date,C=D=>String(D).padStart(2,"0");i.innerHTML=`${C(k.getHours())}:${C(k.getMinutes())}:${C(k.getSeconds())} WAKTU SERVER LIVE`;const u=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],v=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];n&&(n.textContent=`${u[k.getDay()]}, ${k.getDate()} ${v[k.getMonth()]} ${k.getFullYear()}`)},1e3))}function $(){const l=new Date,o=l.getHours()*60+l.getMinutes(),d=PMCStore.getLogicalDateStr(),a=b==="LIVE"&&(!e||e===d),r=S(),t=ShiftConfig.getSlots(r);let s="SH3",y="Shift 3";a?(s=ShiftConfig.detectCurrentShift(r,o),y=s==="SH1"?"Shift 1":s==="SH2"?"Shift 2":"Shift 3"):(s=b!=="LIVE"?b:"SH1",y=s==="SH1"?"Shift 1":s==="SH2"?"Shift 2":"Shift 3");const p=t[s];let T=null,x=null;if(a)for(let H=0;H<p.length;H++){const A=p[H];let f=!1;if(s==="SH3"&&A.id===1?f=o>=A.startMins||o<A.endMins:f=o>=A.startMins&&o<A.endMins,f){T=A,x=p[H+1]||null;break}}else T=null;if(!T&&a){for(let H=0;H<p.length;H++){const A=p[H],f=(s==="SH3"&&A.startMins<420,A.startMins);if(o<f||s==="SH3"&&A.id===1&&o<A.startMins){T=p[Math.max(0,H-1)],x=A;break}}T||(T=p[p.length-1],x=null)}return{shiftKey:s,shiftLabel:y,currentSlot:T,nextSlot:x,now:l,slots:p}}async function m(l,o){var p,T;const d=S(),a=await PMCStore.getHourlyDistribution(d);let r=0;a&&a.length>0&&a.forEach(x=>{x.slots&&x.slots[l]&&x.slots[l][o-1]&&(r+=x.slots[l][o-1].pallets||0)});let t=0;const s=`${d}_${l}_${o}`,y=PMCStore.activeDeliveries.find(x=>x.id===s||x.compositeKey===s);return y&&y.items&&y.items.forEach(x=>{const H=x.materialName||x.material;let A=0;if(x.scans&&x.scans.forEach(f=>{A+=f.qtyPallet||1}),A>0&&a){const f=a.find(E=>E.name===H);if(f&&f.slots&&f.slots[l]&&f.slots[l][o-1]){const E=f.slots[l][o-1].details||[];let g=0;for(let h=0;h<Math.min(A,E.length);h++)g+=E[h].qty||0;if(A>E.length&&E.length>0){const h=(f.slots[l][o-1].pallets||0)/E.length;g+=(A-E.length)*h}t+=g}}}),console.log(`[Dashboard] calculateSlotProgress(${l}, Slot ${o}):`,{deliveryId:s,foundDelivery:!!y,deliveryStatus:y==null?void 0:y.status,itemCount:(p=y==null?void 0:y.items)==null?void 0:p.length,items:(T=y==null?void 0:y.items)==null?void 0:T.map(x=>{var H;return{mat:x.material||x.materialName,scansCount:(H=x.scans)==null?void 0:H.length,scanned:x.scanned}}),totalSPBPcs:r,totalScannedPcs:Math.round(t),hourlyMaterials:a==null?void 0:a.map(x=>x.name)}),r>0?Math.round(t/r*100):0}return{render:P}})();window.DashboardPage=De;const Fe=(()=>{let e="",b="",P=1;const S=10;let L=!1;function $(){if(window.location.hash!=="#/master/sku")return;ChartWrapper.destroyAll();const l=document.getElementById("page-content");l.innerHTML="",L||(PMCStore.on("skuChanged",()=>{window.location.hash==="#/master/sku"&&$()}),L=!0);const o=document.createElement("div");o.className="page-enter";const d=document.createElement("button");d.className="btn btn-primary",d.innerHTML="+ Tambah SKU",d.addEventListener("click",()=>m()),TopbarComponent.render("/master/sku",[d]);const a=document.createElement("div");a.className="toolbar";const r=document.createElement("div");r.className="search-input",r.innerHTML='<span class="icon">🔍</span>';const t=document.createElement("input");t.placeholder="Cari SKU...",t.value=e,t.addEventListener("input",g=>{e=g.target.value,P=1,$()}),r.appendChild(t),a.appendChild(r);const s=document.createElement("select");s.className="filter-select",s.innerHTML='<option value="">Semua UOM</option>',[...new Set(PMCStore.skuList.map(g=>g.uom))].forEach(g=>{s.innerHTML+=`<option value="${g}" ${b===g?"selected":""}>${g}</option>`}),s.addEventListener("change",g=>{b=g.target.value,P=1,$()}),a.appendChild(s),o.appendChild(a);let p=PMCStore.skuList.filter(g=>{const h=!e||g.code.toLowerCase().includes(e.toLowerCase())||g.name.toLowerCase().includes(e.toLowerCase()),i=!b||g.uom===b;return h&&i});const T=p.length,x=p.slice((P-1)*S,P*S),H=document.createElement("div");H.className="section",H.appendChild(DataTableComponent.create({columns:[{key:"code",label:"Oracle Code"},{key:"name",label:"Nama SKU"},{key:"category",label:"Kategori",render:g=>g||"-"},{key:"uom",label:"UOM",align:"center",render:g=>`<span class="badge badge-accent">${g}</span>`}],data:x,actions:[{icon:"✏️",label:"Edit",onClick:g=>m(g)},{icon:"🗑",label:"Hapus",onClick:g=>{confirm(`Hapus SKU ${g.code}?`)&&(PMCStore.deleteSKU(g.id),ToastComponent.show("Menghapus SKU...","info"))}}]})),o.appendChild(H),o.appendChild(PaginationComponent.create({totalItems:T,perPage:S,currentPage:P,onChange:g=>{P=g,$()}}));const A=document.createElement("div");A.className="divider",o.appendChild(A);const f=document.createElement("div");f.className="section";const E=document.createElement("div");E.className="section-header",E.innerHTML='<h3 class="section-title">📐 Konversi Satuan (UOM Mapping)</h3>',f.appendChild(E),f.appendChild(DataTableComponent.create({columns:[{key:"uom",label:"UOM"},{key:"unit",label:"Satuan"},{key:"conversion",label:"Konversi"}],data:PMCStore.uomConversions})),o.appendChild(f),l.appendChild(o)}function m(l){const o=!!l,d=document.createElement("div");d.innerHTML=`
      <div class="form-group">
        <label class="form-label">Oracle Code</label>
        <input class="form-input" id="sku-code" value="${(l==null?void 0:l.code)||""}" placeholder="Contoh: SKU007" ${o?"readonly":""} />
      </div>
      <div class="form-group">
        <label class="form-label">Nama SKU</label>
        <input class="form-input" id="sku-name" value="${(l==null?void 0:l.name)||""}" placeholder="Contoh: ABC Mocca 250g" />
      </div>
      <div class="form-group">
        <label class="form-label">Kategori</label>
        <input class="form-input" id="sku-category" value="${(l==null?void 0:l.category)||""}" placeholder="Contoh: Kopi / Susu" />
      </div>
      <div class="form-group">
        <label class="form-label">UOM</label>
        <select class="form-input" id="sku-uom">
          <option value="BOX" ${(l==null?void 0:l.uom)==="BOX"?"selected":""}>BOX</option>
          <option value="PCS" ${(l==null?void 0:l.uom)==="PCS"?"selected":""}>PCS</option>
          <option value="KG" ${(l==null?void 0:l.uom)==="KG"?"selected":""}>KG</option>
        </select>
      </div>
    `,ModalComponent.open({title:o?"Edit SKU":"Tambah SKU Baru",body:d,onSave:()=>{const a=document.getElementById("sku-code").value.trim(),r=document.getElementById("sku-name").value.trim(),t=document.getElementById("sku-category").value.trim(),s=document.getElementById("sku-uom").value;if(!a||!r){ToastComponent.show("Kode dan Nama wajib diisi","error");return}console.log("DEBUG: Attempting to save SKU:",{code:a,name:r,category:t,uom:s}),o?(PMCStore.updateSKU(l.id,{name:r,category:t,uom:s}),ToastComponent.show("Memperbarui SKU...","info")):(PMCStore.addSKU({code:a,name:r,category:t,uom:s}),ToastComponent.show("Menyimpan SKU baru...","info")),ModalComponent.close()}})}return{render:$}})();window.MasterSKUPage=Fe;const Oe=(()=>{let e="";const b=new Set;let P=!1;function S(){if(window.location.hash!=="#/master/bom")return;ChartWrapper.destroyAll();const m=document.getElementById("page-content");m.innerHTML="",P||(PMCStore.on("bomChanged",()=>{window.location.hash==="#/master/bom"&&S()}),P=!0);const l=document.createElement("div");l.className="page-enter";const o=document.createElement("button");o.className="btn btn-primary",o.innerHTML="+ Tambah BOM",o.addEventListener("click",()=>L()),TopbarComponent.render("/master/bom",[o]);const d=document.createElement("div");d.className="toolbar";const a=document.createElement("div");a.className="search-input",a.innerHTML='<span class="icon">🔍</span>';const r=document.createElement("input");r.placeholder="Cari SKU / Komponen...",r.value=e,r.addEventListener("input",s=>{e=s.target.value,S()}),a.appendChild(r),d.appendChild(a),l.appendChild(d);const t=PMCStore.bomData.filter(s=>{const y=PMCStore.getSKU(s.skuId);if(!y)return!1;if(!e)return!0;const p=e.toLowerCase();return y.code.toLowerCase().includes(p)||y.name.toLowerCase().includes(p)||s.components.some(T=>T.name.toLowerCase().includes(p))});t.length===0&&(l.innerHTML+='<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Tidak ada BOM ditemukan</div></div>'),t.forEach(s=>{const y=PMCStore.getSKU(s.skuId),p=b.has(s.skuId),T=document.createElement("div");T.className=`accordion-item ${p?"open":""}`;const x=document.createElement("div");x.className="accordion-header",x.innerHTML=`
        <span class="accordion-arrow">▶</span>
        <span class="accordion-title">${(y==null?void 0:y.code)||s.skuId} — ${(y==null?void 0:y.name)||"Unknown"}</span>
        <span class="accordion-badge badge badge-accent">${s.components.length} komponen</span>
      `,x.addEventListener("click",()=>{b.has(s.skuId)?b.delete(s.skuId):b.add(s.skuId),S()}),T.appendChild(x);const H=document.createElement("div");if(H.className="accordion-body",p){H.appendChild(DataTableComponent.create({columns:[{key:"name",label:"Komponen"},{key:"oracleCode",label:"Kode Oracle",render:f=>f||'<span style="color:var(--text-muted)">-</span>'},{key:"coefficient",label:"Koefisien",align:"right",render:f=>PMCStore.formatDecimal(f,6)},{key:"uom",label:"UOM",align:"center",render:f=>`<span class="badge badge-accent">${f}</span>`},{key:"line",label:"Line",align:"center",render:f=>f?`<span class="badge badge-primary">Line ${f}</span>`:'<span class="badge">Semua Line</span>'},{key:"rounding",label:"Pembulatan",align:"center",render:f=>f==="ceiling"?"⬆ Ceiling":f}],data:s.components,actions:[{icon:"✏️",label:"Edit",onClick:(f,E)=>$(s.skuId,E,f)},{icon:"🗑",label:"Hapus",onClick:(f,E)=>{confirm(`Hapus komponen ${f.name}?`)&&(PMCStore.deleteBOMComponent(s.skuId,E),ToastComponent.show("Menghapus komponen...","info"))}}]}));const A=document.createElement("button");A.className="btn btn-secondary btn-sm",A.style.marginTop="var(--sp-3)",A.innerHTML="+ Tambah Komponen",A.addEventListener("click",()=>$(s.skuId)),H.appendChild(A)}T.appendChild(H),l.appendChild(T)}),m.appendChild(l)}function L(){const m=PMCStore.skuList.filter(o=>!PMCStore.getBOM(o.id));if(m.length===0){ToastComponent.show("Semua SKU sudah memiliki BOM","info");return}const l=document.createElement("div");l.innerHTML=`
      <div class="form-group">
        <label class="form-label">Pilih SKU</label>
        <select class="form-input" id="bom-sku">
          ${m.map(o=>`<option value="${o.id}">${o.code} — ${o.name}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Nama Komponen Pertama</label>
        <input class="form-input" id="bom-comp-name" placeholder="Contoh: Karton" />
      </div>
      <div class="form-group">
        <label class="form-label">Kode Oracle</label>
        <input class="form-input" id="bom-comp-oracle" placeholder="Contoh: ORC-123" />
      </div>
      <div class="form-group">
        <label class="form-label">Koefisien</label>
        <input class="form-input" id="bom-comp-coef" type="number" step="any" value="1" />
      </div>
      <div class="form-group">
        <label class="form-label">UOM</label>
        <select class="form-input" id="bom-comp-uom">
          <option value="PCS">PCS</option>
          <option value="ROL">ROL</option>
          <option value="KG">KG</option>
          <option value="LBR">LBR</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Pembulatan</label>
        <select class="form-input" id="bom-comp-round">
          <option value="ceiling">⬆ Ceiling</option>
          <option value="2decimal">2 Desimal</option>
          <option value="3decimal">3 Desimal</option>
          <option value="4decimal">4 Desimal</option>
        </select>
      </div>
    `,ModalComponent.open({title:"Tambah BOM Baru",body:l,onSave:()=>{const o=document.getElementById("bom-sku").value,d={name:document.getElementById("bom-comp-name").value.trim(),oracleCode:document.getElementById("bom-comp-oracle").value.trim(),coefficient:parseFloat(document.getElementById("bom-comp-coef").value)||0,uom:document.getElementById("bom-comp-uom").value,rounding:document.getElementById("bom-comp-round").value,line:""};if(!d.name){ToastComponent.show("Nama komponen wajib diisi","error");return}PMCStore.addBOMComponent(o,d),b.add(o),ModalComponent.close(),ToastComponent.show("Menyimpan BOM baru...","info")}})}function $(m,l,o){const d=o!==void 0,r='<option value="">-- Berlaku Semua Line --</option>'+(PMCStore.getLinesForSku(m)||[]).map(s=>`<option value="${s}" ${(o==null?void 0:o.line)===s?"selected":""}>Line ${s}</option>`).join(""),t=document.createElement("div");t.innerHTML=`
      <div class="form-group">
        <label class="form-label">Nama Komponen</label>
        <input class="form-input" id="comp-name" value="${(o==null?void 0:o.name)||""}" placeholder="Contoh: Plastik Mocca" />
      </div>
      <div class="form-group">
        <label class="form-label">Kode Oracle</label>
        <input class="form-input" id="comp-oracle" value="${(o==null?void 0:o.oracleCode)||""}" placeholder="Contoh: ORC-123" />
      </div>
      <div class="form-group">
        <label class="form-label">Koefisien (per 1 Box)</label>
        <input class="form-input" id="comp-coef" type="number" step="any" value="${(o==null?void 0:o.coefficient)||1}" />
      </div>
      <div class="form-group">
        <label class="form-label">UOM</label>
        <select class="form-input" id="comp-uom">
          <option value="PCS" ${(o==null?void 0:o.uom)==="PCS"?"selected":""}>PCS</option>
          <option value="ROL" ${(o==null?void 0:o.uom)==="ROL"?"selected":""}>ROL</option>
          <option value="KG" ${(o==null?void 0:o.uom)==="KG"?"selected":""}>KG</option>
          <option value="LBR" ${(o==null?void 0:o.uom)==="LBR"?"selected":""}>LBR</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Terapkan pada Line (Opsional)</label>
        <select class="form-input" id="comp-line">
          ${r}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Pembulatan</label>
        <select class="form-input" id="comp-round">
          <option value="ceiling" ${(o==null?void 0:o.rounding)==="ceiling"?"selected":""}>⬆ Ceiling</option>
          <option value="2decimal" ${(o==null?void 0:o.rounding)==="2decimal"?"selected":""}>2 Desimal</option>
          <option value="3decimal" ${(o==null?void 0:o.rounding)==="3decimal"?"selected":""}>3 Desimal</option>
          <option value="4decimal" ${(o==null?void 0:o.rounding)==="4decimal"?"selected":""}>4 Desimal</option>
        </select>
      </div>
    `,ModalComponent.open({title:d?"Edit Komponen":"Tambah Komponen",body:t,onSave:()=>{const s={name:document.getElementById("comp-name").value.trim(),oracleCode:document.getElementById("comp-oracle").value.trim(),coefficient:parseFloat(document.getElementById("comp-coef").value)||0,uom:document.getElementById("comp-uom").value,rounding:document.getElementById("comp-round").value,line:document.getElementById("comp-line").value||null};if(!s.name){ToastComponent.show("Nama komponen wajib diisi","error");return}d?PMCStore.updateBOMComponent(m,l,s):PMCStore.addBOMComponent(m,s),ModalComponent.close(),ToastComponent.show(d?"Menyimpan perubahan...":"Menambahkan komponen...","info")}})}return{render:S}})();window.MasterBOMPage=Oe;const je=(()=>{let e=[],b=[],P="";const S={A:{bg:"rgba(99, 102, 241, 0.15)",color:"#818cf8",border:"rgba(99, 102, 241, 0.3)"},B:{bg:"rgba(16, 185, 129, 0.15)",color:"#34d399",border:"rgba(16, 185, 129, 0.3)"},C:{bg:"rgba(245, 158, 11, 0.15)",color:"#fbbf24",border:"rgba(245, 158, 11, 0.3)"},D:{bg:"rgba(239, 68, 68, 0.15)",color:"#f87171",border:"rgba(239, 68, 68, 0.3)"},E:{bg:"rgba(168, 85, 247, 0.15)",color:"#c084fc",border:"rgba(168, 85, 247, 0.3)"},F:{bg:"rgba(6, 182, 212, 0.15)",color:"#22d3ee",border:"rgba(6, 182, 212, 0.3)"},G:{bg:"rgba(234, 88, 12, 0.15)",color:"#fb923c",border:"rgba(234, 88, 12, 0.3)"},H:{bg:"rgba(139, 92, 246, 0.15)",color:"#a78bfa",border:"rgba(139, 92, 246, 0.3)"}};let L=!1;function $(a){return S[a]||{bg:"rgba(148,163,184,0.15)",color:"#94a3b8",border:"rgba(148,163,184,0.3)"}}function m(a){if(!a)return"";const r=$(a);return`<span style="display:inline-block;padding:2px 7px;border-radius:5px;font-size:0.7rem;font-weight:600;background:${r.bg};color:${r.color};border:1px solid ${r.border}">${a}</span>`}function l(){const a=new Set;PMCStore.bomData&&PMCStore.bomData.forEach(r=>{r.components&&r.components.forEach(t=>a.add(t.name))}),e=[...a].sort(),b=PMCStore.getBlockLayout()}function o(){if(window.location.hash!=="#/master/block")return;L||(PMCStore.on("layoutChanged",()=>{window.location.hash==="#/master/block"&&(l(),o())}),L=!0),(!b||b.length===0)&&l(),ChartWrapper.destroyAll();const a=document.getElementById("page-content");a.innerHTML="";const r=document.createElement("div");r.className="page-enter";const t=document.createElement("div");t.className="page-header",t.style.display="flex",t.style.justifyContent="space-between",t.style.alignItems="center",t.innerHTML=`
      <div>
        <h2 class="page-title">🗺️ Master Layout Blok</h2>
        <p class="page-subtitle">Atur material dan line produksi pada setiap baris blok pabrik</p>
      </div>
    `;const s=document.createElement("button");s.className="btn btn-success btn-lg",s.innerHTML="💾 Simpan Konfigurasi",s.addEventListener("click",d),t.appendChild(s),r.appendChild(t);const y=document.createElement("div");y.className="alert alert-info",y.style.marginBottom="var(--sp-6)",y.innerHTML=`
      <span class="alert-icon">ℹ️</span>
      <span>Pilih SKU per blok, lalu klik <strong>badge Line</strong> di setiap baris untuk mengaktifkan/menonaktifkan line. Jangan lupa klik <strong>Simpan</strong>.</span>
    `,r.appendChild(y);const p=n=>!n||n.length===0?[]:PMCStore.skuList.filter(k=>n.includes(k.category)),T=n=>{const k=p(n),C=new Set;return k.forEach(u=>{PMCStore.getLinesForSku(u.id).forEach(v=>C.add(v))}),[...C].sort()},x=n=>{const k=p(n),C=new Set;return k.forEach(u=>{const v=PMCStore.getBOM(u.id);v&&v.components&&v.components.forEach(D=>C.add(D.name))}),[...C].sort()},H=new Set;b.forEach(n=>{n.skuCategories&&n.skuCategories.length>0&&T(n.skuCategories).forEach(k=>H.add(k))});const A=[...H].sort(),f=document.createElement("div");f.style.display="flex",f.style.alignItems="center",f.style.gap="12px",f.style.marginBottom="var(--sp-4)",f.style.flexWrap="wrap";const E=document.createElement("span");E.style.fontSize="var(--fs-sm)",E.style.fontWeight="600",E.style.color="var(--text-secondary)",E.textContent="🏭 Filter Line:",f.appendChild(E);const g=document.createElement("select");if(g.className="form-input",g.style.width="auto",g.style.minWidth="160px",g.style.padding="6px 10px",g.style.fontSize="var(--fs-sm)",g.innerHTML='<option value="">-- Semua Line --</option>',A.forEach(n=>{g.innerHTML+=`<option value="${n}" ${P===n?"selected":""}>${n}</option>`}),g.addEventListener("change",n=>{P=n.target.value,o()}),f.appendChild(g),P){const n=document.createElement("button");n.className="btn btn-ghost btn-sm",n.style.fontSize="var(--fs-xs)",n.textContent="✕ Reset",n.addEventListener("click",()=>{P="",o()}),f.appendChild(n)}r.appendChild(f);const h=document.createElement("div");if(h.style.display="grid",h.style.gridTemplateColumns="repeat(auto-fill, minmax(380px, 1fr))",h.style.gap="var(--sp-4)",(P?b.filter(n=>!n.skuCategories||n.skuCategories.length===0?!1:T(n.skuCategories).includes(P)):b).forEach(n=>{const k=document.createElement("div");k.className="card",k.style.display="flex",k.style.flexDirection="column",k.style.gap="var(--sp-3)",n.skuCategories||(n.skuCategories=[]);const C=n.skuCategories.length>0?T(n.skuCategories):[],u=new Set;n.rows&&n.rows.forEach(U=>{U.lines&&Array.isArray(U.lines)&&U.lines.forEach(V=>u.add(V))});const v=document.createElement("div");v.style.display="flex",v.style.justifyContent="space-between",v.style.alignItems="center",v.style.borderBottom="1px solid var(--border-color)",v.style.paddingBottom="var(--sp-2)";let D=`<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;"><h3 style="margin:0;color:var(--accent-color);">📍 Blok ${n.blockNumber||n.id}</h3>`;[...u].sort().forEach(U=>{D+=m(U)}),D+="</div>",v.innerHTML=D;const M=document.createElement("button");M.className="btn btn-ghost btn-danger btn-sm",M.textContent="❌",M.title="Hapus Blok",M.addEventListener("click",()=>{confirm(`Yakin hapus Blok ${n.blockNumber||n.id}?`)&&(b=b.filter(U=>U.id!==n.id),o())}),v.appendChild(M),k.appendChild(v);const B=document.createElement("div");B.style.display="flex",B.style.flexDirection="column",B.style.gap="var(--sp-2)",B.style.minHeight="60px",n.rows||(n.rows=[{id:"nr-1",rowNumber:1,maxPallets:4},{id:"nr-2",rowNumber:2,maxPallets:4},{id:"nr-3",rowNumber:3,maxPallets:4},{id:"nr-4",rowNumber:4,maxPallets:4}]);const j=document.createElement("div");j.className="form-group",j.style.marginBottom="var(--sp-2)",j.innerHTML='<label class="form-label" style="font-size:11px;margin-bottom:4px;">Setting Kategori SKU untuk Blok ini:</label>';const O=document.createElement("div");O.style.display="flex",O.style.flexDirection="column",O.style.gap="var(--sp-2)";const q=document.createElement("div");q.style.display="flex",q.style.flexWrap="wrap",q.style.gap="6px",n.skuCategories.forEach(U=>{const V=document.createElement("div");V.style.display="flex",V.style.alignItems="center",V.style.background="var(--bg-secondary)",V.style.border="1px solid var(--border-color)",V.style.padding="2px 8px",V.style.borderRadius="var(--radius-sm)",V.style.fontSize="var(--fs-xs)",V.style.fontWeight="500",V.innerHTML=`<span>${U}</span>`;const _=document.createElement("button");_.type="button",_.textContent="✕",_.style.background="none",_.style.border="none",_.style.color="var(--danger-color)",_.style.cursor="pointer",_.style.marginLeft="4px",_.style.padding="0 2px",_.addEventListener("click",()=>{n.skuCategories=n.skuCategories.filter(N=>N!==U),n.rows.forEach(N=>{N.lines=[]}),o()}),V.appendChild(_),q.appendChild(V)}),O.appendChild(q);const J=[...new Set(PMCStore.skuList.map(U=>U.category).filter(U=>U))].sort().filter(U=>!n.skuCategories.includes(U));if(J.length>0){const U=document.createElement("div");U.style.display="flex",U.style.gap="4px";const V=document.createElement("select");V.className="form-input",V.style.fontSize="var(--fs-xs)",V.style.padding="4px 8px",V.style.flex="1",V.innerHTML='<option value="">-- Tambah Kategori SKU --</option>',J.forEach(_=>{V.innerHTML+=`<option value="${_}">${_}</option>`}),V.addEventListener("change",_=>{_.target.value&&(n.skuCategories.push(_.target.value),n.rows.forEach(N=>{N.lines=[]}),o())}),U.appendChild(V),O.appendChild(U)}if(j.appendChild(O),C.length>0){const U=document.createElement("div");U.style.marginTop="6px",U.style.fontSize="10px",U.style.color="var(--text-muted)";let V="Line terpetakan: ";C.forEach(_=>{V+=m(_)+" "}),U.innerHTML=V,j.appendChild(U)}else if(n.skuCategories.length===0){const U=document.createElement("div");U.style.fontSize="10px",U.style.marginTop="6px",U.style.color="var(--text-muted)",U.textContent="Menampilkan semua material karena kategori kosong (Tanpa Filter).",j.appendChild(U)}k.appendChild(j);let Q=e;if(n.skuCategories&&n.skuCategories.length>0){const U=x(n.skuCategories);U.length>0?Q=U:Q=[]}const K=document.createElement("div");K.style.display="flex",K.style.justifyContent="space-between",K.style.alignItems="center",K.style.marginTop="var(--sp-2)",K.innerHTML=`<span style="font-size:var(--fs-xs);color:var(--text-muted);font-weight:600;">Jumlah Baris: ${n.rows.length}</span>`;const Z=document.createElement("button");Z.className="btn btn-ghost btn-sm",Z.style.padding="2px 8px",Z.style.fontSize="var(--fs-xs)",Z.textContent="+ Tambah Baris",Z.addEventListener("click",()=>{const U=n.rows.length>0?Math.max(...n.rows.map(V=>V.rowNumber||parseInt(V.id)||0))+1:1;n.rows.push({id:"nr-"+Date.now(),rowNumber:U,maxPallets:4,material:"",lines:[]}),o()}),K.appendChild(Z),B.appendChild(K);const ae=document.createElement("div");ae.style.display="flex",ae.style.flexDirection="column",ae.style.gap="6px",ae.style.border="1px solid var(--border-color)",ae.style.padding="8px",ae.style.borderRadius="var(--radius-md)",ae.style.background="var(--bg-main)",n.rows.forEach((U,V)=>{if((!U.lines||!Array.isArray(U.lines))&&(U.lines=[]),P&&!U.lines.includes(P))return;const _=document.createElement("div");_.style.background=U.isFlexible?"rgba(124, 58, 237, 0.08)":"var(--bg-secondary)",_.style.border=U.isFlexible?"1.5px solid rgba(124, 58, 237, 0.3)":"1px solid transparent",_.style.padding="8px",_.style.borderRadius="var(--radius-sm)",_.style.display="flex",_.style.flexDirection="column",_.style.gap="6px",_.style.transition="all 0.2s ease";const N=document.createElement("div");N.style.display="flex",N.style.alignItems="center",N.style.gap="8px";const c=document.createElement("span");c.style.fontSize="var(--fs-sm)",c.style.fontWeight="700",c.style.color="var(--primary-color)",c.style.whiteSpace="nowrap",c.textContent=`B.${n.blockNumber||n.id}.${U.rowNumber||U.id}`,N.appendChild(c);const w=document.createElement("select");w.className="form-input",w.style.flex="1",w.style.padding="2px 4px",w.style.fontSize="var(--fs-xs)",w.innerHTML='<option value="">-- Kosong --</option>',Q.forEach(Y=>{w.innerHTML+=`<option value="${Y}" ${U.material===Y?"selected":""}>${Y}</option>`}),w.addEventListener("change",Y=>{U.material=Y.target.value}),N.appendChild(w);const I=document.createElement("div");I.style.display="flex",I.style.alignItems="center",I.style.gap="4px",I.innerHTML='<span style="font-size:10px;color:var(--text-muted);">Max:</span>';const z=document.createElement("input");z.type="number",z.className="form-input",z.style.padding="2px 4px",z.style.width="45px",z.style.fontSize="var(--fs-sm)",z.style.textAlign="center",z.value=U.maxPallets,z.min="1",z.addEventListener("change",Y=>{U.maxPallets=parseInt(Y.target.value)||4}),I.appendChild(z),N.appendChild(I);const R=document.createElement("div");R.style.display="flex",R.style.alignItems="center",R.style.gap="4px",R.style.marginLeft="4px",R.title="Tandai sebagai Area Slow Moving (Bisa Campur Barang & Diabaikan Inbound Otomatis)";const F=document.createElement("input");F.type="checkbox",F.checked=U.isFlexible||!1,F.style.cursor="pointer",F.addEventListener("change",Y=>{U.isFlexible=Y.target.checked,o()});const W=document.createElement("span");W.style.fontSize="10px",W.style.fontWeight="700",W.style.color=U.isFlexible?"#7c3aed":"var(--text-muted)",W.textContent="📦 Slow",R.appendChild(F),R.appendChild(W),N.appendChild(R);const te=document.createElement("button");if(te.textContent="✖",te.style.background="none",te.style.border="none",te.style.color="var(--danger-color)",te.style.cursor="pointer",te.style.fontSize="12px",te.addEventListener("click",()=>{confirm(`Hapus Baris B.${n.blockNumber||n.id}.${U.rowNumber||U.id}?`)&&(n.rows.splice(V,1),o())}),N.appendChild(te),_.appendChild(N),C.length>0){const Y=document.createElement("div");Y.style.display="flex",Y.style.alignItems="center",Y.style.gap="5px",Y.style.flexWrap="wrap";const X=document.createElement("span");X.style.fontSize="10px",X.style.color="var(--text-muted)",X.style.fontWeight="600",X.style.marginRight="2px",X.textContent="Line:",Y.appendChild(X),C.forEach(ee=>{const ne=U.lines.includes(ee),se=$(ee),oe=document.createElement("button");oe.type="button",oe.style.display="inline-flex",oe.style.alignItems="center",oe.style.justifyContent="center",oe.style.padding="3px 10px",oe.style.borderRadius="6px",oe.style.fontSize="0.75rem",oe.style.fontWeight="600",oe.style.cursor="pointer",oe.style.transition="all 0.15s ease",oe.style.border=`1.5px solid ${ne?se.color:"var(--border-color)"}`,oe.style.background=ne?se.bg:"transparent",oe.style.color=ne?se.color:"var(--text-muted)",oe.style.opacity=ne?"1":"0.5",oe.textContent=ee,oe.title=ne?`Klik untuk nonaktifkan Line ${ee}`:`Klik untuk aktifkan Line ${ee}`,oe.addEventListener("click",()=>{U.lines.includes(ee)?U.lines=U.lines.filter(re=>re!==ee):(U.lines.push(ee),U.lines.sort()),o()}),Y.appendChild(oe)}),_.appendChild(Y)}else if(n.skuCategories&&n.skuCategories.length>0){const Y=document.createElement("div");Y.style.fontSize="10px",Y.style.color="var(--text-muted)",Y.style.fontStyle="italic",Y.textContent="Belum ada line terpetakan untuk kategori SKU ini.",_.appendChild(Y)}ae.appendChild(_)}),B.appendChild(ae),k.appendChild(B),h.appendChild(k)}),!P){const n=document.createElement("div");n.className="card",n.style.display="flex",n.style.alignItems="center",n.style.justifyContent="center",n.style.minHeight="150px",n.style.border="2px dashed var(--border-color)",n.style.backgroundColor="transparent",n.style.boxShadow="none",n.style.cursor="pointer",n.innerHTML=`<div style="text-align:center;color:var(--text-secondary);">
        <div style="font-size:2rem;margin-bottom:var(--sp-2);">➕</div>
        <div style="font-weight:600;">Tambah Blok Baru</div>
      </div>`,n.addEventListener("click",()=>{const k=b.length>0?Math.max(...b.map(C=>C.blockNumber||parseInt(C.id)||0))+1:1;b.push({id:"new-"+Date.now(),blockNumber:k,skuCategories:[],rows:[{id:"nr-1",rowNumber:1,maxPallets:4,material:"",lines:[]},{id:"nr-2",rowNumber:2,maxPallets:4,material:"",lines:[]},{id:"nr-3",rowNumber:3,maxPallets:4,material:"",lines:[]},{id:"nr-4",rowNumber:4,maxPallets:4,material:"",lines:[]}]}),o(),window.scrollTo(0,document.body.scrollHeight)}),h.appendChild(n)}r.appendChild(h),a.appendChild(r),TopbarComponent.render("/master/block")}function d(){PMCStore.saveBlockLayout(b),ToastComponent.show("Konfigurasi Master Blok berhasil disimpan!","success")}return{render:o}})();window.MasterBlockPage=je;const Re=(()=>{let e="",b="",P=1;const S=10;let L=new Set;const $={A:{bg:"rgba(99, 102, 241, 0.15)",color:"#818cf8",border:"rgba(99, 102, 241, 0.3)"},B:{bg:"rgba(16, 185, 129, 0.15)",color:"#34d399",border:"rgba(16, 185, 129, 0.3)"},C:{bg:"rgba(245, 158, 11, 0.15)",color:"#fbbf24",border:"rgba(245, 158, 11, 0.3)"},D:{bg:"rgba(239, 68, 68, 0.15)",color:"#f87171",border:"rgba(239, 68, 68, 0.3)"},E:{bg:"rgba(168, 85, 247, 0.15)",color:"#c084fc",border:"rgba(168, 85, 247, 0.3)"},F:{bg:"rgba(6, 182, 212, 0.15)",color:"#22d3ee",border:"rgba(6, 182, 212, 0.3)"},G:{bg:"rgba(234, 88, 12, 0.15)",color:"#fb923c",border:"rgba(234, 88, 12, 0.3)"},H:{bg:"rgba(139, 92, 246, 0.15)",color:"#a78bfa",border:"rgba(139, 92, 246, 0.3)"}};function m(d){const a=$[d]||{bg:"rgba(148,163,184,0.15)",color:"#94a3b8",border:"rgba(148,163,184,0.3)"};return`<span style="display:inline-block;padding:3px 10px;border-radius:6px;font-size:0.78rem;font-weight:600;background:${a.bg};color:${a.color};border:1px solid ${a.border}">${d}</span>`}function l(){if(window.location.hash!=="#/master/line-sku")return;ChartWrapper.destroyAll();const d=document.getElementById("page-content");d.innerHTML="";const a=document.createElement("div");a.className="page-enter";const r=document.createElement("button");r.className="btn btn-primary",r.innerHTML="+ Tambah Mapping",r.addEventListener("click",()=>o()),TopbarComponent.render("/master/line-sku",[r]);const t=PMCStore.getLinePerSku(),s=[...new Set(t.map(u=>u.line))].sort(),y=[...new Set(t.map(u=>u.skuId))],p=document.createElement("div");p.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px;",p.appendChild(StatCardComponent.create({icon:"🔗",label:"Total Mapping",value:t.length})),p.appendChild(StatCardComponent.create({icon:"🏭",label:"Total Line",value:s.length})),p.appendChild(StatCardComponent.create({icon:"📦",label:"SKU Terpetakan",value:y.length})),a.appendChild(p);const T=document.createElement("div");T.className="toolbar";const x=document.createElement("div");x.className="search-input",x.innerHTML='<span class="icon">🔍</span>';const H=document.createElement("input");H.placeholder="Cari SKU...",H.value=e,H.addEventListener("input",u=>{e=u.target.value,P=1,l()}),x.appendChild(H),T.appendChild(x);const A=document.createElement("select");if(A.className="filter-select",A.innerHTML='<option value="">Semua Line</option>',s.forEach(u=>{A.innerHTML+=`<option value="${u}" ${b===u?"selected":""}>${u}</option>`}),A.addEventListener("change",u=>{b=u.target.value,P=1,l()}),T.appendChild(A),L.size>0){const u=document.createElement("button");u.className="btn btn-danger btn-sm",u.style.marginLeft="auto",u.innerHTML=`🗑 Hapus ${L.size} Terpilih`,u.addEventListener("click",()=>{confirm(`Yakin hapus ${L.size} mapping terpilih?`)&&(L.forEach(v=>{const D=v.split("||");PMCStore.deleteLinePerSku(D[0],D[1])}),L.clear(),ToastComponent.show("Mapping terpilih berhasil dihapus","success"),l())}),T.appendChild(u)}a.appendChild(T);let f=t.filter(u=>{const v=PMCStore.getSKU(u.skuId),D=v?v.name:"",M=v?v.code:u.skuId,B=!e||M.toLowerCase().includes(e.toLowerCase())||D.toLowerCase().includes(e.toLowerCase()),j=!b||u.line===b;return B&&j});const E=f.length,g=f.slice((P-1)*S,P*S),h=document.createElement("div");h.className="section",h.appendChild(DataTableComponent.create({columns:[{width:"40px",align:"center",labelHtml:'<input type="checkbox" id="selectAllCb" title="Pilih Semua di Halaman">',render:(u,v)=>{const D=`${v.skuId}||${v.line}`;return`<input type="checkbox" class="rowCb" data-key="${D}" ${L.has(D)?"checked":""}>`}},{key:"skuId",label:"Kode SKU",render:u=>{const v=PMCStore.getSKU(u);return v?`<strong>${v.code}</strong>`:`<span style="color:var(--danger)">${u} ⚠️</span>`}},{key:"skuId",label:"Nama SKU",render:u=>{const v=PMCStore.getSKU(u);return v?v.name:"-"}},{key:"line",label:"Production Line",align:"center",render:u=>m(u)}],data:g,actions:[{icon:"🗑",label:"Hapus",onClick:u=>{confirm(`Hapus mapping ${u.skuId} → ${u.line}?`)&&(PMCStore.deleteLinePerSku(u.skuId,u.line),ToastComponent.show("Mapping berhasil dihapus","success"),l())}}]})),a.appendChild(h),setTimeout(()=>{const u=document.getElementById("selectAllCb");if(u){const D=g.length>0&&g.every(M=>L.has(`${M.skuId}||${M.line}`));u.checked=D,u.addEventListener("change",M=>{const B=M.target.checked;g.forEach(j=>{const O=`${j.skuId}||${j.line}`;B?L.add(O):L.delete(O)}),l()})}document.querySelectorAll(".rowCb").forEach(D=>{D.addEventListener("change",M=>{const B=M.target.getAttribute("data-key");M.target.checked?L.add(B):L.delete(B),l()})})},0),a.appendChild(PaginationComponent.create({totalItems:E,perPage:S,currentPage:P,onChange:u=>{P=u,l()}}));const i=document.createElement("div");i.className="divider",a.appendChild(i);const n=document.createElement("div");n.className="section";const k=document.createElement("div");k.className="section-header",k.innerHTML='<h3 class="section-title">🏭 Ringkasan per Line</h3>',n.appendChild(k);const C=s.map(u=>{const v=PMCStore.getSkusForLine(u),D=v.map(M=>{const B=PMCStore.getSKU(M);return B?B.name:M});return{line:u,count:v.length,skus:D.join(", ")}});n.appendChild(DataTableComponent.create({columns:[{key:"line",label:"Line",render:u=>m(u)},{key:"count",label:"Jumlah SKU",align:"center",render:u=>`<strong>${u}</strong>`},{key:"skus",label:"SKU yang Diproduksi",render:u=>`<span style="font-size:0.85rem;color:var(--text-secondary)">${u}</span>`}],data:C})),a.appendChild(n),d.appendChild(a)}function o(){const d=document.createElement("div"),a=PMCStore.skuList.map(s=>`<option value="${s.id}">${s.code} — ${s.name}</option>`).join(""),r=Array.from({length:25},(s,y)=>String.fromCharCode(65+y));r.push("Produksi");const t=r.map(s=>`<option value="${s}">${s}</option>`).join("");d.innerHTML=`
      <div class="form-group">
        <label class="form-label">SKU</label>
        <select class="form-input" id="lps-sku">${a}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Production Line</label>
        <select class="form-input" id="lps-line">${t}</select>
      </div>
      <div class="form-group">
        <label class="form-label" style="font-size:0.8rem;color:var(--text-secondary)">Atau ketik line baru:</label>
        <input class="form-input" id="lps-line-custom" placeholder="Contoh: Z" />
      </div>
    `,ModalComponent.open({title:"Tambah Mapping Line per SKU",body:d,onSave:()=>{const s=document.getElementById("lps-sku").value,p=document.getElementById("lps-line-custom").value.trim()||document.getElementById("lps-line").value;if(!s||!p){ToastComponent.show("SKU dan Line wajib diisi","error");return}if(!PMCStore.addLinePerSku(s,p)){ToastComponent.show("Mapping ini sudah ada!","error");return}ToastComponent.show("Mapping berhasil ditambahkan","success"),ModalComponent.close(),l()}})}return{render:l}})();window.MasterLineSKUPage=Re;const ze=(()=>{let e="",b=1;const P=10;let S=!1;function L(){if(window.location.hash!=="#/master/supplier")return;S||(PMCStore.on("supplierChanged",()=>{window.location.hash==="#/master/supplier"&&L()}),S=!0),ChartWrapper.destroyAll();const m=document.getElementById("page-content");m.innerHTML="";const l=document.createElement("div");l.className="page-enter";const o=document.createElement("button");o.className="btn btn-primary",o.innerHTML="+ Tambah Supplier",o.addEventListener("click",()=>$()),TopbarComponent.render("/master/supplier",[o]);const d=document.createElement("div");d.className="toolbar";const a=document.createElement("div");a.className="search-input",a.innerHTML='<span class="icon">🔍</span>';const r=document.createElement("input");r.placeholder="Cari supplier...",r.value=e,r.addEventListener("input",x=>{e=x.target.value,b=1,L()}),a.appendChild(r),d.appendChild(a),l.appendChild(d);let t=PMCStore.supplierList.filter(x=>{if(!e)return!0;const H=e.toLowerCase();return x.code.toLowerCase().includes(H)||x.name.toLowerCase().includes(H)||(x.contact||"").toLowerCase().includes(H)});const s=t.length,y=t.slice((b-1)*P,b*P),p=document.createElement("div");p.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px;",p.appendChild(StatCardComponent.create({icon:"🏢",label:"Total Supplier",value:PMCStore.supplierList.length,sub:"Supplier terdaftar",color:"rgba(108, 92, 231, 0.12)"})),l.appendChild(p);const T=document.createElement("div");T.className="section",T.appendChild(DataTableComponent.create({columns:[{key:"code",label:"Kode Supplier"},{key:"name",label:"Nama Supplier"},{key:"contact",label:"Kontak",render:x=>x||'<span style="color:var(--text-muted)">-</span>'},{key:"address",label:"Alamat",render:x=>x||'<span style="color:var(--text-muted)">-</span>'}],data:y,actions:[{icon:"✏️",label:"Edit",onClick:x=>$(x)},{icon:"🗑",label:"Hapus",onClick:x=>{confirm(`Hapus supplier ${x.name}?`)&&(PMCStore.deleteSupplier(x.id),ToastComponent.show("Supplier berhasil dihapus","success"),L())}}]})),l.appendChild(T),l.appendChild(PaginationComponent.create({totalItems:s,perPage:P,currentPage:b,onChange:x=>{b=x,L()}})),m.appendChild(l)}function $(m){const l=!!m,o=document.createElement("div");o.innerHTML=`
      <div class="form-group">
        <label class="form-label">Kode Supplier</label>
        <input class="form-input" id="sup-code" value="${(m==null?void 0:m.code)||""}" placeholder="Contoh: SUP001" />
      </div>
      <div class="form-group">
        <label class="form-label">Nama Supplier</label>
        <input class="form-input" id="sup-name" value="${(m==null?void 0:m.name)||""}" placeholder="Contoh: PT. Sumber Jaya" />
      </div>
      <div class="form-group">
        <label class="form-label">Kontak (Telp/Email)</label>
        <input class="form-input" id="sup-contact" value="${(m==null?void 0:m.contact)||""}" placeholder="Contoh: 08123456789" />
      </div>
      <div class="form-group">
        <label class="form-label">Alamat</label>
        <input class="form-input" id="sup-address" value="${(m==null?void 0:m.address)||""}" placeholder="Contoh: Jl. Industri No. 10" />
      </div>
    `,ModalComponent.open({title:l?"Edit Supplier":"Tambah Supplier Baru",body:o,onSave:()=>{const d=document.getElementById("sup-code").value.trim(),a=document.getElementById("sup-name").value.trim(),r=document.getElementById("sup-contact").value.trim(),t=document.getElementById("sup-address").value.trim();if(!d||!a){ToastComponent.show("Kode dan Nama wajib diisi","error");return}if(l)PMCStore.updateSupplier(m.id,{code:d,name:a,contact:r,address:t}),ToastComponent.show("Supplier berhasil diperbarui","success");else{if(PMCStore.supplierList.find(s=>s.code===d)){ToastComponent.show("Kode Supplier sudah ada","error");return}PMCStore.addSupplier({code:d,name:a,contact:r,address:t}),ToastComponent.show("Supplier berhasil ditambahkan","success")}ModalComponent.close(),L()}})}return{render:L}})();window.MasterSupplierPage=ze;const qe=(()=>{const e=`http://${window.location.hostname}:3000/api`;let b=[],P="",S=1;const L=10;let $=new Set,m=[],l=[];async function o(){try{const A=await PMCStore.safeFetch(`${e}/master/kamus-opname`);A.ok&&(b=await A.json())}catch(A){console.error("Failed to load kamus opname:",A)}a()}function d(){window.location.hash==="#/master/kamus-opname"&&(ChartWrapper.destroyAll(),$.clear(),m=[],l=[],o())}function a(){const A=document.getElementById("page-content");A.innerHTML="";const f=document.createElement("div");f.className="page-enter";const E=document.createElement("button");E.className="btn btn-primary",E.innerHTML="+ Tambah Material",E.addEventListener("click",()=>H()),TopbarComponent.render("/master/kamus-opname",[E]);const g=document.createElement("div");g.className="section",g.style.marginBottom="var(--sp-6)";const h=document.createElement("div");h.style.cssText="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--sp-3);",h.innerHTML=`
      <div style="display:flex; align-items:center; gap:var(--sp-3);">
        <span class="badge badge-accent" style="font-size:0.8rem; padding:4px 12px;">📥 Import</span>
        <span style="color:var(--text-secondary); font-size:var(--fs-sm);">Upload data Kamus Opname dari file Excel (.xlsx / .xls)</span>
      </div>
    `,g.appendChild(h),g.appendChild(DragDropComponent.create({onFile:(K,Z)=>r(K)}));const i=document.createElement("div");if(i.style.cssText="margin-top:var(--sp-3); padding:var(--sp-3) var(--sp-4); background:rgba(99,102,241,0.08); border-radius:var(--radius-md); border:1px dashed rgba(99,102,241,0.3);",i.innerHTML=`
      <div style="display:flex; align-items:flex-start; gap:var(--sp-3);">
        <span style="font-size:1.2rem;">💡</span>
        <div style="font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
          <strong style="color:var(--text-primary);">Format Kolom Excel:</strong><br>
          File Excel harus memiliki header kolom sebagai berikut (urutan bebas):<br>
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">NAMA MATERIAL</code> &nbsp;
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">KODE ORACLE</code> &nbsp;
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">BERAT ROLL UTUH / SACHET</code> &nbsp;
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">BERAT CORE/BOX</code> &nbsp;
          <code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:0.8rem;">JUMLAH SACHET / ROLL</code>
          <br><button id="btn-download-template" class="btn btn-sm btn-secondary" style="margin-top:var(--sp-2); font-size:0.78rem; padding:4px 12px;">📄 Download Template Excel</button>
        </div>
      </div>
    `,g.appendChild(i),f.appendChild(g),m.length>0||l.length>0){const K=document.createElement("div");if(K.className="section",K.style.marginBottom="var(--sp-6)",l.length>0){const Z=document.createElement("div");Z.style.cssText="margin-bottom:var(--sp-4);",Z.innerHTML=`<div style="font-weight:700; margin-bottom:var(--sp-2); color:var(--warning);">⚠️ Peringatan Import (${l.length})</div>`,l.forEach(ae=>{const U=document.createElement("div");U.className=`alert alert-${ae.type}`,U.style.cssText="padding:var(--sp-2) var(--sp-3); margin-bottom:var(--sp-1); font-size:0.85rem;",U.innerHTML=`<span>${ae.type==="error"?"❌":"⚠️"}</span> ${ae.message}`,Z.appendChild(U)}),K.appendChild(Z)}if(m.length>0){const Z=document.createElement("div");Z.style.cssText="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--sp-3);",Z.innerHTML=`
          <div style="display:flex; align-items:center; gap:var(--sp-2);">
            <span style="font-size:1rem;">📋</span>
            <strong>Preview Data Import (${m.length} baris)</strong>
          </div>
        `;const ae=document.createElement("div");ae.style.cssText="display:flex; gap:var(--sp-2);";const U=document.createElement("button");U.className="btn btn-secondary btn-sm",U.innerHTML="✕ Batal Import",U.addEventListener("click",()=>{m=[],l=[],a()}),ae.appendChild(U);const V=document.createElement("button");V.className="btn btn-primary btn-sm",V.id="btn-save-import",V.innerHTML=`💾 Simpan ${m.length} Data ke Database`,V.addEventListener("click",s),ae.appendChild(V),Z.appendChild(ae),K.appendChild(Z);const _=document.createElement("div");_.className="table-container",_.style.maxHeight="400px",_.style.overflowY="auto";let N=`
          <table class="data-table" style="font-size:0.85rem;">
            <thead>
              <tr>
                <th style="width:40px; text-align:center;">#</th>
                <th>Nama Material</th>
                <th>Kode Oracle</th>
                <th style="text-align:right;">Berat Roll Utuh / Sachet</th>
                <th style="text-align:right;">Berat Core / Box</th>
                <th style="text-align:right;">Jumlah Sachet / Roll</th>
                <th style="width:60px; text-align:center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
        `;m.forEach((c,w)=>{N+=`
            <tr>
              <td style="text-align:center; color:var(--text-muted);">${w+1}</td>
              <td style="font-weight:600;">${c.materialName||"-"}</td>
              <td><span class="badge badge-accent">${c.oracleCode||"-"}</span></td>
              <td style="text-align:right; font-family:monospace;">${c.beratRollUtuh!=null?parseFloat(c.beratRollUtuh).toLocaleString("id-ID"):"-"}</td>
              <td style="text-align:right; font-family:monospace;">${c.beratCore!=null?parseFloat(c.beratCore).toLocaleString("id-ID"):"-"}</td>
              <td style="text-align:right; font-family:monospace;">${c.jumlahSachet!=null?c.jumlahSachet.toLocaleString("id-ID"):"-"}</td>
              <td style="text-align:center;">
                <button class="btn-icon sm btn-ghost btn-remove-import" data-idx="${w}" title="Hapus baris">✕</button>
              </td>
            </tr>
          `}),N+="</tbody></table>",_.innerHTML=N,K.appendChild(_)}f.appendChild(K)}const n=document.createElement("div");n.className="divider",n.style.margin="var(--sp-2) 0",f.appendChild(n);const k=document.createElement("div");k.className="toolbar";const C=document.createElement("div");C.className="search-input",C.innerHTML='<span class="icon">🔍</span>';const u=document.createElement("input");u.placeholder="Cari material / kode oracle...",u.value=P,u.addEventListener("input",K=>{P=K.target.value,S=1,a()}),C.appendChild(u),k.appendChild(C);const v=document.createElement("button");v.className="btn btn-danger",v.id="btn-bulk-delete",v.innerHTML="🗑 Hapus Terpilih",v.style.display="none",v.addEventListener("click",x),k.appendChild(v),f.appendChild(k);let D=b.filter(K=>{if(!P)return!0;const Z=P.toLowerCase();return(K.materialName||"").toLowerCase().includes(Z)||(K.oracleCode||"").toLowerCase().includes(Z)});const M=D.length,B=D.slice((S-1)*L,S*L),j=document.createElement("div");j.className="section";const O=document.createElement("div");O.className="section-header",O.style.marginBottom="var(--sp-3)",O.innerHTML=`<h3 class="section-title">📖 Data Kamus Opname (${M} material)</h3>`,j.appendChild(O);const q=document.createElement("div");q.className="table-container";const G=document.createElement("table");G.className="data-table";const J=document.createElement("thead");J.innerHTML=`
      <tr>
        <th style="width:40px; text-align:center;">
          <input type="checkbox" id="select-all-kamus" title="Centang Semua" style="cursor:pointer; width:18px; height:18px; accent-color: var(--primary);" />
        </th>
        <th>Nama Material</th>
        <th>Kode Oracle</th>
        <th style="text-align:right;">Berat Roll Utuh / Sachet</th>
        <th style="text-align:right;">Berat Core / Box</th>
        <th style="text-align:right;">Jumlah Sachet / Roll</th>
        <th style="width:100px; text-align:center;">AKSI</th>
      </tr>
    `,G.appendChild(J);const Q=document.createElement("tbody");if(B.length===0){const K=document.createElement("tr"),Z=document.createElement("td");Z.colSpan=7,Z.innerHTML=`
        <div style="display:flex; flex-direction:column; align-items:center; gap:var(--sp-2); color:var(--text-muted); padding:var(--sp-10);">
          <div style="font-size:2rem; filter:drop-shadow(0 0 10px rgba(255,255,255,0.1));">📭</div>
          <div style="font-size:var(--fs-xs); font-weight:700; letter-spacing:0.05em;">BELUM ADA DATA KAMUS OPNAME</div>
        </div>
      `,K.appendChild(Z),Q.appendChild(K)}else B.forEach(K=>{const Z=document.createElement("tr"),ae=$.has(K.id);Z.innerHTML=`
          <td style="text-align:center;">
            <input type="checkbox" class="kamus-checkbox" data-id="${K.id}" ${ae?"checked":""} style="cursor:pointer; width:18px; height:18px; accent-color: var(--primary);" />
          </td>
          <td style="font-weight:600;">${K.materialName||"-"}</td>
          <td><span class="badge badge-accent">${K.oracleCode||"-"}</span></td>
          <td style="text-align:right; font-family:monospace;">${K.beratRollUtuh!=null?parseFloat(K.beratRollUtuh).toLocaleString("id-ID"):"-"}</td>
          <td style="text-align:right; font-family:monospace;">${K.beratCore!=null?parseFloat(K.beratCore).toLocaleString("id-ID"):"-"}</td>
          <td style="text-align:right; font-family:monospace;">${K.jumlahSachet!=null?K.jumlahSachet.toLocaleString("id-ID"):"-"}</td>
          <td style="text-align:center;">
            <div class="table-actions" style="justify-content:center;">
              <button class="btn-icon sm btn-ghost btn-edit-kamus" data-id="${K.id}" title="Edit">✏️</button>
              <button class="btn-icon sm btn-ghost btn-delete-kamus" data-id="${K.id}" title="Hapus">🗑</button>
            </div>
          </td>
        `,Q.appendChild(Z)});G.appendChild(Q),q.appendChild(G),j.appendChild(q),f.appendChild(j),f.appendChild(PaginationComponent.create({totalItems:M,perPage:L,currentPage:S,onChange:K=>{S=K,a()}})),A.appendChild(f),setTimeout(()=>{const K=document.getElementById("btn-download-template");K&&K.addEventListener("click",y);const Z=document.getElementById("select-all-kamus");Z&&Z.addEventListener("change",ae=>{const U=ae.target.checked;document.querySelectorAll(".kamus-checkbox").forEach(V=>{V.checked=U;const _=V.getAttribute("data-id");U?$.add(_):$.delete(_)}),p()}),document.querySelectorAll(".kamus-checkbox").forEach(ae=>{ae.addEventListener("change",U=>{const V=U.target.getAttribute("data-id");U.target.checked?$.add(V):$.delete(V);const N=[...document.querySelectorAll(".kamus-checkbox")].every(w=>w.checked),c=document.getElementById("select-all-kamus");c&&(c.checked=N),p()})}),document.querySelectorAll(".btn-edit-kamus").forEach(ae=>{ae.addEventListener("click",U=>{const V=U.currentTarget.getAttribute("data-id"),_=b.find(N=>N.id===V);_&&H(_)})}),document.querySelectorAll(".btn-delete-kamus").forEach(ae=>{ae.addEventListener("click",U=>{const V=U.currentTarget.getAttribute("data-id"),_=b.find(N=>N.id===V);_&&confirm(`Hapus material "${_.materialName}" dari Kamus Opname?`)&&T(V)})}),document.querySelectorAll(".btn-remove-import").forEach(ae=>{ae.addEventListener("click",U=>{const V=parseInt(U.currentTarget.getAttribute("data-idx"),10);m.splice(V,1),a()})}),p()},0)}function r(A,f){if(l=[],m=[],!A||A.length===0){l.push({type:"error",message:"File tidak berisi data. Pastikan ada header dan baris data di sheet pertama."}),a();return}const E=Object.keys(A[0]||{}),g={materialName:t(E,["nama material","material","nama","material name","name"]),oracleCode:t(E,["kode oracle","oracle code","oracle","kode","code"]),beratRollUtuh:t(E,["berat roll utuh","berat roll","berat sachet","berat roll utuh / sachet","berat roll/sachet","roll utuh","sachet"]),beratCore:t(E,["berat core","berat box","berat core/box","berat core / box","core","box"]),jumlahSachet:t(E,["jumlah sachet","jumlah roll","jumlah sachet / roll","jumlah sachet/roll","sachet/roll","sachet / roll","qty sachet"])};if(!g.materialName){l.push({type:"error",message:`Kolom "NAMA MATERIAL" tidak ditemukan. Header yang tersedia: ${E.join(", ")}`}),a();return}A.forEach((h,i)=>{const n=String(h[g.materialName]||"").trim(),k=g.oracleCode?String(h[g.oracleCode]||"").trim():"",C=g.beratRollUtuh?h[g.beratRollUtuh]:null,u=g.beratCore?h[g.beratCore]:null,v=g.jumlahSachet?h[g.jumlahSachet]:null;if(!n){l.push({type:"warning",message:`Baris ${i+1}: Nama Material kosong, baris dilewati.`});return}const D=C!=null&&C!==""?parseFloat(C):null,M=u!=null&&u!==""?parseFloat(u):null,B=v!=null&&v!==""?parseInt(v,10):null;D!==null&&isNaN(D)&&l.push({type:"warning",message:`Baris ${i+1}: Berat Roll Utuh "${C}" bukan angka valid.`}),M!==null&&isNaN(M)&&l.push({type:"warning",message:`Baris ${i+1}: Berat Core "${u}" bukan angka valid.`}),m.push({materialName:n,oracleCode:k||null,beratRollUtuh:D!==null&&!isNaN(D)?D:null,beratCore:M!==null&&!isNaN(M)?M:null,jumlahSachet:B!==null&&!isNaN(B)?B:null})}),m.length===0&&l.push({type:"error",message:"Tidak ada data valid yang ditemukan di file."}),a()}function t(A,f){for(const E of A){const g=E.toLowerCase().trim();for(const h of f)if(g===h||g.includes(h))return E}return null}async function s(){if(m.length===0)return;const A=document.getElementById("btn-save-import");A&&(A.disabled=!0,A.innerHTML="⏳ Menyimpan...");let f=0,E=0;const g=5;for(let h=0;h<m.length;h+=g){const i=m.slice(h,h+g);(await Promise.allSettled(i.map(k=>PMCStore.safeFetch(`${e}/master/kamus-opname`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(k)})))).forEach(k=>{k.status==="fulfilled"&&k.value.ok?f++:E++})}m=[],l=[],E>0?ToastComponent.show(`${f} data berhasil disimpan, ${E} gagal.`,"warning"):ToastComponent.show(`✅ ${f} data berhasil diimport ke Kamus Opname!`,"success"),await o()}function y(){try{const A=[{"NAMA MATERIAL":"Contoh: FILM OPP ABC 250G","KODE ORACLE":"MAT-001","BERAT ROLL UTUH / SACHET":1500,"BERAT CORE/BOX":250,"JUMLAH SACHET / ROLL":12},{"NAMA MATERIAL":"Contoh: KARTON BOX ABC 10x12","KODE ORACLE":"MAT-002","BERAT ROLL UTUH / SACHET":"","BERAT CORE/BOX":350,"JUMLAH SACHET / ROLL":""}],f=XLSX.utils.json_to_sheet(A);f["!cols"]=[{wch:35},{wch:16},{wch:26},{wch:18},{wch:24}];const E=XLSX.utils.book_new();XLSX.utils.book_append_sheet(E,f,"Kamus Opname"),XLSX.writeFile(E,"Template_Kamus_Opname.xlsx"),ToastComponent.show("Template Excel berhasil didownload.","success")}catch(A){ToastComponent.show("Gagal generate template: "+A.message,"danger")}}function p(){const A=document.getElementById("btn-bulk-delete");A&&($.size>0?(A.style.display="inline-flex",A.innerHTML=`🗑 Hapus Terpilih (${$.size})`):A.style.display="none")}async function T(A){try{(await PMCStore.safeFetch(`${e}/master/kamus-opname/${A}`,{method:"DELETE"})).ok?(ToastComponent.show("Material berhasil dihapus dari Kamus Opname.","success"),$.delete(A),await o()):ToastComponent.show("Gagal menghapus material.","danger")}catch(f){ToastComponent.show("Error: "+f.message,"danger")}}async function x(){if($.size!==0&&confirm(`Hapus ${$.size} material yang dipilih dari Kamus Opname?`))try{const A=await PMCStore.safeFetch(`${e}/master/kamus-opname/delete-multiple`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[...$]})});if(A.ok){const f=await A.json();ToastComponent.show(f.message||`${$.size} material berhasil dihapus.`,"success"),$.clear(),await o()}else ToastComponent.show("Gagal menghapus data.","danger")}catch(A){ToastComponent.show("Error: "+A.message,"danger")}}function H(A){const f=!!A,E=document.createElement("div");E.innerHTML=`
      <div class="form-group">
        <label class="form-label">Nama Material</label>
        <input class="form-input" id="kamus-material-name" value="${(A==null?void 0:A.materialName)||""}" placeholder="Contoh: FILM OPP ABC 250G" />
      </div>
      <div class="form-group">
        <label class="form-label">Kode Oracle</label>
        <input class="form-input" id="kamus-oracle-code" value="${(A==null?void 0:A.oracleCode)||""}" placeholder="Contoh: MAT-001" />
      </div>
      <div class="form-group">
        <label class="form-label">Berat Roll Utuh / Sachet (kg)</label>
        <input class="form-input" id="kamus-berat-roll" type="number" step="0.0001" value="${(A==null?void 0:A.beratRollUtuh)!=null?parseFloat(A.beratRollUtuh):""}" placeholder="Contoh: 1.5" />
      </div>
      <div class="form-group">
        <label class="form-label">Berat Core / Box (kg)</label>
        <input class="form-input" id="kamus-berat-core" type="number" step="0.0001" value="${(A==null?void 0:A.beratCore)!=null?parseFloat(A.beratCore):""}" placeholder="Contoh: 0.25" />
      </div>
      <div class="form-group">
        <label class="form-label">Jumlah Sachet / Roll</label>
        <input class="form-input" id="kamus-jumlah-sachet" type="number" step="1" value="${(A==null?void 0:A.jumlahSachet)||""}" placeholder="Contoh: 12" />
      </div>
    `,ModalComponent.open({title:f?"✏️ Edit Kamus Opname":"➕ Tambah Material Kamus Opname",body:E,onSave:async()=>{const g=document.getElementById("kamus-material-name").value.trim(),h=document.getElementById("kamus-oracle-code").value.trim(),i=document.getElementById("kamus-berat-roll").value,n=document.getElementById("kamus-berat-core").value,k=document.getElementById("kamus-jumlah-sachet").value;if(!g){ToastComponent.show("Nama Material wajib diisi.","error");return}const C={materialName:g,oracleCode:h||null,beratRollUtuh:i?parseFloat(i):null,beratCore:n?parseFloat(n):null,jumlahSachet:k?parseInt(k,10):null};try{let u;if(f?(u=await PMCStore.safeFetch(`${e}/master/kamus-opname/${A.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(C)}),ToastComponent.show("Memperbarui data Kamus Opname...","info")):(u=await PMCStore.safeFetch(`${e}/master/kamus-opname`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(C)}),ToastComponent.show("Menyimpan material baru ke Kamus Opname...","info")),u.ok)ToastComponent.show(f?"Data berhasil diperbarui!":"Material berhasil ditambahkan!","success"),ModalComponent.close(),await o();else{const v=await u.json().catch(()=>({}));ToastComponent.show("Gagal: "+(v.message||"Server error"),"danger")}}catch(u){ToastComponent.show("Error: "+u.message,"danger")}}})}return{render:d}})();window.MasterKamusOpnamePage=qe;const _e=(()=>{let e=[],b=[],P=new Date().toISOString().split("T")[0];function S(){if(window.location.hash!=="#/schedule")return;ChartWrapper.destroyAll();const $=document.getElementById("page-content");$.innerHTML="";const m=document.createElement("div");m.className="page-enter",TopbarComponent.render("/schedule");const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:20px;",l.innerHTML=`
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">Step 1</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Upload jadwal produksi dan validasi data</span>
    `,m.appendChild(l);const o=document.createElement("div");o.className="section",o.appendChild(DragDropComponent.create({onFile:(p,T)=>L(p)})),m.appendChild(o);const d=document.createElement("div");d.className="divider-text",d.textContent="Atau Input Manual",m.appendChild(d);const a=document.createElement("div");a.className="import-manual-row",a.innerHTML=`
      <div class="form-group">
        <label class="form-label">Tanggal</label>
        <input class="form-input" type="date" id="manual-date" value="${P}" />
      </div>
      <div class="form-group">
        <label class="form-label">Line</label>
        <select class="form-input" id="manual-line">
          ${Array.from({length:25},(p,T)=>String.fromCharCode(65+T)).map(p=>`<option>${p}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">SKU</label>
        <select class="form-input" id="manual-sku">
          ${PMCStore.skuList.map(p=>`<option value="${p.id}">${p.code} — ${p.name}</option>`).join("")}
        </select>
      </div>
    `,m.appendChild(a);const r=document.createElement("div");if(r.className="import-manual-row",r.innerHTML=`
      <div class="form-group">
        <label class="form-label">Target SH1</label>
        <input class="form-input" type="number" id="manual-sh1" placeholder="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Target SH2</label>
        <input class="form-input" type="number" id="manual-sh2" placeholder="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Target SH3</label>
        <input class="form-input" type="number" id="manual-sh3" placeholder="0" />
      </div>
      <div class="form-group" style="display:flex;align-items:flex-end;">
        <button class="btn btn-secondary" id="manual-add-btn">+ Tambah</button>
      </div>
    `,m.appendChild(r),b.length>0){const p=document.createElement("div");p.className="validation-panel section",p.innerHTML=`<div class="validation-panel-header">⚠️ Validation Alerts (${b.length})</div>`,b.forEach(T=>{const x=document.createElement("div");x.className=`alert alert-${T.type}`,x.innerHTML=`<span class="alert-icon">${T.type==="error"?"❌":"⚠️"}</span><span>${T.message}</span>`,p.appendChild(x)}),m.appendChild(p)}const t=PMCStore.schedules.filter(p=>!0);if(t.length>0||e.length>0){const p=document.createElement("div");p.className="section";const T=document.createElement("div");T.className="section-header",T.innerHTML='<h3 class="section-title">📊 Mapping Table Preview</h3>',p.appendChild(T);const x=document.createElement("div");x.style.display="flex",x.style.gap="12px",x.style.alignItems="center",x.style.marginBottom="var(--sp-4)";const H=document.createElement("label");H.style.display="flex",H.style.alignItems="center",H.style.gap="6px",H.style.cursor="pointer",H.style.fontWeight="600",H.innerHTML='<input type="checkbox" id="select-all-cb" /> Pilih Semua';const A=document.createElement("button");A.className="btn btn-danger btn-sm",A.id="bulk-delete-btn",A.innerHTML="🗑️ Hapus Terpilih",x.appendChild(H),x.appendChild(A),p.appendChild(x);const f=e.length>0?e:t;p.appendChild(DataTableComponent.create({columns:[{key:"_idx",label:"",width:"40px",align:"center",render:(E,g,h)=>`<input type="checkbox" class="row-cb" data-idx="${h}" />`},{key:"date",label:"Tanggal",render:E=>PMCStore.formatDate(E)},{key:"line",label:"Line"},{key:"skuId",label:"SKU",render:E=>{const g=PMCStore.getSKU(E);return g?`${g.code}`:`<span style="color:var(--danger)">${E} ⚠️</span>`}},{key:"sh1",label:"SH1",align:"right",editable:!0,type:"number"},{key:"sh2",label:"SH2",align:"right",editable:!0,type:"number"},{key:"sh3",label:"SH3",align:"right",editable:!0,type:"number"},{key:"total",label:"Total",align:"right",render:(E,g)=>`<strong>${PMCStore.formatNumber((g.sh1||0)+(g.sh2||0)+(g.sh3||0))}</strong>`}],data:f,editable:!0,onCellEdit:(E,g,h)=>{e.length>0?e[E][g]=h:PMCStore.updateScheduleCell(E,g,h),S()},footer:f.length>0?[{value:"TOTAL",colspan:4},{value:PMCStore.formatNumber(f.reduce((E,g)=>E+(g.sh1||0),0)),align:"right"},{value:PMCStore.formatNumber(f.reduce((E,g)=>E+(g.sh2||0),0)),align:"right"},{value:PMCStore.formatNumber(f.reduce((E,g)=>E+(g.sh3||0),0)),align:"right"},{value:PMCStore.formatNumber(f.reduce((E,g)=>E+(g.sh1||0)+(g.sh2||0)+(g.sh3||0),0)),align:"right"}]:void 0,actions:[{label:"Hapus",icon:"🗑️",onClick:(E,g)=>{confirm("Yakin ingin menghapus jadwal ini?")&&(e.length>0?e.splice(g,1):E.id?PMCStore.deleteSchedule(E.id):PMCStore.deleteSchedule(g),ToastComponent.show("Jadwal berhasil dihapus","success"),S())}}]})),m.appendChild(p),setTimeout(()=>{const E=document.getElementById("select-all-cb");E&&E.addEventListener("change",h=>{document.querySelectorAll(".row-cb").forEach(i=>i.checked=h.target.checked)});const g=document.getElementById("bulk-delete-btn");g&&g.addEventListener("click",()=>{const h=Array.from(document.querySelectorAll(".row-cb:checked"));if(h.length===0){ToastComponent.show("Pilih minimal 1 data","warning");return}confirm(`Yakin ingin menghapus ${h.length} data terpilih?`)&&(e.length>0?h.map(n=>parseInt(n.getAttribute("data-idx"))).sort((n,k)=>k-n).forEach(n=>e.splice(n,1)):h.forEach(i=>{const n=parseInt(i.getAttribute("data-idx")),k=t[n];k&&k.id?PMCStore.deleteSchedule(k.id):PMCStore.deleteSchedule(n)}),ToastComponent.show(`${h.length} data dihapus`,"success"),S())})},50)}const s=document.createElement("div");s.className="action-bar",s.innerHTML="<div></div>";const y=document.createElement("button");y.className="btn btn-primary btn-lg",y.innerHTML="Simpan & Lanjut ke Step 2 →",y.addEventListener("click",()=>{e.length>0&&(PMCStore.addSchedules(e),e=[],ToastComponent.show("Data berhasil disimpan!","success")),window.location.hash="/summary"}),s.appendChild(y),m.appendChild(s),$.appendChild(m),setTimeout(()=>{const p=document.getElementById("manual-add-btn");p&&p.addEventListener("click",()=>{const T=document.getElementById("manual-date").value,x=document.getElementById("manual-line").value,H=document.getElementById("manual-sku").value,A=parseInt(document.getElementById("manual-sh1").value)||0,f=parseInt(document.getElementById("manual-sh2").value)||0,E=parseInt(document.getElementById("manual-sh3").value)||0;if(!T||!H){ToastComponent.show("Tanggal dan SKU wajib diisi","error");return}PMCStore.addSchedules([{date:T,line:x,skuId:H,sh1:A,sh2:f,sh3:E,status:"pending"}]),ToastComponent.show("Data berhasil ditambahkan","success"),S()})},50)}function L($){b=[],e=[],$.forEach((m,l)=>{const o=m.Tanggal||m.Date||m.date||P,d=m.Line||m.line||"A",a=m.SKU||m.sku||m["Oracle Code"]||"",r=parseInt(m.SH1||m.sh1||0),t=parseInt(m.SH2||m.sh2||0),s=parseInt(m.SH3||m.sh3||0);if(!a){b.push({type:"warning",message:`Row ${l+1}: Kolom SKU kosong`});return}PMCStore.getSKU(a)||b.push({type:"error",message:`Row ${l+1}: SKU "${a}" tidak ditemukan di Master Data`}),r===0&&t===0&&s===0&&b.push({type:"warning",message:`Row ${l+1}: Semua target shift kosong`}),e.push({date:String(o),line:d,skuId:a,sh1:r,sh2:t,sh3:s,status:"pending"})}),S()}return{render:S}})();window.ScheduleImportPage=_e;const Ue=(()=>{let e="";async function b(){if(window.location.hash!=="#/summary")return;ChartWrapper.destroyAll();const S=document.getElementById("page-content");S.innerHTML="";const L=PMCStore.getUniqueDates();!e&&L.length>0&&(e=L[0]);const $=document.createElement("button");$.className="btn btn-secondary",$.innerHTML="⬇ Export Excel",$.addEventListener("click",()=>P()),TopbarComponent.render("/summary",[$]);const m=document.createElement("div");m.className="page-enter";const l=document.createElement("div");l.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:20px;",l.innerHTML=`
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">Step 2</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Ringkasan produksi per shift (auto-aggregated)</span>
    `,m.appendChild(l);const o=document.createElement("div");o.className="toolbar";const d=document.createElement("select");d.className="filter-select",L.forEach(i=>{d.innerHTML+=`<option value="${i}" ${i===e?"selected":""}>${PMCStore.formatDate(i)}</option>`}),d.addEventListener("change",i=>{e=i.target.value,b()});const a=document.createElement("span");if(a.style.cssText="color: var(--text-secondary); font-size: var(--fs-sm);",a.textContent="Tanggal:",o.appendChild(a),o.appendChild(d),m.appendChild(o),!e){m.innerHTML+='<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada data jadwal. Import di Step 1 terlebih dahulu.</div></div>',S.appendChild(m);return}const r=PMCStore.getShiftSummary(e),t=r.reduce((i,n)=>i+n.sh1,0),s=r.reduce((i,n)=>i+n.sh2,0),y=r.reduce((i,n)=>i+n.sh3,0),p=t+s+y,T=document.createElement("div");T.className="shift-cards",T.innerHTML=`
      <div class="shift-card sh1">
        <div class="shift-card-label">🟢 Shift 1</div>
        <div class="shift-card-value">${PMCStore.formatNumber(t)}</div>
        <div class="shift-card-unit">Box</div>
      </div>
      <div class="shift-card sh2">
        <div class="shift-card-label">🔵 Shift 2</div>
        <div class="shift-card-value">${PMCStore.formatNumber(s)}</div>
        <div class="shift-card-unit">Box</div>
      </div>
      <div class="shift-card sh3">
        <div class="shift-card-label">🟣 Shift 3</div>
        <div class="shift-card-value">${PMCStore.formatNumber(y)}</div>
        <div class="shift-card-unit">Box</div>
      </div>
    `,m.appendChild(T);const x=document.createElement("div");x.className="total-banner",x.innerHTML=`<span>Total Harian:</span> ${PMCStore.formatNumber(p)} Box`,m.appendChild(x);const H=document.createElement("div");H.className="section",H.appendChild(DataTableComponent.create({columns:[{key:"skuName",label:"SKU"},{key:"sh1",label:"SH1",align:"right",render:i=>PMCStore.formatNumber(i)},{key:"sh2",label:"SH2",align:"right",render:i=>PMCStore.formatNumber(i)},{key:"sh3",label:"SH3",align:"right",render:i=>PMCStore.formatNumber(i)},{key:"total",label:"Total",align:"right",render:i=>`<strong>${PMCStore.formatNumber(i)}</strong>`}],data:r,footer:[{value:"GRAND TOTAL"},{value:PMCStore.formatNumber(t),align:"right"},{value:PMCStore.formatNumber(s),align:"right"},{value:PMCStore.formatNumber(y),align:"right"},{value:PMCStore.formatNumber(p),align:"right"}]})),m.appendChild(H);const f=(await PMCStore.getManualSpbs()).filter(i=>(i.targetDate?i.targetDate.split("T")[0]:i.createdAt?i.createdAt.split("T")[0]:null)===e);if(f.length>0){const i=document.createElement("div");i.className="section",i.style.marginTop="var(--sp-8)";const n=document.createElement("div");n.className="section-header",n.innerHTML='<h3 class="section-title">📋 Ringkasan Permintaan Manual (Tambahan)</h3>',i.appendChild(n);const k=[];f.forEach(C=>{C.items.forEach(u=>{k.push({spbNumber:C.spbNumber,requester:C.requestedBy,material:u.materialName,shift:`SH${C.targetShift||1}`,qty:u.qtyPallets,status:u.status})})}),i.appendChild(DataTableComponent.create({columns:[{key:"spbNumber",label:"No SPB"},{key:"requester",label:"Peminta"},{key:"material",label:"Material"},{key:"shift",label:"Shift",align:"center"},{key:"qty",label:"Qty (Plt)",align:"right",render:C=>`<strong>${C}</strong>`},{key:"status",label:"Status",render:C=>C==="completed"?'<span class="badge badge-success">Selesai</span>':'<span class="badge badge-warning">Proses</span>'}],data:k})),m.appendChild(i)}const E=document.createElement("div");E.className="action-bar";const g=document.createElement("button");g.className="btn btn-secondary",g.innerHTML="← Kembali",g.addEventListener("click",()=>{window.location.hash="/schedule"});const h=document.createElement("button");h.className="btn btn-primary btn-lg",h.innerHTML="Lanjut ke Step 3 →",h.addEventListener("click",()=>{window.location.hash="/materials"}),E.appendChild(g),E.appendChild(h),m.appendChild(E),S.appendChild(m)}function P(){if(!e)return;const S=PMCStore.getShiftSummary(e),L=[["SKU","SH1","SH2","SH3","Total"],...S.map(l=>[l.skuName,l.sh1,l.sh2,l.sh3,l.total])],$=XLSX.utils.aoa_to_sheet(L),m=XLSX.utils.book_new();XLSX.utils.book_append_sheet(m,$,"Shift Summary"),XLSX.writeFile(m,`shift_summary_${e}.xlsx`),ToastComponent.show("File berhasil di-export!","success")}return{render:b}})();window.ShiftSummaryPage=Ue;const Ke=(()=>{let e="",b="grouped";const P=new Set;async function S(){if(window.location.hash!=="#/materials")return;ChartWrapper.destroyAll();const $=document.getElementById("page-content"),m=PMCStore.getUniqueDates();if(!e&&m.length>0){const g=new Date().toISOString().split("T")[0];e=m.includes(g)?g:m[0]}e?$.innerHTML=`
        <div style="display:flex; align-items:center; justify-content:center; height:400px; color:var(--text-muted); flex-direction:column; gap:var(--sp-4);">
          <div class="spinner"></div>
          <p>⚖️ Menghitung kebutuhan material dari database...</p>
        </div>
      `:$.innerHTML="";const l=document.createElement("button");l.className="btn btn-secondary",l.innerHTML="⬇ Export Excel",l.addEventListener("click",()=>L("all")),TopbarComponent.render("/materials",[l]);const o=document.createElement("div");o.className="page-enter";const d=document.createElement("div");d.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:20px;",d.innerHTML=`
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">Step 3</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Kebutuhan material dihitung otomatis dari BOM × Target Box</span>
    `,o.appendChild(d);const a=document.createElement("div");a.className="material-view-header";const r=document.createElement("div");r.className="toolbar",r.style.marginBottom="0";const t=document.createElement("span");t.style.cssText="color:var(--text-secondary);font-size:var(--fs-sm);",t.textContent="Tanggal:",r.appendChild(t);const s=document.createElement("select");s.className="filter-select",m.forEach(g=>{s.innerHTML+=`<option value="${g}" ${g===e?"selected":""}>${PMCStore.formatDate(g)}</option>`}),s.addEventListener("change",g=>{e=g.target.value,S()}),r.appendChild(s),a.appendChild(r);const y=document.createElement("div");y.className="view-toggle";const p=document.createElement("button");p.className=`view-toggle-btn ${b==="grouped"?"active":""}`,p.textContent="📦 Grouped",p.addEventListener("click",()=>{b="grouped",S()});const T=document.createElement("button");if(T.className=`view-toggle-btn ${b==="persku"?"active":""}`,T.textContent="📋 Per SKU",T.addEventListener("click",()=>{b="persku",S()}),y.appendChild(p),y.appendChild(T),a.appendChild(y),o.appendChild(a),!e){o.innerHTML+='<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada data jadwal.</div></div>',$.appendChild(o);return}const{perSku:x,grouped:H}=e?await PMCStore.getMaterialRequirements(e):{perSku:[],grouped:[]};if(e&&($.innerHTML=""),b==="grouped"){const g=document.createElement("div");g.className="picklist-section section";const h=document.createElement("div");h.className="section-header",h.innerHTML='<h3 class="section-title">📦 List Kebutuhan Bahan/hari</h3>',g.appendChild(h);const i=document.createElement("div");i.className="table-container";const n=document.createElement("table");n.className="data-table",n.innerHTML=`
        <thead>
          <tr>
            <th>Material</th>
            <th style="text-align:center">UOM</th>
            <th style="text-align:right">SH1</th>
            <th style="text-align:right">SH2</th>
            <th style="text-align:right">SH3</th>
            <th style="text-align:right;color:var(--accent-light)">Buffer 2J</th>
            <th style="text-align:right;color:var(--warning-color)">Sisa Stok</th>
            <th style="text-align:right">Total <i>(Netto)</i></th>
            <th style="text-align:center;width:100px" class="pallet-col-header">Qty/Pallet</th>
            <th style="text-align:center;width:90px" class="pallet-col-header">Jumlah Pallet</th>
            <th style="text-align:right;width:100px" class="pallet-col-header">Total SPB</th>
          </tr>
        </thead>
      `;const k=document.createElement("tbody");let C=0;H.forEach((v,D)=>{const M=document.createElement("tr"),B=v.palletQty>0?Math.ceil(v.total/v.palletQty):0;C+=B,M.innerHTML=`
          <td>${v.name}</td>
          <td style="text-align:center"><span class="badge badge-accent">${v.uom}</span></td>
          <td style="text-align:right">${PMCStore.formatDecimal(v.sh1,4)}</td>
          <td style="text-align:right">${PMCStore.formatDecimal(v.sh2,4)}</td>
          <td style="text-align:right">${PMCStore.formatDecimal(v.sh3,4)}</td>
          <td style="text-align:right;color:var(--accent-light)">+${PMCStore.formatDecimal(v.buffer,4)}</td>
          <td style="text-align:right;color:var(--warning-color)">${PMCStore.formatDecimal(v.sisaStok,4)}</td>
          <td style="text-align:right"><strong>${PMCStore.formatDecimal(v.total,4)}</strong></td>
          <td style="text-align:center" class="pallet-input-cell"></td>
          <td style="text-align:center" class="pallet-result-cell"></td>
          <td style="text-align:right" class="spb-result-cell"></td>
        `;const j=M.querySelector(".pallet-input-cell");j.innerHTML=`<strong>${v.palletQty?PMCStore.formatNumber(v.palletQty):"-"}</strong>`;const O=M.querySelector(".pallet-result-cell"),q=M.querySelector(".spb-result-cell");if(v.palletQty>0){const G=document.createElement("span");G.className="pallet-count-badge",G.textContent=`${B} plt`,O.appendChild(G),q.innerHTML=`<strong>${PMCStore.formatDecimal(v.totalSPB,4)}</strong>`}else O.innerHTML='<span style="color:var(--text-muted);font-size:var(--fs-xs)">—</span>',q.innerHTML=`<strong>${PMCStore.formatDecimal(v.totalSPB,4)}</strong>`;k.appendChild(M)}),n.appendChild(k);const u=document.createElement("tfoot");u.innerHTML=`
        <tr>
          <td colspan="8" style="font-weight:600;color:var(--accent-light)">TOTAL</td>
          <td style="text-align:center"></td>
          <td style="text-align:center">
            <span class="pallet-count-total">${C} pallet</span>
          </td>
          <td style="text-align:right"></td>
        </tr>
      `,n.appendChild(u),i.appendChild(n),g.appendChild(i),o.appendChild(g)}if(b==="persku"||b==="grouped"){const g=document.createElement("div");g.className="section";const h=document.createElement("div");h.className="section-header",h.innerHTML='<h3 class="section-title">📋 Detail Per SKU</h3>',g.appendChild(h),x.forEach(i=>{const n=P.has(i.skuId),k=document.createElement("div");k.className=`accordion-item ${n?"open":""}`;const C=document.createElement("div");C.className="accordion-header",C.innerHTML=`
          <span class="accordion-arrow">▶</span>
          <span class="accordion-title">${i.skuName}</span>
          <span class="accordion-badge" style="color:var(--text-muted);font-size:var(--fs-sm);">
            SH1: ${PMCStore.formatNumber(i.sh1)} / SH2: ${PMCStore.formatNumber(i.sh2)} / SH3: ${PMCStore.formatNumber(i.sh3)} Box
          </span>
        `,C.addEventListener("click",()=>{P.has(i.skuId)?P.delete(i.skuId):P.add(i.skuId),S()}),k.appendChild(C);const u=document.createElement("div");u.className="accordion-body",n&&u.appendChild(DataTableComponent.create({columns:[{key:"name",label:"Komponen"},{key:"coefficient",label:"Rumus",align:"center",render:v=>`×${PMCStore.formatDecimal(v,6)}`},{key:"uom",label:"UOM",align:"center",render:v=>`<span class="badge badge-accent">${v}</span>`},{key:"sh1",label:"SH1",align:"right",render:v=>PMCStore.formatDecimal(v,4)},{key:"sh2",label:"SH2",align:"right",render:v=>PMCStore.formatDecimal(v,4)},{key:"sh3",label:"SH3",align:"right",render:v=>PMCStore.formatDecimal(v,4)},{key:"buffer",label:"Buffer 2J",align:"right",render:v=>`<span style="color:var(--accent-light)">+${PMCStore.formatDecimal(v,4)}</span>`},{key:"total",label:"Total",align:"right",render:(v,D)=>`<strong>${PMCStore.formatDecimal(v,4)} ${D.uom}</strong>`}],data:i.materials})),k.appendChild(u),g.appendChild(k)}),o.appendChild(g)}const A=document.createElement("div");A.className="action-bar";const f=document.createElement("button");f.className="btn btn-secondary",f.innerHTML="← Kembali",f.addEventListener("click",()=>{window.location.hash="/summary"});const E=document.createElement("button");E.className="btn btn-success btn-lg",E.innerHTML="✅ Tandai Selesai",E.addEventListener("click",()=>{PMCStore.markDateConverted(e),ToastComponent.show(`Tanggal ${PMCStore.formatDate(e)} ditandai selesai!`,"success"),S()}),A.appendChild(f),A.appendChild(E),o.appendChild(A),$.appendChild(o)}async function L($="all"){if(!e)return;const{perSku:m,grouped:l}=await PMCStore.getMaterialRequirements(e),o=XLSX.utils.book_new();if($==="all"){const d=[["Material","UOM","SH1","SH2","SH3","Buffer 2J","Sisa Stok","Total Netto","Qty/Pallet","Jumlah Pallet","Total SPB"],...l.map(a=>[a.name,a.uom,a.sh1,a.sh2,a.sh3,a.buffer,a.sisaStok,a.total,a.palletQty||"-",a.palletCount||"-",a.totalSPB])];XLSX.utils.book_append_sheet(o,XLSX.utils.aoa_to_sheet(d),"List Kebutuhan Bahan"),m.forEach(a=>{const r=[["Komponen","Koefisien","UOM","SH1","SH2","SH3","Buffer 2J","Total"],...a.materials.map(s=>[s.name,s.coefficient,s.uom,s.sh1,s.sh2,s.sh3,s.buffer,s.total])],t=a.skuName.substring(0,31).replace(/[\\/:*?[\]]/g,"_");XLSX.utils.book_append_sheet(o,XLSX.utils.aoa_to_sheet(r),t)})}else if($==="spb"){const d=[["Material","Total SPB"]];l.forEach(a=>{a.totalSPB>0&&d.push([a.name,a.totalSPB])}),XLSX.utils.book_append_sheet(o,XLSX.utils.aoa_to_sheet(d),"Total SPB")}XLSX.writeFile(o,`List_Kebutuhan_Bahan_${e}.xlsx`),ToastComponent.show("File Excel berhasil di-export!","success")}return{render:S}})();window.MaterialCalcPage=Ke;const We=(()=>{let e="";async function b(){if(!window.location.hash.startsWith("#/distribution"))return;ChartWrapper.destroyAll();const $=document.getElementById("page-content");$.innerHTML="";const m=window.location.hash.includes("view=tv"),l=PMCStore.getUniqueDates();if(!e&&l.length>0){const O=new Date().toISOString().split("T")[0];e=l.includes(O)?O:l[0]}const o=document.createElement("div");o.style.display="flex",o.style.gap="8px",o.style.alignItems="center";const d=document.createElement("select");d.className="form-input",d.style.padding="4px 8px",d.style.height="36px",d.innerHTML='<option value="spb">1. Total SPB</option><option value="all">2. Semua List Kebutuhan</option>';const a=document.createElement("button");a.className="btn btn-secondary",a.innerHTML="⬇ Export Excel",a.style.height="36px",a.addEventListener("click",()=>L(d.value)),o.appendChild(d),o.appendChild(a),TopbarComponent.render("/distribution",[o]);const r=document.createElement("div");r.className="page-enter";const t=document.createElement("div");t.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:20px;",t.innerHTML=`
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">SPB Harian</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Pembagian pengiriman material per shift berdasarkan Total SPB dan Sisa Stok</span>
    `,m||r.appendChild(t);const s=document.createElement("div");s.className="material-view-header";const y=document.createElement("div");y.className="toolbar",y.style.marginBottom="0";const p=document.createElement("span");p.style.cssText="color:var(--text-secondary);font-size:var(--fs-sm);",p.textContent="Tanggal:",y.appendChild(p);const T=document.createElement("select");if(T.className="filter-select",l.forEach(O=>{T.innerHTML+=`<option value="${O}" ${O===e?"selected":""}>${PMCStore.formatDate(O)}</option>`}),T.addEventListener("change",O=>{e=O.target.value,b()}),y.appendChild(T),s.appendChild(y),m||r.appendChild(s),!e){r.innerHTML+='<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada data jadwal.</div></div>',$.appendChild(r);return}const x=await PMCStore.getMaterialRequirements(e),H=await PMCStore.getHourlyDistribution(e),A=(x==null?void 0:x.grouped)||[],f=P(A,H);if(m){const O=document.createElement("div");O.className="glass-card section",O.style.padding="var(--sp-5)",O.style.marginBottom="var(--sp-6)";const q=document.createElement("h3");q.style.cssText="margin-bottom:var(--sp-6); font-size:var(--fs-md); font-weight:700; color:var(--text-primary); text-align:center;",q.innerHTML="Persentase Pengiriman Harian per Shift",O.appendChild(q);const G=document.createElement("div");G.style.cssText="display:flex; justify-content:space-around; align-items:center; flex-wrap:wrap; gap:var(--sp-5);";const J=[{key:"SH1",label:"Shift 1",color:"#6c5ce7",glow:"rgba(108, 92, 231, 0.7)"},{key:"SH2",label:"Shift 2",color:"#00e0a3",glow:"rgba(0, 224, 163, 0.7)"},{key:"SH3",label:"Shift 3",color:"#00d2ff",glow:"rgba(0, 210, 255, 0.7)"}];for(const Q of J){const K=await PMCStore.calculateShiftProgress(Q.key,e),Z=`conic-gradient(${Q.color} ${K}%, transparent 0)`;G.innerHTML+=`
          <div class="radial-ring-container">
            <div class="radial-ring" style="background:${Z}; --ring-glow:${Q.glow};">
              <span class="radial-ring-value">${K}%</span>
            </div>
            <span class="radial-ring-label" style="color:${Q.color}; text-shadow:0 0 5px ${Q.glow};">${Q.label}</span>
          </div>
        `}O.appendChild(G),r.appendChild(O)}const E=document.createElement("div");E.className="section";const g=document.createElement("div");g.className="section-header",g.innerHTML='<h3 class="section-title">🚚 SPB HARIAN (Distribusi per Shift)</h3>',E.appendChild(g);const h=document.createElement("div");h.className="table-container";const i=document.createElement("table");i.className="data-table",i.innerHTML=`
      <thead>
        <tr>
          <th>Material</th>
          <th style="text-align:center">UOM</th>
          <th style="text-align:right">Total SPB</th>
          <th style="text-align:right">Sisa Stok</th>
          <th style="text-align:right;color:var(--primary-color)">Kirim SH1</th>
          <th style="text-align:right;color:var(--primary-color)">Kirim SH2</th>
          <th style="text-align:right;color:var(--primary-color)">Kirim SH3</th>
          <th style="text-align:right">Total Kirim</th>
          <th style="text-align:center">% SH1</th>
          <th style="text-align:center">% SH2</th>
          <th style="text-align:center">% SH3</th>
        </tr>
      </thead>
    `;const n=document.createElement("tbody");f.forEach(O=>{if(O.totalSPB<=0)return;const q=O.totalSPB>0?(O.kirimSH1/O.totalSPB*100).toFixed(1):"0.0",G=O.totalSPB>0?(O.kirimSH2/O.totalSPB*100).toFixed(1):"0.0",J=O.totalSPB>0?(O.kirimSH3/O.totalSPB*100).toFixed(1):"0.0",Q=document.createElement("tr");Q.innerHTML=`
        <td>${O.name}</td>
        <td style="text-align:center"><span class="badge badge-accent">${O.uom}</span></td>
        <td style="text-align:right;font-weight:600">${PMCStore.formatDecimal(Math.ceil(O.totalSPB),4)}</td>
        <td style="text-align:right;color:var(--warning-color)">${PMCStore.formatDecimal(Math.ceil(O.sisaStok),4)}</td>
        <td style="text-align:right;color:var(--primary-color);font-weight:600">${PMCStore.formatDecimal(Math.ceil(O.kirimSH1),4)}</td>
        <td style="text-align:right;color:var(--primary-color);font-weight:600">${PMCStore.formatDecimal(Math.ceil(O.kirimSH2),4)}</td>
        <td style="text-align:right;color:var(--primary-color);font-weight:600">${PMCStore.formatDecimal(Math.ceil(O.kirimSH3),4)}</td>
        <td style="text-align:right;font-weight:bold">${PMCStore.formatDecimal(Math.ceil(O.kirimSH1+O.kirimSH2+O.kirimSH3),4)}</td>
        <td style="text-align:center">${S(q)}</td>
        <td style="text-align:center">${S(G)}</td>
        <td style="text-align:center">${S(J)}</td>
      `,n.appendChild(Q)}),i.appendChild(n),h.appendChild(i),E.appendChild(h),r.appendChild(E);const k=document.createElement("div");k.className="section",k.style.marginTop="var(--sp-6)";const C=document.createElement("div");C.className="section-header",C.innerHTML='<h3 class="section-title">📊 Ringkasan Distribusi per Shift</h3>',k.appendChild(C);const u=document.createElement("div");u.style.display="grid",u.style.gridTemplateColumns="repeat(3, 1fr)",u.style.gap="var(--sp-4)";const v=["Shift 1","Shift 2","Shift 3"],D=["kirimSH1","kirimSH2","kirimSH3"],M=["var(--primary-color)","var(--accent-color)","var(--success-color)"];v.forEach((O,q)=>{const G=document.createElement("div");G.className="card",G.style.textAlign="center";let J=0,Q=0;f.forEach(K=>{K[D[q]]>0&&(J+=K[D[q]],Q++)}),G.innerHTML=`
        <h4 style="color:${M[q]};margin-bottom:var(--sp-2)">${O}</h4>
        <div style="font-size:1.8rem;font-weight:bold;color:var(--text-main)">${Q}</div>
        <div style="color:var(--text-secondary);font-size:var(--fs-sm);margin-bottom:var(--sp-2)">Jenis Material Dikirim</div>
        <div style="font-size:var(--fs-sm);color:var(--text-muted)">Total item: ${PMCStore.formatDecimal(Math.ceil(J),4)}</div>
      `,u.appendChild(G)}),k.appendChild(u),r.appendChild(k);const j=(await PMCStore.getManualSpbs()).filter(O=>(O.targetDate?O.targetDate.split("T")[0]:O.createdAt.split("T")[0])===e);if(j.length>0){const O=document.createElement("div");O.className="section",O.style.marginTop="var(--sp-6)",O.style.border="2px dashed var(--accent-color)",O.style.background="rgba(108, 92, 231, 0.05)";const q=document.createElement("div");q.className="section-header",q.innerHTML='<h3 class="section-title">📋 SPB Manual (Permintaan Tambahan di Luar Jadwal Otomatis)</h3>',O.appendChild(q);const G=document.createElement("div");G.className="table-container";const J=document.createElement("table");J.className="data-table",J.innerHTML=`
        <thead>
          <tr>
            <th>No SPB</th>
            <th>Peminta</th>
            <th>Material</th>
            <th style="text-align:right">Total Diminta</th>
            <th style="text-align:right">Sudah Disiapkan</th>
            <th>Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
      `;const Q=document.createElement("tbody");j.forEach(K=>{K.items.forEach((Z,ae)=>{const U=document.createElement("tr"),V=Z.status==="completed"?'<span class="badge badge-success">Selesai</span>':'<span class="badge badge-warning">Proses</span>';U.innerHTML=`
            ${ae===0?`<td rowspan="${K.items.length}" style="vertical-align:top;font-weight:600;color:var(--accent-color);">${K.spbNumber}</td>`:""}
            ${ae===0?`<td rowspan="${K.items.length}" style="vertical-align:top;">${K.requestedBy}</td>`:""}
            <td>${Z.materialName}</td>
            <td style="text-align:right;font-weight:bold;">${Z.qtyPallets} Palet</td>
            <td style="text-align:right;color:var(--primary-color);">${Z.scannedPallets} Palet</td>
            <td>${V}</td>
            ${ae===0?`<td rowspan="${K.items.length}" style="vertical-align:top;color:var(--text-secondary);font-size:var(--fs-sm);">${K.reason||"-"}</td>`:""}
          `,Q.appendChild(U)})}),J.appendChild(Q),G.appendChild(J),O.appendChild(G),r.appendChild(O)}$.appendChild(r)}function P($,m){const l=[];return $.forEach(o=>{if(o.totalSPB<=0){l.push({name:o.name,uom:o.uom,totalSPB:0,sisaStok:o.sisaStok,needSH1:o.sh1,needSH2:o.sh2,needSH3:o.sh3,bufferPerShift:o.buffer,kirimSH1:0,kirimSH2:0,kirimSH3:0});return}const d=m.find(s=>s.name===o.name),r=[o.sh1,o.sh2,o.sh3].filter(s=>s>0).length||1,t=o.buffer/r;l.push({name:o.name,uom:o.uom,totalSPB:o.totalSPB,sisaStok:o.sisaStok,needSH1:o.sh1,needSH2:o.sh2,needSH3:o.sh3,bufferPerShift:t,kirimSH1:d?d.kirimSH1:0,kirimSH2:d?d.kirimSH2:0,kirimSH3:d?d.kirimSH3:0})}),l}function S($){const m=parseFloat($);if(m<=0)return'<span style="color:var(--text-muted);">0%</span>';let l="var(--accent-light)";return m>40&&(l="var(--primary-color)"),`<span style="font-weight:600;color:${l}">${$}%</span>`}async function L($="spb"){if(!e)return;const m=await PMCStore.getMaterialRequirements(e),l=await PMCStore.getHourlyDistribution(e),o=(m==null?void 0:m.grouped)||[],d=P(o,l),a=XLSX.utils.book_new();if($==="all"){const r=[["Material","UOM","Total SPB","Sisa Stok","Kirim SH1","Kirim SH2","Kirim SH3","Total Kirim","% SH1","% SH2","% SH3"]];d.forEach(t=>{if(t.totalSPB<=0)return;const s=Math.ceil(t.kirimSH1)+Math.ceil(t.kirimSH2)+Math.ceil(t.kirimSH3),y=t.totalSPB>0?(Math.ceil(t.kirimSH1)/Math.ceil(t.totalSPB)*100).toFixed(1)+"%":"0%",p=t.totalSPB>0?(Math.ceil(t.kirimSH2)/Math.ceil(t.totalSPB)*100).toFixed(1)+"%":"0%",T=t.totalSPB>0?(Math.ceil(t.kirimSH3)/Math.ceil(t.totalSPB)*100).toFixed(1)+"%":"0%";r.push([t.name,t.uom,Math.ceil(t.totalSPB),Math.ceil(t.sisaStok),Math.ceil(t.kirimSH1),Math.ceil(t.kirimSH2),Math.ceil(t.kirimSH3),s,y,p,T])}),XLSX.utils.book_append_sheet(a,XLSX.utils.aoa_to_sheet(r),"Semua List Kebutuhan")}else if($==="spb"){const r=[["Kode Oracle","Nama Item","Total SPB","UOM"]],t=s=>{for(const y of PMCStore.bomData)for(const p of y.components)if(p.name===s)return p.oracleCode||"-";return"-"};d.forEach(s=>{if(s.totalSPB>0){const y=t(s.name);r.push([y,s.name,Math.ceil(s.totalSPB),s.uom])}}),XLSX.utils.book_append_sheet(a,XLSX.utils.aoa_to_sheet(r),"Total SPB")}XLSX.writeFile(a,`SPB_HARIAN_${e}.xlsx`),ToastComponent.show("File Excel SPB Harian berhasil di-export!","success")}return{render:b}})();window.DistributionPage=We;const Ge=(()=>{let e="";async function P(){if(!window.location.hash.startsWith("#/distribution/hourly"))return;ChartWrapper.destroyAll();const L=document.getElementById("page-content"),$=PMCStore.getUniqueDates();!e&&$.length>0&&(e=$[0]),e?L.innerHTML=`
        <div style="display:flex; align-items:center; justify-content:center; height:400px; color:var(--text-muted); flex-direction:column; gap:var(--sp-4);">
          <div class="spinner"></div>
          <p>🕐 Menyusun jadwal distribusi per jam dari database...</p>
        </div>
      `:L.innerHTML="";const m=document.createElement("button");m.className="btn btn-secondary",m.innerHTML="⬇ Export Excel",m.addEventListener("click",()=>S()),TopbarComponent.render("/distribution/hourly",[m]);const l=document.createElement("div");l.className="page-enter";const o=document.createElement("div");o.style.cssText="display:flex;align-items:center;gap:8px;margin-bottom:20px;";const d=ShiftConfig.getGroupCount(e),a=ShiftConfig.isSaturday(e)?" (Jadwal Sabtu)":"";o.innerHTML=`
      <span class="badge badge-accent" style="font-size:0.8rem;padding:4px 12px;">Distribusi / Jam${a}</span>
      <span style="color:var(--text-secondary);font-size:var(--fs-sm);">Jadwal pengiriman material per jam (${d} group/shift) — 1 Ritase = 10 Pallet</span>
    `,l.appendChild(o);const r=document.createElement("div");r.className="material-view-header";const t=document.createElement("div");t.className="toolbar",t.style.marginBottom="0";const s=document.createElement("span");s.style.cssText="color:var(--text-secondary);font-size:var(--fs-sm);",s.textContent="Tanggal:",t.appendChild(s);const y=document.createElement("select");if(y.className="filter-select",$.forEach(i=>{y.innerHTML+=`<option value="${i}" ${i===e?"selected":""}>${PMCStore.formatDate(i)}</option>`}),y.addEventListener("change",i=>{e=i.target.value,P()}),t.appendChild(y),r.appendChild(t),l.appendChild(r),!e){l.innerHTML+='<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada data jadwal.</div></div>',L.appendChild(l);return}const p=e?await PMCStore.getMergedHourlyDistribution(e):[];e&&(L.innerHTML="");const T=["SH1","SH2","SH3"],x=["Shift 1","Shift 2","Shift 3"],H=["var(--primary-color)","var(--accent-color)","var(--success-color)"];T.forEach((i,n)=>{const k=document.createElement("div");k.className="section",k.style.marginTop=n>0?"var(--sp-6)":"0";const C=document.createElement("div");C.className="section-header",C.innerHTML=`<h3 class="section-title" style="color:${H[n]}">🕐 ${x[n]}</h3>`,k.appendChild(C);const u=document.createElement("div");u.className="table-container";const v=document.createElement("table");v.className="data-table";const D=ShiftConfig.getSlots(e);let M="";D[i].forEach(U=>{M+=`<th style="text-align:center;font-size:var(--fs-xs)">Group ${U.id}<br><span style="color:var(--text-muted);font-weight:400">${U.label}</span></th>`}),v.innerHTML=`
        <thead>
          <tr>
            <th>Material</th>
            <th style="text-align:right">SPB Shift</th>
            ${M}
            <th style="text-align:right">Total Qty</th>
          </tr>
        </thead>
      `;const B=document.createElement("tbody"),j=`kirim${i}`,O=p.filter(U=>U[j]>0);if(O.length===0){const U=document.createElement("tr");U.innerHTML=`<td colspan="${2+D[i].length+1}" style="text-align:center;color:var(--text-muted);padding:var(--sp-4)">Tidak ada pengiriman di shift ini.</td>`,B.appendChild(U)}O.forEach(U=>{const V=document.createElement("tr");U.slots[i];let _="";D[i].forEach((N,c)=>{const w=U.slots&&U.slots[i]?U.slots[i][c]:void 0;if(!w){_+='<td style="text-align:center;vertical-align:top;padding-top:8px"><span style="color:var(--text-muted)">—</span></td>';return}const I=w.pending?"var(--warning-color)":w.pallets>0?"var(--primary-color)":"var(--text-muted)",z=w.pending?' <span style="font-size:9px;color:var(--warning-color)" title="Pending: stok masih cukup">⏸</span>':"";let R="";if(w.details&&w.details.length>0){const F={};w.details.forEach(W=>{const te=`${W.supplier}|${W.qty}`;F[te]||(F[te]={supplier:W.supplier,qty:W.qty,count:0}),F[te].count++}),R='<div style="display:flex;flex-direction:column;gap:2px;margin-top:4px">',Object.values(F).forEach(W=>{const te=W.supplier==="Master Data",X=W.supplier==="Aktual Gudang"?"var(--success-color)":te?"var(--text-muted)":"var(--accent-color)";R+=`<span style="font-size:10px;padding:2px 4px;border-radius:4px;background:var(--bg-secondary);color:${X};border:1px solid var(--border-color);white-space:nowrap">${W.count}x ${W.supplier} (${W.qty})</span>`}),R+="</div>"}_+=`
            <td style="text-align:center;vertical-align:top;padding-top:8px">
              <span style="color:${I};font-weight:${w.pallets>0?"600":"400"}">${w.pallets>0?PMCStore.formatDecimal(w.pallets,4):"—"}${z}</span>
              ${R}
            </td>
          `}),V.innerHTML=`
          <td>${U.name}${U.isManualRow?' <span class="badge badge-accent" style="font-size:9px;padding:2px 6px;">Manual</span>':""}</td>
          <td style="text-align:right;font-weight:600">${PMCStore.formatDecimal(U[j],4)}</td>
          ${_}
          <td style="text-align:right;font-weight:bold">${PMCStore.formatDecimal(U[j],4)}</td>
        `,B.appendChild(V)});const q=document.createElement("tfoot");let G=0;O.forEach(U=>{G+=U[j]});let J="";D[i].forEach((U,V)=>{let _=0;O.forEach(N=>{const c=N.slots&&N.slots[i]?N.slots[i][V]:void 0;c&&(_+=c.pallets)}),J+=`<td style="text-align:center;font-weight:600">${_>0?PMCStore.formatDecimal(_,4):"—"}</td>`});let Q="",K=0;D[i].forEach((U,V)=>{let _=0;O.forEach(N=>{const c=N.slots&&N.slots[i]?N.slots[i][V]:void 0;if(c&&c.details&&c.details.length>0)_+=c.details.length;else if(c&&c.pallets>0){const w=PMCStore.getPalletQty(N.name);_+=w>0?Math.ceil(c.pallets/w):0}}),K+=_,Q+=`<td style="text-align:center;font-weight:600;color:var(--accent-color)">${_>0?_:"—"}</td>`});let Z="",ae=0;D[i].forEach((U,V)=>{let _=0;O.forEach(c=>{const w=c.slots&&c.slots[i]?c.slots[i][V]:void 0;if(w&&w.details&&w.details.length>0)_+=w.details.length;else if(w&&w.pallets>0){const I=PMCStore.getPalletQty(c.name);_+=I>0?Math.ceil(w.pallets/I):0}});const N=_>0?Math.ceil(_/10):0;ae+=N,Z+=`<td style="text-align:center;font-weight:bold;color:var(--primary-color)">${N>0?N:"—"}</td>`}),q.innerHTML=`
        <tr>
          <td colspan="2" style="font-weight:bold;color:${H[n]}">Total Qty</td>
          ${J}
          <td style="text-align:right;font-weight:bold">${PMCStore.formatDecimal(G,4)}</td>
        </tr>
        <tr style="background:var(--bg-secondary)">
          <td colspan="2" style="font-weight:bold;color:var(--accent-color)">Total Pallet</td>
          ${Q}
          <td style="text-align:right;font-weight:bold;color:var(--accent-color)">${K}</td>
        </tr>
        <tr style="background:var(--bg-secondary)">
          <td colspan="2" style="font-weight:bold;color:var(--primary-color)">Ritase <span style="font-weight:400;font-size:var(--fs-xs)">(1 rit = 10 plt)</span></td>
          ${Z}
          <td style="text-align:right;font-weight:bold;font-size:var(--fs-lg);color:var(--primary-color)">${ae}</td>
        </tr>
      `,v.appendChild(B),v.appendChild(q),u.appendChild(v),k.appendChild(u),l.appendChild(k)});const A=document.createElement("div");A.className="section",A.style.marginTop="var(--sp-6)";const f=document.createElement("div");f.className="section-header",f.innerHTML='<h3 class="section-title">📦 Ringkasan Total Qty per Shift</h3>',A.appendChild(f);const E=document.createElement("div");E.style.display="grid",E.style.gridTemplateColumns="repeat(4, 1fr)",E.style.gap="var(--sp-4)";let g=0;T.forEach((i,n)=>{let k=0;const C=`kirim${i}`;p.filter(v=>v[C]>0).forEach(v=>{k+=v[C]}),g+=k;const u=document.createElement("div");u.className="card",u.style.textAlign="center",u.innerHTML=`
        <h4 style="color:${H[n]};margin-bottom:var(--sp-2)">${x[n]}</h4>
        <div style="font-size:1.6rem;font-weight:bold">${PMCStore.formatDecimal(k,4)}</div>
        <div style="color:var(--text-secondary);font-size:var(--fs-sm)">Total Qty SPB</div>
      `,E.appendChild(u)});const h=document.createElement("div");h.className="card",h.style.textAlign="center",h.style.borderColor="var(--primary-color)",h.innerHTML=`
      <h4 style="color:var(--primary-color);margin-bottom:var(--sp-2)">Total Hari Ini</h4>
      <div style="font-size:1.6rem;font-weight:bold;color:var(--primary-color)">${PMCStore.formatDecimal(g,4)}</div>
      <div style="color:var(--text-secondary);font-size:var(--fs-sm)">Total Qty SPB</div>
    `,E.appendChild(h),A.appendChild(E),l.appendChild(A),L.appendChild(l)}async function S(){if(!e)return;const L=await PMCStore.getMergedHourlyDistribution(e),$=XLSX.utils.book_new(),m=["SH1","SH2","SH3"],l=["Shift 1","Shift 2","Shift 3"];m.forEach((o,d)=>{const r=ShiftConfig.getSlots(e)[o],t=["Material","SPB Shift"];r.forEach(p=>{t.push(`G${p.id} Qty (${p.label})`)}),t.push("Total Qty");const s=[t],y=`kirim${o}`;L.filter(p=>p[y]>0).forEach(p=>{const T=[p.name,p[y]];(p.slots[o]||[]).forEach(x=>{T.push(x.pallets||0)}),T.push(p[y]),s.push(T)}),XLSX.utils.book_append_sheet($,XLSX.utils.aoa_to_sheet(s),l[d])}),XLSX.writeFile($,`Distribusi_Per_Jam_${e}.xlsx`),ToastComponent.show("File Excel Distribusi per Jam berhasil di-export!","success")}return{render:P}})();window.DistributionHourlyPage=Ge;const Qe=(()=>{let e=new Date().toISOString().split("T")[0],b=[],P=[];function S(){const o=new Set;PMCStore.bomData.forEach(a=>{a.components.forEach(r=>o.add(r.name))}),P=[...o].sort();const d=PMCStore.getStockCheck(e);b=JSON.parse(JSON.stringify(d.blocks))}function L(){if(window.location.hash!=="#/stock")return;P.length||S(),ChartWrapper.destroyAll();const o=document.getElementById("page-content");o.innerHTML="";const d=PMCStore.getBlockLayout(),a=document.createElement("div");a.className="page-enter";const r=document.createElement("div");r.className="page-header",r.style.display="flex",r.style.justifyContent="space-between",r.style.alignItems="center";const t=document.createElement("div");t.innerHTML=`
      <h2 class="page-title">📦 Cek Stok Awal Shift</h2>
      <p class="page-subtitle">Pengecekan stok fisik awal area pabrik per blok (per pallet)</p>
    `,r.appendChild(t);const s=document.createElement("div");s.className="toolbar",s.innerHTML='<span style="color:var(--text-secondary);font-size:var(--fs-sm);">Tanggal:</span>';const y=document.createElement("input");y.type="date",y.className="form-input",y.value=e,y.addEventListener("change",g=>{e=g.target.value,S(),L()}),s.appendChild(y);const p=document.createElement("button");p.className="btn btn-secondary",p.innerHTML="⬇ Export Excel",p.addEventListener("click",l),s.appendChild(p),r.appendChild(s),a.appendChild(r);const T=document.createElement("div");T.className="card",T.style.marginBottom="var(--sp-6)",T.style.padding="var(--sp-4)",T.style.border="1px solid var(--border-color)",T.style.backgroundColor="var(--bg-secondary)";const x=document.createElement("h3");x.textContent="📈 Total Summary Keseluruhan Stok Awal",x.style.marginBottom="var(--sp-4)",x.style.color="var(--accent-color)",x.style.borderBottom="1px solid var(--border-color)",x.style.paddingBottom="var(--sp-2)",T.appendChild(x);const H=document.createElement("div");m(b,H),T.appendChild(H),a.appendChild(T),document.createElement("div");const A=document.createElement("div");A.style.display="flex",A.style.flexDirection="column",A.style.gap="var(--sp-6)",b.length===0&&(A.innerHTML='<div class="empty-state">Belum ada blok yang diinisialisasi. Atur di Master Layout Blok.</div>'),b.forEach(g=>{const h=d.find(B=>B.id===g.id)||{blockNumber:g.id,rows:[]},i=h.blockNumber||g.id,n=document.createElement("div");n.className="card",n.style.padding="var(--sp-4)",n.style.border="1px solid var(--border-color)";const k=document.createElement("div");k.style.marginBottom="var(--sp-4)",k.style.paddingBottom="var(--sp-2)",k.style.borderBottom="1px solid var(--border-color)",k.innerHTML=`<h3 style="margin:0;color:var(--accent-color);">📍 Blok ${i}</h3>`,n.appendChild(k);const C=document.createElement("div");C.style.display="grid",C.style.gridTemplateColumns="2fr 1fr",C.style.gap="var(--sp-6)",C.style.alignItems="flex-start";const u=document.createElement("div");u.style.display="flex",u.style.flexDirection="column",u.style.gap="var(--sp-4)",(!g.rows||g.rows.length===0)&&(u.innerHTML='<div style="color:var(--text-muted);font-size:var(--fs-sm);">Tidak ada baris material yang diinisialisasi untuk blok ini.</div>'),(g.rows||[]).forEach(B=>{const O=(h.rows.find(Z=>Z.id===B.id)||{rowNumber:B.id}).rowNumber||B.id,q=document.createElement("div");q.className="material-section",q.style.border="1px dashed var(--border-color)",q.style.padding="var(--sp-4)",q.style.borderRadius="var(--radius-md)",q.style.backgroundColor="var(--bg-secondary)";const G=document.createElement("div");G.style.marginBottom="var(--sp-3)";const J=(PMCStore.transitInfoCache.blocks||[]).flatMap(Z=>Z.rows).find(Z=>Z.id===B.id);let Q="";J&&J.material&&B.material&&J.material!==B.material&&(Q=`<div style="font-size:10px; color:var(--warning); margin-top:4px; font-style:italic;">⚠️ Lokasi Salah! Barang ini seharusnya di Blok khusus ${J.material}. Harap pindahkan!</div>`),G.innerHTML=`
          <div style="font-size:var(--fs-sm);font-weight:700;color:var(--primary-color);margin-bottom:2px;">B.${i}.${O}</div>
          <strong style="font-size:var(--fs-lg);color:var(--text-main);">${B.material}</strong>
          ${Q}
        `,q.appendChild(G);const K=document.createElement("div");K.style.display="grid",K.style.gridTemplateColumns="repeat(auto-fill, minmax(80px, 1fr))",K.style.gap="var(--sp-2)",B.pallets.forEach((Z,ae)=>{const U=document.createElement("div");U.style.display="flex",U.style.alignItems="center",U.style.gap="var(--sp-1)";const V=document.createElement("span");V.style.fontWeight="500",V.style.fontSize="var(--fs-xs)",V.style.color="var(--text-secondary)",V.style.minWidth="20px",V.textContent=`#${ae+1}`,U.appendChild(V);let _=Z!==void 0?Z:"";const N=document.createElement("input");N.type="text",N.className="form-input",N.style.width="100%",N.style.padding="4px 6px",N.style.fontSize="var(--fs-sm)",N.style.textAlign="right",N.value=_,N.placeholder="Qty/Rumus..";const c=w=>{const I=w.target.value.trim();if(!I){B.pallets[ae]="",$(g,M);return}try{if(/^[0-9+\-*/().\s]+$/.test(I)){const R=new Function(`return ${I}`)(),F=Math.round(parseFloat(R)*1e3)/1e3;w.target.value=F,B.pallets[ae]=F}else{const R=parseFloat(I);w.target.value=isNaN(R)?"":R,B.pallets[ae]=isNaN(R)?"":R}}catch{w.target.value=_||"",B.pallets[ae]=_||""}_=w.target.value;const z=parseFloat(_);z>0&&z<15?(w.target.style.boxShadow="0 0 10px var(--warning)",w.target.style.borderColor="var(--warning)"):(w.target.style.boxShadow="",w.target.style.borderColor=""),$(g,M)};N.addEventListener("blur",c),N.addEventListener("keydown",w=>{w.key==="Enter"&&w.target.blur()}),U.appendChild(N),K.appendChild(U)}),q.appendChild(K),u.appendChild(q)}),C.appendChild(u);const v=document.createElement("div");v.className="summary-box",v.style.backgroundColor="var(--bg-secondary)",v.style.padding="var(--sp-4)",v.style.borderRadius="var(--radius-md)",v.style.position="sticky",v.style.top="20px";const D=document.createElement("h4");D.textContent="📊 Summary Blok",D.style.marginBottom="var(--sp-3)",D.style.borderBottom="1px solid var(--border-color)",D.style.paddingBottom="var(--sp-2)",v.appendChild(D);const M=document.createElement("div");$(g,M),v.appendChild(M),C.appendChild(v),n.appendChild(C),A.appendChild(n)}),a.appendChild(A);const f=document.createElement("div");f.className="action-bar",f.style.marginTop="var(--sp-6)",f.style.display="flex",f.style.justifyContent="flex-end";const E=document.createElement("button");E.className="btn btn-success btn-lg",E.innerHTML="💾 Simpan Data Stok",E.addEventListener("click",()=>{PMCStore.saveStockCheck(e,b),ToastComponent.show("Data Stok berhasil disimpan!","success")}),f.appendChild(E),a.appendChild(f),o.appendChild(a),TopbarComponent.render("/stock")}function $(o,d){var y;if(!o.rows||o.rows.length===0){d.innerHTML='<div style="color:var(--text-muted);font-size:var(--fs-sm);">Belum ada data material di blok ini.</div>';return}const a={};let r=0;if(o.rows.forEach(p=>{p.material&&(a[p.material]||(a[p.material]={plt:0,pcs:0}),p.pallets.forEach(T=>{if(T!==""&&T!==null&&T!==void 0){const x=parseFloat(T);isNaN(x)||(a[p.material].plt++,a[p.material].pcs+=x,r++)}}))}),Object.keys(a).length===0){d.innerHTML='<div style="color:var(--text-muted);font-size:var(--fs-sm);">Material belum diisi.</div>';return}let t=`<table style="width:100%;font-size:var(--fs-sm);border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid var(--border-color);color:var(--text-secondary);">
          <th style="padding-bottom:4px;text-align:left;">Material</th>
          <th style="padding-bottom:4px;text-align:right;">Pallet</th>
          <th style="padding-bottom:4px;text-align:right;">Total Pcs</th>
        </tr>
      </thead>
      <tbody>`;Object.keys(a).sort().forEach(p=>{a[p].plt>0&&(t+=`
          <tr style="border-bottom:1px dashed var(--border-color);">
            <td style="padding:6px 0;">${p}</td>
            <td style="padding:6px 0;text-align:right;"><span class="badge badge-accent">${a[p].plt}</span></td>
            <td style="padding:6px 0;text-align:right;font-weight:600;">${PMCStore.formatNumber(a[p].pcs)}</td>
          </tr>
        `)}),t+="</tbody></table>",t+=`<div style="margin-top:12px;font-weight:600;display:flex;justify-content:space-between;">
      <span>Total Seluruh Pallet:</span>
      <span style="color:var(--accent-light);">${r}</span>
    </div>`,d.innerHTML=t;const s=document.getElementById("global-summary-content");if(s)m(b,s);else{const p=document.querySelector(".page-enter > .card > div:last-child");p&&(((y=p.previousElementSibling)==null?void 0:y.textContent)||"").includes("Keseluruhan")&&m(b,p)}}function m(o,d){const a={};let r=0,t=0;if(o.forEach(y=>{(y.rows||[]).forEach(p=>{p.material&&(a[p.material]||(a[p.material]={plt:0,pcs:0}),p.pallets.forEach(T=>{if(T!==""&&T!==null&&T!==void 0){const x=parseFloat(T);isNaN(x)||(a[p.material].plt++,a[p.material].pcs+=x,r+=x,t++)}}))})}),Object.keys(a).length===0){d.innerHTML='<div style="color:var(--text-muted);font-size:var(--fs-sm);">Belum ada data dari blok manapun.</div>';return}let s='<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:var(--sp-4);">';Object.keys(a).sort().forEach(y=>{a[y].plt>0&&(s+=`
          <div style="background:var(--bg-main);padding:var(--sp-3);border-radius:var(--radius-md);border:1px solid var(--border-color);">
            <div style="font-weight:600;margin-bottom:var(--sp-1);color:var(--text-main);">${y}</div>
            <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);margin-bottom:4px;">
              <span style="color:var(--text-secondary);">Total Pcs:</span>
              <span style="font-weight:bold;">${PMCStore.formatNumber(a[y].pcs)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);">
              <span style="color:var(--text-secondary);">Total Pallet:</span>
              <span class="badge badge-accent">${a[y].plt}</span>
            </div>
          </div>
        `)}),s+="</div>",s+=`
      <div style="margin-top:var(--sp-4);padding-top:var(--sp-4);border-top:1px solid var(--border-color);display:flex;gap:var(--sp-6);">
        <div style="font-size:var(--fs-lg);font-weight:bold;">Total Semua Pcs: <span style="color:var(--primary-color);">${PMCStore.formatNumber(r)}</span></div>
        <div style="font-size:var(--fs-lg);font-weight:bold;">Total Semua Pallet: <span style="color:var(--accent-light);">${t}</span></div>
      </div>
    `,d.innerHTML=s}function l(){const o=PMCStore.getBlockLayout(),d=XLSX.utils.book_new(),a=[["Blok","Material","Jumlah Pallet","Total Pcs"]];b.forEach(t=>{const y=(o.find(T=>T.id===t.id)||{blockNumber:t.id}).blockNumber||t.id,p={};(t.rows||[]).forEach(T=>{T.material&&(p[T.material]||(p[T.material]={plt:0,pcs:0}),T.pallets.forEach(x=>{if(x!==""&&x!==null){const H=parseFloat(x);isNaN(H)||(p[T.material].plt++,p[T.material].pcs+=H)}}))}),Object.keys(p).sort().forEach(T=>{p[T].plt>0&&a.push([`Blok ${y}`,T,p[T].plt,p[T].pcs])})}),XLSX.utils.book_append_sheet(d,XLSX.utils.aoa_to_sheet(a),"Summary Stok");const r=[["Blok","No. Baris","No. Pallet","Material","Qty Pcs"]];b.forEach(t=>{const s=o.find(p=>p.id===t.id)||{blockNumber:t.id,rows:[]},y=s.blockNumber||t.id;(t.rows||[]).forEach(p=>{const x=(s.rows.find(H=>H.id===p.id)||{rowNumber:p.id}).rowNumber||p.id;p.material&&p.pallets.forEach((H,A)=>{if(H!==""&&H!==null){const f=parseFloat(H);isNaN(f)||r.push([`Blok ${y}`,`B.${y}.${x}`,A+1,p.material,f])}})})}),XLSX.utils.book_append_sheet(d,XLSX.utils.aoa_to_sheet(r),"Detail Pallet"),XLSX.writeFile(d,`Cek_Stok_Awal_${e}.xlsx`),ToastComponent.show("File Excel Stok berhasil di-export!","success")}return{render:L}})();window.StockCheckPage=Qe;const Je=(()=>{let e="",b="",P="",S=new Set;function L(){var h;if(window.location.hash!=="#/warehouse/stock")return;ChartWrapper.destroyAll();const d=document.getElementById("page-content");let a=document.getElementById("warehouse-stock-page");const r=!a;if(r&&(a=document.createElement("div"),a.id="warehouse-stock-page",a.className="page-content",d.replaceChildren(a)),r){TopbarComponent.render("/warehouse/stock");const i=document.createElement("div");i.className="page-header",i.innerHTML=`
        <div>
          <h2 class="page-title">📦 Stok Utama Gudang (WMS)</h2>
          <p class="page-subtitle">Pencatatan kedatangan inventaris gudang secara FIFO berdasarkan kemasan supplier.</p>
        </div>
        <button id="btn-add-stock" class="btn btn-primary">+ Terima Stok Baru</button>
      `,a.appendChild(i);const n=document.createElement("div");n.id="ws-pending-container",n.style.marginBottom="var(--sp-6)",a.appendChild(n);const k=document.createElement("div");k.className="dashboard-grid",k.id="ws-stats-row",a.appendChild(k);const C=document.createElement("div");C.className="section",C.id="ws-summary-section",C.style.marginTop="var(--sp-6)",a.appendChild(C);const u=document.createElement("div");u.className="section",u.id="ws-table-section",u.style.marginTop="var(--sp-6)",a.appendChild(u)}const t=document.getElementById("ws-pending-container");t&&o(t);const s=PMCStore.getWarehouseStock(),y=s.filter(i=>{const n=i.material.toLowerCase().includes(e.toLowerCase()),k=i.supplier.toLowerCase().includes(b.toLowerCase()),u=((i.barcodes?i.barcodes.join(" "):"")+" "+(i.barcodeStart||"")+" "+(i.barcodeEnd||"")).toLowerCase().includes(P.toLowerCase());return n&&k&&u}),p=new Set(y.map(i=>i.id)),T=new Set;S.forEach(i=>{p.has(i)&&T.add(i)}),S=T;const x={};s.forEach(i=>{x[i.material]||(x[i.material]={pallets:0,pcs:0}),x[i.material].pallets+=i.palletsAvailable,x[i.material].pcs+=i.palletsAvailable*i.qtyPerPallet});const H=Object.keys(x).length,A=s.reduce((i,n)=>i+n.palletsAvailable,0),f=document.getElementById("ws-stats-row");f&&f.replaceChildren(StatCardComponent.create({label:"Total Batch Aktif",value:s.length,icon:"🏷️",color:"rgba(108,92,231,0.12)",noAnim:!r}),StatCardComponent.create({label:"Material Tersedia",value:H,icon:"📦",color:"rgba(0,184,148,0.12)",noAnim:!r}),StatCardComponent.create({label:"Total Pallet",value:A,icon:"📋",color:"rgba(253,203,110,0.12)",noAnim:!r}));const E=document.getElementById("ws-summary-section");E&&(H===0?E.innerHTML="":E.innerHTML=`
          <h3 style="margin-bottom:var(--sp-4); color:var(--text-primary); font-size:var(--fs-md); display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">📊</span> Summary per Material
          </h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:var(--sp-4);">
            ${Object.keys(x).sort().map(i=>`
              <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:var(--sp-4); box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                <div style="font-weight:700; color:var(--primary-color); font-size:var(--fs-base); margin-bottom:8px;">${i}</div>
                <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm); margin-bottom:4px;">
                  <span style="color:var(--text-secondary);">Total Stok:</span>
                  <span style="font-weight:700; color:var(--text-primary);">${PMCStore.formatNumber(x[i].pcs)} <span style="color:var(--text-muted); font-weight:400; font-size:10px;">pcs</span></span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm);">
                  <span style="color:var(--text-secondary);">Jumlah Pallet:</span>
                  <span style="font-weight:700; color:var(--text-primary);">${x[i].pallets} <span style="color:var(--text-muted); font-weight:400; font-size:10px;">plt</span></span>
                </div>
              </div>
            `).join("")}
          </div>
        `);const g=document.getElementById("ws-table-section");g&&(s.length===0?g.innerHTML='<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada stok fisik terdaftar di gudang. Klik "+ Terima Stok Baru" untuk memulai.</div></div>':g.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4);">
            <h3 style="margin:0; font-size:var(--fs-md); color:var(--text-primary);">Daftar Detail Stok WMS</h3>
            <div>
              <button id="btn-delete-selected" class="btn btn-danger btn-sm" style="display:${S.size>0?"inline-block":"none"}; transition:all 0.2s;">
                <span style="margin-right:4px;">🗑️</span> Hapus Terpilih (<span id="delete-count">${S.size}</span>)
              </button>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;"><input type="checkbox" id="chk-selectAll" ${S.size===y.length&&y.length>0?"checked":""} style="cursor:pointer; accent-color:var(--primary-color);" /></th>
                <th>No MID</th>
                <th>No Barcode</th>
                <th>Tgl & Jam Masuk (FIFO)</th>
                <th>Material</th>
                <th>Supplier</th>
                <th style="text-align:right">Qty/Pallet</th>
                <th style="text-align:right">Sisa Pallet</th>
                <th style="text-align:center">Aksi</th>
              </tr>
              <tr style="background: rgba(108, 92, 231, 0.05);">
                <th></th>
                <th></th>
                <th><input type="text" id="flt-barcode" value="${P}" placeholder="Cari barcode..." class="form-control" style="padding:4px; font-size:11px; height:24px; min-width:80px; width:100%;"></th>
                <th></th>
                <th><input type="text" id="flt-mat" value="${e}" placeholder="Cari material..." class="form-control" style="padding:4px; font-size:11px; height:24px; min-width:80px; width:100%;"></th>
                <th><input type="text" id="flt-sup" value="${b}" placeholder="Cari supplier..." class="form-control" style="padding:4px; font-size:11px; height:24px; min-width:80px; width:100%;"></th>
                <th colspan="3"></th>
              </tr>
            </thead>
            <tbody>
              ${y.length===0?'<tr><td colspan="9" style="text-align:center; padding:var(--sp-4); color:var(--text-secondary);">Data tidak ditemukan dengan filter yang dipilih.</td></tr>':""}
              ${y.map(i=>{const n=S.has(i.id),k=i.barcodeStart&&i.barcodeEnd?`<span style="font-family:monospace;font-size:var(--fs-xs);background:rgba(108,92,231,0.10);padding:2px 6px;border-radius:4px;">${i.barcodeStart===i.barcodeEnd?i.barcodeStart:i.barcodeStart+" - "+i.barcodeEnd}</span>`:'<span style="color:var(--text-muted)">-</span>',C=i.mid?`<span style="font-family:monospace;font-size:var(--fs-xs)">${i.mid}</span>`:'<span style="color:var(--text-muted)">-</span>',u=i.timeIn?` <span style="color:var(--text-secondary);font-size:var(--fs-xs)">${PMCStore.formatTime(i.timeIn)}</span>`:"";return`
                  <tr>
                    <td style="text-align:center;"><input type="checkbox" class="chk-row" data-id="${i.id}" ${n?"checked":""} style="cursor:pointer; accent-color:var(--primary-color);" /></td>
                    <td>${C}</td>
                    <td>${k}</td>
                    <td>${PMCStore.formatDate(i.dateIn)}${u}</td>
                    <td><strong>${i.material}</strong></td>
                    <td>${i.supplier}</td>
                    <td style="text-align:right"><strong>${i.qtyPerPallet}</strong></td>
                    <td style="text-align:right"><span class="badge ${i.palletsAvailable>0?"badge-primary":"badge-danger"}">${i.palletsAvailable} Plt</span></td>
                    <td style="text-align:center; display:flex; gap:4px; justify-content:center;">
                      <button class="btn btn-secondary btn-sm" data-bc="${i.barcodeStart||""}" data-bc-end="${i.barcodeEnd||""}" data-mid="${i.mid||""}" data-qty="${i.qtyPerPallet||""}" data-mat="${i.material||""}" data-date="${i.dateIn||""}" onclick="if(window.BarcodePrinter) { window.BarcodePrinter.showModal({barcodeStart: this.dataset.bc, barcodeEnd: this.dataset.bcEnd, mid: this.dataset.mid, qty: this.dataset.qty, materialName: this.dataset.mat, dateIn: this.dataset.date}); } else { alert('BarcodePrinter not loaded'); }">Print</button>
                      <button class="btn btn-danger btn-sm action-del-btn" data-del-id="${i.id}">Hapus</button>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        `),(h=document.getElementById("btn-add-stock"))==null||h.addEventListener("click",$),s.length>0&&setTimeout(()=>{document.querySelectorAll(".action-del-btn").forEach(D=>{D.addEventListener("click",()=>m(D.getAttribute("data-del-id")))}),document.querySelectorAll(".action-print-btn").forEach(D=>{D.addEventListener("click",M=>{window.BarcodePrinter&&window.BarcodePrinter.showModal({barcode:M.target.dataset.bc,mid:M.target.dataset.mid,qty:M.target.dataset.qty,materialName:M.target.dataset.mat,dateIn:M.target.dataset.date})})});const i=(D,M)=>{const B=document.getElementById(D);B&&(B.addEventListener("input",j=>{const O=j.target.selectionStart,q=j.target.selectionEnd;M(j.target.value),L(),setTimeout(()=>{const G=document.getElementById(D);G&&(G.focus(),G.setSelectionRange(O,q))},10)}),B.addEventListener("keydown",j=>{j.key==="Enter"&&(j.preventDefault(),L())}))};i("flt-barcode",D=>P=D),i("flt-mat",D=>e=D),i("flt-sup",D=>b=D);const n=document.getElementById("chk-selectAll"),k=document.querySelectorAll(".chk-row"),C=document.getElementById("btn-delete-selected"),u=document.getElementById("delete-count"),v=()=>{C&&u&&(S.size>0?(C.style.display="inline-block",u.textContent=S.size):C.style.display="none")};n&&n.addEventListener("change",D=>{const M=D.target.checked;k.forEach(B=>{B.checked=M;const j=B.getAttribute("data-id");M?S.add(j):S.delete(j)}),v()}),k.forEach(D=>{D.addEventListener("change",M=>{const B=M.target.checked,j=M.target.getAttribute("data-id");if(B?S.add(j):S.delete(j),n){let O=0;k.forEach(q=>{q.checked&&O++}),n.checked=O===k.length&&k.length>0}v()})}),v(),C&&C.addEventListener("click",()=>{confirm(`Yakin ingin menghapus ${S.size} rekam stok yang dipilih?`)&&l()})},50),PMCStore.off("warehouseStockChanged",L),PMCStore.on("warehouseStockChanged",L),PMCStore.off("outboundPendingChanged",L),PMCStore.on("outboundPendingChanged",L)}function $(){const d=new Set;PMCStore.skuList.forEach(T=>{T.category&&d.add(T.category)});let a='<option value="">-- Semua Kategori --</option>';Array.from(d).sort().forEach(T=>{a+=`<option value="${T}">${T}</option>`});let r='<option value="">-- Pilih Material --</option>';const t=new Set;PMCStore.bomData.forEach(T=>T.components.forEach(x=>t.add(x.name))),Array.from(t).sort().forEach(T=>{r+=`<option value="${T}">${T}</option>`});let s='<option value="">-- Pilih Supplier --</option>';PMCStore.supplierList.forEach(T=>{s+=`<option value="${T.name}">${T.code} - ${T.name}</option>`});const p=`
      <div class="form-group">
        <label class="form-label">Tanggal Masuk (FIFO)</label>
        <input type="date" id="form-ws-date" class="form-control" value="${new Date().toISOString().split("T")[0]}" required />
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Barang tertua akan dialokasikan lebih dulu untuk produksi. Jam masuk akan dicatat otomatis.</div>
      </div>
      <div class="form-group">
        <label class="form-label">Filter Kategori SKU</label>
        <select id="form-ws-cat" class="form-control">${a}</select>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Opsional: Filter daftar material berdasarkan kategori SKU asal.</div>
      </div>
      <div class="form-group">
        <label class="form-label">Material</label>
        <select id="form-ws-mat" class="form-control" required>${r}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Supplier</label>
        <div style="position:relative;">
          <input type="text" id="form-ws-supp-search" class="form-control" placeholder="Ketik untuk mencari supplier..." autocomplete="off" />
          <select id="form-ws-supp" class="form-control" style="margin-top:4px;" required>${s}</select>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Pilih supplier dari Master Supplier, atau ketik untuk filter.</div>
      </div>

      <div class="form-group">
        <label class="form-label">Mode Satuan Penerimaan</label>
        <div id="unit-mode-selector" style="display:flex;gap:8px;margin-bottom:8px;">
          <label style="display:flex;align-items:center;gap:6px;padding:8px 16px;border:2px solid var(--primary-color);border-radius:var(--radius-sm);cursor:pointer;background:rgba(108,92,231,0.08);font-weight:600;font-size:var(--fs-sm);">
            <input type="radio" name="unitMode" value="pallet" checked style="accent-color:var(--primary-color);" />
            📦 Satuan / Pallet
          </label>
          <label style="display:flex;align-items:center;gap:6px;padding:8px 16px;border:2px solid var(--border-color);border-radius:var(--radius-sm);cursor:pointer;font-size:var(--fs-sm);">
            <input type="radio" name="unitMode" value="truk" style="accent-color:var(--primary-color);" />
            🚛 Per Truk
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Kapasitas Qty per Pallet</label>
        <input type="number" id="form-ws-qty" class="form-control" min="1" placeholder="Contoh: 1000" required />
      </div>
      <div class="form-group">
        <label class="form-label">Jumlah Pallet Diterima</label>
        <input type="number" id="form-ws-pallets" class="form-control" min="1" required />
      </div>

      <div id="truk-total-section" style="display:none;padding:12px;background:rgba(0,184,148,0.08);border:1px solid rgba(0,184,148,0.3);border-radius:var(--radius-sm);margin-bottom:12px;">
        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">📊 Total Qty Diterima (Otomatis)</div>
        <div style="font-size:1.3rem;font-weight:700;color:var(--primary-color);" id="truk-total-display">0 pcs</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">= Qty per Pallet × Jumlah Pallet</div>
      </div>

      <div id="barcode-preview-section" style="padding:12px;background:rgba(108,92,231,0.06);border:1px solid rgba(108,92,231,0.2);border-radius:var(--radius-sm);margin-bottom:8px;">
        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">🏷️ Preview Barcode</div>
        <div style="font-family:monospace;font-size:1.1rem;font-weight:700;color:var(--primary-color);" id="barcode-preview-display">Masukkan jumlah pallet untuk melihat preview barcode</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Barcode otomatis di-generate berurutan per pallet.</div>
      </div>
    `;ModalComponent.open({title:"Terima Stok Baru (Inbound Eksternal)",body:p,saveText:"Simpan",onSave:()=>{var g;const T=document.getElementById("form-ws-date").value,x=document.getElementById("form-ws-mat").value,H=document.getElementById("form-ws-supp").value.trim(),A=parseInt(document.getElementById("form-ws-qty").value),f=parseInt(document.getElementById("form-ws-pallets").value),E=((g=document.querySelector('input[name="unitMode"]:checked'))==null?void 0:g.value)||"pallet";if(!T||!x||!H||isNaN(A)||isNaN(f)){ToastComponent.show("Harap isi semua kolom dengan benar","error");return}PMCStore.addWarehouseStock({dateIn:T,material:x,supplier:H,qtyPerPallet:A,palletsAvailable:f,unitMode:E}),ToastComponent.show("Stok berhasil didaftarkan ke WMS","success"),ModalComponent.close(),L()}}),setTimeout(()=>{const T=document.getElementById("form-ws-cat"),x=document.getElementById("form-ws-mat");T&&x&&T.addEventListener("change",()=>{const k=T.value;let C=new Set;if(k){const v=PMCStore.skuList.filter(D=>D.category===k).map(D=>D.id);PMCStore.bomData.forEach(D=>{v.includes(D.skuId)&&D.components.forEach(M=>C.add(M.name))})}else PMCStore.bomData.forEach(v=>v.components.forEach(D=>C.add(D.name)));let u='<option value="">-- Pilih Material --</option>';Array.from(C).sort().forEach(v=>{u+=`<option value="${v}">${v}</option>`}),x.innerHTML=u});const H=document.getElementById("form-ws-supp-search"),A=document.getElementById("form-ws-supp");H&&A&&H.addEventListener("input",()=>{const k=H.value.toLowerCase(),C=A.querySelectorAll("option");C.forEach(v=>{if(!v.value){v.style.display="";return}const D=v.textContent.toLowerCase();v.style.display=D.includes(k)?"":"none"});const u=Array.from(C).filter(v=>v.value&&v.style.display!=="none");u.length===1&&(A.value=u[0].value)});const f=document.querySelectorAll('input[name="unitMode"]'),E=document.getElementById("truk-total-section");f.forEach(k=>{k.addEventListener("change",()=>{f.forEach(C=>{const u=C.closest("label");C.checked?(u.style.borderColor="var(--primary-color)",u.style.background="rgba(108,92,231,0.08)",u.style.fontWeight="600"):(u.style.borderColor="var(--border-color)",u.style.background="transparent",u.style.fontWeight="400")}),k.value==="truk"&&k.checked?(E.style.display="block",i()):k.value==="pallet"&&k.checked&&(E.style.display="none")})});const g=document.getElementById("form-ws-qty"),h=document.getElementById("form-ws-pallets");function i(){const k=parseInt(g.value)||0,C=parseInt(h.value)||0,u=k*C,v=document.getElementById("truk-total-display");v&&(v.textContent=PMCStore.formatNumber(u)+" pcs")}function n(){const k=parseInt(h.value)||0,C=document.getElementById("barcode-preview-display");if(!C)return;if(k<=0){C.textContent="Masukkan jumlah pallet untuk melihat preview barcode",C.style.color="var(--text-muted)";return}const u=(PMCStore._barcodeCounterPeek||0)+1,v=u+k-1;C.textContent=String(u).padStart(5,"0")+" — "+String(v).padStart(5,"0")+"  ("+k+" barcode)",C.style.color="var(--primary-color)"}g&&g.addEventListener("input",()=>{i()}),h&&h.addEventListener("input",()=>{i(),n()}),n()},100)}function m(d){confirm("Yakin ingin menghapus rekam stok (batch) ini?")&&(PMCStore.deleteWarehouseStock(d),ToastComponent.show("Stok berhasil dihapus","success"))}function l(){ToastComponent.show(`Sedang menghapus ${S.size} baris stok...`,"info"),Array.from(S).forEach(d=>{PMCStore.deleteWarehouseStock(d)}),S.clear()}function o(d){const a=PMCStore.transitOutboundPending.filter(t=>t.destination==="3P1");if(a.length===0){d.innerHTML="";return}let r=`
      <div class="card" style="border: 2px solid var(--primary-color); background: rgba(108, 92, 231, 0.05); margin-bottom: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--primary-color);">
          <span style="font-size:1.2rem;">📥</span> Terdapat ${a.length} Antrean Penerimaan dari Area Transit (Outbound ke Gudang Packing 3P1)
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu Pengiriman</th>
              <th>Barcode</th>
              <th>Material</th>
              <th>Qty (Pcs)</th>
              <th style="width: 200px; text-align: center;">Aksi Penerimaan</th>
            </tr>
          </thead>
          <tbody>
    `;a.forEach(t=>{r+=`
        <tr>
          <td>${t.date} ${t.time}</td>
          <td><strong>${t.barcode}</strong></td>
          <td>${t.material}</td>
          <td>${t.pcs}</td>
          <td style="text-align: center; display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-primary btn-sm accept-btn" data-id="${t.id}" style="padding: 4px 8px; font-size: 0.8rem;">Terima Barang</button>
            <button class="btn btn-danger btn-sm reject-btn" data-id="${t.id}" style="padding: 4px 8px; font-size: 0.8rem;">Tolak</button>
          </td>
        </tr>
      `}),r+=`
          </tbody>
        </table>
      </div>
    `,d.innerHTML=r,d.querySelectorAll(".accept-btn").forEach(t=>{t.addEventListener("click",async s=>{const y=s.target.getAttribute("data-id");if(confirm("Konfirmasi penerimaan barang ke Gudang Packing (WMS)?")){const p=await PMCStore.verifyTransitOutbound(y,"accept");ToastComponent.show(p.message,p.success?"success":"danger"),L()}})}),d.querySelectorAll(".reject-btn").forEach(t=>{t.addEventListener("click",async s=>{const y=s.target.getAttribute("data-id");if(confirm("Tolak barang ini dan kembalikan truk ke Transit?")){const p=await PMCStore.verifyTransitOutbound(y,"reject");ToastComponent.show(p.message,p.success?"success":"danger"),L()}})})}return{render:L,delStock:m}})();window.WarehouseStockPage=Je;const Xe=(()=>{let e="",b="SH1",P=1,S=null;const L=[{id:"SH1",label:"Shift 1"},{id:"SH2",label:"Shift 2"},{id:"SH3",label:"Shift 3"}];function $(d,a,r){const t=ShiftConfig.getSlots(r)[d];if(!t)return`Group ${a}`;const s=t.find(y=>y.id===a);return s?`Group ${a} (${s.label})`:`Group ${a}`}function m(){const d=PMCStore.getUniqueDates();if(!e){const a=new Date().toISOString().split("T")[0];e=d.includes(a)?a:d[0]||a;const r=new Date,t=r.getHours(),s=r.getMinutes(),y=t*60+s;b=ShiftConfig.detectCurrentShift(e,y);const T=ShiftConfig.getSlots(e)[b]||[];P=1;for(let x=T.length-1;x>=0;x--)if(y>=T[x].startMins){P=T[x].id;break}}}async function l(){try{if(window.location.hash!=="#/warehouse/delivery")return;m(),ChartWrapper.destroyAll(),S=await PMCStore.getOrCreateDelivery(e,b,P);const a=(await PMCStore.getManualSpbs()).filter(B=>{if(B.status==="completed")return!1;const j=B.targetDate?B.targetDate.split("T")[0]:B.createdAt.split("T")[0],O=B.targetShift,q=j===e,G=j<e;if(q){const J=O?`SH${O}`:null;return!J||J===b}return G});console.log(`[WarehouseDelivery] Filtered ${a.length} manual SPBs for ${e} Shift ${b}`),S&&S.items&&(S.items=S.items.map(B=>({...B,material:B.material||B.materialName||"Unknown",required:parseFloat(B.required??B.requiredPallets??0),scanned:parseFloat(B.scanned??B.scannedPallets??0),scans:B.scans||[],details:B.details||[]}))),S||(S={id:null,status:"preparing",items:[]});const r=document.getElementById("page-content");r.innerHTML="";const t=document.createElement("div");t.className="page-enter";const s=document.createElement("div");s.className="page-header",s.style.display="flex",s.style.justifyContent="space-between",s.style.alignItems="flex-start";const y=document.createElement("div");y.innerHTML=`
        <h2 class="page-title">🚚 Request Pengiriman (Gudang -> Produksi)</h2>
        <p class="page-subtitle">Scan item untuk mempersiapkan pengiriman material ke area transit produksi</p>
      `;const p=document.createElement("div");p.style.display="flex",p.style.gap="var(--sp-2)",p.style.alignItems="center",p.style.flexWrap="wrap";const T=PMCStore.getUniqueDates(),x=document.createElement("select");x.className="filter-select",T.forEach(B=>{x.innerHTML+=`<option value="${B}" ${B===e?"selected":""}>${PMCStore.formatDate(B)}</option>`}),x.addEventListener("change",async B=>{e=B.target.value,S=await PMCStore.refreshDelivery(e,b,P),await l()});const H=document.createElement("select");H.className="filter-select",L.forEach(B=>{H.innerHTML+=`<option value="${B.id}" ${B.id===b?"selected":""}>${B.label}</option>`}),H.addEventListener("change",async B=>{b=B.target.value,S=await PMCStore.refreshDelivery(e,b,P),await l()});const A=document.createElement("select");A.className="filter-select",(ShiftConfig.getSlots(e)[b]||[]).forEach(B=>{A.innerHTML+=`<option value="${B.id}" ${B.id===P?"selected":""}>Group ${B.id} (${B.label})</option>`}),A.addEventListener("change",async B=>{P=parseInt(B.target.value),S=await PMCStore.refreshDelivery(e,b,P),await l()}),p.appendChild(x),p.appendChild(H),p.appendChild(A),s.appendChild(y),s.appendChild(p),t.appendChild(s);const E=$(b,P,e),g=document.createElement("div");g.style.cssText="display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);margin-bottom:var(--sp-4);border-left:4px solid var(--accent-color);",g.innerHTML=`
        <span style="font-size:1.2rem">🕐</span>
        <div>
          <div style="font-weight:600;color:var(--text-main)">${E}</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary)">
            Sinkron dengan jadwal Distribusi Bahan per Jam — ${PMCStore.formatDate(e)}
          </div>
        </div>
      `,t.appendChild(g);const h=document.createElement("div");h.style.display="grid",h.style.gridTemplateColumns="300px 1fr",h.style.gap="var(--sp-6)",h.style.alignItems="start";const i=document.createElement("div");i.className="card",i.innerHTML=`
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;">
          <span>🔍</span> Scan Barcode Pallet
        </h3>
        <div style="background:#000;border-radius:var(--radius-md);height:180px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-4);">
          <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
          <div style="color:rgba(255,255,255,0.3);font-size:3rem;">[|||]</div>
        </div>
      `;const n=document.createElement("div");n.className="form-group";const k=S.status!=="preparing";let C=0,u=0;(S.items||[]).forEach(B=>{C+=B.required||B.planned||0,B.scans&&B.scans.forEach(j=>{j.barcode&&PMCStore.usedBarcodes.has(j.barcode)&&u++})});const v=C>0&&u>=C||S.status==="completed";if(k){let B="";v?B='<div class="alert alert-success" style="text-align:center">Pengiriman Selesai & Diterima Transit ✅</div>':B=`<div class="alert alert-warning" style="text-align:center">
                   Barang Sedang Dikirim 🚛<br>
                   <small>Menunggu Penerimaan Area Transit (${u}/${C} Pallet)</small>
                 </div>`,n.innerHTML=B}else{const B=document.createElement("label");B.className="form-label",B.textContent="No Barcode (Scan)";const j=document.createElement("input");j.type="text",j.className="form-input",j.placeholder="100018273...",j.autocomplete="off",j.style.flex="1";const O=CameraScanner.createScanButton(j),q=document.createElement("div");q.style.cssText="display:flex; gap:8px; align-items:stretch;",q.appendChild(j),q.appendChild(O);const G=document.createElement("label");G.className="form-label",G.style.marginTop="var(--sp-3)",G.textContent="Nama Material";const J=document.createElement("input");J.type="text",J.className="form-input",J.placeholder="Karton Mocca...",J.autocomplete="off";const Q=document.createElement("label");Q.className="form-label",Q.style.marginTop="var(--sp-3)",Q.textContent="Qty (Pcs / Roll)";const K=document.createElement("input");K.type="number",K.className="form-input",K.value="",K.placeholder="Misal: 500",K.min="1";const Z=document.createElement("label");Z.className="form-label",Z.style.marginTop="var(--sp-3)",Z.textContent="Nama Supplier";const ae=document.createElement("input");ae.type="text",ae.className="form-input",ae.placeholder="PT. Sumber Jaya...",ae.autocomplete="off",ae.readOnly=!0,ae.style.backgroundColor="var(--bg-secondary)";const U=document.createElement("label");U.className="form-label",U.style.marginTop="var(--sp-3)",U.style.fontWeight="800",U.style.fontSize="1.3rem",U.style.color="var(--primary-color)",U.textContent="Dialokasikan ke Blok per Baris";const V=document.createElement("div");V.className="form-input",V.style.backgroundColor="rgba(108, 92, 231, 0.05)",V.style.border="1px dashed rgba(108, 92, 231, 0.3)",V.style.display="flex",V.style.alignItems="center",V.style.minHeight="60px",V.style.height="auto",V.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';const _=document.createElement("button");_.className="btn btn-primary",_.style.width="100%",_.style.marginTop="var(--sp-4)",_.textContent="Proses Scan / Input Manual",j.addEventListener("input",w=>{const I=w.target.value.trim();if(I.length>=5){if(PMCStore.usedBarcodes.has(I)){J.value="",ae.value="",K.value="",V.innerHTML='<span class="badge badge-danger">🚫 Barcode sudah pernah diterima oleh Transit</span>';return}const R=PMCStore.getWarehouseStock().find(F=>F.barcode===I||F.barcodeStart===I||F.barcodes&&F.barcodes.includes(I));if(R){J.value=R.material,K.value=R.qtyPerPallet,ae.value=R.supplier;const F=PMCStore.predictTransitAllocation(R.material);F?F.isFull?(_.disabled=!0,_.textContent="Stock Over",V.innerHTML=`<span class="badge badge-danger" style="font-size:1.2rem; padding:var(--sp-2); width:100%; text-align:center;">⚠️ Transit Penuh (Dialokasikan ke B${F.blockId}.${F.rowId} - STOCK OVER)</span>`):(_.disabled=!1,_.textContent="Proses Scan / Input Manual",V.innerHTML=`<span class="badge badge-primary" style="font-size:1.6rem; padding:var(--sp-3); font-weight:800; width:100%; text-align:center;">📍 B${F.blockId}.${F.rowId}</span>`):(_.disabled=!0,V.innerHTML='<span class="badge badge-danger">⚠️ Material tidak dikonfigurasi di Blok</span>')}else J.value="",ae.value="",K.value="",V.innerHTML='<span class="badge badge-warning">⚠️ Barcode tidak ditemukan di stok gudang</span>'}else J.value="",ae.value="",K.value="",V.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>'});const N=async()=>{if(_.disabled)return;const w=j.value.trim()||"-",I=J.value.trim(),z=parseFloat(K.value)||0,R=ae.value.trim();if(I&&z>0){_.disabled=!0,_.textContent="Memproses...",j.disabled=!0,J.disabled=!0;try{const F=PMCStore.predictTransitAllocation(I,1);if(F&&F.isFull){_.disabled=!1,_.textContent="Proses Scan / Input Manual",j.disabled=!1,J.disabled=!1,ToastComponent.show(`Kapasitas Transit Penuh (Stock Over) untuk B${F.blockId}.${F.rowId}. Pallet tidak dapat diproses.`,"danger",5e3);return}const W=F?F._originalRowId:null,te=await PMCStore.scanDeliveryItem(S.id,I,w,z,R,W);if(te.success){if(w!=="-"){let Y="";F&&(Y=`
📍 Alokasi: B${F.blockId}.${F.rowId}`),ToastComponent.show(`${te.message}
🏷️ Barcode: ${w}${Y}`,"success",6e3)}else ToastComponent.show(te.message,"success");te.isCompleted&&ToastComponent.show("Semua item telah siap! Barang sedang dikirim.","success",5e3),await l()}else ToastComponent.show(te.message,"danger")}catch{ToastComponent.show("Gagal menghubungi server","danger")}finally{_.disabled=!1,_.textContent="Proses Scan / Input Manual",j.disabled=!1,J.disabled=!1,j.value="",J.value="",K.value="",ae.value="",V.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>',j.focus()}}else I&&ToastComponent.show("Masukkan Qty (Pcs/Roll) yang valid","warning")};j.addEventListener("keydown",w=>{w.key==="Enter"&&J.focus()}),J.addEventListener("keydown",w=>{w.key==="Enter"&&N()}),_.addEventListener("click",N),n.appendChild(B),n.appendChild(q),n.appendChild(G),n.appendChild(J),n.appendChild(Q),n.appendChild(K),n.appendChild(Z),n.appendChild(ae),n.appendChild(U),n.appendChild(V),n.appendChild(_);const c=document.createElement("div");c.style.fontSize="var(--fs-xs)",c.style.color="var(--text-muted)",c.style.marginTop="var(--sp-2)",c.innerHTML="Scan ke No Barcode, lalu arahkan kursor ke Nama Material dan enter.",n.appendChild(c),setTimeout(()=>j.focus(),100)}i.appendChild(n),h.appendChild(i);const D=document.createElement("div");if(D.className="card",D.style.minHeight="400px",D.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);border-bottom:1px solid var(--border-color);padding-bottom:var(--sp-2);">
          <h3 style="margin:0;">📦 Daftar Kebutuhan Pengiriman</h3>
          <span class="badge badge-primary">${E}</span>
        </div>
      `,S.items.length===0)D.innerHTML+='<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-text">Tidak ada kebutuhan pengiriman untuk jadwal / grup ini.</div></div>';else{const B=document.createElement("div");B.style.display="flex",B.style.flexDirection="column",B.style.gap="var(--sp-3)",S.items.forEach(j=>{const O=j.scanned>=j.required,q=Math.min(100,Math.round(j.scanned/j.required*100)),G=document.createElement("div");G.style.background="var(--bg-secondary)",G.style.padding="12px",G.style.borderRadius="var(--radius-md)",G.style.borderLeft=`4px solid ${O?"var(--success-color)":"var(--accent-color)"}`;const J=j.details&&j.details.length>0?j.details[0].qty:PMCStore.getPalletQty(j.material)||1,Q=PMCStore.getMaterialUOM(j.material);let K=0;j.scans&&j.scans.length>0?K=j.scans.reduce((V,_)=>V+(_.pcs||0),0):K=Math.round(j.scanned*J);let Z="";if(j.details&&j.details.length>0){const V=j.details.reduce((N,c)=>N+c.qty,0),_={};j.details.forEach(N=>{const c=`${N.supplier}|${N.qty}`;_[c]||(_[c]={supplier:N.supplier,qty:N.qty,count:0}),_[c].count++}),Z=`<div><div style="font-size:var(--fs-xs);color:var(--primary-color);margin-top:2px;">Target: ${V} ${Q} (${K} Scanned)</div>`,Z+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;justify-content:flex-end;">',Object.values(_).forEach(N=>{const c=N.supplier==="Aktual Gudang"?"var(--success-color)":N.supplier==="Master Data"?"var(--text-muted)":"var(--accent-color)";Z+=`<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg-secondary);color:${c};border:1px solid ${c};white-space:nowrap">Tarik ${N.count} Plt - <strong>${N.supplier}</strong> (@${N.qty})</span>`}),Z+="</div></div>"}else Z=`<div style="font-size:var(--fs-xs);color:var(--primary-color);margin-top:2px;">Target: ${Math.round(j.required*J)} ${Q} (${K} Scanned)</div>`;let ae=PMCStore.formatDecimal(j.scanned,2);ae.endsWith(".00")&&(ae=parseInt(ae));let U="";j.scans&&j.scans.length>0&&(U=`<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">${j.scans.map(_=>`<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg-main);color:var(--text-secondary);border:1px solid var(--border-color);white-space:nowrap;">🏷️ ${_.barcode}</span>`).join("")}</div>`),G.innerHTML=`
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div style="flex:1;">
                <div style="font-weight:600;font-size:var(--fs-lg);">${j.material}</div>
                ${(()=>{if(j.details&&j.details.length>0){const V={};return j.details.forEach(N=>{V[N.supplier]||(V[N.supplier]={count:0,qty:N.qty}),V[N.supplier].count++}),`<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;">${Object.entries(V).map(([N,c])=>{const w=N==="Aktual Gudang"?"#00e676":N==="Master Data"?"#a0aec0":"#00c3ff";return`<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,0.3);color:${w};border:1px solid ${w};margin-right:4px;">🏢 <strong>${N}</strong> (${c.count} plt × ${c.qty} pcs)</span>`}).join("")}</div>`}else{const V=PMCStore.getSupplierForMaterial(j.material);return V&&V!=="-"?`<div style="margin-top:4px;"><span style="font-size:0.75rem;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,0.3);color:#00c3ff;border:1px solid rgba(0,195,255,0.3);">🏢 <strong>${V}</strong></span></div>`:""}})()}
              </div>
              <div style="font-size:var(--fs-sm);color:var(--text-secondary);text-align:right;min-width:120px;">
                ${O?'<span style="color:var(--success-color)">✅ Lengkap</span>':`${ae} / ${j.required} Pallet`}
                ${Z}
              </div>
            </div>
            <div style="height:6px;background:var(--bg-main);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${q}%;background:${O?"var(--success-color)":"var(--accent-color)"};transition:width 0.3s ease;"></div>
            </div>
            ${U}
          `,B.appendChild(G)}),D.appendChild(B)}h.appendChild(D);const M=document.createElement("div");if(M.className="card",M.style.gridColumn="1 / -1",M.style.border="2px dashed var(--accent-color)",M.style.background="rgba(108, 92, 231, 0.05)",M.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-4);border-bottom:1px solid var(--accent-color);padding-bottom:var(--sp-2);">
          <h3 style="margin:0;">📋 Permintaan Manual (PPIC) — Perlu Disiapkan</h3>
          <span class="badge badge-accent">Prioritas Manual</span>
        </div>
      `,a.length===0)M.innerHTML+='<div class="empty-state" style="padding:var(--sp-4);"><div class="empty-state-text">Tidak ada permintaan manual aktif untuk tanggal ini.</div></div>';else{const B=document.createElement("div");B.style.display="grid",B.style.gridTemplateColumns="repeat(auto-fill, minmax(400px, 1fr))",B.style.gap="var(--sp-4)",a.forEach(j=>{j.items.forEach(O=>{if(O.status==="completed")return;const q=document.createElement("div");q.className="glass-card",q.style.padding="16px",q.style.display="flex",q.style.justifyContent="space-between",q.style.alignItems="center",q.style.borderLeft="4px solid var(--accent-color)",q.innerHTML=`
              <div style="flex:1;">
                <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-bottom:4px;">${j.spbNumber} — ${j.requestedBy}</div>
                <div style="font-weight:700; font-size:1.1rem; color:var(--text-main);">${O.materialName}</div>
                <div style="font-size:var(--fs-sm); color:var(--accent-light);">Diminta: <strong>${O.qtyPallets} Palet</strong> ${O.qtyPcs?`(@${O.qtyPcs} pcs)`:""}</div>
                <div style="font-size:var(--fs-xs); color:var(--text-muted); margin-top:4px;">Alasan: ${j.reason||"-"}</div>
              </div>
              <button class="btn btn-primary btn-process-manual" data-item-id="${O.id}" data-material="${O.materialName}" data-pcs="${O.qtyPcs||""}">🔍 Scan & Kirim</button>
            `,B.appendChild(q)})}),M.appendChild(B)}t.appendChild(h),t.appendChild(M),r.appendChild(t),document.querySelectorAll(".btn-process-manual").forEach(B=>{B.addEventListener("click",()=>{const j=B.getAttribute("data-item-id"),O=B.getAttribute("data-material"),q=B.getAttribute("data-pcs");o(j,O,q)})}),TopbarComponent.render("/warehouse/delivery")}catch(d){console.error("WarehouseDeliveryPage render error:",d);const a=document.getElementById("page-content");a.innerHTML=`<div style="padding:40px;text-align:center;">
        <div style="font-size:2rem;margin-bottom:16px;">⚠️</div>
        <div style="color:var(--danger-color);font-weight:600;margin-bottom:8px;">Terjadi Kesalahan</div>
        <div style="color:var(--text-muted);font-size:var(--fs-sm);">${d.message}</div>
      </div>`}}PMCStore.on("deliveryChanged",()=>{var a;(((a=document.getElementById("page-content").querySelector(".page-header h2"))==null?void 0:a.textContent)||"").includes("Request Pengiriman")});function o(d,a,r){const t=document.createElement("div");t.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);";const s=document.createElement("div");s.className="card",s.style.cssText="width:420px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,0.5); border:1px solid var(--accent-color);",s.innerHTML=`
      <h3 style="margin-bottom:var(--sp-4);display:flex;align-items:center;gap:8px;">
        <span>🔍</span> Scan Barcode — SPB Manual
      </h3>
      <div style="background:var(--bg-secondary);padding:12px;border-radius:var(--radius-md);margin-bottom:var(--sp-4);border-left:3px solid var(--accent-color);">
        <div style="font-weight:700;font-size:1.1rem;">${a}</div>
      </div>
      <div class="form-group">
        <label class="form-label">No Barcode</label>
        <input type="text" id="modal-barcode" class="form-input" placeholder="Scan barcode pallet..." autofocus />
      </div>
      <div class="form-group">
        <label class="form-label">Qty (Pcs)</label>
        <input type="number" id="modal-pcs" class="form-input" value="${r}" placeholder="Jumlah pcs per pallet" />
      </div>
      <div class="form-group">
        <label class="form-label">Supplier</label>
        <input type="text" id="modal-supplier" class="form-input" placeholder="Nama supplier" readonly style="background:var(--bg-secondary);" />
      </div>
      <div id="modal-allocation" style="margin-top:var(--sp-2); margin-bottom:var(--sp-4);"></div>
      <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;">
        <button id="modal-cancel" class="btn btn-secondary">Batal</button>
        <button id="modal-submit" class="btn btn-primary" disabled>✅ Proses & Kirim</button>
      </div>
    `,t.appendChild(s),document.body.appendChild(t);const y=s.querySelector("#modal-barcode"),p=s.querySelector("#modal-pcs"),T=s.querySelector("#modal-supplier"),x=s.querySelector("#modal-allocation"),H=s.querySelector("#modal-submit");y.addEventListener("input",()=>{const f=y.value.trim();if(f.length>=5){if(PMCStore.usedBarcodes.has(f)){x.innerHTML='<span class="badge badge-danger">🚫 Barcode sudah pernah dipakai</span>',H.disabled=!0;return}const g=PMCStore.getWarehouseStock().find(h=>h.barcode===f||h.barcodeStart===f);if(g){p.value||(p.value=g.qtyPerPallet||""),T.value=g.supplier||"";const h=PMCStore.predictTransitAllocation(a);h?(x.innerHTML=`<div class="badge badge-primary" style="width:100%; text-align:center; font-size:1.2rem;">📍 B${h.blockId}.${h.rowId}</div>`,H.disabled=!1):(x.innerHTML='<div class="badge badge-danger">⚠️ Mapping Line tidak ditemukan</div>',H.disabled=!0)}else x.innerHTML='<span class="badge badge-warning">⚠️ Barcode tidak ditemukan di WMS</span>',H.disabled=!0}});const A=async()=>{if(H.disabled)return;const f=y.value.trim(),E=parseFloat(p.value)||0,g=T.value.trim();if(E<=0){ToastComponent.show("Masukkan qty yang valid","warning");return}H.disabled=!0,H.textContent="Memproses...";try{const h=await PMCStore.scanManualSpbItem(d,f,E,g);h.success?(ToastComponent.show(h.message,"success"),document.body.removeChild(t),await l()):(ToastComponent.show(h.message,"danger"),H.disabled=!1,H.textContent="✅ Proses & Kirim")}catch{ToastComponent.show("Gagal menghubungi server","danger"),H.disabled=!1,H.textContent="✅ Proses & Kirim"}};y.addEventListener("keydown",f=>{f.key==="Enter"&&p.focus()}),p.addEventListener("keydown",f=>{f.key==="Enter"&&A()}),H.addEventListener("click",A),s.querySelector("#modal-cancel").addEventListener("click",()=>document.body.removeChild(t)),setTimeout(()=>y.focus(),100)}return{render:l}})();window.WarehouseDeliveryPage=Xe;const Ye=(()=>{let e=[],b=null,P="3P2";const S=[{id:"3F2",label:"Produksi 3IN1 (3F2)"},{id:"3P2",label:"Gudang Packing 3IN1 (3P2)"}];function L(){if(window.location.hash!=="#/warehouse/outbound")return;ChartWrapper.destroyAll();const m=document.getElementById("page-content");m.innerHTML="";const l=document.createElement("div");l.className="page-enter";const o=document.createElement("div");o.className="page-header",o.innerHTML=`
      <div>
        <h2 class="page-title">📤 Pengeluaran Gudang (Outbound)</h2>
        <p class="page-subtitle">Scan barcode pallet dari gudang untuk dikirim langsung ke 3F2 atau 3P2</p>
      </div>
    `,l.appendChild(o);const d=document.createElement("div");d.style.display="grid",d.style.gridTemplateColumns="320px 1fr",d.style.gap="var(--sp-6)",d.style.alignItems="start";const a=document.createElement("div");a.className="card";const r=document.createElement("h3");r.style.marginBottom="var(--sp-3)",r.style.display="flex",r.style.alignItems="center",r.style.gap="8px",r.innerHTML="<span>🔍</span> Scan Barcode Keluar",a.appendChild(r);const t=document.createElement("div");t.className="form-group",t.innerHTML='<label class="form-label">Tujuan Pengeluaran</label>';const s=document.createElement("select");s.className="form-input",s.style.marginBottom="var(--sp-3)",S.forEach(C=>{s.innerHTML+=`<option value="${C.id}" ${C.id===P?"selected":""}>${C.label}</option>`}),s.addEventListener("change",C=>{P=C.target.value}),t.appendChild(s);const y=document.createElement("div");y.style.cssText="background:#000;border-radius:var(--radius-md);height:120px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-4);",y.innerHTML=`
      <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
      <div style="color:rgba(255,255,255,0.3);font-size:2.5rem;">[|||]</div>
    `;const p=document.createElement("div");p.className="form-group";const T=document.createElement("label");T.className="form-label",T.textContent="No Barcode Gudang (Scan)";const x=document.createElement("input");x.type="text",x.className="form-input",x.placeholder="Scan barcode disini...",x.autocomplete="off",x.style.flex="1";const H=CameraScanner.createScanButton(x),A=document.createElement("div");A.style.cssText="display:flex; gap:8px; align-items:stretch;",A.appendChild(x),A.appendChild(H);const f=document.createElement("label");f.className="form-label",f.style.marginTop="var(--sp-3)",f.textContent="Nama Material",b=document.createElement("input"),b.type="text",b.className="form-input",b.readOnly=!0,b.style.backgroundColor="var(--bg-secondary)";const E=document.createElement("label");E.className="form-label",E.style.marginTop="var(--sp-3)",E.style.color="var(--warning-color)",E.textContent="Status Barcode";const g=document.createElement("div");g.className="form-input",g.style.backgroundColor="rgba(253, 203, 110, 0.05)",g.style.border="1px dashed rgba(253, 203, 110, 0.4)",g.style.display="flex",g.style.alignItems="center",g.style.minHeight="50px",g.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>';const h=document.createElement("button");h.className="btn btn-primary",h.style.width="100%",h.style.marginTop="var(--sp-4)",h.textContent="Proses Pengeluaran",x.addEventListener("input",C=>{const u=C.target.value.trim();if(u.length>=5){const v=PMCStore.warehouseInventory.find(D=>D.barcode===u);v?(b.value=v.material||v.materialName||"Unknown Material",g.innerHTML='<span class="badge badge-success" style="font-size:1.1rem; padding:var(--sp-2); width:100%; text-align:center;">✅ Barcode Valid di Gudang</span>'):(b.value="",g.innerHTML='<span class="badge badge-danger">❌ Barcode tidak ditemukan di stok Gudang</span>')}else b.value="",g.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>'});const i=async()=>{const C=x.value.trim(),u=b.value.trim();if(C&&u){h.disabled=!0,h.textContent="Memproses...";const v=await PMCStore.requestWarehouseOutbound(C,P),D=new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});e.unshift({time:D,barcode:C,material:u,destination:P,success:v.success,message:v.message}),e.length>50&&e.pop(),v.success?ToastComponent.show(v.message,"success"):ToastComponent.show(v.message,"danger"),x.value="",b.value="",g.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>',x.focus(),h.disabled=!1,h.textContent="Proses Pengeluaran",$()}else ToastComponent.show("Scan barcode terlebih dahulu","warning")};x.addEventListener("keydown",C=>{C.key==="Enter"&&i()}),h.addEventListener("click",i),p.appendChild(t),p.appendChild(y),p.appendChild(T),p.appendChild(A),p.appendChild(f),p.appendChild(b),p.appendChild(E),p.appendChild(g),p.appendChild(h),a.appendChild(p),d.appendChild(a);const n=document.createElement("div");n.className="card",n.style.minHeight="600px",n.style.display="flex",n.style.flexDirection="column",n.innerHTML='<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📜 Log Pengeluaran Gudang</h3>';const k=document.createElement("div");k.id="scan-logs-container",k.style.flex="1",k.style.display="flex",k.style.flexDirection="column",k.style.gap="var(--sp-2)",k.style.overflowY="auto",n.appendChild(k),d.appendChild(n),l.appendChild(d),m.appendChild(l),$(),setTimeout(()=>{x&&x.focus()},100),TopbarComponent.render("/warehouse/outbound")}function $(){const m=document.getElementById("scan-logs-container");if(m){if(e.length===0){m.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas scan keluar pada sesi ini.</div>';return}m.innerHTML=e.map(l=>`
      <div style="background:var(--bg-secondary);padding:var(--sp-2) var(--sp-3);border-left:4px solid ${l.success?"var(--primary-color)":"var(--danger-color)"};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${l.time}</span>
          <span style="font-weight:600;color:${l.success?"var(--primary-color)":"var(--danger-color)"}">${l.success?"✅ TERKIRIM":"❌ GAGAL"}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:600;font-size:var(--fs-sm);">${l.barcode} <span style="font-weight:normal;color:var(--text-secondary)">— ${l.material}</span></div>
            <span class="badge badge-accent" style="font-size:0.6rem">Ke: ${l.destination}</span>
        </div>
        <div style="font-size:var(--fs-xs);color:var(--success-color);">${l.message}</div>
      </div>
    `).join("")}}return{render:L}})();window.WarehouseOutboundPage=Ye;const Ve=(()=>{let e=[],b=null,P=null;function S(){if(window.location.hash!=="#/transit/inbound")return;ChartWrapper.destroyAll();const o=document.getElementById("page-content");o.innerHTML="";const d=document.createElement("div");d.className="page-enter";const a=document.createElement("div");a.className="page-header",a.innerHTML=`
      <div>
        <h2 class="page-title">📥 Penerimaan Area Transit (Inbound)</h2>
        <p class="page-subtitle">Scan barcode muatan dari gudang untuk memasukkan stok ke area transit blok</p>
      </div>
    `,d.appendChild(a);const r=document.createElement("div");r.style.display="grid",r.style.gridTemplateColumns="300px 1fr",r.style.gap="var(--sp-6)",r.style.alignItems="start";const t=document.createElement("div");t.className="card",t.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;">
        <span>🔍</span> Scan Barcode
      </h3>
      <div style="background:#000;border-radius:var(--radius-md);height:180px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-4);">
        <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
        <div style="color:rgba(255,255,255,0.3);font-size:3rem;">[|||]</div>
      </div>
      <style>
        @keyframes scanline {
          0% { top: 20%; }
          100% { top: 80%; }
        }
      </style>
    `;const s=document.createElement("div");s.className="form-group";const y=document.createElement("label");y.className="form-label",y.textContent="No Barcode (Scan)";const p=document.createElement("input");p.type="text",p.className="form-input",p.placeholder="100018273...",p.autocomplete="off",p.style.flex="1";const T=CameraScanner.createScanButton(p),x=document.createElement("div");x.style.cssText="display:flex; gap:8px; align-items:stretch;",x.appendChild(p),x.appendChild(T);const H=document.createElement("label");H.className="form-label",H.style.marginTop="var(--sp-3)",H.textContent="Nama Material",P=document.createElement("input"),P.type="text",P.className="form-input",P.placeholder="Karton Mocca...",P.autocomplete="off",P.readOnly=!0,P.style.backgroundColor="var(--bg-secondary)";const A=document.createElement("label");A.className="form-label",A.style.marginTop="var(--sp-3)",A.textContent="Nama Supplier";const f=document.createElement("input");f.type="text",f.className="form-input",f.placeholder="PT. Sumber Jaya...",f.autocomplete="off",f.readOnly=!0,f.style.backgroundColor="var(--bg-secondary)";const E=document.createElement("label");E.className="form-label",E.style.marginTop="var(--sp-3)",E.style.fontWeight="800",E.style.fontSize="1.3rem",E.style.color="var(--primary-color)",E.textContent="Dialokasikan ke Blok per Baris (Otomatis)";const g=document.createElement("div");g.className="form-input",g.style.backgroundColor="rgba(108, 92, 231, 0.05)",g.style.border="1px dashed rgba(108, 92, 231, 0.3)",g.style.display="flex",g.style.alignItems="center",g.style.minHeight="60px",g.style.height="auto",g.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';const h=document.createElement("label");h.className="form-label",h.style.marginTop="var(--sp-3)",h.textContent="Qty Aktual (Pcs / Roll)";const i=document.createElement("input");i.type="number",i.className="form-input",i.placeholder="Misal: 500",i.min="1";const n=document.createElement("button");n.className="btn btn-primary",n.style.width="100%",n.style.marginTop="var(--sp-4)",n.textContent="Proses Penerimaan",p.addEventListener("input",async j=>{const O=j.target.value.trim();if(O.length>=5){if(PMCStore.usedBarcodes.has(O)){P.value="",f.value="",i.value="",g.innerHTML='<span class="badge badge-danger">🚫 Barcode sudah pernah diterima</span>';return}const q=await PMCStore.isBarcodeInActiveDelivery(O);if(q&&q.item){const G=q.item.materialName||q.item.material,J=q.scan;if(P.value=G,f.value=J.supplier||"",i.value="",J.targetBlockRowId){const Q=PMCStore.getTransitInfo();let K="?",Z="?";if(Q&&Q.blocks)for(const ae of Q.blocks)for(const U of ae.rows)U.id===J.targetBlockRowId&&(K=ae.blockNumber!==void 0?ae.blockNumber:ae.id,Z=U.rowNumber!==void 0?U.rowNumber:U.id);n.disabled=!1,n.textContent="Proses Penerimaan",g.innerHTML=`<span class="badge badge-primary" style="font-size:1.6rem; padding:var(--sp-3); font-weight:800; width:100%; text-align:center;">📍 BAWA KE B${K}.${Z}</span>`}else{const Q=PMCStore.predictTransitAllocation(G);Q?Q.isFull?(n.disabled=!0,n.textContent="Stock Over",g.innerHTML=`<span class="badge badge-danger" style="font-size:1.2rem; padding:var(--sp-2); width:100%; text-align:center;">⚠️ Kapasitas Penuh (Dialokasikan ke B${Q.blockId}.${Q.rowId} - STOCK OVER)</span>`):(n.disabled=!1,n.textContent="Proses Penerimaan",g.innerHTML=`<span class="badge badge-primary" style="font-size:1.6rem; padding:var(--sp-3); font-weight:800; width:100%; text-align:center;">📍 B${Q.blockId}.${Q.rowId}</span>`):(n.disabled=!0,g.innerHTML='<span class="badge badge-danger">⚠️ Material tidak dikonfigurasi di Blok</span>')}}else{const G=await PMCStore.isBarcodeInActiveManualSpb(O);if(G&&G.item){const J=G.item.materialName;if(P.value=J,f.value=G.supplier||"-",i.value="",n.disabled=!1,n.textContent="Terima SPB Manual",G.targetBlockRowId){const Q=PMCStore.getTransitInfo();let K="?",Z="?";(Q.blocks||[]).forEach(ae=>{ae.rows.forEach(U=>{U.id===G.targetBlockRowId&&(K=ae.blockNumber||ae.id,Z=U.rowNumber||U.id)})}),g.innerHTML=`<span class="badge badge-accent" style="font-size:1.6rem; padding:var(--sp-3); font-weight:800; width:100%; text-align:center;">📋 SPB: B${K}.${Z}</span>`}else g.innerHTML=`<span class="badge badge-accent" style="width:100%;text-align:center;">📋 SPB Manual (${G.item.spb.spbNumber})</span>`}else P.value="",f.value="",i.value="",g.innerHTML='<span class="badge badge-danger">❌ Barcode tidak terdaftar (Delivery/Manual SPB)</span>'}}else P.value="",f.value="",i.value="",g.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>'});let k=!1;const C=async()=>{if(k)return;const j=p.value.trim(),O=P.value.trim(),q=parseFloat(i.value)||0;if(f.value.trim(),j&&O&&q>0){k=!0,n.disabled=!0,p.disabled=!0,i.disabled=!0,n.textContent="Memproses...";try{const G=await PMCStore.isBarcodeInActiveDelivery(j);if(G&&G.delivery){const J=G.delivery.id;if(b&&b!==J&&(e=[]),b=J,G.scan&&G.scan.pcs&&parseFloat(G.scan.pcs)!==q){ToastComponent.show("Coba cek kembali jumlahnya sampai Qty nya sama dengan jumlah Qty dari gudang","warning"),i.value="",i.focus();return}await L(O,q,j,"delivery"),p.value="",P.value="",f.value="",i.value="",g.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>',p.focus()}else{const J=await PMCStore.isBarcodeInActiveManualSpb(j);if(J){if(J.pcs&&parseFloat(J.pcs)!==q){ToastComponent.show("Qty tidak sesuai dengan data dispatch gudang","warning"),i.value="",i.focus();return}const Q=await PMCStore.receiveManualSpbScan(j,q);if(Q.success){ToastComponent.show(Q.message,"success");const K=new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});e.unshift({time:K,material:`${j} - ${O}`,success:!0,message:`SPB Manual Diterima: ${Q.message}`}),p.value="",P.value="",f.value="",i.value="",g.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>',p.focus()}else ToastComponent.show(Q.message,"danger");$()}else ToastComponent.show("Barcode tidak ditemukan di pengiriman aktif maupun SPB Manual.","danger")}}finally{k=!1,n.disabled=!1,p.disabled=!1,i.disabled=!1,n.textContent="Proses Penerimaan"}}else ToastComponent.show("Mohon lengkapi Barcode, Material dan Qty","warning")};p.addEventListener("keydown",j=>{j.key==="Enter"&&i.focus()}),i.addEventListener("keydown",j=>{j.key==="Enter"&&C()}),n.addEventListener("click",C),s.appendChild(y),s.appendChild(x),s.appendChild(H),s.appendChild(P),s.appendChild(A),s.appendChild(f),s.appendChild(E),s.appendChild(g),s.appendChild(h),s.appendChild(i),s.appendChild(n),t.appendChild(s);const u=document.createElement("div");u.style.fontSize="var(--fs-xs)",u.style.color="var(--text-muted)",u.style.marginTop="var(--sp-2)",u.innerHTML="Scan ke No Barcode, lalu ketik Qty manual dan Enter.",t.appendChild(u),r.appendChild(t);const v=document.createElement("div");v.className="card",v.style.minHeight="650px",v.style.display="flex",v.style.flexDirection="column",v.innerHTML='<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📜 Log Sesi Scan</h3>';const D=document.createElement("div");D.id="scan-logs-container",D.style.flex="1",D.style.display="flex",D.style.flexDirection="column",D.style.gap="var(--sp-2)",D.style.overflowY="auto",D.style.maxHeight="550px",v.appendChild(D),r.appendChild(v);const M=document.createElement("div");M.id="active-deliveries-container",M.style.gridColumn="1 / -1",r.appendChild(M);const B=document.createElement("div");B.id="pending-returns-container",B.style.gridColumn="1 / -1",r.appendChild(B),d.appendChild(r),o.appendChild(d),$(),m(),l(),PMCStore.off("returnsChanged",l),PMCStore.on("returnsChanged",l),PMCStore.off("deliveryChanged",m),PMCStore.on("deliveryChanged",m),PMCStore.off("warehouseStockChanged",m),PMCStore.on("warehouseStockChanged",m),setTimeout(()=>{const j=t.querySelector("input");j&&j.focus()},100),TopbarComponent.render("/transit/inbound")}async function L(o,d,a="-"){const r=new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});if(!PMCStore.getPalletQty(o)){e.unshift({time:r,material:o,success:!1,message:"Material tidak valid atau kapasitas pallet belum diatur"}),e.length>50&&e.pop(),ToastComponent.show("Ditolak! Material tidak valid","danger"),$();return}const s=await PMCStore.receiveAndConsumeWMS(o,d,a);let y="";s.success&&a!=="-"&&(s.deliveryCompleted?y='<br/><span style="color:var(--primary-color)"><b>📦 Pengiriman Selesai!</b> Semua pallet pada group aktif telah tercapai.</span>':s.remainingPallets!==void 0&&(y=`<br/><span style="color:var(--warning-color)"><b>⏳ Sisa ${s.remainingPallets} Pallet</b> belum masuk.</span>`)),e.unshift({time:r,material:a==="-"?o:`${a} - ${o}`,success:s.success,message:s.success?`Sesuai (${d} ${PMCStore.getMaterialUOM(o)}). ${s.message}${y}`:s.message}),e.length>50&&e.pop(),s.success?ToastComponent.show("Berhasil! "+s.message,"success"):ToastComponent.show("Ditolak! "+s.message,"danger"),$()}function $(){const o=document.getElementById("scan-logs-container");if(o){if(e.length===0){o.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas scan pada sesi ini.</div>';return}o.innerHTML=e.map(d=>`
      <div style="background:var(--bg-secondary);padding:var(--sp-2) var(--sp-3);border-left:4px solid ${d.success?"var(--success-color)":"var(--danger-color)"};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${d.time}</span>
          <span style="font-weight:600;color:${d.success?"var(--success-color)":"var(--danger-color)"}">${d.success?"✅ ACCEPTED":"❌ REJECTED"}</span>
        </div>
        <div style="font-weight:600;font-size:var(--fs-sm);">Bcd: ${d.material}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);">${d.message}</div>
      </div>
    `).join("")}}function m(){const o=document.getElementById("active-deliveries-container");if(!o)return;const d=PMCStore.getActiveDeliveries().filter(r=>r.status==="delivering");if(d.length===0){o.innerHTML="";return}let a=`
      <div class="card" style="border: 2px solid var(--primary-color); background: rgba(108, 92, 231, 0.05); margin-top: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--primary-color);">
          <span style="font-size:1.2rem;">🚚</span> Progress Pengiriman Aktif (Inbound Transit)
        </h3>
        <div style="display:flex; flex-direction:column; gap:var(--sp-3);">
    `;d.forEach(r=>{let t=0,s=0,y=[];r.items.forEach(x=>{let H=x.required||x.planned||0;t+=H;let A=0;x.scans&&x.scans.forEach(f=>{f.barcode&&PMCStore.usedBarcodes.has(f.barcode)&&A++}),s+=A,y.push(`${x.materialName||x.material} (${A}/${H})`)});let p=t-s,T=t>0&&p<=0;a+=`
        <div style="background:var(--bg-card); padding:var(--sp-3); border:1px solid var(--border-color); border-radius:var(--radius-sm);">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <div style="font-weight:700;">Pengiriman: ${r.shiftKey?r.shiftKey.toUpperCase():""} - Ke ${r.slotId||"?"} <span style="font-size:var(--fs-xs); color:var(--text-secondary); font-weight:normal;">/ ${PMCStore.formatDate(r.date)}</span></div>
            <div style="font-size:var(--fs-sm); font-weight:600; color:${T?"var(--success-color)":"var(--warning-color)"};">
              ${T?"✅ Selesai":`⏳ ${p} Pallet Belum Masuk`}
            </div>
          </div>
          <div style="font-size:var(--fs-sm); display:flex; justify-content:space-between; align-items:flex-end;">
            <div style="color:var(--text-secondary);">
              ${y.join("<br>")}
            </div>
            <div style="font-weight:700; font-size:1.1rem; color:var(--primary-color);">
              <span style="font-size:var(--fs-xs); color:var(--text-muted); font-weight:normal;">Masuk:</span> 
              ${s} / ${t}
            </div>
          </div>
          <div style="margin-top:8px; height:6px; background:var(--bg-secondary); border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${t>0?s/t*100:0}%; background: ${T?"var(--success-color)":"var(--primary-color)"}; transition:width 0.3s;"></div>
          </div>
        </div>
      `}),a+=`
        </div>
      </div>
    `,o.innerHTML=a}function l(){const o=document.getElementById("pending-returns-container");if(!o)return;const d=PMCStore.pendingReturns||[];if(d.length===0){o.innerHTML="";return}let a=`
      <div class="card" style="border: 2px solid var(--warning-color); background: rgba(253, 203, 110, 0.05); margin-top: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--warning-color);">
          🔔 Terdapat ${d.length} Antrean Verifikasi Retur dari Line
        </h3>
        <div style="background:rgba(245,158,11,0.08); border-radius:var(--radius-sm); padding:var(--sp-2) var(--sp-3); margin-bottom:var(--sp-3); font-size:var(--fs-xs); color:var(--text-secondary);">
          ℹ️ Klik "Terima" untuk menerima barang ke transit. Klik "Tolak" untuk mengembalikan ke line produksi.
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Barcode</th>
              <th>Material</th>
              <th>Asal Line</th>
              <th>Kondisi</th>
              <th>Qty (Pcs)</th>
              <th>Tujuan Blok</th>
              <th style="width: 200px; text-align: center;">Aksi Verifikasi</th>
            </tr>
          </thead>
          <tbody>
    `;d.forEach(r=>{let t='<span style="color:var(--text-muted);">Otomatis</span>';if(r.targetBlockRowId){const p=PMCStore.transitInfoCache;if(p&&p.blocks)for(const T of p.blocks){const x=(T.rows||[]).find(H=>H.id===r.targetBlockRowId);if(x){const H=x.isFlexible?' <span style="color:#7c3aed;font-weight:700;">[SLOW]</span>':"";t=`B${T.blockNumber}.${x.rowNumber}${H}`;break}}}const s=r.condition==="sisa"?'<span class="badge badge-warning" style="font-size:10px;padding:2px 8px;">⚠️ SISA</span>':'<span class="badge badge-success" style="font-size:10px;padding:2px 8px;">✅ UTUH</span>',y=r.pcs?PMCStore.formatNumber(parseFloat(r.pcs)):"-";a+=`
        <tr>
          <td style="font-size:var(--fs-xs);">${r.date} ${r.time}</td>
          <td><strong style="font-family:monospace;">${r.barcode}</strong></td>
          <td>${r.material}</td>
          <td>Line ${r.line}</td>
          <td>${s}</td>
          <td style="font-weight:700;">${y}</td>
          <td>${t}</td>
          <td style="text-align: center; display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-primary btn-sm accept-btn" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.8rem;">✅ Terima</button>
            <button class="btn btn-danger btn-sm reject-btn" data-id="${r.id}" style="padding: 4px 8px; font-size: 0.8rem;">❌ Tolak</button>
          </td>
        </tr>
      `}),a+=`
          </tbody>
        </table>
      </div>
    `,o.innerHTML=a,o.querySelectorAll(".accept-btn").forEach(r=>{r.addEventListener("click",async t=>{const s=t.target.getAttribute("data-id");if(confirm("Verifikasi terima stok retur ini ke Transit?")){const y=await PMCStore.verifyReturn(s,"accept");ToastComponent.show(y.message,y.success?"success":"danger"),S()}})}),o.querySelectorAll(".reject-btn").forEach(r=>{r.addEventListener("click",async t=>{const s=t.target.getAttribute("data-id");if(confirm("Tolak retur ini dan kembalikan stoknya ke Line?")){const y=await PMCStore.verifyReturn(s,"reject");ToastComponent.show(y.message,y.success?"success":"danger"),S()}})})}return{render:S}})();window.InboundTransitPage=Ve;const Ze=(()=>{let e=[],b=null,P="3P1",S="A";const L=[{id:"3P1",label:"Gudang Packing RNG (3P1)"},{id:"3F1",label:"Line Produksi RNG (3F1)"},{id:"3F2",label:"Produksi 3IN1 (3F2)"},{id:"3P2",label:"Gudang Packing 3IN1 (3P2)"}];function $(){if(window.location.hash!=="#/transit/outbound")return;ChartWrapper.destroyAll();const l=document.getElementById("page-content");l.innerHTML="";const o=document.createElement("div");o.className="page-enter";const d=document.createElement("div");d.className="page-header",d.innerHTML=`
      <div>
        <h2 class="page-title">📤 Pengeluaran Area Transit (Outbound Multi-Tujuan)</h2>
        <p class="page-subtitle">Scan barcode muatan dari transit untuk dikeluarkan ke tujuan Produksi / Packing</p>
      </div>
    `,o.appendChild(d);const a=document.createElement("div");a.style.display="grid",a.style.gridTemplateColumns="320px 1fr",a.style.gap="var(--sp-6)",a.style.alignItems="start";const r=document.createElement("div");r.className="card";const t=document.createElement("h3");t.style.marginBottom="var(--sp-3)",t.style.display="flex",t.style.alignItems="center",t.style.gap="8px",t.innerHTML="<span>🔍</span> Scan Barcode Keluar",r.appendChild(t);const s=document.createElement("div");s.className="form-group",s.innerHTML='<label class="form-label">Tujuan Retur / Pengeluaran</label>';const y=document.createElement("select");y.className="form-input",y.style.marginBottom="var(--sp-3)",L.forEach(M=>{y.innerHTML+=`<option value="${M.id}" ${M.id===P?"selected":""}>${M.label}</option>`});const p=document.createElement("div");p.style.display=P==="3F1"?"block":"none",p.style.marginBottom="var(--sp-3)",p.className="form-group",p.innerHTML='<label class="form-label" style="color:var(--accent-color)">Pilih Mesin / Line</label>';const T=document.createElement("select");T.className="form-input",Array.from({length:25},(M,B)=>String.fromCharCode(65+B)).forEach(M=>{T.innerHTML+=`<option value="${M}" ${M===S?"selected":""}>${M}</option>`}),y.addEventListener("change",M=>{P=M.target.value,p.style.display=P==="3F1"?"block":"none"}),T.addEventListener("change",M=>{S=M.target.value}),s.appendChild(y),p.appendChild(T);const H=document.createElement("div");H.style.cssText="background:#000;border-radius:var(--radius-md);height:120px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-4);",H.innerHTML=`
      <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
      <div style="color:rgba(255,255,255,0.3);font-size:2.5rem;">[|||]</div>
    `;const A=document.createElement("div");A.className="form-group";const f=document.createElement("label");f.className="form-label",f.textContent="No Barcode Transit (Scan)";const E=document.createElement("input");E.type="text",E.className="form-input",E.placeholder="Scan barcode disini...",E.autocomplete="off",E.style.flex="1";const g=CameraScanner.createScanButton(E),h=document.createElement("div");h.style.cssText="display:flex; gap:8px; align-items:stretch;",h.appendChild(E),h.appendChild(g);const i=document.createElement("label");i.className="form-label",i.style.marginTop="var(--sp-3)",i.textContent="Nama Material",b=document.createElement("input"),b.type="text",b.className="form-input",b.readOnly=!0,b.style.backgroundColor="var(--bg-secondary)";const n=document.createElement("label");n.className="form-label",n.style.marginTop="var(--sp-3)",n.style.color="var(--warning-color)",n.textContent="Diambil Dari Blok";const k=document.createElement("div");k.className="form-input",k.style.backgroundColor="rgba(253, 203, 110, 0.05)",k.style.border="1px dashed rgba(253, 203, 110, 0.4)",k.style.display="flex",k.style.alignItems="center",k.style.minHeight="50px",k.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>';const C=document.createElement("button");C.className="btn btn-primary",C.style.width="100%",C.style.marginTop="var(--sp-4)",C.textContent="Proses Pengeluaran",E.addEventListener("input",M=>{const B=M.target.value.trim();if(B.length>=5){const j=PMCStore.transitInventory.find(O=>O.barcode===B);j?(b.value=j.material,j.blockId&&j.rowId?k.innerHTML=`<span class="badge badge-warning" style="font-size:1.4rem; padding:var(--sp-2); font-weight:800; width:100%; text-align:center;">📍 B${j.blockId}.${j.rowId}</span>`:k.innerHTML='<span class="badge badge-secondary" style="font-size:1.1rem; padding:var(--sp-2); width:100%; text-align:center;">⚠️ Blok Tidak Diketahui</span>'):(b.value="",k.innerHTML='<span class="badge badge-danger">❌ Barcode tidak ada di Transit</span>')}else b.value="",k.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>'});const u=async()=>{const M=E.value.trim(),B=b.value.trim();if(M&&B){C.disabled=!0,C.textContent="Memproses...";const j=await PMCStore.requestTransitOutbound(M,P,P==="3F1"?S:null),O=new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});e.unshift({time:O,barcode:M,material:B,destination:P,success:j.success,message:j.message}),e.length>50&&e.pop(),j.success?ToastComponent.show(j.message,"success"):ToastComponent.show(j.message,"danger"),E.value="",b.value="",k.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan...</span>',E.focus(),C.disabled=!1,C.textContent="Proses Pengeluaran",m()}else ToastComponent.show("Scan barcode terlebih dahulu","warning")};E.addEventListener("keydown",M=>{M.key==="Enter"&&u()}),C.addEventListener("click",u),A.appendChild(s),A.appendChild(p),A.appendChild(H),A.appendChild(f),A.appendChild(h),A.appendChild(i),A.appendChild(b),A.appendChild(n),A.appendChild(k),A.appendChild(C),r.appendChild(A),a.appendChild(r);const v=document.createElement("div");v.className="card",v.style.minHeight="600px",v.style.display="flex",v.style.flexDirection="column",v.innerHTML='<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📜 Log Pengeluaran Transit</h3>';const D=document.createElement("div");D.id="scan-logs-container",D.style.flex="1",D.style.display="flex",D.style.flexDirection="column",D.style.gap="var(--sp-2)",D.style.overflowY="auto",v.appendChild(D),a.appendChild(v),o.appendChild(a),l.appendChild(o),m(),setTimeout(()=>{E&&E.focus()},100),TopbarComponent.render("/transit/outbound")}function m(){const l=document.getElementById("scan-logs-container");if(l){if(e.length===0){l.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas scan keluar pada sesi ini.</div>';return}l.innerHTML=e.map(o=>`
      <div style="background:var(--bg-secondary);padding:var(--sp-2) var(--sp-3);border-left:4px solid ${o.success?"var(--primary-color)":"var(--danger-color)"};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${o.time}</span>
          <span style="font-weight:600;color:${o.success?"var(--primary-color)":"var(--danger-color)"}">${o.success?"✅ TERKIRIM":"❌ GAGAL"}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:600;font-size:var(--fs-sm);">${o.barcode} <span style="font-weight:normal;color:var(--text-secondary)">— ${o.material}</span></div>
            <span class="badge badge-accent" style="font-size:0.6rem">Ke: ${o.destination}</span>
        </div>
        <div style="font-size:var(--fs-xs);color:var(--success-color);">${o.message}</div>
      </div>
    `).join("")}}return{render:$}})();window.TransitOutboundPage=Ze;const et=(()=>{let e="",b="",P="",S="",L="",$="",m=new Set;function l(){var h;if(window.location.hash!=="#/transit/stock-on-hand")return;ChartWrapper.destroyAll();const o=document.getElementById("page-content");let d=document.getElementById("stock-on-hand-page");const a=!d;a&&(d=document.createElement("div"),d.id="stock-on-hand-page",d.className="page-content",o.replaceChildren(d));const r=Array.isArray(PMCStore.transitInventory)?PMCStore.transitInventory:[],t=PMCStore.getBlockLayout(),s={},y={};r.forEach(i=>{const n=i.material||i.materialName;if(!n)return;s[n]=(s[n]||0)+(i.palletsAvailable||0);const k=PMCStore.getPalletQty(n)||1,C=i.pcs!==void 0&&i.pcs!==null&&parseFloat(i.pcs)>0?parseFloat(i.pcs):(i.palletsAvailable||0)*k;y[n]=(y[n]||0)+C});const p=s,T=Object.keys(p).length;let x=0;for(const i in p)x+=p[i];const H=r.map(i=>{let n="-";const k=t.find(C=>C.id===i.blockId||i.rowId&&C.rows.some(u=>u.id===i.rowId));if(k){const C=k.rows.find(u=>u.id===i.rowId);C&&(n=`B${k.blockNumber!==void 0?k.blockNumber:k.id}.${C.rowNumber!==void 0?C.rowNumber:C.id}`)}return{...i,_blockText:n}}),A=H.filter(i=>{const n=(i.barcode||"").toLowerCase(),k=(i.mid||"").toLowerCase(),C=i.material||"",u=i.supplier||"";return n.includes(e.toLowerCase())&&k.includes(b.toLowerCase())&&(P===""||C===P)&&(S===""||u===S)&&(L===""||i._blockText===L)&&($===""||i.dateInTransit===$)});if(a){TopbarComponent.render("/transit/stock-on-hand");const i=document.createElement("div");i.className="page-header",i.innerHTML=`
        <div>
          <h2 class="page-title">📦 Stock On Hand (Area Transit)</h2>
          <p class="page-subtitle">Pantau & kelola stok material yang tersedia di area transit secara FIFO.</p>
        </div>
        <button id="btn-delete-all-transit" class="btn btn-danger" style="gap:6px;">
          <span>🗑️</span> Hapus Semua Stok Transit
        </button>
      `,d.appendChild(i);const n=document.createElement("div");n.className="dashboard-grid",n.id="transit-stats-row",d.appendChild(n);const k=document.createElement("div");k.className="section",k.id="transit-summary-section",k.style.marginTop="var(--sp-6)",d.appendChild(k);const C=document.createElement("div");C.className="section",C.id="transit-table-section",C.style.marginTop="var(--sp-6)",d.appendChild(C)}const f=document.getElementById("transit-stats-row");f&&f.replaceChildren(StatCardComponent.create({label:"Total Batch Aktif",value:r.length,icon:"🏷️",color:"rgba(108,92,231,0.12)",noAnim:!a}),StatCardComponent.create({label:"Material Tersedia",value:T,icon:"📦",color:"rgba(0,184,148,0.12)",noAnim:!a}),StatCardComponent.create({label:"Total Pallet (Transit)",value:x,icon:"📋",color:"rgba(253,203,110,0.12)",noAnim:!a}));const E=document.getElementById("transit-summary-section");E&&(T===0?E.innerHTML="":E.innerHTML=`
          <h3 style="margin-bottom:var(--sp-4); color:var(--text-primary); font-size:var(--fs-md); display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">📊</span> Summary per Material
          </h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:var(--sp-4);">
            ${Object.keys(p).sort().map(i=>{const n=p[i],k=y[i]||0,C=PMCStore.getMaterialUOM(i);return`
                <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:var(--sp-4); box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                  <div style="font-weight:700; color:var(--primary-color); font-size:var(--fs-base); margin-bottom:8px;">${i}</div>
                  <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm); margin-bottom:4px;">
                    <span style="color:var(--text-secondary);">Total Stok:</span>
                    <span style="font-weight:700; color:var(--text-primary);">${PMCStore.formatNumber(k)} <span style="color:var(--text-muted); font-weight:400; font-size:10px;">${C}</span></span>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:var(--fs-sm);">
                    <span style="color:var(--text-secondary);">Jumlah Pallet:</span>
                    <span style="font-weight:700; color:var(--text-primary);">${n} <span style="color:var(--text-muted); font-weight:400; font-size:10px;">plt</span></span>
                  </div>
                </div>`}).join("")}
          </div>
        `);const g=document.getElementById("transit-table-section");if(g)if(r.length===0)g.innerHTML='<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Area transit saat ini kosong. Belum ada stok material yang tersedia.</div></div>';else{const i=[...new Set(H.map(M=>M.material).filter(Boolean))].sort(),n=[...new Set(H.map(M=>M.supplier).filter(Boolean).filter(M=>M!=="-"))].sort(),k=[...new Set(H.map(M=>M._blockText).filter(Boolean).filter(M=>M!=="-"))].sort((M,B)=>M.localeCompare(B,void 0,{numeric:!0})),C=[...new Set(H.map(M=>M.dateInTransit).filter(Boolean))].sort((M,B)=>B.localeCompare(M)),u=i.map(M=>`<option value="${M}" ${P===M?"selected":""}>${M}</option>`).join(""),v=n.map(M=>`<option value="${M}" ${S===M?"selected":""}>${M}</option>`).join(""),D=k.map(M=>`<option value="${M}" ${L===M?"selected":""}>${M}</option>`).join("");g.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4);">
            <h3 style="margin:0; font-size:var(--fs-md); color:var(--text-primary);">📋 Detail Inventori Transit (FIFO)</h3>
            <div>
              <button id="btn-delete-selected-transit" class="btn btn-danger btn-sm" style="display:${m.size>0?"inline-block":"none"}; transition:all 0.2s;">
                <span style="margin-right:4px;">🗑️</span> Hapus Terpilih (<span id="transit-delete-count">${m.size}</span>)
              </button>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40px; text-align:center;"><input type="checkbox" id="chk-transit-all" ${A.length>0&&A.every(M=>m.has(M.id))?"checked":""} style="cursor:pointer; accent-color:var(--primary-color);" /></th>
                <th>No Barcode</th>
                <th>No MID</th>
                <th>Tgl FIFO (Gudang)</th>
                <th>Tgl Masuk Transit</th>
                <th>Blok</th>
                <th>Material</th>
                <th>Supplier</th>
                <th style="text-align:right">Sisa Qty</th>
                <th style="text-align:center">Aksi</th>
              </tr>
              <tr style="background:rgba(108,92,231,0.05);">
                <th></th>
                <th><input type="text" id="flt-tr-barcode" value="${e}" placeholder="Cari barcode..." class="form-control" style="padding:4px;font-size:11px;height:24px;width:100%;"></th>
                <th><input type="text" id="flt-tr-mid" value="${b}" placeholder="Cari MID..." class="form-control" style="padding:4px;font-size:11px;height:24px;width:100%;"></th>
                <th></th>
                <th>
                  <select id="flt-tr-date" class="form-control" style="padding:4px;font-size:11px;height:28px;width:100%;cursor:pointer;">
                    <option value="">Semua Tgl</option>
                    ${C.map(M=>`<option value="${M}" ${$===M?"selected":""}>${PMCStore.formatDate(M)}</option>`).join("")}
                  </select>
                </th>
                <th>
                  <select id="flt-tr-blok" class="form-control" style="padding:4px;font-size:11px;height:28px;width:100%;cursor:pointer;">
                    <option value="">Semua Blok</option>
                    ${D}
                  </select>
                </th>
                <th>
                  <select id="flt-tr-mat" class="form-control" style="padding:4px;font-size:11px;height:28px;width:100%;cursor:pointer;">
                    <option value="">Semua Material</option>
                    ${u}
                  </select>
                </th>
                <th>
                  <select id="flt-tr-sup" class="form-control" style="padding:4px;font-size:11px;height:28px;width:100%;cursor:pointer;">
                    <option value="">Semua Supplier</option>
                    ${v}
                  </select>
                </th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody id="transit-table-body">
              ${A.length===0?'<tr><td colspan="9" style="text-align:center;padding:var(--sp-4);color:var(--text-secondary);">Data tidak ditemukan dengan filter yang dipilih.</td></tr>':""}
              ${A.map(M=>{const B=m.has(M.id),j=M.dateInGudang&&M.dateInGudang!=="-"?PMCStore.formatDate(M.dateInGudang):"-",O=M.dateInTransit?`${PMCStore.formatDate(M.dateInTransit)} <span style="font-size:var(--fs-xs);color:var(--text-muted);">${PMCStore.formatTime(M.timeInTransit)}</span>`:"-",q=PMCStore.getPalletQty(M.material)||1,G=M.pcs!==void 0&&M.pcs!==null&&parseFloat(M.pcs)>0?parseFloat(M.pcs):(M.palletsAvailable||0)*q,J=PMCStore.getMaterialUOM(M.material);return`
                  <tr>
                    <td style="text-align:center;"><input type="checkbox" class="chk-transit-row" data-id="${M.id}" ${B?"checked":""} style="cursor:pointer;accent-color:var(--primary-color);" /></td>
                    <td><span style="font-family:monospace;font-size:var(--fs-base);font-weight:700;background:rgba(108,92,231,0.10);padding:2px 8px;border-radius:4px;color:var(--primary-color);">${M.barcode||"-"}</span></td>
                    <td><span style="font-family:monospace;font-size:var(--fs-sm)">${M.mid||"-"}</span></td>
                    <td>${j}</td>
                    <td>${O}</td>
                    <td><span class="badge badge-primary" style="font-size:11px;">📍 ${M._blockText}</span></td>
                    <td><strong style="font-size:var(--fs-base);">${M.material}</strong></td>
                    <td><span style="font-size:var(--fs-sm);">${M.supplier||"-"}</span></td>
                    <td style="text-align:right">
                      <span class="badge ${G>0?"badge-primary":"badge-danger"}">${PMCStore.formatNumber(G)} ${J}</span>
                      <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${M.palletsAvailable||0} Plt</div>
                    </td>
                    <td style="text-align:center">
                      <button class="btn btn-secondary btn-sm" data-bc="${M.barcode||""}" data-mid="${M.mid||""}" data-qty="${G||""}" data-mat="${M.material||""}" data-date="${M.dateInGudang||M.dateInTransit||""}" onclick="if(window.BarcodePrinter) { window.BarcodePrinter.showModal({barcode: this.dataset.bc, mid: this.dataset.mid, qty: this.dataset.qty, materialName: this.dataset.mat, dateIn: this.dataset.date}); } else { alert('BarcodePrinter not loaded'); }">Print</button>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        `}(h=document.getElementById("btn-delete-all-transit"))==null||h.addEventListener("click",()=>{const i=(PMCStore.transitInventory||[]).length;if(i===0){ToastComponent.show("Tidak ada stok di Transit untuk dihapus","info");return}if(confirm(`Yakin ingin menghapus SEMUA ${i} batch stok di Area Transit? Tindakan ini tidak bisa dibatalkan!`)){const n=PMCStore.deleteAllTransitInventory();ToastComponent.show(n.message,n.success?"success":"error")}}),r.length>0&&setTimeout(()=>{document.querySelectorAll(".action-print-btn").forEach(M=>{M.addEventListener("click",B=>{window.BarcodePrinter&&window.BarcodePrinter.showModal({barcode:B.target.dataset.bc,mid:B.target.dataset.mid,qty:B.target.dataset.qty,materialName:B.target.dataset.mat,dateIn:B.target.dataset.date})})});const i=(M,B)=>{const j=document.getElementById(M);j&&(j.addEventListener("input",O=>{const q=O.target.selectionStart,G=O.target.selectionEnd;B(O.target.value),l(),setTimeout(()=>{const J=document.getElementById(M);J&&(J.focus(),J.setSelectionRange(q,G))},10)}),j.addEventListener("keydown",O=>{O.key==="Enter"&&(O.preventDefault(),l())}))},n=(M,B)=>{const j=document.getElementById(M);j&&j.addEventListener("change",O=>{B(O.target.value),l()})};i("flt-tr-barcode",M=>e=M),i("flt-tr-mid",M=>b=M),n("flt-tr-blok",M=>L=M),n("flt-tr-mat",M=>P=M),n("flt-tr-sup",M=>S=M),n("flt-tr-date",M=>$=M);const k=document.getElementById("chk-transit-all"),C=document.querySelectorAll(".chk-transit-row"),u=document.getElementById("btn-delete-selected-transit"),v=document.getElementById("transit-delete-count"),D=()=>{u&&v&&(u.style.display=m.size>0?"inline-block":"none",v.textContent=m.size)};k&&k.addEventListener("change",M=>{C.forEach(B=>{B.checked=M.target.checked,M.target.checked?m.add(B.getAttribute("data-id")):m.delete(B.getAttribute("data-id"))}),D()}),C.forEach(M=>{M.addEventListener("change",B=>{const j=B.target.getAttribute("data-id");if(B.target.checked?m.add(j):m.delete(j),k){let O=0;C.forEach(q=>{q.checked&&O++}),k.checked=O===C.length&&C.length>0}D()})}),D(),u&&u.addEventListener("click",()=>{confirm(`Yakin ingin menghapus ${m.size} batch stok yang dipilih dari Transit?`)&&(Array.from(m).forEach(M=>PMCStore.deleteTransitInventoryItem(M)),m.clear(),ToastComponent.show("Batch terpilih berhasil dihapus dari Transit","success"))})},50)}return PMCStore.on("transitChanged",()=>{window.location.hash==="#/transit/stock-on-hand"&&l()}),{render:l}})();window.StockOnHandTransitPage=et;const tt=(()=>{let e=!1;async function b(){if(!window.location.hash.startsWith("#/transit/info")||e)return;e=!0,ChartWrapper.destroyAll();const P=document.getElementById("page-content");P.innerHTML=`
      <div style="display:flex; align-items:center; justify-content:center; height:400px; color:var(--text-muted); flex-direction:column; gap:var(--sp-4);">
        <div class="spinner"></div>
        <p style="font-size:1.1rem; font-weight:500; letter-spacing:1px;">🗺️ Menginisialisasi Sensor Grid Transit...</p>
      </div>
    `,PMCStore.getLogicalDateStr();try{await PMCStore.loadTransitInfoFromAPI(),await PMCStore.loadActiveDeliveriesFromAPI(),(!PMCStore.schedules||PMCStore.schedules.length===0)&&await PMCStore.loadSchedulesFromAPI(),(!PMCStore.bomData||PMCStore.bomData.length===0)&&await PMCStore.loadMasterDataFromAPI();let S=PMCStore.getLogicalDateStr();if(PMCStore.schedules&&PMCStore.schedules.length>0){const y=[...new Set(PMCStore.schedules.map(p=>p.date))].sort();y.length>0&&!y.includes(S)&&(S=y[0])}const L=await PMCStore.getLineMaterialRequirements(S),$=await PMCStore.getTransitInfo(),m=PMCStore.getTransitStockPerLine();P.innerHTML="";const l=document.createElement("div");l.className="page-enter";const o=document.createElement("div");o.className="page-header",o.style.marginBottom="2rem",o.style.paddingBottom="1.5rem",o.style.borderBottom="1px solid rgba(255,255,255,0.05)",o.innerHTML=`
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <h2 class="page-title" style="font-size: 2rem; background: linear-gradient(90deg, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; letter-spacing: -0.5px;">
            <span style="-webkit-text-fill-color: initial;">📊</span> MONITOR DISTRIBUSI TRANSIT
          </h2>
          <p class="page-subtitle" style="font-size:1.05rem; color:var(--text-muted);">
            Ketersediaan Stok Aktual VS Buffer Pengiriman (Level Jam)
          </p>
        </div>
      `,l.appendChild(o);const d=document.createElement("div");d.className="section",d.style.marginBottom="3rem",d.innerHTML=`
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
          <div style="width:4px; height:24px; background:var(--danger-color); border-radius:4px; box-shadow:0 0 10px var(--danger-color);"></div>
          <h3 class="section-title" style="margin:0; font-size:1.3rem;">Status Prioritas Panggil (Request)</h3>
        </div>
      `;const a=await PMCStore.getPriorityAlerts(S);if(a.length>0){const y=document.createElement("div");y.className="priority-grid",a.forEach(p=>{const T=p.status==="KRITIS",x=document.createElement("div");x.className=`priority-card ${T?"priority-card--kritis":"priority-card--warning"}`,x.innerHTML=`
            <div class="priority-status ${T?"priority-status--kritis":"priority-status--warning"}">
              ${T?"🔴":"🟡"} STATUS: ${p.status}
            </div>
            <div class="priority-material">
              ${p.material}
              <span class="priority-block-badge">📍 ${p.blockLabel}</span>
            </div>
            <div class="priority-details">
              <div>Stok: <strong>${PMCStore.formatNumber(p.actual)} Pcs</strong></div>
              ${p.incoming>0?`<div style="color:#00d2ff">OTW: <strong>${PMCStore.formatNumber(p.incoming)}</strong></div>`:""}
            </div>
            <div class="priority-footer">
              Kirim: <strong>${p.bufferPallets} Palet</strong> (@ ${PMCStore.formatNumber(p.palletQty)} pcs)
            </div>
          `,y.appendChild(x)}),d.appendChild(y)}else{const y=document.createElement("div");y.className="priority-grid",y.innerHTML=`
          <div class="priority-card priority-card--safe">
            <div style="font-size:1.8rem; margin-bottom:var(--sp-2);">✅</div>
            <div style="font-weight:700; font-size:var(--fs-base); color:#00e0a3;">Stok Buffer Aman Terkendali</div>
            <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:4px;">Tidak ada request prioritas yang memerlukan pengiriman segera saat ini.</div>
          </div>
        `,d.appendChild(y)}l.appendChild(d);const r=document.createElement("div");r.className="section",r.innerHTML=`
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
          <div style="width:4px; height:24px; background:var(--primary-color); border-radius:4px; box-shadow:0 0 10px rgba(99, 102, 241, 0.5);"></div>
          <h3 class="section-title" style="margin:0; font-size:1.3rem;">🗺️ Pemetaan Stok Aktual per Blok</h3>
        </div>
      `;const t=document.createElement("div");t.style.display="grid",t.style.gridTemplateColumns="repeat(auto-fill, minmax(340px, 1fr))",t.style.gap="2rem",$.blocks.forEach(y=>{if(!y.rows.some(A=>A.material&&A.material.trim()!==""))return;const T=document.createElement("div");T.style.background="rgba(20, 25, 35, 0.4)",T.style.border="1px solid rgba(255, 255, 255, 0.05)",T.style.borderRadius="16px",T.style.padding="1.5rem",T.style.boxShadow="0 10px 30px rgba(0,0,0,0.2)",T.style.backdropFilter="blur(10px)",T.style.position="relative";const x=document.createElement("div");x.style.position="absolute",x.style.top="-2px",x.style.right="1.5rem",x.style.width="30px",x.style.height="4px",x.style.background="rgba(99, 102, 241, 0.6)",x.style.borderRadius="4px",x.style.boxShadow="0 2px 10px rgba(99, 102, 241, 0.5)",T.appendChild(x);let H=`
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="display:inline-flex; width:24px; height:24px; background:var(--primary-color); color:white; align-items:center; justify-content:center; border-radius:6px; font-weight:800; font-size:0.9rem;  box-shadow:0 2px 8px rgba(99, 102, 241, 0.4);">B</span>
              <h4 style="margin:0; font-size:1.2rem; font-weight:700; color:var(--text-main); letter-spacing:0.5px;">Blok ${y.blockNumber||y.id}</h4>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted); background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:100px; font-weight:600;">Area Aktif</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
        `;y.rows.forEach(A=>{if(!A.material||A.material.trim()==="")return;const f=A.maxPallets>0?A.qty/A.maxPallets*100:0,E=`B.${y.blockNumber||y.id}.${A.rowNumber||A.id}`;if(A.qty===0){const g=A.isFlexible?"rgba(124, 58, 237, 0.4)":"var(--text-muted)",h=A.isFlexible?"📦 Slow Moving":`${A.material} (Kosong)`;H+=`
              <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.02); opacity:0.6;">
                <span style="width:40px; font-size:0.75rem; color:${g}; font-weight:600;">${E}</span>
                <span style="flex:1; font-size:0.85rem; color:${g}; font-style:italic;">${h}</span>
                <span style="font-size:0.75rem; color:var(--text-muted); font-variant-numeric:tabular-nums;">0 / ${A.maxPallets}</span>
              </div>
            `}else{let g=f>80?"16, 185, 129":f>40?"245, 158, 11":"99, 102, 241",h=f>80?"var(--success-color)":f>40?"var(--warning-color)":"var(--primary-color)";A.isFlexible&&(g="124, 58, 237",h="#7c3aed");const i=A.material==="MIXED STOCK"?"📦 MIXED STOCK":A.material;H+=`
              <div style="position:relative; display:flex; align-items:center; gap:12px; padding:8px 12px; border-radius:6px; background:rgba(255,255,255,0.02); overflow:hidden; border:1px solid rgba(${g}, 0.1);">
                <!-- Ambient Ambient Fill (sebagai pengganti bar kaku) -->
                <div style="position:absolute; top:0; left:0; height:100%; width:${f}%; background:linear-gradient(90deg, rgba(${g},0.15) 0%, rgba(${g},0) 100%); z-index:0; border-left:3px solid ${h};"></div>
                
                <!-- Konten Teks Rak -->
                <div style="position:relative; z-index:1; width:40px; font-size:0.8rem; color:${h}; font-weight:800; text-shadow:0 0 10px rgba(${g}, 0.5);">${E}</div>
                <div style="position:relative; z-index:1; flex:1; font-size:0.95rem; font-weight:600; color:#e0e7ff; letter-spacing:0.5px; text-shadow:0 0 5px rgba(224, 231, 255, 0.3); opacity:0.9;">${i}</div>
                <div style="position:relative; z-index:1; display:flex; align-items:baseline; gap:4px;">
                  <span style="font-size:1.15rem; font-weight:800; color:${h}; text-shadow:0 0 8px rgba(${g}, 0.6); font-variant-numeric: tabular-nums;">${A.qty}</span>
                  <span style="font-size:0.75rem; color:rgba(255,255,255,0.4);">/ ${A.maxPallets}</span>
                </div>
              </div>
            `}}),T.innerHTML=H+"</div>",t.appendChild(T)}),r.appendChild(t),window.self!==window.top||l.appendChild(r),P.appendChild(l),TopbarComponent.render("/transit/info")}catch(S){console.error("Live distribution render error:",S),P.innerHTML=`
        <div style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); border-radius:12px; padding:2rem; text-align:center; color:white; max-width:600px; margin:40px auto;">
          <div style="font-size:3rem; margin-bottom:1rem;">⚠️</div>
          <h3 style="font-size:1.5rem; color:var(--danger-color); margin-bottom:1rem;">Gagal Memuat Navigasi Transit</h3>
          <p style="color:var(--text-muted); font-size:1rem; margin-bottom:2rem;">Koneksi sensor terputus. Silakan hubungi tim Admin atau coba refresh modul ini.</p>
          <div style="font-family:monospace; background:rgba(0,0,0,0.3); padding:1rem; border-radius:8px; color:rgba(255,255,255,0.5); font-size:0.85rem; text-align:left;">
            [Log] ${S.message}
          </div>
        </div>
      `}finally{e=!1}}return PMCStore.on("transitChanged",b),PMCStore.on("stockChanged",b),PMCStore.on("deliveryChanged",b),{render:b}})();window.LiveDistributionPage=tt;const at=(()=>{let e={startDate:"",endDate:"",material:"ALL",line:"ALL",sku:"ALL",block:"ALL",row:"ALL"};const b=new Set;async function P(){if(window.location.hash!=="#/transit/mutation")return;ChartWrapper.destroyAll();const S=document.getElementById("page-content");S.innerHTML="";const L=document.createElement("div");L.className="page-enter";try{let k=function(){var B;if(typeof XLSX>"u"){ToastComponent.show("Library Excel belum dimuat!","error");return}const u=e.startDate||e.endDate?`${e.startDate||"Awal"} s/d ${e.endDate||"Akhir"}`:"Semua Waktu",v=[["Laporan Mutasi Stok Area Transit"],["Filter Tanggal:",u],["Filter Material:",e.material],["Filter Line:",e.line],["Filter SKU:",e.sku],["Filter Blok:",e.block!=="ALL"?`Blok ${((B=(PMCStore.transitInfoCache.blocks||[]).find(j=>j.id===e.block))==null?void 0:B.blockNumber)||""}`:"Semua Blok"],[],["Material / Produk","UOM","Saldo Awal","Masuk (Gudang)","Retur (Line)","Pengeluaran (OUT)","Penyesuaian (ADJ)","Saldo Akhir","Stok Aktual","Selisih"]];h.forEach(j=>{v.push([j.material,j.uom,j.initial,j.inboundWarehouse,j.inboundReturn,j.outbound,j.adjust,j.final,j.actualStock!==null?j.actualStock:"-",j.selisih!==null?j.selisih:0])});const D=XLSX.utils.aoa_to_sheet(v),M=XLSX.utils.book_new();XLSX.utils.book_append_sheet(M,D,"Mutasi Stok"),XLSX.writeFile(M,"Laporan_Mutasi_Stok.xlsx"),ToastComponent.show("Berhasil diekspor ke Excel","success")},C=function(){var O;if(!window.jspdf||!window.jspdf.jsPDF){ToastComponent.show("Library PDF belum dimuat. Mengunduh...","warning");return}const{jsPDF:u}=window.jspdf,v=new u("l","mm","a4");v.setFontSize(16),v.text("Laporan Mutasi Stok Area Transit",14,20);const D=e.startDate||e.endDate?`${e.startDate||"Awal"} s/d ${e.endDate||"Akhir"}`:"Semua Waktu";v.setFontSize(10),v.text(`Filter Tanggal: ${D}`,14,30),v.text(`Filter Material: ${e.material}`,14,36),v.text(`Filter Line: ${e.line} | Filter SKU: ${e.sku}`,14,42);const M=e.block!=="ALL"?`Blok ${((O=(PMCStore.transitInfoCache.blocks||[]).find(q=>q.id===e.block))==null?void 0:O.blockNumber)||""}`:"Semua Blok";v.text(`Filter Blok: ${M}`,14,48);const B=["Material / Produk","UOM","Awal","Msk Gdg","Retur","Out","ADJ","Book","Act","Sel"],j=[];h.forEach(q=>{j.push([q.material,q.uom,q.initial.toString(),q.inboundWarehouse.toString(),q.inboundReturn.toString(),q.outbound.toString(),q.adjust.toString(),q.final.toString(),q.actualStock!==null?q.actualStock.toString():"-",q.selisih!==null?q.selisih.toString():"0"])}),v.autoTable({head:[B],body:j,startY:55,theme:"grid",headStyles:{fillColor:[108,92,231]},styles:{fontSize:7},columnStyles:{0:{cellWidth:40},9:{fontStyle:"bold"}},didParseCell:function(q){q.column.index===9&&q.cell.text[0]!=="0"&&(q.cell.styles.textColor=[231,76,60])}}),v.save("Laporan_Mutasi_Stok.pdf"),ToastComponent.show("Berhasil diekspor ke PDF","success")};const $=document.createElement("div");$.className="page-header",$.innerHTML=`
        <div>
          <h2 class="page-title">📝 Mutasi Stok Area Transit</h2>
          <p class="page-subtitle">Laporan riwayat pergerakan stok beserta Saldo Awal, Inbound, Outbound, dan Saldo Akhir.</p>
        </div>
        <div style="display:flex; gap: 8px;">
          <button id="btn-export-excel" class="btn btn-success">⬇️ Export Excel</button>
          <button id="btn-export-pdf" class="btn btn-danger">⬇️ Export PDF</button>
        </div>
      `,L.appendChild($),await PMCStore.loadStockMutationsFromAPI(e);const m=document.createElement("div");m.className="section",m.style.display="flex",m.style.gap="var(--sp-4)",m.style.flexWrap="wrap",m.style.alignItems="end";const l=new Map;PMCStore.bomData&&PMCStore.bomData.forEach(u=>{if(u.skuId){const v=PMCStore.getSKU(u.skuId);l.set(u.skuId,v?v.name:u.skuId)}}),PMCStore.lineStock&&Object.keys(PMCStore.lineStock).forEach(u=>b.add(u)),PMCStore.linePerSku&&PMCStore.linePerSku.forEach(u=>{u.line&&b.add(u.line)}),["A","B","C","D","E","Produksi"].forEach(u=>b.add(u));const o=["ALL","Gudang -> Transit","Transit -> Gudang",...Array.from(b).sort(),"Koreksi Saldo Awal","Stock Check Adjustment","BPP Adjustment"],d=Array.from(l.entries()).sort((u,v)=>u[1].localeCompare(v[1])).map(([u,v])=>({id:u,name:v})),a=document.createElement("div");a.className="form-group",a.style.flex="1",a.style.minWidth="150px",a.innerHTML=`<label class="form-label">Dari Tanggal</label><input type="date" id="filter-date-start" class="form-control" value="${e.startDate}">`;const r=document.createElement("div");r.className="form-group",r.style.flex="1",r.style.minWidth="150px",r.innerHTML=`<label class="form-label">Sampai Tanggal</label><input type="date" id="filter-date-end" class="form-control" value="${e.endDate}">`;const t=document.createElement("div");t.className="form-group",t.style.flex="1",t.style.minWidth="180px";let s='<option value="ALL">Semua Material</option>';const y=new Set;PMCStore.bomData.forEach(u=>u.components.forEach(v=>y.add(v.name))),Array.from(y).sort().forEach(u=>{s+=`<option value="${u}" ${e.material===u?"selected":""}>${u}</option>`}),t.innerHTML=`<label class="form-label">Material</label><select id="filter-mat" class="form-control">${s}</select>`;const p=document.createElement("div");p.className="form-group",p.style.flex="1",p.style.minWidth="150px";let T="";o.forEach(u=>{T+=`<option value="${u}" ${e.line===u?"selected":""}>${u==="ALL"?"Semua Line/Sumber":u}</option>`}),p.innerHTML=`<label class="form-label">Line / Sumber</label><select id="filter-line" class="form-control">${T}</select>`;const x=document.createElement("div");x.className="form-group",x.style.flex="1",x.style.minWidth="150px";let H=`<option value="ALL" ${e.sku==="ALL"?"selected":""}>Semua SKU</option>`;d.forEach(u=>{H+=`<option value="${u.id}" ${e.sku===u.id?"selected":""}>${u.name}</option>`}),x.innerHTML=`<label class="form-label">SKU</label><select id="filter-sku" class="form-control">${H}</select>`;const A=document.createElement("div");A.className="form-group",A.style.flex="1",A.style.minWidth="150px";let f='<option value="ALL">Semua Blok</option>';(!PMCStore.transitInfoCache.blocks||PMCStore.transitInfoCache.blocks.length===0)&&await PMCStore.loadTransitInfoFromAPI(),(PMCStore.transitInfoCache.blocks||[]).forEach(u=>{f+=`<option value="${u.id}" ${e.block===u.id?"selected":""}>Blok ${u.blockNumber}</option>`}),A.innerHTML=`<label class="form-label">Blok</label><select id="filter-block" class="form-control">${f}</select>`;const E=document.createElement("div");E.className="form-group",E.style.flex="1",E.style.minWidth="150px";let g='<option value="ALL">Semua Baris</option>';if(e.block!=="ALL"){const u=(PMCStore.transitInfoCache.blocks||[]).find(v=>v.id===e.block);u&&u.rows&&u.rows.forEach(v=>{const D=`B.${u.blockNumber}.${v.rowNumber}`;g+=`<option value="${v.id}" ${e.row===v.id?"selected":""}>${D}</option>`})}E.innerHTML=`<label class="form-label">Baris</label><select id="filter-row" class="form-control" ${e.block==="ALL"?"disabled":""}>${g}</select>`,m.appendChild(a),m.appendChild(r),m.appendChild(t),m.appendChild(p),m.appendChild(x),m.appendChild(A),m.appendChild(E),L.appendChild(m),setTimeout(()=>{["date-start","date-end","mat","line","sku","block","row"].forEach(D=>{const M=document.getElementById(`filter-${D}`);M&&M.addEventListener("change",B=>{D==="date-start"?e.startDate=B.target.value:D==="date-end"?e.endDate=B.target.value:D==="block"?(e.block=B.target.value,e.row="ALL"):e[D==="mat"?"material":D]=B.target.value,P()})});const u=document.getElementById("btn-export-excel");u&&u.addEventListener("click",k);const v=document.getElementById("btn-export-pdf");v&&v.addEventListener("click",C)},0);const{reportList:h,summary:i}=PMCStore.getMutationReport(e),n=document.createElement("div");if(n.className="section",n.style.overflowX="auto",h.length===0)n.innerHTML='<div class="empty-state">Belum ada data mutasi yang sesuai dengan filter.</div>';else{const u=O=>typeof O=="number"?O.toLocaleString("id-ID"):O,v=h.filter(O=>O.selisih!==null&&Math.abs(O.selisih)>1e-4).length;if(v>0){const O=document.createElement("div");O.className="alert alert-warning",O.style.marginBottom="var(--sp-4)",O.innerHTML=`⚠️ Terdeteksi <strong>${v} item</strong> dengan selisih antara Saldo Akhir dan Stok Aktual.`,n.appendChild(O)}const D=`
        <style>
          .table-premium {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: rgba(16, 25, 45, 0.4);
            backdrop-filter: blur(12px);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(0, 195, 255, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            margin-top: 10px;
          }
          .table-premium thead th {
            background: rgba(0, 195, 255, 0.08);
            color: #00c3ff;
            font-weight: 600;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            font-size: 0.7rem;
            padding: 12px 14px;
            border-bottom: 2px solid rgba(0, 195, 255, 0.2);
            white-space: nowrap;
          }
          .table-premium tbody td {
            padding: 10px 14px;
            font-size: 0.85rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            vertical-align: middle;
            color: #e0e5ec;
            transition: all 0.2s ease;
          }
          .table-premium tbody tr:last-child td {
            border-bottom: none;
          }
          .table-premium tbody tr {
            transition: all 0.2s ease;
          }
          .table-premium tbody tr:hover {
            background: rgba(0, 195, 255, 0.05);
            transform: scale(1.002);
          }
          .table-premium tbody tr:hover td {
            color: #fff;
          }
          .align-right { text-align: right; }
          .align-center { text-align: center; }
          .pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 0.8rem;
            min-width: 50px;
            text-align: center;
          }
          .pill-in { background: rgba(0, 230, 118, 0.1); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.2); }
          .pill-out { background: rgba(255, 61, 113, 0.1); color: #ff3d71; border: 1px solid rgba(255, 61, 113, 0.2); }
          .pill-adj { background: rgba(156, 39, 176, 0.1); color: #e040fb; border: 1px solid rgba(156, 39, 176, 0.2); }
          .pill-neutral { background: rgba(255, 255, 255, 0.05); color: #a0aec0; border: 1px solid rgba(255, 255, 255, 0.1); }
          .col-highlight { background: rgba(0, 195, 255, 0.04); font-weight: bold; color: #00c3ff !important; }
          .col-actual { background: rgba(255, 255, 255, 0.02); font-weight: bold; color: #fff; }
          .badge-danger-glow { background: rgba(255, 61, 113, 0.15); color: #ff3d71; border: 1px solid #ff3d71; box-shadow: 0 0 10px rgba(255, 61, 113, 0.3); }
          .badge-success-glow { background: rgba(0, 230, 118, 0.15); color: #00e676; border: 1px solid #00e676; }
        </style>
      `,M=`
        <thead>
          <tr>
            <th>Material / Produk</th>
            <th class="align-center">UOM</th>
            <th class="align-right">Saldo Awal</th>
            <th class="align-right">Masuk (Gudang)</th>
            <th class="align-right">Retur (Line)</th>
            <th class="align-right">Keluar (OUT)</th>
            <th class="align-center">Relokasi</th>
            <th class="align-right" style="width: 80px;">ADJ</th>
            <th class="align-right col-highlight">Saldo Akhir</th>
            <th class="align-right col-actual">Stok Aktual</th>
            <th class="align-right">Selisih</th>
          </tr>
        </thead>
      `,B=`
        <tbody>
          ${h.map(O=>{const q=O.selisih!==null&&Math.abs(O.selisih)>1e-4,G=q?"background: rgba(255, 61, 113, 0.05); border-left: 3px solid #ff3d71;":"";let J='<span class="pill pill-neutral">0</span>';if(q){const V=O.selisih>0?"+":"";J=`
                <div style="display:flex; align-items:center; gap: 8px; justify-content: flex-end;">
                  <span class="pill ${O.selisih>0?"badge-danger-glow":"badge-warning"}">${V}${u(O.selisih)}</span>
                  <button class="btn-sync" data-mat="${O.material}" data-actual="${O.actualStock||0}" title="Sinkronkan Saldo Buku dengan Stok Aktual">🔄 Fix</button>
                </div>
              `}const Q=O.inboundWarehouse>0?`<span class="pill pill-in">+${u(O.inboundWarehouse)}</span>`:'<span class="pill pill-neutral">-</span>',K=O.inboundReturn>0?`<span class="pill pill-in" style="background: rgba(253, 203, 110, 0.1); color: #fdcb6e; border-color: rgba(253, 203, 110, 0.2);">+${u(O.inboundReturn)}</span>`:'<span class="pill pill-neutral">-</span>',Z=O.outbound>0?`<span class="pill pill-out">-${u(O.outbound)}</span>`:'<span class="pill pill-neutral">-</span>';let ae='<span class="pill pill-neutral">-</span>';O.netReloc>0?ae=`<span class="pill pill-in">+${u(O.netReloc)}</span>`:O.netReloc<0&&(ae=`<span class="pill pill-out">${u(O.netReloc)}</span>`);const U=O.adjust!==0?`<span class="pill pill-adj">${O.adjust>0?"+":""}${u(O.adjust)}</span>`:'<span class="pill pill-neutral">-</span>';return`
              <tr style="${G}">
                <td style="font-weight:600; letter-spacing: 0.3px;">${O.material}</td>
                <td class="align-center" style="color: #a0aec0; font-size: 0.75rem;">${O.uom}</td>
                <td class="align-right font-monospace">${u(O.initial)}</td>
                <td class="align-right">${Q}</td>
                <td class="align-right">${K}</td>
                <td class="align-right">${Z}</td>
                <td class="align-center">${ae}</td>
                <td class="align-right">${U}</td>
                <td class="align-right col-highlight font-monospace" style="font-size: 0.95rem;">${u(O.final)}</td>
                <td class="align-right col-actual font-monospace" style="font-size: 0.95rem;">${O.actualStock!==null?u(O.actualStock):"-"}</td>
                <td class="align-right">${J}</td>
              </tr>
            `}).join("")}
        </tbody>
      `,j=document.createElement("table");j.className="table table-premium",j.id="mutation-table",j.innerHTML=`
        <style>
          .btn-sync {
            background: rgba(0, 195, 255, 0.15);
            border: 1px solid #00c3ff;
            color: #00c3ff;
            border-radius: 4px;
            padding: 2px 8px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: bold;
          }
          .btn-sync:hover {
            background: #00c3ff;
            color: #000;
            box-shadow: 0 0 10px rgba(0, 195, 255, 0.5);
          }
        </style>
        ${D}${M}${B}
      `,n.appendChild(j),setTimeout(()=>{j.querySelectorAll(".btn-sync").forEach(O=>{O.addEventListener("click",async q=>{const G=q.target.getAttribute("data-mat"),J=parseFloat(q.target.getAttribute("data-actual"));if(confirm(`Apakah Anda yakin ingin menyelaraskan saldo buku ${G} menjadi ${J} PCS (sesuai stok fisil aktual)?`)){q.target.disabled=!0,q.target.innerText="...";const Q=await PMCStore.reconcileStock(G,J,e.block,e.row);Q.success?(ToastComponent.show(`Saldo ${G} berhasil disinkronkan.`,"success"),P()):(ToastComponent.show(Q.message,"error"),q.target.disabled=!1,q.target.innerText="🔄 Fix")}})})},0)}L.appendChild(n)}catch($){console.error("Render Error:",$);const m=document.createElement("div");m.className="section alert alert-danger",m.innerHTML=`⚠️ <strong>Sistem Error:</strong> ${$.message}. Mohon hubungi IT atau refresh halaman.`,L.appendChild(m)}S.appendChild(L),TopbarComponent.render("/transit/mutation")}return{render:P}})();window.StockMutationPage=at;const nt=(()=>{let e=[],b={currentPage:1,totalPages:1,totalCount:0},P=[];async function S(l=1){try{const d=await PMCStore.getManualSpbs(null,l,20);e=d.data||d||[],b=d.metadata||{currentPage:1,totalPages:1,totalCount:0}}catch(d){console.warn("Failed to load manual SPBs:",d)}(!PMCStore.bomData||PMCStore.bomData.length===0)&&(console.log("[ManualSPB] BOM Data empty, triggering load..."),await PMCStore.loadMasterDataFromAPI());const o=new Set;(PMCStore.bomData||[]).forEach(d=>{(d.components||[]).forEach(a=>o.add(a.name))}),P=Array.from(o).sort(),console.log(`[ManualSPB] Loaded ${P.length} materials from BOM`)}async function L(){if(window.location.hash!=="#/transit/manual-spb")return;ChartWrapper.destroyAll();const l=document.getElementById("page-content");l.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:center;height:300px;color:var(--text-muted);">
        <div class="spinner"></div>
      </div>`,await S(),l.innerHTML="";const o=document.createElement("div");o.className="page-enter";const d=document.createElement("div");d.className="page-header",d.style.cssText="display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(20, 20, 40, 0) 100%); padding: var(--sp-6); border-radius: var(--radius-lg); border: 1px solid rgba(108, 92, 231, 0.2); margin-bottom: var(--sp-6); box-shadow: 0 10px 30px rgba(0,0,0,0.2);",d.innerHTML=`
      <div>
        <h2 class="page-title" style="font-size:2rem; font-weight:800; background: linear-gradient(to right, #a8c0ff, #3f2b96); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); margin-bottom: 8px;">📋 SPB Manual</h2>
        <p class="page-subtitle" style="color:var(--text-secondary); max-width:600px; line-height:1.5;">Buat permintaan material tambahan di luar jadwal otomatis (untuk persiapan promo, H-1, darurat, dll.)</p>
      </div>
      <button id="btn-create-spb" class="btn btn-primary" style="white-space:nowrap; padding: 12px 24px; font-size: 1.05rem; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4); transition: transform 0.2s, box-shadow 0.2s;">✨ Buat SPB Manual</button>
    `,o.appendChild(d);const a=document.createElement("div");a.id="spb-form-section",a.className="section glass-card",a.style.padding="var(--sp-5)",a.style.display="none",a.style.marginBottom="var(--sp-5)",a.innerHTML=`
      <div style="position:absolute; top:-20px; left:-20px; right:-20px; bottom:-20px; background:linear-gradient(45deg, rgba(108, 92, 231, 0.1), transparent); border-radius:30px; z-index:-1; filter:blur(20px);"></div>
      <h3 style="margin-bottom:var(--sp-5);font-weight:800;color:var(--text-primary);display:flex;align-items:center;gap:12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px;">
        <span style="background:rgba(108, 92, 231, 0.2); padding:8px 12px; border-radius:12px; border:1px solid rgba(108, 92, 231, 0.3);">📝</span> Formulir Permintaan Material (SPB)
      </h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-5);margin-bottom:var(--sp-6);">
        <div class="form-group">
          <label class="form-label" style="color:var(--accent-light);">Nama Peminta (PPIC)</label>
          <input type="text" id="spb-requester" class="form-control" placeholder="Ketik nama PPIC..." style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:12px; color:white;" />
        </div>
        <div class="form-group">
          <label class="form-label" style="color:var(--accent-light);">Alasan / Keterangan</label>
          <input type="text" id="spb-reason" class="form-control" placeholder="Contoh: Persiapan promo besok..." style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:12px; color:white;" />
        </div>
        <div class="form-group">
          <label class="form-label" style="color:var(--accent-light);">Target Tanggal</label>
          <input type="date" id="spb-target-date" class="form-control" value="${new Date().toLocaleDateString("en-CA")}" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:12px; color:white;" />
        </div>
        <div class="form-group">
          <label class="form-label" style="color:var(--accent-light);">Shift</label>
          <select id="spb-target-shift" class="form-control" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:12px; color:white; height:48px;">
            <option value="1">Shift 1 (08:00 - 16:00)</option>
            <option value="2">Shift 2 (16:00 - 00:00)</option>
            <option value="3">Shift 3 (00:00 - 08:00)</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom:var(--sp-6); background: rgba(0,0,0,0.15); padding: var(--sp-4); border-radius: var(--radius-md); border: 1px dashed rgba(255,255,255,0.1);">
        <label class="form-label" style="font-weight:800; font-size: 1.1rem; margin-bottom: 16px; display:block; color:var(--text-main);">🛒 Daftar Material yang Diminta</label>
        <div id="spb-items-list" style="display:flex;flex-direction:column;gap:var(--sp-3);"></div>
        <button id="btn-add-item" class="btn btn-outline" style="margin-top:var(--sp-4); width:100%; border-style:dashed; color:var(--text-secondary); background:rgba(255,255,255,0.02);">+ Tambah Baris Material</button>
      </div>
      <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;border-top:1px solid rgba(255,255,255,0.05);padding-top:var(--sp-5);">
        <button id="btn-cancel-spb" class="btn" style="background:var(--bg-surface-2);color:var(--text-secondary); padding: 10px 24px;">Batal</button>
        <button id="btn-submit-spb" class="btn btn-success" style="padding: 10px 32px; font-weight:bold; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">🚀 Simpan & Terbitkan SPB</button>
      </div>
    `,o.appendChild(a);const r=document.createElement("div");if(r.className="section",e.length===0?r.innerHTML=`
        <div class="empty-state" style="padding:var(--sp-8); background: radial-gradient(circle at center, rgba(108, 92, 231, 0.1) 0%, transparent 70%); border: 1px dashed rgba(108, 92, 231, 0.3); border-radius: var(--radius-xl);">
          <div style="font-size:4rem;margin-bottom:var(--sp-4); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3)); animation: float 3s ease-in-out infinite;">📭</div>
          <div style="font-weight:800;font-size:1.4rem;color:var(--text-primary);margin-bottom:var(--sp-2);">Belum Ada SPB Manual Aktif</div>
          <div style="color:var(--text-secondary); max-width:400px; margin: 0 auto;">Tidak ada permintaan material di luar jadwal saat ini. Klik tombol di atas jika ada kebutuhan mendesak.</div>
          <style>@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }</style>
        </div>
      `:e.forEach(t=>{const s=document.createElement("div");s.className="glass-card",s.style.padding="0",s.style.marginBottom="var(--sp-5)",s.style.overflow="hidden",s.style.transition="transform 0.2s, box-shadow 0.2s";const y=t.status==="completed",p=y?"var(--success-color)":"var(--accent-color)",T=y?"rgba(16, 185, 129, 0.1)":"rgba(108, 92, 231, 0.1)";s.onmouseover=()=>{s.style.transform="translateY(-2px)",s.style.boxShadow=`0 10px 30px ${T}`},s.onmouseout=()=>{s.style.transform="translateY(0)",s.style.boxShadow="none"};const x=y?'<span class="badge badge-success" style="padding:6px 12px; font-weight:bold; box-shadow: 0 2px 8px rgba(16,185,129,0.3);">✅ Selesai</span>':'<span class="badge badge-primary" style="padding:6px 12px; font-weight:bold; background: linear-gradient(45deg, var(--accent-color), var(--primary-color)); box-shadow: 0 2px 8px rgba(108,92,231,0.3);">🔄 Sedang Diproses</span>',H=new Date(t.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});let A="";(t.items||[]).forEach((f,E)=>{const g=f.qtyPallets>0?Math.round(f.scannedPallets/f.qtyPallets*100):0,h=f.qtyPallets>0?Math.round(f.receivedPallets/f.qtyPallets*100):0,i=f.scannedPallets>=f.qtyPallets,n=f.receivedPallets>=f.qtyPallets,k=f.scannedPallets>f.receivedPallets;let C="",u="var(--accent-color)";n?(C='<div style="background:rgba(16,185,129,0.1); color:var(--success-color); padding:8px 16px; border-radius:8px; font-weight:bold; border:1px solid rgba(16,185,129,0.2);">✅ Selesai</div>',u="var(--success-color)"):k?(C='<div style="background:rgba(108, 92, 231, 0.1); color:var(--accent-light); padding:8px 16px; border-radius:8px; font-weight:bold; border:1px solid rgba(108, 92, 231, 0.3); animation: pulse 2s infinite;">🚚 Di Jalan</div>',u="var(--accent-color)"):(C='<div style="background:rgba(255,255,255,0.05); color:var(--text-muted); padding:8px 16px; border-radius:8px; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">⏳ Antre Scan</div>',u="rgba(255,255,255,0.2)"),A+=`
            <div style="background: ${E%2===0?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.02)"}; padding: 16px 20px; display:flex; align-items:center; gap:var(--sp-4); border-left: 4px solid ${u};">
              <div style="flex:1;">
                <div style="font-weight:800; font-size:1.05rem; color:var(--text-main); margin-bottom:4px;">${f.materialName}</div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:8px;">
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:4px;">
                      <span>1. Scan Gudang (Dispatch)</span>
                      <span>${f.scannedPallets}/${f.qtyPallets}</span>
                    </div>
                    <div style="height:4px; background:rgba(0,0,0,0.3); border-radius:2px; overflow:hidden;">
                      <div style="height:100%; width:${g}%; background:${i?"var(--success-color)":"var(--accent-color)"}; opacity:0.6;"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:4px;">
                      <span>2. Terima Transit (Receipt)</span>
                      <span><strong>${f.receivedPallets}</strong>/${f.qtyPallets}</span>
                    </div>
                    <div style="height:4px; background:rgba(0,0,0,0.3); border-radius:2px; overflow:hidden;">
                      <div style="height:100%; width:${h}%; background:${n?"var(--success-color)":"var(--primary-color)"}; box-shadow: 0 0 5px ${n?"var(--success-color)":"transparent"};"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="min-width:120px; text-align:right;">
                ${C}
              </div>
            </div>
          `}),s.innerHTML=`
          <div style="background: ${T}; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; border-left: 4px solid ${p};">
            <div>
              <div style="display:flex; align-items:center; gap: 16px; margin-bottom: 6px;">
                <span style="font-weight:900; font-size:1.25rem; color:var(--text-primary); text-shadow: 0 2px 4px rgba(0,0,0,0.5); font-family: monospace;">${t.spbNumber}</span>
                ${x}
              </div>
              <div style="font-size:0.85rem; color:var(--accent-light); opacity:0.9; margin-bottom:4px; display:flex; gap:8px; flex-wrap:wrap;">
                <span style="background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:4px;">👤 ${t.requestedBy}</span>
                <span style="background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:4px;">🕒 Dibuat: ${H}</span>
                ${t.targetDate?`<span style="background:rgba(108,92,231,0.3); color:#fff; padding:2px 8px; border-radius:4px; border:1px solid rgba(108,92,231,0.5);">📅 Target: <strong>${new Date(t.targetDate).toLocaleDateString("id-ID")}</strong></span>`:""}
                ${t.targetShift?`<span style="background:rgba(108,92,231,0.3); color:#fff; padding:2px 8px; border-radius:4px; border:1px solid rgba(108,92,231,0.5);">⏱ Shift: <strong>${t.targetShift}</strong></span>`:""}
              </div>
              ${t.reason?`<div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:4px;">💬 "${t.reason}"</div>`:""}
            </div>
            ${y?"":`<button class="btn btn-delete-spb" data-spb-id="${t.id}" style="background:rgba(239,68,68,0.15); color:var(--danger-color); border:1px solid rgba(239,68,68,0.3); font-size:1rem; padding:8px 12px; border-radius:8px; transition:all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.3)'" onmouseout="this.style.background='rgba(239,68,68,0.15)'" title="Batalkan SPB">🗑️</button>`}
          </div>
          <div style="display:flex; flex-direction:column;">
            ${A}
          </div>
        `,r.appendChild(s)}),b&&b.totalPages>1){const t=document.createElement("div");t.style.cssText="display:flex; justify-content:space-between; align-items:center; margin-top:var(--sp-4); padding: var(--sp-3);",t.innerHTML=`
        <div style="font-size:14px; color:var(--text-muted);">
          Halaman ${b.currentPage} dari ${b.totalPages} (Total ${b.totalCount} SPB)
        </div>
        <div style="display:flex; gap:var(--sp-2);">
          <button class="btn btn-sm btn-secondary" id="spb-prev-page" ${b.currentPage<=1?"disabled":""}>&laquo; Sebelumnya</button>
          <button class="btn btn-sm btn-secondary" id="spb-next-page" ${b.currentPage>=b.totalPages?"disabled":""}>Selanjutnya &raquo;</button>
        </div>
      `,r.appendChild(t)}o.appendChild(r),l.appendChild(o),setTimeout(()=>{const t=document.getElementById("btn-create-spb"),s=document.getElementById("spb-form-section");t&&s&&t.addEventListener("click",()=>{s.style.display=s.style.display==="none"?"block":"none",s.style.display==="block"&&$()});const y=document.getElementById("btn-cancel-spb");y&&y.addEventListener("click",()=>{s.style.display="none",document.getElementById("spb-items-list").innerHTML=""});const p=document.getElementById("btn-add-item");p&&p.addEventListener("click",$);const T=document.getElementById("btn-submit-spb");T&&T.addEventListener("click",m),document.querySelectorAll(".btn-delete-spb").forEach(A=>{A.addEventListener("click",async()=>{const f=A.getAttribute("data-spb-id");if(confirm("Hapus SPB Manual ini?"))try{const E=await PMCStore.deleteManualSpb(f);E.success?(ToastComponent.show(E.message,"success"),await L()):ToastComponent.show(E.message,"danger")}catch{ToastComponent.show("Gagal menghapus SPB","danger")}})});const x=document.getElementById("spb-prev-page"),H=document.getElementById("spb-next-page");x&&x.addEventListener("click",async()=>{await S(b.currentPage-1),L()}),H&&H.addEventListener("click",async()=>{await S(b.currentPage+1),L()})},0),TopbarComponent.render("/transit/manual-spb")}function $(){const l=document.getElementById("spb-items-list");if(!l)return;const o=document.createElement("div");o.className="spb-item-row",o.style.cssText="display:grid; grid-template-columns: minmax(150px, 1fr) 100px 130px 44px; gap:16px; align-items:end; width:100%; background:rgba(255,255,255,0.03); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); transition:background 0.2s; box-sizing:border-box;",o.onmouseover=()=>o.style.background="rgba(255,255,255,0.06)",o.onmouseout=()=>o.style.background="rgba(255,255,255,0.03)";let d='<option value="" style="color:#ffffff; background:#1a1a2e;">-- Pilih --</option>';P.forEach(a=>{d+=`<option value="${a}" style="color:#ffffff; background:#1a1a2e;">${a}</option>`}),o.innerHTML=`
      <div class="form-group" style="margin:0;">
        <label class="form-label" style="font-size:0.75rem; color:var(--text-secondary);">Material</label>
        <select class="form-control spb-mat-select" style="width:100%; box-sizing:border-box; background:var(--bg-main); border:1px solid rgba(108,92,231,0.3); color:white;">${d}</select>
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label" style="font-size:0.75rem; color:var(--text-secondary);">Jml Palet</label>
        <input type="number" class="form-control spb-qty-input" min="1" value="1" style="width:100%; box-sizing:border-box; background:var(--bg-main); text-align:center; font-weight:bold; color:var(--accent-light);" />
      </div>
      <div class="form-group" style="margin:0;">
        <label class="form-label" style="font-size:0.75rem; color:var(--text-secondary);">Total Pcs (Opsi)</label>
        <input type="number" class="form-control spb-pcs-input" min="0" placeholder="Isi Pcs" style="width:100%; box-sizing:border-box; background:var(--bg-main); border:1px solid rgba(255,255,255,0.1); color:white;" />
      </div>
      <div style="padding-bottom:1px; display:flex; justify-content:flex-end;">
        <button class="btn" style="background:rgba(239,68,68,0.1);color:var(--danger-color);padding:0;width:44px;font-size:1.2rem;height:38px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-md);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'" title="Hapus Baris" onclick="this.closest('.spb-item-row').remove()">✖</button>
      </div>
    `,l.appendChild(o)}async function m(){const l=document.getElementById("btn-submit-spb"),o=document.getElementById("spb-requester").value.trim(),d=document.getElementById("spb-reason").value.trim(),a=document.getElementById("spb-target-date").value,r=parseInt(document.getElementById("spb-target-shift").value);if(!o){ToastComponent.show("Masukkan nama peminta (PPIC)","warning");return}const t=document.querySelectorAll(".spb-item-row"),s=[];if(t.forEach(y=>{const p=y.querySelector(".spb-mat-select").value,T=parseInt(y.querySelector(".spb-qty-input").value)||0,x=parseInt(y.querySelector(".spb-pcs-input").value)||null;p&&T>0&&s.push({materialName:p,qtyPallets:T,qtyPcs:x})}),s.length===0){ToastComponent.show("Tambahkan minimal 1 material","warning");return}if(l){if(l.disabled)return;l.disabled=!0,l.textContent="Memproses..."}try{const y=await PMCStore.saveManualSpb({requestedBy:o,reason:d,items:s,targetDate:a,targetShift:r});y.success?(ToastComponent.show(y.message,"success"),await L()):(ToastComponent.show(y.message,"danger"),l&&(l.disabled=!1,l.textContent="🚀 Simpan & Terbitkan SPB"))}catch{ToastComponent.show("Gagal membuat SPB Manual","danger"),l&&(l.disabled=!1,l.textContent="🚀 Simpan & Terbitkan SPB")}}return{render:L}})();window.ManualSpbPage=nt;const st=(()=>{let e=null,b=null,P=0,S=null,L=[],$=!1,m=null,l=0;const o=15e3,d=[{url:"#/dashboard",id:"rings"},{url:"#/transit/info",id:"top"},{url:"#/dashboard?view=delivery",id:"top"},{url:"#/distribution?view=tv",id:"top"},{url:"#/dashboard",id:"top"}],a=12,r=5e3,t=8e3;function s(){const h=new Date;if(h.getHours()<7){const n=new Date(h);return n.setDate(h.getDate()-1),n.toISOString().split("T")[0]}return h.toISOString().split("T")[0]}function y(h){if(!h)return{block:"?",row:"?"};const i=PMCStore.getTransitInfo();let n="?",k="?";return(i.blocks||[]).forEach(C=>{C.rows.forEach(u=>{u.id===h&&(n=C.blockNumber!==void 0?C.blockNumber:C.id,k=u.rowNumber!==void 0?u.rowNumber:u.id)})}),{block:n,row:k}}async function p(){const h=[];let i=!1;try{const n=s(),k=new Date,C=k.getHours()*60+k.getMinutes(),u=ShiftConfig.detectCurrentShift(n,C);(PMCStore.activeDeliveries||[]).forEach(D=>{if(D.status==="preparing"||D.status==="delivering"){let M=0,B=0,j=0;if((D.items||[]).forEach(q=>{const G=parseFloat(q.requiredPallets||q.required||q.planned||0);M+=G,(q.scans||[]).forEach(J=>{J.barcode&&J.barcode!=="-"&&(PMCStore.usedBarcodes.has(J.barcode)?B++:j++)})}),M>0&&B>=M)return;j>0&&(i=!0),(D.items||[]).forEach(q=>{(q.scans||[]).forEach(J=>{if(J.barcode&&J.barcode!=="-"){const Q=PMCStore.usedBarcodes.has(J.barcode),K=y(J.targetBlockRowId);h.push({type:"delivery",barcode:J.barcode,material:q.material||q.materialName,pcs:J.pcs||"-",supplier:J.supplier||"-",blockLabel:`B${K.block}.${K.row}`,targetBlockRowId:J.targetBlockRowId,spbNumber:null,timestamp:J.createdAt||D.createdAt,displayStatus:D.status==="preparing"?"Loading":"Otw",isReceived:Q,slotId:D.slotId})}})})}})}catch(n){console.warn("[TVDashboard] Error fetching deliveries:",n)}try{const n=await fetch(`${PMCStore.API_BASE}/manual-spb`);n.ok&&(await n.json()).forEach(C=>{if(C.status==="completed")return;let u=0;(C.items||[]).forEach(v=>{(v.scans||[]).forEach(D=>{const M=D.status==="received"||PMCStore.usedBarcodes.has(D.barcode);M||u++;const B=y(D.targetBlockRowId);h.push({type:"manual",barcode:D.barcode||"-",material:v.materialName,pcs:D.pcs||"-",supplier:D.supplier||"-",blockLabel:`B${B.block}.${B.row}`,targetBlockRowId:D.targetBlockRowId,spbNumber:C.spbNumber,timestamp:D.createdAt,isReceived:M})})}),u>0&&(i=!0)})}catch(n){console.warn("[TVDashboard] Error fetching manual SPB:",n)}return h.sort((n,k)=>n.isReceived!==k.isReceived?n.isReceived?1:-1:!n.timestamp||!k.timestamp?0:new Date(k.timestamp)-new Date(n.timestamp)),{items:h,hasActiveProcess:i}}async function T(){if(window.location.hash!=="#/tv/inbound")return;ChartWrapper.destroyAll(),g(),P=0;const h=document.getElementById("page-content"),i=document.getElementById("sidebar"),n=document.getElementById("topbar"),k=document.getElementById("main");i&&(i.style.display="none"),n&&(n.style.display="none"),k&&(k.style.marginLeft="0",k.style.paddingTop="0"),h.style.cssText="padding:0;max-width:100%;width:100vw;height:100vh;overflow:hidden;",h.innerHTML=`
      <div id="tv-screensaver-container" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; background:#060610;">
          <iframe id="tv-screensaver-iframe" src="about:blank" style="width:100%; height:100%; border:none;"></iframe>
      </div>
      <div id="tv-root" style="
        width:100vw; height:100vh; 
        background: #060610;
        display:flex; flex-direction:column;
        font-family: 'Outfit', 'Inter', sans-serif;
        color: #e6e6e6;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          padding: 16px 30px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 2px solid rgba(108, 92, 231, 0.3);
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.12), rgba(0,0,0,0));
          flex-shrink: 0;
        ">
          <div style="display:flex; align-items:center; gap:16px;">
            <span style="font-size:2rem;">📦</span>
            <div>
              <div style="font-size:1.6rem; font-weight:900; 
                background: linear-gradient(90deg, #a8c0ff, #3f2b96); 
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                letter-spacing: 1px;">KEDATANGAN BARANG — TRANSIT</div>
              <div style="font-size:0.85rem; color:rgba(255,255,255,0.35);">Panduan penempatan barang ke blok tujuan</div>
            </div>
          </div>
          <div id="tv-debug" style="font-size:0.6rem; color:rgba(255,255,255,0.1); max-width:200px; overflow:hidden;"></div>
          <div style="text-align:right;">
            <div id="tv-clock" style="font-size:2.2rem; font-weight:800; font-family:monospace; color:#a8c0ff; text-shadow: 0 0 10px rgba(168,192,255,0.4);"></div>
            <div id="tv-date" style="font-size:0.85rem; color:rgba(255,255,255,0.3);"></div>
          </div>
        </div>

        <!-- Main Split: Left List + Right Map -->
        <div style="flex:1; display:flex; overflow:hidden;">
          
          <!-- LEFT: Daftar Antrean (60%) -->
          <div style="flex:0 0 58%; display:flex; flex-direction:column; border-right: 2px solid rgba(108,92,231,0.15);">
            <!-- Table Header -->
            <div style="
              display: grid;
              grid-template-columns: 50px 220px 1fr 100px 80px 130px;
              padding: 10px 20px;
              background: rgba(108, 92, 231, 0.06);
              border-bottom: 1px solid rgba(255,255,255,0.06);
              font-size: 0.75rem;
              font-weight: 700;
              color: rgba(168,192,255,0.7);
              text-transform: uppercase;
              letter-spacing: 2px;
              flex-shrink: 0;
            ">
              <div>#</div>
              <div>BARCODE</div>
              <div>MATERIAL</div>
              <div style="text-align:center;">STATUS</div>
              <div style="text-align:center;">PCS</div>
              <div style="text-align:center;">BLOK</div>
            </div>
            <div id="tv-list" style="flex:1; overflow:hidden;"></div>
            <div id="tv-footer" style="
              padding: 8px 20px; display:flex; justify-content:space-between; align-items:center;
              border-top: 1px solid rgba(255,255,255,0.04); background:rgba(0,0,0,0.3); flex-shrink:0;
            ">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;animation:tvPulse 2s infinite;"></span>
                <span style="color:rgba(255,255,255,0.3);font-size:0.8rem;">Live</span>
              </div>
              <div id="tv-page-info" style="color:rgba(255,255,255,0.3);font-size:0.8rem;"></div>
              <div id="tv-total-info" style="color:rgba(255,255,255,0.4);font-size:0.85rem;font-weight:600;"></div>
            </div>
          </div>

          <!-- RIGHT: Peta Blok (42%) -->
          <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2);">
            <div style="padding:12px 20px; font-size:0.85rem; font-weight:700; color:rgba(168,192,255,0.6); text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid rgba(255,255,255,0.04); flex-shrink:0;">
              🗺️ DENAH BLOK TRANSIT
            </div>
            <div id="tv-map" style="flex:1; padding:16px; overflow:auto; display:flex; flex-wrap:wrap; align-content:flex-start; gap:10px;"></div>
          </div>
        </div>
      </div>

      <style>
        @keyframes tvPulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes tvSlideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes tvGlow {
          0%,100% { box-shadow: 0 0 8px rgba(251,191,36,0.4), inset 0 0 6px rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.6); }
          50% { box-shadow: 0 0 20px rgba(251,191,36,0.8), inset 0 0 12px rgba(251,191,36,0.2); border-color: rgba(251,191,36,1); }
        }
        @keyframes tvGlowManual {
          0%,100% { box-shadow: 0 0 8px rgba(168,85,247,0.4), inset 0 0 6px rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.6); }
          50% { box-shadow: 0 0 20px rgba(168,85,247,0.8), inset 0 0 12px rgba(168,85,247,0.2); border-color: rgba(168,85,247,1); }
        }
        @keyframes tvTickPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.3); opacity: 1; text-shadow: 0 0 10px rgba(34,197,94,0.6); }
        }
      </style>
    `;function C(){const u=new Date,v=document.getElementById("tv-clock"),D=document.getElementById("tv-date");v&&(v.textContent=u.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"})),D&&(D.textContent=u.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))}C(),b=setInterval(C,1e3),await x(),e=setInterval(x,r),S=setInterval(()=>{P++,f(L)},t),window.addEventListener("hashchange",g,{once:!0})}async function x(){try{await PMCStore.loadActiveDeliveriesFromAPI(),await PMCStore.loadTransitInfoFromAPI();const{items:h,hasActiveProcess:i}=await p();L=h,h.length===0&&!i?$||H():($&&A(),f(h),E(h))}catch(h){console.warn("[TVDashboard] Refresh error:",h)}}function H(){$=!0,l=0;const h=document.getElementById("tv-screensaver-container"),i=document.getElementById("tv-screensaver-iframe"),n=document.getElementById("tv-root");if(h&&i&&n){h.style.display="block",n.style.display="none";const k=()=>{const C=d[l];i.src=window.location.origin+window.location.pathname+C.url,i.onload=()=>{if(C.id==="rings"){let u=0;const v=setInterval(()=>{try{const D=i.contentDocument.querySelectorAll("h3");for(let M of D)if(M.textContent.includes("Persentase Pengiriman Harian per Shift")){M.scrollIntoView({behavior:"smooth",block:"center"}),clearInterval(v);return}}catch{}++u>10&&clearInterval(v)},300)}}};k(),m=setInterval(()=>{l=(l+1)%d.length,k()},o)}}function A(){$=!1,m&&(clearInterval(m),m=null);const h=document.getElementById("tv-screensaver-container"),i=document.getElementById("tv-root");if(h&&i){h.style.display="none",i.style.display="flex";const n=document.getElementById("tv-screensaver-iframe");n&&(n.src="about:blank")}}function f(h){const i=document.getElementById("tv-list"),n=document.getElementById("tv-page-info"),k=document.getElementById("tv-total-info");if(!i)return;if(h.length===0){i.innerHTML=`
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; height:100%;">
          <div style="font-size:4rem; animation:tvPulse 3s ease-in-out infinite;">✅</div>
          <div style="font-size:1.6rem; font-weight:800; color:#10b981;">SEMUA DITERIMA</div>
          <div style="font-size:0.95rem; color:rgba(255,255,255,0.3);">Menunggu pengiriman berikutnya...</div>
        </div>`,n&&(n.textContent=""),k&&(k.textContent="");return}const C=Math.ceil(h.length/a);P>=C&&(P=0);const u=P*a,v=h.slice(u,u+a),D=JSON.stringify(v.map(B=>({b:B.barcode,r:B.isReceived,s:B.displayStatus})));if(i.getAttribute("data-hash")===D){n&&(n.textContent=C>1?`Hal ${P+1}/${C}`:""),k&&(k.textContent=`📦 ${h.length} palet`);return}i.setAttribute("data-hash",D);let M="";v.forEach((B,j)=>{const O=u+j+1,q=B.type==="manual",G=B.isReceived,J=G?"0.4":"1",Q=j%2===0?"rgba(255,255,255,0.015)":"rgba(0,0,0,0.1)",K=q?'<span style="background:rgba(168,85,247,0.25);color:#c4b5fd;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;">SPB</span>':"",Z=B.displayStatus==="Loading"?"#fbbf24":B.displayStatus==="Wait"?"#a0aec0":"#10b981",ae=B.displayStatus||(q?"Manual":"Otw"),U=G?'<span style="font-size:1.8rem; color:#22c55e; animation: tvTickPulse 1.5s infinite alternate;">&#10004;</span>':`<span style="font-size:0.7rem; font-weight:800; padding:4px 10px; border-radius:6px; background:rgba(0,0,0,0.3); color:${Z}; border:1px solid ${Z}; text-transform:uppercase;">${ae}</span>`;M+=`
        <div style="
          display:grid; grid-template-columns:50px 220px 1fr 100px 80px 130px;
          padding:6px 20px; background:${Q};
          border-bottom:1px solid rgba(255,255,255,0.03);
          align-items:center;
          opacity: ${J};
          transition: opacity 0.5s ease;
          animation:tvSlideIn 0.3s ease ${j*.04}s both;
        ">
          <div style="font-size:1.1rem;font-weight:900;color:rgba(255,255,255,0.2);font-family:monospace;">${String(O).padStart(2,"0")}</div>
          <div>
            <div style="font-size:1.45rem;font-weight:900;color:#fff;font-family:monospace;letter-spacing:1px;text-shadow:0 0 10px rgba(255,255,255,0.1);">${B.barcode}</div>
            <div style="margin-top:2px;">${K} ${B.spbNumber?`<span style="font-size:0.65rem;color:rgba(255,255,255,0.25);">${B.spbNumber}</span>`:""}</div>
          </div>
          <div>
            <div style="font-size:1.05rem;font-weight:800;color:#fff;">${B.material}</div>
          </div>
          <div style="text-align:center;">
             ${U}
          </div>
          <div style="text-align:center;font-size:1.05rem;font-weight:800;color:#fbbf24;">${B.pcs}</div>
          <div style="text-align:center;">
            <span style="
              display:inline-block; font-size:1.3rem; font-weight:900; color:#fff;
              background:linear-gradient(135deg, rgba(108,92,231,0.35), rgba(59,130,246,0.25));
              padding:4px 14px; border-radius:8px;
              border:2px solid rgba(108,92,231,0.5);
              animation:${q?"tvGlowManual":"tvGlow"} 2s ease-in-out infinite;
              letter-spacing:1px; min-width:70px;
            ">${B.blockLabel}</span>
          </div>
        </div>`}),i.innerHTML=M,n&&(n.textContent=C>1?`Hal ${P+1}/${C}`:""),k&&(k.textContent=`📦 ${h.length} palet menunggu`)}function E(h){const i=document.getElementById("tv-map");if(!i)return;const n=PMCStore.getBlockLayout();if(!n||n.length===0){i.innerHTML='<div style="color:rgba(255,255,255,0.3);padding:20px;">Belum ada konfigurasi blok.</div>';return}const k={};h.forEach(D=>{D.targetBlockRowId&&(k[D.targetBlockRowId]||(k[D.targetBlockRowId]=[]),k[D.targetBlockRowId].push(D))});const C={};(PMCStore.getTransitInfo().blocks||[]).forEach(D=>{D.rows.forEach(M=>{k[M.id]&&(C[D.id]||(C[D.id]={count:0,materials:new Set}),C[D.id].count+=k[M.id].length,k[M.id].forEach(B=>C[D.id].materials.add(B.material)))})});let v="";n.forEach(D=>{const M=D.blockNumber||D.id,B=C[D.id],j=B&&B.count>0,O=j?"border:2px solid rgba(251,191,36,0.6); animation:tvGlow 2s ease-in-out infinite;":"border:1px solid rgba(255,255,255,0.08);",q=j?"background:linear-gradient(135deg, rgba(251,191,36,0.08), rgba(0,0,0,0.3));":"background:rgba(255,255,255,0.02);";let G="";(D.rows||[]).forEach(J=>{if(!J.material)return;J.rowNumber||J.id;const Q=k[J.id],K=Q&&Q.length>0,Z=K?"rgba(251,191,36,0.12)":"rgba(255,255,255,0.03)",ae=K?"1px solid rgba(251,191,36,0.4)":"1px solid rgba(255,255,255,0.05)",U=K?"#fbbf24":"rgba(255,255,255,0.4)",V=J.material.length>14?J.material.substring(0,12)+"..":J.material;G+=`
          <div style="
            padding:4px 6px; background:${Z}; border:${ae}; border-radius:4px;
            display:flex; justify-content:space-between; align-items:center; gap:4px;
            ${K?"animation:tvGlow 2s ease-in-out infinite;":""}
          ">
            <span style="font-size:0.6rem; color:${U}; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:90px;" title="${J.material}">${V}</span>
            ${K?`<span style="background:rgba(251,191,36,0.3);color:#fbbf24;font-size:0.6rem;font-weight:900;padding:1px 5px;border-radius:3px;white-space:nowrap;">🚚 ${Q.length}</span>`:""}
          </div>`}),v+=`
        <div style="
          ${q} ${O}
          border-radius:10px; padding:8px; min-width:150px; max-width:200px;
          flex: 1 1 150px;
          transition: all 0.3s;
        ">
          <div style="
            display:flex; justify-content:space-between; align-items:center;
            margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.06);
          ">
            <span style="font-size:1.1rem; font-weight:900; color:${j?"#fbbf24":"rgba(255,255,255,0.5)"};">B${M}</span>
            ${j?`<span style="background:rgba(251,191,36,0.25);color:#fbbf24;font-size:0.7rem;font-weight:800;padding:2px 8px;border-radius:6px;">📦 ${B.count}</span>`:""}
          </div>
          <div style="display:flex; flex-direction:column; gap:3px;">
            ${G||'<div style="font-size:0.6rem;color:rgba(255,255,255,0.15);text-align:center;padding:4px;">Kosong</div>'}
          </div>
        </div>`}),i.innerHTML=v}function g(){A(),e&&(clearInterval(e),e=null),S&&(clearInterval(S),S=null),b&&(clearInterval(b),b=null);const h=document.getElementById("sidebar"),i=document.getElementById("topbar"),n=document.getElementById("main"),k=document.getElementById("page-content");h&&(h.style.display=""),i&&(i.style.display=""),n&&(n.style.marginLeft="",n.style.paddingTop=""),k&&(k.style.cssText="")}return{render:T}})();window.TvDashboardPage=st;const ot=(()=>{let e=!1,b="",P="";function S(){if(window.location.hash!=="#/transit/relocation")return;ChartWrapper.destroyAll();const $=document.getElementById("page-content");$.innerHTML=`
      <div class="page-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(20, 20, 40, 0) 100%); padding: var(--sp-6); border-radius: var(--radius-lg); border: 1px solid rgba(236, 72, 153, 0.2); margin-bottom: var(--sp-6); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <div>
            <h2 class="page-title" style="font-size:2rem; font-weight:800; background: linear-gradient(to right, #fbc2eb, #a6c1ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); margin-bottom: 8px;">🔄 Relokasi Internal Transit</h2>
            <p class="page-subtitle" style="color:var(--text-secondary); max-width:600px; line-height:1.5;">Pindahkan letak palet (barcode) antar blok dan baris di dalam area transit.</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--sp-6);">
          <!-- Kiri: Scan -->
          <div class="glass-card" style="padding: var(--sp-5);">
            <h3 style="margin-bottom: var(--sp-4); color: var(--text-primary); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">1. Validasi Barcode Palet</h3>
            <div class="form-group">
              <label class="form-label" style="font-weight:600;">Scan / Ketik Barcode</label>
              <input type="text" id="relocate-barcode" class="form-control" placeholder="Scan Barcode Palet..." autofocus style="font-size: 1.2rem; padding: 16px; background: rgba(0,0,0,0.2); font-family: monospace; color: #fff;" />
              <div id="barcode-info" style="margin-top: 16px; min-height: 80px; padding: 16px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); font-size: 0.9rem;">
                 <span style="color:var(--text-secondary);">Silakan scan barcode untuk melihat lokasi saat ini...</span>
              </div>
            </div>
          </div>

          <!-- Kanan: Tujuan -->
          <div class="glass-card" style="padding: var(--sp-5);" id="target-section">
            <h3 style="margin-bottom: var(--sp-4); color: var(--text-primary); font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">2. Tujuan Pindah Blok</h3>
            
            <div class="form-group">
              <label class="form-label" style="font-weight:600;">Pilih Blok & Baris Tujuan</label>
              <select id="relocate-target" class="form-control" disabled style="font-size: 1.1rem; padding: 12px; background: rgba(0,0,0,0.2); color: #fff;">
                <option value="" style="color:#fff; background:#1a1a2e;">-- Menunggu Scan Barcode --</option>
              </select>
            </div>

            <button id="btn-submit-relocate" class="btn btn-primary" disabled style="width: 100%; padding: 16px; font-size: 1.1rem; margin-top: var(--sp-4); font-weight: bold; background: linear-gradient(45deg, #ec4899, #8b5cf6); border: none; box-shadow: 0 4px 15px rgba(236,72,153,0.3);">
              🚀 Pindahkan Palet Secara Sistem
            </button>
          </div>
        </div>
      </div>
    `,setTimeout(L,0)}function L(){const $=document.getElementById("relocate-barcode"),m=document.getElementById("relocate-target"),l=document.getElementById("btn-submit-relocate"),o=document.getElementById("barcode-info");if(!$||!m||!l||!o)return;$.addEventListener("input",t=>{const s=t.target.value.trim();s.length>=5?d(s):r()}),l.addEventListener("click",async()=>{if(e)return;const t=m.value;if(!t){ToastComponent.show("Pilih blok & baris tujuan terlebih dahulu!","warning");return}e=!0,l.innerHTML='<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></div> Memproses...',l.disabled=!0;try{const s=await PMCStore.relocateTransitPallet(b,t);s.success?(ToastComponent.show("Palet berhasil dipindahkan!","success"),$.value="",r(),PMCStore.init&&PMCStore.init(),PMCStore.loadTransitInfoFromAPI&&PMCStore.loadTransitInfoFromAPI(),PMCStore.loadTransitInventoryFromAPI&&PMCStore.loadTransitInventoryFromAPI()):(ToastComponent.show(s.message||"Gagal merelokasi.","error"),l.innerHTML="🚀 Pindahkan Palet Secara Sistem",l.disabled=!1)}catch(s){ToastComponent.show(s.message||"Terjadi kesalahan koneksi server.","error"),l.innerHTML="🚀 Pindahkan Palet Secara Sistem",l.disabled=!1}finally{e=!1}});function d(t){const s=PMCStore.transitInventory.find(p=>p.barcode===t);if(!s){o.innerHTML='<span style="color:var(--danger-color); font-weight:bold;">❌ Barcode tidak ditemukan di Area Transit.</span>',r(!1);return}b=t,P=s.material;let y="Tidak diletakkan di Baris Spesifik";if(s.blockId&&s.rowId){const T=PMCStore.getBlockLayout().find(x=>x.id===s.blockId);if(T){const x=T.rows.find(H=>H.id===s.rowId);x&&(y=`Blok B${T.blockNumber}.${x.rowNumber}`)}}o.innerHTML=`
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span style="color:var(--text-secondary);">Material</span>
          <span style="font-weight:700; color:var(--text-primary);">${P}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span style="color:var(--text-secondary);">Lokasi Saat Ini</span>
          <span style="font-weight:700; color:var(--accent-color);">${y}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-secondary);">Status Ketersediaan</span>
          <span style="font-weight:600; color:var(--success-color);">Tersedia untuk Dipindah</span>
        </div>
      `,a(s)}function a(t){m.disabled=!1,l.disabled=!1,m.innerHTML='<option value="" style="color:#fff; background:#1a1a2e;">-- Pilih Tujuan --</option>';const s=PMCStore.transitInfoCache;!s||!s.blocks||s.blocks.forEach(y=>{y.rows&&y.rows.forEach(p=>{if(p.id===t.rowId||p.id===t.blockRowId)return;const T=p.qty||0;if(T>=p.maxPallets||!p.isFlexible&&p.material&&p.material!==P&&T>0)return;const x=document.createElement("option");x.value=p.id,x.style.background="#1a1a2e",x.style.color="#fff";const H=p.isFlexible?" [SLOW]":"",A=p.material&&p.material!=="MIXED STOCK"?` (${p.material})`:p.isFlexible&&T>0?" (Mixed)":" (Kosong)";x.textContent=`B${y.blockNumber}.${p.rowNumber}${H}${A} - Sisa ${p.maxPallets-T} Slot`,m.appendChild(x)})})}function r(t=!0){t&&(o.innerHTML='<span style="color:var(--text-secondary);">Silakan scan barcode untuk melihat lokasi saat ini...</span>'),b="",P="",m.innerHTML='<option value="">-- Menunggu Scan Barcode --</option>',m.disabled=!0,l.disabled=!0}}return{render:S}})();window.TransitRelocationPage=ot;const rt=(()=>{function e(){if(window.location.hash!=="#/transit/verify-reject")return;ChartWrapper.destroyAll();const S=document.getElementById("page-content");S.innerHTML="";const L=document.createElement("div");L.className="page-enter";const $=document.createElement("div");$.className="page-header",$.innerHTML=`
      <div>
        <h2 class="page-title">♻️ Verifikasi Rijek Produksi</h2>
        <p class="page-subtitle">Pilih dan verifikasi komponen/material rijek dari Line Produksi. Stok akan otomatis terpotong saat persetujuan.</p>
      </div>
      <div>
        <button id="btn-refresh-rejects" class="btn btn-secondary">🔄 Segarkan Data</button>
      </div>
    `,L.appendChild($);const m=document.createElement("div");m.className="card",m.innerHTML=`
      <div id="reject-verify-table" style="overflow-x:auto;">
        <div style="text-align:center; padding:var(--sp-8); color:var(--text-muted);">Memuat rijek terbaru...</div>
      </div>
    `,L.appendChild(m),S.appendChild(L),document.getElementById("btn-refresh-rejects").addEventListener("click",b),b(),TopbarComponent.render("/transit/verify-reject")}async function b(){const S=document.getElementById("reject-verify-table");if(!S)return;const $=(await PMCStore.getLineRejects("")).filter(l=>l.status==="pending");if($.length===0){S.innerHTML=`
        <div style="text-align:center; padding:var(--sp-8); border:2px dashed var(--border-color); border-radius:var(--radius-lg); margin-top:var(--sp-4);">
          <div style="font-size:3rem; margin-bottom:var(--sp-2);">🎉</div>
          <h3 style="color:var(--text-primary); margin-bottom:var(--sp-1);">Semua Rijek Terselesaikan</h3>
          <p style="color:var(--text-muted);">Tidak ada pengajuan rijek dari pihak Line Produksi yang menunggu verifikasi saat ini.</p>
        </div>
      `;return}let m=`
      <table class="data-table">
        <thead>
          <tr>
            <th>Waktu & Line</th>
            <th>Material Rijek</th>
            <th>Alasan</th>
            <th>Qty (PCS) diajukan</th>
            <th>Qty Aktual (Bisa Diedit)</th>
            <th>Aksi Verifikasi</th>
          </tr>
        </thead>
        <tbody>
    `;$.forEach(l=>{const o=l.time?l.time.substring(11,19):"?";m+=`
        <tr>
          <td>
            <div style="font-weight:700;">Line ${l.line}</div>
            <div style="font-size:var(--fs-xs);color:var(--text-muted);">${o}</div>
          </td>
          <td style="font-weight:600; font-size:var(--fs-sm); max-width: 250px;">
            ${l.materialName}
          </td>
          <td><span class="badge" style="background:rgba(236,72,153,0.12);color:#ec4899;">${l.reason}</span></td>
          <td style="font-weight:700; color:var(--text-primary); font-size:1.1rem;">${PMCStore.formatNumber(l.pcs)}</td>
          <td>
            <input type="number" id="edit-pcs-${l.id}" class="form-input" style="width:100px; padding:6px; font-weight:700; text-align:center;" value="${l.pcs}" min="0" step="1">
          </td>
          <td>
             <div style="display:flex; gap:8px;">
               <button class="btn btn-primary btn-accept" data-id="${l.id}" style="padding:6px 12px; background:var(--success-color); border:none; color:#ffffff; font-weight:800;">✔️ Setujui</button>
               <button class="btn btn-secondary btn-reject" data-id="${l.id}" style="padding:6px 12px; background:transparent; border:1px solid var(--danger-color); color:var(--danger-color);">❌ Tolak</button>
             </div>
          </td>
        </tr>
      `}),m+="</tbody></table>",S.innerHTML=m,document.querySelectorAll(".btn-accept").forEach(l=>{l.addEventListener("click",async o=>{const d=o.currentTarget.getAttribute("data-id"),a=document.getElementById("edit-pcs-"+d).value,r=parseFloat(a);if(isNaN(r)||r<=0){ToastComponent.show("Masukkan jumlah PCS aktual yang valid (>0)","warning");return}o.currentTarget.disabled=!0,o.currentTarget.innerHTML="Hapus...",await P(d,"accept",r)})}),document.querySelectorAll(".btn-reject").forEach(l=>{l.addEventListener("click",async o=>{const d=o.currentTarget.getAttribute("data-id");confirm("Tolak pengajuan rijek ini? Tim Line harus menginput ulang.")&&(o.currentTarget.disabled=!0,await P(d,"reject"))})})}async function P(S,L,$=0){const m=await PMCStore.verifyLineReject(S,L,$);m.success?(ToastComponent.show(m.message,"success"),b()):(ToastComponent.show(`Gagal: ${m.message}`,"danger"),b())}return{render:e}})();window.TransitRejectVerifyPage=rt;const it=(()=>{const e=`http://${window.location.hostname}:3000/api`;let b=[],P=[];async function S(){try{const d=await fetch(`${e}/master/material-receh`);d.ok&&(b=await d.json()),!PMCStore.bomData||PMCStore.bomData.length===0?PMCStore.loadMasterDataFromAPI():L(""),m(),l(),o()}catch(d){console.error("Failed to load material receh:",d)}}function L(d=""){const a=new Set;(PMCStore.bomData||[]).forEach(r=>{(!d||r.skuId===d)&&(r.components||[]).forEach(t=>a.add(t.name))}),P=Array.from(a).sort()}window.PMCStore&&typeof window.PMCStore.on=="function"&&(window.PMCStore.on("bomChanged",()=>{if(window.location.hash==="#/transit/master-receh"){const d=document.getElementById("receh-sku-select");L(d?d.value:""),l(),o()}}),window.PMCStore.on("skuChanged",()=>{window.location.hash==="#/transit/master-receh"&&l()}));function $(){if(window.location.hash!=="#/transit/master-receh")return;ChartWrapper.destroyAll();const d=document.getElementById("page-content");d.innerHTML="";const a=document.createElement("div");a.className="page-enter";const r=document.createElement("div");r.className="page-header",r.innerHTML=`
      <div>
        <h2 class="page-title">⚙️ Master Material Receh (Parsial)</h2>
        <p class="page-subtitle">Daftar material stok Transit yang DIISINKAN ditarik secara parsial (recehan) ke Line Produksi.</p>
      </div>
    `,a.appendChild(r);const t=document.createElement("div");t.style.display="grid",t.style.gridTemplateColumns="1fr 2fr",t.style.gap="var(--sp-6)",t.style.alignItems="start";const s=document.createElement("div");s.className="card",s.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3);">➕ Tambah Material Receh</h3>
      <div class="form-group" style="margin-bottom:var(--sp-2);">
        <label class="form-label">Pilih SKU (Opsional)</label>
        <select id="receh-sku-select" class="form-input"></select>
      </div>
      <div class="form-group">
        <label class="form-label">Pilih Material</label>
        <select id="receh-select" class="form-input"></select>
      </div>
      <button id="btn-add-receh" class="btn btn-primary" style="width:100%; margin-top:var(--sp-2);">Simpan ke Daftar</button>

      <div class="alert alert-info" style="margin-top:var(--sp-5);">
        <h4 style="margin-bottom:var(--sp-2);">ℹ️ Info</h4>
        <p style="font-size:0.85rem;">Hanya material yang didaftarkan di sini yang dapat diambil secara "receh" (jumlah tidak penuh per pallet) dari Transit ke Line Produksi.</p>
      </div>
    `,t.appendChild(s);const y=document.createElement("div");y.className="card",y.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3);">📋 Daftar Material Tersimpan</h3>
      <div id="receh-table-container">Menunggu data...</div>
    `,t.appendChild(y),a.appendChild(t),d.appendChild(a),setTimeout(()=>{document.getElementById("receh-sku-select").addEventListener("change",p=>{L(p.target.value),o()}),document.getElementById("btn-add-receh").addEventListener("click",async()=>{const p=document.getElementById("receh-select").value;if(!p)return ToastComponent.show("Pilih material","warning");try{const x=await(await fetch(`${e}/master/material-receh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({materialName:p})})).json();ToastComponent.show(x.message,x.success?"success":"danger"),x.success&&(await S(),PMCStore.loadMaterialRecehFromAPI())}catch{ToastComponent.show("Gagal menyimpan","danger")}})},0),S(),TopbarComponent.render("/transit/master-receh")}function m(){const d=document.getElementById("receh-table-container");if(!d)return;if(b.length===0){d.innerHTML='<div class="empty-state">Belum ada material yang didaftarkan.</div>';return}let a=`
      <table class="data-table">
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Di Input Pada</th>
            <th width="100">Aksi</th>
          </tr>
        </thead>
        <tbody>
    `;b.forEach(r=>{const t=r.createdAt?new Date(r.createdAt).toLocaleString("id-ID"):"-";a+=`
        <tr>
          <td><strong>${r.materialName}</strong></td>
          <td>${t}</td>
          <td>
            <button class="btn btn-sm btn-danger btn-delete-receh" data-mat="${r.materialName}">Hapus</button>
          </td>
        </tr>
      `}),a+="</tbody></table>",d.innerHTML=a,d.querySelectorAll(".btn-delete-receh").forEach(r=>{r.addEventListener("click",async t=>{const s=t.target.getAttribute("data-mat");if(confirm(`Hapus ${s} dari daftar Material Receh?`))try{const p=await(await fetch(`${e}/master/material-receh/${encodeURIComponent(s)}`,{method:"DELETE"})).json();ToastComponent.show(p.message,p.success?"success":"danger"),p.success&&(await S(),PMCStore.loadMaterialRecehFromAPI())}catch{ToastComponent.show("Gagal menghapus","danger")}})})}function l(){const d=document.getElementById("receh-sku-select");if(!d)return;const a=new Set((PMCStore.bomData||[]).map(s=>s.skuId));let r='<option value="">-- Tampilkan Semua SKU --</option>';(PMCStore.skuList||[]).filter(s=>a.has(s.id)).forEach(s=>{r+=`<option value="${s.id}">${s.code} - ${s.name}</option>`});const t=d.value;d.innerHTML=r,t&&(d.value=t)}function o(){const d=document.getElementById("receh-select");if(!d){console.error("Select not found");return}const a=new Set(b.map(t=>t.materialName)),r=P.filter(t=>!a.has(t));if(r.length===0&&P.length===0){d.innerHTML='<option value="">-- Master BOM Kosong/Belum Terload --</option>';return}d.innerHTML='<option value="">-- Pilih Material BOM --</option>'+r.map(t=>`<option value="${t}">${t}</option>`).join("")}return{render:$}})();window.MasterRecehPage=it;const lt=(()=>{let e=[],b=null,P=null,S="";function L(){if(window.location.hash!=="#/produksi/inbound")return;ChartWrapper.destroyAll();const d=document.getElementById("page-content");d.innerHTML="";const a=document.createElement("div");a.className="page-enter";const r=document.createElement("div");r.className="page-header",r.innerHTML=`
      <div>
        <h2 class="page-title">📥 Penarikan ke Line (Inbound Produksi)</h2>
        <p class="page-subtitle">Scan barcode dari area transit untuk dimasukkan ke line produksi</p>
      </div>
    `,a.appendChild(r);const t=document.createElement("div");t.style.marginBottom="var(--sp-6)",a.appendChild(t),l(t);const s=document.createElement("div");s.style.marginBottom="var(--sp-6)",a.appendChild(s),o(s);const y=document.createElement("div");y.style.display="grid",y.style.gridTemplateColumns="300px 1fr",y.style.gap="var(--sp-6)",y.style.alignItems="start";const p=document.createElement("div");p.className="card";const T=`<div id="line-warning" class="alert alert-warning" style="margin-bottom:var(--sp-3);display:${S?"none":"block"};">⚠️ Pilih Line Produksi terlebih dahulu sebelum melakukan scan!</div>`,x=new Set;PMCStore.getLinePerSku().forEach(G=>{G.line&&x.add(G.line)});const A=[...x].sort();let f='<option value="">-- Pilih Line Produksi --</option>';A.forEach(G=>{f+=`<option value="${G}" ${S===G?"selected":""}>${G}</option>`}),p.innerHTML=`
      ${T}
      <div class="form-group" style="margin-bottom:var(--sp-4);">
        <label class="form-label" style="font-weight:700;color:var(--primary-color);">🏢 Line Produksi</label>
        <select id="line-selector" class="form-input" style="font-size:1.1rem;font-weight:bold;">
          ${f}
        </select>
      </div>

      <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;border-top:1px solid var(--border-color);padding-top:var(--sp-3);">
        <span>🔍</span> Scan Barcode
      </h3>
      <div style="background:#000;border-radius:var(--radius-md);height:180px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-4);">
        <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
        <div style="color:rgba(255,255,255,0.3);font-size:3rem;">[|||]</div>
      </div>
      <style>
        @keyframes scanline {
          0% { top: 20%; }
          100% { top: 80%; }
        }
      </style>
    `;const E=document.createElement("div");E.className="form-group";const g=document.createElement("label");g.className="form-label",g.textContent="No Barcode (Scan)";const h=document.createElement("input");h.type="text",h.className="form-input",h.placeholder="Scan barcode dari transit...",h.autocomplete="off",h.disabled=!S,h.style.flex="1";const i=CameraScanner.createScanButton(h),n=document.createElement("div");n.style.cssText="display:flex; gap:8px; align-items:stretch;",n.appendChild(h),n.appendChild(i);const k=document.createElement("label");k.className="form-label",k.style.marginTop="var(--sp-3)",k.textContent="Nama Material",b=document.createElement("input"),b.type="text",b.className="form-input",b.placeholder="Otomatis terisi...",b.autocomplete="off",b.readOnly=!0,b.style.backgroundColor="var(--bg-secondary)";const C=document.createElement("label");C.className="form-label",C.style.marginTop="var(--sp-3)",C.textContent="Nama Supplier",P=document.createElement("input"),P.type="text",P.className="form-input",P.placeholder="Otomatis terisi...",P.autocomplete="off",P.readOnly=!0,P.style.backgroundColor="var(--bg-secondary)";const u=document.createElement("label");u.className="form-label",u.style.marginTop="var(--sp-3)",u.style.fontWeight="800",u.style.color="var(--primary-color)",u.textContent="Validasi Mapping Line";const v=document.createElement("div");v.className="form-input",v.style.backgroundColor="rgba(108, 92, 231, 0.05)",v.style.border="1px dashed rgba(108, 92, 231, 0.3)",v.style.display="flex",v.style.alignItems="center",v.style.minHeight="60px",v.style.height="auto",v.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>';const D=document.createElement("label");D.className="form-label",D.style.marginTop="var(--sp-3)",D.textContent="Qty Aktual (Pcs / Roll)";const M=document.createElement("input");M.type="number",M.className="form-input",M.placeholder="Misal: 500",M.min="1",M.disabled=!S;const B=document.createElement("button");B.className="btn btn-primary",B.style.width="100%",B.style.marginTop="var(--sp-4)",B.textContent="Proses Penarikan ke Line",B.disabled=!S,setTimeout(()=>{const G=document.getElementById("line-selector");G&&G.addEventListener("change",J=>{S=J.target.value,L()})},0),h.addEventListener("input",G=>{if(!S)return;const J=G.target.value.trim();if(J.length>=5){const Q=PMCStore.transitInventory.find(K=>K.barcode===J);if(Q){const K=Q.material;b.value=K;const Z=Q.supplier||"";Z==="-"||!Z?P.value=PMCStore.getSupplierForMaterial(K)||"-":P.value=Z;const ae=PMCStore.materialRecehList&&PMCStore.materialRecehList.includes(K),U=Q.pcs?parseFloat(Q.pcs):Q.palletsAvailable*(PMCStore.getPalletQty?PMCStore.getPalletQty(K):1);ae?(M.value="",M.placeholder=`Maks: ${U} Pcs`,M.disabled=!1):(M.value=U,M.disabled=!0);let V=!1,_=new Set;const N=PMCStore.getBlockLayout();if(Q.blockId&&Q.rowId){const c=N.find(w=>w.id===Q.blockId);if(c&&c.rows){const w=c.rows.find(I=>I.id===Q.rowId);w&&w.lines&&Array.isArray(w.lines)&&(w.lines.forEach(I=>_.add(I)),w.lines.includes(S)&&(V=!0))}}else for(const c of N)if(c.rows)for(const w of c.rows)w.material===K&&w.lines&&Array.isArray(w.lines)&&(w.lines.forEach(I=>_.add(I)),w.lines.includes(S)&&(V=!0));if(V)v.innerHTML=`<span class="badge badge-success" style="padding:var(--sp-2);font-weight:700;">✅ Sesuai dengan Line ${S}</span>`,B.disabled=!1;else{const c=[..._].sort().join(", "),w=Q.blockId&&Q.rowId?`di Blok ${Q.blockId} Baris ${Q.rowId}`:"secara global";v.innerHTML=`<span class="badge badge-danger" style="padding:var(--sp-2);font-weight:700;white-space:pre-wrap;">❌ Barang tidak sesuai dengan Line ${S}.
Lokasi barcode ${w} dialokasikan ke Line [${c||"Tidak ada"}].</span>`,B.disabled=!0}}else PMCStore.lineBarcodes.some(Z=>Z.barcode===J)?v.innerHTML='<span class="badge badge-warning">⚠️ Barcode sudah berada di area produksi line</span>':v.innerHTML='<span class="badge badge-danger">❌ Barcode tidak ditemukan di stok Transit</span>',b.value="",P.value="",M.value="",B.disabled=!0}else b.value="",P.value="",M.value="",M.disabled===!0&&S&&(M.disabled=!1),v.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>',B.disabled=!S});const j=async()=>{if(!S){ToastComponent.show("Pilih Line Produksi terlebih dahulu!","warning");return}const G=h.value.trim(),J=b.value.trim(),Q=parseFloat(M.value)||0,K=PMCStore.materialRecehList&&PMCStore.materialRecehList.includes(J);if(G&&J&&Q>0){if(B.disabled)return;B.disabled=!0,B.textContent="Memproses...",await $(J,Q,G,K),h.value="",b.value="",P.value="",M.value="",M.disabled===!0&&(M.disabled=!1),v.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>',h.focus(),B.disabled=!1,B.textContent="Proses Penarikan ke Line"}else ToastComponent.show("Mohon lengkapi Barcode dan pastikan Qty > 0","warning")};h.addEventListener("keydown",G=>{G.key==="Enter"&&M.focus()}),M.addEventListener("keydown",G=>{G.key==="Enter"&&j()}),B.addEventListener("click",j),E.appendChild(g),E.appendChild(n),E.appendChild(k),E.appendChild(b),E.appendChild(C),E.appendChild(P),E.appendChild(u),E.appendChild(v),E.appendChild(D),E.appendChild(M),E.appendChild(B),p.appendChild(E),y.appendChild(p);const O=document.createElement("div");O.className="card",O.style.minHeight="650px",O.style.display="flex",O.style.flexDirection="column",O.innerHTML='<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📜 Log Penarikan (Transit ➔ Line)</h3>';const q=document.createElement("div");q.id="scan-logs-container",q.style.flex="1",q.style.display="flex",q.style.flexDirection="column",q.style.gap="var(--sp-2)",q.style.overflowY="auto",q.style.maxHeight="550px",O.appendChild(q),y.appendChild(O),a.appendChild(y),d.appendChild(a),m(),S&&setTimeout(()=>{h&&h.focus()},100),PMCStore.off("outboundPendingChanged",L),PMCStore.on("outboundPendingChanged",L),TopbarComponent.render("/produksi/inbound")}async function $(d,a,r,t=!1){const s=new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),y=P.value.trim()||"-";let p;t?p=await PMCStore.receivePartialToLine(S,d,r,a):p=await PMCStore.receiveToLine(S,d,r,a);const T=t?' <span class="badge badge-warning">Recehan</span>':"";e.unshift({time:s,barcode:r,material:d,supplier:y,success:p.success,message:p.success?`Berhasil ditarik ke Line ${S} (${a} Pcs)${T}`:p.message}),e.length>50&&e.pop(),p.success?ToastComponent.show("Berhasil ditarik ke line!","success"):ToastComponent.show("Gagal: "+p.message,"danger"),m()}function m(){const d=document.getElementById("scan-logs-container");if(d){if(e.length===0){d.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas penarikan pada sesi ini.</div>';return}d.innerHTML=e.map(a=>`
      <div style="background:var(--bg-secondary);padding:var(--sp-2) var(--sp-3);border-left:4px solid ${a.success?"var(--success-color)":"var(--danger-color)"};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${a.time}</span>
          <span style="font-weight:600;color:${a.success?"var(--success-color)":"var(--danger-color)"}">${a.success?"✅ DITERIMA":"❌ DITOLAK"}</span>
        </div>
        <div style="font-weight:600;font-size:var(--fs-sm);">${a.barcode} - ${a.material}</div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);display:flex;justify-content:space-between;align-items:center;">
          <span>🏢 Supplier: <strong>${a.supplier}</strong></span>
        </div>
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);">${a.message}</div>
      </div>
    `).join("")}}function l(d){const a=PMCStore.transitOutboundPending.filter(t=>t.destination==="3F1");if(a.length===0){d.innerHTML="";return}let r=`
      <div class="card" style="border: 2px solid var(--primary-color); background: rgba(108, 92, 231, 0.05); margin-bottom: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--primary-color);">
          📥 Terdapat ${a.length} Antrean Penerimaan dari Area Transit (Outbound ke 3F1)
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu Pengiriman</th>
              <th>Target Line</th>
              <th>Barcode</th>
              <th>Material</th>
              <th>Supplier</th>
              <th>Qty (Pcs)</th>
              <th style="width: 200px; text-align: center;">Aksi Penerimaan</th>
            </tr>
          </thead>
          <tbody>
    `;a.forEach(t=>{r+=`
        <tr>
          <td>${t.date} ${t.time}</td>
          <td><span class="badge badge-accent">${t.targetLine||"A"}</span></td>
          <td><strong>${t.barcode}</strong></td>
          <td>${t.material}</td>
          <td><span style="font-size:0.85rem; color:var(--text-secondary);">${t.supplier||"-"}</span></td>
          <td>${t.pcs}</td>
          <td style="text-align: center; display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-primary btn-sm accept-btn" data-id="${t.id}" style="padding: 4px 8px; font-size: 0.8rem;">Terima Barang</button>
            <button class="btn btn-danger btn-sm reject-btn" data-id="${t.id}" style="padding: 4px 8px; font-size: 0.8rem;">Tolak</button>
          </td>
        </tr>
      `}),r+=`
          </tbody>
        </table>
      </div>
    `,d.innerHTML=r,d.querySelectorAll(".accept-btn").forEach(t=>{t.addEventListener("click",async s=>{const y=s.target.getAttribute("data-id");if(confirm("Konfirmasi penerimaan barang ke Line Produksi?")){const p=await PMCStore.verifyTransitOutbound(y,"accept");ToastComponent.show(p.message,p.success?"success":"danger"),L()}})}),d.querySelectorAll(".reject-btn").forEach(t=>{t.addEventListener("click",async s=>{const y=s.target.getAttribute("data-id");if(confirm("Tolak barang ini dan kembalikan truk ke Transit?")){const p=await PMCStore.verifyTransitOutbound(y,"reject");ToastComponent.show(p.message,p.success?"success":"danger"),L()}})})}function o(d){const a=PMCStore.transitInventory.filter(r=>r.reference&&r.reference.startsWith("SPB Manual:"));if(a.length===0){d.innerHTML="";return}d.innerHTML=`
      <div class="card" style="border: 2px solid var(--accent-color); background: rgba(108, 92, 231, 0.05);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--accent-color);">
          📦 Material SPB Manual di Transit (Siap Ditarik ke Line)
        </h3>
        <p style="font-size:var(--fs-xs); color:var(--text-secondary); margin-bottom:var(--sp-3);">
          Berikut adalah material tambahan dari SPB Manual yang sudah disiapkan oleh Gudang. Scan barcode di bawah untuk memasukkannya ke line produksi.
        </p>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--sp-3);">
          ${a.map(r=>`
            <div style="background:var(--bg-secondary); padding:12px; border-radius:var(--radius-md); border-left:4px solid var(--accent-color); display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:1rem;">${r.material}</div>
                <div style="font-family:monospace; color:var(--accent-light); font-size:0.9rem;">🏷️ ${r.barcode}</div>
                <div style="font-size:var(--fs-xs); color:var(--text-muted);">${r.reference}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:bold; color:var(--text-main);">${r.qty} Pcs</div>
                <div style="font-size:10px; color:var(--text-muted);">📍 B${r.blockId}.${r.rowId}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `}return{render:L}})();window.ProduksiInboundPage=lt;const dt=(()=>{let e=[],b="",P="",S="utuh",L=[],$=[{kg:"",sachet:""}],m=[{pcs:""}],l=!0,o=!1;async function d(){try{const t=await PMCStore.safeFetch(`${PMCStore.API_BASE}/master/kamus-opname`);t.ok&&(L=await t.json())}catch(t){console.warn("Gagal memuat kamus opname",t)}}function a(){if(window.location.hash!=="#/produksi/outbound")return;L.length===0&&d(),ChartWrapper.destroyAll();const t=document.getElementById("page-content");t.innerHTML="";const s=document.createElement("div");s.className="page-enter";const y=document.createElement("div");y.className="page-header",y.innerHTML=`
      <div>
        <h2 class="page-title">📤 Retur ke Transit (Outbound Produksi)</h2>
        <p class="page-subtitle">Kembalikan material dari line produksi ke area transit. Pilih Line & Material terlebih dahulu.</p>
      </div>
    `,s.appendChild(y);const p=PMCStore.pendingReturns||[];if(p.length>0){const _=document.createElement("div");_.style.cssText="background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:var(--sp-3) var(--sp-4); margin-bottom:var(--sp-4); display:flex; align-items:center; gap:12px;",_.innerHTML=`
        <span style="font-size:1.5rem;">🔔</span>
        <div>
          <strong style="color:#f59e0b;">${p.length} retur menunggu verifikasi Transit</strong>
          <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:2px;">Pihak transit perlu menerima barang ini di menu Inbound agar status berubah menjadi "Berhasil"</div>
        </div>
      `,s.appendChild(_)}const T=document.createElement("div");T.style.display="grid",T.style.gridTemplateColumns="1.3fr 1fr",T.style.gap="var(--sp-6)",T.style.alignItems="start";const x=document.createElement("div");x.className="card",x.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;">
        <span>📝</span> Form Retur Material
      </h3>
    `;const H=document.createElement("div");H.className="form-group";const A=document.createElement("label");A.className="form-label",A.textContent="1. Pilih Line Produksi";const f=document.createElement("select");f.className="form-input",f.style.color="#fff",f.style.background="rgba(0,0,0,0.2)";const E=new Set;(PMCStore.linePerSku||[]).forEach(_=>{_&&_.line&&E.add(_.line)}),(PMCStore.schedules||[]).forEach(_=>{_&&_.line&&E.add(_.line)}),(PMCStore.getBlockLayout()||[]).forEach(_=>{(_.rows||[]).forEach(N=>{N.assignedLines&&Array.isArray(N.assignedLines)?N.assignedLines.forEach(c=>E.add(c)):N.lines&&Array.isArray(N.lines)&&N.lines.forEach(c=>E.add(c))})}),(PMCStore.lineBarcodes||[]).forEach(_=>{_&&_.line&&E.add(_.line)}),Object.keys(PMCStore.lineStock||{}).forEach(_=>E.add(_));const g=[...E].sort();f.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Line --</option>'+g.map(_=>`<option value="${_}" style="background:#1a1a2e;color:#fff;">Line ${_}</option>`).join("");const h=document.createElement("label");h.className="form-label",h.style.marginTop="var(--sp-3)",h.textContent="2. Pilih Material";const i=document.createElement("select");i.className="form-input",i.style.color="#fff",i.style.background="rgba(0,0,0,0.2)",i.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Line dulu --</option>',i.disabled=!0;const n=document.createElement("label");n.className="form-label",n.style.marginTop="var(--sp-3)",n.textContent="3. Kondisi Material";const k=document.createElement("div");k.style.cssText="display:flex; gap:8px; margin-bottom:4px;";const C=document.createElement("button");C.type="button",C.textContent="✅ Utuh (Ada Barcode)",C.style.cssText="flex:1; padding:10px; border-radius:var(--radius-md); font-weight:700; font-size:var(--fs-sm); cursor:pointer; transition:all 0.2s; border:2px solid var(--success); background:rgba(0,224,163,0.15); color:var(--success);";const u=document.createElement("button");u.type="button",u.textContent="⚠️ Sisa (Tanpa Barcode)",u.style.cssText="flex:1; padding:10px; border-radius:var(--radius-md); font-weight:700; font-size:var(--fs-sm); cursor:pointer; transition:all 0.2s; border:2px solid transparent; background:rgba(245,158,11,0.05); color:var(--text-muted);",k.appendChild(C),k.appendChild(u);const v=document.createElement("div");v.id="dynamic-form-container",v.style.marginTop="var(--sp-4)";const D=document.createElement("label");D.className="form-label",D.style.marginTop="var(--sp-3)",D.innerHTML='Tujuan Blok Transit <span style="color:var(--text-muted);font-size:10px;">(opsional)</span>';const M=document.createElement("select");M.className="form-input",M.id="outbound-target-select",M.style.color="#fff",M.style.background="rgba(0,0,0,0.2)",M.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Otomatis (Blok Sesuai Material) --</option>',M.disabled=!0;const B=document.createElement("button");B.className="btn btn-primary",B.id="outbound-submit-btn",B.style.cssText="width:100%; padding:14px; font-size:1.05rem; margin-top:var(--sp-4); font-weight:bold; background:linear-gradient(45deg, #f59e0b, #ef4444); border:none; box-shadow:0 4px 15px rgba(245,158,11,0.3); color:#fff;",B.textContent="📤 Proses Retur ke Transit",B.disabled=!0;function j(_){S=_,$=[{kg:"",sachet:""}],m=[{pcs:""}],l=!0,o=!1,_==="utuh"?(C.style.border="2px solid var(--success)",C.style.background="rgba(0,224,163,0.15)",C.style.color="var(--success)",u.style.border="2px solid transparent",u.style.background="rgba(245,158,11,0.05)",u.style.color="var(--text-muted)"):(u.style.border="2px solid var(--warning)",u.style.background="rgba(245,158,11,0.15)",u.style.color="var(--warning)",C.style.border="2px solid transparent",C.style.background="rgba(0,224,163,0.05)",C.style.color="var(--text-muted)"),q()}C.addEventListener("click",()=>j("utuh")),u.addEventListener("click",()=>j("sisa")),f.addEventListener("change",_=>{if(b=_.target.value,P="",B.disabled=!0,M.disabled=!0,M.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Otomatis --</option>',!b){i.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Line dulu --</option>',i.disabled=!0,v.innerHTML="";return}const N=PMCStore.lineStock[b]||{},c=Object.keys(N).sort();i.disabled=!1,i.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Material --</option>'+c.map(w=>{const I=parseFloat(N[w].pcs||0);return`<option value="${w}" style="background:#1a1a2e;color:#fff;">${w} (${PMCStore.formatNumber(I)} pcs)</option>`}).join(""),v.innerHTML=""}),i.addEventListener("change",_=>{if(P=_.target.value,!P){v.innerHTML="",B.disabled=!0,M.disabled=!0;return}O(P),q()});function O(_){M.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Otomatis (Blok Sesuai Material) --</option>',M.disabled=!1;const N=PMCStore.transitInfoCache;!N||!N.blocks||N.blocks.forEach(c=>{c.rows&&c.rows.forEach(w=>{const I=w.qty||0;if(I>=w.maxPallets)return;const z=w.material===_||!w.material||I===0,R=w.isFlexible;if(!z&&!R||!R&&w.material&&w.material!==_&&I>0)return;const F=R?" [SLOW]":"",W=w.material&&w.material!=="MIXED STOCK"?` (${w.material})`:R&&I>0?" (Mixed)":"",te=w.maxPallets-I,Y=document.createElement("option");Y.value=w.id,Y.style.background="#1a1a2e",Y.style.color="#fff",Y.textContent=`B${c.blockNumber}.${w.rowNumber}${F}${W} - Sisa ${te} Slot`,M.appendChild(Y)})})}function q(){if(!P||!b){v.innerHTML="";return}S==="utuh"?G():J()}function G(){v.innerHTML=`
        <div style="border:1px solid rgba(0,224,163,0.2); border-radius:var(--radius-md); padding:var(--sp-4); background:rgba(0,224,163,0.03);">
          <h4 style="margin-bottom:var(--sp-3); color:var(--success); display:flex; align-items:center; gap:8px; font-size:0.95rem;">
            🔍 Scan Barcode Palet Utuh
          </h4>
          <div style="background:#000;border-radius:var(--radius-md);height:80px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;margin-bottom:var(--sp-3);">
            <div style="width:80%;height:2px;background:rgba(255,50,50,0.8);box-shadow:0 0 10px red;position:absolute;top:50%;transform:translateY(-50%);animation:scanline 2s infinite alternate;"></div>
            <div style="color:rgba(255,255,255,0.3);font-size:2rem;">[|||]</div>
          </div>
          <style>
            @keyframes scanline { 0% { top: 20%; } 100% { top: 80%; } }
          </style>
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label">No Barcode (Scan)</label>
            <input type="text" id="utuh-barcode" class="form-input" placeholder="Scan barcode dari line..." autocomplete="off" style="color:#fff;" />
          </div>
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label">Qty PCS Aktual</label>
            <input type="number" id="utuh-pcs" class="form-input" placeholder="Otomatis terisi..." style="color:#fff; font-weight:700; font-size:1.1rem;" min="1" />
          </div>
          <div id="utuh-validation" class="form-input" style="background:rgba(108,92,231,0.05); border:1px dashed rgba(108,92,231,0.3); min-height:40px; display:flex; align-items:center;">
            <span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>
          </div>
        </div>
      `;const _=document.getElementById("utuh-barcode"),N=document.getElementById("utuh-pcs"),c=document.getElementById("utuh-validation");_.style.flex="1";const w=CameraScanner.createScanButton(_),I=document.createElement("div");I.style.cssText="display:flex; gap:8px; align-items:stretch; width:100%;",_.parentNode.insertBefore(I,_),I.appendChild(_),I.appendChild(w),_.addEventListener("input",z=>{const R=z.target.value.trim();if(R.length>=5){const F=PMCStore.lineBarcodes.find(W=>W.barcode===R&&W.line===b&&W.material===P);if(F)N.value=parseFloat(F.pcs||0),c.innerHTML=`<span class="badge badge-success" style="padding:var(--sp-2);font-weight:700;">✅ Ditemukan: ${F.material} — ${PMCStore.formatNumber(F.pcs)} pcs</span>`,B.disabled=!1;else{const W=PMCStore.lineBarcodes.find(Y=>Y.barcode===R&&Y.line===b);if(W){c.innerHTML=`<span class="badge badge-warning" style="padding:var(--sp-2);font-weight:700;white-space:pre-wrap;">⚠️ Barcode ditemukan di Line ${b}, tapi material-nya ${W.material} (bukan ${P}).</span>`,B.disabled=!0;return}(PMCStore.transitInventory||[]).some(Y=>Y.barcode===R)?c.innerHTML='<span class="badge badge-warning" style="padding:var(--sp-2);font-weight:700;white-space:pre-wrap;">⚠️ Barcode ini ada di Area Transit, bukan di Line.</span>':c.innerHTML=`<span class="badge badge-danger" style="padding:var(--sp-2);font-weight:700;white-space:pre-wrap;">❌ Barcode tidak ditemukan di Line ${b}.</span>`,N.value="",B.disabled=!0}}else N.value="",c.innerHTML='<span style="color:var(--text-muted);font-style:italic;">Menunggu scan barcode...</span>',B.disabled=!0}),_.addEventListener("keydown",z=>{z.key==="Enter"&&!B.disabled&&Q()}),setTimeout(()=>{_&&_.focus()},100)}function J(){var Y;const _=L.find(X=>X.materialName===P),N=PMCStore.lineStock[b]||{},c=parseFloat(((Y=N[P])==null?void 0:Y.pcs)||0);let w="";$.forEach((X,ee)=>{w+=`
          <tr>
            <td style="text-align:center;">${ee+1}</td>
            <td><input type="number" step="any" class="form-input sisa-kg" data-idx="${ee}" value="${X.kg}" placeholder="Contoh: 2.5"></td>
            <td><input type="number" step="any" class="form-input sisa-sachet" data-idx="${ee}" value="${X.sachet}" placeholder="Contoh: 5"></td>
            <td style="text-align:right; font-weight:bold; font-size:1.1em;" class="sisa-hasil" id="sisa-hasil-${ee}">0</td>
            <td style="text-align:center;">
               <button class="btn-icon sm btn-ghost btn-sisa-del" data-idx="${ee}" ${$.length===1?"disabled":""} title="Hapus Baris">✕</button>
            </td>
          </tr>
        `});let I="";m.forEach((X,ee)=>{I+=`
          <tr>
            <td style="text-align:center;">${ee+1}</td>
            <td><input type="number" step="any" class="form-input sisa-utuh-pcs" data-idx="${ee}" value="${X.pcs}" placeholder="Contoh: 50"></td>
            <td style="text-align:center;">
               <button class="btn-icon sm btn-ghost btn-utuh-row-del" data-idx="${ee}" ${m.length===1?"disabled":""} title="Hapus Baris">✕</button>
            </td>
          </tr>
        `}),v.innerHTML=`
        <div style="border:1px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:var(--sp-4); background:rgba(245,158,11,0.03);">
          <h4 style="margin-bottom:var(--sp-3); color:var(--warning); display:flex; align-items:center; gap:8px; font-size:0.95rem;">
            ⚖️ Alat Bantu Perhitungan Fisik Stok (Sisa)
          </h4>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:var(--sp-3); padding:var(--sp-2) var(--sp-3); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.05);">
            <strong>Material:</strong> ${P} &nbsp;|&nbsp; 
            <strong>Stok Line:</strong> ${PMCStore.formatNumber(c)} pcs
          </div>
          <div id="sisa-kamus-info" style="margin-bottom:var(--sp-3); padding:var(--sp-2) var(--sp-3); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-secondary);"></div>

          <div style="margin-bottom:var(--sp-3); display:flex; gap:var(--sp-4); align-items:center; padding:var(--sp-2); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); width:fit-content;">
            <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:bold;">Mode Hitung:</span>
            <label style="display:flex; align-items:center; gap:var(--sp-2); cursor:pointer;">
              <input type="checkbox" id="cb-sisa-mode" ${l?"checked":""} style="width:18px;height:18px;accent-color:var(--accent);">
              <strong style="color:var(--text-primary); font-size:0.85rem;">Totalan / Konversi Sisa</strong>
            </label>
            <label style="display:flex; align-items:center; gap:var(--sp-2); cursor:pointer;">
              <input type="checkbox" id="cb-utuh-mode" ${o?"checked":""} style="width:18px;height:18px;accent-color:var(--success);">
              <strong style="color:var(--text-primary); font-size:0.85rem;">Totalan Utuh (Pcs)</strong>
            </label>
          </div>

          <!-- TABEL SISA -->
          <div id="sisa-table-wrapper" style="${l?"display:block;":"display:none;"} background:var(--bg-surface); padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid rgba(108,92,231,0.2); margin-bottom:var(--sp-3);">
            <h5 style="margin-bottom:var(--sp-2); border-bottom:1px solid var(--border); padding-bottom:var(--sp-2);">Tabel Sisa</h5>
            <div style="width:100%; overflow-x:auto; margin-bottom:var(--sp-3);">
              <table class="data-table" style="font-size:0.8rem; width:100%; min-width:350px;">
                <thead>
                  <tr>
                    <th style="width:30px; text-align:center;">#</th>
                    <th>Jumlah Berat (kg)</th>
                    <th>Jumlah Roll / Box</th>
                    <th style="text-align:right;">Hasil (Pcs)</th>
                    <th style="width:40px; text-align:center;">Del</th>
                  </tr>
                </thead>
                <tbody>${w}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align:right; font-weight:bold;">Total Sisa:</td>
                    <td id="sisa-total" style="text-align:right; font-weight:bold; color:var(--accent);">0</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-sisa-add" style="width:100%;">➕ Tambah Baris Sisa</button>
          </div>

          <!-- TABEL UTUH -->
          <div id="utuh-table-wrapper" style="${o?"display:block;":"display:none;"} background:var(--bg-surface); padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid rgba(0,224,163,0.2); margin-bottom:var(--sp-3);">
            <h5 style="margin-bottom:var(--sp-2); border-bottom:1px solid var(--border); padding-bottom:var(--sp-2);">Tabel Utuh</h5>
            <div style="width:100%; overflow-x:auto; margin-bottom:var(--sp-3);">
              <table class="data-table" style="font-size:0.8rem; width:100%; min-width:200px;">
                <thead>
                  <tr>
                    <th style="width:30px; text-align:center;">#</th>
                    <th>Jumlah Utuh (Pcs / Roll)</th>
                    <th style="width:40px; text-align:center;">Del</th>
                  </tr>
                </thead>
                <tbody>${I}</tbody>
                <tfoot>
                  <tr>
                    <td style="text-align:right; font-weight:bold;">Total Utuh:</td>
                    <td id="utuh-total" style="text-align:left; font-weight:bold; color:var(--success);">0</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-utuh-row-add" style="width:100%;">➕ Tambah Baris Utuh</button>
          </div>

          <!-- GRAND TOTAL -->
          <div style="display:flex; flex-direction:column; gap:var(--sp-3); padding-top:var(--sp-3); border-top:2px dashed var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge badge-warning" style="font-size:1rem; padding:8px 16px;">GRAND TOTAL FISIK (SISA + UTUH):</span>
              <span id="sisa-grand-total" style="font-size:1.5rem; font-weight:900; color:var(--text-primary);">0 Pcs</span>
            </div>
          </div>
        </div>
      `;const z=document.getElementById("sisa-kamus-info");z&&(_?z.innerHTML=`Berat Utuh = ${_.beratRollUtuh!=null?parseFloat(_.beratRollUtuh):"-"}kg &nbsp;|&nbsp; Berat Core = ${_.beratCore!=null?parseFloat(_.beratCore):"-"}kg`:z.innerHTML='<span style="color:var(--danger);">⚠️ Material ini belum ada di Kamus Opname. Konversi sisa kg→pcs tidak bisa dilakukan. Gunakan mode "Totalan Utuh (Pcs)" saja.</span>'),document.getElementById("cb-sisa-mode").addEventListener("change",X=>{l=X.target.checked,J()}),document.getElementById("cb-utuh-mode").addEventListener("change",X=>{o=X.target.checked,J()});const R=X=>{if(!_||!l)return 0;const ee=$[X],ne=ee.kg===""?0:parseFloat(ee.kg),se=ee.sachet===""?0:parseFloat(ee.sachet);if(isNaN(ne)||isNaN(se))return 0;const oe=parseFloat(_.beratRollUtuh)||1,re=parseFloat(_.beratCore)||0;let ie=(ne-se*re)/oe;ie=Math.max(0,ie);const le=Number(ie.toFixed(2)),ce=document.getElementById(`sisa-hasil-${X}`);return ce&&(ce.textContent=le.toLocaleString("id-ID",{maximumFractionDigits:2})),le},F=()=>{let X=0;l&&$.forEach((ie,le)=>{X+=R(le)});const ee=document.getElementById("sisa-total");ee&&(ee.textContent=X.toLocaleString("id-ID",{maximumFractionDigits:2}));let ne=0;o&&m.forEach(ie=>{const le=ie.pcs===""?0:parseFloat(ie.pcs);isNaN(le)||(ne+=le)});const se=document.getElementById("utuh-total");se&&(se.textContent=ne.toLocaleString("id-ID",{maximumFractionDigits:2}));const oe=X+ne,re=document.getElementById("sisa-grand-total");return re&&(re.textContent=oe.toLocaleString("id-ID",{maximumFractionDigits:2})+" Pcs"),B.disabled=oe<=0,oe};v.querySelectorAll(".sisa-kg, .sisa-sachet").forEach(X=>{X.addEventListener("input",F),X.addEventListener("change",ee=>{const ne=parseInt(ee.target.dataset.idx);ee.target.classList.contains("sisa-kg")?$[ne].kg=ee.target.value:$[ne].sachet=ee.target.value})}),v.querySelectorAll(".btn-sisa-del").forEach(X=>{X.addEventListener("click",ee=>{$.splice(parseInt(ee.currentTarget.dataset.idx),1),J()})});const W=document.getElementById("btn-sisa-add");W&&W.addEventListener("click",()=>{$.push({kg:"",sachet:""}),J()}),v.querySelectorAll(".sisa-utuh-pcs").forEach(X=>{X.addEventListener("input",F),X.addEventListener("change",ee=>{m[parseInt(ee.target.dataset.idx)].pcs=ee.target.value})}),v.querySelectorAll(".btn-utuh-row-del").forEach(X=>{X.addEventListener("click",ee=>{m.splice(parseInt(ee.currentTarget.dataset.idx),1),J()})});const te=document.getElementById("btn-utuh-row-add");te&&te.addEventListener("click",()=>{m.push({pcs:""}),J()}),F()}async function Q(){const _=document.getElementById("utuh-barcode"),N=document.getElementById("utuh-pcs");if(!_||!N)return;const c=_.value.trim(),w=parseFloat(N.value);if(!c||!w||w<=0){ToastComponent.show("Mohon scan barcode dan isi Qty PCS valid.","warning");return}B.disabled=!0,B.innerHTML='<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></div> Memproses...';const I=M.value||null,z=await PMCStore.returnFromLine(c,w,I,"utuh");Z(c,P,b,w,"✅ UTUH",M.value,z),ae()}async function K(){var F;let _=0;if(l){const W=L.find(te=>te.materialName===P);W&&$.forEach(te=>{const Y=te.kg===""?0:parseFloat(te.kg),X=te.sachet===""?0:parseFloat(te.sachet);if(!isNaN(Y)&&!isNaN(X)){const ee=parseFloat(W.beratRollUtuh)||1,ne=parseFloat(W.beratCore)||0;_+=Math.max(0,(Y-X*ne)/ee)}})}let N=0;o&&m.forEach(W=>{const te=W.pcs===""?0:parseFloat(W.pcs);isNaN(te)||(N+=te)});const c=Number((_+N).toFixed(2));if(c<=0){ToastComponent.show("Grand total harus lebih dari 0.","warning");return}const w=PMCStore.lineStock[b]||{},I=parseFloat(((F=w[P])==null?void 0:F.pcs)||0);if(c>I){ToastComponent.show(`Grand total (${c}) melebihi stok line (${I}).`,"warning");return}B.disabled=!0,B.innerHTML='<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></div> Memproses...';const z=M.value||null,R=await PMCStore.returnSisaFromLine(b,P,c,z);Z("SISA (Virtual)",P,b,c,"⚠️ SISA",M.value,R),ae()}function Z(_,N,c,w,I,z,R){const F=new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});let W="Otomatis";if(z){const te=PMCStore.transitInfoCache;if(te&&te.blocks)for(const Y of te.blocks){const X=(Y.rows||[]).find(ee=>ee.id===z);if(X){W=`B${Y.blockNumber}.${X.rowNumber}${X.isFlexible?" [SLOW]":""}`;break}}}e.unshift({time:F,material:`${_} - ${N}`,pcs:w,condition:I,target:W,success:R.success,message:R.success?`Retur dari Line ${c} → ${W} | ${I} | ${PMCStore.formatNumber(w)} pcs — Menunggu verifikasi Transit`:R.message}),e.length>50&&e.pop(),R.success?ToastComponent.show("Retur berhasil diajukan! Menunggu verifikasi transit.","success"):ToastComponent.show("Gagal: "+R.message,"danger"),r()}function ae(){S="utuh",$=[{kg:"",sachet:""}],m=[{pcs:""}],l=!0,o=!1,v.innerHTML="",M.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Otomatis --</option>',M.disabled=!0,B.disabled=!0,B.innerHTML="📤 Proses Retur ke Transit",j("utuh"),P&&(q(),O(P))}B.addEventListener("click",()=>{S==="utuh"?Q():K()}),H.appendChild(A),H.appendChild(f),H.appendChild(h),H.appendChild(i),H.appendChild(n),H.appendChild(k),H.appendChild(v),H.appendChild(D),H.appendChild(M),H.appendChild(B),x.appendChild(H),T.appendChild(x);const U=document.createElement("div");U.className="card",U.style.minHeight="650px",U.style.display="flex",U.style.flexDirection="column",U.innerHTML='<h3 style="margin-bottom:var(--sp-3);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border);">📜 Log Retur (Line ➔ Transit)</h3>';const V=document.createElement("div");V.id="scan-logs-container",V.style.flex="1",V.style.display="flex",V.style.flexDirection="column",V.style.gap="var(--sp-2)",V.style.overflowY="auto",V.style.maxHeight="550px",U.appendChild(V),T.appendChild(U),s.appendChild(T),t.appendChild(s),r(),TopbarComponent.render("/produksi/outbound")}function r(){const t=document.getElementById("scan-logs-container");if(t){if(e.length===0){t.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada aktivitas retur pada sesi ini.</div>';return}t.innerHTML=e.map(s=>`
      <div style="background:var(--bg-surface-2);padding:var(--sp-3);border-left:4px solid ${s.success?"var(--warning)":"var(--danger)"};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${s.time}</span>
          <span style="font-weight:600;color:${s.success?"var(--warning)":"var(--danger)"}">${s.success?"🔄 MENUNGGU VERIFIKASI":"❌ GAGAL"}</span>
        </div>
        <div style="font-weight:600;font-size:var(--fs-sm);">${s.material}</div>
        ${s.success?`
          <div style="display:flex;gap:8px;font-size:var(--fs-xs);flex-wrap:wrap;">
            <span style="background:rgba(245,158,11,0.12);color:#f59e0b;padding:2px 8px;border-radius:100px;font-weight:600;">${s.condition}</span>
            <span style="background:rgba(0,210,255,0.12);color:var(--accent);padding:2px 8px;border-radius:100px;font-weight:600;">${PMCStore.formatNumber(s.pcs)} pcs</span>
            <span style="background:rgba(0,224,163,0.12);color:var(--success);padding:2px 8px;border-radius:100px;font-weight:600;">→ ${s.target}</span>
          </div>
        `:""}
        <div style="font-size:var(--fs-xs);color:var(--text-secondary);">${s.message}</div>
      </div>
    `).join("")}}return{render:a}})();window.ProduksiOutboundPage=dt;const ct=(()=>{let e="",b="",P="Handling";const S=["Handling","3M","Lantech","Gantry","Afkir"];function L(){if(window.location.hash!=="#/produksi/reject")return;ChartWrapper.destroyAll();const l=document.getElementById("page-content");l.innerHTML="";const o=document.createElement("div");o.className="page-enter";const d=document.createElement("div");d.className="page-header",d.innerHTML=`
      <div>
        <h2 class="page-title">🗑️ Reject Out (Afkir Line)</h2>
        <p class="page-subtitle">Pilih line dan material untuk mengajukan pembuangan (Rijek). Pemotongan stok memerlukan verifikasi Transit.</p>
      </div>
    `,o.appendChild(d);const a=document.createElement("div");a.style.display="grid",a.style.gridTemplateColumns="380px 1fr",a.style.gap="var(--sp-6)",a.style.alignItems="start";const r=document.createElement("div");r.className="card",r.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;">
        <span>📝</span> Form Pengajuan Rijek
      </h3>
    `;const t=document.createElement("div");t.className="form-group";const s=document.createElement("label");s.className="form-label",s.textContent="Pilih Line Produksi";const y=document.createElement("select");y.className="form-input",y.style.color="#fff",y.style.background="rgba(0,0,0,0.2)";const p=Object.keys(PMCStore.lineStock||{}).sort();y.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Line --</option>'+p.map(u=>`<option value="${u}" style="background:#1a1a2e;color:#fff;">Line ${u}</option>`).join("");const T=document.createElement("label");T.className="form-label",T.style.marginTop="var(--sp-3)",T.textContent="Pilih Material";const x=document.createElement("select");x.className="form-input",x.style.color="#fff",x.style.background="rgba(0,0,0,0.2)",x.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Material --</option>',x.disabled=!0;const H=document.createElement("label");H.className="form-label",H.style.marginTop="var(--sp-3)",H.innerHTML='Qty Barang Rijek / Afkir (<span id="max-pcs-label" style="color:var(--warning-color);">Max: - PCS</span>)';const A=document.createElement("input");A.type="number",A.className="form-input",A.placeholder="Jumlah pcs yang di-reject...",A.autocomplete="off",A.style.color="#fff",A.style.fontSize="1.1rem",A.style.fontWeight="700",A.min="1";const f=document.createElement("label");f.className="form-label",f.style.marginTop="var(--sp-3)",f.textContent="Kriteria Rijek";const E=document.createElement("select");E.className="form-input",E.style.color="#fff",E.style.background="rgba(0,0,0,0.2)",S.forEach(u=>{const v=document.createElement("option");v.value=u,v.textContent=u,v.style.background="#1a1a2e",v.style.color="#fff",E.appendChild(v)}),E.value=P,E.addEventListener("change",u=>P=u.target.value);let g=0;y.addEventListener("change",u=>{if(e=u.target.value,b="",A.value="",g=0,document.getElementById("max-pcs-label").innerText="Max: - PCS",!e){x.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Material --</option>',x.disabled=!0,h.disabled=!0;return}const v=Object.keys(PMCStore.lineStock[e]||{});x.innerHTML='<option value="" style="color:#fff;background:#1a1a2e;">-- Pilih Material --</option>'+v.map(D=>`<option value="${D}" style="background:#1a1a2e;color:#fff;">${D}</option>`).join(""),x.disabled=!1,h.disabled=!0}),x.addEventListener("change",u=>{if(b=u.target.value,b){const v=(PMCStore.lineStock[e]||{})[b];g=v?parseFloat(v.pcs||0):0,document.getElementById("max-pcs-label").innerText=`Max: ${PMCStore.formatNumber(g)} PCS`,h.disabled=!1}else g=0,document.getElementById("max-pcs-label").innerText="Max: - PCS",h.disabled=!0});const h=document.createElement("button");h.className="btn btn-primary",h.style.cssText="width:100%; padding:14px; font-size:1.05rem; margin-top:var(--sp-4); font-weight:bold; background:linear-gradient(45deg, #ec4899, #ef4444); border:none; box-shadow:0 4px 15px rgba(236,72,153,0.3); color:#fff;",h.textContent="📤 Ajukan Verifikasi Rijek",h.disabled=!0;const i=async()=>{const u=parseFloat(A.value);if(!e||!b||h.disabled){ToastComponent.show("Mohon pilih Line dan Material","warning");return}if(!u||u<=0||u>g){ToastComponent.show(`Mohon isi Qty PCS yang valid (Maks: ${g})`,"warning"),A.focus();return}h.disabled=!0,h.innerHTML='<div class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></div> Mengajukan...',await $(e,b,u,P),A.value="",h.disabled=!1,h.innerHTML="📤 Ajukan Verifikasi Rijek",m()};h.addEventListener("click",i),t.appendChild(s),t.appendChild(y),t.appendChild(T),t.appendChild(x),t.appendChild(H),t.appendChild(A),t.appendChild(f),t.appendChild(E),t.appendChild(h),r.appendChild(t),a.appendChild(r);const n=document.createElement("div");n.className="card",n.style.minHeight="650px",n.style.display="flex",n.style.flexDirection="column",n.innerHTML='<h3 style="margin-bottom:var(--sp-4);padding-bottom:var(--sp-2);border-bottom:1px solid var(--border-color);">📊 Laporan Rijek Hari Ini</h3>';const k=document.createElement("div");k.id="reject-summary-container",k.style.display="flex",k.style.gap="var(--sp-2)",k.style.flexWrap="wrap",k.style.marginBottom="var(--sp-4)",n.appendChild(k),n.innerHTML+='<h4 style="margin-bottom:var(--sp-2);color:var(--text-secondary);">📜 Log Rijek Terakhir</h4>';const C=document.createElement("div");C.id="reject-logs-container",C.style.flex="1",C.style.display="flex",C.style.flexDirection="column",C.style.gap="var(--sp-2)",C.style.overflowY="auto",C.style.maxHeight="450px",n.appendChild(C),a.appendChild(n),o.appendChild(a),l.appendChild(o),m(),TopbarComponent.render("/produksi/reject")}async function $(l,o,d,a){const r=await PMCStore.rejectFromLine(l,o,d,a);r.success?ToastComponent.show("Rijek berhasil diajukan ke Transit.","success"):ToastComponent.show("Gagal: "+r.message,"danger")}async function m(){const l=document.getElementById("reject-logs-container"),o=document.getElementById("reject-summary-container");if(!l||!o)return;const d=await PMCStore.getLineRejects(""),a={};S.forEach(t=>a[t]=0);let r=0;if(d.filter(t=>t.status!=="rejected").forEach(t=>{a[t.reason]!==void 0?a[t.reason]+=parseFloat(t.pcs||0):a[t.reason]=parseFloat(t.pcs||0),r+=parseFloat(t.pcs||0)}),o.innerHTML=S.map(t=>`
      <div style="flex:1; min-width:80px; background:rgba(236, 72, 153, 0.1); border:1px solid rgba(236,72,153,0.3); padding:var(--sp-2); border-radius:var(--radius-sm); text-align:center;">
        <div style="font-size:var(--fs-xs); color:var(--text-secondary);">${t}</div>
        <div style="font-size:1.1rem; font-weight:700; color:#ec4899;">${PMCStore.formatNumber(a[t])}</div>
      </div>
    `).join("")+`
      <div style="flex:1; min-width:80px; background:rgba(255, 61, 113, 0.2); border:1px solid rgba(255,61,113,0.5); padding:var(--sp-2); border-radius:var(--radius-sm); text-align:center;">
        <div style="font-size:var(--fs-xs); color:var(--text-primary);">Total Hari Ini</div>
        <div style="font-size:1.1rem; font-weight:800; color:#ff3d71;">${PMCStore.formatNumber(r)}</div>
      </div>
    `,d.length===0){l.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:var(--sp-4);font-size:var(--fs-sm);">Belum ada pengajuan rijek hari ini.</div>';return}l.innerHTML=d.map(t=>{const s=t.time?t.time.substring(11,19):"?";let y="var(--warning-color)",p="⏳ Menunggu Verifikasi";return t.status==="approved"?(y="var(--success-color)",p="✅ Disetujui (Terpotong)"):t.status==="rejected"&&(y="var(--danger-color)",p="❌ Ditolak"),`
      <div style="background:var(--bg-secondary);padding:var(--sp-3);border-left:4px solid ${y};border-radius:var(--radius-sm);display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--text-muted);">
          <span>⏱ ${s} | Line ${t.line}</span>
          <span style="font-weight:600;color:${y};">${p}</span>
        </div>
        <div style="font-weight:600;font-size:var(--fs-sm);">${t.materialName}</div>
        <div style="display:flex;gap:8px;font-size:var(--fs-xs);flex-wrap:wrap;">
          <span style="background:rgba(236,72,153,0.12);color:#ec4899;padding:2px 8px;border-radius:100px;font-weight:600;">${t.reason}</span>
          <span style="background:rgba(245,158,11,0.12);color:var(--warning-color);padding:2px 8px;border-radius:100px;font-weight:600;">${PMCStore.formatNumber(t.pcs)} pcs</span>
        </div>
      </div>
    `}).join("")}return{render:L}})();window.ProduksiRejectPage=ct;const pt=(()=>{let e="";function b(){if(window.location.hash!=="#/produksi/onhand")return;ChartWrapper.destroyAll();const P=document.getElementById("page-content");P.innerHTML="";const S=document.createElement("div");S.className="page-enter";const L=document.createElement("div");L.className="page-header",L.innerHTML=`
      <div>
        <h2 class="page-title">📦 Stock On Hand (Produksi Line)</h2>
        <p class="page-subtitle">Pantau ketersediaan material per line produksi secara real-time</p>
      </div>
    `,S.appendChild(L);const $=new Set;(PMCStore.linePerSku||[]).forEach(f=>{f&&f.line&&$.add(f.line)}),(PMCStore.schedules||[]).forEach(f=>{f&&f.line&&$.add(f.line)}),(PMCStore.getBlockLayout()||[]).forEach(f=>{(f.rows||[]).forEach(E=>{E.assignedLines&&Array.isArray(E.assignedLines)?E.assignedLines.forEach(g=>$.add(g)):E.lines&&Array.isArray(E.lines)&&E.lines.forEach(g=>$.add(g))})}),(PMCStore.lineBarcodes||[]).forEach(f=>{f&&f.line&&$.add(f.line)}),Object.keys(PMCStore.lineStock||{}).forEach(f=>$.add(f));const l=[...$].sort();!e&&l.length>0&&(e=l[0]);const o=document.createElement("div");o.style.display="flex",o.style.alignItems="center",o.style.gap="12px",o.style.marginBottom="var(--sp-4)";const d=document.createElement("span");d.style.fontSize="var(--fs-sm)",d.style.fontWeight="600",d.textContent="🏢 Pilih Line Produksi:",o.appendChild(d);const a=document.createElement("select");if(a.className="form-input",a.style.width="auto",a.style.minWidth="200px",l.length===0?a.innerHTML='<option value="">-- Tidak ada data --</option>':l.forEach(f=>{a.innerHTML+=`<option value="${f}" ${e===f?"selected":""}>Line ${f}</option>`}),a.addEventListener("change",f=>{e=f.target.value,b()}),o.appendChild(a),S.appendChild(o),!e){S.appendChild(document.createElement("br"));const f=document.createElement("div");f.className="alert alert-info",f.textContent="Belum ada data line atau material dialokasikan.",S.appendChild(f),P.appendChild(S),TopbarComponent.render("/produksi/onhand");return}const r=PMCStore.lineStock[e]||{},t=PMCStore.getLineBarcodes(e),s=Object.values(r).reduce((f,E)=>f+E.qty,0),y=t.length,p=document.createElement("div");p.style.display="grid",p.style.gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))",p.style.gap="var(--sp-4)",p.style.marginBottom="var(--sp-6)",p.innerHTML=`
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(108, 92, 231, 0.1);color:var(--primary-color);">📦</div>
        <div>
          <div class="stat-value">${s}</div>
          <div class="stat-label">Total Material (Pallet)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(16, 185, 129, 0.1);color:var(--success-color);">📋</div>
        <div>
          <div class="stat-value">${y}</div>
          <div class="stat-label">Total Barcode Aktif</div>
        </div>
      </div>
    `,S.appendChild(p);const T=document.createElement("div");T.className="card",T.innerHTML=`<h3 style="margin-bottom:var(--sp-4);">Tabel Stok Line ${e}</h3>`;const x=document.createElement("div");x.className="data-table",x.style.width="100%";let H="";const A=Object.keys(r).sort();A.length===0?H=`<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:var(--sp-4);">Tidak ada stok di Line ${e}</td></tr>`:A.forEach(f=>{const E=r[f],h=t.filter(i=>i.material===f).map(i=>`<span class="badge badge-primary" style="font-size:10px;" title="Supplier: ${i.supplier}
In: ${i.timeIn} (${i.dateIn})">${i.barcode}</span>`).join(" ");H+=`
          <tr>
            <td style="font-weight:600;">${f}</td>
            <td><strong>${E.qty}</strong> Pallet</td>
            <td><strong>${PMCStore.formatNumber(E.pcs)}</strong> ${PMCStore.getMaterialUOM(f)}</td>
            <td>${h||"-"}</td>
          </tr>
        `}),x.innerHTML=`
      <table style="width:100%;border-collapse:collapse;text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid var(--border-color);color:var(--text-secondary);font-size:var(--fs-sm);">
            <th style="padding:var(--sp-3) var(--sp-2);">Material</th>
            <th style="padding:var(--sp-3) var(--sp-2);">Qty (Pallet)</th>
            <th style="padding:var(--sp-3) var(--sp-2);">Qty (Pcs)</th>
            <th style="padding:var(--sp-3) var(--sp-2);">Barcode Aktif (Hover for info)</th>
          </tr>
        </thead>
        <tbody>
          ${H}
        </tbody>
      </table>
    `,T.appendChild(x),S.appendChild(T),P.appendChild(S),TopbarComponent.render("/produksi/onhand")}return PMCStore.on("linePerSkuChanged",()=>{window.location.hash==="#/produksi/onhand"&&b()}),PMCStore.on("stockChanged",()=>{window.location.hash==="#/produksi/onhand"&&b()}),PMCStore.on("layoutChanged",()=>{window.location.hash==="#/produksi/onhand"&&b()}),PMCStore.on("scheduleChanged",()=>{window.location.hash==="#/produksi/onhand"&&b()}),{render:b}})();window.ProduksiOnhandPage=pt;const ut=(()=>{let e=[],b=!1,P=null,S={currentPage:1,totalPages:1};async function L(d=1){const a=new Date().toISOString().split("T")[0],r=await PMCStore.getBppHistory(a,d,50);e=r.data||[],S=r.metadata||{currentPage:1,totalPages:1},l()}function $(){if(window.location.hash!=="#/produksi/bpp")return;ChartWrapper.destroyAll();const d=document.getElementById("page-content");d.innerHTML="";const a=document.createElement("div");a.className="page-enter";const r=document.createElement("div");r.className="page-header",r.innerHTML=`
      <div>
        <h2 class="page-title">📝 BPP (Verifikasi Hasil Produksi)</h2>
        <p class="page-subtitle">Input hasil produksi (BPP) untuk memotong otomatis stok raw material dari line produksi.</p>
      </div>
    `,a.appendChild(r);const t=document.createElement("div");t.style.display="grid",t.style.gridTemplateColumns="1fr 2fr",t.style.gap="var(--sp-6)",t.style.alignItems="start";const s=document.createElement("div");s.className="card",s.id="bpp-form-card",t.appendChild(s);const y=document.createElement("div");y.className="card",y.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2);">📜 Riwayat BPP Hari Ini</h3>
      <div id="bpp-table-container" style="overflow-x:auto;"></div>
    `,t.appendChild(y),a.appendChild(t),d.appendChild(a),m(),L(),TopbarComponent.render("/produksi/bpp"),PMCStore.off&&(PMCStore.off("skuChanged",m),PMCStore.off("linePerSkuChanged",m),PMCStore.off("scheduleChanged",m)),PMCStore.on&&(PMCStore.on("skuChanged",m),PMCStore.on("linePerSkuChanged",m),PMCStore.on("scheduleChanged",m))}function m(){const d=document.getElementById("bpp-form-card");if(!d)return;const a=new Date().toISOString().split("T")[0],r=new Set;(typeof PMCStore.getLinePerSku=="function"?PMCStore.getLinePerSku():[]).forEach(E=>{E.line&&r.add(E.line)});const s=Array.isArray(PMCStore.schedules)?PMCStore.schedules:[];s.forEach(E=>{E.line&&r.add(E.line)});const y=[...r].sort();d.innerHTML=`
      <h3 id="form-title" style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2); display:flex; justify-content:space-between;">
        <span>${b?"✏️ Edit Data BPP":"➕ Input BPP Baru"}</span>
        ${b?'<button id="btn-cancel-edit" class="btn btn-sm btn-danger">Batal Edit</button>':""}
      </h3>
      
      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Tanggal Produksi</label>
        <input type="date" id="bpp-date" class="form-input" value="${a}" ${b?"disabled":""}>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Line Produksi</label>
        <select id="bpp-line" class="form-input" ${b?"disabled":""}>
          <option value="">-- Pilih Line --</option>
          ${y.map(E=>`<option value="${E}">${E}</option>`).join("")}
        </select>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">SKU Produk Jadi</label>
        <select id="bpp-sku" class="form-input">
          <option value="">-- Pilih Line Dahulu --</option>
        </select>
      </div>

      <div id="schedule-warning" style="display:none; padding:var(--sp-3); background:var(--danger-color); color:white; border-radius:var(--radius-sm); margin-bottom:var(--sp-3); font-size:14px; font-weight:bold;">
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Nomor BPP (Opsional)</label>
        <input type="text" id="bpp-number" class="form-input" placeholder="Otomatis jika kosong..." ${b?"disabled":""}>
      </div>

      <div style="display:flex; gap:var(--sp-3); margin-bottom:var(--sp-4);">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Shift</label>
          <select id="bpp-shift" class="form-input" ${b?"disabled":""}>
            <option value="1">Shift 1</option>
            <option value="2">Shift 2</option>
            <option value="3">Shift 3</option>
          </select>
        </div>
        <div class="form-group" style="flex:2;">
          <label class="form-label">Transfer Qty (BOX)</label>
          <input type="number" id="bpp-qty" class="form-input" min="1" placeholder="Misal: 100">
        </div>
      </div>

      <button id="btn-submit" class="btn btn-primary" style="width:100%; font-weight:bold;">
        ${b?"💾 Simpan Perubahan":"✔️ Proses Potong RM & Simpan BPP"}
      </button>
    `,b&&document.getElementById("btn-cancel-edit").addEventListener("click",()=>{b=!1,P=null,m()});const p=document.getElementById("bpp-line"),T=document.getElementById("bpp-sku"),x=document.getElementById("bpp-date"),H=document.getElementById("schedule-warning"),A=()=>{const E=p.value,g=x.value;if(!E||!g){T.innerHTML='<option value="">-- Pilih Line Dahulu --</option>';return}const h=s.filter(C=>C.date===g&&C.line===E),i=new Set(h.map(C=>C.skuId)),k=(Array.isArray(PMCStore.skuList)?PMCStore.skuList:[]).filter(C=>i.has(C.id));k.length===0?T.innerHTML='<option value="">-- Tidak ada SKU terjadwal --</option>':(T.innerHTML=`
          <option value="">-- Pilih SKU (${k.length}) --</option>
          ${k.map(C=>`<option value="${C.id}">${C.code} - ${C.name}</option>`).join("")}
        `,k.length===1&&(T.value=k[0].id))},f=async()=>{const E=p.value,g=T.value,h=x.value;if(E&&g&&h){H.style.display="none";const i=await PMCStore.verifyBppSku(h,E,g);i.match||(H.style.display="block",H.innerHTML=`⚠️ PERINGATAN: ${i.message}<br><small style="font-weight:normal;">Tetap dapat dilanjutkan jika memang diperlukan.</small>`)}};p.addEventListener("change",()=>{A(),f()}),x.addEventListener("change",()=>{A(),f()}),T.addEventListener("change",f),p.value&&A(),b&&p.value&&setTimeout(()=>{A(),setTimeout(()=>{const E=e.find(g=>g.id===P);E&&(T.value=E.skuId)},50)},0),document.getElementById("btn-submit").addEventListener("click",async()=>{const E=p.value,g=T.value,h=x.value,i=document.getElementById("bpp-number").value,n=parseInt(document.getElementById("bpp-qty").value,10),k=parseInt(document.getElementById("bpp-shift").value,10);if(!E||!g||!h||!n||n<=0){ToastComponent.show("Mohon lengkapi semua data wajib","warning");return}const C=document.getElementById("btn-submit");C.disabled=!0,C.textContent="Memproses...";let u;b?u=await PMCStore.editBpp(P,{qty:n,skuId:g}):u=await PMCStore.submitBpp({line:E,skuId:g,date:h,qty:n,shift:k,bppNumber:i}),C.disabled=!1,C.textContent=b?"💾 Simpan Perubahan":"✔️ Proses Potong RM & Simpan BPP",u.success?(ToastComponent.show(b?"BPP berhasil di-edit!":"BPP berhasil disimpan!","success"),b=!1,P=null,m(),L()):ToastComponent.show("Gagal: "+u.message,"danger")})}function l(){const d=document.getElementById("bpp-table-container");if(!d)return;if(e.length===0){d.innerHTML='<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Belum ada riwayat hari ini.</div>';return}let a=`
      <table class="data-table">
        <thead>
          <tr>
            <th>BPP Number</th>
            <th>Tgl / Shift</th>
            <th>Line</th>
            <th>Produk (SKU)</th>
            <th>Qty (BOX)</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
    `;e.forEach(s=>{const y=PMCStore.skuList?PMCStore.skuList.find(x=>x.id===s.skuId):null,p=y?`${y.code} - ${y.name}`:s.skuId,T=new Date(s.createdAt).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});a+=`
        <tr>
          <td><strong>${s.bppNumber}</strong><br><small style="color:var(--text-muted);">${T}</small></td>
          <td>${s.date.split("T")[0]} / Shift ${s.shift}</td>
          <td><span class="badge badge-accent">${s.line}</span></td>
          <td>${p}</td>
          <td>${s.qty}</td>
          <td><span class="badge ${s.status==="edited"?"badge-warning":"badge-success"}">${s.status.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-sm btn-primary edit-bpp-btn" data-id="${s.id}" data-obj='${JSON.stringify(s)}' style="font-size:12px; padding:4px 8px;">Edit</button>
            <button class="btn btn-sm btn-secondary view-bpp-btn" data-id="${s.id}" data-obj='${JSON.stringify(s.items)}' style="font-size:12px; padding:4px 8px;">Audit BOM</button>
          </td>
        </tr>
      `}),a+="</tbody></table>",S&&S.totalPages>1&&(a+=`
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--sp-3);">
          <div style="font-size:14px; color:var(--text-muted);">
            Halaman ${S.currentPage} dari ${S.totalPages} (Total ${S.totalCount} data)
          </div>
          <div style="display:flex; gap:var(--sp-2);">
            <button class="btn btn-sm btn-secondary" id="btn-prev-page" ${S.currentPage<=1?"disabled":""}>&laquo; Sebelumnya</button>
            <button class="btn btn-sm btn-secondary" id="btn-next-page" ${S.currentPage>=S.totalPages?"disabled":""}>Selanjutnya &raquo;</button>
          </div>
        </div>
      `),d.innerHTML=a;const r=document.getElementById("btn-prev-page"),t=document.getElementById("btn-next-page");r&&r.addEventListener("click",()=>{S.currentPage>1&&L(S.currentPage-1)}),t&&t.addEventListener("click",()=>{S.currentPage<S.totalPages&&L(S.currentPage+1)}),d.querySelectorAll(".edit-bpp-btn").forEach(s=>{s.addEventListener("click",y=>{const p=JSON.parse(y.target.getAttribute("data-obj"));b=!0,P=p.id,m(),setTimeout(()=>{document.getElementById("bpp-date").value=p.date.split("T")[0],document.getElementById("bpp-line").value=p.line,document.getElementById("bpp-number").value=p.bppNumber,document.getElementById("bpp-shift").value=p.shift,document.getElementById("bpp-qty").value=p.qty,document.getElementById("bpp-line").disabled=!0,document.getElementById("bpp-date").disabled=!0,document.getElementById("bpp-number").disabled=!0,document.getElementById("bpp-shift").disabled=!0},100)})}),d.querySelectorAll(".view-bpp-btn").forEach(s=>{s.addEventListener("click",y=>{const p=JSON.parse(y.target.getAttribute("data-obj"));o(p)})})}function o(d){let a="";d.forEach(t=>{a+=`<tr><td>${t.materialName}</td><td style="text-align:right;">${parseFloat(t.qtyDeducted).toFixed(2)}</td></tr>`});const r=`
      <div id="bpp-audit-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:10000;">
        <div style="background:var(--bg-main); padding:var(--sp-5); border-radius:var(--radius-lg); width:90%; max-width:500px;">
          <h3 style="margin-bottom:var(--sp-3);">📜 Audit Potongan Material BPP</h3>
          <p style="color:var(--text-muted); font-size:14px; margin-bottom:var(--sp-4);">Daftar raw material yang otomatis terpotong berdasarkan konversi BOM.</p>
          <table class="data-table" style="margin-bottom:var(--sp-4);">
            <thead><tr><th>Material</th><th style="text-align:right;">Qty Dipotong (PCS)</th></tr></thead>
            <tbody>${a}</tbody>
          </table>
          <button id="close-audit-modal" class="btn btn-secondary" style="width:100%;">Tutup</button>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",r),document.getElementById("close-audit-modal").addEventListener("click",()=>{document.getElementById("bpp-audit-modal").remove()})}return{render:$}})();window.ProduksiBppPage=ut;const mt=(()=>{let e={startDate:"",endDate:"",material:"ALL",line:"ALL"};async function b(){if(window.location.hash!=="#/produksi/mutation")return;ChartWrapper.destroyAll();const P=document.getElementById("page-content");P.innerHTML="";const S=document.createElement("div");S.className="page-enter";try{let A=function(){if(typeof XLSX>"u"){ToastComponent.show("Library Excel belum dimuat!","error");return}const f=e.startDate||e.endDate?`${e.startDate||"Awal"} s/d ${e.endDate||"Akhir"}`:"Semua Waktu",E=[["Laporan Mutasi Stok Produksi (Line)"],["Filter Tanggal:",f],["Filter Material:",e.material],["Filter Line:",e.line],[],["Material","UOM","Saldo Awal","Masuk (Transit)","Pakai (BPP)","Retur","Rijek","Adj (Opname)","Saldo Akhir","Stok Aktual","Selisih"]];x.forEach(i=>{E.push([i.material,i.uom,i.initial,i.inbound,i.consume,i.returnOut,i.reject,i.adjust,i.final,i.actualStock!==null?i.actualStock:"-",i.selisih!==null?i.selisih:0])});const g=XLSX.utils.aoa_to_sheet(E),h=XLSX.utils.book_new();XLSX.utils.book_append_sheet(h,g,"Mutasi Produksi"),XLSX.writeFile(h,"Mutasi_Stok_Produksi.xlsx"),ToastComponent.show("Berhasil diekspor ke Excel","success")};const L=document.createElement("div");L.className="page-header",L.innerHTML=`
        <div>
          <h2 class="page-title">📝 Mutasi Stok Produksi (Line)</h2>
          <p class="page-subtitle">Laporan pergerakan stok bahan baku di lini produksi: Penerimaan, Pemakaian (BPP), Retur, Rijek, dan Opname.</p>
        </div>
        <div style="display:flex; gap: 8px;">
          <button id="btn-export-line-excel" class="btn btn-success">⬇️ Export Excel</button>
        </div>
      `,S.appendChild(L),await PMCStore.loadLineMutationsFromAPI(e),PMCStore.loadLineMutationReportFromAPI&&await PMCStore.loadLineMutationReportFromAPI(e);const $=document.createElement("div");$.className="section",$.style.display="flex",$.style.gap="var(--sp-4)",$.style.flexWrap="wrap",$.style.alignItems="end";const m=document.createElement("div");m.className="form-group",m.style.flex="1",m.style.minWidth="150px",m.innerHTML=`<label class="form-label">Dari Tanggal</label><input type="date" id="filter-line-date-start" class="form-control" value="${e.startDate}">`;const l=document.createElement("div");l.className="form-group",l.style.flex="1",l.style.minWidth="150px",l.innerHTML=`<label class="form-label">Sampai Tanggal</label><input type="date" id="filter-line-date-end" class="form-control" value="${e.endDate}">`;const o=document.createElement("div");o.className="form-group",o.style.flex="1",o.style.minWidth="180px";let d='<option value="ALL">Semua Material</option>';const a=new Set;PMCStore.bomData.forEach(f=>f.components.forEach(E=>a.add(E.name))),Array.from(a).sort().forEach(f=>{d+=`<option value="${f}" ${e.material===f?"selected":""}>${f}</option>`}),o.innerHTML=`<label class="form-label">Material</label><select id="filter-line-mat" class="form-control">${d}</select>`;const r=document.createElement("div");r.className="form-group",r.style.flex="1",r.style.minWidth="150px";const t=new Set,s=PMCStore.lineStock;s&&typeof s=="object"&&Object.keys(s).forEach(f=>t.add(f)),(Array.isArray(PMCStore.schedules)?PMCStore.schedules:[]).forEach(f=>{f.line&&t.add(f.line)}),["A","B","C","D","E"].forEach(f=>t.add(f));const p=["ALL",...Array.from(t).sort()];let T="";p.forEach(f=>{T+=`<option value="${f}" ${e.line===f?"selected":""}>${f==="ALL"?"Semua Line":f}</option>`}),r.innerHTML=`<label class="form-label">Line Produksi</label><select id="filter-line-line" class="form-control">${T}</select>`,$.appendChild(m),$.appendChild(l),$.appendChild(o),$.appendChild(r),S.appendChild($),setTimeout(()=>{["line-date-start","line-date-end","line-mat","line-line"].forEach(E=>{const g=document.getElementById(`filter-${E}`);g&&g.addEventListener("change",h=>{E==="line-date-start"?e.startDate=h.target.value:E==="line-date-end"?e.endDate=h.target.value:E==="line-mat"?e.material=h.target.value:E==="line-line"&&(e.line=h.target.value),b()})});const f=document.getElementById("btn-export-line-excel");f&&f.addEventListener("click",A)},0);const{reportList:x}=PMCStore.getLineMutationReport(e),H=document.createElement("div");if(H.className="section",H.style.overflowX="auto",x.length===0)H.innerHTML='<div class="empty-state">Belum ada data mutasi produksi yang sesuai dengan filter.</div>';else{const f=v=>typeof v=="number"?v.toLocaleString("id-ID"):v,E=x.filter(v=>v.selisih!==null&&Math.abs(v.selisih)>1e-4).length;if(E>0){const v=document.createElement("div");v.className="alert alert-warning",v.style.marginBottom="var(--sp-4)",v.innerHTML=`⚠️ Terdeteksi <strong>${E} item</strong> dengan selisih antara Saldo Akhir (Buku) dan Stok Aktual (Line).`,H.appendChild(v)}const g=`
          <style>
            .table-line-premium {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              background: rgba(16, 25, 45, 0.4);
              backdrop-filter: blur(12px);
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid rgba(0, 195, 255, 0.15);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              margin-top: 10px;
            }
            .table-line-premium thead th {
              background: rgba(0, 195, 255, 0.08);
              color: #00c3ff;
              font-weight: 600;
              letter-spacing: 0.8px;
              text-transform: uppercase;
              font-size: 0.7rem;
              padding: 12px 14px;
              border-bottom: 2px solid rgba(0, 195, 255, 0.2);
              white-space: nowrap;
            }
            .table-line-premium tbody td {
              padding: 10px 14px;
              font-size: 0.85rem;
              border-bottom: 1px solid rgba(255, 255, 255, 0.03);
              vertical-align: middle;
              color: #e0e5ec;
              transition: all 0.2s ease;
            }
            .table-line-premium tbody tr:last-child td { border-bottom: none; }
            .table-line-premium tbody tr { transition: all 0.2s ease; }
            .table-line-premium tbody tr:hover { background: rgba(0, 195, 255, 0.05); transform: scale(1.002); }
            .table-line-premium tbody tr:hover td { color: #fff; }
          </style>
        `,h=`
          <thead>
            <tr>
              <th>Material / Produk</th>
              <th class="align-center">UOM</th>
              <th class="align-right">Saldo Awal</th>
              <th class="align-right">Masuk (Transit)</th>
              <th class="align-right">Pakai (BPP)</th>
              <th class="align-right">Retur (Transit)</th>
              <th class="align-right">Rijek</th>
              <th class="align-right">Adj (Opname)</th>
              <th class="align-right col-highlight">Saldo Akhir</th>
              <th class="align-right col-actual">Stok Aktual</th>
              <th class="align-right">Selisih</th>
            </tr>
          </thead>
        `,i=v=>v>0?`<span class="pill pill-in">+${f(v)}</span>`:'<span class="pill pill-neutral">-</span>',n=v=>v>0?`<span class="pill pill-out">-${f(v)}</span>`:'<span class="pill pill-neutral">-</span>',k=v=>v!==0?`<span class="pill pill-adj">${v>0?"+":""}${f(v)}</span>`:'<span class="pill pill-neutral">-</span>',C=`
          <tbody>
            ${x.map(v=>{const D=v.selisih!==null&&Math.abs(v.selisih)>1e-4,M=D?"background: rgba(255, 61, 113, 0.05); border-left: 3px solid #ff3d71;":"";let B='<span class="pill pill-neutral">0</span>';if(D){const j=v.selisih>0?"+":"";B=`<span class="pill ${v.selisih>0?"badge-danger-glow":"badge-warning"}">${j}${f(v.selisih)}</span>`}return`
                <tr style="${M}">
                  <td style="font-weight:600; letter-spacing: 0.3px;">${v.material}</td>
                  <td class="align-center" style="color: #a0aec0; font-size: 0.75rem;">${v.uom}</td>
                  <td class="align-right font-monospace">${f(v.initial)}</td>
                  <td class="align-right">${i(v.inbound)}</td>
                  <td class="align-right">${n(v.consume)}</td>
                  <td class="align-right">${n(v.returnOut)}</td>
                  <td class="align-right">${n(v.reject)}</td>
                  <td class="align-right">${k(v.adjust)}</td>
                  <td class="align-right col-highlight font-monospace" style="font-size: 0.95rem;">${f(v.final)}</td>
                  <td class="align-right col-actual font-monospace" style="font-size: 0.95rem;">${v.actualStock!==null?f(v.actualStock):"-"}</td>
                  <td class="align-right">${B}</td>
                </tr>
              `}).join("")}
          </tbody>
        `,u=document.createElement("table");u.className="table table-line-premium",u.innerHTML=`${g}${h}${C}`,H.appendChild(u)}S.appendChild(H)}catch(L){console.error("Render Error:",L);const $=document.createElement("div");$.className="section alert alert-danger",$.innerHTML=`⚠️ <strong>Sistem Error:</strong> ${L.message}`,S.appendChild($)}P.appendChild(S),TopbarComponent.render("/produksi/mutation")}return{render:b}})();window.ProduksiMutasiPage=mt;const gt=(()=>{let e=[],b="",P="DAILY",S=[],L=[],$="",m=!0,l=!1,o=[{kg:"",sachet:""}],d=[{pcs:""}];async function a(){e=await PMCStore.getLineOpnames({line:b||void 0}),H()}async function r(){try{const f=await PMCStore.safeFetch(`${PMCStore.API_BASE}/master/kamus-opname`);f.ok&&(L=await f.json())}catch(f){console.warn("Gagal memuat kamus opname",f)}}function t(){if(window.location.hash!=="#/produksi/opname")return;L.length===0&&r(),ChartWrapper.destroyAll();const f=document.getElementById("page-content");f.innerHTML="";const E=document.createElement("div");E.className="page-enter";const g=document.createElement("div");g.className="page-header",g.innerHTML=`
      <div>
        <h2 class="page-title">📋 Opname Stok Produksi (Line)</h2>
        <p class="page-subtitle">Stock check harian, mingguan, atau bulanan untuk lini produksi. Selisih akan otomatis dicatat sebagai mutasi penyesuaian.</p>
      </div>
    `,E.appendChild(g);const h=document.createElement("div");h.style.display="grid",h.style.gridTemplateColumns="1.3fr 1fr",h.style.gap="var(--sp-6)",h.style.alignItems="start";const i=document.createElement("div");i.className="card",i.id="opname-form-card",h.appendChild(i);const n=document.createElement("div");n.className="card",n.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2);">📜 Riwayat Opname</h3>
      <div id="opname-history-container" style="overflow-x:auto;"></div>
    `,h.appendChild(n),E.appendChild(h),f.appendChild(E),s(),a(),TopbarComponent.render("/produksi/opname")}function s(){const f=document.getElementById("opname-form-card");if(!f)return;const E=new Date().toISOString().split("T")[0],g=new Set,h=PMCStore.lineStock;h&&typeof h=="object"&&Object.keys(h).forEach(u=>g.add(u)),(Array.isArray(PMCStore.schedules)?PMCStore.schedules:[]).forEach(u=>{u.line&&g.add(u.line)}),(typeof PMCStore.getLinePerSku=="function"?PMCStore.getLinePerSku():[]).forEach(u=>{u.line&&g.add(u.line)});const k=[...g].sort();f.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2);">
        ➕ Input Opname Baru
      </h3>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Tanggal Opname</label>
        <input type="date" id="opname-date" class="form-input" value="${E}">
      </div>

      <div style="display:flex; gap:var(--sp-3); margin-bottom:var(--sp-3);">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Line Produksi</label>
          <select id="opname-line" class="form-input">
            <option value="">-- Pilih Line --</option>
            ${k.map(u=>`<option value="${u}" ${b===u?"selected":""}>${u}</option>`).join("")}
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label class="form-label">Tipe Opname</label>
          <select id="opname-type" class="form-input">
            <option value="DAILY" ${P==="DAILY"?"selected":""}>Harian</option>
            <option value="WEEKLY" ${P==="WEEKLY"?"selected":""}>Mingguan</option>
            <option value="MONTHLY" ${P==="MONTHLY"?"selected":""}>Bulanan</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Diperiksa Oleh</label>
        <input type="text" id="opname-checked-by" class="form-input" placeholder="Nama pemeriksa...">
      </div>

      <div id="opname-conversion-container"></div>
      <div id="opname-materials-container" style="margin-bottom:var(--sp-4);">
        ${b?"":'<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Pilih Line terlebih dahulu untuk memuat data material.</div>'}
      </div>

      <button id="btn-save-opname" class="btn btn-primary" style="width:100%; font-weight:bold;" ${b?"":"disabled"}>
        💾 Simpan Opname & Sinkronkan Stok
      </button>
    `,document.getElementById("opname-line").addEventListener("change",u=>{b=u.target.value,b&&y(b)}),document.getElementById("opname-type").addEventListener("change",u=>{P=u.target.value}),b&&y(b),document.getElementById("btn-save-opname").addEventListener("click",x)}function y(f){const E=PMCStore.lineStock,g=E&&typeof E=="object"?E[f]||{}:{};S=Object.keys(g).map(h=>({materialName:h,qtyBook:parseFloat(String(g[h].pcs||"0")),qtyPhysical:parseFloat(String(g[h].pcs||"0"))})),$="",m=!0,l=!1,o=[{kg:"",sachet:""}],d=[{pcs:""}],p(),T(),document.getElementById("btn-save-opname").disabled=!1}function p(){const f=document.getElementById("opname-conversion-container");if(!f)return;if(S.length===0){f.innerHTML="";return}let E='<option value="">-- Kosong (Tidak pakai konversi) --</option>';S.forEach(n=>{E+=`<option value="${n.materialName}" ${$===n.materialName?"selected":""}>${n.materialName}</option>`});let g="";o.forEach((n,k)=>{g+=`
        <tr>
          <td style="text-align:center;">${k+1}</td>
          <td><input type="number" step="any" class="form-input conv-kg" data-idx="${k}" value="${n.kg}" placeholder="Contoh: 2.5"></td>
          <td><input type="number" step="any" class="form-input conv-sachet" data-idx="${k}" value="${n.sachet}" placeholder="Contoh: 5"></td>
          <td style="text-align:right; font-weight:bold; font-size:1.1em;" class="conv-hasil" id="conv-hasil-${k}">0</td>
          <td style="text-align:center;">
             <button class="btn-icon sm btn-ghost btn-conv-del" data-idx="${k}" ${o.length===1?"disabled":""} title="Hapus Baris">✕</button>
          </td>
        </tr>
      `});let h="";d.forEach((n,k)=>{h+=`
        <tr>
          <td style="text-align:center;">${k+1}</td>
          <td><input type="number" step="any" class="form-input conv-utuh-pcs" data-idx="${k}" value="${n.pcs}" placeholder="Contoh: 50"></td>
          <td style="text-align:center;">
             <button class="btn-icon sm btn-ghost btn-utuh-del" data-idx="${k}" ${d.length===1?"disabled":""} title="Hapus Baris">✕</button>
          </td>
        </tr>
      `}),f.innerHTML=`
      <div class="card" style="margin-bottom:var(--sp-4); border:1px dashed rgba(108, 92, 231, 0.4); background:rgba(108, 92, 231, 0.02); box-shadow:none;">
        <h4 style="font-size:0.95rem; margin-bottom:var(--sp-3); display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.2em;">⚖️</span> Alat Bantu Perhitungan Fisik Stok
        </h4>
        <div class="form-group" style="margin-bottom:var(--sp-3);">
          <label class="form-label">Material Pilihan</label>
          <select id="conv-material-select" class="form-input" style="max-width:500px;">
            ${E}
          </select>
        </div>

        ${$?`
        <div style="margin-bottom:var(--sp-4); display:flex; gap:var(--sp-4); align-items:center; padding:var(--sp-2); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); width:fit-content;">
          <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:bold;">Mode Hitung:</span>
          <label style="display:flex; align-items:center; gap:var(--sp-2); cursor:pointer;">
            <input type="checkbox" id="cb-sisa" ${m?"checked":""} style="width:18px;height:18px;accent-color:var(--primary);">
            <strong style="color:var(--text-primary);">Totalan / Konversi Sisa</strong>
          </label>
          <label style="display:flex; align-items:center; gap:var(--sp-2); cursor:pointer;">
            <input type="checkbox" id="cb-utuh" ${l?"checked":""} style="width:18px;height:18px;accent-color:var(--success);">
            <strong style="color:var(--text-primary);">Totalan Utuh (Pcs)</strong>
          </label>
        </div>
        `:""}
        
        <div id="conv-calc-area" style="${$?"display:block;":"display:none;"}">
          <div style="display:flex; flex-direction:column; gap:var(--sp-4); margin-bottom:var(--sp-4);">
            
            <!-- FORM SISA -->
            <div style="${m?"display:block;":"display:none;"} background:var(--bg-main); padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid rgba(108, 92, 231, 0.2);">
              <h5 style="margin-bottom:var(--sp-2); border-bottom:1px solid var(--border-color); padding-bottom:var(--sp-2);">Tabel Sisa</h5>
              <div style="margin-bottom:var(--sp-2); padding:var(--sp-2) var(--sp-3); background:#fff; border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-secondary);" id="conv-kamus-info"></div>
              
              <div style="width:100%; overflow-x:auto; margin-bottom:var(--sp-3);">
                <table class="data-table" style="font-size:0.8rem; width:100%; min-width:350px;">
                  <thead>
                     <tr>
                       <th style="width:30px; text-align:center;">#</th>
                       <th>Jumlah Berat (kg)</th>
                       <th>Jumlah Roll / Box</th>
                       <th style="text-align:right;">Hasil (Pcs)</th>
                       <th style="width:40px; text-align:center;">Del</th>
                     </tr>
                  </thead>
                  <tbody>${g}</tbody>
                  <tfoot>
                     <tr>
                       <td colspan="3" style="text-align:right; font-weight:bold;">Total Sisa:</td>
                       <td id="conv-total-hasil" style="text-align:right; font-weight:bold; color:var(--primary-color);">0</td>
                       <td></td>
                     </tr>
                  </tfoot>
                </table>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-conv-add" style="width:100%;">➕ Tambah Baris Sisa</button>
            </div>

            <!-- FORM UTUH -->
            <div style="${l?"display:block;":"display:none;"} background:var(--bg-main); padding:var(--sp-3); border-radius:var(--radius-md); border:1px solid rgba(16, 185, 129, 0.2);">
              <h5 style="margin-bottom:var(--sp-2); border-bottom:1px solid var(--border-color); padding-bottom:var(--sp-2);">Tabel Utuh</h5>
              <div style="width:100%; overflow-x:auto; margin-bottom:var(--sp-3);">
                <table class="data-table" style="font-size:0.8rem; width:100%; min-width:200px;">
                  <thead>
                     <tr>
                       <th style="width:30px; text-align:center;">#</th>
                       <th>Jumlah Utuh (Pcs / Roll)</th>
                       <th style="width:40px; text-align:center;">Del</th>
                     </tr>
                  </thead>
                  <tbody>${h}</tbody>
                  <tfoot>
                     <tr>
                       <td style="text-align:right; font-weight:bold;">Total Utuh:</td>
                       <td id="utuh-total-hasil" style="text-align:left; font-weight:bold; color:var(--success-color);">0</td>
                       <td></td>
                     </tr>
                  </tfoot>
                </table>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-utuh-add" style="width:100%;">➕ Tambah Baris Utuh</button>
            </div>

          </div>
          
          <div style="display:flex; flex-direction:column; gap:var(--sp-3); padding-top:var(--sp-3); border-top:2px dashed var(--border-color);">
             <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="badge badge-error" style="font-size:1.1rem; padding:8px 16px;">GRAND TOTAL FISIK (SISA + UTUH):</span>
                <span id="grand-total-hasil" style="font-size:1.5rem; font-weight:900; color:var(--text-primary);">0</span>
             </div>
             <button class="btn btn-primary" id="btn-grand-apply" style="padding:12px; font-weight:bold; font-size:1.05rem;">
               ⬇️ Terapkan Sub-Total Ke Kolom Stok Fisik Bawah
             </button>
          </div>
        </div>
      </div>
    `;const i=document.getElementById("conv-material-select");if(i&&i.addEventListener("change",n=>{$=n.target.value,o=[{kg:"",sachet:""}],d=[{pcs:""}],p()}),$){document.getElementById("cb-sisa").addEventListener("change",B=>{m=B.target.checked,p()}),document.getElementById("cb-utuh").addEventListener("change",B=>{l=B.target.checked,p()});const n=L.find(B=>B.materialName===$),k=document.getElementById("conv-kamus-info");k&&(n?k.innerHTML=`Berat Utuh = ${n.beratRollUtuh!=null?parseFloat(n.beratRollUtuh):"-"}kg &nbsp;|&nbsp; Berat Core = ${n.beratCore!=null?parseFloat(n.beratCore):"-"}kg`:k.innerHTML='<span style="color:var(--danger-color);">⚠️ Material ini belum ada di Kamus Opname. Sisa tidak bisa dihitung.</span>');const C=B=>{if(!n||!m)return 0;const j=o[B],O=j.kg.toString().trim(),q=j.sachet.toString().trim(),G=O===""?0:parseFloat(O),J=q===""?0:parseFloat(q);if(isNaN(G)||isNaN(J)){const V=document.getElementById(`conv-hasil-${B}`);return V&&(V.textContent="0"),0}const Q=parseFloat(n.beratRollUtuh)||1,K=parseFloat(n.beratCore)||0;let Z=(G-J*K)/Q;Z=Math.max(0,Z);const ae=Number(Z.toFixed(2)),U=document.getElementById(`conv-hasil-${B}`);return U&&(U.textContent=ae.toLocaleString("id-ID",{maximumFractionDigits:2})),ae},u=()=>{let B=0;m&&o.forEach((Q,K)=>{B+=C(K)});const j=document.getElementById("conv-total-hasil");j&&(j.textContent=B.toLocaleString("id-ID",{maximumFractionDigits:2}));let O=0;l&&d.forEach(Q=>{const K=Q.pcs.toString().trim()===""?0:parseFloat(Q.pcs);isNaN(K)||(O+=K)});const q=document.getElementById("utuh-total-hasil");q&&(q.textContent=O.toLocaleString("id-ID",{maximumFractionDigits:2}));const G=B+O,J=document.getElementById("grand-total-hasil");return J&&(J.textContent=G.toLocaleString("id-ID",{maximumFractionDigits:2})+" Pcs"),G};f.querySelectorAll(".conv-kg, .conv-sachet").forEach(B=>{B.addEventListener("input",u),B.addEventListener("change",j=>{const O=parseInt(j.target.dataset.idx);j.target.classList.contains("conv-kg")?o[O].kg=j.target.value:o[O].sachet=j.target.value})}),f.querySelectorAll(".btn-conv-del").forEach(B=>{B.addEventListener("click",j=>{const O=parseInt(j.currentTarget.dataset.idx);o.splice(O,1),p()})});const v=document.getElementById("btn-conv-add");v&&v.addEventListener("click",()=>{o.push({kg:"",sachet:""}),p()}),f.querySelectorAll(".conv-utuh-pcs").forEach(B=>{B.addEventListener("input",u),B.addEventListener("change",j=>{const O=parseInt(j.target.dataset.idx);d[O].pcs=j.target.value})}),f.querySelectorAll(".btn-utuh-del").forEach(B=>{B.addEventListener("click",j=>{const O=parseInt(j.currentTarget.dataset.idx);d.splice(O,1),p()})});const D=document.getElementById("btn-utuh-add");D&&D.addEventListener("click",()=>{d.push({pcs:""}),p()});const M=document.getElementById("btn-grand-apply");M&&M.addEventListener("click",()=>{const B=u(),j=S.findIndex(O=>O.materialName===$);if(j!==-1){S[j].qtyPhysical=B;let O="";if(m&&o.length>0){const G=o.map((J,Q)=>{const K=J.kg.toString().trim()||"0",Z=J.sachet.toString().trim()||"0",ae=document.getElementById(`conv-hasil-${Q}`),U=ae?ae.textContent:"?";return`Baris${Q+1}: ${K}kg, ${Z}roll = ${U}pcs`});O+=`[SISA] ${G.join(" | ")}`}if(l&&d.length>0){const G=d.map((J,Q)=>{const K=J.pcs.toString().trim()||"0";return`Baris${Q+1}: ${K}pcs`});O&&(O+=" ++ "),O+=`[UTUH] ${G.join(" | ")}`}O+=` => TOTAL: ${B}`,S[j].calculatorNotes=O;const q=document.querySelector(`.opname-physical-input[data-idx="${j}"]`);q&&(q.value=B,q.dispatchEvent(new Event("input",{bubbles:!0}))),ToastComponent.show(`Berhasil memasukkan total ${B.toLocaleString("id-ID",{maximumFractionDigits:2})} pcs ke Stok Fisik tabel bawah!`,"success")}}),u()}}function T(){const f=document.getElementById("opname-materials-container");if(!f)return;if(S.length===0){f.innerHTML='<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Tidak ada stok material di line ini.</div>';return}let E=`
      <div style="margin-bottom:var(--sp-2);"><strong>Material di Line ${b}:</strong></div>
      <table class="data-table" style="font-size:0.85rem;">
        <thead>
          <tr>
            <th>Material</th>
            <th style="text-align:right; width:100px;">Stok Buku</th>
            <th style="text-align:right; width:120px;">Stok Fisik</th>
            <th style="text-align:right; width:100px;">Selisih</th>
          </tr>
        </thead>
        <tbody>
    `;S.forEach((g,h)=>{const i=g.qtyPhysical-g.qtyBook,n=i>0?"color:#00e676;":i<0?"color:#ff3d71;":"color:var(--text-muted);",k=i>0?`+${i.toLocaleString("id-ID")}`:i.toLocaleString("id-ID");E+=`
        <tr>
          <td style="font-weight:600;">${g.materialName}</td>
          <td style="text-align:right; font-family:monospace;">${g.qtyBook.toLocaleString("id-ID")}</td>
          <td style="text-align:right;">
            <input type="number" class="form-input opname-physical-input" data-idx="${h}" value="${g.qtyPhysical}" style="width:100px; text-align:right; padding:4px 8px; font-size:0.85rem;">
          </td>
          <td style="text-align:right; font-weight:bold; ${n}" id="delta-${h}">${k}</td>
        </tr>
      `}),E+="</tbody></table>",f.innerHTML=E,f.querySelectorAll(".opname-physical-input").forEach(g=>{g.addEventListener("input",h=>{const i=parseInt(h.target.getAttribute("data-idx"),10),n=parseFloat(h.target.value)||0;S[i].qtyPhysical=n;const k=n-S[i].qtyBook,C=document.getElementById(`delta-${i}`);C&&(C.textContent=k>0?`+${k.toLocaleString("id-ID")}`:k.toLocaleString("id-ID"),C.style.color=k>0?"#00e676":k<0?"#ff3d71":"var(--text-muted)")})})}async function x(){const f=document.getElementById("opname-date").value,E=b,g=P,h=document.getElementById("opname-checked-by").value;if(!f||!E){ToastComponent.show("Pilih tanggal dan line terlebih dahulu.","warning");return}if(S.length===0){ToastComponent.show("Tidak ada material untuk diopname.","warning");return}const i=document.getElementById("btn-save-opname");i.disabled=!0,i.textContent="Menyimpan...";const n={date:f,type:g,line:E,checkedBy:h||void 0,items:S.map(C=>({materialName:C.materialName,qtyBook:C.qtyBook,qtyPhysical:C.qtyPhysical,calculatorNotes:C.calculatorNotes||null}))},k=await PMCStore.saveLineOpname(n);i.disabled=!1,i.textContent="💾 Simpan Opname & Sinkronkan Stok",k.success?(ToastComponent.show(`Opname ${g} berhasil disimpan! Stok line telah disinkronkan.`,"success"),y(E),a()):ToastComponent.show("Gagal: "+k.message,"danger")}function H(){const f=document.getElementById("opname-history-container");if(!f)return;if(e.length===0){f.innerHTML='<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Belum ada riwayat opname.</div>';return}let E=`
      <table class="data-table" style="font-size:0.85rem;">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tipe</th>
            <th>Line</th>
            <th>Diperiksa</th>
            <th>Items</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
    `;e.forEach(g=>{const h=g.date?g.date.split("T")[0]:"-",i=g.type==="DAILY"?"📅 Harian":g.type==="WEEKLY"?"📆 Mingguan":"🗓️ Bulanan",n=g.type==="DAILY"?"badge-accent":g.type==="WEEKLY"?"badge-warning":"badge-success",k=g.items?g.items.length:0,C=g.items?g.items.some(u=>Math.abs(parseFloat(u.delta))>1e-4):!1;E+=`
        <tr>
          <td>${h}</td>
          <td><span class="badge ${n}">${i}</span></td>
          <td><span class="badge badge-accent">${g.line}</span></td>
          <td>${g.checkedBy||"-"}</td>
          <td>${k} material ${C?"⚠️":"✅"}</td>
          <td>
            <button class="btn btn-sm btn-secondary view-opname-btn" data-opname-id="${g.id}" data-items='${JSON.stringify(g.items||[])}' style="font-size:12px; padding:4px 8px;">Detail</button>
          </td>
        </tr>
      `}),E+="</tbody></table>",f.innerHTML=E,f.querySelectorAll(".view-opname-btn").forEach(g=>{g.addEventListener("click",h=>{const i=JSON.parse(h.target.getAttribute("data-items")),n=h.target.getAttribute("data-opname-id");A(i,n)})})}function A(f,E){let g="";f.forEach((i,n)=>{const k=parseFloat(i.qtyBook),C=parseFloat(i.qtyPhysical),u=parseFloat(i.delta),v=u>0?"color:#00e676;":u<0?"color:#ff3d71;":"",D=i.calculatorNotes&&i.calculatorNotes.trim();g+=`<tr>
        <td>${i.materialName}</td>
        <td style="text-align:right;">${k.toLocaleString("id-ID")}</td>
        <td style="text-align:right;">
          <input type="number" step="any" class="form-input edit-phys-input" data-idx="${n}" data-item-id="${i.id}" value="${C}" style="width:100px; text-align:right; font-size:0.85rem; padding:4px 6px;">
        </td>
        <td style="text-align:right; font-weight:bold; ${v}" id="edit-delta-${n}">${u>0?"+":""}${u.toLocaleString("id-ID")}</td>
        <td style="text-align:center;">
          <button class="btn btn-sm btn-primary btn-edit-save" data-idx="${n}" data-item-id="${i.id}" style="font-size:11px; padding:3px 8px;" title="Simpan koreksi untuk material ini">💾</button>
        </td>
      </tr>`,D&&(g+=`<tr>
          <td colspan="5" style="padding:4px 8px 12px 16px; border-top:none;">
            <div style="background:rgba(108,92,231,0.08); border-left:3px solid rgba(108,92,231,0.5); padding:6px 10px; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.78rem; color:var(--text-secondary);">
              <strong>📝 Riwayat Input:</strong><br>
              ${i.calculatorNotes.replace(/\[SISA\]/g,'<span style="color:#6c5ce7;font-weight:bold;">[SISA]</span>').replace(/\[UTUH\]/g,'<span style="color:#10b981;font-weight:bold;">[UTUH]</span>').replace(/\[EDIT/g,'<br><span style="color:#ff6b6b;font-weight:bold;">[EDIT</span>').replace(/=>/g,"→")}
            </div>
          </td>
        </tr>`)});const h=`
      <div id="opname-detail-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:10000;">
        <div style="background:#1a1d2e; padding:var(--sp-5); border-radius:var(--radius-lg); width:90%; max-width:750px; max-height:80vh; overflow-y:auto; border:1px solid rgba(255,255,255,0.1);">
          <h3 style="margin-bottom:var(--sp-3);">📋 Detail Opname (Audit)</h3>
          <table class="data-table" style="margin-bottom:var(--sp-4); font-size:0.85rem;">
            <thead><tr><th>Material</th><th style="text-align:right;">Buku</th><th style="text-align:right;">Fisik</th><th style="text-align:right;">Selisih</th><th style="width:50px; text-align:center;">Edit</th></tr></thead>
            <tbody>${g}</tbody>
          </table>
          <div class="form-group" style="margin-bottom:var(--sp-3);">
            <label class="form-label" style="font-size:0.8rem;">Nama Editor / Auditor (untuk catatan koreksi)</label>
            <input class="form-input" id="edit-auditor-name" placeholder="Contoh: Pak Budi" style="max-width:300px;">
          </div>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:var(--sp-3);">ℹ️ Ubah angka Fisik lalu klik 💾 untuk menyimpan koreksi. Perubahan akan langsung tersinkronisasi ke stok Line.</p>
          <button id="close-opname-modal" class="btn btn-secondary" style="width:100%;">Tutup</button>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",h),document.querySelectorAll(".edit-phys-input").forEach(i=>{i.addEventListener("input",n=>{const k=parseInt(n.target.dataset.idx),C=parseFloat(n.target.value)||0,u=parseFloat(f[k].qtyBook),v=C-u,D=document.getElementById(`edit-delta-${k}`);D&&(D.textContent=(v>0?"+":"")+v.toLocaleString("id-ID"),D.style.color=v>0?"#00e676":v<0?"#ff3d71":"var(--text-muted)")})}),document.querySelectorAll(".btn-edit-save").forEach(i=>{i.addEventListener("click",async n=>{const k=parseInt(n.currentTarget.dataset.idx),C=n.currentTarget.dataset.itemId,u=document.querySelector(`.edit-phys-input[data-idx="${k}"]`),v=parseFloat(u.value),D=document.getElementById("edit-auditor-name").value.trim()||"Auditor";if(isNaN(v)){ToastComponent.show("Angka fisik tidak valid.","warning");return}n.currentTarget.disabled=!0,n.currentTarget.textContent="⏳";const M=await PMCStore.updateOpnameItem(E,C,v,D);M.success?(ToastComponent.show(`✅ Koreksi berhasil disimpan untuk ${f[k].materialName}!`,"success"),n.currentTarget.textContent="✔️",a()):(ToastComponent.show("Gagal: "+(M.message||"Unknown error"),"danger"),n.currentTarget.disabled=!1,n.currentTarget.textContent="💾")})}),document.getElementById("close-opname-modal").addEventListener("click",()=>{document.getElementById("opname-detail-modal").remove()})}return PMCStore.on("linePerSkuChanged",()=>{window.location.hash==="#/produksi/opname"&&!b&&s()}),PMCStore.on("stockChanged",()=>{window.location.hash==="#/produksi/opname"&&!b&&s()}),PMCStore.on("layoutChanged",()=>{window.location.hash==="#/produksi/opname"&&!b&&s()}),PMCStore.on("scheduleChanged",()=>{window.location.hash==="#/produksi/opname"&&!b&&s()}),{render:t}})();window.ProduksiOpnamePage=gt;const ht=(()=>{let e=[],b="",P="",S="DAILY",L=[],$=[],m="",l=!0,o=!1,d=[{kg:"",sachet:""}],a=[{pcs:""}],r="utuh";async function t(){e=await PMCStore.getTransitOpnames({blockId:b||void 0}),g()}async function s(){try{const h=await PMCStore.safeFetch(`${PMCStore.API_BASE}/master/kamus-opname`);h.ok&&($=await h.json())}catch(h){console.warn("Gagal memuat kamus opname",h)}}function y(){if(window.location.hash!=="#/transit/opname")return;$.length===0&&s(),ChartWrapper.destroyAll();const h=document.getElementById("page-content");h.innerHTML="";const i=document.createElement("div");i.className="page-enter";const n=document.createElement("div");n.className="page-header",n.innerHTML=`
      <div>
        <h2 class="page-title">📋 Opname Stok Transit (Blok)</h2>
        <p class="page-subtitle">Pemeriksaan fisik stok di area transit. Selisih akan otomatis tercatat sebagai mutasi penyesuaian (ADJUST).</p>
      </div>
    `,i.appendChild(n);const k=document.createElement("div");k.style.display="grid",k.style.gridTemplateColumns="1.3fr 1fr",k.style.gap="var(--sp-6)",k.style.alignItems="start";const C=document.createElement("div");C.className="card",C.id="opname-form-card",k.appendChild(C);const u=document.createElement("div");u.className="card",u.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2);">📜 Riwayat Opname</h3>
      <div id="opname-history-container" style="overflow-x:auto;"></div>
    `,k.appendChild(u),i.appendChild(k),h.appendChild(i),p(),t(),TopbarComponent.render("/transit/opname")}function p(){const h=document.getElementById("opname-form-card");if(!h)return;const i=new Date().toISOString().split("T")[0],n=PMCStore.transitInfoCache||{blocks:[]};let k='<option value="">-- Pilih Blok --</option>';n.blocks.forEach(u=>{k+=`<option value="${u.id}" ${b===u.id?"selected":""}>Blok ${u.blockNumber}</option>`});let C='<option value="">-- Pilih Baris --</option>';if(b){const u=n.blocks.find(v=>v.id===b);u&&u.rows.forEach(v=>{(v.qty>0||v.pcs>0||v.material)&&(C+=`<option value="${v.id}" ${P===v.id?"selected":""}>Baris ${v.rowNumber} (${v.material||"Kosong"})</option>`)})}h.innerHTML=`
      <h3 style="margin-bottom:var(--sp-3); border-bottom: 1px solid var(--border-color); padding-bottom: var(--sp-2);">
        ➕ Input Opname Baru
      </h3>

      <div class="form-group" style="margin-bottom:var(--sp-3);">
        <label class="form-label">Tanggal Opname</label>
        <input type="date" id="opname-date" class="form-input" value="${i}">
      </div>

      <div style="display:flex; gap:var(--sp-3); margin-bottom:var(--sp-3);">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Blok</label>
          <select id="opname-block" class="form-input">
            ${k}
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label class="form-label">Baris</label>
          <select id="opname-row" class="form-input" ${b?"":"disabled"}>
            ${C}
          </select>
        </div>
      </div>

      <div style="display:flex; gap:var(--sp-3); margin-bottom:var(--sp-3);">
        <div class="form-group" style="flex:1;">
          <label class="form-label">Tipe Opname</label>
          <select id="opname-type" class="form-input">
            <option value="DAILY" ${S==="DAILY"?"selected":""}>Harian</option>
            <option value="WEEKLY" ${S==="WEEKLY"?"selected":""}>Mingguan</option>
            <option value="MONTHLY" ${S==="MONTHLY"?"selected":""}>Bulanan</option>
          </select>
        </div>
        <div class="form-group" style="flex:1;">
          <label class="form-label">Diperiksa Oleh</label>
          <input type="text" id="opname-checked-by" class="form-input" placeholder="Nama pemeriksa...">
        </div>
      </div>

      <div id="opname-conversion-container"></div>
      <div id="opname-materials-container" style="margin-bottom:var(--sp-4);">
        ${P?"":'<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Pilih Baris terlebih dahulu untuk memuat data material.</div>'}
      </div>

      <button id="btn-save-opname" class="btn btn-primary" style="width:100%; font-weight:bold;" ${P?"":"disabled"}>
        💾 Simpan Opname & Sinkronkan Stok
      </button>
    `,document.getElementById("opname-block").addEventListener("change",u=>{b=u.target.value,P="",p()}),document.getElementById("opname-row").addEventListener("change",u=>{P=u.target.value,P?T():p()}),document.getElementById("opname-type").addEventListener("change",u=>{S=u.target.value}),P&&T(),document.getElementById("btn-save-opname").addEventListener("click",E)}function T(){const h=PMCStore.transitInfoCache,i=h==null?void 0:h.blocks.find(k=>k.id===b),n=i==null?void 0:i.rows.find(k=>k.id===P);if(L=[],n&&n.contents&&n.contents.length>0){const k={};n.contents.forEach(C=>{C.material&&(k[C.material]=!0)}),Object.keys(k).forEach(C=>{const u=C===n.material;L.push({materialName:C,qtyBook:u?parseFloat(String(n.pcs||"0")):0,qtyPhysical:u?parseFloat(String(n.pcs||"0")):0})})}else n&&n.material&&L.push({materialName:n.material,qtyBook:parseFloat(String(n.pcs||"0")),qtyPhysical:parseFloat(String(n.pcs||"0"))});m="",l=!0,o=!1,r="utuh",d=[{kg:"",roll:""}],a=[{pcs:""}],x(),f(),document.getElementById("btn-save-opname").disabled=!1}function x(){const h=document.getElementById("opname-conversion-container");if(!h)return;if(L.length===0){h.innerHTML="";return}let i='<option value="">-- Kosong (Tidak pakai konversi) --</option>';L.forEach(Q=>{i+=`<option value="${Q.materialName}" ${m===Q.materialName?"selected":""}>${Q.materialName}</option>`});const n=r==="utuh",k=n?"flex:1;padding:10px;border-radius:var(--radius-md);font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;border:2px solid var(--success);background:rgba(0,224,163,0.15);color:var(--success);":"flex:1;padding:10px;border-radius:var(--radius-md);font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;border:2px solid transparent;background:rgba(0,224,163,0.05);color:var(--text-muted);",C=n?"flex:1;padding:10px;border-radius:var(--radius-md);font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;border:2px solid transparent;background:rgba(245,158,11,0.05);color:var(--text-muted);":"flex:1;padding:10px;border-radius:var(--radius-md);font-weight:700;font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;border:2px solid var(--warning);background:rgba(245,158,11,0.15);color:var(--warning);";let u="";d.forEach((Q,K)=>{u+=`
        <tr>
          <td style="text-align:center;">${K+1}</td>
          <td><input type="number" step="any" class="form-input conv-kg" data-idx="${K}" value="${Q.kg}" placeholder="Contoh: 2.5"></td>
          <td><input type="number" step="any" class="form-input conv-roll" data-idx="${K}" value="${Q.roll}" placeholder="Contoh: 5"></td>
          <td style="text-align:right; font-weight:bold; font-size:1.1em;" class="conv-hasil" id="conv-hasil-${K}">0</td>
          <td style="text-align:center;">
             <button class="btn-icon sm btn-ghost btn-conv-del" data-idx="${K}" ${d.length===1?"disabled":""} title="Hapus Baris">✕</button>
          </td>
        </tr>
      `});let v="";a.forEach((Q,K)=>{v+=`
        <tr>
          <td style="text-align:center;">${K+1}</td>
          <td><input type="number" step="any" class="form-input conv-utuh-pcs" data-idx="${K}" value="${Q.pcs}" placeholder="Contoh: 50"></td>
          <td style="text-align:center;">
             <button class="btn-icon sm btn-ghost btn-utuh-del" data-idx="${K}" ${a.length===1?"disabled":""} title="Hapus Baris">✕</button>
          </td>
        </tr>
      `}),h.innerHTML=`
      <div class="card" style="margin-bottom:var(--sp-4); border:1px dashed rgba(108, 92, 231, 0.4); background:rgba(108, 92, 231, 0.02); box-shadow:none;">
        <h4 style="font-size:0.95rem; margin-bottom:var(--sp-3); display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.2em;">⚖️</span> Alat Bantu Perhitungan Fisik Stok
        </h4>
        <div class="form-group" style="margin-bottom:var(--sp-3);">
          <label class="form-label">Material Pilihan</label>
          <select id="conv-material-select" class="form-input" style="max-width:500px;">
            ${i}
          </select>
        </div>

        ${m?`
        <div class="form-group" style="margin-bottom:var(--sp-3);">
          <label class="form-label">Kondisi Material</label>
          <div style="display:flex; gap:8px;">
            <button type="button" id="btn-cond-utuh" style="${k}">✅ Utuh (Ada Barcode)</button>
            <button type="button" id="btn-cond-sisa" style="${C}">⚠️ Sisa (Tanpa Barcode)</button>
          </div>
        </div>
        `:""}
        
        <div id="conv-calc-area" style="${m?"display:block;":"display:none;"}">

           ${m&&r==="utuh"?`
           <div style="border:1px solid rgba(0,224,163,0.2); border-radius:var(--radius-md); padding:var(--sp-4); background:rgba(0,224,163,0.03); margin-bottom:var(--sp-3);">
             <h4 style="margin-bottom:var(--sp-3); color:var(--success); display:flex; align-items:center; gap:8px; font-size:0.95rem;">🔍 Scan Barcode Palet Utuh</h4>
             <div class="form-group" style="margin-bottom:var(--sp-3);">
               <label class="form-label">No Barcode (Scan)</label>
               <input type="text" id="conv-barcode-input" class="form-input" placeholder="Scan barcode dari transit..." autocomplete="off" autofocus style="letter-spacing:2px; font-family:monospace;">
             </div>
             <div class="form-group" style="margin-bottom:var(--sp-3);">
               <label class="form-label">Qty PCS Aktual</label>
               <input type="number" id="conv-barcode-qty" class="form-input" placeholder="Otomatis terisi..." readonly style="background:rgba(0,0,0,0.15); color:var(--text-muted);">
               <div id="conv-barcode-info" style="margin-top:6px; font-size:0.82rem; color:var(--text-muted); font-style:italic;">Menunggu scan barcode...</div>
             </div>
             <div style="display:flex; gap:var(--sp-3);">
               <button id="btn-barcode-add" class="btn btn-secondary" style="flex:1;" disabled>➕ Tambah ke Daftar</button>
               <button id="btn-barcode-clear" class="btn" style="background:rgba(255,59,71,0.1); color:var(--danger); border:1px solid var(--danger); flex:0;">🗑️</button>
             </div>
             <div id="conv-barcode-list" style="margin-top:var(--sp-3);"></div>
             <div style="margin-top:var(--sp-3); padding-top:var(--sp-3); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
               <span style="font-size:0.9rem;">Total Barcode Terhitung: <strong id="conv-barcode-count">0</strong> palet | <strong id="conv-barcode-total-pcs">0</strong> Pcs</span>
               <button id="btn-conv-apply" class="btn btn-primary" disabled>⬇️ Terapkan ke Qty Fisik</button>
             </div>
           </div>
           `:""}

           ${m&&r==="sisa"?`
           <div style="display:flex; flex-direction:column; gap:var(--sp-4);">
              <div class="calc-section">
                <h5 style="margin-bottom:var(--sp-2); display:flex; justify-content:space-between; align-items:center;">
                  <span style="color:var(--primary);">Bagian Sisa</span>
                  <button id="btn-conv-add" class="btn-icon sm btn-ghost" title="Tambah Baris">+ Baris</button>
                </h5>
                <div style="margin-bottom:var(--sp-2); padding:var(--sp-2) var(--sp-3); background:#fff; border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-secondary);" id="conv-kamus-info"></div>
                <table class="data-table" style="font-size:0.85rem; margin-bottom:var(--sp-2);">
                  <thead>
                    <tr><th style="width:40px;">No</th><th>Berat (Kg)</th><th>Jumlah Roll / Box</th><th style="text-align:right;">Pcs</th><th style="width:40px;"></th></tr>
                  </thead>
                  <tbody id="conv-tbody">${u}</tbody>
                  <tfoot>
                    <tr><td colspan="3" style="text-align:right; font-weight:bold;">Total Pcs Sisa:</td><td style="text-align:right; font-weight:bold; color:var(--primary); font-size:1.1em;" id="conv-total-sisa">0</td><td></td></tr>
                  </tfoot>
                </table>
              </div>

              <div class="calc-section">
                <h5 style="margin-bottom:var(--sp-2); display:flex; justify-content:space-between; align-items:center;">
                  <span style="color:var(--success);">Bagian Utuh (Pcs)</span>
                  <button id="btn-utuh-add" class="btn-icon sm btn-ghost" title="Tambah Baris">+ Baris</button>
                </h5>
                <table class="data-table" style="font-size:0.85rem; margin-bottom:var(--sp-2);">
                  <thead>
                    <tr><th style="width:40px;">No</th><th>Jumlah Pcs</th><th style="width:40px;"></th></tr>
                  </thead>
                  <tbody id="utuh-tbody">${v}</tbody>
                  <tfoot>
                    <tr><td colspan="1" style="text-align:right; font-weight:bold;">Total Pcs Utuh:</td><td style="text-align:center; font-weight:bold; color:var(--success); font-size:1.1em;" id="conv-total-utuh">0</td><td></td></tr>
                  </tfoot>
                </table>
              </div>
           </div>

           <div style="margin-top:var(--sp-4); text-align:right;">
             <div style="font-size:1.2rem; margin-bottom:var(--sp-3);">
               Total Keseluruhan (Sisa + Utuh): <strong style="color:var(--text-primary); font-size:1.4em;" id="conv-grand-total">0</strong> <small>Pcs</small>
             </div>
             <button id="btn-conv-apply" class="btn btn-secondary">
               Bawa Hasil Keseluruhan ke Input Physical Qty
             </button>
           </div>
           `:""}
      </div>
    `;const D=document.getElementById("conv-material-select");D&&D.addEventListener("change",Q=>{m=Q.target.value,x(),setTimeout(H,50)});const M=document.getElementById("btn-cond-utuh"),B=document.getElementById("btn-cond-sisa");if(M&&M.addEventListener("click",()=>{r="utuh",d=[{kg:"",roll:""}],a=[{pcs:""}],x()}),B&&B.addEventListener("click",()=>{r="sisa",d=[{kg:"",roll:""}],a=[{pcs:""}],x()}),r==="utuh"&&m){let I=function(){const z=w.reduce((R,F)=>R+F.pcs,0);if(_.textContent=w.length,N.textContent=z.toLocaleString(),c.disabled=w.length===0,w.length===0){V.innerHTML="";return}V.innerHTML=`
          <table class="data-table" style="font-size:0.82rem;">
            <thead><tr><th>#</th><th>Barcode</th><th style="text-align:right;">Pcs</th><th></th></tr></thead>
            <tbody>
              ${w.map((R,F)=>`
                <tr>
                  <td>${F+1}</td>
                  <td style="font-family:monospace;">${R.barcode}</td>
                  <td style="text-align:right; font-weight:bold;">${R.pcs.toLocaleString()}</td>
                  <td style="text-align:center;"><button class="btn-icon sm btn-ghost btn-rm-bc" data-i="${F}">✕</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>`,V.querySelectorAll(".btn-rm-bc").forEach(R=>{R.addEventListener("click",F=>{w.splice(parseInt(F.currentTarget.dataset.i),1),I()})})};const Q=document.getElementById("conv-barcode-input"),K=document.getElementById("conv-barcode-qty"),Z=document.getElementById("conv-barcode-info"),ae=document.getElementById("btn-barcode-add"),U=document.getElementById("btn-barcode-clear"),V=document.getElementById("conv-barcode-list"),_=document.getElementById("conv-barcode-count"),N=document.getElementById("conv-barcode-total-pcs"),c=document.getElementById("btn-conv-apply");if(Q){Q.style.flex="1";const z=CameraScanner.createScanButton(Q),R=document.createElement("div");R.style.cssText="display:flex; gap:8px; align-items:stretch; width:100%;",Q.parentNode.insertBefore(R,Q),R.appendChild(Q),R.appendChild(z)}let w=[];Q&&(Q.addEventListener("keydown",async z=>{if(z.key!=="Enter")return;const R=Q.value.trim();if(R){if(w.find(F=>F.barcode===R)){Z.textContent="⚠️ Barcode sudah discan!",Z.style.color="var(--warning)";return}Z.textContent="Mencari data barcode...",Z.style.color="var(--text-muted)",K.value="",ae.disabled=!0;try{const F=PMCStore.transitInfoCache;let W=null;if(F&&F.blocks){const te=F.blocks.find(Y=>Y.id===b);if(te)for(const Y of te.rows||[]){for(const X of Y.barcodes||[])if(X.barcode===R){W=X;break}if(W)break}}if(W){const te=W.material||"";if(te&&te!==m)Z.textContent=`⚠️ Barcode milik material "${te}", bukan "${m}".`,Z.style.color="var(--warning)";else{const Y=parseFloat(String(W.actualPcs||W.pcs||0));K.value=Y,Z.textContent=`✅ Ditemukan: ${W.material||m} — ${Y.toLocaleString()} Pcs`,Z.style.color="var(--success)",ae.disabled=!1,ae.dataset.bc=R,ae.dataset.pcs=Y}}else Z.textContent="❌ Barcode tidak ditemukan di blok ini.",Z.style.color="var(--danger)"}catch{Z.textContent="Error mencari barcode."}}}),ae.addEventListener("click",()=>{const z=ae.dataset.bc,R=parseFloat(ae.dataset.pcs)||0;z&&(w.push({barcode:z,pcs:R}),Q.value="",K.value="",Z.textContent="Menunggu scan barcode...",Z.style.color="var(--text-muted)",ae.disabled=!0,I(),Q.focus())}),U.addEventListener("click",()=>{w=[],Q.value="",K.value="",Z.textContent="Menunggu scan barcode...",Z.style.color="var(--text-muted)",I()}),c.addEventListener("click",()=>{const z=w.reduce((F,W)=>F+W.pcs,0),R=L.findIndex(F=>F.materialName===m);if(R!==-1){L[R].qtyPhysical=z;const F=w.map((W,te)=>`BC${te+1}:${W.barcode}=${W.pcs}pcs`).join(" | ");L[R].calculatorNotes=`UTUH-BARCODE[ ${F} ] => TOTAL:${z}`,f(),ToastComponent.show(`${w.length} barcode diterapkan: ${z.toLocaleString()} Pcs`)}}),setTimeout(()=>Q.focus(),50))}const j=document.getElementById("cb-sisa");j&&j.addEventListener("change",Q=>{l=Q.target.checked,x(),setTimeout(H,50)});const O=document.getElementById("cb-utuh");O&&O.addEventListener("change",Q=>{o=Q.target.checked,x(),setTimeout(H,50)}),document.querySelectorAll(".conv-kg, .conv-roll").forEach(Q=>Q.addEventListener("input",K=>{const Z=K.target.dataset.idx;K.target.classList.contains("conv-kg")&&(d[Z].kg=K.target.value),K.target.classList.contains("conv-roll")&&(d[Z].roll=K.target.value),H()})),document.querySelectorAll(".conv-utuh-pcs").forEach(Q=>Q.addEventListener("input",K=>{const Z=K.target.dataset.idx;a[Z].pcs=K.target.value,H()})),document.querySelectorAll(".btn-conv-del").forEach(Q=>Q.addEventListener("click",K=>{const Z=K.currentTarget.dataset.idx;d.splice(Z,1),x(),setTimeout(H,50)})),document.querySelectorAll(".btn-utuh-del").forEach(Q=>Q.addEventListener("click",K=>{const Z=K.currentTarget.dataset.idx;a.splice(Z,1),x(),setTimeout(H,50)}));const q=document.getElementById("btn-conv-add");q&&q.addEventListener("click",()=>{d.push({kg:"",roll:""}),x(),setTimeout(H,50)});const G=document.getElementById("btn-utuh-add");G&&G.addEventListener("click",()=>{a.push({pcs:""}),x(),setTimeout(H,50)});const J=document.getElementById("btn-conv-apply");J&&J.addEventListener("click",A),m&&setTimeout(H,50)}function H(){if(!m)return;const h=$.find(M=>M.materialName===m);let i=0;if(l){const M=document.getElementById("conv-kamus-info");M&&(h?M.innerHTML=`Berat Utuh = ${h.beratRollUtuh!=null?parseFloat(h.beratRollUtuh):"-"}kg &nbsp;|&nbsp; Berat Core = ${h.beratCore!=null?parseFloat(h.beratCore):"-"}kg`:M.innerHTML='<span style="color:var(--danger);">⚠️ Material ini belum ada di Kamus Opname. Sisa tidak bisa dihitung.</span>'),d.forEach((B,j)=>{let O=parseFloat(B.kg)||0,q=parseFloat(B.roll)||0,G=0;if(h){const Q=parseFloat(h.beratRollUtuh)||1,K=parseFloat(h.beratCore)||0;let Z=(O-q*K)/Q;Z=Math.max(0,Z),G=Number(Z.toFixed(2))}const J=document.getElementById(`conv-hasil-${j}`);J&&(J.textContent=G.toLocaleString("id-ID",{maximumFractionDigits:2})),i+=G})}let n=0;o&&a.forEach(M=>{n+=parseFloat(M.pcs)||0});const k=i+n,C=document.getElementById("conv-total-sisa");C&&(C.textContent=i.toLocaleString("id-ID",{maximumFractionDigits:2}));const u=document.getElementById("conv-total-utuh");u&&(u.textContent=n.toLocaleString("id-ID",{maximumFractionDigits:2}));const v=document.getElementById("conv-grand-total");v&&(v.textContent=k.toLocaleString("id-ID",{maximumFractionDigits:2}),v.dataset.value=k);const D=L.find(M=>M.materialName===m);if(D){let M=[];if(l&&i>0){let B=[];d.forEach((j,O)=>{var q;(j.kg||j.roll)&&B.push(`Baris ${O+1}: ${j.kg||"0"}kg + ${j.roll||"0"}rl => ${((q=document.getElementById(`conv-hasil-${O}`))==null?void 0:q.textContent)||0}pcs`)}),B.length&&M.push("SISA[ "+B.join(" | ")+" ]")}if(o&&n>0){let B=[];a.forEach((j,O)=>{j.pcs&&B.push(`Baris ${O+1}: ${j.pcs}pcs`)}),B.length&&M.push("UTUH[ "+B.join(" | ")+" ]")}D._rawCalcNotes=M.join(" /// ")}}function A(){if(!m)return;const h=document.getElementById("conv-grand-total");if(!h)return;const i=parseFloat(h.dataset.value)||0,n=L.findIndex(k=>k.materialName===m);if(n!==-1){L[n].qtyPhysical=i,L[n]._rawCalcNotes&&(L[n].calculatorNotes=L[n]._rawCalcNotes),f(),ToastComponent.show(`Hasil Konversi ${i} Pcs diterapkan ke ${m}`);const k=(n+1)%L.length;m=L[k].materialName,d=[{kg:"",sachet:""}],a=[{pcs:""}],x()}}function f(){const h=document.getElementById("opname-materials-container");if(!h)return;if(L.length===0){h.innerHTML='<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Baris ini tidak memiliki stok tercatat.</div>';return}let i="";L.forEach((n,k)=>{const C=n.qtyPhysical-n.qtyBook;let u="var(--text-primary)";C>0&&(u="var(--success)"),C<0&&(u="var(--danger)"),i+=`
        <tr>
          <td>${n.materialName}</td>
          <td style="text-align:right;">${n.qtyBook.toLocaleString()}</td>
          <td>
            <input type="number" class="form-input op-phys" data-idx="${k}" value="${n.qtyPhysical}" style="width:100px; text-align:right;">
          </td>
          <td style="text-align:right; font-weight:bold; color:${u};">
            ${C>0?"+":""}${C.toLocaleString()}
          </td>
          <td style="text-align:center;">
             <span title="${n.calculatorNotes||"Hitung manual tanpa kalkulator"}" style="cursor:help; font-size:1.2em; opacity:${n.calculatorNotes?"1":"0.2"}">📝</span>
          </td>
        </tr>
      `}),h.innerHTML=`
      <table class="data-table">
        <thead>
          <tr>
            <th>Material</th>
            <th style="text-align:right; width:120px;">Qty System (Pcs)</th>
            <th style="width:120px;">Qty Fisik (Pcs)</th>
            <th style="text-align:right; width:100px;">Selisih</th>
            <th style="width:60px;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${i}
        </tbody>
      </table>
    `,document.querySelectorAll(".op-phys").forEach(n=>{n.addEventListener("change",k=>{const C=k.target.dataset.idx;L[C].qtyPhysical=parseFloat(k.target.value)||0,L[C].calculatorNotes=null,f()})})}async function E(){if(!b||!P){ToastComponent.show("Pilih Blok dan Baris terlebih dahulu.","error");return}const h=document.getElementById("opname-date").value,i=document.getElementById("opname-checked-by").value,n={date:h,type:S,blockId:b,checkedBy:i,items:L.map(k=>({blockRowId:P,materialName:k.materialName,qtyBook:k.qtyBook,qtyPhysical:k.qtyPhysical,calculatorNotes:k.calculatorNotes||null}))};try{const k=await PMCStore.saveTransitOpname(n);k.success?(ToastComponent.show(k.message),PMCStore.logAuditActivity&&PMCStore.logAuditActivity("TRANSIT",`Koreksi Stok / Opname di Blok ${b} (Oleh: ${i})`,{type:S,itemsCount:L.length}),b="",P="",L=[],p(),t()):ToastComponent.show(k.message,"error")}catch{ToastComponent.show("Terjadi kesalahan","error")}}function g(){const h=document.getElementById("opname-history-container");if(!h)return;if(e.length===0){h.innerHTML='<div style="padding:var(--sp-4); text-align:center; color:var(--text-muted); font-style:italic;">Belum ada riwayat opname.</div>';return}let i="";e.forEach(n=>{var C,u,v;let k="";n.items&&(k=`
          <table class="data-table" style="font-size:0.85rem; margin-top:var(--sp-2);">
            <thead>
              <tr>
                <th>Material</th>
                <th style="text-align:right;">Sistem</th>
                <th style="text-align:right;">Fisik</th>
                <th style="text-align:right;">Selisih</th>
                <th style="text-align:center;">Audit</th>
              </tr>
            </thead>
            <tbody>
              ${n.items.map(D=>{const M=parseFloat(String(D.delta));let B="var(--text-primary)";return M>0&&(B="var(--success)"),M<0&&(B="var(--danger)"),`
                  <tr>
                    <td>${D.materialName}</td>
                    <td style="text-align:right;">${parseFloat(String(D.qtyBook)).toLocaleString()}</td>
                    <td style="text-align:right; font-weight:bold;">
                       <span class="view-qty" id="txt-qty-${D.id}">${parseFloat(String(D.qtyPhysical)).toLocaleString()}</span>
                       <input type="number" class="form-input edit-qty" id="inp-qty-${D.id}" value="${parseFloat(String(D.qtyPhysical))}" style="display:none; width:80px; padding:2px; font-size:0.85rem;">
                    </td>
                    <td style="text-align:right; font-weight:bold; color:${B};">
                      ${M>0?"+":""}${M.toLocaleString()}
                    </td>
                    <td style="text-align:center;">
                       <button class="btn-icon sm btn-ghost" title="${D.calculatorNotes||"Hitung manual"}" style="opacity:${D.calculatorNotes?"1":"0.2"}; cursor:help;">📝</button>
                       <button class="btn-icon sm btn-ghost btn-edit-audit" data-op="${n.id}" data-it="${D.id}" title="Koreksi Fisik">✏️</button>
                       <button class="btn-icon sm btn-ghost btn-save-audit" data-op="${n.id}" data-it="${D.id}" title="Simpan Koreksi" style="display:none;">💾</button>
                       <button class="btn-icon sm btn-ghost btn-cancel-audit" data-it="${D.id}" title="Batal Koreksi" style="display:none; color:var(--danger);">✕</button>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        `),i+=`
        <div style="padding:var(--sp-3); border:1px solid var(--border-color); border-radius:var(--radius-md); margin-bottom:var(--sp-3); background:var(--surface-color);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-2);">
            <div>
              <strong style="color:var(--text-primary); font-size:1.1rem;">📅 ${new Date(n.date).toLocaleDateString("id-ID")}</strong>
              <span class="badge badge-info" style="margin-left:var(--sp-2);">${n.type}</span>
            </div>
            <div style="text-align:right; font-size:0.85rem; color:var(--text-secondary);">
              <div>Blok ${((v=(u=(C=PMCStore.transitInfoCache)==null?void 0:C.blocks)==null?void 0:u.find(D=>D.id===n.blockId))==null?void 0:v.blockNumber)||"?"}</div>
              <div>Pemeriksa: ${n.checkedBy||"-"}</div>
            </div>
          </div>
          ${k}
        </div>
      `}),h.innerHTML=i,document.querySelectorAll(".btn-edit-audit").forEach(n=>{n.addEventListener("click",k=>{const C=k.currentTarget.dataset.it;document.getElementById(`txt-qty-${C}`).style.display="none",document.getElementById(`inp-qty-${C}`).style.display="inline-block",k.currentTarget.style.display="none",document.querySelector(`.btn-save-audit[data-it="${C}"]`).style.display="inline-block",document.querySelector(`.btn-cancel-audit[data-it="${C}"]`).style.display="inline-block"})}),document.querySelectorAll(".btn-cancel-audit").forEach(n=>{n.addEventListener("click",k=>{const C=k.currentTarget.dataset.it;document.getElementById(`txt-qty-${C}`).style.display="inline-block",document.getElementById(`inp-qty-${C}`).style.display="none",k.currentTarget.style.display="none",document.querySelector(`.btn-save-audit[data-it="${C}"]`).style.display="none",document.querySelector(`.btn-edit-audit[data-it="${C}"]`).style.display="inline-block"})}),document.querySelectorAll(".btn-save-audit").forEach(n=>{n.addEventListener("click",async k=>{const C=k.currentTarget.dataset.it,u=k.currentTarget.dataset.op,v=parseFloat(document.getElementById(`inp-qty-${C}`).value),D=prompt("Masukkan nama Auditor untuk mencatat koreksi:","");if(D)try{const M=await PMCStore.updateTransitOpnameItem(u,C,v,D);M.success?(ToastComponent.show(M.message),t()):ToastComponent.show(M.message,"error")}catch{ToastComponent.show("Error update opname","error")}})})}return{render:y}})();window.TransitOpnamePage=ht;const ft=(()=>{let e=!1;async function b(){if(e)return;e=!0;const L=document.getElementById("anomaly-tbody");L&&(L.innerHTML='<tr><td colspan="6" style="text-align:center; padding:20px;"><div class="spinner"></div> Memuat data anomali...</td></tr>');try{const m=await(await fetch(`${PMCStore.API_BASE}/anomaly/unscanned-transit?hours=3`)).json();if(m.success)P(m.data);else throw new Error(m.message)}catch($){L&&(L.innerHTML=`<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--danger-color);">Gagal memuat data: ${$.message}</td></tr>`),ToastComponent.show("Gagal memuat laporan anomali","error")}finally{e=!1}}function P(L){const $=document.getElementById("anomaly-tbody");if(!$)return;if(!L||L.length===0){$.innerHTML='<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--success-color); font-weight:bold;">🎉 Tidak ada anomali lupa scan saat ini. Semua data tersinkronisasi.</td></tr>';return}let m="";L.forEach(l=>{const o=l.status==="Lupa Scan",d=o?"var(--danger-color)":"var(--warning-color)",a=o?"🚨":"⏳",r=o?"background: rgba(239, 68, 68, 0.05);":"",t=new Date(l.timeInTransit).toLocaleString("id-ID",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"short"});m+=`
        <tr style="${r}">
          <td style="font-family:monospace; font-weight:bold; color:var(--accent-color);">${l.barcode}</td>
          <td style="font-weight:600;">${l.materialName}</td>
          <td>
            <div style="font-weight:600;">Shift ${l.shift||"-"}</div>
            <div style="font-size:0.85rem; color:var(--text-secondary);">${t}</div>
          </td>
          <td><span style="font-weight:bold; color:${l.waitingHours>4?"var(--danger-color)":"inherit"};">${l.waitingHours} Jam</span></td>
          <td style="text-align:center;">
            ${l.bppQtyDeducted>0?`<span style="color:var(--success-color); font-weight:bold;">Aktif (${l.bppQtyDeducted} pcs)</span>`:'<span style="color:var(--text-secondary);">Idle (0 pcs)</span>'}
          </td>
          <td>
            <div style="display:inline-flex; align-items:center; gap:8px; padding:4px 12px; border-radius:20px; background:rgba(0,0,0,0.2); border:1px solid ${d}40;">
              <span>${a}</span>
              <span style="color:${d}; font-weight:bold; font-size:0.9rem;">${l.status}</span>
            </div>
          </td>
        </tr>
      `}),$.innerHTML=m}function S(){if(window.location.hash!=="#/transit/anomaly")return;window.ChartWrapper&&window.ChartWrapper.destroyAll();const L=document.getElementById("page-content");L.innerHTML=`
      <div class="page-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(20, 20, 40, 0) 100%); padding: var(--sp-6); border-radius: var(--radius-lg); border: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: var(--sp-6); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <div>
            <h2 class="page-title" style="font-size:2rem; font-weight:800; background: linear-gradient(to right, #f87171, #fca5a5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); margin-bottom: 8px;">⚠️ Laporan Anomali Transit</h2>
            <p class="page-subtitle" style="color:var(--text-secondary); max-width:700px; line-height:1.5;">Deteksi pintar material yang tertahan di Transit melebihi batas waktu (3 Jam), disilangkan dengan data Hasil Produksi (BPP) untuk mencegah salah deteksi akibat mesin mati (trouble).</p>
          </div>
          <div>
            <button id="btn-refresh-anomaly" class="btn btn-secondary" style="display:flex; align-items:center; gap:8px;">
              <span>🔄</span> Refresh Data
            </button>
          </div>
        </div>

        <div class="glass-card" style="padding: 0; overflow:hidden;">
          <div style="padding: var(--sp-4); border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2);">
            <h3 style="font-weight:700; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
              <span style="color:var(--accent-color);">📋</span> Detail Potensi Lupa Scan
            </h3>
            <div style="font-size:0.85rem; color:var(--text-secondary);">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--danger-color); margin-right:4px;"></span> Lupa Scan (Ada Produksi)
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--warning-color); margin-left:12px; margin-right:4px;"></span> Idle / Trouble (Tidak Ada Produksi)
            </div>
          </div>
          <div class="table-container" style="margin:0; padding:0;">
            <table class="data-table" style="width:100%; min-width:800px;">
              <thead style="background: rgba(255,255,255,0.02);">
                <tr>
                  <th style="padding:16px;">Barcode Palet</th>
                  <th style="padding:16px;">Nama Material</th>
                  <th style="padding:16px;">Shift Kejadian & Waktu</th>
                  <th style="padding:16px;">Lama Menunggu</th>
                  <th style="padding:16px; text-align:center;">Status BPP Line (Hari Ini)</th>
                  <th style="padding:16px;">Kesimpulan Sistem</th>
                </tr>
              </thead>
              <tbody id="anomaly-tbody">
                <tr><td colspan="6" style="text-align:center; padding:20px;">Menyiapkan data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,document.getElementById("btn-refresh-anomaly").addEventListener("click",b),b()}return{render:S}})();window.TransitAnomalyReportPage=ft;const bt=(()=>{let e={lines:[],rows:[]};async function b(){const l=document.getElementById("filter-start-date").value,o=document.getElementById("filter-end-date").value,d=document.getElementById("filter-area").value,a=document.getElementById("btn-load-recap");a.disabled=!0,a.innerHTML='<span style="opacity:0.7;">⏳ Memuat...</span>';const r=document.getElementById("recap-table-wrap");r.innerHTML=`
      <div style="padding:40px; text-align:center; color:var(--text-muted);">
        <div style="font-size:2rem; margin-bottom:12px;">⏳</div>
        <div>Sedang memuat data rekap opname...</div>
      </div>`;try{e=await PMCStore.getOpnameRecap({startDate:l,endDate:o,area:d})||{lines:[],rows:[]}}catch{e={lines:[],rows:[]}}S(),a.disabled=!1,a.innerHTML="🔄 Tampilkan"}function P(){if(window.location.hash!=="#/opname-recap")return;const l=document.getElementById("page-content");l.innerHTML="";const o=document.createElement("div");o.className="page-enter";const d=document.createElement("div");d.className="page-header",d.innerHTML=`
      <div>
        <h2 class="page-title">📊 Hasil Rekap Opname</h2>
        <p class="page-subtitle">Laporan rekap stock check per material — Line Produksi &amp; Gudang Transit.</p>
      </div>
    `,o.appendChild(d);const a=new Set,r=PMCStore.lineStock;r&&typeof r=="object"&&Object.keys(r).forEach(H=>a.add(H));const t=[...a].sort(),s=document.createElement("div");s.className="card",s.style.marginBottom="var(--sp-4)",s.innerHTML=`
      <div style="display:flex; flex-wrap:wrap; gap:var(--sp-3); align-items:flex-end;">
        <div class="form-group" style="flex:1; min-width:140px;">
          <label class="form-label">📅 Tanggal Mulai</label>
          <input type="date" id="filter-start-date" class="form-input">
        </div>
        <div class="form-group" style="flex:1; min-width:140px;">
          <label class="form-label">📅 Tanggal Akhir</label>
          <input type="date" id="filter-end-date" class="form-input">
        </div>
        <div class="form-group" style="flex:1; min-width:160px;">
          <label class="form-label">🏭 Filter Area</label>
          <select id="filter-area" class="form-input">
            <option value="ALL">Semua Area (Line + Transit)</option>
            <option value="ALL_LINES">Semua Line Produksi</option>
            <option value="TRANSIT">Hanya Transit</option>
            ${t.map(H=>`<option value="${H}">Hanya Line ${H}</option>`).join("")}
          </select>
        </div>
        <div style="display:flex; gap:var(--sp-2); padding-bottom:2px;">
          <button id="btn-load-recap" class="btn btn-primary" style="font-weight:700;">🔄 Tampilkan</button>
          <button id="btn-export-excel" class="btn btn-success" style="font-weight:700;">📊 Excel</button>
          <button id="btn-export-pdf" class="btn" style="background:linear-gradient(135deg,#e74c3c,#c0392b); color:white; font-weight:700;">📄 PDF</button>
        </div>
      </div>
    `,o.appendChild(s);const y=document.createElement("div");y.id="recap-summary",y.style.cssText="display:flex; gap:var(--sp-3); margin-bottom:var(--sp-4); flex-wrap:wrap;",o.appendChild(y);const p=document.createElement("div");p.className="card",p.style.cssText="padding:0; overflow:hidden;";const T=document.createElement("div");T.id="recap-table-wrap",T.style.cssText="overflow-x:auto; max-height:72vh; overflow-y:auto;",T.innerHTML=`
      <div style="padding:40px; text-align:center; color:var(--text-muted);">
        <div style="font-size:2.5rem; margin-bottom:12px;">📋</div>
        <div>Klik <strong>"Tampilkan"</strong> untuk memuat rekap opname.</div>
      </div>`,p.appendChild(T),o.appendChild(p),l.appendChild(o),document.getElementById("btn-load-recap").addEventListener("click",b),document.getElementById("btn-export-excel").addEventListener("click",$),document.getElementById("btn-export-pdf").addEventListener("click",m);const x=new Date().toISOString().split("T")[0];document.getElementById("filter-start-date").value=x,document.getElementById("filter-end-date").value=x,b(),TopbarComponent.render("Hasil Rekap Opname")}function S(){const l=document.getElementById("recap-table-wrap");if(!l)return;const{lines:o,rows:d}=e,a=document.getElementById("recap-summary");if(a){const E=d.length,g=d.filter(n=>n.selisih>0).length,h=d.filter(n=>n.selisih<0).length,i=d.filter(n=>n.selisih===0).length;a.innerHTML=`
        ${L("📦","Total Material",E,"var(--primary)")}
        ${L("✅","Stok Sesuai",i,"var(--success)")}
        ${L("⬆️","Lebih Fisik",g,"#f39c12")}
        ${L("⬇️","Kurang Fisik",h,"var(--danger)")}
      `}if(!d||d.length===0){l.innerHTML=`
        <div style="padding:60px; text-align:center; color:var(--text-muted);">
          <div style="font-size:2.5rem; margin-bottom:12px;">🔍</div>
          <div>Tidak ada data opname pada periode yang dipilih.</div>
        </div>`;return}let r="";o.forEach(E=>{r+=`<th style="text-align:right; background:rgba(108,92,231,0.12); min-width:90px; border-right:1px solid var(--border-color);">Line ${E}</th>`});let t="";d.forEach((E,g)=>{const h=E.selisih>0?"color:#f39c12; font-weight:bold;":E.selisih<0?"color:var(--danger); font-weight:bold;":"color:var(--text-muted);",i=(E.selisih>0?"+":"")+E.selisih.toLocaleString("id-ID"),n=g%2===0?"":"background:rgba(255,255,255,0.02);";let k="";o.forEach(u=>{const v=E.lineValues[u]||{qtyBook:0,qtyPhysical:0},D=v.qtyPhysical.toLocaleString("id-ID"),M=v.qtyPhysical!==v.qtyBook?v.qtyPhysical>v.qtyBook?"color:#f39c12;":"color:var(--danger);":"";k+=`<td style="text-align:right; font-family:monospace; ${M} border-right:1px solid var(--border-color);">${v.qtyPhysical>0?D:'<span style="opacity:0.3;">-</span>'}</td>`});const C=E.transit.qtyPhysical!==E.transit.qtyBook?E.transit.qtyPhysical>E.transit.qtyBook?"color:#f39c12;":"color:var(--danger);":"";t+=`
        <tr style="${n}">
          <td style="font-family:monospace; font-size:0.78rem; color:var(--text-secondary); white-space:nowrap;">${E.oracleCode||"-"}</td>
          <td style="font-weight:600; min-width:200px;">${E.materialName}</td>
          <td style="text-align:center;"><span class="badge badge-accent" style="font-size:0.75rem;">${E.uom}</span></td>
          ${k}
          <td style="text-align:right; font-family:monospace; ${C} border-right:1px solid var(--border-color);">${E.transit.qtyPhysical>0?E.transit.qtyPhysical.toLocaleString("id-ID"):'<span style="opacity:0.3;">-</span>'}</td>
          <td style="text-align:right; font-family:monospace; font-weight:bold;">${E.totalBook.toLocaleString("id-ID")}</td>
          <td style="text-align:right; font-family:monospace; font-weight:bold;">${E.totalPhysical.toLocaleString("id-ID")}</td>
          <td style="text-align:right; ${h}">${i}</td>
        </tr>`});const s=d.reduce((E,g)=>E+g.totalBook,0),y=d.reduce((E,g)=>E+g.totalPhysical,0),p=y-s,T=p>0?"color:#f39c12;":p<0?"color:var(--danger);":"";let x="";o.forEach(E=>{const g=d.reduce((h,i)=>{var n;return h+(((n=i.lineValues[E])==null?void 0:n.qtyPhysical)||0)},0);x+=`<td style="text-align:right; font-weight:bold; font-family:monospace; border-right:1px solid var(--border-color);">${g.toLocaleString("id-ID")}</td>`});const H=d.reduce((E,g)=>E+g.transit.qtyPhysical,0),A="background:rgba(108,92,231,0.12); font-weight:bold;";let f="";if(e.notOpnamed&&e.notOpnamed.length>0){let E="";e.notOpnamed.forEach(g=>{E+=`
          <tr>
            <td style="font-family:monospace; font-size:0.78rem; color:var(--text-secondary); white-space:nowrap;">${g.oracleCode||"-"}</td>
            <td style="font-weight:600;">${g.materialName}</td>
            <td style="text-align:center;"><span class="badge badge-accent" style="font-size:0.75rem;">${g.uom}</span></td>
            <td style="text-align:right; font-family:monospace; color:var(--danger); font-weight:bold;">${g.lastKnownBook.toLocaleString("id-ID")}</td>
          </tr>`}),f=`
        <div style="margin-top:var(--sp-4); padding:var(--sp-3); border-radius:var(--radius-lg); background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.2);">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <div style="font-size:1.5rem;">⚠️</div>
            <div>
              <h3 style="color:var(--danger); margin:0;">Material Belum Ter-Opname (${e.notOpnamed.length})</h3>
              <div style="font-size:0.8rem; color:var(--text-muted);">Material di bawah ini tercatat memiliki stok buku di sistem namun belum dilakukan opname pada periode ini.</div>
            </div>
          </div>
          <table class="data-table" style="font-size:0.83rem; width:100%; border-collapse:collapse; background:var(--bg-card);">
            <thead>
              <tr style="background:rgba(231,76,60,0.1);">
                <th style="text-align:left;">Kode Oracle</th>
                <th style="text-align:left;">Nama Material</th>
                <th style="text-align:center;">UOM</th>
                <th style="text-align:right;">Stok Buku Terakhir</th>
              </tr>
            </thead>
            <tbody>${E}</tbody>
          </table>
        </div>
      `}l.innerHTML=`
      <table class="data-table" id="recap-table" style="font-size:0.83rem; width:100%; border-collapse:collapse;">
        <thead style="position:sticky; top:0; z-index:10; background:var(--bg-card);">
          <tr>
            <th style="min-width:120px; text-align:left;">Kode Oracle</th>
            <th style="min-width:200px; text-align:left;">Nama Material</th>
            <th style="text-align:center;">UOM</th>
            ${r}
            <th style="text-align:right; background:rgba(16,185,129,0.12); min-width:90px; border-right:1px solid var(--border-color);">Transit</th>
            <th style="text-align:right; min-width:90px;">Total Buku</th>
            <th style="text-align:right; min-width:90px;">Total Aktual</th>
            <th style="text-align:right; min-width:80px;">Selisih</th>
          </tr>
        </thead>
        <tbody>${t}</tbody>
        <tfoot>
          <tr style="${A}">
            <td colspan="3" style="font-weight:bold; padding:8px 12px;">Grand Total (${d.length} material)</td>
            ${x}
            <td style="text-align:right; font-family:monospace; border-right:1px solid var(--border-color);">${H.toLocaleString("id-ID")}</td>
            <td style="text-align:right; font-family:monospace;">${s.toLocaleString("id-ID")}</td>
            <td style="text-align:right; font-family:monospace;">${y.toLocaleString("id-ID")}</td>
            <td style="text-align:right; ${T}">${(p>0?"+":"")+p.toLocaleString("id-ID")}</td>
          </tr>
        </tfoot>
      </table>
      ${f}
    `}function L(l,o,d,a){return`
      <div style="flex:1; min-width:130px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:var(--sp-3) var(--sp-4); display:flex; flex-direction:column; gap:4px;">
        <div style="font-size:1.4rem;">${l}</div>
        <div style="font-size:0.78rem; color:var(--text-muted);">${o}</div>
        <div style="font-size:1.6rem; font-weight:900; color:${a};">${d}</div>
      </div>`}function $(){const{lines:l,rows:o}=e;if(!o||o.length===0){ToastComponent.show("Tidak ada data untuk diexport","warning");return}const d=o.map(a=>{const r={"Kode Oracle":a.oracleCode||"-","Nama Material":a.materialName,UOM:a.uom};return l.forEach(t=>{const s=a.lineValues[t]||{qtyBook:0,qtyPhysical:0};r[`Line ${t} - Buku`]=s.qtyBook,r[`Line ${t} - Fisik`]=s.qtyPhysical}),r["Transit - Buku"]=a.transit.qtyBook,r["Transit - Fisik"]=a.transit.qtyPhysical,r["Total Stok Buku"]=a.totalBook,r["Total Stok Aktual"]=a.totalPhysical,r.Selisih=a.selisih,r});try{const a=XLSX.utils.json_to_sheet(d),r=XLSX.utils.book_new();XLSX.utils.book_append_sheet(r,a,"Rekap Opname");const t=document.getElementById("filter-start-date").value,s=document.getElementById("filter-end-date").value;XLSX.writeFile(r,`Rekap_Opname_${t}_sd_${s}.xlsx`),ToastComponent.show("Export Excel berhasil!","success")}catch(a){console.error(a),ToastComponent.show("Gagal export Excel.","danger")}}function m(){const{lines:l,rows:o}=e;if(!o||o.length===0){ToastComponent.show("Tidak ada data untuk diexport","warning");return}try{if(typeof window.jspdf>"u"||!window.jspdf.jsPDF){ToastComponent.show("Library PDF belum termuat. Coba muat ulang halaman.","danger");return}const d=new window.jspdf.jsPDF({orientation:"landscape",unit:"mm",format:"a3"}),a=document.getElementById("filter-start-date").value||"-",r=document.getElementById("filter-end-date").value||"-",t=document.getElementById("filter-area"),s=t.options[t.selectedIndex].text;d.setFontSize(16),d.setFont("helvetica","bold"),d.text("Laporan Rekap Opname",14,18),d.setFontSize(9),d.setFont("helvetica","normal"),d.text(`Periode : ${a} s/d ${r}`,14,25),d.text(`Area    : ${s}`,14,30),d.text(`Dicetak : ${new Date().toLocaleString("id-ID")}`,14,35);const y=[],p=[];l.forEach(f=>{y.push({content:`Line ${f}`,colSpan:2,styles:{halign:"center",fillColor:[108,92,231]}}),p.push({content:"Buku",styles:{halign:"right",fontSize:7,fillColor:[80,70,160]}}),p.push({content:"Fisik",styles:{halign:"right",fontSize:7,fillColor:[80,70,160]}})});const T=[[{content:"Kode Oracle",rowSpan:2,styles:{valign:"middle"}},{content:"Nama Material",rowSpan:2,styles:{valign:"middle"}},{content:"UOM",rowSpan:2,styles:{halign:"center",valign:"middle"}},...y,{content:"Transit",colSpan:2,styles:{halign:"center",fillColor:[16,185,129]}},{content:"Total Buku",rowSpan:2,styles:{halign:"right",valign:"middle"}},{content:"Total Aktual",rowSpan:2,styles:{halign:"right",valign:"middle"}},{content:"Selisih",rowSpan:2,styles:{halign:"right",valign:"middle"}}],[...p,{content:"Buku",styles:{halign:"right",fontSize:7,fillColor:[10,140,100]}},{content:"Fisik",styles:{halign:"right",fontSize:7,fillColor:[10,140,100]}}]],x=o.map(f=>{const E=[f.oracleCode||"-",f.materialName,f.uom];return l.forEach(g=>{const h=f.lineValues[g]||{qtyBook:0,qtyPhysical:0};E.push(h.qtyBook>0?h.qtyBook.toLocaleString("id-ID"):"-"),E.push(h.qtyPhysical>0?h.qtyPhysical.toLocaleString("id-ID"):"-")}),E.push(f.transit.qtyBook>0?f.transit.qtyBook.toLocaleString("id-ID"):"-"),E.push(f.transit.qtyPhysical>0?f.transit.qtyPhysical.toLocaleString("id-ID"):"-"),E.push(f.totalBook.toLocaleString("id-ID")),E.push(f.totalPhysical.toLocaleString("id-ID")),E.push((f.selisih>0?"+":"")+f.selisih.toLocaleString("id-ID")),E});d.autoTable({startY:40,head:T,body:x,theme:"grid",styles:{fontSize:7.5,cellPadding:2},headStyles:{fillColor:[30,30,60],textColor:255,fontStyle:"bold"},alternateRowStyles:{fillColor:[240,240,255]},columnStyles:{0:{cellWidth:28},1:{cellWidth:40},2:{cellWidth:14,halign:"center"}},didParseCell:f=>{const E=3+l.length*2+2+3-1;if(f.section==="body"&&f.column.index===E){const g=parseFloat(String(f.cell.raw).replace(/[^0-9.-]/g,""));g<0?f.cell.styles.textColor=[231,76,60]:g>0&&(f.cell.styles.textColor=[243,156,18])}}});const H=a.replace(/-/g,""),A=r.replace(/-/g,"");d.save(`Rekap_Opname_${H}_sd_${A}.pdf`),ToastComponent.show("Export PDF berhasil!","success")}catch(d){console.error(d),ToastComponent.show("Gagal export PDF: "+d.message,"danger")}}return{render:P}})();window.OpnameRecapPage=bt;const yt=(()=>{let e="3F2";function b(L){e=L}function P(){if(window.location.hash!==`#/external/onhand-${e.toLowerCase()}`)return;ChartWrapper.destroyAll();const L=document.getElementById("page-content");L.innerHTML="";const $=document.createElement("div");$.className="page-enter";const m=e==="3F2"?"Produksi 3IN1 (3F2)":"Gudang Packing 3IN1 (3P2)",l=document.createElement("div");l.className="page-header",l.innerHTML=`
      <div>
        <h2 class="page-title">📦 Stock On-Hand — ${m}</h2>
        <p class="page-subtitle">Penerimaan dari Transit dan Saldo Stok Aktual di area ${m}</p>
      </div>
    `,$.appendChild(l);const o=document.createElement("div");o.style.marginBottom="var(--sp-6)",$.appendChild(o),S(o);const d=document.createElement("div");d.className="card";const a=document.createElement("h3");a.style.marginBottom="var(--sp-4)",a.style.display="flex",a.style.alignItems="center",a.style.gap="8px",a.innerHTML=`<span>📊</span> Total Stok Tersedia di ${e}`,d.appendChild(a);const r=PMCStore.getExternalOnhand(e).stock,t=Object.keys(r).map(s=>({name:s,pallet:r[s].qty,pcs:r[s].pcs})).sort((s,y)=>s.name.localeCompare(y.name));if(t.length===0)d.innerHTML+='<div class="empty-state">Belum ada stok barang di area ini.</div>';else{const s=DataTableComponent.create({columns:[{key:"name",label:"Nama Material"},{key:"pallet",label:"Jumlah Pallet",align:"center",render:y=>`<span class="badge badge-accent">${y}</span>`},{key:"pcs",label:"Total Pcs / Roll",align:"right",render:y=>`<strong>${PMCStore.formatNumber(y)}</strong>`}],data:t});d.appendChild(s)}$.appendChild(d),L.appendChild($),PMCStore.off(`${e}OnhandChanged`,P),PMCStore.on(`${e}OnhandChanged`,P),PMCStore.off("outboundPendingChanged",P),PMCStore.on("outboundPendingChanged",P),TopbarComponent.render("/external/onhand")}function S(L){const $=PMCStore.transitOutboundPending.filter(l=>l.destination===e);if($.length===0){L.innerHTML="";return}let m=`
      <div class="card" style="border: 2px solid var(--primary-color); background: rgba(108, 92, 231, 0.05); margin-bottom: var(--sp-4);">
        <h3 style="margin-bottom:var(--sp-3);display:flex;align-items:center;gap:8px;color:var(--primary-color);">
          📥 Terdapat ${$.length} Antrean Penerimaan dari Area Transit
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu Pengiriman</th>
              <th>Barcode</th>
              <th>Material</th>
              <th>Qty (Pcs)</th>
              <th style="width: 200px; text-align: center;">Aksi Penerimaan</th>
            </tr>
          </thead>
          <tbody>
    `;$.forEach(l=>{m+=`
        <tr>
          <td>${l.date} ${l.time}</td>
          <td><strong>${l.barcode}</strong></td>
          <td>${l.material}</td>
          <td>${l.pcs}</td>
          <td style="text-align: center; display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-primary btn-sm accept-btn" data-id="${l.id}" style="padding: 4px 8px; font-size: 0.8rem;">Terima Barang</button>
            <button class="btn btn-danger btn-sm reject-btn" data-id="${l.id}" style="padding: 4px 8px; font-size: 0.8rem;">Tolak</button>
          </td>
        </tr>
      `}),m+=`
          </tbody>
        </table>
      </div>
    `,L.innerHTML=m,L.querySelectorAll(".accept-btn").forEach(l=>{l.addEventListener("click",async o=>{const d=o.target.getAttribute("data-id");if(confirm(`Konfirmasi penerimaan barang ke ${e}?`)){const a=await PMCStore.verifyTransitOutbound(d,"accept");ToastComponent.show(a.message,a.success?"success":"danger"),P()}})}),L.querySelectorAll(".reject-btn").forEach(l=>{l.addEventListener("click",async o=>{const d=o.target.getAttribute("data-id");if(confirm("Tolak barang ini dan kembalikan truk ke Transit?")){const a=await PMCStore.verifyTransitOutbound(d,"reject");ToastComponent.show(a.message,a.success?"success":"danger"),P()}})})}return{render:P,setDestination:b}})();window.ExternalOnhandPage=yt;const vt=(()=>{async function e(){try{const S=document.getElementById("audit-tbody");S&&(S.innerHTML='<tr><td colspan="4" style="text-align:center;">Memuat data...</td></tr>');const $=await(await fetch(`${PMCStore.API_BASE}/audit?limit=200`)).json();$.success&&b($.data)}catch(S){console.error(S),ToastComponent.show("Gagal memuat audit log","error")}}function b(S){const L=document.getElementById("audit-tbody");if(!L)return;if(!S||S.length===0){L.innerHTML='<tr><td colspan="4" style="text-align:center; padding:20px;">Belum ada catatan aktivitas.</td></tr>';return}let $="";S.forEach(m=>{const l=new Date(m.timestamp).toLocaleString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",day:"2-digit",month:"short"});let o="var(--text-secondary)";m.module==="TRANSIT"?o="var(--primary)":m.module==="WAREHOUSE"&&(o="var(--warning)"),$+=`
        <tr>
          <td style="font-family:monospace; color:var(--text-muted);">${l}</td>
          <td style="font-weight:bold;">${m.user}</td>
          <td><span style="background:rgba(0,0,0,0.1); border:1px solid ${o}40; color:${o}; padding:2px 8px; border-radius:12px; font-size:0.8rem; font-weight:bold;">${m.module}</span></td>
          <td style="color:var(--text-primary); font-weight:500;">
             ${m.action}
             ${m.details?`<br><small style="color:var(--text-muted);">${m.details}</small>`:""}
          </td>
        </tr>
      `}),L.innerHTML=$}function P(){if(window.location.hash!=="#/audit")return;window.ChartWrapper&&window.ChartWrapper.destroyAll();const S=document.getElementById("page-content");S.innerHTML=`
      <div class="page-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h2 class="page-title">🔍 Log Aktivitas (Traceability)</h2>
            <p class="page-subtitle">Mencatat setiap aktivitas penting dalam sistem untuk keperluan audit dan keamanan.</p>
          </div>
          <div>
            <button id="btn-refresh-audit" class="btn btn-secondary">🔄 Refresh</button>
          </div>
        </div>

        <div class="card" style="padding:0; overflow:hidden;">
          <table class="data-table" style="width:100%;">
            <thead>
              <tr>
                <th style="padding:16px; width:150px;">Waktu</th>
                <th style="padding:16px; width:150px;">User</th>
                <th style="padding:16px; width:120px;">Modul</th>
                <th style="padding:16px;">Aktivitas & Detail</th>
              </tr>
            </thead>
            <tbody id="audit-tbody">
               <tr><td colspan="4" style="text-align:center;">Menyiapkan...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `,document.getElementById("btn-refresh-audit").addEventListener("click",e),e(),window.TopbarComponent&&TopbarComponent.render("/audit")}return{render:P}})();window.AuditLogPage=vt;const xt=(()=>{let e=null,b=[];function P(){const $=new Date().toISOString().split("T")[0];b=PMCStore.schedules.filter(l=>l.date===$&&(l.sh1>0||l.sh2>0||l.sh3>0))}function S(){if(window.location.hash!=="#/transit/outbound")return;P(),ChartWrapper.destroyAll();const L=document.getElementById("page-content");L.innerHTML="";const $=document.createElement("div");$.className="page-enter";const m=document.createElement("div");m.className="page-header",m.innerHTML=`
      <div>
        <h2 class="page-title">📤 Pengeluaran Area Transit (Outbound)</h2>
        <p class="page-subtitle">Pilih Line Produksi untuk mengambil material dari Area Transit</p>
      </div>
    `,$.appendChild(m);const l=document.createElement("div");l.style.display="grid",l.style.gridTemplateColumns="300px 1fr",l.style.gap="var(--sp-6)",l.style.alignItems="start";const o=document.createElement("div");o.className="card",o.innerHTML='<h3 style="margin-bottom:var(--sp-4);">⚙️ Pilih Line</h3>';const d=[...new Set(b.map(r=>r.line))].sort();if(d.length===0)o.innerHTML+='<div class="alert alert-warning">Tidak ada jadwal produksi hari ini.</div>';else{const r=document.createElement("div");r.style.display="flex",r.style.flexDirection="column",r.style.gap="var(--sp-2)",d.forEach(t=>{const s=document.createElement("button");s.className=`btn ${e===t?"btn-primary":"btn-ghost"}`,s.style.justifyContent="flex-start",s.innerHTML=`<span>🏭</span> <span>${t}</span>`,s.addEventListener("click",()=>{e=t,S()}),r.appendChild(s)}),o.appendChild(r)}l.appendChild(o);const a=document.createElement("div");if(a.className="card",a.style.minHeight="400px",!e)a.innerHTML=`
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-muted);opacity:0.6;">
          <div style="font-size:3rem;margin-bottom:var(--sp-3);">👈</div>
          <div>Pilih Line produksi dari panel di sebelah kiri</div>
        </div>
      `;else{a.innerHTML=`<h3 style="margin-bottom:var(--sp-4);border-bottom:1px solid var(--border-color);padding-bottom:var(--sp-2);">📦 Material untuk ${e}</h3>`;const r=b.filter(y=>y.line===e),t=new Set;r.forEach(y=>{const p=PMCStore.getBOM(y.skuId);p&&p.components.forEach(T=>t.add(T.name))});const s=[...t].sort();if(s.length===0)a.innerHTML+='<div class="alert alert-info">Belum ada material yang terdaftar di BOM untuk SKU di line ini.</div>';else{const y=document.createElement("div");y.style.display="flex",y.style.flexDirection="column",y.style.gap="var(--sp-3)";const p=PMCStore.getTransitInfo();s.forEach(T=>{const x=document.createElement("div");x.style.display="flex",x.style.alignItems="center",x.style.justifyContent="space-between",x.style.padding="12px",x.style.background="var(--bg-secondary)",x.style.borderRadius="var(--radius-md)",x.style.borderLeft="4px solid var(--accent-color)";const H=p.materials[T]||0;x.innerHTML=`
            <div>
              <div style="font-weight:600;font-size:var(--fs-lg);">${T}</div>
              <div style="font-size:var(--fs-sm);color:var(--text-muted);margin-top:4px;">Stok Transit: <strong style="color:${H>0?"var(--success-color)":"var(--danger-color)"}">${H} Pallet</strong></div>
            </div>
          `;const A=document.createElement("div");A.style.display="flex",A.style.gap="var(--sp-2)",A.style.alignItems="center";const f=document.createElement("input");f.type="number",f.min="1",f.max=H.toString(),f.value="1",f.className="form-input",f.style.width="60px",f.disabled=H===0;const E=document.createElement("button");E.className="btn btn-primary",E.textContent="Ambil",E.disabled=H===0,E.addEventListener("click",async()=>{const g=parseInt(f.value)||1;if(g>H){ToastComponent.show("Jumlah ambil melebihi stok transit!","danger");return}E.disabled=!0,E.textContent="Memproses...";const h=await PMCStore.takeFromTransit(T,g,e);h.success?(ToastComponent.show(h.message,"success"),S()):(E.disabled=!1,E.textContent="Ambil",ToastComponent.show(h.message,"danger"))}),A.appendChild(f),A.appendChild(E),x.appendChild(A),y.appendChild(x)}),a.appendChild(y)}}l.appendChild(a),$.appendChild(l),L.appendChild($),TopbarComponent.render("/transit/outbound")}return{render:S}})();window.OutboundTransitPage=xt;const kt=(()=>{function e(){const b=document.getElementById("page-content");b.innerHTML=`
      <div class="page-header">
        <div>
          <h2>🖨️ Cetak Barcode Kustom</h2>
          <p class="text-secondary">Buat dan cetak rentang barcode secara bebas untuk kebutuhan operasional.</p>
        </div>
      </div>
      
      <div class="card" style="max-width: 600px; margin: 0 auto; margin-top: var(--sp-4);">
        <div class="card-header">
          <h3 class="card-title">Form Cetak Barcode</h3>
        </div>
        <div class="card-body">
          <div class="form-group mb-4" style="background: rgba(108, 92, 231, 0.05); padding: var(--sp-3); border-radius: 8px; border: 1px solid rgba(108, 92, 231, 0.1);">
            <label class="form-label" style="margin-bottom: 8px; font-weight: bold;">Pilih Sumber Data Barcode:</label>
            <div style="display: flex; gap: var(--sp-4);">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pb_source" value="warehouse" checked style="accent-color: var(--primary-color);"> 🏭 Gudang Utama
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pb_source" value="transit" style="accent-color: var(--primary-color);"> 📦 Blok Transit
              </label>
            </div>
            <small class="text-secondary" style="font-size: 11px; margin-top: 4px; display: block;">Menentukan dari mana data material akan ditarik (autofill).</small>
          </div>

          <div style="display: flex; gap: var(--sp-4); margin-bottom: var(--sp-4);">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Mulai Barcode *</label>
              <input type="text" id="pb-start" list="pb-barcode-list" class="form-input" style="font-family: monospace; font-weight: bold; color: var(--primary-color); transition: 0.3s;" placeholder="Ketik/Pilih barcode...">
              <datalist id="pb-barcode-list"></datalist>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Sampai Barcode</label>
              <input type="text" id="pb-end" class="form-input" style="font-family: monospace; font-weight: bold; color: var(--primary-color);" placeholder="Misal: 00005">
              <small class="text-secondary" style="font-size: 11px; margin-top: 4px; display: block;">Kosongkan jika hanya cetak 1 barcode</small>
            </div>
          </div>
          
          <div class="form-group mb-4">
            <label class="form-label">Nama Material (Otomatis/Manual)</label>
            <input type="text" id="pb-mat" class="form-input" placeholder="Contoh: KARTON ABC SUSU 12 X 10 X 30 (R3)" style="transition: background-color 0.5s;">
          </div>
          
          <div style="display: flex; gap: var(--sp-4); margin-bottom: var(--sp-4);">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">MID / Nomor Batch</label>
              <input type="text" id="pb-mid" class="form-input" placeholder="MID-202604..." style="transition: background-color 0.5s;">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">QTY per Pallet</label>
              <input type="number" id="pb-qty" class="form-input" placeholder="1000" style="transition: background-color 0.5s;">
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom: var(--sp-6);">
            <label class="form-label">Opsi QTY</label>
            <div style="display: flex; gap: var(--sp-4);">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pb_qty_opt" value="show" checked> Tampilkan Angka QTY
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="pb_qty_opt" value="hide"> Kosongkan QTY
              </label>
            </div>
          </div>
          
          <button id="btn-pb-print" class="btn btn-primary w-100" style="padding: 14px; font-size: 16px; justify-content: center;">
            🖨️ Generate PDF & Cetak Barcode (6x2.8 cm)
          </button>
        </div>
      </div>
    `;const P=document.getElementById("pb-start"),S=document.getElementById("pb-mat"),L=document.getElementById("pb-mid"),$=document.getElementById("pb-qty"),m=document.getElementById("pb-barcode-list"),l=document.querySelectorAll('input[name="pb_source"]');function o(){if(!window.PMCStore)return;const d=document.querySelector('input[name="pb_source"]:checked').value;m.innerHTML="";let a=[];d==="warehouse"&&window.PMCStore.getWarehouseStock?a=window.PMCStore.getWarehouseStock().map(r=>r.barcodeStart||r.barcode):d==="transit"&&Array.isArray(window.PMCStore.transitInventory)&&(a=window.PMCStore.transitInventory.map(r=>r.barcode)),a=[...new Set(a.filter(Boolean))],a.forEach(r=>{const t=document.createElement("option");t.value=r,m.appendChild(t)})}l.forEach(d=>d.addEventListener("change",o)),setTimeout(o,100),P.addEventListener("change",()=>{const d=P.value.trim();if(!d||!window.PMCStore)return;const a=document.querySelector('input[name="pb_source"]:checked').value;let r=null;a==="transit"&&Array.isArray(window.PMCStore.transitInventory)?r=window.PMCStore.transitInventory.find(t=>t.barcode===d):a==="warehouse"&&window.PMCStore.getWarehouseStock&&(r=window.PMCStore.getWarehouseStock().find(t=>t.barcodeStart===d||t.barcode===d)),r&&(S.value=r.material||r.materialName||"",L.value=r.mid||"",$.value=r.qty||r.qtyPerPallet||"",[S,L,$].forEach(t=>{t.style.backgroundColor="var(--success-color)",t.style.color="#fff",setTimeout(()=>{t.style.backgroundColor="",t.style.color=""},500)}))}),document.getElementById("btn-pb-print").addEventListener("click",()=>{const d=P.value.trim(),a=document.getElementById("pb-end").value.trim(),r=L.value.trim(),t=$.value.trim(),s=S.value.trim(),y=document.querySelector('input[name="pb_qty_opt"]:checked').value;if(!d){alert("Kolom 'Mulai Barcode' wajib diisi!"),P.focus();return}window.BarcodePrinter&&window.BarcodePrinter.printLabel?window.BarcodePrinter.printLabel({barcodeStart:d,barcodeEnd:a||d,mid:r,qty:t,materialName:s,dateIn:new Date().toISOString(),printQty:y==="show"}):alert("Sistem printer barcode belum siap. Harap tunggu beberapa detik atau muat ulang halaman.")})}return{render:e}})();window.PrintBarcodePage=kt;const wt=(()=>{function e(){document.getElementById("app");const S=document.getElementById("page-content"),L=document.getElementById("sidebar"),$=document.getElementById("topbar"),m=document.getElementById("main");L&&(L.style.display="none"),$&&($.style.display="none"),m&&(m.style.marginLeft="0",m.style.paddingTop="0"),S.innerHTML=`
      <div class="login-page-container">
        <!-- Floating Animated Background Orbs -->
        <div class="login-bg-orb orb-1"></div>
        <div class="login-bg-orb orb-2"></div>
        <div class="login-bg-orb orb-3"></div>

        <!-- Glassmorphism Card -->
        <div class="login-glass-card">
          
          <!-- Left: Animated Character Illustration (Lottie) -->
          <div class="login-illustration">
            <div class="login-lottie-container" style="display: flex; align-items: center; justify-content: center; margin: 0 auto;">
              <!-- Interactive Pure SVG 3D Robot -->
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" id="login-robot" style="width: 100%; height: 100%; max-width: 250px; filter: drop-shadow(0 20px 25px rgba(0,0,0,0.5)); display: block; margin: auto;">
                <defs>
                  <!-- 3D Gradients -->
                  <linearGradient id="body3D" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8" />
                    <stop offset="50%" stop-color="#0284c7" />
                    <stop offset="100%" stop-color="#0c4a6e" />
                  </linearGradient>
                  <linearGradient id="glassFace" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#020617" />
                  </linearGradient>
                  <linearGradient id="hand3D" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#e0f2fe" />
                    <stop offset="100%" stop-color="#38bdf8" />
                  </linearGradient>
                  <!-- Shadows -->
                  <filter id="innerShadow">
                    <feOffset dx="0" dy="4"/>
                    <feGaussianBlur stdDeviation="5" result="offset-blur"/>
                    <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                    <feFlood flood-color="black" flood-opacity="0.7" result="color"/>
                    <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                    <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
                  </filter>
                </defs>

                <!-- Antennas -->
                <line x1="50" y1="80" x2="30" y2="60" stroke="#bae6fd" stroke-width="8" stroke-linecap="round"/>
                <line x1="150" y1="80" x2="170" y2="60" stroke="#bae6fd" stroke-width="8" stroke-linecap="round"/>
                <circle cx="30" cy="60" r="12" fill="#e0f2fe">
                  <animate attributeName="r" values="12;15;12" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="170" cy="60" r="12" fill="#e0f2fe">
                  <animate attributeName="r" values="12;15;12" dur="1.5s" repeatCount="indefinite" delay="0.7s" />
                </circle>
                
                <!-- Main 3D Body -->
                <rect x="30" y="50" width="140" height="130" rx="40" fill="url(#body3D)" filter="url(#innerShadow)"/>
                
                <!-- Face Screen (Glassmorphism look) -->
                <rect x="50" y="70" width="100" height="65" rx="15" fill="url(#glassFace)" stroke="#0ea5e9" stroke-width="3"/>
                
                <!-- Eyes Group (Tracking) -->
                <g id="robot-eyes" style="transform: translate(0px, 0px); transition: transform 0.1s ease-out;">
                  <!-- Left Eye -->
                  <ellipse cx="75" cy="100" rx="10" ry="14" fill="#38bdf8">
                    <animate attributeName="ry" values="14;2;14;14;14;14" dur="4s" repeatCount="indefinite" />
                  </ellipse>
                  <circle cx="78" cy="96" r="3" fill="#ffffff" opacity="0.8"/>
                  
                  <!-- Right Eye -->
                  <ellipse cx="125" cy="100" rx="10" ry="14" fill="#38bdf8">
                    <animate attributeName="ry" values="14;2;14;14;14;14" dur="4s" repeatCount="indefinite" />
                  </ellipse>
                  <circle cx="128" cy="96" r="3" fill="#ffffff" opacity="0.8"/>
                </g>
                
                <!-- Blushing Cheeks -->
                <circle cx="60" cy="115" r="8" fill="#ec4899" opacity="0.4" filter="blur(2px)"/>
                <circle cx="140" cy="115" r="8" fill="#ec4899" opacity="0.4" filter="blur(2px)"/>

                <!-- Mouth -->
                <path d="M 85 145 Q 100 155 115 145" fill="none" stroke="#e0f2fe" stroke-width="5" stroke-linecap="round" id="robot-mouth" style="transition: all 0.3s;" />

                <!-- 3D Hands (Moves up to cover eyes) -->
                <g id="robot-hands" style="transform: translateY(50px); transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);">
                  <!-- Left Hand -->
                  <rect x="55" y="150" width="40" height="50" rx="20" fill="url(#hand3D)" filter="url(#innerShadow)"/>
                  <!-- Right Hand -->
                  <rect x="105" y="150" width="40" height="50" rx="20" fill="url(#hand3D)" filter="url(#innerShadow)"/>
                </g>
              </svg>
            </div>
            <h2>Sistem PMC</h2>
            <p>Packaging Material Calculator<br>JIT & Inventory Management</p>
          </div>

          <!-- Right: Login Form -->
          <div class="login-form-section">
            <h1>Wilujeng Sumping</h1>
            <p class="subtitle">Mangga lebetkeun email sareng sandi anjeun kanggo lajengkeun</p>
            
            <div id="login-error" style="display:none; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ff6b6b; padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:13px; text-align:center; animation: shake 0.4s ease-in-out;"></div>
            
            <form id="loginForm">
              <div class="login-input-group">
                <input type="email" id="login-email" placeholder=" " required autocomplete="email" />
                <label for="login-email">Email</label>
              </div>
              
              <div class="login-input-group">
                <input type="password" id="login-password" placeholder=" " required />
                <label for="login-password">Password</label>
              </div>
              
              <button type="submit" class="btn-animated-login" id="login-submit-btn">
                <span>Lebet (Sign In)</span>
              </button>
            </form>

            <div style="margin-top:20px; text-align:center; font-size:11px; color:rgba(255,255,255,0.3);">
              PMC JIT System v2.0 — PT. Santos Jaya Abadi
            </div>
          </div>

        </div>
      </div>
      <style>
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      </style>
    `,b(),P()}function b(){document.getElementById("loginForm").addEventListener("submit",async L=>{L.preventDefault();const $=document.getElementById("login-submit-btn"),m=document.getElementById("login-error"),l=document.getElementById("login-email"),o=document.getElementById("login-password"),d=l.value.trim(),a=o.value;$.innerHTML="<span>Nuju Lebet...</span>",$.style.opacity="0.7",$.disabled=!0,m.style.display="none";try{await window.Auth.login(d,a);const r=document.getElementById("sidebar"),t=document.getElementById("topbar"),s=document.getElementById("main");r&&(r.style.display=""),t&&(t.style.display=""),s&&(s.style.marginLeft="",s.style.paddingTop="");const y=window.Auth.getDefaultRoute();window.location.hash=y.replace("#","")}catch(r){m.textContent="❌ "+(r.message||"Login gagal. Periksa email dan password Anda."),m.style.display="block",$.innerHTML="<span>Lebet (Sign In)</span>",$.style.opacity="1",$.disabled=!1;const t=document.getElementById("robot-mouth");t&&(t.setAttribute("d","M 90 150 Q 100 145 110 150"),setTimeout(()=>t.setAttribute("d","M 85 145 Q 100 155 115 145"),1500))}})}function P(){const S=document.getElementById("robot-eyes"),L=document.getElementById("robot-hands"),$=document.getElementById("robot-mouth"),m=document.getElementById("login-email"),l=document.getElementById("login-password");m&&S&&(m.addEventListener("focus",()=>{L.style.transform="translateY(50px)",$.setAttribute("d","M 85 145 Q 100 155 115 145")}),m.addEventListener("input",o=>{const d=o.target.value.length,r=-12+Math.min(d,25)/25*24,t=4;S.style.transform=`translate(${r}px, ${t}px)`}),m.addEventListener("blur",()=>{S.style.transform="translate(0px, 0px)"})),l&&L&&(l.addEventListener("focus",()=>{L.style.transform="translateY(-70px)",S.style.transform="translate(0px, -5px)",$.setAttribute("d","M 90 150 Q 100 145 110 150")}),l.addEventListener("blur",()=>{L.style.transform="translateY(50px)",S.style.transform="translate(0px, 0px)",$.setAttribute("d","M 85 145 Q 100 155 115 145")}))}return{render:e}})();window.LoginPage=wt;const St=(()=>{const e={"/":()=>LoginPage.render(),"/dashboard":()=>{TopbarComponent.render("/dashboard"),DashboardPage.render()},"/master/sku":()=>MasterSKUPage.render(),"/master/bom":()=>MasterBOMPage.render(),"/master/block":()=>MasterBlockPage.render(),"/master/line-sku":()=>MasterLineSKUPage.render(),"/master/supplier":()=>MasterSupplierPage.render(),"/master/kamus-opname":()=>MasterKamusOpnamePage.render(),"/schedule":()=>ScheduleImportPage.render(),"/summary":()=>ShiftSummaryPage.render(),"/materials":()=>MaterialCalcPage.render(),"/distribution":()=>DistributionPage.render(),"/distribution/hourly":()=>DistributionHourlyPage.render(),"/stock":()=>StockCheckPage.render(),"/warehouse/stock":()=>WarehouseStockPage.render(),"/warehouse/delivery":()=>WarehouseDeliveryPage.render(),"/warehouse/outbound":()=>WarehouseOutboundPage.render(),"/transit/inbound":()=>InboundTransitPage.render(),"/transit/outbound":()=>TransitOutboundPage.render(),"/transit/stock-on-hand":()=>StockOnHandTransitPage.render(),"/transit/info":()=>LiveDistributionPage.render(),"/transit/mutation":()=>StockMutationPage.render(),"/transit/manual-spb":()=>ManualSpbPage.render(),"/tv/inbound":()=>TvDashboardPage.render(),"/transit/relocation":()=>TransitRelocationPage.render(),"/transit/verify-reject":()=>TransitRejectVerifyPage.render(),"/transit/master-receh":()=>MasterRecehPage.render(),"/transit/opname":()=>TransitOpnamePage.render(),"/transit/anomaly":()=>TransitAnomalyReportPage.render(),"/audit":()=>AuditLogPage.render(),"/produksi/inbound":()=>ProduksiInboundPage.render(),"/produksi/outbound":()=>ProduksiOutboundPage.render(),"/produksi/reject":()=>ProduksiRejectPage.render(),"/produksi/onhand":()=>ProduksiOnhandPage.render(),"/produksi/bpp":()=>ProduksiBppPage.render(),"/produksi/mutation":()=>ProduksiMutasiPage.render(),"/produksi/opname":()=>ProduksiOpnamePage.render(),"/external/onhand-3p2":()=>{ExternalOnhandPage.setDestination("3P2"),ExternalOnhandPage.render()},"/external/onhand-3f2":()=>{ExternalOnhandPage.setDestination("3F2"),ExternalOnhandPage.render()},"/opname-recap":()=>OpnameRecapPage.render(),"/print-barcode":()=>PrintBarcodePage.render(),"/login":()=>LoginPage.render()},b=["/","/login"];function P(){const $=window.location.hash.replace("#","").split("?")[0]||"/",m=e[$],l=document.getElementById("page-content"),o=b.includes($);if(!o&&window.Auth){if(!window.Auth.isLoggedIn()){window.location.hash="#/login";return}if(!window.Auth.canAccessRoute($)){const d=window.Auth.getDefaultRoute();window.location.hash=d.replace("#",""),setTimeout(()=>{window.ToastComponent&&ToastComponent.show("⛔ Akses ditolak — Anda tidak memiliki izin untuk halaman tersebut.","error")},300);return}}if((o&&$!=="/"||$==="/login")&&window.Auth&&window.Auth.isLoggedIn()){const d=window.Auth.getDefaultRoute();window.location.hash=d.replace("#","");return}if(l.classList.remove("page-enter"),l.offsetWidth,l.classList.add("page-enter"),ChartWrapper.destroyAll(),m)try{m()}catch(d){l.innerHTML=`
          <div class="empty-state" style="color:red;white-space:pre-wrap;text-align:left;padding:20px">
            <h3 style="color:red">⚠️ Error Rendering Halaman: ${$}</h3>
            <pre style="background:#1a1a2e;padding:16px;border-radius:8px;overflow:auto;font-size:13px;color:#ff6b6b">${d.message}

${d.stack}</pre>
          </div>
        `,console.error("Page render error:",d)}else l.innerHTML=`
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Halaman tidak ditemukan</div>
          <a href="#/" class="btn btn-primary">Kembali ke Dashboard</a>
        </div>
      `;if(SidebarComponent.render(),window.self!==window.top){const d=document.getElementById("sidebar"),a=document.getElementById("topbar"),r=document.getElementById("main");d&&(d.style.display="none"),a&&(a.style.display="none"),r&&(r.style.marginLeft="0",r.style.paddingTop="0")}}function S(){window.addEventListener("hashchange",P),P()}return{init:S,navigate:P}})();window.Router=St;document.addEventListener("DOMContentLoaded",async()=>{try{await Auth.getSession()}catch{}Auth.isLoggedIn()||(!window.location.hash||window.location.hash==="#/"||window.location.hash!=="#/login")&&(window.location.hash="#/login"),SidebarComponent.render(),Router.init(),ge(async()=>{const{registerSW:e}=await import("./virtual_pwa-register-DQklhzZV.js");return{registerSW:e}},[]).then(({registerSW:e})=>{e({onNeedRefresh(){console.log("New content available, refreshing...")},onOfflineReady(){console.log("App ready to work offline")}})}).catch(()=>{console.warn("[PWA] Service worker registration skipped (dev mode or unavailable).")})});export{ge as _};
