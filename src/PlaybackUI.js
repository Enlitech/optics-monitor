import React, { useState, useEffect } from 'react';
import appConfigurationStore from './AppConfigurationStore';
import dataStore from './DataStore';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { formatTimeToLocal, convertToTimeT, isValidTime} from './Utils';
import './PlaybackUI.css';

function formatFileName(path) {
  if(path) {
    // 使用正则表达式来匹配文件名部分
    const fileName = path.match(/[^\/]+$/)[0];
    return fileName;
  } else {
    return ""
  }
}

function PlaybackUI() {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState('');
  const [stopTime, setStopTime] = useState('');

  useEffect(() => {
    if (dataStore.playBackInfo['file_time']) {
      setStartTime(formatTimeToLocal(dataStore.playBackInfo['start_time']));
      setStopTime(formatTimeToLocal(dataStore.playBackInfo['stop_time']));
    }
  }, [dataStore.playBackInfo['file_time'], dataStore.playBackInfo['start_time'], dataStore.playBackInfo['stop_time']]);

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
  };

  const handleStopTimeChange = (event) => {
    setStopTime(event.target.value);
  };

  const handleSaveSettings = async () => {
    if (!isValidTime(startTime) || !isValidTime(stopTime)) {
      alert(t("Invalid time format. Please use 'YYYY-MM-DD HH:MM:SS'"));
      return;
    }
  
    const startTimeT = convertToTimeT(startTime);
    const stopTimeT = convertToTimeT(stopTime);

    if (startTimeT >= stopTimeT) {
      alert(`${t('error')}: ${t('start time larger than stop time')}`)
      return; 
    }
  
    const payload = {
      start_time: startTimeT,
      end_time: stopTimeT
    };
  
    const url = `${appConfigurationStore.appConfigurationData["baseUrl"]}settings?kind=playback`;
  
    dataStore.setUpdatingSettings(true); 
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      if (response.ok) {
        await dataStore.fetchPlaybackInfo();
        alert(`${t('success')}`);
        dataStore.setUpdatingSettings(false); 
      } else if (response.status === 404) {
        const errorData = await response.json();
        const minTime = formatTimeToLocal(errorData.min_time);
        const maxTime = formatTimeToLocal(errorData.max_time);
        alert(`${t('error')}: ${t(errorData.error)}\n${t('minTime')}: ${minTime}\n${t('maxTime')}: ${maxTime}`);
        dataStore.setUpdatingSettings(false); 
      } else {
        const errorData = await response.json();
        alert(`${t('error')}: ${t(errorData.error)}`);
        dataStore.setUpdatingSettings(false); 
      }
    } catch (error) {
      console.error(t('Error saving settings'), error);
      alert(t('Error saving settings. Please try again.'));
      dataStore.setUpdatingSettings(false); 
    }
  };
  

  const localTime = formatTimeToLocal(dataStore.playBackInfo['file_time']);

  const fileName = formatFileName(dataStore.playBackInfo['file_name']);

  return (
    dataStore.playBackInfo['file_time'] && 
    <div className="playback-container">
      <div className="playback-item">
        <label className="playback-label">{t('playBackFile')}:</label> 
        <label className="playback-file">{fileName}</label>
      </div>
      <div className="playback-item">
        <label className="playback-label">{t('playBackTime')}:</label> 
        <label className="playback-time">{localTime}</label>
      </div>
      <div className="playback-item">
        <label className="playback-label">{t('startTime')}:</label> 
        <input
          type="text"
          className="otherinfo-time"
          value={startTime}
          onChange={handleStartTimeChange}
          disabled={dataStore.autoUpdating || dataStore.updatingSettings}
        />
      </div>
      <div className="playback-item">
        <label className="playback-label">{t('stopTime')}:</label> 
        <input
          type="text"
          className="otherinfo-time"
          value={stopTime}
          onChange={handleStopTimeChange}
          disabled={dataStore.autoUpdating || dataStore.updatingSettings}
        />
      </div>
      <button className="save-button" onClick={handleSaveSettings} disabled={dataStore.autoUpdating || dataStore.updatingSettings}>{ dataStore.updatingSettings ? t('savingSettings') + "...": t('saveSettings')}</button>
    </div>
  );
}

export default observer(PlaybackUI);
