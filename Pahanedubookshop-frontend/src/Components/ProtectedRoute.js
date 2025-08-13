import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ element: Element, allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && allowedRoles.includes(user.userType)) {
        return <Element />;
    }

    return <Navigate to="/" state={{ from: location }} replace />;
};

export default ProtectedRoute;
