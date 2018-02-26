import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';

const timeFormat = 'D.MM.YYYY, HH:mm:ss';

class Statistics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      buyers: [],
      history: []
    };
  }
  // (address Addr, uint256 Wai, uint256 Timestamp, bool Processed)
  async componentWillMount() {
    const { instanceCrowdsale } = this.props;

    // History
    let record;
    const length = 0;
//    const length = (await instanceCrowdsale.getHistoryLength.call()).toNumber();
    if (length > 0) {
      const history = [];
      for (let index = 0; index < length; index += 1) {
        // eslint-disable-next-line
        record = await instanceCrowdsale.history.call(index);
        history.push({
          address: record[0],
          eth: record[1].toNumber() / 1E18,
          timestamp: moment.unix(record[2]).format(timeFormat),
        });
      }
      this.setState({ history });
    }
    // Buyers
    let address;
    const buyers = [];
    let investments;
    const lengthIcoBuyers = 0;
//    const lengthIcoBuyers = (await instanceCrowdsale.getInvestorsLength.call()).toNumber();
    if (lengthIcoBuyers > 0) {
      for (let index = 0; index < lengthIcoBuyers; index += 1) {
        // eslint-disable-next-line
        address = await instanceCrowdsale.investorsArray.call(index);
        // eslint-disable-next-line
        investments = await instanceCrowdsale.investors.call(address);
        buyers.push({
          address,
          investments: (investments.toNumber()) / 1E18
        });
      }
    }
    this.setState({ buyers });
  }

  render() {
    const { buyers, history } = this.state;

    return (
      <Row style={{ marginTop: 50 }}>
        <Col>
          <Row><h3>Statistics</h3></Row>
          <Row style={{ marginTop: 10 }}><h5>Buyers</h5></Row>
          <Row>
            <Col>
              <BootstrapTable height="350" data={buyers} version="4" striped hover>
                <TableHeaderColumn dataField="address" isKey>Address</TableHeaderColumn>
                <TableHeaderColumn dataField="investments">Total investments, EXE</TableHeaderColumn>
              </BootstrapTable>
            </Col>
          </Row><br />
          <Row><h5>History of investments</h5></Row>
          <Row>
            <Col>
              <BootstrapTable height="500" data={history} version="4" striped hover>
                <TableHeaderColumn width="550" dataField="address" isKey>Address</TableHeaderColumn>
                <TableHeaderColumn dataField="eth">ETH amount</TableHeaderColumn>
                <TableHeaderColumn dataField="timestamp">Timestamp</TableHeaderColumn>
              </BootstrapTable>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

Statistics.propTypes = {
  instanceCrowdsale: PropTypes.shape({
    // Buyers
    getInvestorsLength: PropTypes.func.isRequired,
    investorsArray: PropTypes.func.isRequired,
    investors: PropTypes.func.isRequired,

    // History
    getHistoryLength: PropTypes.func.isRequired,

  }).isRequired
};

export default Statistics;
