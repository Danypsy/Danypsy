import { Box, Typography, Paper } from '@mui/material';

export default function ChecklistPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Checklist de validation (25 points)
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Checklist interactive à implémenter</Typography>
      </Paper>
    </Box>
  );
}
