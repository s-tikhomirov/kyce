// html
_ = require('lodash');
jQuery = $ = require('jquery');
bootstrap = require('bootstrap');
ko = require('knockout');

// ethereum
Web3 = require('web3');
web3 = new Web3();
Exchange = require('../contracts/bin/exchange.js').Exchange;
exchange = null;

// app
VM = require("./vm.js")

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

function main() {
  var element = document.createElement('div');

  if (!connectToEthereumNode('http://127.0.0.1:8080')) {
    alert("Can't connect to the node.");
    console.log("error");
    return;
  }
  console.log("connect ok");

  window.VM = new VM();
  ko.applyBindings(VM);
  VM.token_symbol = "$";

  VM.OrderBook.update();
}


main()
