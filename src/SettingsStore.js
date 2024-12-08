import { makeAutoObservable, action, runInAction } from 'mobx';
import appConfigurationStore from './AppConfigurationStore';

class SettingsStore {
  settings = null;
  loading = false;
  error = null;

  // Reference to AppConfigurationStore
  appConfigurationStore = appConfigurationStore;

  constructor() {
    makeAutoObservable(this, {
      fetchData: action.bound,
    });
  }

  setSettings(newSettings) {
    this.settings = newSettings;
  }

  updateSettings() {
    const url = this.appConfigurationStore.appConfigurationData.baseUrl + 'settings?action=restart&update_settings=true';
    const promise = fetch(url, { method: 'POST', body: JSON.stringify(this.settings) });
    return promise;
  }

  fetchData() {
    this.loading = true;
    this.error = null;

    // Access data from AppConfigurationStore
    const baseUrl = this.appConfigurationStore.appConfigurationData.baseUrl;

    fetch(baseUrl + 'settings')
      .then((response) => response.json())
      .then((data) => {
        runInAction(() => {
          this.settings = data;
          this.loading = false;
        });
      })
      .catch((error) => {
        runInAction(() => {
          this.error = error;
          this.loading = false;
        });
      });
  }
}

const settingsStore = new SettingsStore();

export default settingsStore;
