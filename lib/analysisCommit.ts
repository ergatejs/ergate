import Debug from 'debug';
import getStream from 'get-stream';
import gitLogParser from 'git-log-parser';

const debug = Debug('egrate:analysisCommit');

export default async options => {
  const { cwd, env, gitHead } = options;

  if (gitHead) {
    debug('Use gitHead: %s', gitHead);
  } else {
    debug('No previous release found, retrieving all commits');
  }

  Object.assign(gitLogParser.fields, {
    hash: 'H',
    message: 'B',
    gitTags: 'd',
    committerDate: { key: 'ci', type: Date },
  });

  const commits = (await getStream.array(
    gitLogParser.parse({ _: `${gitHead ? gitHead + '..' : ''}HEAD` }, { cwd, env: { ...process.env, ...env } })
  )).map((commit: any) => {
    commit.message = commit.message.trim();
    commit.gitTags = commit.gitTags.trim();
    return commit;
  });
  debug(`Found ${commits.length} commits since last release`);
  debug('Parsed commits: %o', commits);
  return commits;
};
