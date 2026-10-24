// ══════════════════════════════════════════
// SUPABASE CONFIG
// ══════════════════════════════════════════
const SB_URL = 'https://lrronntdfuyrzmkdeusa.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycm9ubnRkZnV5cnpta2RldXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzUwOTYsImV4cCI6MjA5NDc1MTA5Nn0.XVZJ3L7MvIzkdYCTfqx9SZxDDtk0Ym37jg0y_HxS7FE';
const sb = supabase.createClient(SB_URL, SB_KEY);

// ══════════════════════════════════════════
// HTML ESCAPING
// ══════════════════════════════════════════
// Everything that comes from the user, the database or the AI goes through esc() before it reaches innerHTML.
const ESC_MAP = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
function esc(v) {
  return v == null ? '' : String(v).replace(/[&<>"']/g, c => ESC_MAP[c]);
}
// Colours from the profile end up in style attributes and CSS variables: accept only #rgb / #rrggbb
function isHexColor(v) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v || ''));
}
// A value passed as an argument inside an inline handler: onclick="fn(${jsArg(id)})"
function jsArg(v) {
  return esc(JSON.stringify(v == null ? '' : String(v)));
}

// All Claude calls go through here so the server can check the Supabase session.
async function chatFetch(url, opts = {}) {
  const { data: { session } } = await sb.auth.getSession();
  const headers = { ...(opts.headers || {}) };
  if (session?.access_token) headers['Authorization'] = 'Bearer ' + session.access_token;
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 429 || res.status === 503) {
    const body = await res.clone().json().catch(() => ({}));
    if (body.error === 'rate_limited') {
      const min = Math.max(1, Math.ceil((Number(body.retry_after) || 3600) / 60));
      throw new ChatError(`Ліміт ШІ-запитів вичерпано (${body.limit || 30} на годину). Спробуй знову через ${min} хв.`);
    }
    if (body.error === 'rate_limit_unavailable') throw new ChatError('ШІ тимчасово недоступний. Спробуй трохи пізніше.');
  }
  return res;
}

// An error whose message is ready to show to the user
class ChatError extends Error {}
const chatErrorText = (e, fallback) => (e instanceof ChatError ? e.message : fallback);

// ══════════════════════════════════════════
// USER PROFILES
// ══════════════════════════════════════════
const USERS = {
  demo:{
    name:'Демо',brand:'Sprout · демо',design:'modern',reflectRotate:true,emoji:'🌱',color:'#22C55E',role:'демо-перегляд',
    heroTag:'✨ демо-сторінка',
    heroTitle:'Подивись як це <span style="color:var(--ac)">працює</span>',
    heroDesc:'Це приклад заповненої сторінки — з прикладами нотаток, статистики, рефлексії. Зареєструйся щоб мати свою.',
    pills:['нотатки','статистика','ШІ-чат','рефлексія','прогрес'],
    chips:['📊 Аналіз статистики','💡 Ідеї контенту','📝 Написати пост','🎬 Сценарій для Reels','📈 Як рости','😶 Застрягла — що робити'],
    chipTexts:[
      'Проаналізуй мою статистику. Що йде добре, що погано, що треба покращити?',
      'Запропонуй 10 конкретних ідей контенту для лайфстайл-блогера.',
      'Допоможи написати текст підпису для поста.',
      'Напиши сценарій для 30-секундного Reels.',
      'Як органічно рости в Instagram?',
      'Я застрягла — допоможи розібратись чому і що з цим робити.'
    ],
    aiCtx:'Ти консультуєш гостя у демо-режимі платформи. Показуй приклади відповідей, які підійшли б типовому контент-творцю — конкретно, практично, дружньо.'
  },
  default:{
    name:'Користувачка',brand:'Sprout',design:'modern',reflectRotate:true,emoji:'🌱',color:'#22C55E',role:'нова користувачка',
    heroTag:'✨ ласкаво просимо',
    heroTitle:'Твоя платформа<br>для <span style="color:var(--ac)">росту</span>',
    heroDesc:'Веди статистику, плануй контент, аналізуй з ШІ. Все що треба контент-творцеві в одному місці.',
    pills:['нотатки','стат','ШІ-чат','рефлексія','прогрес'],
    chips:['📊 Аналіз статистики','💡 Ідеї контенту','📝 Написати пост','🎬 Сценарій для Reels','📈 Як рости','😶 Застрягла — що робити'],
    chipTexts:[
      'Проаналізуй мою статистику. Що йде добре, що погано, що треба покращити?',
      'Запропонуй 10 конкретних ідей контенту.',
      'Допоможи написати текст підпису для поста.',
      'Напиши сценарій для 30-секундного Reels.',
      'Як органічно рости в Instagram?',
      'Я застрягла — допоможи розібратись чому.'
    ],
    aiCtx:'Ти консультуєш контент-творця українською. Профіль ще не описано детально — питай уточнюючі питання коли потрібно, щоб давати релевантні відповіді.'
  },
};

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
let CU = null; // current user key
let sbUser = null; // supabase user
let curNoteId = null;
let charts = {};
let chatHistory = [];
let authMode = 'login';

// ══════════════════════════════════════════
// AUTH HELPERS
// ══════════════════════════════════════════
// Google provider is configured in Supabase (Authentication -> Sign In / Providers -> Google)
const ENABLE_GOOGLE_LOGIN = true;
const CAME_FROM_RECOVERY = /type=recovery/.test(location.hash);
// What the OAuth redirect left in the URL: tokens (implicit), a code (PKCE) or an error (e.g. access_denied).
// Read once at load, before init() cleans the address bar.
const OAUTH_RETURN = (() => {
  const q = new URLSearchParams(location.search);
  const h = new URLSearchParams(location.hash.replace(/^#/, ''));
  const get = k => q.get(k) || h.get(k) || '';
  return {
    isCallback: !!(get('access_token') || get('code') || get('error') || get('error_code')),
    error: get('error'), errorCode: get('error_code'), errorDescription: get('error_description'),
  };
})();
const OAUTH_PARAMS = ['access_token','refresh_token','expires_in','expires_at','token_type','provider_token','provider_refresh_token','type','code','state','error','error_code','error_description'];
const MIN_PASSWORD = 8;

// Length matters more than special characters: at least 8 characters, with a letter and a digit.
function validatePassword(p) {
  if (!p || p.length < MIN_PASSWORD) return `Пароль має бути мінімум ${MIN_PASSWORD} символів`;
  if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(p) || !/\d/.test(p)) return 'Додай у пароль хоча б одну літеру і одну цифру';
  return '';
}

// Supabase returns English messages: show everything in Ukrainian.
function authError(e) {
  const code = e?.code || '';
  const msg = String(e?.message || '');
  if (code === 'invalid_credentials' || /Invalid login credentials/i.test(msg)) return 'Невірний email або пароль';
  if (code === 'email_not_confirmed' || /Email not confirmed/i.test(msg)) return 'Спочатку підтверди email — ми надіслали лист із кнопкою підтвердження';
  if (code === 'user_already_exists' || /already registered/i.test(msg)) return 'Акаунт з цією поштою вже існує — спробуй увійти';
  if (code === 'weak_password' || /Password should|least \d+ characters|weak/i.test(msg)) return `Пароль замалий або занадто простий: мінімум ${MIN_PASSWORD} символів, літери й цифри`;
  if (code === 'same_password' || /different from the old/i.test(msg)) return 'Новий пароль має відрізнятись від старого';
  if (code === 'email_address_invalid' || /invalid format|Unable to validate email|valid email/i.test(msg)) return 'Перевір email — схоже, він введений неправильно';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || /rate limit|too many/i.test(msg)) return 'Забагато спроб. Зачекай хвилину і спробуй ще раз';
  if (code === 'signup_disabled') return 'Реєстрація тимчасово вимкнена';
  if (code === 'access_denied' || /access_denied|denied/i.test(msg)) return 'Вхід через Google скасовано';
  if (code === 'provider_disabled' || /provider is not enabled/i.test(msg)) return 'Вхід через Google зараз недоступний. Увійди через email';
  if (code === 'bad_oauth_callback' || code === 'bad_oauth_state' || /oauth|external code|provider/i.test(msg)) return 'Не вдалося увійти через Google. Спробуй ще раз';
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'Немає зв\'язку з сервером. Перевір інтернет і спробуй ще раз';
  return 'Щось пішло не так. Спробуй ще раз';
}

function refreshGoogleBtn() {
  const w = document.getElementById('agoogle-wrap');
  if (!w) return;
  w.style.display = (ENABLE_GOOGLE_LOGIN && (authMode === 'login' || authMode === 'reg')) ? 'block' : 'none';
}

// Name / emoji / accent colour chosen in the demo, carried over to a new account.
// Google sign-in leaves the page (DEMO_MEM is lost on the redirect), so it also goes to sessionStorage.
const PENDING_PROFILE_KEY = 'ksk_pending_profile';
function demoPendingProfile() {
  const dp = DEMO_MEM.profile || {};
  const pending = {};
  if (dp.display_name) pending.display_name = dp.display_name;
  if (dp.display_emoji) pending.display_emoji = dp.display_emoji;
  if (dp.accent_color) pending.accent_color = dp.accent_color;
  return pending;
}

async function signInWithGoogle() {
  const btn = document.getElementById('agoogle');
  if (btn) btn.disabled = true;
  try {
    const pending = demoPendingProfile();
    if (Object.keys(pending).length) sessionStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(pending));
    else sessionStorage.removeItem(PENDING_PROFILE_KEY);
  } catch(e) {}
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' }
    });
    if (error) throw error;
  } catch(e) {
    showErr(authError(e));
    if (btn) btn.disabled = false;
  }
}

// Remove OAuth tokens / code / error from the address bar (supabase-js leaves a bare '#' and never clears errors)
function cleanAuthUrl() {
  // location.hash is '' for a bare trailing '#', so look at the full URL
  if (!OAUTH_RETURN.isCallback && !location.href.endsWith('#')) return;
  const url = new URL(location.href);
  OAUTH_PARAMS.forEach(k => url.searchParams.delete(k));
  const h = new URLSearchParams(url.hash.replace(/^#/, ''));
  if (!url.hash || url.hash === '#' || OAUTH_PARAMS.some(k => h.has(k))) url.hash = '';
  history.replaceState(history.state, '', url.pathname + url.search + url.hash);
}

// Log the user in from a session (used by the email-confirmation link, also in another tab)
function adoptSession(session) {
  if (!session || sbUser || authMode === 'reset' || CAME_FROM_RECOVERY) return;
  sbUser = session.user;
  const meta = session.user.user_metadata;
  CU = (meta?.profile && USERS[meta.profile]) ? meta.profile : 'default';
  const chk = document.getElementById('acheck');
  if (chk) chk.style.display = 'none';
  loginSuccess();
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
async function init() {
  refreshGoogleBtn();
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') { enterResetMode(); return; }
    if (event === 'SIGNED_IN') setTimeout(() => adoptSession(session), 0);
  });
  const { data: { session } } = await sb.auth.getSession();
  // adoptSession() may already have logged in from the SIGNED_IN event: log in only once
  if (session && !sbUser) {
    sbUser = session.user;
    const meta = session.user.user_metadata;
    const profileKey = meta?.profile;
    CU = (profileKey && USERS[profileKey]) ? profileKey : 'default';
    loginSuccess();
  }
  if (!session && OAUTH_RETURN.error) {
    const { error, errorCode, errorDescription } = OAUTH_RETURN;
    showErr(authError({ code: error === 'access_denied' ? error : (errorCode || error), message: errorDescription }));
  }
  if (!CAME_FROM_RECOVERY) cleanAuthUrl();
  // Remove loader and mark page as ready
  document.documentElement.classList.add('ready');
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 320);
    }, 150);
  }
}

function enterResetMode() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  authMode = 'reset';
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('on'));
  document.getElementById('areset-banner').style.display = 'block';
  document.getElementById('aemail-wrap').style.display = 'none';
  document.getElementById('apass-wrap').style.display = 'block';

  document.getElementById('aforgot-link').style.display = 'none';
  document.getElementById('aforgot-ok').style.display = 'none';
  document.getElementById('aerr').style.display = 'none';
  document.querySelector('#apass-wrap .albl').textContent = 'Новий пароль';
  document.getElementById('apass').placeholder = `Мінімум ${MIN_PASSWORD} символів, літери й цифри`;
  document.getElementById('apass').value = '';
  const btn = document.getElementById('abtn');
  btn.style.display = '';
  btn.textContent = 'Зберегти пароль →';
  btn.onclick = doResetPassword;
  refreshGoogleBtn();
}

async function doResetPassword() {
  const newPass = document.getElementById('apass').value;
  const errEl = document.getElementById('aerr');
  errEl.style.display = 'none';
  const passErr = validatePassword(newPass);
  if (passErr) {
    errEl.textContent = passErr;
    errEl.style.display = 'block';
    return;
  }
  const btn = document.getElementById('abtn');
  btn.textContent = '...'; btn.disabled = true;
  try {
    const { error } = await sb.auth.updateUser({ password: newPass });
    if (error) throw error;
    showToast('Пароль оновлено!', 'success');
    // Restore auth UI and sign in
    restoreAuthUI();
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      sbUser = session.user;
      CU = (session.user.user_metadata?.profile && USERS[session.user.user_metadata.profile])
        ? session.user.user_metadata.profile : 'default';
      loginSuccess();
    }
  } catch(e) {
    errEl.textContent = authError(e);
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Зберегти пароль →';
  }
}

function restoreAuthUI() {
  authMode = 'login';
  document.getElementById('areset-banner').style.display = 'none';
  document.getElementById('aemail-wrap').style.display = 'block';
  document.getElementById('apass-wrap').style.display = 'block';

  document.getElementById('aforgot-link').style.display = 'block';
  document.getElementById('aforgot-ok').style.display = 'none';
  document.getElementById('aerr').style.display = 'none';
  document.querySelector('#apass-wrap .albl').textContent = 'Пароль';
  document.getElementById('apass').placeholder = '••••••';
  const loginTab = document.querySelector('.mtab');
  if (loginTab) loginTab.classList.add('on');
  const btn = document.getElementById('abtn');
  btn.style.display = '';
  btn.textContent = 'Увійти →';
  btn.onclick = doAuth;
  refreshGoogleBtn();
}

function setMode(mode, el) {
  authMode = mode;
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('on'));
  if (el) el.classList.add('on');
  const isForgot = mode === 'forgot';
  document.getElementById('areset-banner').style.display = 'none';
  document.getElementById('aemail-wrap').style.display = 'block';
  document.getElementById('apass-wrap').style.display = isForgot ? 'none' : 'block';
  document.getElementById('aforgot-link').style.display = (mode === 'login') ? 'block' : 'none';
  document.getElementById('aforgot-ok').style.display = 'none';
  document.getElementById('aerr').style.display = 'none';
  document.querySelector('#apass-wrap .albl').textContent = 'Пароль';
  document.getElementById('apass').placeholder = mode === 'reg' ? `Мінімум ${MIN_PASSWORD} символів, літери й цифри` : '••••••';
  const chk = document.getElementById('acheck');
  if (chk) chk.style.display = 'none';
  document.querySelector('.mtabs').style.display = '';
  const btn = document.getElementById('abtn');
  btn.style.display = '';
  if (isForgot) {
    btn.textContent = 'Надіслати посилання →';
    btn.onclick = doForgot;
  } else {
    btn.textContent = mode === 'reg' ? 'Зареєструватись →' : 'Увійти →';
    btn.onclick = doAuth;
  }
  refreshGoogleBtn();
}

async function doForgot() {
  const email = document.getElementById('aemail').value.trim();
  const errEl = document.getElementById('aerr');
  errEl.style.display = 'none';
  if (!email) { errEl.textContent = 'Введи свій email'; errEl.style.display = 'block'; return; }
  const btn = document.getElementById('abtn');
  btn.textContent = '...'; btn.disabled = true;
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.href
    });
    if (error) throw error;
    document.getElementById('aforgot-ok').textContent = `Посилання для скидання надіслано на ${email}. Перевір пошту — якщо не бачиш, дивись у спам.`;
    document.getElementById('aforgot-ok').style.display = 'block';
    btn.style.display = 'none';
  } catch(e) {
    errEl.textContent = authError(e);
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    if (btn.style.display !== 'none') btn.textContent = 'Надіслати посилання →';
  }
}

async function doAuth() {
  const email = document.getElementById('aemail').value.trim();
  const pass = document.getElementById('apass').value;
  const errEl = document.getElementById('aerr');
  errEl.style.display = 'none';
  if (!email || !pass) { showErr('Введи email і пароль'); return; }
  if (authMode === 'reg') {
    const passErr = validatePassword(pass);
    if (passErr) { showErr(passErr); return; }
  }
  const btn = document.getElementById('abtn');
  btn.textContent = '...'; btn.disabled = true;
  try {
    if (authMode === 'reg') {
      const pending = demoPendingProfile();
      const { data, error } = await sb.auth.signUp({
        email, password: pass,
        options: {
          emailRedirectTo: window.location.origin + '/',
          data: { profile: 'default', ...(Object.keys(pending).length ? { pending_profile: pending } : {}) }
        }
      });
      if (error) throw error;
      if (data.session) {
        sbUser = data.user; CU = 'default'; loginSuccess();
      } else {
        showCheckEmail(email);
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      sbUser = data.user;
      const meta = data.user.user_metadata;
      CU = (meta?.profile && USERS[meta.profile]) ? meta.profile : 'default';
      loginSuccess();
    }
  } catch(e) {
    showErr(authError(e));
  } finally { btn.disabled = false; btn.textContent = authMode === 'reg' ? 'Зареєструватись →' : 'Увійти →'; }
}

function showCheckEmail(email) {
  ['aemail-wrap','apass-wrap','aforgot-link','aforgot-ok','aerr'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  document.getElementById('abtn').style.display = 'none';
  document.getElementById('agoogle-wrap').style.display = 'none';
  document.querySelector('.mtabs').style.display = 'none';
  const safe = email.replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  const box = document.getElementById('acheck');
  box.innerHTML = `
    <div style="font-size:34px;margin-bottom:8px">📬</div>
    <div style="font-weight:700;font-size:16px;color:#fff;margin-bottom:6px">Перевір пошту</div>
    <div>Ми надіслали лист на <b style="color:#fff">${safe}</b>.<br>Натисни кнопку «Підтвердити» в листі — і ти одразу потрапиш у свій акаунт.</div>
    <div style="margin-top:14px;font-size:12px;color:rgba(255,255,255,.45)">Не бачиш листа? Зазирни в «Спам» або «Промоції».</div>
    <div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button type="button" class="btn btn-out btn-sm" id="aresend" onclick="resendConfirmation()">Надіслати ще раз</button>
      <button type="button" class="btn btn-out btn-sm" onclick="setMode('reg', document.querySelector('.mtab[onclick*=&quot;reg&quot;]'))">← Змінити пошту</button>
    </div>
    <div id="aresend-ok" style="display:none;margin-top:10px;font-size:12px;color:rgba(255,255,255,.55)"></div>`;
  box.dataset.email = email;
  box.style.display = 'block';
}

async function resendConfirmation() {
  const box = document.getElementById('acheck');
  const email = box?.dataset.email;
  const ok = document.getElementById('aresend-ok');
  const btn = document.getElementById('aresend');
  if (!email) return;
  btn.disabled = true;
  try {
    const { error } = await sb.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin + '/' } });
    if (error) throw error;
    ok.textContent = 'Лист надіслано ще раз.';
  } catch(e) {
    ok.textContent = authError(e);
  }
  ok.style.display = 'block';
  setTimeout(() => { btn.disabled = false; }, 30000);
}

function showErr(msg) {
  const el = document.getElementById('aerr');
  el.textContent = msg; el.style.display = 'block';
}

function enterDemo() {
  CU = 'demo'; sbUser = null;
  // Remove demo data that older versions saved in the browser
  try { Object.keys(localStorage).filter(k => k.startsWith('ksk_demo_')).forEach(k => localStorage.removeItem(k)); } catch(e) {}
  if (!('notes' in DEMO_MEM)) lsave('notes', DEMO_NOTES);
  if (!('stats' in DEMO_MEM)) lsave('stats', DEMO_STATS);
  loginSuccess();
  // Offer tour unless already seen
  if (!localStorage.getItem('ksk_tour_seen')) {
    setTimeout(showTourOffer, 800);
  }
}

function showTourOffer() {
  const el = document.getElementById('tour-offer');
  if (el) { el.style.display = 'flex'; }
}

function closeTourOffer() {
  const el = document.getElementById('tour-offer');
  if (el) el.style.display = 'none';
  localStorage.setItem('ksk_tour_seen', '1');
}

