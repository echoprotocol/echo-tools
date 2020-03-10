import { SerializerOutput } from 'echojs-lib/types/serializers/ISerializer';
import OperationSerializer, { TOperationInput } from "echojs-lib/types/serializers/operation";
import OperationId from "echojs-lib/types/interfaces/OperationId";
import PrivateKey from "echojs-lib/types/crypto/private-key";

export default class Tx {
  convertToEcho<T extends OperationId>(tx: TOperationInput<T, true>[1]): SerializerOutput<OperationSerializer>[];
  sign(privateKey?: PrivateKey): Promise<void>;
  serialize(): Buffer;
  serializedTx(): SerializerOutput<OperationSerializer>[];
  operationName(): number;
}
