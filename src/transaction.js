import BN from 'bignumber.js';
import { PrivateKey, Transaction, constants } from 'echojs-lib';
import echoTools from './echo-tools';
import { validateTx } from './utils/validators';
import addressToId from './utils/address-to-id';

class Tx {

	constructor(txOpts) {
		this.transaction = txOpts;
		this.txOperations = txOpts;
	}

	convertToEcho(tx) {
		validateTx(tx);

		const fromConvertedToEcho = addressToId(tx.from);
		const toConvertedToEcho = tx.to && addressToId(tx.to);
		this._operationName = constants.OPERATIONS_IDS.TRANSFER;

		let transactionData = {
			from: fromConvertedToEcho,
			amount: { asset_id: '1.3.0', amount: new BN(tx.value, 16).toString(10) },
			to: toConvertedToEcho,
		};

		if (tx.data) {
			this._operationName = constants.OPERATIONS_IDS.CONTRACT_CREATE;
			transactionData = {
				registrar: fromConvertedToEcho,
				value: { asset_id: '1.3.0', amount: new BN(tx.value, 16).toString(10) },
				code: tx.data.slice(2),
				eth_accuracy: false,
			};

			if (tx.to) {
				this._operationName = constants.OPERATIONS_IDS.CONTRACT_CALL;
				transactionData.callee = toConvertedToEcho;
			}
		}

		return {
			...transactionData,
			fee: { asset_id: '1.3.0', amount: new BN(tx.gasLimit, 16).toString(10) },
		};
	}

	get operationName() {
		return this._operationName;
	}

	set txOperations(tx) {
		this._txOperations = this.convertToEcho(tx);
	}

	get txOperations() {
		return this._txOperations;
	}

	set transaction(tx) {
		this._transaction = new Transaction();
	}

	get transaction() {
		return this._transaction;
	}

	async sign(_privateKey) {
		const block = await echoTools.web3.eth.getBlock('latest');
		this.transaction.addOperation(this.operationName, this.txOperations);
		this.transaction.refBlockNum = block.number;
		this.transaction.refBlockPrefix = block.hash.slice(26);
		const chainId = await echoTools.web3.chainId();
		this.transaction.chainId = chainId.slice(2);
		const privateKey = PrivateKey.fromBuffer(_privateKey);
		await this.transaction.sign(privateKey);
	}

	serialize() {
		return this.transaction.signedTransactionSerializer();
	}

}

export default Tx;