function startDemoTour() {
  closeTourOffer();
  if (!window.driver?.js?.driver) { console.warn('driver.js not loaded'); return; }
  const { driver } = window.driver.js;
  const isMobile = window.innerWidth < 900;

  // Smooth tab switch inside the tour: fade the overlay/popover out, swap the tab,
  // move to the next step while hidden, then fade back in (see body.tour-switching in CSS).
  const swap = (tab, ms, next) => {
    document.body.classList.add('tour-on', 'tour-switching');
    setTimeout(() => {
      goTab(tab);
      setTimeout(() => {
        next();
        setTimeout(() => document.body.classList.remove('tour-switching'), 80);
      }, ms);
    }, 240);
  };
  const nav = (tab, ms = 500) => () => {
    if (isMobile) closeMenu();
    swap(tab, ms, () => d.moveNext());
    return false;
  };

  // Mobile: centered popovers, navigate between tabs so user sees context
  if (isMobile) {
    const mn = (tab, ms = 450) => () => { swap(tab, ms, () => md.moveNext()); return false; };
    const md = driver({
      showProgress: true, progressText: '{{current}} / {{total}}',
      nextBtnText: 'Далі →', prevBtnText: '← Назад', doneBtnText: 'Готово 🚀',
      allowClose: true, overlayClickBehavior: () => {}, overlayOpacity: 0.35, smoothScroll: true,
      popoverClass: 'sprout-tour',
      onDestroyStarted: () => { md.destroy(); localStorage.setItem('ksk_tour_seen', '1'); },
      onDestroyed: () => document.body.classList.remove('tour-on', 'tour-switching'),
      steps: [
        { popover: { title: '👋 Ласкаво просимо!', description: 'Це Sprout — платформа для зростання в соцмережах. Покажу всі розділи на практиці.', side:'over', align:'center' } },
        { popover: { title: '📊 Головна — дашборд', description: 'Зараз ти на головній. Тут — стрік, цілі, остання статистика. Блоки можна обирати і переставляти.', side:'over', align:'center',
          onNextClick: mn('stats') } },
        { popover: { title: '📈 Прогрес', description: 'Вносиш цифри щомісяця — підписники, охоплення, пости. Будуються графіки росту по всіх платформах.', side:'over', align:'center',
          onNextClick: mn('ai') } },
        { popover: { title: '🤖 ШІ-чат', description: 'Твій наставник знає статистику і профіль — аналізує, пише тексти, генерує ідеї. Натисни чіп або пиши своє питання.', side:'over', align:'center',
          onNextClick: mn('notes') } },
        { popover: { title: '📝 Нотатки', description: 'Записуй ідеї для постів, плани, чернетки. Кнопка ＋ внизу праворуч — швидко додати нотатку.', side:'over', align:'center',
          onNextClick: mn('mentor', 550) } },
        { popover: { title: '📚 Навчання — Ментор', description: 'ШІ генерує персональний план розвитку на основі твого профілю, блокерів і цілей.', side:'over', align:'center',
          onNextClick: mn('reflect', 500) } },
        { popover: { title: '🪞 Рефлексія', description: 'Питання для глибшого розуміння себе. Відповідаєш — ШІ аналізує і дає зворотній зв\'язок.', side:'over', align:'center',
          onNextClick: mn('tools', 500) } },
        { popover: { title: '🛠 Інструменти', description: 'Перевірені застосунки для монтажу, дизайну, аналітики — з посиланнями і описами.', side:'over', align:'center',
          onNextClick: mn('home', 450) } },
        { popover: { title: '👤 Профіль', description: 'Заповни тему блогу, блокери, цілі — і ШІ стане точнішим. Налаштуй акцентний колір.', side:'over', align:'center' } },
        { popover: { title: '🚀 Готово!', description: 'Це демо — дані не зберігаються. <b>Зареєструйся</b> щоб мати власний акаунт і персонального ШІ-наставника.', side:'over', align:'center',
          onNextClick: () => { md.destroy(); document.getElementById('auth-screen').style.display='flex'; document.getElementById('app').style.display='none'; } } },
      ]
    });
    md.drive();
    return;
  }

  const d = driver({
    showProgress: true,
    progressText: '{{current}} / {{total}}',
    nextBtnText: 'Далі →',
    prevBtnText: '← Назад',
    doneBtnText: 'Готово 🚀',
    allowClose: true, overlayClickBehavior: () => {},
    overlayOpacity: 0.5,
    smoothScroll: true,
    animate: true,
    popoverClass: 'sprout-tour',
    onDestroyStarted: () => { d.destroy(); localStorage.setItem('ksk_tour_seen', '1'); },
    onDestroyed: () => document.body.classList.remove('tour-on', 'tour-switching'),
    steps: [

      // ── 1. Welcome ──────────────────────────────────────
      {
        popover: {
          title: '👋 Ласкаво просимо в Sprout!',
          description: 'Це твоя особиста платформа для зростання в соцмережах. Покажу всі ключові можливості — займе ~3 хвилини.',
          side: 'over', align: 'center',
        }
      },

      // ── 2. Nav ──────────────────────────────────────────
      {
        element: '.nlinks',
        popover: {
          title: '🗂 Навігація',
          description: '<b>Головна</b> — дашборд · <b>Прогрес</b> — статистика · <b>Навчання</b> — ментор, рефлексія, інструменти · <b>ШІ-чат</b> — наставник · <b>Нотатки</b>.',
          side: 'bottom', align: 'start',
        }
      },

      // ── 3. Dashboard ────────────────────────────────────
      {
        element: '#dashboardWidgets > :first-child',
        popover: {
          title: '📊 Дашборд',
          description: 'Твій центр управління. Тут — стрік, цілі, остання статистика, нотатки. Кожен блок ти обираєш сам_а.',
          side: 'bottom', align: 'start',
        }
      },

      // ── 4. Dashboard settings ────────────────────────────
      {
        element: '#dashSettingsBtn',
        popover: {
          title: '⚙ Кастомізація дашборду',
          description: 'Натискаєш — обираєш які віджети показувати. А самі блоки можна <b>перетягувати мишкою</b> і міняти місцями — порядок зберігається.',
          side: 'top', align: 'start',
        }
      },

      // ── 5. Drag hint ─────────────────────────────────────
      {
        element: '#dashDragHint',
        popover: {
          title: '↕ Drag & drop',
          description: 'Хапаєш будь-який блок за заголовок і перетягуєш туди де зручніше. Твій особистий порядок зберігається між сесіями.',
          side: 'top', align: 'start',
          onNextClick: nav('stats'),
        }
      },

      // ── 6. Stats form ────────────────────────────────────
      {
        element: '#tab-stats .stitle',
        popover: {
          title: '📈 Прогрес',
          description: 'Щомісяця вносиш цифри по кожній платформі — підписники, охоплення, пости, Reels. Платформа будує графіки росту.',
          side: 'bottom', align: 'start',
        }
      },

      // ── 7. Stats chart ───────────────────────────────────
      {
        popover: {
          title: '📉 Графіки росту',
          description: 'Після того як внесеш хоч два місяці — з\'являються графіки підписників, охоплення і активності. Видно тренди і де просідання.',
          side: 'over', align: 'center',
          onNextClick: nav('ai'),
        }
      },

      // ── 8. AI chips ──────────────────────────────────────
      {
        element: '#aichips',
        popover: {
          title: '🤖 ШІ-наставник',
          description: 'Швидкі запити — натискаєш чіп і ШІ одразу відповідає. Знає твою статистику, тему блогу і блокери.',
          side: 'bottom', align: 'start',
        }
      },

      // ── 9. AI input ──────────────────────────────────────
      {
        element: '#aiq',
        popover: {
          title: '💬 Свій запит',
          description: 'Або пишеш своє питання: аналіз статистики, ідеї контенту, сценарій Reels, текст підпису. ШІ відповідає з урахуванням твого профілю.',
          side: 'top', align: 'center',
          onNextClick: nav('notes'),
        }
      },

      // ── 10. Notes ────────────────────────────────────────
      {
        element: '#newnotebtn',
        popover: {
          title: '📝 Нотатки',
          description: 'Записуй ідеї для постів, плани, чернетки текстів — все синхронізується між пристроями.',
          side: 'bottom', align: 'start',
        }
      },

      // ── 11. Notes list ───────────────────────────────────
      {
        element: '#nlist',
        popover: {
          title: '🗒 Список нотаток',
          description: 'Всі нотатки тут. Клік — відкриває редактор. Видалити можна хрестиком на картці нотатки.',
          side: 'top', align: 'center',
          onNextClick: nav('mentor', 600),
        }
      },

      // ── 12. Learning subnav overview ────────────────────
      {
        element: '#snb-mentor',
        popover: {
          title: '📚 Розділ Навчання',
          description: 'П\'ять підрозділів: <b>Ментор</b> · <b>Практика</b> · <b>Теорія</b> · <b>Рефлексія</b> · <b>Інструменти</b>. Зараз покажу кожен.',
          side: 'bottom', align: 'start',
        }
      },

      // ── 13. Mentor ───────────────────────────────────────
      {
        element: '#mtitle',
        popover: {
          title: '🎯 Менторський план',
          description: 'ШІ генерує персональний план розвитку — на основі твого профілю, блокерів і цілей. Розбиває на тижні і конкретні дії.',
          side: 'bottom', align: 'start',
          onNextClick: nav('reflect', 550),
        }
      },

      // ── 14. Reflect subnav tab ───────────────────────────
      {
        element: '#snb-reflect',
        popover: {
          title: '🪞 Рефлексія',
          description: 'Питання для глибшого розуміння себе як блогера. Відповідаєш — ШІ аналізує і дає зворотній зв\'язок. Щоразу нові питання.',
          side: 'bottom', align: 'start',
          onNextClick: nav('reflect', 500),
        }
      },

      // ── 15. Reflect content ──────────────────────────────
      {
        element: '#tab-reflect .stitle',
        popover: {
          title: '💬 Питання для роздумів',
          description: 'Обираєш питання, пишеш відповідь — і отримуєш чесний, підтримуючий аналіз від ШІ. Допомагає краще зрозуміти свої блокери.',
          side: 'bottom', align: 'start',
          onNextClick: nav('tools', 550),
        }
      },

      // ── 16. Tools ────────────────────────────────────────
      {
        element: '#tab-tools .stitle',
        popover: {
          title: '🛠 Інструменти',
          description: 'Перевірена добірка застосунків для монтажу, дизайну, аналітики і планування. З посиланнями і описами.',
          side: 'bottom', align: 'start',
          onNextClick: nav('home', 500),
        }
      },

      // ── 17. Profile ──────────────────────────────────────
      {
        element: '#profileBtn',
        popover: {
          title: '👤 Твій профіль',
          description: 'Вкажи тему блогу, платформи, блокери, цілі — і ШІ стане набагато точнішим. Можна змінити колір акценту та аватар.',
          side: 'bottom', align: 'end',
        }
      },

      // ── 18. Final CTA ────────────────────────────────────
      {
        popover: {
          title: '🚀 Готово до старту!',
          description: 'Це лише демо — твої дані тут не зберігаються. <b>Зареєструйся безкоштовно</b> щоб мати власний акаунт, зберігати все і отримати персонального ШІ-наставника.',
          side: 'over', align: 'center',
          onHighlighted: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
          onNextClick: () => {
            d.destroy();
            document.getElementById('auth-screen').style.display = 'flex';
            document.getElementById('app').style.display = 'none';
          }
        }
      },

    ]
  });

  d.drive();
}

function loginSuccess() {
  const u = USERS[CU];

  // Apply cached accent color immediately to avoid flash of default green
  const cached = lload('profile', null);
  const accentColor = isHexColor(cached?.accent_color) ? cached.accent_color : u.color;
  document.documentElement.style.setProperty('--ac', accentColor);

  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  // Demo mode: back button + tour button
  const nusrBtn = document.getElementById('nusr');
  nusrBtn.textContent = 'вийти';
  nusrBtn.onclick = doLogout;
  const tourBtn = document.getElementById('tourBtn');
  if (tourBtn) tourBtn.style.display = (CU === 'demo') ? 'inline-flex' : 'none';

  document.getElementById('nbrand').style.color = accentColor;
  document.getElementById('nbemoji').textContent = cached?.display_emoji || u.emoji;
  document.getElementById('nbname').textContent = (cached?.display_name || u.brand || u.name).toLowerCase();
  document.title = `${u.brand || u.name} · платформа для росту`;
  document.body.classList.toggle('nav-classic', u.navStyle === 'classic');
  document.body.classList.toggle('theme-modern', u.design === 'modern');
  if (u.design === 'modern') {
    const savedMode = localStorage.getItem('kishkas-theme-mode') || 'light';
    document.body.classList.toggle('dark', savedMode === 'dark');
  } else {
    document.body.classList.remove('dark');
  }
  if (u.navStyle === 'classic') closeMenu();
  document.getElementById('htag').textContent = u.heroTag;
  document.getElementById('htitle').innerHTML = u.heroTitle;
  document.getElementById('hdesc').textContent = u.heroDesc;
  document.getElementById('hbg').textContent = u.name.toLowerCase();
  document.getElementById('hpills').innerHTML = u.pills.map((p,i)=>`<span class="pill${i===0?' ac':''}">${p}</span>`).join('');
  document.getElementById('aichips').innerHTML = u.chips.map((c,i)=>`<div class="chip" onclick="setChip(this,'${u.chipTexts[i].replace(/'/g,"\\'")}')">${c}</div>`).join('');
  document.getElementById('newnotebtn').style.background = accentColor;
  document.getElementById('statsavebtn').style.background = accentColor;
  document.getElementById('aisend').style.background = accentColor;
  renderMentor();
  renderTheory();
  renderTools();
  renderReflect();
  if (u.reflectRotate) syncReflectFromSupabase();
  loadNotes();
  loadStats();
  renderHome();
  applyProfileOverrides();
  const mos=['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
  document.getElementById('stmo').value = mos[new Date().getMonth()];
  document.getElementById('styr').value = new Date().getFullYear();
}

function doLogout() {
  if (CU === 'demo' || !sbUser) {
    // Demo: just return to auth, no confirmation
    performLogout();
    return;
  }
  // Real user: show custom confirmation modal
  const modal = document.getElementById('logout-modal');
  modal.style.display = 'flex';
  document.getElementById('logout-confirm-btn').onclick = () => {
    modal.style.display = 'none';
    performLogout();
  };
}

async function performLogout() {
  if (sbUser) await sb.auth.signOut();
  CU = null; sbUser = null; curNoteId = null; chatHistory = [];
  Object.values(charts).forEach(c => c && c.destroy && c.destroy());
  charts = {};
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  document.documentElement.style.setProperty('--ac', '#22C55E');
  document.body.classList.remove('theme-modern', 'dark', 'nav-classic');
  document.querySelectorAll('.pcard').forEach(c => c.classList.remove('sel'));
  // Reset title and favicon to platform defaults
  document.title = 'Sprout · платформа для росту';
  setEmojiFavicon('🌱', '#22C55E');
  goTab('home');
}

// ══════════════════════════════════════════
// TABS
// ══════════════════════════════════════════
const LEARN_TABS = ['mentor','practice','theory','reflect','tools'];

function goTab(name) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.snb').forEach(b=>b.classList.remove('on'));
  const tabEl = document.getElementById('tab-'+name);
  if (tabEl) tabEl.classList.add('on');

  const isLearn = LEARN_TABS.includes(name);
  document.getElementById('subnav').style.display = isLearn ? 'flex' : 'none';
  document.body.classList.toggle('subnav-visible', isLearn);

  if (isLearn) {
    document.querySelector('.nb[data-learn]')?.classList.add('on');
    document.querySelectorAll('.snb').forEach(b=>{
      if((b.getAttribute('onclick')||'').includes("'"+name+"'")) b.classList.add('on');
    });
    localStorage.setItem('kishkas-last-learn', name);
  } else {
    document.querySelectorAll('.nb').forEach(b=>{
      if((b.getAttribute('onclick')||'').includes("'"+name+"'")) b.classList.add('on');
    });
  }

  if(name==='stats') { renderCharts(); renderProgress(); applyPlatformVisibility(); }
  if(name==='ai') renderChatList();
  if(name==='home') renderHome();
  if(name==='practice') renderPractice();
  if(name==='mentor') renderMentor();
  closeMenu();
  window.scrollTo({top:0,behavior:'instant'});
  const fab = document.getElementById('fab-note');
  if (fab) fab.style.display = (name === 'notes') ? 'flex' : 'none';
}

function goLearn() {
  const last = localStorage.getItem('kishkas-last-learn') || 'mentor';
  goTab(LEARN_TABS.includes(last) ? last : 'mentor');
}

function toggleMenu(){
  const links=document.getElementById('nlinks');
  const isOpen=links.classList.toggle('on');
  document.getElementById('burger').classList.toggle('on',isOpen);
  document.getElementById('burger').setAttribute('aria-expanded',isOpen);
  document.getElementById('navbackdrop').classList.toggle('on',isOpen);
}

function closeMenu(){
  document.getElementById('nlinks').classList.remove('on');
  document.getElementById('burger').classList.remove('on');
  document.getElementById('burger').setAttribute('aria-expanded','false');
  document.getElementById('navbackdrop').classList.remove('on');
}

document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

function toggleTheme(){
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('kishkas-theme-mode', isDark ? 'dark' : 'light');
}

// ══════════════════════════════════════════
// STORAGE — Supabase + localStorage fallback
// ══════════════════════════════════════════
const LK = k => `ksk_${CU}_${k}`;
// Demo data lives in memory only: it is gone after a page reload (nothing is written to localStorage).
const DEMO_MEM = {};
const lsave = (k,v) => {
  if (CU === 'demo') { DEMO_MEM[k] = JSON.parse(JSON.stringify(v)); return; }
  localStorage.setItem(LK(k), JSON.stringify(v));
};
const lload = (k,d) => {
  if (CU === 'demo') return (k in DEMO_MEM) ? JSON.parse(JSON.stringify(DEMO_MEM[k])) : d;
  try { const v=localStorage.getItem(LK(k)); return v?JSON.parse(v):d; } catch{return d;}
};

async function dbNotes() {
  if (!sbUser) return lload('notes',[]);
  const { data } = await sb.from('notes').select('*').eq('user_id',sbUser.id).order('created_at',{ascending:false});
  return data || [];
}

async function dbSaveNote(note) {
  if (!sbUser) { const ns=lload('notes',[]); const i=ns.findIndex(n=>n.id===note.id); if(i>=0)ns[i]=note; else ns.unshift(note); lsave('notes',ns); return; }
  if (note._new) {
    delete note._new;
    await sb.from('notes').insert({user_id:sbUser.id,title:note.title,content:note.content});
  } else {
    await sb.from('notes').update({title:note.title,content:note.content}).eq('id',note.id);
  }
}

async function dbDelNote(id) {
  if (!sbUser) { lsave('notes',lload('notes',[]).filter(n=>n.id!==id)); return; }
  await sb.from('notes').delete().eq('id',id);
}

async function dbStats() {
  if (!sbUser) return lload('stats',[]);
  const { data } = await sb.from('stats').select('*').eq('user_id',sbUser.id).order('year').order('month');
  return data || [];
}

async function dbSaveStat(entry) {
  if (!sbUser) {
    const ss=lload('stats',[]);
    const i=ss.findIndex(s=>s.month===entry.month&&s.year===entry.year);
    if(i>=0)ss[i]=entry; else ss.push(entry);
    ss.sort((a,b)=>a.year!==b.year?a.year-b.year:MONTHS.indexOf(a.month)-MONTHS.indexOf(b.month));
    lsave('stats',ss); return;
  }
  const { data } = await sb.from('stats').select('id').eq('user_id',sbUser.id).eq('month',entry.month).eq('year',entry.year);
  const fields = {
    ig:entry.ig, tt:entry.tt, tg:entry.tg, yt:entry.yt,
    posts:entry.posts, stories:entry.stories, reels:entry.reels, reach:entry.reach,
    tt_videos:entry.tt_videos, tt_views:entry.tt_views,
    tg_posts:entry.tg_posts, tg_views:entry.tg_views,
    yt_videos:entry.yt_videos, yt_shorts:entry.yt_shorts, yt_views:entry.yt_views,
    note:entry.note,
  };
  if (data && data.length) {
    await sb.from('stats').update(fields).eq('id',data[0].id);
  } else {
    await sb.from('stats').insert({user_id:sbUser.id, month:entry.month, year:entry.year, ...fields});
  }
}

async function dbDelStat(id) {
  if (!sbUser) { lsave('stats',lload('stats',[]).filter(s=>s.id!==id)); return; }
  await sb.from('stats').delete().eq('id',id);
}

