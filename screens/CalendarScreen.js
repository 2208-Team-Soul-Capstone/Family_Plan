import { StyleSheet, View, TouchableOpacity, Modal, TextInput, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { Button, Appbar, List, Text } from 'react-native-paper';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { Divider, Snackbar } from 'react-native-paper';
import { Card, Avatar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';


const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};
const CalendarScreen = () => {
  const [items, setItems] = useState({});
  const [modalVisible, setModalVisible] = useState(false)
  const [newTaskName, setNewTaskName] = useState(null)
  const [newTaskDescription, setNewTaskDescription] = useState(null)
  const [newTaskPoints, setNewTaskPoints] = useState(null)
  const [addTaskSnack, setAddTaskSnack] = useState(false)
  // const [mode, setMode] = useState('date');

  const onDismissAppTaskSnackbar = () => setAddTaskSnack(false);
  const date = new Date()

  const loadItems = (day) => {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        if (!items[strTime]) {
          items[strTime] = [];
          const numItems = Math.floor(Math.random() * 3 + 1);
          // for (let j = 0; j < numItems; j++) {
          //   items[strTime].push({
          //     name: 'Item for ' + strTime + ' #' + j,
          //     height: Math.max(50, Math.floor(Math.random() * 150)),
          //   });
          // }
        }
      }

      const newItems = {};
      Object.keys(items).forEach((key) => {
        newItems[key] = items[key];
      });
      setItems(newItems);
    }, 1000);
  };
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
              {/* <Avatar.Text label="M" /> */}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };



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
                <Text variant="bodyLarge">Cancel</Text>
              </View>
              <Text style={{ alignSelf: 'center' }} variant="bodyLarge">New Event</Text>
              <View style={styles.rightContainer}>
                <Text variant="bodyLarge">Add</Text>
              </View>
            </View>
            <View style={{ width: '95%' }}>
              <TextInput
                placeholder={'Title'}
                value={newTaskDescription}
                onChangeText={(text) => setNewTaskDescription(text)}
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
                // onChange={console.log('onChange from date picker fired')}
                />
                <DateTimePicker
                  style={{ marginLeft: 5, marginBottom: 5 }}
                  testID='dateTimePicker'
                  value={date}
                  mode="time"
                  is24Hour={true}
                  display='clock'
                // onChange={console.log('onChange from date picker fired')}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', width: '90%' }}>
              <View style={styles.leftContainer}>
                <Text style={{ textAlign: 'left' }} variant="bodyLarge">Ends</Text>
              </View>
              <View style={styles.rightContainer}>
                <DateTimePicker
                  style={{ marginRight: 5, marginTop: 5 }}
                  testID='dateTimePicker'
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display='calendar'
                // onChange={console.log('onChange from date picker fired')}
                />
                <DateTimePicker
                  style={{ marginLeft: 5, marginTop: 5 }}
                  testID='dateTimePicker'
                  value={date}
                  mode="time"
                  is24Hour={true}
                  display='clock'
                // onChange={console.log('onChange from date picker fired')}
                />
              </View>
            </View>
            {/* <Button
              mode="contained" style={styles.addTaskButton}
              onPress={() => addTask()}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </Button>
            <Button
              mode="contained" style={styles.addTaskButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Button> */}
          </View>
          <View style={styles.snackbarsAddTask}>
            <Snackbar
              visible={addTaskSnack}
              onDismiss={onDismissAppTaskSnackbar}
            >
              Please fill out all fields.
            </Snackbar>
          </View>
        </View>
      </Modal>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={new Date()}
        renderItem={renderItem}
      />
      <Button icon="calendar-plus" onPress={() => { setModalVisible(true), console.log(items) }} mode="contained" style={styles.addEventButton}>Add an Event</Button>
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