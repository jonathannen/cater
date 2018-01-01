// Adapted from https://github.com/reactjs/redux/tree/master/examples
import Counter from "./counter";
import React from "react";
import Title from "app/title";

const title = "Using Redux with Cater via cater-redux"

const app = () => (
  <div>
    <Title>{title}</Title>
    <h1>{title}</h1>
    <Counter/>
  </div>
);

export default app;
