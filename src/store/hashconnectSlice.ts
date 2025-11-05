/* 
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface HashConnectState {
    isConnected: boolean;
    accountId: string | null;
    isLoading: boolean;
}

const initialState: HashConnectState = {
    isConnected: false,
    accountId: null,
    isLoading: false,

};

const hashconnectSlice = createSlice({
    name: 'hashconnect',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setConnected: (state, action: PayloadAction<{ accountId: string }>) => {
            state.isConnected = true;
            state.accountId = action.payload.accountId;
            state.isLoading = false;
        },
        setDisconnected: (state) => {
            state.isConnected = false;
            state.accountId = null;
            state.isLoading = false;
        }
    }
});


export const { setLoading, setConnected, setDisconnected } = hashconnectSlice.actions;
export default hashconnectSlice.reducer; */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface HashconnectState {
  isConnected: boolean;
  accountId: string | null;
  isLoading: boolean;
}

const initialState: HashconnectState = {
  isConnected: false,
  accountId: null,
  isLoading: false,
};

const hashconnectSlice = createSlice({
  name: "hashconnect",
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<{ accountId: string }>) {
      state.isConnected = true;
      state.accountId = action.payload.accountId;
    },
    setDisconnected(state) {
      state.isConnected = false;
      state.accountId = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setConnected, setDisconnected, setLoading } =
  hashconnectSlice.actions;
export default hashconnectSlice.reducer;
