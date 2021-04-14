import React, { Component } from 'react';
import Web3 from 'web3';
import { Button } from 'react-bootstrap';
import './App.css';
import Whitelist from '../abis/Whitelist.json';

//for debugging
const randArray = ["11375411244129220834881031775445403700019608521944244100603446451267651954456", "07232374232631767094823868129971749927045253585644320999365241017268283928058", "3150819529659981908948168772661561435238612956687530624124607078744800189727", "81249568152780111508565888717090467468954397968992752678802858746681379737216", "1738863260961651832492971782741686292468342300589265764615529178916839698990", "28669783972490378167969174711258301909227522756491318884495937394305453514408", "10061574114229632866175258880725635978200311444461435677903720672141962982317", "110729074174824108816567738213367069437525660628141928105468157308819541178525", "7365846087660746467098739994038167335057809912627221838877917968325694080283", "3395686952418944567415745939941154975231219922980511515868092161679160284673", "78872997527657328609982974473317926495999492503859568335939836040817304631362", "41086681301552802085926093695880293150241913101464944711264133176243642305547", "110428218311377861766409860099306309738365903880970794218718817037024409739979", "49879539122466203071842396960331769785979510547935001594886833102463548364756", "73224117364597989297747374705636592382357359813682028672417663694333703912124", "75305406682347896182976263158358055534322555411362412072159279895358420664589", "20448178352785363251491069632077864546937965863163742100484517344492793099566", "18846867150879888674405949784767024250092392386178797563133300024825737647989", "90645236028188201552163677114798391310322628497260730537694623006349584056399", "63332606748878922466062917321435517901760256796976775446892233127904010895942"];
const exampleRand = '11063663101775990326500531988026166494328515866579110721496861755745169083899';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      randomNumber: 0,
      expanded: [],
      mapped: [],
      min: '0',
      max: '10',
    }

    this.handleForm = this.handleForm.bind(this);
    this.mapToRange = this.mapToRange.bind(this);
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable();
    } 
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected.  You should consider trying MetaMask');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();

    this.setState({
      account: accounts[0]
    })

    const networkId = await web3.eth.net.getId();
    
    if(networkId === 5777){
      console.log('Ganache networkId: ', networkId)
    }else if(networkId === 4){
      console.log('Rinkeby networkId: ', networkId);
    }

    const networkData = Whitelist.networks[networkId];

    if(networkData){
      const abi = Whitelist.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      const contractAddress = await contract.options.address;
      console.log('Contract Address: ', contractAddress);

      this.setState({
        contract,
        contractAddress
      }, () => {
        // console.log(this.state)
      })
    }
  }

  //get a single randome VRF
  async getRandomNumber() {
    console.log('Fetching single VRF');
    this.setState({
      loading: true,
      expanded: [],
      mapped: []
    })
    const seed = 12134;  //this should change on each call
    const amount = 100000000000; 
    const success = await this.state.contract.methods.requestRandomNumber(seed)
      .send({
        from: this.state.account,
        gas: 300000,
        value: amount
      })
      .on('transactionHash', (hash) => {
        this.state.contract.events.Result({}, async (error, event) => {
          const val = event.returnValues.randomResult; 
          this.setState({
            loading: false,
            randomNumber: val
          }, () => {
            console.log('Single Random VRF: ', val);
          })
        }) 
      })
      .on('error', (error) => {
        window.alert('error: ', error);
      })
  }

  async getRandomArray() {
    console.log('Fetching random number from SC');
    this.setState({
      loading: true,
      randomNumber: 0,
      expanded: [],
      mapped: []
    })
    const seed = 12134;
    const amount = 100000000000;  // in wei?
    const numExpandedValues = 20;
    const result = await this.state.contract.methods.requestRandomArray(seed, numExpandedValues)
      .send({
        from: this.state.account,
        gas: 300000,
        value: amount
      })
      .on('transactionHash', (hash) => {
        this.state.contract.events.ExpandedValues({}, async (error, event) => {
          const expanded = event.returnValues.expanded;
          this.setState({
            expanded: expanded,
            mapped: expanded,
            loading: false
          })
        })
      })
      .on('error', (error) => {
        window.alert('error: ', error);
      })
  }

  mapRange(value, low1, high1, low2, high2){
    let mappedValue = (value - low1) * (high2 - low2) / (high1 - low1) + low2;
    mappedValue = parseInt(mappedValue);
    return mappedValue;
  }

  mapToRange(){
    console.log('Set new range');
    const minRange = 0;
    const digits = 4;  //take only the first x digits from the random number
    const maxRange = 10000;  //the max range given number of digits
    const mappedValues = [];

    this.state.expanded.map((val, i) => {
      let shortNumber = val.substring(digits, 0); //only use the first x digits
      shortNumber = parseInt(shortNumber);  
      const newMin = parseInt(this.state.min);
      const newMax = parseInt(this.state.max);
      let mappedVal = this.mapRange(shortNumber, minRange, maxRange, newMin, newMax);
      
      mappedValues.push(mappedVal);
    })

    this.setState({
      mapped: [...mappedValues]
    }, () => {
      // console.log('mapped values: ', this.state.mapped);
    })
  }

  handleForm(event){
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  renderData() {
    return (
      <div>
        {this.state.mapped.map((val, i) => {
          return(
            <div key={i}>{i}: {val}</div>
          )
        })}
      </div>
    )
  }

  render(){
    return (
      <div className="App">
        <Button
          onClick={() => this.getRandomNumber()}>
            Fetch Single VRF
        </Button>
        <div>
          <span>Single VRF:</span>
          <br></br>
          { this.state.loading ?
            <span>Fetching Single VRF...</span>
            :
            <span>{this.state.randomNumber}</span>
          }
        </div>
        <Button
          variant='primary'
          onClick={() => this.getRandomArray()}>
          Get Random VRF Array
        </Button>
        <div>
          <form>
            <label>Min:</label>
            <input 
              type='text'
              name='min' 
              pattern='[0-9]*' 
              value={this.state.min}
              onChange={this.handleForm}
            />
            <br></br>
            <label>Max:</label>
            <input 
              type='text' 
              name='max' 
              pattern='[0-9]*' 
              value={this.state.max}
              onChange={this.handleForm}  
            />
            <br></br>
            <Button 
              onClick={this.mapToRange}>
              Map Values to Range
            </Button>
          </form>
        </div>
        <div>
          <p>Expanded Values:</p>
          { this.state.loading ?
            <div>Fetching Chainlink Data...</div>
            :
            <div>{this.renderData()}</div>
          }
        </div>
      </div>
    );
  }
}

export default App;
