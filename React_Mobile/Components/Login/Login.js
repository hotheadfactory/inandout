import React, {Component} from 'react';
import {StyleSheet,
        Text, 
        View, 
        KeyboardAvoidingView, 
        TextInput, 
        TouchableOpacity,
        StatusBar
    } from 'react-native';
import {AntDesign} from "@expo/vector-icons";

export default class Login extends Component {
    static navigationOptions = { header: null };

    render() {
        const {navigation} = this.props;
        return (
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <View style={styles.logoContainer}>
                    <AntDesign color="white" size={120} name="swap"/>
                        <Text style={styles.logoText}>econovation</Text>
                </View>
                <View style={styles.formContainer}>
                <StatusBar
                barStyle="light-content"
                />
                    <TextInput
                    placeholder="student number"
                    placeholderTextColor='rgba(255,255,255,0.7)'
                    returnKeyType="next"
                    onSubmitEditing={() => this.passwordInput.focus()}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                    />
                    <TextInput
                    placeholder="password"
                    placeholderTextColor='rgba(255,255,255,0.7)'
                    returnKeyType="go"
                    secureTextEntry
                    style={styles.input}
                    ref={(input) => this.passwordInput = input}
                    />
                    <TouchableOpacity 
                        onPress={()=>{navigation.navigate("MainScreen")}}
                        style={styles.buttonContainer}>
                        <Text style={styles.loginbuttonText}>LOGIN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonContainer}>
                        <Text style={styles.joinbuttonText}>JOIN</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor: '#3498db'
    },
    formContainer : {
        padding: 20
    },
    logoContainer: {
        alignItems : 'center',
        flexGrow: 1,
        justifyContent: 'center'
    },
    logoText : {
        marginBottom: 100,
        fontSize : 20,
        color: "white",
        textAlign: "center"
    },
    input : {
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 20,
        color: '#FFF',
        paddingHorizontal: 10
    },
    buttonContainer: {
        backgroundColor: '#2980b9',
        paddingVertical: 10,
        marginBottom: 5
    },
    logoContainer: {
        backgroundColor: '#2980b9',
        paddingVertical: 10,
        marginBottom: 5
    },
    loginbuttonText: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontWeight: '700'
    },
    joinbuttonText: {
        textAlign:'center',
        color:'#FFF',
        fontWeight:'700'
    }
});