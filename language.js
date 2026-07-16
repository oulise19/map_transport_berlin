const translations = {
    'title': {
    en: `Information on data used`,
    de: `Informationen zu den verwendeten Daten`
    },
  'datenquellen-heading': {
    en: `Data sources`,
    de: `Datenquellen`
  },
  intro: {
    en: `In this visualization, we present data from different sources. The Geoportal data comes from the Geoportal of Berlin. No processing was applied to it, except for car traffic, which was calculated by subtracting <code>dtvw_lkw</code> (heavy vehicles only) from <code>dtvw_kfz</code> (all vehicles).`,
    de: `In dieser Visualisierung präsentieren wir Daten aus verschiedenen Quellen. Die Geoportal-Daten stammen vom Geoportal Berlin. Es wurde keine Verarbeitung angewendet, außer für den Autoverkehr, der berechnet wurde, indem <code>dtvw_lkw</code> (nur schwere Fahrzeuge) von <code>dtvw_kfz</code> (alle Fahrzeuge) subtrahiert wurde.`
  }, 
  intro2: {
    en:`The second dataset comes from the Telraam platform, which uses sensors to collect counts of cyclists, pedestrians, cars, and heavy vehicles. 
        This data is accessible via an API or the <a href="http://www.berlin-zaehlt.de/">Berlin Zählt 
          Mobilität website</a>, 
        though only as raw hourly counts. This required processing to make it appear on the map.
      The last data source is a survey conducted by students from Humboldt University Berlin.`,
      de:`Der zweite Datensatz stammt von der Telraam-Plattform, 
      die Sensoren verwendet, um Zählungen von Radfahrern, Fußgängern, 
      Autos und schweren Fahrzeugen zu erfassen. Diese Daten sind über 
      eine API oder die <a href="http://www.berlin-zaehlt.de/">Berlin Zählt</a>. Allerdings nur als Rohdaten in Form von stündlichen Zählwerten. Um sie auf der Karte darzustellen, mussten sie daher aufbereitet werden. Die endgültige Datenquelle 
      ist eine von Studierenden der Humboldt-Universität zu Berlin durchgeführte Erhebung.`,
  }
};

function setLanguage(lang) {
  Object.keys(translations).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = translations[id][lang];
  });
}

document.querySelectorAll('.lang-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-toggle button').forEach(b =>
      b.classList.toggle('active', b === btn)
    );
    setLanguage(btn.dataset.lang);
  });
});

setLanguage('en'); // set initial language on page load