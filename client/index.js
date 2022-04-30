import "./index.scss";
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

const ec = new EC('secp256k1');
const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const privKey = document.getElementById("private-key").value;

  // generate signature from body and supplied private key
  const test = ec.keyFromPrivate(privKey);
  const body = JSON.stringify({sender, amount, recipient});
  const msgHash = SHA256(body).toString();
  const signature = test.sign(msgHash);

  // generate key of the sender
  const truth = ec.keyFromPublic(sender, 'hex');

  // check private key belongs to sender before executing transaction
  if (truth.verify(msgHash, signature)) {
    const request = new Request(`${server}/send`, { method: 'POST', body });
    fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
      return response.json();
    }).then(({ balance }) => {
      document.getElementById("balance").innerHTML = balance;
    });
  } else {
    alert("The private key you provided does not match your public key! Please amend either field and try again.")
  }
  
});
