import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridValueGetter, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Typography, Button } from '@mui/material';
import { getPublicDecks } from '../services/flashcardService';
import { useNavigate } from 'react-router-dom';

interface Deck {
  id: string;
  title: string;
  description: string;
  _count: {
    flashcards: number;
  };
}

const FlashcardsPage: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecks = async () => {
      const data = await getPublicDecks();
      setDecks(data);
    };
    fetchDecks();
  }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 220 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
    { 
      field: '_count', 
      headerName: 'Flashcards', 
      width: 100,
      valueGetter: (params: { row: Deck }) => params.row._count?.flashcards || 0,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="contained"
          onClick={() => navigate(`/flashcards/decks/${params.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Public Flashcard Decks
      </Typography>
      <DataGrid
        rows={decks}
        columns={columns}
        checkboxSelection
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
      />
    </Box>
  );
};

export default FlashcardsPage; 