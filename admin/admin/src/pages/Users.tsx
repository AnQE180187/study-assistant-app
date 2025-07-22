import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser, promoteUser } from '../services/userService';
import type { User } from '../services/userService';
import { Box, Typography, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tooltip, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SearchIcon from '@mui/icons-material/Search';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchUsers = async (searchValue = '') => {
    setLoading(true);
    try {
      const data = await getUsers(searchValue);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
      fetchUsers(search);
    }
  };

  const handlePromote = async (id: string) => {
    await promoteUser(id);
    fetchUsers(search);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    await fetchUsers(search);
    setSearching(false);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>User Management</Typography>
      <Box component="form" onSubmit={handleSearch} mb={2} display="flex" gap={2}>
        <TextField
          size="small"
          placeholder="Search by name or email"
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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                    {user.role !== 'admin' && (
                      <Tooltip title="Promote to Admin">
                        <IconButton color="primary" onClick={() => handlePromote(user.id)}><AdminPanelSettingsIcon /></IconButton>
                      </Tooltip>
                    )}
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
export default UsersPage; 