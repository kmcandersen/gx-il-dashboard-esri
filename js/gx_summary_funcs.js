//run countIncByGx to create a new array, with an object for each crossing in IL, and a summary of characteristics and incidents (if applicable) at the crossing. This array is the data source for the incByCrossingLayer feature layer in main.js, and a definitionExpression limits visible points to the crossings with incidents.

// GOAL:
// const result = [
//   {
//     ObjectID: 1,
//     gxid: '8976',
//     streetName1: 'Gx Street',
//     streetName2: 'Inc Highway',
//     station: 'Gx Station',
//     incidentTot: 3,
//     injuryTot: 2,
//     fatalityTot: 1,
//     lat: 41.4,
//     long: -88.1,
//   },
//   {
//     ObjectID: 2,
//     gxid: '52398',
//     streetName1: 'Gx Street',
//     streetName2: 'Inc Highway',
//     station: 'Gx Station',
//     incidentTot: 0,
//     injuryTot: 0,
//     fatalityTot: 0,
//     lat: 41.68,
//     long: -87.95,
//   },
// ];

export const countIncByGx = (crossingsArr, incidentsArr) => {
  //loop thru crossings, create an obj in result arr for each crossing
  const gxTally = [];

  for (let i = 0; i < crossingsArr.length; i++) {
    const p = crossingsArr[i].attributes;
    gxTally.push({
      ObjectID: p.OBJECTID,
      gxid: p.CrossingID,
      streetName1: p.Street,
      streetName2: '',
      station1: p.Station,
      station2: [],
      city1: p.City,
      city2: '',
      incidentTot: 0,
      injuryTot: 0,
      fatalityTot: 0,
      lat: p.Latitude,
      long: p.Longitude,
    });
  }

  //if there's 1+ incidents at a crossing, add info from incidents file
  for (let j = 0; j < gxTally.length; j++) {
    for (let k = 0; k < incidentsArr.length; k++) {
      const q = incidentsArr[k].attributes;
      if (gxTally[j].gxid === q.GXID) {
        //note: these 3 properties in gxTally being overwritten with properties from each incident; tho being used as a check of properties in crossing file
        gxTally[j].streetName2 = q.HIGHWAY;
        gxTally[j].station2.push(q.STATION);
        gxTally[j].city2 = q.CITY;
        gxTally[j].incidentTot += 1;
        gxTally[j].injuryTot += q.TOTINJ;
        gxTally[j].fatalityTot += q.TOTKLD;
      }
    }
  }

  return gxTally;
};

export const createGXingItem = (gxSummArr) => {
  //set up Priority List header

  let gxWithIncCount = 0;
  let htmlString = '';
  let htmlStringHeader = '';
  let htmlStringGx = '';

  //for each crossing with 1+ incident, add an item in htmlStringGx
  for (let i = 0; i < gxSummArr.length; i++) {
    let { gxid, streetName1, incidentTot, injuryTot, fatalityTot } = gxSummArr[
      i
    ];
    if (incidentTot > 0) {
      gxWithIncCount += 1;
      htmlStringGx += `<div class="list-item" style="background-color: #fff;">                 
        <div><h3 class="item-header">No. ${gxid}</h3></div>
        <div class="list-detail">
            <p><strong>Street name:</strong>  ${streetName1}</p>
            <p><strong>Total collisions:</strong> ${incidentTot}</p>
            <p><strong>Injuries:</strong> ${injuryTot} &nbsp;| &nbsp;<strong>Fatalities:</strong> ${fatalityTot}</p>
        </div>
    </div>`;
    }
  }
  htmlStringHeader = `<div id="list-content">
    <div id="list-header">
      <h2 id="list-headline">Grade Crossings with Collisions</h2>
      <p style="margin-bottom: 0;">${gxWithIncCount} crossings &nbsp;| &nbsp; XX crossings in IL</p>
      <p style="margin-top: 5px;">Totals: XX collisions &nbsp;| &nbsp; XX injured &nbsp;| &nbsp; XX fatalities</p>
    </div>
    <div id="list-body">`;
  htmlString += htmlStringHeader;
  htmlString += htmlStringGx;
  htmlString += `</div></div>`;
  return htmlString;
};
