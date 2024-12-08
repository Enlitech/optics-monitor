import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.chinatmsproviders'; // Import Tianditu support
import 'leaflet.gridlayer.googlemutant'; // Import Google Mutant plugin
import { dB, decimalToDMS, formatTimeToLocal } from './Utils';
import dataStore from './DataStore';
import { observer } from 'mobx-react';
import userInteractionStore from './UserInteractionStore';
import { withTranslation } from 'react-i18next';
import * as globals from "./globals"

class MapUI extends Component {
  constructor(props) {
    super(props);

    this.mapContainerRef = React.createRef();
    this.circleMarkers = {};
    this.infoMarker = null;
    this.initialized = false; 
  }

  componentDidMount() {
    dataStore.fetchDataPromise.then(() => {
      this.initialize();
    });
  }

  componentDidUpdate() {
    this.update();
  }

  initialize = () => {
    if (this.initialized) return; 


    if (globals.MAP_TYPE == "tongling") {
      const MapKey = globals.MAP_KEYS[globals.MAP_TYPE];
      // Create map instance
      this.mapContainerRef.current = L.map("mapContainer", {
        center: globals.MAP_CENTERS[globals.MAP_TYPE],
        zoom: 15
      });
    
      // Add a tile layer
      L.tileLayer.chinaProvider('TianDiTu.Satellite.Map', { key: MapKey }).addTo(this.mapContainerRef.current);
      L.tileLayer.chinaProvider('TianDiTu.Satellite.Annotion', { key: MapKey }).addTo(this.mapContainerRef.current);
    } else if (globals.MAP_TYPE == "belgium_tpi") {
      // 使用 OpenStreetMap TileLayer
      this.mapContainerRef.current = L.map("mapContainer", {
        center: globals.MAP_CENTERS[globals.MAP_TYPE], 
        zoom: 18 // 设置缩放级别
      });

      // 添加 OpenStreetMap TileLayer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.mapContainerRef.current);
    } else if (globals.MAP_TYPE == "belgium_tpi_satellite") {
      const MapKey = globals.MAP_KEYS[globals.MAP_TYPE];
      this.mapContainerRef.current = L.map("mapContainer", {
        center: globals.MAP_CENTERS[globals.MAP_TYPE],
        zoom: 18
      });

      L.gridLayer.googleMutant({
        type: 'hybrid', // Satellite layer from Google Maps
        key: MapKey,
      }).addTo(this.mapContainerRef.current);
    }

    this.myIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconSize: [25, 41],
    });

    // Initialize circles and add click event listeners
    dataStore.geoPoints.forEach((point, index) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        color: 'black',
        fillColor: 'blue',
        fillOpacity: 0.8,
        weight: 0,
        radius: 5
      }).addTo(this.mapContainerRef.current);

      marker.on('click', () => this.handleMarkerClick(index));
      this.circleMarkers[index] = marker;  // Store marker with its index
    });

    this.initialized = true; 
  };

  update = () => {
      if (!this.initialized) return;

      const { t } = this.props; // Access t from props

      // Update styles for existing circle markers
      dataStore.geoPoints.forEach((point, index) => {
          const marker = this.circleMarkers[index];
          if (marker) {
              const color = this.props.colorScale(dB(point.energy));
              marker.setStyle({ color: color, fillColor: color });
          }
      });

      const getContent = (dist, lng, lat, energy, time, energyAtTime) => {
        const energyColor = this.props.colorScale(dB(energy)); // Get the color for the energy
        const energyAtTimeColor = this.props.colorScale(dB(energyAtTime)); // Get the color for the energy

        let res = `
        <p>${t("dist")}: ${dist.toFixed(2)}${t('m')}</p>
        <p>${t("lng")}: ${decimalToDMS(lng)}</p>
        <p>${t("lat")}: ${decimalToDMS(lat)}</p>
        <p>${t("energy")}: <span style="color: ${energyColor};font-weight:bold">${dB(energy).toFixed(3)}</span> dB</p>`; 

        if (time) 
          res += `
        <p>${t("energy")} @ ${formatTimeToLocal(time, "hms")} :<span style="color: ${energyAtTimeColor};font-weight:bold">  ${dB(energyAtTime).toFixed(3)}</span> dB</p>`
        return res;
      }

      if (this.infoMarker){
          // Update existing marker's popup content
          const index = this.infoMarker.options.index; 
          const point = dataStore.geoPoints[index];
          const time = this.infoMarker.options.time; 
          const energyAtTime = this.infoMarker.options.energyAtTime; 
          this.infoMarker.setPopupContent(getContent(point.dist, point.lng, point.lat, point.energy, time, energyAtTime));
      }

      // Handle newly selected point
      const selectedPoint = userInteractionStore.selectedPoint;
      if (selectedPoint !== null) {

          // Create or update info marker
          if (this.infoMarker) {
              this.infoMarker.remove();
              this.infoMarker = null;   // Clear reference
          }
          const point = dataStore.geoPoints[selectedPoint];
          if (!point) return;

          const time = userInteractionStore.selectedTime; 
          const energyAtTime = userInteractionStore.selectedEnergy; 

          this.infoMarker = L.marker([point.lat, point.lng], 
            { icon: this.myIcon, index: selectedPoint, time: time, energyAtTime: energyAtTime}
          )
              .addTo(this.mapContainerRef.current)
              .bindPopup(getContent(point.dist, point.lng, point.lat, point.energy, time, energyAtTime))
              .openPopup();

          // Add event listener to remove marker on popup close
          this.infoMarker.on('popupclose', () => {
            if (this.infoMarker) {
              this.infoMarker.remove();
              this.infoMarker = null; // Clear reference
            }
          });

          userInteractionStore.setSelectedPoint(null);
      }
  };

  handleMarkerClick = (index) => {
    userInteractionStore.setSelectedPoint(index);
  };

  render() {
    return (
      <>
        <div className='invisible'>{dataStore.geoPoints.length} {userInteractionStore.selectedPoint}</div>
        <div id="mapContainer" style={{ height: this.props.height || 600, width: this.props.width || 600 }} />
      </>
    );
  }
}

export default withTranslation()(observer(MapUI));
