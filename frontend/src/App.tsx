import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              MedReminder
            </Typography>
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <AppointmentForm onAppointmentCreated={() => {}} />
                  <AppointmentList />
                </>
              }
            />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 