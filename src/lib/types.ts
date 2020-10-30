export type Identifier = string;
export type AccountAddress = string;

export type TypeTag = 'Bool' | 'U8' | 'U64' | 'U128' | 'Address' | 'Signer'
  | { 'Vector': TypeTag[] }
  | { 'Struct': StructTag };

export interface StructTag {
  address: string;
  module: string;
  name: string;
  type_params: TypeTag[];
}

export type TransactionArgument =
  { 'U8': number }
  | { 'U64': number }
  | { 'U128': number }
  | { 'Address': AccountAddress }
  | { 'U8Vector': Uint8Array }
  | { 'Bool': boolean };


export interface AnnotatedMoveStruct {
  is_resource: boolean;
  type_: StructTag;
  value: [Identifier, AnnotatedMoveValue][];
}

export type AnnotatedMoveValue =
  { 'U8': number }
  | { 'U64': number }
  | { 'U128': number }
  | { 'Bool': boolean }
  | { 'Address': AccountAddress }
  | { 'Bytes': Uint8Array }
  | { 'Vector': AnnotatedMoveValue[] }
  | { 'Struct': AnnotatedMoveStruct };

export type MoveValue = number | boolean | AccountAddress | Uint8Array | MoveValue[] | MoveStruct;
export type MoveStruct = { [key in Identifier]: MoveValue}
export interface ContractCall {
  module_address: AccountAddress;
  module_name: Identifier;
  func: Identifier;
  type_args: TypeTag[];
  args: TransactionArgument[];
}
