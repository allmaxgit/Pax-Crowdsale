pragma solidity ^0.4.18;

import "./BurnableToken.sol";
import "./PausableToken.sol";
import "./SafeMath.sol";

contract PAXToken is BurnableToken, PausableToken {

    using SafeMath for uint;

    string public constant name = "Pax Token";

    string public constant symbol = "PAX";

    uint32 public constant decimals = 10;

    uint256 public constant INITIAL_SUPPLY = 999500000 * (10 ** uint256(decimals)); 

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    function PAXToken(address _company, address _founders_1, address _founders_2, bool _isPause) public {
        require(_company != address(0) && _founders_1 != address(0) && _founders_2 != address(0));
        paused = _isPause;
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = 349500000 * (10 ** uint256(decimals));
        balances[_company] = 300000000 * (10 ** uint256(decimals));
        balances[_founders_1] = 300000000 * (10 ** uint256(decimals));
        balances[_founders_2] = 50000000 * (10 ** uint256(decimals));
        Transfer(0x0, msg.sender, balances[msg.sender]);
        Transfer(0x0, _company, balances[_company]);
        Transfer(0x0, _founders_1, balances[_founders_1]);
        Transfer(0x0, _founders_2, balances[_founders_2]);

    }
}