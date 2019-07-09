import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Icon, Container, Content} from 'native-base';
import { AntDesign } from "@expo/vector-icons";
import {EvilIcons} from "@expo/vector-icons";
import Application from './Application';
import Report from './Report'; 
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';

const AppTabNavigaotor = createBottomTabNavigator({
    Application: {screen:Application},
    Report: {screen:Report}
});

const AppTabContainet = createAppContainer(AppTabNavigaotor)

export default class MainScreen extends Component {

    static navigationOptions =  {
        headerLeft: <EvilIcons size={28} name='navicon' style={{paddingLeft:10}}/>,
        title: 'in&out',
        headerRight:<AntDesign size={28} name= 'inbox' style={{paddingRight:10}}/>
    }

    render() {
        return <AppTabContainet/>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})