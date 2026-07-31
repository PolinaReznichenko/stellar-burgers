import { describe, expect, test, jest } from '@jest/globals';
import ingredientsReducer, {
  initialState,
  getIngredients
} from '../ingredientsSlice';
import { getIngredientsApi } from '../../../utils/burger-api';
import { configureStore } from '@reduxjs/toolkit';

const expectedIngredients = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0947',
    name: 'Плоды Фалленианского дерева',
    type: 'main',
    proteins: 20,
    fat: 5,
    carbohydrates: 55,
    calories: 77,
    price: 874,
    image: 'https://code.s3.yandex.net/react/code/sp_1.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sp_1-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sp_1-large.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa094a',
    name: 'Сыр с астероидной плесенью',
    type: 'main',
    proteins: 84,
    fat: 48,
    carbohydrates: 420,
    calories: 3377,
    price: 4142,
    image: 'https://code.s3.yandex.net/react/code/cheese.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/cheese-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/cheese-large.png'
  }
];

//Мокируем модуль и ставим заглушку на функцию получения ингредиентов
jest.mock('../../../utils/burger-api', () => ({
  getIngredientsApi: jest.fn()
}));
//Мокируем функцию getIngredientsApi
const getIngredientsApiMock = jest.mocked(getIngredientsApi);

describe('Тест редьюсера слайса [ingredientsSlice]', () => {
  test('Тестируем несуществующий в приложении экшен', () => {
    //Создаем экшен с несуществующим типом
    const action = { type: 'UNKNOWN' };
    //Передаем экшен с редьюсер
    const falseState = ingredientsReducer(undefined, action);
    //Проверяем, что новое состояние равно текущему, т.е. экшен не изменил состояние редьюсера
    expect(falseState).toEqual(initialState);
  });

  test('Загружаем ингредиенты через асинхронный thunk', async () => {
    //Настраиваем нужные данные для мока
    getIngredientsApiMock.mockResolvedValue(expectedIngredients);
    //Создаем отдельный стор для теста
    const store = configureStore({
      reducer: { ingredients: ingredientsReducer }
    });
    //Ожидаем завершения выполнения асинхронного экшена
    await store.dispatch(getIngredients());
    //Получаем данные из состояния
    const { data } = store.getState().ingredients;
    //Проверяем, что данные в состоянии идентичны полученным
    expect(data).toEqual(expectedIngredients);
    //Проверяем, что функция запроса была вызвана только один раз
    expect(getIngredientsApiMock).toHaveBeenCalledTimes(1);
  });

  describe('Тестируем работу редьюсера при обработке асинхронных экшенов', () => {
    test('Обрабатываем экшен типа *.pending', () => {
      //Создаем объект экшена
      const action = { type: getIngredients.pending.type };
      //Получаем новое состояние путем передачи экшена и начального состояния в редьюсер
      const ingredientsLoad = ingredientsReducer(initialState, action);
      //Проверяем, что нет ошибок и данные загружаются
      expect(ingredientsLoad.loading).toBe(true);
      expect(ingredientsLoad.error).toBeNull();
    });

    test('Обрабатываем экшен типа *.fulfilled', () => {
      const action = {
        type: getIngredients.fulfilled.type,
        payload: expectedIngredients
      };

      const ingredientsFulfilled = ingredientsReducer(initialState, action);
      //Проверяем, что нет загрузки и загрузились правильные данные
      expect(ingredientsFulfilled.loading).toBe(false);
      expect(ingredientsFulfilled.data).toEqual(expectedIngredients);
    });

    test('Обрабатываем экшен типа *.rejected', () => {
      const action = {
        type: getIngredients.rejected.type,
        error: { message: 'Ошибка загрузки ингредиентов бургера' }
      };

      const ingredientsRejected = ingredientsReducer(initialState, action);
      //Проверяем, что нет загрузки и выводится сообщение об ошибке
      expect(ingredientsRejected.loading).toBe(false);
      expect(ingredientsRejected.error).toBe(
        'Ошибка загрузки ингредиентов бургера'
      );
    });
  });
});
