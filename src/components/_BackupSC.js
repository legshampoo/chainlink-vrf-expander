// pragma solidity ^0.5.0;
pragma solidity 0.6.6;

// import "./vrf/VRFConsumerBase.sol";
// import "./vrf/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract Whitelist is VRFConsumerBase {
  string public name;
  bytes32 internal keyHash;
  uint256 internal fee;
  bool internal expanded;
  
  uint256 public randomResult;

  event Result(bytes32 id, uint256 userProvidedSeed, uint256 randomResult, uint256 time);
  event RandomTest(uint256 testResult);
  event RandomArray(uint256[] randArray);
  event ExpandedValues(uint256[] expanded);
  event keccakToInt(uint256 converted);
  event RandomArrayTest(uint256 random);

  /**
    * Constructor inherits VRFConsumerBase
    * 
    * Network: Kovan
    * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
    * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
    * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
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
  
  //THIS IS THE function for frontend to call
  function requestRandomNumber(uint256 seed) public payable returns (bool) {
    //entry point
    expanded = false;
    getRandomNumber(seed);
    return true;
  }

  function requestRandomArray(uint256 seed) public payable returns (bool){
    expanded = true;
    getRandomNumber(seed);
    return true;
  }

  // function requestRandomArrayTest(uint256 seed) public payable returns (bool){
  //   expanded = true;
  //   bytes32 vrf = bytes32(keccak256(abi.encodePacked(now, block.difficulty, msg.sender)));
  //   uint numValues = 10;
  //   uint256[] memory expanded = expand(vrf, numValues);
  //   // return expanded;
  //   emit ExpandedValues(expanded);
  // }

  function getRandomNumber(uint256 userProvidedSeed) internal returns (bytes32 requestId) {
    require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
    requestRandomness(keyHash, fee, userProvidedSeed);
  }

  /**
    * Callback function used by VRF Coordinator
    */
  //override because we are overriding the fulfillRandomness inside the VRFConsumerBase
  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
      randomResult = randomness;  //randomness is the random value returned
      // randomResult = randomness.mod(20).add(1); //makes it between 1-20
      if(expanded){
        expandRandom(requestId, randomResult);
      }else{
        // respond(requestId, randomResult);
        emit Result(requestId, 997, randomResult, block.timestamp);
      }
      // respondWithArray(randomness);
  }

  function expandRandom(bytes32 requestId, uint256 randomResult) internal {
    uint256 numValues = 10;
    bytes32 vrf = bytes32(randomResult);
    uint256[] memory expanded = expand(vrf, numValues);
    emit ExpandedValues(expanded);
  }

  // function respond(bytes32 requestId, uint256 random) public payable {
  //   emit Result(requestId, 997, random, block.timestamp);
  // }

  // function requestRandomArray() external payable returns (bool) {
  //   // uint256 _randomResult = 999;
  //   // uint256 _testSeed = 1234;
  //   // getRandomNumber(_testSeed);
  //   return true;
  // }


  /** 
    * Requests randomness from a user-provided seed
    */
  // function getRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
  //     require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
  //     //this is imported from VRFConsumerBase, this emits a log to the chainlink oracle address that we specified.  The oracle looks for this request, creates the random number, and then returns it in a callback function (the fulfill function)
  //     //this looks for the fulfill randomness function
  //     //technically the VRF coordinator is what calls this function before the random number can actually get processed.  The VRF coordinator determines if the number really is random
  //     return requestRandomness(keyHash, fee, userProvidedSeed);
  // }

  

  // function respondWithArray(uint256 _random) internal returns (bool) {
  //   //emit the final array
  //   emit RandomArrayTest(_random);
  // }

  

  // function testRandom() public returns (bool) {
  //   // uint256 rand = 999;
  //   uint256 rand = uint(keccak256(abi.encodePacked(now, block.difficulty, msg.sender)));
  //   // return rand;
  //   emit RandomTest(rand);
  //   return true;
  // }

  // function getRandArray() external returns (uint256[] memory) {
  //   uint256 initialRand = uint(keccak256(abi.encodePacked(now, block.difficulty, msg.sender)));
  //   uint length = 10;
  //   uint256[] memory randomNumbers = new uint256[](length); 
  //   for(uint i = 0; i < length; i++){
  //     randomNumbers[i] = i + 10;
  //   }
  //   uint256 mod1 = initialRand.mod(10001).add(1);
  //   randomNumbers[0] = initialRand;
  //   randomNumbers[1] = mod1;
  //   // uint256 mod2 = mod1.mod(100).add(1);
  //   // randomNumbers[2] = mod2;
  //   // randomNumbers.push(d6Result);

  //   emit RandomArray(randomNumbers);
  //   return (randomNumbers);
  // }

  function getExpandedValues() external returns (uint256[] memory values){
    //pseudorandom number
    bytes32 vrf = bytes32(keccak256(abi.encodePacked(now, block.difficulty, msg.sender)));
    uint numValues = 10;
    uint256[] memory expanded = expand(vrf, numValues);
    // return expanded;
    emit ExpandedValues(expanded);
    // uint256 converted = uint256(expanded[0]);
    // uint256 converted = uint256(199);
    // emit keccakToInt(converted);
    // return expand(vrf, numValues);
    return expanded;
  }

  // SPDX-License-Identifier: MIT
  function expand(bytes32 randomValue, uint256 n) public pure returns (uint256[] memory expandedValues) {
      expandedValues = new uint256[](n);
      for (uint256 i = 0; i < n; i++) {
          // expandedValues[i] = keccak256(abi.encode(randomValue, i));
          expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
      }

      // emit ExpandedValues(expandedValues);
      return expandedValues;
  }

}