
export default class Upload {
  promise: Promise<any>;
  resolve!: (file: any) => void;
  file: any;
  reject!: (reason?: any) => void;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (file) => {
        this.file = file;

        resolve(file);
      };
      this.reject = reject;
    });

    // Prevent errors crashing Node.js, see:
    // https://github.com/nodejs/node/issues/20392
    this.promise.catch(() => {});
  }
}
