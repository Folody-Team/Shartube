import { ASTNode, GraphQLError, Source } from 'graphql'
import { Maybe } from 'graphql/jsutils/Maybe'

export type Props = {
  message: string;
  nodes?: Maybe<ReadonlyArray<ASTNode> | ASTNode>;
  source?: Maybe<Source>;
  positions?: Maybe<ReadonlyArray<number>>;
  path?: Maybe<ReadonlyArray<string | number>>;
  originalError?: Maybe<Error>;
  extensions?: Maybe<{ [key: string]: any }>;
  causes?: Error[];
};

export class GraphQLErrorExt<C extends string> extends GraphQLError {
  static readonly BASE_PROPS = new Set(
    "nodes source positions path originalError extensions".split(" ")
  );

  readonly name: string;

  constructor(public readonly code: C, message: string, props?: Props) {
    super(message, props)
    if (props) for (const prop in props)
      if (!GraphQLErrorExt.BASE_PROPS.has(prop)) {
        (this as any)[prop] = (props as any)[prop]
      }

    this.name = code
    this.extensions.code = code
  }

  throw(): never { throw this }
  toString() {
    let output = `[${this.code}] ${super.toString()}`
    const causes = (this as any).causes
    if (causes && causes.length) {
      output += "\ncaused by:";
      for (const cause of (this as any).causes || []) {
        if (!cause) continue;
        output += "\n\n  - ";
        output += cause.toString().split("\n").join("\n    ");
      }
    }

    return output;
  }
}

/**
 * Return a GraphQLError with a code and arbitrary set of properties.
 *
 * This mainly helps deal with the very long list of parameters that GraphQLError's constructor
 * can take. It also ensures that all errors have a code, and provides a return typing that
 * facilitates extracting the provided props based on the code, as TypeScript will consider a union of
 * these errors to be a tagged union.
 *
 * @param code
 * @param props
 * @returns
 */
export function err<C extends string, P extends Props>(
  code: C,
  props: P | string
): GraphQLErrorExt<C> & P {
  const message = typeof props === "string" ? props : props.message;
  const error = new GraphQLErrorExt(
    code,
    message,
    typeof props === "string" ? undefined : props
  );
  return error as any;
}

export default err
