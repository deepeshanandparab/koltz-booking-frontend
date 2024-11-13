import React, {useState, createRef} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  ScrollView,
  Image,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Loader from './Components/Loader';

import axios from 'axios';

const LoginScreen = ({navigation}) => {
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordInputRef = createRef();
  const REACT_BACKEND_API_URL = "http://192.168.0.112:8000"

  const handleSubmitPress = async () => {
    setErrortext('');
    if (!userEmail) {
      alert('Please enter valid User Id, Email or Mobile Number');
      return;
    }
    if (!userPassword) {
      alert('Please enter Password');
      return;
    }
    setLoading(true);
    let dataToSend = {username: userEmail, password: userPassword};

    const response = await axios.post(REACT_BACKEND_API_URL+'/account/login/', dataToSend, {
      headers: {
          "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json"
      },
    });
    setLoading(false);

    if (response && response.data && response.data.user) {
      await AsyncStorage.setItem('userid', response.data.user.id);
      await AsyncStorage.setItem('username', response.data.user.username);
      await AsyncStorage.setItem('is_admin', response.data.user.is_admin.toString());

      setLoading(false);
      navigation.replace('DrawerNavigationRoutes');
    }
    else{
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
      setShowPassword(!showPassword);
  };

  return (
    <View style={styles.mainBody}>
      <Loader loading={loading} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <View>
          <KeyboardAvoidingView enabled>
            <View style={{alignItems: 'center'}}>
              <Image
                source={require('../Image/aca_logo.png')}
                style={{
                  width: '50%',
                  height: 200,
                  resizeMode: 'contain',
                  margin: 0,
                }}
              />
            </View>
            <View style={styles.SectionStyle}>
              <TextInput
                style={styles.inputStyle}
                onChangeText={(UserEmail) =>
                  setUserEmail(UserEmail)
                }
                placeholder="Enter Username, Email or Mobile Number"
                placeholderTextColor="#8b9cb5"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() =>
                  passwordInputRef.current &&
                  passwordInputRef.current.focus()
                }
                underlineColorAndroid="#f000"
                blurOnSubmit={false}
              />
            </View>
            <View style={styles.SectionStyle}>
              <TextInput
                style={styles.inputStyle}
                onChangeText={(UserPassword) =>
                  setUserPassword(UserPassword)
                }
                placeholder="Enter Password"
                placeholderTextColor="#8b9cb5"
                keyboardType="default"
                ref={passwordInputRef}
                onSubmitEditing={Keyboard.dismiss}
                blurOnSubmit={false}
                secureTextEntry={!showPassword}
                underlineColorAndroid="#f000"
                returnKeyType="next"
              />
              <MaterialCommunityIcons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#aaa"
                  style={styles.passwordIcon}
                  onPress={toggleShowPassword}
              />
            </View>
            <Text
              style={styles.forgotPasswordStyle}
              onPress="">
              Forgot Password
            </Text>
            {errortext != '' ? (
              <Text style={styles.errorTextStyle}>
                {errortext}
              </Text>
            ) : null}
            <TouchableOpacity
              style={styles.buttonStyle}
              activeOpacity={0.5}
              onPress={handleSubmitPress}>
              <Text style={styles.buttonTextStyle}>LOGIN</Text>
            </TouchableOpacity>
            <Text
              style={styles.registerTextStyle}
              onPress={() => navigation.navigate('RegisterScreen')}>
              Create an account? 
              <Text style={styles.registerLinkStyle}>  Register</Text>
            </Text>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </View>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignContent: 'center',
  },
  SectionStyle: {
    flexDirection: 'row',
    height: 40,
    marginTop: 20,
    marginLeft: 35,
    marginRight: 35,
    margin: 10,
  },
  buttonStyle: {
    backgroundColor: '#3C364E',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#7DE24E',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 25,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  inputStyle: {
    flex: 1,
    color: '#3C364E',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#dadae8',
  },
  registerTextStyle: {
    color: '#3C364E',
    textAlign: 'center',
    fontSize: 14,
    alignSelf: 'center',
    padding: 10,
  },
  registerLinkStyle: {
    fontWeight: 'bold',
  },
  forgotPasswordStyle: {
    alignSelf: 'flex-end',
    paddingRight: 50
  },
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  passwordIcon: {
    position: 'absolute',
    zIndex: 10,
    marginLeft: 280,
    marginTop: 8
  },
});