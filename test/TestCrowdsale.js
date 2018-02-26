const PAXToken = artifacts.require('./contracts/PAXToken.sol');
const Crowdsale = artifacts.require('./contracts/Crowdsale.sol');
// const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

let amount;
let token;
let sale;

async function feasibility(callback, args) {
  try {
    await callback.apply(this, args);
    return true;
  } catch (error) {
    return false;
  }
}

contract('Crowdsale', () => {
/*
  it('getStageData', async () => {
    sale = await Crowdsale.new();
    let amountLimit = 0;
    let amountBonus = 130;
    let returnedLimit;
    let returnedBonus;

    [returnedLimit, returnedBonus] = sale.getStageData();
    assert.equal(amountLimit, returnedLimit);
    assert.equal(amountBonus, returnedBonus);
  });
*/
  it('tokensSupply', async () => {
    amount = 0;
    sale = await Crowdsale.new();
    assert.equal(amount, (await sale.tokensSupply()).toNumber());
  });

});
