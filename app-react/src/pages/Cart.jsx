import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Header from '../components/Header';
import Footer from '../components/Footer';

const StyledSection = styled.div`
  margin: 0 auto;
  max-width: 80rem;
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

const StyledLinkButton = styled(Link)`
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
`;

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const cartItemsJSON = localStorage.getItem('cart');
    const storedCartItems = JSON.parse(cartItemsJSON) || [];
    setCart(storedCartItems);
  }, []);

  return (
    <>
      <Header />
      <StyledSection>
        <h2>Cart</h2>
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
          <StyledLinkButton to='/checkout'>Checkout</StyledLinkButton>
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

export default Cart;
