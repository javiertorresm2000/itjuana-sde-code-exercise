/**  VARIABLES  **/
var pathNames, pathAdresses
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const fs = require('fs');

/** FUNCTION DECLARATION **/
const init = () => {
  readline.question(`Write the path of the addresses document: `, path => {
    pathAdresses = path
    readline.question(`Write the path of the names document: `, path => {
      pathNames = path
      readFiles(pathAdresses, pathNames )
      readline.close();
    });
  });
}

const readFiles = (path1, path2) => {
  try {
    const addresses = fs.readFileSync(path1, 'utf8');
    const names = fs.readFileSync(path2, 'utf8');
    processFiles(addresses, names)
  } catch (err) {
    console.log(err);
  }
}

const processFiles = (addresses, names) => {
  const addressesSplitted = addresses.split('\r\n')
  const addressesQty = addressesSplitted.length
  const namesSplitted = names.split('\r\n')
  const drivers = getDrivers(namesSplitted, namesSplitted.length)
  const driversQty = drivers.length
  let services = []

  for(let i = 0; i < addressesQty; i++){
    let service = {
      street: addressesSplitted[i],
      drivers: [],
      ssList: [],
      isSorted: false
    }
    /** Validate if the address length is even
     * this means that if it is divided by 2, the remainder is 0
     * if not then the address length is odd
     */ 
    if(addressesSplitted[i].length % 2 === 0) {
      for(let x = 0; x < driversQty; x++){
        let driver = {
          name: namesSplitted[x],
          // Get the quantity of vowels in the driver's name and multiply by 1.5
          ss: namesSplitted[x].match(/[aeiou]/gi).length * 1.5,
          nameL: namesSplitted[x].length,
          addrL: addressesSplitted[i].length,
        }

        /** Validate if the Greatest Common Divisor is greater than "1", 
         * this means that both values Address Length and Name Length have more than 1 common factor
         * if that's the case, then the value will be increased by 50% above the base SS.
         */ 
        if(gcd(driver.addrL, driver.nameL) !== 1) {
          driver.ss *= 1.5
        }

        drivers[drivers.findIndex(d => d.name === driver.name)].ssValues.push(driver.ss)

        service.drivers.push(driver)
        service.ssList.push(driver.ss)
      }
    } else {
      for(let x = 0; x < driversQty; x++){
        let driver = {
          name: namesSplitted[x],
          // Get the quantity of consonants in the driver's name and multiply by 1.5
          ss: namesSplitted[x].match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/gi).length * 1,
          addrL: addressesSplitted[i].length,
          nameL: namesSplitted[x].length,
          isSorted: false
        }

        if(gcd(driver.addrL, driver.nameL) !== 1) {
          driver.ss *= 1.5
        }

        drivers[drivers.findIndex(d => d.name === driver.name)].ssValues.push(driver.ss)

        service.drivers.push(driver)
        service.ssList.push(driver.ss)
      }
    }
    services.push(service)
  }

  /** The services array is being iterated to sort the ssList and the drivers in Descendant way
   * This will help us to have the driver with the highest SS score of each service,
   *  at the top of the drivers list, as well as the ssList with the highes ssScores
   */
  for(let i = 0; i < services.length; i++){
    services[i].ssList = sortSSList(services[i].ssList)
    services[i].drivers = sortDrivers(services[i].drivers, services[i].ssList)
  }

  /** Then the services are being sorted in Descendant way by the max SS of each service
   * This means that the service to which the driver with the highest SS score of all services belongs, 
   * will be at the top of the services list  
   */
  services = sortServicesBySS(services, addressesQty)

  /** Uncomment this in case you need to see the sorted services
   * 
   * console.log('--------------- SORTED SERVICES -------------');
   * for(let i = 0; i < addressesQty; i++){
   *   console.log(services[i]);
   * }
  */

  assignServices(services, addressesQty, drivers)
  readline.close()
}

const getDrivers = (names, length) => {
  let drivers = []
  for(let i = 0 ; i < length; i++) {
    let driver = {
      name: names[i],
      ssValues: [],
      isAssigned: false
    }
    drivers.push(driver)
  }

  return drivers
}

const gcd = (a, z) => a ? gcd(z % a, a) : z

const sortSSList = (list) => {
  return list.sort(function(a, b){return b - a});
}

const sortDrivers = (drivers, ssList) => {
  let driversSorted = []

  for(let i = 0; i < ssList.length; i++) {
    let d = drivers[drivers.findIndex(driver => driver.ss === ssList[i] && !driver.isSorted)]
    d.isSorted = true
    driversSorted.push(d)
  } 

  return driversSorted
}

const sortServicesBySS = (services, sLength) => {
  let servicesSorted = [], maxSSList = []

  for(let i = 0; i < sLength; i++) {
    maxSSList.push(services[i].ssList[0])
  }
  maxSSList = maxSSList.sort(function(a, b){return b - a});

  for(let i = 0; i < sLength; i++) {
    let s = services[services.findIndex(service => service.ssList[0] === maxSSList[i] && !service.isSorted)]
    s.isSorted = true
    servicesSorted.push(s)
  }

  return servicesSorted
}

const assignServices = (services, sLength, drivers, dLength) => {
  let serviceAssigned
  let correlation = []
  for(let i = 0; i < sLength; i++) {
    serviceAssigned = {
      street: services[i].street,
      driver: 'Not enough drivers',
      ss: undefined
    }
    for(let y = 0; y < services[i].drivers.length; y++){
      let dIndex = drivers.findIndex(driver => driver.name === services[i].drivers[y].name)
      if(!drivers[dIndex].isAssigned) {
        serviceAssigned.driver = drivers[dIndex].name
        serviceAssigned.ss = services[i].drivers[y].ss
        drivers[dIndex].isAssigned = true
        break;
      }
    }
    correlation.push(serviceAssigned)
  }
  printCorrelation(correlation, sLength);
}

const printCorrelation = (services, length) => {
  console.log('--------------- CORRELATION -------------');
  for(let i = 0; i < length; i++) {
    console.log(`Service ${i+1}`)
    console.log(`Street: ${services[i].street}`)
    console.log(`Driver: ${services[i].driver}`)
    console.log(`SS: ${services[i].ss}`)
    console.log('___________________________________');
  }
}

/** START APP */
init()
