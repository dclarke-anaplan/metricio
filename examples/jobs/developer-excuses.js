import { parse } from 'node-html-parser';
import request from 'request-promise-native';

export const interval = '*/10 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {

    let devExcuse = "";

    const foo = await request({uri: "http://programmingexcuses.com/"},
        function(error, response, body) {
            getExcuse(body)
        });

    function getExcuse(body) {
        devExcuse = parse(body).querySelector(".wrapper center a").rawText;
    }

    return [
        {
            target: 'DeveloperExcuse', // Name of widget in dashboard to update
            data: {
                value: devExcuse , // Value to be passed to React component state
            }
        }
    ]
};