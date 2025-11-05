import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dossierReducer from './slices/dossierSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dossiers: dossierReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['dossiers/setSelectedDossier'],
        ignoredPaths: ['dossiers.selectedDossier.dateCreation'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
