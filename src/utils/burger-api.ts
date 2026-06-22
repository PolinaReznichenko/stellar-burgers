import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TOrdersData, TUser } from './types';

// Базовый URL API бургерной, берется из переменных окружения
const URL = process.env.BURGER_API_URL;

/**
 * Универсальная функция проверки HTTP-ответа.
 * Если ответ успешный (ok), парсит JSON и возвращает его с типом T.
 * Иначе парсит JSON с ошибкой и отклоняет промис с этой ошибкой
 */
const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then((err) => Promise.reject(err));

/**
 * Базовый тип для всех ответов сервера.
 * Все ответы содержат также дополнительные данные типа T.
 */
type TServerResponse<T> = {
  success: boolean;
} & T;

/**
 * Тип ответа при обновлении токенов.
 */
type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

/**
 * Обновляет пару токенов (access и refresh).
 * Отправляет запрос на /auth/token с текущим refreshToken из localStorage.
 * При успехе сохраняет новый refreshToken в localStorage и accessToken в cookie.
 * Возвращает данные ответа с новыми токенами.
 */
export const refreshToken = (): Promise<TRefreshResponse> =>
  fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((refreshData) => {
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      setCookie('accessToken', refreshData.accessToken);
      return refreshData;
    });

/**
 * Обёртка для fetch, автоматически обрабатывающая истёкший accessToken.
 * Если при первом запросе получаем ошибку 'jwt expired', выполняет refreshToken(),
 * обновляет заголовок Authorization и повторяет запрос.
 * @template T - ожидаемый тип данных из ответа
 * @param url - адрес запроса
 * @param options - параметры fetch (метод, заголовки, тело и т.д.)
 */
export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
) => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err) {
    if ((err as { message: string }).message === 'jwt expired') {
      const refreshData = await refreshToken();
      if (options.headers) {
        (options.headers as { [key: string]: string }).authorization =
          refreshData.accessToken;
      }
      const res = await fetch(url, options);
      return await checkResponse<T>(res);
    } else {
      return Promise.reject(err);
    }
  }
};

/**
 * Тип ответа при получении списка ингредиентов.
 */
type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

/**
 * Тип ответа при получении ленты заказов (все заказы).
 */
type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

/**
 * Тип ответа при получении заказов конкретного пользователя.
 */
type TOrdersResponse = TServerResponse<{
  data: TOrder[];
}>;

/**
 * Запрос на получение всех ингредиентов.
 * Возвращает массив ингредиентов (TIngredient[]) или промис с данными об ошибке в случае неудачи.
 */
export const getIngredientsApi = () =>
  fetch(`${URL}/ingredients`)
    .then((res) => checkResponse<TIngredientsResponse>(res))
    .then((data) => {
      if (data?.success) return data.data;
      return Promise.reject(data);
    });

/**
 * Запрос на получение общей ленты заказов (все заказы всех пользователей).
 * Возвращает объект с полями orders, total, totalToday.
 */
export const getFeedsApi = () =>
  fetch(`${URL}/orders/all`)
    .then((res) => checkResponse<TFeedsResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

/**
 * Запрос на получение заказов текущего пользователя (требует авторизации).
 * Использует fetchWithRefresh для автоматического обновления токена.
 * Возвращает массив заказов (TOrder[]).
 */
export const getOrdersApi = () =>
  fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit
  }).then((data) => {
    if (data?.success) return data.orders;
    return Promise.reject(data);
  });

/**
 * Тип владельца заказа (используется внутри TNewOrder).
 */
type TOwner = {
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Тип данных для создаваемого заказа (ответ от сервера после создания).
 */
type TNewOrder = {
  _id: string;
  status: string;
  name: string;
  owner: TOwner;
  createdAt: string;
  updatedAt: string;
  number: number;
  price: number;
};

/**
 * Тип ответа при создании нового заказа.
 */
type TNewOrderResponse = TServerResponse<{
  order: TNewOrder;
  name: string;
}>;

/**
 * Создание нового заказа (POST /orders).
 * Принимает массив ID ингредиентов.
 * Требует авторизации (используется fetchWithRefresh).
 * Возвращает данные созданного заказа.
 */
export const orderBurgerApi = (data: string[]) =>
  fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit,
    body: JSON.stringify({
      ingredients: data
    })
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
  });

/**
 * Тип ответа при получении заказа по его номеру.
 */
type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

/**
 * Получение заказа по номеру (не требует авторизации).
 * Возвращает объект с массивом заказов (обычно один заказ).
 */
export const getOrderByNumberApi = (number: number) =>
  fetch(`${URL}/orders/${number}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => checkResponse<TOrderResponse>(res));

/**
 * Тип данных для регистрации нового пользователя.
 */
export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

/**
 * Тип ответа при авторизации/регистрации (содержит токены и данные пользователя).
 */
type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

/**
 * Регистрация нового пользователя (POST /auth/register).
 * При успехе возвращает токены и данные пользователя.
 */
export const registerUserApi = (data: TRegisterData) =>
  fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

/**
 * Тип данных для входа пользователя.
 */
export type TLoginData = {
  email: string;
  password: string;
};

/**
 * Вход пользователя (POST /auth/login).
 * При успехе возвращает токены и данные пользователя.
 */
export const loginUserApi = (data: TLoginData) =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

/**
 * Запрос на восстановление пароля (отправка email).
 * Возвращает успешный ответ без дополнительных данных.
 */
export const forgotPasswordApi = (data: { email: string }) =>
  fetch(`${URL}/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

/**
 * Сброс пароля с использованием кода подтверждения (token).
 * Принимает новый пароль и токен из письма.
 * Возвращает успешный ответ.
 */
export const resetPasswordApi = (data: { password: string; token: string }) =>
  fetch(`${URL}/password-reset/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

/**
 * Тип ответа при получении/обновлении данных пользователя.
 */
type TUserResponse = TServerResponse<{ user: TUser }>;

/**
 * Получение данных текущего пользователя (GET /auth/user).
 * Требует авторизации, использует fetchWithRefresh.
 * Возвращает данные пользователя.
 */
export const getUserApi = () =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    headers: {
      authorization: getCookie('accessToken')
    } as HeadersInit
  });

/**
 * Обновление данных пользователя (PATCH /auth/user).
 * Принимает частичные данные (email, name, password).
 * Требует авторизации, использует fetchWithRefresh.
 * Возвращает обновлённые данные пользователя.
 */
export const updateUserApi = (user: Partial<TRegisterData>) =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken')
    } as HeadersInit,
    body: JSON.stringify(user)
  });

/**
 * Выход пользователя (POST /auth/logout).
 * Отправляет текущий refreshToken, чтобы сервер аннулировал его.
 * Возвращает успешный ответ.
 */
export const logoutApi = () =>
  fetch(`${URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  }).then((res) => checkResponse<TServerResponse<{}>>(res));
