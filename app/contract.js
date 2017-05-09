// var Contract_cls_hack = require('../contracts/bin/dbgtoken.js').DbgTokens;
const abi = [ { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "KYCContract", "outputs": [ { "name": "", "type": "address", "value": "0xf3905e407f9505824aa886f7072c767ce8949061" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "inputs": [ { "name": "_to", "type": "address", "index": 0, "typeShort": "address", "bits": "", "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;to", "template": "elements_input_address", "value": "0x1d07e9216cdb5ef32d713aa1f12d1fb64a347c3f" }, { "name": "_amount", "type": "uint256", "index": 1, "typeShort": "uint", "bits": "256", "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;amount", "template": "elements_input_uint", "value": "10000" }, { "name": "_KYCContract", "type": "address", "index": 2, "typeShort": "address", "bits": "", "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp; K Y C Contract", "template": "elements_input_address", "value": "0xF3905E407F9505824aA886F7072C767CE8949061" } ], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Approval", "type": "event" } ]

function Contract() {
  var self = this;

  self.address = ko.observable(null);
  self.tokens = null;

  self.update = function(address) {
    self.address(address);

    // var e = Contract_cls_hack(web3);
    // const abi = e.abi;
    self.tokens = web3.eth.contract(abi).at(address);

    console.log("new token contract address:", address)
  }
  self.get_balance = async function(address) {
    return await new Promise((resolve, reject) => {
      self.tokens.balanceOf.call(address, (err, res) => {
        if (err)
          reject(err);
        else
          resolve(res+"");
      })
    });
  }
}

module.exports = Contract
