import request from 'request-promise-native';
import logger from '../../../lib/logger';

const httpGetJson = async (url) => {
    logger('info', `Requesting url: ${url}`);
    const options = {
        uri: url,
        headers: {
            'User-Agent': 'Metricio'
        },
        json: true,
        timeout: 300000
    };
    const result =  await request(options);
    logger('debug', `${url} result:\n${result}`)
    return result;
}

export {httpGetJson};
