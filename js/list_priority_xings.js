//to send to CrossingItem to identify the Priority xings and provide some totals to incl in the Details

// countIncByGx(incidentArr.features)
// returns crossings with more than 2 incidents (11)

export const countIncByGx = (incidentsArr) => {
  const gxTally = [];
  const gxTallyPriority = [];
  const gxTallyKeys = [];

  //for ea item in input arr
  for (let i = 0; i < incidentsArr.length; i++) {
    const p = incidentsArr[i].attributes;

    //if not in check array, add it & add to check arr
    if (!gxTallyKeys.includes(p.GXID)) {
      gxTally.push({
        [p.GXID]: {
          streetName: p.HIGHWAY,
          incidentTot: 1,
          injuryTot: p.TOTINJ,
          fatalityTot: p.TOTKLD,
        },
      });
      gxTallyKeys.push(...[p.GXID]);
    } else {
      //look thru gxTally for matching gx
      for (let j = 0; j < gxTally.length; j++) {
        if (Object.keys(gxTally[j])[0] === p.GXID) {
          gxTally[j][p.GXID].incidentTot += 1;
          gxTally[j][p.GXID].injuryTot += p.TOTINJ;
          gxTally[j][p.GXID].fatalityTot += p.TOTKLD;
        }
      }
    }
  }
  for (let k = 0; k < gxTally.length; k++) {
    for (let gx in gxTally[k]) {
      if (gxTally[k][gx].incidentTot > 2) {
        gxTallyPriority.push(gxTally[k]);
      }
    }
  }

  return gxTallyPriority;
};

//TODO: modify func to order the countedGxIncObj by # of incidents, IF 3+
//NOT USED
//   export const priorityGx = (incObjArr) => {
//     console.log('incObjArr', incObjArr);

//     //input arr is coming in, but something's wrong inside
//     var sortable = [];

//     for (let i = 0; i < incObjArr.length; i++) {
//       for (let gx in incObjArr[i]) {
//         for (let item in incObjArr[i][gx]) {
//           console.log('incObjArr[0][gx][item]', incObjArr[0][gx]);

//           if (incObjArr[i][gx][item].incidentTot > 2) {
//             sortable.push(incObjArr[i][item]);
//           }
//         }
//       }
//     }

//in this dataset, gx with highest inc # (4) is first among gxings with incidents > 2; rest are 3. Will likely need to modify this sorting func with a future dataset to inc nested obj. Currently, "sorted" not actually sorted.
// sortable.sort(function(a, b) {
//     return b[1] - a[1];
// });
//     console.log('SORTABLE', sortable);
//     return sortable;
//   };

// 9:
// 163616Y:
// streetName: "PRIVATE ROAD"
// incidents: 3
// injuries: 1
// fatalities: 0

export const createPXingItem = (priorityGxArr) => {
  //set up Priority List header
  let htmlString = `<div id="list-content"><div id="list-header"><h4>Top ${priorityGxArr.length} Priority Crossings</h4></div><div id="list-items">`;
  for (let i = 0; i < priorityGxArr.length; i++) {
    let gxid, streetName, incidentTot, injuryTot, fatalityTot;
    for (let gx in priorityGxArr[i]) {
      gxid = gx;
      for (let item in priorityGxArr[i]) {
        streetName = priorityGxArr[i][item].streetName;
        incidentTot = priorityGxArr[i][item].incidentTot;
        injuryTot = priorityGxArr[i][item].injuryTot;
        fatalityTot = priorityGxArr[i][item].fatalityTot;
      }
    }

    htmlString += `<div className="content">                 
        <div className="header text-bg-gray"><h5>No. ${gxid}</h5></div>
        <div className="list-body">
            <div className="description top-margin-item"><strong>Street name:</strong>  ${streetName}</div>
            <div className="description top-margin-item"><strong>Total collisions:</strong> ${incidentTot}</div>
            <div className="description"><strong>Injuries:</strong> ${injuryTot} &nbsp;| &nbsp;<strong>Fatalities:</strong> ${fatalityTot}</div>
        </div>
    <div className="ui divider"></div>
    </div>`;
  }
  htmlString += `</div></div>`;
  return htmlString;
};
