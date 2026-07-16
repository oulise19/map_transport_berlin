
const {DeckGL, GeoJsonLayer} = deck;
let currentZoom = 11;
let currentProps = null;
let activeMode = 'bike';
let activeMonth = '2025_01';
let rangeStart = '2025_01';
let rangeEnd = '2025_12'; 

let activeModeTelraam = 'bike';
let activeModeVerkehr = 'bike';
let activeModeSurvey = 'survey';

let telraamData = null;
let verkehrData = null;
let surveydata = null;
let deckGL;

let currentViewState = {
  longitude: 13.4,
  latitude: 52.52,
  zoom: 11
};

let selectedFeatureId = null;

const INITIAL_VIEW_STATE = { ...currentViewState };

async function loadData() {
  const [telRes, verRes, surRes] = await Promise.all([
    fetch('data/tel_all_years.geojson'),
    fetch('data/all_verkehrsmengen_2023_new.geojson'),
    fetch('data/sites_mit_demographics_bereinigt_v2.geojson'),
  
  ]);
  telraamData = await telRes.json();
  verkehrData = await verRes.json();
  surveydata = await surRes.json();
}

loadData().then(() => {
  console.log('Layers:', getLayers().map(l => l.id));
  deckGL = new deck.DeckGL({
        container: 'map',
        mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        viewState: currentViewState, // instead of initialViewState
        controller: true,
        pickingRadius: 10,
        onViewStateChange: ({viewState}) => {
          currentViewState = viewState;
          currentZoom = viewState.zoom;
          deckGL.setProps({ viewState: currentViewState, layers: getLayers() });
        },
        onClick: (info) => {
        if (!info.object) return;

        const layerId = info.layer.id;
        const props = info.object.properties;

        const layerToggle = document.getElementById(`toggle-${layerId}`);
        if (layerToggle && !layerToggle.checked) return;

        currentLayerId = layerId;
        selectedFeatureId = props.id ?? info.index;
        const configTel = modeConfig[activeModeTelraam];
        const configVer = modeConfig[activeModeVerkehr];

        const valuetel = getAveragedValue(props, configTel.telraam);
        const value_ver = props[configVer.verkehr];

        renderPanel(props, layerId, { valuetel, value_ver, configTel, configVer });
        deckGL.setProps({ layers: getLayers() });
      },
        getTooltip: getTooltip,
        layers: getLayers(),
        parameters: {
        depthTest: false
        }    
    }); 
  document.getElementById('close-btn').addEventListener('click', closeRightPanel);
});

setTimeout(() => {
  const map = deckGL.getMapboxMap();
  map.setLayoutProperty('place_city_r5', 'visibility', 'none');
}, 1000);

const modeConfig = {
  'bike': {
    telraam: 'bike_total', verkehr: 'dtvw_rad', label: 'Bikes',
    colorTelraam: '#e844e8', colorVerkehr: '#c9530f',
    rangeTelraam: [0.0, 4167.1],
    rangeVerkehr: [210, 8900], zoomThreshold : 'II',
  },
  'car': {
    telraam: 'car_total', verkehr: 'dtw_kfz_new', label: 'Cars',
    colorTelraam: '#b91bbe', colorVerkehr: '#d67405',
    rangeTelraam: [0.0, 10822.3],
    rangeVerkehr: [0, 65200], zoomThreshold : 'II',
  },
  'heavy': {
    telraam: 'heavy_total', verkehr: 'dtvw_lkw', label: 'Heavy',
    colorTelraam: '#801062', colorVerkehr: '#fe5b09',
    rangeTelraam: [100, 2073.2],
    rangeVerkehr: [100, 3000], zoomThreshold : 'II',
  }
};

const justiceColorMap = {
  "very just": [46, 125, 50, 255],       // green
  "somewhat just": [139, 195, 74, 255],  // light green
  "neither": [255, 235, 59, 255],        // yellow
  "somewhat unjust": [255, 152, 0, 255], // orange
  "very unjust": [229, 57, 53, 255]      // red
};


function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1,3), 16),
    parseInt(hex.slice(3,5), 16),
    parseInt(hex.slice(5,7), 16)
  ];
}


