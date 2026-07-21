//Static values that never change while the app run 
//You can modify the colors of each layer, the level of zoom, name of labels and framing (longitude, latitude)


//definition of deck
export const {DeckGL, GeoJsonLayer} = deck;

//default Zoom and default framing
export let currentViewState = {
  longitude: 13.43,
  latitude: 52.52,
  zoom: 11.5
};
export const INITIAL_VIEW_STATE = { ...currentViewState };

export function setCurrentViewState(viewState) {
  currentViewState = viewState;
}

//Definition of quantitative data using the variable name
export const modeConfig = {
  'bike': {
    telraam: 'bike_total', verkehr: 'dtvw_rad', label: 'Bikes',
    colorTelraam: '#e844e8', colorVerkehr: '#c9530f',
    rangeTelraam: [3, 5663],
    rangeVerkehr: [10, 8900], zoomThreshold : 'II',
  },
  'car': {
    telraam: 'car_total', verkehr: 'dtw_kfz_new', label: 'Cars',
    colorTelraam: '#b91bbe', colorVerkehr: '#d67405',
    rangeTelraam: [0.0, 25073],
    rangeVerkehr: [90, 63850], zoomThreshold : 'II',
  },
  'heavy': {
    telraam: 'heavy_total', verkehr: 'dtvw_lkw', label: 'Heavy',
    colorTelraam: '#801062', colorVerkehr: '#fe5b09',
    rangeTelraam: [1, 5520],
    rangeVerkehr: [10, 3000 ], zoomThreshold : 'II',
  }
};

//using the variable name from data/sites_mit_demographics_bereinigt_v2.geojson
//in case they change, modify here to have the good definiton 
export const justiceColorMap = {
  "very just": [46, 125, 50, 255],       // green
  "somewhat just": [139, 195, 74, 255],  // light green
  "neither": [255, 235, 59, 255],        // yellow
  "somewhat unjust": [255, 152, 0, 255], // orange
  "very unjust": [229, 57, 53, 255]      // red
};