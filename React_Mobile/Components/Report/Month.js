import React, {Component} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';

export default class Month extends Component{
    render() {
        return (
            <View style={styles.container}>
                <Text>Month</Text>
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