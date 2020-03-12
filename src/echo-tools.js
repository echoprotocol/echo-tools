import Web3 from 'web3';

class EchoTools {

	set web3(provider) {
		this._web3 = new Web3(provider);
	}

	get web3() {
		return this._web3;
	}

	set provider(provider) {
		this._provider = provider;
	}

	get provider() {
		return this._provider;
	}

	async connect(provider) {
		this.web3 = new Web3(provider);
		this.web3.extend({
			methods: [
				{
					name: 'requestRegistrationTask',
					call: 'echo_requestRegistrationTask',
				},
				{
					name: 'submitRegistrationSolution',
					call: 'echo_submitRegistrationSolution',
					params: 6,
				},
				{
					name: 'chainId',
					call: 'eth_chainId',
				},
			],
		});
	}

}

export default new EchoTools();
