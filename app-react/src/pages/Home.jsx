import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Header from '../components/Header';
import Footer from '../components/Footer';

const StyledProductsGrid = styled.div`
  margin: 0 auto;
  max-width: 80rem;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  padding: 2rem;
`;

const StyledProductItem = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 1rem;
`;

const StyledProductImg = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1/1;
`;

const StyledProductTitle = styled.h3`
  color: black;
  font-weight: bold;
  font-size: 1.5rem;
`;

const StyledLink = styled(Link)`
  align-items: center;
  border-radius: 2px;
  color: black;
  display: flex;
  flex-flow: row nowrap;
  font-weight: bold;
  gap: 0.5rem;
  justify-content: start;
  text-decoration: none;
`;

function Store() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/app-flask/items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const availableItems = items.filter((item) => item.available);

  return (
    <div>
      <Header />
      <StyledProductsGrid>
        {availableItems.length > 0 ? (
          availableItems.map((item) => (
            <StyledProductItem key={item._id}>
              <StyledProductImg src={item.imageUrl} />
              <StyledProductTitle>{item.name}</StyledProductTitle>
              <StyledLink to={`/item/${item._id}`}>View</StyledLink>
            </StyledProductItem>
          ))
        ) : (
          <p>No items available in the store.</p>
        )}
      </StyledProductsGrid>
      <Footer />
    </div>
  );
}

export default Store;
