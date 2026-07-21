import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL
        } from "./state.js"; 

import {currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

export function getAllMonthsInOrder() {
  return Array.from(document.querySelectorAll('.month')).map(el => el.dataset.month);
}

export function highlightRange() {
  document.querySelectorAll('.tick, .month').forEach(e => e.classList.remove('active'));
  const months = getAllMonthsInOrder();
  const i1 = months.indexOf(rangeStart);
  const i2 = rangeEnd ? months.indexOf(rangeEnd) : i1;
  for (let i = i1; i <= i2; i++) {
    document.querySelectorAll(`[data-month="${months[i]}"]`).forEach(e => e.classList.add('active'));
  }
}
export function getActiveMonths() {
  const months = getAllMonthsInOrder();
  const i1 = months.indexOf(rangeStart);
  const i2 = rangeEnd ? months.indexOf(rangeEnd) : i1;
  return months.slice(i1, i2 + 1);
}

//new calculation adapted to new months
export function getAveragedValue(props, baseField) {
  const months = getActiveMonths();
  const values = months
    .map(m => props[`${baseField}_${m}`])
    .filter(v => v !== null && v !== undefined);
    //console.log('months in range:', months.length, 'months with data:', values.length, 'values:', values);
  if (values.length === 0) return null;
   return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}








