import recall, { use } from '@protoplasm/recall'
import { groupBy } from './each'
import LinkUrl from './link-url'

export class GRef {
  @use(recall)
  static canon(name: string, graph?: LinkUrl): GRef {
    return new this(name, graph)
  }

  static named(name: string, graph?: LinkUrl | string) {
    return this.canon(name, LinkUrl.from(graph))
  }

  static directive(name: string, graph?: LinkUrl | string) {
    return this.canon('@' + name, LinkUrl.from(graph))
  }

  static rootDirective(graph?: LinkUrl | string) {
    return this.directive('', graph)
  }

  static schema(graph?: LinkUrl | string) {
    return this.canon('', LinkUrl.from(graph))
  }

  setGraph(graph?: LinkUrl | string) {
    return GRef.canon(this.name, LinkUrl.from(graph))
  }

  setName(name: string) {
    return GRef.canon(name, this.graph)
  }

  toString() {
    const graph = this.graph?.href ?? ''
    return graph + (this.name ? `#${this.name}` : '')
  }

  isSchema() { return this.name === '' }

  private constructor(public readonly name: string, public readonly graph?: LinkUrl) {}
}

export default GRef

export interface HasGref {
  gref: GRef
}

/**
 * group detached nodes (or anything with an 'hgref' really )
 */
export const byGref = groupBy((node: any): GRef => node?.gref)
