import { ok } from 'assert';
import { hash, serializers } from 'echojs-lib';

const getHashPow = (taskHash) => {
	let solPow = 0;
	for (let index = 0; index < 32; index += 1) {
		const byte = taskHash[index];
		if (byte === 0) {
			solPow += 8;
			continue;
		}
		/* eslint-disable no-bitwise */
		let divider = 1 << 7;
		while (byte < divider) {
			solPow += 1;
			/* eslint-disable no-bitwise */
			divider >>= 1;
		}
		break;
	}
	return solPow;
};

function validateRegistrationOptions(options) {
	if (options.batch !== undefined) {
		ok(typeof options.batch === 'number');
		ok(Number.isSafeInteger(options.batch));
		ok(options.batch >= 0);
	}
	if (options.timeout) {
		ok(typeof options.timeout === 'number');
		ok(Number.isSafeInteger(options.timeout));
		ok(options.timeout >= 0);
	}
	const batch = options.batch === undefined ? 1e6 : options.batch;
	const timeout = options.timeout === undefined ? 100 : options.timeout;
	return { batch, timeout };
}

const solveRegistrationTask = async (blockId, randNum, difficulty, options = {}) => {
	const { batch, timeout } = validateRegistrationOptions(options);
	const buffer = Buffer.concat([
		Buffer.from(blockId, 'hex'),
		serializers.basic.integers.uint64.serialize(randNum),
	]);
	let nonce = 0;
	while (true) {
		const bufferToHash = Buffer.concat([buffer, serializers.basic.integers.uint64.serialize(nonce)]);
		const taskHash = hash.sha256(bufferToHash);
		const hashPow = getHashPow(taskHash);
		// eslint-disable-next-line no-await-in-loop
		if (batch !== 0 && nonce % batch === 0) await new Promise((resolve) => setTimeout(() => resolve(), timeout));
		if (hashPow > difficulty) {
			return nonce;
		}
		nonce += 1;
	}
};

export default solveRegistrationTask;
