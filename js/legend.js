/**
 * Legend definition and update

 * @author Louise ALEX
 * @date 2026-07-28
 */
import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL
        } from "./state.js"; 

import {currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

import {getAveragedValue} from "./timeline.js";

import {getColorScale} from "./color.js";

//function that calculates minimum and maximum of each dataset
export function getMinMax(baseField, isTel) {
  const data = isTel ? telraamData : verkehrData;
  if (!data) return [0, 0];

  const values = (isTel
    ? data.features.map(f => getAveragedValue(f.properties, baseField))
    : data.features.map(f => f.properties[baseField])
  ).filter(v => v !== null && v !== undefined && v !== 0);

  if (values.length === 0) return [0, 0];

  return [Math.min(...values), Math.max(...values)];
}

//Legend bar update
export function updateLegend(layerType) {
   // determine which dataset this legend update is for
  const isTel = layerType === 'telraam';

  // get the currently active mode (car/bike/etc.) for that dataset
  const mode = isTel ? activeModeTelraam : activeModeVerkehr;
  const config = modeConfig[mode];

  // pick the base color used for this dataset's color scale
  const baseColor = isTel ? config.colorTelraam : config.colorVerkehr;
  const [min, max] = getMinMax(config[isTel ? 'telraam' : 'verkehr'], isTel);
  
  const bar = document.getElementById(isTel ? 'legend-bar-tel' : 'legend-bar-ver');

  // compute the colors at the low end (min) and high end (max) of the scale
  const lightColor = `rgb(${getColorScale(min, min, max, baseColor).slice(0,3).join(',')})`;
  const darkColor = `rgb(${getColorScale(max, min, max, baseColor).slice(0,3).join(',')})`;

  bar.style.background = `linear-gradient(to right, ${lightColor}, ${darkColor})`;

  // update the min/max labels displayed next to the legend bar
  document.getElementById(isTel ? 'legend-min-tel' : 'legend-min-ver').textContent = Math.round(min);
  document.getElementById(isTel ? 'legend-max-tel' : 'legend-max-ver').textContent = Math.round(max);
}