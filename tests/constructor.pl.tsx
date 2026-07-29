import { test, expect } from '@playwright/test';

test.describe('Интеграционные тесты для страницы конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    //Загружаются ингредиенты из записанного HAR-файла (перехватываем запрос на получение ингредиентов)
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false, // режим воспроизведения
      notFound: 'abort' // любой не перехваченный запрос упадёт
    });

    await page.goto('/');
    //Проверяем, что ингредиенты загрузились
    await expect(page.getByTestId('ingredients-list')).toBeVisible();
  });

  test.describe('Добавление ингредиентов из списка в конструктор', () => {
    test('Добавляются булки в конструктор', async ({ page }) => {
      const bunItem = page
        .getByTestId('burger-ingredient')
        .filter({ hasText: 'Флюоресцентная булка R2-D3' });

      const topBunConstructor = page.getByTestId('top-bun');
      const bottomBunConstructor = page.getByTestId('bottom-bun');

      //Проверяем, что булок нет
      await expect(topBunConstructor).not.toBeVisible();
      await expect(bottomBunConstructor).not.toBeVisible();

      //кликаем на кнопку "Добавить" булки
      await bunItem.locator('button:has-text("Добавить")').click();

      //Проверяем, что булка добавляется на верх и низ бургера
      await expect(topBunConstructor).toBeVisible();
      await expect(bottomBunConstructor).toBeVisible();
      //Проверяем, что добавляется именно нажатая булка на верх и низ бургера
      await expect(topBunConstructor).toContainText(
        'Флюоресцентная булка R2-D3'
      );
      await expect(bottomBunConstructor).toContainText(
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

      const ingredientInConstructor = page
        .getByTestId('burger-constructor-ingredient')
        .filter({ hasText: 'Мясо бессмертных моллюсков Protostomia' });
      const sauceInConstructor = page
        .getByTestId('burger-constructor-ingredient')
        .filter({ hasText: 'Соус традиционный галактический' });

      //Проверяем, что начинки нет
      await expect(ingredientInConstructor).not.toBeVisible();
      await expect(sauceInConstructor).not.toBeVisible();

      //кликаем на кнопку "Добавить" ингредиентов
      await ingredientItem.locator('button:has-text("Добавить")').click();
      await sauceItem.locator('button:has-text("Добавить")').click();

      //Проверяем, что начинки добавляются в конструктор
      await expect(ingredientInConstructor).toBeVisible();
      await expect(sauceInConstructor).toBeVisible();
      //Проверяем, что добавляются именно нажатые начинки
      await expect(ingredientInConstructor).toContainText(
        'Мясо бессмертных моллюсков Protostomia'
      );
      await expect(sauceInConstructor).toContainText(
        'Соус традиционный галактический'
      );
    });
  });

  test.describe('Корректность работы модальных окон', () => {
    test('Открывается модальное окно ингредиента', async ({ page }) => {
      const ingredientModal = page.getByTestId('modal');
      const ingredientCard = page
        .getByTestId('burger-ingredient')
        .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });

      //Проверяем, что модалки нет в DOM
      await expect(ingredientModal).not.toBeAttached();
      //Кликаем по карточке ингредиента
      await ingredientCard.getByRole('link').click();
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

        //Проверяем, что модалки нет в DOM
        await expect(modal).not.toBeAttached();
        //Кликаем по карточке ингредиента
        await ingredientCard.getByRole('link').click();
        //Проверяем, что модальное окно находится в DOM и оно открыто
        await expect(modal).toBeAttached();
        await expect(modal).toBeVisible();
      });

      test('Закрывается модальное окно по клику на крестик', async ({
        page
      }) => {
        const modal = page.getByTestId('modal');

        //Клик на крестик
        await page.getByTestId('close-modal-button').click();
        //Проверяем, что модалки не видно и нет в DOM
        await expect(modal).not.toBeVisible();
        await expect(modal).not.toBeAttached();
      });

      test('Закрывается модальное окно по клику на оверлей', async ({
        page
      }) => {
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
    test.beforeEach(async ({ context, page }) => {
      //Мокирование Cookies (подставляются моковые токены авторизации)
      await context.addCookies([
        {
          name: 'accessToken',
          value: 'fake-access-token',
          domain: 'localhost',
          path: '/'
        }
      ]);
      //Мокирование LocalStorage (подставляются моковые токены авторизации)
      await page.addInitScript(() => {
        localStorage.setItem('refreshToken', 'fake-refresh-token');
      });

      //Перехватываем запрос на получение данных пользователя (создаем моковые данные ответа на запрос)
      await page.routeFromHAR('tests/hars/user.har', {
        url: '**/api/auth/user',
        update: false, // режим воспроизведения
        notFound: 'abort'
      });

      //Обновляем страницу, чтобы произошел запрос пользователя и применились фейк токены
      await page.reload();
      await expect(page.getByTestId('ingredients-list')).toBeVisible();
    });

    test.afterEach(async ({ page }) => {
      //Очищаем localStorage и куки
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.context().clearCookies();
    });

    test('Полный процесс сборки бургера с оформлением заказа', async ({
      page
    }) => {
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

      // //Перехватываем запрос и создаем моковые данные ответа на запрос создания заказа
      await page.routeFromHAR('tests/hars/order.har', {
        url: '**/api/orders',
        update: false, // режим воспроизведения
        notFound: 'abort'
      });

      //Вызывается клик по кнопке «Оформить заказ»
      await page.getByTestId('order-button').click();

      //Проверяем, что появилось модальное окно с данными заказа и номер заказа верный
      const modal = page.getByTestId('modal');
      const orderNumber = '108504';

      await expect(modal).toBeAttached({ timeout: 10000 });
      await expect(modal.getByText(/идентификатор заказа/i)).toBeVisible();
      await expect(modal).toContainText(orderNumber);

      //Проверяем, что конструктор пуст после закрытия модального окна
      //Клик на крестик
      await page.getByTestId('close-modal-button').click();
      //Проверяем, что закрывается модальное окно и его нет в DOM (проверяется успешность закрытия)
      await expect(modal).not.toBeVisible();
      await expect(modal).not.toBeAttached();
      //Проверяем, что выбранные ингредиенты не видны
      const noTopBunConstructor = page.getByTestId('no-top-bun');
      const noBottomBunConstructor = page.getByTestId('no-bottom-bun');
      const noIngredientsInConstructor = page.getByTestId('no-ingredients');

      await expect(noTopBunConstructor).toBeVisible();
      await expect(noBottomBunConstructor).toBeVisible();
      await expect(noIngredientsInConstructor).toBeVisible();
    });
  });
});
