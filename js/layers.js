import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL
        } from "./state.js"; 

import {currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
       ,GeoJsonLayer } from "./config.js";

import {getLabelData} from "./label_in_line.js";
import {getAveragedValue} from "./timeline.js";
import {getColorScale} from "./color.js"; 
import {isTopicVisible} from "./label_in_line.js";

export function getLayers() {
    const telraamVisible = document.getElementById('toggle-telraam').checked;
    const verkehrVisible = document.getElementById('toggle-verkehrsmengen').checked;
    const surveyVisible = document.getElementById('toggle-survey').checked;
  return [
    new GeoJsonLayer({
      id: 'telraam',
      data: telraamData, 
        getLineColor: (feature, {index}) => {
        const featureId = feature.properties.id ?? index;
        if (featureId === selectedFeatureId) {
          return [255, 255, 0, 255];
        }
        const value = getAveragedValue(feature.properties, modeConfig[activeModeTelraam].telraam); 
        
        const [min, max] = modeConfig[activeModeTelraam].rangeTelraam;
        const color_tel = getColorScale(value, min, max, modeConfig[activeModeTelraam].colorTelraam);
        return color_tel;
        },
      beforeId: 'waterway_label',
      updateTriggers: {
      getLineColor: [activeModeTelraam, rangeStart, rangeEnd,selectedFeatureId],
      getLineWidth: [selectedFeatureId]
      },
      lineWidthMinPixels: 4,
      pickable: true,
      visible: telraamVisible,
    }),
    new GeoJsonLayer({
    id: 'verkehrsmengen',
    data: verkehrData,

    getLineColor: (feature, {index}) => {
      const featureId = feature.properties.id ?? index;
      if (featureId === selectedFeatureId) {
        return [255, 255, 0, 255];
      }
      const field = modeConfig[activeModeVerkehr].verkehr;
      const value = feature.properties[field];
      const threshold = modeConfig[activeModeVerkehr].zoomThreshold;
      const rank_street = feature.properties['strklasse1'];
      if (currentZoom < 12 && rank_street > threshold) {
        return [0, 0, 0, 0];
      }
      const [min, max] = modeConfig[activeModeVerkehr].rangeVerkehr;
      const color_ver = getColorScale(value, min, max, modeConfig[activeModeVerkehr].colorVerkehr);
      return color_ver;
    },

    getLineWidth: (feature, {index}) => {
      const featureId = feature.properties.id ?? index;
      return featureId === selectedFeatureId ? 3 : 1;
    },

    beforeId: 'waterway_label',
    updateTriggers: {
      getLineColor: [activeModeVerkehr, currentZoom, selectedFeatureId],
      getLineWidth: [selectedFeatureId]
    },
    lineWidthMinPixels: 3,
    pickable: true,
    visible: verkehrVisible,
      }),

    new GeoJsonLayer({
      id: 'survey',
      data: surveydata, 
      beforeId: undefined,
      visible: surveyVisible,
      pointType: 'circle',
      getPointRadius: 15,
      pointRadiusMinPixels: 5,
      pointRadiusMaxPixels: 15,
      stroked: true,
      pickable: true,
      getFillColor: (feature) => {
        if (!isTopicVisible(feature.properties)) {
          return [0, 0, 0, 0];
        }
        const category = feature.properties.justice_perception;
        return justiceColorMap[category] || [150, 150, 150, 200];
      },

      stroked: true,
      getLineColor: (feature) => {
        return isTopicVisible(feature.properties) ? [255, 255, 255, 255] : [0, 0, 0, 0];
      },
      getLineWidth:1,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 0.6,
      lineWidthMaxPixels: 0.6,

        updateTriggers: {
          getFillColor: [
            document.getElementById('toggle-survey')?.checked,
            ...Array.from(document.querySelectorAll('[id^="toggle-topic_"]'))
              .map(cb => cb.checked)
          ],
          getLineColor: [
            document.getElementById('toggle-survey')?.checked,
            ...Array.from(document.querySelectorAll('[id^="toggle-topic_"]'))
              .map(cb => cb.checked)
          ]
        }
      }),
    new deck.TextLayer({
      id: 'telraam-labels',
      data: getLabelData(telraamData, modeConfig[activeModeTelraam].telraam, true),
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 10,
      getAngle: d => d.angle,
      getColor: [0, 0, 0, 255],
      visible: currentZoom >= 14.7 && document.getElementById('toggle-telraam').checked,
      background: true,
      getBackgroundColor: [255, 255, 255, 200],
      backgroundPadding: [3, 1],
    }),
    new deck.TextLayer({
      id: 'verkehr-labels',
      data: getLabelData(verkehrData, modeConfig[activeModeVerkehr].verkehr, false),
      getPosition: d => d.position,
      getText: d => d.text,
      sizeUnits: 'meters',
      sizeMinPixels: 8,
      sizeMaxPixels: 10,
      getAngle: d => d.angle,
      getColor: [0, 0, 0, 255],
      visible: currentZoom >= 14.7 && document.getElementById('toggle-verkehrsmengen').checked,
      background: true,
      getBackgroundColor: [255, 255, 255, 170],
      backgroundPadding: [3, 1],
    }),
  ];
}