function getLayers() {

    const telraamVisible = document.getElementById('toggle-telraam').checked;
    const verkehrVisible = document.getElementById('toggle-verkehrsmengen').checked;
    const surveyVisible = document.getElementById('toggle-survey').checked;
    
    
  return [
    new GeoJsonLayer({
      id: 'telraam',
      data: telraamData, 
        getLineColor: (feature) => {
        const value = getAveragedValue(feature.properties, modeConfig[activeModeTelraam].telraam); 
        
        const [min, max] = modeConfig[activeModeTelraam].rangeTelraam;
        const color_tel = getColorScale(value, min, max, modeConfig[activeModeTelraam].colorTelraam);
        return color_tel;
        },
      beforeId: 'waterway_label',
      updateTriggers: {
      getLineColor: [activeModeTelraam, rangeStart, rangeEnd]
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
      // beforeId: 'waterway_label',
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

  function renderPanel(props, layerId) {
  currentProps = props;
  currentLayerId = layerId;
  const config = layerId === 'telraam' 
    ? modeConfig[activeModeTelraam] 
    : modeConfig[activeModeVerkehr];
  let value;
  if (layerId === 'telraam') {
    value = getAveragedValue(props, config.telraam);
  } else if (layerId === 'verkehrsmengen') {
    value = props[config.verkehr];
  } else if (layerId === 'survey') {
    value = null; // survey has no mode-based value
  };
  let header;
  if (layerId === 'telraam') {
    header = `<p><strong>Segment:</strong> ${props.segment_id}</p>
              `;
  } else if (layerId === 'verkehrsmengen') {
    header = `<p><strong>Segment:</strong> ${props.link_id}</p>
              <p><strong>Street:</strong> ${props.str_name}</p>`;
  } else if (layerId === 'survey') {
    header = `<p><strong>Situation:</strong> ${props.observation_clean}</p>
              <p><strong>Theme:</strong> ${props.suggestion_clean}</p>`;
  }
  
  // document.body.classList.add('panel-open');
  // document.getElementById('right-panel').style.display = 'block';
  
  const panel = document.getElementById('right-panel');
  panel.classList.add('refreshing');
  setTimeout(() => {
  document.getElementById('panel-content').innerHTML = `
    ${layerId !== 'survey' ? `<p><strong>${config.label}:</strong> ${value ?? 'No data for this period'}</p>` : ''}
    ${header}
  `;
    document.body.classList.add('panel-open');
    panel.style.display = 'block';
    panel.classList.remove('refreshing'); 
  }, 150);
}

function closeRightPanel() {
  document.body.classList.remove('panel-open');
  selectedFeatureId = null;
  deckGL.setProps({ layers: getLayers() });
}

function refreshPanelIfOpen() {
  if (currentProps && currentLayerId && document.body.classList.contains('panel-open')) {
    renderPanel(currentProps, currentLayerId);
  }
}

//graduation color
function getColorScale(value, min, max, baseColor) {
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

document.querySelectorAll('#mode-toggles .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
    activeMode = btn.value;
    document.querySelectorAll('#mode-toggles .toggle-btn').forEach(b => {
        b.classList.remove('active');
        b.style.removeProperty('--active-color');
    });
    btn.classList.add('active');
    btn.style.setProperty('--active-color', modeConfig[activeMode].colorTelraam);

    deckGL.setProps({ layers: getLayers() }); 
    if (currentProps) renderPanel(currentProps, currentLayerId);
    });
});

//for the month scale
document.addEventListener('DOMContentLoaded', () => {
    const defaultBtnTelraam = document.querySelector('#mode-toggles-tel .toggle-btn[value="bike"]');
  defaultBtnTelraam.classList.add('active');
  defaultBtnTelraam.style.setProperty('--active-color', modeConfig['bike'].colorTelraam);

  const defaultBtnVerkehr = document.querySelector('#mode-toggles-ver .toggle-btn[value="bike"]');
  defaultBtnVerkehr.classList.add('active');
  defaultBtnVerkehr.style.setProperty('--active-color', modeConfig['bike'].colorVerkehr);

  updateLegend('telraam');
  updateLegend('verkehrsmengen');
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


document.getElementById('collapse-btn').addEventListener('click', () => {
  document.body.classList.toggle('panel-collapsed');
});

document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    header.parentElement.classList.toggle('collapsed');
  });
});

document.getElementById('toggle-telraam').addEventListener('change', (e) => {
  document.querySelectorAll('#mode-toggles-tel .toggle-btn').forEach(btn => {
    btn.disabled = !e.target.checked;
  });

  document.getElementById('legend-tel').style.display = e.target.checked ? 'block' : 'none';
  updateLegend('telraam'); 
  deckGL.setProps({ layers: getLayers() });
});

document.getElementById('toggle-verkehrsmengen').addEventListener('change', (e) => {
  const buttons = document.querySelectorAll('#mode-toggles-ver .toggle-btn');
  buttons.forEach(btn => {
    btn.disabled = !e.target.checked;
    
  });


document.getElementById('legend-ver').style.display = e.target.checked ? 'block' : 'none';
updateLegend('verkehrsmengen');
  deckGL.setProps({ layers: getLayers() });
});


document.getElementById('toggle-survey').addEventListener('change', (e) => {
  const buttons = document.querySelectorAll('#mode-toggles-survey .toggle-btn');
  buttons.forEach(btn => {
    btn.disabled = !e.target.checked;
  });
  deckGL.setProps({ layers: getLayers() });
});

  document.querySelectorAll('#mode-toggles-ver .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeModeVerkehr = btn.value;
      document.querySelectorAll('#mode-toggles-ver .toggle-btn').forEach(b => {
        b.classList.remove('active');
        b.style.removeProperty('--active-color');
      });
      btn.classList.add('active');
      btn.style.setProperty('--active-color', modeConfig[activeModeVerkehr].colorVerkehr);
      deckGL.setProps({ layers: getLayers() });
      updateLegend('verkehrsmengen');
      if (currentProps) renderPanel(currentProps, currentLayerId);
    });
  });

});

