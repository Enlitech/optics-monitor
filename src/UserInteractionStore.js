import { makeAutoObservable, action } from 'mobx';
import dataStore from './DataStore';

class UserInteractionStore {
  selectedPoint = null;
  selectedPos = null; 
  selectedTime = null;
  selectedEnergy = null;
  isWaveUIVisible = false;
  isPreparingUpdate = false; // 添加新的状态，用于表示是否在准备更新

  constructor() {
    makeAutoObservable(this, { 
      setSelectedPoint: action.bound,
      setSelectedTime: action.bound,
      setSelectedPos: action.bound,
      setSelectedEnergy: action.bound,
      toggleWaveUIVisibility: action.bound,
      setPreparingUpdate: action.bound, // 绑定新添加的准备状态方法
      closeWaveUI: action.bound
    });
  }

  setSelectedPoint(point) {
    this.selectedPoint = point;
    if (point && dataStore.geoPoints) {
      const pos = dataStore.geoPoints[point]; 
      if (pos) {
        this.selectedPos = pos.dist; 
      }
    }
  }

  setSelectedPos(pos) {
    this.selectedPos = pos;  // Store the geoPointsTime
  }

  setSelectedEnergy(selectedEnergy) {
    this.selectedEnergy = selectedEnergy;  // Store the geoPointsTime
  }

  setSelectedTime(time) {
    this.selectedTime = time;  // Store the geoPointsTime
  }

  toggleWaveUIVisibility(visible = true) {
    this.isWaveUIVisible = visible;
  }

  closeWaveUI() {
    this.isWaveUIVisible = false; // Explicit method to close WaveUI
  }

  // 新添加的方法用于设置准备更新的状态
  setPreparingUpdate(isPreparing) {
    this.isPreparingUpdate = isPreparing;
  }
}

const userInteractionStore = new UserInteractionStore();
export default userInteractionStore;
