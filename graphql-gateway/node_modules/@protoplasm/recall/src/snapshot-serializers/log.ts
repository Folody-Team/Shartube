import {Report} from '../report'

export const test = (input: any) => input instanceof Report
export const print = (input: Report, print: any, indent: any) =>
  [...lines(input, print, indent)].join('\n')


function *lines(val: Report, serialize: any, indent: any): Iterable<string> {
  if (!val.messages) return yield 'Report <empty>'
  yield 'Report ['
  for (const item of val.messages) {
    yield indent(serialize(item)) + ','
  }
  yield ']'
}