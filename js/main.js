
const SAMPLE_PROPERTIES=[{propertyCode:'BGP-1001',propertyType:'Apartment',locality:'Calicut City',area:'Kozhikode',sizeText:'3 BHK / 1450 sqft',publicPriceRange:'₹75 Lakhs - ₹85 Lakhs',description:'Well-connected apartment option near major facilities. Exact tower, seller details, and documents are available only after verification.',highlights:'Lift, Parking, Family location, Nearby shops',imageURL:'',featured:'Yes'},{propertyCode:'BGP-1002',propertyType:'Villa',locality:'Kunnamangalam Side',area:'Kozhikode',sizeText:'4 BHK / 2200 sqft',publicPriceRange:'₹1.15 Cr - ₹1.35 Cr',description:'Independent villa option in a residential area. Exact location and owner details are protected in the backend.',highlights:'Road access, Parking, Open well, Quiet area',imageURL:'',featured:'Yes'},{propertyCode:'BGP-1003',propertyType:'Land',locality:'Peringolam Area',area:'Kozhikode',sizeText:'10 to 20 cents',publicPriceRange:'Price on verified request',description:'Residential land option suitable for home construction. Survey number and ownership details are backend-protected.',highlights:'Residential zone, Road access, Good frontage',imageURL:'',featured:'No'}];
let allProperties=[];document.addEventListener('DOMContentLoaded',()=>{const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();if(document.getElementById('propertyList')||document.getElementById('featuredProperties'))loadPublicProperties();if(document.getElementById('propertyDetails'))loadPropertyDetailsPage();});
function toggleMenu(){const m=document.getElementById('mainMenu');if(m)m.classList.toggle('open')}




