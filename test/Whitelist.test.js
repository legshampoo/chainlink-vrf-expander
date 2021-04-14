const Whitelist = artifacts.require('./Whitelist.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Whitelist', (accounts) => {
  let contract;

  before(async () => {
    contract = await Whitelist.deployed();
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = contract.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    })

    it('has a name', async () => {
      const name = await contract.name();
      assert.equal(name, 'Whitelist');
    })
  })

  describe('random test', async () => {
    it('returns a random number', async () => {
      const result = await contract.testRandom();
      const testResult = result.logs[0].args.testResult;
      // console.log('testResult: ', testResult.toString());
      // assert.equal(rand, '999');
    })

    it('generates array from getExpanded()', async () => {
      const result = await contract.getExpandedValues();
      const randArray = result.logs[0].args.expanded;
      // console.log('randArray: ', randArray.length);

      // for(let i = 0; i < randArray.length; i++){
      //   console.log(randArray[i].toString());
      // }


      // console.log(result);
      // const array = await result.logs[0];
      // console.log('expanded list: ', array);
      // console.log('converted uint: ', result.logs[0].args.expanded.toString());
    })

    it('generates array using getRandomArray()', async () => {
      const seed = 999;
      const result = await contract.requestRandomArray();
      // const randArray = result.logs[0].args.random;
      // console.log('randArray: ', randArray);
    })
  })
})