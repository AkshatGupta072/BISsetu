/**
 * BIS Setu - Shared Unified AppSidebar Component
 * Single Source of Truth for Landing Page and Search/Chat Page Sidebar
 */

(function () {
  // Ensure shared CSS styles for sidebar animation
  const SIDEBAR_CSS = `
    .sidebar-overlay-enter {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    .sidebar-panel-enter {
      transform: translateX(0) !important;
    }
  `;

  if (!document.getElementById('bis-shared-sidebar-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'bis-shared-sidebar-styles';
    styleEl.textContent = SIDEBAR_CSS;
    document.head.appendChild(styleEl);
  }

  // Multilingual UI Dictionary (All 22 Constitutional Languages)
  const TRANSLATIONS = {
    en: {
      search_placeholder: "Ask about Indian Standards, ISI marks, certifications...",
      camera_label: "Camera",
      voice_label: "Voice",
      upload_label: "Upload",
      greeting_ask: "Ask anything",
      greeting_about: "about BIS",
      greeting_sub: "Indian Standards & Certifications",
      menu_home: "Home",
      menu_new_chat: "New Chat",
      menu_ai_assistant: "AI Assistant",
      menu_recents: "RECENTS",
      see_all: "See all",
      no_recents: "No recent searches yet.",
      menu_settings: "Settings",
      menu_language: "Language",
      menu_help: "Help & Support",
      portal_title: "BIS Setu Standards Portal",
      portal_sub: "Bureau of Indian Standards AI Assistant",
      settings_lang_label: "Active UI Language",
      recent_lookups: "Recent Standards Lookups",
      clear_history: "Clear History",
      close_btn: "Close",
      lang_select_title: "Select Language",
      lang_select_sub: "Choose your preferred language for BIS AI Assistant",
      done_btn: "Done →"
    },
    hi: {
      search_placeholder: "भारतीय मानकों, आईएसआई मार्क, प्रमाणन के बारे में पूछें...",
      camera_label: "कैमरा",
      voice_label: "आवाज़",
      upload_label: "अपलोड",
      greeting_ask: "कुछ भी पूछें",
      greeting_about: "BIS के बारे में",
      greeting_sub: "भारतीय मानक एवं प्रमाणन",
      menu_home: "होम",
      menu_new_chat: "नई चैट",
      menu_ai_assistant: "एआई सहायक",
      menu_recents: "हालिया खोजें",
      see_all: "सभी देखें",
      no_recents: "कोई हालिया खोज नहीं।",
      menu_settings: "सेटिंग्स",
      menu_language: "भाषा",
      menu_help: "सहायता एवं समर्थन",
      portal_title: "बीआईएस सेतु मानक पोर्टल",
      portal_sub: "भारतीय मानक ब्यूरो एआई सहायक",
      settings_lang_label: "सक्रिय भाषा",
      recent_lookups: "हालिया मानक खोजें",
      clear_history: "इतिहास मिटाएं",
      close_btn: "बंद करें",
      lang_select_title: "भाषा चुनें",
      lang_select_sub: "BIS एआई सहायक के लिए अपनी पसंदीदा भाषा चुनें",
      done_btn: "पूर्ण →"
    },
    bn: {
      search_placeholder: "ভারতীয় মানদণ্ড, আইএসআই চিহ্ন বা সার্টিফিকেশন সম্পর্কে জিজ্ঞাসা করুন...",
      camera_label: "ক্যামেরা",
      voice_label: "ভয়েস",
      upload_label: "আপলোড",
      greeting_ask: "যেকোনো কিছু জিজ্ঞাসা করুন",
      greeting_about: "BIS সম্পর্কে",
      greeting_sub: "ভারতীয় মান ও সার্টিফিকেশন",
      menu_home: "হোম",
      menu_new_chat: "নতুন চ্যাট",
      menu_ai_assistant: "এআই সহকারী",
      menu_recents: "সাম্প্রতিক",
      see_all: "সব দেখুন",
      no_recents: "কোনো সাম্প্রতিক অনুসন্ধান নেই।",
      menu_settings: "সেটিংস",
      menu_language: "ভাষা",
      menu_help: "সহায়তা ও সমর্থন",
      portal_title: "বিআইএস সেতু স্ট্যান্ডার্ড পোর্টাল",
      portal_sub: "ব্যুরো অফ ইন্ডিয়ান স্ট্যান্ডার্ডস এআই সহকারী",
      settings_lang_label: "সক্রিয় ভাষা",
      recent_lookups: "সাম্প্রতিক মান অনুসন্ধান",
      clear_history: "ইতিহাস মুছুন",
      close_btn: "বন্ধ করুন",
      lang_select_title: "ভাষা নির্বাচন করুন",
      lang_select_sub: "BIS AI সহকারীর জন্য আপনার পছন্দের ভাষা নির্বাচন করুন",
      done_btn: "সম্পন্ন →"
    },
    te: {
      search_placeholder: "భారతీయ ప్రమాణాలు, ఐఎస్ఐ గుర్తులు లేదా ధృవీకరణల గురించి అడగండి...",
      camera_label: "కెమెరా",
      voice_label: "వాయిస్",
      upload_label: "అప్‌లోడ్",
      greeting_ask: "ఏదైనా అడగండి",
      greeting_about: "BIS గురించి",
      greeting_sub: "భారతీయ ప్రమాణాలు & సర్టిఫికేషన్లు",
      menu_home: "హోమ్",
      menu_new_chat: "కొత్త చాట్",
      menu_ai_assistant: "AI సహాయకుడు",
      menu_recents: "ఇటీవలివి",
      see_all: "అన్నీ చూడండి",
      no_recents: "ఇంకా ఇటీవలి శోధనలు లేవు.",
      menu_settings: "సెట్టింగ్‌లు",
      menu_language: "భాష",
      menu_help: "సహాయం & మద్దతు",
      portal_title: "BIS సేతు స్టాండర్డ్స్ పోర్టల్",
      portal_sub: "బ్యూరో ఆఫ్ ఇండియన్ స్టాండర్డ్స్ AI అసిస్టెంట్",
      settings_lang_label: "క్రియాశీల భాష",
      recent_lookups: "ఇటీవలి ప్రమాణాల శోధనలు",
      clear_history: "చరిత్రను క్లియర్ చేయండి",
      close_btn: "మూసివేయి",
      lang_select_title: "భాషను ఎంచుకోండి",
      lang_select_sub: "BIS AI అసిస్టెంట్ కోసం ప్రాధాన్య భాషను ఎంచుకోండి",
      done_btn: "పూర్తయింది →"
    },
    mr: {
      search_placeholder: "भारतीय मानके, आयएसआय मार्क किंवा प्रमाणपत्रांबद्दल विचारा...",
      camera_label: "कॅमेरा",
      voice_label: "आवाज",
      upload_label: "अपलोड",
      greeting_ask: "काहीही विचारा",
      greeting_about: "BIS बद्दल",
      greeting_sub: "भारतीय मानके आणि प्रमाणीकरण",
      menu_home: "मुख्यपृष्ठ",
      menu_new_chat: "नवीन चॅट",
      menu_ai_assistant: "एआय सहाय्यक",
      menu_recents: "अलीकडील",
      see_all: "सर्व पहा",
      no_recents: "अजून कोणतेही शोध नाहीत.",
      menu_settings: "सेटिंग्ज",
      menu_language: "भाषा",
      menu_help: "मदत आणि पाठिंबा",
      portal_title: "बीआयएस सेतू मानके पोर्टल",
      portal_sub: "भारतीय मानक ब्युरो एआय सहाय्यक",
      settings_lang_label: "सक्रिय भाषा",
      recent_lookups: "अलीकडील मानक शोध",
      clear_history: "इतिहास हटवा",
      close_btn: "बंद करा",
      lang_select_title: "भाषा निवडा",
      lang_select_sub: "BIS AI सहाय्यकासाठी आपली पसंतीची भाषा निवडा",
      done_btn: "पूर्ण →"
    },
    ta: {
      search_placeholder: "இந்திய தரநிலைகள், ஐஎஸ்ஐ முத்திரைகள் அல்லது சான்றிதழ்கள் பற்றி கேளுங்கள்...",
      camera_label: "கேமரா",
      voice_label: "குரல்",
      upload_label: "பதிவேற்று",
      greeting_ask: "எதையும் கேளுங்கள்",
      greeting_about: "BIS பற்றி",
      greeting_sub: "இந்திய தரநிலைகள் & சான்றிதழ்கள்",
      menu_home: "முகப்பு",
      menu_new_chat: "புதிய அரட்டை",
      menu_ai_assistant: "AI உதவியாளர்",
      menu_recents: "சமீபத்தியவை",
      see_all: "அனைத்தும் காண்க",
      no_recents: "சமீபத்திய தேடல்கள் இல்லை.",
      menu_settings: "அமைப்புகள்",
      menu_language: "மொழி",
      menu_help: "உதவி & ஆதரவு",
      portal_title: "BIS சேது தரநிலைகள் போர்டல்",
      portal_sub: "இந்திய தரநிலைகள் பணியகம் AI உதவியாளர்",
      settings_lang_label: "செயலில் உள்ள மொழி",
      recent_lookups: "சமீபத்திய தரநிலை தேடல்கள்",
      clear_history: "வரலாற்றை அழிக்கவும்",
      close_btn: "மூடு",
      lang_select_title: "மொழியைத் தேர்ந்தெடுக்கவும்",
      lang_select_sub: "BIS AI உதவியாளருக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்",
      done_btn: "முடிந்தது →"
    },
    gu: {
      search_placeholder: "ભારતીય ધોરણો, ISI માર્ક્સ અથવા પ્રમાણપત્રો વિશે પૂછો...",
      camera_label: "કેમેરા",
      voice_label: "અવાજ",
      upload_label: "અપલોડ",
      greeting_ask: "કંઈપણ પૂછો",
      greeting_about: "BIS વિશે",
      greeting_sub: "ભારતીય ધોરણો અને પ્રમાણપત્રો",
      menu_home: "હોમ",
      menu_new_chat: "નવી ચેટ",
      menu_ai_assistant: "AI સહાયક",
      menu_recents: "તાજેતરનું",
      see_all: "બધા જુઓ",
      no_recents: "હજુ સુધી કોઈ તાજેતરની શોધ નથી.",
      menu_settings: "સેટિંગ્સ",
      menu_language: "ભાષા",
      menu_help: "સહાય અને સપોર્ટ",
      portal_title: "BIS સેતુ સ્ટાન્ડર્ડ્સ પોર્ટલ",
      portal_sub: "બ્યુરો ઓફ ઇન્ડિયન સ્ટાન્ડર્ડ્સ AI સહાયક",
      settings_lang_label: "સક્રિય ભાષા",
      recent_lookups: "તાજેતરની ધોરણ શોધો",
      clear_history: "ઇતિહાસ સાફ કરો",
      close_btn: "બંધ કરો",
      lang_select_title: "ભાષા પસંદ કરો",
      lang_select_sub: "BIS AI સહાયક માટે ભાષા પસંદ કરો",
      done_btn: "પૂર્ણ →"
    },
    ur: {
      search_placeholder: "ہندوستانی معیارات، ISI نشانات یا سرٹیفیکیشن کے بارے میں پوچھیں...",
      camera_label: "کیمرہ",
      voice_label: "آواز",
      upload_label: "اپ لوڈ",
      greeting_ask: "کچھ بھی پوچھیں",
      greeting_about: "BIS کے بارے میں",
      greeting_sub: "ہندوستانی معیارات اور سرٹیفیکیشن",
      menu_home: "ہوم",
      menu_new_chat: "نئی چیٹ",
      menu_ai_assistant: "اے آئی اسسٹنٹ",
      menu_recents: "حالیہ",
      see_all: "تمام دیکھیں",
      no_recents: "ابھی تک کوئی حالیہ تلاش نہیں ہے۔",
      menu_settings: "ترتیبات",
      menu_language: "زبان",
      menu_help: "مدد اور معاونت",
      portal_title: "بی آئی ایس سیتو پورٹل",
      portal_sub: "بیورو آف انڈین اسٹینڈرڈز اے آئی اسسٹنٹ",
      settings_lang_label: "فعال زبان",
      recent_lookups: "حالیہ معیارات کی تلاش",
      clear_history: "ہسٹری صاف کریں",
      close_btn: "بند کریں",
      lang_select_title: "زبان منتخب کریں",
      lang_select_sub: "BIS اے آئی اسسٹنٹ کے لیے زبان منتخب کریں",
      done_btn: "مکمل →"
    },
    kn: {
      search_placeholder: "ಭಾರತೀಯ ಮಾನದಂಡಗಳು, ಐಎಸ್ಐ ಗುರುತುಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
      camera_label: "ಕ್ಯಾಮೆರಾ",
      voice_label: "ಧ್ವನಿ",
      upload_label: "ಅಪ್‌ಲೋಡ್",
      greeting_ask: "ಏನನ್ನಾದರೂ ಕೇಳಿ",
      greeting_about: "BIS ಬಗ್ಗೆ",
      greeting_sub: "ಭಾರತೀಯ ಮಾನದಂಡಗಳು & ಪ್ರಮಾಣೀಕರಣಗಳು",
      menu_home: "ಮುಖಪುಟ",
      menu_new_chat: "ಹೊಸ ಚಾಟ್",
      menu_ai_assistant: "AI ಸಹಾಯಕ",
      menu_recents: "ಇತ್ತೀಚಿನವು",
      see_all: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
      no_recents: "ಇನ್ನೂ ಯಾವುದೇ ಇತ್ತೀಚಿನ ಹುಡುಕಾಟಗಳಿಲ್ಲ.",
      menu_settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      menu_language: "ಭಾಷೆ",
      menu_help: "ಸಹಾಯ & ಬೆಂಬಲ",
      portal_title: "BIS ಸೇತು ಸ್ಟ್ಯಾಂಡರ್ಡ್ಸ್ ಪೋರ್ಟಲ್",
      portal_sub: "ಭಾರತೀಯ ಮಾನಕ ಬ್ಯೂರೋ AI ಸಹಾಯಕ",
      settings_lang_label: "ಸಕ್ರಿಯ ಭಾಷೆ",
      recent_lookups: "ಇತ್ತೀಚಿನ ಮಾನದಂಡ ಹುಡುಕಾಟಗಳು",
      clear_history: "ಇತಿಹಾಸ ಅಳಿಸಿ",
      close_btn: "ಮುಚ್ಚಿ",
      lang_select_title: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      lang_select_sub: "BIS AI ಸಹಾಯಕಕ್ಕಾಗಿ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      done_btn: "ಮುಗಿದಿದೆ →"
    },
    or: {
      search_placeholder: "ଭାରତୀୟ ମାନଦଣ୍ଡ, ISI ମାର୍କ ବିଷୟରେ ପଚାରନ୍ତୁ...",
      camera_label: "କ୍ୟାମେରା",
      voice_label: "ଭଏସ୍",
      upload_label: "ଅପଲୋଡ୍",
      greeting_ask: "କିଛି ବି ପଚାରନ୍ତୁ",
      greeting_about: "BIS ବିଷୟରେ",
      greeting_sub: "ଭାରତୀୟ ମାନଦଣ୍ଡ ଏବଂ ପ୍ରମାଣପତ୍ର",
      menu_home: "ମୂଳପୃଷ୍ଠା",
      menu_new_chat: "ନୂଆ ଚାଟ୍",
      menu_ai_assistant: "AI ସହାୟକ",
      menu_recents: "ସାମ୍ପ୍ରତିକ",
      see_all: "ସବୁ ଦେଖନ୍ତୁ",
      no_recents: "କୌଣସି ସାମ୍ପ୍ରତିକ ଖୋଜ ନାହିଁ।",
      menu_settings: "ସେଟିଂସ୍",
      menu_language: "ଭାଷା",
      menu_help: "ସହାୟତା ଏବଂ ସମର୍ଥନ",
      portal_title: "BIS ସେତୁ ଷ୍ଟାଣ୍ଡାର୍ଡସ୍ ପୋର୍ଟାଲ୍",
      portal_sub: "ବ୍ୟୁରୋ ଅଫ୍ ଇଣ୍ଡିଆନ୍ ଷ୍ଟାଣ୍ଡାର୍ଡସ୍ AI ସହାୟକ",
      settings_lang_label: "ସକ୍ରିୟ ଭାଷା",
      recent_lookups: "ସାମ୍ପ୍ରତିକ ମାନଦଣ୍ଡ ସନ୍ଧାନ",
      clear_history: "ଇତିହାସ ହଟାନ୍ତୁ",
      close_btn: "ବନ୍ଦ କରନ୍ତୁ",
      lang_select_title: "ଭାଷା ଚୟନ କରନ୍ତୁ",
      lang_select_sub: "BIS AI ସହାୟକ ପାଇଁ ଭାଷା ଚୟନ କରନ୍ତୁ",
      done_btn: "ସମ୍ପନ୍ନ →"
    },
    ml: {
      search_placeholder: "ഇന്ത്യൻ മാനദണ്ഡങ്ങൾ, ഐഎസ്ഐ അടയാളങ്ങൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...",
      camera_label: "ക്യാമറ",
      voice_label: "ശബ്ദം",
      upload_label: "അപ്‌ലോഡ്",
      greeting_ask: "എന്തും ചോദിക്കാം",
      greeting_about: "BIS നെക്കുറിച്ച്",
      greeting_sub: "ഇന്ത്യൻ മാനദണ്ഡങ്ങളും സർട്ടിഫിക്കേഷനുകളും",
      menu_home: "ഹോം",
      menu_new_chat: "പുതിയ ചാറ്റ്",
      menu_ai_assistant: "AI അസിസ്റ്റന്റ്",
      menu_recents: "സമീപകാലം",
      see_all: "എല്ലാം കാണുക",
      no_recents: "സമീപകാല തിരയലുകളൊന്നുമില്ല.",
      menu_settings: "ക്രമീകരണങ്ങൾ",
      menu_language: "ഭാഷ",
      menu_help: "സഹായവും പിന്തുണയും",
      portal_title: "BIS സേതു സ്റ്റാൻഡേർഡ്സ് പോർട്ടൽ",
      portal_sub: "ബ്യൂറോ ഓഫ് ഇന്ത്യൻ സ്റ്റാൻഡേർഡ്സ് AI അസിസ്റ്റന്റ്",
      settings_lang_label: "സജീവ ഭാഷ",
      recent_lookups: "സമീപകാല തിരയലുകൾ",
      clear_history: "ചരിത്രം മായ്ക്കുക",
      close_btn: "അടയ്ക്കുക",
      lang_select_title: "ഭാഷ തിരഞ്ഞെടുക്കുക",
      lang_select_sub: "BIS AI അസിസ്റ്റന്റിനായി ഭാഷ തിരഞ്ഞെടുക്കുക",
      done_btn: "പൂർത്തിയായി →"
    },
    pa: {
      search_placeholder: "ਭਾਰਤੀ ਮਾਪਦੰਡਾਂ, ISI ਮਾਰਕ ਜਾਂ ਪ੍ਰਮਾਣੀਕਰਣ ਬਾਰੇ ਪੁੱਛੋ...",
      camera_label: "ਕੈਮਰਾ",
      voice_label: "ਆਵਾਜ਼",
      upload_label: "ਅੱਪਲੋਡ",
      greeting_ask: "ਕੁਝ ਵੀ ਪੁੱਛੋ",
      greeting_about: "BIS ਬਾਰੇ",
      greeting_sub: "ਭਾਰਤੀ ਮਾਪਦੰਡ ਅਤੇ ਪ੍ਰਮਾਣੀਕਰਣ",
      menu_home: "ਘਰ",
      menu_new_chat: "ਨਵੀਂ ਗੱਲਬਾਤ",
      menu_ai_assistant: "AI ਸਹਾਇਕ",
      menu_recents: "ਹਾਲੀਆ",
      see_all: "ਸਭ ਦੇਖੋ",
      no_recents: "ਹਾਲੇ ਕੋਈ ਹਾਲੀਆ ਖੋਜ ਨਹੀਂ ਹੈ।",
      menu_settings: "ਸੈਟਿੰਗਾਂ",
      menu_language: "ਭਾਸ਼ਾ",
      menu_help: "ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ",
      portal_title: "BIS ਸੇਤੂ ਸਟੈਂਡਰਡ ਪੋਰਟਲ",
      portal_sub: "ਭਾਰਤੀ ਮਿਆਰ ਬਿਊਰੋ AI ਸਹਾਇਕ",
      settings_lang_label: "ਸਰਗਰਮ ਭਾਸ਼ਾ",
      recent_lookups: "ਹਾਲੀਆ ਮਿਆਰੀ ਖੋਜਾਂ",
      clear_history: "ਇਤਿਹਾਸ ਮਿਟਾਓ",
      close_btn: "ਬੰਦ ਕਰੋ",
      lang_select_title: "ਭਾਸ਼ਾ ਚੁਣੋ",
      lang_select_sub: "BIS AI ਸਹਾਇਕ ਲਈ ਭਾਸ਼ਾ ਚੁਣੋ",
      done_btn: "ਮੁਕੰਮਲ →"
    },
    as: {
          "search_placeholder": "ভাৰতীয় মান, ISI চিহ্ন বা প্ৰমাণপত্ৰৰ বিষয়ে সোধক...",
          "camera_label": "কেমেৰা",
          "voice_label": "কণ্ঠস্বৰ",
          "upload_label": "আপলোড",
          "greeting_ask": "যিকোনো কথা সোধক",
          "greeting_about": "BIS ৰ বিষয়ে",
          "greeting_sub": "ভাৰতীয় মান আৰু প্ৰমাণপত্ৰ",
          "menu_home": "ঘৰ",
          "menu_new_chat": "নতুন বার্তালাপ",
          "menu_ai_assistant": "AI সহায়ক",
          "menu_recents": "শেহতীয়া",
          "see_all": "সকলো চাওক",
          "no_recents": "কোনো শেহতীয়া অনুসন্ধান নাই।",
          "menu_settings": "ছেটিংছ",
          "menu_language": "ভাষা",
          "menu_help": "সহায় আৰু সমৰ্থন",
          "portal_title": "বিআইএছ সেতু মান পৰ্টেল",
          "portal_sub": "ভাৰতীয় মান ব্যুৰো AI সহায়ক",
          "settings_lang_label": "সক্ৰিয় ভাষা",
          "recent_lookups": "শেহতীয়া মান অনুসন্ধান",
          "clear_history": "ইতিহাস মচক",
          "close_btn": "বন্ধ কৰক",
          "lang_select_title": "ভাষা বাছক",
          "lang_select_sub": "BIS AI সহায়কৰ বাবে ভাষা বাছক",
          "done_btn": "সম্পন্ন →"
    },
    mai: {
          "search_placeholder": "भारतीय मानक, ISI मार्क वा प्रमाणन संबंधी पूछू...",
          "camera_label": "कैमरा",
          "voice_label": "आवाज",
          "upload_label": "अपलोड",
          "greeting_ask": "किछुओ पूछू",
          "greeting_about": "BIS संबंध मे",
          "greeting_sub": "भारतीय मानक आ प्रमाणन",
          "menu_home": "होम",
          "menu_new_chat": "नव चैट",
          "menu_ai_assistant": "AI सहायक",
          "menu_recents": "हालिया",
          "see_all": "सभटा देखू",
          "no_recents": "अखन धरि कोनो हालिया खोज नहि अछि।",
          "menu_settings": "सेटिंग्स",
          "menu_language": "भाषा",
          "menu_help": "सहायता आ समर्थन",
          "portal_title": "बीआईएस सेतु मानक पोर्टल",
          "portal_sub": "भारतीय मानक ब्यूरो AI सहायक",
          "settings_lang_label": "सक्रिय भाषा",
          "recent_lookups": "हालिया मानक खोज",
          "clear_history": "इतिहास साफ करू",
          "close_btn": "बन्द करू",
          "lang_select_title": "भाषा चुनू",
          "lang_select_sub": "BIS AI सहायक लेल अपन भाषा चुनू",
          "done_btn": "सम्पन्न →"
    },
    mni: {
          "search_placeholder": "ভারতকী ষ্টেন্দর্দশিং, ISI মার্ক নত্রগা সর্তিফিকেসনগী মরমদা হংবিয়ু...",
          "camera_label": "কেমেরা",
          "voice_label": "খোন্থোক",
          "upload_label": "অপলোড",
          "greeting_ask": "খুদুংমক হংবিয়ু",
          "greeting_about": "BIS গী মরমদা",
          "greeting_sub": "ভারতকী ষ্টেন্দর্দশিং অমসুং সর্তিফিকেসনশিং",
          "menu_home": "য়ুম",
          "menu_new_chat": "অনৌবা ৱারী",
          "menu_ai_assistant": "AI মতেং পাংবা",
          "menu_recents": "হন্দক্কী",
          "see_all": "পুম্নমক য়েংবিয়ু",
          "no_recents": "হৌজিক ফাওবা অমত্তা থীবা লৈত্রি।",
          "menu_settings": "সেটিংশিং",
          "menu_language": "লোন",
          "menu_help": "মতেং অমসুং শৌগৎপা",
          "portal_title": "BIS সেতু ষ্টেন্দর্দস পোর্তেল",
          "portal_sub": "ব্যুরো ওফ ইন্দিয়ন ষ্টেন্দর্দস AI মতেং পাংবা",
          "settings_lang_label": "চৎনরিবা লোন",
          "recent_lookups": "হন্দক্কী ষ্টেন্দর্দ থীবশিং",
          "clear_history": "পুৱারী শেংদোকউ",
          "close_btn": "থিংশিল্লু",
          "lang_select_title": "লোন খনবিয়ু",
          "lang_select_sub": "BIS AI মতেং পাংবগীদমক লোন খনবিয়ু",
          "done_btn": "লোইরে →"
    },
    sa: {
          "search_placeholder": "भारतीयमानकानाम्, ISI चिह्नानाम् प्रमाणीकरणस्य च विषये पृच्छतु...",
          "camera_label": "चित्रग्राही",
          "voice_label": "वाणी",
          "upload_label": "उपारोपयतु",
          "greeting_ask": "किञ्चिदपि पृच्छतु",
          "greeting_about": "BIS विषये",
          "greeting_sub": "भारतीयमानकानि प्रमाणीकरणानि च",
          "menu_home": "गृहम्",
          "menu_new_chat": "नूतनसंवादः",
          "menu_ai_assistant": "AI सहायकः",
          "menu_recents": "नूतनानि",
          "see_all": "सर्वं पश्यतु",
          "no_recents": "न किमपि नूतनान्वेषणम्।",
          "menu_settings": "विन्यासाः",
          "menu_language": "भाषा",
          "menu_help": "साहाय्यं समर्थनं च",
          "portal_title": "BIS सेतु मानकजालस्थानम्",
          "portal_sub": "भारतीयमानकब्यूरो AI सहायकः",
          "settings_lang_label": "सक्रिया भाषा",
          "recent_lookups": "नूत्नमानकान्वेषणानि",
          "clear_history": "इतिहासम् अपनयतु",
          "close_btn": "पिदधातु",
          "lang_select_title": "भाषां चिनोतु",
          "lang_select_sub": "BIS AI सहायकस्य कृते भाषां चिनोतु",
          "done_btn": "सम्पन्नम् →"
    },
    sd: {
          "search_placeholder": "هندستاني معيارن، ISI مارڪ يا سرٽيفڪيشن بابت پڇو...",
          "camera_label": "ڪيمرا",
          "voice_label": "آواز",
          "upload_label": "اپ لوڊ",
          "greeting_ask": "ڪجهه به پڇو",
          "greeting_about": "BIS بابت",
          "greeting_sub": "هندستاني معيار ۽ سرٽيفڪيشن",
          "menu_home": "گھر",
          "menu_new_chat": "نئين چيٽ",
          "menu_ai_assistant": "AI مددگار",
          "menu_recents": "تازو",
          "see_all": "سڀ ڏسو",
          "no_recents": "اڃا تائين ڪا تازي ڳولا ناهي.",
          "menu_settings": "سيٽنگس",
          "menu_language": "ٻولي",
          "menu_help": "مدد ۽ حمايت",
          "portal_title": "BIS سيتو معيار پورٽل",
          "portal_sub": "بيورو آف انڊين اسٽينڊرڊس AI اسسٽنٽ",
          "settings_lang_label": "فعال ٻولي",
          "recent_lookups": "تازيون معيار ڳولائون",
          "clear_history": "تاريخ صاف ڪريو",
          "close_btn": "بند ڪريو",
          "lang_select_title": "ٻولي چونڊيو",
          "lang_select_sub": "BIS AI اسسٽنٽ لاءِ ٻولي چونڊيو",
          "done_btn": "مڪمل →"
    },
    ks: {
          "search_placeholder": "ہندوستانی معیارات، ISI نشان یا سرٹیفیکیشن بارس منٛز پرژھِو...",
          "camera_label": "کیمرہ",
          "voice_label": "آواز",
          "upload_label": "اپ لوڈ",
          "greeting_ask": "کینٛہہ تہِ پرژھِو",
          "greeting_about": "BIS متعلق",
          "greeting_sub": "ہندوستانی معیارات تہٕ تصدیق نامہٕ",
          "menu_home": "گھر",
          "menu_new_chat": "نٔو کتھ باتھ",
          "menu_ai_assistant": "AI مددگار",
          "menu_recents": "حالیہ",
          "see_all": "سٲری وُچھِو",
          "no_recents": "کانٛہہ تہِ حالیہ تلاش چھُنہٕ۔",
          "menu_settings": "سیٹنگس",
          "menu_language": "زبان",
          "menu_help": "مدد تہٕ حمایت",
          "portal_title": "BIS سیتو معیارات پورٹل",
          "portal_sub": "بیورو آف انڈین سٹینڈرڈز AI اسسٹنٹ",
          "settings_lang_label": "متحرک زبان",
          "recent_lookups": "حالیہ معیار تلاش",
          "clear_history": "تاریخ صاف کٔرِو",
          "close_btn": "بند کٔرِو",
          "lang_select_title": "زبان ژارِو",
          "lang_select_sub": "BIS AI اسسٹنٹ خٲطرٕ زبان ژارِو",
          "done_btn": "مکمل →"
    },
    kok: {
          "search_placeholder": "भारतीय मानकां, ISI मार्क वा प्रमाणपत्रां विशीं विचारात...",
          "camera_label": "कॅमेरा",
          "voice_label": "आवाज",
          "upload_label": "अपलोड",
          "greeting_ask": "कांय विचारात",
          "greeting_about": "BIS विशीं",
          "greeting_sub": "भारतीय मानकां आनी प्रमाणीकरण",
          "menu_home": "घर",
          "menu_new_chat": "नवो संवाद",
          "menu_ai_assistant": "AI मदतनीस",
          "menu_recents": "हालींचे",
          "see_all": "सगळें पळयात",
          "no_recents": "अजुनूय कांयच सोद ना.",
          "menu_settings": "मांडणी",
          "menu_language": "भास",
          "menu_help": "मदत आनी तेंको",
          "portal_title": "BIS सेतू मानकां पोर्टल",
          "portal_sub": "भारतीय मानक ब्युरो AI मदतनीस",
          "settings_lang_label": "चालू भास",
          "recent_lookups": "हालींचे मानक सोद",
          "clear_history": "इतिहास नितळ करा",
          "close_btn": "धांपात",
          "lang_select_title": "भास वेचा",
          "lang_select_sub": "BIS AI मदतनीसा खातीर भास वेचा",
          "done_btn": "जालें →"
    },
    doi: {
          "search_placeholder": "भारतीय मानक, ISI मार्के जां प्रमाणीकरण बारै पुच्छो...",
          "camera_label": "कैमरा",
          "voice_label": "आवाज",
          "upload_label": "अपलोड",
          "greeting_ask": "कुश वी पुच्छो",
          "greeting_about": "BIS बारै",
          "greeting_sub": "भारतीय मानक ते प्रमाणीकरण",
          "menu_home": "घर",
          "menu_new_chat": "नमी गल्ल-बात",
          "menu_ai_assistant": "AI मददगार",
          "menu_recents": "हाल दे",
          "see_all": "सब्भे दिक्खो",
          "no_recents": "हले तगर कोई खोज नेईं ऐ।",
          "menu_settings": "सेटिंग्स",
          "menu_language": "बोली",
          "menu_help": "मदद ते समर्थन",
          "portal_title": "BIS सेतु मानक पोर्टल",
          "portal_sub": "भारतीय मानक ब्यूरो AI मददगार",
          "settings_lang_label": "सक्रिय बोली",
          "recent_lookups": "हाल दियां मानक खोजां",
          "clear_history": "इतिहास साफ करो",
          "close_btn": "बंद करो",
          "lang_select_title": "बोली चुनो",
          "lang_select_sub": "BIS AI मददगार आस्तै बोली चुनो",
          "done_btn": "पूरा होया →"
    },
    ne: {
          "search_placeholder": "भारतीय मानक, ISI मार्क वा प्रमाणीकरण बारे सोध्नुहोस्...",
          "camera_label": "क्यामेरा",
          "voice_label": "आवाज",
          "upload_label": "अपलोड",
          "greeting_ask": "केही पनि सोध्नुहोस्",
          "greeting_about": "BIS बारेमा",
          "greeting_sub": "भारतीय मानक र प्रमाणीकरण",
          "menu_home": "गृहपृष्ठ",
          "menu_new_chat": "नयाँ कुराकानी",
          "menu_ai_assistant": "AI सहायक",
          "menu_recents": "भर्खरका",
          "see_all": "सबै हेर्नुहोस्",
          "no_recents": "अहिलेसम्म कुनै भर्खरको खोज छैन।",
          "menu_settings": "सेटिङहरू",
          "menu_language": "भाषा",
          "menu_help": "सहायता र समर्थन",
          "portal_title": "BIS सेतु मानक पोर्टल",
          "portal_sub": "भारतीय मानक ब्यूरो AI सहायक",
          "settings_lang_label": "सक्रिय भाषा",
          "recent_lookups": "भर्खरका मानक खोजहरू",
          "clear_history": "इतिहास खाली गर्नुहोस्",
          "close_btn": "बन्द गर्नुहोस्",
          "lang_select_title": "भाषा छान्नुहोस्",
          "lang_select_sub": "BIS AI सहायकका लागि भाषा छान्नुहोस्",
          "done_btn": "सकियो →"
    },
    brx: {
          "search_placeholder": "भारतनि मान, ISI सिन एबा मानफोरमायनायनि बागै सों...",
          "camera_label": "केमेरा",
          "voice_label": "राव",
          "upload_label": "अपलोड",
          "greeting_ask": "जेखौबो सों",
          "greeting_about": "BIS नि बागै",
          "greeting_sub": "भारतनि मान आरो मानफोरमायनाय",
          "menu_home": "न",
          "menu_new_chat": "गोदान सावरायनाय",
          "menu_ai_assistant": "AI हेफाजाबग्रा",
          "menu_recents": "दासान्दि",
          "see_all": "गासैबो नाय",
          "no_recents": "दासिमबो जेबो नायगिरनाय गैया।",
          "menu_settings": "सेटिंस",
          "menu_language": "राव",
          "menu_help": "हेफाजाब आरो मदद",
          "portal_title": "BIS सेतु मान पोर्टल",
          "portal_sub": "भारतीय मानक ब्युरो AI हेफाजाबग्रा",
          "settings_lang_label": "चलिफु राव",
          "recent_lookups": "दासान्दि मान नायगिरनाय",
          "clear_history": "जारौ साफा खालाम",
          "close_btn": "बन्द खालाम",
          "lang_select_title": "राव सायख",
          "lang_select_sub": "BIS AI हेफाजाबग्रानि थाखाय राव सायख",
          "done_btn": "जोबबाय →"
    },
    sat: {
          "search_placeholder": "ᱵᱷᱟᱨᱚᱛᱤᱭᱚ ᱢᱟᱱᱚᱠ, ISI ᱪᱤᱱᱦᱟᱹ ᱵᱟᱵᱚᱛ ᱠᱩᱞᱤ ᱢᱮ...",
          "camera_label": "ᱠᱮᱢᱮᱨᱟ",
          "voice_label": "ᱟᱲᱟᱝ",
          "upload_label": "ᱟᱯᱞᱳᱰ",
          "greeting_ask": "ᱡᱟᱦᱟᱸᱱᱟᱜ ᱜᱮ ᱠᱩᱞᱤ ᱢᱮ",
          "greeting_about": "BIS ᱵᱟᱵᱚᱛ",
          "greeting_sub": "ᱵᱷᱟᱨᱚᱛᱤᱭᱚ ᱢᱟᱱᱚᱠ ᱟᱨ ᱥᱟᱹᱵᱩᱛ",
          "menu_home": "ᱚᱲᱟᱜ",
          "menu_new_chat": "ᱱᱟᱣᱟ ᱜᱟᱞᱢᱟᱨᱟᱣ",
          "menu_ai_assistant": "AI ᱜᱚᱲᱚᱭᱤᱡ",
          "menu_recents": "ᱱᱤᱛᱚᱜᱟᱜ",
          "see_all": "ᱡᱚᱛᱚ ᱧᱮᱞ ᱢᱮ",
          "no_recents": "ᱱᱤᱛᱚᱜ ᱪᱮᱫ ᱦᱚᱸ ᱥᱮᱸᱫᱽᱨᱟ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾",
          "menu_settings": "ᱥᱟᱡᱟᱣ",
          "menu_language": "ᱯᱟᱹᱨᱥᱤ",
          "menu_help": "ᱜᱚᱲᱚ ᱟᱨ ᱥᱚᱦᱚᱫ",
          "portal_title": "BIS ᱥᱮᱛᱩ ᱢᱟᱱᱚᱠ ᱯᱳᱨᱴᱟᱞ",
          "portal_sub": "ᱵᱷᱟᱨᱚᱛᱤᱭᱚ ᱢᱟᱱᱚᱠ ᱵᱤᱣᱨᱳ AI ᱜᱚᱲᱚᱭᱤᱡ",
          "settings_lang_label": "ᱪᱟᱹᱞᱩ ᱯᱟᱹᱨᱥᱤ",
          "recent_lookups": "ᱱᱤᱛᱚᱜᱟᱜ ᱢᱟᱱᱚᱠ ᱥᱮᱸᱫᱽᱨᱟ",
          "clear_history": "ᱱᱟᱜᱟᱢ ᱯᱷᱟᱨᱪᱟᱭ ᱢᱮ",
          "close_btn": "ᱵᱚᱸᱫᱽ ᱢᱮ",
          "lang_select_title": "ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ",
          "lang_select_sub": "BIS AI ᱜᱚᱲᱚᱭᱤᱡ ᱞᱟᱹᱜᱤᱫ ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ",
          "done_btn": "ᱦᱩᱭᱮᱱᱟ →"
    }
  };

  const ALL_LANGUAGES = [
    { code: 'en', display: 'EN', name: 'English', native: 'English', sub: 'Default' },
    { code: 'hi', display: 'HI', name: 'हिन्दी (Hindi)', native: 'हिन्दी', sub: 'Hindi' },
    { code: 'bn', display: 'BN', name: 'বাংলা (Bengali)', native: 'বাংলা', sub: 'Bengali' },
    { code: 'te', display: 'TE', name: 'తెలుగు (Telugu)', native: 'తెలుగు', sub: 'Telugu' },
    { code: 'mr', display: 'MR', name: 'मराठी (Marathi)', native: 'मराठी', sub: 'Marathi' },
    { code: 'ta', display: 'TA', name: 'தமிழ் (Tamil)', native: 'தமிழ்', sub: 'Tamil' },
    { code: 'gu', display: 'GU', name: 'ગુજરાતી (Gujarati)', native: 'ગુજરાતી', sub: 'Gujarati' },
    { code: 'ur', display: 'UR', name: 'اردو (Urdu)', native: 'اردو', sub: 'Urdu' },
    { code: 'kn', display: 'KN', name: 'ಕನ್ನಡ (Kannada)', native: 'ಕನ್ನಡ', sub: 'Kannada' },
    { code: 'or', display: 'OR', name: 'ଓଡ଼ିଆ (Odia)', native: 'ଓଡ଼ିଆ', sub: 'Odia' },
    { code: 'ml', display: 'ML', name: 'മലയാളം (Malayalam)', native: 'മലയാളം', sub: 'Malayalam' },
    { code: 'pa', display: 'PA', name: 'ਪੰਜਾਬੀ (Punjabi)', native: 'ਪੰਜਾਬੀ', sub: 'Punjabi' },
    { code: 'as', display: 'AS', name: 'অসমীয়া (Assamese)', native: 'অসমীয়া', sub: 'Assamese' },
    { code: 'mai', display: 'MAI', name: 'मैथिली (Maithili)', native: 'मैथिली', sub: 'Maithili' },
    { code: 'mni', display: 'MNI', name: 'মৈতৈলোন্ (Manipuri)', native: 'মৈতৈলোন্', sub: 'Manipuri' },
    { code: 'sa', display: 'SA', name: 'संस्कृतम् (Sanskrit)', native: 'संस्कृतम्', sub: 'Sanskrit' },
    { code: 'sd', display: 'SD', name: 'سنڌي / सिंधी (Sindhi)', native: 'سنڌي', sub: 'Sindhi' },
    { code: 'ks', display: 'KS', name: 'कॉशुर / کٲشُر (Kashmiri)', native: 'कॉशुर', sub: 'Kashmiri' },
    { code: 'kok', display: 'KOK', name: 'कोंकणी (Konkani)', native: 'कोंकणी', sub: 'Konkani' },
    { code: 'doi', display: 'DOI', name: 'डोगरी (Dogri)', native: 'डोगरी', sub: 'Dogri' },
    { code: 'ne', display: 'NE', name: 'नेपाली (Nepali)', native: 'नेपाली', sub: 'Nepali' },
    { code: 'brx', display: 'BRX', name: 'बोडो (Bodo)', native: 'बोडो', sub: 'Bodo' },
    { code: 'sat', display: 'SAT', name: 'संथाली (Santali)', native: 'संथाली', sub: 'Santali' }
  ];

  // Helper to get history
  function getStoredHistory() {
    try {
      const raw = localStorage.getItem('manak_history') || localStorage.getItem('bis_history') || '[]';
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  // Ensure Modals exist in DOM
  function ensureSharedModals() {
    if (document.getElementById('shared-modals-container')) return;

    const container = document.createElement('div');
    container.id = 'shared-modals-container';

    // Only inject modals if not already in document
    const hasProfile = !!document.getElementById('profile-modal');
    const hasHelp = !!document.getElementById('help-modal');
    const hasLang = !!document.getElementById('lang-modal');

    let modalsHtml = '';

    if (!hasProfile) {
      modalsHtml += `
        <!-- Settings & User Profile Modal -->
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center hidden max-w-full w-full overflow-hidden" id="profile-modal" style="overscroll-behavior: contain;">
          <div class="w-full max-w-[440px] bg-white rounded-t-3xl p-6 flex flex-col max-h-[82vh] overflow-y-auto box-border">
            <div class="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4"></div>
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div class="w-12 h-12 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4a4 4 0 100 8 4 4 0 000-8zm-2 4a2 2 0 114 0 2 2 0 01-4 0zm-5 12a7 7 0 0114 0H5z"></path>
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="font-serif font-bold text-lg text-[#0F2C59] truncate" data-i18n="portal_title">BIS Setu Standards Portal</h3>
                <p class="text-xs text-slate-500 truncate" data-i18n="portal_sub">Bureau of Indian Standards AI Assistant</p>
              </div>
            </div>

            <div class="my-4 space-y-3">
              <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-slate-800" data-i18n="settings_lang_label">Active UI Language</span>
                  <span class="text-[11px] text-slate-500" id="settings-lang-name">English (Default)</span>
                </div>
                <button class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#EA580C] hover:bg-orange-50 cursor-pointer" onclick="window.closeProfileModal(); window.openLangModal();" type="button">Change</button>
              </div>

              <div class="pt-2">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-[#0F2C59]" data-i18n="recent_lookups">Recent Standards Lookups</h4>
                  <span class="text-[11px] text-slate-400" id="history-count-badge">0 saved</span>
                </div>
                <div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto" id="profile-history-list">
                  <p class="text-xs text-slate-400 py-2 text-center" data-i18n="no_recents">No recent searches yet.</p>
                </div>
              </div>
            </div>

            <div class="flex gap-2 pt-3 border-t border-slate-100">
              <button class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full active:scale-95 transition-transform cursor-pointer" id="clear-history-btn" onclick="window.clearAppHistory();" type="button" data-i18n="clear_history">Clear History</button>
              <button class="flex-1 py-2.5 bg-[#0F2C59] hover:bg-[#0D3B66] text-white text-xs font-semibold rounded-full active:scale-95 transition-transform cursor-pointer" id="close-profile-btn" onclick="window.closeProfileModal();" type="button" data-i18n="close_btn">Close</button>
            </div>
          </div>
        </div>
      `;
    }

    if (!hasHelp) {
      modalsHtml += `
        <!-- Help & Support Functional Modal -->
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center hidden max-w-full w-full overflow-hidden" id="help-modal" style="overscroll-behavior: contain;">
          <div class="w-full max-w-[440px] bg-white rounded-t-3xl p-6 flex flex-col max-h-[82vh] overflow-y-auto box-border">
            <div class="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4"></div>
            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div class="w-11 h-11 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold text-lg shrink-0">
                <svg class="w-6 h-6 text-[#EA580C]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div>
                <h3 class="font-serif font-bold text-lg text-[#0F2C59]">BIS Help &amp; Support</h3>
                <p class="text-xs text-slate-500">Bureau of Indian Standards Assistance</p>
              </div>
            </div>

            <div class="my-4 space-y-3">
              <div class="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                <span class="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider block mb-1">Toll-Free Consumer Helpline</span>
                <a href="tel:1800111465" class="text-base font-bold text-[#0F2C59] flex items-center gap-1.5 hover:underline">
                  <span>📞 1800 11 1465</span>
                </a>
                <p class="text-[11px] text-slate-500 mt-1">Working Days: Mon – Sat (9:00 AM – 5:30 PM IST)</p>
              </div>

              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-700">Official Portal:</span>
                  <a href="https://www.bis.gov.in" target="_blank" rel="noopener" class="text-[#EA580C] font-semibold hover:underline">www.bis.gov.in</a>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-700">Online Standards:</span>
                  <a href="https://www.manakonline.in" target="_blank" rel="noopener" class="text-[#EA580C] font-semibold hover:underline">www.manakonline.in</a>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-700">Complaints Email:</span>
                  <a href="mailto:complaints@bis.gov.in" class="text-[#EA580C] font-semibold hover:underline">complaints@bis.gov.in</a>
                </div>
              </div>
            </div>

            <div class="flex gap-2 pt-2 border-t border-slate-100">
              <button class="flex-1 py-2.5 bg-orange-100 hover:bg-orange-200 text-[#EA580C] text-xs font-semibold rounded-full active:scale-95 transition-transform cursor-pointer" onclick="window.closeHelpModal(); window.onSidebarSearchClick('BIS Help and Support Helpline');" type="button">Ask AI Assistant</button>
              <button class="flex-1 py-2.5 bg-[#0F2C59] hover:bg-[#0D3B66] text-white text-xs font-semibold rounded-full active:scale-95 transition-transform cursor-pointer" onclick="window.closeHelpModal();" type="button">Close</button>
            </div>
          </div>
        </div>
      `;
    }

    if (!hasLang) {
      const optionsHtml = ALL_LANGUAGES.map((lang, idx) => `
        <button type="button" class="lang-option p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between text-left cursor-pointer group active:scale-95 ${idx === 0 ? 'border-[#EA580C] bg-orange-50/70 text-[#EA580C] font-semibold ring-1 ring-[#EA580C]/30' : 'border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/40 bg-white text-slate-800'}" data-code="${lang.code}" data-display="${lang.display}" data-name="${lang.name}">
          <div class="flex flex-col min-w-0 pr-1">
            <span class="text-sm font-semibold leading-tight text-slate-900 group-hover:text-[#EA580C] truncate">${lang.native}</span>
            <span class="text-[11px] text-slate-500 font-medium leading-none mt-0.5 truncate">${lang.sub}</span>
          </div>
          <div class="w-4 h-4 rounded-full ${idx === 0 ? 'bg-[#EA580C] text-white' : 'border-2 border-slate-300 group-hover:border-[#EA580C]'} flex items-center justify-center shrink-0 check-indicator">
            ${idx === 0 ? '<svg class="w-2.5 h-2.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
        </button>
      `).join('');

      modalsHtml += `
        <!-- Language Selector Modal (All 22 Constitutional Languages) -->
        <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center hidden max-w-full w-full overflow-hidden" data-purpose="language-picker-modal" id="lang-modal" style="overscroll-behavior: contain;">
          <div class="w-full max-w-[440px] max-h-[82vh] h-[580px] bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl box-border relative" id="lang-modal-card" style="overscroll-behavior: contain;">
            <div class="px-4 pt-4 pb-2 border-b border-slate-100 bg-white shrink-0 text-center">
              <h3 class="text-base sm:text-lg font-bold text-[#0F2C59] tracking-tight" data-i18n="lang_select_title">Select Language</h3>
              <p class="text-xs text-slate-500 mt-0.5" data-i18n="lang_select_sub">Choose your preferred language for BIS AI Assistant</p>
            </div>
            <div class="flex-1 overflow-y-auto px-4 py-3 min-h-0 space-y-0 overscroll-contain" id="lang-options-container" style="touch-action: pan-y;">
              <div class="grid grid-cols-2 gap-2.5">
                ${optionsHtml}
              </div>
            </div>
            <div class="p-4 pt-3 border-t border-slate-100 bg-white shrink-0">
              <button type="button" class="w-full py-3 bg-[#EA580C] hover:bg-[#D84315] text-white font-semibold text-sm rounded-full active:scale-95 transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer" id="close-lang" onclick="window.confirmLanguageSelection();">
                <span data-i18n="done_btn">Done →</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (modalsHtml) {
      container.innerHTML = modalsHtml;
      document.body.appendChild(container);
    }

    // Modal background dismiss triggers
    const profileModal = document.getElementById('profile-modal');
    if (profileModal) {
      profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) window.closeProfileModal();
      });
    }

    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
      helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) window.closeHelpModal();
      });
    }

    const langModal = document.getElementById('lang-modal');
    if (langModal) {
      langModal.addEventListener('click', (e) => {
        if (e.target === langModal) window.closeLangModal();
      });
    }

    // Attach click listeners to language options
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const code = opt.getAttribute('data-code');
        window.tempSelectedLang = code;
        window.updateLanguageModalActiveState(code);
      });
    });
  }

  // Web Component for Unified Sidebar
  class AppSidebar extends HTMLElement {
    connectedCallback() {
      const activePage = this.getAttribute('active-page') || 'landing';
      this.render(activePage);
      this.initEvents();
      ensureSharedModals();

      // Initial state sync
      const currentLang = localStorage.getItem('manak_lang') || localStorage.getItem('bis_lang') || 'en';
      window.tempSelectedLang = currentLang;
      window.updateLanguageModalActiveState(currentLang);
      window.applySharedUiLanguage(currentLang);
    }

    render(activePage) {
      const isLanding = activePage === 'landing';
      const isSearch = activePage === 'search';

      this.innerHTML = `
        <!-- Slideover Navigation Drawer Overlay -->
        <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 max-w-full w-full overflow-hidden opacity-0 pointer-events-none hidden" data-purpose="navigation-drawer-modal" id="side-drawer" style="overscroll-behavior: contain;">
          <aside class="w-64 max-w-[85vw] h-full bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl flex flex-col justify-between overflow-y-auto box-border -translate-x-full select-none" id="drawer-panel" data-purpose="sidebar-navigation">
            <div>
              <!-- Top Header Close Bar -->
              <div class="flex items-center justify-between px-3.5 pt-3.5 pb-2 border-b border-slate-100 mb-1">
                <span class="text-xs font-extrabold text-[#0c3c6f] tracking-tight">BIS SETU</span>
                <button id="close-drawer" aria-label="Close Navigation Menu" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none cursor-pointer" type="button">
                  <div class="w-5 h-5 flex flex-col justify-center items-center space-y-1">
                    <span class="w-4 h-0.5 bg-slate-700 rounded-full transition-colors"></span>
                    <span class="w-4 h-0.5 bg-slate-700 rounded-full transition-colors"></span>
                    <span class="w-4 h-0.5 bg-slate-700 rounded-full transition-colors"></span>
                  </div>
                </button>
              </div>

              <!-- Main Navigation Links -->
              <div class="px-3 pt-2 pb-2 space-y-1.5">
                <!-- Home Nav Item -->
                ${
                  isLanding
                    ? `<a class="sidebar-item flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 relative group active bg-gradient-to-r from-orange-500 via-[#ea580c] to-[#c2410c] text-white shadow-md shadow-orange-500/25" data-item-id="home" href="/" onclick="window.closeAppSidebar();">
                        <div class="flex items-center space-x-3">
                          <div class="icon-box w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
                          </div>
                          <span class="item-label font-medium tracking-tight" data-i18n="menu_home">Home</span>
                        </div>
                        <span class="active-dot w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      </a>`
                    : `<a class="sidebar-item flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 group text-slate-700 hover:text-slate-900 bg-white/40 hover:bg-white/90 border border-slate-200/50 hover:border-orange-200 shadow-2xs hover:shadow-sm cursor-pointer" data-item-id="home" href="/" onclick="window.closeAppSidebar();">
                        <div class="flex items-center space-x-3">
                          <div class="icon-box w-7 h-7 rounded-xl flex items-center justify-center transition-colors bg-slate-100 group-hover:bg-orange-50 text-slate-600 group-hover:text-[#ea580c]">
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
                          </div>
                          <span class="item-label group-hover:translate-x-0.5 transition-transform" data-i18n="menu_home">Home</span>
                        </div>
                      </a>`
                }

                <!-- New Chat Nav Item (ONLY on Search/Chat page sidebar!) -->
                ${
                  isSearch
                    ? `<button type="button" class="w-full sidebar-item flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 group text-slate-700 hover:text-slate-900 bg-white/40 hover:bg-white/90 border border-slate-200/50 hover:border-orange-200 shadow-2xs hover:shadow-sm cursor-pointer text-left" data-item-id="new-chat" onclick="window.closeAppSidebar(); if (typeof window.startNewChat === 'function') { window.startNewChat(); } else { window.location.href = '/search'; }">
                        <div class="flex items-center space-x-3">
                          <div class="icon-box w-7 h-7 rounded-xl flex items-center justify-center transition-colors bg-slate-100/80 group-hover:bg-orange-50 text-slate-600 group-hover:text-[#ea580c]">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h8m-4-4v8m-7 8l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>
                          </div>
                          <span class="item-label group-hover:translate-x-0.5 transition-transform" data-i18n="menu_new_chat">New Chat</span>
                        </div>
                        <span class="text-[10px] font-semibold text-slate-400 group-hover:text-orange-500 bg-slate-100 group-hover:bg-orange-50 px-1.5 py-0.5 rounded-md border border-slate-200/60 group-hover:border-orange-200/60 transition-colors">+</span>
                      </button>`
                    : ''
                }

                <!-- AI Assistant Nav Item -->
                ${
                  isSearch
                    ? `<a class="sidebar-item flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 relative group active bg-gradient-to-r from-orange-500 via-[#ea580c] to-[#c2410c] text-white shadow-md shadow-orange-500/25" data-item-id="ai-assistant" href="/search" onclick="window.closeAppSidebar();">
                        <div class="flex items-center space-x-3">
                          <div class="icon-box w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L21.6 12l-7.2 2.8L12 22l-2.4-7.2L2.4 12l7.2-2.8L12 2z"></path></svg>
                          </div>
                          <span class="item-label font-medium tracking-tight" data-i18n="menu_ai_assistant">AI Assistant</span>
                        </div>
                        <span class="active-dot w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      </a>`
                    : `<a class="sidebar-item flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 group text-slate-700 hover:text-slate-900 bg-white/40 hover:bg-white/90 border border-slate-200/50 hover:border-orange-200 shadow-2xs hover:shadow-sm cursor-pointer" data-item-id="ai-assistant" href="/search" onclick="window.closeAppSidebar();">
                        <div class="flex items-center space-x-3">
                          <div class="icon-box w-7 h-7 rounded-xl flex items-center justify-center transition-colors bg-gradient-to-tr from-orange-100 to-amber-50 group-hover:from-orange-200 group-hover:to-amber-100 text-[#ea580c]">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L21.6 12l-7.2 2.8L12 22l-2.4-7.2L2.4 12l7.2-2.8L12 2z"></path></svg>
                          </div>
                          <span class="item-label group-hover:translate-x-0.5 transition-transform" data-i18n="menu_ai_assistant">AI Assistant</span>
                        </div>
                      </a>`
                }
              </div>

              <!-- Recents Section -->
              <div class="px-3 pt-2 pb-1">
                <div class="flex items-center justify-between text-xs px-2 mb-2.5">
                  <div class="flex items-center space-x-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400/80"></span>
                    <span class="font-bold text-slate-400 tracking-widest text-[10px] uppercase" data-i18n="menu_recents">RECENTS</span>
                  </div>
                  <button id="sidebar-see-all-recents" onclick="window.closeAppSidebar(); window.openProfileModal();" class="text-[#ea580c] hover:text-[#c2410c] font-semibold text-[11px] flex items-center space-x-1 px-2 py-0.5 rounded-full hover:bg-orange-50/80 transition-colors group cursor-pointer" type="button">
                    <span data-i18n="see_all">See all</span>
                    <svg class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                  </button>
                </div>

                <!-- Dynamic Recents List Container with Exact Desktop Styling -->
                <div id="drawer-recents-list" class="space-y-1.5">
                  <!-- Populated dynamically -->
                </div>
              </div>
            </div>

            <!-- Bottom Utilities -->
            <div class="p-3 border-t border-slate-100 space-y-2">
              <div class="space-y-1">
                <!-- Settings -->
                <button type="button" onclick="window.closeAppSidebar(); window.openProfileModal();" class="sidebar-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all duration-150 group cursor-pointer text-left" data-item-id="settings">
                  <div class="flex items-center space-x-2.5">
                    <div class="icon-box w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-700 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>
                    </div>
                    <span class="item-label" data-i18n="menu_settings">Settings</span>
                  </div>
                  <svg class="chevron-icon w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                </button>
                <!-- Language -->
                <button type="button" onclick="window.closeAppSidebar(); window.openLangModal();" class="sidebar-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all duration-150 group cursor-pointer text-left" data-item-id="language">
                  <div class="flex items-center space-x-2.5">
                    <div class="icon-box w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-700 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="1.8"></circle><path d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 0 0 0 18M12 3a14.5 14.5 0 0 1 0 18" stroke-linecap="round" stroke-width="1.8"></path></svg>
                    </div>
                    <span class="item-label" data-i18n="menu_language">Language</span>
                  </div>
                  <div class="flex items-center space-x-1.5">
                    <span id="app-sidebar-lang-tag" class="lang-tag text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">EN</span>
                    <svg class="chevron-icon w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                  </div>
                </button>
                <!-- Help & Support -->
                <button type="button" onclick="window.closeAppSidebar(); window.openHelpModal();" class="sidebar-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all duration-150 group cursor-pointer text-left" data-item-id="help">
                  <div class="flex items-center space-x-2.5">
                    <div class="icon-box w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-700 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="1.8"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>
                    </div>
                    <span class="item-label" data-i18n="menu_help">Help &amp; Support</span>
                  </div>
                  <svg class="chevron-icon w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                </button>
              </div>
            </div>
          </aside>
        </div>
      `;
    }

    initEvents() {
      const sideDrawer = this.querySelector('#side-drawer');
      const closeDrawer = this.querySelector('#close-drawer');

      if (closeDrawer) {
        closeDrawer.addEventListener('click', window.closeAppSidebar);
      }

      if (sideDrawer) {
        sideDrawer.addEventListener('click', (e) => {
          if (e.target === sideDrawer) window.closeAppSidebar();
        });
      }

      // Automatically hook up page triggers
      const btnMenu = document.getElementById('btn-menu');
      if (btnMenu) {
        btnMenu.onclick = window.openAppSidebar;
      }
      const sideNavToggle = document.getElementById('sideNavToggle');
      if (sideNavToggle) {
        sideNavToggle.onclick = window.openAppSidebar;
      }

      // Initial render of recents
      window.renderSidebarRecents();
    }
  }

  if (!customElements.get('app-sidebar')) {
    customElements.define('app-sidebar', AppSidebar);
  }

  // Open & Close Sidebar Actions
  window.openAppSidebar = function () {
    const sideDrawer = document.getElementById('side-drawer');
    const drawerPanel = document.getElementById('drawer-panel');
    if (!sideDrawer || !drawerPanel) return;

    window.renderSidebarRecents();

    sideDrawer.classList.remove('hidden');
    void sideDrawer.offsetHeight;
    sideDrawer.classList.remove('pointer-events-none', 'opacity-0');
    sideDrawer.classList.add('opacity-100');
    drawerPanel.classList.remove('-translate-x-full');
  };

  window.closeAppSidebar = function () {
    const sideDrawer = document.getElementById('side-drawer');
    const drawerPanel = document.getElementById('drawer-panel');
    if (!sideDrawer || !drawerPanel) return;

    drawerPanel.classList.add('-translate-x-full');
    sideDrawer.classList.remove('opacity-100');
    sideDrawer.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      if (!sideDrawer.classList.contains('opacity-100')) {
        sideDrawer.classList.add('hidden');
      }
    }, 300);
  };

  // Render recent conversations in the sidebar
  window.renderSidebarRecents = function () {
    const listEl = document.getElementById('drawer-recents-list');
    if (!listEl) return;

    const history = getStoredHistory();
    if (history.length === 0) {
      listEl.innerHTML = `
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <p class="text-[11px] text-slate-400 mb-2" data-i18n="no_recents">No recent searches yet.</p>
          <div class="flex flex-col gap-1">
            <button onclick="window.closeAppSidebar(); window.onSidebarSearchClick('Packaged Drinking Water (IS 14543)');" class="w-full text-left p-2 rounded-lg bg-white border border-slate-200/80 text-[11.5px] text-slate-700 hover:text-[#EA580C] hover:border-orange-300 transition-colors truncate cursor-pointer" type="button">Packaged Water (IS 14543)</button>
            <button onclick="window.closeAppSidebar(); window.onSidebarSearchClick('Gold Hallmark HUID (IS 15820)');" class="w-full text-left p-2 rounded-lg bg-white border border-slate-200/80 text-[11.5px] text-slate-700 hover:text-[#EA580C] hover:border-orange-300 transition-colors truncate cursor-pointer" type="button">Gold Hallmark HUID</button>
          </div>
        </div>
      `;
      return;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    listEl.innerHTML = history.slice(0, 8).map((item, idx) => {
      const safeItem = item.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `
        <div class="sidebar-item group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/90 border border-transparent hover:border-slate-200/70 hover:shadow-xs cursor-pointer transition-all duration-150" data-item-id="recent-${idx+1}" onclick="window.closeAppSidebar(); window.onSidebarSearchClick('${safeItem}')">
          <div class="flex-1 min-w-0 pr-2">
            <p class="recent-title text-xs font-semibold text-slate-800 truncate group-hover:text-orange-950 transition-colors">${escapeHtml(item)}</p>
            <div class="flex items-center space-x-1.5 mt-0.5">
              <span class="recent-dot inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span class="recent-time text-[10px] text-slate-400 font-medium">Recent Search</span>
            </div>
          </div>
          <button type="button" class="more-btn opacity-70 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer shrink-0" title="Delete tab" aria-label="Delete tab" onclick="event.stopPropagation(); window.deleteRecentItem('${safeItem}');">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
    }).join('');
  };

  // Global Delete Option for Recent Tabs
  window.deleteRecentItem = function (query) {
    if (!query) return;
    const clean = query.trim();

    // 1. Remove from manak_history and bis_history
    try {
      let hist = JSON.parse(localStorage.getItem('manak_history') || localStorage.getItem('bis_history') || '[]');
      hist = hist.filter(item => item && item.toLowerCase() !== clean.toLowerCase());
      const saved = JSON.stringify(hist);
      localStorage.setItem('manak_history', saved);
      localStorage.setItem('bis_history', saved);
    } catch (e) {}

    // 2. Remove from manak_tab_sessions
    try {
      let sessions = JSON.parse(localStorage.getItem('manak_tab_sessions') || '{}');
      delete sessions[clean];
      Object.keys(sessions).forEach(k => {
        if (k.toLowerCase() === clean.toLowerCase()) {
          delete sessions[k];
        }
      });
      localStorage.setItem('manak_tab_sessions', JSON.stringify(sessions));
    } catch (e) {}

    // 3. Re-render UI recents in sidebar and modals
    if (typeof window.renderSidebarRecents === 'function') {
      window.renderSidebarRecents();
    }
    if (typeof window.renderProfileHistory === 'function') {
      window.renderProfileHistory();
    }
    if (typeof window.renderLandingRecents === 'function') {
      window.renderLandingRecents();
    }
    if (typeof window.renderHistoryModalList === 'function') {
      window.renderHistoryModalList();
    }

    // 4. If current active tab in search page was deleted, notify search page
    if (typeof window.onCurrentTabDeleted === 'function') {
      window.onCurrentTabDeleted(clean);
    }
  };

  // Dispatch search action from sidebar depending on page
  window.onSidebarSearchClick = function (query) {
    if (typeof window.loadRecentTab === 'function') {
      window.loadRecentTab(query);
    } else if (typeof window.setQueryAndSubmit === 'function') {
      window.setQueryAndSubmit(query);
    } else if (typeof window.navigateToSearch === 'function') {
      window.navigateToSearch(query);
    } else {
      window.location.href = `/search?tab=${encodeURIComponent(query)}`;
    }
  };

  // Shared Modals Helpers
  window.openHelpModal = function () {
    const modal = document.getElementById('help-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeHelpModal = function () {
    const modal = document.getElementById('help-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.openProfileModal = function () {
    const modal = document.getElementById('profile-modal');
    if (modal) {
      window.renderProfileHistory();
      modal.classList.remove('hidden');
    }
  };

  window.closeProfileModal = function () {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.openLangModal = function () {
    const modal = document.getElementById('lang-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeLangModal = function () {
    const modal = document.getElementById('lang-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.renderProfileHistory = function () {
    const profileHistoryList = document.getElementById('profile-history-list');
    const historyCountBadge = document.getElementById('history-count-badge');
    if (!profileHistoryList) return;

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    const history = getStoredHistory();
    if (historyCountBadge) {
      historyCountBadge.textContent = `${history.length} saved`;
    }

    if (history.length === 0) {
      profileHistoryList.innerHTML = '<p class="text-xs text-slate-400 py-3 text-center">No recent searches yet.</p>';
      return;
    }

    profileHistoryList.innerHTML = history.map(item => {
      const safeItem = item.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `
        <div class="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200 text-xs text-slate-800 flex items-center justify-between transition-colors cursor-pointer group" onclick="window.closeProfileModal(); window.onSidebarSearchClick('${safeItem}')">
          <span class="truncate font-medium flex-1 pr-2">${escapeHtml(item)}</span>
          <button type="button" class="p-1 text-slate-400 hover:text-red-500 hover:bg-red-100/60 rounded-md transition-colors cursor-pointer shrink-0" title="Delete" aria-label="Delete" onclick="event.stopPropagation(); window.deleteRecentItem('${safeItem}');">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
    }).join('');
  };

  window.clearAppHistory = function () {
    localStorage.removeItem('manak_history');
    localStorage.removeItem('bis_history');
    localStorage.removeItem('manak_tab_sessions');
    window.renderProfileHistory();
    window.renderSidebarRecents();
    if (typeof window.renderLandingRecents === 'function') {
      window.renderLandingRecents();
    }
  };

  window.updateLanguageModalActiveState = function (code) {
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(opt => {
      const optCode = opt.getAttribute('data-code');
      const checkEl = opt.querySelector('.check-indicator');
      if (optCode === code) {
        opt.className = "lang-option p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between text-left cursor-pointer group active:scale-95 border-[#EA580C] bg-orange-50/70 text-[#EA580C] font-semibold ring-1 ring-[#EA580C]/30";
        if (checkEl) {
          checkEl.className = "w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0 check-indicator";
          checkEl.innerHTML = `<svg class="w-2.5 h-2.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        }
      } else {
        opt.className = "lang-option p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between text-left cursor-pointer group active:scale-95 border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/40 bg-white text-slate-800";
        if (checkEl) {
          checkEl.className = "w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-[#EA580C] flex items-center justify-center shrink-0 check-indicator";
          checkEl.innerHTML = "";
        }
      }
    });
  };

  window.confirmLanguageSelection = function () {
    const code = (window.tempSelectedLang || 'en').toLowerCase();
    try {
      localStorage.setItem('manak_lang', code);
      localStorage.setItem('bis_lang', code);
      sessionStorage.setItem('manak_lang', code);
      sessionStorage.setItem('bis_lang', code);
    } catch (e) {}

    window.applySharedUiLanguage(code);
    if (typeof window.applyDesktopLanguage === 'function') {
      window.applyDesktopLanguage(code);
    }
    if (typeof window.applyLandingLanguage === 'function') {
      window.applyLandingLanguage(code);
    }
    if (typeof window.applySearchLanguage === 'function') {
      window.applySearchLanguage(code);
    }
    window.closeLangModal();
    try {
      window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: code } }));
    } catch (e) {}
  };

  window.applySharedUiLanguage = function (code) {
    const safeCode = (code || 'en').toLowerCase();
    const fullT = (typeof window !== 'undefined' && window.MANAK_TRANSLATIONS && window.MANAK_TRANSLATIONS[safeCode]) ? window.MANAK_TRANSLATIONS[safeCode] : null;
    const t = fullT || TRANSLATIONS[safeCode] || TRANSLATIONS['en'] || {};

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (typeof t[key] === 'string' && t[key].includes('<br')) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) {
        el.placeholder = t[key];
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (t[key] !== undefined) {
        el.title = t[key];
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (t[key] !== undefined) {
        el.setAttribute('aria-label', t[key]);
      }
    });

    // Update Header Pill indicator
    const headerLangDisplay = document.getElementById('header-lang-display');
    if (headerLangDisplay) {
      headerLangDisplay.textContent = safeCode.toUpperCase();
    }
    const desktopPill = document.getElementById('desktop-current-lang-pill');
    if (desktopPill) {
      desktopPill.textContent = safeCode.toUpperCase();
    }

    // Update placeholder on all search inputs in DOM
    ['desktop-query-input', 'query-input', 'standardsSearchInput'].forEach(id => {
      const inp = document.getElementById(id);
      if (inp) {
        inp.placeholder = t.desktop_search_placeholder || t.search_placeholder || 'Ask anything about BIS standards...';
      }
    });

    // Update document language
    document.documentElement.lang = safeCode;

    // Update settings label
    const settingsLangName = document.getElementById('settings-lang-name');
    if (settingsLangName) {
      const activeObj = ALL_LANGUAGES.find(l => l.code === safeCode);
      settingsLangName.textContent = activeObj ? activeObj.name : safeCode.toUpperCase();
    }

    // Update sidebar lang tag
    const sideLangTag = document.getElementById('app-sidebar-lang-tag') || document.getElementById('desktop-sidebar-lang-tag');
    if (sideLangTag) {
      sideLangTag.textContent = safeCode.toUpperCase();
    }
  };
})();
