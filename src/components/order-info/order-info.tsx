import { FC, useMemo, useEffect } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useSelector, useDispatch } from '../../services/store';
import { getIngredientsSelector } from '../../services/slices/ingredientsSlice';
import { useParams } from 'react-router-dom';
import {
  getOrderByNumber,
  getOrderByNumberSelector,
  clearOrderState
} from '../../services/slices/orderSlice';

export const OrderInfo: FC = () => {
  /** TODO: взять переменные orderData и ingredients из стора */
  const dispatch = useDispatch();
  const ingredientsState = useSelector(getIngredientsSelector);
  const { order, loading, error } = useSelector(getOrderByNumberSelector);
  const { number } = useParams<string>();
  const numberOfOrder = Number(number);

  const orderData = order;

  useEffect(() => {
    dispatch(getOrderByNumber(numberOfOrder));

    return () => {
      dispatch(clearOrderState());
    };
  }, [dispatch, numberOfOrder]);

  const ingredients: TIngredient[] = ingredientsState.data;

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (loading || !orderInfo) {
    return <Preloader />;
  }

  if (error) {
    return <div className={'text text_type_main-medium pt-4'}>{error}</div>;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
