import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, RefreshControl, ImageBackground, Dimensions, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import image from '../../Image/aca_background_logo.png';
import SelectDropdown from 'react-native-select-dropdown';
import { LineChart, ContributionGraph } from "react-native-chart-kit";
import { ScrollView } from 'react-native-gesture-handler';
import { format } from 'date-fns';

const AdminDashboardScreen = () => {
    const [userId, setUserId] = useState(null);
    const [selectLoader, setSelectLoader] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState(0);
    const [pendingBooking, setPendingBooking] = useState(0);
    const [cancelledBooking, setCancelledBooking] = useState(0);
    const [paidBookingAmount, setPaidBookingAmount] = useState(0);
    const [balanceBookingAmount, setBalanceBookingAmount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [filterList, setFilterList] = useState([]);
    const [filter, setFilter] = useState(2);
    const [dashboardLoader, setDashboardLoader] = useState(false);
    const [lineChartXAxisData, setLineChartXAxisData] = useState([0]);
    const [lineChartYAxisData, setLineChartYAxisData] = useState([0]);
    const [graphRange, setGraphRange] = useState("");
    const [bookingsByDay, setBookingsByDay] = useState([]);
    const [dailyBookingModalVisible, setDailyBookingModalVisible] = useState(false);
    const [dailyBookingModalDate, setDailyBookingModalDate] = useState("");
    const [dailyBookingModalCount, setDailyBookingModalCount] = useState(0);


    const REACT_BACKEND_API_URL = "http://192.168.0.112:8000"

    const getBooking = async (filter) => {
        setDashboardLoader(true)
        setSelectLoader(true)
        const userid = await AsyncStorage.getItem('userid');
        setUserId(userid)

        const url_filter = filter == 2 ? "?range=Past Week" : filter == 3 ? "?range=Past Month" : filter == 4 ? "?range=Past Year" : "?range="
        const booking_list = await axios.get(REACT_BACKEND_API_URL + '/booking/booking/getbookinglistbydaterange' + url_filter);

        const confirmed_booking = booking_list?.data?.filter(booking => booking.status == "CONFIRMED")
        const pending_booking = booking_list?.data?.filter(booking => booking.status == "BOOKED")
        const cancelled_booking = booking_list?.data?.filter(booking => booking.status == "CANCELLED")

        setConfirmedBooking(confirmed_booking?.length);
        setPendingBooking(pending_booking?.length);
        setCancelledBooking(cancelled_booking?.length);

        setPaidBookingAmount(booking_list?.data?.reduce((total, booking) => {
            return booking.status !== "CANCELLED" ? total + booking.paid_amount : total;
        }, 0))

        setBalanceBookingAmount(booking_list?.data?.reduce((total, booking) => {
            return booking.status !== "CANCELLED" ? total + booking.balance_amount : total;
        }, 0))

        // ----------------------------------Line Chart---------------------------------------------
        let line_chart_x_axis_data = []
        let line_chart_x_axis_data_temp = []
        let line_chart_y_axis_data = []

        if(filter==1){
            let last_booking_year = booking_list?.data?.[0]['booking_year']
            let first_booking_year = booking_list?.data?.[booking_list?.data?.length-1]['booking_year']
            const yearly_data = groupByYear(booking_list?.data)

            const graphStart = first_booking_year
            const graphEnd = last_booking_year
            setGraphRange(graphStart + " to " + graphEnd)

            while(first_booking_year<=last_booking_year){
                line_chart_x_axis_data.push(first_booking_year)
                first_booking_year+=1
            }

            for(year in yearly_data){
                let index = line_chart_x_axis_data.findIndex(x => x == year)
                line_chart_y_axis_data.splice(index, 0, yearly_data[year]['totalAmount']);
            }

            const daily_bookings_data = bookingsPerDay(booking_list?.data)
            setBookingsByDay(daily_bookings_data)

            setLineChartXAxisData(line_chart_x_axis_data)
            setLineChartYAxisData(line_chart_y_axis_data)        
        }
        if(filter==2 || filter==3){
            let first_booking_day = booking_list?.data?.[0]['booking_date']
            let last_booking_day = booking_list?.data?.[booking_list?.data?.length-1]['booking_date']

            const daily_data = groupByDay(booking_list?.data)

            let first_date = new Date(first_booking_day)
            let last_date = new Date(last_booking_day)

            const graphStart = format(new Date(first_date), 'dd/MM/yyyy')
            const graphEnd = format(new Date(last_date), 'dd/MM/yyyy')
            setGraphRange(graphStart + " to " + graphEnd)

            while(first_date<=last_date){
                let date = format(new Date(first_date), 'dd MMM')
                let temp_date = format(new Date(first_date), 'yyyy-MM-dd')
                line_chart_x_axis_data.push(date)
                line_chart_x_axis_data_temp.push(temp_date)
                first_date.setDate(first_date.getDate() + 1);
            }

            for(let i=0;i<line_chart_x_axis_data.length-1;i++){
                line_chart_y_axis_data.push(0)
            }

            for(day in daily_data){
                let index = line_chart_x_axis_data_temp.findIndex(x => x == day)
                line_chart_y_axis_data[index] = daily_data[day]['totalAmount']
            } 

            const daily_bookings_data = bookingsPerDay(booking_list?.data)
            setBookingsByDay(daily_bookings_data)

            setLineChartXAxisData(line_chart_x_axis_data)
            setLineChartYAxisData(line_chart_y_axis_data)            
        }
        if(filter==4){
            let first_booking_month = booking_list?.data?.[0]['booking_month']
            let last_booking_month = booking_list?.data?.[booking_list?.data?.length-1]['booking_month']
            const monthly_data = groupByMonth(booking_list?.data)

            const graphStart = new Date(0, first_booking_month).toLocaleString('en-US', { month: 'short' })
            const graphEnd = new Date(0, last_booking_month).toLocaleString('en-US', { month: 'short' })
            setGraphRange(graphStart + " to " + graphEnd)
            
            while(first_booking_month<=last_booking_month){
                let month = new Date(0, first_booking_month).toLocaleString('en-US', { month: 'short' });
                line_chart_x_axis_data.push(month)
                first_booking_month+=1
            }

            for(month in monthly_data){
                let month_name = new Date(0, month).toLocaleString('en-US', { month: 'short' });
                let index = line_chart_x_axis_data.findIndex(x => x == month_name)
                line_chart_y_axis_data.splice(index, 0, monthly_data[month]['totalAmount']);
            }

            const daily_bookings_data = bookingsPerDay(booking_list?.data)
            setBookingsByDay(daily_bookings_data)

            setLineChartXAxisData(line_chart_x_axis_data)
            setLineChartYAxisData(line_chart_y_axis_data)          
        }

        setTimeout(() => {
            setDashboardLoader(false)
            setSelectLoader(false)
        }, 100);
    }

    const groupByYear = (data) => {
        return data.reduce((acc, item) => {
          const year = item.booking_year;
          if (!acc[year]) {
            acc[year] = { totalAmount: 0, paid_amount: []};
          }
          acc[year].totalAmount += item.paid_amount;
          acc[year].paid_amount.push(parseInt(item.paid_amount));
          return acc;
        }, {});
      };

    const groupByDay = (data) => {
        return data.reduce((acc, item) => {
            const day = item.booking_day;
            if (!acc[day]) {
            acc[day] = { totalAmount: 0, paid_amount: []};
            }
            acc[day].totalAmount += item.paid_amount;
            acc[day].paid_amount.push(parseInt(item.paid_amount));
            return acc;
        }, {});
    };

    const groupByMonth = (data) => {
        return data.reduce((acc, item) => {
            const month = item.booking_month;
            if (!acc[month]) {
            acc[month] = { totalAmount: 0, paid_amount: []};
            }
            acc[month].totalAmount += item.paid_amount;
            acc[month].paid_amount.push(parseInt(item.paid_amount));
            return acc;
        }, {});
    };  
    
    const bookingsPerDay = (data) => {
        return data.reduce((booking, item) => {
            const date = item.booking_date;
            if (!booking[date]) {
                booking[date] = { count: 1, date: date};
            }
            booking[date].count += 1;
            booking[date].date == date;

            const booking_list = Object.values(booking)
            return booking_list;
        }, {});
    }

    const fetchFilter = async () => {
        setFilterList([
            { "key": 1, "title": "All", "id": 1 },
            { "key": 2, "title": "Past 7 Days", "id": 2 },
            { "key": 3, "title": "Past 30 Days", "id": 3 },
            { "key": 4, "title": "Past Year", "id": 4 }
        ])
    }

    useEffect(() => {
        getBooking(filter)
        fetchFilter()
    }, []);

    useEffect(() => {
        getBooking(filter)
    }, [filter]);

    const onRefresh = useCallback(() => {
        getBooking(filter);
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const showDailyBookings = (date, count) => {
        setDailyBookingModalVisible(true)
        setDailyBookingModalDate(date)
        setDailyBookingModalCount(count)
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1, flexDirection: 'col', padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        {!selectLoader?
                            <SelectDropdown
                                data={filterList}
                                onSelect={(selectedItem, index) => {
                                    setFilter(selectedItem.id)
                                }}
                                renderButton={(selectedItem, isOpened) => {
                                    return (
                                        <View style={styles.dropdownButtonStyle}>
                                            <Text style={styles.dropdownButtonTxtStyle}>
                                                {(selectedItem && selectedItem.title) || 'Past 7 Days'}
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
                        :
                            <ActivityIndicator size="small" width={100} color='#CFCFCF' style={styles.dropdownButtonStyle} />
                        }
                    </View>

                    <View>
                        <LineChart
                            data={{
                                labels: lineChartXAxisData?lineChartXAxisData:[0],
                                datasets: [
                                    {
                                        data : lineChartYAxisData?lineChartYAxisData:[0]
                                    }
                                ],
                                legend: [graphRange]
                            }}
                            width={Dimensions.get("window").width / 1.1} // from react-native
                            height={260}
                            fromZero={true}
                            xLabelsOffset={20}
                            verticalLabelRotation={270}
                            yAxisLabel="₹"
                            yAxisSuffix=""
                            yAxisInterval={1} // optional, defaults to 1
                            chartConfig={{
                                backgroundColor: "#746996",
                                backgroundGradientFrom: "#3C364E",
                                backgroundGradientTo: "#746996",
                                decimalPlaces: 0, // optional, defaults to 2dp
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                style: {
                                    borderRadius: 10,
                                },
                                propsForDots: {
                                    r: "5",
                                    strokeWidth: "2",
                                    stroke: "#3C364E"
                                }
                            }}
                            bezier
                            style={{
                                marginTop: 10,
                                marginBottom: 20,
                                borderRadius: 20
                            }}
                        />
                    </View>

                    <Text style={{ marginVertical: 15, fontSize: 16, fontWeight: 900 }}>Bookings By Day</Text>
                    <View>
                        <ContributionGraph
                            values={bookingsByDay}
                            endDate={new Date()}
                            numDays={90}
                            width={Dimensions.get("window").width/1.1}
                            height={220}
                            chartConfig={{
                                backgroundColor: "#746996",
                                backgroundGradientFrom: "#3C364E",
                                backgroundGradientTo: "#746996",
                                color: (opacity) => `rgba(255, 255, 255, ${opacity})`,
                                strokeWidth: 2, // optional, default 3
                                barPercentage: 0.5,
                                useShadowColorFromDataset: false, // optional
                                style: {
                                    borderRadius: 20
                                }
                            }}
                            // onDayPress={({date, count}) => count>1?Alert.alert(`Date: ${date}`, `Bookings: ${count}`):""}
                            onDayPress={({date, count}) => count>1?showDailyBookings(date, count):""}
                        />
                    </View>

                    <Text style={{ marginVertical: 15, fontSize: 16, fontWeight: 900 }}>Bookings</Text>
                    {!dashboardLoader ?
                        <View style={{
                            flexDirection: 'row',
                            borderColor: 'lightgrey',
                            borderWidth: 1,
                            paddingVertical: 40,
                            paddingHorizontal: 20,
                            borderRadius: 20,
                            backgroundColor: '#FFF'
                        }}>
                            <View style={{ flex: 1, flexDirection: 'col' }}>
                                <Text style={{ fontSize: 30, fontWeight: 900 }}>{confirmedBooking}</Text>
                                <Text>Confirmed</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'col' }}>
                                <Text style={{ textAlign: 'center', fontSize: 30, fontWeight: 900 }}>{pendingBooking}</Text>
                                <Text style={{ textAlign: 'center' }}>Pending</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'col' }}>
                                <Text style={{ textAlign: 'right', fontSize: 30, fontWeight: 900 }}>{cancelledBooking}</Text>
                                <Text style={{ textAlign: 'right' }}>Cancelled</Text>
                            </View>
                        </View>
                        :
                        <View style={{
                            flexDirection: 'row',
                            borderColor: 'lightgrey',
                            borderWidth: 1,
                            paddingVertical: 40,
                            paddingHorizontal: 20,
                            borderRadius: 20,
                            backgroundColor: '#FFF'
                        }}>
                            <ActivityIndicator size="small" width={100} color='#CFCFCF' style={{ marginHorizontal: 'auto', paddingVertical: 20 }} />
                        </View>
                    }

                    <Text style={{ marginVertical: 15, fontSize: 16, fontWeight: 900 }}>Revenue</Text>
                    {!dashboardLoader ?
                        <View style={{
                            flexDirection: 'row',
                            borderColor: 'lightgrey',
                            borderWidth: 1,
                            paddingVertical: 40,
                            paddingHorizontal: 20,
                            borderRadius: 20,
                            backgroundColor: '#FFF',
                            marginBottom: 50
                        }}>
                            <View style={{ flex: 1, flexDirection: 'col' }}>
                                <Text style={{ fontSize: 30, fontWeight: 900 }}>
                                    <MaterialCommunityIcons name='currency-inr' size={25} style={{ paddingRight: 10 }} />
                                    {paidBookingAmount}
                                </Text>
                                <Text>Paid</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'col' }}>
                                <Text style={{ textAlign: 'right', fontSize: 30, fontWeight: 900 }}>
                                    <MaterialCommunityIcons name='currency-inr' size={25} style={{ paddingRight: 10 }} />
                                    {balanceBookingAmount}
                                </Text>
                                <Text style={{ textAlign: 'right' }}>Balance</Text>
                            </View>
                        </View>
                        :
                        <View style={{
                            flexDirection: 'row',
                            borderColor: 'lightgrey',
                            borderWidth: 1,
                            paddingVertical: 40,
                            paddingHorizontal: 20,
                            borderRadius: 20,
                            backgroundColor: '#FFF'
                        }}>
                            <ActivityIndicator size="small" width={100} color='#CFCFCF' style={{ marginHorizontal: 'auto', paddingVertical: 20 }} />
                        </View>
                    }

                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={dailyBookingModalVisible}
                        onRequestClose={() => {
                            setDailyBookingModalVisible(!dailyBookingModalVisible);
                        }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.modalHeaderText}>Booking Date: </Text>
                                    <Text style={styles.modalText}>{dailyBookingModalDate}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.modalHeaderText}>Total Bookings: </Text>
                                    <Text style={styles.modalText}>{dailyBookingModalCount}</Text>
                                </View>
                                <Pressable
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => setDailyBookingModalVisible(!dailyBookingModalVisible)}>
                                    <Text style={{ color: '#FFF', textAlign: 'center' }}>Ok</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default AdminDashboardScreen;


const styles = StyleSheet.create({
    dropdownButtonStyle: {
        width: 160,
        height: 40,
        backgroundColor: '#FFF',
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 12,
        marginBottom: 10
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(207, 207, 207, 0.9)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        shadowColor: '#000',
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
        marginBottom: 10,
        textAlign: 'left',
    },
    buttonClose: {
        backgroundColor: '#3C364E',
    },
    button: {
        marginHorizontal: 80,
        borderRadius: 20,
        marginTop: 30,
        padding: 10,
        elevation: 2,
    },
})