import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  TLoginData,
  loginUserApi,
  getUserApi,
  TRegisterData,
  registerUserApi,
  forgotPasswordApi,
  resetPasswordApi,
  updateUserApi,
  logoutApi
} from '../../utils/burger-api';
import { TUser } from '../../utils/types';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookie';

//запрос для авторизации пользователя(post) и сохранение полученных токенов
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }: TLoginData) => {
    const userData = await loginUserApi({ email, password });
    setCookie('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
    return userData.user;
  }
);

//запрос для регистрации пользователя(post) и сохранение полученных токенов
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ email, name, password }: TRegisterData) => {
    const userData = await registerUserApi({ email, name, password });
    setCookie('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
    return userData.user;
  }
);

//запрос на восстановление пароля (отправка email)
export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email: string) => await forgotPasswordApi({ email })
);

// сброс пароля с использованием кода подтверждения token
export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ password, token }: { password: string; token: string }) =>
    await resetPasswordApi({ password, token })
);

//запрос на обновление данных пользователя
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (user: Partial<TRegisterData>) => {
    const userData = await updateUserApi(user);
    return userData.user;
  }
);

//запрос для выхода пользователя
export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
});

type TUserState = {
  isAuthChecked: boolean; // флаг для статуса проверки токена пользователя (проверялся ли уже токен пользователя)
  isAuthenticated: boolean; // флаг для проверки авторизации (при успешной авторизации меняется значение на true)
  user: TUser | null; //информация о пользователе
  error: string | null; //ошибка, которая может возникнуть при попытке входа
  userRequest: boolean; // флаг, показывающий идёт ли в данный момент запрос на сервер
};

const initialState: TUserState = {
  isAuthChecked: false,
  isAuthenticated: false,
  user: null,
  error: null,
  userRequest: false
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<TUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    authChecked: (state) => {
      state.isAuthChecked = true;
    }
  },
  selectors: {
    getUserSelector: (state) => state
  },
  extraReducers: (builder) => {
    builder
      //Логин
      .addCase(loginUser.pending, (state) => {
        state.userRequest = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.userRequest = false;
        state.error = action.error.message || 'Ошибка авторизации';
        state.isAuthChecked = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.userRequest = false;
        state.user = action.payload;
        state.isAuthChecked = true;
        state.isAuthenticated = true;
      })
      //Регистрация
      .addCase(registerUser.pending, (state) => {
        state.userRequest = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.userRequest = false;
        state.error = action.error.message || 'Ошибка при регистрации';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.userRequest = false;
        state.user = action.payload;
        state.isAuthChecked = true;
        state.isAuthenticated = true;
      })
      //Восстановление пароля(проверка емэйл)
      .addCase(forgotPassword.pending, (state) => {
        state.userRequest = true;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.userRequest = false;
        state.error = action.error.message || 'Ошибка проверки емэйл';
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.userRequest = false;
      })
      //Восстановление пароля(сброс пароля)
      .addCase(resetPassword.pending, (state) => {
        state.userRequest = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.userRequest = false;
        state.error = action.error.message || 'Ошибка сохранения нового пароля';
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.userRequest = false;
      })
      //Обновление данных пользователя
      .addCase(updateUser.pending, (state) => {
        state.userRequest = true;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userRequest = false;
        state.error = action.error.message || 'Ошибка сохранения изменений';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.userRequest = false;
        state.user = action.payload;
      })
      //Выход пользователя
      .addCase(logoutUser.pending, (state) => {
        state.userRequest = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.userRequest = false;
        state.error = action.error.message || 'Ошибка выполнения выхода';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.userRequest = false;
        state.user = null;
      })
      //проверка и запрос данных пользователя
      .addCase(checkUserAuth.pending, (state) => {
        state.userRequest = true;
        state.error = null;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.userRequest = false;
        state.error =
          action.error.message || 'Ошибка загрузки данных пользователя';
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.userRequest = false;
        state.user = action.payload!;
        state.isAuthChecked = true;
      });
  }
});

//проверка наличия токена и при наличии запрос данных пользователя
export const checkUserAuth = createAsyncThunk(
  'user/checkUser',
  async (_, { dispatch }) => {
    const accessToken = getCookie('accessToken');
    if (accessToken) {
      const userData = await getUserApi();
      dispatch(setUser(userData.user));
      dispatch(authChecked());
    } else {
      dispatch(authChecked());
    }
  }
);

// // //проверка наличия токена и при наличии запрос данных пользователя
// export const checkUserAuth = createAsyncThunk(
//   'user/checkUser',
//   async (_, { dispatch }) => {
//     try {
//       const userData = await getUserApi();
//       dispatch(authChecked());
//       return userData.user;
//     } catch (error) {
//       dispatch(authChecked());
//       console.error(`Ошибка загрузки данных пользователя: ${error}`);
//     }
//   }
// );

export const { authChecked, setUser } = userSlice.actions;
export const { getUserSelector } = userSlice.selectors;
export default userSlice.reducer;
