const Test = require("../config/testConfig.js");
const BigNumber = require("bignumber.js");

contract("Flight Surety Tests", async (accounts) => {
  let config, flightKeys = [];
  before("setup contract", async () => {
    config = await Test.Config(accounts);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/
  it(`(multiparty) has correct initial isOperational() value`, async function () {
    // Get operating status
    const status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false, {
        from: config.testAddresses[2],
      });
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false);
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(
      accessDenied,
      false,
      "Access not restricted to Contract Owner"
    );
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
    await config.flightSuretyData.setOperatingStatus(false);

    let reverted = false;
    try {
      await config.flightSurety.setTestingMode(true);
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true);
  });

  it("Contract owner can register airline", async () => {
    // ACT
    await config.flightSuretyApp.registerAirline(config.firstAirline);
    const result = await config.flightSuretyData.isAirline.call(
      config.firstAirline
    );

    // ASSERT
    assert.equal(result,true,"contract owner was unable to register airline");
  });

  it("(airline) cannot register another Airline using registerAirline() if it is not funded", async () => {
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, {
        from: config.firstAirline,
      });
    } catch (e) {}
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(
      result,
      false,
      "Airline should not be able to register another airline if it hasn't provided funding"
    );
  });

  it("(airline) can provide funding for another airline", async () => {
    // ARRANGE
    const amount = web3.utils.toWei("1.2", "ether");

    // ACT
    await config.flightSuretyData.fund({
      from: config.firstAirline,
      value: amount,
    });

    // ASSERT
    const result = await config.flightSuretyApp.getBalance.call({
      from: config.firstAirline,
    });
    assert.equal(Number(result),Number(amount),"Airline funding failed");
  });

  it("New airline can be registered", async () => {
    // ARRANGE
    const newAirline = accounts[2];

    // ACT
    await config.flightSuretyApp.registerAirline(newAirline, {
      from: config.firstAirline,
    });
    const result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result,true,"Airline unable to register a new airline despite sufficient funding");
  });

  it("An airline can't register another airline if it has less than 1 ether", async () => {
    // ARRANGE
    let newAirline = accounts[3];
    await config.flightSuretyData.fund({
      from: accounts[2],
      value: web3.utils.toWei(".9999999", "ether"),
    });

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, {
        from: accounts[2],
      });
    } catch (e) {}
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result,false,"Airline should not be able to register another airline if it hasn't enought fund");
  });

  it("Starting airline can register 2 more airlines without consensus", async () => {
    // ARRANGE
    await config.flightSuretyData.fund({
      value: web3.utils.toWei("1", "ether"), // to have more than 10 ether in the balance
      from: accounts[2],
    });

    // ACT
    await config.flightSuretyApp.registerAirline(accounts[3], {
      from: accounts[2],
    });
    await config.flightSuretyData.fund({
      value: web3.utils.toWei("1.3", "ether"),
      from: accounts[3],
    });
    await config.flightSuretyApp.registerAirline(accounts[4], {
      from: accounts[3],
    });
    await config.flightSuretyData.fund({
      value: web3.utils.toWei("1.4", "ether"),
      from: accounts[4],
    });
    const resultAirline3 = await config.flightSuretyData.isAirline.call(
      accounts[3]
    );
    const resultAirline4 = await config.flightSuretyData.isAirline.call(
      accounts[4]
    );

    // ASSERT
    assert.equal(resultAirline3, true, "Airline 3 should be registered");
    assert.equal(resultAirline4, true, "Airline 4 should be registered");
  });

  it("Further airlines need 2 votes to be registered", async () => {
    // ARRANGE
    const newAirline = accounts[5];
    assert.equal(
      await config.flightSuretyData.isAirline.call(newAirline),
      false
    );

    // ACT
    await config.flightSuretyApp.registerAirline(newAirline, {
      from: accounts[3],
    });
    assert.equal(
      await config.flightSuretyData.isAirline.call(newAirline),
      false
    );
    await config.flightSuretyApp.registerAirline(newAirline, {
      from: accounts[4],
    });

    // ASSERT
    assert.equal(await config.flightSuretyData.isAirline.call(newAirline),true);
  });

  it("A registered airline can register multiple flights", async () => {
    // ARRANGE
    const airlines = [config.firstAirline, accounts[2]];
    const FLIGHTS_PER_AIRLINE = 3;
    let flightCreated = 0;

    // ACT
    for (let airlineIndex = 0; airlineIndex < airlines.length; airlineIndex++) {
      for (
        let flightIndex = 0;
        flightIndex < FLIGHTS_PER_AIRLINE;
        flightIndex++
      ) {
        const flight = `FLIGHT_${airlineIndex}_${flightIndex}`;
        const result = await config.flightSuretyApp.registerFlight(flight, {
          from: airlines[airlineIndex],
        });
        const flightKey = result.logs.find(
          (log) => log.event === "FlightRegistered"
        ).args[0];

        assert.equal(
          web3.utils.isHex(flightKey),
          true,
          "Flight key must be a hex number"
        );

        flightKeys.push(flightKey);
        flightCreated++;
      }
    }

    // ASSERT
    assert.equal(
      flightCreated,
      airlines.length * FLIGHTS_PER_AIRLINE,
      "Not all flights were created"
    );
  });

  // creditInsurees
  // pay

  it("Insurance for a flight can be bought", async () => {
    // ARRANGE
    const insuree = accounts[3];
    const flightKey = flightKeys[0];
    const value = web3.utils.toWei("0.5", "ether");

    // ACT
    await config.flightSuretyData.buyInsurance(flightKey, { from: insuree, value });
    const result = await config.flightSuretyData.getInsuranceAmount.call(
      flightKey,
      { from: insuree }
    );

    // ASSERT
    assert.equal(Number(result),Number(value),"Insurance purchase failed");
  });

  it("Insurace can be 1 ether max", async () => {
    // ARRANGE
    const insuree = accounts[3];
    const flightKey = flightKeys[1];
    const value = web3.utils.toWei("1.00000001", "ether");
    let error = false;

    // ACT
    try {
      await config.flightSuretyData.buy(flightKey, { from: insuree, value });
    } catch (e) {
      error = true;
    }

    // ASSERT
    assert.equal(
      error,
      true,
      "It should not be possible to buy insurance for more than 1 ether."
    );
  });
});
