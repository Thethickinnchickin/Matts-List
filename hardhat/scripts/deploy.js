// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers} = require("hardhat");

async function main() {
  /**
   * A Contract Factory in ethers.js is an abstraction used to deploy new smart contracts so whitelistContract here is a factory for instances
   * of our whitelist contract
   */
  const listContract = await ethers.getContractFactory("List");

  //The contract gets deployed here
  const deployedListContract = await listContract.deploy(10);
  // 10 is the maximum number of listed addresses allowed

  // Wait for deployment to complete
  await deployedListContract.deployed();

  //print the address of the deployed contract
  console.log("Whitelist Contract Address:", deployedListContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
