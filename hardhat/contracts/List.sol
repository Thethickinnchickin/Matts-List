//SPDX-License-Identifier: Unlicense 
pragma solidity ^0.8.0;

contract List {
    //Max number of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    //Create a mapping of whitelistedaddresses
    //If an adress is whitelisted we would set it to true, it is false by default for all other addresses
    mapping(address => bool) public whitelistedAddresses;

    //numAddresseesWhitelisted would be used to keep track of how many addresses have been whitelisted
    // Note: Dont't change this variable nmame, as it will be part of verification
    uint8 public numAddressesWhitelisted;

    //Setting the Max number of whitelisted addresses
    // User will put the value at the time of deployment
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    /**
        addAddressToList - This function addes the address of the senderto the whitelist 
    */
    function addAddressToList() public {
        // check if the user has already been listed
        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");
        // check if the numAddressesWhitelisted - maxWhitelistedAddresses, if not then throw an error
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More addresses cant be added, limit has been reached");
        // Add the address wich called the function to the whitelisted Address array
        whitelistedAddresses[msg.sender] = true;
        // Increase the number of whitelisted addresses
        numAddressesWhitelisted += 1;
    }

}