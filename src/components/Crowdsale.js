import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Input, Button } from 'reactstrap';

import '../css/Crowdsale.css';

class Crowdsale extends Component {
  constructor(props) {
    super(props);

    this.state = {
      owner: '',
      newStartDate: 0,
      adress:'',
      valueTokens:'',
      newOwner: '',
      multisig: '',
      newMultisig: '',
      ICO: {
        rate: 0,
        totalCollected: 0,
        tokensAmount: 0,
        totalSold: 0,
        hardcap: 0,
        sumWei:0,
        period:0
      },
      state: false,
      requireOnce: true,
      isBurned: false,
      myBalance: 0,
    };
  }

  async componentWillMount() {
    const { instanceCrowdsale } = this.props;

    const [
        icoTokenCost,
        state,
        requireOnce,
        isBurned,
        owner,
        multisig,
        hardcap,
        totalSold,
        sumWei,
        period,
    ] = await Promise.all([
        instanceCrowdsale.rate.call(),
        instanceCrowdsale.state.call(),
        instanceCrowdsale.requireOnce.call(),
        instanceCrowdsale.isBurned.call(),
        instanceCrowdsale.owner.call(),
        instanceCrowdsale.multisig.call(),
        instanceCrowdsale.hardcap.call(),
        instanceCrowdsale.totalSold.call(),
        instanceCrowdsale.sumWei.call(),
        instanceCrowdsale.period.call(),
    ]);

    const ICO = {
        rate: icoTokenCost.toNumber(),
        hardcap: hardcap.toNumber(),
        tokensAmount: 0,
        totalSold: totalSold.toNumber(),
        sumWei: sumWei,
        period: period
        };

    this.setState({
        ICO,
        state,
        requireOnce,
        isBurned,
        multisig,
        owner,
    });


    if (state) {
        const [
            tokensAmount,
        ] = await Promise.all([
            instanceCrowdsale.tokensAmount.call(),
        ]);

        const ICO = this.state.ICO;
        ICO.tokensAmount = tokensAmount.toNumber();

        this.setState({
            ICO,
        });
    }
  }

