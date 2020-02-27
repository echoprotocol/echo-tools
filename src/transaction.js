const Web3 = require('web3');
const BN = require('bignumber.js');
const { PrivateKey, Transaction, constants } = require('echojs-lib');
const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 5,
};
const web3 = new Web3('ws://localhost:8092', null, options);
const bytecode = '608060405234801561001057600080fd5b50610114806100206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063ef5fb05b14602d575b600080fd5b603360ab565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101560715780820151818401526020810190506058565b50505050905090810190601f168015609d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b60606040518060400160405280600681526020017f68656c6c6f77000000000000000000000000000000000000000000000000000081525090509056fea165627a7a723058208b9751f933c80532a4a77ef843773c50829f962f91f07a7dc98770e86fdcc7fc0029';

const rawTx = {
  gas: '0x0190',
  gasLimit: '0x2710',
  to: '0x0000000000000000000000000000000000000016',
  from: '0x0000000000000000000000000000000000000017',
  value: '0x010', //0x010
  data: `0x${bytecode}`,
};

class Tx {
  constructor(txOpts, provider) {
    this.transaction = txOpts;
    this.txOperations = txOpts;
    this.web3 = new Web3(provider);
    this.web3.extend({
      methods: [{
        name: 'chainId',
        call: 'eth_chainId',
      }]
    });
  }

  set txOperations(tx) {
    this._txOperations = this.convertToEcho(tx);
  }

  convertToEcho(tx) {
    const fromConvertedToEcho = new BN(tx.from.slice(-2), 16).toString(10);
    const toConvertedToEcho = tx.to && new BN(tx.to.slice(-2), 16).toString(10);
    this._operationName = constants.OPERATIONS_IDS.TRANSFER;

    let transferData = {
      from: `1.2.${fromConvertedToEcho}`,
      amount: {asset_id: '1.3.0', amount: new BN(tx.value, 16).toString(10) },
    };

    if (tx.data) {
      this._operationName = constants.OPERATIONS_IDS.CONTRACT_CREATE;
      transferData = {
        registrar: `1.2.${fromConvertedToEcho}`,
        value: {asset_id: '1.3.0', amount: new BN(tx.value, 16).toString(10) },
      };
    }

    let callee = { to: `1.2.${toConvertedToEcho}` };

    if (tx.to && tx.data) {
      callee = { callee: `1.11.${toConvertedToEcho}` };
      this._operationName = constants.OPERATIONS_IDS.CONTRACT_CALL;
    }

    return {
      ...transferData,
      eth_accuracy: false,
      code: tx.data && tx.data.slice(2),
      fee: { asset_id: '1.3.0', amount: new BN(tx.gas, 16).toString(10) },
      ...(tx.to && callee),
    };
  }

  get operationName() { return this._operationName }

  get txOperations() { return this._txOperations }

  set serializedTx(tx) {
    this._serializedTx = tx;
  }

  get serializedTx() { return this._serializedTx }

  set transaction(tx) {
    this._transaction = new Transaction();
  }

  get transaction() { return this._transaction }

  set web3(provider) {
    this._web3 = new Web3(provider);
  }

  get web3() { return this._web3 }

  async sing(_privateKey) {
    const block = await this.web3.eth.getBlock('latest');
    this.transaction.addOperation(this.operationName, this.txOperations);
    this.transaction.refBlockNum = block.number;
    this.transaction.refBlockPrefix = block.hash.slice(26);
    const chainId = await this.web3['chainId']();
    this.transaction.chainId = chainId.slice(2);
    const privateKey = PrivateKey.fromWif(_privateKey);
    await this.transaction.sign(privateKey);
  }

  serialize() {
    return this.serializedTx = this.transaction.signedTransactionSerializer().toString('hex');
  }

}
