/**
 * NAMMA EXAM — SHARED SITE CHROME
 * Powered by Clinisync Technology
 *
 * One file, included on every public page (NOT exam.html, NOT admin.html).
 * Edit the values in SITE_CONFIG below and every page picks up the change —
 * no need to hunt through 7 separate files.
 */

const SITE_CONFIG = {
  whatsappNumber: '918088559938',
  phoneDisplay: '+91 8088559938',
  email: 'info@nammaexam.com',
  siteUrl: 'https://nammaexam.in',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.nammaexam.aab&pcampaignid=web_share',
  appName: 'NammaExam Kannada'
};

const WA_MESSAGES = {
  // One per page, so a reply arrives knowing what the person was doing.
  general:   'Namaskara, nanage sahaya beku. / Hi, I need some help with Namma Exam.',
  home:      'Namaskara, I want to know more about Namma Exam. / ನಮ್ಮ ಎಕ್ಸಾಮ್ ಬಗ್ಗೆ ತಿಳಿಯಬೇಕು.',
  auth:      'Namaskara, I am having trouble registering or logging in. / ನೋಂದಣಿ ಅಥವಾ ಲಾಗಿನ್‌ನಲ್ಲಿ ಸಮಸ್ಯೆ ಇದೆ.',
  subscribe: 'Namaskara, nanu chandadarikeya bagge kelbayasuttene (Rs 49). / Hi, I want to know about subscribing (Rs 49).'
};

