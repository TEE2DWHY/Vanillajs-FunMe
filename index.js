// import ethers
import { ethers } from "./ethers.js";
// import contract abi
import { contractAbi, contractAddress } from "./constant.js";

// define button components
const connectBtn = document.getElementById("connectBtn");
const fundBtn = document.getElementById("fundBtn");
const getBalance = document.getElementById("getBalance");
const balanceOfContract = document.getElementById("getContractBalance");
const transfer = document.getElementById("withdraw");

// connect to metamask
const connectToMetaMask = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x5",
            chainName: "Goerli Testnet",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [
              "https://eth-goerli.g.alchemy.com/v2/lLPJAEdhtfrC_HFru6cNMYGKrPz9MLiw",
            ],
            blockExplorerUrls: ["https://goerli.etherscan.io/"],
          },
        ],
      });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts[0];
      if (account) {
        document.getElementById(
          "connectBtn"
        ).innerHTML = `Connected User Address: ${account}`;
      }
      document.getElementById("form").style.display = "block";
    } catch (err) {
      console.log(err);
    }
  } else {
    alert("Please install MetaMask or open in dApp browser.");
  }
};

// get user balance
const balance = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userBalance = await signer.getBalance();
      const formattedBalance = ethers.utils.formatEther(userBalance);
      alert(`Current user balance is : $${formattedBalance}ETH`);
    } catch (err) {
      alert("user is not connected");
      console.log(err);
    }
  } else {
    alert("User is not connected");
  }
};

// get contractBalance
const contractBalance = async () => {
  if (typeof window.ethereum !== undefined) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(contractAddress);
      const formattedBalance = ethers.utils.formatEther(balance);
      alert(`Contract balance is: $${formattedBalance}`);
    } catch (err) {
      alert("Provider not found. Please Connect to Metamask wallet");
      console.error(err);
    }
  } else {
    alert("User is not connected");
  }
};

// fund function
const fund = async () => {
  const ethAmount = document.getElementById("amount").value;

  // Contract eth funding amount can not be less than $50
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userBalance = await signer.getBalance();
      const formattedBalance = ethers.utils.formatEther(userBalance);
      if (Number(ethAmount) > Number(formattedBalance)) {
        alert("Insufficient fund. Please fund wallet");
        return;
      }
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      // const gasLimit = await signer.estimateGas();
      if (ethAmount === "") {
        alert("input field cannot be empty");
        return;
      }
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      console.log(transactionResponse);
      await isTransactionMined(transactionResponse, provider);
      console.log("done!");
    } catch (err) {
      alert("Error: Minimum funding amount is $50.");
      console.log(err);
    }
  }
};

// listen for transaction mine
const isTransactionMined = (transactionResponse, provider) => {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    // this function would only resolve when transaction hash is found
    provider.once(transactionResponse.hash, (transactionResponse) => {
      // it is only when the transaction hash is fired that we would acknowledge transaction is mined
      console.log(
        `completed with: ${transactionResponse.confirmations} confirmations.`
      );
      resolve();
    });
  });
};

// withdraw function
const withdraw = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await isTransactionMined(transactionResponse, provider);
      console.log("withdrawal is successful");
    } catch (err) {
      alert("Error: Not Contract Owner!");
      console.log(err);
    }
  } else {
    alert("User is not connected");
  }
};

connectBtn.onclick = connectToMetaMask;
fundBtn.onclick = fund;
getBalance.onclick = balance;
balanceOfContract.onclick = contractBalance;
transfer.onclick = withdraw;
