//511 incidents, 448 unique crossings
import { countIncByGx, createGXingItem } from './gx_summary_funcs.js';

import { createIncItem } from './list_selected_gx.js';

require([
  'esri/Map',
  'esri/views/MapView',
  'esri/layers/GeoJSONLayer',
  'esri/layers/FeatureLayer',
  'esri/Graphic',
  'esri/core/watchUtils',
  'esri/widgets/Home',
  'esri/widgets/Search',
], function (
  Map,
  MapView,
  GeoJSONLayer,
  FeatureLayer,
  Graphic,
  watchUtils,
  Home,
  Search
) {
  // const blob = new Blob([JSON.stringify('./data/gx_incidents.geojson')], {
  //   type: 'application/json',
  // });
  // const url = URL.createObjectURL(blob);
  // const incidents = new GeoJSONLayer({ url });

  //note: not visible; used as input to countIncByGx func
  let incidents = new GeoJSONLayer({
    title: 'IL Grade Crossing Incidents 2015-2019',
    copyright: 'Federal Railroad Administration',
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
      'STATION',
      'NARRATIVE',
      'TOTINJ',
      'TOTKLD',
      'TYPVEH',
      'TYPEQ',
    ],
    visible: false,
  });

  let crossings = new GeoJSONLayer({
    title: 'IL Grade Crossings',
    copyright: 'Federal Railroad Administration',
    url: './data/il_crossings.geojson',
    outFields: [
      'OBJECTID',
      'CrossingID',
      'Street',
      'Station',
      'Latitude',
      'Longitude',
    ],
    // visible: false,
    ////To fix Error - layer excluded bc type couldn't be determined:
    fields: [
      {
        name: 'OBJECTID',
        alias: 'ObjectID',
        type: 'oid',
      },
      {
        name: 'CrossingID',
        type: 'string',
      },
      {
        name: 'Street',
        type: 'string',
      },
      {
        name: 'Station',
        type: 'string',
      },
      {
        name: 'Latitude',
        type: 'double',
      },
      {
        name: 'Longitude',
        type: 'double',
      },
    ],
    objectIdField: 'OBJECTID',
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        color: '#555555',
        size: '5px',
        outline: null,
      },
    },
  });

  let map = new Map({
    basemap: 'dark-gray',
    layers: [crossings],
  });

  let mapview = new MapView({
    container: 'mapview',
    map: map,
    center: [-88.98, 40.0],
    //zoom: 6,
    scale: 4750000,
  });

  // create empty FeatureLayer
  const incByCrossingLayer = new FeatureLayer({
    // create an instance of esri/layers/support/Field for each field object
    title: 'Crossings with Incidents',
    fields: [
      {
        name: 'ObjectID',
        type: 'oid',
      },
      {
        name: 'gxid',
        type: 'string',
      },
      {
        name: 'streetName1',
        type: 'string',
      },
      {
        name: 'streetName2',
        type: 'string',
      },
      {
        name: 'station1',
        type: 'string',
      },
      {
        name: 'station2',
        type: 'string',
      },
      {
        name: 'city1',
        type: 'string',
      },
      {
        name: 'city2',
        type: 'string',
      },
      {
        name: 'incidentTot',
        type: 'integer',
      },
      {
        name: 'injuryTot',
        type: 'integer',
      },
      {
        name: 'fatalityTot',
        type: 'integer',
      },
      {
        name: 'lat',
        type: 'double',
      },
      {
        name: 'long',
        type: 'double',
      },
    ],
    objectIdField: 'ObjectID',
    geometryType: 'point',
    spatialReference: { wkid: 4326 },
    source: [], // adding an empty feature collection
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        color: 'orange',
        size: '6px',
        outline: null,
      },
    },
    definitionExpression: 'incidentTot > 0',
  });

  var homeBtn = new Home({
    view: mapview,
  });

  var searchWidget = new Search({
    view: mapview,

    includeDefaultSources: false,
    locationEnabled: false,
    resultGraphicEnabled: true,
    sources: [
      {
        layer: crossings,
        searchFields: ['CrossingID', 'Street'],
        suggestionTemplate: '{CrossingID} {Street}, In/Near: {Station}',
        displayField: 'Street',
        exactMatch: false,
        outFields: ['CrossingID', 'Street'],
        name: 'Crossing ID or Street Name',
        placeholder: 'Search Crossing ID or Street',
        zoom: 12,
      },
    ],
  });

  map.add(incByCrossingLayer);
  // Adds home button
  mapview.ui.add(homeBtn, 'top-left');

  mapview.ui.add(searchWidget, {
    position: 'top-right',
  });

  mapview.whenLayerView(incByCrossingLayer).then(function (layerView) {
    //https://community.esri.com/message/776908-search-widgetin-onfocusout-in-47-causes-error-when-used-with-jquery
    document.querySelector('.esri-search__input').onfocusout = null;

    var allIncidents, allCrossings, highlight;

    // watchUtils.whenFalseOnce(layerView, 'updating', (value) => {
    //   if (!value) {

    incidents.queryFeatures().then((results) => {
      allIncidents = results.features;
      crossings.queryFeatures().then((results) => {
        allCrossings = results.features;
        const incByGxArr = countIncByGx(allCrossings, allIncidents);

        //**For viewing of indiv combo arr xings:
        // for (let i = 0; i < incByGxArr.length; i++) {
        //   if (incByGxArr[i].gxid === '295086B') {
        //     console.log(incByGxArr[i]);
        //   }
        // }
        //console.log(incByGxArr.slice(16165, 16175));
        //restore rest of orig functionality

        addFeatures(incByGxArr);

        const gxListItem = createGXingItem(incByGxArr);
        //add priority xings to dom
        document
          .getElementById('list-panel')
          .insertAdjacentHTML('beforeend', gxListItem);

        searchWidget.on('select-result', function (event) {
          mapview.goTo({
            scale: 24414,
          });
          const selGxId = event.result.feature.attributes.CrossingID;
          const incListItem = createIncItem(selGxId, incByGxArr, allIncidents);

          //NEED to grab searchWidget result graphic, so can remove highlight when show-all button is clicked
          //console.log('search result', searchWidget.resultGraphic);

          // old Highlight feature code:
          //highlight = layerView.highlight(searchWidget.resultGraphic);

          //add incidents at selected crossing to DOM
          const listContent = document.getElementById('list-content');
          listContent.remove();
          document
            .getElementById('list-panel')
            .insertAdjacentHTML('beforeend', incListItem);

          document.getElementById('show-all').addEventListener('click', () => {
            // doesn't work
            if (highlight) {
              highlight.remove();
            }

            mapview
              .goTo({
                center: [-88.98, 40.0],
                scale: 4750000,
              })
              .catch((error) => {
                if (error.name != 'AbortError') {
                  console.error(error);
                }
              });
          });
        });

        function addFeatures(arr) {
          //generate gx/incident object here
          // const arr = [
          //   {
          //     ObjectID: 1,
          //     gxid: '8976',
          //     incidentTot: 0,
          //     Lat: 41.4,
          //     Long: -88.1,
          //   },
          //   {
          //     ObjectID: 2,
          //     gxid: '52398',
          //     incidentTot: 0,
          //     Lat: 41.68,
          //     Long: -87.95,
          //   },
          // ];

          // create an array of graphics based on the data above
          var graphics = [];
          var graphic;
          for (var i = 0; i < arr.length; i++) {
            graphic = new Graphic({
              geometry: {
                type: 'point',
                latitude: arr[i].lat,
                longitude: arr[i].long,
              },
              attributes: arr[i],
            });
            graphics.push(graphic);
          }

          // addEdits object tells applyEdits that you want to add the features
          const addEdits = {
            addFeatures: graphics,
          };

          // apply the edits to the layer
          applyEditsToLayer(addEdits);
        }

        function applyEditsToLayer(edits) {
          incByCrossingLayer
            .applyEdits(edits)
            .then(function (results) {
              // if features were added - call queryFeatures to return
              //    newly added graphics
              if (results.addFeatureResults.length > 0) {
                var objectIds = [];
                results.addFeatureResults.forEach(function (item) {
                  objectIds.push(item.objectId);
                });
                // query the newly added features from the layer
                incByCrossingLayer.queryFeatures({
                  objectIds: objectIds,
                });

                // .then(function (results) {
                //   console.log(
                //     results.features.length,
                //     'features have been added.'
                //   );
                // });
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        }
        //END
      });
    });
    //   }
    // });
  });
});
