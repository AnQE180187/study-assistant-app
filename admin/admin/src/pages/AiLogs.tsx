import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const API_URL = import.meta.env.VITE_API_URL;

interface AiLog {
  id: string;
  user: { name: string; email: string };
  prompt: string;
  response: string;
  timestamp: string;
  createdAt?: string;
}

const AiLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ date: '', keyword: '' });
  const [filtering, setFiltering] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');

  const fetchLogs = async (params?: { date?: string; keyword?: string }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/ai/logs?${params?.date ? `date=${params.date}&` : ''}${params?.keyword ? `keyword=${params.keyword}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    setFiltering(true);
    await fetchLogs(filters);
    setFiltering(false);
  };

  const handleShowResponse = (response: string) => {
    setDialogContent(response);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>AI Logs Viewer</Typography>
      <Box component="form" onSubmit={handleFilter} mb={2} display="flex" gap={2}>
        <TextField
          size="small"
          label="Date"
          name="date"
          type="date"
          value={filters.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="Keyword"
          name="keyword"
          value={filters.keyword}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained" disabled={filtering}>Filter</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Prompt</TableCell>
                <TableCell>AI Response</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{log.user?.name}</TableCell>
                  <TableCell>{log.user?.email}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{log.prompt}</TableCell>
                  <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.response.length > 60 ? `${log.response.slice(0, 60)}...` : log.response}
                    </span>
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small" onClick={() => handleShowResponse(log.response)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Response</DialogTitle>
        <DialogContent>
          <Box sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{dialogContent}</Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default AiLogsPage; 