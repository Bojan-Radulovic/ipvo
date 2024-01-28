import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import styled from 'styled-components';

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 80rem;
  padding: 1rem 2rem;
  width: 100%;
`;

const StyledLogo = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
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
`;

const StyledNav = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: end;
  align-items: center;
  gap: 2rem;
`;

function Header() {
  return (
    <StyledHeader>
      <div>
        <StyledLogo>MBACommerce</StyledLogo>
      </div>
      <StyledNav>
        <StyledLink to='/'>Shop</StyledLink>
        <StyledLinkButton to='/cart'>
          <ShoppingCart />
          Cart
        </StyledLinkButton>
      </StyledNav>
    </StyledHeader>
  );
}

export default Header;
