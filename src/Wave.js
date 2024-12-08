import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Boost from 'highcharts/modules/boost';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function Wave({ series, pointInterval, yText, xUnit, xName }) {
  Boost(Highcharts);
  const { t } = useTranslation(); // Use useTranslation hook to access translations

  xName = xName ? xName : t("tick");

  const options = {
    title: {
      text: ''
    },
    credits: { enabled: false },
    legend: {
      enabled: false
    },
    chart: {
      width: 950,
      height: (6 / 16 * 100) + '%',
      animation: false,
      zooming: { type: 'x' },
    },
    plotOptions: {
      series: {
        marker: { enabled: false },
        animation: false,
        boostThreshold: 2500
      }
    },
    time: { useUTC: false },
    exporting: { enabled: false },
    xAxis: {
      crosshair: true,
      scrollbar: {
        enabled: false
      },
      title: { text: xUnit ? `${t(xName)} (${xUnit})` : t(xName) },
    },
    tooltip: {
      enabled: true,
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: (<b>{point.x:.4f}</b>, <b>{point.y:.4f}</b>)<br/>',
      shared: true
    },
    rangeSelector: {
      enabled: false
    },
    scrollbar: {
      enabled: false
    },
    navigator: {
      enabled: false
    },
    yAxis: {
      title: { text: yText || t('amplitude') }
    },
    series: [{
      data: series,
      name: t('waveform'),
      pointInterval: pointInterval ? pointInterval : 1,
      states: {
        hover: {
          enabled: false
        }
      }
    }]
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
    />
  );
}