import styled from "styled-components";

const AppShell = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f7f7fb;
`;

const Card = styled.section`
  text-align: center;
  padding: 2rem 3rem;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 2.5rem;
  color: #111;
`;

const SubTitle = styled.p`
  margin: 0;
  color: #555;
`;

export default function App() {
  return (
    <AppShell>
      <Card>
        <Title>Hello World</Title>
        <SubTitle>React + TypeScript + Vite + styled-components</SubTitle>
      </Card>
    </AppShell>
  );
}
