import request from "request-promise-native";
import moment from 'moment';

const getEventsInCalendar = async (id, onlyFutureEvents=true) => {
    const options = {
        uri: `https://$confluence-site.atlassian.net/wiki/rest/calendar-services/1.0/calendar/export/subcalendar/private/${id}.ics`,
        headers: {
            'User-Agent': 'Metricio - Jenkins'
        },
    };

    const response = await request(options);
    const ical = require('ical');
    const data = ical.parseICS(response);

    var events = [];
    for (let index in data) {
        const event = data[index];
        if (event.type === 'VEVENT') {
            if(onlyFutureEvents && event.start < moment()) {
                continue;
            }
            events.push(event);
        }
    }

    events.sort(function(a, b){return a.start - b.start});

    return events;
};

module.exports = { getEventsInCalendar };