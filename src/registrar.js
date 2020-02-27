const { default: echo, PrivateKey } = require('echojs-lib');

class Registrar {

  async getAddress(privateKey) {
    const key = PrivateKey.fromBuffer(privateKey).toPublicKey().toString();
    await echo.api.registerAccount(name, key, key);
    const { id } = await echo.api.getAccountByName(name);
    const uniqueId = id.split('.')[2];
    return `0x${parseInt(uniqueId).toString(16).padStart(40, '0')}`;
  }

}

export default Registrar;
