import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';

import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import contract from 'truffle-contract';
import './App.css';

import CrowdsaleContract from './contracts/Crowdsale.json';
import TokenContract from './contracts/PAXToken.json';
import getWeb3 from './utils/getWeb3';

import Token from './components/Token';
import Crowdsale from './components/Crowdsale';
//import Statistics from './components/Statistics';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      my: {
        address: ''
      },
      token: {
        address: "",
        name: "",
        symbol: "",
        decimals: ""
      },

      divider: 1,
      decimals: 18
    };
  }

  async componentWillMount() {
    const { web3 } = await getWeb3;

    // Crowdsale initialization
    const crowdsale = contract(CrowdsaleContract);
    crowdsale.setProvider(web3.currentProvider);
    const instanceCrowdsale = await crowdsale.deployed();

    const state = await instanceCrowdsale.state();

    if (state) {
      const tokenAddress = await instanceCrowdsale.token.call();
      
          // Token initialization
          const ExereumToken = contract({ abi: TokenContract.abi });
          ExereumToken.setProvider(web3.currentProvider);
          const instanceToken = await ExereumToken.at(tokenAddress);
      
          // Token Info
          const [
            name, symbol, decimals
          ] = await Promise.all([
            instanceToken.name.call(), instanceToken.symbol.call(), instanceToken.decimals.call()
          ]);
          const decimalsNum = decimals.toNumber();
          const divider = 10 ** decimalsNum;

          this.setState({
            instanceToken,
      
            token: {
              address: instanceToken.address,
              name,
              symbol,
              decimals: decimalsNum
            },
      
            divider
      
          });
        }


    this.setState({
      web3,
      instanceCrowdsale,
    });
  }

/*
          <Statistics
            instanceCrowdsale={instanceCrowdsale}
          />
*/
  render() {
    const {
      web3, token, instanceToken, instanceCrowdsale, divider,
    } = this.state;

    if (!web3) return (<div className="wait">Web3 not initialized. Wait pls...</div>);
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">PAX token crowdsale</h1>
        </header>
        <Container>
          <Row>
            <Col>
              <Token
                instanceToken={instanceToken}
                token={token}
                divider={divider}
              />
            </Col>
          </Row>
          <Crowdsale
            web3={web3}
            instanceCrowdsale={instanceCrowdsale}
            divider={divider}
            decimals={token.decimals}
          />
        </Container>
        <footer>Allmax © 2018</footer>
      </div>
    );
  }
}

export default App;
