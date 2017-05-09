// html
// _ = require('lodash');
window.jQuery = window.$ = require('jquery');
var bootstrap = require('bootstrap');
window.ko = require('knockout');

// ethereum
Web3 = require('web3');
window.web3 = new Web3();

// app
var VMcls = require("./vm.js")

const isNodeConnected = () => web3.isConnected();

function connectToEthereumNode(url) {
  const provider = new web3.providers.HttpProvider(url);
  web3.setProvider(provider);
  console.log(web3);
  if (isNodeConnected() === true) {
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

  window.VM = new VMcls();
  ko.applyBindings(VM);

  VM.Exchange.check_saved();
  VM.Wallet.init()
}


main()
