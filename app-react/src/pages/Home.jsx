import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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

const StyledNavBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

function Store() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const { pageNumber } = useParams();
  const currentPage = parseInt(pageNumber, 10) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [displayPage, setDisplayPage] = useState(Math.max(currentPage, 1))

  const fetchItems = async () => {
    try {
      const page_size = 9;
      const response = await fetch(`/app-flask/items-pagination?page=${currentPage}&page_size=${page_size}`);
      const data = await response.json();
      setItems(data.items);
      setTotalPages(Math.max(data.total_pages, 1));
      setDisplayPage(data.page)
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
    window.scrollTo(0, 0);
  }, [currentPage]);

  const availableItems = items.filter((item) => item.available);

  const goToPreviousPage = () => {
    const newPage = Math.max(displayPage - 1, 1);
    navigate(`/${newPage}`);
  };

  const goToNextPage = () => {
    const newPage = Math.min(displayPage + 1, totalPages);
    navigate(`/${newPage}`);
  };

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
      <StyledNavBar>
        <button onClick={goToPreviousPage} disabled={displayPage <= 1}>Previous</button>
        <span>Page {displayPage} of {totalPages}</span>
        <button onClick={goToNextPage} disabled={displayPage >= totalPages}>Next</button>
      </StyledNavBar>
      <Footer />
    </div>
  );
}

export default Store;
