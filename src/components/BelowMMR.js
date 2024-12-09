import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useTable, useSortBy } from 'react-table';
import './BelowMMR.css';

function BelowMMR() {
  const [results, setResults] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/collections');
      setCollections(response.data);
    } catch (error) {
      setError('Failed to fetch collections');
      console.error('Error fetching collections:', error);
    }
  }, []);
//Call backs
  const fetchBelowMMRCars = useCallback(async () => {
    if (!selectedCollection) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/below-mmr-cars', {
        params: { collection: selectedCollection }
      });
      setResults(response.data);
    } catch (error) {
      setError('Failed to fetch car data');
      console.error('Error fetching below MMR cars:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCollection]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (selectedCollection) {
      fetchBelowMMRCars();
    }
  }, [selectedCollection, fetchBelowMMRCars]);

  const columns = useMemo(
    () => [
      {
        Header: 'Savings ($)',
        accessor: 'savings',
        Cell: ({ value }) => (
          <div className="savings-value">
            ${value?.toLocaleString() || 'N/A'}
          </div>
        )
      },
      {
        Header: 'Savings %',
        accessor: 'savingsPercentage',
        Cell: ({ value }) => (
          <div className="savings-value">
            {value?.toFixed(1)}%
          </div>
        )
      },
      {
        Header: 'Year',
        accessor: 'Year',
      },
      {
        Header: 'Make',
        accessor: 'Make',
      },
      {
        Header: 'Model',
        accessor: 'Model',
      },
      {
        Header: 'MMR',
        accessor: 'MMR',
        Cell: ({ value }) => `$${value?.toLocaleString() || 'N/A'}`
      },
      {
        Header: 'Buy Now Price',
        accessor: 'BuyNowPrice',
        Cell: ({ value }) => `$${value?.toLocaleString() || 'N/A'}`
      },
      {
        Header: 'Cr',
        accessor: 'ConditionReportGrade',
        Cell: ({ value }) => value || 'N/A'
      },
      //Vin to copy
      {
        Header: 'VIN',
        accessor: 'Vin',
        Cell: ({ value }) => (
          <div 
            className="vin-cell"
            onClick={() => {
              navigator.clipboard.writeText(value);
              const el = document.createElement('div');
              el.className = 'copy-notification';
              el.textContent = 'VIN Copied!';
              document.body.appendChild(el);
              setTimeout(() => el.remove(), 2000);
            }}
            title="Click to copy VIN"
          >
            {value}
          </div>
        )
      },
    ],
    []
  );

  const data = useMemo(() => results, [results]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  return (
    <div className="below-mmr-container">
      <h2 className="page-title">Cars Below Market Value (MMR)</h2>

      <div className="collection-selector1">
        <select 
          value={selectedCollection} 
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="collection-select1"
        >
          <option value="">Select Collection</option>
          {collections.map(collection => (
            <option key={collection} value={collection}>
              {collection}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-spinner">Loading...</div>}
      
      <div className="table1-wrapper">
        {!isLoading && results.length > 0 ? (
          <table1 {...getTableProps()}>
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())} 
                        className={`below-mmr-th ${column.isSorted ? 'sorted' : ''}`}>
                      {column.render('Header')}
                      <span className="sort-indicator">
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className="below-mmr-td">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table1>
        ) : (
          <p className="no-results">No cars found below MMR value</p>
        )}
      </div>
    </div>
    

    
  );
}

export default BelowMMR; 