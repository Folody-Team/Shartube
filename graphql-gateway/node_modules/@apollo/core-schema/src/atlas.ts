import recall, { use } from '@protoplasm/recall'
import { Defs } from './de';
import GRef, { byGref } from './gref';
import Schema from './schema';

export class Atlas implements Defs {
  @use(recall)
  static fromSchemas(...schemas: Schema[]): Atlas {
    return new this(schemas)
  }

  *definitions(ref?: GRef): Defs {
    if (!ref) return this
    return yield* byGref(...this.schemas).get(ref) ?? []
  }

  *[Symbol.iterator]() {
    for (const schema of this.schemas)
      yield* schema.definitions()
  }

  constructor(public readonly schemas: Schema[]) {}
}
