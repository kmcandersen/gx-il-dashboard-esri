import { typeVehicle, pubXing, trainType } from './category_helpers.js';

//use GXID of clicked point, returned from hitTest, to create an arr of incidents at that crossing
export const getIncidentsBySelGx = (gxid, incidentsArr) => {
  //console.log('incidentsArr[0]', incidentsArr[0]);
  let incidentsByGx = [];
  for (let i = 0; i < incidentsArr.length; i++) {
    let inc = incidentsArr[i].attributes;
    //console.log('INC', inc.GXID);
    if (inc.GXID === gxid) {
      incidentsByGx.push(inc);
    }
  }
  return incidentsByGx;
};

//input to createIncItem:
// 0: {
// CITY: "BARTLETT"
// COUNTY: "COOK"
// DATE: 1462147200000
// GXID: "920581P"
// HIGHWAY: "BARTLETT PEDWAY"
// NARRATIVE: null
// OBJECTID: 285
// PUBLIC: "Y"
// RAILROAD: "NIRC"
// TIME: "6:45 AM"
// TOTINJ: 0
// TOTKLD: 1
// TYPEQ: "C"
// TYPVEH: "K"
// }

//generates html for Incident List for selected crossing (header & list items)
export const createIncItem1 = (selIncArr) => {
  let injuryTot = 0,
    fatalityTot = 0,
    htmlString = '',
    htmlStringIncidents = '';

  //populate htmlString incident info
  for (let i = 0; i < selIncArr.length; i++) {
    let {
      CITY,
      COUNTY,
      DATE,
      HIGHWAY,
      NARRATIVE,
      PUBLIC,
      RAILROAD,
      TIME,
      TOTINJ,
      TOTKLD,
      TYPEQ,
      TYPVEH,
    } = selIncArr[i];

    let date = new Date(DATE).toLocaleDateString();
    injuryTot += TOTINJ;
    fatalityTot += TOTKLD;

    htmlStringIncidents += `<div className="content">
        <div className="header text-bg-gray"><h5>${typeVehicle(
          TYPVEH
        )} Collision: ${date} &nbsp;| &nbsp;${TIME}</h5></div>
        <div className="list-body">
            <div className="description top-margin-item"><strong>Train type:</strong>  ${trainType(
              TYPEQ
            )}</div>

            <div className="description top-margin-item"><strong>Railroad:</strong> ${RAILROAD}</div>

            <div className="description top-margin-item"><strong>Crossing:</strong> ${HIGHWAY}</div>

            <div className="description top-margin-item"><strong> Crossing Type:</strong> ${pubXing(
              PUBLIC
            )}</div>

            <div className="description top-margin-item"><strong>City:</strong> ${CITY} &nbsp;| &nbsp;<strong>County:</strong>
            ${COUNTY}</div>

            <div className="description top-margin-item"><strong>Injured:</strong> ${TOTINJ} &nbsp;| &nbsp;
            <strong>Fatalities:</strong> ${TOTKLD}</div>

            <div className="description top-margin-item"><strong>Description:</strong> ${NARRATIVE}</div>
        </div>
    <div className="ui divider"></div>
    </div>
`;
  }

  //set up Incident List header
  //incl button to "clear" selection & show Priority list
  htmlString = `<div id="list-content"><div id="list-header"><h4>Crossing No. ${
    selIncArr[0].GXID
  }</h4><button id='show-priority' type="button" class="btn btn-primary" >Clear Selection</button><p>${
    selIncArr.length
  } ${selIncArr.length > 1 ? 'incidents' : 'incident'} | ${injuryTot} ${
    injuryTot === 1 ? 'injury' : 'injuries'
  } | ${fatalityTot} ${fatalityTot === 1 ? 'fatality' : 'fatalities'}</p>
    <i className="linkify icon"></i><a href=${`https://icc.illinois.gov/rail-safety/crossing/${selIncArr[0].GXID}/inventory`}>ICC webpage</a></div><div id="list-items">`;

  htmlString += htmlStringIncidents;
  htmlString += `</div></div>`;
  return htmlString;
};

