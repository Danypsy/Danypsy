import { Box, Typography, Paper, Grid } from '@mui/material';

export default function KPIDashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord KPIs
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography>Indicateurs de performance pour coordinateurs</Typography>
            <Typography variant="body2" color="text.secondary">
              À implémenter: délai moyen, taux de rejet, acceptation 1ère, etc.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
