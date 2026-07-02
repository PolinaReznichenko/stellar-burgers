import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { getFeedsSelector, getFeeds } from '../../services/slices/feedsSlice';

export const Feed: FC = () => {
  /** TODO: взять переменную из стора */
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(getFeedsSelector);

  useEffect(() => {
    dispatch(getFeeds());
  }, [dispatch]);

  const handleUpdateOrders = () => {
    dispatch(getFeeds());
  };

  if (error) {
    return <div className={'text text_type_main-medium pt-4'}>{error}</div>;
  }

  if (loading || !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleUpdateOrders} />;
};
