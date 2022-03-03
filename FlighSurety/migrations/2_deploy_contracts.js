const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const Web3 = require("web3");

const fs = require("fs");

module.exports = async function (deployer) {
  const firstAirline = "0x090ab7637792d6D77FB395cd0003f71D3CD2Dfcd";
  await deployer.deploy(FlightSuretyData);
  const flightSuretyDataInstance = await FlightSuretyData.deployed();
  await deployer.deploy(FlightSuretyApp, flightSuretyDataInstance.address);
  const flightSuretyAppInstance = await FlightSuretyApp.deployed();
  await flightSuretyDataInstance.authorizeCaller(
    flightSuretyAppInstance.address
  );
  await flightSuretyAppInstance.registerAirline(firstAirline);
  await flightSuretyDataInstance.fund({
    from: firstAirline,
    value: Web3.utils.toWei("1.2", "ether"),
  });

  const config = {
    localhost: {
      url: "http://localhost:8545",
      dataAddress: FlightSuretyData.address,
      appAddress: FlightSuretyApp.address,
    },
  };
  fs.writeFileSync(
    __dirname + "/../src/dapp/config.json",
    JSON.stringify(config, null, "\t"),
    "utf-8"
  );
  fs.writeFileSync(
    __dirname + "/../src/server/config.json",
    JSON.stringify(config, null, "\t"),
    "utf-8"
  );
};
