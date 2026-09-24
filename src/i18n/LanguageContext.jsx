import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
];

const STORAGE_KEY = 'safesetu-language';

const translations = {
  te: {
    'Select language': 'భాషను ఎంచుకోండి', English: 'ఇంగ్లీష్', Telugu: 'తెలుగు', Hindi: 'హిందీ', Tamil: 'తమిళం', Malayalam: 'మలయాళం',
    Alerts: 'హెచ్చరికలు', 'About Us': 'మా గురించి', 'Contact Us': 'మమ్మల్ని సంప్రదించండి', Login: 'లాగిన్', Dashboard: 'డ్యాష్‌బోర్డ్', 'Hazard Map': 'ప్రమాద మ్యాప్', 'Control Room': 'కంట్రోల్ రూమ్',
    Overview: 'అవలోకనం', 'Active Hazards': 'క్రియాశీల ప్రమాదాలు', 'Field Operations': 'ఫీల్డ్ కార్యకలాపాలు', 'Officer Assignment': 'అధికారి కేటాయింపు', 'Relocation Centres': 'పునరావాస కేంద్రాలు', 'Communication': 'సమాచారం', Resources: 'వనరులు', Map: 'మ్యాప్', 'Incident History': 'ఘటనల చరిత్ర',
    'Public Platform': 'పబ్లిక్ ప్లాట్‌ఫారమ్', Logout: 'లాగ్ అవుట్', 'SYSTEM OPERATIONAL': 'సిస్టమ్ పనిచేస్తోంది', 'Control Room Administrator': 'కంట్రోల్ రూమ్ నిర్వాహకుడు',
    'National Disaster Management': 'జాతీయ విపత్తు నిర్వహణ', 'Secure Access Portal': 'సురక్షిత ప్రాప్యత పోర్టల్', 'Choose your role to continue to the relevant dashboard': 'సంబంధిత డ్యాష్‌బోర్డ్‌కు కొనసాగడానికి మీ పాత్రను ఎంచుకోండి', 'Government Official': 'ప్రభుత్వ అధికారి', 'Field Officer': 'ఫీల్డ్ అధికారి', 'Control Room Administrator access': 'కంట్రోల్ రూమ్ నిర్వాహకుడి ప్రాప్యత', 'On-site shelter occupancy updates': 'స్థలంలోని ఆశ్రయ కేంద్రం వివరాల నవీకరణలు', 'Map legend': 'మ్యాప్ లెజెండ్', 'Safe Areas': 'సురక్షిత ప్రాంతాలు', 'Top Alerts': 'ముఖ్య హెచ్చరికలు', 'Public advisories': 'ప్రజా సూచనలు', 'Preparedness network': 'సన్నద్ధత నెట్‌వర్క్', 'View all safe areas': 'అన్ని సురక్షిత ప్రాంతాలను చూడండి', 'View all alerts': 'అన్ని హెచ్చరికలను చూడండి', 'View hazard scenario': 'ప్రమాద దృశ్యాన్ని చూడండి', 'Emergency shelters with illustrative available capacity.': 'ఉదాహరణ అందుబాటు సామర్థ్యంతో అత్యవసర ఆశ్రయ కేంద్రాలు.', 'Illustrative scenario data · not live emergency alerts': 'ఉదాహరణ దృశ్య డేటా · ప్రత్యక్ష అత్యవసర హెచ్చరికలు కావు', 'Population at risk': 'ప్రమాదంలో ఉన్న జనాభా', 'Recommended action': 'సిఫార్సు చేసిన చర్య', 'Safety intelligence for stronger communities': 'బలమైన సమాజాల కోసం భద్రతా సమాచారం', 'Need support or more information?': 'సహాయం లేదా మరింత సమాచారం కావాలా?', 'Secure operational access for authorised disaster-management personnel.': 'అధికారిక విపత్తు నిర్వహణ సిబ్బందికి సురక్షిత కార్యాచరణ ప్రాప్యత.', 'Restricted access': 'పరిమిత ప్రాప్యత', 'Select Login Type': 'లాగిన్ రకాన్ని ఎంచుకోండి', 'Official ID': 'అధికారిక ID', 'Enter official ID': 'అధికారిక ID నమోదు చేయండి', 'Password': 'పాస్‌వర్డ్', 'Enter your password': 'మీ పాస్‌వర్డ్ నమోదు చేయండి', 'Demo credentials': 'డెమో వివరాలు', 'SIGN IN': 'సైన్ ఇన్', 'Choose another role': 'మరొక పాత్రను ఎంచుకోండి', 'Authorised': 'అధికారిక', 'Access': 'ప్రాప్యత',
  },
  hi: {
    'Select language': 'भाषा चुनें', English: 'अंग्रेज़ी', Telugu: 'तेलुगु', Hindi: 'हिंदी', Tamil: 'तमिल', Malayalam: 'मलयालम',
    Alerts: 'अलर्ट', 'About Us': 'हमारे बारे में', 'Contact Us': 'संपर्क करें', Login: 'लॉग इन', Dashboard: 'डैशबोर्ड', 'Hazard Map': 'खतरा मानचित्र', 'Control Room': 'कंट्रोल रूम',
    Overview: 'अवलोकन', 'Active Hazards': 'सक्रिय खतरे', 'Field Operations': 'फील्ड संचालन', 'Officer Assignment': 'अधिकारी नियुक्ति', 'Relocation Centres': 'स्थानांतरण केंद्र', Communication: 'संचार', Resources: 'संसाधन', Map: 'मानचित्र', 'Incident History': 'घटना इतिहास',
    'Public Platform': 'सार्वजनिक प्लेटफ़ॉर्म', Logout: 'लॉग आउट', 'SYSTEM OPERATIONAL': 'सिस्टम सक्रिय', 'Control Room Administrator': 'कंट्रोल रूम प्रशासक',
    'National Disaster Management': 'राष्ट्रीय आपदा प्रबंधन', 'Secure Access Portal': 'सुरक्षित प्रवेश पोर्टल', 'Choose your role to continue to the relevant dashboard': 'संबंधित डैशबोर्ड पर जाने के लिए अपनी भूमिका चुनें', 'Government Official': 'सरकारी अधिकारी', 'Field Officer': 'फील्ड अधिकारी', 'Control Room Administrator access': 'कंट्रोल रूम प्रशासक की पहुंच', 'On-site shelter occupancy updates': 'स्थल पर आश्रय केंद्र की जानकारी अपडेट', 'Map legend': 'मानचित्र संकेत', 'Safe Areas': 'सुरक्षित क्षेत्र', 'Top Alerts': 'मुख्य अलर्ट', 'Public advisories': 'सार्वजनिक सूचनाएं', 'Preparedness network': 'तैयारी नेटवर्क', 'View all safe areas': 'सभी सुरक्षित क्षेत्र देखें', 'View all alerts': 'सभी अलर्ट देखें', 'View hazard scenario': 'खतरे का परिदृश्य देखें', 'Emergency shelters with illustrative available capacity.': 'उदाहरणात्मक उपलब्ध क्षमता वाले आपातकालीन आश्रय।', 'Illustrative scenario data · not live emergency alerts': 'उदाहरणात्मक परिदृश्य डेटा · लाइव आपातकालीन अलर्ट नहीं', 'Population at risk': 'जोखिम वाली आबादी', 'Recommended action': 'अनुशंसित कार्रवाई', 'Safety intelligence for stronger communities': 'मजबूत समुदायों के लिए सुरक्षा जानकारी', 'Need support or more information?': 'सहायता या अधिक जानकारी चाहिए?', 'Secure operational access for authorised disaster-management personnel.': 'अधिकृत आपदा प्रबंधन कर्मियों के लिए सुरक्षित परिचालन पहुंच।', 'Restricted access': 'सीमित पहुंच', 'Select Login Type': 'लॉगिन प्रकार चुनें', 'Official ID': 'आधिकारिक ID', 'Enter official ID': 'आधिकारिक ID दर्ज करें', 'Password': 'पासवर्ड', 'Enter your password': 'अपना पासवर्ड दर्ज करें', 'Demo credentials': 'डेमो विवरण', 'SIGN IN': 'साइन इन', 'Choose another role': 'दूसरी भूमिका चुनें', 'Authorised': 'अधिकृत', 'Access': 'पहुंच',
  },
  ta: {
    'Select language': 'மொழியைத் தேர்ந்தெடுக்கவும்', English: 'ஆங்கிலம்', Telugu: 'தெலுங்கு', Hindi: 'இந்தி', Tamil: 'தமிழ்', Malayalam: 'மலையாளம்',
    Alerts: 'எச்சரிக்கைகள்', 'About Us': 'எங்களைப் பற்றி', 'Contact Us': 'தொடர்பு கொள்ள', Login: 'உள்நுழைவு', Dashboard: 'டாஷ்போர்டு', 'Hazard Map': 'அபாய வரைபடம்', 'Control Room': 'கட்டுப்பாட்டு அறை',
    Overview: 'மேலோட்டம்', 'Active Hazards': 'செயலில் உள்ள அபாயங்கள்', 'Field Operations': 'கள செயல்பாடுகள்', 'Officer Assignment': 'அதிகாரி நியமனம்', 'Relocation Centres': 'மாற்று மையங்கள்', Communication: 'தொடர்பு', Resources: 'வளங்கள்', Map: 'வரைபடம்', 'Incident History': 'சம்பவ வரலாறு',
    'Public Platform': 'பொது தளம்', Logout: 'வெளியேறு', 'SYSTEM OPERATIONAL': 'அமைப்பு செயல்பாட்டில்', 'Control Room Administrator': 'கட்டுப்பாட்டு அறை நிர்வாகி',
    'National Disaster Management': 'தேசிய பேரிடர் மேலாண்மை', 'Secure Access Portal': 'பாதுகாப்பான அணுகல் தளம்', 'Choose your role to continue to the relevant dashboard': 'தொடர்புடைய டாஷ்போர்டுக்குச் செல்ல உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்', 'Government Official': 'அரசு அதிகாரி', 'Field Officer': 'கள அதிகாரி', 'Control Room Administrator access': 'கட்டுப்பாட்டு அறை நிர்வாகி அணுகல்', 'On-site shelter occupancy updates': 'தளத்தில் தங்குமிட ஆக்கிரமிப்பு புதுப்பிப்புகள்', 'Map legend': 'வரைபட விளக்கம்', 'Safe Areas': 'பாதுகாப்பான பகுதிகள்', 'Top Alerts': 'முக்கிய எச்சரிக்கைகள்', 'Public advisories': 'பொது அறிவுறுத்தல்கள்', 'Preparedness network': 'தயார்நிலை வலைப்பின்னல்', 'View all safe areas': 'அனைத்து பாதுகாப்பான பகுதிகளையும் காண்க', 'View all alerts': 'அனைத்து எச்சரிக்கைகளையும் காண்க', 'View hazard scenario': 'அபாய சூழ்நிலையைக் காண்க', 'Emergency shelters with illustrative available capacity.': 'எடுத்துக்காட்டு கிடைக்கும் திறன் கொண்ட அவசர தங்குமிடங்கள்.', 'Illustrative scenario data · not live emergency alerts': 'எடுத்துக்காட்டு சூழ்நிலை தரவு · நேரடி அவசர எச்சரிக்கைகள் அல்ல', 'Population at risk': 'ஆபத்தில் உள்ள மக்கள் தொகை', 'Recommended action': 'பரிந்துரைக்கப்பட்ட நடவடிக்கை', 'Safety intelligence for stronger communities': 'வலுவான சமூகங்களுக்கான பாதுகாப்பு தகவல்', 'Need support or more information?': 'ஆதரவு அல்லது கூடுதல் தகவல் தேவையா?',
  },
  ml: {
    'Select language': 'ഭാഷ തിരഞ്ഞെടുക്കുക', English: 'ഇംഗ്ലീഷ്', Telugu: 'തെലുങ്ക്', Hindi: 'ഹിന്ദി', Tamil: 'തമിഴ്', Malayalam: 'മലയാളം',
    Alerts: 'അറിയിപ്പുകൾ', 'About Us': 'ഞങ്ങളെക്കുറിച്ച്', 'Contact Us': 'ബന്ധപ്പെടുക', Login: 'ലോഗിൻ', Dashboard: 'ഡാഷ്ബോർഡ്', 'Hazard Map': 'അപകട മാപ്പ്', 'Control Room': 'കൺട്രോൾ റൂം',
    Overview: 'അവലോകനം', 'Active Hazards': 'സജീവ അപകടങ്ങൾ', 'Field Operations': 'ഫീൽഡ് പ്രവർത്തനങ്ങൾ', 'Officer Assignment': 'ഓഫീസർ നിയമനം', 'Relocation Centres': 'പുനരധിവാസ കേന്ദ്രങ്ങൾ', Communication: 'ആശയവിനിമയം', Resources: 'വിഭവങ്ങൾ', Map: 'മാപ്പ്', 'Incident History': 'സംഭവ ചരിത്രം',
    'Public Platform': 'പൊതു പ്ലാറ്റ്ഫോം', Logout: 'ലോഗ് ഔട്ട്', 'SYSTEM OPERATIONAL': 'സിസ്റ്റം പ്രവർത്തനക്ഷമം', 'Control Room Administrator': 'കൺട്രോൾ റൂം അഡ്മിനിസ്ട്രേറ്റർ',
    'National Disaster Management': 'ദേശീയ ദുരന്ത നിവാരണം', 'Secure Access Portal': 'സുരക്ഷിത പ്രവേശന പോർട്ടൽ', 'Choose your role to continue to the relevant dashboard': 'ബന്ധപ്പെട്ട ഡാഷ്ബോർഡിലേക്ക് തുടരാൻ നിങ്ങളുടെ ചുമതല തിരഞ്ഞെടുക്കുക', 'Government Official': 'സർക്കാർ ഉദ്യോഗസ്ഥൻ', 'Field Officer': 'ഫീൽഡ് ഓഫീസർ', 'Control Room Administrator access': 'കൺട്രോൾ റൂം അഡ്മിനിസ്ട്രേറ്റർ പ്രവേശനം', 'On-site shelter occupancy updates': 'സൈറ്റിലെ അഭയകേന്ദ്ര വിവരങ്ങളുടെ പുതുക്കൽ', 'Map legend': 'മാപ്പ് ലെജൻഡ്', 'Safe Areas': 'സുരക്ഷിത പ്രദേശങ്ങൾ', 'Top Alerts': 'പ്രധാന അറിയിപ്പുകൾ', 'Public advisories': 'പൊതു നിർദ്ദേശങ്ങൾ', 'Preparedness network': 'തയ്യാറെടുപ്പ് ശൃംഖല', 'View all safe areas': 'എല്ലാ സുരക്ഷിത പ്രദേശങ്ങളും കാണുക', 'View all alerts': 'എല്ലാ അറിയിപ്പുകളും കാണുക', 'View hazard scenario': 'അപകട സാഹചര്യം കാണുക', 'Emergency shelters with illustrative available capacity.': 'ഉദാഹരണ ശേഷിയുള്ള അടിയന്തര അഭയകേന്ദ്രങ്ങൾ.', 'Illustrative scenario data · not live emergency alerts': 'ഉദാഹരണ സാഹചര്യ ഡാറ്റ · തത്സമയ അടിയന്തര അറിയിപ്പുകളല്ല', 'Population at risk': 'അപകടസാധ്യതയുള്ള ജനസംഖ്യ', 'Recommended action': 'ശുപാർശ ചെയ്യുന്ന നടപടി', 'Safety intelligence for stronger communities': 'ശക്തമായ സമൂഹങ്ങൾക്കായുള്ള സുരക്ഷാ വിവരങ്ങൾ', 'Need support or more information?': 'സഹായമോ കൂടുതൽ വിവരങ്ങളോ വേണമോ?',
  },
};

