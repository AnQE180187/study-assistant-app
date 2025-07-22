import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button, Tooltip, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = import.meta.env.VITE_API_URL;

interface Plan {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  completed: boolean;
  user: { name: string; email: string };
}

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchPlans = async (searchValue = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/studyplans/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: searchValue ? { keyword: searchValue } : {},
      });
      setPlans(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/studyplans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchPlans(search);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    await fetchPlans(search);
    setSearching(false);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Study Plans Management</Typography>
      <Box component="form" onSubmit={handleSearch} mb={2} display="flex" gap={2}>
        <TextField
          size="small"
          placeholder="Search by title"
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
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plans.map(plan => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.title}</TableCell>
                  <TableCell>{plan.user?.name || plan.user?.email}</TableCell>
                  <TableCell>{new Date(plan.date).toLocaleDateString()}</TableCell>
                  <TableCell>{plan.startTime} - {plan.endTime}</TableCell>
                  <TableCell>{plan.completed ? 'Completed' : 'Pending'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(plan.id)}><DeleteIcon /></IconButton>
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
export default PlansPage; 