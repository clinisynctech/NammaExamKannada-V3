/* ============================================================================
   NAMMA EXAM V3 — SHARED APP LAYER
   ============================================================================
   Included on every page. Config, API, session, language, chrome, helpers.

   NO SUPABASE SDK, ON PURPOSE.
   v2 imported @supabase/supabase-js from esm.sh, which pulled NINE separate
   module files (auth, realtime, storage, functions, postgrest, phoenix...)
   before the first query could even start. Measured on the live site, the
   browse page spent ~500ms on the SDK and then 1.3s on the query.

   Every call this app makes is a plain POST to /rest/v1/rpc/<name>. That is
   a fetch with two headers. The whole client is the api() function below.
   ========================================================================= */

/* ---------------------------------------------------------------------------
   CONFIG — fill these in from Settings → API in your v3 Supabase project
   ------------------------------------------------------------------------ */
const CFG = {
  url: 'https://kycmubtmiwbopffkptox.supabase.co',
  key: 'sb_publishable_krnt4fRS5cKqhSJJdzbItQ_kOTpCW6M',
};

const SITE = {
  name: 'Namma Exam',
  whatsapp: '918088559938',
  phone: '+91 8088559938',
  email: 'info@nammaexam.com',
  community: 'https://chat.whatsapp.com/LwLAv2hf16yH85MgxCJL6c',
  play: 'https://play.google.com/store/apps/details?id=com.nammaexam.aab',
  price: 49,
  // Question images. The Sheet stores the filename WITHOUT .png and the app
  // appends it — a deliberate data-entry convention carried over from v2.
  // Confirm this folder matches where the files actually live before import.
  imageBase: 'images/questions/',
  // Where students report a missing question, image or option.
  reportForm: 'https://forms.gle/kor6b8QitLLf28We6',
};

/* The WhatsApp message is different on every page, so a reply arrives with
   some idea of what the person was doing when they got stuck. */
const WA_MSG = {
  home:      { en: 'Namaskara, I want to know more about Namma Exam.',
               kn: 'ನಮಸ್ಕಾರ, ನಮ್ಮ ಎಕ್ಸಾಮ್ ಬಗ್ಗೆ ತಿಳಿಯಬೇಕು.' },
  auth:      { en: 'Namaskara, I am having trouble registering or logging in.',
               kn: 'ನಮಸ್ಕಾರ, ನೋಂದಣಿ ಅಥವಾ ಲಾಗಿನ್‌ನಲ್ಲಿ ಸಮಸ್ಯೆ ಇದೆ.' },
  browse:    { en: 'Namaskara, I have a question about the papers.',
               kn: 'ನಮಸ್ಕಾರ, ಪ್ರಶ್ನೆಪತ್ರಿಕೆಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಇದೆ.' },
  dash:      { en: 'Namaskara, I need help with my account.',
               kn: 'ನಮಸ್ಕಾರ, ನನ್ನ ಖಾತೆಗೆ ಸಹಾಯ ಬೇಕು.' },
  result:    { en: 'Namaskara, I have a question about my result.',
               kn: 'ನಮಸ್ಕಾರ, ನನ್ನ ಫಲಿತಾಂಶದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಇದೆ.' },
  progress:  { en: 'Namaskara, I have a question about my progress.',
               kn: 'ನಮಸ್ಕಾರ, ನನ್ನ ಪ್ರಗತಿಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಇದೆ.' },
  cert:      { en: 'Namaskara, I need help with my certificate.',
               kn: 'ನಮಸ್ಕಾರ, ಪ್ರಮಾಣಪತ್ರಕ್ಕೆ ಸಹಾಯ ಬೇಕು.' },
  subscribe: { en: 'Namaskara, I want to subscribe to Namma Exam (Rs 49). My registered mobile number is ',
               kn: 'ನಮಸ್ಕಾರ, ನಾನು ಚಂದಾದಾರನಾಗಲು ಬಯಸುತ್ತೇನೆ (₹49). ನನ್ನ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ' },
  privacy:   { en: 'Namaskara, I have a question about my data.',
               kn: 'ನಮಸ್ಕಾರ, ನನ್ನ ಮಾಹಿತಿಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಇದೆ.' },
};

