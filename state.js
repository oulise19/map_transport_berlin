//All variables that change as the page runs 
// Example : active layer, level of zoom, time period...


export let currentZoom = null;
export function setCurrentZoom(zoom) {
  currentZoom = zoom;
}

export let rangeStart = '2025_01';
export let rangeEnd = '2025_12'; 
export function setrangeStart(start){ rangeStart = start;}
export function setrangeEnd(end){ rangeEnd = end;}

export function setselectedFeatureId(feature){selectedFeatureId = feature;}

export let activeModeTelraam = 'bike';
export let activeModeVerkehr = 'bike';
export let activeModeSurvey = 'survey';
export function setactiveModeTelraam(mode){activeModeTelraam = mode;}
export function setactiveModeVerkehr(mode){activeModeVerkehr = mode;}
export function setactiveSurvey(mode){activeModeTelraam = mode;}

export let currentLayerId= null;
export function setCurrentLayerId(current){currentLayerId = current;}

export let deckGL;
export function setDeckGL(instance) {deckGL = instance;}

export let telraamData;
export let verkehrData;
export let surveydata;
export function setTelraamData(data) { telraamData = data; }
export function setVerkehrData(data) { verkehrData = data; }
export function setSurveyData(data) { surveydata = data; }

export let currentProps = null;
export function setcurrentProps(props){ currentProps = props; }
export function setcurrentLayerId(layerId){ currentLayerId = layerId;}
export let selectedFeatureId = null;
export function setSelectedFeatureId(selected){ selectedFeatureId = selected;}

