import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL, setcurrentProps,
        setcurrentLayerId, setselectedFeatureId, currentLayerId} from "./state.js"; 

import { currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

import { getLayers } from "./layers.js";
import { getAveragedValue } from "./timeline.js";

export function renderPanel(props, layerId) {
  setcurrentProps(props);
  setcurrentLayerId(layerId);
  const config = layerId === 'telraam' 
    ? modeConfig[activeModeTelraam] 
    : modeConfig[activeModeVerkehr];
  let value;
  let value2;
  if (layerId === 'telraam') {
    value2 =  `<p class="segment-header"> <strong> Telraam segment</strong> </p>`;
    value = getAveragedValue(props, config.telraam);
  } else if (layerId === 'verkehrsmengen') {
    value2= `<p class="segment-header"> <strong> Segment Geoportal aus Berlin</strong> </p>`;
    value = props[config.verkehr];
  } else if (layerId === 'survey') {
    value = null;
  };
  let header;
  if (layerId === 'telraam') {
    header = `<p><strong>Segment:</strong> ${props.segment_id}</p>
              `;
  } else if (layerId === 'verkehrsmengen') {
    header = `<p><strong>Straße:</strong> ${props.str_name}</p>`;
  } else if (layerId === 'survey') {
    header = `<p><strong>Situation:</strong> ${props.observation_clean}</p>
              <p><strong>Thema:</strong> ${props.suggestion_clean}</p>`;
  }
  const panel = document.getElementById('right-panel');
  panel.classList.add('refreshing');
  setTimeout(() => {
  document.getElementById('panel-content').innerHTML = `
   
    ${layerId !== 'survey' ? `${value2 ?? ''}<p><strong>${config.label}:</strong> ${value ?? 'Für diesen Zeitraum liegen keine Daten vor'}</p>` : ''}
    ${header}
  `;
    document.body.classList.add('panel-open');
    panel.style.display = 'block';
    panel.classList.remove('refreshing'); 
  }, 150);
}

export function closeRightPanel() {
  document.body.classList.remove('panel-open');
  setselectedFeatureId(null);
  setcurrentProps(null);
  setcurrentLayerId(null);
  deckGL.setProps({ layers: getLayers() });
}

export function refreshPanelIfOpen() {
  if (currentProps && currentLayerId && document.body.classList.contains('panel-open')) {
    renderPanel(currentProps, currentLayerId);
  }
}