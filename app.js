const CHAPTERS = [
"Electric Charges and Fields","Electrostatic Potential and Capacitance","Current Electricity",
"Moving Charges and Magnetism","Magnetism and Matter","Electromagnetic Induction",
"Alternating Current","Electromagnetic Waves","Ray Optics and Optical Instruments","Wave Optics"
];
const cfg=window.PHYSICS_CONFIG||{};
const configured=cfg.SUPABASE_URL&&!cfg.SUPABASE_URL.startsWith("YOUR_")&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.startsWith("YOUR_");
const db=configured?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
let activeKind="derivations",resources=[],session=null;
const $=id=>document.getElementById(id);
function safeDriveUrl(raw){
 try{const u=new URL(raw);if(u.protocol!=="https:"||!["drive.google.com","docs.google.com"].includes(u.hostname))return null;return u.href}catch{return null}
}
function render(){
 const q=$("searchInput").value.trim().toLowerCase();
 const filtered=CHAPTERS.map((name,i)=>({name,i,items:resources.filter(r=>r.kind===activeKind&&r.chapter===i+1&&r.title.toLowerCase().includes(q))}))
 .filter(c=>!q||c.name.toLowerCase().includes(q)||c.items.length);
 $("chapterGrid").innerHTML=filtered.map(c=>`<article class="chapter-card" data-chapter="${c.i+1}">
 <div class="chapter-head" role="button" tabindex="0" aria-expanded="false"><span class="chapter-num">${String(c.i+1).padStart(2,"0")}</span><span class="chapter-name">Chapter ${c.i+1}<br>${c.name}</span><span class="chevron">⌄</span></div>
 <div class="topic-list">${c.items.length?c.items.map(r=>`<div class="topic-row"><span>${escapeHtml(r.title)}</span><a href="${escapeAttr(r.url)}" target="_blank" rel="noopener noreferrer">Open PDF ↗</a></div>`).join(""):'<div class="no-topics">Resources will appear here soon.</div>'}</div></article>`).join("");
 document.querySelectorAll(".chapter-head").forEach(el=>{const toggle=()=>{const card=el.closest(".chapter-card");card.classList.toggle("open");el.setAttribute("aria-expanded",card.classList.contains("open"))};el.addEventListener("click",toggle);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}})});
 $("resourceCount").textContent=`${resources.filter(r=>r.kind===activeKind).length} ${activeKind} topics`;
 $("emptyState").classList.toggle("hidden",filtered.length!==0);
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
async function loadResources(){
 if(!db){resources=[];render();return}
 const {data,error}=await db.from("resources").select("*").order("created_at",{ascending:false});
 if(error){console.error(error);resources=[]}else resources=data||[];
 render();if(session)renderAdminList();
}
function setKind(k){activeKind=k;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.kind===k));render()}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setKind(b.dataset.kind)));
$("searchInput").addEventListener("input",render);
function openModal(){$("adminModal").classList.remove("hidden");$("loginMessage").textContent="";$("resourceMessage").textContent=""}
function closeModal(){$("adminModal").classList.add("hidden")}
$("adminOpen").onclick=()=>{openModal();if(!configured){$("loginView").classList.add("hidden");$("dashboardView").classList.add("hidden");$("configView").classList.remove("hidden")}else{$("configView").classList.add("hidden");showAuthState()}}
$("adminClose").onclick=closeModal;
$("adminModal").addEventListener("click",e=>{if(e.target===$("adminModal"))closeModal()});
function showAuthState(){ $("loginView").classList.toggle("hidden",!!session);$("dashboardView").classList.toggle("hidden",!session);if(session){$("adminEmailLabel").textContent=session.user.email||"Signed in";renderAdminList()} }
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();if(!db)return;const {data,error}=await db.auth.signInWithPassword({email:$("adminEmail").value,password:$("adminPassword").value});if(error){$("loginMessage").textContent=error.message;return}session=data.session;showAuthState()});
$("logoutBtn").onclick=async()=>{await db.auth.signOut();session=null;showAuthState()};
function fillChapterSelect(){$("resourceChapter").innerHTML=CHAPTERS.map((c,i)=>`<option value="${i+1}">Chapter ${i+1}: ${c}</option>`).join("")}
fillChapterSelect();
$("resourceForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!session)return;
 const url=safeDriveUrl($("driveUrl").value.trim());
 if(!url){$("resourceMessage").textContent="Please enter a valid Google Drive or Google Docs HTTPS link.";return}
 const payload={kind:$("resourceKind").value,chapter:Number($("resourceChapter").value),title:$("topicTitle").value.trim(),url,created_by:session.user.id};
 const {error}=await db.from("resources").insert(payload);
 if(error){$("resourceMessage").textContent=error.message;return}
 $("resourceForm").reset();fillChapterSelect();$("resourceMessage").style.color="#16834a";$("resourceMessage").textContent="Topic added successfully.";await loadResources();
});
async function renderAdminList(){
 const list=$("adminResourceList");
 if(!resources.length){list.innerHTML='<p class="muted">No topics added yet.</p>';return}
 list.innerHTML=resources.map(r=>`<div class="admin-item"><span>${escapeHtml(r.title)} · Ch. ${r.chapter} · ${r.kind}</span><button class="delete-btn" data-id="${escapeAttr(r.id)}">Delete</button></div>`).join("");
 list.querySelectorAll(".delete-btn").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this topic?"))return;const {error}=await db.from("resources").delete().eq("id",b.dataset.id);if(error){alert(error.message);return}await loadResources()});
}
if(db){db.auth.getSession().then(({data})=>{session=data.session;showAuthState()});db.auth.onAuthStateChange((_event,s)=>{session=s;showAuthState()})}
loadResources();
