import './EventAlertUI.css'; // Import the CSS file for styling

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import dataStore from './DataStore';
import { useTranslation } from 'react-i18next';
import * as React from 'react'
import { observer } from 'mobx-react';
import { dB, formatTimeToLocal } from './Utils';

const columnHelper = createColumnHelper();

const EventAlertUI = observer(()  => {

  const handleThresholdChange = (event) => {
    const value = parseInt(event.target.value, 10);
    dataStore.setEventAlertEnergyThreshold(value);
  };

  const handleEventStaySecondsChange = (event) => {
    const value = parseInt(event.target.value, 10);
    dataStore.setEventAlertStaySeconds(value);
  };

  const { t } = useTranslation(); 

  const columnWidth = 170; 

  const columns = [
    columnHelper.accessor('pos', {
      cell: info => <strong>{(info.getValue() * 0.4).toFixed(2)}</strong>,
      footer: info => info.column.id,
      header: () => <>{t('position')}({t('m')})</>,
      size: columnWidth,  // Set fixed width for the column
    }),
    columnHelper.accessor('time', {
      cell: info => <strong>{formatTimeToLocal(info.getValue(), "hms")}</strong>,
      footer: info => info.column.id,
      header: () => <>{t('time')}</>,
      size: columnWidth,  // Set fixed width for the column
    }),
    columnHelper.accessor('energy', {
      cell: info => <>{dB(info.getValue()).toFixed(2)}</>,
      header: () => <>{t('energy')}(dB)</>,
      size: columnWidth,  // Set fixed width for the column
    }),
    columnHelper.accessor('wave_complexity', {
      cell: info => <>{info.getValue() && info.getValue().toFixed(2)}</>,
      header: () => <>{t('waveComplexity')}</>,
      size: columnWidth,  // Set fixed width for the column
    }),
    columnHelper.accessor('riskProb', {
      cell: info => <>{info.getValue().toFixed(2)}</>,
      header: () => <>{t('riskProbability')}</>,
      size: columnWidth,  // Set fixed width for the column
    }),
    columnHelper.accessor('riskLevel', {
      cell: info => <>{info.getValue()}{t('level')}</>,
      header: () => <>{t('riskLevel')}</>,
      size: columnWidth,  // Set fixed width for the column
    }),
  ]

  const table = useReactTable({
    data : dataStore.eventAlerts,
    columns : columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
        <div className='eventAlertHeader'>
        <h3>{t("eventAlertList")}</h3>
        <div className='inputContainer'>
          <label htmlFor="energyThreshold" className='energyThresholdLabel'>{t('eventAlert')} {t('energyThreshold')}</label>
          <input 
            type="number" 
            id="energyThreshold" 
            className='energyThresholdInput' 
            value={dataStore.eventAlertEnergyThreshold}
            onChange={handleThresholdChange}
          />
          <label className='energyThresholdUnit' >{t('dB')}</label>
          <label htmlFor="eventStaySeconds" className='eventStaySecondsLabel'>{t('staySeconds')}</label>
          <input 
            type="number" 
            id="eventStaySeconds" 
            className='eventStaySecondsInput' 
            value={dataStore.eventAlertStaySeconds}
            onChange={handleEventStaySecondsChange}
          />
          <label className='eventStaySecondsUnit'>{t('s')}</label>
        </div>
      </div>
      <div className='eventAlertContainer'>
        <table className='eventAlertTable'>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ width: header.column.columnDef.size }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{ width: cell.column.columnDef.size }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
});

export default EventAlertUI;
