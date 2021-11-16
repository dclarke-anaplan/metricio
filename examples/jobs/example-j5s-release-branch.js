import { secretNames } from '../../secrets';
import { getLatestReleaseBranch } from '../../src/jobs/libs/github';
import { getLastBuildStatus } from '../../src/jobs/libs/jenkinsj5s';


export const interval = '*/1 * * * *';
export const perform = async () => {
  const apiServices = await getLastBuildStatus('org', 'repo', 'develop');

  const newestReleaseBranch = await getLatestReleaseBranch('org', 'repo', secretNames.GITHUB);
  const apiServicesRelease = await getLastBuildStatus('org', 'repo', encodeURIComponent(newestReleaseBranch));

  return [
    {
      target: 'repo',
      data: {
        outcome: apiServices.status,
        branch: 'develop',
        link: apiServices.link,
      },
    },
    {
      target: 'repo-release',
      data: {
        outcome: apiServicesRelease.status,
        branch: newestReleaseBranch,
        link: apiServicesRelease.link,
      },
    },
  ];
};
