// ══════════════════════════════════════════
// SUPABASE CONFIG
// ══════════════════════════════════════════
const SB_URL = 'https://lrronntdfuyrzmkdeusa.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycm9ubnRkZnV5cnpta2RldXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzUwOTYsImV4cCI6MjA5NDc1MTA5Nn0.XVZJ3L7MvIzkdYCTfqx9SZxDDtk0Ym37jg0y_HxS7FE';
const sb = supabase.createClient(SB_URL, SB_KEY);

// ══════════════════════════════════════════
// USER PROFILES
// ══════════════════════════════════════════
const USERS = {
  vika:{
    name:'Віка',brand:'кішкас',design:'modern',reflectRotate:true,emoji:'🐱',color:'#FF6B9D',role:'кішкас · лайфстайл',
    heroTag:'🐱 кішкас · план ментора',
    heroTitle:'Від блокеру<br>до <span style="color:#FF6B9D">публікації</span>',
    heroDesc:'Ти не починаєш з нуля. Ти продовжуєш — але тепер із системою і розумінням навіщо це тобі.',
    pills:['організація','краса','лайф','продуктивність','покупки'],
    chips:['📊 Аналіз статистики','💡 Ідеї контенту','📝 Написати пост','🎬 Сценарій для Reels','📈 Як рости','😶 Застрягла — що робити'],
    chipTexts:[
      'Проаналізуй мою статистику. Що йде добре, що погано, що треба покращити?',
      'Запропонуй 10 конкретних ідей контенту для мого профілю на наступний тиждень.',
      'Допоможи написати текст підпису для поста про організацію простору або прибирання.',
      'Напиши сценарій для 30-секундного Reels — clean with me або GRWM.',
      'Як органічно рости в Instagram? Конкретні поради для мого профілю.',
      'Я застрягла і не можу регулярно постити. Допоможи розібратись чому і що з цим робити.'
    ],
    aiCtx:'Ти консультуєш Віку — дівчину яка веде лайфстайл-блог в Instagram і TikTok. Профіль: організація простору, прибирання, краса, макіяж, кулінарія, секонд-хенд, розпаковки, читання, мозаїка, спорт, рибалка, природа, продуктивність, ШІ-інструменти. Розробниця та студентка КНУ.'
  },
  aluna:{
    name:'Алуна',emoji:'🎧',color:'#FF4444',role:'лайфстайл · music vibes',
    heroTag:'🎧 алуна · план ментора',
    heroTitle:'Живи зараз.<br><span style="color:#FF4444">Знімай завжди.</span>',
    heroDesc:'Твій контент — це те що відбувається прямо зараз. Настрій, розпаковки, спорт, магазини, моменти.',
    pills:['настрій','розпаковки','спорт','харчування','лайф'],
    chips:['📊 Аналіз статистики','💡 Ідеї контенту','📝 Написати пост','🎬 Сценарій для Reels','🛍 Контент з шопінгу','💪 Фітнес контент'],
    chipTexts:[
      'Проаналізуй мою статистику. Що йде добре, що погано, що треба покращити?',
      'Запропонуй 10 конкретних ідей контенту для мого профілю — настрій, розпаковки, спорт, life.',
      'Допоможи написати короткий текст підпису для поста про покупку або розпаковку.',
      'Напиши сценарій для Reels на тему "мій день" або "що купила сьогодні".',
      'Як знімати контент після шопінгу щоб він набирав охоплення?',
      'Як поєднати фітнес рутину і харчування в цікавий контент?'
    ],
    aiCtx:'Ти консультуєш Алуну — дівчину яка веде лайфстайл-блог в Instagram і TikTok. Фокус на ЗАРАЗ: настрій, розпаковки, магазини, лайфхаки, спорт і харчування, краса. У минулому: повар, бариста, заводи в Польщі — це може бути контентом в майбутньому але не основа зараз. Основа: реальне щоденне life.'
  },
  demo:{
    name:'Демо',brand:'Sprout · демо',design:'modern',reflectRotate:true,emoji:'🌱',color:'#0066FF',role:'демо-перегляд',
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
    name:'Користувачка',brand:'Sprout',design:'modern',reflectRotate:true,emoji:'🌱',color:'#0066FF',role:'нова користувачка',
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
  dodo:{
    name:'Додо',emoji:'💆',color:'#4DA6FF',role:'б\'юті майстер · брови та вії',navStyle:'classic',
    heroTag:'💆 додо · план ментора',
    heroTitle:'Кожна робота —<br><span style="color:#4DA6FF">це контент.</span>',
    heroDesc:'Ти щодня перетворюєш людей. Просто почни знімати те що вже відбувається — решта прийде.',
    pills:['брови','вії','б\'юті','спорт','лайф'],
    chips:['📊 Аналіз статистики','👁 Ідеї для б\'юті','📝 Підпис до роботи','🎬 Сценарій процесу','❓ FAQ пост','🧘 Подолання сорому'],
    chipTexts:[
      'Проаналізуй мою статистику. Що йде добре, що погано, що треба покращити?',
      'Запропонуй 10 ідей контенту для б\'юті майстра — роботи, процес, особисте.',
      'Допоможи написати підпис до фото результату — брови або вії.',
      'Напиши сценарій для 30-секундного відео процесу нарощування вій або корекції брів.',
      'Напиши пост-FAQ для клієнтів: що треба знати перед нарощуванням вій.',
      'Я соромлюсь виставляти свої роботи. Допоможи з цим розібратись і зробити перший крок.'
    ],
    aiCtx:'Ти консультуєш Додо — майстра з брів та нарощування вій яка працює в салоні краси. Профіль: б\'юті роботи (брови 40-50%, вії), процес, до/після, спортзал, харчування, кулінарія, розпаковки, лайф. Блокери: сором, думає що люди осудять, перфекціонізм. Ціль: залучати нових клієнтів через Instagram + особистий контент.'
  }
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
// INIT
// ══════════════════════════════════════════
async function init() {
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      enterResetMode();
    }
  });
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    sbUser = session.user;
    const meta = session.user.user_metadata;
    const profileKey = meta?.profile;
    if (profileKey && USERS[profileKey]) {
      CU = profileKey;
    } else {
      CU = 'default';
    }
    loginSuccess();
    return;
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
  document.getElementById('aname-wrap').style.display = 'none';
  document.getElementById('aforgot-link').style.display = 'none';
  document.getElementById('aforgot-ok').style.display = 'none';
  document.getElementById('aerr').style.display = 'none';
  document.querySelector('#apass-wrap .albl').textContent = 'Новий пароль';
  document.getElementById('apass').placeholder = 'Мінімум 6 символів';
  document.getElementById('apass').value = '';
  const btn = document.getElementById('abtn');
  btn.style.display = '';
  btn.textContent = 'Зберегти пароль →';
  btn.onclick = doResetPassword;
}

