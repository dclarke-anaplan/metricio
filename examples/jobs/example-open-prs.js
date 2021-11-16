import { findIssues, getOldestPR, parseOrgAndRepoNameFromUrl, countUniqueIssues } from '../../src/jobs/libs/github';
import {secretNames} from '../../secrets';

export const interval = '*/2 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {

  const githubTokenName = secretNames.GITHUB;
  const authors = 'author:dev1 author:dev2 author:dev3 author:etc';
  const excludeAuthors = authors.replace('author','-author');
  const reviewers = authors.replace('author', 'reviewed-by');
  const repos = 'repo:$org/repo1 repo:$org/repo1 repo:$org/repo3 repo:$org/etc';
  const excludeRepos = repos.replace(/repo/g,'-repo');


  const prsOnOtherRepos = await findIssues(`is:open is:pr ${authors} ${excludeRepos}`, githubTokenName);
  const prsToReview = await findIssues(`is:open is:pr ${repos} ${excludeAuthors}`, githubTokenName);
  const prsAssignedToTeam = await findIssues(`is:open is:pr  ${reviewers} ${excludeAuthors}`, githubTokenName);

  const oldestPr = getOldestPR(prsToReview.items.concat(prsAssignedToTeam.items));

  const epochTime = (oldestPr && oldestPr.created_at) || 0;
  const eventText = (oldestPr && `${parseOrgAndRepoNameFromUrl(oldestPr.repository_url)} #${oldestPr.number}`) || "No PRs open!";

  return [
    {
      target: 'OpenPRs',
      data: {
        value: prsToReview.total_count,
        link: prsToReview.html_url
      },
    },
    {
      target: 'OtherPRs',
      data: {
        value: prsOnOtherRepos,
        link: prsOnOtherRepos.html_url
      },
    },
    {
      target: 'PRsReview',
      data: {
        value: countUniqueIssues(prsToReview, prsAssignedToTeam),
      },
    },
    {
      target: 'OldestPR',
      data: {
        epochTime,
        eventText,
        link: oldestPr.html_url
      },
    },
  ];
};
