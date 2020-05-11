import { typeVehicle } from './category_helpers.js';

//timeChartProperties for Chart constructor
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
      fontSize: 16,
      fontColor: '#4c4c4c',
      //   fontStyle: 'normal',
    },
    tooltips: {
      displayColors: false,
      callbacks: {
        label: (tooltipItems, data) => {
          let value = data.datasets[0].data[tooltipItems.index];
          return `${value} ${value === 1 ? 'collision' : 'collisions'}`;
        },
      },
    },
    scales: {
      xAxes: [
        {
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
          },
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            min: 0,
            padding: 8,
          },
          gridLines: {
            drawTicks: false,
          },
        },
      ],
    },
  },
};

//vehTypChartProperties for Chart constructor
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
      fontColor: '#4c4c4c',
      fontSize: 16,
      //   fontStyle: 'normal',
    },
    tooltips: {
      displayColors: false,
      callbacks: {
        label: (tooltipItems, data) => {
          let value = data.datasets[0].data[tooltipItems.index];
          return `${value} ${value === 1 ? 'collision' : 'collisions'}`;
        },
      },
    },
    scales: {
      xAxes: [
        {
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
          },
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            min: 0,
            padding: 8,
          },
          gridLines: {
            drawTicks: false,
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

//compile data for timeCountChart - year (selected gx)
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

//compile data for timeCountChart - month (all gx)
//arr = allIncidents
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

//year bars in timeCountChart - month grouped by color (1 for ea of 4 years)
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

//show 1 label per year, for timeCountChart - month
export const labelsByYear = (start, end) => {
  const labels = [];
  const years = [];
  const labelIdx = [];
  //create list of years in the range to use as a 2nd loop
  for (let i = start; i <= end; i++) {
    years.push(i);
  }
  //create list of indices that will hold a year
  //labelIdx = {1,13,25,37,49} so label is aligned with Feb, roughly the start of the year; let j = 0: label aligned with Jan
  for (let j = 1; j < years.length * 12; j += 12) {
    labelIdx.push(j);
  }
  for (let k = 0; k < years.length * 12; k++) {
    if (labelIdx.includes(k)) {
      //push the year at that same idx in years:
      //get the index of labelIdx where the matching # found
      let yearLabelIdx = labelIdx.indexOf(k);
      labels.push(String(years[yearLabelIdx]));
    } else {
      labels.push('');
    }
  }
  return labels;
};

export const formatMoYearKeys = (arr) => {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    let year = arr[i].slice(0, 4);
    let month = arr[i][4] === '0' ? arr[i].slice(5) : arr[i].slice(4);
    result.push(`${month}/${year}`);
  }
  return result;
};
