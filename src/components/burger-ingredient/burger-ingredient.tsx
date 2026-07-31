import { FC, memo } from 'react';
import { useLocation } from 'react-router-dom';

import { BurgerIngredientUI } from '@ui';
import { TBurgerIngredientProps } from './type';

import { useDispatch, useSelector } from '../../services/store';
import {
  addIngredient,
  setBun,
  getConstructorSelector
} from '../../services/slices/constructorSlice';

export const BurgerIngredient: FC<TBurgerIngredientProps> = memo(
  ({ ingredient, count }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const burgerBun = useSelector(getConstructorSelector).bun;
    const burgerMain = useSelector(getConstructorSelector).ingredients;

    const getCount = () => {
      if (ingredient.type === 'bun') {
        return burgerBun && ingredient._id === burgerBun._id ? 2 : 0;
      }
      const ingredientGroup = burgerMain.filter(
        (item) => item._id === ingredient._id
      );
      return ingredientGroup.length;
    };
    count = getCount();

    const handleAdd = () => {
      if (ingredient.type === 'bun') {
        dispatch(setBun(ingredient));
      } else {
        dispatch(addIngredient(ingredient));
      }
    };

    return (
      <BurgerIngredientUI
        ingredient={ingredient}
        count={count}
        locationState={{ background: location }}
        handleAdd={handleAdd}
      />
    );
  }
);
