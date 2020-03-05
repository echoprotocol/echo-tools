import { validators } from 'echojs-lib';
import BN from 'bignumber.js';

const isEthereumAddress = (v) => validators.isBytes(v, 21);
const isEthereumPrefix = (v) => validators.isString(v) && v.slice(0, 2) === '0x';
const convertToBN = (v) => new BN(v, 16).toString(10);

export const validateTx = (tx) => {
	if (!validators.isObject(tx)) throw new Error('transaction should be object');
	if (tx.to && !isEthereumPrefix(tx.to)) throw new Error('invalid Ethereum prefix, should be "0x"');
	if (tx.to && !isEthereumAddress(tx.to)) throw new Error('invalid Ethereum address "to"');
	if (!isEthereumAddress(tx.from)) throw new Error('invalid Ethereum address "from"');
	if (tx.data && !validators.isHex(tx.data)) throw new Error('invalid transaction data');
	if (!validators.isUInt32(convertToBN(tx.gas))) throw new Error('transaction gas should not be negative');
	if (!validators.isUInt32(convertToBN(tx.value))) throw new Error('transaction value should not be negative');
};

export const validatePrivateKey = (privateKey) => {
	if (!validators.isHex(privateKey)) throw new Error('private key should be in hex format');
};
