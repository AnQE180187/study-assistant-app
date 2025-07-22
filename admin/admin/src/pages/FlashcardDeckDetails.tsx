import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getFlashcardsByDeckForAdmin } from '../services/flashcardService';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

const FlashcardDeckDetailsPage: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const { deckId } = useParams<{ deckId: string }>();

  useEffect(() => {
    if (deckId) {
      const fetchFlashcards = async () => {
        const data = await getFlashcardsByDeckForAdmin(deckId);
        setFlashcards(data);
      };
      fetchFlashcards();
    }
  }, [deckId]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 220 },
    { field: 'term', headerName: 'Term', width: 300 },
    { field: 'definition', headerName: 'Definition', width: 400 },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Flashcards in Deck
      </Typography>
      <DataGrid
        rows={flashcards}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
      />
    </Box>
  );
};

export default FlashcardDeckDetailsPage; 