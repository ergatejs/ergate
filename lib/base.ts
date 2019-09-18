import consola from 'consola';
import Command from 'common-bin';

const CONTEXT = Symbol('context');
const LOGGER = Symbol('logger');

export default class BaseCommand extends Command {
  options: object;
  _options: object;
  parserOptions: object;
  cliName: string | undefined;

  constructor(rawArgv?: string[]) {
    super(rawArgv);

    // it's a setter
    this.cliName = undefined;
    this.options = this._options = this.initOptions();
    this.parserOptions = {
      execArgv: true,
      removeAlias: true,
    };
  }

  initOptions(): Record<string, any> {
    return {
      workspace: {
        type: 'string',
        description: 'work directory',
        default: '.',
      },
      verbose: {
        type: 'boolean',
        description: 'run at verbose mode, will print debug log',
      },
    };
  }

  initContext(context: Command.Context): object {
    return context;
  }

  get context() {
    if (!this[CONTEXT]) {
      this[CONTEXT] = this.initContext(super.context);
    }
    return this[CONTEXT];
  }

  get logger() {
    if (!this[LOGGER]) {
      const shouldLogDebug =
        this.context.argv.verbose || process.env.DEBUG === '*' || /\bCLI\b/.test(process.env.DEBUG || '');

      const logger = consola.create({
        level: shouldLogDebug ? 4 : 3,
      });

      this[LOGGER] = logger;
    }
    return this[LOGGER];
  }

  errorHandler(err: Error) {
    this.logger.error(err);
    process.nextTick(() => process.exit(1));
  }
}
