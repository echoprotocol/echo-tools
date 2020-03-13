import echoTools from './echo-tools';

import { isEthereumAddress } from './utils/validators';

export default async function getAddressReference(address) {
	if (!isEthereumAddress(address)) throw new Error('invalid Ethereum address');

	const evmAddress = await echoTools.web3.getAddressReference(address);

	return evmAddress;
}
