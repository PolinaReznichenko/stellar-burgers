import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

import styles from './orders-list.module.css';

import { OrdersListUIProps } from './type';
import { OrderCard } from '@components';

export const OrdersListUI: FC<OrdersListUIProps> = ({ orderByDate }) => {
  const location = useLocation();

  return (
    <div className={`${styles.content}`}>
      {orderByDate.map((order) => (
        <Link
          key={order._id}
          to={
            location.pathname === '/feed'
              ? `/feed/${order.number}`
              : `/profile/orders/${order.number}`
          }
        >
          <OrderCard order={order} />
        </Link>
      ))}
    </div>
  );
};
