import path from 'path';
import Command from '../lib/base';
import analysisCommit from '../lib/analysisCommit';

class AnalysisCommand extends Command {
  initOptions() {
    return {
      ...super.initOptions(),
      gitHead: {
        type: 'string',
        description: 'git head',
      },
    };
  }

  async run(context) {
    const { cwd, env, argv } = context;
    const { workspace, gitHead } = argv;

    const commits = await analysisCommit({
      env,
      cwd: path.isAbsolute(workspace) ? workspace : path.resolve(cwd, workspace),
      gitHead,
    });

    this.logger.info(commits);
  }
}

export = AnalysisCommand;
