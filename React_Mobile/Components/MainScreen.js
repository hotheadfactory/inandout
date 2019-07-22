import React, {Component} from 'react';
import {StyleSheet, View, Text,Platform} from 'react-native';
import {Icon, Container, Content} from 'native-base';
import { AntDesign } from "@expo/vector-icons";
import {EvilIcons} from "@expo/vector-icons";
import { createAppContainer, createMaterialTopTabNavigator, } from 'react-navigation';

import Application from './Application';
import Report from './Report'; 

const AppTabNavigaotor = createMaterialTopTabNavigator({
    Application: {screen: Application},
    Report: {screen: Report}
}, {
    animationEnabled: true,
    swipeEnabled: true,
    tabBarPosition: "bottom",
    tabBarOptions: {
        style: {
            ...Platform.select({
                ios:{
                    backgroundColor:'white',
                }
            })
        },
    iconStyle: {height: 100},
    activeTintColor: '#000',
    inactiveTintColor:'#d1cece',
    upperCaseLabel: false,
    showLabel: false,
    showIcon: true,
    }
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