import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL, setCurrentLayerId, 
    currentLayerId, setrangeStart, setrangeEnd
        } from "./state.js"; 

import { currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap 
        } from "./config.js";

import {setactiveModeTelraam,setactiveModeVerkehr} from "./state.js"

import { getLayers } from "./layers.js";
import { updateLegend } from "./legend.js";
import { renderPanel, refreshPanelIfOpen } from "./panels.js";
import { getAllMonthsInOrder, highlightRange } from "./timeline.js";

export function toggle_tel() {
  document.querySelectorAll('#mode-toggles-tel .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeModeTelraam = btn.value;
      document.querySelectorAll('#mode-toggles-tel .toggle-btn').forEach(b => {
        b.classList.remove('active');
        b.style.removeProperty('--active-color');
      });
      btn.classList.add('active');
      btn.style.setProperty('--active-color', modeConfig[activeModeTelraam].colorTelraam);
      deckGL.setProps({ layers: getLayers() });
      updateLegend('telraam');
      if (currentProps) renderPanel(currentProps, currentLayerId);
    });
  });
}

export function setDefaultToggle(selector, colorKey, config) {
  const btn = document.querySelector(selector);
  btn.classList.add('active');
  btn.style.setProperty('--active-color', config['bike'][colorKey]);
}

export function handleTelraamModeClick(btn) {
//   activeModeTelraam = btn.value;
setactiveModeTelraam(btn.value);
  document.querySelectorAll('#mode-toggles-tel .toggle-btn').forEach(b => {
    b.classList.remove('active');
    b.style.removeProperty('--active-color');
  });
  btn.classList.add('active');
  btn.style.setProperty('--active-color', modeConfig[activeModeTelraam].colorTelraam);
  deckGL.setProps({ layers: getLayers() });
  updateLegend('telraam');
  if (currentProps) renderPanel(currentProps, currentLayerId);
}

export function handleVerkehrModeClick(btn) {
    setactiveModeVerkehr(btn.value);
  document.querySelectorAll('#mode-toggles-ver .toggle-btn').forEach(b => {
    b.classList.remove('active');
    b.style.removeProperty('--active-color');
  });
  btn.classList.add('active');
  btn.style.setProperty('--active-color', modeConfig[activeModeVerkehr].colorVerkehr);
  deckGL.setProps({ layers: getLayers() });
  updateLegend('verkehrsmengen');
  if (currentProps) renderPanel(currentProps, currentLayerId);
}

export function handleCollapseClick() {
  document.body.classList.toggle('panel-collapsed');
}

export function handleAccordionClick(header) {
  header.parentElement.classList.toggle('collapsed');
}

export function handleTelraamToggleChange(e) {
  document.querySelectorAll('#mode-toggles-tel .toggle-btn').forEach(btn => {
    btn.disabled = !e.target.checked;
  });
  document.getElementById('legend-tel').style.display = e.target.checked ? 'block' : 'none';
  updateLegend('telraam');
  deckGL.setProps({ layers: getLayers() });
}

export function handleVerkehrToggleChange(e) {
  document.querySelectorAll('#mode-toggles-ver .toggle-btn').forEach(btn => {
    btn.disabled = !e.target.checked;
  });
  document.getElementById('legend-ver').style.display = e.target.checked ? 'block' : 'none';
  updateLegend('verkehrsmengen');
  deckGL.setProps({ layers: getLayers() });
}

export function handleSurveyToggleChange(e) {
  document.querySelectorAll('#mode-toggles-survey .toggle-btn').forEach(btn => {
    btn.disabled = !e.target.checked;
  });
  deckGL.setProps({ layers: getLayers() });
}


export function handleMonthClick(month) {
  if (rangeEnd !== null) {
    // already had a range — start fresh
    // rangeStart = month;
    setrangeStart(month);
    // rangeEnd = null;
    setrangeEnd(null);
  } else if (month === rangeStart) {
    // clicking same month again does nothing
    return;
  } else {
    // set the end of the range (order doesn't matter, so sort them)
    const months = getAllMonthsInOrder();
    const i1 = months.indexOf(rangeStart);
    const i2 = months.indexOf(month);
    if (i2 > i1) {
    //   rangeEnd = month;
    setrangeStart(month);
    } else {
    //   rangeEnd = rangeStart;
    setrangeEnd(rangeStart);
    //   rangeStart = month;
    setrangeStart(month);

    }
  }

  highlightRange();
  deckGL.setProps({ layers: getLayers() });
  if (currentProps) renderPanel(currentProps, currentLayerId);
  refreshPanelIfOpen();
}

export function handleDocumentClick(e) {
  if (e.target.id === 'toggle-survey') {
    setTimeout(() => {
      const allChecked = e.target.checked;
      document.querySelectorAll('[id^="toggle-topic_"]').forEach(cb => {
        cb.disabled = !allChecked;
      });
      deckGL.setProps({ layers: getLayers() });
    }, 0);
  }

  if (e.target.id && e.target.id.startsWith('toggle-topic_')) {
    setTimeout(() => {
      deckGL.setProps({ layers: getLayers() });
    }, 0);
  }
}

export function initSurveyTopicToggles() {
  const allChecked = document.getElementById('toggle-survey').checked;
  document.querySelectorAll('[id^="toggle-topic_"]').forEach(cb => {
    cb.disabled = !allChecked;
  });
}

