import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Dossier {
  id: string;
  numero: string;
  statut: string;
  dateCreation: string;
  dateJ21?: string;
  candidat: any;
  formation?: any;
}

interface DossierState {
  dossiers: Dossier[];
  selectedDossier: Dossier | null;
  dossiersAtRisque: Dossier[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: DossierState = {
  dossiers: [],
  selectedDossier: null,
  dossiersAtRisque: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchDossiers = createAsyncThunk(
  'dossiers/fetchDossiers',
  async (params: { page?: number; limit?: number; statut?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dossiers', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des dossiers');
    }
  }
);

export const fetchDossierById = createAsyncThunk(
  'dossiers/fetchDossierById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/dossiers/${id}`);
      return response.data.data.dossier;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement du dossier');
    }
  }
);

export const fetchDossiersAtRisque = createAsyncThunk(
  'dossiers/fetchDossiersAtRisque',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dossiers/at-risque');
      return response.data.data.dossiers;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des dossiers à risque');
    }
  }
);

const dossierSlice = createSlice({
  name: 'dossiers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedDossier: (state, action: PayloadAction<Dossier | null>) => {
      state.selectedDossier = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dossiers
      .addCase(fetchDossiers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDossiers.fulfilled, (state, action) => {
        state.loading = false;
        state.dossiers = action.payload.dossiers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDossiers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Dossier By Id
      .addCase(fetchDossierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDossierById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDossier = action.payload;
      })
      .addCase(fetchDossierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Dossiers At Risque
      .addCase(fetchDossiersAtRisque.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDossiersAtRisque.fulfilled, (state, action) => {
        state.loading = false;
        state.dossiersAtRisque = action.payload;
      })
      .addCase(fetchDossiersAtRisque.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedDossier } = dossierSlice.actions;
export default dossierSlice.reducer;
