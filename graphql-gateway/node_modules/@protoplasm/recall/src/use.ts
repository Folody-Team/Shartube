import recall, { Fn } from '.'

export type Wrapper = (fn: Fn) => Fn
export const use = recall(
  function use<W extends Wrapper>(wrap: W) {
    return (_target: any, _prop: string, desc: PropertyDescriptor) => {
      if (typeof desc.get === 'function') {
        desc.get = wrap(desc.get)
      }
      if (typeof desc.value === 'function') {
        desc.value = wrap(desc.value)
      }
      return desc
    }
  }
)
