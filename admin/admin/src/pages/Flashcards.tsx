import React, { useEffect, useState } from 'react';
import { getFlashcardSets, addFlashcardSet, updateFlashcardSet, deleteFlashcardSet } from '../services/flashcardService';
import type { FlashcardSet } from '../services/flashcardService';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const FlashcardsPage: React.FC = () => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editSet, setEditSet] = useState<FlashcardSet | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const data = await getFlashcardSets();
      setSets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, []);

  const handleOpen = (set?: FlashcardSet) => {
    if (set) {
      setEditSet(set);
      setForm({ title: set.title, description: set.description });
    } else {
      setEditSet(null);
      setForm({ title: '', description: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditSet(null);
    setForm({ title: '', description: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    if (editSet) {
      await updateFlashcardSet(editSet.id, form);
    } else {
      await addFlashcardSet(form);
    }
    setSaving(false);
    handleClose();
    fetchSets();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this set?')) {
      await deleteFlashcardSet(id);
      fetchSets();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Flashcard Set Manager</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Set</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Number of Flashcards</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sets.map(set => (
                <TableRow key={set.id}>
                  <TableCell>{set.title}</TableCell>
                  <TableCell>{set.description}</TableCell>
                  <TableCell>{set.flashcards?.length ?? 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpen(set)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(set.id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editSet ? 'Edit Flashcard Set' : 'Add Flashcard Set'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.title}>{editSet ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default FlashcardsPage; 