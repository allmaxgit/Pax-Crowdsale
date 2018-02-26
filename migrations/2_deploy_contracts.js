var Crowdsale = artifacts.require("./Crowdsale.sol");

module.exports = function(deployer) {
    deployer.deploy(Crowdsale, 0x61a0CE2FE0f429dd309280e5FA11D298e9cfAc54, 0x61a0CE2FE0f429dd309280e5FA11D298e9cfAc54, 0x61a0CE2FE0f429dd309280e5FA11D298e9cfAc54);
};
