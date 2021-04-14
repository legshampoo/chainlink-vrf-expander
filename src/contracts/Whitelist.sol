pragma solidity 0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract Whitelist is VRFConsumerBase {
  string public name;
  bytes32 internal keyHash;
  uint256 internal fee;
  bool internal expanded;
  uint256 numExpandedValues = 0;
  
  uint256 public randomResult;

  event Result(bytes32 id, uint256 userProvidedSeed, uint256 randomResult, uint256 time);
  event ExpandedValues(uint256[] expanded);
  event keccakToInt(uint256 converted);

  /**
    * Constructor inherits VRFConsumerBase
    * 
    * Following the docs here:
    * https://docs.chain.link/docs/get-a-random-number
    */
  constructor() 
      VRFConsumerBase(
          0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
          0x01BE23585060835E02B77ef475b0Cc51aA1e0709  // LINK Token
      ) public
  {
      name = 'Whitelist';
      keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
      fee = 0.1 * 10 ** 18; // 0.1 LINK (varies by network)
  }
  
  //This is the function called by front end for a single random number
  //basically just a sanity test to make sure the VRF call is going through correctly
  function requestRandomNumber(uint256 seed) public payable returns (bool) {
    expanded = false;  //do not extrapolate more random values
    getRandomNumber(seed);  //get a single random number
    return true;
  }

  //This is the function called by frontend to request the 'expanded' values from the single random number
  //the request should return an array of random numbers, generated from the one VRF
  function requestRandomArray(uint256 seed, uint256 numValues) public payable returns (bool){
    expanded = true;  //yes expand the random values
    numExpandedValues = numValues;  //how many expanded values do we want
    getRandomNumber(seed);  //get a single random number
    return true;
  }

  function getRandomNumber(uint256 userProvidedSeed) internal returns (bytes32 requestId) {
    require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
    requestRandomness(keyHash, fee, userProvidedSeed);  //this is the Chainlink VRF call
  }

  /**
    * Callback function used by VRF Coordinator
    */
  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
      randomResult = randomness;  //randomness is the random value returned
      if(expanded){
        //if we want an array of randoms, expand them
        expandRandom(requestId, randomResult);
      }else{
        //if we only want one random value, go ahead and return it
        emit Result(requestId, 997, randomResult, block.timestamp);
      }
  }

  function expandRandom(bytes32 requestId, uint256 randomResult) internal {
    bytes32 vrf = bytes32(randomResult);  //turn the VRF into bytes32
    uint256[] memory expanded = expand(vrf, numExpandedValues);
    emit ExpandedValues(expanded);
  }

  // SPDX-License-Identifier: MIT
  //using the VRF as a starting point, generate as many more randoms as we want
  function expand(bytes32 randomValue, uint256 n) public pure returns (uint256[] memory expandedValues) {
      expandedValues = new uint256[](n);
      for (uint256 i = 0; i < n; i++) {
        expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
      }
      return expandedValues;
  }
}