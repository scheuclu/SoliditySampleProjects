
var Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');

contract('ExerciseC6A', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
  });


  it('only contract owner can register new user', async () => {
    
    // ARRANGE
    let caller = accounts[0];
    let newUser1 = config.testAddresses[1];
    let newUser2 = config.testAddresses[2]; 

    // Set the status to operational
    await config.exerciseC6A.registerUser(newUser1, false, {from: caller});
    let result = await config.exerciseC6A.isUserRegistered.call(newUser1); 

    // ASSERT
    assert.equal(result, true, "Contract owner cannot register new user");


    //Set the status from a non-owner account. this should fail
    await truffleAssert.fails(
      config.exerciseC6A.registerUser(newUser2, false, {from: newUser2}),
      "Caller is not contract owner"
    );
  });


  it('multisig works correctly', async () => {
    
    // ARRANGE
    let admin1 = accounts[1];
    let admin2 = accounts[2];
    let admin3 = accounts[3];
    
    await config.exerciseC6A.registerUser(admin1, true, {from: config.owner});
    await config.exerciseC6A.registerUser(admin2, true, {from: config.owner});
    await config.exerciseC6A.registerUser(admin3, true, {from: config.owner});
    
    let startStatus = await config.exerciseC6A.isOperational.call(); 
    let changeStatus = !startStatus;

    //Set the status from first admin. this should fail
    await config.exerciseC6A.setOperatingStatus(changeStatus, {from: admin1})
    let newStatus = await config.exerciseC6A.isOperational.call();
    assert.equal(newStatus, startStatus, "Multi-party call failed");

    //Set the status from second admin. this should succeed
    await config.exerciseC6A.setOperatingStatus(changeStatus, {from: admin2})
    newStatus = await config.exerciseC6A.isOperational.call();
    assert.equal(newStatus, changeStatus, "Multi-party call failed");

    //Set the status again. This should fail.
    startStatus = await config.exerciseC6A.isOperational.call(); 
    changeStatus = !startStatus;
    await config.exerciseC6A.setOperatingStatus(changeStatus, {from: admin3})
    newStatus = await config.exerciseC6A.isOperational.call();
    assert.equal(newStatus, startStatus, "Multi-party call failed");

  });

});
