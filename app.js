import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ========= 1) ВСТАВЬ СВОИ ДАННЫЕ SUPABASE =========
const SUPABASE_URL = "https://iutufwipjencpczsafgj.supabase.co";
const SUPABASE_KEY = "sb_publishable_eNW1R6wOU9L7GcmHpYmxjQ_oKmDfcS8";
// ================================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Куда возвращать после OAuth / magic link:
const REDIRECT_TO = new URL("panel.html", window.location.href).toString();

const $ = (id) => document.getElementById(id);

function setActiveNav(){
  const file = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a=>{
    if(a.getAttribute("href") === file) a.classList.add("active");
  });
}

/* ===================== THEME ===================== */
const THEMES = ["dark","light","purple","yellow","green","red","pink","blue","deepblue"];
const THEME_KEY = "labyrinth_theme";

function applyTheme(theme){
  const t = THEMES.includes(theme) ? theme : "dark";
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(THEME_KEY, t);
  const sel = $("theme-select");
  if(sel) sel.value = t;
}

function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);
  const sel = $("theme-select");
  if(sel){
    sel.addEventListener("change", ()=> applyTheme(sel.value));
  }
}
/* ================================================ */

/* ===================== AUTH UI ===================== */
async function renderAuthUI(){
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  const status = $("auth-status");
  const loginBtn = $("btn-login");
  const googleBtn = $("btn-google");
  const logoutBtn = $("btn-logout");

  if(!status && !loginBtn && !googleBtn && !logoutBtn) return;

  if(user){
    status && (status.textContent = `Вы вошли: ${user.email ?? user.user_metadata?.name ?? user.id}`);
    loginBtn && (loginBtn.style.display = "none");
    googleBtn && (googleBtn.style.display = "none");
    logoutBtn && (logoutBtn.style.display = "inline-flex");
  } else {
    status && (status.textContent = "Вы не авторизованы.");
    loginBtn && (loginBtn.style.display = "inline-flex");
    googleBtn && (googleBtn.style.display = "inline-flex");
    logoutBtn && (logoutBtn.style.display = "none");
  }
}

async function signInWithGoogle(){
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: REDIRECT_TO }
  });
  if(error) alert("Google вход: " + error.message);
}

async function signInWithEmail(email){
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: REDIRECT_TO }
  });
  if(error) alert("Email вход: " + error.message);
  else alert("Ссылка отправлена на email (проверь Inbox/Spam).");
}

async function signOut(){
  const { error } = await supabase.auth.signOut();
  if(error) alert("Выход: " + error.message);
  else location.href = "index.html";
}

function bindAuthButtons(){
  const loginBtn = $("btn-login");
  const googleBtn = $("btn-google");
  const emailBtn = $("btn-email");
  const logoutBtn = $("btn-logout");

  googleBtn && googleBtn.addEventListener("click", signInWithGoogle);

  loginBtn && loginBtn.addEventListener("click", ()=>{
    const emailInput = $("email");
    if(emailInput && emailInput.value.trim()){
      signInWithEmail(emailInput.value.trim());
    } else {
      signInWithGoogle();
    }
  });

  emailBtn && emailBtn.addEventListener("click", ()=>{
    const emailInput = $("email");
    if(!emailInput || !emailInput.value.trim()) return alert("Введите email.");
    signInWithEmail(emailInput.value.trim());
  });

  logoutBtn && logoutBtn.addEventListener("click", signOut);
}
/* ================================================ */

function init(){
  setActiveNav();
  initTheme();
  bindAuthButtons();
  renderAuthUI();
  supabase.auth.onAuthStateChange(()=> renderAuthUI());
}
init();
