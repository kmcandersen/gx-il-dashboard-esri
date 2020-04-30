import { typeVehicle, pubXing, trainType } from './category_helpers.js';

//generates html for Incident List for selected crossing (header & list items)

//for selected gx (click or search)
//loop thru incByGxArr, if gxid matches, populate header summary
//loop thru incidents looking for matching gx, create an incident item
export const createIncItem = (gxid, incByGxArr, incidentArr) => {
  let railroad1 = '',
    streetName1 = '',
    station = '',
    county2 = '',
    pubXing2 = '',
    injuryTot = 0,
    fatalityTot = 0,
    incidentTot = 0,
    htmlString = '',
    htmlStringIncidents = '';

  //get *crossing-specific* info for header from array of incident summaries by crossing. 'If' will only be true once.
  for (let i = 0; i < incByGxArr.length; i++) {
    if (gxid === incByGxArr[i].gxid) {
      railroad1 = incByGxArr[i].railroad1;
      streetName1 = incByGxArr[i].streetName1;
      station = incByGxArr[i].station;
      county2 = incByGxArr[i].county2;
      pubXing2 = incByGxArr[i].pubXing2;
      incidentTot = incByGxArr[i].incidentTot;
      injuryTot = incByGxArr[i].injuryTot;
      fatalityTot = incByGxArr[i].fatalityTot;
    }
  }

  //set up Incident List header
  //incl button to "clear" selection & show list of all crossings with incidents
  htmlString += `<div id="list-content">
    <div class="list-header">
      <h2 class="list-headline">Crossing No. ${gxid}</h2>
      <div class="list-header-detail">
        <p><strong>Railroad:</strong> ${railroad1}</p> 
        <p><strong>Crossing:</strong> ${streetName1}</p>  
        <p><strong> Crossing Type:</strong> ${pubXing(pubXing2)}</p> 
        <p><strong>City:</strong> ${station} &nbsp;| &nbsp;<strong>County:</strong>
        ${county2}</p>
      </div>
      <p>${incidentTot} ${
    incidentTot === 1 ? 'collision' : 'collisions'
  } | ${injuryTot} ${injuryTot === 1 ? 'injury' : 'injured'} | ${fatalityTot} ${
    fatalityTot === 1 ? 'fatality' : 'fatalities'
  }
      </p>
      <div class="links-row">
        <button id='show-all' type="button" class="btn btn-primary" >Clear Selection</button>
        <div class="item-headline"><div class="esri-icon-link"></div><a href=${`https://icc.illinois.gov/rail-safety/crossing/${gxid}/inventory`}>ICC webpage</a></div>
      </div>
    </div>
    <div id="list-body">`;

  //loop thru incident array, for *incident-specific* data; if gx in array matches selected gx, populate htmlString incident info
  for (let i = 0; i < incidentArr.length; i++) {
    if (gxid === incidentArr[i].attributes.GXID) {
      let {
        DATE: DATE,
        NARRATIVE: narrative,
        TIME: time,
        TOTINJ: totInj,
        TOTKLD: totKld,
        TYPEQ: typEq,
        TYPVEH: typVeh,
      } = incidentArr[i].attributes;

      let date = new Date(DATE).toLocaleDateString();

      htmlStringIncidents += `<div class="list-item">
          <div class="item-header">
            <h3 class="inc-item-headline">${typeVehicle(
              typVeh
            )} Collision: ${date} &nbsp;| &nbsp;${time}</h3>
          </div>
          <div class="item-detail">
              <p><strong>Train type:</strong>  ${trainType(typEq)}</p>   
              <p><strong>Injured:</strong> ${totInj} &nbsp;| &nbsp;
              <strong>Fatalities:</strong> ${totKld}</p> 
              <p><strong>Description:</strong> ${narrative}</p>
          </div>
      </div>
  `;
    }
  }

  htmlString += htmlStringIncidents;
  htmlString += `</div></div>`;
  return htmlString;
};
