import moment from 'moment';
import { getEventsInCalendar} from '../../src/jobs/libs/confluencecalendar';
import config from '../../config';

const daysUntilNextEvents = (events, numberOfEvents) => {
    const today = moment().startOf('day');

    return events.slice(0, numberOfEvents)
    .map(event => {
        // Turn to days
        const daysToGo = moment(event.start).diff(today, 'days'); // Calendar days
        return {
            name: event.summary,
            value: daysToGo + ' days',
        };
    })
    .reduce((accumulator, item) => {
        accumulator[item.name] = item.value;
        return accumulator;
    }, {});  
}

export const interval = '54 * * * *';
export const perform = async () => {

    const nextEvents = daysUntilNextEvents(await getEventsInCalendar(config.team.confluenceCalendarId), 3);

    return [
        {
            target: 'Important-Dates',
            data: {
            value: nextEvents,
            link: "https://$confluence-project.atlassian.net/wiki/spaces/$SPACE/calendars"
            },
        },
    ];
};
