import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, StyleSheet, SafeAreaView, RefreshControl, ImageBackground, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import image from '../../Image/aca_background_logo.png';

const HomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [userBooking, setUserBooking] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const REACT_BACKEND_API_URL = "http://192.168.0.112:8000"

  const getAsyncStorageData = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      setUserData({"username": username})
    } catch (e) {
      console.log("Error", e)
    }
  };

  const getUserBooking = async () => {
    const response = await axios.get(REACT_BACKEND_API_URL+'/booking/booking?booking_for__username='+userData['username']);
    setUserBooking(response.data);
  }
  
  useEffect(() => {
    if(userData==null){
      getAsyncStorageData()
    }
  },[userData]);

  useEffect(() => {
    if(userData){
      getUserBooking()
    }
  },[userData]);

  const onRefresh = useCallback(() => {
    getUserBooking();
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          
        <View style={{padding: 16}}>
          <Text style={{fontSize: 16, fontWeight: '900', marginBottom: 10}}>Last Booking</Text>
          <View style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 20 }}>
            <ImageBackground source={image} resizeMode="cover">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,  }}>
              <Text style={{ fontWeight: '900', fontSize: 20 }}>
                OTP: 5451 
              </Text>
              <View style={{ flexDirection: 'row'}}>
                <MaterialCommunityIcons name='circle-slice-3' size={16} color="grey" style={{ paddingTop: 5, paddingRight: 10 }} />
                <Text style={{ fontWeight: '900', fontSize: 20 }}>{userBooking?.[0]?.status}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, fontWeight: '900' }}>{userBooking?.[0]?.booking_date}</Text>
              <Text style={{ fontWeight: '900' }}>|</Text>
              <Text style={{ fontSize: 12, fontWeight: '900' }}>{userBooking?.[0]?.pitch_data?.location_data?.name}</Text>
              <Text style={{ fontWeight: '900' }}>|</Text>
              <Text style={{ fontSize: 12, fontWeight: '900' }}>{userBooking?.[0]?.pitch_data?.pitch_type.replace("_", " ")}</Text>
              <Text style={{ fontWeight: '900' }}>|</Text>
              <Text style={{ fontSize: 12, fontWeight: '900' }}>Pitch {userBooking?.[0]?.pitch_data?.pitch_number}</Text>
            </View>

            <View style={{ flexDirection: 'col', justifyContent: 'space-between'}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ marginTop: 20 }}>
                  Booking Amount:
                </Text>
                <Text style={{ marginTop: 20 }}>
                  <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                  {userBooking?.[0]?.total_amount}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text>
                  Discount Redeemed: 
                </Text>
                <Text>
                  <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                  {userBooking?.[0]?.discount}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text>
                  Net Amount: 
                </Text>
                <Text>
                  <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                  {userBooking?.[0]?.net_amount}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text>
                  Paid: 
                </Text>
                <Text>
                  <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                  {userBooking?.[0]?.paid_amount}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text>
                  Balance: 
                </Text>
                <Text>
                  <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                  {userBooking?.[0]?.balance_amount}
                </Text>
              </View>
            </View>
            </ImageBackground>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <View paddingTop={10} flexDirection='row'>
              <MaterialCommunityIcons name='check-circle' size={16} color="lightgreen"/>
              <Text paddingLeft={2} style={{fontSize: 12}}>Confirmed</Text>
            </View>

            <View paddingTop={10} flexDirection='row'>
              <MaterialCommunityIcons name='circle-slice-3' size={16} color="grey"/>
              <Text paddingLeft={2} style={{fontSize: 12}}>Pending</Text>
            </View>

            <View paddingTop={10} flexDirection='row'>
              <MaterialCommunityIcons name='close-circle' size={16} color='#FD8A8A'/>
              <Text paddingLeft={2} style={{fontSize: 12}}>Cancelled</Text>
            </View>
          </View>
        </View>

        <View style={{padding: 16}}>
          <Text style={{fontSize: 16, fontWeight: '900', marginBottom: 10}}>Statistics</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 20}}>
              <Text style={{fontSize: 10, fontWeight: '900', marginTop: 0, marginBottom: 10}}>Total Bookings</Text>
              <Text style={{fontSize: 20, fontWeight: '900', marginTop: 0, marginBottom: 10}}>{userBooking?.length}</Text>
            </View>

            <View style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 20}}>
              <Text style={{fontSize: 10, fontWeight: '900', marginTop: 0, marginBottom: 10}}>Bookings Hours</Text>
              <Text style={{fontSize: 20, fontWeight: '900', marginTop: 0, marginBottom: 10}}>
                {userBooking?.reduce((hour, item) => hour + item.time_slot.length/2, 0)}
              </Text>
            </View>

            <View style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 20}}>
              <Text style={{fontSize: 10, fontWeight: '900', marginTop: 0, marginBottom: 10}}>Booked Pitches</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'col' }}>
                  <Text style={{fontSize: 20, fontWeight: '900', marginTop: 0, marginBottom: 10}}>
                    {userBooking?.reduce((pitch, item)=> item.pitch_data.pitch_type=="NATURAL_TURF"? pitch+1:pitch+0,0)}
                  </Text>
                  <Text style={{fontSize: 9, fontWeight: 'normal', marginTop: 0, marginBottom: 10}}>Natural</Text>
                </View>
                
                <View style={{ flexDirection: 'col' }}>
                  <Text style={{fontSize: 20, fontWeight: '900', marginTop: 0, marginBottom: 10}}>
                    {userBooking?.reduce((pitch, item)=> item.pitch_data.pitch_type=="ARTIFICIAL_TURF"? pitch+1:pitch+0,0)}
                  </Text>
                  <Text style={{fontSize: 8, fontWeight: 'normal', marginTop: 0, marginBottom: 10}}>Artificaial</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={{ justifyContent: 'space-between', marginTop: 20 }}>
            <View style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 20}}>
              <Text style={{fontSize: 10, fontWeight: '900', marginTop: 0, marginBottom: 10}}>Amount</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'col' }}>
                  <Text style={{fontSize: 20, fontWeight: '900', marginTop: 0, marginBottom: 10, paddingRight: 20}}>
                    <MaterialCommunityIcons name='currency-inr' size={16} style={{ paddingRight: 10 }} />
                    {userBooking?.reduce((amount,item) => amount + item.total_amount, 0)}
                  </Text>
                  <Text style={{fontSize: 8, fontWeight: 'normal', marginRight: 60, marginBottom: 10}}>Bill</Text>
                </View>

                <View style={{ flexDirection: 'col' }}>
                  <Text style={{fontSize: 20, fontWeight: '900', marginTop: 0, marginBottom: 10, paddingRight: 20}}>
                    <MaterialCommunityIcons name='currency-inr' size={16} style={{ paddingRight: 10 }} />
                    {userBooking?.reduce((amount,item) => amount + item.discount, 0)}
                  </Text>
                  <Text style={{fontSize: 8, fontWeight: 'normal', marginBottom: 10}}>Disocunt</Text>
                </View>

                <View style={{ flexDirection: 'col' }}>
                  <Text style={{fontSize: 20, fontWeight: '900', marginTop: 0, marginBottom: 10, paddingRight: 20}}>
                    <MaterialCommunityIcons name='currency-inr' size={16} style={{ paddingRight: 10 }} />
                    {userBooking?.reduce((amount,item) => amount + item.paid_amount, 0)}
                  </Text>
                  <Text style={{fontSize: 8, fontWeight: 'normal', marginBottom: 10}}>Paid</Text>
                </View>

                <View style={{ flexDirection: 'col' }}>
                  <Text style={{fontSize: 20, fontWeight: '900', marginTop: 0, marginBottom: 10}}>
                    <MaterialCommunityIcons name='currency-inr' size={16} style={{ paddingRight: 10 }} />
                    {userBooking?.reduce((amount,item) => amount + item.balance_amount, 0)}
                  </Text>
                  <Text style={{fontSize: 8, fontWeight: 'normal', marginBottom: 10}}>Balance</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{padding: 16}}>
          <Text style={{ fontSize: 16, fontWeight: '900', marginBottom: 10 }}>Last 5 Bookings</Text>
          <View style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 20 }}>
            {userBooking?.slice(0, 5).map(booking => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} key={booking.id}>
                <Text style={{ fontSize: 12, fontWeight: '900', textAlign: 'left', width: '25%' }}>{booking.booking_date}</Text>
                
                <Text style={{ fontSize: 12, fontWeight: '900', textAlign: 'left', width: '25%' }}>{booking.pitch_data?.location_data?.name}</Text>
                
                <Text style={{ fontSize: 12, fontWeight: '900', textAlign: 'left', width: '35%' }}>{booking.pitch_data?.pitch_type.replace("_", " ")}</Text>
                
                <Text style={{ fontSize: 12, fontWeight: '900', textAlign: 'left', width: '15%' }}>Pitch {booking.pitch_data?.pitch_number}</Text>
              </View>
            ))}
          </View>
        </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
});

export default HomeScreen;