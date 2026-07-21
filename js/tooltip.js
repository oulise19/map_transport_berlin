//for highest values in heavy to avoid outliners 
// function getPercentile(values, p) {
//   const sorted = [...values].filter(v => v != null).sort((a, b) => a - b);
//   const index = Math.floor((p / 100) * sorted.length);
//   return sorted[index];
// }
//tooltip

import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL, currentLayerId, setCurrentLayerId
        } from "./state.js"; 

import {currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

import {getAveragedValue} from "./timeline.js"

export function getTooltip({ object, layer }) {
  
  if (!object || currentZoom < 12) return null;
  const props = object.properties;
  const layerId = layer.id;

  // currentLayerId = layerId;
  setCurrentLayerId(layerId);

  const configTel = modeConfig[activeModeTelraam];
  const configVer = modeConfig[activeModeVerkehr];
  const configSur = modeConfig[activeModeSurvey];

  const valuetel = getAveragedValue(props, configTel.telraam);
  const value_ver = props[configVer.verkehr];
  const observation = props.observation_clean;
  const theme = props.suggestion_clean;

  switch (layer.id) {
    case 'telraam':
      return {
        html: `<p>${layerId !== 'survey' ? `<p><strong>${configTel.label}:</strong> ${valuetel ?? 'No data for the period selected'}</p>` : ''}</p>`
      };
    case 'verkehrsmengen':
      return {
        html: `<p>${configVer.label}: ${value_ver ?? '—'}</p>`
      };
    case 'survey':
      return {
        html: `<p><strong>Situation:</strong> ${observation}</p>
        <p><strong>Theme:</strong> ${theme}</p>`
      };
    default:
      return null;
  }
}