const commonWordTranslations = {
  te: { 'Active': 'క్రియాశీల', 'Alerts': 'హెచ్చరికలు', 'Area': 'ప్రాంతం', 'Assignment': 'కేటాయింపు', 'Available': 'అందుబాటులో', 'Back': 'వెనుకకు', 'Capacity': 'సామర్థ్యం', 'Centre': 'కేంద్రం', 'Close': 'మూసివేయి', 'Communication': 'సమాచారం', 'Control': 'కంట్రోల్', 'Current': 'ప్రస్తుత', 'Dashboard': 'డ్యాష్‌బోర్డ్', 'Disaster': 'విపత్తు', 'Emergency': 'అత్యవసర', 'Field': 'ఫీల్డ్', 'Hazard': 'ప్రమాదం', 'History': 'చరిత్ర', 'Location': 'స్థానం', 'Logout': 'లాగ్ అవుట్', 'Map': 'మ్యాప్', 'Message': 'సందేశం', 'Officer': 'అధికారి', 'People': 'ప్రజలు', 'Population': 'జనాభా', 'Public': 'పబ్లిక్', 'Resources': 'వనరులు', 'Risk': 'ప్రమాదం', 'Safe': 'సురక్షిత', 'Status': 'స్థితి', 'Total': 'మొత్తం', 'View': 'చూడండి', 'Warning': 'హెచ్చరిక' },
  hi: { 'Active': 'सक्रिय', 'Alerts': 'अलर्ट', 'Area': 'क्षेत्र', 'Assignment': 'नियुक्ति', 'Available': 'उपलब्ध', 'Back': 'वापस', 'Capacity': 'क्षमता', 'Centre': 'केंद्र', 'Close': 'बंद करें', 'Communication': 'संचार', 'Control': 'कंट्रोल', 'Current': 'वर्तमान', 'Dashboard': 'डैशबोर्ड', 'Disaster': 'आपदा', 'Emergency': 'आपातकालीन', 'Field': 'फील्ड', 'Hazard': 'खतरा', 'History': 'इतिहास', 'Location': 'स्थान', 'Logout': 'लॉग आउट', 'Map': 'मानचित्र', 'Message': 'संदेश', 'Officer': 'अधिकारी', 'People': 'लोग', 'Population': 'जनसंख्या', 'Public': 'सार्वजनिक', 'Resources': 'संसाधन', 'Risk': 'जोखिम', 'Safe': 'सुरक्षित', 'Status': 'स्थिति', 'Total': 'कुल', 'View': 'देखें', 'Warning': 'चेतावनी' },
  ta: { 'Active': 'செயலில்', 'Alerts': 'எச்சரிக்கைகள்', 'Area': 'பகுதி', 'Assignment': 'நியமனம்', 'Available': 'கிடைக்கும்', 'Back': 'பின்செல்', 'Capacity': 'திறன்', 'Centre': 'மையம்', 'Close': 'மூடு', 'Communication': 'தொடர்பு', 'Control': 'கட்டுப்பாடு', 'Current': 'தற்போதைய', 'Dashboard': 'டாஷ்போர்டு', 'Disaster': 'பேரழிவு', 'Emergency': 'அவசர', 'Field': 'கள', 'Hazard': 'அபாயம்', 'History': 'வரலாறு', 'Location': 'இடம்', 'Logout': 'வெளியேறு', 'Map': 'வரைபடம்', 'Message': 'செய்தி', 'Officer': 'அதிகாரி', 'People': 'மக்கள்', 'Population': 'மக்கள் தொகை', 'Public': 'பொது', 'Resources': 'வளங்கள்', 'Risk': 'ஆபத்து', 'Safe': 'பாதுகாப்பான', 'Status': 'நிலை', 'Total': 'மொத்தம்', 'View': 'காண்க', 'Warning': 'எச்சரிக்கை' },
  ml: { 'Active': 'സജീവ', 'Alerts': 'അറിയിപ്പുകൾ', 'Area': 'പ്രദേശം', 'Assignment': 'നിയമനം', 'Available': 'ലഭ്യം', 'Back': 'പിന്നോട്ട്', 'Capacity': 'ശേഷി', 'Centre': 'കേന്ദ്രം', 'Close': 'അടയ്ക്കുക', 'Communication': 'ആശയവിനിമയം', 'Control': 'നിയന്ത്രണം', 'Current': 'നിലവിലെ', 'Dashboard': 'ഡാഷ്ബോർഡ്', 'Disaster': 'ദുരന്തം', 'Emergency': 'അടിയന്തര', 'Field': 'ഫീൽഡ്', 'Hazard': 'അപകടം', 'History': 'ചരിത്രം', 'Location': 'സ്ഥലം', 'Logout': 'ലോഗ് ഔട്ട്', 'Map': 'മാപ്പ്', 'Message': 'സന്ദേശം', 'Officer': 'ഓഫീസർ', 'People': 'ആളുകൾ', 'Population': 'ജനസംഖ്യ', 'Public': 'പൊതു', 'Resources': 'വിഭവങ്ങൾ', 'Risk': 'അപകടസാധ്യത', 'Safe': 'സുരക്ഷിത', 'Status': 'നില', 'Total': 'ആകെ', 'View': 'കാണുക', 'Warning': 'മുന്നറിയിപ്പ്' },
};

