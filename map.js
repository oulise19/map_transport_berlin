const {DeckGL, GeoJsonLayer} = deck;
let currentZoom = 11;
let currentProps = null;
let activeMode = 'bike';
const modeConfig = {
  'bike': {
    telraam: 'bike_total', verkehr: 'dtvw_rad', label: 'Bikes',
    colorTelraam: '#208d27', colorVerkehr: '#6bd72d',
    rangeTelraam: [0.0, 4167.1],
    rangeVerkehr: [210, 8900]
  },
  'car': {
    telraam: 'car_total', verkehr: 'dtvw_kfz', label: 'Cars',
    colorTelraam: '#106ba0', colorVerkehr: '#1686cb',
    rangeTelraam: [0.0, 10822.3],
    rangeVerkehr: [0, 65000]
  },
  'heavy': {
    telraam: 'heavy_total', verkehr: 'dtvw_lkw', label: 'Heavy',
    colorTelraam: '#cba53b', colorVerkehr: '#fe8b09',
    rangeTelraam: [100, 2073.2],
    rangeVerkehr: [100, 1310.0]
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
  

  return [
    new GeoJsonLayer({
      id: 'telraam',
      data: 'data/all_tel_2024.geojson',
      getLineColor: (feature) => {
       
        const value = feature.properties[modeConfig[activeMode].telraam];
        
        const [min, max] = modeConfig[activeMode].rangeTelraam;
        const color = getColorScale(value, min, max, modeConfig[activeMode].colorTelraam);
        if (feature.properties.segment_id === /* any id you know */ '1234') {
            console.log('color result:', color);
        }
        
        return color;
        
            },
      updateTriggers: {
        getLineColor: [activeMode] 
      },
      lineWidthMinPixels: 2,
      getLineWidth: 3,
      pickable: true,
      visible: true,
    }),
    new GeoJsonLayer({
            id: 'verkehrsmengen',
            data: 'data/all_verkehrsmengen_2023.geojson',
            getLineColor: (feature) => {
              const value = feature.properties[modeConfig[activeMode].verkehr];
              const [min, max] = modeConfig[activeMode].rangeVerkehr;
              const color = getColorScale(value, min, max, modeConfig[activeMode].colorVerkehr);
              if (feature.properties.segment_id === /* any id you know */ '1234') {
                console.log('color result:', color);
              }
              return color;
            },
            updateTriggers: {
              getLineColor: [activeMode] 
            },
            lineWidthMinPixels: 2,
            getLineWidth: 3,
            pickable: true,
            visible: true,
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

    deckGL.setProps({ layers: getLayers() }); // ← updates road color
    if (currentProps) renderPanel(currentProps, currentLayerId);
    });
});

function renderPanel(props, layerId) {
  currentProps = props;
  currentLayerId = layerId;
  const config = modeConfig[activeMode];

  const value = layerId === 'telraam' ? props[config.telraam] : props[config.verkehr];

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

function getColorScale(value, min, max, baseColor) {
  if (value === null || value === undefined) return [160, 160, 160, 255];
  
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const [r, g, b] = hexToRgb(baseColor);

  return [
    Math.round(255 - t * (255 - r * 0.5)),
    Math.round(255 - t * (255 - g * 0.5)),
    Math.round(255 - t * (255 - b * 0.5)),
    255  
  ];
}


  document.getElementById('toggle-verkehrsmengen').addEventListener('change', (e) => {
  const layers = deckGL.props.layers;
  const updated = layers.map(layer =>
    layer.id === 'verkehrsmengen'
      ? layer.clone({ visible: e.target.checked })
      : layer
  );
  deckGL.setProps({ layers: updated });
});

document.getElementById('toggle-telraam').addEventListener('change', (e) => {
  const layers = deckGL.props.layers;
  const updated = layers.map(layer =>
    layer.id === 'telraam'
      ? layer.clone({ visible: e.target.checked })
      : layer
  );
  deckGL.setProps({ layers: updated });
});

//for highest values in heavy to avoid outliners 
function getPercentile(values, p) {
  const sorted = [...values].filter(v => v != null).sort((a, b) => a - b);
  const index = Math.floor((p / 100) * sorted.length);
  return sorted[index];
}


const deckGL = new DeckGL({
      container: 'map',
      mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
       // mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        //mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
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
        //console.log(currentZoom);
        },
        getTooltip: ({object, layer}) => {
        
        if (!object || currentZoom < 12) return null;
        
        const props = object.properties;
        const layerId = layer.id;

            if (layerId === 'telraam') {
                return {
                html: `
                    
                    <p>Cars: ${props.car_total}</p>
                    <p>Heavy: ${props.heavy_total}</p>
                    <p>Bikes: ${props.bike_total}</p>
                    <p>Pedestrians: ${props.ped_total}</p>
                `
                };
            }
            else if (layerId === 'verkehrsmengen') {
                return {
                    html: `
                    <p>Cars : ${props.dtvw_kfz}</p>
                    <p>Heavy: ${props.dtvw_lkw}</p>
                    <p>Bikes: ${props.dtvw_rad}</p>
                    `
                    }
            }

        },
        
        onClick: (info) => {
        if (!info.object) return;
        const layerId = info.layer.id;
        console.log(info.object.properties);
        const layerToggle = document.getElementById(`toggle-${layerId}`);
        if (layerToggle && !layerToggle.checked) return; // ignore click if layer is off

        renderPanel(info.object.properties, layerId);
        },
               
    layers: getLayers()
      
    }); 
  document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('right-panel').style.display = 'none';
  document.body.classList.remove('panel-open');
});