/* ============================================================================
   API
   ========================================================================= */

/**
 * Calls one Postgres function. Returns its JSON.
 * Throws on transport or database errors so callers can try/catch once;
 * business outcomes come back as { success:false, error:'...' } instead.
 */
async function api(fn, payload) {
  let res;
  try {
    res = await fetch(CFG.url + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: {
        'apikey': CFG.key,
        'Authorization': 'Bearer ' + CFG.key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload || {}),
    });
  } catch (e) {
    throw new Error('NETWORK');           // offline, DNS, blocked
  }

  const body = await res.text();
  let data = null;
  try { data = body ? JSON.parse(body) : null; } catch (e) { /* not json */ }

  if (!res.ok) {
    const msg = (data && (data.message || data.hint)) || ('HTTP ' + res.status);
    throw new Error(msg);
  }
  return data;
}

/** Turns an error code from the backend into something a student can read. */
const ERRORS = {
  NETWORK:               'No internet connection. Please check and try again.',
  INVALID_LOGIN:         'Wrong mobile number or password.',
  ACCOUNT_LOCKED:        'Too many wrong tries. Please wait 15 minutes.',
  INVALID_MOBILE:        'Enter a valid 10-digit mobile number.',
  NAME_REQUIRED:         'Please enter your name.',
  PASSWORD_TOO_SHORT:    'Password must be at least 4 characters.',
  CURRENT_PASSWORD_WRONG:'Your current password is not correct.',
  STUDENT_NOT_FOUND:     'That account was not found.',
  PAPER_NOT_FOUND:       'That paper is not available.',
  PAPER_LOCKED:          'This paper needs a subscription.',
  SUBSCRIPTION_REQUIRED: 'Subscribe for ₹' + SITE.price + ' to unlock this paper.',
  ATTEMPT_LIMIT_REACHED: 'You have used all your attempts on this paper.',
  NO_ACTIVE_ATTEMPT:     'This exam is not running any more.',
  RESULT_NOT_FOUND:      'No result found for this paper.',
  CERTIFICATE_NOT_FOUND: 'Certificate not found. Please check the ID.',
};
function errorText(code) { return ERRORS[code] || code || 'Something went wrong.'; }

/* ============================================================================
   SESSION  (mobile number, same model as v2)
   ========================================================================= */
const Session = {
  get()  { try { return { mobile: localStorage.getItem('nec_mobile'),
                          name:   localStorage.getItem('nec_name') }; }
           catch (e) { return { mobile:null, name:null }; } },
  set(mobile, name) { try { localStorage.setItem('nec_mobile', mobile);
                            localStorage.setItem('nec_name', name || ''); } catch (e) {} },
  clear() { try { localStorage.removeItem('nec_mobile');
                  localStorage.removeItem('nec_name'); } catch (e) {} },
  require() {
    const s = Session.get();
    if (!s.mobile) { location.href = 'auth.html?tab=login'; return null; }
    return s;
  },
};

/* ============================================================================
   LANGUAGE
   Persisted across pages. In v2 it reset to English on every navigation,
   so a Kannada reader re-tapped the toggle on every single page.
   ========================================================================= */
/* The key is versioned. Bumping it resets everyone to English once, which is
   how a stored 'kn' from earlier testing gets cleared without asking anyone
   to wipe their browser data. Bump it again if the default ever needs
   resetting for existing visitors. */
const LANG_KEY = 'ne_lang_v2';

function lang() { try { return localStorage.getItem(LANG_KEY) || 'en'; } catch (e) { return 'en'; } }

function setLang(l) {
  try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  applyLang();
  document.dispatchEvent(new CustomEvent('ne:lang', { detail: l }));
}

function applyLang() {
  const l = lang();
  document.documentElement.setAttribute('lang', l);
  document.body.classList.toggle('lang-kn', l === 'kn');
  document.querySelectorAll('[data-en]').forEach(function (el) {
    const t = l === 'kn' ? (el.dataset.kn || el.dataset.en) : el.dataset.en;
    if (el.hasAttribute('data-ph')) el.setAttribute('placeholder', t);
    else el.textContent = t;
  });
  document.querySelectorAll('.lang-toggle button').forEach(function (b) {
    b.classList.toggle('active', b.dataset.lang === l);
  });
}

