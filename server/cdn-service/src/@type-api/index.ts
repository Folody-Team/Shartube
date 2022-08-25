export const type = {
  init: (version: string | number) => {
    if (version) {
      return `https://discord.com/api/v${version}`;
    }
  }
}