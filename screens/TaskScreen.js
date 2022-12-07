import { StyleSheet, View, TextInput, Keyboard, Modal, ScrollView, Dimensions } from 'react-native'
import React, { useState, useEffect, useLayoutEffect } from 'react'
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Button, Divider, SegmentedButtons, Appbar, Avatar, List, Text, Snackbar } from 'react-native-paper';
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  setDoc,
} from 'firebase/firestore'; import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker'
import * as EmailValidator from 'email-validator';
const { width } = Dimensions.get('window');


const TaskScreen = () => {

  // get firebase storage
  const storage = getStorage();

  // tasks ref



  // take the auth uid to bring in the user details object from firestore
  useEffect(() => {
    (async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      setUserDetails(docSnap.data())
    })()
  }, [])


  // snapshot to realtime update task list
  useLayoutEffect(() => {
    const tasksRef = collection(db, 'users', `${auth.currentUser.uid}`, 'Tasks')
    onSnapshot(tasksRef, (snapshot) => {
      let allTasks = []
      snapshot.docs.forEach((doc) => {
        allTasks.push({ ...doc.data(), id: doc.id })
      })
      setTasks(allTasks)
    })
  }, [])


  // state variables
  const [settings, setSettings] = useState(false)
  const [userDetails, setUserDetails] = useState([])
  const [taskOrWish, setTaskOrWish] = useState('task')
  const [editProfile, setEditProfile] = useState(false)
  const [imageUpload, setImageUpload] = useState(null);
  const [profilePic, setProfilePic] = useState(null)

  const [userName, setUserName] = useState(null);
  const [email, setEmail] = useState(null)
  const [fId, setFId] = useState(null)

  // for updating state after updating profile settings
  const [currentName, setCurrentName] = useState(null)
  const [currentEmail, setCurrentEmail] = useState(null)
  const [currentFId, setCurrentFId] = useState(null)

  // for snacks to appear when editing profile
  const [nameVisible, setNameVisible] = useState(false);
  const [emailErrorVisible, setEmailErrorVisible] = useState(false)
  const [emailVisible, setEmailVisible] = useState(false);
  const [fIdVisible, setFIdVisible] = useState(false);
  const [photoOrUser, setPhotoOrUser] = useState('photo')

  // add task states
  const [modalVisible, setModalVisible] = useState(false)
  const [newTaskName, setNewTaskName] = useState(null)
  const [newTaskDescription, setNewTaskDescription] = useState(null)
  const [newTaskPoints, setNewTaskPoints] = useState(0)
  const [addTaskSnack, setAddTaskSnack] = useState(false)
  const [tasks, setTasks] = useState([])

  const navigation = useNavigation();


  // [ Wish List Section Starts Here ]
  const [wishListModalVisible, setWishListModalVisible] = useState(false);
  const [wishListInputValue, setWishListInputValue] = useState('');
  const [wishListItems, setWishListItems] = useState([]);

  const toggleWishListView = () => {
    setWishListModalVisible(!wishListModalVisible);
  };

  useLayoutEffect(() => {
    const wishListCollectionRef = collection(
      db,
      'Families',
      `${userDetails.familyId}`,
      'Wish List'
    )

    onSnapshot(wishListCollectionRef, (snapshot) => {
      let allItems = []
      snapshot.docs.forEach((doc) => {
        const wishItem = {
          item: doc.data().item,
          date: doc.data().date,
          documentId: doc.data().documentId,
          familyId: doc.data().familyId,
          userId: doc.data().userId
        };
        allItems.push(wishItem);
      })
      const itemsByUserId = allItems.filter(id => id.userId === auth.currentUser.uid);
      setWishListItems(itemsByUserId);
    })

  }, [taskOrWish])

  const handleAddWishList = async () => {
    const newDocRef = doc(
      collection(
        doc(collection(db, 'Families'), userDetails.familyId),
        'Wish List'
      )
    );

    await setDoc(newDocRef, {
      familyId: userDetails.familyId,
      userId: auth.currentUser.uid,
      documentId: newDocRef.id,
      item: wishListInputValue,
      date: Date(),
    });
    setWishListInputValue('');
  };

  const handleRemoveWishList = async (documentId, familyId) => {
    deleteDoc(doc(db, 'Families', familyId, 'Wish List', documentId));
  };

  // [ Wish List Section Ends Here ]

  // logout of firebase auth
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => alert(error.message));
  };


  const addTask = async () => {

    if (newTaskName !== null && newTaskDescription !== null && newTaskPoints !== null) {
      const newDocRef = doc(
        collection(
          doc(collection(db, 'users'), auth.currentUser.uid),
          'Tasks'
        )
      );

      await setDoc(newDocRef, {
        name: newTaskName,
        description: newTaskDescription,
        points: newTaskPoints,
        status: 'pending',
        documentId: newDocRef.id,
      });
      setNewTaskName(null)
      setNewTaskDescription(null)
      setNewTaskPoints(null)
      setModalVisible(false)
    }

    else {
      //snack that says to complete fields
      setAddTaskSnack(true)
    }
  };

  const handleRemoveTask = async (documentId) => {
    deleteDoc(doc(db, 'users', auth.currentUser.uid, 'Tasks', documentId));
  };

  const taskCompleted = async (documentId, points) => {
    let newpoints = userDetails.points += parseFloat(points)
    console.log(newpoints)
    setDoc(doc(db, "users", auth.currentUser.uid), {
      points: newpoints
    }, { merge: true })

    deleteDoc(doc(db, 'users', auth.currentUser.uid, 'Tasks', documentId));
  };


  // convert numerical date object to string for settings page 
  const getBirthday = () => {
    return new Date(userDetails.birthday.seconds * 1000).toLocaleDateString()
  }

  // ----------- functions related to conditional rendering/navigation
  const navToSettings = () => {
    if (settings) {
      setSettings(false)
    }
    else if (!settings) {
      setSettings(true)
    }
  };

  const gotoEditProfile = () => {
    setEditProfile(true)
  }

  const profileEditBack = () => {
    setEditProfile(false)
  }

  // ----------- Image upload functions

  // upload image to firebase storage and set the photoURL in firestore
  const uploadFile = async () => {
    if (imageUpload !== null) {
      const response = await fetch(imageUpload)
      const blob = await response.blob();
      const filename = `images/${auth.currentUser.uid}/` + imageUpload.substring(imageUpload.lastIndexOf('/') + 1)
      const imageRef = ref(storage, filename);
      uploadBytes(imageRef, blob).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setDoc(doc(db, "users", auth.currentUser.uid), {
            photoURL: url,
          }, { merge: true }).then(() => {
            setProfilePic(imageUpload)
          })
          setImageUpload(null)
          setEditProfile(false);
        });
      });
    }
  };

  // image selector on mobile devices to allow access to camera roll
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Image,
      allowsEditing: true,
      aspect: [4, 3],
    })

    if (!result.canceled) {
      setImageUpload(result.assets[0].uri);
    }
  }

  // conditional render for when setings is first loaded to load current photo and subsequently the new photo from state if changes are made
  const ProPick = () => {
    if (profilePic) {
      return <Text style={styles.av}>
        <Avatar.Image
          size={170}
          source={{ uri: profilePic }}
        />
      </Text>
    } else {
      return <Text style={styles.av}>
        <Avatar.Image
          size={170}
          source={{ uri: userDetails.photoURL }}
        />
      </Text>
    }
  }

  // ----------- conditional render for user details so can be updated by settings save changes

  const SettingsName = () => {
    if (currentName) {
      return <Text variant="titleMedium">Name: {currentName} </Text>
    } else {
      return <Text variant="titleMedium">Name: {userDetails.name} </Text>
    }
  }

  const SettingsEmail = () => {
    if (profilePic) {
      return <Text style={styles.av}>
        <Avatar.Image
          size={170}
          source={{ uri: profilePic }}
        />
      </Text>
    } else {
      return <Text style={styles.av}>
        <Avatar.Image
          size={170}
          source={{ uri: userDetails.photoURL }}
        />
      </Text>
    }
  }

  const SettingsFamilyID = () => {
    if (profilePic) {
      return <Text style={styles.av}>
        <Avatar.Image
          size={170}
          source={{ uri: profilePic }}
        />
      </Text>
    } else {
      return <Text style={styles.av}>
        <Avatar.Image
          size={170}
          source={{ uri: userDetails.photoURL }}
        />
      </Text>
    }
  }
  // ----------- Update user details (minus photo) 

  const saveDetails = () => {

    console.log(userName)
    if (userName !== null) {
      setDoc(doc(db, "users", auth.currentUser.uid), {
        name: userName,
      }, { merge: true })
      setCurrentName(userName)
      setUserName(null)
      console.log('name updated')
      setNameVisible(true)
    }

    if (email !== null) {

      console.log(EmailValidator.validate(email));

      if (EmailValidator.validate(email)) {
        setDoc(doc(db, "users", auth.currentUser.uid), {
          email: email,
        }, { merge: true })
        console.log('email updated')
      }
      else {
        setEmailErrorVisible(true)
      }
    }

    if (fId !== null) {
      setDoc(doc(db, "users", auth.currentUser.uid), {
        familyId: fId,
      }, { merge: true })
      return <Text>Family ID Updated</Text>
    }
  }

  const onDismissNameSnackBar = () => setNameVisible(false);

  const onDismissAppTaskSnackbar = () => setAddTaskSnack(false);

  const saveAndDismiss = () => {
    Keyboard.dismiss()
    saveDetails()
  }

  // ----------- Begin rendering -- Task List View

  if (!settings) {
    if (taskOrWish == 'task') {
      return (
        <>
          <Appbar
            style={styles.headerTasks}>
            <Appbar.Content title={            <SegmentedButtons
              style={styles.segButtons}
              value={taskOrWish}
              onValueChange={setTaskOrWish}
              buttons={[
                {
                  value: 'task',
                  label: 'Task List',
                  showSelectedCheck: true,
                },
                {
                  value: 'wish',
                  label: 'Wish List',
                  showSelectedCheck: true,
                },
              ]}
            />} />
            <Appbar.Action icon="cog-outline" onPress={navToSettings} />
          </Appbar>
          <Divider />
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

          <View style={styles.taskList}>
            <Text>Current Points: {userDetails.points} of {userDetails.pointsNeeded} needed for reward!</Text>

            <Button icon="checkbox-marked-circle-plus-outline" onPress={() => setModalVisible(true)} mode="contained" style={styles.logoutButton}>Add a Task</Button>
            </View>
            <Divider />


            <ScrollView>
              {tasks.map((task, key) => {
                return (
                  <>
                    <List.Section style={styles.itemRow} key={key}>
                      <View>
                        <Text variant="titleMedium">{task.name}</Text>

                        <Text variant="labelMedium">{task.description} - <Text style={styles.points}> Points: {task.points}</Text></Text>
                      </View>
                      <View>
                        <Button
                          icon="check-outline"
                          mode="text"
                          onPress={() => {
                            taskCompleted(task.documentId, task.points);
                          }}
                        ></Button>
                        <Button
                          icon="trash-can-outline"
                          mode="text"
                          onPress={() => {
                            handleRemoveTask(task.documentId);
                          }}
                        ></Button>
                      </View>
                    </List.Section>
                    <Divider />
                    </>
                );
              })}
            </ScrollView>


        </>
      )
    }

    // -----------  Wish List View

    else if (taskOrWish == 'wish')
      return (
        <>
          <Appbar
            style={styles.headerTasks}>
            <Appbar.Content title={            <SegmentedButtons
              style={styles.segButtons}
              value={taskOrWish}
              onValueChange={setTaskOrWish}

              buttons={[
                {
                  value: 'task',
                  label: 'Task List',
                  showSelectedCheck: true,
                },
                {
                  value: 'wish',
                  label: 'Wish List',
                  showSelectedCheck: true,
                },
              ]}
            />} />
            <Appbar.Action icon="cog-outline" onPress={navToSettings} />
          </Appbar>
<Divider />


          <List.Subheader>Wish List</List.Subheader>
          <ScrollView style={styles.wishListScrollView}>
            <View style={styles.wishList}>
              <List.Section>
                {wishListItems.map((item, key) => {
                  return (
                    <List.Section style={styles.itemRow} key={key}>
                      <View style={styles.iconName}>
                        <List.Item left={() => <List.Icon icon="gift-outline" />} />
                        <Text>{item.item}</Text>
                      </View>
                      <Button
                        icon="trash-can-outline"
                        mode="text"
                        onPress={() => {
                          handleRemoveWishList(item.documentId, item.familyId);
                        }}
                      ></Button>
                    </List.Section>
                  );
                })}
              </List.Section>
            </View>
          </ScrollView>
          <View style={styles.screen}>
            <Button onPress={toggleWishListView}>Add to Wish List</Button>

            <Modal
              animationType="fade"
              transparent
              visible={wishListModalVisible}
              presentationStyle="overFullScreen"
            >
              <View style={styles.mainContainer}>
                <View style={styles.mainView}>
                  <TextInput
                    placeholder="Add Item Name"
                    value={wishListInputValue}
                    style={styles.textInput}
                    onChangeText={(value) => setWishListInputValue(value)}
                  />
                  <View style={styles.buttonView}>
                    <Button onPress={toggleWishListView} style={styles.closeButton}>
                      Close
                    </Button>
                    <Button
                      onPress={() => {
                        toggleWishListView();
                        handleAddWishList();
                      }}
                      style={styles.closeButton}
                    >
                      Add
                    </Button>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </>
      )
  }

  // ----------- Settings View

  else if (settings && !editProfile) {
    if (userDetails.birthday.seconds) {
      return (
        <>
          <Appbar
            style={styles.header}>
            <Appbar.Content title={'Settings'} />
            <Appbar.Action icon="keyboard-backspace" onPress={navToSettings} />
          </Appbar>

          <View style={styles.userInfo}>
            <Button icon='pencil' onPress={gotoEditProfile}>Edit Profile</Button>

            <ProPick />

            <SettingsName />
            <Text variant="titleMedium">E-mail: {auth.currentUser.email}</Text>
            <Text variant="titleMedium">Family ID: {userDetails.familyId}</Text>
            <Text variant="titleMedium">Birthday: {getBirthday()}</Text>
            <Divider style={{ marginTop: 15 }} />
            <Button icon="logout" mode="contained" onPress={handleSignOut} style={styles.logoutButton}>
              Logout
            </Button>
          </View>
        </>
      )
    }
  }

  // View for editing the Profile

  else if (settings && editProfile) {
    if (userDetails.name) {
      return (
        <>
          <Appbar
            style={styles.header}>
            <Appbar.Content title={'Edit Profile'} />
            <Appbar.Action icon="keyboard-backspace" onPress={profileEditBack} />
          </Appbar>

          <View style={styles.userInfo}>
            <Button icon="image" onPress={pickImage} mode="contained" style={styles.saveButton}> Choose a New Photo </Button>
            {imageUpload &&
              <>
                <Avatar.Image
                  size={170}
                  source={{ uri: imageUpload }}
                  style={styles.av}
                />
                <Button onPress={uploadFile} mode="contained" style={styles.saveButton}>Update Photo</Button>
              </>
            }

            <Divider style={{ marginTop: 30, marginBottom: 30 }} />
            <View>
              <Text variant="titleMedium" style={styles.instructions}>Fill in the fields you would like to change and click "Save Changes".</Text>
              <TextInput
                value={userName}
                placeholder={'Enter New Name Here'}
                onChangeText={(value) => setUserName(value)}
                style={styles.input}
                onSubmitEditing={Keyboard.dismiss}
              />

            </View>
            <View>
              <TextInput
                placeholder={'Enter New E-mail Here'}

                value={email}
                onChangeText={(text) => setEmail(text)}
                style={styles.input}
              />
            </View>
            <View>
              <TextInput
                placeholder={'Enter New FamilyID Here'}
                value={fId}
                onChangeText={(text) => setFId(text)}
                style={styles.input}
              />
            </View>
            <Button onPress={saveAndDismiss} mode="contained" style={styles.saveButton}>Save Changes</Button>
          </View>
          <View style={styles.snackbars}>
            <Snackbar
              visible={nameVisible}
              onDismiss={onDismissNameSnackBar}
              action={{
                label: 'Return to Profile',
                onPress: () => {
                  setEditProfile(false)
                },
              }}>
              Profile Updated
            </Snackbar>

            <Snackbar
              visible={emailErrorVisible}
              onDismiss={onDismissNameSnackBar}
              action={{
                label: 'Retry',
                onPress: () => {
                  setEmailErrorVisible(false)
                },
              }}>
              Not a valid e-mail
            </Snackbar>
          </View>
        </>
      )
    }
  }
}