/**
 * Picks the right language for a piece of CONTENT, falling back BOTH ways.
 *
 * This matters: Kannada-medium papers have question_kn filled and
 * question_en empty. v2 fell back one way only — Kannada fell back to
 * English, but English did not fall back to Kannada — so a Kannada-only
 * question rendered as a completely blank box with four empty options for
 * anyone reading in English.
 */
function pick(en, kn) {
  const wantKn = lang() === 'kn';
  const first  = wantKn ? kn : en;
  const second = wantKn ? en : kn;
  if (first && String(first).trim()) return String(first);
  return second ? String(second) : '';
}

/* ============================================================================
   SAFE RENDERING
   Every string from the database goes through esc() before it reaches
   innerHTML. v2 concatenated raw values straight in.
   ========================================================================= */
function esc(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Question text: escape first, THEN turn the authoring marker ## into a line break. */
function qtext(s) { return esc(s).replace(/##/g, '<br>'); }

/* ============================================================================
   CHROME
   ========================================================================= */
const ICONS = {
  home:     'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  browse:   'M4 5h16M4 12h16M4 19h10',
  dash:     'M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 8h6V4h-6z',
  progress: 'M4 19V5m0 14h16M8 16l3-4 3 3 5-7',
  help:     'M21 12a9 9 0 1 1-3.6-7.2L21 3l-1.2 3.6A8.9 8.9 0 0 1 21 12zM8 12h8M8 16h5',
};

function icon(name) {
  return '<svg class="ti" viewBox="0 0 24 24" width="19" height="19" fill="none" ' +
         'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
         'stroke-linejoin="round" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
}

/* The real four-colour Google Play triangle. The footer previously had the
   words "Get it on Google Play" with no mark at all, which reads as a link
   rather than a store badge. */
function playIcon() {
  return '<svg class="pb-icon" viewBox="0 0 512 512" width="20" height="20" aria-hidden="true">' +
    '<defs>' +
      '<linearGradient id="npA" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#00d9ff"/><stop offset="1" stop-color="#00a1ff"/></linearGradient>' +
      '<linearGradient id="npB" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#ffd800"/><stop offset="1" stop-color="#ffa000"/></linearGradient>' +
      '<linearGradient id="npC" x1="0" y1="1" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#ff3a44"/><stop offset="1" stop-color="#c31162"/></linearGradient>' +
      '<linearGradient id="npD" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#32e070"/><stop offset="1" stop-color="#00a045"/></linearGradient>' +
    '</defs>' +
    '<path fill="url(#npA)" d="M48 32 320 256 48 480z"/>' +
    '<path fill="url(#npB)" d="M48 32 400 200 320 256z"/>' +
    '<path fill="url(#npC)" d="M320 256 400 312 48 480z"/>' +
    '<path fill="url(#npD)" d="M320 256 400 200 448 256 400 312z"/>' +
  '</svg>';
}

/* The real WhatsApp glyph, not a generic speech bubble. */
function waIcon() {
  return '<svg viewBox="0 0 32 32" width="27" height="27" fill="#fff" aria-hidden="true">' +
    '<path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.8 1.9 6.8L3 29l6.7-2.1c1.9 1 4.1 1.6 6.3 1.6 ' +
    '7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3zm0 23.1c-2 0-3.9-.5-5.5-1.5l-.4-.2-4 1.2 1.2-3.9-.3-.4' +
    'a10.3 10.3 0 0 1-1.6-5.6C5.4 9.9 10.1 5.2 16 5.2s10.6 4.7 10.6 10.5S21.9 26.1 16 26.1zm5.8-7.9' +
    'c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-2.5-1.6 9.6 9.6 0 0 1-1.8-2.2' +
    'c-.2-.3 0-.5.1-.6l.5-.5.3-.5a.5.5 0 0 0 0-.5c-.1-.2-.7-1.7-1-2.3s-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4' +
    ' 3.5 3.5 0 0 0-1.1 2.6c0 1.5 1.1 3 1.3 3.3.2.3 2.2 3.4 5.4 4.7a19 19 0 0 0 1.8.7 4.3 4.3 0 0 0 2 .1' +
    ' 3.2 3.2 0 0 0 2.1-1.5 2.6 2.6 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z"/></svg>';
}

/**
 * Floating WhatsApp button, bottom right, above the tab bar.
 * @param {string} key - which message to prefill, see WA_MSG
 */
function renderWhatsApp(key) {
  if (document.getElementById('ne-wa')) return;
  const m = WA_MSG[key] || WA_MSG.home;
  let text = lang() === 'kn' ? (m.kn || m.en) : m.en;
  // the subscribe message ends mid-sentence so the student's own number
  // can be appended — saves asking them for it separately
  if (key === 'subscribe') {
    const s = Session.get();
    text += (s.mobile || '[my mobile number]') + '.';
  }
  const a = document.createElement('a');
  a.id = 'ne-wa';
  a.className = 'wa-float';
  a.href = 'https://wa.me/' + SITE.whatsapp + '?text=' + encodeURIComponent(text);
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Chat with us on WhatsApp');
  a.innerHTML = waIcon();
  document.body.appendChild(a);
}

/**
 * Renders header, bottom tab bar, footer and the WhatsApp button.
 * @param {string} active - which tab is current: home|browse|dash|progress
 * @param {string} [waKey] - which WhatsApp message to prefill; defaults to
 *                           `active`. Pass a key from WA_MSG when the page
 *                           is more specific than its tab, e.g. 'subscribe'.
 *
 * exam.html and admin.html never call this, which is how they stay free of
 * the tab bar, the footer, the float and the promo — all of them are exits
 * from a live timed exam.
 */
function renderChrome(active, waKey) {
  const head = document.getElementById('app-header');
  if (head) {
    head.className = 'app-header';
    head.innerHTML =
      '<div class="app-header-inner">' +
        '<a href="index.html" class="brand-name">Namma <span>Exam</span></a>' +
        '<div class="header-right">' +
          '<span class="lang-toggle">' +
            '<button data-lang="en" onclick="setLang(\'en\')">EN</button>' +
            '<button data-lang="kn" onclick="setLang(\'kn\')">ಕನ್ನಡ</button>' +
          '</span>' +
        '</div>' +
      '</div>';
  }

  const bar = document.getElementById('app-tabbar');
  if (bar) {
    const items = [
      { id:'home',     href:'index.html',     ic:'home',     en:'Home',     kn:'ಮುಖಪುಟ' },
      { id:'browse',   href:'browse.html',    ic:'browse',   en:'Papers',   kn:'ಪತ್ರಗಳು' },
      { id:'dash',     href:'dashboard.html', ic:'dash',     en:'My Study', kn:'ಅಧ್ಯಯನ' },
      { id:'progress', href:'progress.html',  ic:'progress', en:'Progress', kn:'ಪ್ರಗತಿ' },
      { id:'help',     href:SITE.community,   ic:'help',     en:'Help',     kn:'ಸಹಾಯ' },
    ];
    bar.className = 'tabbar';
    bar.innerHTML = items.map(function (i) {
      const ext = i.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + i.href + '"' + ext + (i.id === active ? ' class="active"' : '') + '>' +
               icon(i.ic) +
               '<span data-en="' + i.en + '" data-kn="' + i.kn + '">' + i.en + '</span>' +
             '</a>';
    }).join('');
    document.body.classList.add('has-tabbar');
  }

  const foot = document.getElementById('app-footer');
  if (foot) {
    foot.className = 'site-footer';
    foot.innerHTML =
      '<div class="wrap footer-grid">' +
        '<div class="footer-col">' +
          '<div class="footer-brand">Namma <span>Exam</span></div>' +
          '<span class="muted" style="color:rgba(255,255,255,.6)">Powered by Clinisync Technology</span>' +
        '</div>' +
        '<div class="footer-col">' +
          '<a href="certificate.html" data-en="Verify a Certificate" data-kn="ಪ್ರಮಾಣಪತ್ರ">Verify a Certificate</a>' +
          '<a href="subscribe.html" data-en="Subscribe" data-kn="ಚಂದಾದಾರರಾಗಿ">Subscribe</a>' +
          '<a href="privacy-policy.html" data-en="Privacy Policy" data-kn="ಗೌಪ್ಯತಾ ನೀತಿ">Privacy Policy</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<a href="mailto:' + SITE.email + '">' + SITE.email + '</a>' +
          '<a href="tel:+' + SITE.whatsapp + '">' + SITE.phone + '</a>' +
          '<a href="' + SITE.reportForm + '" target="_blank" rel="noopener" ' +
             'data-en="Report a problem in a paper" data-kn="ಪತ್ರಿಕೆಯಲ್ಲಿ ಸಮಸ್ಯೆ ತಿಳಿಸಿ">' +
             'Report a problem in a paper</a>' +
          '<a class="play-badge install-only" href="' + SITE.play + '" target="_blank" rel="noopener" ' +
             'aria-label="Get it on Google Play">' + playIcon() +
            '<span class="pb-text"><span class="pb-small">Get it on</span>' +
            '<span class="pb-large">Google Play</span></span>' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  renderWhatsApp(waKey || active);
  applyLang();
  startPromo();
}

/* ----------------------------------------------------------------------------
   THE 30 SECOND PROMPT
   Waits half a minute before saying anything — long enough that the person
   has decided to stay. Shown once ever, and never on the exam or admin page,
   because neither calls renderChrome.
   ------------------------------------------------------------------------- */
function startPromo() {
  try { if (localStorage.getItem('ne_promo_seen') === '1') return; } catch (e) {}
  setTimeout(showPromo, 30000);
}

function showPromo() {
  if (document.getElementById('ne-promo')) return;
  try { localStorage.setItem('ne_promo_seen', '1'); } catch (e) {}

  const inEnglish = lang() === 'en';
  const o = document.createElement('div');
  o.id = 'ne-promo';
  o.className = 'overlay show';
  o.innerHTML =
    '<div class="sheet">' +
      (inEnglish
        ? '<h2>ಕನ್ನಡದಲ್ಲಿ ಓದಬೇಕೆ?</h2>' +
          '<p class="muted" style="margin:7px 0 14px">' +
            'Every question, every paper and this whole site is available in Kannada.</p>' +
          '<button class="btn btn-primary btn-block" id="ne-promo-kn">ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ</button>'
        : '') +
      '<div style="' + (inEnglish ? 'margin-top:16px; padding-top:16px; border-top:1px solid var(--line);' : '') + '">' +
        '<h2 data-en="Be the next government employee" ' +
            'data-kn="ಮುಂದಿನ ಸರ್ಕಾರಿ ನೌಕರರಾಗಿ">Be the next government employee</h2>' +
        '<p class="muted" style="margin:7px 0 14px" ' +
           'data-en="Unlock every paper in every department for one year — ₹49." ' +
           'data-kn="ಒಂದು ವರ್ಷಕ್ಕೆ ಎಲ್ಲಾ ಪತ್ರಿಕೆಗಳು — ₹49.">' +
           'Unlock every paper in every department for one year — ₹49.</p>' +
        '<a class="btn btn-navy btn-block" href="subscribe.html" ' +
           'data-en="See how to subscribe" data-kn="ಚಂದಾದಾರರಾಗುವುದು ಹೇಗೆ">See how to subscribe</a>' +
      '</div>' +
      '<button class="btn btn-ghost btn-block" style="margin-top:9px" id="ne-promo-no" ' +
              'data-en="Not now" data-kn="ಈಗ ಬೇಡ">Not now</button>' +
    '</div>';
  document.body.appendChild(o);
  applyLang();

  const kn = o.querySelector('#ne-promo-kn');
  if (kn) kn.addEventListener('click', function () { setLang('kn'); o.remove(); });
  o.querySelector('#ne-promo-no').addEventListener('click', function () { o.remove(); });
}

/* ============================================================================
   LOADER + TOAST
   ========================================================================= */
const LOADER_LINES = [
  'Getting things ready...', 'ಸಿದ್ಧಗೊಳಿಸಲಾಗುತ್ತಿದೆ...',
  'Almost there...', 'Good things take a few seconds',
];

function showLoader(elId, text) {
  const el = document.getElementById(elId);
  if (!el) return;
  const bar = '<div class="loader-line"><div class="loader-bar"><div class="loader-fill"></div></div></div>';
  el.innerHTML = '<div class="loader">' +
      '<div class="loader-bars">' + bar + bar + bar + '</div>' +
      '<div class="loader-text">' + esc(text || 'Loading...') + '</div>' +
      '<div class="loader-sub" id="ne-loader-sub"></div>' +
    '</div>';
  let i = 0;
  const tick = setInterval(function () {
    const sub = document.getElementById('ne-loader-sub');
    if (!sub) { clearInterval(tick); return; }
    sub.textContent = LOADER_LINES[i++ % LOADER_LINES.length];
  }, 2200);
}

function toast(message) {
  let el = document.getElementById('ne-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ne-toast'; el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.classList.remove('show'); }, 3000);
}

function showMsg(elId, text, kind) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.className = 'msg show msg-' + (kind || 'err');
}
function hideMsg(elId) {
  const el = document.getElementById(elId);
  if (el) el.className = 'msg';
}

/* ============================================================================
   INSTALL PROMPT + COMMUNITY POPUP
   Both deliberately wait for a finished task. Asking on arrival is the
   mobile equivalent of a newsletter popup, and a dismissal is remembered.
   ========================================================================= */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredInstall = e;
});

