import { constants } from 'echojs-lib';
import BN from 'bignumber.js';

export default function addressToId(ethLikeAddress) {
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
