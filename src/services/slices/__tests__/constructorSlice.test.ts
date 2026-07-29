import { describe, expect, test } from '@jest/globals';
import constructorReducer, {
  initialState,
  addIngredient,
  setBun,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../constructorSlice';

const ingredientInConstructor = {
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
};

const bunInConstructor = {
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
};

const constructorIngredients = [
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
    image_large: 'https://code.s3.yandex.net/react/code/sp_1-large.png',
    id: '111'
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
    image_large: 'https://code.s3.yandex.net/react/code/cheese-large.png',
    id: '222'
  }
];

describe('Тест редьюсера слайса [constructorSlice]', () => {
  test('Тестируем несуществующий в приложении экшен', () => {
    //Создаем экшен с несуществующим типом
    const action = { type: 'UNKNOWN' };
    //Передаем экшен с редьюсер
    const falseState = constructorReducer(undefined, action);
    //Проверяем, что новое состояние равно текущему, т.е. экшен не изменил состояние редьюсера
    expect(falseState).toEqual(initialState);
  });

  test('Добавляется новый ингредиент', () => {
    //Добавляем новый ингредиент в конструктор с помощью экшена addIngredient
    const addNewIngredient = constructorReducer(
      { ...initialState },
      addIngredient({
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
      })
    );

    //Проверяем, что массив ингредиентов конструктора равен 1
    expect(addNewIngredient.ingredients.length).toBe(1);
    //Проверяем, что в массиве есть объект с ожидаемыми полями
    expect(addNewIngredient.ingredients[0]).toEqual(
      expect.objectContaining(ingredientInConstructor)
    );
  });

  test('Добавляется булка', () => {
    //Добавляем булку в конструктор с помощью экшена setBun
    const addBun = constructorReducer(
      { ...initialState },
      setBun({
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
      })
    );

    //Проверяем, что в конструкторе есть объект с ожидаемыми полями
    expect(addBun.bun).toEqual(bunInConstructor);
  });

  test('Удаляется ингредиент', () => {
    //Инициализация начального состояния теста на основе исходного состояния
    const initialConstructorState = {
      ...initialState,
      ingredients: [
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
          image_mobile:
            'https://code.s3.yandex.net/react/code/cheese-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/cheese-large.png',
          id: '111'
        }
      ]
    };

    //Удаляем ингредиеент из конструктора с помощью экшена removeIngredient
    const deleteIngredient = constructorReducer(
      initialConstructorState,
      removeIngredient('111')
    );

    //Проверяем, что ингредиент удалился
    expect(deleteIngredient.ingredients.length).toBe(0);
  });

  test('Сортируются ингредиенты (кроме булок)', () => {
    //Инициализация начального состояния теста на основе исходного состояния
    const initialConstructorState = {
      ...initialState,
      ingredients: [
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
          image_mobile:
            'https://code.s3.yandex.net/react/code/cheese-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/cheese-large.png',
          id: '222'
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
          image_large: 'https://code.s3.yandex.net/react/code/sp_1-large.png',
          id: '111'
        }
      ]
    };

    //Сортируем ингредиеенты в конструкторе с помощью экшена moveIngredient
    const moveIngredients = constructorReducer(
      initialConstructorState,
      moveIngredient({ from: 1, to: 0 })
    );

    //Проверяем, что ингредиент с индексом [1] стал первым элементом в массиве
    expect(moveIngredients.ingredients).toEqual(constructorIngredients);
  });

  test('Очищается конструктор бургера', () => {
    //Инициализация начального состояния теста на основе исходного состояния
    const initialConstructorState = {
      ...initialState,
      bun: bunInConstructor,
      ingredients: constructorIngredients
    };

    //Очищаем конструктор с помощью экшена clearConstructor
    const clearBurgerConstructor = constructorReducer(
      initialConstructorState,
      clearConstructor()
    );

    //Проверяем, что конструктор пуст
    expect(clearBurgerConstructor).toEqual(initialState);
  });
});
