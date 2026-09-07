/**
 * All data loaded here  
 * If you want to modify the data change the name of the file inside fetch

 * @author Louise ALEX
 * @date 2026-07-28
 */

import {telraamData, verkehrData, surveydata, setTelraamData, setVerkehrData, setSurveyData } from "./state.js";
import { SURVEY_DATA_FILE } from "./config.js";
// export async function loadData() {
//   const [telRes, verRes, surRes] = await Promise.all([
//     fetch('data/tel_all_years.geojson'),
//     fetch('data/all_verkehrsmengen_2023_new.geojson'),
//     fetch('data/sites_mit_demographics_bereinigt_v2.geojson'),
  
//   ]);
//   setTelraamData(await telRes.json());
//   setVerkehrData(await verRes.json());
//   setSurveyData(await surRes.json());
// }


export async function loadData() {
  const [telRes, verRes] = await Promise.all([
    fetch('data/tel_all_years.geojson'),
    fetch('data/all_verkehrsmengen_2023_new.geojson'),
  ]);
  setTelraamData(await telRes.json());
  setVerkehrData(await verRes.json());

  try {
    const surRes = await fetch(`data/${SURVEY_DATA_FILE}`);

    if (!surRes.ok) {
      throw new Error(`Could not load survey data file "${SURVEY_DATA_FILE}" (HTTP ${surRes.status}). ` +
    `Check that the file exists in /data and the filename in config.js ('${SURVEY_DATA_FILE}') matches exactly.`);
    }

   const surData = await surRes.json();

   const requiredProps = ['observation_clean', 'suggestion_clean'];

    for (const feature of surData.features) {
      const props = feature.properties || {};
      for (const name of requiredProps) {
        if (!(name in props)) {
          throw new Error(`Property "${name}" not found in survey file — check the column name.`);
        }
      }
    }
  setSurveyData(surData);
    console.log('Anzahl Features:', surData.features.length);
console.log('Spalten:', Object.keys(surData.features[0].properties));
    const f = surData.features[0];
console.log('geometry:', f.geometry);
console.log('mit gültiger geometry:',
  surData.features.filter(x => x.geometry && x.geometry.coordinates).length,
  'von', surData.features.length);
console.log('topic_noise Wert/Typ:', f.properties.topic_noise, typeof f.properties.topic_noise);

  } catch (err) {
    console.error('Failed to load survey data:', err);
    setSurveyData(null); // or an empty geojson: { type: 'FeatureCollection', features: [] }
  }
}
