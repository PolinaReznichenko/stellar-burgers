import { TOrder } from '@utils-types';
import { TNewOrder } from '../../../utils/burger-api';

export type BurgerConstructorUIProps = {
  constructorItems: any;
  orderRequest: boolean;
  price: number;
  orderModalData: TNewOrder | null;
  onOrderClick: () => void;
  closeOrderModal: () => void;
  error?: string | null;
};
