import { test, expect } from '@playwright/test';

test('Загружаются ингредиенты из записанного HAR-файла', async ({ page }) => {
  //перехватываем запрос на получение ингредиентов
  await page.routeFromHAR('tests/hars/ingredients.har', {
    url: '**/api/ingredients',
    update: false // режим воспроизведения
  });

  await page.goto('/');
  //Проверяем, что ингредиенты загрузились
  await expect(page.getByTestId('ingredients-list')).toBeVisible();
});

test.describe('Добавление ингредиентов из списка в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="ingredients-list"]');
  });

  test('Добавляются булки в конструктор', async ({ page }) => {
    const bunItem = page
      .getByTestId('burger-ingredient')
      .filter({ hasText: 'Флюоресцентная булка R2-D3' });
    const addButton = bunItem.locator('button:has-text("Добавить")');

    const topBunConsctructor = page.getByTestId('top-bun');
    const bottomBunConsctructor = page.getByTestId('bottom-bun');

    //Проверяем, что булок нет
    await expect(topBunConsctructor).not.toBeVisible();
    await expect(bottomBunConsctructor).not.toBeVisible();

    //кликаем на кнопку "Добавить" булки
    await addButton.click();

    //Проверяем, что булка добавляется на верх и низ бургера
    await expect(topBunConsctructor).toBeVisible();
    await expect(bottomBunConsctructor).toBeVisible();
    //Проверяем, что добавляется именно нажатая булка на верх и низ бургера
    await expect(topBunConsctructor).toContainText(
      'Флюоресцентная булка R2-D3'
    );
    await expect(bottomBunConsctructor).toContainText(
      'Флюоресцентная булка R2-D3'
    );
  });

  test('Добавляются начинки в конструктор', async ({ page }) => {
    const ingredientItem = page
      .getByTestId('burger-ingredient')
      .filter({ hasText: 'Мясо бессмертных моллюсков Protostomia' });
    const sauceItem = page
      .getByTestId('burger-ingredient')
      .filter({ hasText: 'Соус традиционный галактический' });
    const ingredientItemButton = ingredientItem.locator(
      'button:has-text("Добавить")'
    );
    const sauceItemButton = sauceItem.locator('button:has-text("Добавить")');

    const ingredientInConsctructor = page
      .getByTestId('burger-constructor-ingredient')
      .filter({ hasText: 'Мясо бессмертных моллюсков Protostomia' });
    const sauceInConsctructor = page
      .getByTestId('burger-constructor-ingredient')
      .filter({ hasText: 'Соус традиционный галактический' });

    //Проверяем, что начинки нет
    await expect(ingredientInConsctructor).not.toBeVisible();
    await expect(sauceInConsctructor).not.toBeVisible();

    //кликаем на кнопку "Добавить" ингредиентов
    await ingredientItemButton.click();
    await sauceItemButton.click();

    //Проверяем, что начинки добавляются в конструктор
    await expect(ingredientInConsctructor).toBeVisible();
    await expect(sauceInConsctructor).toBeVisible();
    //Проверяем, что добавляются именно нажатые начинки
    await expect(ingredientInConsctructor).toContainText(
      'Мясо бессмертных моллюсков Protostomia'
    );
    await expect(sauceInConsctructor).toContainText(
      'Соус традиционный галактический'
    );
  });
});

test.describe('Корректность работы модальных окон', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="ingredients-list"]');
  });

  test('Открывается модальное окно ингредиента', async ({ page }) => {
    const ingredientModal = page.getByTestId('modal');
    const ingredientCard = page
      .getByTestId('burger-ingredient')
      .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });
    const cardLink = ingredientCard.getByRole('link');

    //Проверяем, что модалки нет в DOM
    await expect(ingredientModal).not.toBeAttached();
    //Кликаем по карточке ингредиента
    await cardLink.click();
    //Проверяем, что модальное окно появилось в DOM и его видно
    await expect(ingredientModal).toBeAttached();
    await expect(ingredientModal).toBeVisible();
    //Проверяем, что отображается в модалке выбранный ингредиент
    await expect(ingredientModal).toContainText(
      'Филе Люминесцентного тетраодонтимформа'
    );
  });

  test.describe('Закрытие модального окна', () => {
    test.beforeEach(async ({ page }) => {
      const modal = page.getByTestId('modal');
      const ingredientCard = page
        .getByTestId('burger-ingredient')
        .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });
      const cardLink = ingredientCard.getByRole('link');
      //Проверяем, что модалки нет в DOM
      await expect(modal).not.toBeAttached();
      //Кликаем по карточке ингредиента
      await cardLink.click();
      //Проверяем, что модальное окно находится в DOM и оно открыто
      await expect(modal).toBeAttached();
      await expect(modal).toBeVisible();
    });

    test('Закрывается модальное окно по клику на крестик', async ({ page }) => {
      const modal = page.getByTestId('modal');
      const closeButton = page.getByTestId('close-modal-button');
      //Клик на крестик
      await closeButton.click();
      //Проверяем, что модалки не видно и нет в DOM
      await expect(modal).not.toBeVisible();
      await expect(modal).not.toBeAttached();
    });

    test('Закрывается модальное окно по клику на оверлей', async ({ page }) => {
      const modal = page.getByTestId('modal');
      const modalOverlay = page.getByTestId('modal-overlay');
      //Клик на оверлэй
      await modalOverlay.click({ position: { x: 10, y: 10 }, force: true });
      //Проверяем, что модалки не видно и нет в DOM
      await expect(modal).not.toBeAttached();
      await expect(modal).not.toBeVisible();
    });
  });
});

