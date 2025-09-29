// InvoicingLayout.js
import React from "react";
import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";
import Invoices from "./Invoices/Invoices";
import InvoicingHeader from "./InvoicingHeader";
import PaidInvoices from "./Invoices/PaidInvoices/PaidInvoices";
import PartiallyPaidInvoices from "./Invoices/PartiallyPaidInvoices/PartiallyPaidInvoices";
import UnpaidInvoices from "./Invoices/UnpaidInvoices/UnpaidInvoices";
import Payments from "./Payments/Payments";
import InvoiceCreateForm from "./Invoices/InvoiceCreateForms/InvoiceCreateForm";

const InvoicingLayout = () => {
  const { path } = useRouteMatch();
  return (
    <div>
      <InvoicingHeader />
      <div id="invoices">
        <Switch>
          {/* Redirect from /invoices to /invoicing/paid-invoices */}
          {/* <Redirect exact from={path} to={`${path}/invoices`} /> */}

          {/* Invoices Routes */}
          <Route exact path={`${path}/invoices`} component={Invoices} />

          <Route
            exact
            path={`${path}/invoices/paid-invoices`}
            component={PaidInvoices}
          />
          <Route
            exact
            path={`${path}/invoices/partially-paid-invoices`}
            component={PartiallyPaidInvoices}
          />
          <Route
            exact
            path={`${path}/invoices/unpaid-invoices`}
            component={UnpaidInvoices}
          />

          {/* Payments routes */}
          <Route exact path={`${path}/payments`} component={Payments} />

          <Route
            exact
            path={`${path}/invoices/new`}
            component={InvoiceCreateForm}
          />

          {/* Additional invoicing routes can be added here */}
        </Switch>
      </div>
    </div>
  );
};

export default InvoicingLayout;
