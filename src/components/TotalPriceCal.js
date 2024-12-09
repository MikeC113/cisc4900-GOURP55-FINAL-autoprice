import React, { useState } from 'react';

function TotalPriceCal() {
  const [price, setPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState(null);

  // Function to calculate the total price
  const handlePriceCalculation = () => {
    const buyNowPrice = parseFloat(price);

    if (isNaN(buyNowPrice) || buyNowPrice <= 0) {
      alert('Please enter a valid price.');
      setTotalPrice(null);
      return;
    }

    // Calculate fees and tax
    const buyFees = buyNowPrice * 0.0054 +451.23 
    const tax = buyNowPrice * 0.08875;   // 8.875% Tax
    const DocumentFee = 360+37;
    const calculatedTotalPrice = buyNowPrice + buyFees + tax + DocumentFee; 

    setTotalPrice({
      buyNowPrice,
      buyFees,
      tax,
      DocumentFee,
      total: calculatedTotalPrice.toFixed(2),
    });
  };

  return (
    <div style={{ padding: '20px', marginTop: '80px',}}>
      <h2>Calculate Total Price</h2>
      <input
        type="number"
        placeholder="Enter Car Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{
          padding: '10px',
          width: '300px',
          marginRight: '20px',
          fontSize: '16px',
        }}
      />

<button id="searchButton2" onClick={handlePriceCalculation}>Calculate</button>
        
      {totalPrice && (
        <div style={{ marginTop: '30px' }}>
          <h5>Total Price Details</h5>
          <p>
            <b>Car Price:</b> ${totalPrice.buyNowPrice.toFixed(2)}
          </p>
          <p>
            <b>Buy Fees(Aprox.) :</b> ${totalPrice.buyFees.toFixed(2)}
          </p>
          <p>
            <b>Tax (8.875%):</b> ${totalPrice.tax.toFixed(2)}
          </p>
          <p>
            <b>DocumentFee (Registation and inspection) </b> ${totalPrice.DocumentFee.toFixed(2)}
          </p>
          <p>
            <b>Total Price:</b> ${totalPrice.total}
          </p>
        </div>
      )}
      
    </div>
  );
}

export default TotalPriceCal;
