import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

const StyledSection = styled.div`
  margin: 0 auto;
  max-width: 80rem;
  padding: 1rem 2rem;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: start;
  gap: 2rem;
`;

const StyledImg = styled.img`
  border: 1px solid rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 22.5rem;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1/1;
`;

const StyledWrapperInfo = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: start;
  align-items: start;
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
`;

function ItemDetail() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItemDetail = async () => {
      try {
        const response = await fetch(`/app-flask/item/${itemId}`);
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    };

    fetchItemDetail();
  }, [itemId]);

  const handleAddToCart = (item) => {
    console.log(item);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cart.find((cartItem) => cartItem?._id === item?._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
  };

  return (
    <>
      <Header />

      {item ? (
        <StyledSection>
          <StyledImg src={item.imageUrl}></StyledImg>
          <StyledWrapperInfo>
            <h2>{item.name}</h2>
            <p>Price: ${item.price}</p>
            <p>Available: {item.available ? 'Yes' : 'No'}</p>
            <p>Category: {item.category}</p>
            <p>Description: {item.description}</p>
            <StyledButton onClick={() => handleAddToCart(item)}>Add to cart</StyledButton>
          </StyledWrapperInfo>
        </StyledSection>
      ) : (
        <StyledSection>
          <p>Loading item details...</p>
        </StyledSection>
      )}

      <Footer />
    </>
  );
}

export default ItemDetail;