const MONTHS=['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];

const DEMO_NOTES = [
  {id:'d1', title:'Ідея: ранок суботи як Reels',
   content:'Знімати неприбраний стіл → процес прибирання → kitchen view з кавою. Гачок: «суботній ранок насправді». Тривалість 25 сек, музика повільна lo-fi.',
   created_at:'2026-05-15T08:30:00Z'},
  {id:'d2', title:'Що зайшло цього тижня',
   content:'Топ пост — фото книги біля вікна (1.2k лайків). Другий — рутина перед сном (980). Висновок: повільні cozy кадри працюють краще ніж активні. Спробувати ще раз з різним освітленням.',
   created_at:'2026-05-12T19:00:00Z'},
  {id:'d3', title:'Питання від підписниці',
   content:'Питання: «Як ти знаходиш час знімати + редагувати?» → готова тема для поста або карусельки. Структура: міт → реальність → 3 робочі лайфхаки → CTA.',
   created_at:'2026-05-10T14:22:00Z'},
];

const DEMO_STATS = [
  {id:'ds1', month:'Січень', year:2026, ig:850, tt:120, posts:6, stories:18, reels:4, reach:6200, note:'Старт ведення статистики'},
  {id:'ds2', month:'Лютий', year:2026, ig:1100, tt:280, posts:9, stories:24, reels:8, reach:11500, note:'Reels почали стріляти'},
  {id:'ds3', month:'Березень', year:2026, ig:1480, tt:560, posts:11, stories:31, reels:12, reach:18200, note:'+34% за місяць'},
  {id:'ds4', month:'Квітень', year:2026, ig:1920, tt:890, posts:13, stories:38, reels:14, reach:24800, note:'Найкращий місяць'},
];

// ══════════════════════════════════════════
// HOME
// ══════════════════════════════════════════
const DASHBOARD_WIDGETS = [
  {id:'streak',      name:'Стрік публікацій',           icon:'flame',         default:false, color:'#FF6B35', size:'small'},
  {id:'goals',       name:'Цілі (прогрес)',             icon:'target',        default:false, color:'#16A34A', size:'small'},
  {id:'stats',       name:'Статистика останнього місяця',icon:'bar-chart-3',   default:true,  color:'#FF6B9D', size:'wide'},
  {id:'growth',      name:'Графік росту',               icon:'trending-up',   default:false, color:'#6C5CE7', size:'wide'},
  {id:'notes',       name:'Останні нотатки',            icon:'sticky-note',   default:true,  color:'#3B82F6', size:'wide'},
  {id:'reflectDay',  name:'Питання дня з рефлексії',    icon:'help-circle',   default:false, color:'#A855F7', size:'small'},
  {id:'checklist',   name:'Прогрес чекліста',           icon:'check-square',  default:false, color:'#14B8A6', size:'small'},
  {id:'audience',    name:'Портрет ЦА',                 icon:'users',         default:false, color:'#0891B2', size:'wide'},
  {id:'aiChips',     name:'Швидкі ШІ-запити',           icon:'sparkles',      default:false, color:'#EAB308', size:'wide'},
];

const WIDGET_BY_ID = Object.fromEntries(DASHBOARD_WIDGETS.map(w => [w.id, w]));

function blk(id, body, action) {
  const cfg = WIDGET_BY_ID[id];
  const sizeClass = cfg.size === 'wide' ? ' size-wide' : '';
  const iconHTML = cfg.icon ? `<i data-lucide="${cfg.icon}" style="width:15px;height:15px;color:${cfg.color};vertical-align:-2px"></i>` : '';
  const actBtn = action ? `<button class="dash-block-action" onclick="${action.fn}">${action.label}</button>` : '';
  return `<div class="dash-block${sizeClass}" data-widget="${id}">
    <div class="dash-accent" style="background:${cfg.color}"></div>
    <div class="dash-block-title"><span style="display:inline-flex;align-items:center;gap:8px">${iconHTML}${cfg.name}</span>${actBtn}</div>
    ${body}
  </div>`;
}

// Resize handling removed — blocks now auto-size to content. Only drag-to-reorder remains.

function getDashSelection() {
  const saved = localStorage.getItem('kishkas-dashboard-'+CU);
  if (saved) { try { return JSON.parse(saved); } catch{} }
  return DASHBOARD_WIDGETS.filter(w=>w.default).map(w=>w.id);
}

function openDashSettings() {
  const selected = getDashSelection();
  document.getElementById('dashboardOptions').innerHTML = DASHBOARD_WIDGETS.map(w=>`
    <label class="dash-opt">
      <input type="checkbox" value="${w.id}" ${selected.includes(w.id)?'checked':''}>
      <span>${w.name}</span>
    </label>`).join('');
  document.getElementById('dashboard-modal').classList.add('on');
}

function saveDashSettings() {
  const checked = Array.from(document.querySelectorAll('#dashboardOptions input:checked')).map(i=>i.value);
  localStorage.setItem('kishkas-dashboard-'+CU, JSON.stringify(checked));
  document.getElementById('dashboard-modal').classList.remove('on');
  renderHome();
}

// ──────────────────────────────────────────
// PROFILE / QUESTIONNAIRE
// ──────────────────────────────────────────
const PROFILE_BLOCKERS = [
  {v:'tech', l:'Технічні скіли (зйомка, монтаж)'},
  {v:'fear', l:'Страх / сором'},
  {v:'irregular', l:'Нерегулярність'},
  {v:'noideas', l:'Брак ідей'},
  {v:'time', l:'Не вистачає часу'},
  {v:'criticism', l:'Страх критики'},
  {v:'monetization', l:'Не виходить монетизувати'},
  {v:'comparison', l:'Порівняння з іншими'},
  {v:'algorithm', l:'Не розумію алгоритми'},
];
const PROFILE_NEEDS = [
  {v:'strategy', l:'Контент-стратегія'},
  {v:'copy', l:'Тексти і копірайт'},
  {v:'tech', l:'Технічна частина (зйомка/монтаж)'},
  {v:'monetization', l:'Монетизація'},
  {v:'audience', l:'Робота з аудиторією'},
  {v:'psychology', l:'Психологічна підтримка'},
  {v:'analytics', l:'Аналітика і дані'},
  {v:'community', l:'Спільнота, нетворкінг'},
];

async function dbProfile() {
  // Always read local first as fallback
  const local = lload('profile', null);
  if (!sbUser) return local;
  try {
    const { data, error } = await sb.from('user_questionnaire').select('*').eq('user_id', sbUser.id);
    if (error) { console.warn('profile load:', error); return local; }
    return (data && data[0]) || local;
  } catch(e) { console.warn('profile load exception:', e); return local; }
}

async function dbSaveProfile(p) {
  // Always persist locally as a safety net
  try { lsave('profile', p); } catch(e) {}
  if (!sbUser) return { ok: true, local: true };
  try {
    const { data: existing, error: selErr } = await sb.from('user_questionnaire').select('user_id').eq('user_id', sbUser.id);
    if (selErr) {
      console.warn('profile select:', selErr);
      return { ok: false, error: selErr.message || JSON.stringify(selErr), local: true };
    }
    const payload = { ...p, updated_at: new Date().toISOString() };
    let writeErr;
    if (existing && existing.length) {
      const { error } = await sb.from('user_questionnaire').update(payload).eq('user_id', sbUser.id);
      writeErr = error;
    } else {
      const { error } = await sb.from('user_questionnaire').insert({ user_id: sbUser.id, ...payload });
      writeErr = error;
    }
    if (writeErr) {
      console.warn('profile write:', writeErr);
      return { ok: false, error: writeErr.message || JSON.stringify(writeErr), local: true };
    }
    return { ok: true };
  } catch(e) {
    console.warn('profile save exception:', e);
    return { ok: false, error: e.message, local: true };
  }
}

function profileFormHTML(p) {
  p = p || {};
  // Backwards-compat
  if (p.niche && !p.blog_topic) p.blog_topic = p.niche;
  // Old blog_type values → new
  if (p.blog_type === 'lifestyle') p.blog_type = 'personal';
  else if (p.blog_type === 'expert' || p.blog_type === 'mixed') p.blog_type = 'professional';

  const sel = (id, label, options, current) => `
    <div class="pf-row">
      <label>${label}</label>
      <select id="${id}">
        <option value="">— оберіть —</option>
        ${options.map(o => `<option value="${o.v}" ${current===o.v?'selected':''}>${o.l}</option>`).join('')}
      </select>
    </div>`;
  const multi = (name, label, options, current, otherId, otherValue) => {
    const cur = Array.isArray(current) ? current : [];
    const otherInput = otherId ? `<input type="text" id="${otherId}" value="${esc(otherValue)}" placeholder="Свій варіант (опціонально)" style="margin-top:8px">` : '';
    return `<div class="pf-row">
      <label>${label}</label>
      <div class="multi-chips" data-name="${name}">
        ${options.map(o => `<button type="button" class="m-chip ${cur.includes(o.v)?'on':''}" data-value="${o.v}" onclick="this.classList.toggle('on')">${o.l}</button>`).join('')}
      </div>
      ${otherInput}
    </div>`;
  };
  const ta = (id, label, current, placeholder='') => `
    <div class="pf-row">
      <label>${label}</label>
      <textarea id="${id}" placeholder="${placeholder}" style="min-height:60px">${esc(current)}</textarea>
    </div>`;
  const head = (t) => `<div class="pf-head">${t}</div>`;

  const expOptions = [
    {v:'<6m', l:'Менше 6 місяців'},
    {v:'6m-1y', l:'6 місяців – 1 рік'},
    {v:'1-3y', l:'1–3 роки'},
    {v:'3-5y', l:'3–5 років'},
    {v:'5+', l:'5+ років'},
  ];

  const hasBlog = p.has_blog;
  const showBlogBlock = hasBlog === 'yes' || hasBlog === 'planning';
  const showBlogExp = hasBlog === 'yes';
  const showProfBlock = showBlogBlock && p.blog_type === 'professional';

  const typeToggle = `
    <div class="pf-row">
      <label>Який блог</label>
      <div class="blogtype-toggle" data-name="blog_type">
        <button type="button" class="btype-btn ${p.blog_type==='personal'?'on':''}" data-value="personal" onclick="onBlogTypeChange('personal')">
          <div class="btype-icon">🌿</div>
          <div class="btype-name">Особистий</div>
          <div class="btype-desc">Лайфстайл, мої інтереси — не про роботу</div>
        </button>
        <button type="button" class="btype-btn ${p.blog_type==='professional'?'on':''}" data-value="professional" onclick="onBlogTypeChange('professional')">
          <div class="btype-icon">🎯</div>
          <div class="btype-name">Професійний</div>
          <div class="btype-desc">Про мою роботу або експертизу</div>
        </button>
      </div>
    </div>`;

  const PALETTE = ['#FF6B9D','#FF4444','#4DA6FF','#7C3AED','#14B8A6','#FF6B35','#16A34A','#F59E0B','#06B6D4','#6366F1','#EC4899','#0E0E10'];
  const isCustom = isHexColor(p.accent_color) && !PALETTE.includes(p.accent_color);
  const colorPaletteHTML = `
    <div class="pf-row">
      <label>Акцентний колір</label>
      <div class="color-palette" data-name="accent_color">
        ${PALETTE.map(c => `<button type="button" class="color-swatch ${p.accent_color===c?'on':''}" data-color="${c}" style="background:${c}" onclick="selectAccentColor('${c}')"></button>`).join('')}
        <label class="color-custom-wrap" title="Свій колір" ${isCustom?'style="border-style:solid;border-color:'+p.accent_color+'"':''}>
          <input type="color" id="p-customColor" value="${isHexColor(p.accent_color) ? p.accent_color : '#FF6B9D'}" oninput="selectAccentColor(this.value,true)">
        </label>
      </div>
    </div>`;

  if (CU === 'demo') {
    // Demo: only look-and-feel settings; the rest needs an account
    return [
      head('Про тебе'),
      `<div class="pf-row">
        <label>Як тебе називати (ім'я, нік, псевдонім)</label>
        <input type="text" id="p-name" value="${esc(p.display_name)}" placeholder="Наприклад: Олена, або Olenka_blog">
      </div>`,
      `<div class="pf-row">
        <label>Емодзі для лівого кутка</label>
        <div class="emoji-row">
          <span class="emoji-current" id="emojiCurrent">${esc(p.display_emoji || '🙂')}</span>
          <input type="hidden" id="p-emoji" value="${esc(p.display_emoji)}">
          <button type="button" class="btn btn-out btn-sm" onclick="toggleEmojiPicker()">Обрати →</button>
          <button type="button" class="btn btn-out btn-sm" onclick="pickEmoji('')">Без емодзі</button>
        </div>
        <div id="emojiPicker" class="emoji-picker" style="display:none">${emojiPickerHTML()}</div>
      </div>`,
      colorPaletteHTML,
      `<div class="cl cl-dk" style="margin-top:6px">🔒 Інформація про блог, час, монетизацію, блокери і цілі заповнюється після реєстрації — тоді ШІ-ментор зможе скласти план саме під тебе. Ім'я, емодзі й колір з демо перенесуться на твій акаунт.<div style="margin-top:10px"><button type="button" class="btn btn-ac btn-sm" onclick="goRegisterFromDemo()">Зареєструватись →</button></div></div>`,
    ].join('');
  }

  return [
    head('Про тебе'),
    `<div class="pf-row">
      <label>Як тебе називати (ім'я, нік, псевдонім)</label>
      <input type="text" id="p-name" value="${esc(p.display_name)}" placeholder="Наприклад: Олена, або Olenka_blog, або просто Анонім">
    </div>`,
    `<div class="pf-row">
      <label>Емодзі для лівого кутка</label>
      <div class="emoji-row">
        <span class="emoji-current" id="emojiCurrent">${esc(p.display_emoji || '🙂')}</span>
        <input type="hidden" id="p-emoji" value="${esc(p.display_emoji)}">
        <button type="button" class="btn btn-out btn-sm" onclick="toggleEmojiPicker()">Обрати →</button>
        <button type="button" class="btn btn-out btn-sm" onclick="pickEmoji('')">Без емодзі</button>
      </div>
      <div id="emojiPicker" class="emoji-picker" style="display:none">${emojiPickerHTML()}</div>
    </div>`,
    sel('p-gender', 'Як до тебе звертатись', [
      {v:'f', l:'У жіночому роді'},
      {v:'m', l:'У чоловічому роді'},
      {v:'n', l:'Нейтрально / без роду'},
    ], p.gender),
    colorPaletteHTML,

    head('Блог'),
    `<div class="pf-row">
      <label>Чи ведеш блог зараз</label>
      <select id="p-hasblog" onchange="onHasBlogChange(this.value)">
        <option value="">—</option>
        <option value="yes" ${hasBlog==='yes'?'selected':''}>Так, веду</option>
        <option value="planning" ${hasBlog==='planning'?'selected':''}>Поки ні, планую почати</option>
        <option value="no" ${hasBlog==='no'?'selected':''}>Ні і не планую</option>
      </select>
    </div>`,
    `<div id="pf-blog-block" style="display:${showBlogBlock?'contents':'none'}">
      ${typeToggle}
      <div id="pf-profession-block" style="display:${showProfBlock?'contents':'none'}">
        ${ta('p-profession', 'Чим займаєшся професійно', p.profession, 'Наприклад: брова-майстер, стоматолог, дизайнерка, програміст...')}
        ${sel('p-fieldexp', 'Скільки часу в цій сфері', expOptions, p.field_experience)}
      </div>
      ${ta('p-blogtopic', 'Про що блог конкретно', p.blog_topic, 'Наприклад: показую процес нарощування вій, рутина дня, кулінарія для зайнятих')}
      <div class="pf-row" id="pf-blogexp-row" style="display:${showBlogExp?'flex':'none'};flex-direction:column">
        <label>Скільки часу ведеш блог</label>
        <select id="p-blogexp">
          <option value="">—</option>
          ${expOptions.map(o => `<option value="${o.v}" ${p.blog_experience===o.v?'selected':''}>${o.l}</option>`).join('')}
        </select>
      </div>
    </div>`,

    head('Практичне'),
    sel('p-hours', 'Скільки годин на тиждень готовий_а приділяти блогу', [
      {v:'<2', l:'До 2 годин'},
      {v:'2-5', l:'2–5 годин'},
      {v:'5-10', l:'5–10 годин'},
      {v:'10-20', l:'10–20 годин'},
      {v:'20+', l:'20+ годин'},
    ], p.hours_per_week),
    sel('p-monetization', 'Монетизація', [
      {v:'no', l:'Поки що ні'},
      {v:'planning', l:'Планую'},
      {v:'partial', l:'Частково (додатковий дохід)'},
      {v:'main', l:'Це мій основний дохід'},
    ], p.monetization),
    multi('blockers', 'Головні блокери зараз', PROFILE_BLOCKERS, p.blockers, 'p-blockersOther', p.blockers_other),
    multi('needs', 'Що найбільше потрібно', PROFILE_NEEDS, p.needs, 'p-needsOther', p.needs_other),
    ta('p-goals', 'Цілі на найближчі 3–6 місяців', p.goals, 'Наприклад: дійти до 5k підписників, запустити курс, побороти страх показувати обличчя...'),
    ,head('Небезпечна зона'),
    `<div class="pf-row">
      <label>Видалити акаунт</label>
      <div style="font-size:13px;color:var(--muted);margin-bottom:10px;line-height:1.5">Акаунт і всі твої дані (нотатки, статистика, плани, чати, профіль) будуть видалені назавжди. Це не можна скасувати.</div>
      <button type="button" class="btn btn-out btn-sm" style="color:#d33;border-color:#d33" onclick="deleteAccount()">Видалити акаунт</button>
    </div>`
  ].join('');
}

function onHasBlogChange(v) {
  const block = document.getElementById('pf-blog-block');
  const exp = document.getElementById('pf-blogexp-row');
  if (block) block.style.display = (v === 'yes' || v === 'planning') ? 'contents' : 'none';
  if (exp) exp.style.display = (v === 'yes') ? 'flex' : 'none';
}

function onBlogTypeChange(v) {
  document.querySelectorAll('.blogtype-toggle .btype-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.value === v);
  });
  const profBlock = document.getElementById('pf-profession-block');
  if (profBlock) profBlock.style.display = (v === 'professional') ? 'contents' : 'none';
}

function selectAccentColor(c, fromCustom) {
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('on', s.dataset.color === c);
  });
  if (fromCustom) {
    document.querySelectorAll('.color-swatch.on').forEach(s => s.classList.remove('on'));
  }
  const ci = document.getElementById('p-customColor');
  if (ci && !fromCustom) ci.value = c;
  const wrap = document.querySelector('.color-custom-wrap');
  if (wrap && fromCustom) { wrap.style.borderStyle = 'solid'; wrap.style.borderColor = c; }
  document.documentElement.style.setProperty('--ac', c);
}

const EMOJI_LIST = {
  '😀 Лиця': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮‍💨','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','🤖'],
  '🙌 Жести': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','🫵','🫱','🫲','🫳','🫴','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦿','🦶','👂','🦻','👃','🧠','🫀','🫁','👀','👁️','👅','👄','🫦','💋'],
  '🧑 Люди': ['👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','👲','👳','🧕','🤵','👰','🤰','🤱','👮','🕵️','💂','🥷','👷','🤴','👸','👼','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟','💆','💇','🚶','🧍','🧎','🏃','💃','🕺','🧘','🛀','🛌','🧑‍🤝‍🧑','👭','👫','👬','💏','💑','👪'],
  '🐱 Тварини': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔'],
  '🌿 Природа': ['💐','🌸','💮','🪷','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🪴','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🪹','🪺','🍄','🌰','🐚','🪨','🪵','🪸','🌍','🌎','🌏','🌐','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','🌚','🌛','🌜','🌡️','☀️','🌝','🌞','⭐','🌟','🌠','🌌','☁️','⛅','⛈️','🌤️','🌥️','🌦️','🌧️','🌨️','🌩️','🌪️','🌫️','🌬️','🌀','🌈','🌂','☂️','☔','⛱️','⚡','❄️','☃️','⛄','☄️','🔥','💧','🌊'],
  '🍎 Їжа': ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🥜','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🫖','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🫗','🥤','🧋','🧃','🧉','🧊','🥢','🍽️','🍴','🥄'],
  '🌍 Подорожі': ['🌍','🌎','🌏','🗺️','🗾','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','♨️','🎠','🛝','🎡','🎢','💈','🎪','🚂','🚆','🚇','🚌','🚓','🚑','🚒','🚕','🚗','🚙','🛻','🚚','🚜','🏎️','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','⛽','🚦','🛑','🚧','⚓','⛵','🛶','🚤','🛳️','✈️','🛩️','🪂','🚁','🛸','🚀','🛰️','💺','🛎️','🧳'],
  '⚽ Спорт': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'],
  '💜 Серця': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💌','💋'],
  '✨ Символи': ['✨','💫','⭐','🌟','💥','💢','💦','💨','🕳️','💣','💬','👁️‍🗨️','🗨️','🗯️','💭','💤','🎯','🪄','🔮','🧿','🪬','🛒','🧸','🪅','🪩','🪆','🖼️','🧵','🪡','🧶','🪢','🎁','🎀','🎊','🎉','🧧','✉️','📨','📩','📤','📥','📦','📜','📃','📰','🔖','🏷️','💰','💴','💵','💶','💷','💸','💳','💹','📈','📉','📊','📋','📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🗑️','🔐','🔒','🔓','🔑','🗝️','🔔','🔕','🔇','🔈','🔉','🔊','📢','📣','📯','🎼','🎵','🎶','♾️','💯','✅','☑️','✔️','❌','❎','➕','➖','➗','✖️','🟰','❗','❓','❕','❔','‼️','⁉️','〰️','〽️','*️⃣','#️⃣','▶️','⏸️','⏹️','⏺️','◀️','⏏️'],
  '📷 Творчість': ['📷','📸','📹','🎥','🎞️','📽️','🎬','📺','📻','🎙️','🎚️','🎛️','🎤','🎧','📞','📟','📠','📱','📲','☎️','🔋','🪫','🔌','💻','🖥️','🖨️','⌨️','🖱️','🖲️','💽','💾','💿','📀','🧮','💡','🔦','🕯️','📔','📕','📖','📗','📘','📙','📚','📓','📒','📃','📜','📄','📰','✏️','✒️','🖋️','🖊️','🖌️','🖍️','📝','💼','📁','📂','🗂️','📅','📆','🗒️','🗓️','📇','🎨','🖼️','🧵','🧶'],
  '☕ Лайфстайл': ['🛒','🏠','🏡','🛏️','🛋️','🚿','🛁','🪞','🪟','🚪','🪑','🚽','🧴','🧷','🧹','🧺','🧻','🪣','🧼','🪥','🧽','🧯','💄','💅','💍','💎','💼','👓','🕶️','🥽','🥼','🦺','👔','👕','👖','🧣','🧤','🧥','🧦','👗','👘','🥻','🩱','🩲','🩳','👙','👚','👛','👜','👝','🛍️','🎒','👞','👟','🥾','🥿','👠','👡','🩰','👢','👑','👒','🎩','🎓','🧢','⛑️','📿','💐','🌹','🌺','🌷','🕯️','🪴']
};

function emojiPickerHTML() {
  return Object.entries(EMOJI_LIST).map(([cat, list]) => `
    <div class="emoji-cat">${cat}</div>
    <div class="emoji-grid">
      ${list.map(e => `<button type="button" onclick="pickEmoji('${e}')">${e}</button>`).join('')}
    </div>`).join('');
}

