/**
 * All panel action definition
 * Here to change the name of all values that change with the action of the viewer (which data is shown, which segment is called)
 * @author Louise ALEX
 * @date 2026-07-28
 */
import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL, setcurrentProps,
        setcurrentLayerId, setselectedFeatureId, currentLayerId} from "./state.js"; 

import { currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

import { getLayers } from "./layers.js";
import { getAveragedValue } from "./timeline.js";

//Right panel action
export function renderPanel(props, layerId) {
  setcurrentProps(props);
  setcurrentLayerId(layerId);
  const config = layerId === 'telraam' 
    ? modeConfig[activeModeTelraam] 
    : modeConfig[activeModeVerkehr];

  let value;
  let value2;
  //If segment telraam clicked, Telraam segment is written on the right panel
  //If it's Geoportal clicked : Geoportal-Segment aus Berlin is written
  if (layerId === 'telraam') {
    value2 =  `<p class="segment-header"> <strong> Telraam segment</strong> </p>`;
    value = getAveragedValue(props, config.telraam);
  } else if (layerId === 'verkehrsmengen') {
    value2= `<p class="segment-header"> <strong> Geoportal-Segment aus Berlin</strong> </p>`;
    value = props[config.verkehr];
  } else if (layerId === 'survey') {
    value = null;
  };

  let header;
  //All values when a Telraam segment is clicked 
  if (layerId === 'telraam') {
    header = `<p><strong>Segment:</strong> ${props.segment_id}</p>
              `;
  //Same for Verkersmengen
  } else if (layerId === 'verkehrsmengen') {
    header = `<p><strong>Straße:</strong> ${props.str_name}</p>`;
  //What is shown when a point of the survey is clicked. Name of the sites_mit_demographics_bereinigt_v2 used
  } else if (layerId === 'survey') {
    header = `<p><strong>Situation:</strong> ${props.observation_clean}</p>
              <p><strong>Thema:</strong> ${props.suggestion_clean}</p>`;
  }
  const panel = document.getElementById('right-panel');
  panel.classList.add('refreshing');
  setTimeout(() => {
  //Sending the values on the right panel, definition of the no data for this period text
  document.getElementById('panel-content').innerHTML = `
    
    ${layerId !== 'survey' ? `${value2 ?? ''}<p><strong>${config.label}:</strong> ${value ?? 'Für diesen Zeitraum liegen keine Daten vor'}</p>` : ''}
    ${header}
  `;
    document.body.classList.add('panel-open');
    panel.style.display = 'block';
    panel.classList.remove('refreshing'); 
  }, 150);
}

//Closing right panel
export function closeRightPanel() {
  document.body.classList.remove('panel-open');
  setselectedFeatureId(null);
  setcurrentProps(null);
  setcurrentLayerId(null);
  deckGL.setProps({ layers: getLayers() });
}

//Refreshing left panel in case another segment is selected
export function refreshPanelIfOpen() {
  if (currentProps && currentLayerId && document.body.classList.contains('panel-open')) {
    renderPanel(currentProps, currentLayerId);
  }
}