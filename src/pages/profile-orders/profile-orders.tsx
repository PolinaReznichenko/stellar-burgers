import { ProfileOrdersUI } from '@ui-pages';
import { Preloader } from '@ui';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import {
  getUserOrders,
  getFeedsSelector
} from '../../services/slices/feedsSlice';

export const ProfileOrders: FC = () => {
  /** TODO: взять переменную из стора */
  const dispatch = useDispatch();
  const { loading, error } = useSelector(getFeedsSelector);

  const orders: TOrder[] = useSelector(getFeedsSelector).orders;

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  if (error) {
    return <div className={'text text_type_main-medium pt-4'}>{error}</div>;
  }

  if (loading) {
    return <Preloader />;
  }

  if (!orders.length) {
    return (
      <div className={'text text_type_main-medium pt-4'}>
        У Вас нет оформленных заказов
      </div>
    );
  }

  return <ProfileOrdersUI orders={orders} />;
};
