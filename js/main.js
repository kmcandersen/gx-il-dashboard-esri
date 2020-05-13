import { countIncByGx, createGXingItem } from './gx_summary_funcs.js';
import {
  timeChartProperties,
  vehTypChartProperties,
  getVehCatTotAll,
  countIncByYearMo,
  colorBarsByYear,
  countIncByYear,
  labelsByYear,
  formatMoYearKeys,
} from './chart_helpers.js';
import { createIncItem } from './list_selected_gx_funcs.js';
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
  'esri/widgets/BasemapToggle',
], function (
  Map,
  MapView,
  GeoJSONLayer,
  FeatureLayer,
  Graphic,
  watchUtils,
  Home,
  Search,
  BasemapToggle
) {
  const ctx1 = document.getElementById('timeline-chart').getContext('2d');

  const ctx2 = document.getElementById('vehtyp-chart').getContext('2d');

  Chart.defaults.global.defaultFontFamily = 'Avenir Next W00';

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
      color: '#BCBCBC',
      outline: null,
      size: 3,
    },
  };

  let largeGxPoints = {
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      color: '#c1c1c1',

      outline: {
        color: '#4F4F4F',
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
    basemap: 'topo',
    layers: [crossings],
  });

  let mapview = new MapView({
    container: 'mapview',
    map: map,
    constraints: {
      minZoom: 5,
      rotationEnabled: false,
    },
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
      color: '#CB9611',
      outline: null,
      size: 3,
    },
  };

  let largeGxIncPoints = {
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      color: '#E4AF2A',
      outline: {
        color: '#935E00',
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

  const homeBtn = new Home({
    view: mapview,
  });

  const searchWidget = new Search({
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
        scale: 15000,
      },
    ],
  });

  var basemapToggle = new BasemapToggle({
    view: mapview,
    nextBasemap: 'hybrid',
  });

  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;
  let homeScale = viewportWidth >= 1024 ? 8000000 : 3750000;
  let homeCenter =
    viewportWidth >= 1024
      ? [-89.5, 39.8]
      : viewportWidth > 414
      ? [-89.5, 40.8]
      : [-89.5, 41.4];
  mapview.scale = homeScale;
  mapview.center = homeCenter;
  let zoomScale = 15000;

  //on mobile, relocates basemapToggle away from overlapping the densest area of crossings
  if (viewportWidth > 414) {
    mapview.ui.add(basemapToggle, 'top-right');
  } else {
    mapview.ui.add(basemapToggle, 'bottom-left');
  }

  map.add(incByCrossingLayer);
  // Adds home button
  mapview.ui.add(homeBtn, 'top-left');

  //Apply Edits func (to populate feature layer), & watch of scale change on incByCrossingLayer, works wo this:
  //mapview.whenLayerView(incByCrossingLayer).then(function (layerViewGxInc) {
  //layerViewCrossings needed for hitTest highlight:
  mapview.whenLayerView(crossings).then((layerViewCrossings) => {
    document.querySelector('.esri-search__input').onfocusout = null;

    let spinner = document.querySelector('.loading-spinner');
    // Hide the loading indicator when the view stops updating
    watchUtils.whenFalseOnce(mapview, 'updating', (event) => {
      spinner.remove();
    });

    var allIncidents, allCrossings, highlight;

    mapview.watch('scale', (newValue) => {
      crossings.renderer = newValue <= 450500 ? largeGxPoints : smallGxPoints;
    });

    mapview.watch('scale', (newValue) => {
      incByCrossingLayer.renderer =
        newValue <= 450500 ? largeGxIncPoints : smallGxIncPoints;
    });

    incidents.queryFeatures({ orderByFields: ['DATE ASC'] }).then((results) => {
      allIncidents = results.features;
      crossings
        .queryFeatures({ orderByFields: ['CrossingID ASC'] })
        .then((results) => {
          allCrossings = results.features;
          const incByGxArr = countIncByGx(allCrossings, allIncidents);
          addFeatures(incByGxArr);

          //on load, populate the List of Priority crossings
          const gxListPanel = createGXingItem(incByGxArr);
          //add Priority List to DOM
          document
            .getElementById('list-panel')
            .insertAdjacentHTML('beforeend', gxListPanel);

          //initial load: add event listeners, highlight trigger on Priority Gx List items (on mouseover, shading on list & feature highlighted)
          const listItemEffects = () => {
            const listItems = document.querySelectorAll('.list-item');
            listItems.forEach((item) => {
              item.addEventListener('mouseover', () => {
                item.classList.add('list-item-highlight');
                //note: this portion also in magnifyHandler:
                let query = crossings.createQuery();
                let queryString =
                  'CrossingID = ' + "'" + item.dataset.gxid + "'";
                query.where = queryString;
                crossings.queryFeatures(query).then((result) => {
                  if (highlight) {
                    highlight.remove();
                  }
                  highlight = layerViewCrossings.highlight(result.features);
                });
                //
              });
            });
            listItems.forEach((item) => {
              item.addEventListener('mouseout', () => {
                item.classList.remove('list-item-highlight');
                if (highlight) {
                  highlight.remove();
                }
              });
            });
          };

          //Priority Gx List: click on Gxid No. > Zooms to Gx
          const listItemHeaderEffects = () => {
            const itemHeaders = document.querySelectorAll('.item-headline');
            itemHeaders.forEach((itemHdr) => {
              itemHdr.addEventListener('click', () => {
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
                //Populate Selected Gx incident List
                fillIncidentList(gxid);
                //Populate Charts
                createVehTypChartSel(gxid);
                //Calculate Collisions by Year for selected gx, to populate Chart
                const incByYear = countIncByYear(incByGxArr, gxid, 2015, 2019);
                createIncByYearSel(incByYear);
              });
            });
          };
          //no list item shading, map highlight needed on hover, on Mobile
          if (viewportWidth > 680) {
            listItemEffects();
          }
          listItemHeaderEffects();

          //initial load; toggle Priority List only needed on Mobile
          if (viewportWidth < 680) {
            document
              .getElementById('toggle-list')
              .addEventListener('click', () => toggleListHandler());
          }

          //Vehicle Type Charts - All & Selected Gx
          const vehTypChart = new Chart(ctx2, vehTypChartProperties);
          //Calculate overall total of Collisions by Type to populate Chart
          const createVehTypChartAll = () => {
            vehTypChart.options.scales.yAxes[0].ticks.stepSize = 50;
            vehTypChart.data.labels = Object.keys(incByGxArr[0].incByTypEq);
            vehTypChart.data.datasets[0].data = Object.values(
              getVehCatTotAll(incByGxArr)
            );
            vehTypChart.options.title.text = 'Vehicle Type | All Crossings';
            vehTypChart.update();
          };
          createVehTypChartAll();

          //Get Collisions by Type for selected gx to populate Chart
          const createVehTypChartSel = (gxid) => {
            for (let i = 0; i < incByGxArr.length; i++) {
              if (incByGxArr[i].gxid === gxid) {
                vehTypChart.options.scales.yAxes[0].ticks.stepSize = 1;
                vehTypChart.data.labels = Object.keys(incByGxArr[i].incByTypEq);
                vehTypChart.data.datasets[0].data = Object.values(
                  incByGxArr[i].incByTypEq
                );
                vehTypChart.options.title.text =
                  'Vehicle Type | Selected Crossing';
                vehTypChart.update();
              }
            }
          };

          //Collisions over Time Charts - All (by Month) & Selected Gx (by Year)
          const timeCountChart = new Chart(ctx1, timeChartProperties);

          const incByYearMo = countIncByYearMo(allIncidents, 2015, 2019);
          //Populate collisions over time Chart for selected gx (by year), using incByYear arr calculated when gx selected
          //Nov & Dec 2019 sliced & not displayed, bc no data for these months
          const createIncByMonthAll = (incByYearMo) => {
            timeCountChart.data.datasets[0].backgroundColor = colorBarsByYear();
            timeCountChart.options.title.text =
              'Collisions by Month | All Crossings';
            timeCountChart.data.labels = labelsByYear(2015, 2019).slice(0, -2);
            timeCountChart.data.datasets[0].data = Object.values(
              incByYearMo
            ).slice(0, -2);
            timeCountChart.options.scales.yAxes[0].ticks.stepSize = 4;

            //func for custom tooltip title, since x labels (the normal tooltip source) display either year or ''
            //wo this, title for Jan tooltips = year:
            const moYearKeys = Object.keys(incByYearMo).slice(0, -2);
            const tooltipKeys = formatMoYearKeys(moYearKeys);
            timeCountChart.options.tooltips.callbacks.title = (
              tooltipItems,
              data
            ) => {
              return `${tooltipKeys[tooltipItems[0].index]}`;
            };

            timeCountChart.update();
          };
          createIncByMonthAll(incByYearMo);

          //Populate collisions over time Chart for selected gx (by year), using incByYear arr, calculated when gx selected
          const createIncByYearSel = (incByYear) => {
            timeCountChart.data.labels = Object.keys(incByYear);
            const tooltipKeys = Object.keys(incByYear);
            //tooltip title from createIncByMonthAll will still apply if not replaced
            timeCountChart.options.tooltips.callbacks.title = (
              tooltipItems,
              data
            ) => {
              return `${tooltipKeys[tooltipItems[0].index]}`;
            };

            timeCountChart.data.datasets[0].data = Object.values(incByYear);
            timeCountChart.data.datasets[0].backgroundColor = [
              '#c6b29f',
              '#A6B6C2',
              '#A7A1AB',
              '#B0B6A5',
              '#d4b1ad',
            ];
            timeCountChart.options.scales.yAxes[0].ticks.stepSize = 1;
            timeCountChart.options.title.text =
              'Collisions by Year | Selected Crossing';
            timeCountChart.update();
          };

          //popup on mouseover
          mapview.on('pointer-move', (event) => {
            mapview.hitTest(event).then((response) => {
              if (response.results.length && viewportWidth > 680) {
                const feature = response.results.filter((result) => {
                  return result.graphic.layer === crossings;
                })[0].graphic;

                let Latitude = feature.attributes.Latitude;
                let Longitude = feature.attributes.Longitude;
                let Station = feature.attributes.Station
                  ? feature.attributes.Station.toLowerCase().toTitleCase()
                  : 'NA';
                let Street = feature.attributes.Street
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
              if (response.results.length) {
                let feature = response.results.filter((result) => {
                  return result.graphic.layer === crossings;
                })[0].graphic;

                //Highlight feature
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
                //populate selected gx List
                fillIncidentList(selGxId);
                //populate Charts for selected gx
                createVehTypChartSel(selGxId);
                const incByYear = countIncByYear(
                  incByGxArr,
                  selGxId,
                  2015,
                  2019
                );
                createIncByYearSel(incByYear);
              }
            });
          });

          //selection via Search:
          searchWidget.on('select-result', (event) => {
            mapview.goTo({
              scale: zoomScale,
            });
            if (highlight) {
              highlight.remove();
            }
            mapview.popup.visible = false;
            //get gxid from selected gx
            const selGxId = event.result.feature.attributes.CrossingID;

            fillIncidentList(selGxId);
            createVehTypChartSel(selGxId);
            const incByYear = countIncByYear(incByGxArr, selGxId, 2015, 2019);
            createIncByYearSel(incByYear);
          });

          function addFeatures(arr) {
            // create an array of graphics based on the data above
            var graphics = [];
            var graphic;
            for (let i = 0; i < arr.length; i++) {
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
                  let objectIds = [];
                  results.addFeatureResults.forEach((item) => {
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

            let query = crossings.createQuery();
            let queryString = 'CrossingID = ' + "'" + item.dataset.gxid + "'";
            query.where = queryString;
            crossings.queryFeatures(query).then((result) => {
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

            //remove Selected Gx List
            const listContent = document.getElementById('list-content');
            if (listContent) {
              listContent.remove();
            }
            //populate the Priority Gx List
            const gxListItem = createGXingItem(incByGxArr);
            document
              .getElementById('list-panel')
              .insertAdjacentHTML('beforeend', gxListItem);

            //toggle Priority List only needed on Mobile
            if (viewportWidth < 680) {
              document
                .getElementById('toggle-list')
                .addEventListener('click', () => toggleListHandler());
            }
            //no list item shading, map highlight needed on hover, on Mobile
            if (viewportWidth > 680) {
              listItemEffects();
            }
            listItemHeaderEffects();
            //populate the All Gx Charts
            createIncByMonthAll(incByYearMo);
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
            //add event handlers
            document
              .querySelector('.esri-icon-zoom-in-magnifying-glass')
              .addEventListener('click', () => magnifyHandler());
            document
              .getElementById('show-all')
              .addEventListener('click', () => clearBtnHandler());
          };

          //for Mobile only: shows/hides Priority Gx list to conserve space
          const toggleListHandler = () => {
            const toggleIcon = document.getElementById('toggle-list');
            const listBodyPriority = document.getElementById('priority-gx');
            console.log(listBodyPriority);
            if (toggleIcon.classList.contains('esri-icon-arrow-down-circled')) {
              toggleIcon.classList.remove('esri-icon-arrow-down-circled');
              toggleIcon.classList.add('esri-icon-arrow-up-circled');
              listBodyPriority.style.display = 'flex';
            } else {
              toggleIcon.classList.remove('esri-icon-arrow-up-circled');
              toggleIcon.classList.add('esri-icon-arrow-down-circled');
              listBodyPriority.style.display = 'none';
            }
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
