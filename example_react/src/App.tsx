import React from "react";
import "./App.css"; // Import the CSS file
import { AuthContext, AuthHeader, AuthProvider } from "./Auth";
import LikedTracks from "./LikedTracks";
import { QueryClientProvider, QueryClient } from "react-query";
import styled from "styled-components";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Page />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Page = () => {
  const { isAuthenticated } = React.useContext(AuthContext);

  return (
    <PageWrapper>
      <AuthHeader />
      {isAuthenticated && <LikedTracks />}
    </PageWrapper>
  );
};

export default App;
