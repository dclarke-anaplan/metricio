import request from 'request-promise-native';
import {getSecret, secretNames} from '../../../secrets';

const getPageContent = async (pageId) => {
    var secret = getSecret(secretNames.ATLASSIAN);
    const options = {
        uri: `https://$confluence-site.atlassian.net/wiki/rest/api/content/${pageId}?expand=body.view`,
        headers: {
            'User-Agent': 'Metricio - Jira',
            Authorization: `Basic ${Buffer.from(`${secret.username}:${secret.token}`).toString('base64')}`,
        },
        json: true,
    };
    try {
        const convert = require('xml-js');
        const response = await request(options);
        const value = response.body.view.value;
        const xml = `<root>${JSON.stringify(value).trim().slice(1, -1).replace(/\\/g, "")}</root>`;
        const converted = convert.xml2js(xml, {compact: true, spaces: 4});
        if (converted === undefined) {
            return undefined;
        }
        return converted.root;
    } catch (StatusCodeError) {
        return undefined;
    }
};

module.exports = { getPageContent }
