import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from './DrawerScreens/HomeScreen';
import NetBookingScreen from './DrawerScreens/NetBookingScreen';
import AdminDashboardScreen from './DrawerScreens/AdminDashboardScreen';
import AdminBookingScreen from './DrawerScreens/AdminBookingScreen';
import AdminSettingScreen from './DrawerScreens/AdminSettingsScreen';
import CustomSidebarMenu from './Components/CustomSidebarMenu';
import NavigationDrawerHeader from './Components/NavigationDrawerHeader';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const HomeScreenStack = ({navigation}) => {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerLeft: () => (
            <NavigationDrawerHeader navigationProps={navigation} />
          ),
          headerStyle: {
            backgroundColor: '#3C364E',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const NetBookingScreenStack = ({navigation}) => {
  return (
    <Stack.Navigator initialRouteName="NetBookingScreen">
      <Stack.Screen
        name="NetBookingScreen"
        component={NetBookingScreen}
        options={{
          title: 'Net Booking',
          headerLeft: () => (
            <NavigationDrawerHeader navigationProps={navigation} />
          ),
          headerStyle: {
            backgroundColor: '#3C364E',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const AdminDashboardScreenStack = ({navigation}) => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboardScreen"
      screenOptions={{
        headerLeft: () => (
          <NavigationDrawerHeader navigationProps={navigation} />
        ),
        headerStyle: {
          backgroundColor: '#3C364E',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="AdminDashboardScreen"
        component={AdminDashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
    </Stack.Navigator>
  );
};


const AdminBookingScreenStack = ({navigation}) => {
  return (
    <Stack.Navigator
      initialRouteName="AdminBookingScreen"
      screenOptions={{
        headerLeft: () => (
          <NavigationDrawerHeader navigationProps={navigation} />
        ),
        headerStyle: {
          backgroundColor: '#3C364E',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="AdminBookingScreen"
        component={AdminBookingScreen}
        options={{
          title: 'Bookings',
        }}
      />
    </Stack.Navigator>
  );
};

const AdminSettingScreenStack = ({navigation}) => {
  return (
    <Stack.Navigator
      initialRouteName="AdminSettingScreen"
      screenOptions={{
        headerLeft: () => (
          <NavigationDrawerHeader navigationProps={navigation} />
        ),
        headerStyle: {
          backgroundColor: '#3C364E',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="AdminSettingScreen"
        component={AdminSettingScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
};

const DrawerNavigatorRoutes = (props) => {
  const [isAdmin, setIsAdmin] = useState("false")

  const getAsyncStorageData = async () => {
    try {
      const is_admin = await AsyncStorage.getItem('is_admin');
      setIsAdmin(is_admin)
    } catch (e) {
      console.log("Error", e)
    }
  };

  useEffect(() => {
    getAsyncStorageData()
  },[isAdmin]);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#c4bae3',
        drawerActiveTintColor: '#3C364E',
        drawerInactiveTintColor: '#FFF',
        color: '#fff',
        itemStyle: {marginVertical: 5, color: '#fff'},
        labelStyle: {
          color: 'red',
        },
      }}
      drawerContent={CustomSidebarMenu}
    >
      {isAdmin=='false'?
      <Drawer.Screen
        name="HomeScreenStack"
        options={{drawerLabel: 'Home'}}
        component={HomeScreenStack}
      />
      :
      <React.Fragment></React.Fragment>
      }

      {isAdmin=='false'?
      <Drawer.Screen
        name="NetBookingScreenStack"
        options={{drawerLabel: 'Net Booking'}}
        component={NetBookingScreenStack}
      />
      :
      <React.Fragment></React.Fragment>
      }

      {isAdmin=='true'?
      <Drawer.Screen
        name="AdminDashboardScreenStack"
        options={{drawerLabel: 'Dashboard'}}
        component={AdminDashboardScreenStack}
      />
      :
      <React.Fragment></React.Fragment>
      }

      {isAdmin=='true'?
      <Drawer.Screen
        name="AdminBookingScreenStack"
        options={{drawerLabel: 'Bookings'}}
        component={AdminBookingScreenStack}
      />
      :
      <React.Fragment></React.Fragment>
      }

      {isAdmin=='true'?
      <Drawer.Screen
        name="AdminSettingScreenStack"
        options={{drawerLabel: 'Settings'}}
        component={AdminSettingScreenStack}
      />
      :
      <React.Fragment></React.Fragment>
      }
      
    </Drawer.Navigator>
  );
};

export default DrawerNavigatorRoutes;