function offerInstall() {
  if (!deferredInstall) return false;
  try { if (localStorage.getItem('ne_install_no') > Date.now()) return false; } catch (e) {}
  deferredInstall.prompt();
  deferredInstall.userChoice.then(function (c) {
    if (c.outcome !== 'accepted') {
      try { localStorage.setItem('ne_install_no', Date.now() + 7 * 864e5); } catch (e) {}
    }
    deferredInstall = null;
  });
  return true;
}

/**
 * The WhatsApp community invitation. Call it AFTER a student sees a score —
 * that is the moment they have a reason to want notes and updates.
 * Shows at most 3 times ever, and never again once tapped through.
 */
function offerCommunity() {
  let n = 0, joined = false;
  try {
    n = parseInt(localStorage.getItem('ne_comm_n') || '0', 10);
    joined = localStorage.getItem('ne_comm_joined') === '1';
  } catch (e) {}
  if (joined || n >= 3) return;
  try { localStorage.setItem('ne_comm_n', String(n + 1)); } catch (e) {}

  const o = document.createElement('div');
  o.className = 'overlay show';
  o.innerHTML =
    '<div class="sheet">' +
      '<h2 data-en="Join our WhatsApp group" data-kn="ನಮ್ಮ ವಾಟ್ಸಾಪ್ ಗುಂಪಿಗೆ ಸೇರಿ">Join our WhatsApp group</h2>' +
      '<p class="muted" style="margin:8px 0 16px" data-en="Free notes, new papers and exam date updates." ' +
         'data-kn="ುಚಿತ ನೋಟ್ಸ್ ಮತ್ತು ನವೀಕರಣಗಳು.">' +
         'Free notes, new papers and exam date updates.</p>' +
      '<a class="btn btn-primary btn-block" id="ne-comm-go" href="' + SITE.community + '" ' +
         'target="_blank" rel="noopener" data-en="Join the group" data-kn="ಗುಂಪಿಗೆ ಸೇರಿ">Join the group</a>' +
      '<button class="btn btn-ghost btn-block" style="margin-top:9px" id="ne-comm-no" ' +
         'data-en="Not now" data-kn="ಈಗ ಬೇಡ">Not now</button>' +
    '</div>';
  document.body.appendChild(o);
  applyLang();

  o.querySelector('#ne-comm-go').addEventListener('click', function () {
    try { localStorage.setItem('ne_comm_joined', '1'); } catch (e) {}
    o.remove();
  });
  o.querySelector('#ne-comm-no').addEventListener('click', function () { o.remove(); });
}

/* ============================================================================
   SERVICE WORKER
   v2 shipped a service worker and never registered it, so none of it ran.
   This one caches nothing — it exists for installability and push only,
   which is the version that cannot break page loads.
   ========================================================================= */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js').catch(function () {});
  });
}

/* Apply the saved language as early as possible, before chrome renders. */
document.addEventListener('DOMContentLoaded', applyLang);
