import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Boost from 'highcharts/modules/boost';
import appConfigurationStore from "./AppConfigurationStore";
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

function FFT({ amp, pointInterval, yText, xUnit }) {
  Boost(Highcharts);
  const { appConfigurationData } = appConfigurationStore;
  const { t } = useTranslation(); // Use useTranslation hook to access translations

  const options = {
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    chart: { width: 950, height: (3.6 / 16 * 100) + '%', animation: false, zooming: { type: "x" } },
    time: { useUTC: false },
    exporting: { enabled: false },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: (<b>{point.x:.2f}</b>, <b>{point.y:.2f}</b>)<br/>',
      shared: true
    },
    xAxis: {
      title: { text: xUnit ? `${t('frequency')} (${xUnit})` : t('frequency') },
    },
    yAxis: {
      title: { text: yText || t('fft') },
      animation: false,
      type: appConfigurationData.fft_logscale ? 'logarithmic' : "linear",
    },
    plotOptions: {
      series: {
        animation: false,
        boostThreshold: 2500, // 如果太小的时候 Boost 还不如不Boost,
        color: "orange"
      }
    },
    series: [{
      data: amp,
      name: t('fftAmplitude'),
      type: 'line',
      animation: false,
      pointInterval: pointInterval ? pointInterval : 1,
      marker: { enabled: false }
    }]
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
    />
  );
}

export default observer(FFT);