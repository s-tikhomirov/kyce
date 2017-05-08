var Contract_cls_hack = require('../contracts/bin/dbgtoken.js').DbgTokens;

function Contract() {
  var self = this;

  self.address = ko.observable(null);
  self.tokens = null;

  self.update = function(address) {
    self.address(address);

    var e = Contract_cls_hack(web3);
    self.tokens = web3.eth.contract(e.abi).at(address);

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
