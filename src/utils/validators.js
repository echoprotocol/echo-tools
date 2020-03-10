import { validators } from 'echojs-lib';
import BN from 'bignumber.js';

const isEthereumAddress = (v) => v.length === 42 && v.slice(0, 2) === '0x' && validators.isBytes(v.slice(2), 20);
const convertToBN = (v) => new BN(v, 16).toString(10);

export const validateTx = (tx) => {
	if (!validators.isObject(tx)) throw new Error('transaction should be object');
	if ('to' in tx && !isEthereumAddress(tx.to)) throw new Error('invalid Ethereum address "to"');
	if (!isEthereumAddress(tx.from)) throw new Error('invalid Ethereum address "from"');
	if ('data' in tx && !validators.isHex(tx.data)) throw new Error('invalid transaction "data"');
	if (!validators.isUInt32(convertToBN(tx.gasLimit))) throw new Error('transaction gasLimit should not be negative');
	if (!validators.isUInt32(convertToBN(tx.value))) throw new Error('transaction value should not be negative');
};
