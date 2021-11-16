import {lookupAllSecrets} from '../../secrets';

export const interval = '0 4 * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  lookupAllSecrets();
  //This job doesn't update the state for any widgets so returning an empty array
  return [];
};
