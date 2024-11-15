import React from 'react';
import DashboardHeader from '../DashboardHeader/DashboardHeader';


const PurchaseHeader = () => {
    const menuItems = [
        { label: 'Purchase Requests', link: '/Purchase' },
        { label: 'RFQs', link: '/rfq' },
        { label: 'Purchase Orders', link: '/purchase-order' },
        {
          label: 'Vendors',
          link: '/vendor',
          subItems: [
            { label: 'Vendors Bills', link: '/vendor-bill' },
            { label: 'Vendors', link: '/vendor' },
          ],
        },
        {
          label: 'Products',
          link: '/prod',
          subItems: [
            { label: 'Incoming Products', link: '/incoming-product' },
            { label: 'Products', link: '/product' },
          ],
        },
        { label: 'Configurations', link: 'purchase-configuration-settings' },
      ];
    
  return (
    <div>
     {/* Header Component */}
      <DashboardHeader title="Purchase" menuItems={menuItems} />
      
    </div>
  );
};

export default PurchaseHeader;

