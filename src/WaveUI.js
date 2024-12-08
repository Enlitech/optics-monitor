import React, { useState, useRef, useEffect } from 'react';
import Wave from "./Wave";
import FFT from './FFT';
import settingsStore from "./SettingsStore";
import appConfigurationStore from "./AppConfigurationStore";
import { useTranslation } from 'react-i18next';
import userInteractionStore from './UserInteractionStore';
import { observer } from 'mobx-react';
import './WaveUI.css'; // Import the CSS file for styling
import {dB, formatTimeToLocal} from "./Utils"

const WaveUI = observer(({colorScale = null}) => {
  const { t } = useTranslation();
  const [wave, setWave] = useState([]);
  const [waveFFT, setWaveFFT] = useState([]);
  const [waveEnergy, setWaveEnergy] = useState(0.0);
  const [waveComplexity, setWaveComplexity] = useState(0.0);
  const [waveComplexityAbsolute, setWaveComplexityAbsolute] = useState(0.0);
  const [localPos, setLocalPos] = useState(userInteractionStore.selectedPoint && userInteractionStore.selectedPoint[0] || '');
  const [loading, setLoading] = useState(false);
  const posInput = useRef(null);
  const { appConfigurationData } = appConfigurationStore;
  const ret_info = "-NONE-";
  const ret_wave_complexity = "true"; 

  useEffect(() => {
    setLocalPos(userInteractionStore.selectedPos);
  }, [userInteractionStore.selectedPos]);

  const handlePositionChange = (e) => {
    setLocalPos(e.target.value);
  };

  const handleFetchWave = async () => {
    setLoading(true);
    userInteractionStore.setSelectedPos(localPos);
    await UpdateWave();
    setLoading(false);
  };

  const handleFetchHistoryWave = async () => {
    setLoading(true);
    userInteractionStore.setSelectedPos(localPos);
    await UpdateWave(userInteractionStore.selectedTime);
    setLoading(false);
  };

  async function playWave() {
    const pwm_freq = settingsStore.settings["OpticalOS"]["pwm_freq"] || 2000;

    if (wave.length === 0) {
      console.warn('No wave data available to play.');
      return;
    }

    const maxVal = Math.max(...wave.map(Math.abs));
    const normalizedWave = wave.map(value => value / maxVal);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, normalizedWave.length, pwm_freq);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < normalizedWave.length; i++) {
      channelData[i] = normalizedWave[i];
    }
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
  }

  async function UpdateWave(time = null) {
    try {
      const { settings } = settingsStore;
      const opticalOSSettings = settings["OpticalOS"];
      const resolution = (100.0 / opticalOSSettings["sample_freq_mhz"]);
      const filter_start = opticalOSSettings["filter_start"] || opticalOSSettings["channel_start"];
      const filter_space_interval = opticalOSSettings["filter_space_interval"] || opticalOSSettings["channel_space_interval"];
      const pos = parseFloat(localPos);
      const filter_start_pos = filter_start * resolution;
      const ipos = Math.floor((pos - filter_start_pos) / resolution / filter_space_interval) * Math.round(filter_space_interval) + filter_start;
      let url = appConfigurationData.baseUrl + `wave?pos=${ipos}&ret_fft=amp&ret_info=${ret_info}&ret_wave_complexity=${ret_wave_complexity}` + (time != null ? `&time=${time}`: "");
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch wave data: ${response.statusText}`);
      }
      const data = await response.json();
      setWave(data['wave']);
      setWaveFFT(data['fft_amp']);
      setWaveEnergy(dB(time == null ?  data['energy'] : userInteractionStore.selectedEnergy));
      if (ret_wave_complexity == "true") { 
        setWaveComplexity(data['wave_complexity']);
        setWaveComplexityAbsolute(data['wave_complexity_absolute']);
      }
    } catch (error) {
      console.error('Error fetching wave data:', error.message);
    }
  }

  return (
    <div className="waveui-container">
      <h3 className="waveui-title">{t('demodulatedWaveform')}</h3>
      <div className="waveui-controls">
        <div className="waveui-input-group">
          <label className="waveui-label">{t('position')}:</label>
          <input 
            type="number" 
            value={localPos}
            onChange={handlePositionChange}
            ref={posInput}
            className="waveui-input"
            disabled={loading}
          />
          <label className="waveui-unit">{t('m')}</label>
        </div>
        <div className="waveui-energy">
          <label className="waveui-energy-label">{t('energy')}:</label>
          <label className="waveui-energy-value" 
          style={{ color: colorScale ? colorScale(waveEnergy) : 'inherit' }}>{waveEnergy.toFixed(2)}</label><label> dB</label>
        </div>
        <div className="waveui-energy">
          <label className="waveui-energy-label">{t('waveComplexity')}:</label>
          <label className="waveui-energy-value">{waveComplexity && waveComplexity.toFixed(2)} ({waveComplexityAbsolute && waveComplexityAbsolute.toFixed(2)})</label>
        </div>
        <div className="waveui-buttons">
          <button 
            onClick={handleFetchWave}
            disabled={loading}
            className={`waveui-button ${loading ? 'loading' : ''}`}
          >
            {loading ? t('gettingData') : t('currentWaveForm')}
          </button>
          {userInteractionStore.selectedTime && <button 
            onClick={handleFetchHistoryWave}
            disabled={loading}
            className={`waveui-button ${loading ? 'loading' : ''}`}
          >
            {loading ? t('gettingData') : formatTimeToLocal(userInteractionStore.selectedTime, "hms") + " " + t('waveForm')}
          </button>
          }
          <button onClick={playWave} className="waveui-button">
            {t('playWave')}
          </button>
        </div>
      </div>
      <div className="waveui-graphs">
        <Wave 
          series={wave} 
          yText={t('waveformAmplitude')} 
          xUnit="s" 
          pointInterval={settingsStore.settings && 1.0 / settingsStore.settings["OpticalOS"]["pwm_freq"]} 
        />
        <FFT 
          amp={waveFFT} 
          yText={t('waveformFFT')} 
          xUnit="Hz" 
          pointInterval={settingsStore.settings && 1.0 / settingsStore.settings["OpticalOS"]["duration"]} 
        />
      </div>
    </div>
  );
});

export default WaveUI;