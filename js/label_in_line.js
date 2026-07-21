import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL
        } from "./state.js"; 

import { currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";


import {getAveragedValue} from "./timeline.js"

// for numbers in the linestring 
export function getLineMidpoint(geometry) {
  if (!geometry) return null;
  let coords;
  if (geometry.type === 'LineString') {
    coords = geometry.coordinates;
  } else if (geometry.type === 'MultiLineString') {
    coords = geometry.coordinates[0];
  } else {
    return null;
  }
  const midIndex = Math.floor(coords.length / 2);
  return coords[midIndex];
}

export function getLineAngle(geometry) {
  if (!geometry) return null;
  let coords;
  if (geometry.type === 'LineString') {
    coords = geometry.coordinates;
  } else if (geometry.type === 'MultiLineString') {
    coords = geometry.coordinates[0];
  } else {
    return 0;
  }
  const midIndex = Math.floor(coords.length / 2);
  const p1 = coords[Math.max(0, midIndex - 1)];
  const p2 = coords[Math.min(coords.length - 1, midIndex + 1)];
  const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * (180 / Math.PI);
  return angle;
}

export function getLabelData(data, baseField, isTel) {
  if (!data) {
    console.error('getLabelData called with null/undefined data. baseField:', baseField, 'isTel:', isTel);
    return [];
  }
  return data.features.map(f => {
    const value = isTel
      ? getAveragedValue(f.properties, baseField)
      : f.properties[baseField];
    const pos = getLineMidpoint(f.geometry);
    const angle = getLineAngle(f.geometry);
    if (!pos || value === null || value === undefined) return null;
    return { position: pos, text: String(Math.round(value)), angle };
  }).filter(d => d !== null);
}

export function isTopicVisible(props) {
  const allCheckbox = document.getElementById('toggle-survey');
  if (!allCheckbox.checked) return false; // all off → hide everything

  for (const key of Object.keys(props)) {
    if (key.startsWith('topic_') && props[key] == 1) {
      const checkbox = document.getElementById(`toggle-${key}`);
      if (checkbox && checkbox.checked) return true;
    }
  }
  return false;
}