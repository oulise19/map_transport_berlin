// All data loaded here 
//If you want to modify the data change the name of the file inside fetch

import {telraamData, verkehrData, surveydata, setTelraamData, setVerkehrData, setSurveyData } from "./state.js";

export async function loadData() {
  const [telRes, verRes, surRes] = await Promise.all([
    fetch('data/tel_all_years.geojson'),
    fetch('data/all_verkehrsmengen_2023_new.geojson'),
    fetch('data/sites_mit_demographics_bereinigt_v2.geojson'),
  
  ]);
//   telraamData = await telRes.json();
//   verkehrData = await verRes.json();
//   surveydata = await surRes.json();

  setTelraamData(await telRes.json());
  setVerkehrData(await verRes.json());
  setSurveyData(await surRes.json());
}