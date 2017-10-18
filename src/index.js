import Inferno from 'inferno';
import App from './App';

import Home from './Home';
import Agency from './Agency';
import Stops from './Stops';
import Routes from './Routes';
import Trips from './Trips';
import StopTimes from './StopTimes';
import Calendar from './Calendar';
import Rules from './Rules';


import './index.css';
import 'bootstrap/dist/css/bootstrap.css';

import { Router, Route, IndexRoute } from 'inferno-router';
import { createBrowserHistory } from 'history';
import Raven from 'raven-js';

Raven.config('https://4589a8dbbf3b4ad0876e1181de546f79@sentry.io/156301').install();

const basename = process.env.NODE_ENV === 'production'?'/joukkoliikenne/koontikanta_muutokset/':''

console.log("basename",basename)
const browserHistory = createBrowserHistory({
  basename: basename
});

function NoMatch({ params }) {
  console.log(params)
  return (
    <h1>Sivua ei löydy</h1>
  );
}


function handleRouteError(err) {
  Raven.captureException(err);
  throw err;
};



const routes = (
  <Router history={browserHistory}>
    <Route component={App}>
      <IndexRoute component={Home} />
      <Route path="/agency" component={Agency} dataType="agency" />
      <Route path="stops" component={Stops} dataType="stops" />
      <Route path="routes" component={Routes} dataType="routes" />
      <Route path="trips" component={Trips} dataType="trips" />
      <Route path="stoptimes" component={StopTimes} dataType="stoptimes" />
      <Route path="calendar" component={Calendar} dataType="calendar" />
      <Route path="rules" component={Rules}/>
      <Route path="*" component={NoMatch} />
    </Route>
  </Router>
);

try {
  Inferno.render(routes, document.getElementById('app'));
} catch (err) {
  handleRouteError(err);
}
