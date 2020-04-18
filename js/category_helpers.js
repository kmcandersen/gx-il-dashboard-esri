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
    case 'F':
      return 'Bus';
    case 'G':
      return 'School bus';
    case 'H':
      return 'Motorcycle';
    case 'K':
    case 'Q':
      return 'Ped/Bicycle';
    default:
      return '';
  }
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