async function loadCountries(){
  const selects = document.querySelectorAll(".country-select");
  if(!selects.length) return;

  let countries = FALLBACK_COUNTRIES;

  if (typeof APPS_SCRIPT_URL !== "undefined" && APPS_SCRIPT_URL) {
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=countries&ts=${Date.now()}`);
      const data = await res.json();
      if(data.ok && Array.isArray(data.countries) && data.countries.length){
        countries = data.countries;
      }
    } catch(err){
      console.warn("Using fallback countries.", err);
    }
  }

  selects.forEach(select => {
    const current = select.value;
    select.innerHTML = `<option value="">Select Country</option>` + countries.map(c => {
      const code = safe(c.countryCode || c.CountryCode || "");
      const name = safe(c.countryName || c.CountryName || "");
      const phone = safe(c.phoneCode || c.PhoneCode || "");
      return `<option value="${code}">${name}${phone ? " (" + phone + ")" : ""}</option>`;
    }).join("");
    if(current) select.value = current;
  });
}

async function postAuthAction(payload){
  if (!(typeof APPS_SCRIPT_URL !== "undefined" && APPS_SCRIPT_URL)) {
    return { ok:false, message:"Backend is not connected yet. Paste your Apps Script Web App URL in js/config.js." };
  }

  const res = await fetch(APPS_SCRIPT_URL, {
    method:"POST",
    body:new URLSearchParams(payload)
  });
  return await res.json();
}

async function customerSignup(event){
  event.preventDefault();
  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "customerSignup";

  setFormStatus(status, "Creating account...", "success");
  if(button) button.disabled = true;

  try{
    const data = await postAuthAction(payload);
    if(data.ok){
      localStorage.setItem("bgpCustomerSession", JSON.stringify(data.customer));
      setFormStatus(status, data.message || "Account created successfully.", "success");
      window.location.href = "customer-dashboard.html";
    }else{
      setFormStatus(status, data.message || "Signup failed.", "error");
    }
  }catch(err){
    setFormStatus(status, "Signup failed. Check backend deployment.", "error");
  }finally{
    if(button) button.disabled = false;
  }
}

async function customerLogin(event){
  event.preventDefault();
  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "customerLogin";

  setFormStatus(status, "Logging in...", "success");
  if(button) button.disabled = true;

  try{
    const data = await postAuthAction(payload);
    if(data.ok){
      localStorage.setItem("bgpCustomerSession", JSON.stringify(data.customer));
      window.location.href = "customer-dashboard.html";
    }else{
      setFormStatus(status, data.message || "Invalid login.", "error");
    }
  }catch(err){
    setFormStatus(status, "Login failed. Check backend deployment.", "error");
  }finally{
    if(button) button.disabled = false;
  }
}

function getCustomerSession(){
  try{
    return JSON.parse(localStorage.getItem("bgpCustomerSession") || "null");
  }catch(err){
    return null;
  }
}

function initCustomerDashboard(){
  const box = document.getElementById("customerProfileBox");
  if(!box) return;

  const session = getCustomerSession();
  if(!session){
    box.innerHTML = `<p>Please login to access your customer dashboard.</p><a class="btn primary" href="customer-login.html">Login / Signup</a>`;
    return;
  }

  const welcome = document.getElementById("customerWelcome");
  if(welcome) welcome.textContent = `Welcome, ${safe(session.name || "Customer")}`;

  box.innerHTML = `
    <div class="profile-line"><strong>Name</strong><span>${safe(session.name || "")}</span></div>
    <div class="profile-line"><strong>Phone</strong><span>${safe(session.phone || "")}</span></div>
    <div class="profile-line"><strong>Email</strong><span>${safe(session.email || "")}</span></div>
    <div class="profile-line"><strong>Country</strong><span>${safe(session.country || "")}</span></div>
    <div class="profile-line"><strong>Location</strong><span>${safe(session.location || "")}</span></div>
    <div class="referral-code-box">Referral Code: ${safe(session.referralCode || "")}</div>
  `;
}

function customerLogout(){
  localStorage.removeItem("bgpCustomerSession");
  window.location.href = "customer-login.html";
}

async function submitCustomerReferral(event){
  event.preventDefault();
  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const session = getCustomerSession();

  if(!session){
    setFormStatus(status, "Please login before submitting referral.", "error");
    return;
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "customerReferral";
  payload.customerId = session.customerId || "";
  payload.referralCode = session.referralCode || "";
  payload.referrerName = session.name || "";
  payload.referrerPhone = session.phone || "";
  payload.referrerEmail = session.email || "";

  setFormStatus(status, "Submitting referral...", "success");
  if(button) button.disabled = true;

  try{
    const data = await postAuthAction(payload);
    if(data.ok){
      form.reset();
      loadCountries();
      setFormStatus(status, data.message || "Referral submitted successfully.", "success");
    }else{
      setFormStatus(status, data.message || "Referral submission failed.", "error");
    }
  }catch(err){
    setFormStatus(status, "Referral submission failed. Check backend deployment.", "error");
  }finally{
    if(button) button.disabled = false;
  }
}

async function sellerLogin(event){
  event.preventDefault();
  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "sellerLogin";

  setFormStatus(status, "Logging in...", "success");
  if(button) button.disabled = true;

  try{
    const data = await postAuthAction(payload);
    if(data.ok){
      localStorage.setItem("bgpSellerSession", JSON.stringify(data.seller));
      window.location.href = "seller-dashboard.html";
    }else{
      setFormStatus(status, data.message || "Invalid seller login.", "error");
    }
  }catch(err){
    setFormStatus(status, "Seller login failed. Check backend deployment.", "error");
  }finally{
    if(button) button.disabled = false;
  }
}

function getSellerSession(){
  try{
    return JSON.parse(localStorage.getItem("bgpSellerSession") || "null");
  }catch(err){
    return null;
  }
}

async function initSellerDashboard(){
  const profileBox = document.getElementById("sellerProfileBox");
  if(!profileBox) return;

  const session = getSellerSession();
  if(!session){
    profileBox.innerHTML = `<p>Please login to access seller dashboard.</p><a class="btn primary" href="seller-login.html">Seller Login</a>`;
    const propBox = document.getElementById("sellerPropertiesBox");
    if(propBox) propBox.innerHTML = "";
    return;
  }

  const welcome = document.getElementById("sellerWelcome");
  if(welcome) welcome.textContent = `Welcome, ${safe(session.name || "Seller")}`;

  profileBox.innerHTML = `
    <div class="profile-line"><strong>Seller ID</strong><span>${safe(session.sellerId || "")}</span></div>
    <div class="profile-line"><strong>Name</strong><span>${safe(session.name || "")}</span></div>
    <div class="profile-line"><strong>Phone</strong><span>${safe(session.phone || "")}</span></div>
    <div class="profile-line"><strong>Email</strong><span>${safe(session.email || "")}</span></div>
  `;

  await loadSellerProperties(session);
}

async function loadSellerProperties(session){
  const propBox = document.getElementById("sellerPropertiesBox");
  if(!propBox) return;

  if (!(typeof APPS_SCRIPT_URL !== "undefined" && APPS_SCRIPT_URL)) {
    propBox.innerHTML = "Backend is not connected yet.";
    return;
  }

  try{
    const url = `${APPS_SCRIPT_URL}?action=sellerProperties&sellerId=${encodeURIComponent(session.sellerId || "")}&token=${encodeURIComponent(session.token || "")}&ts=${Date.now()}`;
    const res = await fetch(url);
    const data = await res.json();

    if(!data.ok){
      propBox.innerHTML = safe(data.message || "Unable to load seller properties.");
      return;
    }

    const properties = data.properties || [];
    if(!properties.length){
      propBox.innerHTML = "<p>No properties found for this seller.</p>";
      return;
    }

    propBox.innerHTML = properties.map(p => `
      <div class="seller-property-row">
        <h3>${safe(p.propertyCode)} - ${safe(p.propertyType)}</h3>
        <p>${safe(p.locality || p.area || "")} | ${safe(p.sizeText || "")} | ${safe(p.publicPriceRange || "")}</p>
        <span class="status-pill">${safe(p.verificationStatus || "")}</span>
        <span class="status-pill">${safe(p.publicStatus || "")}</span>
        <span class="status-pill">${safe(p.status || "")}</span>
      </div>
    `).join("");
  }catch(err){
    propBox.innerHTML = "Unable to load seller properties. Check backend deployment.";
  }
}

function sellerLogout(){
  localStorage.removeItem("bgpSellerSession");
  window.location.href = "seller-login.html";
}

async function loadHomeBanners(){
  bannerSlides = SAMPLE_BANNERS;

  if (typeof APPS_SCRIPT_URL !== "undefined" && APPS_SCRIPT_URL) {
    try {
      const url = `${APPS_SCRIPT_URL}?action=publicBanners&ts=${Date.now()}`;
      const res = await fetch(url, { method:"GET" });
      const data = await res.json();
      if (data.ok && Array.isArray(data.banners) && data.banners.length) {
        bannerSlides = data.banners;
      }
    } catch (err) {
      console.warn("Using sample banners because backend banner API is not connected yet.", err);
    }
  }

  renderHomeBanners();
  startBannerAutoSlide();
}

function renderHomeBanners(){
  const slider = document.getElementById("homeBannerSlider");
  const dots = document.getElementById("bannerDots");
  if(!slider) return;

  const existingSlides = slider.querySelectorAll(".banner-slide");
  existingSlides.forEach(slide => slide.remove());

  bannerSlides
    .sort((a,b) => Number(a.sortOrder || a.SortOrder || 0) - Number(b.sortOrder || b.SortOrder || 0))
    .forEach((banner, index) => {
      const b = normalizeBanner(banner);
      const slide = document.createElement("div");
      slide.className = `banner-slide ${index === 0 ? "active" : ""}`;
      if (b.imageURL) slide.setAttribute("style", `--banner-image:url('${b.imageURL}')`);
      slide.innerHTML = `
        <div class="banner-content">
          ${b.badge ? `<span class="eyebrow">${safe(b.badge)}</span>` : `<span class="eyebrow">Bdeals Global Properties</span>`}
          <h2>${safe(b.title)}</h2>
          <p>${safe(b.subtitle)}</p>
          ${b.buttonText ? `<a class="btn primary" href="${safe(b.buttonLink || '#')}">${safe(b.buttonText)}</a>` : ""}
        </div>
      `;
      const prevBtn = slider.querySelector(".banner-arrow.prev");
      slider.insertBefore(slide, prevBtn);
    });

  if(dots){
    dots.innerHTML = bannerSlides.map((_, index) => `<button class="banner-dot ${index === 0 ? "active" : ""}" type="button" onclick="goToBanner(${index})" aria-label="Go to banner ${index + 1}"></button>`).join("");
  }

  currentBannerIndex = 0;
}

function normalizeBanner(banner){
  return {
    bannerId: banner.bannerId || banner.BannerID || "",
    badge: banner.badge || banner.Badge || "",
    title: banner.title || banner.Title || "Bdeals Global Properties",
    subtitle: banner.subtitle || banner.Subtitle || "",
    buttonText: banner.buttonText || banner.ButtonText || "",
    buttonLink: banner.buttonLink || banner.ButtonLink || "#",
    imageURL: banner.imageURL || banner.ImageURL || "",
    sortOrder: banner.sortOrder || banner.SortOrder || "0"
  };
}

function moveBanner(direction){
  if(!bannerSlides.length) return;
  const nextIndex = (currentBannerIndex + direction + bannerSlides.length) % bannerSlides.length;
  goToBanner(nextIndex);
  startBannerAutoSlide();
}

function goToBanner(index){
  const slider = document.getElementById("homeBannerSlider");
  if(!slider) return;

  const slides = slider.querySelectorAll(".banner-slide");
  const dots = document.querySelectorAll(".banner-dot");
  if(!slides.length) return;

  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  currentBannerIndex = index;
}

function startBannerAutoSlide(){
  if(bannerTimer) clearInterval(bannerTimer);
  if(!bannerSlides || bannerSlides.length <= 1) return;
  bannerTimer = setInterval(() => {
    moveBanner(1);
  }, 5000);
}

async function loadPublicProperties(){allProperties=SAMPLE_PROPERTIES;if(typeof APPS_SCRIPT_URL!=='undefined'&&APPS_SCRIPT_URL){try{const r=await fetch(`${APPS_SCRIPT_URL}?action=publicProperties&ts=${Date.now()}`);const d=await r.json();if(d.ok&&Array.isArray(d.properties)&&d.properties.length)allProperties=d.properties}catch(e){console.warn('Using sample properties because backend is not connected.',e)}}renderProperties('propertyList',allProperties);renderProperties('featuredProperties',allProperties.filter(p=>String(p.featured||p.Featured||'').toLowerCase()==='yes').slice(0,3))}
function renderProperties(id,list){const t=document.getElementById(id);if(!t)return;if(!list||!list.length){t.innerHTML='<div class="policy-card"><h3>No public properties found</h3><p>Please post your requirement and our team will contact you.</p></div>';return}t.innerHTML=list.map(p=>{const n=normalizeProperty(p);const img=n.imageURL?`style="--property-image:url('${n.imageURL}')"`:'';return `<article class="property-card" data-type="${n.propertyType.toLowerCase()}" data-search="${(n.propertyCode+' '+n.propertyType+' '+n.locality+' '+n.area+' '+n.sizeText+' '+n.publicPriceRange+' '+n.highlights).toLowerCase()}"><div class="property-img" ${img}></div><div class="property-body"><span class="property-code">${n.propertyCode}</span><h3>${n.propertyType} in ${n.locality||n.area||'Selected Area'}</h3><p>${n.description||'Controlled listing. Full details are shared only through the platform after verification.'}</p><div class="property-meta">${n.area?`<span>${n.area}</span>`:''}${n.sizeText?`<span>${n.sizeText}</span>`:''}${n.highlights?`<span>${n.highlights.split(',')[0]}</span>`:''}</div><div class="price">${n.publicPriceRange}</div><div class="hero-actions"><a class="btn primary" href="property-details.html?code=${encodeURIComponent(n.propertyCode)}">View Details</a><button class="btn secondary" onclick="quickPropertyEnquiry('${n.propertyCode}')">Enquire</button></div></div></article>`}).join('')}
function applyPropertyFilters(){const s=(document.getElementById('searchInput')?.value||'').toLowerCase().trim();const ty=(document.getElementById('typeFilter')?.value||'').toLowerCase();const f=allProperties.filter(p=>{const n=normalizeProperty(p);const txt=`${n.propertyCode} ${n.propertyType} ${n.locality} ${n.area} ${n.sizeText} ${n.publicPriceRange} ${n.highlights}`.toLowerCase();return(!s||txt.includes(s))&&(!ty||n.propertyType.toLowerCase()===ty)});renderProperties('propertyList',f)}
function quickPropertyEnquiry(code){const msg=`I am interested in property code ${code}. Please contact me with verified details.`;if(typeof WHATSAPP_NUMBER!=='undefined'&&WHATSAPP_NUMBER&&WHATSAPP_NUMBER!=='910000000000')window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank');else location.href=`property-details.html?code=${encodeURIComponent(code)}#enquiry`}
async function loadPropertyDetailsPage(){const code=new URLSearchParams(location.search).get('code')||'';const inp=document.getElementById('enquiryPropertyCode');if(inp)inp.value=code;let p=SAMPLE_PROPERTIES.find(x=>x.propertyCode===code);if(typeof APPS_SCRIPT_URL!=='undefined'&&APPS_SCRIPT_URL&&code){try{const r=await fetch(`${APPS_SCRIPT_URL}?action=property&code=${encodeURIComponent(code)}&ts=${Date.now()}`);const d=await r.json();if(d.ok&&d.property)p=d.property}catch(e){console.warn('Property details backend not connected.',e)}}const title=document.getElementById('propertyTitle'),box=document.getElementById('propertyDetails');if(!p){if(title)title.textContent='Property Not Found';if(box)box.innerHTML='<div><h2>Property not found</h2><p>Please go back to the property listing page or post your requirement.</p><a class="btn primary" href="buy-property.html">Back to Listings</a></div>';return}const n=normalizeProperty(p);if(title)title.textContent=`${n.propertyType} in ${n.locality||n.area}`;const img=n.imageURL?`style="--property-image:url('${n.imageURL}')"`:'';if(box)box.innerHTML=`<div class="details-image" ${img}></div><div><span class="property-code">${n.propertyCode}</span><h2>${n.propertyType} in ${n.locality||n.area}</h2><div class="price">${n.publicPriceRange}</div><div class="property-meta">${n.area?`<span>${n.area}</span>`:''}${n.sizeText?`<span>${n.sizeText}</span>`:''}${n.highlights?n.highlights.split(',').slice(0,4).map(h=>`<span>${safe(h.trim())}</span>`).join(''):''}</div><p>${n.description}</p><div class="notice">Seller contact, exact address, documents, and negotiation information are protected. Submit interest to proceed through verification.</div></div>`}
function normalizeProperty(p){return{propertyCode:safe(p.propertyCode||p.PropertyCode||''),propertyType:safe(p.propertyType||p.PropertyType||'Property'),locality:safe(p.locality||p.Locality||''),area:safe(p.area||p.Area||''),sizeText:safe(p.sizeText||p.SizeText||''),publicPriceRange:safe(p.publicPriceRange||p.PublicPriceRange||'Price on request'),description:safe(p.description||p.Description||'Controlled public listing. Details are shared only after verification.'),highlights:safe(p.highlights||p.Highlights||''),imageURL:safe(p.imageURL||p.ImageURL||'')}}
async function submitMediatorForm(event){event.preventDefault();const form=event.target,status=form.querySelector('.form-status'),button=form.querySelector('button[type="submit"]'),formType=form.dataset.formType||'contact';setFormStatus(status,'Sending details...','success');if(button)button.disabled=true;const payload=Object.fromEntries(new FormData(form).entries());payload.formType=formType;payload.pageURL=location.href;payload.submittedAt=new Date().toISOString();if(!(typeof APPS_SCRIPT_URL!=='undefined'&&APPS_SCRIPT_URL)){setFormStatus(status,'Backend is not connected yet. Paste your Apps Script Web App URL in js/config.js.','error');if(button)button.disabled=false;return}try{const res=await fetch(APPS_SCRIPT_URL,{method:'POST',body:new URLSearchParams(payload)});const data=await res.json();if(data.ok){form.reset();setFormStatus(status,data.message||'Submitted successfully. Our team will contact you shortly.','success')}else setFormStatus(status,data.message||'Submission failed. Please try again.','error')}catch(e){console.error(e);setFormStatus(status,'Submission could not be completed. Check Apps Script deployment access and Web App URL.','error')}finally{if(button)button.disabled=false}}
function setFormStatus(el,msg,type){if(!el)return;el.textContent=msg;el.className=`form-status ${type}`}
function safe(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}


async function submitSellerDashboardProperty(event){
  event.preventDefault();
  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const session = getSellerSession();

  if(!session){
    setFormStatus(status, "Please login as seller before submitting a property.", "error");
    return;
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "sellerDashboardProperty";
  payload.sellerId = session.sellerId || "";
  payload.token = session.token || "";

  setFormStatus(status, "Submitting property for admin approval...", "success");
  if(button) button.disabled = true;

  try{
    const data = await postAuthAction(payload);
    if(data.ok){
      form.reset();
      loadCountries();
      setFormStatus(status, data.message || "Property submitted to admin for approval.", "success");
      await loadSellerProperties(session);
    }else{
      setFormStatus(status, data.message || "Submission failed.", "error");
    }
  }catch(err){
    setFormStatus(status, "Property submission failed. Check backend deployment.", "error");
  }finally{
    if(button) button.disabled = false;
  }
}
