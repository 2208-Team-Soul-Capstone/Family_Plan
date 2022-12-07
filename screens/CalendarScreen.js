import { StyleSheet, View, TouchableOpacity, Modal, TextInput, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { Button, Appbar, List, Text } from 'react-native-paper';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { Divider, Snackbar } from 'react-native-paper';
import { Card, Avatar } from 'react-native-paper';



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

  const onDismissAppTaskSnackbar = () => setAddTaskSnack(false);

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
          style={styles.addTaskModal}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText} variant="bodyLarge">Add a New Task</Text>

              <View>
                <TextInput
                  value={newTaskName}
                  placeholder={'Enter Task Name Here'}
                  onChangeText={(value) => setNewTaskName(value)}
                  style={styles.input}
                  onSubmitEditing={Keyboard.dismiss}
                  placeholderTextColor="gray"
                />

              </View>
              <View>
                <TextInput
                  placeholder={'Enter Task Description Here'}
                  value={newTaskDescription}
                  onChangeText={(text) => setNewTaskDescription(text)}
                  style={styles.input}
                  onSubmitEditing={Keyboard.dismiss}
                  placeholderTextColor="gray"

                />
              </View>
              <View>
                <TextInput
                  placeholder={'Enter Task Point Value Here'}
                  value={newTaskPoints}
                  onChangeText={(text) => setNewTaskPoints(text)}
                  style={styles.input}
                  onSubmitEditing={Keyboard.dismiss}
                  keyboardType="numeric"
                  placeholderTextColor="gray"

                />
              </View>


              <Button
                mode="contained" style={styles.addTaskButton}
                onPress={() => addTask()}
              >
                <Text style={styles.buttonText}>Add Task</Text>
              </Button>
              <Button
                mode="contained" style={styles.addTaskButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Button>
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
      <Button icon="checkbox-marked-circle-plus-outline" onPress={() => { setModalVisible(true), console.log(modalVisible) }} mode="contained" style={styles.logoutButton}>Add a Task</Button>
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
  modalView: {
    width: '95%',
    top: 0,
    left: 0,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
  addTaskModal: {
    top: 0,
    left: 0,
  },
})