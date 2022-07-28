export class Raw {
  constructor(public readonly text: string) {}
}
export const raw = (text: string) => new Raw(text)
export default raw

export const test = (val: any) => val instanceof Raw
export const print = (raw: Raw) => raw.text