function toggleEmojiPicker() {
  const el = document.getElementById('emojiPicker');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function pickEmoji(e) {
  const inp = document.getElementById('p-emoji');
  const cur = document.getElementById('emojiCurrent');
  if (inp) inp.value = e;
  if (cur) cur.textContent = e || '—';
  const pick = document.getElementById('emojiPicker');
  if (pick && e) pick.style.display = 'none';
}

// Browser-tab icon (SVG) plus the iOS home-screen icon (PNG, because
// apple-touch-icon does not accept SVG). Both follow the user's emoji and accent colour.
function setEmojiFavicon(emoji, color) {
  if (!emoji) emoji = '🌱';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="55" font-size="78" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  let link = document.getElementById('favicon') || document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.id = 'favicon';
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
  setAppleTouchIcon(emoji, color);
}

function setAppleTouchIcon(emoji, color) {
  const link = document.getElementById('apple-touch-icon');
  if (!link) return;
  try {
    const bg = /^#[0-9a-f]{6}$/i.test(color || '') ? color : '#22C55E';
    const size = 180;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg;            // iOS fills transparency with black, so paint a solid background
    ctx.fillRect(0, 0, size, size);
    ctx.font = `${Math.round(size * 0.62)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.04);
    link.href = c.toDataURL('image/png');
  } catch (e) {
    // keep the static assets/apple-touch-icon.png from index.html
  }
}

function requireAuth() {
  if (sbUser) return true;
  // Use custom styling — not red (destructive), just neutral confirm
  const modal = document.getElementById('confirm-modal');
  document.getElementById('confirm-title').textContent = 'Потрібна реєстрація';
  document.getElementById('confirm-desc').textContent = 'Ця функція доступна тільки зареєстрованим користувачам.';
  const btn = document.getElementById('confirm-yes-btn');
  btn.textContent = 'Зареєструватись';
  btn.style.color = 'var(--ink2)';
  btn.style.fontWeight = '600';
  btn.onclick = () => {
    modal.style.display = 'none';
    btn.style.color = '';
    btn.style.fontWeight = '';
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  };
  modal.style.display = 'flex';
  return false;
}

function showConfirm({ title, desc = '', yesText = 'Так', onYes }) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-desc').textContent = desc;
  const btn = document.getElementById('confirm-yes-btn');
  btn.textContent = yesText;
  btn.onclick = () => { document.getElementById('confirm-modal').style.display = 'none'; onYes(); };
  document.getElementById('confirm-modal').style.display = 'flex';
}


// Go from the demo to the sign-up form (demo look-and-feel stays in memory and is carried over)
async function goRegisterFromDemo() {
  document.getElementById('profile-modal').classList.remove('on');
  _profileSnapshot = null;
  await performLogout();
  setMode('reg', document.querySelector('.mtab[onclick*="reg"]'));
}

// Name / emoji / accent colour chosen in the demo are stored in the new account's metadata at sign-up
// (or in sessionStorage before the Google redirect) and copied into its profile on the first login.
async function adoptPendingProfile() {
  const fromMeta = sbUser?.user_metadata?.pending_profile;
  let fromGoogle = null;
  try {
    fromGoogle = JSON.parse(sessionStorage.getItem(PENDING_PROFILE_KEY) || 'null');
    sessionStorage.removeItem(PENDING_PROFILE_KEY);
  } catch(e) {}
  const pend = fromMeta || fromGoogle;
  if (!pend) return;
  try {
    const cur = await dbProfile();
    if (!cur || (!cur.display_name && !cur.display_emoji && !cur.accent_color)) {
      await dbSaveProfile({ ...(cur || {}), ...pend });
    }
    if (fromMeta) await sb.auth.updateUser({ data: { pending_profile: null } });
  } catch(e) { console.warn('pending profile', e); }
}

// First Google sign-in: the account has no app metadata yet. Give it the 'default' profile like an email
// sign-up and take the display name from Google if the profile has none. Email accounts already have
// metadata.profile (also when Google is linked to them by email), so their data is never touched here.
async function prepareOAuthUser() {
  const meta = sbUser?.user_metadata || {};
  if (!sbUser || meta.profile) return;
  try {
    const { data: upd } = await sb.auth.updateUser({ data: { profile: 'default' } });
    if (upd?.user) sbUser = upd.user;
    const googleName = String(meta.full_name || meta.name || '').trim();
    if (!googleName) return;
    const { data: rows } = await sb.from('user_questionnaire').select('*').eq('user_id', sbUser.id);
    const cur = rows && rows[0];
    if (!cur?.display_name) await dbSaveProfile({ ...(cur || {}), display_name: googleName });
  } catch(e) { console.warn('oauth profile', e); }
}

async function applyProfileOverrides() {
  await adoptPendingProfile();
  await prepareOAuthUser();
  const p = await dbProfile();
    const u = USERS[CU] || {};
    const defaultEmoji = u.emoji || '🌱';
    const defaultName = u.brand || u.name || 'користувач';
    if (!p) {
      setEmojiFavicon(defaultEmoji, u.color);
      document.title = `${defaultName} · платформа для росту`;
      return;
    }
  if (p.display_name) {
    const nb = document.getElementById('nbname');
    if (nb) nb.textContent = p.display_name.toLowerCase();
  }
  const usedEmoji = p.display_emoji || defaultEmoji;
  const usedName = p.display_name || defaultName;
  const em = document.getElementById('nbemoji');
  if (em) em.textContent = usedEmoji;
  setEmojiFavicon(usedEmoji, p.accent_color || u.color);
  document.title = `${usedName} · платформа для росту`;
  if (isHexColor(p.accent_color)) {
    document.documentElement.style.setProperty('--ac', p.accent_color);
    const nbrand = document.getElementById('nbrand');
    if (nbrand) nbrand.style.color = p.accent_color;
  }
  if (CU === 'default') {
    const hero = buildPersonalizedHero(p);
    const htag = document.getElementById('htag');
    const htitle = document.getElementById('htitle');
    if (htag) htag.textContent = hero.tag;
    if (htitle) htitle.innerHTML = hero.title;
  }
}

function buildPersonalizedHero(p) {
  const ac = 'color:var(--ac)';
  const w = t => `<span style="${ac}">${t}</span>`;
  const name = p?.display_name || '';
  const greeting = name ? `${esc(name.split(' ')[0])}, ` : '';

  const blockerMap = {
    fear:        { tag:'💪 подолай страх',       title:`${greeting}від страху<br>до першого ${w('поста')}` },
    irregular:   { tag:'🔁 про регулярність',    title:`Регулярність —<br>твоя ${w('суперсила')}` },
    noideas:     { tag:'💡 ідеї є завжди',        title:`Ідей у тебе<br>більше ніж ти ${w('думаєш')}` },
    time:        { tag:'⏱ навіть 5 хвилин',      title:`Навіть 5 хвилин<br>змінюють ${w('все')}` },
    criticism:   { tag:'🛡 твій голос',           title:`Твій голос<br>важливіший за чужу ${w('думку')}` },
    monetization:{ tag:'💰 до монетизації',       title:`Від контенту<br>до ${w('доходу')}` },
    comparison:  { tag:'🌟 ти унікальна',         title:`Ти унікальна —<br>перестань ${w('порівнювати')}` },
    algorithm:   { tag:'📈 алгоритм з тобою',     title:`Алгоритм любить<br>твою ${w('автентичність')}` },
    tech:        { tag:'🎬 зйомка — просто',       title:`Зйомка простіша<br>ніж ти ${w('думаєш')}` },
  };

  const firstBlocker = p?.blockers?.[0];
  if (firstBlocker && blockerMap[firstBlocker]) return blockerMap[firstBlocker];

  if (p?.blog_topic) {
    const topic = p.blog_topic.replace(/^про /i, '').split(/[,\.]/, 1)[0].trim().toLowerCase();
    return {
      tag: `✨ ${topic}`,
      title: `Твій контент про ${topic}<br>${w('чекають')}`,
    };
  }

  if (p?.profession) {
    const prof = p.profession.split(/[,\.]/, 1)[0].trim().toLowerCase();
    return {
      tag: `🌱 ${prof} · платформа для росту`,
      title: `${prof.charAt(0).toUpperCase() + prof.slice(1)},<br>що ${w('натхняє')}`,
    };
  }

  return {
    tag: '✨ ласкаво просимо',
    title: `Твоя платформа<br>для ${w('росту')}`,
  };
}

let _profileSnapshot = null;

const PROFILE_FIELD_LABELS = {
  name:"Ім'я",emoji:'Аватар',gender:'Рід',accent:'Колір акценту',
  blogType:'Тип блогу',profession:'Професія',fieldexp:'Досвід у сфері',
  hasblog:'Наявність блогу',blogtopic:'Тема блогу',blogexp:'Досвід блогерства',
  hours:'Години на тиждень',blockers:'Блокери',blockersOther:'Інший блокер',
  needs:'Потреби',needsOther:'Інша потреба',monetization:'Монетизація',goals:'Цілі',
};

function getProfileFormState() {
  const get = id => document.getElementById(id)?.value || '';
  const multi = name => Array.from(document.querySelectorAll(`.multi-chips[data-name="${name}"] .m-chip.on`)).map(c=>c.dataset.value).sort().join(',');
  return {
    name:get('p-name'), emoji:get('p-emoji'), gender:get('p-gender'),
    accent:document.querySelector('.color-swatch.on')?.dataset.color||'',
    blogType:document.querySelector('.blogtype-toggle .btype-btn.on')?.dataset.value||'',
    profession:get('p-profession'), fieldexp:get('p-fieldexp'), hasblog:get('p-hasblog'),
    blogtopic:get('p-blogtopic'), blogexp:get('p-blogexp'), hours:get('p-hours'),
    blockers:multi('blockers'), blockersOther:get('p-blockersOther'),
    needs:multi('needs'), needsOther:get('p-needsOther'),
    monetization:get('p-monetization'), goals:get('p-goals'),
  };
}

async function openProfileModal() {
  const p = await dbProfile() || {};
  document.getElementById('profileForm').innerHTML = profileFormHTML(p);
  document.getElementById('profile-modal').classList.add('on');
  // snapshot after render so form values are populated
  requestAnimationFrame(() => { _profileSnapshot = getProfileFormState(); });
}

function closeProfileModal() {
  const current = getProfileFormState();
  const snap = _profileSnapshot;
  if (!snap) { document.getElementById('profile-modal').classList.remove('on'); return; }
  const changed = Object.keys(PROFILE_FIELD_LABELS).filter(k => (current[k]||'') !== (snap[k]||''));
  if (!changed.length) { document.getElementById('profile-modal').classList.remove('on'); return; }
  // Show unsaved changes overlay
  const labels = changed.map(k => PROFILE_FIELD_LABELS[k]).join(', ');
  document.getElementById('unsaved-desc').textContent = 'Змінено: ' + labels;
  document.getElementById('unsaved-overlay').style.display = 'flex';
}

async function saveProfileAndClose() {
  document.getElementById('unsaved-overlay').style.display = 'none';
  await saveProfile();
}

function discardProfileChanges() {
  document.getElementById('unsaved-overlay').style.display = 'none';
  document.getElementById('profile-modal').classList.remove('on');
  _profileSnapshot = null;
}

function showToast(msg, kind) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 250); }, 2400);
}

async function saveProfile() {
  try {
    const get = id => document.getElementById(id)?.value || '';
    const multi = name => Array.from(document.querySelectorAll(`.multi-chips[data-name="${name}"] .m-chip.on`)).map(c => c.dataset.value);
    const blogType = document.querySelector('.blogtype-toggle .btype-btn.on')?.dataset.value || '';
    const accent = document.querySelector('.color-swatch.on')?.dataset.color || '';
    const data = {
      display_name: get('p-name'),
      display_emoji: get('p-emoji'),
      gender: get('p-gender'),
      accent_color: accent,
      profession: blogType === 'professional' ? get('p-profession') : '',
      field_experience: blogType === 'professional' ? get('p-fieldexp') : '',
      has_blog: get('p-hasblog'),
      blog_type: blogType,
      blog_topic: get('p-blogtopic'),
      blog_experience: get('p-blogexp'),
      hours_per_week: get('p-hours'),
      blockers: multi('blockers'),
      blockers_other: get('p-blockersOther'),
      needs: multi('needs'),
      needs_other: get('p-needsOther'),
      monetization: get('p-monetization'),
      goals: get('p-goals'),
    };
    const result = await dbSaveProfile(data);
    document.getElementById('profile-modal').classList.remove('on');
    checkProfileNudge();
    if (result.ok) {
      showToast('✓ Профіль збережено', 'success');
    } else {
      showToast('⚠ Збережено локально. Виконай SQL для user_questionnaire щоб синхронізувалось у хмару.', 'error');
      console.warn('profile save error', result.error);
    }
    applyProfileOverrides();
  } catch (e) {
    console.error('saveProfile crash', e);
    showToast('Помилка: ' + e.message, 'error');
  }
}

async function deleteAccount() {
  if (!sbUser) return;
  const word = prompt('Це видалить акаунт і ВСІ твої дані (нотатки, статистику, плани, чати) назавжди.\n\nЩоб підтвердити, напиши слово: ВИДАЛИТИ');
  if (word === null) return;
  if (word.trim().toUpperCase() !== 'ВИДАЛИТИ') { showToast('Не підтверджено — акаунт не видалено', 'error'); return; }
  const { error } = await sb.rpc('delete_my_account');
  if (error) {
    console.warn('delete account', error);
    showToast('Не вдалося видалити акаунт. Спробуй ще раз пізніше', 'error');
    return;
  }
  const prefix = `ksk_${CU}_`;
  try { Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k)); } catch(e) {}
  document.getElementById('profile-modal').classList.remove('on');
  _profileSnapshot = null;
  await performLogout();
  showToast('Акаунт видалено', 'success');
}

function dismissProfileNudge() {
  try { localStorage.setItem('kishkas-nudge-dismissed-'+CU, '1'); } catch(e) {}
  document.getElementById('profileNudge')?.classList.remove('on');
}

async function checkProfileNudge() {
  const el = document.getElementById('profileNudge');
  if (!el) return;
  if (CU === 'demo') { el.classList.remove('on'); return; }
  const dismissed = localStorage.getItem('kishkas-nudge-dismissed-'+CU);
  const p = await dbProfile();
  const isEmpty = !p || (!p.field_experience && !p.niche && (!p.blockers || !p.blockers.length));
  el.classList.toggle('on', isEmpty && !dismissed);
}

// ──────────────────────────────────────────
// MENTOR PLAN — AI-generated
// ──────────────────────────────────────────
async function dbMentorPlan() {
  const local = lload('mentor_plan', null);
  if (!sbUser) return local;
  try {
    const { data, error } = await sb.from('mentor_plan').select('plan').eq('user_id', sbUser.id);
    if (error) return local;
    return (data && data[0]?.plan) || local;
  } catch(e) { return local; }
}

async function dbSaveMentorPlan(plan) {
  try { lsave('mentor_plan', plan); } catch(e) {}
  if (!sbUser) return { ok: true, local: true };
  try {
    const { data: existing, error: selErr } = await sb.from('mentor_plan').select('user_id').eq('user_id', sbUser.id);
    if (selErr) return { ok: false, error: selErr.message };
    const payload = { plan, generated_at: new Date().toISOString() };
    let writeErr;
    if (existing && existing.length) {
      const { error } = await sb.from('mentor_plan').update(payload).eq('user_id', sbUser.id);
      writeErr = error;
    } else {
      const { error } = await sb.from('mentor_plan').insert({ user_id: sbUser.id, ...payload });
      writeErr = error;
    }
    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
}

function extractJSON(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(text.slice(start, end+1)); } catch {}
  }
  return null;
}

async function generateMentorPlan() {
  if (!requireAuth()) return;
  if (window._mentorGenerating) { showToast('Вже генерую — зачекай', 'error'); return; }
  const profile = await dbProfile();
  if (!profile || (!profile.has_blog && (!profile.blockers || !profile.blockers.length) && !profile.profession)) {
    if (confirm('Спочатку заповни анкету профіля — тоді план буде дійсно персональним. Відкрити анкету?')) {
      openProfileModal();
    }
    return;
  }
  window._mentorGenerating = true;
  const btn = document.getElementById('generateMentorBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Генерую план... (~1–2 хв)'; }
  const regenBtns = document.querySelectorAll('button[onclick="regenerateMentorPlan()"]');
  regenBtns.forEach(b => { b.disabled = true; b.textContent = '⏳ Генерую...'; });
  showToast('Генерую план... зачекай 1–2 хв', 'success');

  const profileCtx = await getProfileContext();
  const stats = await dbStats();
  const audience = await dbAudience();

  const system = `Ти стратег контент-маркетингу і ментор для контент-творців. На основі профіля користувача згенеруй ПЕРСОНАЛЬНИЙ ментор-план у форматі JSON.

КРИТИЧНО ВАЖЛИВО:
- Твоя відповідь МАЄ ПОЧИНАТИСЬ символом { і ЗАКІНЧУВАТИСЬ символом }
- ЖОДНОГО тексту до { або після }
- ЖОДНИХ markdown-блоків (без \`\`\`json і \`\`\`)
- ЖОДНИХ привітань, пояснень, коментарів
- Тільки чистий JSON

Інші правила:
- Усе українською.
- Будь конкретним. Бери до уваги тип блогу, блокери, цілі і досвід.
- Уникай загальних фраз. Кожна рекомендація має бути дієвою.
- Якщо якесь поле профіля порожнє — не вигадуй, роби загальніший пункт.

Структура JSON (саме така, з саме такими ключами):
{
  "positioning": "2-3 речення: хто користувач і що дає підписникам",
  "pillars": [
    {"emoji":"🎯","name":"Назва опори","desc":"опис 1 речення","tags":["тег1","тег2","тег3"]},
    {"emoji":"🏛","name":"...","desc":"...","tags":[...]},
    {"emoji":"📅","name":"...","desc":"...","tags":[...]}
  ],
  "weeks": [
    {"num":"01","name":"Назва тижня (2-3 слова)","focus":"Головний фокус","items":["Конкретна дія 1","Дія 2","Дія 3"]},
    ... всього 6-8 тижнів від базового до просунутого
  ],
  "formula": {
    "label":"Назва (наприклад 70/20/10)",
    "parts":[
      {"percent":"70%","label":"Що це","desc":"Приклади з ніші"},
      {"percent":"20%","label":"...","desc":"..."},
      {"percent":"10%","label":"...","desc":"..."}
    ]
  },
  "reflection_questions":[
    {"q":"Питання","cat":"Контент|Голова|Ріст|Аудиторія|Цінності|Творчість"},
    ... 8-10 питань під блокери користувача
  ],
  "quick_prompts":[
    {"label":"📊 Назва","text":"Готовий промпт для AI-чату"},
    ... 6-8 промптів під нішу
  ],
  "this_week":["Дія 1","Дія 2","Дія 3","Дія 4"],
  "strategy_per_blocker":[
    {"blocker":"Назва блокера","advice":"Конкретна стратегія як подолати"}
  ]
}`;

  const userMsg = `${profileCtx}\n\nДодатково: статистика за ${stats.length} місяців${audience?.ai_result?', портрет ЦА вже згенеровано':''}.\n\nЗгенеруй мій персональний ментор-план як JSON.`;

  try {
    const res = await chatFetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 6000,
        system,
        messages: [{ role: 'user', content: userMsg }]
      })
    });
    const data = await res.json();
    console.log('[mentor plan] full API response:', data);
    if (data.error) throw new Error(data.error.message || data.error.type || JSON.stringify(data.error));
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    console.log('[mentor plan] stop_reason:', data.stop_reason, '| text length:', text.length);
    console.log('[mentor plan] raw text:', text);
    if (!text) throw new Error('Порожня відповідь від ШІ');
    if (data.stop_reason === 'max_tokens') console.warn('Response was truncated by max_tokens');
    const plan = extractJSON(text);
    if (!plan) throw new Error('Невалідний JSON. Дивись консоль (Cmd+Option+J) — там повний текст.');
    if (!plan.positioning) throw new Error('JSON без поля "positioning". Дивись консоль.');
    const saveResult = await dbSaveMentorPlan(plan);
    showToast(saveResult.ok ? '✓ План згенеровано' : '⚠ Згенеровано локально', saveResult.ok ? 'success' : 'error');
    renderMentor();
  } catch(e) {
    console.error('[mentor plan] gen failed:', e);
    showToast(e instanceof ChatError ? e.message : 'Помилка: ' + e.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = '🤖 Згенерувати персональний план'; }
    regenBtns.forEach(b => { b.disabled = false; b.textContent = '↻ Перегенерувати'; });
  } finally {
    window._mentorGenerating = false;
  }
}

async function regenerateMentorPlan() {
  if (window._mentorGenerating) { showToast('Вже генерую — зачекай', 'error'); return; }
  if (!confirm('Перегенерувати план? Поточний буде замінено.')) return;
  await generateMentorPlan();
}

