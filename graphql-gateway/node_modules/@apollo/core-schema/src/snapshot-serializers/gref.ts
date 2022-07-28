import {GRef} from '../gref'
import {LinkUrl} from '../link-url'

export const test = (val: any) =>
    val instanceof GRef
    || val instanceof LinkUrl
export const print = (val: GRef | LinkUrl) =>
    `${val.constructor.name} <${val.toString()}>`
