import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
    ImageBackground,
    ScrollView,
    Modal,
    Pressable,
    ToastAndroid,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import image from '../../Image/aca_background_logo.png';
import DateTimePicker from 'react-native-ui-datepicker';
import { enIN } from 'date-fns/locale';
import { format } from 'date-fns';
import SelectDropdown from 'react-native-select-dropdown';

const AdminBookingScreen = () => {
    const [userId, setUserId] = useState(null);
    const [date, setDate] = useState(new Date());
    const [dateChanged, setDateChanged] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [location, setLocation] = useState('');
    const [locationsList, setLocationsList] = useState([]);
    const [bookingList, setBookingList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [bookingLoader, setBookingLoader] = useState(false);
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [bookingModalLoader, setBookingModalLoader] = useState(false);
    const [confirmBookingButtonLoader, setConfirmBookingButtonLoader] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState([]);
    const [updateBookingButton, setUpdateBookingButton] = useState(false);
    const [bookingPaidAmount, setBookingPaidAmount] = useState(0);
    const [updateBookingAmountButtonLoader, setUpdateBookingAmountButtonLoader] = useState(false);

    const REACT_BACKEND_API_URL = "http://192.168.0.112:8000"

    const getBooking = async (date, location) => {
        setBookingLoader(true)
        const userid = await AsyncStorage.getItem('userid');
        setUserId(userid)
        if(dateChanged){
            const response = await axios.get(REACT_BACKEND_API_URL + '/booking/booking/getfilteredbookinglist?booking_date=' + format(new Date(date), 'yyyy-MM-dd') + '&location=' + location);
            setBookingList(response.data);
            setTimeout(() => {
                setBookingLoader(false)
            }, 100);
        }
        else if(location){
            const response = await axios.get(REACT_BACKEND_API_URL + '/booking/booking/getfilteredbookinglist?location=' + location);
            setBookingList(response.data);
            setTimeout(() => {
                setBookingLoader(false)
            }, 100);
        }
        else{
            const response = await axios.get(REACT_BACKEND_API_URL + '/booking/booking/');
            setBookingList(response.data);
            setTimeout(() => {
                setBookingLoader(false)
            }, 100);
        }
    }

    const fetchLocations = async () => {
        const response = await axios.get(REACT_BACKEND_API_URL + '/booking/location/');
        response.data.map(location => (
            locationsList.push({ "key": location.id, "title": location.name, "id": location.id })
        ))
    }

    useEffect(() => {
        getBooking()
    }, []);

    useEffect(() => {
        getBooking(date, location)
    }, [date]);

    useEffect(() => {
        getBooking(date, location)
    }, [location]);

    const onRefresh = useCallback(() => {
        getBooking(date, location);
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    useEffect(() => {
        if (locationsList.length < 1) {
            fetchLocations()
        }
    }, [locationsList]);

    const updateBooking = async (booking, status) => {
        setConfirmBookingButtonLoader(true)
        const data = {
            status: status=="CONFIRMED"?"CONFIRMED":"CANCELLED",
            modified_by: userId
        }

        const message = {
            success : status=="CONFIRMED"?"Booking Confirmed":"Booking Cancelled",
            failed : status=="CONFIRMED"?"Booking Confirmation Failed":"Booking Cancellation Failed",
        }

        const response = await axios.put(REACT_BACKEND_API_URL + '/booking/booking/' + booking.id + "/", data, { headers: { "Content-Type": "application/json" } });

        if (response.status == '200') {
            ToastAndroid.showWithGravity(message.success, ToastAndroid.LONG, ToastAndroid.TOP);
        }
        else {
            ToastAndroid.showWithGravity(message.failed, ToastAndroid.LONG, ToastAndroid.TOP);
        }
        setConfirmBookingButtonLoader(false)
        getBooking(date, location)
        setTimeout(() => {
            setBookingModalVisible(!bookingModalVisible)
        }, 100);
    }


    const updateBookingPaidAmount = async (booking, bookingPaidAmount) => {
        setUpdateBookingAmountButtonLoader(true)
        if(bookingPaidAmount>booking.balance_amount){
            ToastAndroid.showWithGravity("Amount greater than balance amount", ToastAndroid.LONG, ToastAndroid.TOP);
            setUpdateBookingAmountButtonLoader(false)
        }
        else{
            const data = {
                paid_amount: parseInt(booking.paid_amount) + parseInt(bookingPaidAmount),
                balance_amount: parseInt(booking.balance_amount) - parseInt(bookingPaidAmount),
                transaction_amount: parseInt(bookingPaidAmount),
                modified_by: userId
            }
    
            const message = {
                success : "Booking Amount Updated",
                failed : "Booking Updation Failed",
            }
    
            const response = await axios.put(REACT_BACKEND_API_URL + '/booking/booking/' + booking.id + "/", data, { headers: { "Content-Type": "application/json" } });
    
            if (response.status == '200') {
                ToastAndroid.showWithGravity(message.success, ToastAndroid.LONG, ToastAndroid.TOP);
            }
            else {
                ToastAndroid.showWithGravity(message.failed, ToastAndroid.LONG, ToastAndroid.TOP);
            }
            setUpdateBookingButton(false)
            setUpdateBookingAmountButtonLoader(false)
            getBooking(date, location)
            setTimeout(() => {
                setBookingModalVisible(!bookingModalVisible)
            }, 100);
        }
        
    }

    const getPaymentTransactions = (transactions) => {
        if(transactions!=undefined && transactions!="" && transactions!=null){
            const transaction_list = []
            const transactions_data = JSON.parse(transactions)
            transaction_list.push(JSON.parse(transactions_data))

            return(
                transaction_list[0]?.map(transaction => (
                    <View style={{ flexDirection: 'col'}}>
                        <Text style={{ textAlign: 'right' }}>
                            <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                            {transaction?.amount}
                        </Text>
                        <Text style={{ fontSize: 10}}>
                            {transaction?.paid_on}
                        </Text>
                    </View>
                ))
            )
        }
        else{
            return(
                <Text style={{ fontSize: 12}}>No Transactions</Text>
            )
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 16, marginBottom: 50 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
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
                                    date={date}
                                    onChange={(params) => [setDate(params.date), setDateChanged(true)]}
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
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {!bookingLoader ?
                    bookingList.length > 0 ?
                        bookingList.map(booking => (
                            <Pressable
                                style={{ paddingHorizontal: 16, paddingBottom: 16 }}
                                onPress={() => [setBookingModalVisible(!bookingModalVisible), setSelectedBooking(booking)]}
                            >
                                <View style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 20 }}>
                                    <ImageBackground source={image} resizeMode="cover">
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, }}>
                                            <Text style={{ fontWeight: '900', fontSize: 20 }}>
                                                {booking?.status=='CONFIRMED'?'':
                                                booking?.status=='CANCELLED'? '': 'OTP: 5451'}
                                            </Text>
                                            <View style={{ flexDirection: 'row' }}>
                                                <MaterialCommunityIcons 
                                                    name={booking?.status=='CONFIRMED'? 'check-circle': booking?.status=='CANCELLED'? 'close-circle': 'circle-slice-3'}
                                                    color={booking?.status=='CONFIRMED'? 'lightgreen': booking?.status=='CANCELLED'? '#FD8A8A': ''} 
                                                    size={16} style={{ paddingTop: 5, paddingRight: 10 }} />
                                                <Text style={{ fontWeight: '900', 
                                                                fontSize: 20, 
                                                                color: booking?.status=='CONFIRMED'? 'lightgreen': booking?.status=='CANCELLED'? '#FD8A8A':'' }}>
                                                    {booking.status}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 12, fontWeight: '900' }}>{booking.booking_date}</Text>
                                            <Text style={{ fontWeight: '900' }}>|</Text>
                                            <Text style={{ fontSize: 12, fontWeight: '900' }}>{booking.pitch_data?.location_data?.name}</Text>
                                            <Text style={{ fontWeight: '900' }}>|</Text>
                                            <Text style={{ fontSize: 12, fontWeight: '900' }}>{booking.pitch_data?.pitch_type.replace("_", " ")}</Text>
                                            <Text style={{ fontWeight: '900' }}>|</Text>
                                            <Text style={{ fontSize: 12, fontWeight: '900' }}>Pitch {booking.pitch_data?.pitch_number}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ marginTop: 20 }}>
                                                    Booking Amount:
                                                </Text>
                                                <Text style={{ marginTop: 20 }}>
                                                    <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                                    {booking.total_amount}
                                                </Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text>
                                                    Discount Redeemed:
                                                </Text>
                                                <Text>
                                                    <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                                    {booking.discount}
                                                </Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text>
                                                    Net Amount:
                                                </Text>
                                                <Text>
                                                    <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                                    {booking.net_amount}
                                                </Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text>
                                                    Paid:
                                                </Text>
                                                <Text>
                                                    <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                                    {booking.paid_amount}
                                                </Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text>
                                                    Balance:
                                                </Text>
                                                <Text>
                                                    <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                                    {booking.balance_amount}
                                                </Text>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>
                            </Pressable>
                        ))
                        :
                        <Text style={{ textAlign: "center" }}>No Bookings Found</Text>
                    :

                    <ActivityIndicator size="large" width={100} color='#CFCFCF' style={{ marginHorizontal: 'auto', paddingTop: 40 }} />
                }
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={bookingModalVisible}
                onRequestClose={() => {
                    setBookingModalVisible(!bookingModalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {!bookingModalLoader ?
                            <ImageBackground source={image} resizeMode="cover">
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <MaterialCommunityIcons 
                                            name={selectedBooking?.status=='CONFIRMED'? 'check-circle': selectedBooking?.status=='CANCELLED'? 'close-circle': 'circle-slice-3'}
                                            color={selectedBooking?.status=='CONFIRMED'? 'lightgreen': selectedBooking?.status=='CANCELLED'? '#FD8A8A': ''} 
                                            size={16} style={{ paddingTop: 5, paddingRight: 10 }} />
                                        <Text style={{ fontWeight: '900', 
                                                        fontSize: 20, 
                                                        color: selectedBooking?.status=='CONFIRMED'? 'lightgreen': selectedBooking?.status=='CANCELLED'? '#FD8A8A':'' }}>
                                            {selectedBooking.status}
                                        </Text>
                                    </View>

                                    <Pressable
                                        style={[styles.modalCloseButton, styles.buttonClose]}
                                        onPress={() => [setBookingModalVisible(!bookingModalVisible), setUpdateBookingButton(false)]}>
                                        <MaterialCommunityIcons name='close' size={16} color="#FFF" />
                                    </Pressable>
                                </View>

                                <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginTop: 0 }}>
                                            Booking For:
                                        </Text>
                                        <Text style={{ marginTop: 0, fontWeight: 900 }}>
                                            {selectedBooking?.booking_for_data?.first_name} {selectedBooking?.booking_for_data?.last_name}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginTop: 0 }}>
                                            Contact Number:
                                        </Text>
                                        <Text style={{ marginTop: 0 }}>
                                            {selectedBooking?.booking_for_data?.mobile}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginTop: 0 }}>
                                            Booking Date:
                                        </Text>
                                        <Text style={{ marginTop: 0 }}>
                                            {selectedBooking?.booking_date}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginTop: 0 }}>
                                            Location:
                                        </Text>
                                        <Text style={{ marginTop: 0 }}>
                                            {selectedBooking?.pitch_data?.location_data?.name}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginTop: 0 }}>
                                            Pitch Type:
                                        </Text>
                                        <Text style={{ marginTop: 0 }}>
                                            {selectedBooking?.pitch_data?.pitch_type.replace("_", " ")}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: 'lightgrey', borderBottomWidth: 1, paddingBottom: 10 }}>
                                        <Text style={{ marginTop: 0 }}>
                                            Pitch Number:
                                        </Text>
                                        <Text style={{ marginTop: 0 }}>
                                        Pitch {selectedBooking?.pitch_data?.pitch_number}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'col', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginTop: 10 }}>
                                            Booking Amount:
                                        </Text>
                                        <Text style={{ marginTop: 10 }}>
                                            <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                            {selectedBooking?.total_amount}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text>
                                            Discount Redeemed:
                                        </Text>
                                        <Text>
                                            <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                            {selectedBooking?.discount}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text>
                                            Net Amount:
                                        </Text>
                                        <Text>
                                            <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                            {selectedBooking?.net_amount}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text>
                                            Paid:
                                        </Text>
                                        {updateBookingButton?
                                            <View>
                                                <MaterialCommunityIcons
                                                    name='currency-inr'
                                                    size={16}
                                                    color="#000"
                                                    style={styles.rupeeIcon}
                                                />
                                                <TextInput
                                                    style={styles.paidAmountInputStyle}
                                                    onChangeText={(BookingPaidAmount) => setBookingPaidAmount(BookingPaidAmount)}
                                                    keyboardType="decimal-pad"
                                                    blurOnSubmit={false}
                                                    underlineColorAndroid="#f000"
                                                    returnKeyType="next"
                                                />
                                            </View>
                                            :
                                            <Text>
                                                <MaterialCommunityIcons name='currency-inr' size={13} style={{ paddingRight: 10 }} />
                                                {selectedBooking?.paid_amount}
                                            </Text>
                                        }
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: 'lightgrey', borderBottomWidth: 1, paddingBottom: 10 }}>
                                        <Text>
                                            Balance:
                                        </Text>
                                        <Text style={{ color: selectedBooking.balance_amount > 0 ? '#FD8A8A' : '#000' }}>
                                            <MaterialCommunityIcons name='currency-inr' size={13}
                                                style={{ paddingRight: 10 }} />
                                            {selectedBooking?.balance_amount}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
                                        <Text>
                                            Transactions:
                                        </Text>
                                        <View style={{ flexDirection: 'col' }}>
                                            {getPaymentTransactions(selectedBooking?.payment_transactions)}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                                    {updateBookingButton?
                                        <Pressable
                                            style={[styles.modalActionButton, styles.buttonUpdateBooking]}
                                            onPress={() => updateBookingPaidAmount(selectedBooking, bookingPaidAmount)}
                                            >
                                            {!updateBookingAmountButtonLoader?
                                                <Text style={{ color: '#000', textAlign: 'center' }}>
                                                    {confirmBookingButtonLoader?
                                                        <ActivityIndicator size="small" color='#FFF' />
                                                    :
                                                        "Update"
                                                    }
                                                </Text>
                                            :
                                                <ActivityIndicator size="small" color='#FFF' />
                                            }
                                            
                                        </Pressable>
                                        :
                                        <Pressable
                                            style={[styles.modalActionButton, styles.buttonEditBooking]}
                                            onPress={() => setUpdateBookingButton(true)}
                                            >
                                            <Text style={{ color: '#FFF', textAlign: 'center' }}>
                                                {confirmBookingButtonLoader?
                                                    <ActivityIndicator size="small" color='#FFF' />
                                                :
                                                    "Edit"
                                                }
                                            </Text>
                                        </Pressable>
                                    }
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                                    <Pressable
                                        style={[styles.modalActionButton, 
                                            selectedBooking?.status=='CONFIRMED'|selectedBooking?.status=='CANCELLED'?styles.buttonDisabled:styles.buttonConfirmBooking]}
                                        onPress={() => updateBooking(selectedBooking, 'CONFIRMED')}
                                        disabled={selectedBooking?.status=='CONFIRMED'|'CANCELLED'?true:false}
                                        >
                                        <Text style={{ color: '#000', textAlign: 'center' }}>
                                            {confirmBookingButtonLoader?
                                                <ActivityIndicator size="small" color='#FFF' />
                                            :
                                                "Confirm Booking"
                                            }
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={[styles.modalActionButton, 
                                            selectedBooking?.status=='CONFIRMED'|selectedBooking?.status=='CANCELLED'?styles.buttonDisabled:styles.buttonCancelBooking]}
                                        onPress={() => updateBooking(selectedBooking, 'CANCELLED')}
                                        disabled={selectedBooking?.status=='CONFIRMED'|'CANCELLED'?true:false}
                                        >
                                        <Text style={{ color: '#000', textAlign: 'center' }}>
                                            {confirmBookingButtonLoader?
                                                <ActivityIndicator size="small" color='#FFF' />
                                            :
                                                "Cancel Booking"
                                            }   
                                        </Text>
                                    </Pressable>
                                </View>
                            </ImageBackground>
                            :
                            <ActivityIndicator size="small" width={100} color='#CFCFCF' style={{ marginHorizontal: 'auto', paddingVertical: 40 }} />
                        }
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default AdminBookingScreen;

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
    paidAmountInputStyle: {
        color: '#3C364E',
        backgroundColor: '#FFF',
        paddingLeft: 10,
        paddingRight: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#000",
        width: 80,
        height: 20
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
    modalCloseButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    modalActionButton: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 12,
        elevation: 2,
    },
    buttonConfirmBooking: {
        backgroundColor: 'lightgreen'
    },
    buttonCancelBooking: {
        backgroundColor: '#FD8A8A'
    },
    buttonDisabled: {
        backgroundColor: 'lightgrey',
        color: '#FFF'
    },
    buttonEditBooking: {
        backgroundColor: 'grey',
        color: '#FFF',
        paddingHorizontal: 50
    },
    buttonUpdateBooking: {
        backgroundColor: 'lightblue',
        color: '#000',
        paddingHorizontal: 50
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
        flex: 1,
        paddingBottom: 20,
    },
    rupeeIcon: {
        position: 'absolute',
        zIndex: 100,
        marginLeft: -15,
        marginTop: 2
    }
});