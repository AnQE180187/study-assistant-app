import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import UsersPage from './pages/Users';
import FlashcardsPage from './pages/Flashcards';
import AiLogsPage from './pages/AiLogs';
import LoginPage from './pages/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { Box } from '@mui/material';
import FlashcardDeckDetailsPage from './pages/FlashcardDeckDetails';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

const App: React.FC = () => {
  const token = localStorage.getItem('token');
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', bgcolor: '#f5f6fa' }}>
      {token && <Sidebar />}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {token && <Topbar />}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto', minWidth: 0 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
            <Route path="/flashcards" element={<RequireAuth><FlashcardsPage /></RequireAuth>} />
            <Route path="/flashcards/decks/:deckId" element={<RequireAuth><FlashcardDeckDetailsPage /></RequireAuth>} />
            <Route path="/ai-logs" element={<RequireAuth><AiLogsPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to={token ? "/users" : "/login"} />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
