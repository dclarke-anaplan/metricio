import { businessDaysBetween } from './datetime';
import { runJql, getTimeIssueWentToStatus } from './jira';

const getReadyStatusDate = (issue) => {
    const readyTime = getTimeIssueWentToStatus(issue, "Ready");
    if(readyTime != undefined) {
        return readyTime;
    }
    const inProgressDate = getTimeIssueWentToStatus(issue, "In Progress")
    if(inProgressDate != undefined) {
        return inProgressDate;
    }
    return undefined;
}

const createCycleTimeInput = (fieldName, customFieldValueFunction, fromDateFunction, toDateFunction) => issue => { 
    const fromDate = fromDateFunction(issue);
    const toDate = toDateFunction(issue);
    var daysInProgress;
    if(fromDate != undefined && toDate != undefined) {
        daysInProgress = businessDaysBetween(fromDate, toDate);
    } else {
        // If both start and end are not defined, there is no 'in progress' time.
        daysInProgress = undefined;
    }
    return {
        key: issue.key,
        categorisingField: customFieldValueFunction(issue.fields[fieldName]),
        daysInProgress: daysInProgress,
    };
}

// Get issues matching the specified JQL that have been resolved in the last `daysRange` days, and convert them
//  into objects suitable for calculating cycle times, fetching the specified custom field as a categoriser and
//  getting its value with the 'customFieldValueFunction'.
// Objects will have fields 'key', 'daysInProgress' and 'categorisingField'.
const getCycleTimesInputObjects = async (jql, daysRange, customFieldNumber, customFieldValueFunction) => {
    const cycleTimeWindowIssues = await runJql(jql + ' AND status in (Done) AND resolved >= -' + daysRange + 'd AND cf[' + customFieldNumber + '] IS NOT EMPTY', 'changelog');
    const cycleTimeInputObjects = createCycleTimeInput(
      'customfield_' + customFieldNumber,
      customFieldValueFunction,
      getReadyStatusDate,
      (issue) => getTimeIssueWentToStatus(issue, "Done")
    );
    return cycleTimeWindowIssues.issues
    .map(cycleTimeInputObjects)
    .filter(cycleTimeObject => cycleTimeObject.daysInProgress != undefined);
}

// Get cycle time input objects with story points as a categoriser
const getStoryPointCycleTimesInputObjects = async (jql, daysRange) => {
    // customfield_10004 = 'Story Points'
    return getCycleTimesInputObjects(jql, daysRange, 10004, fieldValue => fieldValue);
}

// Get cycle time input objects with t-shirt sizes as a categoriser
const getTshirtSizeCycleTimesInputObjects = async (jql, daysRange) => {
    // customfield_15834 = 'T-shirt size'
    return getCycleTimesInputObjects(jql, daysRange, 15834, fieldValue => fieldValue.value);
}

module.exports = { getStoryPointCycleTimesInputObjects, getTshirtSizeCycleTimesInputObjects, getCycleTimesInputObjects }
