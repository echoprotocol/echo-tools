const Web3 = require('web3');
const BN = require('bignumber.js');
const { PrivateKey, Transaction, constants } = require('echojs-lib');

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

export default Tx;