async function doResetPassword() {
  const newPass = document.getElementById('apass').value;
  const errEl = document.getElementById('aerr');
  errEl.style.display = 'none';
  if (!newPass || newPass.length < 6) {
    errEl.textContent = 'Пароль має бути мінімум 6 символів';
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
    errEl.textContent = e.message || 'Сталась помилка, спробуй ще раз';
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
  document.getElementById('aname-wrap').style.display = 'none';
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
}

function setMode(mode, el) {
  authMode = mode;
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('on'));
  if (el) el.classList.add('on');
  const isForgot = mode === 'forgot';
  document.getElementById('areset-banner').style.display = 'none';
  document.getElementById('aemail-wrap').style.display = 'block';
  document.getElementById('apass-wrap').style.display = isForgot ? 'none' : 'block';
  document.getElementById('aname-wrap').style.display = mode === 'reg' ? 'block' : 'none';
  document.getElementById('aforgot-link').style.display = (mode === 'login') ? 'block' : 'none';
  document.getElementById('aforgot-ok').style.display = 'none';
  document.getElementById('aerr').style.display = 'none';
  document.querySelector('#apass-wrap .albl').textContent = 'Пароль';
  document.getElementById('apass').placeholder = '••••••';
  const btn = document.getElementById('abtn');
  btn.style.display = '';
  if (isForgot) {
    btn.textContent = 'Надіслати посилання →';
    btn.onclick = doForgot;
  } else {
    btn.textContent = mode === 'reg' ? 'Зареєструватись →' : 'Увійти →';
    btn.onclick = doAuth;
  }
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
    errEl.textContent = e.message || 'Сталась помилка, спробуй ще раз';
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
  const btn = document.getElementById('abtn');
  btn.textContent = '...'; btn.disabled = true;
  try {
    if (authMode === 'reg') {
      const name = document.getElementById('aname').value || 'Користувачка';
      const { data, error } = await sb.auth.signUp({
        email, password: pass,
        options: { data: { profile: 'default', name } }
      });
      if (error) throw error;
      if (data.user) { sbUser = data.user; CU = 'default'; loginSuccess(); }
      else showErr('Перевір email для підтвердження');
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      sbUser = data.user;
      const meta = data.user.user_metadata;
      CU = (meta?.profile && USERS[meta.profile]) ? meta.profile : 'default';
      loginSuccess();
    }
  } catch(e) {
    showErr(e.message === 'Invalid login credentials' ? 'Невірний email або пароль' : e.message);
  } finally { btn.disabled = false; btn.textContent = authMode === 'reg' ? 'Зареєструватись →' : 'Увійти →'; }
}

function showErr(msg) {
  const el = document.getElementById('aerr');
  el.textContent = msg; el.style.display = 'block';
}

function enterDemo() {
  CU = 'demo'; sbUser = null;
  if (!localStorage.getItem(`ksk_demo_notes`)) lsave('notes', DEMO_NOTES);
  if (!localStorage.getItem(`ksk_demo_stats`)) lsave('stats', DEMO_STATS);
  loginSuccess();
}

