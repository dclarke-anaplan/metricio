import React from 'react';
import ReactDOM from 'react-dom';

import '../styles/default.scss';

import Dashboard from '../widgets/dashboard';
import MultiSecretStatusWidget from '../widgets/multi-secret-status/widget';
import MultiValueWidget from '../widgets/multi-value/widget';

ReactDOM.render(
  <Dashboard>
      <MultiSecretStatusWidget name="aws-secrets-status" size="large" titleFontSize="2" lineFontSize="0.75" />
  </Dashboard>,
  document.getElementById('content'),
);
