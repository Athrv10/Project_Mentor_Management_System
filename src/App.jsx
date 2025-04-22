import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/AppRoutes";
import { CssVarsProvider } from '@mui/joy/styles';

function App() {
  return (
    <BrowserRouter>
      <CssVarsProvider defaultMode="dark">
        <AppRoutes />
      </CssVarsProvider>
    </BrowserRouter>
  );
}

export default App;