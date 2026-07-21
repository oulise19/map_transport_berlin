import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL
        } from "./state.js"; 

import {currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

import {getAveragedValue} from "./timeline.js";

import {getColorScale} from "./color.js";
//legend bar update
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

export function updateLegend(layerType) {
  console.log('updatelegend is called')
  const isTel = layerType === 'telraam';
  const mode = isTel ? activeModeTelraam : activeModeVerkehr;
  const config = modeConfig[mode];
  const baseColor = isTel ? config.colorTelraam : config.colorVerkehr;

  const [min, max] = getMinMax(config[isTel ? 'telraam' : 'verkehr'], isTel);
  console.log('updateLegend called:', layerType, 'min:', min, 'max:', max, 'baseColor:', baseColor);
  
  const bar = document.getElementById(isTel ? 'legend-bar-tel' : 'legend-bar-ver');
  const lightColor = `rgb(${getColorScale(min, min, max, baseColor).slice(0,3).join(',')})`;
  const darkColor = `rgb(${getColorScale(max, min, max, baseColor).slice(0,3).join(',')})`;

  bar.style.background = `linear-gradient(to right, ${lightColor}, ${darkColor})`;

  document.getElementById(isTel ? 'legend-min-tel' : 'legend-min-ver').textContent = Math.round(min);
  document.getElementById(isTel ? 'legend-max-tel' : 'legend-max-ver').textContent = Math.round(max);
}