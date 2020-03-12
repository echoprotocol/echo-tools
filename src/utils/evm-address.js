import * as ethWallet from 'ethereumjs-wallet';

export default function getEvmAddress(privateKey) {
	const wallet = ethWallet.fromPrivateKey(privateKey);
	return `0x${wallet.getAddress().toString('hex')}`;
}
