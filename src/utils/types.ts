/**
 * Основной тип ингредиента бургера.
 * Используется для хранения данных об ингредиентах, получаемых с сервера (каталог).
 * @property _id - уникальный идентификатор ингредиента (строка)
 * @property name - название ингредиента
 * @property type - тип ингредиента: 'bun' (булка), 'sauce' (соус), 'main' (начинка)
 * @property proteins - содержание белков в граммах
 * @property fat - содержание жиров в граммах
 * @property carbohydrates - содержание углеводов в граммах
 * @property calories - калорийность (ккал)
 * @property price - цена в условных единицах
 * @property image - ссылка на маленькое изображение
 * @property image_large - ссылка на большое изображение
 * @property image_mobile - ссылка на изображение для мобильных устройств
 */
export type TIngredient = {
  _id: string;
  name: string;
  type: string;
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_large: string;
  image_mobile: string;
};

/**
 * Тип ингредиента, используемого в конструкторе бургера.
 * Расширяет TIngredient дополнительным полем id для уникальной идентификации
 * каждого экземпляра ингредиента в списке конструктора (позволяет различать одинаковые ингредиенты).
 * @property id - уникальный временный идентификатор
 */
export type TConstructorIngredient = TIngredient & {
  id: string;
};

/**
 * Тип заказа (порции) в системе.
 * Используется для представления заказа в ленте заказов и в истории пользователя.
 * @property _id - уникальный идентификатор заказа (строка)
 * @property status - статус заказа
 * @property name - название заказа
 * @property createdAt - дата и время создания заказа (строка в ISO-формате)
 * @property updatedAt - дата и время последнего обновления статуса
 * @property number - номер заказа (число, отображается пользователю)
 * @property ingredients - массив идентификаторов (_id) ингредиентов, входящих в заказ
 */
export type TOrder = {
  _id: string;
  status: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  number: number;
  ingredients: string[];
};

/**
 * Тип данных для ленты заказов (общая информация).
 * Содержит список заказов и агрегированные статистические данные.
 * @property orders - массив объектов TOrder (список заказов)
 * @property total - общее количество заказов за всё время
 * @property totalToday - количество заказов, выполненных сегодня
 */
export type TOrdersData = {
  orders: TOrder[];
  total: number;
  totalToday: number;
};

/**
 * Тип данных пользователя (аккаунт).
 * Используется для хранения информации о пользователе после авторизации.
 * @property email - электронная почта пользователя
 * @property name - имя пользователя (отображаемое имя)
 */
export type TUser = {
  email: string;
  name: string;
};

/**
 * Тип для переключения вкладок в конструкторе бургера.
 * Определяет категорию ингредиентов, отображаемую в данный момент.
 * @values 'bun' - булки, 'sauce' - соусы, 'main' - начинки (мясо, овощи и т.п.)
 */
export type TTabMode = 'bun' | 'sauce' | 'main';
