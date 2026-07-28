/**
 * Timeline functions
 * @author Louise ALEX
 * @date 2026-07-28
 */

import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL
        } from "./state.js"; 

import {currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

export function getAllMonthsInOrder() {
  return Array.from(document.querySelectorAll('.month')).map(el => el.dataset.month);
}

export function highlightRange() {
  // clear "active" styling from all tick marks and month labels first
  document.querySelectorAll('.tick, .month').forEach(e => e.classList.remove('active'));
  const months = getAllMonthsInOrder();
  // find the index of the range start (and end, defaulting to start if no end is set)
  const i1 = months.indexOf(rangeStart);
  const i2 = rangeEnd ? months.indexOf(rangeEnd) : i1;
  // add "active" class to every element matching each month within the selected range
  for (let i = i1; i <= i2; i++) {
    document.querySelectorAll(`[data-month="${months[i]}"]`).forEach(e => e.classList.add('active'));
  }
}

//Returns the list of month labels currently selected (between rangeStart and rangeEnd)
export function getActiveMonths() {
  const months = getAllMonthsInOrder();
  const i1 = months.indexOf(rangeStart);
  const i2 = rangeEnd ? months.indexOf(rangeEnd) : i1;
   // extract just the months within that range (inclusive)
  return months.slice(i1, i2 + 1);
}

//New calculation adapted to new months
export function getAveragedValue(props, baseField) {
  const months = getActiveMonths();
  const values = months
    .map(m => props[`${baseField}_${m}`])
    .filter(v => v !== null && v !== undefined);
  // if no valid data exists for the selected months, return null
  if (values.length === 0) return null;
  // return the rounded average across all valid monthly values
   return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}








