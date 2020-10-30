import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { AccountAddress } from './AccountAddress';
import { TraitHelpers } from './traitHelpers';
import { ListModule } from './traitHelpers';
import { OptionalScript } from './traitHelpers';
export class Package {
  constructor(
    public readonly package_address: AccountAddress,
    public readonly modules: ListModule,
    public readonly init_script: OptionalScript
  ) {}

  public serialize(serializer: Serializer): void {
    this.package_address.serialize(serializer);
    TraitHelpers.serializeListModule(this.modules, serializer);
    TraitHelpers.serializeOptionalScript(this.init_script, serializer);
  }

  static deserialize(deserializer: Deserializer): Package {
    const package_address = AccountAddress.deserialize(deserializer);
    const modules = TraitHelpers.deserializeListModule(deserializer);
    const init_script = TraitHelpers.deserializeOptionalScript(deserializer);
    return new Package(package_address, modules, init_script);
  }
}
