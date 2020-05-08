import { typeVehicle } from './category_helpers.js';

//calculates total collisions by vehicle type, for a crossing (for veh type Chart)
export const getVehCatTotGx = (obj, typVeh) => {
  let typVehCat = typeVehicle(typVeh);
  for (let key in obj.incByTypEq) {
    if (key === typVehCat) {
      obj.incByTypEq[key] += 1;
    }
  }
};

//calculates total collisions by vehicle type, for ALL crossings
export const getVehCatTotAll = (arr) => {
  let vehTypChartData = {};
  for (let key in arr[0].incByTypEq) {
    vehTypChartData[key] = 0;
  }
  for (let i = 0; i < arr.length; i++) {
    for (let key in arr[i].incByTypEq) {
      if (arr[i].incByTypEq[key] > 0) {
        vehTypChartData[key] += 1;
      }
    }
  }
  return vehTypChartData;
};

export const countIncByYearMo = (arr, start, end) => {
  //create the obj to hold the count; obj has a key for each month within the start & end years
  const incByMonthTally = {};
  for (let i = start; i <= end; i++) {
    let year = String(i);
    for (let j = 1; j <= 12; j++) {
      let month;
      let yearmo;
      j < 10 ? (month = '0' + String(j)) : (month = String(j));
      yearmo = year + month;
      incByMonthTally[yearmo] = 0;
    }
  }
  //loop thru allIncidents arr (output of incidents.queryFeatures), increments 'yearmo' value by 1 if  the year, month of the incident matches the key
  for (let k = 0; k < arr.length; k++) {
    let timestamp = new Date(arr[k].attributes.DATE);
    let month = timestamp.getMonth() + 1;
    month < 10 ? (month = '0' + String(month)) : (month = String(month));

    let year = timestamp.getFullYear();
    year = String(year);
    let yearmo = year + month;
    incByMonthTally[yearmo] += 1;
  }
  return incByMonthTally;
};

//year bars in monthCountChart grouped by color (1 for ea of 4 years)
export const colorBarsByYear = () => {
  const colors = ['#c6b29f', '#A6B6C2', '#A7A1AB', '#B0B6A5', '#d4b1ad'];
  const result = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < 12; j++) {
      result.push(colors[i]);
    }
  }
  return result;
};
