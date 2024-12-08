import React, { useState, useEffect } from 'react';
import appConfigurationStore from './AppConfigurationStore';
import settingsStore from './SettingsStore';
import dataStore from './DataStore';
import userInteractionStore from './UserInteractionStore';
import { useTranslation } from 'react-i18next';
import i18n from './i18n'; // Import i18n configuration

export default function ControlUI() {
  const { t } = useTranslation();  
  const [isAutoUpdate, setIsAutoUpdate] = useState(false);
  const [language, setLanguage] = useState(i18n.language || 'zh'); // Default to 'zh'
  const { appConfigurationData } = appConfigurationStore;
  
  settingsStore.fetchData();

  useEffect(() => {
    let intervalId;
    
    if (isAutoUpdate) {
      intervalId = setInterval(() => {
        dataStore.fetchData();
        dataStore.fetchEventAlerts();
      }, appConfigurationData.refreshRate)
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isAutoUpdate, appConfigurationData.refreshRate]);

  const toggleAutoUpdate = () => {
    dataStore.setDataUpdating(!isAutoUpdate);
    setIsAutoUpdate(!isAutoUpdate);
  };

  const openWaveUI = () => {
    if (!userInteractionStore.isWaveUIVisible) {
      userInteractionStore.toggleWaveUIVisibility(true); // Ensure it only opens, not toggles
    }
  };

  // Toggle between Chinese ('zh') and English ('en')
  const toggleLanguage = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh'; // Switch between Chinese and English
    i18n.changeLanguage(newLanguage); // Change the language in i18n
    setLanguage(newLanguage); // Update the local language state
  };

  return (
    <>
      <button id={isAutoUpdate ? 'stopAutoUpdateButton' : 'startAutoUpdateButton'} onClick={toggleAutoUpdate}>
        {t(isAutoUpdate ? 'stopAutoUpdate' : 'startAutoUpdate')}
      </button>
      <button id="openWaveUIButton" onClick={openWaveUI} style={{ marginLeft: '10px' }}>
        {t('showWaveUI')}
      </button>
      <button id="toggleLanguageButton" onClick={toggleLanguage} style={{ marginLeft: '10px' }}>
        {language === 'zh' ? 'English/英语' : '中文/Chinese'} {/* Display based on the current language */}
      </button>
    </>
  );
}