document.addEventListener('click', (e) => {
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
});

document.addEventListener('DOMContentLoaded', () => {
  const allChecked = document.getElementById('toggle-survey').checked;
  document.querySelectorAll('[id^="toggle-topic_"]').forEach(cb => {
    cb.disabled = !allChecked;
  });
});


//for highest values in heavy to avoid outliners 
function getPercentile(values, p) {
  const sorted = [...values].filter(v => v != null).sort((a, b) => a - b);
  const index = Math.floor((p / 100) * sorted.length);
  return sorted[index];
}

//tooltip
function getTooltip({ object, layer }) {
  
  if (!object || currentZoom < 12) return null;
  const props = object.properties;
  const layerId = layer.id;

  currentLayerId = layerId;

  const configTel = modeConfig[activeModeTelraam];
  const configVer = modeConfig[activeModeVerkehr];
  const configSur = modeConfig[activeModeSurvey];

  const valuetel = getAveragedValue(props, configTel.telraam);
  const value_ver = props[configVer.verkehr];
  const observation = props.observation_clean;
  const theme = props.suggestion_clean;

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


document.addEventListener('DOMContentLoaded', () => {
  highlightRange();

  document.querySelectorAll('.tick, .month').forEach(el => {
    el.addEventListener('click', () => {
      const month = el.dataset.month;

      if (rangeEnd !== null) {
        // already had a range — start fresh
        rangeStart = month;
        rangeEnd = null;
      } else if (month === rangeStart) {
        // clicking same month again does nothing
        return;
      } else {
        // set the end of the range (order doesn't matter, so sort them)
        const months = getAllMonthsInOrder();
        const i1 = months.indexOf(rangeStart);
        const i2 = months.indexOf(month);
        if (i2 > i1) {
          rangeEnd = month;
        } else {
          rangeEnd = rangeStart;
          rangeStart = month;
        }
      }

      highlightRange();
      deckGL.setProps({ layers: getLayers() });
      if (currentProps) renderPanel(currentProps, currentLayerId);
       refreshPanelIfOpen();
    });
  });
});

function getAllMonthsInOrder() {
  return Array.from(document.querySelectorAll('.month')).map(el => el.dataset.month);
}

function highlightRange() {
  document.querySelectorAll('.tick, .month').forEach(e => e.classList.remove('active'));
  const months = getAllMonthsInOrder();
  const i1 = months.indexOf(rangeStart);
  const i2 = rangeEnd ? months.indexOf(rangeEnd) : i1;
  for (let i = i1; i <= i2; i++) {
    document.querySelectorAll(`[data-month="${months[i]}"]`).forEach(e => e.classList.add('active'));
  }
}

function getActiveMonths() {
  const months = getAllMonthsInOrder();
  const i1 = months.indexOf(rangeStart);
  const i2 = rangeEnd ? months.indexOf(rangeEnd) : i1;
  return months.slice(i1, i2 + 1);
}

//new calculation adapted to new months
function getAveragedValue(props, baseField) {
  const months = getActiveMonths();
  const values = months
    .map(m => props[`${baseField}_${m}`])
    .filter(v => v !== null && v !== undefined);
    //console.log('months in range:', months.length, 'months with data:', values.length, 'values:', values);
  if (values.length === 0) return null;
   return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

//legend bar update
function updateLegend(layerType) {
  const isTel = layerType === 'telraam';
  const mode = isTel ? activeModeTelraam : activeModeVerkehr;
  const config = modeConfig[mode];
  const baseColor = isTel ? config.colorTelraam : config.colorVerkehr;
  const [min, max] = isTel ? config.rangeTelraam : config.rangeVerkehr;

  const bar = document.getElementById(isTel ? 'legend-bar-tel' : 'legend-bar-ver');
  const lightColor = `rgb(${getColorScale(min, min, max, baseColor).slice(0,3).join(',')})`;
  const darkColor = `rgb(${getColorScale(max, min, max, baseColor).slice(0,3).join(',')})`;

  if (isTel) {
    bar.style.background = `linear-gradient(to right, ${lightColor}, ${darkColor})`;
  } else {
    bar.style.background = `linear-gradient(to right, ${lightColor}, ${darkColor})`;
  }

  document.getElementById(isTel ? 'legend-min-tel' : 'legend-min-ver').textContent = min;
  document.getElementById(isTel ? 'legend-max-tel' : 'legend-max-ver').textContent = max;
}

// for numbers in the linestring 
function getLineMidpoint(geometry) {
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

function getLineAngle(geometry) {
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

function getLabelData(data, baseField, isTel) {
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

function isTopicVisible(props) {
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

//zoom buttons 
function zoomBy(delta) {
  currentViewState = {
    ...currentViewState,
    zoom: currentViewState.zoom + delta,
    transitionDuration: 200
  };
  deckGL.setProps({ viewState: currentViewState });
}

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

    // center it: offset minus half the container's width, plus half the tick's width
    container.scrollLeft = offset - container.clientWidth / 2 + activeTick.clientWidth / 2;
  }
});