export default TaskScreen

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: 'flex-end',
    marginBottom: 10,
    fontSize: 30,
    backgroundColor: '#c4def6',
  },
    headerTasks: {
      marginTop: 60,
      flexDirection: "row",
      justifyContent: 'flex-end',
      marginBottom: 10,
      fontSize: 30,
      backgroundColor: 'white',
    },
  headerText: {
    fontSize: 30,
  },
  taskMenu: {
    height: 60,
  },
  taskList: {
    justifyContent: 'space-around',
    marginLeft: 20,
    marginTop: 20,
  },
  segButtons: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  settingsButton: {
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 50,
    width: 50,
    height: 50,
    textAlign: 'right',
    marginRight: 60,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '20%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  userName: {
    marginTop: 12,
    marginBottom: 12,
    marginRight: 20,
  },
  logoutButton: {
    width: '70%',
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 20,
  },
  saveButton: {
    width: 250,
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  userInfo: {
    marginLeft: 'auto',
    marginRight: 'auto',
    justifyContent: 'space-around'
  },
  av: {
    marginBottom: 20,
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  snackbars: {
    marginTop: 100,
    width: '100%',
    backgroundColor: '#c4def6',
  },
  snackbarsAddTask: {
    top: 0,
    width: '100%',
    backgroundColor: '#c4def6',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 20,
  },
  instructions: {
    width: 300,
  },
  choosePhoto: {
    fontSize: 30,
  },
  centeredView: {
    top: 60,
    justifyContent: "center",
    alignItems: "center",
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
  // [ Wish List Starts Here ]
  screen: {
    width: '50%',
    borderRadius: 30,
    backgroundColor: '#c4def6',
    position: 'absolute',
    bottom: 10,
    left: '25%',
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 15,
  },
  iconName: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    borderRadius: 5,
    backgroundColor: '#c4def6',
    width: 80,
  },
  wishListScrollView: {
    marginBottom: 50,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  mainView: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    elevation: 5,
    transform: [{ translateX: -(width * 0.4) }, { translateY: -90 }],
    height: 180,
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 7,
  },
  textInput: {
    width: '80%',
    paddingHorizontal: 16,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    marginBottom: 18,
  },
  buttonView: {
    display: 'flex',
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  points: {
    justifyContent: 'left',
  },
  wishList: {
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  // [ Wish List Ends Here ]
  taskListView: {
    marginBottom: 1,
  }
})
