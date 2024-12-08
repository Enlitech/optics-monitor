import { makeAutoObservable} from 'mobx';
import * as globals from "./globals"

class AppConfigurationStore {
  appConfigurationData = null;
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);

    this.appConfigurationData = {
        "refreshRate": 1000,
        "baseUrl": globals.BASE_URL,
        "componentsAutoUpdating" : {},
    }
  }

  checkAutoUpdating() {
    return Object.values(this.appConfigurationData.componentsAutoUpdating).some(value => value === true)
  }

  setAutoUpdating(key, val) {
    this.appConfigurationData.componentsAutoUpdating[key] = val;
  }
}

const appConfigurationStore = new AppConfigurationStore();

export default appConfigurationStore;