import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDossierById } from '../store/slices/dossierSlice';

export default function DossierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedDossier, loading } = useAppSelector((state) => state.dossiers);

  useEffect(() => {
    if (id) {
      dispatch(fetchDossierById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedDossier) {
    return <Typography>Dossier non trouvé</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dossier {selectedDossier.numero}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Statut: {selectedDossier.statut}
        </Typography>
        {/* Ajouter plus de détails ici */}
      </Paper>
      <Button
        sx={{ mt: 2 }}
        variant="contained"
        onClick={() => navigate(`/dossiers/${id}/checklist`)}
      >
        Voir la checklist
      </Button>
    </Box>
  );
}
