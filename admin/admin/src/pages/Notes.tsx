import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button, Tooltip, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = import.meta.env.VITE_API_URL;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: { name: string; email: string };
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchNotes = async (searchValue = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/notes/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: searchValue ? { keyword: searchValue } : {},
      });
      setNotes(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotes(search);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    await fetchNotes(search);
    setSearching(false);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Notes Management</Typography>
      <Box component="form" onSubmit={handleSearch} mb={2} display="flex" gap={2}>
        <TextField
          size="small"
          placeholder="Search by title or content"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={searching}>Search</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notes.map(note => (
                <TableRow key={note.id}>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{note.user?.name || note.user?.email}</TableCell>
                  <TableCell>{new Date(note.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(note.id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
export default NotesPage; 