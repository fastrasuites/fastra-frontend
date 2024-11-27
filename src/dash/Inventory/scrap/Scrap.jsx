import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import './Scrap.css';
import InventoryHeader from '../InventoryHeader';

const scraps = [
  { id: 'LAG001', adjType: 'Stock Level Update', locationName: 'Abc Store', adjDate: "15 Nov, 2024 - 12:08 PM", status: 'Draft' },
  { id: 'ABJ001', adjType: 'Stock Level Update', locationName: 'xdz Store', adjDate: "17 Nov, 2024 - 04:00 PM", status: 'Draft' },
  { id: 'LAG001', adjType: 'Stock Level Update', locationName: 'Alaje Store', adjDate: "22 Nov, 2024 - 07:15 PM", status: 'Draft' },
];

function Scrap() {
  const history = useHistory();

  const handleCreatescrapClick = () => {
    history.push('/new-scrap'); // Navigate to the scrapForm page
  };

  return (
    <div className='scrap-contain'>
      <InventoryHeader />
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className='create-stock' onClick={handleCreatescrapClick}>New Scrap</button>
          <TextField variant="outlined" placeholder="Search" size="small" style={{ width: '200px' }} />
        </div>

        {/* scraps Table */}
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Adjusted Type</TableCell>
                <TableCell>Location </TableCell>
                <TableCell>Adjusted Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scraps.map((scrap, index) => (
                <TableRow
                  key={scrap.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" />
                  </TableCell>
                  <TableCell style={{ display: "flex", alignItems: "center", gap: "10px"}}>
                    {scrap.id}
                  </TableCell>
                  <TableCell>{scrap.adjType}</TableCell>
                  <TableCell>{scrap.locationName}</TableCell>
                  <TableCell>{scrap.adjDate}</TableCell>
                  <TableCell
                    style={{
                      color: scrap.status === "Done" ? "#2BA24D" : scrap.status === "Draft" ? "#3b7ced" : "black",
                      fontWeight: "bold"
                    }}
                  >
                    {scrap.status}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Scrap;
