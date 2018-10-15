import React, { Component } from 'react';
import renderer from 'react-test-renderer';
import { createSwitchNavigator } from '@react-navigation/core';
import createBrowserApp from '../createBrowserApp';

class HomeScreen extends Component {
  static navigationOptions = () => ({
    title: 'Home',
  });

  render() {
    return <div>Hello Home</div>;
  }
}

class OtherScreen extends Component {
  static navigationOptions = () => ({
    title: 'Other',
  });

  render() {
    return <div>Other Screen</div>;
  }
}

jest.mock('history', () => ({
  createBrowserHistory: () => ({
    push: () => {},
    listen: () => {},
    location: {
      pathname: '/OtherScreen',
      search: '?foo=bar',
    },
  }),
}));

global.document = {
  title: 'Empty Title',
};

describe('SwitchNavigator works on web', () => {
  test('renders successfully', () => {
    const AppNavigator = createSwitchNavigator({
      HomeScreen,
      OtherScreen,
    });
    const App = createBrowserApp(AppNavigator);
    const rendered = renderer.create(<App />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
