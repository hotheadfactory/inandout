import React, {Component} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import Daily from './Report/Daily'
import Month from './Report/Month'
import { createAppContainer, createMaterialTopTabNavigator } from 'react-navigation';

const AppTabNavigaotor = createMaterialTopTabNavigator({
    Daily: {screen:Daily},
    Month: {screen:Month}
});

const AppTabContainet = createAppContainer(AppTabNavigaotor)

export default class Application extends Component{
    render() {
        return <AppTabContainet/>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    }
})
