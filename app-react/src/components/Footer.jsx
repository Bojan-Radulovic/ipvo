import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-flow: row wrap;
  justify-content: end;
  margin: 2.5rem auto;
  padding: 1rem 2rem;
  max-width: 80rem;
  width: 100%;
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

function Footer() {
  return <StyledFooter>
    <StyledLink to='/admin'>Admin</StyledLink>
  </StyledFooter>;
}

export default Footer;
