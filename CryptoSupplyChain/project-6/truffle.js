const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraKey = "<infura-key>";
//
// const fs = require('fs');
const mnemonic = "mnemonic>";

module.exports = {
  // contracts_directory: "./contracts/coffeeaccesscontrol/",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
        network_id: 4,       // rinkeby's id
        gas: 4500000,        // rinkeby has a lower block limit than mainnet
        gasPrice: 10000000000
    },
  },
  compilers: {
    solc: {
      version: "0.8.12",    // Fetch exact version from solc-bin (default: truffle's version)
      docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: false,
         runs: 200
       },
       evmVersion: "byzantium"
      }
    }
  }
};