function loginSuccess() {
  const u = USERS[CU];
  document.documentElement.style.setProperty('--ac', u.color);
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('nusr').textContent = 'вийти';
  document.getElementById('nbrand').style.color = u.color;
  document.getElementById('nbemoji').textContent = u.emoji;
  document.getElementById('nbname').textContent = (u.brand || u.name).toLowerCase();
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
  document.getElementById('newnotebtn').style.background = u.color;
  document.getElementById('statsavebtn').style.background = u.color;
  document.getElementById('aisend').style.background = u.color;
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

async function doLogout() {
  if (!confirm('Вийти?')) return;
  if (sbUser) await sb.auth.signOut();
  CU = null; sbUser = null; curNoteId = null; chatHistory = [];
  Object.values(charts).forEach(c => c && c.destroy && c.destroy());
  charts = {};
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  document.documentElement.style.setProperty('--ac','#FF6B9D');
  document.body.classList.remove('theme-modern','dark','nav-classic');
  document.querySelectorAll('.pcard').forEach(c=>c.classList.remove('sel'));
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
const lsave = (k,v) => localStorage.setItem(LK(k), JSON.stringify(v));
const lload = (k,d) => { try { const v=localStorage.getItem(LK(k)); return v?JSON.parse(v):d; } catch{return d;} };

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
    const otherInput = otherId ? `<input type="text" id="${otherId}" value="${(otherValue||'').replace(/"/g,'&quot;')}" placeholder="Свій варіант (опціонально)" style="margin-top:8px">` : '';
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
      <textarea id="${id}" placeholder="${placeholder}" style="min-height:60px">${(current||'').replace(/</g,'&lt;')}</textarea>
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
  const isCustom = p.accent_color && !PALETTE.includes(p.accent_color);
  const colorPaletteHTML = `
    <div class="pf-row">
      <label>Акцентний колір</label>
      <div class="color-palette" data-name="accent_color">
        ${PALETTE.map(c => `<button type="button" class="color-swatch ${p.accent_color===c?'on':''}" data-color="${c}" style="background:${c}" onclick="selectAccentColor('${c}')"></button>`).join('')}
        <label class="color-custom-wrap" title="Свій колір" ${isCustom?'style="border-style:solid;border-color:'+p.accent_color+'"':''}>
          <input type="color" id="p-customColor" value="${p.accent_color || '#FF6B9D'}" oninput="selectAccentColor(this.value,true)">
        </label>
      </div>
    </div>`;

  return [
    head('Про тебе'),
    `<div class="pf-row">
      <label>Як тебе називати (ім'я, нік, псевдонім)</label>
      <input type="text" id="p-name" value="${(p.display_name||'').replace(/"/g,'&quot;')}" placeholder="Наприклад: Олена, або Olenka_blog, або просто Анонім">
    </div>`,
    `<div class="pf-row">
      <label>Емодзі для лівого кутка</label>
      <div class="emoji-row">
        <span class="emoji-current" id="emojiCurrent">${p.display_emoji || '🙂'}</span>
        <input type="hidden" id="p-emoji" value="${(p.display_emoji||'').replace(/"/g,'&quot;')}">
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

function setEmojiFavicon(emoji) {
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
}

async function applyProfileOverrides() {
  const p = await dbProfile();
  const u = USERS[CU] || {};
  const defaultEmoji = u.emoji || '🌱';
  const defaultName = u.brand || u.name || 'користувач';
  if (!p) {
    setEmojiFavicon(defaultEmoji);
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
  setEmojiFavicon(usedEmoji);
  document.title = `${usedName} · платформа для росту`;
  if (p.accent_color) {
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
  // Auto-migrate hardcoded profile data to Supabase on first login
  if (['vika','aluna','dodo'].includes(CU) && sbUser && (!p || !p.ai_context)) {
    const u = USERS[CU];
    dbSaveProfile({
      ...(p || {}),
      ai_context: u.aiCtx,
      display_name: p?.display_name || u.name,
      display_emoji: p?.display_emoji || u.emoji,
      accent_color: p?.accent_color || u.color,
    });
  }
}

function buildPersonalizedHero(p) {
  const ac = 'color:var(--ac)';
  const w = t => `<span style="${ac}">${t}</span>`;
  const name = p?.display_name || '';
  const greeting = name ? `${name.split(' ')[0]}, ` : '';

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

async function openProfileModal() {
  const p = await dbProfile() || {};
  document.getElementById('profileForm').innerHTML = profileFormHTML(p);
  document.getElementById('profile-modal').classList.add('on');
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
    const res = await fetch('/api/chat', {
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
    showToast('Помилка: ' + e.message, 'error');
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

function renderMentorPlan(plan) {
  const u = USERS[CU];
  const c = u.color;
  const positioning = plan.positioning ? `<div class="cncpt"><div class="cnl" style="color:${c}">🎯 позиціонування</div><p class="cnt">${plan.positioning}</p></div>` : '';
  const thisWeek = (plan.this_week && plan.this_week.length) ? `
    <div class="card" style="border-left:3px solid ${c}">
      <div class="ctitle">📌 Що зробити цього тижня</div>
      <ul class="qlist" style="margin-top:8px">${plan.this_week.map(t=>`<li>${t}</li>`).join('')}</ul>
    </div>` : '';
  const pillars = plan.pillars && plan.pillars.length ? `
    <div class="slbl">Опори контенту</div>
    <div class="pillars">${plan.pillars.map(p=>`
      <div class="pillar">
        <span class="pe">${p.emoji||'🎯'}</span>
        <div class="pname">${p.name||''}</div>
        <div class="pdesc">${p.desc||''}</div>
        ${(p.tags&&p.tags.length)?`<div class="ptags">${p.tags.map(t=>`<span class="ptag">${t}</span>`).join('')}</div>`:''}
      </div>`).join('')}</div>` : '';
  const formula = plan.formula && plan.formula.parts ? `
    <div class="slbl">Формула контенту${plan.formula.label?' — '+plan.formula.label:''}</div>
    <div class="fmlbox">${plan.formula.parts.map(p=>`
      <div>
        <div class="fpct" style="color:${c}">${p.percent||''}</div>
        <div class="flbl">${(p.label||'')}${p.desc?' — '+p.desc:''}</div>
      </div>`).join('')}</div>` : '';
  const weeks = plan.weeks && plan.weeks.length ? `
    <div class="slbl">Тижнева дорога</div>
    ${plan.weeks.map(w=>`
      <div class="wkcard">
        <div class="wkg">
          <div class="wkn" style="background:#111">
            <div class="wknum" style="color:${c}">${w.num||''}</div>
            <div class="wkname">${w.name||''}</div>
          </div>
          <div class="wkc">
            <div class="wkf">${w.focus||''}</div>
            <ul class="wki">${(w.items||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
          </div>
        </div>
      </div>`).join('')}` : '';
  const blockers = plan.strategy_per_blocker && plan.strategy_per_blocker.length ? `
    <div class="slbl">Стратегії під твої блокери</div>
    ${plan.strategy_per_blocker.map(b=>`
      <div class="card">
        <div style="font-size:14px;font-weight:700;color:${c};margin-bottom:6px">${b.blocker||''}</div>
        <div style="font-size:14px;line-height:1.6;color:var(--ink2)">${b.advice||''}</div>
      </div>`).join('')}` : '';
  const prompts = plan.quick_prompts && plan.quick_prompts.length ? `
    <div class="slbl">Швидкі ШІ-промпти під твою нішу</div>
    <div class="chips" style="margin-bottom:18px">${plan.quick_prompts.map(p=>`<div class="chip" onclick="askAiFromDash(${JSON.stringify(p.text||'').replace(/"/g,'&quot;')})">${p.label||''}</div>`).join('')}</div>` : '';

  const hasBase = ['vika','aluna','dodo'].includes(CU);
  return `<div class="sec">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:8px">
      <div class="slbl" style="margin:0">Твій персональний план</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-out btn-sm" onclick="regenerateMentorPlan()">↻ Перегенерувати</button>
        ${hasBase ? '<button class="btn btn-out btn-sm" onclick="deleteMentorPlan()">↩ Базовий план</button>' : ''}
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
      <div class="goal-head"><strong style="font-size:14px">${g.network==='ig'?'Instagram':g.network==='tt'?'TikTok':g.network==='tg'?'Telegram':'YouTube'}: ${cur}/${g.target}</strong></div>
      <div class="goal-bar"><div class="goal-fill" style="width:${pct}%;background:${WIDGET_BY_ID.goals.color}"></div></div>
      <div class="goal-meta">${pct}%${g.deadline?` · до ${g.deadline}`:''}</div>
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
  const body = `<div style="font-size:13px;color:var(--muted);margin-bottom:10px">${last.month} ${last.year}</div>
    <div class="scards">${allCards.map(s=>`<div class="scard"><div class="sv">${last[s.k]||0}</div><div class="sl">${s.l}</div>${chg(last,prev,s.k)}</div>`).join('')}</div>`;
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
    <div class="ndt">${n.created_at?new Date(n.created_at).toLocaleDateString('uk-UA'):(n.date||'')}</div>
    <div class="nttl">${n.title||'Без назви'}</div>
    <div class="nprv">${n.content||n.text||''}</div>
  </div>`).join('');
  return blk('notes', body, {fn:"goTab('notes')", label:'Всі →'});
}

function widgetReflectDay() {
  const pool = REFLECT_QS[CU] || REFLECT_QS.vika || [];
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
  const body = `<div style="font-size:13px;color:var(--ink2);line-height:1.6;white-space:pre-wrap">${preview}</div>`;
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
    : notes.map(n=>`<div class="nitem${curNoteId===n.id?' on':''}" onclick="openNote('${n.id}')">
        <button class="ndel" onclick="event.stopPropagation();delNoteById('${n.id}')">✕</button>
        <div class="ndt">${n.created_at ? new Date(n.created_at).toLocaleDateString('uk-UA') : (n.date||'')}</div>
        <div class="nttl">${n.title||'Без назви'}</div>
        <div class="nprv">${(n.content||n.text||'')}</div></div>`).join('');
}

function newNote() {
  curNoteId = '__new__';
  document.getElementById('nttl').value='';
  document.getElementById('ntxt').value='';
  document.getElementById('ned').style.display='block';
  document.getElementById('nph').style.display='none';
  document.getElementById('nttl').focus();
}

async function openNote(id) {
  const notes = await dbNotes();
  const n = notes.find(x=>x.id===id);
  if (!n) return;
  curNoteId = id;
  document.getElementById('nttl').value = n.title||'';
  document.getElementById('ntxt').value = n.content||n.text||'';
  document.getElementById('ned').style.display='block';
  document.getElementById('nph').style.display='none';
  await loadNotes();
}

async function saveNote() {
  const title = document.getElementById('nttl').value || 'Без назви';
  const content = document.getElementById('ntxt').value;
  if (!content.trim()) return;
  const note = curNoteId === '__new__'
    ? { id: Date.now().toString(), title, content, date: new Date().toLocaleDateString('uk-UA'), _new: true }
    : { id: curNoteId, title, content };
  await dbSaveNote(note);
  closeNote();
  renderHome();
  showToast('✓ Збережено', 'success');
}

async function delNote() {
  if (!curNoteId || !confirm('Видалити?')) return;
  await delNoteById(curNoteId);
}

async function delNoteById(id) {
  await dbDelNote(id);
  if (curNoteId === id) closeNote();
  await loadNotes();
  renderHome();
}

function closeNote() {
  curNoteId = null;
  document.getElementById('ned').style.display='none';
  document.getElementById('nph').style.display='block';
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
        <div><div class="mn">${m.month} ${m.year}</div>${m.note?`<div class="mm">${m.note.substring(0,60)}${m.note.length>60?'...':''}</div>`:''}</div>
        <div class="mbadges">
          ${platforms.includes('ig')?`<span class="mbadge">IG ${m.ig||0}</span>`:''}
          ${platforms.includes('tt')?`<span class="mbadge">TT ${m.tt||0}</span>`:''}
          ${platforms.includes('tg')?`<span class="mbadge">TG ${m.tg||0}</span>`:''}
          ${platforms.includes('yt')?`<span class="mbadge">YT ${m.yt||0}</span>`:''}
          <button class="btn btn-out btn-sm" onclick="editMonth('${m.id}')">✎</button>
          <button class="btn btn-red btn-sm" onclick="delMonthById('${m.id}')">✕</button>
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

async function delMonthById(id) {
  if (!confirm('Видалити місяць?')) return;
  await dbDelStat(id);
  if (editingMonthId === id) cancelEditMonth();
  await loadStats();
  renderCharts();
  renderHome();
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
  div.innerHTML = `<div class="chatav">${role==='user'?u.emoji:'🤖'}</div><div class="chatb">${text}</div>`;
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

function escapeHTML(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
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
    return `<div class="${cls}"><div class="chatav">${av}</div><div class="chatb">${escapeHTML(m.content)}</div></div>`;
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
    ${chats.map(c => `<div class="chat-list-item ${String(c.id)===String(currentChatId)?'active':''}" onclick="loadChat('${c.id}')">
      <span class="chat-list-title">${escapeHTML(c.title || 'Без назви')}</span>
    </div>`).join('')}
  `).join('');
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

async function deleteCurrentChat() {
  if (!currentChatId) return;
  if (!confirm('Видалити цей чат назавжди?')) return;
  await dbDelChat(currentChatId);
  newChat();
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
    const res = await fetch('/api/chat', {
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
    bubbleEl.textContent = 'Помилка з\'єднання. Перевір інтернет.';
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
  vika:[
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
  aluna:[
    {q:'Що цікавого відбулось цього тижня що я ще не показала?',cat:'Контент'},
    {q:'Який момент сьогоднішнього дня я б хотіла зняти — але не зняла?',cat:'Контент'},
    {q:'Що мене зупиняє від регулярного постингу прямо зараз?',cat:'Голова'},
    {q:'Який з минулих досвідів (кухня, бариста, Польща) я хотіла б показати в майбутньому?',cat:'Майбутнє'},
    {q:'Що зайшло людям найкраще цього тижня — і що це говорить про мою аудиторію?',cat:'Ріст'},
    {q:'Якби я знімала тільки для однієї людини — хто вона і що їй цікаво?',cat:'Ріст'},
  ],
  dodo:[
    {q:'Скільки робіт цього тижня я зробила і не виклала — і чому?',cat:'Робота'},
    {q:'Яке питання клієнтки я чую найчастіше — це вже готова тема для поста?',cat:'Робота'},
    {q:'Сором ще є — або вже трохи легше? Що змінилось?',cat:'Голова'},
    {q:'Що в моїй роботі я вважаю звичайним але інші кажуть "вау"?',cat:'Голова'},
    {q:'Скільки потенційних клієнтів не побачили мої роботи цього тижня?',cat:'Ріст'},
    {q:'Що б відрізнило мій профіль від інших б\'юті майстрів?',cat:'Ріст'},
  ]
};
// Demo and default users share Vika's question pool (generic enough)
REFLECT_QS.demo = REFLECT_QS.vika;
REFLECT_QS.default = REFLECT_QS.vika;

function pickReflectSet(user, n=4) {
  const pool = REFLECT_QS[user] || REFLECT_QS.vika || [];
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
  const pool = REFLECT_QS[CU] || REFLECT_QS.vika || [];
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
    const ans = (answers[idx] || '').replace(/</g,'&lt;');
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
  const ans = document.getElementById('rq'+idx).value.trim();
  if (!ans) return;
  const st = document.getElementById('rst'+idx);
  const out = document.getElementById('rans'+idx);
  st.textContent = '⏳'; out.classList.remove('on');
  const q = REFLECT_QS[CU][idx].q;
  try {
    const res = await fetch('/api/chat',{
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
  } catch { out.textContent='Помилка з\'єднання.'; out.classList.add('on'); st.textContent='❌'; }
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
  const input = document.getElementById('audienceInput').value.trim();
  if (!input) return alert('Опиши що знаєш про аудиторію');
  const out = document.getElementById('audienceResult');
  const btn = document.getElementById('audienceBtn');
  btn.disabled = true; const orig = btn.textContent; btn.textContent = '⏳';
  try {
    const res = await fetch('/api/chat',{
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
    out.textContent = 'Помилка з\'єднання.';
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
      ${allCards.map(c=>`<div><div class="sv" style="font-size:22px">${c.v}</div><div class="sl">${c.l}</div></div>`).join('')}
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
          <div class="goal-head"><strong>${label}: ${cur} / ${g.target}</strong>
            <button class="btn btn-red btn-sm" onclick="dbDelGoal('${g.id}')">✕</button>
          </div>
          <div class="goal-bar"><div class="goal-fill" style="width:${pct}%"></div></div>
          <div class="goal-meta">${pct}% · залишилось ${remain}${g.deadline?` · до ${g.deadline}`:''}</div>
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
    const res = await fetch('/api/chat',{
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
    out.textContent = 'Помилка з\'єднання.';
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
function renderTools() {
  const sections = [
    {title:'✂️ Монтаж відео',tools:[
      {e:'📱',si:'capcut',n:'CapCut',d:'Найкращий для Reels і TikTok. Автосубтитри, шаблони, beat sync, AI фон. Безкоштовно.',tag:'iOS + Android · Безкоштовно'},
      {e:'🎬',si:'',n:'InShot',d:'Простий і швидкий. Кадрування під всі формати, музика, текст. Ідеально для старту.',tag:'iOS + Android · Безкоштовно+'},
      {e:'⚡',si:'splice',n:'Splice',d:'Потужний timeline-монтаж на телефоні. Для більшого контролю над кліпами.',tag:'iOS · Безкоштовно+'},
    ]},
    {title:'🎨 Дизайн і графіка',tools:[
      {e:'🖌',si:'canva',n:'Canva',d:'Шаблони для сторіс, каруселей, обкладинок. Брендові кольори і шрифти.',tag:'Всі платформи · Безкоштовно+'},
      {e:'📐',si:'adobe',n:'Adobe Express',d:'Потужніший Canva. Remove background, анімації. Безкоштовна версія щедра.',tag:'Всі платформи · Безкоштовно+'},
      {e:'✨',si:'',n:'Unfold',d:'Красиві мінімалістичні шаблони для сторіс. Естетика яку любить IG аудиторія.',tag:'iOS + Android · Безкоштовно+'},
    ]},
    {title:'📸 Фото і обробка',tools:[
      {e:'🌈',si:'adobelightroom',n:'Lightroom Mobile',d:'Пресети для єдиної естетики стрічки. Один клік — консистентний вигляд.',tag:'iOS + Android · Безкоштовно+'},
      {e:'💎',si:'vsco',n:'VSCO',d:'Фільтри і пресети. Тепла або мінімалістична естетика.',tag:'iOS + Android · Безкоштовно+'},
      {e:'🪄',si:'',n:'Facetune',d:'Ретуш, вирівнювання фону. Для б\'юті контенту незамінне.',tag:'iOS + Android · Платно'},
    ]},
    {title:'📅 Планування і аналітика',tools:[
      {e:'🗓',si:'',n:'Later',d:'Планування постів наперед, drag-and-drop календар, аналітика.',tag:'Всі платформи · Безкоштовно+'},
      {e:'📊',si:'instagram',n:'Instagram Insights',d:'Вбудована аналітика. Охоплення, збереження, аудиторія, час — безкоштовно.',tag:'В додатку · Безкоштовно'},
      {e:'🎵',si:'tiktok',n:'TrendTok',d:'Трендові звуки для TikTok і Reels. Вчасно ловити тренд = більше охоплення.',tag:'Веб · Безкоштовно'},
    ]},
  ];
  const toolIcon = t => t.si
    ? `<img src="https://cdn.simpleicons.org/${t.si}" alt="${t.n}" class="brand-icon" onerror="this.outerHTML='<span class=\\'toole\\'>${t.e}</span>'">`
    : `<span class="toole">${t.e}</span>`;
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
  // For real users (not demo), check for AI-generated plan first — it overrides hardcoded
  const plan = (CU === 'demo') ? null : await dbMentorPlan();
  if (plan && plan.positioning) {
    el.innerHTML = renderMentorPlan(plan);
    return;
  }
  // No plan — show hardcoded (vika/aluna/dodo) or generic placeholder
  if(CU==='vika') { el.innerHTML = vikaM() + aiPlanCTA(); return; }
  if(CU==='aluna') { el.innerHTML = alunaM() + aiPlanCTA(); return; }
  if(CU==='dodo') { el.innerHTML = dodoM() + aiPlanCTA(); return; }
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

async function deleteMentorPlan() {
  if (!confirm('Видалити AI-план і повернутись до базового?')) return;
  if (sbUser) {
    try { await sb.from('mentor_plan').delete().eq('user_id', sbUser.id); } catch(e) { console.warn('delete plan', e); }
  }
  try { localStorage.removeItem(`ksk_${CU}_mentor_plan`); } catch(e) {}
  renderMentor();
  showToast('Повернулись до базового', 'success');
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

function vikaM(){return sec(`
  ${lbl('Концепція')}
  ${cncpt('кішкас · позиціонування','«Дівчина яка любить <strong style="color:#FF6B9D">коли все на своєму місці</strong> — і при цьому <strong style="color:#FF6B9D">повністю живе</strong>.» Організація, краса, їжа, природа, думки — все це одна людина.','#FF6B9D')}
  ${lbl('Сильні сторони')}
  <div class="strlist" style="margin-bottom:24px">${['Реальне різностороннє life — уні, робота, хобі, природа одночасно','Розробниця яка при цьому живе повно — рибалка, мозаїка, секонд','Знаєш як організувати простір, час і голову — рідко в одній людині','ШІ-досвід поданий як частина продуктивного life, а не "айті"','Широкий спектр для брендів: дім, косметика, їжа, одяг, техніка'].map(s=>str2(s,'#FF6B9D')).join('')}</div>
  ${lbl('5 контентних стовпів')}
  <div class="pillars" style="margin-bottom:24px">
    ${pill2('🧹','Простір і порядок','25%','Clean with me, організація, розхламлення, лайфхаки побуту',['TikTok','Reels'])}
    ${pill2('💄','Краса і догляд','20%','GRWM, зубна рутина, розпаковки косметики, макіяж',['Reels','TikTok'])}
    ${pill2('☀️','Лайф і відпочинок','25%','Кафе, природа, рибалка, пікнік, фільми, книги',['Сторіс','Reels'])}
    ${pill2('🧠','Продуктивність','20%','Як все встигати, ШІ-інструменти, сон, харчування',['Карусель','TikTok'])}
    ${pill2('🛍','Покупки і знахідки','10%','Секонд, розпаковки, дрібниці, мініатюри',['Reels','TikTok'])}
  </div>
  ${div2()}${lbl('Блокери')}
  ${blk2('😶','#fff8e0','«Не цікаво іншим людям»','Недовіра до власного досвіду',
    `<div class="cl cl-y">За 10 хвилин ти назвала 40+ тем. Це не нестача матеріалу — це недовіра до свого досвіду.</div>${exc2('Вправа «Список 20»','Напиши 20 речей де ти краща за більшість. Не скромно — чесно. Це і є твій контент.')}`)}
  ${blk2('😬','#ffe0e0','«Хтось буде сміятись»','Страх знайомих',
    `<div class="cl cl-r">Знайомі дивляться тиждень потім звикають. Незнайомці підписуються саме за те що ти є.</div>${exc2('Технічно','Instagram → Налаштування → Приватність → приховати конкретних людей від постів без блокування.')}`)}
  ${blk2('🛡','#e0f5e0','Безпека','Зрілий підхід',
    `<div class="safeg"><div class="safeno"><div class="safet">❌ Краще не показувати</div>${['Точна адреса','Постійний розклад','Геолокація в реалтаймі','Номер авто, документи'].map(i=>`<div class="safei">${i}</div>`).join('')}</div><div class="safeyes"><div class="safet">✅ Безпечно</div>${['Інтер\'єр без прив\'язки','Хобі, думки, покупки','Геолокація після відходу','Обличчя і голос — ок'].map(i=>`<div class="safei">${i}</div>`).join('')}</div></div>`)}
  ${div2()}${lbl('8 тижнів')}
  ${wk2('ТИЖ 1–2','Перший крок','#FF6B9D','🎯 Зламати блок і повернутись природньо',[`${wt('контент','c')} 1 сторіс — будь-що з сьогоднішнього дня`,`${wt('контент','c')} 1 пост — думка або момент`,`${wt('рефлексія','r')} Список 20 речей де ти краща за більшість`,`${wt('практика','p')} Вправа «найгірший сценарій»`])}
  ${wk2('ТИЖ 3–4','Ритм і рубрики','#FF6B9D','🎯 Знайти природній ритм',[`${wt('контент','c')} Перший Reels або TikTok — тема з побуту`,`${wt('контент','c')} Перша постійна рубрика`,`${wt('рефлексія','r')} Який контент роблю коли не думаю що це контент?`,`${wt('практика','p')} Нотатка «ідеї» в телефоні`])}
  ${wk2('ТИЖ 5–6','Корисний контент','#FF6B9D','🎯 Додати контент який зберігають',[`${wt('контент','c')} Один «корисний» пост — комуналка або тканини`,`${wt('контент','c')} GRWM або clean with me`,`${wt('рефлексія','r')} Що зайшло краще в статистиці?`,`${wt('практика','p')} «Пачка» — 2 год = 3–4 матеріали`])}
  ${wk2('ТИЖ 7–8','Система і вперед','#FF6B9D','🎯 Закріпити і зрозуміти куди далі',[`${wt('контент','c')} Підсумок місяця`,`${wt('рефлексія','r')} Блокери ще є — але чи такі ж гучні?`,`${wt('практика','p')} Список з 30 ідей — без фільтрів`])}
  ${div2()}${lbl('Контент-план · Місяць 1')}
  ${pwk2('Тиждень 1','Просто живеш і знімаєш',[['Пн/Вт',`${ig('Сторіс')} Будь-що з дня`],['Ср/Чт',`${ig('Reels')} Clean with me або організація`],['Пт',`${tt('TikTok')} Той самий контент`],['Вхідний',`${ig('Пост')} Фото тижня — 5–7 кадрів`]])}
  ${pwk2('Тиждень 2','Перший корисний пост',[['Пн',`${ig('Сторіс')} GRWM`],['Ср',`${ig('Карусель')} Корисний гайд`],['Пт',`${tt('TikTok')}${ig('Reels')} Розпаковка`],['Сб',`${ig('Пост')} Фото тижня`]])}
  ${div2()}${lbl('Рефлексія')}
  <div class="refg">
    ${refcard('Контент і цінність',['Що зняла і не думала що це контент?','Який пост мені самій найбільше сподобався?','Що люди зберігають — що це означає?'])}
    ${refcard('Страхи і голова',['Блокери ще є — але чи такі ж гучні?','Коли легко знімати, а коли важко?','Чий голос я чую коли думаю «це нецікаво»?'])}
    ${refcard('Ріст і напрям',['Що змінилось?','Якби блог був успішним — що це значить?','Що б я сказала собі місяць тому?'])}
  </div>
  ${lbl('Формула контенту')}
  <div class="fmlbox" style="margin-bottom:18px">
    <div><div class="fpct" style="color:#FF6B9D">70%</div><div class="flbl">Звичайне life — те що і так робиш</div></div>
    <div><div class="fpct" style="color:#FF6B9D">20%</div><div class="flbl">Реакція і думки — огляди, «я спробувала»</div></div>
    <div><div class="fpct" style="color:#FF6B9D">10%</div><div class="flbl">Серійний — рубрики, корисні гайди</div></div>
  </div>
  <div class="cl cl-dk">Головне: ти вже це вміла. Просто продовжуй — але з розумінням навіщо і куди. 🐱</div>
`);}

function alunaM(){const ac='#FF4444'; return sec(`
  ${lbl('Концепція')}
  ${cncpt('алуна · позиціонування','«Живу <strong style="color:${ac}">зараз</strong> — і показую це.» Настрій, розпаковки, магазини, спорт, харчування, краса. Реальний щоденний life без фільтрів.',ac)}
  ${lbl('Сильні сторони')}
  <div class="strlist" style="margin-bottom:24px">${['Автентичне щоденне life — без прикрас і постановки','Різносторонній досвід: повар, бариста, Польща — унікальний бекграунд','Реальна рутина — спортзал, їжа, покупки — те з чим ідентифікуються','Природність і щирість — рідко в блогерів'].map(s=>str2(s,ac)).join('')}</div>
  ${lbl('5 контентних стовпів')}
  <div class="pillars" style="margin-bottom:24px">
    ${pill2('✨','Настрій і моменти','30%','Що зараз відчуваю, музика, кафе, прогулянки, день',['Сторіс','Reels'])}
    ${pill2('🛍','Розпаковки і шопінг','25%','Що купила, де знайшла, перша реакція',['TikTok','Reels'])}
    ${pill2('💪','Спорт і харчування','20%','Зал, їжа, рутина — реально, не ідеально',['Сторіс','TikTok'])}
    ${pill2('💄','Краса і догляд','15%','Косметика, рутина, розпаковки б\'юті',['Reels','TikTok'])}
    ${pill2('💬','Лайфхаки і думки','10%','Що дізналась, лайфхак дня, спостереження',['Пост','Карусель'])}
  </div>
  <div class="cl cl-y">Польща, завод, кухня, бариста — це цікавий контент для майбутнього але не основа зараз. Основа: те що відбувається сьогодні.</div>
  ${div2()}${lbl('8 тижнів')}
  ${wk2('ТИЖ 1–2','Хто ти зараз',ac,'🎯 Показати себе через реальний day-in-life',[`${wt('контент','c')} Сторіс — день без задуму, просто знімаєш`,`${wt('контент','c')} Перший Reels — розпаковка або шопінг`,`${wt('рефлексія','r')} Що я роблю кожен день і ніколи не думаю що це цікаво?`,`${wt('практика','p')} Правило: телефон завжди під рукою`])}
  ${wk2('ТИЖ 3–4','Ритм контенту',ac,'🎯 Знайти що заходить найкраще',[`${wt('контент','c')} Серія «що купила цього тижня»`,`${wt('контент','c')} Контент зі спортзалу або після тренування`,`${wt('рефлексія','r')} Що зайшло людям краще — і чому?`,`${wt('практика','p')} «Пачка» — 2 год = 3–4 матеріали`])}
  ${wk2('ТИЖ 5–6','Регулярність',ac,'🎯 3+ пости на тиждень стабільно',[`${wt('контент','c')} GRWM або ранкова рутина`,`${wt('контент','c')} Лайфхак або спостереження тижня`,`${wt('рефлексія','r')} Що мене зупиняє від регулярного постингу?`,`${wt('практика','p')} Планую 3 пости наперед`])}
  ${wk2('ТИЖ 7–8','Своя ніша',ac,'🎯 Зрозуміти що є "моїм"',[`${wt('контент','c')} Підсумок місяця — що змінилось`,`${wt('рефлексія','r')} Що я показую і чого ще не показую?`,`${wt('практика','p')} Список 30 ідей — без фільтрів`])}
  ${div2()}${lbl('Контент-план · Місяць 1')}
  ${pwk2('Тиждень 1','Знайомство',[['Пн',`${ig('Сторіс')} День без задуму — 4-5 кадрів`],['Ср',`${tt('TikTok')}${ig('Reels')} Розпаковка або покупка`],['Пт',`${ig('Сторіс')} Вечір або настрій`],['Нд',`${ig('Пост')} Фото тижня`]])}
  ${pwk2('Тиждень 2','Спорт і їжа',[['Вт',`${tt('TikTok')} Що їм або що приготувала`],['Чт',`${ig('Сторіс')} До або після залу`],['Сб',`${ig('Reels')} Шопінг або розпаковка`],['Нд',`${ig('Пост')} Настрій тижня`]])}
  ${div2()}${lbl('Рефлексія')}
  <div class="refg">
    ${refcard('Про контент',['Що сьогодні відбулось що я б хотіла показати?','Який момент тижня найбільш «впізнаваний» для інших?','Що я знімаю природньо і без задуму?'])}
    ${refcard('Про life',['Що зараз займає більшість мого часу і думок?','Що мені подобається в своєму щоденному житті?','Який досвід (Польща/кухня/бариста) я б хотіла показати колись?'])}
  </div>
  <div class="cl cl-dk">Твій контент — це те що відбувається прямо зараз. Просто підніми телефон. 🎧</div>
`);}

function dodoM(){const ac='#4DA6FF'; return sec(`
  ${lbl('Пам\'ятка')}
  ${cncpt('додо · б\'юті майстер','Ти щодня <strong style="color:${ac}">перетворюєш людей</strong>. Кожна клієнтка виходить від тебе іншою. Це вже контент — просто треба починати знімати те що вже відбувається.',ac)}
  ${lbl('Сильні сторони')}
  <div class="strlist" style="margin-bottom:24px">${['Майстер з реальним результатом — кожна робота це доказ твого вміння','До/після клієнтів — найпотужніший формат у б\'юті ніші','Гарна зовнішність — ти сама є рекламою свого мистецтва','Поєднання роботи і life — близькість і довіра аудиторії','Щоденна рутина в салоні — безмежний матеріал для контенту'].map(s=>str2(s,ac)).join('')}</div>
  ${lbl('5 контентних стовпів')}
  <div class="pillars" style="margin-bottom:24px">
    ${pill2('👁','Брови і вії','40–50%','До/після, процес, FAQ, типи форм, догляд',['Reels','TikTok','Карусель'])}
    ${pill2('💆','Б\'юті і догляд','20%','Засоби, рутина, розпаковки косметики',['Сторіс','Reels'])}
    ${pill2('💪','Спорт і харчування','15%','Зал, їжа, рутина — реально',['Сторіс','TikTok'])}
    ${pill2('🍳','Кулінарія і life','10%','Що готую, кафе, моменти дня',['Сторіс','Пост'])}
    ${pill2('💬','Думки про б\'юті','5%','Про індустрію, тренди, спостереження',['Пост'])}
  </div>
  ${div2()}${lbl('Твої блокери — і що з ними')}
  ${blk2('😳',`${ac}33`,'«Соромно і страшно що скажуть»','Найпоширеніший блокер у б\'юті ніші',
    `<div class="cl cl-p">Ті хто «скажуть щось» — це не твоя аудиторія. Твоя аудиторія — дівчата які хочуть гарні брови і вії і шукають майстра якому можна довіряти.</div>${exc2('Факт','Б\'юті майстри — одні з найуспішніших ніш в Instagram. Клієнти вибирають майстра через блог. Показуючи роботу ти знаходиш клієнтів.')}`)}
  ${blk2('🤔',`${ac}33`,'«Занадто довго думаю перед публікацією»','Перфекціонізм паралізує',
    `<div class="cl cl-y">Ідеальне фото яке ти не виклала — не існує. Середнє яке виклала — працює.</div>${exc2('Правило 2 хвилин','Якщо фото зроблено і ти думаєш чи постити — постиш. Без додаткових роздумів.')}${exc2('Статистика','Кожна незнята робота = потенційна клієнтка яка її не побачила.')}`)}
  ${blk2('📷',`${ac}33`,'«Не знаю як знімати роботи»','Технічний блокер',
    `<div class="cl cl-b">Не треба кільцеву лампу і монтаж. Потрібен телефон і природнє освітлення.</div>${exc2('Проста формула','До → процес → після. Телефон горизонтально. Хороше освітлення. Клієнт дає дозвіл. Готово.')}`)}
  ${div2()}${lbl('FAQ від клієнтів — готові теми для постів')}
  <div class="cl cl-b" style="margin-bottom:14px">Найчастіші питання клієнтів = найкращий контент. Люди шукають ці відповіді в Google і Instagram.</div>
  ${[['Чи боляче нарощувати вії?','Процедура майже безболісна — ти лежиш із заплющеними очима поки майстер працює. Невеликий дискомфорт можливий якщо довго лежати нерухомо, але більшість клієнток засинають. 😴'],
    ['Скільки тримаються нарощені вії?','В середньому 3–4 тижні до корекції. Залежить від догляду: не терти очі, уникати жирних засобів навколо очей, спати на спині.'],
    ['Як доглядати за нарощеними віями?','Перші 24 год не мочити. Потім — спеціальна щіточка, безмасляний засіб для зняття макіяжу, сушити феном на холодному режимі.'],
    ['Яка форма брів підійде моєму типу обличчя?','Кругле — прямі або з легким підйомом. Квадратне — плавна дуга. Овальне — будь-яка форма. Серцеподібне — м\'яка дуга. На консультації підбираємо індивідуально.'],
    ['Що таке ламінування вій і чим відрізняється від нарощування?','Ламінування — обробка власних вій щоб надати їм завиток і темніший колір. Нарощування — додавання штучних волосків. Ламінування виглядає натуральніше, тримається до 6 тижнів.'],
    ['Чи можна нарощувати вії якщо ношу лінзи?','Так, але лінзи треба зняти на час процедури. Після — можна одразу вдягати.'],
    ['Скільки коштує корекція і коли її треба робити?','Корекція через 3–4 тижні. Ціна нижча ніж повне нарощування — доповнюємо тільки відрослі та випавші вії.'],
    ['Чи пошкоджує нарощування власні вії?','При правильній техніці — ні. Важливо обирати досвідченого майстра і дотримуватись рекомендацій по догляду.'],
  ].map(([q,a])=>faq(q,a)).join('')}
  ${div2()}${lbl('Що знімати сьогодні')}
  <div class="ugrid" style="margin-bottom:24px">${[
    ['👁','До/після брів — одна пара = 3–4 пости'],
    ['✨','Процес нарощування вій — 15 сек тайм-лапс'],
    ['❓','Відповідь на питання клієнтки — «чи боляче?»'],
    ['📋','Типи форм брів — яка кому пасує (карусель)'],
    ['💬','Відгук клієнтки + результат'],
    ['🔧','Чим я працюю — огляд матеріалів'],
    ['💪','Ранок перед роботою — зал або кава'],
    ['🛍','Розпаковка косметики або догляду'],
  ].map(([e,t])=>`<div class="uitem"><span class="ue">${e}</span><span class="utxt">${t}</span></div>`).join('')}</div>
  ${div2()}${lbl('4 тижні · старт')}
  ${wk2('ТИЖ 1','Перший крок',ac,'🎯 Одна публікація роботи — без думок про ідеальність',[`${wt('контент','c')} Фото результату — брови або вії`,`${wt('контент','c')} Сторіс з дня в салоні`,`${wt('рефлексія','r')} Скільки робіт за місяць я не виклала — і чому?`,`${wt('практика','p')} Правило: після кожної роботи — знімаю. Завжди.`])}
  ${wk2('ТИЖ 2','Перший процес',ac,'🎯 Показати як ти робиш',[`${wt('контент','c')} Відео процесу — 15–30 секунд`,`${wt('рефлексія','r')} Що мені найбільше подобається в своїй роботі?`,`${wt('практика','p')} Попроси 3 клієнтки дати дозвіл на публікацію`])}
  ${wk2('ТИЖ 3','Особистий контент',ac,'🎯 Показати себе поза роботою',[`${wt('контент','c')} Ранок або вечір — зал або готуєш їжу`,`${wt('контент','c')} Розпаковка косметики`,`${wt('рефлексія','r')} Що зайшло краще — роботи чи особисте?`])}
  ${wk2('ТИЖ 4','Перший FAQ',ac,'🎯 Стати «експертом» у своїй ніші',[`${wt('контент','c')} Відповідь на питання яке чую найчастіше`,`${wt('контент','c')} Карусель «Як вибрати форму брів»`,`${wt('практика','p')} Мета: 12+ публікацій за місяць`])}
  ${div2()}${lbl('Контент-план · Місяць 1')}
  ${pwk2('Тиждень 1','Перша публікація роботи',[['Пн',`${ig('IG')} Фото результату — брови або вії`],['Ср',`${ig('Сторіс')} 4–5 кадрів дня в салоні`],['Пт',`${ig('IG')} Ще одна робота — до/після`],['Нд',`${ig('Пост')} Коротко про себе і свою роботу`]])}
  ${pwk2('Тиждень 2','Процес і особисте',[['Вт',`${tt('TikTok')}${ig('Reels')} Відео процесу — 15–30 сек`],['Чт',`${ig('Пост')} Думка або спостереження з салону`],['Сб',`${ig('Сторіс')} Особисте — ранок, зал або їжа`],['Нд',`${ig('IG')} Найкраща робота тижня`]])}
  ${pwk2('Тиждень 3','Експертний контент',[['Пн',`${ig('Карусель')} Типи форм брів — яка кому пасує`],['Ср',`${ig('Пост')} FAQ: найчастіше питання`],['Пт',`${ig('Reels')} Розпаковка або огляд матеріалів`],['Нд',`${ig('Сторіс')} Кінець тижня — як пройшов`]])}
  ${pwk2('Тиждень 4','Системно',[['Вт',`${tt('TikTok')}${ig('IG')} До/після з реакцією клієнтки`],['Чт',`${ig('Пост')} Особисте — що робила у вихідний`],['Сб',`${ig('Reels')} «Місяць блогу — що змінилось»`],['Нд','📊 Що зайшло краще — записати і повторити']])}
  ${div2()}${lbl('Рефлексія')}
  <div class="refg">
    ${refcard('Про роботу і контент',['Скільки робіт цього тижня я не зняла — і чому?','Яке питання клієнтки я чую найчастіше — це вже тема поста','Що в моїй роботі я вважаю звичайним але інші кажуть «вау»?'])}
    ${refcard('Про сором і страхи',['Хто конкретно може «щось сказати» — і чи важлива їхня думка?','Скільки потенційних клієнтів не побачили мої роботи через мовчання?'])}
    ${refcard('Про ріст',['Через 3 місяці регулярних публікацій — скільки нових клієнтів?','Що відрізняє майстрів яких я поважаю — вони бояться чи просто діють?'])}
  </div>
  <div class="cl cl-dk">Ти вже вмієш робити красу — тепер просто почни показувати це. Одна публікація сьогодні важливіша за ідеальний план завтра. 💆</div>
`);}

// START
init();
