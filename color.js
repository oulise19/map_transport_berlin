import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL
        } from "./state.js"; 

import { currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

export function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1,3), 16),
    parseInt(hex.slice(3,5), 16),
    parseInt(hex.slice(5,7), 16)
  ];
}
//graduation color
export function getColorScale(value, min, max, baseColor) {
  if (value === null || value === undefined) return [0, 0, 0, 0];
  
  let t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  t = Math.pow(t, 0.6); // pulls mid values up, makes more segments look "strong"
  
  const [r, g, b] = hexToRgb(baseColor);
  const minT = 0.15; // slightly lower floor for more contrast
  const adjusted = minT + t * (1 - minT);

  return [
    Math.round(255 - adjusted * (255 - r)),
    Math.round(255 - adjusted * (255 - g)),
    Math.round(255 - adjusted * (255 - b)),
    255
  ];
}