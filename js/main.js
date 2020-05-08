import { countIncByGx, createGXingItem } from './gx_summary_funcs.js';
import {
  getVehCatTotAll,
  countIncByYearMo,
  colorBarsByYear,
} from './chart_helpers.js';
import { createIncItem } from './list_selected_gx.js';
import './to_title_case.js';

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
  const ctx1 = document.getElementById('timeline-chart').getContext('2d');

  const ctx2 = document.getElementById('vehtyp-chart').getContext('2d');

  //note: not visible; used as input to countIncByGx func
  let incidents = new GeoJSONLayer({
    title: 'incidents',
    copyright: 'FRA',
    url: './data/gx_incidents.geojson',
    outFields: [
      'GXID',
      'HIGHWAY',
      'RAILROAD',
      'PUBLIC',
      'DATE',
      'TIME',
      'STATION',
      'NARRATIVE',
      'TOTINJ',
      'TOTKLD',
      'TYPVEH',
      'TYPEQ',
    ],
    visible: false,
  });

  let smallGxPoints = {
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      color: '#c8c8c8',
      outline: null,
      size: 4,
    },
  };

  let largeGxPoints = {
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      color: '#b4b4b4',
      outline: {
        color: '#828282',
        width: 0.5,
      },
      size: 8,
    },
  };

  let crossings = new GeoJSONLayer({
    title: 'crossings',
    copyright: 'FRA',
    url: './data/il_crossings.geojson',
    outFields: [
      'OBJECTID',
      'CrossingID',
      'CntyCD',
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
        name: 'Railroad',
        type: 'string',
      },
      {
        name: 'CntyCd',
        type: 'integer',
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
    renderer: smallGxPoints,
  });

  let map = new Map({
    basemap: 'gray-vector',
    layers: [crossings],
  });

  let mapview = new MapView({
    container: 'mapview',
    map: map,
    //center: [-89.5, 40.4],
    // scale: 3750000,
    highlightOptions: {
      fillOpacity: 0,
      haloColor: '#de2900',
    },
    popup: {
      autoOpenEnabled: false,
      visible: false,
      actions: [],
      alignment: 'top-center',
      collapseEnabled: true,
      dockOptions: {
        buttonEnabled: false,
        breakpoint: false,
      },
      visibleElements: {
        closeButton: false,
      },
      content: `<em>Click point to select</em>`,
      // highlightEnabled: true,
    },
  });

  let smallGxIncPoints = {
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      color: 'orange',
      outline: null,
      size: 4,
    },
  };

  let largeGxIncPoints = {
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      color: 'orange',
      outline: {
        color: '#d17e21',
        width: 0.5,
      },
      size: 8,
    },
  };

  // create empty FeatureLayer
  const incByCrossingLayer = new FeatureLayer({
    // create an instance of esri/layers/support/Field for each field object
    title: 'incByCrossingLayer',
    //used to troubleshoot hitTest highlight - which layer(s) were being captured:
    outFields: ['ObjectID', 'gxid', 'streetName1'],
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
    renderer: smallGxIncPoints,
    definitionExpression: 'incidentTot > 0',
  });

  var homeBtn = new Home({
    view: mapview,
  });

  var searchWidget = new Search({
    view: mapview,
    container: 'search-container',
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
        scale: 24414,
      },
    ],
  });

  map.add(incByCrossingLayer);
  // Adds home button
  mapview.ui.add(homeBtn, 'top-left');

  var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  var homeScale = viewportWidth > 680 ? 3750000 : 8000000;
  var homeCenter = viewportWidth > 680 ? [-89.5, 40.4] : [-89.5, 40.0];
  mapview.scale = homeScale;
  mapview.center = homeCenter;
  //formerly: scale: 24414
  var zoomScale = 15000;

  const monthCountChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      // labels: '',
      datasets: [
        {
          backgroundColor: colorBarsByYear(),
          borderColor: 'rgb(255, 255, 255)',
          borderWidth: 0,
          data: '',
          options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: 'Collisions by Month',
            },
          },
        },
      ],
    },
  });

  const vehTypChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      // labels: vehTypes,
      datasets: [
        {
          backgroundColor: ['#c6b29f', '#A6B6C2', '#A7A1AB', '#B0B6A5'],
          borderColor: 'rgb(255, 255, 255)',
          borderWidth: 0,
          data: [0, 0, 0, 0],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Collisions by Type',
      },
    },
  });

  //Apply Edits func (to populate feature layer), & watch of scale change on incByCrossingLayer, works wo this:
  //mapview.whenLayerView(incByCrossingLayer).then(function (layerViewGxInc) {
  //layerViewCrossings needed for hitTest highlight:
  mapview.whenLayerView(crossings).then(function (layerViewCrossings) {
    document.querySelector('.esri-search__input').onfocusout = null;

    let spinner = document.querySelector('.loading-spinner');
    // Hide the loading indicator when the view stops updating
    watchUtils.whenFalseOnce(mapview, 'updating', function (event) {
      spinner.remove();
    });
    var allIncidents, allCrossings, highlight;

    mapview.watch('scale', function (newValue) {
      crossings.renderer = newValue <= 187500 ? largeGxPoints : smallGxPoints;
    });

    mapview.watch('scale', function (newValue) {
      incByCrossingLayer.renderer =
        newValue <= 187500 ? largeGxIncPoints : smallGxIncPoints;
    });

    incidents.queryFeatures({ orderByFields: ['DATE ASC'] }).then((results) => {
      allIncidents = results.features;
      crossings
        .queryFeatures({ orderByFields: ['CrossingID ASC'] })
        .then((results) => {
          allCrossings = results.features;
          const incByGxArr = countIncByGx(allCrossings, allIncidents);
          // console.log(incByGxArr);
          addFeatures(incByGxArr);

          //on load, populate the List of crossings with incidents
          const gxListPanel = createGXingItem(incByGxArr);
          //add xings with inc to dom
          document
            .getElementById('list-panel')
            .insertAdjacentHTML('beforeend', gxListPanel);

          //initial load: List event selectors
          //Gx with Incidents List: on mouseover, shading on list & feature highlighted
          const listItemEffects = () => {
            const listItems = document.querySelectorAll('.list-item');
            listItems.forEach((item) => {
              item.addEventListener('mouseover', (event) => {
                item.classList.add('list-item-highlight');
                //
                var query = crossings.createQuery();
                var queryString =
                  'CrossingID = ' + "'" + item.dataset.gxid + "'";
                query.where = queryString;
                crossings.queryFeatures(query).then(function (result) {
                  if (highlight) {
                    highlight.remove();
                  }
                  highlight = layerViewCrossings.highlight(result.features);
                });
                //
              });
            });
            listItems.forEach((item) => {
              item.addEventListener('mouseout', (event) => {
                item.classList.remove('list-item-highlight');
                if (highlight) {
                  highlight.remove();
                }
              });
            });
          };

          //Gx with Incidents List: click on Gxid No. > Zooms to Gx
          const listItemHeaderEffects = () => {
            const itemHeaders = document.querySelectorAll('.item-headline');
            itemHeaders.forEach((itemHdr) => {
              itemHdr.addEventListener('click', (event) => {
                let gxid = itemHdr.textContent.slice(4);
                mapview
                  .goTo({
                    center: [
                      Number(itemHdr.dataset.long),
                      Number(itemHdr.dataset.lat),
                    ],
                    scale: zoomScale,
                  })
                  .catch(function (error) {
                    if (error.name != 'AbortError') {
                      console.error(error);
                    }
                  });
                fillIncidentList(gxid);
                createVehTypChartSel(gxid);
              });
            });
          };
          if (viewportWidth > 680) {
            listItemEffects();
          }
          listItemHeaderEffects();

          //Calculate overall total of Collisions by Type to populate Chart
          const createVehTypChartAll = () => {
            vehTypChart.data.labels = Object.keys(incByGxArr[0].incByTypEq);
            vehTypChart.data.datasets[0].data = Object.values(
              getVehCatTotAll(incByGxArr)
            );
            vehTypChart.update();
          };
          createVehTypChartAll();

          //Get Collisions by Type for selected gx to populate Chart
          const createVehTypChartSel = (gxid) => {
            for (let i = 0; i < incByGxArr.length; i++) {
              if (incByGxArr[i].gxid === gxid) {
                vehTypChart.data.labels = Object.keys(incByGxArr[i].incByTypEq);
                vehTypChart.data.datasets[0].data = Object.values(
                  incByGxArr[i].incByTypEq
                );
              }
            }
          };

          //Calculate overall total of Collisions for each Month-Year in range to populate Chart
          const incByYearMo = countIncByYearMo(allIncidents, 2015, 2019);
          monthCountChart.data.labels = Object.keys(incByYearMo);
          monthCountChart.data.datasets[0].data = Object.values(incByYearMo);
          monthCountChart.update();

          //popup on mouseover
          mapview.on('pointer-move', (event) => {
            mapview.hitTest(event).then((response) => {
              //**response length ALWAYS > 0 bc pointer on basemap returns a result */

              if (response.results.length > 1 && viewportWidth > 680) {
                const feature = response.results.filter(function (result) {
                  return result.graphic.layer === crossings;
                })[0].graphic;

                var Latitude = feature.attributes.Latitude;
                var Longitude = feature.attributes.Longitude;
                var Station = feature.attributes.Station
                  ? feature.attributes.Station.toLowerCase().toTitleCase()
                  : 'NA';
                var Street = feature.attributes.Street
                  ? feature.attributes.Street.toLowerCase().toTitleCase()
                  : 'NA';

                mapview.popup.location = {
                  latitude: Latitude,
                  longitude: Longitude,
                };
                mapview.popup.title = `${Street}<br/>In/near: ${Station}`;
                // Displays the popup (hidden by default)

                mapview.popup.visible = true;
              } else {
                mapview.popup.visible = false;
              }
            });
          });

          //selection via map click:
          mapview.on('click', (event) => {
            //if don't click on a point, remove highlights from a prev click or search
            if (highlight) {
              highlight.remove();
            }
            if (searchWidget.resultGraphic) {
              searchWidget.clear();
            }
            mapview.popup.visible = false;

            mapview.hitTest(event).then((response) => {
              if (response.results.length > 1) {
                var feature = response.results.filter((result) => {
                  return result.graphic.layer === crossings;
                })[0].graphic;

                // Highlight feature
                highlight = layerViewCrossings.highlight(feature);

                mapview
                  .goTo({
                    center: [
                      feature.attributes.Longitude,
                      feature.attributes.Latitude,
                    ],
                    scale: zoomScale,
                  })
                  .catch(function (error) {
                    if (error.name != 'AbortError') {
                      console.error(error);
                    }
                  });

                //diff than crossing ID in Search:
                const selGxId = feature.attributes.CrossingID;
                fillIncidentList(selGxId);
                createVehTypChartSel(selGxId);
              }
            });
          });

          //selection via Search:
          searchWidget.on('select-result', function (event) {
            mapview.goTo({
              scale: zoomScale,
            });

            if (highlight) {
              highlight.remove();
            }

            mapview.popup.visible = false;

            const selGxId = event.result.feature.attributes.CrossingID;

            fillIncidentList(selGxId);
            createVehTypChartSel(selGxId);
          });

          function addFeatures(arr) {
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
                //newly added graphics
                if (results.addFeatureResults.length > 0) {
                  var objectIds = [];
                  results.addFeatureResults.forEach(function (item) {
                    objectIds.push(item.objectId);
                  });
                  // query the newly added features from the layer
                  incByCrossingLayer.queryFeatures({
                    objectIds: objectIds,
                  });
                }
              })
              .catch(function (error) {
                console.log(error);
              });
          }

          const magnifyHandler = () => {
            if (highlight) {
              highlight.remove();
            }
            if (searchWidget.resultGraphic) {
              searchWidget.clear();
            }
            const item = document.getElementById('for-zoom');

            var query = crossings.createQuery();
            var queryString = 'CrossingID = ' + "'" + item.dataset.gxid + "'";
            query.where = queryString;
            crossings.queryFeatures(query).then(function (result) {
              if (highlight) {
                highlight.remove();
              }
              highlight = layerViewCrossings.highlight(result.features);
            });

            mapview
              .goTo({
                center: [Number(item.dataset.long), Number(item.dataset.lat)],
                scale: zoomScale,
              })
              .catch(function (error) {
                if (error.name != 'AbortError') {
                  console.error(error);
                }
              });
          };

          const clearBtnHandler = () => {
            if (highlight) {
              highlight.remove();
            }
            if (searchWidget.resultGraphic) {
              searchWidget.clear();
            }

            mapview
              .goTo({
                center: homeCenter,
                scale: homeScale,
              })
              .catch((error) => {
                if (error.name != 'AbortError') {
                  console.error(error);
                }
              });

            //remove existing List; populate the List of crossings with incidents
            const listContent = document.getElementById('list-content');
            if (listContent) {
              listContent.remove();
            }
            const gxListItem = createGXingItem(incByGxArr);
            document
              .getElementById('list-panel')
              .insertAdjacentHTML('beforeend', gxListItem);
            listItemEffects();
            listItemHeaderEffects();
            createVehTypChartAll();
          };

          const fillIncidentList = (selGxId) => {
            const incListItem = createIncItem(
              selGxId,
              incByGxArr,
              allIncidents
            );

            //add incidents at selected crossing to DOM
            const listContent = document.getElementById('list-content');
            listContent.remove();
            document
              .getElementById('list-panel')
              .insertAdjacentHTML('beforeend', incListItem);
            document
              .querySelector('.esri-icon-zoom-in-magnifying-glass')
              .addEventListener('click', () => magnifyHandler());
            document
              .getElementById('show-all')
              .addEventListener('click', () => clearBtnHandler());
          };

          //end of crossings.queryFeatures
        });
      //end of incidents.queryFeatures
    });
    //END of whenLayerView - crossings
  });
  //END of whenLayerView - gxWithInc
  //});
});
