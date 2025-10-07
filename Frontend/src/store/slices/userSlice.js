import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to check user's authentication status by verifying the token with the backend
export const checkAuthStatus = createAsyncThunk(
  'user/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      // The browser automatically sends the httpOnly cookie with each request
      const response = await axios.get('https://spectra-ai-1.onrender.com/api/auth/me', {
        withCredentials: true, // Important to send cookies
      });
      return response.data.user; // The backend should return user data on success
    } catch (error) {
      // The backend will return an error (like 401) if the token is missing or invalid
      return rejectWithValue(error.response?.data?.message || 'Authentication check failed');
    }
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('https://spectra-ai-1.onrender.com/api/auth/logout', {}, {
        withCredentials: true,
      });
    } finally {
      // Always remove the cookie on the client side as a fallback for immediate UI update
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start in a loading state to allow for the initial auth check
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // This is now used after a successful manual login/registration
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle the initial auth check
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      // Handle logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails on the server, force logout on the client for security.
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { loginSuccess } = userSlice.actions;
export default userSlice.reducer;