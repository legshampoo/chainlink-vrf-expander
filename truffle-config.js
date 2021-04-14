require('dotenv').config();
require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(process.env.RINKEBY_PRIVATE_KEY, `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`)
      },
      network_id: 4,
      gas: 5000000,
      gasPrice: 25000000000
    }
  },

  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis',

  compilers: {
    solc: {
      version: '0.6.6',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