// The plan is AI-generated JSON: every field is escaped, nothing is trusted as HTML.
function renderMentorPlan(plan) {
  const u = USERS[CU];
  const c = u.color;
  const positioning = plan.positioning ? `<div class="cncpt"><div class="cnl" style="color:${c}">🎯 позиціонування</div><p class="cnt">${esc(plan.positioning)}</p></div>` : '';
  const thisWeek = (plan.this_week && plan.this_week.length) ? `
    <div class="card" style="border-left:3px solid ${c}">
      <div class="ctitle">📌 Що зробити цього тижня</div>
      <ul class="qlist" style="margin-top:8px">${plan.this_week.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    </div>` : '';
  const pillars = plan.pillars && plan.pillars.length ? `
    <div class="slbl">Опори контенту</div>
    <div class="pillars">${plan.pillars.map(p=>`
      <div class="pillar">
        <span class="pe">${esc(p.emoji||'🎯')}</span>
        <div class="pname">${esc(p.name)}</div>
        <div class="pdesc">${esc(p.desc)}</div>
        ${(p.tags&&p.tags.length)?`<div class="ptags">${p.tags.map(t=>`<span class="ptag">${esc(t)}</span>`).join('')}</div>`:''}
      </div>`).join('')}</div>` : '';
  const formula = plan.formula && plan.formula.parts ? `
    <div class="slbl">Формула контенту${plan.formula.label?' — '+esc(plan.formula.label):''}</div>
    <div class="fmlbox">${plan.formula.parts.map(p=>`
      <div>
        <div class="fpct" style="color:${c}">${esc(p.percent)}</div>
        <div class="flbl">${esc(p.label)}${p.desc?' — '+esc(p.desc):''}</div>
      </div>`).join('')}</div>` : '';
  const weeks = plan.weeks && plan.weeks.length ? `
    <div class="slbl">Тижнева дорога</div>
    ${plan.weeks.map(w=>`
      <div class="wkcard">
        <div class="wkg">
          <div class="wkn" style="background:#111">
            <div class="wknum" style="color:${c}">${esc(w.num)}</div>
            <div class="wkname">${esc(w.name)}</div>
          </div>
          <div class="wkc">
            <div class="wkf">${esc(w.focus)}</div>
            <ul class="wki">${(w.items||[]).map(i=>`<li>${esc(i)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>`).join('')}` : '';
  const blockers = plan.strategy_per_blocker && plan.strategy_per_blocker.length ? `
    <div class="slbl">Стратегії під твої блокери</div>
    ${plan.strategy_per_blocker.map(b=>`
      <div class="card">
        <div style="font-size:14px;font-weight:700;color:${c};margin-bottom:6px">${esc(b.blocker)}</div>
        <div style="font-size:14px;line-height:1.6;color:var(--ink2)">${esc(b.advice)}</div>
      </div>`).join('')}` : '';
  const prompts = plan.quick_prompts && plan.quick_prompts.length ? `
    <div class="slbl">Швидкі ШІ-промпти під твою нішу</div>
    <div class="chips" style="margin-bottom:18px">${plan.quick_prompts.map(p=>`<div class="chip" onclick="askAiFromDash(${jsArg(p.text)})">${esc(p.label)}</div>`).join('')}</div>` : '';

  return `<div class="sec">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:8px">
      <div class="slbl" style="margin:0">Твій персональний план</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-out btn-sm" onclick="regenerateMentorPlan()">↻ Перегенерувати</button>
      </div>
    </div>
    ${positioning}
    ${thisWeek}
    ${pillars}
    ${formula}
    ${weeks}
    ${blockers}
    ${prompts}
  </div>`;
}

async function getProfileContext() {
  const p = await dbProfile();
  // Base persona: Supabase profile's ai_context > hardcoded USERS entry > empty
  const baseCtx = p?.ai_context || USERS[CU]?.aiCtx || '';
  if (!p) return baseCtx;
  const BLK = Object.fromEntries(PROFILE_BLOCKERS.map(b=>[b.v,b.l]));
  const NDS = Object.fromEntries(PROFILE_NEEDS.map(b=>[b.v,b.l]));
  const FE = {'<6m':'менше 6 місяців','6m-1y':'6 місяців – 1 рік','1-3y':'1–3 роки','3-5y':'3–5 років','5+':'5+ років'};
  const HB = {yes:'так, веде',planning:'планує почати',no:'не веде і не планує'};
  const BT = {personal:'особистий — лайфстайл, інтереси, не про професію',professional:'професійний — про роботу/експертизу',expert:'професійний — про роботу/експертизу',lifestyle:'особистий — лайфстайл',mixed:'професійний — про роботу/експертизу'};
  const HRS = {'<2':'до 2 год','2-5':'2–5 год','5-10':'5–10 год','10-20':'10–20 год','20+':'20+ год'};
  const MON = {no:'без монетизації',planning:'планує монетизацію',partial:'частково монетизує',main:'основний дохід'};
  const G = {f:'жіночий рід',m:'чоловічий рід',n:'нейтральний рід'};
  let s = '\n\nКОНТЕКСТ КОРИСТУВАЧА:';
  if (p.gender) s += `\n- Звертайся у ${G[p.gender]||'нейтральний рід'}`;
  if (p.profession) s += `\n- Професія / основна діяльність: ${p.profession}`;
  if (p.field_experience) s += `\n- Досвід у цій сфері: ${FE[p.field_experience]||p.field_experience}`;
  if (p.has_blog) s += `\n- Блог: ${HB[p.has_blog]||p.has_blog}`;
  if (p.blog_type) s += `\n- Тип блогу: ${BT[p.blog_type]||p.blog_type}`;
  if (p.blog_topic || p.niche) s += `\n- Тема блогу: ${p.blog_topic || p.niche}`;
  if (p.blog_experience) s += `\n- Досвід ведення блогу: ${FE[p.blog_experience]||p.blog_experience}`;
  if (p.hours_per_week) s += `\n- Готовий_а приділяти блогу: ${HRS[p.hours_per_week]||p.hours_per_week} на тиждень`;
  const blockersList = [];
  if (p.blockers && p.blockers.length) blockersList.push(...p.blockers.map(b=>BLK[b]||b));
  if (p.blockers_other) blockersList.push(p.blockers_other);
  if (blockersList.length) s += `\n- Блокери: ${blockersList.join(', ')}`;
  const needsList = [];
  if (p.needs && p.needs.length) needsList.push(...p.needs.map(n=>NDS[n]||n));
  if (p.needs_other) needsList.push(p.needs_other);
  if (needsList.length) s += `\n- Потрібна допомога з: ${needsList.join(', ')}`;
  if (p.monetization) s += `\n- Монетизація: ${MON[p.monetization]||p.monetization}`;
  if (p.goals) s += `\n- Цілі: ${p.goals}`;
  if ((p.blog_type === 'personal' || p.blog_type === 'lifestyle') && p.profession) {
    s += `\n\nВАЖЛИВО: блог особистий — НЕ давай порад через призму професії "${p.profession}". Блог про життя, не про роботу.`;
  }
  return baseCtx + s;
}

async function renderHome() {
  checkProfileNudge();
  const selected = getDashSelection();
  let savedOrder = null;
  try { savedOrder = JSON.parse(localStorage.getItem('kishkas-dashboard-order-'+CU) || 'null'); } catch{}
  let order;
  if (Array.isArray(savedOrder)) {
    order = [...savedOrder.filter(id => selected.includes(id)), ...selected.filter(id => !savedOrder.includes(id))];
  } else {
    order = DASHBOARD_WIDGETS.filter(w => selected.includes(w.id)).map(w => w.id);
  }
  const container = document.getElementById('dashboardWidgets');
  if (!order.length) {
    container.innerHTML = '<div style="color:var(--muted);font-size:14px;text-align:center;padding:40px 0;grid-column:1/-1">Дашборд пустий. Натисни «⚙ Налаштувати» щоб обрати віджети.</div>';
    return;
  }
  const renders = await Promise.all(order.map(id=>renderDashWidget(id)));
  container.innerHTML = renders.filter(Boolean).join('');
  if (order.includes('growth')) drawDashGrowth();
  initDashSortable();
  if (window.lucide) window.lucide.createIcons();
}

function initDashSortable() {
  const container = document.getElementById('dashboardWidgets');
  if (!container || !window.Sortable) return;
  if (window._dashSortable) window._dashSortable.destroy();
  window._dashSortable = new Sortable(container, {
    animation: 200,
    ghostClass: 'dash-drag-ghost',
    chosenClass: 'dash-drag-chosen',
    handle: '.dash-block-title',
    onEnd: function() {
      try {
        const order = Array.from(container.querySelectorAll('.dash-block')).map(b => b.dataset.widget);
        const key = 'kishkas-dashboard-order-'+CU;
        localStorage.setItem(key, JSON.stringify(order));
        console.log('[dashboard] saved order', order, '| CU:', CU, '| key:', key);
      } catch(e) { console.warn('order save failed', e); }
    }
  });
}

async function renderDashWidget(id) {
  switch(id) {
    case 'streak':     return await widgetStreak();
    case 'goals':      return await widgetGoals();
    case 'stats':      return await widgetStats();
    case 'growth':     return await widgetGrowth();
    case 'notes':      return await widgetNotes();
    case 'reflectDay': return widgetReflectDay();
    case 'checklist':  return widgetChecklist();
    case 'audience':   return await widgetAudience();
    case 'aiChips':    return widgetAiChips();
    default:           return '';
  }
}

async function widgetStreak() {
  const days = await dbStreakDays();
  const { current, max } = computeStreak(days);
  const today = new Date().toISOString().slice(0,10);
  const marked = days.includes(today);
  const body = `<div class="streak-row">
      <div><div class="sv streak-big">${current}</div><div class="sl">днів підряд</div></div>
      <div><div class="sv streak-small">${max}</div><div class="sl">рекорд</div></div>
    </div>
    ${marked
      ? '<div style="font-size:13px;color:var(--muted)">✓ Сьогодні відмічено</div>'
      : '<button class="btn btn-ac btn-sm" onclick="event.stopPropagation();markPostedToday().then(renderHome)">+ Я опублікувала сьогодні</button>'}`;
  return blk('streak', body);
}

async function widgetGoals() {
  const goals = await dbGoals();
  if (!goals.length) return '';
  const stats = await dbStats();
  const last = stats[stats.length-1] || {};
  const body = goals.map(g=>{
    const cur=last[g.network]||0, pct=g.target>0?Math.min(100,Math.round(cur/g.target*100)):0;
    return `<div class="goal-row">
      <div class="goal-head"><strong style="font-size:14px">${g.network==='ig'?'Instagram':g.network==='tt'?'TikTok':g.network==='tg'?'Telegram':'YouTube'}: ${esc(cur)}/${esc(g.target)}</strong></div>
      <div class="goal-bar"><div class="goal-fill" style="width:${pct}%;background:${WIDGET_BY_ID.goals.color}"></div></div>
      <div class="goal-meta">${pct}%${g.deadline?` · до ${esc(g.deadline)}`:''}</div>
    </div>`;
  }).join('');
  return blk('goals', body, {fn:"goTab('stats')", label:'Управління →'});
}

async function widgetStats() {
  const stats = await dbStats();
  const platforms = getPlatforms();
  if (!stats.length) {
    return blk('stats', '<div style="color:var(--muted);font-size:14px">Ще немає даних. Додай перший місяць →</div>', {fn:"goTab('stats')", label:'Додати →'});
  }
  const last=stats[stats.length-1], prev=stats.length>1?stats[stats.length-2]:null;
  const chg=(a,b,k)=>{ if(!b) return ''; const d=(a[k]||0)-(b[k]||0); return d>0?`<div class="schg cup">+${d}</div>`:d<0?`<div class="schg cdn">${d}</div>`:`<div class="schg cfl">без змін</div>`; };
  const allCards = [
    platforms.includes('ig') && {k:'ig',l:'Instagram'},
    platforms.includes('tt') && {k:'tt',l:'TikTok'},
    platforms.includes('tg') && {k:'tg',l:'Telegram'},
    platforms.includes('yt') && {k:'yt',l:'YouTube'},
    platforms.includes('ig') && {k:'posts',l:'Постів IG'},
    platforms.includes('ig') && {k:'reach',l:'Охоплення'},
  ].filter(Boolean);
  const body = `<div style="font-size:13px;color:var(--muted);margin-bottom:10px">${esc(last.month)} ${esc(last.year)}</div>
    <div class="scards">${allCards.map(s=>`<div class="scard"><div class="sv">${esc(last[s.k]||0)}</div><div class="sl">${s.l}</div>${chg(last,prev,s.k)}</div>`).join('')}</div>`;
  return blk('stats', body, {fn:"goTab('stats')", label:'Детальніше →'});
}

async function widgetGrowth() {
  const stats = await dbStats();
  if (stats.length < 2) return '';
  return blk('growth', '<canvas id="dashGrowthCanvas" height="80"></canvas>', {fn:"goTab('stats')", label:'Графіки →'});
}

async function drawDashGrowth() {
  const canvas = document.getElementById('dashGrowthCanvas');
  if (!canvas) return;
  const stats = await dbStats();
  const platforms = getPlatforms();
  if (charts['dashGrowth']) charts['dashGrowth'].destroy();
  const PLAT_COLORS = {ig:'#FF6B9D', tt:'#003a80', tg:'#0088CC', yt:'#FF0000'};
  const PLAT_NAMES = {ig:'IG', tt:'TT', tg:'TG', yt:'YT'};
  charts['dashGrowth'] = new Chart(canvas.getContext('2d'), {
    type:'line',
    data:{labels:stats.map(m=>m.month.substring(0,3)),datasets: platforms.map(p => ({
      label: PLAT_NAMES[p],
      data: stats.map(m => m[p] || 0),
      borderColor: PLAT_COLORS[p],
      backgroundColor: PLAT_COLORS[p] + '14',
      tension: .4, fill: true,
    }))},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,display:false},x:{display:true,ticks:{font:{size:10}}}}}
  });
}

async function widgetNotes() {
  const notes = await dbNotes();
  if (!notes.length) {
    return blk('notes', '<div style="color:var(--muted);font-size:14px">Нотаток ще немає.</div>', {fn:"goTab('notes')", label:'Створити →'});
  }
  const body = notes.slice(0,3).map(n=>`<div class="nitem" onclick="event.stopPropagation();goTab('notes')" style="margin-bottom:8px">
    <div class="ndt">${n.created_at?new Date(n.created_at).toLocaleDateString('uk-UA'):esc(n.date)}</div>
    <div class="nttl">${esc(n.title||'Без назви')}</div>
    <div class="nprv">${esc(n.content||n.text)}</div>
  </div>`).join('');
  return blk('notes', body, {fn:"goTab('notes')", label:'Всі →'});
}

function widgetReflectDay() {
  const pool = REFLECT_QS[CU] || REFLECT_QS.default || [];
  if (!pool.length) return '';
  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0).getTime()) / 86400000);
  const q = pool[dayIdx % pool.length];
  const body = `<div class="rqcat" style="color:${WIDGET_BY_ID.reflectDay.color}">${q.cat}</div>
    <div class="rqtxt" style="font-size:15px">${q.q}</div>`;
  return blk('reflectDay', body, {fn:"goTab('reflect')", label:'Всі →'});
}

function widgetChecklist() {
  const state = lload('checklist-state', {});
  const done = Object.values(state).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  const pct = total>0 ? (done/total)*100 : 0;
  const body = `<div style="font-size:36px;font-weight:700;line-height:1;margin-bottom:6px;color:${WIDGET_BY_ID.checklist.color}">${done}<span style="font-size:18px;opacity:.5">/${total}</span></div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:10px">пунктів готово</div>
    <div class="goal-bar"><div class="goal-fill" style="width:${pct}%;background:${WIDGET_BY_ID.checklist.color}"></div></div>`;
  return blk('checklist', body, {fn:"goTab('stats')", label:'Повний →'});
}

async function widgetAudience() {
  const a = await dbAudience();
  if (!a || !a.ai_result) return '';
  const preview = a.ai_result.slice(0,280) + (a.ai_result.length > 280 ? '...' : '');
  const body = `<div style="font-size:13px;color:var(--ink2);line-height:1.6;white-space:pre-wrap">${esc(preview)}</div>`;
  return blk('audience', body, {fn:"goTab('stats')", label:'Повний →'});
}

function widgetAiChips() {
  const u = USERS[CU];
  if (!u.chips) return '';
  const body = `<div class="chips" style="margin-bottom:0">${u.chips.map((c,i)=>`<div class="chip" onclick="event.stopPropagation();askAiFromDash(${JSON.stringify(u.chipTexts[i])})">${c}</div>`).join('')}</div>`;
  return blk('aiChips', body);
}

function askAiFromDash(text) {
  goTab('ai');
  setTimeout(() => {
    const el = document.getElementById('aiq');
    if (!el) return;
    el.value = text;
    sendChat();
  }, 150);
}

// ══════════════════════════════════════════
// NOTES
// ══════════════════════════════════════════
async function loadNotes() {
  const notes = await dbNotes();
  const list = document.getElementById('nlist');
  list.innerHTML = !notes.length
    ? '<div style="color:var(--muted);font-size:14px">Нотаток ще немає</div>'
    : notes.map(n=>`<div class="nitem${curNoteId===n.id?' on':''}" onclick="openNote(${jsArg(n.id)})">
        <button class="ndel" onclick="event.stopPropagation();delNoteById(${jsArg(n.id)})">✕</button>
        <div class="ndt">${n.created_at ? new Date(n.created_at).toLocaleDateString('uk-UA') : esc(n.date)}</div>
        <div class="nttl">${esc(n.title||'Без назви')}</div>
        <div class="nprv">${esc(n.content||n.text)}</div></div>`).join('');
}

function newNote() {
  if (!requireAuth()) return;
  curNoteId = '__new__';
  document.getElementById('nttl').value = '';
  document.getElementById('ntxt').value = '';
  document.getElementById('ndelBtn').style.display = 'none';
  document.getElementById('note-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('nttl').focus(), 100);
}

async function openNote(id) {
  const notes = await dbNotes();
  const n = notes.find(x=>x.id===id);
  if (!n) return;
  curNoteId = id;
  document.getElementById('nttl').value = n.title||'';
  document.getElementById('ntxt').value = n.content||n.text||'';
  document.getElementById('ndelBtn').style.display = 'inline-flex';
  document.getElementById('note-modal').style.display = 'flex';
}

async function saveNote() {
  if (!requireAuth()) return;
  const titleEl = document.getElementById('nttl');
  const title = titleEl.value.trim();
  if (!title) {
    titleEl.classList.remove('input-error');
    void titleEl.offsetWidth; // restart animation
    titleEl.classList.add('input-error');
    titleEl.focus();
    titleEl.addEventListener('input', () => titleEl.classList.remove('input-error'), { once: true });
    return;
  }
  const content = document.getElementById('ntxt').value;
  const note = curNoteId === '__new__'
    ? { id: Date.now().toString(), title, content, date: new Date().toLocaleDateString('uk-UA'), _new: true }
    : { id: curNoteId, title, content };
  await dbSaveNote(note);
  closeNote();
  renderHome();
  showToast('✓ Збережено', 'success');
}

function delNoteById(id) {
  if (!requireAuth()) return;
  showConfirm({
    title: 'Видалити нотатку?',
    desc: 'Це не можна скасувати.',
    yesText: 'Так, видалити',
    onYes: async () => {
      await dbDelNote(id);
      if (curNoteId === id) closeNote();
      await loadNotes();
      renderHome();
    }
  });
}

function delNote() {
  if (!curNoteId) return;
  delNoteById(curNoteId);
}


function closeNote() {
  curNoteId = null;
  document.getElementById('note-modal').style.display = 'none';
  loadNotes();
}

// ══════════════════════════════════════════
// STATS
// ══════════════════════════════════════════
const PLATFORMS_AVAILABLE = [
  {id:'ig', name:'Instagram', emoji:'📷', color:'#FF6B9D'},
  {id:'tt', name:'TikTok',    emoji:'🎵', color:'#003a80'},
  {id:'tg', name:'Telegram',  emoji:'✈️', color:'#0088CC'},
  {id:'yt', name:'YouTube',   emoji:'📺', color:'#FF0000'},
];

function getPlatforms() {
  const saved = localStorage.getItem('kishkas-platforms-'+CU);
  if (saved) { try { return JSON.parse(saved); } catch{} }
  return ['ig','tt'];
}

function setPlatforms(arr) {
  localStorage.setItem('kishkas-platforms-'+CU, JSON.stringify(arr));
}

function togglePlatform(id) {
  const p = getPlatforms();
  const i = p.indexOf(id);
  if (i >= 0) p.splice(i,1); else p.push(id);
  setPlatforms(p);
  applyPlatformVisibility();
  applyBaselinePlatformVisibility();
  renderBaseline();
  loadStats();
  renderCharts();
  renderHome();
}

function renderPlatformChips() {
  const enabled = getPlatforms();
  const el = document.getElementById('platformChips');
  if (!el) return;
  el.innerHTML = PLATFORMS_AVAILABLE.map(p =>
    `<button class="platform-chip ${enabled.includes(p.id)?'on':''}" onclick="togglePlatform('${p.id}')">${p.emoji} ${p.name}</button>`
  ).join('');
}

function applyPlatformVisibility() {
  const enabled = getPlatforms();
  PLATFORMS_AVAILABLE.forEach(p => {
    const sec = document.getElementById(p.id + '-section');
    if (sec) sec.style.display = enabled.includes(p.id) ? '' : 'none';
    const chartBox = document.getElementById('cb-' + p.id);
    if (chartBox) chartBox.style.display = enabled.includes(p.id) ? '' : 'none';
  });
  const anyEnabled = enabled.length > 0;
  const cbFol = document.getElementById('cb-fol');
  const cbGrowth = document.getElementById('cb-growth');
  if (cbFol) cbFol.style.display = anyEnabled ? '' : 'none';
  if (cbGrowth) cbGrowth.style.display = anyEnabled ? '' : 'none';
  renderPlatformChips();
}

let editingMonthId = null;

const STAT_FORM_IDS = ['stig','sttt','sttv','sttviews','sttg','sttgp','sttgv','styt','stytv','styts','stytviews','stp','sts','str','streach','stnote'];

function clearStatForm() {
  STAT_FORM_IDS.forEach(id => { const el = document.getElementById(id); if (el) el.value=''; });
}

async function loadStats() {
  const stats = await dbStats();
  const platforms = getPlatforms();
  document.getElementById('chartsec').style.display = stats.length ? 'block' : 'none';
  document.getElementById('mlist').innerHTML = !stats.length
    ? '<div style="color:var(--muted);font-size:14px">Місяців ще немає</div>'
    : [...stats].reverse().map(m=>`<div class="mrow">
        <div><div class="mn">${esc(m.month)} ${esc(m.year)}</div>${m.note?`<div class="mm">${esc(m.note.substring(0,60))}${m.note.length>60?'...':''}</div>`:''}</div>
        <div class="mbadges">
          ${platforms.includes('ig')?`<span class="mbadge">IG ${esc(m.ig||0)}</span>`:''}
          ${platforms.includes('tt')?`<span class="mbadge">TT ${esc(m.tt||0)}</span>`:''}
          ${platforms.includes('tg')?`<span class="mbadge">TG ${esc(m.tg||0)}</span>`:''}
          ${platforms.includes('yt')?`<span class="mbadge">YT ${esc(m.yt||0)}</span>`:''}
          <button class="btn btn-out btn-sm" onclick="editMonth(${jsArg(m.id)})">✎</button>
          <button class="btn btn-red btn-sm" onclick="delMonthById(${jsArg(m.id)})">✕</button>
        </div></div>`).join('');
}

async function editMonth(id) {
  const stats = await dbStats();
  const m = stats.find(s => String(s.id) === String(id));
  if (!m) return;
  editingMonthId = id;
  document.getElementById('stmo').value = m.month;
  document.getElementById('styr').value = m.year;
  document.getElementById('stig').value = m.ig || '';
  document.getElementById('stp').value = m.posts || '';
  document.getElementById('sts').value = m.stories || '';
  document.getElementById('str').value = m.reels || '';
  document.getElementById('streach').value = m.reach || '';
  document.getElementById('sttt').value = m.tt || '';
  document.getElementById('sttv').value = m.tt_videos || '';
  document.getElementById('sttviews').value = m.tt_views || '';
  document.getElementById('sttg').value = m.tg || '';
  document.getElementById('sttgp').value = m.tg_posts || '';
  document.getElementById('sttgv').value = m.tg_views || '';
  document.getElementById('styt').value = m.yt || '';
  document.getElementById('stytv').value = m.yt_videos || '';
  document.getElementById('styts').value = m.yt_shorts || '';
  document.getElementById('stytviews').value = m.yt_views || '';
  document.getElementById('stnote').value = m.note || '';
  document.getElementById('statFormTitle').textContent = `✎ Редагування: ${m.month} ${m.year}`;
  document.getElementById('statcancelbtn').style.display = '';
  window.scrollTo({top: document.querySelector('#stmo').closest('.card').offsetTop - 80, behavior:'smooth'});
}

function cancelEditMonth() {
  editingMonthId = null;
  clearStatForm();
  document.getElementById('statFormTitle').textContent = '+ Новий місяць';
  document.getElementById('statcancelbtn').style.display = 'none';
}

async function addMonth() {
  if (!requireAuth()) return;
  const n = id => parseInt(document.getElementById(id).value) || 0;
  const entry = {
    id: editingMonthId || Date.now().toString(),
    month: document.getElementById('stmo').value,
    year: parseInt(document.getElementById('styr').value),
    ig: n('stig'),
    posts: n('stp'), stories: n('sts'), reels: n('str'), reach: n('streach'),
    tt: n('sttt'), tt_videos: n('sttv'), tt_views: n('sttviews'),
    tg: n('sttg'), tg_posts: n('sttgp'), tg_views: n('sttgv'),
    yt: n('styt'), yt_videos: n('stytv'), yt_shorts: n('styts'), yt_views: n('stytviews'),
    note: document.getElementById('stnote').value,
  };
  await dbSaveStat(entry);
  await loadStats();
  renderCharts();
  renderHome();
  cancelEditMonth();
  alert('Збережено ✓');
}

function delMonthById(id) {
  if (!requireAuth()) return;
  showConfirm({
    title: 'Видалити місяць?',
    desc: 'Статистику за цей місяць буде видалено.',
    yesText: 'Видалити',
    onYes: async () => {
      await dbDelStat(id);
      if (editingMonthId === id) cancelEditMonth();
      await loadStats();
      renderCharts();
      renderHome();
    }
  });
}

async function renderCharts() {
  const stats = await dbStats();
  if (!stats.length) return;
  const platforms = getPlatforms();
  const labels = stats.map(m=>m.month.substring(0,3)+' '+m.year);
  ['chfol','chgrowth','ch-ig','ch-tt','ch-tg','ch-yt'].forEach(id=>{ if(charts[id]) charts[id].destroy(); });

  const PLAT_COLORS = {ig:'#FF6B9D', tt:'#003a80', tg:'#0088CC', yt:'#FF0000'};
  const PLAT_NAMES = {ig:'Instagram', tt:'TikTok', tg:'Telegram', yt:'YouTube'};

  // Followers — combined line
  const folDs = platforms.map(p => ({
    label: PLAT_NAMES[p],
    data: stats.map(m => m[p] || 0),
    borderColor: PLAT_COLORS[p],
    backgroundColor: PLAT_COLORS[p] + '14',
    tension: 0.4, fill: true,
  }));
  if (folDs.length) charts['chfol']=new Chart(document.getElementById('chfol').getContext('2d'),{
    type:'line', data:{labels,datasets:folDs},
    options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true}}}
  });

  // Growth — combined bar
  const colorBars = (arr, pos, neg) => arr.map(v => v==null ? 'transparent' : v>=0 ? pos : neg);
  const growDs = platforms.map(p => {
    const delta = stats.map((m,i)=>i>0?(m[p]||0)-(stats[i-1][p]||0):null);
    return {label: PLAT_NAMES[p], data: delta, backgroundColor: colorBars(delta,'rgba(34,197,94,.7)','rgba(220,38,38,.7)')};
  });
  if (growDs.length) charts['chgrowth']=new Chart(document.getElementById('chgrowth').getContext('2d'),{
    type:'bar', data:{labels,datasets:growDs},
    options:{responsive:true,plugins:{legend:{position:'bottom'}}}
  });

  // IG activity + reach (dual axis)
  if (platforms.includes('ig')) charts['ch-ig']=new Chart(document.getElementById('ch-ig').getContext('2d'),{
    data:{labels,datasets:[
      {type:'bar', label:'Пости',data:stats.map(m=>m.posts||0),backgroundColor:'rgba(255,107,157,.75)',yAxisID:'y'},
      {type:'bar', label:'Сторіс',data:stats.map(m=>m.stories||0),backgroundColor:'rgba(255,160,190,.7)',yAxisID:'y'},
      {type:'bar', label:'Reels',data:stats.map(m=>m.reels||0),backgroundColor:'rgba(108,92,231,.7)',yAxisID:'y'},
      {type:'line', label:'Охоплення',data:stats.map(m=>m.reach||0),borderColor:'#FF6B9D',backgroundColor:'transparent',yAxisID:'y1',tension:.4},
    ]},
    options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{
      y:{beginAtZero:true,position:'left',title:{display:true,text:'Публікації'}},
      y1:{beginAtZero:true,position:'right',grid:{drawOnChartArea:false},title:{display:true,text:'Охоплення'}}
    }}
  });

  // TT activity + views
  if (platforms.includes('tt')) charts['ch-tt']=new Chart(document.getElementById('ch-tt').getContext('2d'),{
    data:{labels,datasets:[
      {type:'bar', label:'Відео',data:stats.map(m=>m.tt_videos||0),backgroundColor:'rgba(0,58,128,.75)',yAxisID:'y'},
      {type:'line', label:'Перегляди',data:stats.map(m=>m.tt_views||0),borderColor:'#003a80',backgroundColor:'transparent',yAxisID:'y1',tension:.4},
    ]},
    options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{
      y:{beginAtZero:true,position:'left',title:{display:true,text:'Відео'}},
      y1:{beginAtZero:true,position:'right',grid:{drawOnChartArea:false},title:{display:true,text:'Перегляди'}}
    }}
  });

  // TG posts + avg views
  if (platforms.includes('tg')) charts['ch-tg']=new Chart(document.getElementById('ch-tg').getContext('2d'),{
    data:{labels,datasets:[
      {type:'bar', label:'Постів',data:stats.map(m=>m.tg_posts||0),backgroundColor:'rgba(0,136,204,.75)',yAxisID:'y'},
      {type:'line', label:'Середні перегляди',data:stats.map(m=>m.tg_views||0),borderColor:'#0088CC',backgroundColor:'transparent',yAxisID:'y1',tension:.4},
    ]},
    options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{
      y:{beginAtZero:true,position:'left',title:{display:true,text:'Постів'}},
      y1:{beginAtZero:true,position:'right',grid:{drawOnChartArea:false},title:{display:true,text:'Перегляди'}}
    }}
  });

  // YT videos + shorts + views
  if (platforms.includes('yt')) charts['ch-yt']=new Chart(document.getElementById('ch-yt').getContext('2d'),{
    data:{labels,datasets:[
      {type:'bar', label:'Відео',data:stats.map(m=>m.yt_videos||0),backgroundColor:'rgba(255,0,0,.7)',yAxisID:'y'},
      {type:'bar', label:'Shorts',data:stats.map(m=>m.yt_shorts||0),backgroundColor:'rgba(255,120,120,.65)',yAxisID:'y'},
      {type:'line', label:'Перегляди',data:stats.map(m=>m.yt_views||0),borderColor:'#FF0000',backgroundColor:'transparent',yAxisID:'y1',tension:.4},
    ]},
    options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{
      y:{beginAtZero:true,position:'left',title:{display:true,text:'Відео'}},
      y1:{beginAtZero:true,position:'right',grid:{drawOnChartArea:false},title:{display:true,text:'Перегляди'}}
    }}
  });

  applyPlatformVisibility();
}

// ══════════════════════════════════════════
// AI CHAT
// ══════════════════════════════════════════
function setChip(el, text) {
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('aiq').value = text;
}

function addMsg(role, text) {
  const u = USERS[CU];
  const wrap = document.getElementById('chatw');
  const div = document.createElement('div');
  div.className = 'chatm' + (role==='user'?' u':'');
  div.innerHTML = `<div class="chatav">${role==='user'?u.emoji:'🤖'}</div><div class="chatb">${esc(text)}</div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  return div.querySelector('.chatb');
}

