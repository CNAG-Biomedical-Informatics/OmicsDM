
// const render = require("@testing-library/react"),
// const App = require("./code/App.js")
import React from 'react';
import { render } from '@testing-library/react';
import App from './code/App.js';

it('renders without crashing', () => {
  render(<App />);
});
