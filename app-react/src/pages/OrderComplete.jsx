import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';

const StyledSection = styled.div`
  margin: 0 auto;
  max-width: 30rem;
  padding: 6rem 2rem;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: start;
  align-items: start;
  gap: 2rem;
`;

function OrderComplete() {
  return (
    <>
      <Header />
      <StyledSection>
        <h2>Order complete</h2>
        <p>Thank you for your purchase. Check your inbox for order summary.</p>
      </StyledSection>
      <Footer />
    </>
  );
}

export default OrderComplete;
