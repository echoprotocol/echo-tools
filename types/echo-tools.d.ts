import Web3 from 'web3';

export default class EchoTools {
  public readonly web3: Web3;
  public readonly provider: string;
  connect(provider: string): Promise<void>;
}
