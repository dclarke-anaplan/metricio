import request from 'request-promise-native';
import {getSecret, secretNames} from '../../../secrets';

function processStatusString(status) {
    return status === null ? 'pending' : status;
}

const getLastBuildStatus = async (repo, branch) => {
    const secret = getSecret(secretNames.JENKINS);
    const endpoint = 'http://$jenkins-host:$jenkins-port/job';
    const options = {
        uri: `${endpoint}/${repo}-${branch}/lastBuild/api/json`,
        headers: {
            'User-Agent': 'Metricio - Jenkins',
            Authorization: `Basic ${Buffer.from(`${secret.username}:${secret.token}`).toString('base64')}`,
        },
        json: true,
    };
    try {
        const value = await request(options);
        return {
            status : processStatusString(value.result),
            link : value.url
        };
    } catch (StatusCodeError) {
        return "Error";
    }
};


module.exports = { getLastBuildStatus }