// ──────────────────────────────────────────
// CHAT — multi-conversation
// ──────────────────────────────────────────
let currentChatId = null;

async function dbChats() {
  if (!sbUser) return lload('chats', []);
  const { data } = await sb.from('chats')
    .select('*').eq('user_id', sbUser.id)
    .order('updated_at', { ascending: false });
  return data || [];
}

async function dbCreateChat(title, messages) {
  if (!sbUser) {
    const list = lload('chats', []);
    const c = { id: 'lc-'+Date.now(), title, messages, updated_at: new Date().toISOString() };
    list.unshift(c);
    lsave('chats', list);
    return c;
  }
  const { data } = await sb.from('chats')
    .insert({ user_id: sbUser.id, title, messages })
    .select();
  return data?.[0];
}

async function dbUpdateChat(id, patch) {
  if (!sbUser) {
    const list = lload('chats', []);
    const i = list.findIndex(c => String(c.id) === String(id));
    if (i >= 0) { Object.assign(list[i], patch, { updated_at: new Date().toISOString() }); lsave('chats', list); }
    return;
  }
  await sb.from('chats').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
}

async function dbDelChat(id) {
  if (!sbUser) { lsave('chats', lload('chats', []).filter(c => String(c.id) !== String(id))); return; }
  await sb.from('chats').delete().eq('id', id);
}

function renderChatMessages() {
  const u = USERS[CU];
  const wrap = document.getElementById('chatw');
  if (!chatHistory.length) {
    wrap.innerHTML = '<div class="chatm"><div class="chatav">🤖</div><div class="chatb">Привіт! Я твій ШІ-помічник. Чим допомогти?</div></div>';
    return;
  }
  wrap.innerHTML = chatHistory.map(m => {
    const av = m.role === 'user' ? u.emoji : '🤖';
    const cls = 'chatm' + (m.role === 'user' ? ' u' : '');
    return `<div class="${cls}"><div class="chatav">${av}</div><div class="chatb">${esc(m.content)}</div></div>`;
  }).join('');
  wrap.scrollTop = wrap.scrollHeight;
}

function relativeDay(iso) {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const yest = new Date(today); yest.setDate(today.getDate()-1);
  const dStart = new Date(d); dStart.setHours(0,0,0,0);
  if (dStart.getTime() === today.getTime()) return 'Сьогодні';
  if (dStart.getTime() === yest.getTime()) return 'Вчора';
  const days = Math.floor((today - dStart) / 86400000);
  if (days < 7) return days + ' дн. тому';
  return d.toLocaleDateString('uk-UA');
}

async function renderChatList() {
  const list = await dbChats();
  const el = document.getElementById('chatList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<div class="chat-list-empty">Жодного чату ще немає</div>';
    return;
  }
  // Group by day
  const groups = {};
  list.forEach(c => {
    const day = relativeDay(c.updated_at || c.created_at || new Date().toISOString());
    (groups[day] = groups[day] || []).push(c);
  });
  el.innerHTML = Object.entries(groups).map(([day, chats]) => `
    <div class="chat-list-day">${day}</div>
    ${chats.map(c => `<div class="chat-list-item ${String(c.id)===String(currentChatId)?'active':''}" onclick="loadChat(${jsArg(c.id)})">
      <span class="chat-list-title">${esc(c.title || 'Без назви')}</span>
      <button class="chat-list-del" onclick="event.stopPropagation();deleteChatById(${jsArg(c.id)})" title="Видалити чат">×</button>
    </div>`).join('')}
  `).join('');
}

async function deleteChatById(id) {
  await dbDelChat(id);
  if (String(currentChatId) === String(id)) {
    currentChatId = null;
    chatHistory = [];
    document.getElementById('chatTitle').textContent = 'Новий чат';
    document.getElementById('delChatBtn').style.display = 'none';
    document.getElementById('renameChatBtn').style.display = 'none';
    renderChatMessages();
  }
  renderChatList();
}

async function loadChat(id) {
  const list = await dbChats();
  const c = list.find(x => String(x.id) === String(id));
  if (!c) return;
  currentChatId = c.id;
  chatHistory = Array.isArray(c.messages) ? c.messages.slice() : [];
  document.getElementById('chatTitle').textContent = c.title || 'Без назви';
  document.getElementById('delChatBtn').style.display = '';
  document.getElementById('renameChatBtn').style.display = '';
  renderChatMessages();
  renderChatList();
  toggleChatSidebar(false);
}

function newChat() {
  currentChatId = null;
  chatHistory = [];
  document.getElementById('chatTitle').textContent = 'Новий чат';
  document.getElementById('delChatBtn').style.display = 'none';
  document.getElementById('renameChatBtn').style.display = 'none';
  renderChatMessages();
  renderChatList();
  toggleChatSidebar(false);
  document.getElementById('aiq').focus();
}

async function renameCurrentChat() {
  if (!currentChatId) return;
  const cur = document.getElementById('chatTitle').textContent;
  const t = prompt('Нова назва чату:', cur);
  if (!t) return;
  await dbUpdateChat(currentChatId, { title: t.trim() });
  document.getElementById('chatTitle').textContent = t.trim();
  renderChatList();
}

function deleteCurrentChat() {
  if (!currentChatId) return;
  showConfirm({
    icon: '💬',
    title: 'Видалити чат?',
    desc: 'Всі повідомлення будуть видалені назавжди.',
    yesText: 'Так, видалити',
    onYes: async () => { await dbDelChat(currentChatId); newChat(); }
  });
}

function toggleChatSidebar(forceState) {
  const sb = document.getElementById('chatSidebar');
  const bd = document.getElementById('chatSidebarBackdrop');
  if (!sb) return;
  const willOpen = forceState !== undefined ? forceState : !sb.classList.contains('open');
  sb.classList.toggle('open', willOpen);
  bd.classList.toggle('open', willOpen);
}

async function sendChat() {
  const q = document.getElementById('aiq').value.trim();
  if (!q) return;
  if (!sbUser) {
    document.getElementById('aiq').value = '';
    addMsg('user', q);
    const el = addMsg('ai', '');
    el.innerHTML = '🔒 ШІ-чат доступний тільки зареєстрованим користувачам.<br><br><button onclick="document.getElementById(\'auth-screen\').style.display=\'flex\';document.getElementById(\'app\').style.display=\'none\'" style="background:var(--ac);color:#fff;border:none;padding:8px 16px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Зареєструватись →</button>';
    return;
  }
  document.getElementById('aiq').value = '';
  document.getElementById('aist').textContent = '⏳';
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));

  chatHistory.push({role:'user',content:q});
  if (chatHistory.length === 1) renderChatMessages(); else addMsg('user', q);

  const stats = await dbStats();
  let statCtx = '';
  if (stats.length) {
    const last=stats[stats.length-1];
    const prev=stats.length>1?stats[stats.length-2]:null;
    statCtx=`\n\nСТАТИСТИКА (${last.month} ${last.year}): IG:${last.ig||0} TT:${last.tt||0} TG:${last.tg||0} YT:${last.yt||0} Пости:${last.posts||0} Сторіс:${last.stories||0} Reels:${last.reels||0} Охоплення:${last.reach||0}${last.note?'\nНотатка: '+last.note:''}${prev?`\nПопередній (${prev.month} ${prev.year}): IG:${prev.ig||0} TT:${prev.tt||0}`:''}`;
  }

  const profileCtx = await getProfileContext();
  const sys = `Ти — досвідчений SMM-наставник для контент-творців. Відповідай українською мовою. Будь конкретним, практичним, дружнім. До 400 слів.\n\n${profileCtx}${statCtx}`;

  const bubbleEl = addMsg('ai', '...');
  bubbleEl.textContent = '';

  let reply = '';
  try {
    const res = await chatFetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1000, system:sys, messages:chatHistory })
    });
    const data = await res.json();
    reply = data.content?.find(b=>b.type==='text')?.text || 'Помилка отримання відповіді.';
    bubbleEl.textContent = reply;
    chatHistory.push({role:'assistant',content:reply});
    document.getElementById('aist').textContent = '✓';
    setTimeout(()=>document.getElementById('aist').textContent='',2000);
  } catch(e) {
    bubbleEl.textContent = chatErrorText(e, 'Помилка з\'єднання. Перевір інтернет.');
    document.getElementById('aist').textContent = '❌';
    return;
  }
  document.getElementById('chatw').scrollTop = 99999;

  // Persist to DB
  try {
    if (!currentChatId) {
      const title = q.length > 60 ? q.slice(0, 58) + '…' : q;
      const created = await dbCreateChat(title, chatHistory);
      if (created) {
        currentChatId = created.id;
        document.getElementById('chatTitle').textContent = title;
        document.getElementById('delChatBtn').style.display = '';
        document.getElementById('renameChatBtn').style.display = '';
      }
    } else {
      await dbUpdateChat(currentChatId, { messages: chatHistory });
    }
    renderChatList();
  } catch (e) { console.error('chat save', e); }
}

// ══════════════════════════════════════════
// REFLECTION
// ══════════════════════════════════════════
const REFLECT_QS = {
  default:[
    {q:'Що зняла цього тижня і навіть не думала що це може бути контент?',cat:'Контент'},
    {q:'Який пост або сторіс мені самій найбільше сподобались — і чому?',cat:'Контент'},
    {q:'Що в моєму житті ще не контент, але міг би стати?',cat:'Контент'},
    {q:'Який останній момент я зняла, але не виклала — і чому злякалась?',cat:'Контент'},
    {q:'Якби я могла знімати тільки один тип контенту — який це був би?',cat:'Контент'},

    {q:'Блокери ще є — але чи такі ж гучні як на початку?',cat:'Голова'},
    {q:'Коли мені найлегше знімати, а коли найважче? Що впливає?',cat:'Голова'},
    {q:'Що я не дозволяю собі сказати в контенті — і чому?',cat:'Голова'},
    {q:'Якщо чесно: я постю для себе чи для них?',cat:'Голова'},
    {q:'Що я отримаю, коли «дійду до 10к» — крім самих цифр?',cat:'Голова'},

    {q:'Що зайшло краще в статистиці цього тижня — і що це означає?',cat:'Ріст'},
    {q:'Що б я сказала собі місяць тому?',cat:'Ріст'},
    {q:'Які 3 пости/Reels мали найбільший engagement — що в них спільного?',cat:'Ріст'},
    {q:'Якби я мала проконсультувати себе як стороння — що б сказала найперше?',cat:'Ріст'},
    {q:'Що мене стримує робити більше того що вже працює?',cat:'Ріст'},

    {q:'Кому я писала останній пост — собі чи конкретній людині?',cat:'Аудиторія'},
    {q:'Хто моя «улюблена підписниця» — і що в неї спільного зі мною?',cat:'Аудиторія'},
    {q:'Що я знаю про свою аудиторію крім цифр?',cat:'Аудиторія'},
    {q:'Яка проблема моєї підписниці мені особисто близька?',cat:'Аудиторія'},

    {q:'Що в моєму контенті — я, а що «треба бо так роблять інші»?',cat:'Цінності'},
    {q:'Якби я знімала тільки те що ціную — що б це було?',cat:'Цінності'},
    {q:'Який тип контенту я ніколи не зніматиму — і чому це важливо?',cat:'Цінності'},

    {q:'Звідки прийшла моя остання ідея для контенту?',cat:'Творчість'},
    {q:'Що я зараз дивлюсь / читаю — і як це впливає на мій контент?',cat:'Творчість'},
    {q:'Що б я зняла, якби мені платили за процес, а не за результат?',cat:'Творчість'},
  ],

};
// Demo uses the same generic pool as everyone else
REFLECT_QS.demo = REFLECT_QS.default;

function pickReflectSet(user, n=4) {
  const pool = REFLECT_QS[user] || REFLECT_QS.default || [];
  if (pool.length <= n) return pool.map((_,i)=>i);
  const shuffled = pool.map((q,i)=>({q,i})).sort(()=>Math.random()-0.5);
  const picked = []; const usedCats = new Set();
  for (const item of shuffled) {
    if (!usedCats.has(item.q.cat)) {
      picked.push(item.i); usedCats.add(item.q.cat);
      if (picked.length === n) break;
    }
  }
  for (const item of shuffled) {
    if (picked.length === n) break;
    if (!picked.includes(item.i)) picked.push(item.i);
  }
  return picked;
}

function shuffleReflect() {
  const set = pickReflectSet(CU);
  localStorage.setItem('kishkas-reflect-set-'+CU, JSON.stringify(set));
  renderReflect();
}

function saveReflectAnswer(idx, text) {
  const key = 'kishkas-reflect-answers-'+CU;
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  if (text) data[idx] = text; else delete data[idx];
  localStorage.setItem(key, JSON.stringify(data));
  if (!sbUser) return;
  saveReflectAnswer._t = saveReflectAnswer._t || {};
  clearTimeout(saveReflectAnswer._t[idx]);
  saveReflectAnswer._t[idx] = setTimeout(async () => {
    const q = REFLECT_QS[CU]?.[idx]; if (!q) return;
    try {
      if (text) {
        const { data: existing } = await sb.from('reflections')
          .select('id').eq('user_id', sbUser.id).eq('question_idx', idx);
        if (existing && existing.length) {
          await sb.from('reflections').update({
            answer: text, category: q.cat, question_text: q.q,
            updated_at: new Date().toISOString()
          }).eq('id', existing[0].id);
        } else {
          await sb.from('reflections').insert({
            user_id: sbUser.id, question_idx: idx,
            answer: text, category: q.cat, question_text: q.q
          });
        }
      } else {
        await sb.from('reflections').delete()
          .eq('user_id', sbUser.id).eq('question_idx', idx);
      }
    } catch (e) { console.error('reflect save failed', e); }
  }, 700);
}

async function syncReflectFromSupabase() {
  if (!sbUser) return;
  const key = 'kishkas-reflect-answers-'+CU;
  const local = JSON.parse(localStorage.getItem(key) || '{}');
  const { data, error } = await sb.from('reflections')
    .select('question_idx, answer').eq('user_id', sbUser.id);
  if (error) { console.error('reflect load failed', error); return; }
  const remote = {};
  (data || []).forEach(r => { remote[r.question_idx] = r.answer; });
  for (const [idx, text] of Object.entries(local)) {
    if (text && remote[idx] === undefined) {
      const q = REFLECT_QS[CU]?.[idx];
      if (q) {
        try {
          await sb.from('reflections').insert({
            user_id: sbUser.id, question_idx: parseInt(idx),
            answer: text, category: q.cat, question_text: q.q
          });
          remote[idx] = text;
        } catch(e) { console.error('reflect migrate', e); }
      }
    }
  }
  localStorage.setItem(key, JSON.stringify(remote));
  if (document.getElementById('tab-reflect')?.classList.contains('on')) {
    renderReflect();
  }
}

function renderReflect() {
  const u = USERS[CU];
  const pool = REFLECT_QS[CU] || REFLECT_QS.default || [];
  let indices;
  if (u.reflectRotate) {
    const saved = localStorage.getItem('kishkas-reflect-set-'+CU);
    try { indices = saved ? JSON.parse(saved) : null; } catch(e) { indices = null; }
    if (!Array.isArray(indices) || indices.length === 0 || indices.some(i => !pool[i])) {
      indices = pickReflectSet(CU);
      localStorage.setItem('kishkas-reflect-set-'+CU, JSON.stringify(indices));
    }
  } else {
    indices = pool.map((_,i)=>i);
  }
  const answers = JSON.parse(localStorage.getItem('kishkas-reflect-answers-'+CU) || '{}');
  const shuffleBtn = u.reflectRotate
    ? `<div class="rqhead"><span class="rqcount">${indices.length} питань · оновлюється</span><button class="btn btn-out btn-sm" onclick="shuffleReflect()">↻ Інші питання</button></div>`
    : '';
  document.getElementById('reflectqs').innerHTML = shuffleBtn + indices.map(idx=>{
    const q = pool[idx]; if (!q) return '';
    const ans = esc(answers[idx]);
    const catBadge = u.reflectRotate ? `<div class="rqcat">${q.cat}</div>` : '';
    return `
      <div class="rqbox">
        ${catBadge}
        <div class="rqtxt">${q.q}</div>
        <label style="margin-bottom:5px;font-size:10px">Твоя відповідь</label>
        <textarea id="rq${idx}" oninput="saveReflectAnswer(${idx},this.value)" placeholder="Пиши чесно — для себе...">${ans}</textarea>
        <div style="display:flex;gap:7px;margin-top:8px;flex-wrap:wrap">
          <button class="btn btn-ac btn-sm" style="background:${USERS[CU].color}" onclick="analyzeReflect(${idx})">Проаналізувати →</button>
          <span id="rst${idx}" style="font-size:12px;color:var(--muted);align-self:center"></span>
        </div>
        <div class="rans" id="rans${idx}"></div>
      </div>`;
  }).join('');
}

async function analyzeReflect(idx) {
  if (!requireAuth()) return;
  const ans = document.getElementById('rq'+idx).value.trim();
  if (!ans) return;
  const st = document.getElementById('rst'+idx);
  const out = document.getElementById('rans'+idx);
  st.textContent = '⏳'; out.classList.remove('on');
  const q = REFLECT_QS[CU][idx].q;
  try {
    const res = await chatFetch('/api/chat',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6',max_tokens:600,
        system:`Ти підтримуючий коуч для контент-творця. ${await getProfileContext()}\nДай коротку (3-5 речень) чесну і підтримуючу відповідь на рефлексію. Українська мова. Будь конкретним і практичним.`,
        messages:[{role:'user',content:`Питання: "${q}"\n\nМоя відповідь: "${ans}"\n\nДай зворотній зв'язок.`}]
      })
    });
    const data = await res.json();
    const reply = data.content?.find(b=>b.type==='text')?.text || 'Помилка.';
    out.textContent = reply; out.classList.add('on');
    st.textContent = '✓'; setTimeout(()=>st.textContent='',2000);
  } catch(e) { out.textContent=chatErrorText(e, 'Помилка з\'єднання.'); out.classList.add('on'); st.textContent='❌'; }
}

// ══════════════════════════════════════════
// PROGRESS — streak, goals, checklist, audience
// ══════════════════════════════════════════
async function dbStreakDays() {
  if (!sbUser) return lload('streak', []);
  const { data } = await sb.from('streak_days')
    .select('day_date').eq('user_id', sbUser.id).order('day_date');
  return (data || []).map(r => r.day_date);
}

async function dbAddStreakDay(date) {
  if (!sbUser) {
    const ds = lload('streak', []);
    if (!ds.includes(date)) { ds.push(date); ds.sort(); lsave('streak', ds); }
    return;
  }
  try { await sb.from('streak_days').insert({ user_id: sbUser.id, day_date: date }); }
  catch(e) {}
}

function computeStreak(days) {
  if (!days.length) return { current: 0, max: 0 };
  const set = new Set(days);
  const today = new Date().toISOString().slice(0,10);
  const yest = new Date(Date.now()-86400000).toISOString().slice(0,10);
  let current = 0;
  if (set.has(today) || set.has(yest)) {
    let cursor = set.has(today) ? today : yest;
    while (set.has(cursor)) {
      current++;
      const d = new Date(cursor); d.setDate(d.getDate()-1);
      cursor = d.toISOString().slice(0,10);
    }
  }
  const sorted = [...days].sort();
  let max = 1, run = 1;
  for (let i=1; i<sorted.length; i++) {
    const prev = new Date(sorted[i-1]); prev.setDate(prev.getDate()+1);
    if (prev.toISOString().slice(0,10) === sorted[i]) run++;
    else { max = Math.max(max, run); run = 1; }
  }
  return { current, max: Math.max(max, run) };
}

async function markPostedToday() {
  const today = new Date().toISOString().slice(0,10);
  await dbAddStreakDay(today);
  renderProgress();
}

async function dbGoals() {
  if (!sbUser) return lload('goals', []);
  const { data } = await sb.from('goals').select('*').eq('user_id', sbUser.id);
  return data || [];
}

async function dbSaveGoal(g) {
  if (!sbUser) {
    const gs = lload('goals', []);
    gs.push(g);
    lsave('goals', gs);
    return;
  }
  await sb.from('goals').insert({user_id:sbUser.id, network:g.network, target:g.target, deadline:g.deadline||null});
}

async function dbDelGoal(id) {
  if (!sbUser) { lsave('goals', lload('goals',[]).filter(g=>String(g.id)!==String(id))); renderProgress(); return; }
  await sb.from('goals').delete().eq('id', id);
  renderProgress();
}

function showGoalForm() {
  document.getElementById('goalForm').style.display = 'block';
  document.getElementById('goalAddBtn').style.display = 'none';
  setTimeout(()=>document.getElementById('goalTarget').focus(), 50);
}

function hideGoalForm() {
  document.getElementById('goalForm').style.display = 'none';
  document.getElementById('goalAddBtn').style.display = '';
  document.getElementById('goalTarget').value = '';
  document.getElementById('goalDeadline').value = '';
}

async function saveNewGoal() {
  const network = document.getElementById('goalNetwork').value;
  const target = parseInt(document.getElementById('goalTarget').value);
  const deadline = document.getElementById('goalDeadline').value || null;
  if (!target || target <= 0) { alert('Введи число для цілі'); return; }
  await dbSaveGoal({id:Date.now().toString(), network, target, deadline});
  hideGoalForm();
  renderProgress();
}

const CHECKLIST_ITEMS = [
  'Перші 3 секунди — є гачок?',
  'CTA в кінці — лайк / коментар / збереження / поділитись',
  'Підпис починається з зачіпки (не «Привіт»)',
  'Обкладинка / прев\'ю продумано',
  '3–5 релевантних хештегів',
  'Локація додана (якщо доречно)',
  'Час публікації — пік активності аудиторії',
  'Альт-текст / підписи для доступності',
  'Перевірила граматику',
];

function renderChecklist() {
  const state = lload('checklist-state', {});
  document.getElementById('checklist').innerHTML = CHECKLIST_ITEMS.map((item,i)=>
    `<label class="chkrow"><input type="checkbox" ${state[i]?'checked':''} onchange="toggleChecklistItem(${i})"><span>${item}</span></label>`
  ).join('');
  const done = Object.values(state).filter(Boolean).length;
  document.getElementById('chkprogress').textContent = `${done} / ${CHECKLIST_ITEMS.length}`;
}

function toggleChecklistItem(i) {
  const state = lload('checklist-state', {});
  state[i] = !state[i];
  lsave('checklist-state', state);
  renderChecklist();
}

function resetChecklist() {
  lsave('checklist-state', {});
  renderChecklist();
}

async function dbAudience() {
  if (!sbUser) return lload('audience', null);
  const { data } = await sb.from('audience_portrait').select('*').eq('user_id', sbUser.id);
  return (data && data[0]) || null;
}

async function dbSaveAudience(input, result) {
  if (!sbUser) { lsave('audience', { input_data: input, ai_result: result }); return; }
  const { data: existing } = await sb.from('audience_portrait').select('id').eq('user_id', sbUser.id);
  if (existing && existing.length) {
    await sb.from('audience_portrait').update({input_data:input, ai_result:result, updated_at:new Date().toISOString()}).eq('id', existing[0].id);
  } else {
    await sb.from('audience_portrait').insert({user_id:sbUser.id, input_data:input, ai_result:result});
  }
}

