var SampleToken = artifacts.require("SampleToken");

module.exports = function(deployer) {
  deployer.deploy(SampleToken, "UdacityExampleToken", "UET", 1000);
};