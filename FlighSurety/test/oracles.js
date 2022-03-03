const Test = require("../config/testConfig.js");
const Web3 = require("web3");
//var BigNumber = require('bignumber.js');

contract("Oracles", async (accounts) => {
  const TEST_ORACLES_COUNT = 6;
  let config;
  before("setup contract", async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyApp.registerAirline(config.firstAirline, {
      from: config.owner,
    });
    await config.flightSuretyData.fund({
      from: config.firstAirline,
      value: Web3.utils.toWei("12", "ether"),
    });

    // Watch contract events
    const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;
  });

  it("can register oracles", async () => {
    // ACT
    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
      await config.flightSuretyApp.registerOracle({
        from: accounts[a],
        value: Web3.utils.toWei("1.5", "ether"),
        gas: 6721975,
      });
      const result = await config.flightSuretyApp.getMyIndexes.call({
        from: accounts[a],
      });
      console.log(
        `Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`
      );
    }
  });

  it("can request flight status", async () => {
    // ARRANGE
    const flight = "ND1309"; // Course number
    const responseRegister = await config.flightSuretyApp.registerFlight(
      flight,
      {
        from: config.firstAirline,
      }
    );
    const flightRegisteredEvent = responseRegister.logs.find(
      (l) => l.event === "FlightRegistered"
    );
    const { flightKey, timestamp } = flightRegisteredEvent.args;

    // Submit a request for oracles to get status information for a flight
    await config.flightSuretyApp.fetchFlightStatus(flightKey);
    // ACT

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
      // Get oracle information
      const oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({
        from: accounts[a],
      });
      for (let idx = 0; idx < 3; idx++) {
        try {
          // Submit a response...it will only be accepted if there is an Index match
          await config.flightSuretyApp.submitOracleResponse(
            oracleIndexes[idx],
            config.firstAirline,
            flight,
            timestamp,
            STATUS_CODE_ON_TIME,
            { from: accounts[a] }
          );
        } catch (e) {
          // Enable this when debugging
          console.log(
            "\nError",
            idx,
            oracleIndexes[idx].toNumber(),
            flight,
            timestamp
          );
        }
      }
    }
  });
});
