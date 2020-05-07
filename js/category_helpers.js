//type of road user
export const typeVehicle = (typveh) => {
  switch (typveh) {
    case 'A':
    case 'E':
      return 'Auto';
    case 'B':
    case 'C':
    case 'D':
      return 'Truck';
    case 'K':
    case 'Q':
      return 'Ped/Bicycle';
    default:
      return 'Other';
  }
};

//calculates total collisions by vehicle type, for a crossing
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

//public or private crossing
export const pubXing = (pub) => {
  switch (pub) {
    case 'Y':
      return 'Public';
    case 'N':
      return 'Private';
    default:
      return 'Unknown';
  }
};

//type of train involved
export const trainType = (typeq) => {
  switch (typeq) {
    case '1':
      return 'Freight';
    case '2':
    case '3':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
      return 'Passenger';
    case '4':
    case '7':
    case '9':
    case 'A':
      return 'Yard/Maintenance';
    default:
      return 'Other';
  }
};

//convert CntyCD (FIPS County Code) in gx_incidents to County Name
export const getCountyName = (arr, code) => {
  for (let i = 0; i < arr.length; i++) {
    for (let key in arr[i]) {
      if (Number(key) === code) return arr[i][key];
    }
  }
};
