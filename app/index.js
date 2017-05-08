_ = require('lodash');
Web3 = require('web3');
web3 = new Web3();
Exchange = require('../contracts/bin/exchange.js').Exchange;
exchange = null;

const isNodeConnected = () => web3.isConnected();

function connectToEthereumNode(url) {
  const provider = new web3.providers.HttpProvider(url);
  web3.setProvider(provider);
  console.log(web3);
  if (isNodeConnected() === true) {
    exchange = Exchange(web3);
    web3.eth.defaultAccount = web3.eth.coinbase;
    return true;
  }
  return false;
}

function component () {
  var element = document.createElement('div');

  console.log(connectToEthereumNode('http://127.0.0.1:8080'));

  console.log(web3);

  /* lodash is required for the next line to work */
  element.innerHTML = _.join(['Hello','webpack'], ' ');
  element.innerHTML = _.join(
    [element.innerHTML, `Exchange address is ${exchange.address}`]
  );
  return element;
}

document.body.appendChild(component());