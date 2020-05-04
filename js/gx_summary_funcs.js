//run countIncByGx to create a new array, with an object for each crossing in IL, and a summary of characteristics and incidents (if applicable) at the crossing. This array is the data source for the incByCrossingLayer feature layer in main.js, and a definitionExpression limits visible points to the crossings with incidents.

//variable name + 1: from crossings geojson, variable name + 2: from incidents geojson
export const countIncByGx = (crossingsArr, incidentsArr) => {
  //loop thru crossings, create an obj in result arr for each crossing
  const gxTally = [];

  for (let i = 0; i < crossingsArr.length; i++) {
    const p = crossingsArr[i].attributes;
    gxTally.push({
      ObjectID: p.OBJECTID,
      gxid: p.CrossingID,
      railroad1: p.Railroad,
      streetName1: p.Street,
      streetName2: '',
      station1: p.Station,
      station2: '',
      station: '',
      city2: [],
      county2: '',
      pubXing2: '',
      incidentTot: 0,
      injuryTot: 0,
      fatalityTot: 0,
      lat: p.Latitude,
      long: p.Longitude,
    });
  }

  //if there's 1+ incidents at a crossing, add data from incidents file
  for (let j = 0; j < gxTally.length; j++) {
    for (let k = 0; k < incidentsArr.length; k++) {
      const q = incidentsArr[k].attributes;
      if (gxTally[j].gxid === q.GXID) {
        //note: the below properties in gxTally being overwritten with properties from each incident; tho being used as a check of properties in crossing file
        //properties being Pushed so I can inspect values coming from Incidents records
        gxTally[j].streetName2 = q.HIGHWAY;
        gxTally[j].station2 = q.STATION;
        gxTally[j].city2.push(q.CITY);
        gxTally[j].county2 = q.COUNTY;
        gxTally[j].pubXing2 = q.PUBLIC;
        gxTally[j].incidentTot += 1;
        gxTally[j].injuryTot += q.TOTINJ;
        gxTally[j].fatalityTot += q.TOTKLD;
      }
    }
    //prefer to use 'station1' from crossings file, bc that is what's used in Search widget, but if that's null, use 'station2' from incidents file.
    gxTally[j].station =
      gxTally[j].station1 === null ? gxTally[j].station2 : gxTally[j].station1;
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
  for (let i = 0; i < gxSummArr.length; i++) {
    let {
      gxid,
      streetName1,
      station,
      incidentTot,
      injuryTot,
      fatalityTot,
      lat,
      long,
    } = gxSummArr[i];
    if (incidentTot > 0) {
      //for gx with inc, add to totals
      gxWithIncCount += 1;
      incidentAll += incidentTot;
      injuryAll += injuryTot;
      fatalityAll += fatalityTot;

      let otherGxCount = (gxSummArr.length - gxWithIncCount).toLocaleString();

      htmlStringHeader = `<div id="list-content">
        <div class="list-header">
          <h2 class="list-headline"> <span class="collision-sym">●</span> ${gxWithIncCount} Grade Crossings with Collisions</h2>
          <p style="margin-top: 0;"><span class="no-collision-sym">●</span> ${otherGxCount} other crossings</p>
          <p style="margin-top: 5px;">${incidentAll} collisions &nbsp;|&nbsp; ${injuryAll} injured &nbsp;|&nbsp; ${fatalityAll} fatalities</p>
        </div>
        <div class="list-subhead">
          <p>Priority Crossings</p>
          <p>3+ collisions</p>
          <p>Hover on list item to highlight map location</p>
        </div>
        <div id="list-body" class="priority-gx">
`;

      //for gx with > 2 inc, also create item for DOM
      if (incidentTot > 2) {
        htmlStringGx += `<div class="list-item" data-gxid=${gxid}>                
          <div class="item-header">
            <h3 class="item-headline" data-lat=${lat} data-long=${long}>No. ${gxid}</h3>
          </div>
  
          <div class="item-detail">
              <p><strong>Street name:</strong>  ${streetName1}</p>
              <p><strong>In/near:</strong>  ${station}</p>
              <p><strong>Total collisions:</strong> ${incidentTot} &nbsp;| &nbsp; <strong>Injured:</strong> ${injuryTot} &nbsp;| &nbsp;<strong>Fatalities:</strong> ${fatalityTot}</p>
          </div>
      </div>`;
        //priority inc
      }
      //all inc
    }
    //for loop
  }

  htmlString += htmlStringHeader;
  htmlString += htmlStringGx;
  htmlString += `</div></div>`;
  return htmlString;
};
