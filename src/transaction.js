import BN from 'bignumber.js';
import { PrivateKey, Transaction, constants } from 'echojs-lib';
import echoTools from './echo-tools';
import { validateTx } from './utils/validators';

class Tx {

	constructor(txOpts) {
		this.transaction = txOpts;
		this.txOperations = txOpts;
	}

	addressToId(ethLikeAddress) {
		let idType = '';
		const withoutPrefix = ethLikeAddress.replace('0x', '');
		const signedBytes = withoutPrefix.substring(0, 2);
		switch (signedBytes) {
			case '00':
				idType = constants.PROTOCOL_OBJECT_TYPE_ID.ACCOUNT;
				break;
			case '01':
				idType = constants.PROTOCOL_OBJECT_TYPE_ID.CONTRACT;
				break;
			default:
				throw new Error('Incorrect first byte of address. Must be 00 or 01');
		}
		const idInstance = withoutPrefix.slice(-16);
		const id = new BN(idInstance, 16).toString(10);
		return `1.${idType}.${id}`;
	}

	convertToEcho(tx) {
		validateTx(tx);

		const fromConvertedToEcho = this.addressToId(tx.from);
		const toConvertedToEcho = tx.to && this.addressToId(tx.to);
		this._operationName = constants.OPERATIONS_IDS.TRANSFER;

		let transferData = {
			from: fromConvertedToEcho,
			amount: { asset_id: '1.3.0', amount: new BN(tx.value, 16).toString(10) },
		};

		if (tx.data) {
			this._operationName = constants.OPERATIONS_IDS.CONTRACT_CREATE;
			transferData = {
				registrar: fromConvertedToEcho,
				value: { asset_id: '1.3.0', amount: new BN(tx.value, 16).toString(10) },
			};
		}

		let callee = { to: toConvertedToEcho };

		if (tx.to && tx.data) {
			callee = { callee: toConvertedToEcho };
			this._operationName = constants.OPERATIONS_IDS.CONTRACT_CALL;
		}

		return {
			...transferData,
			eth_accuracy: false,
			code: tx.data && tx.data.slice(2),
			fee: { asset_id: '1.3.0', amount: new BN(tx.gasLimit, 16).toString(10) },
			...(tx.to && callee),
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
