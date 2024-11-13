import React from 'react';
import DashboardHeader from '../../DashboardHeader/DashboardHeader';


const PurchaseHome = () => {
    const menuItems = [
        { label: 'Purchase Requests', link: '/Purchase' },
        { label: 'RFQs', link: '/rfq' },
        { label: 'Purchase Orders', link: '/pod' },
        {
          label: 'Vendors',
          link: '/vend',
          subItems: [
            { label: 'Vendors Bills', link: '/vend' },
            { label: 'Vendors', link: '/vend' },
          ],
        },
        {
          label: 'Products',
          link: '/prod',
          subItems: [
            { label: 'Incoming Products', link: '/prod' },
            { label: 'Products', link: '/prod' },
          ],
        },
        { label: 'Configuration', link: '/inventory/configuration' },
      ];
    
  return (
    <div>
     {/* Header Component */}
      <DashboardHeader title="Purchase" menuItems={menuItems} />
      
    </div>
  );
};

export default PurchaseHome;


// import React from 'react';
// import styled from 'styled-components';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import DashboardHeader from '../DashboardHeader.jsx/DashboardHeader';

// // Import your components here
// import Purchreq from './PurchRequest/Purchreq';
// import Rfq from './Rfq/Rfq';
// import Vend from './Vendor/Vend';
// import Prod from './Product/Prod';
// import PurchaseOrder from './PurchOrder/PurchaseOrder';
// import ConfigurationSettings from '../Configurations/ConfigurationSettings';
// import Bg from '../../image/bg.svg';

// const Purchase = () => {
//   const menuItems = [
//     { label: 'Purchase Requests', link: '/Purchase' },
//     { label: 'RFQs', link: '/rfq' },
//     { label: 'Purchase Orders', link: '/purchase/Purchase' },
//     {
//       label: 'Vendors',
//       link: '/vend',
//       subItems: [
//         { label: 'Vendors Bills', link: '/vend' },
//         { label: 'Vendors', link: '/inventory/operations/delivery-order' },
//       ],
//     },
//     {
//       label: 'Products',
//       link: '/prod',
//       subItems: [
//         { label: 'Incoming Products', link: '/inventory/stock/stock-adjustment' },
//         { label: 'Products', link: '/inventory/stock/stock-moves' },
//       ],
//     },
//     { label: 'Configuration', link: '/inventory/configuration' },
//   ];

//   return (
//     <Router>
//       <Purcont id="purchase">
//         {/* Header Component */}
//         <DashboardHeader title="Purchase" menuItems={menuItems} />
//         <Switch>
//           <Route path="/purchase" component={Purchreq} />
//           <Route path="/rfq" component={Rfq} />
//           <Route path="/vend" component={Vend} />
//           <Route path="/prod" component={Prod} />
//           <Route path="/pod" component={PurchaseOrder} />
//           <Route path="/configurations" component={ConfigurationSettings} />
//         </Switch>
//       </Purcont>
//     </Router>
//   );
// };



// export default Purchase;