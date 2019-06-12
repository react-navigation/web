/* eslint-env browser */

import {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from 'history';
import React from 'react';
import {
  NavigationActions,
  getNavigation,
  NavigationProvider,
} from '@react-navigation/core';

/* eslint-disable import/no-commonjs */
const queryString = require('query-string');

const getPathAndParamsFromLocation = location => {
  const path = encodeURI(location.pathname.substr(1));
  const params = queryString.parse(location.search);
  return { path, params };
};

const matchPathAndParams = (a, b) => {
  if (a.path !== b.path) {
    return false;
  }
  if (queryString.stringify(a.params) !== queryString.stringify(b.params)) {
    return false;
  }
  return true;
};

function getHistory(history) {
  if (typeof history === 'string') {
    switch (history) {
      case 'browser':
        return createBrowserHistory();
      case 'hash':
        return createHashHistory();
      case 'memory':
        return createMemoryHistory();
      default:
        throw new Error(
          '@react-navigation/web: createBrowserApp() Invalid value for options.history ' +
            history
        );
    }
  }
  return history || createBrowserHistory();
}

export default function createBrowserApp(App, { history: historyOption } = {}) {
  const history = getHistory(historyOption);
  let currentPathAndParams = getPathAndParamsFromLocation(history.location);
  const initAction =
    App.router.getActionForPathAndParams(
      currentPathAndParams.path,
      currentPathAndParams.params
    ) || NavigationActions.init();

  const setHistoryListener = dispatch => {
    history.listen(location => {
      const pathAndParams = getPathAndParamsFromLocation(location);
      if (matchPathAndParams(pathAndParams, currentPathAndParams)) {
        return;
      }
      currentPathAndParams = pathAndParams;
      const action = App.router.getActionForPathAndParams(
        pathAndParams.path,
        pathAndParams.params
      );
      if (action) {
        dispatch(action);
      } else {
        dispatch(initAction);
      }
    });
  };

  class WebApp extends React.Component {
    state = { nav: App.router.getStateForAction(initAction) };
    _title = document.title;
    _actionEventSubscribers = new Set();
    componentDidMount() {
      setHistoryListener(this.dispatch);
      this.updateTitle();
      this._actionEventSubscribers.forEach(subscriber =>
        subscriber({
          type: 'action',
          action: initAction,
          state: this.state.nav,
          lastState: null,
        })
      );
    }
    componentDidUpdate() {
      this.updateTitle();
    }
    updateTitle() {
      const { state } = this._navigation;
      const childKey = state.routes[state.index].key;
      const activeNav = this._navigation.getChildNavigation(childKey);
      const opts = App.router.getScreenOptions(activeNav);
      this._title = opts.title || opts.headerTitle;
      if (this._title) {
        document.title = this._title;
      }
    }

    _onNavigationStateChange(prevNav, nav, action) {
      if (typeof this.props.onNavigationStateChange === 'function') {
        this.props.onNavigationStateChange(prevNav, nav, action);
      }
    }

    render() {
      this._navigation = getNavigation(
        App.router,
        this.state.nav,
        this.dispatch,
        this._actionEventSubscribers,
        () => this.props.screenProps,
        () => this._navigation
      );
      return (
        <NavigationProvider value={this._navigation}>
          <App {...this.props} navigation={this._navigation} />
        </NavigationProvider>
      );
    }
    dispatch = action => {
      const lastState = this.state.nav;
      const newState = App.router.getStateForAction(action, lastState);
      const dispatchEvents = () =>
        this._actionEventSubscribers.forEach(subscriber =>
          subscriber({
            type: 'action',
            action,
            state: newState,
            lastState,
          })
        );
      if (newState && newState !== lastState) {
        this.setState({ nav: newState }, () => {
          this._onNavigationStateChange(lastState, newState, action);
          dispatchEvents();
        });
        const pathAndParams =
          App.router.getPathAndParamsForState &&
          App.router.getPathAndParamsForState(newState);
        if (
          pathAndParams &&
          !matchPathAndParams(pathAndParams, currentPathAndParams)
        ) {
          currentPathAndParams = pathAndParams;
          history.push(
            `/${pathAndParams.path}?${queryString.stringify(
              pathAndParams.params
            )}`
          );
        }
      } else {
        dispatchEvents();
      }
    };
  }
  return WebApp;
}
