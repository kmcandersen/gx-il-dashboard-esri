//511 incidents, 448 unique crossings
import { countIncByGx } from './list_all_xings.js';

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

  let incidents = new GeoJSONLayer({
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
    copyright: 'Federal Railroad Administration',
    title: 'IL Grade Crossing Incidents',
    visible: false,
  });

  let crossings = new GeoJSONLayer({
    url: './data/il_crossings.geojson',
    outFields: [
      'OBJECTID',
      'CrossingID',
      'Street',
      'Station',
      'Latitude',
      'Longitude',
    ],
    copyright: 'Federal Railroad Administration',
    title: 'IL Grade Crossings',
    visible: false,
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
  });

  let map = new Map({
    basemap: 'dark-gray',
    layers: [incidents],
  });

  let mapview = new MapView({
    container: 'mapview',
    map: map,
    center: [-88.98, 40.0],
    //zoom: 6,
    scale: 4750000,
  });

  // create empty FeatureLayer
  const incByCrossing = new FeatureLayer({
    // create an instance of esri/layers/support/Field for each field object
    title: 'Grade Crossings',
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
        name: 'incidentTot',
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
        size: '7px',
        outline: null,
      },
    },
  });
  map.add(incByCrossing);

  mapview.whenLayerView(incByCrossing).then(function (layerView) {
    var allIncidents, allCrossings;
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
        //RUN countIncByGx FUNC HERE; move addFeatures so can access 2 arrays
        //restore rest of orig functionality

        addFeatures(incByGxArr);

        function addFeatures(data) {
          //generate gx/incident object here
          // const data = [
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
          for (var i = 0; i < data.length; i++) {
            graphic = new Graphic({
              geometry: {
                type: 'point',
                latitude: data[i].lat,
                longitude: data[i].long,
              },
              attributes: data[i],
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
          incByCrossing
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
                incByCrossing.queryFeatures({
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
