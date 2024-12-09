import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie, Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import './Diagram.css'; // Import your styles


ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement);

function Diagram() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  });
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: []
  });
  const [selectedMake, setSelectedMake] = useState('all');
  const [availableMakes, setAvailableMakes] = useState([]);

  // Fetch all cars from the backend and then count car makes
  useEffect(() => {
    axios.get('http://localhost:5000/api/search-cars')  // Endpoint that returns all cars
      .then((response) => {
        const carData = response.data;
        console.log("Fetched car data:", carData); // Debugging: Log the fetched data
        const makes = [...new Set(carData.map(car => car.Make))].filter(Boolean).sort();
        setAvailableMakes(makes);
        prepareChartData(carData);
        prepareLineChartData(carData, 'all'); // 默认显示所有车款
      })
      .catch((error) => {
        console.error('Error fetching car data:', error);
      });
  }, []);

  // Prepare the chart data
  const prepareChartData = (data) => {
    console.log("Starting data preparation with:", data);
    
    const makeCount = {};
    data.forEach(car => {
      if (!car.Make) {
        console.log("Found car without make:", car);
        return;
      }
      
      let make = car.Make.toLowerCase();
      
      // Mercedes 相关的车型同步
      if (make.includes('mercedes') || make.startsWith('mercedes')) {
        make = 'mercedes-benz';
      }
      
      makeCount[make] = (makeCount[make] || 0) + 1;
    });

    console.log("Make count after processing:", makeCount);

    const sortedMakes = Object.keys(makeCount).sort();
    const labels = sortedMakes.map(make => {
      if (make === 'mercedes-benz') {
        return 'Mercedes-Benz';
      }
      return make.charAt(0).toUpperCase() + make.slice(1);
    });
    const counts = sortedMakes.map(make => makeCount[make]);

    console.log("Final processed data:", { labels, counts });

   
    if (labels.length > 0 && counts.length > 0) {
      setChartData({
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: labels.map(() => 
              '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
            ),
          },
        ],
      });
    } else {
      console.log("No data to display");
    }
  };

  const prepareLineChartData = (data, make) => {
    const metrics = {
      'Market': { label: 'Average MMR', color: 'rgb(75, 192, 192)' },
      'BPrice': { label: 'Average Bid Price', color: 'rgb(255, 99, 132)' },
      'FPrice': { label: 'Average Buy Now Price', color: 'rgb(54, 162, 235)' }
    };
    
    const yearlyData = {};
    
    // Car filter by make
    const filteredData = make === 'all' 
      ? data 
      : data.filter(car => car.Make && car.Make.toLowerCase() === make.toLowerCase());
    
    // Calculate yearly averages for all metrics
    filteredData.forEach(car => {
      if (car.Year && parseInt(car.Year) >= 2001) {
        if (!yearlyData[car.Year]) {
          yearlyData[car.Year] = {
            Market: { sum: 0, count: 0 },
            BPrice: { sum: 0, count: 0 },
            FPrice: { sum: 0, count: 0 }
          };
        }
        
        Object.keys(metrics).forEach(metric => {
          if (car[metric] && !isNaN(parseFloat(car[metric]))) {
            yearlyData[car.Year][metric].sum += parseFloat(car[metric]);
            yearlyData[car.Year][metric].count += 1;
          }
        });
      }
    });

    // Sort years
    const years = Object.keys(yearlyData).sort((a, b) => a - b);
    
    // Create datasets for each metric
    const datasets = Object.entries(metrics).map(([metric, info]) => ({
      label: info.label,
      data: years.map(year => 
        yearlyData[year][metric].count > 0
          ? yearlyData[year][metric].sum / yearlyData[year][metric].count
          : null
      ),
      borderColor: info.color,
      backgroundColor: info.color.replace('rgb', 'rgba').replace(')', ', 0.5)'),
      tension: 0.1,
      pointRadius: 5,
      pointHoverRadius: 8,
      hidden: metric !== 'Market' // Only show MMR by default
    }));

    setLineChartData({
      labels: years,
      datasets: datasets
    });
  };

  // Handle Pie chart click event
  const handlePieClick = (event, chartElement) => {
    if (!chartElement.length) return;

    const segmentIndex = chartElement[0].index;
    const selectedMake = chartData.labels[segmentIndex];
    const carCount = chartData.datasets[0].data[segmentIndex];

  
    const selectedMakeData = { 
      make: selectedMake,
      count: carCount 
    };
  };

  const handleMakeChange = (event) => {
    const make = event.target.value;
    setSelectedMake(make);
    axios.get('http://localhost:5000/api/search-cars')
      .then((response) => {
        prepareLineChartData(response.data, make);
      })
      .catch((error) => {
        console.error('Error fetching car data:', error);
      });
  };

  return (
    <div id="diagramContainer">
      <h2>Car Make Distribution</h2>
      <div id="chartContainer">
        {chartData.labels.length > 0 ? (
          <Pie
            data={chartData}
            options={{
              onClick: (event, chartElement) => handlePieClick(event, chartElement),
              plugins: {
                legend: {
                  position: 'right',
                  align: 'start',
                  onClick: function(e, legendItem, legend) {
                    const index = legendItem.index;
                    const ci = legend.chart;
                    const meta = ci.getDatasetMeta(0);
                    meta.data[index].hidden = !meta.data[index].hidden;
                    ci.update();
                  },
                  labels: {
                    padding: 20,
                    font: {
                      size: 18,
                      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                    },
                    generateLabels: (chart) => {
                      const datasets = chart.data.datasets;
                      const meta = chart.getDatasetMeta(0);
                      return chart.data.labels.map((label, index) => ({
                        text: `${label} (${datasets[0].data[index]})`,
                        fillStyle: datasets[0].backgroundColor[index],
                        hidden: meta.data[index] ? meta.data[index].hidden : false,
                        lineCap: 'round',
                        lineDash: [],
                        lineDashOffset: 0,
                        lineJoin: 'round',
                        lineWidth: 1,
                        strokeStyle: datasets[0].backgroundColor[index],
                        index: index
                      }));
                    },
                    usePointStyle: true,
                    boxWidth: 14,
                    boxHeight: 14,
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  titleFont: {
                    size: 16,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 15
                  },
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} cars (${percentage}%)`;
                    }
                  }
                }
              },
              layout: {
                padding: {
                  top: 20,
                  bottom: 20,
                  left: 20,
                  right: 20
                }
              },
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000
              },
              radius: '80%'
            }}
          />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>

      <h2>Price Trends by Year</h2>
      <div className="make-selector">
        <select 
          value={selectedMake} 
          onChange={handleMakeChange}
          className="make-select"
        >
          <option value="all">All Makes</option>
          {availableMakes.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>
      <div id="lineChartContainer">
        {lineChartData.labels.length > 0 ? (
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    font: {
                      size: 14,
                      weight: 'bold'
                    },
                    usePointStyle: true,
                    padding: 20,
                  },
                  onClick: function(e, legendItem, legend) {
                    const index = legendItem.datasetIndex;
                    const ci = legend.chart;
                    ci.getDatasetMeta(index).hidden = !ci.getDatasetMeta(index).hidden;
                    ci.update();
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleFont: {
                    size: 14
                  },
                  bodyFont: {
                    size: 13
                  },
                  callbacks: {
                    label: (context) => {
                      return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  title: {
                    display: true,
                    text: 'Price ($)',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  },
                  ticks: {
                    callback: (value) => `$${value.toLocaleString()}`,
                    font: {
                      size: 12
                    }
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Year',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  },
                  ticks: {
                    font: {
                      size: 12
                    }
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }}
          />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>

      <Link to="/autoprice-analyze">Back to Auto Price Analyze</Link>
    </div>
  );
}

export default Diagram;
