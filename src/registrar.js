import { PrivateKey, hash } from 'echojs-lib';
import BN from 'bignumber.js';

import echoTools from './echo-tools';
import ECHO_NAME from './constants';
import solveRegistrationTask from './utils/pow-solver';
import getEvmAddress from './utils/evm-address';

export default async function registrarAccount(privateKey, useEvmAddress = true) {
	const key = PrivateKey.fromBuffer(privateKey).toPublicKey().toString();
	const { ECHO_NAME_PREFIX } = ECHO_NAME;
	const makeAccountNameByPublicKey = (publicKey) => `${ECHO_NAME_PREFIX}${hash.sha256(publicKey, 'hex').slice(0, 20)}`;
	const accountName = makeAccountNameByPublicKey(key);
	const registrationTask = await echoTools.web3.requestRegistrationTask();
	const { blockId, randNum, difficulty } = registrationTask;
	const convertedRandNum = new BN(randNum, 16).toString(10);
	const convertedDifficulty = new BN(difficulty, 16).toString(10);
	const nonce = await solveRegistrationTask(blockId.slice(26), convertedRandNum, convertedDifficulty);
	const convertedNonce = `0x${nonce.toString(16)}`;
	const evmAddress = useEvmAddress ? getEvmAddress(privateKey) : null;
	return echoTools.web3.submitRegistrationSolution(accountName, key, key, evmAddress, convertedNonce, randNum);
}
