// Copyright Jon Williams 2017-2018. See LICENSE file.
import Goodbye from './goodbye';
import Hello from './hello';
import React from 'react';
import Title from 'app/title';
import { Link, Switch, Route } from 'react-router-dom';

const title = 'Cater with React Router';

export default () => (
  <div>
    <Title>{title}</Title>
    <h1>{title}</h1>
    <p>
      <Link to="/hello">Say Hello</Link> or <Link to="/goodbye">say Goodbye</Link> or{' '}
      <Link to="/">head back Home</Link>.
    </p>
    <Switch>
      <Route exact path="/hello">
        <Hello />
      </Route>
      <Route exact path="/goodbye">
        <Goodbye />
      </Route>
    </Switch>
  </div>
);