//generates html for Incident List for selected crossing (header & list items)
//revised per restructuring

//for selected gx (click or search)
//loop thru incByGxArr, if gxid matches, populate header summary
//loop thru incidents looking for matching gx, create an incident item
export const createIncItem = (gxid, incByGxArr, incidentArr) => {
  //console.log('incidentArr', incidentArr);
  let injuryTot = 0,
    fatalityTot = 0,
    incidentTot = 0,
    htmlString = '',
    htmlStringIncidents = '';

  //get info for header from array of incident summaries by crossing. 'If' will only be true once.
  for (let i = 0; i < incByGxArr.length; i++) {
    if (gxid === incByGxArr[i].gxid) {
      incidentTot = incByGxArr[i].incidentTot;
      injuryTot = incByGxArr[i].injuryTot;
      fatalityTot = incByGxArr[i].fatalityTot;
    }
  }

  //set up Incident List header
  //incl button to "clear" selection & show list of all crossings with incidents
  htmlString = `<div id="list-content"><div id="list-header"><h4>Crossing No. ${gxid}</h4><button id='show-all' type="button" class="btn btn-primary" >Clear Selection</button><p>${incidentTot} ${
    incidentTot === 1 ? 'collision' : 'collisions'
  } | ${injuryTot} ${
    injuryTot === 1 ? 'injury' : 'injuries'
  } | ${fatalityTot} ${fatalityTot === 1 ? 'fatality' : 'fatalities'}</p>
    <i className="linkify icon"></i><a href=${`https://icc.illinois.gov/rail-safety/crossing/${gxid}/inventory`}>ICC webpage</a></div><div id="list-items">`;

  //loop thru incident array; if gx in array matches selected gx, populate htmlString incident info
  for (let i = 0; i < incidentArr.length; i++) {
    //console.log('gxid', gxid);
    //console.log('incidentArr[0]', incidentArr[0].GXID);
    if (gxid === incidentArr[i].attributes.GXID) {
      let {
        CITY: city,
        COUNTY: county,
        DATE: DATE,
        HIGHWAY: streetName2,
        NARRATIVE: narrative,
        PUBLIC: publc,
        RAILROAD: railroad,
        TIME: time,
        TOTINJ: totInj,
        TOTKLD: totKld,
        TYPEQ: typEq,
        TYPVEH: typVeh,
      } = incidentArr[i].attributes;

      let date = new Date(DATE).toLocaleDateString();

      htmlStringIncidents += `<div className="content">
          <div className="header text-bg-gray"><h5>${typeVehicle(
            typVeh
          )} Collision: ${date} &nbsp;| &nbsp;${time}</h5></div>
          <div className="list-body">
              <div className="description top-margin-item"><strong>Train type:</strong>  ${trainType(
                typEq
              )}</div>
  
              <div className="description top-margin-item"><strong>Railroad:</strong> ${railroad}</div>
  
              <div className="description top-margin-item"><strong>Crossing:</strong> ${streetName2}</div>
  
              <div className="description top-margin-item"><strong> Crossing Type:</strong> ${pubXing(
                publc
              )}</div>
  
              <div className="description top-margin-item"><strong>City:</strong> ${city} &nbsp;| &nbsp;<strong>County:</strong>
              ${county}</div>
  
              <div className="description top-margin-item"><strong>Injured:</strong> ${totInj} &nbsp;| &nbsp;
              <strong>Fatalities:</strong> ${totKld}</div>
  
              <div className="description top-margin-item"><strong>Description:</strong> ${narrative}</div>
          </div>
      <div className="ui divider"></div>
      </div>
  `;
    }
  }

  htmlString += htmlStringIncidents;
  htmlString += `</div></div>`;
  return htmlString;
};
