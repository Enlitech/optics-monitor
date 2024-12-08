// DataStore.js
import { makeAutoObservable, action } from 'mobx';
import appConfigurationStore from './AppConfigurationStore';
import { softmax,Bd,dB } from './Utils';
import * as globals from "./globals"

class DataStore {
  geoPoints = [];
  geoPointsTime = null;
  eventAlerts = [];
  eventAlertEnergyThreshold = 15; // Default value
  eventAlertStaySeconds = 10; // Default value
  energyMatObjectDetections = [];
  playBackInfo = {};
  autoUpdating = false; 
  updatingSettings = false; 

  fetchDataPromise = null;

  constructor() {
    makeAutoObservable(this, { fetchData: action.bound, setEventAlertEnergyThreshold: action.bound, fetchPlaybackInfo: action.bound, setDataUpdating:action.bound, setUpdatingSettings:action.bound, fetchEnergyMatObjectDetection:action.bound, fetchUpdatePreparationData:action.bound});
    this.fetchDataPromise = this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await fetch(`${appConfigurationStore.appConfigurationData["baseUrl"]}energy?profile=simple_json`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      this.geoPointsTime = data["time"];
      this.geoPoints = data["coordinate_energy"];

      if (globals.OPTICS_MONITOR_PLAYBACK) {
        this.fetchPlaybackInfo();
      }

      this.fetchEnergyMatObjectDetection();

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  fetchEnergyMatObjectDetection = async () => {
      try {
        const response = await fetch(`${appConfigurationStore.appConfigurationData["baseUrl"]}alert?kind=energy_mat_object_detections`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const detections = data["detections"]; 
        // Add newAlerts to the beginning of eventAlerts
        this.energyMatObjectDetections = [...detections];
      } catch (error) {
        console.error('Error fetching data:', error);
      }
  }

  fetchEventAlerts = async () => {
    try {
      const response = await fetch(`${appConfigurationStore.appConfigurationData["baseUrl"]}recog?kind=pipeline_risky_above_energy_threshold&threshold=${Bd(this.eventAlertEnergyThreshold)}&ret_wave_complexity=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const newAlerts = data["classifications"];
      for (let i = 0; i < newAlerts.length; i++) {
        const prob = softmax(newAlerts[i]["cls"])[0] * 100;
        newAlerts[i]["riskProb"] = prob;

        if (prob < 2)
          newAlerts[i]["riskLevel"] = "I";
        else if (prob < 25)
          newAlerts[i]["riskLevel"] = "II";
        else if (prob < 50)
          newAlerts[i]["riskLevel"] = "III";
        else
          newAlerts[i]["riskLevel"] = "IV";
        newAlerts[i]["time"] = data["time"];
      }
      
      // Add newAlerts to the beginning of eventAlerts
      this.eventAlerts = [...newAlerts, ...this.eventAlerts];

      const currentUnixTime = Math.floor(Date.now() / 1000); // Current Unix epoch time in seconds
      // Remove old alerts that have exceeded eventAlertStaySeconds
      this.eventAlerts = this.eventAlerts.filter(alert => {
        const alertTime = alert.time; // Assuming this is in Unix epoch time (seconds)
        const eg = dB(alert.energy);
        return (currentUnixTime - alertTime) <= this.eventAlertStaySeconds && eg >= this.eventAlertEnergyThreshold;
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  fetchPlaybackInfo = async () => {
    try {
      const response = await fetch(`${appConfigurationStore.appConfigurationData["baseUrl"]}info?kind=freader_file_name_time`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      this.playBackInfo = data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  fetchUpdatePreparationData = async () => {
    try {
      const response = await fetch(`${appConfigurationStore.appConfigurationData["baseUrl"]}alert?ret_energy_mat=true&ret_energy_mat_time=true`);
      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  setEventAlertEnergyThreshold(value) {
    this.eventAlertEnergyThreshold = value;
    this.fetchEventAlerts(); // Fetch event alerts with the updated threshold
  }

  setEventAlertStaySeconds(value) {
    this.eventAlertStaySeconds = value;
    this.fetchEventAlerts(); 
  }

  setDataUpdating(value) {
    this.autoUpdating = value; 
  }

  setUpdatingSettings(value) {
    this.updatingSettings = value; 
  }
}

const dataStore = new DataStore();
export default dataStore;
