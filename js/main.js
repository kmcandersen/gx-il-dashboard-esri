//searchWidget implemented, but highlight, zoom don't work
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
  'esri/widgets/Search',
], function (Map, MapView, GeoJSONLayer, watchUtils, Home, Search) {
  let incidentLayer = new GeoJSONLayer({
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
    copyright: 'Federal Railroad Administration',
    title: 'IL Grade Crossing Incidents',
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        color: 'orange',
        size: '8px',
        outline: null,
      },
    },
  });

  let crossingLayer = new GeoJSONLayer({
    url: './data/il_crossings.geojson',
    outFields: ['OBJECTID', 'CrossingID', 'Street', 'Station'],
    copyright: 'Federal Railroad Administration',
    title: 'IL Road-Rail Grade Crossings',
    minScale: 2000000,
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        //color: 'gray',
        size: '6px',
        outline: null,
      },
      // visualVariables: [
      //   {
      //     type: 'color',
      //     valueExpression: '$view.scale',
      //     stops: [
      //       {
      //         color: 'white',
      //         value: 200,
      //       },
      //       {
      //         color: 'red',
      //         value: 2000000,
      //       },
      //     ],
      //   },
      // ],
    },
  });

  //To fix Error: layer excluded bc type couldn't be determined
  var fields = [
    {
      name: 'OBJECTID',
      alias: 'ObjectID',
      type: 'oid',
    },
    {
      name: 'CrossingID',
      alias: 'Crossing ID',
      type: 'string',
    },
    {
      name: 'Street',
      alias: 'Street',
      type: 'string',
    },
    {
      name: 'Station',
      alias: 'Station',
      type: 'string',
    },
    {
      name: 'Station',
      alias: 'Station',
      type: 'string',
    },
  ];

  // add the array of fields to a feature layer
  // created from client-side graphics
  crossingLayer.set({
    fields: fields,
    objectIdField: 'OBJECTID',
  });

  let map = new Map({
    basemap: 'dark-gray',
    layers: [incidentLayer, crossingLayer],
  });

  let mapview = new MapView({
    container: 'mapview',
    map: map,
    center: [-88.98, 40.0],
    //zoom: 6,
    scale: 4750000,
  });

  var homeBtn = new Home({
    view: mapview,
  });

  //do the Search on a hidden/gray Gxings file, so only 1 sugg/xing

  var searchWidget = new Search({
    view: mapview,

    includeDefaultSources: false,
    locationEnabled: false,
    resultGraphicEnabled: true,
    sources: [
      {
        layer: crossingLayer,
        searchFields: ['CrossingID', 'Street'],
        suggestionTemplate: '{CrossingID} {Street}, City: {Station}',
        displayField: 'Street',
        exactMatch: false,
        outFields: ['CrossingID', 'Street'],
        name: 'Crossing ID or Street Name',
        placeholder: 'Search Crossing ID or Street',
        zoom: 12,
      },
    ],
  });

  //   var searchWidget = new Search({
  //     view: mapview,
  //     includeDefaultSources: false,
  //     locationEnabled: false,
  //     resultGraphicEnabled: true,
  //     allPlaceholder: 'Crossing ID or Street',
  //     sources: [
  //       {
  //         layer: crossingLayer,
  //         searchFields: ['CrossingID'],
  //         suggestionTemplate: '{CrossingID}: {Street}',
  //         displayField: 'CrossingID',
  //         exactMatch: false,
  //         outFields: ['CrossingID'],
  //         name: 'Crossing ID',
  //         placeholder: 'Search Crossing ID',
  //       },
  //       {
  //         layer: crossingLayer,
  //         searchFields: ['Street'],
  //         suggestionTemplate: '{{Street}, City: {Station}',
  //         displayField: 'Street',
  //         exactMatch: false,
  //         outFields: ['Street'],
  //         name: 'Street Name',
  //         placeholder: 'Search Street',
  //       },
  //     ],
  //   });

  // Adds home button
  mapview.ui.add(homeBtn, 'top-left');
  //necessary? layer loads wo it, but seen in samples
  map.add(incidentLayer);
  map.add(crossingLayer);

  mapview.ui.add(searchWidget, {
    position: 'top-right',
  });

  //**Haven't been able to save query results to a var outside local scope, so info is accessible by other "components" */
  mapview.whenLayerView(incidentLayer).then(function (layerView) {
    //https://community.esri.com/message/776908-search-widgetin-onfocusout-in-47-causes-error-when-used-with-jquery
    document.querySelector('.esri-search__input').onfocusout = null;
    //these vars formerly outside whenLayerView method:
    var highlight;
    var allIncidents;
    watchUtils.whenFalseOnce(layerView, 'updating', (value) => {
      if (!value) {
        layerView.queryFeatures().then((results) => {
          allIncidents = results.features;
          const incidentSumm = countIncByGx(allIncidents);
          const priorityListItem = createPXingItem(incidentSumm);
          //add priority xings to dom
          document
            .getElementById('list-panel')
            .insertAdjacentHTML('beforeend', priorityListItem);
        });
      }
    });

    searchWidget.on('select-result', function (event) {
      mapview.goTo({
        scale: 24414,
      });
      console.log('Search done', event.result.feature.attributes);
    });

    mapview.on('click', (event) => {
      if (highlight) {
        highlight.remove();
      }

      mapview.hitTest(event).then((response) => {
        //return feature var, only if a feature (not empty area) is clicked
        if (response.results.length) {
          var feature = response.results.filter((result) => {
            return result.graphic.layer === incidentLayer;
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

              mapview.goTo(incidentLayer.fullExtent).catch((error) => {
                if (error.name != 'AbortError') {
                  console.error(error);
                }
              });

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
            });
        }
      });
    });
  });
});
