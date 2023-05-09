import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants/index";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  //joined keeps track of whether the current metamask address has joined the matt list or not
  const [joinedList, setJoinedList] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  //numberOfListed tracks the number oif addresses's whitelisted
  const [numberOfListed, setNumberOfListed] = useState(0);
  // Create a reference to the web3 modal (used for connecting to metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

    /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
    const getProviderOrSigner = async (needSigner = false) => {
      // Connect to MetaMask
      const provider = await web3ModalRef.current.connect();
      console.log(provider)
      const web3Provider = new providers.Web3Provider(provider);
    
      // If user is not connected to the Sepolia network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 11155111) {
        window.alert("Change network to Sepolia to proceed");
        throw new Error("Change network to Sepolia to Continue");
      }
    
      if (needSigner) {
        // Ask user to connect their Ethereum account to the Web3 provider
        await web3Provider.send("eth_requestAccounts", []);
    
        const signer = web3Provider.getSigner();
        const signerAddress = await signer.getAddress();
        console.log(signerAddress);
        return signer;
      }
    
      return web3Provider;
    };
    

  /**
   * addAdressToListL Adds the current connected address to the list
   */
  const addAddressToList = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const listContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToList from the contract
      const tx = await listContract.addAddressToList();
      setLoading(false);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // get the updated number of addresses in the list
      await getNumberOfListed();
      setJoinedList(false);
    } catch (err) {
      console.error(err.message);
    }
  }

  /**
   * getNumberOfListed: gets the number of listed addresses
   */
  const getNumberOfListed = async () => {
    try {
      // Get the provider fromm web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only state from the blackchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have reas-only access tot the COntract
      const listContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call the numAddressesListed fromt he contract
      const _numberOfListed = await listContract.numAddressesWhitelisted();
      setNumberOfListed(_numberOfListed)
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * checkIfAddressInWhitelist: Checks If the address is in whitelist
   */
  const checkIfAddressInList = async () => {
    try {
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      const signer = await getProviderOrSigner(true);
      console.log(signer)
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      // call the whitelistedAddresses from the contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedList(_joinedWhitelist);
    } catch (err) {
      console.log("TITITIT")
      console.error(err);
    }
  }

  /**
   * connectWallet: Connects the MetaMask wallet
   */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user connect their wallet
      await getProviderOrSigner(true);
      setWalletConnected(true);
      checkIfAddressInList();
      getNumberOfListed();
    } catch (err) {
      console.error(err);
    }
  }

    /*
    renderButton: Returns a button based on the state of the dapp
  */
    const renderButton = () => {
      if (walletConnected) {
        if (joinedList) {
          return (
            <div className={styles.description}>
              Thanks for joining the Whitelist!
            </div>
          );
        } else if (loading) {
          return <button className={styles.button}>Loading...</button>;
        } else {
          return (
            <button onClick={addAddressToList} className={styles.button}>
              Join the Whitelist
            </button>
          );
        }
      } else {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        );
      }
    };

      
    // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        providerOptions: {
          chainId: 11155111
        },
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);
  

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfListed} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
