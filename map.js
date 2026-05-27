const {DeckGL, GeoJsonLayer} = deck;
let currentZoom = 11;
const deckGL = new DeckGL({
      container: 'map',
    //   mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
       // mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        //mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        mapStyle: 'https://tiles.openfreemap.org/styles/bright',
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
                    
                    <p>Cars: ${props.mean_car}</p>
                    <p>Heavy: ${props.mean_heavy}</p>
                    <p>Bikes: ${props.mean_bike}</p>
                    <p>Pedestrians: ${props.mean_ped}</p>
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
              if (info.object) {
            console.log(info.object.properties);
            const props = info.object.properties;
            const panel = document.getElementById('right-panel');
            panel.style.display = 'block';
            const layerId = info.layer.id;
    
            
            if (layerId === 'telraam') {
                document.body.classList.add('panel-open');
            document.getElementById('right-panel').style.display = 'block';
        
            document.getElementById('panel-content').innerHTML = `
            <p><strong>Segment:</strong> ${props.segment_id}</p>
            <p><strong>Street:</strong> ${props.osm}</p>
            <p><strong>Cars:</strong> ${props.mean_car}</p>
            <p><strong>Heavy:</strong> ${props.mean_heavy}</p>
            <p><strong>Bikes:</strong> ${props.mean_bike}</p>
            <p><strong>Pedestrians:</strong> ${props.mean_ped}</p>
            `;

            } else if (layerId === 'verkehrsmengen') {
                document.body.classList.add('panel-open');
                document.getElementById('right-panel').style.display = 'block';
                document.getElementById('panel-content').innerHTML = `
                <p><strong>Id: </strong> ${props.link_id}</p>
                <p><strong>Street: </strong> ${props.str_name}</p>
                <p><strong>Cars: </strong> ${props.dtvw_kfz}</p>
                <p><strong>Heavy: </strong> ${props.dtvw_lkw}</p>
                <p><strong>Bikes: </strong> ${props.dtvw_rad}</p>
                `;

            }           
            }
        },
          
      layers: [
        new GeoJsonLayer({
          id: 'telraam',
          data: 'data/telraam_segments_merge_2023.geojson',
          getLineColor: [0, 128, 255],
          lineWidthMinPixels: 2,
          getLineWidth: 3,
          pickable: true, 
         
        }),
        new GeoJsonLayer({
            id: 'verkehrsmengen',
            data: 'data/all_verkehrsmengen_2023.geojson',
            getLineColor: [255, 0, 0, 150],
            lineWidthMinPixels: 2,
            getLineWidth: 3,
            pickable: true,
        })
      ]
    });


    document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('right-panel').style.display = 'none';
  document.body.classList.remove('panel-open');
});

    document.addEventListener('click', (event) => {
        const panel_verkehr = document.getElementById('check-verkehrsmengen');
        const panel_telraam = document.getElementById('check-telraam');

        if (event.target === panel_verkehr) {
            const layers = deckGL.props.layers;
            const verkehrsmengenLayer = layers.find(
            layer => layer.id === 'verkehrsmengen'
            );
            if (verkehrsmengenLayer) {
                const updatedLayer = verkehrsmengenLayer.clone({
                visible: !verkehrsmengenLayer.props.visible
                });
                deckGL.setProps({
                layers: layers.map(layer =>
                    layer.id === 'verkehrsmengen'
                        ? updatedLayer
                        : layer
                )
                });
            }
        }
        else if (event.target === panel_telraam) {
            const layers = deckGL.props.layers;
            const telraamLayer = layers.find(
                layer => layer.id === 'telraam'
            );
            if (telraamLayer) {
                const updatedLayer = telraamLayer.clone({
                    visible: !telraamLayer.props.visible
                });
                deckGL.setProps({
                    layers: layers.map(layer =>
                        layer.id === 'telraam'
                        ? updatedLayer
                        : layer
                    )
                });
                }
            }
    
    })
