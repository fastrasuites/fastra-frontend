import React from "react";
import styled from "styled-components";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import Bg from "../../../src/image/bg.svg";
import Location from "./Location/Location";
import Operations from "./Operations/Operations";

export default function Inventory() {
  return (
    <Router>
      <InventoryContainer id="inventory">
        <Switch>
          {/* Define routes for the inventory pages */}
          <Route exact path="/inventory" component={Operations} />{" "}
          {/*hi, lukman change this line component to your first s */}
          <Route path="/location" component={Location} />
          {/* Add additional inventory routes as needed */}
        </Switch>
      </InventoryContainer>
    </Router>
  );
}

// Styled component for inventory page background
const InventoryContainer = styled.div`
  height: 120vh;
  width: 100%;

  background-size: contain;
  margin: 0;
  padding: 0;
  font-family: Product Sans, sans-serif;
  overflow: auto;
`;
