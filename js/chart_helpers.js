import { typeVehicle } from './category_helpers.js';

//time Chart properties for constructor
export const timeChartProperties = {
  type: 'bar',
  data: {
    labels: '',
    datasets: [
      {
        borderColor: 'rgb(255, 255, 255)',
        borderWidth: 0,
        data: '',
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    title: {
      display: true,
      fontFamily: 'Avenir Next W00',
    },
    scales: {
      xAxes: [
        {
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
          },
        },
      ],
    },
  },
};

//vehicle type Chart properties for constructor
export const vehTypChartProperties = {
  type: 'bar',
  data: {
    // labels: vehTypes,
    datasets: [
      {
        backgroundColor: ['#c6b29f', '#A6B6C2', '#A7A1AB', '#B0B6A5'],
        borderColor: 'rgb(255, 255, 255)',
        borderWidth: 0,
        data: [0, 0, 0, 0],
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Collisions by Type',
      fontFamily: 'Avenir Next W00',
    },
    scales: {
      xAxes: [
        {
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
          },
        },
      ],
    },
  },
};

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

//arr = incByGxArr
export const countIncByYear = (arr, gxid, start, end) => {
  const incByYearTally = {};
  for (let i = start; i <= end; i++) {
    incByYearTally[i] = 0;
  }
  for (let j = 0; j < arr.length; j++) {
    if (arr[j].gxid === gxid) {
      for (let k = 0; k < arr[j].incTimestamps.length; k++) {
        let timestamp = new Date(arr[j].incTimestamps[k]);
        let year = timestamp.getFullYear();
        incByYearTally[year] += 1;
      }
    }
  }
  return incByYearTally;
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
