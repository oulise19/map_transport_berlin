/**
 * Color scale utilities for the Telraam/Verkehrsmengen map.
 *
 * @author Louise ALEX
 * @date 2026-07-28
 */

import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL
        } from "./state.js"; 

import { currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

//Converts hex color code into RGB array
export function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1,3), 16),
    parseInt(hex.slice(3,5), 16),
    parseInt(hex.slice(5,7), 16)
  ];
}

//Graduation of colors
export function getColorScale(value, min, max, baseColor) {
  // if there's no value, return fully transparent (invisible) color
  if (value === null || value === undefined) return [0, 0, 0, 0];
  
  // normalize value to a 0–1 range based on min/max, clamped to avoid overflow
  let t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  t = Math.pow(t, 0.6); 
  
  // convert the base color (hex) to RGB components
  const [r, g, b] = hexToRgb(baseColor);
  // set a minimum intensity so even the lowest values aren't pure white
  const minT = 0.15; 
  const adjusted = minT + t * (1 - minT);

  // interpolate each channel between white (255) and the base color,
  // based on the adjusted intensity — higher values are closer to baseColor
  return [
    Math.round(255 - adjusted * (255 - r)),
    Math.round(255 - adjusted * (255 - g)),
    Math.round(255 - adjusted * (255 - b)),
    255
  ];
}