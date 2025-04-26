
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

// wrapper for class components to get access to router props
export const withRouter = (Component) => {
  function ComponentWithRouterProps(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
      <Component
        {...props}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  }
  return ComponentWithRouterProps;
};