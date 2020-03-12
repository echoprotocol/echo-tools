import echoTools from './echo-tools';
import addressToId from './utils/address-to-id';

import { isEthereumAddress } from './utils/validators';

export default async function getAddressReference(address) {
	if (!isEthereumAddress(address)) throw new Error('invalid Ethereum address');

	const id = await echoTools.web3.getAddressReference(address);

	return id ? addressToId(id) : null;
}
