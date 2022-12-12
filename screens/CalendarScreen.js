import { StyleSheet, View, TouchableOpacity, Modal, TextInput, Keyboard } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Button, Text } from 'react-native-paper';
import {  Agenda } from 'react-native-calendars';
import { Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebase';
import { onSnapshot, doc, addDoc, collection, query, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const CalendarScreen = () => {
  const [items, setItems] = useState({});
  const [modalVisible, setModalVisible] = useState(false)
  const [eventTitle, setEventTitle] = useState(null)
  const [userDetails, setUserDetails] = useState([])
  const [time, setTime] = useState(new Date(Date.now()));
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date(Date.now()));
  const [loading, setLoading] = useState(false)

  //Get User data from DB
  useEffect(() => {
    try {
      const getData = async () => {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          setUserDetails(() => ({ ...docSnap.data() }));
        }
      }
      getData();
    } catch (err) {
      console.log(err)
    }
  }, [loading]);

  const calendarRef = collection(
    db,
    'Families',
    `${userDetails.familyId}`,
    'Calendar'
  );

  //Get Agenda data from DB
  useFocusEffect(
    useCallback(() => {
      let newItems = {}
      const q = query(calendarRef)
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach((doc) => {
          Object.assign(newItems, doc.data())
        })
        setItems(newItems)
      });
      return () => unsubscribe();
    }, [userDetails])
  )

  // useEffect(() => {
  //   if (items === {}) {
  //     loadItems()
  //   }
  // }, [items])

  const loadItems = () => {
    setTimeout(() => {
      console.log('Items Loaded!')
    }, 1000);
  };

  const toggleModalView = () => {
    setModalVisible(!modalVisible);
  };


  // Add Event to DB
  const handleAddEvent = () => {
    addDoc(collection(doc(collection(db, 'Families'), `${userDetails.familyId}`),
      'Calendar'
    ),
      {
        [`${date.toISOString().split('T')[0]}`]:
          [{ 'startTime': [`${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`], 'name': [`${eventTitle}`] }]
      })
      setLoading(!loading)
  };

  // function reloadAgenda() {
  //   setItems({})
  // }

  function onDateSelected(event, value) {
    setDate(value)
  };

  function onStartTimeSelected(event, value) {
    setStartTime(value);
  };

  // Render each Event to Agenda view
  const renderItem = (item) => {
    return (
      <TouchableOpacity style={{ marginRight: 10, marginTop: 17 }}>
        <Card>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text>
                {`${item.startTime} - ${item.name}`}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // Modal pop up for adding events
  return (
    <View style={{ flex: 1 }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
        style={styles.addEventModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ flexDirection: 'row', width: '90%', marginTop: 10, marginBottom: 20 }}>
              <View style={styles.leftContainer}>
                <Text
                  style={{ color: 'red' }}
                  onPress={toggleModalView}
                  variant="bodyLarge"
                >
                  Cancel
                </Text>
              </View>
              <Text
                style={{ alignSelf: 'center' }}
                variant="bodyLarge"
              >
                New Event
              </Text>
              <View style={styles.rightContainer}>
                <Text
                  style={{ color: 'red' }}
                  onPress={() => { toggleModalView(), handleAddEvent(), loadItems() }}
                  variant="bodyLarge"
                >
                  Add
                </Text>
              </View>
            </View>
            <View style={{ width: '95%' }}>
              <TextInput
                placeholder={'Title'}
                value={eventTitle}
                onChangeText={(text) => { setEventTitle(text), console.log(eventTitle) }}
                style={styles.textInput}
                onSubmitEditing={Keyboard.dismiss}
                placeholderTextColor="gray"
              />
            </View>
            <View style={{ flexDirection: 'row', width: '90%' }}>
              <View style={styles.leftContainer}>
                <Text variant="bodyLarge">Starts</Text>
              </View>
              <View style={styles.rightContainer}>
                <DateTimePicker
                  style={{ marginRight: 5, marginBottom: 5 }}
                  testID='dateTimePicker'
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display='calendar'
                  onChange={onDateSelected}
                />
                <DateTimePicker
                  style={{ marginLeft: 5, marginBottom: 5 }}
                  testID='dateTimePicker'
                  value={time}
                  mode="time"
                  is24Hour={true}
                  display='clock'
                  onChange={onStartTimeSelected}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={new Date()}
        renderItem={renderItem}
      />
      <Button
        icon="calendar-plus"
        onPress={() => { setModalVisible(true) }}
        mode="contained"
        style={styles.addEventButton}
      >
        Add an Event
      </Button>
    </View>
  );
};

export default CalendarScreen

const styles = StyleSheet.create({
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  centeredView: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: '100%',
    top: 0,
    left: 0,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  addTaskButton: {
    marginBottom: 10,
  },
  addEventModal: {
    top: 0,
    left: 0,
  },
  addEventButton: {
    width: '100%',
    alignSelf: 'center',
  },
  textInput: {
    width: '95%',
    height: '35%',
    paddingLeft: 6,
    fontSize: 20,
    alignSelf: 'center',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderRadius: 10,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})