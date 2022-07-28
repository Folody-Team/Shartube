import { Redirect } from "../de"

/**
 * Serialize Redirects
 */
export const test = (val: any) => val?.code === 'Redirect'
export const print = (val: Redirect, snap: any) =>
  `${snap(val.gref)} => ${snap(val.toGref)} (via ${snap(val.via)})`