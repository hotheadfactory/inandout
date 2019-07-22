import React, {Component} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {Icon, Content} from 'native-base';
import ApplyComponent from './ApplyComponent'

export default class Application extends Component{

    static navigationOptions = {
        tabBarIcon: ({tintColor}) => (
            <Icon name='ios-home' style={{tintColor}} style={{paddingBottom:10}}/>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <Content>
                    <ApplyComponent/>
                </Content>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    }
})