import React, { useState, useEffect } from 'react';
import {View, Text, Alert, StyleSheet} from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const CustomSidebarMenu = (props) => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const getAsyncStorageData = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const is_admin = await AsyncStorage.getItem('is_admin');
  
      setUserData({"username": username, "is_admin": is_admin, "profile_char": username?.charAt(0).toUpperCase()})
    } catch (e) {
      console.log("Error", e)
    }
  };
  
  useEffect(() => {
    if(userData==null){
      getAsyncStorageData()
    }
  },[userData]);

  return (
    <View style={stylesSidebar.sideMenuContainer}>
      <View style={stylesSidebar.profileHeader}>
        <View style={stylesSidebar.profileHeaderPicCircle}>
          <Text style={{fontSize: 25, color: '#3C364E', fontWeight: 'bold'}}>
            {userData?.profile_char}
          </Text>
        </View>
        <View style={{ flexDirection: 'column' }}>
          <Text style={stylesSidebar.profileHeaderText}>
            {userData?.username}
          </Text>
          <Text
            onPress={() => navigation.navigate('ProfileScreen')}
            style={stylesSidebar.profileSubHeaderText}
            >
              View Profile
          </Text>
        </View>
      </View>
      <View style={stylesSidebar.profileHeaderLine} />

      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label={({color}) => 
            <Text style={{color: '#d8d8d8'}}>
              Logout
            </Text>
          }
          onPress={() => {
            props.navigation.toggleDrawer();
            Alert.alert(
              'Logout',
              'Are you sure? You want to logout?',
              [
                {
                  text: 'Cancel',
                  onPress: () => {
                    return null;
                  },
                },
                {
                  text: 'Confirm',
                  onPress: () => {
                    AsyncStorage.clear();
                    props.navigation.replace('Auth');
                  },
                },
              ],
              {cancelable: false},
            );
          }}
        />
      </DrawerContentScrollView>
    </View>
  );
};

export default CustomSidebarMenu;

const stylesSidebar = StyleSheet.create({
  sideMenuContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3C364E',
    paddingTop: 40,
    color: 'white',
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: '#3C364E',
    padding: 15,
    textAlign: 'center',
  },
  profileHeaderPicCircle: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    color: 'white',
    backgroundColor: '#c4bae3',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderText: {
    color: 'white',
    alignSelf: 'center',
    paddingHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 18
  },
  profileSubHeaderText: {
    color: 'white',
    paddingHorizontal: 10,
    paddingTop: 5,
    fontSize: 12
  },
  profileHeaderLine: {
    height: 1,
    marginHorizontal: 20,
    backgroundColor: '#e2e2e2',
    marginTop: 15,
  },
});