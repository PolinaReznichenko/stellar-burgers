import { configureStore } from '@reduxjs/toolkit';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

const rootReducer = () => {}; // Заменить на импорт настоящего редьюсера

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

/**
 * Типизированный хук useDispatch, который возвращает функцию dispatch,
 * заранее привязанную к типу AppDispatch.
 * Это позволяет избежать явного указания типа dispatch в компонентах.
 */
export const useDispatch: () => AppDispatch = () => dispatchHook();

/**
 * Типизированный хук useSelector, который принимает селектор,
 * работающий с состоянием типа RootState.
 * Обеспечивает правильную типизацию возвращаемого значения селектора.
 */
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
