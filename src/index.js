import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Mixnodes from './Mixnodes';
import Exec from './Nyx_exec';
import Mixnet from './Mixnet_traffic';
import MixnetTwo from './Mixnet_traffic2';
import Mixfetch from './Mixfetch';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <Mixnodes /> */}
    {/* <Exec /> */}
    {/* <Mixnet /> */}
    <MixnetTwo />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
