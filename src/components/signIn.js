import React, { useState } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
     
      const response = await axios.post('http://localhost:5000/api/signin', {
        name: username,
        password: password
      });

      if (response.data.success) {
        
        localStorage.setItem('loggedInUser', username);
        navigate('/autoprice-analyze'); 
      } else {
        setMessage(response.data.message); 
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setMessage('An error occurred while signing in. Please try again.');
    }
  };

  return (
    <div>
      
      <nav className="navbar">
         
          <ul className="li">
          <li><a href="#signin">Sign In</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      
     
      <div id="signin" className="login-container">
        <h2>Sign In</h2>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Sign In</button>
          <p id="message">{message}</p>
        </form>
      </div>

      
      <div id="about" className="AboutSection">
        <h2>About This</h2>
        <h3>we can help to make used car trading more efficient and potentially profitable, 
          as users increase the data they need to analyze, they can quickly find the cheapest 
          or most cost-effective individual vehicle to buy, and at the same time quickly find a 
          car that suits the buyer, creating more possibilities and choices for our users then in 
          the user's own judgment which in turn is passed on to them.</h3>
      </div>

      {/* Example Contact Section */}
      <div id="contact" className="ContactSection">
      <h2>Contact</h2>
      <div class="box-container2">
              <div class="box2">
                <h2>Address</h2>
                <h4>2900 Bedford Ave, Brooklyn, NY 11210</h4>
              </div>
              <div class="box2">
                <h2>Email</h2>
                <h4>f794349738@gmail.com</h4>
                  <h4>reverhf@gmail.com</h4>
              </div>
              <div class="box2">
                <h2>Phone</h2>
                <h4>(347)-854-5210</h4>
                <h4>(646)-479-6485</h4>
              </div>
          </div>
      </div>
    </div>
  );
}



export default SignIn;
