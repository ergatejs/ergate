import BaseCommand from './lib/base';
import path from 'path';

class MainCommand extends BaseCommand {
  constructor(rawArgv?: string[]) {
    super(rawArgv);

    // load command
    this.load(path.join(__dirname, 'command'));
  }
}

export = MainCommand;
