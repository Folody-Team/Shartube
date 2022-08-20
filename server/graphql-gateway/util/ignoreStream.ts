// @ts-check

import internal from "stream";

export default function ignoreStream(stream: internal.Readable) {
  stream.on("error", () => {});

  stream.resume();
}
