import React, {Component} from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { Content, Row } from 'native-base';

import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';

export default class ApplyComponent extends Component{
    constructor(){
        super()
        this.state = {
            isVisible: false,
            chosenDate: ''
        }
    }

    handlePicker = (datetime) => {
        this.setState({
            isVisible:false,
            chosenDate: moment(datetime).format('MMMM, Do YYYY')
        })
    }

    showPicker = () => {
        this.setState({
            isVisible:true
        })
    }

    hidePicker = () => {
        this.setState({
            isVisible:false
        })
    }

    render() {
        return (
                <View style={styles.container}>
                    <TouchableOpacity style={styles.button} onPress={this.showPicker}>
                        <Text style={styles.text}>Pick a Date</Text>
                    </TouchableOpacity>
                    
                    <DateTimePicker
                        isVisible={this.state.isVisible}
                        onConfirm={this.handlePicker}
                        onCancel={this.hidePicker}
                        mode={'date'}
                    />

                    <Text style={{color: 'blue', fontSize: '20'}}>
                        {this.state.chosenDate}
                    </Text>

                </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5FCFF'
    },
    button : {
        width: 200,
        height: 50,
        backgroundColor:'#2F7DE2',
        justifyContent: 'center',
        marginTop: 15,
        borderRadius:10
    },
    text: {
        fontSize: 30,
        color: 'white',
        textAlign:'center'
    }
})

