import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

function SearchResults() {
  const { query } = useParams();
  const [apiResponseRecommender, setApiResponseRecommender] = useState("");
  const queryAmount = 10;
  const maxTitleLength = 50;

  const handleGetRecommendations = async () => {
    try {
      const response = await fetch(`/app-flask/recommender?query=${query}&name=${query}&amount=${queryAmount}&name_factor=${2}`);
      const responseJson = await response.json();

      console.log("Recived recommendations:", responseJson.items);
      setApiResponseRecommender(responseJson.items);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      setApiResponseRecommender("Error getting recommendations:", error);
    }
  };

  useEffect(() => {
    if(query){
        handleGetRecommendations();
    }
  }, [query]);


  return (
    <>
      <Header />
      <h1 style={{textAlign: 'center'}}>Search results:</h1>

      {apiResponseRecommender && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ marginTop: "10px", display: 'flex', justifyContent: 'center', flexWrap: 'wrap'}}>
            {apiResponseRecommender.map((item, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', width: 'fit-content', maxWidth: '15rem'}}>
                  <a href={`/item/${item._id}`}><StyledImg src={item.imageUrl}></StyledImg></a>
                  <StyledLink to={`/item/${item._id}`}>{item.name.slice(0, maxTitleLength) + '...'}</StyledLink>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default SearchResults;
