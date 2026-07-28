/**
 * Tooltip functions
 * @author Louise ALEX
 * @date 2026-07-28
 */

import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL, currentLayerId, setCurrentLayerId
        } from "./state.js"; 

import {currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

import {getAveragedValue} from "./timeline.js"

export function getTooltip({ object, layer }) {
  //if level of zoom < 12 then no tooltip
  if (!object || currentZoom < 12) return null;
  const props = object.properties;
  const layerId = layer.id;

  setCurrentLayerId(layerId);

  const configTel = modeConfig[activeModeTelraam];
  const configVer = modeConfig[activeModeVerkehr];
  const configSur = modeConfig[activeModeSurvey];

  const valuetel = getAveragedValue(props, configTel.telraam);
  const value_ver = props[configVer.verkehr];
  const observation = props.observation_clean;
  const theme = props.suggestion_clean;

  //What is shown on the layer depending on the layer passed by the mouse
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

