import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, 
          View, 
          Text, 
          SafeAreaView, 
          Dimensions, 
          TouchableOpacity, 
          Modal, 
          Pressable, 
          ScrollView, 
          RefreshControl, 
          ToastAndroid, 
          ImageBackground,
          ActivityIndicator
        } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Carousel from 'react-native-reanimated-carousel';
import DateTimePicker from 'react-native-ui-datepicker';
import { format } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { TextInput } from 'react-native-gesture-handler';
import image from '../../Image/aca_background_logo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NetBookingScreen = ({navigation}) => {
  const width = Dimensions.get('window').width;

  const [userId, setUserId] = useState(null);
  const [date, setDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSummaryVisible, setModalSummaryVisible] = useState(false);
  const [location, setLocation] = useState('');
  const [locationsList, setLocationsList] = useState([]);
  const [pitchList, setPitchList] = useState([]);
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [timeSlotList, setTimeSlotList] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  const [bookedTimeSlot, setBookedTimeSlot] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [selectedPitchNumber, setSelectedPitchNumber] = useState('');
  const [selectedPitchType, setSelectedPitchType] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponCodeMessage, setCouponCodeMessage] = useState({});
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [payableAmount, setPayableAmount] = useState(0);
  const [discountButtonLoader, setDiscountButtonLoader] = useState(false);
  const [bookingButtonLoader, setBookingButtonLoader] = useState(false);
  const [timeSlotLoader, setTimeSlotLoader] = useState(false);
  const [activePitch, setActivePitch] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [reservedTimeSlot, setReservedTimeSlot] = useState([]);
  

  const REACT_BACKEND_API_URL = "http://192.168.0.112:8000"

  const getAsyncStorageData = async () => {
    try {
      const userid = await AsyncStorage.getItem('userid');
      setUserId(userid)
    } catch (e) {
      console.log("Error", e)
    }
  };

  const fetchLocations = async () => {
    const response = await axios.get(REACT_BACKEND_API_URL + '/booking/location/');
    response.data.map(location => (
      locationsList.push({ "key": location.id, "title": location.name, "id": location.id })
    ))
  }

  const fetchPitch = async (location) => {
    const response = await axios.get(REACT_BACKEND_API_URL + '/booking/pitch?location_id=' + location);
    setPitchList(response.data)
  }

  const fetchTimeSlot = async () => {
    const response = await axios.get(REACT_BACKEND_API_URL + '/booking/timeslot');
    setTimeSlotList(response.data)
  }

  const fetchBooking = async (date, selectedPitch, location) => {
    const bookedSlotList = []
    const response = await axios.get(REACT_BACKEND_API_URL + '/booking/booking/getpitchbookinglist?booking_date=' + format(new Date(date), 'yyyy-MM-dd') + '&pitch=' + selectedPitch + '&pitch__location_id=' + location);
    setBookingList(response.data)

    for (let i = 0; i < response.data.length; i++) {
      for (let j = 0; j < response.data[i]['time_slot'].length; j++)
        bookedSlotList.push(response.data[i]['time_slot'][j])
    }
    setBookedTimeSlot(bookedSlotList)
  }


  const fetchReservedBooking = async (date, pitchid) => {
    const day = new Date(date).toLocaleString('en-us', {weekday:'long'})
    const selected_date = format(new Date(date), 'dd-MM-yyyy')
    const response = await axios.get(REACT_BACKEND_API_URL + '/booking/reservedbooking/getreservedbookings?day='+ day +'&pitch=' + pitchid);

    const reserved_slot_list = []

    for (let i = 0; i < response.data.length; i++) {
      if(!response.data[i]['exception_dates'].includes(selected_date)){
        for (let j = 0; j < response.data[i]['time_slot'].length; j++)
          if(!reserved_slot_list.includes(response.data[i]['time_slot'][j])){
            reserved_slot_list.push(response.data[i]['time_slot'][j])
          } 
      }   
    }
    setReservedTimeSlot(reserved_slot_list)
  }


  const selectSlot = (item) => {
    if (selectedTimeSlots.length < 1) {
      selectedTimeSlots.push(item)
    }
    else {
      if (selectedTimeSlots?.some(slot => slot?.id == item?.id)) {
        if(selectedTimeSlots.length==1 && selectedTimeSlots == undefined){
          setSelectedTimeSlots([])
        }
        else{
          setSelectedTimeSlots(selectedTimeSlots.filter((selectedSlot) => selectedSlot?.id !== item?.id))
        }
      }
      else {
        selectedTimeSlots.push(item)
        setSelectedTimeSlots(selectedTimeSlots)
      }
    }
    setPayableAmount(selectedTimeSlots.filter((selectedSlot) => selectedSlot !== undefined)?.length * 1000 / 2)
    onRefresh()
  }

  useEffect(() => {
    if(userId==null){
      getAsyncStorageData()
    }
  },[userId]);

  useEffect(() => {
    if (locationsList.length < 1) {
      fetchLocations()
    }
  }, [locationsList]);

  useEffect(() => {
    fetchPitch(location)
  }, [location])

  useEffect(() => {
    fetchTimeSlot()
  }, [pitchList])

  useEffect(() => {
    selectSlot()
  }, [selectedTimeSlots])

  useEffect(() => {
    fetchBooking(date, selectedPitch, location)
  }, [selectedPitch, location])

  useEffect(() => {
    if(selectedPitch && location){
      setTimeSlotLoader(true)
      fetchBooking(date, selectedPitch, location)
      setTimeout(() => {
        setTimeSlotLoader(false)
      }, 100);
    }
  }, [date])

  useEffect(() => {
    if(date && location){
      setTimeSlotLoader(true)
      fetchBooking(date, selectedPitch, location)
      setTimeout(() => {
        setTimeSlotLoader(false)
      }, 100);
    }
  }, [selectedPitch])

  useEffect(() => {
    if(selectedPitch && date){
      setTimeSlotLoader(true)
      fetchBooking(date, selectedPitch, location)
      setTimeout(() => {
        setTimeSlotLoader(false)
      }, 100);
    }
  }, [location])

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  const fetchSummaryData = async () => {
    if(selectedPitch){
      const pitchResponse = await axios.get(REACT_BACKEND_API_URL + '/booking/pitch/' + selectedPitch);
      if(pitchResponse.status='301'){
        setSelectedPitchNumber(pitchResponse.data['pitch_number'])
        setSelectedPitchType(pitchResponse.data['pitch_type'])
        setSelectedLocationName(pitchResponse.data['location_data']['name'])
        setModalSummaryVisible(true)
      }
      else{
        ToastAndroid.showWithGravity('Booking Failed', ToastAndroid.LONG, ToastAndroid.TOP);
      }
    }
    else{
      ToastAndroid.showWithGravity('Please select pitch and time slot', ToastAndroid.LONG, ToastAndroid.TOP);
    }
  }


  const handleCouponDiscount = async () => {
    setDiscountButtonLoader(true)
    const response = await axios.get(REACT_BACKEND_API_URL + '/booking/coupon?coupon_code='+couponCode);
    const discount_coupon_data = response.data[0]

    if(discount_coupon_data?.['exclusive_for']?.includes(userId)){
      if(discount_coupon_data['redeem_count'] < discount_coupon_data['max_count'])
      {
        if(discount_coupon_data['discount_type']=='AMOUNT'){
          const total_amount = parseInt(selectedTimeSlots.filter((selectedSlot) => selectedSlot !== undefined)?.length * 1000 / 2)
          const total_discount = discount_coupon_data['discount_value'] 
          const payable_amount = total_amount - total_discount
          setTotalDiscount(total_discount)
          setPayableAmount(payable_amount)
          setCouponCodeMessage({"type":"Success", "message": couponCode})
          setAppliedCoupon(discount_coupon_data['id'])
        }
        else{
          const total_amount = parseInt(selectedTimeSlots.filter((selectedSlot) => selectedSlot !== undefined)?.length * 1000 / 2)
          const total_discount = total_amount * (discount_coupon_data['discount_value'] / 100)
          const payable_amount = total_amount - total_discount
          setTotalDiscount(total_discount)
          setPayableAmount(payable_amount)
          setCouponCodeMessage({"type":"Success", "message": couponCode})
          setAppliedCoupon(discount_coupon_data['id'])
        }
      }
      else{
        setCouponCodeMessage({"type":"Error", "message":"Already Redeemed"})
      }
    }
    else{
      setCouponCodeMessage({"type":"Error", "message":"Invalid Coupon"})
    }
    setDiscountButtonLoader(false)
  }


  const handleConfirmBooking = async () => {
    setBookingButtonLoader(true)
    const slotIds = []
    selectedTimeSlots.filter((selectedSlot) => selectedSlot !== undefined).map(slot => slotIds.push(slot?.id))
    const total_amount = parseInt(selectedTimeSlots.filter((selectedSlot) => selectedSlot !== undefined)?.length * 1000 / 2)

    const booking_data = {
      'booking_date': format(new Date(date), 'yyyy-MM-dd'),
      'pitch': selectedPitch,
      'time_slot': slotIds,
      'total_amount': total_amount,
      'applied_coupon': appliedCoupon,
      'discount': totalDiscount,
      'net_amount': payableAmount,
      'paid_amount': 0.0,
      'balance_amount': parseFloat(payableAmount) - 0.0,
      'booking_for': userId,
      'created_by': userId,
      'status': "BOOKED"
    }

    const response = await axios.post(REACT_BACKEND_API_URL+'/booking/booking/', booking_data, { headers: { "Content-Type": "application/json" } });
    
    if(response.status == '201'){
      ToastAndroid.showWithGravity('Slot Booked Successfully !\nOTP sent to registed email', ToastAndroid.LONG, ToastAndroid.TOP);
    }
    else{
      ToastAndroid.showWithGravity('Booking Failed', ToastAndroid.LONG, ToastAndroid.TOP);
    }
    setBookingButtonLoader(false)
    setModalSummaryVisible(!modalSummaryVisible)
    setTimeout(() => {
      navigation.replace('DrawerNavigationRoutes');
    }, 1000);
  };

  const getPitchTimeSlots = (pitchid) => {
    setTimeSlotLoader(true)
    setActivePitch(pitchid)
    setSelectedPitch(pitchid)
    fetchBooking(date, pitchid, location)
    fetchReservedBooking(date, pitchid)
    console.log("RESERVED", reservedTimeSlot)
    setTimeout(() => {
      setTimeSlotLoader(false)
    }, 100);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text style={{ fontSize: 16, fontWeight: '900', marginLeft: 20, marginTop: 10, marginBottom: 0 }}>Date  & Location</Text>
        <View style={{ flex: 1, padding: 16 }}>
          <View
            style={{
              // flex: 1,
              flexDirection: 'row'
            }}>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>Select Booking Date</Text>
                  <DateTimePicker
                    locale={enIN}
                    mode="single"
                    selectedItemColor='#3C364E'
                    minDate={new Date(Date.now() - (3600 * 1000 * 24))}
                    date={date}
                    onChange={(params) => setDate(params.date)}
                  />

                  <Pressable
                    style={[styles.selectDateButton, styles.buttonClose]}
                    onPress={() => [setModalVisible(!modalVisible), setDate(date)]}>
                    <Text style={{ color: '#FFF', textAlign: 'center' }}>Select</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
            <Pressable
              style={[styles.button, styles.buttonOpen, styles.inputStyle]}
              onPress={() => [setModalVisible(true)]}>
              <Text style={styles.textStyle}>{format(new Date(date), 'dd/MM/yyyy')}</Text>
            </Pressable>

            <SelectDropdown
              data={locationsList}
              onSelect={(selectedItem, index) => {
                setLocation(selectedItem.id)
              }}
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View style={styles.dropdownButtonStyle}>
                    <Text style={styles.dropdownButtonTxtStyle}>
                      {(selectedItem && selectedItem.title) || 'Select location'}
                    </Text>
                    <MaterialCommunityIcons name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonIconStyle} />
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                    <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
          <View id="carousel-component" dataSet={{ kind: "custom-animations", name: "multiple" }}>
            <Text style={{ fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 15 }}>Pitch</Text>
            <View style={{ backgroundColor: "#FFF", borderRadius: 10, padding: 10, height: width / 1.8 }}>
              {location ?
                <Carousel
                  loop={false}
                  autoPlay={false}
                  width={width / 3.3}
                  height={width / 1.9}
                  style={{ width: width / 1.15 }}
                  vertical={false}
                  data={pitchList}
                  scrollAnimationDuration={1000}
                  renderItem={({ item }) => (
                    <TouchableOpacity key={item.id} style={{ height: 195 }} onPress={() => getPitchTimeSlots(item.id)}>
                      <View
                        style={{
                          flex: 1,
                          width: 100,
                          borderWidth: 1,
                          borderColor: item.pitch_type == 'NATURAL_TURF' ? '#E2B07E' : '#367E39',
                          justifyContent: 'center',
                          backgroundColor: 
                          item.id == activePitch && item.pitch_type == 'NATURAL_TURF' ? '#A79B7C' 
                          :
                          item.id == activePitch && item.pitch_type == 'ARTIFICIAL_TURF' ? '#3B743D'
                          :
                          item.id != activePitch && item.pitch_type == 'NATURAL_TURF' ? '#E2D1A7': '#4CB050',
                          elevation: item.id == activePitch? 7: 0,
                        }}
                      >
                        <View style={{ borderBottomColor: '#FFF', borderBottomWidth: 2, marginBottom: 0 }}></View>
                        <View style={{ borderBottomColor: '#FFF', borderBottomWidth: 2, marginBottom: 5 }}>
                          <View style={{
                            borderLeftColor: '#FFF',
                            borderRightColor: '#FFF',
                            borderLeftWidth: 1,
                            borderRightWidth: 1,
                            marginLeft: 10,
                            marginRight: 10,
                            height: 20,
                            width: '40px'
                          }} />
                        </View>

                        <Text style={{ textAlign: 'center', fontSize: 10, fontWeight: '900', marginTop: 20 }}>Pitch No.{item.pitch_number}</Text>
                        <Text style={{ textAlign: 'center', fontSize: 10, marginTop: 10, marginBottom: 40 }}>{item.pitch_type.replace('_', ' ')} WICKET</Text>

                        <View style={{ borderBottomColor: '#FFF', borderBottomWidth: 2, marginTop: 0 }}></View>
                        <View style={{ borderBottomColor: '#FFF', borderBottomWidth: 2, marginBottom: 0 }}>
                          <View style={{
                            borderLeftColor: '#FFF',
                            borderRightColor: '#FFF',
                            borderLeftWidth: 1,
                            borderRightWidth: 1,
                            marginLeft: 10,
                            marginRight: 10,
                            height: 20,
                            width: '40px'
                          }} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
                :
                <Text style={{ textAlign: "center", paddingTop: 80 }}>Select a Location</Text>
              }
            </View>
          </View>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 20 }}>Slots</Text>
            </View>

            <View style={{ backgroundColor: "#FFF", borderRadius: 10, height: width / 2.5 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View paddingVertical={10} flexDirection='row'>
                  <MaterialCommunityIcons name='circle-outline' size={16} color="#AAA" />
                  <Text paddingLeft={2} style={{ fontSize: 12 }} fontSize={9}>Available</Text>
                </View>

                <View paddingVertical={10} flexDirection='row'>
                  <MaterialCommunityIcons name='circle' size={16} color="lightgreen" />
                  <Text paddingLeft={2} style={{ fontSize: 12 }}>Selected</Text>
                </View>

                <View paddingVertical={10} flexDirection='row'>
                  <MaterialCommunityIcons name='circle' size={16} color="#AAA" />
                  <Text paddingLeft={2} style={{ fontSize: 12 }}>Booked</Text>
                </View>

                <View paddingVertical={10} flexDirection='row'>
                  <MaterialCommunityIcons name='circle' size={16} color="lightblue" />
                  <Text paddingLeft={2} style={{ fontSize: 12 }}>Reserved</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'col' }}>
                {timeSlotList && selectedPitch ?
                  <View style={{ flexDirection: 'row' }}>
                    {!timeSlotLoader?
                    <Carousel
                      loop={false}
                      autoPlay={false}
                      width={width / 4.5}
                      height={width}
                      style={{ width: width / 1.1 }}
                      vertical={false}
                      data={timeSlotList}
                      scrollAnimationDuration={1000}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity key={item.id} onPress={() => selectSlot(item)} 
                          disabled={bookedTimeSlot.includes(item.id) | reservedTimeSlot.includes(item.id) ? true : false}>
                          {selectedTimeSlots.length > 1 && selectedTimeSlots?.some(slot => slot?.id == item?.id) ?
                            <View key={"selectedTimeSlotView_"+index+1} style={styles.selectedTimeSlotStyle}>
                              <Text key={"selectedTimeSlotText_"+index+1} style={styles.timeSlotTextStyle}>{item.slot_start_time.slice(0, 5)}</Text>
                              <Text key={"selectedTimeSlotText_"+index+2} style={{ fontSize: 10, textAlign: 'center' }}> to </Text>
                              <Text key={"selectedTimeSlotText_"+index+3} style={styles.timeSlotTextStyle}>{item.slot_end_time.slice(0, 5)}</Text>
                            </View>
                            :
                            <View key={"timeSlotView_"+index+1} 
                            style={
                              reservedTimeSlot?.includes(item.id) ? styles.reservedTimeSlotStyle :
                              bookedTimeSlot?.includes(item.id) ? styles.bookedTimeSlotStyle : 
                              styles.timeSlotStyle
                              }>
                              <Text key={"timeSlotText_"+index+1} style={styles.timeSlotTextStyle}>{item.slot_start_time.slice(0, 5)}</Text>
                              <Text key={"timeSlotText_"+index+2} style={{ fontSize: 10, textAlign: 'center' }}> to </Text>
                              <Text key={"timeSlotText_"+index+3} style={styles.timeSlotTextStyle}>{item.slot_end_time.slice(0, 5)}</Text>
                            </View>
                          }
                        </TouchableOpacity>
                      )}
                    />
                    :
                    <ActivityIndicator size="small" width={100} color='#CFCFCF' style={{ marginHorizontal: 'auto', paddingTop: 40 }}/>
                    }
                  </View>
                  :
                  <Text style={{ textAlign: "center", paddingTop: 40 }}>Select a Pitch</Text>
                }
              </View>
            </View>
          </View>

          {selectedTimeSlots && selectedTimeSlots.filter((selectedSlot) => selectedSlot !== undefined)?.length > 0 ?
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 20 }}>Summary</Text>
                <TouchableOpacity
                  style={styles.buttonStyle}
                  activeOpacity={0.5}
                  onPress={() => fetchSummaryData()}
                >
                  <Text style={styles.buttonTextStyle}>Proceed to Booking</Text>
                </TouchableOpacity>

                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={modalSummaryVisible}
                  onRequestClose={() => {
                    setModalSummaryVisible(!modalSummaryVisible);
                  }}>
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                    <ImageBackground source={image} resizeMode="repeat">
                      <Text style={styles.modalSummaryHeaderText}>Booking Summary</Text>
                      <View style={{ flexDirection: 'col' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text>Date</Text>
                          <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                            <Text>{format(new Date(date), 'dd/MM/yyyy')}</Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text>Location</Text>
                          <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                            <Text>{selectedLocationName}</Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text>Pitch Number</Text>
                          <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                            <Text>{selectedPitchNumber}</Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text>Pitch Type</Text>
                          <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                            <Text>{selectedPitchType.replace('_', ' ')}</Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text>Selected Slots</Text>
                          <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                            {
                              selectedTimeSlots.map(slot =>
                                slot!=undefined?
                                <Text key={slot?.id}>{slot?.slot_start_time?.slice(0, 5)} to {slot?.slot_end_time?.slice(0, 5)}</Text>
                                :
                                ''
                              )
                            }
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: '#CFCFCF', borderBottomWidth: 1, paddingBottom: 10 }}>
                          <Text>Amount</Text>
                          <Text>
                            <MaterialCommunityIcons name='currency-inr' size={14} color="#000" />
                            {selectedTimeSlots.filter((selectedSlot) => selectedSlot !== undefined)?.length * 1000 / 2}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                          <TextInput
                            style={styles.couponInputStyle}
                            onChangeText={(CouponCode) => setCouponCode(CouponCode)}
                            underlineColorAndroid="#f000"
                            placeholder="Coupon Code"
                            placeholderTextColor="#8b9cb5"
                            autoCapitalize="none"
                            returnKeyType="next"
                          />
                          <Pressable
                            flex={1}
                            style={[styles.applyCouponButton, styles.buttonClose]}
                            onPress={() => handleCouponDiscount()}
                          >
                            <Text style={{ color: '#FFF', textAlign: 'center' }}>
                              {discountButtonLoader?
                                <ActivityIndicator size="small" color='#FFF' />
                              :
                                "Apply"
                              }
                            </Text>
                          </Pressable>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                          {couponCodeMessage.type == 'Success'?
                            <View style={{ flexDirection: 'row'}}>
                              <Text>Coupon Applied: </Text>
                              <Text style={{color: 'lightgreen', fontWeight: '900'}}>{couponCodeMessage.message}</Text>
                            </View>
                          :
                          <Text style={{color: '#FD8A8A', fontWeight: '900'}}>{couponCodeMessage.message}</Text>
                          }
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20 }}>
                          <Text>Discount</Text>
                          <Text style={{color: 'green'}}>
                            <MaterialCommunityIcons name='currency-inr' size={14} />
                            {totalDiscount}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 0 }}>
                          <Text>Total Payable Amount</Text>
                          <Text>
                            <MaterialCommunityIcons name='currency-inr' size={14} color="#000" />
                            {payableAmount}
                          </Text>
                        </View>
                      </View>
                     
                      <Pressable
                        style={[styles.confirmBookingButton, styles.buttonClose]}
                        onPress={() => handleConfirmBooking()}
                      >
                        <Text style={{ color: '#FFF', textAlign: 'center' }}>
                          {bookingButtonLoader?
                            <ActivityIndicator size="small" color='#FFF' />
                          :
                            "Confirm"
                          }
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.cancelBookingButton, styles.buttonCancel]}
                        onPress={() => [setModalSummaryVisible(!modalSummaryVisible)]}
                      >
                        <Text style={{ color: '#3C364E', textAlign: 'center' }}>Cancel</Text>
                      </Pressable>
                      </ImageBackground>
                    </View>
                  </View>
                </Modal>
                
              </View>

              <View style={{ flexDirection: 'col' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text>Selected Slots</Text>
                  <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                    {
                      selectedTimeSlots.map(slot =>
                        slot!=undefined?
                        <Text key={slot?.id}>{slot?.slot_start_time?.slice(0, 5)} to {slot?.slot_end_time?.slice(0, 5)}</Text>
                        :
                        ''
                      )
                    }
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text>Amount</Text>
                  <Text>
                    <MaterialCommunityIcons name='currency-inr' size={16} color="#000" />
                    {selectedTimeSlots.filter((selectedSlot) => selectedSlot !== undefined)?.length * 1000 / 2}
                  </Text>
                </View>
              </View>
            </View>
            : ""
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NetBookingScreen;

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    width: 200,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  selectedTimeSlotStyle: {
    backgroundColor: "lightgreen",
    borderColor: "#CFCFCF",
    borderWidth: 1,
    borderRadius: 50,
    padding: 10,
    width: 70,
    height: 70,
    flexDirection: 'col',
    margin: 10,
  },
  timeSlotStyle: {
    borderColor: "#CFCFCF",
    borderWidth: 1,
    borderRadius: 50,
    padding: 10,
    width: 70,
    height: 70,
    flexDirection: 'col',
    margin: 10,
  },
  bookedTimeSlotStyle: {
    backgroundColor: "#CFCFCF",
    borderColor: "#CFCFCF",
    borderWidth: 1,
    borderRadius: 50,
    padding: 10,
    width: 70,
    height: 70,
    flexDirection: 'col',
    margin: 10,
  },
  reservedTimeSlotStyle: {
    backgroundColor: "lightblue",
    borderColor: "lightblue",
    borderWidth: 1,
    borderRadius: 50,
    padding: 10,
    width: 70,
    height: 70,
    flexDirection: 'col',
    margin: 10,
  },
  timeSlotTextStyle: {
    paddingTop: 2,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center'
  },
  inputStyle: {
    flex: 1,
    color: '#3C364E',
    backgroundColor: '#FFF',
    paddingLeft: 15,
    paddingRight: 15,
    marginRight: 5,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: "#FFF",
    width: 200,
    height: 50,
  },
  couponInputStyle: {
    flex: 2,
    color: '#3C364E',
    backgroundColor: '#FFF',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: "#CFCFCF",
  },
  buttonStyle: {
    flexDirection: 'row',
    backgroundColor: '#3C364E',
    borderWidth: 0,
    color: '#fff',
    borderColor: '#7DE24E',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(207, 207, 207, 0.9)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  selectDateButton: {
    marginHorizontal: 70,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  applyCouponButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  confirmBookingButton: {
    marginTop: 20,
    marginHorizontal: 80,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  cancelBookingButton: {
    marginTop: 10,
    marginHorizontal: 80,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonCancel: {
    backgroundColor: '#CFCFCF',
    color: '#3C364E'
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#3C364E',
  },
  textStyle: {
    color: '#000',
    paddingLeft: 5,
    paddingTop: 3
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSummaryHeaderText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1
  },
});