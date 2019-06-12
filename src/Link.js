import React, { Component } from 'react';
import { withNavigation, NavigationActions } from '@react-navigation/core';
import queryString from 'query-string';

const getTopNavigation = navigation => {
  const parent = navigation.dangerouslyGetParent();
  if (parent) {
    return getTopNavigation(parent);
  }
  return navigation;
};

class LinkWithNavigation extends Component {
  render() {
    const {
      children,
      params,
      routeName,
      routeKey,
      navigation,
      action,
    } = this.props;
    const topNavigation = getTopNavigation(navigation);
    const topRouter = topNavigation.router;
    const navAction =
      action ||
      NavigationActions.navigate({
        routeName,
        key: routeKey,
        params,
      });
    if (!action && !routeName && !routeKey) {
      throw new Error(
        'Must provide a routeName, routeKey, or a navigation action prop to <Link>'
      );
    }
    if (action && routeKey) {
      throw new Error(
        'Cannot specify a conflicting "routeKey" and a navigation "action" prop. Either use routeName with routeKey to specify a navigate action, or provide the specific navigation "action" prop.'
      );
    }
    if (action && routeName) {
      throw new Error(
        'Cannot specify a conflicting "routeName" and a navigation "action" prop. Either use routeName with routeKey to specify a navigate action, or provide the specific navigation "action" prop.'
      );
    }
    const navActionResponse = topRouter.getStateForAction(
      navAction,
      topNavigation.state
    );
    const nextState =
      navActionResponse === null ? topNavigation.state : navActionResponse;
    const pathAndParams = topRouter.getPathAndParamsForState(nextState);
    const href = Object.keys(pathAndParams.params).length
      ? `/${pathAndParams.path}?${queryString.stringify(pathAndParams.params)}`
      : `/${pathAndParams.path}`;
    return (
      <a
        href={href}
        onClick={e => {
          navigation.dispatch(navAction);
          e.preventDefault();
        }}
      >
        {children}
      </a>
    );
  }
}
const Link = withNavigation(LinkWithNavigation);

export default Link;
