import fs from 'fs';
import path from 'path';
import parserGithubUrl from 'parse-github-url';
import Command from '../lib/base';
import analysisCommit from '../lib/analysisCommit';

class AnalysisCommand extends Command {
  initOptions() {
    return {
      ...super.initOptions(),
      head: {
        type: 'string',
        description: 'git head',
      },
      type: {
        type: 'string',
        description: 'output type, default markdown',
        default: 'console',
      },
    };
  }

  async run(context) {
    const { cwd, env, argv } = context;
    const { workspace, head: gitHead, type: outputType } = argv;

    const pkgPath = path.join(cwd, 'package.json');
    const pkgJson = fs.existsSync(pkgPath) && require(pkgPath) || {};

    const commits = await analysisCommit({
      env,
      cwd: path.isAbsolute(workspace) ? workspace : path.resolve(cwd, workspace),
      gitHead,
    });

    if (outputType === 'console') {
      this.logger.log(commits);
    }

    if (outputType === 'markdown') {
      // {
      //   commit: {
      //     long: '1fc3253c5030bf4166dfca3ff6c9beaa038d1a92',
      //     short: '1fc3253'
      //   },
      //   tree: {
      //     long: 'd090652f381e17699814bc4ede95fa9e9f8c0023',
      //     short: 'd090652'
      //   },
      //   author: {
      //     name: 'Suyi',
      //     email: 'thonatos@users.noreply.github.com',
      //     date: 2019-06-13T06:42:24.000Z
      //   },
      //   committer: {
      //     name: 'GitHub',
      //     email: 'noreply@github.com',
      //     date: 2019-06-13T06:42:24.000Z
      //   },
      //   subject: 'fix: wrong push (#4)',
      //   body: '',
      //   hash: '1fc3253c5030bf4166dfca3ff6c9beaa038d1a92',
      //   message: 'fix: wrong push (#4)',
      //   gitTags: '',
      //   committerDate: 2019-06-13T06:42:24.000Z
      // }

      // * [[`29a2f2fd9`](http://github.com/eggjs/egg/commit/29a2f2fd92e4d3e3cf0ee9ff034d8cdce07ee693)] - fix: more log for bodyParser (#3809) (TZ | 天猪 <<atian25@qq.com>>)

      const docs: string[] = [];
      const fixes: string[] = [];
      const features: string[] = [];
      const md = {
        docs,
        fixes,
        features,
      };

      commits.forEach(({ subject: message }) => {
        if (message.indexOf('fix') === 0) {
          fixes.push(message);
          return;
        }
        if (message.indexOf('feat') === 0) {
          features.push(message);
          return;
        }
        if (message.indexOf('docs') === 0) {
          docs.push(message);
          return;
        }
      });

      const renderType = (arr, type) => {
        if (arr.length === 0) {
          return '';
        }
        return `* **${type}**\n` + arr.map(d => `  * ${d}`).join('\n');
      };

      const render = init => {
        let info = init;

        Object.keys(md).forEach(name => {
          const t = renderType(md[name], name);
          if (!t) {
            return;
          }

          info += t + '\n\n';
        });

        return info;
      };

      const changeInfo = render('### Notable changes\n\n');
      const repo = pkgJson.repository && parserGithubUrl(pkgJson.repository.url || pkgJson.repository.url).repo || '';
      const commitList = commits
        .filter(c => !c.message.includes('chore(release)'))
        .map(({ commit, author, subject: message }) => {
          const commitUrl = repo ? `http://github.com/${repo}/commit/${commit.long}` : commit.long;
          return `* [[\`${commit.short}\`](${commitUrl})] - ${message} (${author.name} <<${author.email}>>)`;
        });

      const commitsInfo = '### Commits\n\n' + commitList.join('\n');

      this.logger.info('\n' + changeInfo + '\n' + commitsInfo);
    }
  }
}

export = AnalysisCommand;