async function generateAudiencePortrait() {
  if (!requireAuth()) return;
  const input = document.getElementById('audienceInput').value.trim();
  if (!input) return alert('Опиши що знаєш про аудиторію');
  const out = document.getElementById('audienceResult');
  const btn = document.getElementById('audienceBtn');
  btn.disabled = true; const orig = btn.textContent; btn.textContent = '⏳';
  try {
    const res = await chatFetch('/api/chat',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:1200,
        system:`Ти стратег контент-маркетингу для контент-творця. ${await getProfileContext()}\nЗ опису аудиторії сформуй детальний портрет ЦА українською. Структура:\n1) Хто вони (вік, гео, спосіб життя — конкретно; враховуй що серед них можуть бути різні статі)\n2) Топ-3 болі\n3) Топ-3 бажання\n4) Як з ними говорити (тон, формати контенту, тригери)\n5) Що НЕ робити\n6) 5 конкретних ідей контенту що відгукнуться саме їм\nБудь конкретним, без води.`,
        messages:[{role:'user', content: input}]
      })
    });
    const data = await res.json();
    const reply = data.content?.find(b=>b.type==='text')?.text || 'Помилка отримання відповіді.';
    out.textContent = reply;
    out.classList.add('on');
    await dbSaveAudience(input, reply);
  } catch (e) {
    out.textContent = chatErrorText(e, 'Помилка з\'єднання.');
    out.classList.add('on');
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
}

async function dbBaseline() {
  if (!sbUser) return lload('baseline', null);
  const { data } = await sb.from('baseline').select('*').eq('user_id', sbUser.id);
  return (data && data[0]) || null;
}

async function dbSaveBaseline(b) {
  if (!sbUser) { lsave('baseline', b); return; }
  const { data: existing } = await sb.from('baseline').select('id').eq('user_id', sbUser.id);
  const fields = {
    ig_followers: b.ig_followers||0, tt_followers: b.tt_followers||0,
    tg_followers: b.tg_followers||0, yt_followers: b.yt_followers||0,
    total_posts: b.total_posts||0, total_stories: b.total_stories||0, total_reels: b.total_reels||0,
    total_tt_videos: b.total_tt_videos||0,
    total_tg_posts: b.total_tg_posts||0,
    total_yt_videos: b.total_yt_videos||0, total_yt_shorts: b.total_yt_shorts||0,
    set_at: b.set_at,
    updated_at: new Date().toISOString()
  };
  if (existing && existing.length) {
    await sb.from('baseline').update(fields).eq('id', existing[0].id);
  } else {
    await sb.from('baseline').insert({user_id:sbUser.id, ...fields});
  }
}

function showBaselineForm(){ document.getElementById('baselineForm').style.display='block'; }
function hideBaselineForm(){ document.getElementById('baselineForm').style.display='none'; }

function applyBaselinePlatformVisibility() {
  const enabled = getPlatforms();
  ['ig','tt','tg','yt'].forEach(p => {
    const sec = document.getElementById('bl-' + p + '-section');
    if (sec) sec.style.display = enabled.includes(p) ? '' : 'none';
  });
}

async function prepBaselineForm() {
  const b = await dbBaseline();
  document.getElementById('bIg').value = b?.ig_followers || '';
  document.getElementById('bTt').value = b?.tt_followers || '';
  document.getElementById('bTg').value = b?.tg_followers || '';
  document.getElementById('bYt').value = b?.yt_followers || '';
  document.getElementById('bPosts').value = b?.total_posts || '';
  document.getElementById('bReels').value = b?.total_reels || '';
  document.getElementById('bTtVideos').value = b?.total_tt_videos || '';
  document.getElementById('bTgPosts').value = b?.total_tg_posts || '';
  document.getElementById('bYtVideos').value = b?.total_yt_videos || '';
  document.getElementById('bYtShorts').value = b?.total_yt_shorts || '';
  document.getElementById('bDate').value = b?.set_at || '';
  applyBaselinePlatformVisibility();
}

async function saveBaseline() {
  const n = id => parseInt(document.getElementById(id).value) || 0;
  const b = {
    ig_followers: n('bIg'), tt_followers: n('bTt'),
    tg_followers: n('bTg'), yt_followers: n('bYt'),
    total_posts: n('bPosts'), total_reels: n('bReels'),
    total_tt_videos: n('bTtVideos'),
    total_tg_posts: n('bTgPosts'),
    total_yt_videos: n('bYtVideos'), total_yt_shorts: n('bYtShorts'),
    set_at: document.getElementById('bDate').value || new Date().toISOString().slice(0,10)
  };
  await dbSaveBaseline(b);
  hideBaselineForm();
  renderBaseline();
}

async function renderBaseline() {
  const b = await dbBaseline();
  const el = document.getElementById('baselineDisplay');
  if (!el) return;
  const platforms = getPlatforms();
  const hasAny = b && (b.ig_followers||b.tt_followers||b.tg_followers||b.yt_followers||b.total_posts||b.total_stories||b.total_reels||b.total_tt_videos||b.total_tg_posts||b.total_yt_videos||b.total_yt_shorts);
  if (!hasAny) {
    el.innerHTML = `<p style="font-size:13px;color:var(--muted);margin:8px 0 12px">Необов'язково. Це допомагає бачити загальний результат разом з тим що відстежуєш тут.</p>
      <button class="btn btn-out btn-sm" onclick="prepBaselineForm().then(()=>showBaselineForm())">+ Задати початкову точку</button>`;
    return;
  }
  const date = b.set_at ? new Date(b.set_at).toLocaleDateString('uk-UA') : '';
  const allCards = [
    platforms.includes('ig') && b.ig_followers && {v:b.ig_followers, l:'IG підписники'},
    platforms.includes('tt') && b.tt_followers && {v:b.tt_followers, l:'TikTok підписники'},
    platforms.includes('tg') && b.tg_followers && {v:b.tg_followers, l:'TG підписники'},
    platforms.includes('yt') && b.yt_followers && {v:b.yt_followers, l:'YT підписники'},
    platforms.includes('ig') && b.total_posts && {v:b.total_posts, l:'Постів IG'},
    platforms.includes('ig') && b.total_reels && {v:b.total_reels, l:'Reels'},
    platforms.includes('tt') && b.total_tt_videos && {v:b.total_tt_videos, l:'TT відео'},
    platforms.includes('tg') && b.total_tg_posts && {v:b.total_tg_posts, l:'TG пости'},
    platforms.includes('yt') && b.total_yt_videos && {v:b.total_yt_videos, l:'YT відео'},
    platforms.includes('yt') && b.total_yt_shorts && {v:b.total_yt_shorts, l:'YT Shorts'},
  ].filter(Boolean);
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:12px 0">
      ${allCards.map(c=>`<div><div class="sv" style="font-size:22px">${esc(c.v)}</div><div class="sl">${c.l}</div></div>`).join('')}
    </div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:10px">Станом на ${date}</div>
    <button class="btn btn-out btn-sm" onclick="prepBaselineForm().then(()=>showBaselineForm())">Редагувати</button>`;
}

async function renderProgress() {
  renderBaseline();
  const days = await dbStreakDays();
  const { current, max } = computeStreak(days);
  document.getElementById('streakCurrent').textContent = current;
  document.getElementById('streakMax').textContent = max;
  const today = new Date().toISOString().slice(0,10);
  const btnEl = document.getElementById('streakBtn');
  if (days.includes(today)) {
    btnEl.textContent = '✓ Сьогодні відмічено';
    btnEl.disabled = true;
  } else {
    btnEl.textContent = '+ Я опублікувала сьогодні';
    btnEl.disabled = false;
  }

  const goals = await dbGoals();
  const stats = await dbStats();
  const last = stats[stats.length-1] || {};
  document.getElementById('goalsWidget').innerHTML = !goals.length
    ? '<div style="color:var(--muted);font-size:14px">Цілей ще немає — додай першу</div>'
    : goals.map(g => {
        const cur = last[g.network] || 0;
        const pct = g.target > 0 ? Math.min(100, Math.round((cur / g.target) * 100)) : 0;
        const remain = Math.max(0, g.target - cur);
        const label = g.network === 'ig' ? 'Instagram' : 'TikTok';
        return `<div class="goal-row">
          <div class="goal-head"><strong>${label}: ${esc(cur)} / ${esc(g.target)}</strong>
            <button class="btn btn-red btn-sm" onclick="dbDelGoal(${jsArg(g.id)})">✕</button>
          </div>
          <div class="goal-bar"><div class="goal-fill" style="width:${pct}%"></div></div>
          <div class="goal-meta">${pct}% · залишилось ${esc(remain)}${g.deadline?` · до ${esc(g.deadline)}`:''}</div>
        </div>`;
      }).join('');

  renderChecklist();

  const a = await dbAudience();
  if (a) {
    if (a.input_data) document.getElementById('audienceInput').value = a.input_data;
    if (a.ai_result) {
      document.getElementById('audienceResult').textContent = a.ai_result;
      document.getElementById('audienceResult').classList.add('on');
    }
  }
}

// ══════════════════════════════════════════
// PRACTICE
// ══════════════════════════════════════════
const PRACTICES = [
  {cat:'✨ Творчі', items:[
    {id:'brain-dump', name:'Brain dump', time:'10 хв',
     goal:'Вивантажити всі ідеї без фільтра — звільнити голову і знайти 2–3 «золоті».',
     steps:['Постав таймер на 10 хв','Пиши все що приходить — теми, ідеї, страхи, образи','Без редагування і без оцінок','Коли таймер дзвонить — зупинись'],
     analyze:{intro:'Встав сюди свій список — ШІ виділить топ-5 ідей з найбільшим потенціалом і пояснить чому.',
              system:'Ти стратег контент-маркетингу. Проаналізуй список ідей блогера. Виділи топ-5 з найбільшим потенціалом стати залучаючим контентом. Поясни ЧОМУ кожна. Конкретно. Українською.'}},
    {id:'mood-board', name:'Mood board', time:'20 хв',
     goal:'Зрозуміти свою візуальну естетику через референси.',
     steps:['Відкрий Pinterest / Instagram saved','Збери 20 фото які тебе зачіпають','Подивись що в них спільного: кольори, композиція, настрій','Запиши 3–5 спільних рис — це твій візуальний код']},
    {id:'voice-memo', name:'Голосове на 5 хв', time:'5 хв',
     goal:'Висловити вголос що відбувається — часто звідти приходять ідеї.',
     steps:['Увімкни диктофон','Говори що було сьогодні, як почуваєшся','Не редагуй — це для себе','Послухай ввечері — звідки прийшла ідея?']},
  ]},
  {cat:'🎬 Технічні', items:[
    {id:'hook-test', name:'Тест гачка', time:'5 хв',
     goal:'Знайти найсильніший варіант першої секунди для Reels.',
     steps:['Запиши 3 варіанти першої секунди','Варіант 1 — питання («Ти знала що…?»)','Варіант 2 — заява («Ось чому…»)','Варіант 3 — wow-кадр (опис візуального шоку)'],
     analyze:{intro:'Встав 3 варіанти гачка — ШІ ранжує їх за силою і пояснить чому.',
              system:'Ти експерт з Reels і алгоритмів IG/TikTok. Ранжуй 3 варіанти гачка з 1 до 3 (1 — найсильніший). Поясни чому. Дай 2 поради як зробити переможця ще сильнішим. Українською.'}},
    {id:'storyboard', name:'Розкадровка Reels', time:'10 хв',
     goal:'Спланувати Reels — менше часу на зйомці, чіткіша структура.',
     steps:['Запиши 4–6 кадрів','Кадр 1 = гачок (1–2 сек)','Середні = розвиток (3–5 сек кожен)','Останній = висновок / CTA (1–2 сек)','Поряд із кожним — текст overlay'],
     analyze:{intro:'Встав свою розкадровку — ШІ оцінить структуру і запропонує покращення.',
              system:'Ти експерт з Reels. Оцінюй розкадровку за гачком, темпом, CTA. Дай конкретні поради. Українською.'}},
    {id:'shot-list', name:'Shot list дня', time:'5 хв',
     goal:'Не імпровізувати — мати готовий список моментів для зйомки.',
     steps:['Подумай про день наперед','Запиши 5 моментів які варто зняти','Поряд з кожним — навіщо (що показуєш?)','Тримай список у нотатках телефону']},
  ]},
  {cat:'💭 Психологічні', items:[
    {id:'letter-self', name:'Лист собі через рік', time:'15 хв',
     goal:'Уявити майбутню себе — щоб краще побачити поточні блокери.',
     steps:['Уяви: 1 рік минув, ціль досягнута','Опиши свій день — від ранку до вечора','Який контент ти зараз робиш?','Як змінилось ставлення до себе?','Що та-ти сказала б тобі-зараз?']},
    {id:'cringe', name:'Cringe-вправа', time:'10 хв',
     goal:'Розблокувати страх «це cringe» — він майже завжди в голові.',
     steps:['Знайди найбільш cringe пост у себе','Подивись очима незнайомця','Чи дійсно це жахливо?','Або це просто незвично — бачити себе?']},
    {id:'letter-follower', name:'Лист одній підписниці', time:'10 хв',
     goal:'Знайти щирий тон — ти пишеш людині, не «аудиторії».',
     steps:['Уяви одну реальну підписницю','Напиши їй особистий лист на 200–300 слів','Без хештегів, без «контентного» формату','Розкажи що тебе хвилює зараз'],
     analyze:{intro:'Встав свого листа — ШІ оцінить щирість і допоможе адаптувати у пост.',
              system:'Ти редактор контенту. Оціни щирість листа. Запропонуй як адаптувати в пост / Reels не втрачаючи особистого тону. Українською.'}},
  ]},
  {cat:'📊 Аналітичні', items:[
    {id:'weekly-review', name:'Тижневий розбір', time:'20 хв',
     goal:'Зрозуміти що працює — на основі даних, а не відчуттів.',
     steps:['Відкрий статистику тижня','Виділи 3 топ-пости за engagement','Що в них спільного — тема, час, структура?','Запиши 1 гіпотезу для наступного тижня'],
     analyze:{intro:'Опиши тиждень — числа, що працювало, що ні — ШІ дасть структурований звіт і 3 рекомендації.',
              system:'Ти аналітик контенту. Зроби тижневий звіт з висновками і 3 конкретними рекомендаціями на наступний тиждень. Українською.'}},
    {id:'audience-interview', name:'Інтерв\'ю з підписницею', time:'30 хв',
     goal:'Реальні слова реальної людини > здогадки.',
     steps:['Знайди 2–3 підписниці що активно реагують','Напиши у DM: «Хочу зробити контент кращим — допоможеш з 5 питаннями?»','Питай: Хто ти? Що любиш зараз? Що читаєш? Який мій контент тебе зачіпає? Що б хотіла бачити більше?','Запиши відповіді — це сценарії наступних постів']},
  ]},
];

function renderPractice() {
  document.getElementById('practiceList').innerHTML = PRACTICES.map(c => `
    <div class="practice-cat">
      <div class="practice-cat-name">${c.cat}</div>
      ${c.items.map(p => `
        <div class="practice-card">
          <div class="practice-head" onclick="this.parentElement.classList.toggle('on')">
            <div class="practice-name">${p.name}</div>
            <div class="practice-time">${p.time}</div>
            <div class="practice-arr">↓</div>
          </div>
          <div class="practice-body">
            <div class="practice-goal"><strong>Мета:</strong> ${p.goal}</div>
            <div class="practice-steps">${p.steps.map(s=>`<div class="practice-step">${s}</div>`).join('')}</div>
            ${p.analyze ? `
              <div class="practice-analyze">
                <div class="practice-analyze-intro">${p.analyze.intro}</div>
                <textarea id="pr-${p.id}" placeholder="Встав сюди свій результат..." style="min-height:100px"></textarea>
                <button class="btn btn-ac btn-sm" onclick="analyzePractice('${p.id}')" style="margin-top:8px">Проаналізувати →</button>
                <div class="practice-result" id="pr-${p.id}-out"></div>
              </div>` : ''}
          </div>
        </div>`).join('')}
    </div>`).join('');
}

async function analyzePractice(id) {
  if (!requireAuth()) return;
  let practice = null;
  for (const c of PRACTICES) {
    const found = c.items.find(p => p.id === id);
    if (found) { practice = found; break; }
  }
  if (!practice || !practice.analyze) return;
  const input = document.getElementById('pr-'+id).value.trim();
  if (!input) return alert('Спочатку напиши результат');
  const out = document.getElementById('pr-'+id+'-out');
  out.textContent = 'ШІ думає...';
  out.classList.add('on');
  try {
    const res = await chatFetch('/api/chat',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:1000,
        system: practice.analyze.system + '\n\nКонтекст: ' + (await getProfileContext()),
        messages:[{role:'user', content: input}]
      })
    });
    const data = await res.json();
    out.textContent = data.content?.find(b=>b.type==='text')?.text || 'Помилка.';
  } catch(e) {
    out.textContent = chatErrorText(e, 'Помилка з\'єднання.');
  }
}

// ══════════════════════════════════════════
// THEORY
// ══════════════════════════════════════════
function renderTheory() {
  const algos = [
    {icon:'🎬',bg:'#ffe0f0',title:'Reels — як отримати охоплення',sub:'Найпотужніший формат для нових підписників',items:[
      {dot:'#a0005a',txt:'<strong>Перші 3 секунди — все.</strong> Починай з гачка — питання, wow-момент або текст на екрані. Алгоритм дивиться чи залишаються люди.'},
      {dot:'#a0005a',txt:'<strong>Watch time важливіший за лайки.</strong> 60-секундний Reel з 70% перегляду обіграє 10-секундний з 50%.'},
      {dot:'#a0005a',txt:'<strong>Відправки в DM = золото.</strong> Instagram зважує відправки в 3–5 разів більше ніж лайки. Роби контент який хочеться переслати.'},
      {dot:'#a0005a',txt:'<strong>Алгоритм тестує малими порціями.</strong> Спочатку 100–500 людей, 1-2 год. Якщо реакція хороша — розширює. Перші години критичні.'},
      {dot:'#a0005a',txt:'<strong>Субтитри дають +30% переглядів.</strong> Багато дивляться без звуку. В CapCut: Text → Auto Captions.'},
      {dot:'#a0005a',txt:'<strong>Watermark з TikTok знижує охоплення.</strong> Завантажуй оригінальні відео без логотипів.'},
    ]},
    {icon:'📱',bg:'#e8f5ff',title:'Сторіс і Каруселі',sub:'Глибина зв\'язку з аудиторією',items:[
      {dot:'#003a80',txt:'<strong>Сторіс = зв\'язок з тими хто є.</strong> Не ростять підписників але будують лояльність. Регулярні сторіс = алгоритм показує тебе частіше.'},
      {dot:'#003a80',txt:'<strong>Інтерактивність підвищує охоплення.</strong> Опитування, слайдери, питання — алгоритм бачить взаємодію.'},
      {dot:'#003a80',txt:'<strong>Каруселі зберігають найбільше.</strong> «Збереження» — найсильніший сигнал для стрічки. Роби каруселі корисними.'},
      {dot:'#003a80',txt:'<strong>Перша сторінка каруселі</strong> вирішує чи будуть свайпати. Зроби її як обкладинку — цікава і з гачком.'},
    ]},
    {icon:'🔍',bg:'#f3f0ff',title:'SEO і пошук',sub:'Як тебе знаходять нові люди',items:[
      {dot:'#6C5CE7',txt:'<strong>Ключові слова важливіші за хештеги.</strong> Instagram читає текст підпису. Пиши природньо — "прибираю кухню", "корекція брів".'},
      {dot:'#6C5CE7',txt:'<strong>Хештеги — 5–10, конкретні.</strong> Не #love — а #майстербровакиїв #нарощуваннявій. Специфічні = правильна аудиторія.'},
      {dot:'#6C5CE7',txt:'<strong>Біо профілю</strong> індексується в пошуку. Додай ключові слова своєї ніші.'},
      {dot:'#6C5CE7',txt:'<strong>Трендова музика</strong> збільшує шанс потрапити на Explore.'},
    ]},
    {icon:'📊',bg:'#f0fff4',title:'Метрики які важливі',sub:'На що дивитись в статистиці',items:[
      {dot:'#16a34a',txt:'<strong>Збереження</strong> — найкращий показник корисного контенту.'},
      {dot:'#16a34a',txt:'<strong>Відправки (sends)</strong> — показник вірусного потенціалу.'},
      {dot:'#16a34a',txt:'<strong>Completion rate Reels</strong> — ціль мінімум 50%.'},
      {dot:'#16a34a',txt:'<strong>Лайки — найменш важливі</strong> для алгоритму. Але важливі психологічно.'},
    ]},
    {icon:'⏰',bg:'#fffbea',title:'Коли і як часто',sub:'Системність без вигорання',items:[
      {dot:'#856600',txt:'<strong>3x на тиждень стабільно</strong> кращe ніж 10x за перший тиждень і мовчання.'},
      {dot:'#856600',txt:'<strong>Найкращий час</strong> — коли аудиторія онлайн. Перевіряй в Insights → Аудиторія. Зазвичай 18:00–22:00.'},
      {dot:'#856600',txt:'<strong>Знімай пачками.</strong> 2 години = 3–5 матеріалів на тиждень.'},
      {dot:'#856600',txt:'<strong>Відповідай на коментарі</strong> в першу годину після публікації — буст охоплення.'},
    ]},
  ];
  document.getElementById('algocards').innerHTML = algos.map(a=>`
    <div class="tcard" onclick="this.classList.toggle('on')">
      <div class="thead"><div class="ticon" style="background:${a.bg}">${a.icon}</div>
        <div><div class="ttl2">${a.title}</div><div class="tsub">${a.sub}</div></div>
        <div class="tarr">↓</div></div>
      <div class="tbody">${a.items.map(it=>`<div class="titem"><div class="tdot" style="background:${it.dot}"></div><div class="ttxt">${it.txt}</div></div>`).join('')}</div>
    </div>`).join('');

  document.getElementById('psychcards').innerHTML = [
    {e:'🪞',t:'Ефект «це про мене»',d:'Люди підписуються коли бачать себе в тобі. Чим більше ти є собою — тим більше людей впізнають себе.'},
    {e:'🤝',t:'Парасоціальний зв\'язок',d:'Аудиторія відчуває дружбу з блогером якого регулярно бачить. Сторіс, голос, реальні моменти — будують лояльність.'},
    {e:'💡',t:'Цінність і корисність',d:'Люди зберігають корисний контент і повертаються. «Лайфхак», «спробую» — це збереження і повернення.'},
    {e:'🎭',t:'Автентичність виграє',d:'Ідеальний контент відштовхує. Реальний притягує. Помилки, чесні думки — аудиторія довіряє.'},
    {e:'📣',t:'FOMO і серіальність',d:'Серії і рубрики змушують повертатись. «Продовження завтра» — людина підписується щоб не пропустити.'},
    {e:'❤️',t:'Емоційний відгук',d:'Контент який викликає сміх, ностальгію або «впізнавання» — пересилають друзям. Так ростуть органічно.'},
  ].map(p=>`<div class="pcard2"><span class="pce">${p.e}</span><div class="pct">${p.t}</div><div class="pcd">${p.d}</div></div>`).join('');

  document.getElementById('blogercards').innerHTML = [
    {e:'🧠',t:'Синдром самозванця',d:'«Хто я така щоб вчити». Факт: ти не вчиш — ти ділишся досвідом. Твій досвід унікальний для тих хто його не має.'},
    {e:'👁',t:'Страх оцінки',d:'Мозок еволюційно боїться бути відкинутим. Але аудиторія в Instagram — незнайомці без влади над твоїм реальним life.'},
    {e:'⚡',t:'Перфекціонізм = прокрастинація',d:'Ідеальний пост який не виклала = 0 охоплень. Звичайний який виклала = шанс. Дій, покращуй в процесі.'},
    {e:'🔄',t:'Порівняння з іншими',d:'Ти бачиш чужий результат але не бачиш їхній шлях. Порівнюй себе тільки з собою вчорашньою.'},
  ].map(p=>`<div class="pcard2"><span class="pce">${p.e}</span><div class="pct">${p.t}</div><div class="pcd">${p.d}</div></div>`).join('');
}

// ══════════════════════════════════════════
// TOOLS
// ══════════════════════════════════════════
// Brand marks for the tools list, inlined from simple-icons 16.33.0 (CC0-1.0) so the page needs no icon CDN.
// Only brands that simple-icons ships are here; every other tool gets a letter badge.
const TOOL_ICONS = {
  vsco: 'M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm11.52 12c0 .408-.023.792-.072 1.176l-2.04-.24c.024-.312.05-.624.05-.936 0-.288-.025-.6-.05-.888l2.04-.24c.072.384.072.744.072 1.128zM.479 12c0-.384.024-.769.049-1.152l2.04.24c-.024.312-.047.6-.047.912s.023.6.047.912l-2.04.24C.479 12.769.479 12.384.479 12zm20.472-3.096l1.921-.72c.264.72.433 1.464.552 2.232l-2.04.24c-.097-.6-.24-1.2-.433-1.752zM21 12c0 .6-.072 1.176-.167 1.752l-2.017-.455c.071-.409.119-.841.119-1.297s-.048-.912-.119-1.344l2.017-.457c.118.577.167 1.177.167 1.801zm-9 6.456C8.435 18.455 5.545 15.565 5.544 12 5.545 8.435 8.435 5.545 12 5.544c3.565.001 6.455 2.891 6.456 6.456.008 3.559-2.871 6.448-6.429 6.456H12zM12.216 21v-2.064c.885-.029 1.756-.224 2.568-.575l.888 1.872c-1.09.482-2.264.742-3.456.767zm-3.936-.791l.912-1.873c.792.359 1.656.575 2.568.6V21c-1.202-.023-2.386-.293-3.48-.791zM3 12c0-.624.072-1.224.192-1.824l2.016.456c-.098.45-.146.908-.144 1.368 0 .432.048.864.12 1.272l-2.016.455C3.051 13.159 2.994 12.58 3 12zm8.76-9v2.064c-.877.029-1.74.224-2.544.576l-.888-1.871C9.411 3.291 10.577 3.03 11.76 3zm3.935.792l-.911 1.872c-.809-.363-1.682-.559-2.568-.576V3.024c1.248 0 2.424.288 3.479.768zm5.088 4.656c-.231-.56-.513-1.098-.84-1.608l1.681-1.152c.407.648.768 1.32 1.056 2.04l-1.897.72zm-.07 1.296l-2.018.456c-.23-.85-.621-1.648-1.151-2.352l1.632-1.295c.72.959 1.248 2.015 1.537 3.191zm-3.457-2.256c-.572-.667-1.264-1.22-2.04-1.633l.912-1.871c1.056.549 1.993 1.299 2.76 2.208l-1.632 1.296zm-.6-3.744l.96-1.824c.672.384 1.295.816 1.896 1.32L18.145 4.8c-.461-.401-.959-.754-1.489-1.056zm-.408-.216c-.54-.266-1.102-.483-1.68-.648l.504-1.992c.744.216 1.464.48 2.159.84l-.983 1.8zm-2.16-.768c-.6-.144-1.2-.216-1.824-.239V.479c.793.024 1.584.12 2.328.289l-.504 1.992zm-2.28-.239c-.605.021-1.207.094-1.8.216L9.528.744c.72-.168 1.487-.265 2.28-.265v2.042zm-2.28.334c-.586.167-1.156.384-1.704.649l-.96-1.824c.691-.343 1.415-.616 2.16-.816l.504 1.991zm-2.112.865c-.529.294-1.027.64-1.488 1.032L4.56 3.216c.6-.504 1.224-.936 1.896-1.319l.96 1.823zm.48.264l.888 1.871c-.792.408-1.464.96-2.04 1.608L5.136 6.168c.775-.895 1.711-1.636 2.76-2.184zM4.848 6.552l1.608 1.295c-.53.705-.921 1.503-1.152 2.353l-2.016-.456c.312-1.2.84-2.28 1.56-3.192zM3.24 8.4l-1.92-.72c.287-.72.648-1.416 1.08-2.04l1.68 1.176c-.341.494-.623 1.025-.84 1.584zm-.168.455c-.192.577-.36 1.152-.432 1.776L.6 10.393c.12-.769.288-1.537.553-2.257l1.919.719zm-.456 4.513c.096.6.239 1.2.432 1.776l-1.92.72c-.271-.728-.456-1.485-.552-2.257l2.04-.239zm.624 2.208c.239.576.528 1.104.84 1.607L2.4 18.336c-.435-.629-.797-1.306-1.08-2.016l1.92-.744zm.024-1.392l2.017-.456c.216.864.624 1.681 1.128 2.376L4.8 17.4c-.725-.957-1.247-2.051-1.536-3.216zm3.432 2.28c.577.672 1.272 1.248 2.064 1.656l-.912 1.872c-1.063-.557-2.009-1.315-2.784-2.232l1.632-1.296zm.72 3.815l-.96 1.825c-.674-.376-1.31-.819-1.896-1.321l1.368-1.535c.456.407.936.744 1.488 1.031zm.408.217c.528.264 1.104.48 1.705.647l-.504 1.992c-.747-.196-1.471-.469-2.16-.815l.959-1.824zm2.16.768c.576.12 1.176.193 1.8.217v2.039c-.774-.026-1.544-.114-2.305-.264l.505-1.992zm2.28.216c.605-.021 1.207-.094 1.801-.217l.479 1.992c-.749.168-1.513.264-2.28.287V21.48zm2.257-.336c.586-.165 1.155-.382 1.703-.647l.96 1.824c-.688.35-1.412.623-2.159.815l-.504-1.992zm2.086-.865c.528-.287 1.032-.647 1.488-1.031l1.369 1.535c-.588.502-1.223.945-1.896 1.321l-.961-1.825zm-.479-.263l-.888-1.871c.788-.414 1.489-.977 2.064-1.656l1.606 1.296c-.778.91-1.722 1.668-2.782 2.231zm3.071-2.592l-1.607-1.296c.532-.708.916-1.517 1.128-2.376l2.017.456c-.311 1.157-.831 2.248-1.538 3.216zM20.76 15.6l1.92.721c-.288.72-.648 1.392-1.079 2.04l-1.682-1.177c.337-.504.624-1.032.841-1.584zm.168-.455c.192-.553.336-1.152.433-1.752l2.039.239c-.11.761-.294 1.508-.551 2.232l-1.921-.719zm.456-9.841l-1.681 1.152c-.358-.49-.76-.947-1.199-1.368l1.368-1.536c.552.552 1.056 1.128 1.512 1.752zM4.2 3.528l1.368 1.536c-.456.408-.84.864-1.2 1.368l-1.68-1.176c.431-.636.94-1.216 1.512-1.728zM2.664 18.744l1.68-1.152c.36.48.769.937 1.2 1.369l-1.368 1.535c-.548-.545-1.054-1.131-1.512-1.752zm17.16 1.729l-1.368-1.537c.432-.407.841-.863 1.199-1.344l1.682 1.176c-.457.6-.961 1.175-1.513 1.705z',
  instagram: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
};

function renderTools() {
  const sections = [
    {title:'✂️ Монтаж відео',tools:[
      {n:'CapCut',d:'Найкращий для Reels і TikTok. Автосубтитри, шаблони, beat sync, AI фон. Безкоштовно.',tag:'iOS + Android · Безкоштовно'},
      {n:'InShot',d:'Простий і швидкий. Кадрування під всі формати, музика, текст. Ідеально для старту.',tag:'iOS + Android · Безкоштовно+'},
      {n:'Splice',d:'Потужний timeline-монтаж на телефоні. Для більшого контролю над кліпами.',tag:'iOS · Безкоштовно+'},
    ]},
    {title:'🎨 Дизайн і графіка',tools:[
      {n:'Canva',d:'Шаблони для сторіс, каруселей, обкладинок. Брендові кольори і шрифти.',tag:'Всі платформи · Безкоштовно+'},
      {n:'Adobe Express',d:'Потужніший Canva. Remove background, анімації. Безкоштовна версія щедра.',tag:'Всі платформи · Безкоштовно+'},
      {n:'Unfold',d:'Красиві мінімалістичні шаблони для сторіс. Естетика яку любить IG аудиторія.',tag:'iOS + Android · Безкоштовно+'},
    ]},
    {title:'📸 Фото і обробка',tools:[
      {n:'Lightroom Mobile',d:'Пресети для єдиної естетики стрічки. Один клік — консистентний вигляд.',tag:'iOS + Android · Безкоштовно+'},
      {si:'vsco',n:'VSCO',d:'Фільтри і пресети. Тепла або мінімалістична естетика.',tag:'iOS + Android · Безкоштовно+'},
      {n:'Facetune',d:'Ретуш, вирівнювання фону. Для б\'юті контенту незамінне.',tag:'iOS + Android · Платно'},
    ]},
    {title:'📅 Планування і аналітика',tools:[
      {n:'Later',d:'Планування постів наперед, drag-and-drop календар, аналітика.',tag:'Всі платформи · Безкоштовно+'},
      {si:'instagram',n:'Instagram Insights',d:'Вбудована аналітика. Охоплення, збереження, аудиторія, час — безкоштовно.',tag:'В додатку · Безкоштовно'},
      {n:'TrendTok',d:'Трендові звуки для TikTok і Reels. Вчасно ловити тренд = більше охоплення.',tag:'Веб · Безкоштовно'},
    ]},
  ];
  const toolIcon = t => TOOL_ICONS[t.si]
    ? `<svg class="brand-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="${TOOL_ICONS[t.si]}"/></svg>`
    : `<span class="tool-badge" aria-hidden="true">${t.n.charAt(0)}</span>`;
  const capcut = [
    {title:'⚙️ Базові налаштування',items:[
      '<strong>Формат 9:16 відразу</strong> — Canvas → Ratio → 9:16. Встанови до початку монтажу.',
      '<strong>Авто-субтитри</strong> — Text → Auto Captions. Обов\'язково для кожного Reels.',
      '<strong>Експорт 1080p, 30fps</strong> — достатньо для Instagram і TikTok.',
    ]},
    {title:'🎬 Ефекти що дають результат',items:[
      '<strong>Speed Ramp</strong> — сповільнення в момент переходу. Робить звичайне відео кінематографічним.',
      '<strong>Beat Sync</strong> — автосинхронізація кліпів з ритмом. Effects → Beat Sync.',
      '<strong>AI Background Remove</strong> — прибирає фон одним кліком. Ідеально для б\'юті.',
      '<strong>Максимум 1–2 переходи.</strong> Багато ефектів = аматорський вигляд.',
    ]},
    {title:'🎨 Естетика і кольори',items:[
      '<strong>LUTs</strong> — Filters → LUTs. Один LUT на всі відео = єдина естетика стрічки.',
      '<strong>Збережи як пресет</strong> — після налаштування кольорів → зберегти. Наступного разу один клік.',
      '<strong>Текст</strong> — жирний + тінь. Білий на темному або чорний на світлому. Анімуй важливі слова.',
    ]},
  ];
  const stories = [
    {e:'🎨',n:'Єдиний стиль шрифту',d:'1–2 шрифти завжди. Це вже брендинг без логотипу.'},
    {e:'🌅',n:'Фото на градієнт',d:'В IG: стискай фото, довго тримай → розмий фон. Виглядає професійно.'},
    {e:'📍',n:'Геолокація і теги',d:'Теги місць збільшують охоплення сторіс. 1–2 теги — достатньо.'},
    {e:'⏱',n:'Серії 3–5 сторіс',d:'Перша = гачок («покажу щось»), остання = CTA. Тримають людину довше.'},
    {e:'🎵',n:'Трендова музика',d:'IG показує в пошуку по музиці. Використовуй популярні треки.'},
    {e:'🔗',n:'Посилай на Reels',d:'«Дивись Reel» в сторіс → крос-промо. Сторіс приводять глядачів на Reels.'},
  ];
  const resources = [
    {cat:'📱 SMM і контент', items:[
      {n:'Later — Blog', d:'Стратегії Instagram, аналіз трендів, гайди', u:'https://later.com/blog'},
      {n:'Buffer — Library', d:'Соцмережі: дослідження, кейси, інструменти', u:'https://buffer.com/library'},
      {n:'Adam Mosseri (@mosseri)', d:'Head of Instagram постить про алгоритм', u:'https://www.instagram.com/mosseri/'},
      {n:'HubSpot Academy', d:'Безкоштовні курси з маркетингу та SMM', u:'https://academy.hubspot.com/'},
    ]},
    {cat:'✍️ Бренд і копірайт', items:[
      {n:'Justin Welsh', d:'Гайди для творців і solopreneurs — стратегія, монетизація', u:'https://www.justinwelsh.me/'},
      {n:'Visualize Value', d:'Як ідеї перетворювати на візуальний контент', u:'https://visualizevalue.com/'},
      {n:'Austin Kleon — Show Your Work', d:'Класична книга про процес як контент', u:'https://austinkleon.com/show-your-work/'},
      {n:'James Clear — Atomic Habits', d:'Звички — фундамент регулярного контенту', u:'https://jamesclear.com/atomic-habits'},
    ]},
    {cat:'🎨 UI / UX дизайн', items:[
      {n:'Refactoring UI', d:'Найкраща книга з дизайну для не-дизайнерів', u:'https://www.refactoringui.com/'},
      {n:'Nielsen Norman Group', d:'UX-дослідження від класиків професії', u:'https://www.nngroup.com/'},
      {n:'Smashing Magazine', d:'Глибокі статті про веб і фронтенд', u:'https://www.smashingmagazine.com/'},
      {n:'Mobbin', d:'Бібліотека реальних мобільних UI — натхнення', u:'https://mobbin.com/'},
      {n:'Awwwards', d:'Найкращий веб-дизайн — щоденне натхнення', u:'https://www.awwwards.com/'},
      {n:'Figma Community', d:'Безкоштовні дизайн-системи і шаблони', u:'https://www.figma.com/community'},
    ]},
    {cat:'📺 YouTube', items:[
      {n:'Flux Academy', d:'Дизайн і фриланс — стратегія + практика', u:'https://www.youtube.com/@FluxAcademy'},
      {n:'DesignCourse', d:'UI/UX уроки, тренди, кейси', u:'https://www.youtube.com/@DesignCourse'},
      {n:'Ali Abdaal', d:'Продуктивність і фокус для творців', u:'https://www.youtube.com/@aliabdaal'},
    ]},
  ];
  document.getElementById('toolscontent').innerHTML =
    sections.map(s=>`<div class="tsec"><div class="tsect">${s.title}</div><div class="tgrid">${s.tools.map(t=>`<div class="toolc">${toolIcon(t)}<div class="tooln">${t.n}</div><div class="toold">${t.d}</div><span class="tooltag">${t.tag}</span></div>`).join('')}</div></div>`).join('') +
    '<div class="divider"></div><div class="slbl">Лайфхаки CapCut</div><div class="cl cl-dk" style="margin-bottom:14px">Найпопулярніший редактор. Ось що реально варто знати.</div>' +
    capcut.map(s=>`<div class="tcard" onclick="this.classList.toggle(\'on\')" style="margin-bottom:9px"><div class="thead"><div class="ticon" style="background:#fff8e0">💡</div><div><div class="ttl2">${s.title}</div></div><div class="tarr">↓</div></div><div class="tbody">${s.items.map(it=>`<div class="titem"><div class="tdot" style="background:var(--ac)"></div><div class="ttxt">${it}</div></div>`).join('')}</div></div>`).join('') +
    '<div class="divider"></div><div class="slbl">Лайфхаки для сторіс</div><div class="tgrid" style="margin-bottom:28px">' +
    stories.map(s=>`<div class="toolc"><span class="toole">${s.e}</span><div class="tooln">${s.n}</div><div class="toold">${s.d}</div></div>`).join('') + '</div>' +
    '<div class="divider"></div><div class="slbl">Матеріали для розвитку</div><div class="cl cl-b" style="margin-bottom:18px">Перевірені блоги, книги і канали — SMM, бренд, дизайн. Зовнішні посилання.</div>' +
    resources.map(r=>`<div class="res-cat"><div class="res-cat-name">${r.cat}</div><div class="res-list">${r.items.map(i=>`<a class="res-item" href="${i.u}" target="_blank" rel="noopener"><div class="res-name">${i.n} ↗</div><div class="res-desc">${i.d}</div></a>`).join('')}</div></div>`).join('');
}

