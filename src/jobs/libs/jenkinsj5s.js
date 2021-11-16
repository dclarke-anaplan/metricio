import request from 'request-promise-native';

const endpoint = 'https://$jenkins-host/job';


function buildJenkinsJobUrl(...jobPath) {
    return jobPath.reduce((reduced, current) => {
        return `${reduced}/job/${current}`
    });
}

function getBuildStatusAndLink(build) {
  return {
    status : getStatusString(build.result),
    link : build.url
  };
}

function getStatusString(status) {
    return status === null ? 'pending' : status;
}
function getStatusFromColor(color) {
    switch (color) {
      case "red":
        return "UNSTABLE"
      case "blue":
        return "SUCCESS"
      default:
        return "PENDING"
    }
}

const getParameterValue = (build, parameterName) => {
  for (let i = 0; i < build.actions.length; i += 1) {
    const action = build.actions[i];
    const clazz = action['_class'];
    if (typeof clazz !== 'undefined') {
      if (clazz === 'hudson.model.ParametersAction') {
        for (let j = 0; j < action.parameters.length; j += 1) {
          const actionParameter = action.parameters[j];
          if (actionParameter.name === parameterName) {
            return actionParameter.value;
          }
        }
      }
    }
  }
  return undefined
}

const buildHasParameter = (build, parameterName, parameterValue) => {
  const actualParameterValue = getParameterValue(build, parameterName)
  if( actualParameterValue === parameterValue) {
    return true
  } else {
    return false
  }
};

const getLastBuildStatusWithBranchParameter = (builds, branch) => {
  for (let i = 0; i < builds.length; i += 1) {
    const build = builds[i];
    if (buildHasParameter(build, 'branch', branch)) {
      return getBuildStatusAndLink(build);
    }
  }
  return '-';
};

const getLastBuildStatusIgnoringNoopBuilds = (builds) => {
  for (let i = 0; i < builds.length; i += 1) {
    const build = builds[i];
    if (build.result !== 'NOT_BUILT') {
      return getBuildStatusAndLink(build);
    }
  }
  return '-';
};

const buildParametersNotSpecified = (build, parameterNames, defaultValue) => {
  for (let parameterIndex = 0 ; parameterIndex < parameterNames.length ; parameterIndex += 1) {
    const parameterValue = getParameterValue(build, parameterNames[parameterIndex])
    if(parameterValue && parameterValue != defaultValue) {
      return false
    }
  }
  return true
}

const getLastBuildWithParametersNotSpecified = (builds, parameterNames, defaultValue) => {
  for (let i = 0; i < builds.length; i += 1) {
    const build = builds[i];
    if(buildParametersNotSpecified(build, parameterNames, defaultValue)) {
      return build;
    }
  }
  return undefined;
}

/**
 * Get the jobs for some scope
 */
const getJobs = async (...jobPath) => {
  try {
    const response = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}`);
    return response.jobs;
  } catch (StatusCodeError) {
    return "Error";
  }
};

const getBuilds = async (...jobPath) => {
  try {
    const response = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}`, {'depth': '1'});
    return response.builds;
  } catch (StatusCodeError) {
    return "Error";
  }
};

const getLastBuildStatus = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}/lastBuild`);
    return getBuildStatusAndLink(value);
  } catch (StatusCodeError) {
    return "Error";
  }
};

const getLastCompletedBuild = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}/lastCompletedBuild`);
    return getBuildStatusAndLink(value.result);
  } catch (StatusCodeError) {
    return "Error";
  }
};

const getLastSuccessfulBuildVersion = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}/lastSuccessfulBuild`);
    return value.displayName || '---';
  } catch (StatusCodeError) {
    return "Error";
  }
};

const getBuildProgress = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}`, {
        'tree':'timestamp,estimatedDuration,building'
      });
    let duration = 0;
    if (value.building) {
      duration = (new Date() - value.timestamp) / value.estimatedDuration * 100;
    }
    return duration;
  } catch (StatusCodeError) {
    return 0;
  }
};

const getBuildProgressTime = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}/lastSuccessfulBuild/jacoco`);
    let duration = 0;
    if (value.building) {
      duration = (new Date() - value.timestamp) / 1000;
    }
    return duration;
  } catch (StatusCodeError) {
    return 0;
  }
};


const getBuildDurations = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}`, {
      'tree':'allBuilds[id,result,duration,building]'
    });
    return value.allBuilds.map(job => {
      if(job.result === "SUCCESS" && job.building === false){
        return job.duration / 1000;
      }
    }).filter(duration => duration).reverse();
  } catch (StatusCodeError) {
    return [];
  }
};

const getAllPrsStatus = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}/view/change-requests`);
    return value.jobs.map(it => {
      const x = {jobName: it.name, outcome: getStatusFromColor(it.color), link: it.url};
      return x;
    })
  } catch (StatusCodeError) {
    return "Error";
  }
};


const getBuildQueue = async (...jobPath) => {
  const job = buildJenkinsJobUrl(...jobPath);
  try {
    const value = await getJson(`${endpoint}/../queue`);
    const queuedJobs = value.items.map( item => item.task )
      .map( job => job.url )
      .filter(item => item)
      .filter(url => url.includes(job));
    return queuedJobs.length
  } catch (StatusCodeError) {
    return -1;
  }
};

const getCoverageReport = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}/lastSuccessfulBuild/jacoco`);
    return value;
  } catch (StatusCodeError) {
    return -1;
  }
};

const getTestReport = async (...jobPath) => {
  try {
    const value = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}/lastSuccessfulBuild/testReport`, {
      'tree':'passCount,skipCount,failCount'
    });
    return value;
  } catch (StatusCodeError) {
    return -1;
  }
};

const getLastNBuildCoverageReports = async (numberOfPrevSuccessJobs, ...jobPath) => {
  try {
    const lastNBuilds = await getJson(`${endpoint}/${buildJenkinsJobUrl(...jobPath)}`, {
      'tree': `allBuilds[id,result,building,url]{,100}` // get the last 100 builds as they might not all be successful
    });

    return Promise.all(lastNBuilds.allBuilds
      .filter(job => job.result === "SUCCESS" && job.building === false)
      .slice(0, numberOfPrevSuccessJobs)
      .map(async job => await getJson(`${job.url}/jacoco`))
      .reverse()
    );
  } catch (StatusCodeError) {
    return [];
  }
}

/**
 * Request JSON for the specified endpoint.
 * @param {*} url URL to the Jenkins item you want to get JSON about. Do not include the `/api/json` part on the end, that will be added.
 */
const getJson = async (url, queryParameters = {}) => {
  const options = {
    uri: `${url}/api/json`,
    headers: {
      'User-Agent': 'Metricio - Jenkins'
    },
    qs: queryParameters,
    json: true,
  };
  return request(options);
}


module.exports = {
  getJobs,
  getBuilds,
  getLastBuildStatus,
  getLastBuildStatusWithBranchParameter,
  getLastBuildStatusIgnoringNoopBuilds,
  getParameterValue,
  getLastBuildWithParametersNotSpecified,
  getAllPrsStatus,
  buildParametersNotSpecified,
  getBuildProgress,
  getBuildDurations,
  getBuildProgressTime,
  getBuildQueue,
  getLastCompletedBuild,
  getLastSuccessfulBuildVersion,
  buildJenkinsJobUrl,
  endpoint,
  getCoverageReport,
  getTestReport,
  getLastNBuildCoverageReports,
  getJson
};