  async feasibility(callback, args) {
    try {
      await callback.apply(this, args);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async crowdsaleTransferOwnership() {
    const { web3, instanceCrowdsale } = this.props;
    const { newOwner } = this.state;

    if (await this.feasibility(instanceCrowdsale.transferOwnership, [
      newOwner, { from: web3.eth.accounts[0], gas: 100000 }
    ])) {
      const owner = await instanceCrowdsale.owner.call();
      this.setState({ owner });
    }
  }

  async crowdsaleChangeWallet() {
    const { web3, instanceCrowdsale } = this.props;
    const { newMultisig } = this.state;

    if (await this.feasibility(instanceCrowdsale.setMultisig, [
      newMultisig, { from: web3.eth.accounts[0], gas: 100000 }
    ])) {
      const multisig = await instanceCrowdsale.multisig.call();
      this.setState({ multisig });
    }
  }

  async startICO() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.startICO, [{ from: web3.eth.accounts[0], gas: 1000000 }])) {
      const state = await instanceCrowdsale.state.call();
      this.setState({ state });
    }
  }

  async withDrawal() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.withDrawal, [{ from: web3.eth.accounts[0], gas: 100000 }])) {
      const state = await instanceCrowdsale.state.call();
      this.setState({ state });
    }
  }

  async setStartDate() {
    const { web3, instanceCrowdsale } = this.props;
    const { newStartDate } = this.state;

    if (await this.feasibility(instanceCrowdsale.setStartDate, [
      newStartDate, { from: web3.eth.accounts[0], gas: 100000 }
    ]));

  }

  async manualSendTokens() {
    const { web3, instanceCrowdsale } = this.props;
    const { adress } = this.state;
    let { valueTokens } = this.state;
           valueTokens  *= 10 ** 10;  

    if (await this.feasibility(instanceCrowdsale.manualSendTokens, [
      adress, valueTokens, { from: web3.eth.accounts[0], gas: 1000000 }
    ]));
  }

  async stopICO() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.stopICO, [{ from: web3.eth.accounts[0], gas: 100000 }])) {
      const state = await instanceCrowdsale.state.call();
      this.setState({ state });
    }
  }

  async burnUnsoldTokens() {
    const { web3, instanceCrowdsale } = this.props;
    if (await this.feasibility(instanceCrowdsale.burnUnsoldTokens, [{ from: web3.eth.accounts[0], gas: 100000 }])) {
      const state = await instanceCrowdsale.state.call();
      this.setState({ state });
    }
  }

  splitString = str => str.replace(/\s/g, '').split(',');

  render() {
    const { instanceCrowdsale, divider } = this.props;
    const {
      owner, newOwner, multisig, newMultisig, ICO, state, requireOnce, isBurned, newStartDate, adress, valueTokens
    } = this.state;
    return (
      <Row style={{ marginTop: 50 }}>
        <Col>
          <Row><h3>Crowdsale</h3></Row>
          <Row>Owner: {owner}</Row>
          <Row>Wallet: {multisig}</Row>
          <Row>Address: {instanceCrowdsale.address}</Row>
          <hr className="my-2" />

          <Row>
            <Col>
              <Row><h5>ICO</h5></Row>
              <Row>Token cost: {(ICO.rate / 1E18).toFixed(4).toLocaleString()} ETH</Row>
              <Row>Hard cap: {(ICO.hardcap / divider).toLocaleString()} PAX</Row>
              <Row>Tokens sold: {(ICO.totalSold / 1E10).toLocaleString()} PAX</Row>
              <Row>Tokens left: {(ICO.tokensAmount / 1E10).toLocaleString()} PAX</Row> 
              <Row>Raised Eth: {(ICO.sumWei / 1E18).toLocaleString()} ETH</Row>
              <Row>Period: {(ICO.period).toLocaleString()}</Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Management</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15, flexWrap: 'nowrap'}}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">State: {(!state)?"Stopped":"Active"}</Row>
            </Col>
            <Col md={{ size: 3 }}>
              <Button className="funcButton" disabled={!requireOnce} color="info" onClick={() => this.startICO()}>Start ICO</Button>
            </Col>
            <Col md={{ size: 3 }}>
              <Button className="funcButton" disabled={!state} color="info" onClick={() => this.stopICO()}>Stop ICO</Button>
            </Col>
            <Col md={{ size: 3 }}>
              <Button className="funcButton" disabled={!state} color="info" onClick={() => this.withDrawal()}>Withdrawal</Button>
            </Col>
            <Col md={{ size: 3 }}>
              <Button className="funcButton" disabled={(state || isBurned) || requireOnce} color="danger" onClick={() => this.burnUnsoldTokens()}>Burn Unsold</Button>
            </Col>
          </Row>
          <hr className="my-2" />
     
          <Row style={{ marginTop: 15 }}><h5>Ownership</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">Transfer ownership of crowdsale</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={newOwner}
                onChange={e => this.setState({ newOwner: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Address of new Owner"
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" color="info" onClick={() => this.crowdsaleTransferOwnership()}>Transfer Ownership</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Wallet</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">Change wallet</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={newMultisig}
                onChange={e => this.setState({ newMultisig: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Address of new wallet"
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" color="info" onClick={() => this.crowdsaleChangeWallet()}>Change Wallet</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Start Date</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">Set Start Date</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={newStartDate}
                onChange={e => this.setState({ newStartDate: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Start date"
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" color="info" onClick={() => this.setStartDate()}>Set Date</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />

          <Row style={{ marginTop: 15 }}><h5>Manual Sending</h5></Row>
          <Row className="funcRow" style={{ marginBottom: 15 }}>
            <Col md={{ size: 3 }}>
              <Row className="funcLabel">Manual Sending</Row>
            </Col>
            <Col md={{ size: 6 }}>
              <Input
                value={adress}
                onChange={e => this.setState({ adress: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Address"
              />
              <Input
                value={valueTokens}
                onChange={e => this.setState({ valueTokens: e.target.value })}
                onKeyDown={this.handleSubmit}
                placeholder="Tokens value"
              />
            </Col>
            <Col md={{ size: 3 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Row><Button className="funcButton" disabled={!state} color="info" onClick={() => this.manualSendTokens()}>Send</Button></Row>
            </Col>
          </Row>
          <hr className="my-2" />
            
        </Col>
      </Row>
    );
  }
}

Crowdsale.propTypes = {
  web3: PropTypes.shape({
    toWei: PropTypes.func.isRequired,
    eth: PropTypes.shape({
      accounts: PropTypes.array.isRequired
    })
  }).isRequired,
  instanceCrowdsale: PropTypes.shape({
    address: PropTypes.string.isRequired,
    multisig: PropTypes.func.isRequired,
    myBalance: PropTypes.func.isRequired,

    // Crowdsale

    // ICO
    tokensAmount: PropTypes.func.isRequired,
    totalSold: PropTypes.func.isRequired,
    rate: PropTypes.func.isRequired,
    startICO: PropTypes.func.isRequired,
    stopICO: PropTypes.func.isRequired,
    burnUnsoldTokens: PropTypes.func.isRequired,
    state: PropTypes.func.isRequired,
    requireOnce: PropTypes.func.isRequired,
    isBurned: PropTypes.func.isRequired,
    hardcap: PropTypes.func.isRequired,
    sumWei: PropTypes.func.isRequired,
    period: PropTypes.func.isRequired,

    // Functions
    setMultisig: PropTypes.func.isRequired,

    // Other
    owner: PropTypes.func.isRequired,

  }).isRequired,
  divider: PropTypes.number.isRequired,
  decimals: PropTypes.number.isRequired
};

export default Crowdsale;