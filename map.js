const {DeckGL, GeoJsonLayer} = deck;
let currentZoom = 11;
let currentProps = null;
let activeMode = 'bike';
let activeMonth = '2025_01';
let rangeStart = '2025_01';
let rangeEnd = null; 

let activeModeTelraam = 'bike';
let activeModeVerkehr = 'bike';


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
    //console.log('telraam visible:', telraamVisible, 'verkehr visible:', verkehrVisible);
  return [
    new GeoJsonLayer({
      id: 'telraam',
      data: 'data/tel_all_years.geojson',
      getLineColor: (feature) => {
        const value = getAveragedValue(feature.properties, modeConfig[activeModeTelraam].telraam); 
        
        const [min, max] = modeConfig[activeModeTelraam].rangeTelraam;
        const color_tel = getColorScale(value, min, max, modeConfig[activeModeTelraam].colorTelraam);
         // console.log('INITIAL LOAD - field:', field, 'value:', value, 'color:', color);
        return color_tel;
        
        },
        // getLineWidth: (feature) => {
        //     const value = getAveragedValue(feature.properties, modeConfig[activeModeTelraam].telraam);
        //     const [min, max] = modeConfig[activeModeTelraam].rangeTelraam;
        //     const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
        //     return 2 + t * 8; 
        //     },
      updateTriggers: {
        getLineColor: [activeModeTelraam, rangeStart, rangeEnd],
       
      },
      lineWidthMinPixels: 4,
  
      pickable: true,
      visible: telraamVisible,
    }),
    new GeoJsonLayer({
            id: 'verkehrsmengen',
            data: 'data/all_verkehrsmengen_2023.geojson',
            getLineColor: (feature) => {
              //console.log('activeMode:', activeMode, 'verkehr key:', modeConfig[activeMode].verkehr);
              const field = modeConfig[activeModeVerkehr].verkehr;
              const value = feature.properties[field];
              const threshold = modeConfig[activeModeVerkehr].zoomThreshold;
             const rank_street = feature.properties['strklasse1'];
            // console.log('rank_street:', rank_street);
               if (currentZoom < 12 && rank_street > threshold) {
               // console.log(currentZoom);
               
                    return [0, 0, 0, 0];
                     console.log( 'rank_street:', rank_street = 'III', FALSE);
                }

              const [min, max] = modeConfig[activeModeVerkehr].rangeVerkehr;
              const color_ver = getColorScale(value, min, max, modeConfig[activeModeVerkehr].colorVerkehr);
              //console.log('verkehr value:', value, 'color:', color);
              return color_ver;
            },
            // getLineWidth: (feature) => {
            // const value = feature.properties[modeConfig[activeModeVerkehr].verkehr];
           
            // const [min, max] = modeConfig[activeModeVerkehr].rangeVerkehr;
            // let t = Math.max(0, Math.min(1, (value - min) / (max - min)));
            // t = Math.pow(t, 0.5); 
            // return 2 + t * 12; 
            // },
            updateTriggers: {
              getLineColor: [activeModeVerkehr, currentZoom],

            },
            lineWidthMinPixels: 3,
            pickable: true,
            visible: verkehrVisible,
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
  //const value = layerId === 'telraam' ? props[config.telraam] : props[config.verkehr];

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
    panel.classList.remove('refreshing'); // fade back in
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

//toggle 
//  document.getElementById('toggle-telraam').addEventListener('change', (e) => {
//     document.querySelectorAll('#mode-toggles-tel .toggle-btn').forEach(btn => {
//     btn.disabled = !e.target.checked;
//   });
//   deckGL.setProps({ layers: getLayers() });
// });

// document.getElementById('toggle-verkehrsmengen').addEventListener('change', (e) => {
//   document.querySelectorAll('#mode-toggles-ver .toggle-btn').forEach(btn => {
//     btn.disabled = !e.target.checked;
//   });
//   deckGL.setProps({ layers: getLayers() });
// });

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
    if (!object || currentZoom < 12) return null;
    const config = modeConfig[activeModeVerkehr];
    const props = object.properties;
    const layerId = layer.id;

    //currentProps = props;
    currentLayerId = layerId;

    const valuetel = getAveragedValue(props, modeConfig[activeModeTelraam].telraam);
    const value_ver = props[modeConfig[activeModeVerkehr].verkehr];
    switch (layer.id) {

        case 'telraam':
            return {
                html: `
                    <p>${config.telraam}:  ${valuetel ?? '—'}</p> `
                };
        case 'verkehrsmengen':
            return {
                html: `
                    <p>${config.verkehr}: ${value_ver ?? '—'}</p> `
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
  bar.style.background = `linear-gradient(to right, ${lightColor}, ${darkColor})`;

  document.getElementById(isTel ? 'legend-min-tel' : 'legend-min-ver').textContent = min;
  document.getElementById(isTel ? 'legend-max-tel' : 'legend-max-ver').textContent = max;
}


const deckGL = new DeckGL({
      container: 'map',
      //mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
       //mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      // mapStyle: 'https://tiles.openfreemap.org/styles/bright',
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
               
   // layers: getLayers()
      
    }); 
  document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('right-panel').style.display = 'none';
  document.body.classList.remove('panel-open');
});

