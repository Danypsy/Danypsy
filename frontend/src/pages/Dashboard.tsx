import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDossiers, fetchDossiersAtRisque } from '../store/slices/dossierSlice';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { dossiers, dossiersAtRisque, loading } = useAppSelector((state) => state.dossiers);

  useEffect(() => {
    dispatch(fetchDossiers({ limit: 5 }));
    dispatch(fetchDossiersAtRisque());
  }, [dispatch]);

  // Calcul des statistiques
  const stats = {
    total: dossiers.length,
    enCours: dossiers.filter((d) =>
      ['BROUILLON', 'EN_VALIDATION_DEVIS', 'CONSTITUTION_DOCUMENTS'].includes(d.statut)
    ).length,
    transmis: dossiers.filter((d) =>
      ['TRANSMIS', 'EN_ATTENTE_GESTIONNAIRE'].includes(d.statut)
    ).length,
    acceptes: dossiers.filter((d) => d.statut === 'ACCEPTE').length,
  };

  const getStatusColor = (statut: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
      BROUILLON: 'default',
      EN_VALIDATION_DEVIS: 'primary',
      CONSTITUTION_DOCUMENTS: 'primary',
      INTEGRATION_PRESTAPPLI: 'primary',
      PRE_TRANSMISSION: 'warning',
      TRANSMIS: 'warning',
      EN_ATTENTE_GESTIONNAIRE: 'warning',
      ACCEPTE: 'success',
      REJETE: 'error',
    };
    return colors[statut] || 'default';
  };

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon',
      EN_VALIDATION_DEVIS: 'Validation devis',
      CONSTITUTION_DOCUMENTS: 'Constitution',
      INTEGRATION_PRESTAPPLI: 'Prest@ppli',
      PRE_TRANSMISSION: 'Pré-transmission',
      TRANSMIS: 'Transmis',
      EN_ATTENTE_GESTIONNAIRE: 'En attente',
      ACCEPTE: 'Accepté',
      REJETE: 'Rejeté',
    };
    return labels[statut] || statut;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Tableau de bord
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dossiers/create')}
        >
          Nouveau dossier
        </Button>
      </Box>

      {/* Message de bienvenue */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Bienvenue <strong>{user?.prenom} {user?.nom}</strong> ({user?.role})
          {user?.region && ` - Région ${user.region}`}
        </Typography>
      </Alert>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FolderIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Dossiers totaux
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.enCours}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                En cours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.transmis}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Transmis
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.acceptes}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Acceptés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Dossiers à risque */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon color="error" sx={{ mr: 1 }} />
              Dossiers à risque ({dossiersAtRisque.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Moins de 10 jours avant la deadline J-21
            </Typography>
            {dossiersAtRisque.length === 0 ? (
              <Alert severity="success">Aucun dossier à risque</Alert>
            ) : (
              <List>
                {dossiersAtRisque.map((dossier: any) => (
                  <div key={dossier.id}>
                    <ListItem
                      button
                      onClick={() => navigate(`/dossiers/${dossier.id}`)}
                      sx={{ pl: 0 }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {dossier.numero}
                            </Typography>
                            <Chip
                              label={getStatusLabel(dossier.statut)}
                              color={getStatusColor(dossier.statut)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {dossier.candidat?.user?.nom} {dossier.candidat?.user?.prenom}
                            </Typography>
                            {dossier.joursRestants !== null && (
                              <Typography
                                variant="caption"
                                color={dossier.joursRestants < 5 ? 'error' : 'warning.main'}
                              >
                                ⚠️ {dossier.joursRestants} jours restants
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            )}
            <CardActions>
              <Button size="small" onClick={() => navigate('/dossiers?filter=at-risque')}>
                Voir tous les dossiers à risque
              </Button>
            </CardActions>
          </Paper>
        </Grid>

        {/* Dossiers récents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Dossiers récents
            </Typography>
            <List>
              {dossiers.slice(0, 5).map((dossier) => (
                <div key={dossier.id}>
                  <ListItem
                    button
                    onClick={() => navigate(`/dossiers/${dossier.id}`)}
                    sx={{ pl: 0 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {dossier.numero}
                          </Typography>
                          <Chip
                            label={getStatusLabel(dossier.statut)}
                            color={getStatusColor(dossier.statut)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {dossier.candidat?.user?.nom} {dossier.candidat?.user?.prenom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Créé le {format(new Date(dossier.dateCreation), 'dd/MM/yyyy', { locale: fr })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
            <CardActions>
              <Button size="small" onClick={() => navigate('/dossiers')}>
                Voir tous les dossiers
              </Button>
            </CardActions>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
