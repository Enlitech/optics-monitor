import { observer } from 'mobx-react';
import React from 'react';
import dataStore from './DataStore';

const SomeComponent = () => {
  return (
    <div>
      {dataStore.geoPoints.map((point, index) => (
        <div key={index}>
          <p>{point.energy}</p>
        </div>
      ))}
    </div>
  );
};

export default observer(SomeComponent);