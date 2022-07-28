import recall, { use } from '@protoplasm/recall'
import { URL } from 'url'
import Version from './version'
export class LinkUrl {
  static from(input?: string | LinkUrl | null | undefined): LinkUrl | undefined
  static from(input: string | LinkUrl): LinkUrl
  static from(input?: string | LinkUrl) {    
    if (typeof input === 'string') return this.parse(input)
    return input ?? undefined
  }

  static parse(input: string) {
    const url = new URL(input)
    const path = url.pathname ?? ''
    const parts = rsplit(path, '/')

    // the last two path components are (name)/(name or version)
    const nameVerPart = parts.next().value ?? undefined
    const namePart = parts.next().value ?? undefined

    const version = Version.parse(nameVerPart)
    const name = version ? parseName(namePart) : parseName(nameVerPart)

    // clear out unused url components
    url.search = ''
    url.password = ''
    url.username = ''
    url.hash = ''
    return this.canon(url.href, name ?? undefined, version ?? undefined)
  }

  static get GRAPHQL_SPEC() {
    return LinkUrl.from('https://specs.graphql.org')
  }

  *suggestNames(): Iterable<string> {
    if (this.name) yield this.name
    if (this.name && this.version) {
      yield this.name + '_' + this.version.major
      yield this.name + '_' + this.version.major + '_' + this.version.minor
    }
    const url = new URL(this.href)
    if (url.hostname) {
      const parts = url.hostname.split('.')
      const [longest] = [...parts].sort((a, b) => b.length - a.length)
      if (this.name) {
        yield longest + '_' + this.name
        yield parts.join('_') + '_' + this.name
      } else {
        yield longest
        yield parts.join('_')
      }
    }
    const baseName = this.name || 'linked_schema'
    for (let i = 1;;++i) {
      yield baseName + '_' + i
    }
  }

  @use(recall)
  private static canon(href: string, name?: string, version?: Version): LinkUrl {
    return new this(href, name, version)
  }

  toString() { return this.href }

  private constructor(
    public readonly href: string,
    public readonly name?: string,
    public readonly version?: Version) {}
}

export default LinkUrl

function *rsplit(haystack: string, sep: string) {
  let index = haystack.lastIndexOf(sep)
  const len = haystack.length
  const sepLen = sep.length
  let lastIndex = len
  while (index !== -1 && lastIndex > 0) {
    yield haystack.substring(index + sepLen, lastIndex)
    lastIndex = index
    index = haystack.lastIndexOf(sep, index - 1)
  }
  yield haystack.substring(0, lastIndex)
}

const NAME_RE = /^[a-zA-Z0-9\-]+$/
function parseName(name: string | null | void): string | null {
  if (!name) return null
  if (!NAME_RE.test(name)) return null
  if (name.startsWith('-') || name.endsWith('-')) return null
  return name
}
