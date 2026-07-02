import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useSelector, useDispatch } from '../../services/store';
import {
  newOrderSelector,
  postOrderBurger,
  clearNewOrderState
} from '../../services/slices/makeNewOrderSlice';
import {
  clearConstructor,
  getConstructorSelector
} from '../../services/slices/constructorSlice';
import { getUserSelector } from '../../services/slices/userSlice';
import { useNavigate } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  /** TODO: взять переменные constructorItems, orderRequest и orderModalData из стора */
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const constructorItems = useSelector(getConstructorSelector);
  const { loading, order, error } = useSelector(newOrderSelector);
  const { user } = useSelector(getUserSelector);

  const orderRequest = loading;

  const orderModalData = order;

  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;
    if (user) {
      const ingredientsId: string[] = [
        ...constructorItems.ingredients.map((ing) => ing._id),
        constructorItems.bun._id
      ];
      dispatch(postOrderBurger(ingredientsId));
    } else {
      navigate('/login');
    }
  };

  const closeOrderModal = () => {
    dispatch(clearNewOrderState());
    if (order) {
      dispatch(clearConstructor());
    }
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
      error={error}
    />
  );
};
