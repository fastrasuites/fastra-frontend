import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import './StockMoves.css';
import InventoryHeader from '../InventoryHeader';

const scraps = [
  { name: 'Cement', qty: '3', unit: 'L', srcId: "ABJ001", date: "17 Nov, 2024 - 12:08 PM", srcLocName: "Abisco Store", desLoc: 'Azeemah Store' },
  { name: 'Bag of Rice', qty: '8', unit: 'Kg', srcId: "PORT001", date: "22 Nov, 2024 - 08:08 AM", srcLocName: "Demmix  Store", desLoc: 'Abisco Store' },
];

function StockMoves() {
  const history = useHistory();

  const handleCreatescrapClick = () => {
    history.push('/new-stock-moves'); // Navigate to the scrapForm page
  };

  return (
    <div className='scrap-contain'>
      <InventoryHeader />
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className='create-stock' onClick={handleCreatescrapClick}>Stock Move</button>
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
                <TableCell>Product Name</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Unit Measure</TableCell>
                <TableCell>Source ID </TableCell>
                <TableCell> Date Created </TableCell>
                <TableCell>Source Location </TableCell>
                <TableCell>Destination Location</TableCell>
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
                    {scrap.name}
                  </TableCell>
                  <TableCell>{scrap.qty}</TableCell>
                  <TableCell>{scrap.unit}</TableCell>
                  <TableCell>{scrap.srcId}</TableCell>
                  <TableCell>{scrap.date}</TableCell>
                  <TableCell>{scrap.srcLocName}</TableCell>
                  <TableCell>{scrap.desLoc}</TableCell>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default StockMoves;
