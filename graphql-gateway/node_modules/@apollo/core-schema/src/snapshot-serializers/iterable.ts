
export const test = (val: any) => !!val && typeof val === 'object' && !Array.isArray(val) && typeof val[Symbol.iterator] === 'function'
export const print = (val: any, serialize: any, indent: any) =>
  [...lines(val, serialize, indent)].join('\n')

function *lines(val: any, serialize: any, indent: any) {
  yield (val.constructor?.name || 'Iterable') + ' ['
  for (const item of val) {
    yield indent(serialize(item)) + ','
  }
  yield ']'
}