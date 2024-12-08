import './App.css';
import MapUI from './MapUI';
import EnergyWaterfallUI from './EnergyWaterfallUI';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';
import ControlUI from './ControlUI';
import EventAlertUI from './EventAlertUI';
import PlaybackUI from './PlaybackUI';
import WaveUI from './WaveUI';
import userInteractionStore from './UserInteractionStore';
import { observer } from 'mobx-react-lite';
import * as globals from "./globals";

const App = observer(() => {
  const { t } = useTranslation();

   const colors = ["White", "Orange", "Crimson"];

   const colorScale = d3.scaleSequential()
    .domain([globals.ENERGY_COLORSCALE_DOMAIN_MIN, globals.ENERGY_COLORSCALE_DOMAIN_MAX])
    .interpolator(d3.interpolateRgbBasis(colors));

  const closeWaveUI = () => {
    userInteractionStore.isWaveUIVisible = false; // Close WaveUI
  };

  const handleOverlayClick = (event) => {
    const waveUIContainer = document.querySelector('.waveui-container-centered');
    if (waveUIContainer && !waveUIContainer.contains(event.target)) {
      closeWaveUI(); // Close WaveUI if clicked outside of it
    }
  };

  return (
    <>
      {userInteractionStore.isWaveUIVisible && (
        <>
          <div className="overlay" onClick={handleOverlayClick}></div>
          <div className="waveui-container-centered">
            <div className="waveui-box">
              <button className="waveui-close-button" onClick={closeWaveUI}>X</button>
              <WaveUI colorScale={colorScale}/>
            </div>
          </div>
        </>
      )}
      <h2>{globals.OPTICS_MONITOR_PLAYBACK ? "OpticsMonitor " + t('playback') : "OpticsMonitor"}</h2>
      <div className='control'>
        <ControlUI />
      </div>
      {globals.OPTICS_MONITOR_PLAYBACK &&
      <div className='container'>
         <div className='sub-container'>
          <h3>{t("playbackContainer")}</h3>
          <PlaybackUI />
          </div>
      </div>
      }
      <div className='container'>
        <div className='sub-container'>
          <h3>{t("mapContainer")}</h3>
          <div className='mapContainer'>
            <MapUI width={600} height={650} colorScale={colorScale} />
          </div>
        </div>
        <div className='sub-container'>
          <EnergyWaterfallUI width={680} height={360} numRows={360} colorScale={colorScale} />
          <EventAlertUI />
        </div>
      </div>
    </>
  );
});

export default App;
