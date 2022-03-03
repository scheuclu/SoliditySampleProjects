var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require("bignumber.js");

var Config = async function (accounts) {
  // These test addresses are useful when you need to add
  // multiple users in test scripts
  const testAddresses = [
    "0x1A4d839d8402a2912154b53c91b875b544e240ac",
    "0x688F67322321C6b73b7574F05eB1bfF45A040335",
    "0xC0dF5DC17e69cD63AE4204751aDBb0C854ef51F4",
    "0xcB3651AAb9802b56a379126e6aE07d4eFDbD2f75",
    "0xC466bB3C1Ea59342252C712c7ec73a9d732BeB28"
  ];

  const owner = accounts[0];
  const firstAirline = accounts[1];

  const flightSuretyData = await FlightSuretyData.new();
  const flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);
  await flightSuretyData.authorizeCaller(flightSuretyApp.address);

  return {
    owner: owner,
    firstAirline: firstAirline,
    weiMultiple: new BigNumber(10).pow(18),
    testAddresses: testAddresses,
    flightSuretyData: flightSuretyData,
    flightSuretyApp: flightSuretyApp,
  };
};

module.exports = {
  Config: Config,
};
