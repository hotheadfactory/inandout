import React, {Component} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';

export default class Application extends Component{
    render() {
        return (
            <View style={styles.container}>
                <Text>Application</Text>
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