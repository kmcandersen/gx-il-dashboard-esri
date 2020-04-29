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
        gxTally[j].station2 = q.STATION;
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
  let incidentAll = 0;
  let fatalityAll = 0;
  let injuryAll = 0;
  let htmlString = '';
  let htmlStringHeader = '';
  let htmlStringGx = '';

  //for each crossing with 1+ incident, add an item in htmlStringGx
  //re. "station" var: prefer to use 'station1' from crossings file, bc that is what's used in Search widget, but if that's null, use 'station2' from incidents file.
  for (let i = 0; i < gxSummArr.length; i++) {
    let {
      gxid,
      streetName1,
      incidentTot,
      injuryTot,
      fatalityTot,
      lat,
      long,
    } = gxSummArr[i];
    if (incidentTot > 0) {
      gxWithIncCount += 1;
      incidentAll += incidentTot;
      injuryAll += injuryTot;
      fatalityAll += fatalityTot;
      let station =
        gxSummArr[i].station1 === null
          ? gxSummArr[i].station2
          : gxSummArr[i].station1;
      htmlStringGx += `<div class="list-item" data-gxid=${gxid}>                
        <div class="item-header"><h3 class="item-headline" data-lat=${lat} data-long=${long}>No. ${gxid}</h3></div>
        <div class="item-detail">
            <p><strong>Street name:</strong>  ${streetName1}</p>
            <p><strong>In/near:</strong>  ${station}</p>
            <p><strong>Total collisions:</strong> ${incidentTot} &nbsp;| &nbsp; <strong>Injured:</strong> ${injuryTot} &nbsp;| &nbsp;<strong>Fatalities:</strong> ${fatalityTot}</p>
        </div>
    </div>`;
    }
  }
  htmlStringHeader = `<div id="list-content">
    <div class="list-header">
      <h2 class="list-headline"> <span class="collision-sym">●</span> ${gxWithIncCount} Grade Crossings with Collisions</h2>
      <p style="margin-top: 0;"><span class="no-collision-sym">●</span> of ${gxSummArr.length.toLocaleString()} total crossings</p>
      <p style="margin-top: 5px;">${incidentAll} collisions &nbsp;|&nbsp; ${injuryAll} injured &nbsp;|&nbsp; ${fatalityAll} fatalities</p>
    </div>
    <div id="list-body">`;
  htmlString += htmlStringHeader;
  htmlString += htmlStringGx;
  htmlString += `</div></div>`;
  return htmlString;
};