function translateText(text, language) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const sourceText = Object.values(translations).reduce((source, languageMap) => {
    const match = Object.entries(languageMap).find(([, translated]) => translated === trimmed);
    return match?.[0] ?? source;
  }, trimmed);
  if (language === 'en') return text.replace(trimmed, sourceText);
  const exact = translations[language]?.[sourceText] ?? translations[language]?.[trimmed];
  if (exact) return text.replace(trimmed, exact);
  const words = commonWordTranslations[language] ?? {};
  const translated = sourceText.split(/(\s+)/).map((part) => {
    const punctuation = part.match(/^[^A-Za-z]+|[^A-Za-z]+$/g)?.join('') ?? '';
    const word = part.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '');
    const titleCaseWord = word ? `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}` : '';
    const translatedWord = words[word] ?? words[titleCaseWord];
    return translatedWord ? `${part.startsWith(punctuation) ? punctuation : ''}${translatedWord}${part.endsWith(punctuation) ? punctuation : ''}` : part;
  }).join('');
  return text.replace(trimmed, translated);
}

const LanguageContext = createContext(null);
const originalTextByNode = new WeakMap();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((item) => item.code === saved) ? saved : 'en';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;

    const translatePage = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node = walker.nextNode();
      while (node) {
        if (!node.parentElement.closest('script, style, textarea, select')) nodes.push(node);
        node = walker.nextNode();
      }
      nodes.forEach((textNode) => {
        const source = originalTextByNode.get(textNode) ?? textNode.textContent;
        originalTextByNode.set(textNode, source);
        const translated = translateText(source, language);
        if (textNode.textContent !== translated) textNode.textContent = translated;
      });
    };

    translatePage();
    const observer = new MutationObserver(translatePage);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    languages: LANGUAGES,
    t: (text) => translations[language]?.[text] ?? text,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
