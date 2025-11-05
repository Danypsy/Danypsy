import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDossiers } from '../store/slices/dossierSlice';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DossierList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dossiers, loading } = useAppSelector((state) => state.dossiers);

  useEffect(() => {
    dispatch(fetchDossiers());
  }, [dispatch]);

  const columns: GridColDef[] = [
    { field: 'numero', headerName: 'Numéro', width: 150 },
    {
      field: 'candidat',
      headerName: 'Candidat',
      width: 200,
      valueGetter: (params) =>
        `${params.row.candidat?.user?.nom} ${params.row.candidat?.user?.prenom}`,
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'ACCEPTE' ? 'success' :
            params.value === 'REJETE' ? 'error' :
            params.value === 'TRANSMIS' ? 'warning' : 'default'
          }
        />
      ),
    },
    {
      field: 'dateCreation',
      headerName: 'Date création',
      width: 150,
      valueFormatter: (params) =>
        format(new Date(params.value), 'dd/MM/yyyy', { locale: fr }),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate(`/dossiers/${params.row.id}`)}
        >
          Voir détails
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Liste des dossiers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dossiers/create')}
        >
          Nouveau dossier
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={dossiers}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
}
