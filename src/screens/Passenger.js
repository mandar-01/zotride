import { StyleSheet, Text, View, Image, Pressable, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import Accordion from "../common/accordion";
import { AuthContext } from "../../server/context/authContext";
import { NGROK_TUNNEL } from "@env";

// Images
import background from '../../assets/background.jpg';
import logo from '../../assets/logo.png';

// Styles
import {submit} from '../common/button';

const Passenger = ({ navigation }) => {
    const context = useContext(AuthContext);
    const [hasActivePass, setHasActivePass] = useState(false);
    const [activeRidesPass, setActiveRidesPass] = useState({});
    const [rideIds, setRideIds] = useState([]);

    async function checkActiveRidePass() {
        console.log("Checking if Passenger has an Active ride");
        if(context.user.activePassengerRides && context.user.activePassengerRides.length !== 0) {
            let rides = []
            for (const ride of context.user.activePassengerRides) {
                    try {
                    console.log('Debug');
                    const response = await fetch(NGROK_TUNNEL + `/getRide?rideId=${ride}`, {
                        method: "GET",
                        headers: {
                        "Content-Type": "application/json",
                        }
                    });
                    console.log(response.ok);
                    console.log('Debug');
                    const rdata = await response.json();
                    console.log(rdata);
                    console.log('Debug');
                    rides.push({"rideDetails":rdata.ride});
                } catch(err) {
                    console.log(err);
                }
            }            
            console.log(`Rides ${rides}`);
            setActiveRidesPass(rides);     
            let _idList = result.ride.map((ride) => ride.rideDetails._id);
            console.log(`Ride IDs ${_idList}`);
            setRideIds(_idList);
            context.updateUser({ activePassengerRides: _idList });
            if(!hasActivePass) {
                setHasActivePass(true);
            }
        } else {
            console.log("In here");
            try {
                const response = await fetch(NGROK_TUNNEL + `/findActiveRide?userId=${context.user._id}`, {
                    method: "GET"
                });
                console.log(response.ok);
                console.log('Debug');
                console.log('Debug');
                console.log('Debug');
                console.log('Debug');
                const result = await response.json();
                console.log(result);
                console.log('In Active Ride');
                console.log('Debug');
            
                if (result.active) {
                    console.log("Current User has Active Ride");
                    setHasActivePass(true);
                    console.log(`Ride Result ${JSON.stringify(result.ride)}`);
                    setActiveRidesPass(result.ride);
                    let _idList = result.ride.map((ride) => ride.rideDetails._id);
                    console.log(`ID List ${_idList}`);
                    setRideIds(_idList);
                    context.updateUser({ activePassengerRides: _idList });
                    console.log(`Kaise aaya idhar`)
                } else {
                    console.log("Current User has no Active Ride");
                }
            } catch (err) {
            console.log("Some backend error");
            console.log(err);
            }
        }
    }

    async function populateActiveRides() {
        try {
            console.log(`Active Rides ${rideIds}`);
            console.log('Debug');
            console.log('Debug');
            const response = await fetch(NGROK_TUNNEL + `/populateRides?userId=${context.user._id}`, {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({rides: rideIds})
            });
            console.log(response.ok);
            console.log('Debug');
            const result = await response.json();
            console.log(result);
        } catch(err) {
            console.log("Some backend error");
            console.log(err);
        }
    }

    useEffect(() => {
        checkActiveRidePass();
    }, []);
    
    useEffect(() => {
        const refreshListener = navigation.addListener('focus', () => {
            checkActiveRidePass();
        });
    
        return refreshListener;
      }, [navigation]);

    // useEffect(() => {
    //     console.log(`Rides ${JSON.stringify(activeRidesPass)}`);
    //     if (activeRidesPass.length > 0) {
    //         const _idList = activeRidesPass.map((ride) => ride.rideDetails._id);
    //         context.updateUser({ activePassengerRides: _idList});
    //         setRideIds(_idList);
    //     }
    // }, [activeRidesPass]);

    // useEffect(() => {
    //     populateActiveRides();
    // }, [context]);

    return (
        <View style = {styles.container}>
            <Image style={styles.bg} source={background}></Image>
            <ScrollView>
                <View style = {styles.textContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
                        <Image style={[styles.logo, {width: "25%"}]} source={logo} />
                    </TouchableOpacity>
                    <Text style={styles.text}>Welcome, {context.user.firstName}</Text>
                    {!hasActivePass ? (
                    <View style={{ width: "75%", marginTop: 25 }}>
                        <Pressable
                        style={submit}
                        onPress={() => navigation.navigate("FindRide")}
                        >
                        <Text style={styles.text}>Find a New Ride</Text>
                        </Pressable>
                    </View>
                    ) : (
                        <View style={{ width: '100%', marginTop: 25 }}>
                            <Text style={[styles.text, {marginTop: 20, marginLeft: 10, fontSize: 20}]}>Your Active Rides</Text>
                            <Accordion data={activeRidesPass} />
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

export default Passenger

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    },
    textContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    bg: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
    },
    text: {
        fontSize: 25,
        color: '#000'
    },
    logo: {
        width: '40%',
        height: undefined,
        aspectRatio: 1,
        borderWidth: 2,
        borderColor: '#ffde59',
        borderRadius: 5,
        marginTop: 100,
        marginBottom: 40
    }
});