import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    welcome: 'Welcome back',
    trustScore: 'Trust Score',
    identityVerified: 'Identity Verified',
    overview: 'Overview',
    claimsHistory: 'Claims History',
    simulateTool: 'Simulate Tool',
    weather: 'Weather',
    airQuality: 'Air Quality',
    forecast: 'Next Week Forecast',
    activePolicies: 'Active Policies',
    weeklyPremium: 'Weekly Premium',
    totalCoverage: 'Total Coverage',
    claimsFiled: 'Claims Filed',
    logout: 'Logout',
    noActiveTriggers: 'No active disruptions',
    sosButton: 'SOS Emergency',
    voiceClaim: 'Voice Claim',
    damageScan: 'Damage Scan',
    language: 'Language',
    totalWorkers: 'Total Workers',
    activePoliciesLabel: 'Active Policies',
    totalClaims: 'Total Claims',
    pendingReview: 'Pending Review',
    exportReport: 'Export Report',
    refresh: 'Refresh',
  },
  hi: {
    welcome: 'वापसी पर स्वागत है',
    trustScore: 'विश्वास स्कोर',
    identityVerified: 'पहचान सत्यापित',
    overview: 'अवलोकन',
    claimsHistory: 'दावा इतिहास',
    simulateTool: 'सिमुलेट टूल',
    weather: 'मौसम',
    airQuality: 'वायु गुणवत्ता',
    forecast: 'अगले सप्ताह का पूर्वानुमान',
    activePolicies: 'सक्रिय पॉलिसी',
    weeklyPremium: 'साप्ताहिक प्रीमियम',
    totalCoverage: 'कुल कवरेज',
    claimsFiled: 'दावे दर्ज',
    logout: 'लॉग आउट',
    noActiveTriggers: 'कोई सक्रिय व्यवधान नहीं',
    sosButton: 'SOS आपातकाल',
    voiceClaim: 'वॉइस दावा',
    damageScan: 'डैमेज स्कैन',
    language: 'भाषा',
    totalWorkers: 'कुल कर्मचारी',
    activePoliciesLabel: 'सक्रिय पॉलिसी',
    totalClaims: 'कुल दावे',
    pendingReview: 'समीक्षाधीन',
    exportReport: 'रिपोर्ट निर्यात',
    refresh: 'रीफ्रेश',
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      className="glass-panel px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all shadow-sm border border-white/5 text-sm font-bold group"
      title="Toggle Language"
    >
      <span className={`transition-all duration-300 ${lang === 'en' ? 'text-brand-400' : 'text-orange-400'}`}>
        {lang === 'en' ? 'हिं' : 'EN'}
      </span>
    </button>
  );
}
