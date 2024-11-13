import React, {useState, createRef, useEffect} from 'react';
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
  Button,
  ImageBackground,
  Modal,
  Alert
} from 'react-native';
import axios from 'axios';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Loader from './Components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';


const ProfileScreen = (props) => {
  const [userId, setUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);

  const getAsyncStorageData = async () => {
    try {
      const userid = await AsyncStorage.getItem('userid');
      const response = await axios.get(REACT_BACKEND_API_URL + '/account/user/' + userid);
      setUserName(response.data.username)
      setFirstName(response.data.first_name)
      setMiddleName(response.data.middle_name)
      setLastName(response.data.last_name)
      setUserMobile(response.data.mobile)
      setUserEmail(response.data.email)
      // setUserPassword(response.data.password)
    } catch (e) {
      console.log("Error", e)
    }
  };
  
  useEffect(() => {
    if(userId==null){
      getAsyncStorageData()
    }
  },[userId]);

  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [userEmail, setUserEmail] = useState('');
  // const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [isUpdationSuccess, setIsUpdationSuccess] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);

  const firstNameInputRef = createRef();
  const middleNameInputRef = createRef();
  const lastNameInputRef = createRef();
  const mobileInputRef = createRef();
  const emailInputRef = createRef();
  // const passwordInputRef = createRef();
  const REACT_BACKEND_API_URL = "http://192.168.0.112:8000"

  // const toggleShowPassword = () => {
  //   setShowPassword(!showPassword);
  // };

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
    // if (!userPassword) {
    //   alert('Please enter a password');
    //   return;
    // }

    //Show Loader
    setLoading(true);
    var dataToSend = {
      username: userName,
      firstname: firstName,
      middlename: middleName,
      lastname: lastName,
      mobile: userMobile,
      email: userEmail
    };
    const response = await axios.put(REACT_BACKEND_API_URL+'/account/user/'+userId, dataToSend, {
      headers: {
          "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json"
      },
    });

    console.log("RESPONSE STATUS", typeof(response.status))
    
    if(response && response.status == 201){
      setLoading(false);
      setIsUpdationSuccess(true);
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
            Updation Successful
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
      setIsUpdationSuccess(false);
    }
  }

  const pickImage = async (mode) => {
    let result = {}
    try {
      if(mode==='gallery'){
        // await ImagePicker.requestMediaLibraryPermissionsAsync()
        // result = await ImagePicker.launchImageLibraryAsync({
        //   mediaTypes: ['images'],
        //   allowsEditing: true,
        //   aspect: [1, 1],
        //   quality: 1,
        // });
  
        // if (!result.canceled) {
        //   console.log("result.assets[0].uri", result.assets[0])
        //   setSelectedImage(result.assets[0].uri);
        //   setUploadModal(false)
        // }
        Alert.alert("Gallery uploads not working")
        setSelectedImage(null);
        setUploadModal(false);
      }
      else if(mode==='camera'){
        await ImagePicker.requestCameraPermissionsAsync()
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.front,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
  
        if (!result.canceled) {
          console.log("result.assets[0].uri", result.assets[0])
          setSelectedImage(result.assets[0].uri);
          setUploadModal(false)
        }
      }
      else{
        setSelectedImage(null);
        setUploadModal(false);
      }
    } catch(error){
      Alert.alert("Error", error)
      setUploadModal(false)
    }
    
  };

  

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
          <TouchableOpacity style={{ marginTop: 20, borderColor: '#CFCFCF', borderWidth: 0.5, borderRadius: 20 }} onPress={()=> setUploadModal(true)}>
            {!selectedImage?
              <ImageBackground 
                source={require("../Image/user.png")}
                style={{ height: 195, width: 200, overflow: 'hidden', borderRadius: 10 }}>
                <Text style={{color: 'transparent', paddingTop: 145, textAlign: 'center'}}>Change Profile Picture</Text>
                <Text style={{color: 'black', 
                              textAlign: 'center', 
                              backgroundColor: '#CFCFCF', 
                              paddingTop: 5,
                              paddingBottom: 10,
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10
                              }}>Change Profile Picture</Text>
              </ImageBackground>
            :
              <ImageBackground 
                  src={selectedImage}
                  style={{ height: 195, width: 200, overflow: 'hidden', borderRadius: 10 }}>
                  <Text style={{color: 'transparent', paddingTop: 145, textAlign: 'center'}}>Change Profile Picture</Text>
                  <Text style={{color: 'black', 
                                textAlign: 'center', 
                                backgroundColor: '#CFCFCF', 
                                paddingTop: 5,
                                paddingBottom: 10,
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10
                                }}>Change Profile Picture</Text>
                </ImageBackground>
            }
            
          </TouchableOpacity>
        </View>
        
        <KeyboardAvoidingView enabled>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              value={userName}
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
                  value={firstName}
                  onChangeText={(FirstName) => setFirstName(FirstName)}
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
                  value={middleName}
                  onChangeText={(MiddleName) => setMiddleName(MiddleName)}
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
                  value={lastName}
                  onChangeText={(LastName) => setLastName(LastName)}
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
              value={userMobile}
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
              value={userEmail}
              onChangeText={(UserEmail) => setUserEmail(UserEmail)}
              underlineColorAndroid="#f000"
              placeholder="Enter Email"
              placeholderTextColor="#8b9cb5"
              keyboardType="email-address"
              ref={emailInputRef}
              returnKeyType="next"
              onSubmitEditing={() => Keyboard.dismiss }
              blurOnSubmit={false}
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
            <Text style={styles.buttonTextStyle}>UPDATE</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <Modal
            animationType="fade"
            transparent={true}
            visible={uploadModal}
            onRequestClose={() => {
                setUploadModal(!uploadModal);
            }}>
            <TouchableOpacity style={styles.centeredView} onPress={() => setUploadModal(false)}>
                <View style={styles.modalView}>
                    <View style={{ flexDirection: 'col' }}>
                      <TouchableOpacity onPress={()=> pickImage('camera')}>
                        <ImageBackground 
                            source={require("../Image/camera.png")} 
                            style={{ 
                              height: 50, 
                              width: 50, 
                              borderColor: '#CFCFCF',
                              borderWidth: 0.5,
                              borderRadius: 10
                            }}>
                          </ImageBackground>
                      </TouchableOpacity>
                      <Text style={styles.modalText}>Camera</Text>
                    </View>

                    <View style={{ flexDirection: 'col' }}>
                      <TouchableOpacity onPress={()=> pickImage('gallery')}>
                          <ImageBackground 
                              source={require("../Image/gallery.png")} 
                              style={{ 
                                height: 50, 
                                width: 50, 
                                borderColor: '#CFCFCF',
                                borderWidth: 0.5,
                                borderRadius: 10
                              }}>
                            </ImageBackground>
                        </TouchableOpacity>
                        <Text style={styles.modalText}>Gallery</Text>
                    </View>

                    <View style={{ flexDirection: 'col' }}>
                        <TouchableOpacity onPress={()=> pickImage()}>
                          <ImageBackground 
                              source={require("../Image/trash.png")} 
                              style={{ 
                                height: 50, 
                                width: 50, 
                                borderColor: '#CFCFCF',
                                borderWidth: 0.5,
                                borderRadius: 10
                              }}>
                            </ImageBackground>
                        </TouchableOpacity>
                        <Text style={styles.modalText}>Remove</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
      </ScrollView>
    </View>
  );
};
export default ProfileScreen;

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
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(207, 207, 207, 0.9)',
},
modalView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: 'transparent',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
},
modalHeaderText: {
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: '900'
},
modalText: {
    marginVertical: 10,
    textAlign: 'center',
},
});