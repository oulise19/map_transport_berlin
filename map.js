const {DeckGL, GeoJsonLayer} = deck;
let currentZoom = 11;
let currentProps = null;
let activeMode = 'bike';
let activeMonth = '2025_01';
let rangeStart = '2025_01';
let rangeEnd = null; 

let activeModeTelraam = 'bike';
let activeModeVerkehr = 'bike';

let telraamData = null;
let verkehrData = null;
let deckGL;

async function loadData() {
  const [telRes, verRes, surRes] = await Promise.all([
    fetch('data/tel_all_years.geojson'),
    fetch('data/all_verkehrsmengen_2023.geojson'),
    fetch('data/sites_mit_demographics_bereinigt.geojson'),
  
  ]);
  telraamData = await telRes.json();
  verkehrData = await verRes.json();
  surveydata = await surRes.json();
}

loadData().then(() => {
  deckGL = new deck.DeckGL({
    container: 'map',
        mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        initialViewState: {
            longitude: 13.4,
            latitude: 52.52,
            zoom: 11
        },
        controller: true,
        pickingRadius: 10,
        onViewStateChange: ({viewState}) => {
        currentZoom = viewState.zoom;
        deckGL.setProps({ layers: getLayers() });
        },
        onClick: (info) => {
        if (!info.object) return;
        const layerId = info.layer.id;
        console.log(info.object.properties);
        const layerToggle = document.getElementById(`toggle-${layerId}`);
        if (layerToggle && !layerToggle.checked) return; 

        renderPanel(info.object.properties, layerId);
        },
        getTooltip: getTooltip,
        layers: getLayers()     
    }); 
  document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('right-panel').style.display = 'none';
  document.body.classList.remove('panel-open');

  });
});
const modeConfig = {
  'bike': {
    telraam: 'bike_total', verkehr: 'dtvw_rad', label: 'Bikes',
    colorTelraam: '#e844e8', colorVerkehr: '#e6611f',
    rangeTelraam: [0.0, 4167.1],
    rangeVerkehr: [210, 8900], zoomThreshold : 'II',
  },
  'car': {
    telraam: 'car_total', verkehr: 'dtvw_kfz', label: 'Cars',
    colorTelraam: '#b91bbe', colorVerkehr: '#c46a04',
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


function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1,3), 16),
    parseInt(hex.slice(3,5), 16),
    parseInt(hex.slice(5,7), 16)
  ];
}

function getLayers() {
    //console.log('initial activeMonth:', activeMonth)
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
      updateTriggers: {
      getLineColor: [activeModeTelraam, rangeStart, rangeEnd], 
      },
      lineWidthMinPixels: 4,
      pickable: true,
      visible: telraamVisible,
    }),
    new GeoJsonLayer({
            id: 'verkehrsmengen',
            data: verkehrData,
            getLineColor: (feature) => {
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
            updateTriggers: {
              getLineColor: [activeModeVerkehr, currentZoom],
            },
            lineWidthMinPixels: 3,
            pickable: true,
            visible: verkehrVisible,
    }),
    new GeoJsonLayer({
      id: 'survey',
      data: surveydata, 
      visible: surveyVisible,
       pointType: 'circle',
      getPointRadius: 20,
      pointRadiusMinPixels: 5,
      getFillColor: [227, 34, 34, 200],
      pickable: true,
    }),
    new deck.TextLayer({
      id: 'telraam-labels',
      data: getLabelData(telraamData, modeConfig[activeModeTelraam].telraam, true),
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 9,
      getAngle: d => d.angle,
      getColor: [0, 0, 0, 255],
      visible: currentZoom >= 14.7 && document.getElementById('toggle-telraam').checked,
    }),
    new deck.TextLayer({
      id: 'verkehr-labels',
      data: getLabelData(verkehrData, modeConfig[activeModeVerkehr].verkehr, false),
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 9,
      getAngle: d => d.angle,
      getColor: [0, 0, 0, 255],
      visible: currentZoom >= 14.7 && document.getElementById('toggle-verkehrsmengen').checked,
    }),
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

function renderPanel(props, layerId) {
  currentProps = props;
  currentLayerId = layerId;
  const config = modeConfig[activeMode];
  const value = layerId === 'telraam' ? getAveragedValue(props, config.telraam) : props[config.verkehr];


  const header = layerId === 'telraam'
    ? `<p><strong>Segment:</strong> ${props.segment_id}</p>
       <p><strong>Street:</strong> ${props.osm}</p>`
    : `<p><strong>Id:</strong> ${props.link_id}</p>
       <p><strong>Street:</strong> ${props.str_name}</p>`;

  document.body.classList.add('panel-open');
  document.getElementById('right-panel').style.display = 'block';
  document.getElementById('panel-content').innerHTML = `
    ${header}
    <p><strong>${config.label}:</strong> ${value ?? '—'}</p>
  `;
 const panel = document.getElementById('right-panel');
  
  panel.classList.add('refreshing'); // fade out

  setTimeout(() => {
    document.getElementById('panel-content').innerHTML = `
      ${header}
      <p><strong>${config.label}:</strong> ${value ?? '—'}</p>
    `;
    document.body.classList.add('panel-open');
    panel.style.display = 'block';
    panel.classList.remove('refreshing'); 
  }, 150);
}

//graduation color
function getColorScale(value, min, max, baseColor) {
  if (value === null || value === undefined) return [160, 160, 160, 255];
  
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

document.getElementById('toggle-telraam').addEventListener('change', (e) => {
  document.querySelectorAll('#mode-toggles-tel .toggle-btn').forEach(btn => {
    btn.disabled = !e.target.checked;
  });

  document.getElementById('legend-tel').style.display = e.target.checked ? 'block' : 'none';
  updateLegend('telraam'); 
  deckGL.setProps({ layers: getLayers() });
});

document.getElementById('toggle-verkehrsmengen').addEventListener('change', (e) => {
  const buttons = document.querySelectorAll('#mode-toggles-verkehr .toggle-btn');
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

//for highest values in heavy to avoid outliners 
function getPercentile(values, p) {
  const sorted = [...values].filter(v => v != null).sort((a, b) => a - b);
  const index = Math.floor((p / 100) * sorted.length);
  return sorted[index];
}

function getTooltip({ object, layer }) {
  //console.log('getTooltip called', object, layer);
  if (!object || currentZoom < 12) return null;
  const props = object.properties;
  const layerId = layer.id;

  currentLayerId = layerId;

  const configTel = modeConfig[activeModeTelraam];
  const configVer = modeConfig[activeModeVerkehr];

  const valuetel = getAveragedValue(props, configTel.telraam);
  const value_ver = props[configVer.verkehr];

  switch (layer.id) {
    case 'telraam':
      return {
        html: `<p>${configTel.label}: ${valuetel ?? '—'}</p>`
      };
    case 'verkehrsmengen':
      return {
        html: `<p>${configVer.label}: ${value_ver ?? '—'}</p>`
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
    bar.style.background = `linear-gradient(to right, rgb(160,160,160) 0%, rgb(160,160,160) 8%, ${lightColor} 12%, ${darkColor} 100%)`;
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