// ============================================================
// Inject badge styles once (used by renderFooter)
// ============================================================
(function injectBadgeStyle(){
  if (document.getElementById('namma-play-badge-style')) return;
  const style = document.createElement('style');
  style.id = 'namma-play-badge-style';
  style.textContent = [
    '.footer-app-row{',
    '  display:flex; align-items:center; gap:14px; flex-wrap:wrap;',
    '  padding:16px 0 6px; margin-top:6px;',
    '  border-top:1px solid rgba(255,255,255,0.1);',
    '}',
    '.footer-app-label{',
    '  font-size:0.8rem; color:rgba(255,255,255,0.65); font-weight:500;',
    '}',
    '.footer-app-name{',
    "  font-family:'Roboto Slab',serif; font-size:0.92rem; font-weight:700; color:#fff;",
    '}',
    '.play-badge{',
    '  display:inline-flex; align-items:center; gap:8px;',
    '  background:#000; color:#fff;',
    '  padding:6px 13px 6px 11px;',
    '  border-radius:7px;',
    '  border:1px solid rgba(255,255,255,0.15);',
    '  transition:transform 0.15s ease, background 0.15s ease;',
    '  text-decoration:none; margin-left:auto;',
    '}',
    '.play-badge:hover{ transform:translateY(-2px); background:#1a1a1a; }',
    '.play-badge .pb-icon{ width:20px; height:20px; flex-shrink:0; }',
    '.play-badge .pb-text{ display:flex; flex-direction:column; gap:0; line-height:1; }',
    '.play-badge .pb-small{ font-size:0.55rem; letter-spacing:0.06em; text-transform:uppercase; opacity:0.85; }',
    ".play-badge .pb-large{ font-family:'Roboto Slab',serif; font-size:0.85rem; font-weight:700; }",
    '@media (max-width:640px){',
    '  .footer-app-row{ flex-direction:column; align-items:flex-start; gap:10px; }',
    '  .play-badge{ margin-left:0; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);
})();

// ============================================================
// Render footer
// ============================================================
function renderFooter(targetId){
  const el = document.getElementById(targetId);
  if (!el) return;

  const playBadgeSvg =
    '<svg class="pb-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="npgA" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#00d9ff"/><stop offset="1" stop-color="#00a1ff"/>' +
        '</linearGradient>' +
        '<linearGradient id="npgB" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#ffd800"/><stop offset="1" stop-color="#ffa000"/>' +
        '</linearGradient>' +
        '<linearGradient id="npgC" x1="0" y1="1" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#ff3a44"/><stop offset="1" stop-color="#c31162"/>' +
        '</linearGradient>' +
        '<linearGradient id="npgD" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#32e070"/><stop offset="1" stop-color="#00a045"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path fill="url(#npgA)" d="M48 32 320 256 48 480z"/>' +
      '<path fill="url(#npgB)" d="M48 32 400 200 320 256z"/>' +
      '<path fill="url(#npgC)" d="M320 256 400 312 48 480z"/>' +
      '<path fill="url(#npgD)" d="M320 256 400 200 448 256 400 312z"/>' +
    '</svg>';

  el.innerHTML =
    '<div class="wrap footer-grid">' +
      '<div class="footer-col footer-brand-col">' +
        '<div class="footer-brand-name">Namma <span>Exam</span></div>' +
        '<span class="footer-powered">Powered by Clinisync Technology</span>' +
      '</div>' +
      '<div class="footer-col">' +
        '<a href="certificate.html" data-en="Verify a Certificate" data-kn="ಪ್ರಮಾಣಪತ್ರ ಪರಿಶೀಲಿಸಿ">Verify a Certificate</a>' +
        '<a href="subscribe.html" data-en="Subscribe" data-kn="ಚಂದಾದಾರರಾಗಿ">Subscribe</a>' +
        '<a href="auth.html?tab=login" data-en="Login" data-kn="ಲಾಗಿನ್">Login</a>' +
        '<a href="privacy-policy.html" data-en="Privacy Policy" data-kn="ಗೌಪ್ಯತಾ ನೀತಿ">Privacy Policy</a>' +
        '<a href="https://blog.nammaexam.xyz/" target="_blank" rel="noopener" data-en="Blog" data-kn="ಬ್ಲಾಗ್">Blog</a>' +
      '</div>' +
      '<div class="footer-col">' +
        '<a href="mailto:' + SITE_CONFIG.email + '">' + SITE_CONFIG.email + '</a>' +
        '<a href="tel:+' + SITE_CONFIG.whatsappNumber + '">' + SITE_CONFIG.phoneDisplay + '</a>' +
      '</div>' +
    '</div>' +
    '<div class="wrap">' +
      '<div class="footer-app-row">' +
        '<span class="footer-app-label" data-en="Also available on Android:" data-kn="Android ನಲ್ಲಿಯೂ ಲಭ್ಯವಿದೆ:">Also available on Android:</span>' +
        '<span class="footer-app-name">' + SITE_CONFIG.appName + '</span>' +
        '<a class="play-badge" href="' + SITE_CONFIG.playStoreUrl + '" target="_blank" rel="noopener" aria-label="Get it on Google Play">' +
          playBadgeSvg +
          '<span class="pb-text">' +
            '<span class="pb-small">Get it on</span>' +
            '<span class="pb-large">Google Play</span>' +
          '</span>' +
        '</a>' +
      '</div>' +
    '</div>';
}

// ============================================================
// WhatsApp floating button
// ============================================================
function renderWhatsAppButton(targetId, context){
  const el = document.getElementById(targetId);
  if (!el) return;
  const msg = WA_MESSAGES[context] || WA_MESSAGES.general;
  const link = 'https://wa.me/' + SITE_CONFIG.whatsappNumber + '?text=' + encodeURIComponent(msg);
  el.innerHTML =
    '<a href="' + link + '" target="_blank" rel="noopener" class="wa-float" aria-label="WhatsApp">' +
      '<svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">' +
        '<path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.8 1.9 6.8L3 29l6.7-2.1c1.9 1 4.1 1.6 6.3 1.6 7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3zm0 23.1c-2 0-3.9-.5-5.5-1.5l-.4-.2-4 1.2 1.2-3.9-.3-.4a10.3 10.3 0 0 1-1.6-5.6C5.4 9.9 10.1 5.2 16 5.2s10.6 4.7 10.6 10.5S21.9 26.1 16 26.1zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-2.5-1.6 9.6 9.6 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.6l.5-.5.3-.5a.5.5 0 0 0 0-.5c-.1-.2-.7-1.7-1-2.3s-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.5 3.5 0 0 0-1.1 2.6c0 1.5 1.1 3 1.3 3.3.2.3 2.2 3.4 5.4 4.7a19 19 0 0 0 1.8.7 4.3 4.3 0 0 0 2 .1 3.2 3.2 0 0 0 2.1-1.5 2.6 2.6 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z"/>' +
      '</svg>' +
    '</a>';
}

// ============================================================
// LOADER
// ============================================================
const LOADER_PHRASES = [
  'Getting things ready...',
  'ಸಿದ್ಧಗೊಳಿಸಲಾಗುತ್ತಿದೆ...',
  'Almost there...',
  'ಬಹುತೇಕ ಆಯಿತು...',
  'Good things take a few seconds'
];

function renderLoader(targetId, contextText){
  const el = document.getElementById(targetId);
  if (!el) return;

  if (!document.getElementById('namma-loader-style')) {
    const style = document.createElement('style');
    style.id = 'namma-loader-style';
    style.textContent =
      '.namma-loader{ text-align:center; padding:50px 20px; }' +
      '.namma-loader-scene{ width:110px; margin:0 auto 18px; }' +
      '.namma-loader-line{ display:flex; align-items:center; gap:8px; margin-bottom:9px; }' +
      '.namma-loader-bar{ flex:1; height:6px; background:#eaf0f6; border-radius:999px; overflow:hidden; }' +
      '.namma-loader-bar-fill{ height:100%; width:0%; background:#c9942c; border-radius:999px; animation:namma-fill 1.8s ease-in-out infinite; }' +
      '.namma-loader-line:nth-child(1) .namma-loader-bar-fill{ animation-delay:0s; }' +
      '.namma-loader-line:nth-child(2) .namma-loader-bar-fill{ animation-delay:0.2s; }' +
      '.namma-loader-line:nth-child(3) .namma-loader-bar-fill{ animation-delay:0.4s; }' +
      '.namma-loader-check{ width:16px; height:16px; flex-shrink:0; opacity:0; }' +
      '.namma-loader-line:nth-child(1) .namma-loader-check{ animation:namma-check 1.8s ease-in-out infinite; animation-delay:0.3s; }' +
      '.namma-loader-line:nth-child(2) .namma-loader-check{ animation:namma-check 1.8s ease-in-out infinite; animation-delay:0.5s; }' +
      '.namma-loader-line:nth-child(3) .namma-loader-check{ animation:namma-check 1.8s ease-in-out infinite; animation-delay:0.7s; }' +
      '@keyframes namma-fill{ 0%{width:0%;} 40%{width:100%;} 100%{width:100%;} }' +
      '@keyframes namma-check{ 0%,15%{opacity:0; transform:scale(0.5);} 30%{opacity:1; transform:scale(1);} 85%{opacity:1;} 100%{opacity:0;} }' +
      '.namma-loader-context{ font-size:0.9rem; color:#0d2b4e; font-weight:600; margin-bottom:6px; }' +
      '.namma-loader-rotating{ font-size:0.8rem; color:#565f6e; min-height:18px; transition:opacity 0.3s ease; }';
    document.head.appendChild(style);
  }

  const checkSvg = '<svg class="namma-loader-check" viewBox="0 0 16 16"><path d="M2 8l4 4 8-8" stroke="#1f7a4d" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const barHtml = '<div class="namma-loader-bar"><div class="namma-loader-bar-fill"></div></div>';

  el.innerHTML =
    '<div class="namma-loader">' +
      '<div class="namma-loader-scene">' +
        '<div class="namma-loader-line">' + checkSvg + barHtml + '</div>' +
        '<div class="namma-loader-line">' + checkSvg + barHtml + '</div>' +
        '<div class="namma-loader-line">' + checkSvg + barHtml + '</div>' +
      '</div>' +
      '<div class="namma-loader-context">' + (contextText || 'Loading...') + '</div>' +
      '<div class="namma-loader-rotating" id="namma-loader-rotating-text"></div>' +
    '</div>';

  let idx = 0;
  function rotate(){
    const rotEl = document.getElementById('namma-loader-rotating-text');
    if (!rotEl) { clearInterval(loaderInterval); return; }
    rotEl.style.opacity = '0';
    setTimeout(function(){
      const stillThere = document.getElementById('namma-loader-rotating-text');
      if (!stillThere) return;
      stillThere.textContent = LOADER_PHRASES[idx % LOADER_PHRASES.length];
      stillThere.style.opacity = '1';
      idx++;
    }, 300);
  }
  rotate();
  const loaderInterval = setInterval(rotate, 2200);
}
