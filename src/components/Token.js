import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';

class Token extends Component {
  constructor(props) {
    super(props);

    this.state = {
      owner: '',
      totalSupply: ''
    };
  }

  async componentWillMount() {
    const { instanceToken } = this.props;
    
    if (instanceToken) {
      const [owner, totalSupply] = await Promise.all([
        instanceToken.owner.call(),
        instanceToken.totalSupply.call()
      ]);
  
      this.setState({
        owner,
        totalSupply: totalSupply.toNumber()
      });
      }
  }

  render() {
    const {
      address, name, symbol, decimals
    } = this.props.token;
    const { owner, totalSupply } = this.state;

    return (
      <Row style={{ marginTop: 50 }}>
        <Col>
          <Row><h3>Token Info</h3></Row>
          <Row>Name: {name}</Row>
          <Row>Symbol: {symbol}</Row>
          <Row>Decimals: {decimals}</Row>
          <Row>TotalSupply: {(totalSupply / this.props.divider).toLocaleString(undefined, { maximumFractionDigits: decimals })} PAX</Row><br />
          <Row>Address: {address}</Row>
          <Row>Owner: {owner}</Row>
        </Col>
      </Row>
    );
  }
}

Token.defaultProps = {
  token: {
    address: '',
    name: '',
    symbol: '',
    decimals: 0
  }
};

Token.propTypes = {
  token: PropTypes.shape({
    address: PropTypes.string,
    name: PropTypes.string,
    symbol: PropTypes.string,
    decimals: PropTypes.number
  }),
  instanceToken: PropTypes.shape({
    owner: PropTypes.func.isRequired,
    totalSupply: PropTypes.func.isRequired,
    balanceOf: PropTypes.func.isRequired
  }).isRequired,
  divider: PropTypes.number.isRequired
};

export default Token;
