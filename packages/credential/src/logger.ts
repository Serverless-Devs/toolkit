class Logger {
  private logger: any = console;

  set(logger: any = console) {
    this.logger = logger;
    return logger;
  }

  get() {
    return this.logger;
  }
}

export default new Logger();