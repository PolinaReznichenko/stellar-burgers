import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { getUserSelector } from '../../services/slices/userSlice';
import { Preloader } from '../ui/preloader';

type ProtectedRouteProps = {
  children: React.ReactElement;
  onlyUnAuth?: boolean;
};

export const ProtectedRoute = ({
  children,
  onlyUnAuth
}: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthChecked = useSelector(getUserSelector).isAuthChecked;
  const isLoading = useSelector(getUserSelector).userRequest;
  const user = useSelector(getUserSelector).user;

  if (!isAuthChecked || isLoading) {
    return <Preloader />;
  }

  // если маршрут для авторизованного пользователя, но пользователь не авторизован, то делаем редирект
  if (!onlyUnAuth && !user) {
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  // если маршрут для неавторизованного пользователя, но пользователь авторизован
  if (onlyUnAuth && user) {
    const from = location.state?.from || { pathname: '/' };
    return <Navigate replace to={from} />;
  }

  return children;
};
