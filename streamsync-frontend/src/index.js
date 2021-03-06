import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './store';
import EventHandler from './EventHandler';

const root = ReactDOM.createRoot(document.getElementById('root'));
// console.log(React.version);
console.log('Running in',window.env.DEBUG ? 'Debug':'Production/Development', 'mode')
root.render(
  // <React.StrictMode>
  // </React.StrictMode>
  <>
    <Provider store={store}>
      <EventHandler>
        <App />
      </EventHandler>
    </Provider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
