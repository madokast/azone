import styled from "styled-components";

const AppShell = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 4vw, 3rem);
  background: #f7f7fb;
`;

const Card = styled.section`
  text-align: center;
  width: min(720px, 100%);
  padding: clamp(1.5rem, 4vw, 3rem);
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #111;
`;

const SubTitle = styled.p`
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.125rem);
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
