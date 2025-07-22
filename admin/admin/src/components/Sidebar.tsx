import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import PeopleIcon from '@mui/icons-material/People';
import StyleIcon from '@mui/icons-material/Style';
import MemoryIcon from '@mui/icons-material/Memory';
import NoteIcon from '@mui/icons-material/Note';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useNavigate, useLocation } from 'react-router-dom';

const menu = [
  { label: 'Users', icon: <PeopleIcon />, path: '/users' },
  { label: 'Flashcards', icon: <StyleIcon />, path: '/flashcards' },
  { label: 'Notes', icon: <NoteIcon />, path: '/notes' },
  { label: 'Plans', icon: <EventNoteIcon />, path: '/plans' },
  { label: 'AI Logs', icon: <MemoryIcon />, path: '/ai-logs' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Drawer variant="permanent" sx={{ width: 220, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box', bgcolor: '#222a36', color: '#fff' } }}>
      <Toolbar />
      <List>
        {menu.map(item => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton selected={location.pathname === item.path} onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
export default Sidebar; 