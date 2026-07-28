/**
 * Main function that calls all the other js files + all event listener
 * Go here to change the style of the background map

 * @author Louise ALEX
 * @date 2026-07-28
 */
import { currentZoom, currentProps, rangeStart, rangeEnd, selectedFeatureId, activeModeTelraam,
    activeModeVerkehr, activeModeSurvey, telraamData, verkehrData, surveydata, deckGL, setDeckGL,
setCurrentZoom, currentLayerId, setCurrentLayerId, setselectedFeatureId} from "./state.js"; 

import { currentViewState, INITIAL_VIEW_STATE, modeConfig, justiceColorMap, DeckGL, setCurrentViewState
        } from "./config.js";

import {getLayers} from "./layers.js"; 
import {renderPanel, closeRightPanel, refreshPanelIfOpen} from "./panels.js";
import {getMinMax, updateLegend} from "./legend.js";
import {getTooltip, } from "./tooltip.js";
import {getAllMonthsInOrder, highlightRange, getActiveMonths, getAveragedValue} from "./timeline.js";
import {hexToRgb, getColorScale} from "./color.js"; 
import {getLineMidpoint, getLineAngle, getLabelData, isTopicVisible} from "./label_in_line.js";
import {toggle_tel, setDefaultToggle, handleTelraamModeClick, handleVerkehrModeClick,
    handleCollapseClick, handleAccordionClick, handleTelraamToggleChange, handleVerkehrToggleChange,
    handleSurveyToggleChange, handleMonthClick, handleDocumentClick, initSurveyTopicToggles
} from "./buttons.js"; 
import {loadData} from "./data.js"; 

//Calling all functions defined in other javascripts

loadData().then(() => {
  // initialize the DeckGL map instance once data has loaded
    setDeckGL(new deck.DeckGL({
        container: 'map',

        //changing the style of the background map
        mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        //mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',

        // initial position/zoom
        viewState: currentViewState, 
        controller: true,
        pickingRadius: 10, // click/hover detection radius in pixels

        // keep view state and zoom-dependent layers/tooltip in sync on zoom
        onViewStateChange: ({viewState}) => {
          setCurrentViewState(viewState);
          setCurrentZoom(viewState.zoom);
          deckGL.setProps({ viewState: currentViewState, layers: getLayers() });
        },
        updateLegend: updateLegend('telraam'),
        updateLegend: updateLegend('verkehrsmengen'),
        
           // define actions on clicking a segment: show details panel for that feature
        onClick: (info) => {
        if (!info.object) return; //ignore click on an empty part

        const layerId = info.layer.id;
        const props = info.object.properties;
        
        // ignore click if this layer is currently toggled off
        const layerToggle = document.getElementById(`toggle-${layerId}`);
        if (layerToggle && !layerToggle.checked) return;
        

        setCurrentLayerId(layerId);
        setselectedFeatureId(props.id ?? info.index);
        // get the active field config for each dataset based on current mode (car/bike/etc.)
        const configTel = modeConfig[activeModeTelraam];
        const configVer = modeConfig[activeModeVerkehr];

        const valuetel = getAveragedValue(props, configTel.telraam);
        const value_ver = props[configVer.verkehr];

        // render the side panel with the segment's data for both sources
        renderPanel(props, layerId, { valuetel, value_ver, configTel, configVer });
        deckGL.setProps({ layers: getLayers() });
        },

        getTooltip: getTooltip, // hover tooltip renderer
        layers: getLayers(),
        parameters: {
        depthTest: false, // disable depth testing so overlapping layers render in draw order
        },  
    }));
  // wire up close button for the right-side info panel
  document.getElementById('close-btn').addEventListener('click', closeRightPanel);
});

//To hide "Berlin" label 
setTimeout(() => {
  const map = deckGL.getMapboxMap();
  map.setLayoutProperty('place_city_r5', 'visibility', 'none');
}, 1000);

//zoom buttons 
function zoomBy(delta) {
  setCurrentViewState({
    ...currentViewState,
    zoom: currentViewState.zoom + delta,
    transitionDuration: 200
  });
  deckGL.setProps({ viewState: currentViewState });
}

//click toggle event
document.addEventListener('DOMContentLoaded', () => {
  setDefaultToggle('#mode-toggles-tel .toggle-btn[value="bike"]', 'colorTelraam', modeConfig);
  setDefaultToggle('#mode-toggles-ver .toggle-btn[value="bike"]', 'colorVerkehr', modeConfig);

  document.querySelectorAll('#mode-toggles-tel .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => handleTelraamModeClick(btn));
  });

  document.querySelectorAll('#mode-toggles-ver .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => handleVerkehrModeClick(btn));
  });

  document.getElementById('collapse-btn').addEventListener('click', handleCollapseClick);

  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => handleAccordionClick(header));
  });

  document.querySelectorAll('.accordion-header-2').forEach(header => {
    header.addEventListener('click', () => handleAccordionClick(header));
  });

  document.getElementById('toggle-telraam').addEventListener('change', handleTelraamToggleChange);
  document.getElementById('toggle-verkehrsmengen').addEventListener('change', handleVerkehrToggleChange);
  document.getElementById('toggle-survey').addEventListener('change', handleSurveyToggleChange);
});

//toggle for survey- topic 
document.addEventListener('click', handleDocumentClick);
document.addEventListener('DOMContentLoaded', initSurveyTopicToggles);

//for timeline
document.addEventListener('DOMContentLoaded', () => {
  highlightRange();
  document.querySelectorAll('.tick, .month').forEach(el => {
    el.addEventListener('click', () => handleMonthClick(el.dataset.month));
  });
});

//zoom in/out
document.getElementById('zoom-in-btn').addEventListener('click', () => zoomBy(1));
document.getElementById('zoom-out-btn').addEventListener('click', () => zoomBy(-1));

document.getElementById('home-btn').addEventListener('click', () => {
  currentViewState = {
    ...INITIAL_VIEW_STATE,
    transitionDuration: 300
  };
  deckGL.setProps({ viewState: currentViewState });
});

//active timeline 
window.addEventListener('DOMContentLoaded', () => {
  const activeTick = document.querySelector(`.tick[data-month="${rangeStart}"]`);
  const container = document.getElementById('timeline-container');

  if (activeTick && container) {
    const containerRect = container.getBoundingClientRect();
    const tickRect = activeTick.getBoundingClientRect();

    // how far the tick is from the container's current scroll position
    const offset = tickRect.left - containerRect.left + container.scrollLeft;

    container.scrollLeft = offset - container.clientWidth / 2 + activeTick.clientWidth / 2;
  }
});