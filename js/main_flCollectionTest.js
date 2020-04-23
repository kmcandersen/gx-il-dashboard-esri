//511 incidents, 448 unique crossings

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

  let map = new Map({
    basemap: 'dark-gray',
  });

  let mapview = new MapView({
    container: 'mapview',
    map: map,
    center: [-88.98, 40.0],
    //zoom: 6,
    scale: 4750000,
  });

  // create empty FeatureLayer
  const newLayer = new FeatureLayer({
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
  map.add(newLayer);

  // add buttons to the mapView
  mapview.ui.add(document.getElementById('actions'), 'top-right');

  const addBtn = document.getElementById('add');
  const removeBtn = document.getElementById('remove');

  addBtn.addEventListener('click', addFeatures);
  removeBtn.addEventListener('click', removeFeatures);

  // check if features have already been added to determine disabled state of buttons
  newLayer.queryFeatures().then(function (results) {
    if (results.features.length === 0) {
      addBtn.disabled = false;
      removeBtn.disabled = true;
    } else {
      addBtn.disabled = true;
      removeBtn.disabled = false;
    }
  });

  function addFeatures() {
    const data = [
      {
        ObjectID: 1,
        gxid: '8976',
        incidentTot: 0,
        Lat: 41.4,
        Long: -88.1,
      },
      {
        ObjectID: 2,
        gxid: '52398',
        incidentTot: 0,
        Lat: 41.68,
        Long: -87.95,
      },
    ];

    // create an array of graphics based on the data above
    var graphics = [];
    var graphic;
    for (var i = 0; i < data.length; i++) {
      graphic = new Graphic({
        geometry: {
          type: 'point',
          latitude: data[i].Lat,
          longitude: data[i].Long,
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

  // fires when "Remove Features" button clicked
  function removeFeatures() {
    // query for the features you want to remove
    newLayer.queryFeatures().then(function (results) {
      // edits object tells apply edits that you want to delete the features
      const deleteEdits = {
        deleteFeatures: results.features,
      };
      // apply edits to the layer
      applyEditsToLayer(deleteEdits);
    });
  }

  function applyEditsToLayer(edits) {
    newLayer
      .applyEdits(edits)
      .then(function (results) {
        // if edits were removed
        if (results.deleteFeatureResults.length > 0) {
          console.log(
            results.deleteFeatureResults.length,
            'features have been removed'
          );
          addBtn.disabled = false;
          removeBtn.disabled = true;
        }
        // if features were added - call queryFeatures to return
        //    newly added graphics
        if (results.addFeatureResults.length > 0) {
          var objectIds = [];
          results.addFeatureResults.forEach(function (item) {
            objectIds.push(item.objectId);
          });
          // query the newly added features from the layer
          newLayer
            .queryFeatures({
              objectIds: objectIds,
            })
            .then(function (results) {
              console.log(results.features.length, 'features have been added.');
              addBtn.disabled = true;
              removeBtn.disabled = false;
            });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});
