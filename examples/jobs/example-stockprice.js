import request from 'request-promise-native';
import moment from 'moment';

const APIKEY = 'SomeApiKey';

const options = {
  uri: `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=$STOCKSYMBOL&apikey=${APIKEY}`,
  headers: {
    'User-Agent': 'Metricio - Jira',
  },
  json: true,
};

const closePriceKey = "4. close"

export const interval = '*/1 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  const response = await request(options);
  const series = response['Time Series (Daily)'];
  
  const closingPrices = Object.entries(series).sort((entry1, entry2) => {
    const firstDate = moment(entry1[0], 'YYYY-MM-DD');
    const secondDate = moment(entry2[0], 'YYYY-MM-DD');
    if (firstDate.isBefore(secondDate)) {
      return -1;
    } else if (firstDate.isAfter(secondDate)) {
      return 1;
    } else {
      return 0;
    }
  }).map(entry => entry[1][closePriceKey]);

  const latestClosePrice = closingPrices[closingPrices.length - 1];

  return [
    {
      target: 'StockPrice', // Name of widget in dashboard to update
      data: {
        value: latestClosePrice,
      },
    },
    {
      target: 'StockPriceChart',
      data: {
        value: closingPrices
      }
    }
  ];
};
