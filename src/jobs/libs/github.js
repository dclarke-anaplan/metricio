import request from 'request-promise-native';
import {getSecret} from '../../../secrets';

const getOldestPR = prData => prData.length === 0 ? undefined : prData.sort((pr1, pr2) => Date.parse(pr1.created_at) - Date.parse(pr2.created_at))[0];

const getStalestPR = prData => prData.length === 0 ? undefined : prData.sort((pr1, pr2) => Date.parse(pr1.updated_at) - Date.parse(pr2.updated_at))[0];

const parseOrgAndRepoNameFromUrl = repoUrl => {
  const repoUrlParts = repoUrl.split('/');
  return `${repoUrlParts[repoUrlParts.length - 2]}/${repoUrlParts[repoUrlParts.length - 1]}`;
};

const getFileFromRepo = async(org, repo, filePath, githubSecretName) => {
  const token = getSecret(githubSecretName).token;
  let uri = `https://github.com/api/v3/repos/${org}/${repo}/contents/${filePath}`;
  const options= {
    uri: uri,
    qs:{
      access_token: token
    },
    headers: {
      'Accept': 'application/vnd.github.3.raw'
    },
  };
  return request(options)
};

const findIssues = async (query, githubSecretName) => {
  const token = getSecret(githubSecretName).token;
  const options = {
    uri: 'https://github.com/api/v3/search/issues',
    qs: {
      q: query,
      access_token: token,
    },
    json: true,
  };
  const issues = await request(options);
  issues.html_url = 'https://github.com/search?q=' + encodeURI(query);
  return issues;
};

function countUniqueIssues(...issueLists) {
  var results = new Set();
  issueLists.forEach( issueList => {
    issueList.items.forEach( issue => {
      results.add(issue.id);
    });
  });
  return results.size;
}

const getBranches = async(orgName, repoName, getProtectedBranches, githubSecretName) => {
  const token = getSecret(githubSecretName).token;
  const options = {
    uri: 'https://github.com/api/v3/repos/' + orgName + '/' + repoName + '/branches',
    qs: {
      access_token: token,
      protected: getProtectedBranches
    },
    json: true,
  };
  return request(options);
}

const getBranch = async(orgName, repoName, branchName, githubSecretName) => {
  const token = getSecret(githubSecretName).token;
  const options = {
    uri: 'https://github.com/api/v3/repos/' + orgName + '/' + repoName + '/branches/' + branchName,
    qs: {
      access_token: token
    },
    json: true,
  };
  return request(options);
}

async function sortBranchesByDate(branchNames, orgName, repoName, githubSecretName) {
  // Enrich with date info
  var branches = []
  for (const branchName of branchNames) {
    const branchDetails = await getBranch(orgName, repoName, branchName, githubSecretName);
    branches.push({
      name: branchName,
      date: branchDetails.commit.commit.committer.date
    });
  }
  // Sort by date (oldest first)
  branches.sort((branch1, branch2) => branch1.date.localeCompare(branch2.date));
  return branches.map(branch => branch.name);
}

async function getLatestReleaseBranch(orgName, repoName, githubSecretName) {
  const releaseBranchNames = (await getBranches(orgName, repoName, true, githubSecretName))
  .filter(branch => {
    return branch.name.startsWith('release/');
  })
  .map(branch => branch.name);
  const releaseBranchesByDate = await sortBranchesByDate(releaseBranchNames, orgName, repoName, githubSecretName);

  return releaseBranchesByDate.slice(-1)[0];
}

module.exports = { findIssues, getOldestPR, getStalestPR, parseOrgAndRepoNameFromUrl, countUniqueIssues, getFileFromRepo, getBranch, getBranches, sortBranchesByDate, getLatestReleaseBranch };
