import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Header from '../components/Header';
import Footer from '../components/Footer';

const StyledSection = styled.div`
  margin: 0 auto;
  max-width: 30rem;
  padding: 1rem 2rem;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: start;
  align-items: start;
  gap: 2rem;
`;

const StyledCartItem = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  width: 100%;
`;

const StyledButton = styled.button`
  align-items: center;
  background-color: #000;
  border-radius: 2px;
  color: white;
  display: flex;
  flex-flow: row nowrap;
  font-weight: bold;
  gap: 0.5rem;
  justify-content: start;
  padding: 1rem 2rem;
  text-decoration: none;
  text-transform: uppercase;
  align-self: end;
  margin-top: 2rem;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
`;

function Checkout() {
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cartItemsJSON = localStorage.getItem('cart');
    const storedCartItems = JSON.parse(cartItemsJSON) || [];
    setCart(storedCartItems);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const items = cart.map((item) => ({ item_id: item._id, quantity: item.quantity }));
    const body = JSON.stringify({ items, email });

    try {
      const response = await fetch('/app-flask/placeorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (response.ok) {
        console.log('Order confirmed');
        localStorage.removeItem('cart');
        navigate('/order-complete');
      } else {
        console.error('Failed to complete order. ', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting email: ', error.message);
    }
  };

  return (
    <>
      <Header />
      <StyledSection>
        <h2>Checkout</h2>
      </StyledSection>
      {cart.length > 0 ? (
        <StyledSection>
          {cart.map((item) => (
            <StyledCartItem>
              <div>
                <strong>
                  <h4>{item.name}</h4>
                </strong>
              </div>
              <div>
                <strong>Quantity:</strong> {item.quantity}
              </div>
            </StyledCartItem>
          ))}
          <StyledCartItem>
            <div>Total price:</div>
            <div>
              <strong>
                <h4>{cart.reduce((sum, item) => (sum += item.price * item.quantity), 0).toFixed(2)}€</h4>
              </strong>
            </div>
          </StyledCartItem>
          <div>
            <form onSubmit={handleSubmit}>
              <label
                htmlFor='Email'
                id='email'
              >
                Email:
              </label>
              <StyledInput
                id='email'
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <StyledButton>Confirm purchase</StyledButton>
            </form>
          </div>
        </StyledSection>
      ) : (
        <StyledSection>
          <p>No items added to cart.</p>
        </StyledSection>
      )}
      <Footer />
    </>
  );
}

export default Checkout;
