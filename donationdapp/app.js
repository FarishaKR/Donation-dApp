const contractAddress = "0x340E8d8b06486dDB5C34CA56aCe2ae84b3b6b464";
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "donor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Donated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDonations",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let web3;
let donationContract;
let userAccount;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);

    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      userAccount = accounts[0];

      donationContract = new web3.eth.Contract(contractABI, contractAddress);
      document.getElementById("account").innerText = `Connected: ${userAccount}`;

      updateBalance();
      loadDonations();

      document.getElementById("donationForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const amountInEth = document.getElementById("amount").value;
        const amountInWei = web3.utils.toWei(amountInEth, "ether");

        try {
          const tx = await donationContract.methods.donate().send({
            from: userAccount,
            value: amountInWei
          });

          alert("Donation successful!");
          updateBalance(); 
          appendDonation(tx.transactionHash, userAccount, amountInEth);
        } catch (err) {
          console.error("Donation failed:", err);
          alert("Transaction failed!");
        }
      });
    } catch (error) {
      console.error("User denied account access", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
});

async function updateBalance() {
  const balance = await donationContract.methods.getBalance().call();
  const balanceInEth = web3.utils.fromWei(balance, "ether");
  document.getElementById("balance").innerText = `Total Funds Collected: ${balanceInEth} ETH`;
}

async function loadDonations() {
  const donations = await donationContract.getPastEvents("Donated", {
    fromBlock: 0,
    toBlock: "latest",
  });

  donations.forEach((event) => {
    const { donor, amount } = event.returnValues;
    const txHash = event.transactionHash;
    const amountEth = web3.utils.fromWei(amount, "ether");
    appendDonation(txHash, donor, amountEth);
  });
}

function appendDonation(txHash, donor, amount) {
  const table = document.getElementById("donationsTable");
  const row = table.insertRow();
  row.innerHTML = `
    <td>${donor}</td>
    <td>${amount} ETH</td>
    <td><a href="https://sepolia.etherscan.io/tx/${txHash}" target="_blank">${txHash.slice(0, 10)}...</a></td>
  `;
}
