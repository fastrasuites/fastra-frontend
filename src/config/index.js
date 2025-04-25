 export const stockAdjustmentConfig = ({ products }) => {
    return [
        {
          label: "Product Name",
          field: "product",
          type: "autocomplete",
          options: products,
          getOptionLabel: (option) => option?.product_name || "",
        },
        {
          label: "Unit of Measure",
          field: "unit_of_measure",
          type: "text",
          disabled: true,
          transform: (value) => value?.unit_category || "",
        },
        {
          label: "Current Quantity",
          field: "available_product_quantity",
          type: "number",
          transform: (value) => value || "",
          // disabled: true,
        },
    
        {
          label: "Adjusted Quantity",
          field: "qty_received",
          type: "number",
        },
      ];
 } 