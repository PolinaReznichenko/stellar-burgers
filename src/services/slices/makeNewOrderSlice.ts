import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi, TNewOrder } from '../../utils/burger-api';

export const postOrderBurger = createAsyncThunk(
  'order/newOrder',
  async (data: string[]) => await orderBurgerApi(data)
);

type TNewOrderState = {
  order: TNewOrder | null;
  name: string;
  loading: boolean;
  error: string | null;
};

const initialState: TNewOrderState = {
  order: null,
  name: '',
  loading: false,
  error: null
};

export const makeNewOrderSlice = createSlice({
  name: 'newOrder',
  initialState,
  reducers: {
    clearNewOrderState: (state) => {
      state.order = null;
      state.name = '';
      state.loading = false;
      state.error = null;
    }
  },
  selectors: {
    newOrderSelector: (state) => state
  },
  extraReducers: (builder) => {
    builder
      .addCase(postOrderBurger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postOrderBurger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(postOrderBurger.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
        state.name = action.payload.name;
      });
  }
});

export const { newOrderSelector } = makeNewOrderSlice.selectors;
export const { clearNewOrderState } = makeNewOrderSlice.actions;
export default makeNewOrderSlice.reducer;
