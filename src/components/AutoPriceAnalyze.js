import React, { useState } from 'react';
import axios from 'axios';
import { useTable, useSortBy } from 'react-table';
import './AutoPriceAnalyze.css';

function AutoPriceAnalyze() {
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [year, setYear] = useState('');
  const [results, setResults] = useState(null);

  const carMakes = [
    'Toyota', 
    'Honda', 
    'Ford', 
    'BMW', 
    'Mercedes-Benz',
    'Audi',
    'Lexus',
    'Nissan',
    'Chevrolet',
    'Hyundai'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => `${currentYear - i}`);

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/search-cars', {
        params: {
          make: carMake || undefined,
          model: carModel || undefined,
          year: year || undefined
        }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'VIN',
        accessor: 'Vin',
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
        Header: 'Trim',
        accessor: 'Trim',
      },
      {
        Header: 'MMR',
        accessor: 'Market',
        Cell: ({ value }) => value ? `$${Number(value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'
      },
      {
        Header: 'BidPrice',
        accessor: 'BPrice',
        Cell: ({ value }) => value ? `$${Number(value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'
      },
      {
        Header: 'FixedPrice',
        accessor: 'FPrice',
        Cell: ({ value }) => value ? `$${Number(value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'
      },
    ],
    []
  );

  const data = React.useMemo(() => results || [], [results]);

  // Use react-table hook
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
    },
    useSortBy // This hook adds sorting functionality
  );

  return (
    <div>
      {/* Search Form */}
      <div id="formContainer">
        <div className="formGroup">
          <label htmlFor="year"><h2>Year:</h2></label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="year-select"
          >
            <option value="">Select Year</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="formGroup">
          <label htmlFor="carMake"><h2>Make:</h2></label>
          <input
            type="text"
            id="carMake"
            className="make-input"
            placeholder="Type or select make"
            value={carMake}
            onChange={(e) => setCarMake(e.target.value)}
            list="carMakeOptions"
          />
          <datalist id="carMakeOptions">
            {carMakes
              .filter(make => !carMake || make.toLowerCase().includes(carMake.toLowerCase()))
              .map(make => (
                <option key={make} value={make} />
              ))}
          </datalist>
        </div>

        <div className="formGroup">
        <label htmlFor="carModel"><h2>Model:</h2></label>
        <input
          type="text"
          id="carModel"
          placeholder="e.g., Corolla"
          value={carModel}
          onChange={(e) => setCarModel(e.target.value)}
        />
        </div>

        <button id="searchButton" onClick={handleSearch}>Search</button>
      </div>

      {/* Results Section */}
      <div id="results">
        {results && results.length > 0 ? (
          <table {...getTableProps()} className="auto-price-table">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())} className="auto-price-th">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {column.render('Header')}
                        <span style={{ marginLeft: '8px' }}>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? '↓'
                              : '↑'
                            : ''}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="auto-price-tr">
                    {row.cells.map((cell) => {
                      return (
                        <td {...cell.getCellProps()} className="auto-price-td">
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No matching vehicles found. Try adjusting your search criteria.</p>
        )}
      </div>
    </div>
  );
}

export default AutoPriceAnalyze;
