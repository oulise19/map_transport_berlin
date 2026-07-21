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
  },
  'title2': {
    en:`Processing methodology`,
    de: `Verarbeitungsmethodik`,
  }, 
  'para2': {
    en:`To bring Telraam data closer to this metric, we processed the raw counts by calculating the average number of vehicles and cyclists per segment on a typical weekday. This was done in Python using Pandas — grouping by segment, weekday, and hour, then averaging.`,
    de:`Um die Telraam-Daten besser an diese Kennzahl anzupassen, haben wir die Rohdaten so aufbereitet, dass wir die durchschnittliche Anzahl an Fahrzeugen und Radfahrern pro Segment an einem typischen Wochentag ermittelt haben. Dies erfolgte in Python unter Verwendung von Pandas – dabei wurden die Daten nach Segment, Wochentag und Stunde gruppiert und anschließend der Durchschnitt berechnet.`,
  },
  'para3':{
    en: `Public holidays were excluded using the <code>holidays</code> library. 
        School holidays, which have no equivalent library, were excluded manually using dates 
        from the <a href="#">Official Berlin website</a>. You can find the detailed processing 
        steps and our pipeline in the <a href="https://github.com/oulise19/teleraam-data.git">
        GitHub repository</a>. `,
    de:` Feiertage wurden mithilfe der Feiertagsbibliothek (<code>holidays</code>) ausgeschlossen.
    Schulferien, für die es keine Entsprechung in der Bibliothek gibt, wurden manuell anhand der Daten
        von der <a href=""#>Offiziellen Berliner Website</a> ausgeschlossen. Die detaillierten Verarbeitungsschritte und unsere Pipeline finden Sie im 
        <a href="https://github.com/berlin-zaehlt/traffic-data-processing">GitHub-Repository</a>.`,
  },
  'title3': {
    en: `Limitations for Telraam data`,
    de: `Einschränkungen für Telraam-Daten`,
  },
  'para4': {
    en: `The Telraam data has been processed into a standardized format that is
        better suited for visualization alongside the Geoportal data on the map.
        However it's still not as comprehensive. It only covers segments with installed sensors, 
        and may vary due to sensor placement and calibration. It should be interpreted with 
        caution.`,
    de: `Die Telraam-Daten wurden in ein standardisiertes Format umgewandelt, das
        sich besser für die Visualisierung zusammen mit den Geoportal-Daten auf der Karte eignet.
        Allerdings sind sie nach wie vor nicht so umfassend. Sie decken nur Abschnitte mit installierten Sensoren ab
        und können je nach Sensorplatzierung und Kalibrierung Abweichungen aufweisen. Sie sollten daher mit
        Vorsicht interpretiert werden.`,
  },
  'title4':{
    en: `Survey`,
    de:`Umfrage`
  },
  'para5': {
    en: `The survey was written by Marek Sierts, with responses collected by students from Humboldt University Berlin. 
        Two locations were chosen : one near the A100 extension (Alt-Treptow) and another in Adlershof, close to the university campus.`,
    de: `Der Fragebogen wurde von Marek Sierts verfasst, die Antworten wurden von Studierenden der Humboldt-Universität zu Berlin erhoben.
        Es wurden zwei Standorte ausgewählt: einer in der Nähe der A100-Verlängerung (Alt-Treptow) und ein weiterer in Adlershof, unweit des Universitätsgeländes.`,
  },
  'para6': {
    en:`The survey was conducted as a questionnaire. Some participant answers and identifying information 
        are not included in this visualization.`,
    de:`Die Umfrage wurde in Form eines Fragebogens durchgeführt. Einige Antworten der Teilnehmer sowie personenbezogene Daten
        sind in dieser Visualisierung nicht enthalten.`,
  },
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

setLanguage('de');