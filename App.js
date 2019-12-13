/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import firebase from 'react-native-firebase';

import React, {Component} from 'react';
import {View, Text, Alert, Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const OS = Platform.OS === 'ios' ? 'iOS' : 'Android';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }

  //1 Check permissions
  async checkPermission() {
    firebase
      .messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {
          // user has permissions
          console.log('permissions accept');
          this.getToken();
        } else {
          // user doesn't have permission
          console.log('permissions reject');
          this.requestPermission();
        }
      });

    // const enabled = await firebase.messaging().hasPermission();
    // if (enabled) {
    //   this.getToken();
    // } else {
    //   this.requestPermission();
    // }
  }

  //2 Request permissions
  async requestPermission() {
    firebase
      .messaging()
      .requestPermission()
      .then(() => {
        // User has authorised
        console.log('permissions accept in requestPermission');
        this.getToken();
      })
      .catch(error => {
        // User has rejected permissions
        console.log('permission rejected');
      });
  }

  //3
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log('before fcmToken: ', fcmToken);
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        try {
          await firebase
            .database()
            .ref('devices_token/')
            .push(fcmToken)
            .then(res => res.json())
            .then(res => {
              console.log(res);
            })
            .catch(err => {
              console.log(err);
            });
          await AsyncStorage.setItem('fcmToken');
        } catch (error) {
          // User has rejected permissions
          console.log(error);
        }
      }
    }
  }

  ////////////////////// Add these methods //////////////////////

  //Remove listeners allocated in createNotificationListeners()
  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  async createNotificationListeners() {
    /*
     * Triggered when a particular notification has been received in foreground
     */

    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const {title, data} = notification;
        this.showAlert(title, data);
        console.log('1');
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     */

    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        const {title, data} = notificationOpen.notification;
        this.showAlert(title, data);
        console.log('2');
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const {title, body, data} = notificationOpen.notification;
      this.showAlert(title, data);
      console.log('3');
    }
    /*
     * Triggered for data only payload in foreground
     */
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
      console.log(JSON.stringify(message));
      console.log('4');
    });
  }

  showAlert(title, data) {
    Alert.alert(
      (title = title),
      (body = data),
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  }
  render() {
    return (
      <View>
        <Text> vdfgdf </Text>
      </View>
    );
  }
}

export default App;
