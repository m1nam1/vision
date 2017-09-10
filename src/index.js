import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Scene, Router } from 'react-native-router-flux';

import Main from './Main';
import Settings from './Settings';

const isAndroid = Platform.OS === 'android'; // bool

export default class Vision extends Component {
    render() {
        return (
            <Router hideNavBar>
                <Scene key="root">
                    <Scene key="main" component={Main} title="Main" initial />
                    <Scene key="settings" component={Settings} title="Settings" hideNavBar={isAndroid} />
                </Scene>
            </Router>
        );
    }
}
