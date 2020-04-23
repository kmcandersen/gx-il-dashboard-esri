//run countIncByGx to create gx summary arr of objs, incl lat/long AND GX WITH NO INCIDENTS

//countIncByGx(il_crossings.features)

// GOAL:
// const data = [
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
    const p = crossingsArr[i].properties;
    gxTally.push({
      ObjectID: p.OBJECTID,
      gxid: p.CrossingID,
      streetName1: p.Street,
      streetName2: '',
      station1: p.Station,
      station2: '',
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
      const q = incidentsArr[k].properties;
      if (gxTally[j].gxid === q.GXID) {
        gxTally[j].streetName2 = q.HIGHWAY;
        gxTally[j].station2 = q.STATION;
        gxTally[j].incidentTot += 1;
        gxTally[j].injuryTot += q.TOTINJ;
        gxTally[j].fatalityTot += q.TOTKLD;
      }
    }
  }

  return gxTally;
};

// export const runCountIncByGx = () => {
//   const incidents = './gx_incidents.geojson';
//   const parsedIncidents = JSON.parse(incidents);
//   console.log(parsedIncidents.features);
// };
