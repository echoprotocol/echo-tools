## Setup

This library can be obtained through npm:
```
npm install echo-tools
```

## Usage

```javascript
const { default: echoTools } = require('echo-tools');

await echoTools.connect('ws://127.0.0.1:9000');
```

You also can use it with import
```javascript
import echoTools from 'echo-tools';

await echoTools.connect('ws://127.0.0.1:9000');
```

Create, sign and serialize transaction
```javascript
import { Transaction } from 'echo-tools';

const options = {
  gas: '0x0190',
  gasLimit: '0x2710',
  to: '0x0000000000000000000000000000000000000016',
  from: '0x0000000000000000000000000000000000000017',
  value: '0x010',
  data: `0x${bytecode}`,
};

const tx = new Transaction(options);
await tx.sign();
tx.serialize();
```

For register account (should use private key)
```javascript
import { registrarAccount } from 'echo-tools';

await registrarAccount('private_key');
```

For get address reference from eth_address to echo_address
```javascript
import { getAddressReference } from 'echo-tools';

await getAddressReference('eth_address');
```

# License

The MIT License

Copyright (c) 2018-2019 Echo Technological Solutions LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
