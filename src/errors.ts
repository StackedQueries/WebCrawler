export class NavError extends Error {
  constructor(message) {
    super(message);
    this.name = "NavError";
  }
}
