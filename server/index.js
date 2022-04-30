const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;

app.use(cors());
app.use(express.json());
const ec = new EC('secp256k1');

// generate new elliptic accounts
const acc1 = ec.genKeyPair();
const acc2 = ec.genKeyPair();
const acc3 = ec.genKeyPair();

// assign balances to accounts
const balances = {
  [acc1.getPublic().encode('hex')]: 100,
  [acc2.getPublic().encode('hex')]: 50,
  [acc3.getPublic().encode('hex')]: 75,
}

// object with all private keys
const privateKeys = {
  0: acc1.getPrivate().toString(16),
  1: acc2.getPrivate().toString(16),
  2: acc3.getPrivate().toString(16),
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  // log available accounts, balances and private keys
  console.log("Available Accounts & Balances: ", balances);
  console.log("Private Keys: ", privateKeys);
});