// ══════════════════════════════════════════
// MENTOR CONTENT
// ══════════════════════════════════════════
async function renderMentor() {
  document.getElementById('mbg').textContent = USERS[CU].name.toLowerCase();
  document.getElementById('mtag').textContent = USERS[CU].heroTag;
  document.getElementById('mtitle').innerHTML = 'Хто ти і що ти <span style="color:'+USERS[CU].color+'">даєш</span>';
  const el = document.getElementById('mentorcontent');
  // For real users (not demo), show their AI-generated plan if they have one
  const plan = (CU === 'demo') ? null : await dbMentorPlan();
  if (plan && plan.positioning) {
    el.innerHTML = renderMentorPlan(plan);
    return;
  }
  // No plan yet — generic placeholder with a prompt to generate one
  el.innerHTML = genericM();
}

function aiPlanCTA() {
  if (CU === 'demo') return '';
  return `<div class="sec">
    <div class="card" style="text-align:center;padding:22px;background:var(--bg)">
      <div style="font-size:13px;color:var(--muted);margin-bottom:10px">Хочеш AI-варіант плану під твій профіль? Він тимчасово замінить цей базовий, але можна буде повернутись.</div>
      <button class="btn btn-out btn-sm" id="generateMentorBtn" onclick="generateMentorPlan()">🤖 Згенерувати AI-варіант</button>
      <div style="font-size:12px;color:var(--muted);margin-top:8px">Займе 1–2 хвилини</div>
    </div>
  </div>`;
}

function genericM() {
  const isDemo = CU === 'demo';
  return `<div class="sec">
    <div class="cncpt"><div class="cnl">🎯 ментор-план</div><p class="cnt">${isDemo
      ? 'У реальному акаунті тут — <strong>персональний</strong> план: позиціонування, опори контенту, 12-тижнева дорога, формула 70/20/10. У демо показуємо загальну структуру.'
      : 'Твій персональний план будемо генерувати на основі анкети. Поки що тут — загальна структура того, що буде доступно.'}</p></div>

    ${isDemo ? '' : `
      <div class="card" style="text-align:center;padding:26px 22px;margin-bottom:14px">
        <div style="font-size:14px;color:var(--muted);margin-bottom:14px">Заповни профіль і згенеруй персональний план — позиціонування, опори, тижнева дорога, формула, питання рефлексії, промпти і стратегії під твої блокери.</div>
        <button class="btn btn-ac" id="generateMentorBtn" onclick="generateMentorPlan()">🤖 Згенерувати персональний план</button>
        <div style="font-size:12px;color:var(--muted);margin-top:10px">Займе 1–2 хвилини</div>
      </div>
    `}

    <div class="slbl">Що буде у твоєму плані</div>
    <div class="pillars">
      <div class="pillar"><span class="pe">🎯</span><div class="pname">Позиціонування</div><div class="pdesc">Чим ти відрізняєшся. Що отримує підписниця коли йде до тебе.</div></div>
      <div class="pillar"><span class="pe">🏛</span><div class="pname">3 опори</div><div class="pdesc">3 ключові теми навколо яких будується твій контент.</div></div>
      <div class="pillar"><span class="pe">📅</span><div class="pname">12-тижнева дорога</div><div class="pdesc">Конкретний план що робити кожен тиждень — від фундаменту до системи.</div></div>
      <div class="pillar"><span class="pe">⚖️</span><div class="pname">Формула контенту</div><div class="pdesc">Скільки % якого типу контенту робити під твою нішу.</div></div>
    </div>
    <div class="slbl" style="margin-top:24px">Що вже зараз доступно всім</div>
    <div class="pillars">
      <div class="pillar"><span class="pe">📝</span><div class="pname">Нотатки</div><div class="pdesc">Ідеї, чернетки, питання від підписниць.</div></div>
      <div class="pillar"><span class="pe">📊</span><div class="pname">Статистика</div><div class="pdesc">Місячна динаміка з графіками росту і охоплення.</div></div>
      <div class="pillar"><span class="pe">🤖</span><div class="pname">ШІ-чат</div><div class="pdesc">Аналіз стат, ідеї, тексти підписів, сценарії.</div></div>
      <div class="pillar"><span class="pe">🪞</span><div class="pname">Рефлексія</div><div class="pdesc">25 питань для самоосмислення з ротацією і збереженням.</div></div>
      <div class="pillar"><span class="pe">🔥</span><div class="pname">Стрік + цілі</div><div class="pdesc">Лічильник днів і прогрес по цілях.</div></div>
      <div class="pillar"><span class="pe">🛠</span><div class="pname">Інструменти + практики</div><div class="pdesc">Підбірка зовнішніх застосунків + структуровані вправи.</div></div>
    </div>
  </div>`;
}

const sec=(h)=>`<div class="sec">${h}</div>`;
const lbl=(t)=>`<div class="slbl">${t}</div>`;
const cncpt=(l,t,c)=>`<div class="cncpt"><div class="cnl" style="color:${c}">${l}</div><p class="cnt">${t}</p></div>`;
const pill2=(e,n,p,d,tags)=>`<div class="pillar"><span class="pe">${e}</span><div class="pname">${n}</div><div class="ppct">${p}</div><div class="pdesc">${d}</div><div class="ptags">${tags.map(t=>`<span class="ptag">${t}</span>`).join('')}</div></div>`;
const str2=(t,c)=>`<div class="stritem"><div class="sdot" style="background:${c}"></div><div class="stxt">${t}</div></div>`;
const blk2=(icon,bg,ttl,sub,body)=>`<div class="blk" onclick="this.classList.toggle('on')"><div class="bkh"><div class="bki" style="background:${bg}">${icon}</div><div><div class="bkt">${ttl}</div><div class="bks">${sub}</div></div><div class="bkarr">↓</div></div><div class="bkb">${body}</div></div>`;
const exc2=(l,t)=>`<div class="exc"><div class="exl">${l}</div><div class="ext">${t}</div></div>`;
const wk2=(num,name,ac,focus,items)=>`<div class="wkcard"><div class="wkg"><div class="wkn" style="background:#111"><div class="wknum" style="color:${ac}">${num}</div><div class="wkname">${name}</div></div><div class="wkc"><div class="wkf">${focus}</div><ul class="wki">${items.map(i=>`<li>${i}</li>`).join('')}</ul></div></div></div>`;
const pwk2=(ttl,sub,days)=>`<div class="pwk" onclick="this.classList.toggle('on')"><div class="pwkh"><div><div class="pwkt">${ttl}</div><div class="pwks">${sub}</div></div><div class="pwkarr">↓</div></div><div class="pwkb">${days.map(d=>`<div class="pday"><div class="pdayn">${d[0]}</div><div class="pdayc">${d[1]}</div></div>`).join('')}</div></div>`;
const ig=t=>`<span class="plt ig">${t}</span>`;
const tt=t=>`<span class="plt tt">${t}</span>`;
const wt=(t,c)=>`<span class="wtag wt-${c}">${t}</span>`;
const div2=()=>`<div class="divider"></div>`;
const refcard=(t,qs)=>`<div class="refc"><div class="refct">${t}</div><ul class="qlist">${qs.map(q=>`<li>${q}</li>`).join('')}</ul></div>`;
const faq=(q,a)=>`<div class="faqitem" onclick="this.classList.toggle('on')"><div class="faqq">${q}<span class="faqarr">↓</span></div><div class="faqa">${a}</div></div>`;

// START
init();
