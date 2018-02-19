pragma solidity ^0.4.18;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./PAXToken.sol";

contract Crowdsale is Ownable {

    event StartICO();

    event StopICO();

    event BurnUnsoldTokens();

    event NewWalletAddress(address _to);

    using SafeMath for uint;

    /**
     * @dev The address to which the received ether will be sent
     */
    address public multisig;

    /**
     * @dev ICO start date
     */
    uint start;

    /**
     * @dev ICO Period Number
     */
    uint period;

    /**
     * @dev Duration of presale
     */
    uint presale;

    /**
     * @dev Duration of tier1
     */
    uint tier1;

    /**
     * @dev Duration of tier2
     */
    uint tier2;

    /**
     * @dev Duration of tier3
     */
    uint tier3;

    /**
     * @dev Limit of coins for the period of presale
     */
    uint presaleLimit;

    /**
     * @dev Limit of coins for the period of tier1
     */
    uint tier1Limit;

    /**
     * @dev Limit of coins for the period of tier2
     */
    uint tier2Limit;

    /**
     * @dev Limit of coins for the period of tier3
     */
    uint tier3Limit;

    /**
     * @dev Limit of coins for the period of the stage, taking into account
     * unsold coins in the previous stages
     */
    uint stageLimit = 0;

    /**
     * @dev Number of coins taking into account the bonus for the period of presale
     */
    uint presaleBonus;

    /**
     * @dev Number of coins taking into account the bonus for the period of tier1
     */
    uint tier1Bonus;

    /**
     * @dev Number of coins taking into account the bonus for the period of tier2
     */
    uint tier2Bonus;

    /**
     * @dev Number of coins taking into account the bonus for the period of tier3
     */
    uint tier3Bonus;

    /**
     * @dev Number of coins for the typical period
     */
    uint typicalBonus = 100;

    /**
     * @dev Total number of minted tokens
     */
    uint public hardcap;

    /**
     * @dev Cost of the token
     */
    uint public rate;

    /**
     * @dev Number of sold tokens
     */
    uint public totalSold = 0;

    /**
     * @dev ICO Status
     */
    bool public state;

    /**
     * @dev Once call flag
     */
    bool public requireOnce = true;

    /**
     * @dev Once burning flag
     */
    bool public isBurned = false;

    uint softcap;

    uint sumWei;

    uint private decimals;

    uint private sendingTokens;

    mapping(address => uint) public balances;

    PAXToken public token;

    function Crowdsale(address _company, address _founders) public {
        token = new PAXToken(_company, _founders);
        multisig = owner; // Test data
        rate = (uint)(1 ether).div(5000);
        presale = 14;
        tier1 = 14;
        tier2 = 14;
        tier3 = 14;
        decimals = 1E10;
        presaleLimit = 44500000 * decimals;
        tier1Limit = 85000000 * decimals;
        tier2Limit = 100000000 * decimals;
        tier3Limit = 120000000 * decimals;
        presaleBonus = 130;
        tier1Bonus = 115;
        tier2Bonus = 110;
        tier3Bonus = 105;
        hardcap = 349500000 * decimals;
        softcap = 2500 ether;
    }

    modifier saleIsOn() {
        require(state && now >= start);
        _;
    }

    modifier isUnderHardCap() {
        uint tokenBalance = token.balanceOf(this);
        require(
            tokenBalance <= hardcap &&
            tokenBalance >= 500
        );
        _;
    }

    /**
     * @dev Fallback function
     */
    function() external payable {
        require (msg.value > 0);
        sendTokens(msg.value, msg.sender);
    }

    function withDrawal() public onlyOwner {
      if(sumWei > softcap) {
        multisig.transfer(this.balance);
      }
    }

    function refund() public {
      require(sumWei < softcap && !state);
      uint value = balances[msg.sender];
      balances[msg.sender] = 0;
      msg.sender.transfer(value);
    }

    /**
     * @dev Starting ICO
     */
    function startICO() public onlyOwner returns(bool) {    
        require(requireOnce);
        requireOnce = false;
        state = true;
        start = now; //
        period = 0;
        token.pause();
        StartICO();
        return true;
    }

    /**
     * @dev Turning off the ICO
     */
    function stopICO() saleIsOn onlyOwner public returns(bool) {
        state = false;
        if (token.paused()) {
            token.unpause();
        }
        StopICO();
        return true;
    }

    /**
     * @dev Burning all tokens on mintAddress
     */
    function burnUnsoldTokens() onlyOwner public returns(bool) {
        require(!isBurned);
        isBurned = true;
        state = false;
        token.burn(token.balanceOf(this));
        if (token.paused()) {
            token.unpause();
        }
        BurnUnsoldTokens();
        return true;
    }

    /**
     * @dev Sending tokens to the recipient, based on the amount of ether that it sent
     * @param _etherValue uint Amount of sent ether
     * @param _to address The address which you want to transfer to
     */
    function sendTokens(uint _etherValue, address _to) isUnderHardCap saleIsOn public payable {
        uint limit;
        uint bonusCoefficient;
        (limit, bonusCoefficient) = getStageData();
        uint tokens = (_etherValue).mul(bonusCoefficient).mul(decimals).div(100);
        tokens = tokens.div(rate);

        if (tokens > limit) {
            uint stageEther = calculateStagePrice();
            period++;
            if (period == 4) {
                balances[msg.sender] = balances[msg.sender].add(msg.value);
                sumWei = sumWei.add(msg.value);
                //multisig.transfer(stageEther);
                token.transfer(_to, limit);
                totalSold = totalSold.add(limit);
                _to.transfer(_etherValue.sub(stageEther));
                return;
            }
            balances[msg.sender] = balances[msg.sender].add(msg.value);
            sumWei = sumWei.add(msg.value);
            //multisig.transfer(stageEther);
            token.transfer(_to, limit);
            totalSold = totalSold.add(limit);
            sendTokens(_etherValue.sub(stageEther), _to);

        } else {
            require(tokens <= token.balanceOf(this));
            balances[msg.sender] = balances[msg.sender].add(msg.value);
            sumWei = sumWei.add(msg.value);
            //multisig.transfer(_etherValue);
            token.transfer(_to, tokens);
            totalSold = totalSold.add(tokens);
        }
    }

    /**
     * @dev Returns stage id
     */
    function getStageId() saleIsOn public constant returns(uint) {
        uint stageId;
        uint today = now;

        if (today < start + (presale * 1 days)) {
            stageId = 0;

        } else if (today >= start + (presale * 1 days) &&
        today < start + ((presale + tier1) * 1 days)) {
            stageId = 1;

        } else if (today >= start + ((presale + tier1) * 1 days) &&
        today < start + ((presale + tier1 + tier2) * 1 days)) {
            stageId = 2;

        } else if (today >= start + ((presale + tier1 + tier2) * 1 days) &&
        today < start + ((presale + tier1 + tier2 + tier3) * 1 days)) {
            stageId = 3;

        } else {
            stageId = 4;
        }
        uint tempId = (stageId > period) ? stageId : period;
        return tempId;
    }

    /**
     * @dev Returns Limit of coins for the period and Number of coins taking
     * into account the bonus for the period
     */
    function getStageData() saleIsOn public constant returns(uint, uint) {
        uint tempLimit = 0;
        uint tempBonus;
        uint stageId = getStageId();

        if (stageId == 0) {
            tempLimit = presaleLimit;
            tempBonus = presaleBonus;

        } else if (stageId == 1) {
            tempLimit = presaleLimit.add(tier1Limit);
            tempBonus = tier1Bonus;

        } else if (stageId == 2) {
            tempLimit = presaleLimit.add(tier1Limit).add(tier2Limit);
            tempBonus = tier2Bonus;

        } else if (stageId == 3) {
            tempLimit = presaleLimit.add(tier1Limit).add(tier2Limit).add(tier3Limit);
            tempBonus = tier3Bonus;

        } else {
            tempLimit = token.balanceOf(this);
            tempBonus = typicalBonus;
            return (tempLimit, tempBonus);
        }
        tempLimit = tempLimit.sub(totalSold); //.add(token.balanceOf(this)).sub(hardcap);
        return (tempLimit, tempBonus);
    }

    /**
     * @dev Returns the total number of tokens available for sale
     */
    function tokensAmount() saleIsOn public constant returns(uint) {
        return token.balanceOf(this);
    }

    /**
     * @dev Returns the amount for which you can redeem all tokens for the current period
     */
    function calculateStagePrice() saleIsOn public view returns(uint) {
        uint limit;
        uint bonusCoefficient;
        (limit, bonusCoefficient) = getStageData();

        uint price = limit.mul(rate).mul(100).div(bonusCoefficient).div(decimals);
        return price;
    }

    /**
     * @dev Returns the number of tokens in the buyer's wallet
     */
    function myBalance() public constant returns(uint) {
        return token.balanceOf(msg.sender);
    }

    /**
     * @dev Returns number of supplied tokens
     */
    function tokensSupply() public constant returns(uint) {
        return token.totalSupply();
    }

    /**
     * @dev Sets new multisig address to which the received ether will be sent
     * @param _to address
     */
    function setMultisig(address _to) public onlyOwner returns(bool) {
        require(_to != address(0));
        multisig = _to;
        NewWalletAddress(_to);
        return true;
    }

     function returnBalance() public view returns(uint) {      // balance etherium of smartcontract
        return this.balance;
    }

    function manualSendTokens(address _to, uint256 _value) public saleIsOn onlyOwner returns(bool) {
      uint tokens = _value.mul(decimals);
      uint avalibleTokens = token.balanceOf(this);

       if (tokens < avalibleTokens) {
         uint compareValue = tokens.add(sendingTokens);
         
        if (compareValue <= tier3Limit) {
          tier3Limit = tier3Limit.sub(tokens);
        } else if (compareValue <= tier3Limit.add(tier2Limit)) {
          tier2Limit = tier2Limit.sub(tokens.sub(tier3Limit));
          tier3Limit = 0;
        } else if (compareValue <= tier3Limit.add(tier2Limit).add(tier1Limit)) {
          tier1Limit = tier1Limit.sub(tokens.sub(tier3Limit).sub(tier2Limit));
          tier3Limit = 0;
          tier2Limit = 0;
        } else if (compareValue <= tier3Limit.add(tier2Limit).add(tier1Limit).add(presaleLimit)) {
          presaleLimit = presaleLimit.sub(compareValue.sub(tier3Limit).sub(tier2Limit).sub(tier1Limit));
          tier3Limit = 0;
          tier2Limit = 0;
          tier1Limit = 0;
        }
      } else {
          tokens = avalibleTokens;
          tier3Limit = 0;
          tier2Limit = 0;
          tier1Limit = 0;
          presaleLimit = 0;
      }

      sendingTokens = sendingTokens.add(tokens);
      sumWei = sumWei.add(tokens.mul(rate));
      token.transfer(_to, tokens);

      return true;
    }
}