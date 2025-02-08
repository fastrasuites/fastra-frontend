import React, { useState, useEffect } from "react";
import "./ProductScrapLine.css";

const ProductScrapLine = () => {
  const [rows, setRows] = useState([
    { productName: "", unit: "", currentQuantity: 0, adjustedQuantity: 0 },
  ]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);

  // Fetch data from localStorage
  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    const savedUnits = JSON.parse(localStorage.getItem('savedUnits')) || [];
    setProducts(storedProducts);
    setUnits(savedUnits);
      
  }, []);

  // Handle input changes in the rows
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);

    // Automatically add a new row if the current row is fully filled
    if (
      field === "adjustedQuantity" &&
      updatedRows[index].productName &&
      updatedRows[index].unit &&
      updatedRows[index].currentQuantity !== 0 &&
      updatedRows[index].adjustedQuantity !== 0
    ) {
      addRow();
    }
  };

  // Add a new row
  const addRow = () => {
    if (
      rows[rows.length - 1].productName &&
      rows[rows.length - 1].unit &&
      rows[rows.length - 1].currentQuantity !== 0 &&
      rows[rows.length - 1].adjustedQuantity !== 0
    ) {
      setRows([
        ...rows,
        { productName: "", unit: "", currentQuantity: 0, adjustedQuantity: 0 },
      ]);
    }
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            {/* <th>Unit of Measure</th> */}
            <th>Scrap Quantity</th>
            <th>Adjusted Quantity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <select
                  value={row.productName}
                  onChange={(e) =>
                    handleInputChange(index, "productName", e.target.value)
                  }
                >
                  <option value="">Select Product Name</option>
                  {products.length === 0 ? (
                    <option disabled>No products available</option>
                  ) : (
                    products.map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name}
                      </option>
                    ))
                  )}
                </select>
              </td>
              {/* <td>
                <select
                  value={row.unit}
                  onChange={(e) =>
                    handleInputChange(index, "unit", e.target.value)
                  }
                >
                  <option value="">Select Unit Measure</option>
                  {units.length === 0 ? (
                    <option disabled>No units available</option>
                  ) : (
                    units.map((unit) => (
                      <option key={unit.id} value={unit.unitName}>
                        {unit.unitName} - {unit.unitCategory}
                      </option>
                    ))
                  )}
                </select>
              </td> */}
              <td>
                <input
                  type="number"
                  value={row.currentQuantity}
                  onChange={(e) =>
                    handleInputChange(index, "currentQuantity", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.adjustedQuantity}
                  onChange={(e) =>
                    handleInputChange(index, "adjustedQuantity", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductScrapLine;
