import React, {useState, createRef} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Loader from './Components/Loader';

const RegisterScreen = (props) => {
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [isRegistraionSuccess, setIsRegistraionSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const firstNameInputRef = createRef();
  const middleNameInputRef = createRef();
  const lastNameInputRef = createRef();
  const mobileInputRef = createRef();
  const emailInputRef = createRef();
  const passwordInputRef = createRef();
  const REACT_BACKEND_API_URL = "http://192.168.0.112:8000"

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmitPress = async () => {
    setErrortext('');
    if (!userName) {
      alert('Please enter full name');
      return;
    }
    if (!firstName) {
      alert('Please enter first name');
      return;
    }
    if (!lastName) {
      alert('Please enter last name');
      return;
    }
    if (!userMobile && userMobile.length != 10) {
      alert('Please enter 10 digit valid mobile number');
      return;
    }
    if (!userEmail) {
      alert('Please enter valid email address');
      return;
    }
    if (!userPassword) {
      alert('Please enter a password');
      return;
    }

    //Show Loader
    setLoading(true);
    var dataToSend = {
      username: userName,
      firstname: firstName,
      middlename: middleName,
      lastname: lastName,
      mobile: userMobile,
      email: userEmail,
      password: userPassword,
      role: "GUEST"
    };
    const response = await axios.post(REACT_BACKEND_API_URL+'/account/user/register/', dataToSend, {
      headers: {
          "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json"
      },
    });

    console.log("RESPONSE STATUS", typeof(response.status))
    
    if(response && response.status == 201){
      setLoading(false);
      setIsRegistraionSuccess(true);
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: '#3C364E',
            justifyContent: 'center',
          }}>
          <Image
            source={require('../Image/success.png')}
            style={{
              height: 150,
              resizeMode: 'contain',
              alignSelf: 'center'
            }}
          />
          <Text style={styles.successTextStyle}>
            Registration Successful
          </Text>
          <TouchableOpacity
            style={styles.buttonStyle}
            activeOpacity={0.5}
            onPress={() => props.navigation.navigate('LoginScreen')}>
            <Text style={styles.buttonTextStyle}>Login Now</Text>
          </TouchableOpacity>
        </View>
      );
    }
    else{
      setLoading(false);
      setIsRegistraionSuccess(false);
    }
  }

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <Loader loading={loading} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          justifyContent: 'center',
          alignContent: 'center',
        }}>
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
        
        <KeyboardAvoidingView enabled>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserName) => setUserName(UserName)}
              underlineColorAndroid="#f000"
              placeholder="Enter Username"
              placeholderTextColor="#8b9cb5"
              autoCapitalize="sentences"
              returnKeyType="next"
              onSubmitEditing={() =>
                firstNameInputRef.current && firstNameInputRef.current.focus()
              }
              blurOnSubmit={false}
            />
          </View>

          
          <View style={styles.SectionStyle}>
              <View style={{flexDirection: 'row'}}>
                <TextInput
                  style={styles.inputStyleRow}
                  onChangeText={(firstName) => setFirstName(firstName)}
                  underlineColorAndroid="#f000"
                  placeholder="First Name"
                  placeholderTextColor="#8b9cb5"
                  autoCapitalize="sentences"
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    middleNameInputRef.current && middleNameInputRef.current.focus()
                  }
                  blurOnSubmit={false}
                />
                
                <TextInput
                  style={styles.inputStyleRow}
                  onChangeText={(middleName) => setMiddleName(middleName)}
                  underlineColorAndroid="#f000"
                  placeholder="Middle Name"
                  placeholderTextColor="#8b9cb5"
                  autoCapitalize="sentences"
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    lastNameInputRef.current && lastNameInputRef.current.focus()
                  }
                  blurOnSubmit={false}
                />

                <TextInput
                  style={styles.inputStyleRow}
                  onChangeText={(lastName) => setLastName(lastName)}
                  underlineColorAndroid="#f000"
                  placeholder="Last Name"
                  placeholderTextColor="#8b9cb5"
                  autoCapitalize="sentences"
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    mobileInputRef.current && mobileInputRef.current.focus()
                  }
                  blurOnSubmit={false}
                />
              </View>
          </View>

          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserMobile) => setUserMobile(UserMobile)}
              underlineColorAndroid="#f000"
              placeholder="Enter Mobile Number"
              placeholderTextColor="#8b9cb5"
              keyboardType="mobile"
              ref={mobileInputRef}
              returnKeyType="next"
              onSubmitEditing={() =>
                emailInputRef.current && emailInputRef.current.focus()
              }
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserEmail) => setUserEmail(UserEmail)}
              underlineColorAndroid="#f000"
              placeholder="Enter Email"
              placeholderTextColor="#8b9cb5"
              keyboardType="email-address"
              ref={emailInputRef}
              returnKeyType="next"
              onSubmitEditing={() =>
                passwordInputRef.current && passwordInputRef.current.focus()
              }
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserPassword) =>
                setUserPassword(UserPassword)
              }
              underlineColorAndroid="#f000"
              placeholder="Enter Password"
              placeholderTextColor="#8b9cb5"
              ref={passwordInputRef}
              returnKeyType="next"
              secureTextEntry={!showPassword}
              onSubmitEditing={() => Keyboard.dismiss }
              blurOnSubmit={false}
            />
            <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#aaa"
                style={styles.passwordIcon}
                onPress={toggleShowPassword}
            />
          </View>
          {errortext != '' ? (
            <Text style={styles.errorTextStyle}>
              {errortext}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.buttonStyle}
            activeOpacity={0.5}
            onPress={handleSubmitPress}>
            <Text style={styles.buttonTextStyle}>REGISTER</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};
export default RegisterScreen;

const styles = StyleSheet.create({
  SectionStyle: {
    flexDirection: 'row',
    height: 40,
    marginTop: 20,
    marginLeft: 25,
    marginRight: 25,
    margin: 10,
  },
  buttonStyle: {
    backgroundColor: '#3C364E',
    borderWidth: 0,
    color: '#fff',
    borderColor: '#7DE24E',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 25,
    marginRight: 25,
    marginTop: 20,
    marginBottom: 20,
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
  inputStyleRow: {
    color: '#3C364E',
    paddingLeft: 15,
    paddingRight: 15,
    marginRight: 5,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#dadae8',
  },
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  successTextStyle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    padding: 30,
  },
  passwordIcon: {
    position: 'absolute',
    zIndex: 10,
    marginLeft: 300,
    marginTop: 8
  }
});