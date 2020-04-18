import { countIncByGx, createPXingItem } from './list_priority_xings.js';
import { getIncidentsBySelGx, createIncItem } from './list_selected_xings.js';
//import { geojsonLayer } from './../data/geojsonLayer.js';

//511 incidents, 448 unique crossings

//const incidentData =
('https://raw.githubusercontent.com/kmcandersen/files/master/gx_incidents.geojson');

require([
  'esri/Map',
  'esri/views/MapView',
  'esri/layers/GeoJSONLayer',
  'esri/core/watchUtils',
  'esri/widgets/Home',
], function (Map, MapView, GeoJSONLayer, watchUtils, Home) {
  let layer = new GeoJSONLayer({
    url: './data/gx_incidents.geojson',
    outFields: [
      'GXID',
      'HIGHWAY',
      'RAILROAD',
      'PUBLIC',
      'DATE',
      'TIME',
      'COUNTY',
      'CITY',
      'NARRATIVE',
      'TOTINJ',
      'TOTKLD',
      'TYPVEH',
      'TYPEQ',
      'Latitude',
      'Longitude',
    ],
    copyright: 'USGS Earthquakes',
    title: 'USGS Earthquakes',
    renderer: {
      type: 'simple',
      field: 'mag',
      symbol: {
        type: 'simple-marker',
        color: 'orange',
        size: '8px',
        outline: null,
      },
    },
  });

  let map = new Map({
    basemap: 'dark-gray',
    layers: [layer],
  });

  let mapview = new MapView({
    container: 'mapview',
    map: map,
    center: [-88.9840088995056, 39.76628316407406],
    //zoom: 6,
    scale: 4750000,
  });

  var homeBtn = new Home({
    view: mapview,
  });

  // Adds home button
  mapview.ui.add(homeBtn, 'top-left');
  //necessary? layer loads wo it, but seen in samples
  map.add(layer);

  //**Haven't been able to save query results to a var outside local scope, so info is accessible by other "components" */
  mapview.whenLayerView(layer).then(function (layerView) {
    //these vars formerly outside whenLayerView method:
    var highlight;
    var allIncidents;

    var populatePriorityList = () => {
      const incidentSumm = countIncByGx(allIncidents);
      const priorityListItem = createPXingItem(incidentSumm);
      //add priority xings to dom
      //if not initial load, remove existing list content first
      const listContent = document.getElementById('list-content');
      if (listContent) {
        listContent.remove();
      }
      document
        .getElementById('list-panel')
        .insertAdjacentHTML('beforeend', priorityListItem);
    };

    watchUtils.whenFalseOnce(layerView, 'updating', (value) => {
      if (!value) {
        layerView.queryFeatures().then((results) => {
          allIncidents = results.features;
          populatePriorityList();
        });
      }
    });

    mapview.on('click', (event) => {
      if (highlight) {
        highlight.remove();
      }

      mapview.hitTest(event).then((response) => {
        //return feature var, only if a feature (not empty area) is clicked
        if (response.results.length) {
          var feature = response.results.filter((result) => {
            return result.graphic.layer === layer;
          })[0].graphic;

          // Highlight feature
          highlight = layerView.highlight(feature);

          mapview
            .goTo({
              center: [
                feature.attributes.Longitude,
                feature.attributes.Latitude,
              ],
              scale: 24414,
              //zoom: 16,
            })
            .catch(function (error) {
              if (error.name != 'AbortError') {
                console.error(error);
              }
            });

          const selGx = feature.attributes.GXID;
          //NOTE: allIncidents accessible from here
          const selectedIncidents = getIncidentsBySelGx(selGx, allIncidents);
          const selectedListItems = createIncItem(selectedIncidents);

          //add incidents at selected crossing to DOM
          const listContent = document.getElementById('list-content');
          listContent.remove();
          document
            .getElementById('list-panel')
            .insertAdjacentHTML('beforeend', selectedListItems);

          document
            .getElementById('show-priority')
            .addEventListener('click', () => {
              highlight.remove();

              mapview.goTo(layer.fullExtent).catch((error) => {
                if (error.name != 'AbortError') {
                  console.error(error);
                }
              });
              populatePriorityList();
            });
        }
      });
    });
  });
});
