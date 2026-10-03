const fs = require('fs');
const assert = require('assert');

// 1. Verify landing-page/code.html and landing page 2.html are identical
const landing1 = fs.readFileSync('landing-page/code.html', 'utf8');
const landing2 = fs.readFileSync('landing page 2.html', 'utf8');
assert.strictEqual(landing1, landing2, 'landing-page/code.html and landing page 2.html must be identical');
console.log('✓ Files are identical');

// 2. Extract LANDING_TRANSLATIONS from landing-page/code.html
const startIdx = landing1.indexOf('const LANDING_TRANSLATIONS = {');
assert(startIdx !== -1, 'LANDING_TRANSLATIONS declaration must exist');
const jsonStart = landing1.indexOf('{', startIdx);
let openBrackets = 0;
let jsonEnd = -1;
for (let i = jsonStart; i < landing1.length; i++) {
  if (landing1[i] === '{') openBrackets++;
  else if (landing1[i] === '}') {
    openBrackets--;
    if (openBrackets === 0) {
      jsonEnd = i + 1;
      break;
    }
  }
}
assert(jsonEnd !== -1, 'Valid JSON block for LANDING_TRANSLATIONS must exist');
const LANDING_TRANSLATIONS = JSON.parse(landing1.substring(jsonStart, jsonEnd));


const EXPECTED_LANGS = [
  'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'ur', 'kn', 'or', 'ml', 'pa',
  'as', 'mai', 'mni', 'sa', 'sd', 'ks', 'kok', 'doi', 'ne', 'brx', 'sat'
];

console.log(`Checking ${EXPECTED_LANGS.length} languages in LANDING_TRANSLATIONS...`);

EXPECTED_LANGS.forEach(lang => {
  assert(LANDING_TRANSLATIONS[lang], `Language ${lang} must exist in LANDING_TRANSLATIONS`);
  const t = LANDING_TRANSLATIONS[lang];
  assert(t.greeting_ask, `${lang} must have greeting_ask`);
  assert(t.greeting_about, `${lang} must have greeting_about`);
  assert(t.greeting_sub, `${lang} must have greeting_sub`);
  assert(t.search_placeholder, `${lang} must have search_placeholder`);
  assert(t.camera_label, `${lang} must have camera_label`);
  assert(t.voice_label, `${lang} must have voice_label`);
  assert(t.upload_label, `${lang} must have upload_label`);
  assert(t.menu_home, `${lang} must have menu_home`);
  assert(t.menu_ai_assistant, `${lang} must have menu_ai_assistant`);
  assert(t.menu_recents, `${lang} must have menu_recents`);
  assert(t.view_all, `${lang} must have view_all`);
  assert(t.menu_settings, `${lang} must have menu_settings`);
  assert(t.menu_language, `${lang} must have menu_language`);
  assert(t.menu_help, `${lang} must have menu_help`);
  assert(t.profile_title, `${lang} must have profile_title`);
  assert(t.lang_title, `${lang} must have lang_title`);
  assert(t.done, `${lang} must have done`);
  assert(t.help_title, `${lang} must have help_title`);
});

console.log('✓ All 23 languages have all required translation keys');

// 3. Verify HTML contains data-i18n attributes for critical elements
assert(landing1.includes('data-i18n="greeting_ask"'), 'Greeting ask must have data-i18n');
assert(landing1.includes('data-i18n="greeting_about"'), 'Greeting about must have data-i18n');
assert(landing1.includes('data-i18n="greeting_sub"'), 'Greeting sub must have data-i18n');
assert(landing1.includes('data-i18n-placeholder="search_placeholder"'), 'Search input must have data-i18n-placeholder');
assert(landing1.includes('data-i18n="camera_label"'), 'Camera label must have data-i18n');
assert(landing1.includes('data-i18n="voice_label"'), 'Voice label must have data-i18n');
assert(landing1.includes('data-i18n="upload_label"'), 'Upload label must have data-i18n');
assert(landing1.includes('data-i18n="menu_recents"'), 'Recents title must have data-i18n');
assert(landing1.includes('data-i18n="view_all"'), 'View all button must have data-i18n');
assert(landing1.includes('data-i18n="menu_settings"'), 'Settings menu must have data-i18n');
assert(landing1.includes('data-i18n="menu_language"'), 'Language menu must have data-i18n');
assert(landing1.includes('data-i18n="menu_help"'), 'Help menu must have data-i18n');

// 4. Verify applyLandingLanguage is called on click of lang-option
assert(landing1.includes('window.applyLandingLanguage(langCode)'), 'applyLandingLanguage must be invoked on lang-option click');
assert(landing1.includes('window.applyLandingLanguage(savedLang)'), 'applyLandingLanguage must be invoked on page load');

console.log('✓ All landing page translation checks passed successfully!');