test.describe('Создание заказа в конструкторе бургера', () => {
  test.beforeEach(async ({ request, context, page }) => {
    //Отправляем запрос на логин пользователя через API
    const loginResponse = await request.post('https://norma.education-services.ru/api/auth/login', {
        data: {
            email: 'polina@yandex.ru',
            password: '12345',
        }
    });
    //Проверяем, что ответ успешный
    expect(loginResponse.ok()).toBeTruthy();
    //Получаем токены
    const {accessToken, refreshToken} = await loginResponse.json();

    //Мокирование Cookies (подставляются моковые токены авторизации)
    await context.addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/'
      }
    ]);
    //Мокирование LocalStorage (подставляются моковые токены авторизации)
    await page.addInitScript((token) => {
      localStorage.setItem('refreshToken', token);
    }, refreshToken);

    //Перехватываем запрос на получение данных пользователя (создаем моковые данные ответа на запрос)
    await page.routeFromHAR('tests/hars/user.har', {
      url: '**/api/auth/user',
      update: false // режим воспроизведения
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="ingredients-list"]');
  });

  //Очищаем localStorage и куки
  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
        localStorage.clear();
    });
    await page.context().clearCookies();
  });


  test('Полный процесс сборки бургера с оформлением заказа', async ({page}) => {
    const bunItem = page
      .getByTestId('burger-ingredient')
      .filter({ hasText: 'Флюоресцентная булка R2-D3' });
    const ingredientItem = page
      .getByTestId('burger-ingredient')
      .filter({ hasText: 'Мясо бессмертных моллюсков Protostomia' });
    const sauceItem = page
      .getByTestId('burger-ingredient')
      .filter({ hasText: 'Соус традиционный галактический' });

    //Кликаем по кнопкам "добавить" выбранных ингредиентов 
    await bunItem.locator('button:has-text("Добавить")').click();
    await ingredientItem.locator('button:has-text("Добавить")').click();
    await sauceItem.locator('button:has-text("Добавить")').click();

    //Перехватываем запрос и создаем моковые данные ответа на запрос создания заказа
    await page.routeFromHAR('tests/hars/order.har', {
      url: '**/api/orders',
      update: false // режим воспроизведения
    });

    //Вызывается клик по кнопке «Оформить заказ»
     await page.getByTestId('order-button').click();

    //Ждем ответ от сервера, чтобы данные о заказе сохранились
    const response = await page.waitForResponse(
        response => response.url().includes('/api/orders') && response.status() === 200
    );

    //Проверяем, что появилось модальное окно с данными заказа и номер заказа верный
    const modal = page.getByTestId('modal');
    const { order } = await response.json();

    await expect(modal).toBeAttached();
    await expect(modal.getByText(/идентификатор заказа/i)).toBeVisible();
    await expect(modal).toContainText(String(order.number));

    //Проверяем, что конструктор пуст после закрытия модального окна
    //Клик на крестик
    await page.getByTestId('close-modal-button').click();
    //Проверяем, что закрывается модальное окно и его нет в DOM (проверяется успешность закрытия)
    await expect(modal).not.toBeVisible();
    await expect(modal).not.toBeAttached();
    //Проверяем, что выбранные ингредиенты не видны
    const noTopBunConsctructor = page.getByTestId('no-top-bun');
    const noBottomBunConsctructor = page.getByTestId('no-bottom-bun');
    const noIngredientsInConsctructor = page.getByTestId('no-ingredients');
    await expect(noTopBunConsctructor).toBeVisible();
    await expect(noBottomBunConsctructor).toBeVisible();
    await expect(noIngredientsInConsctructor).toBeVisible();
  });
});
