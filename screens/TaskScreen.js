import { StyleSheet, View, TextInput, Keyboard, Modal, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useLayoutEffect } from 'react'
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Button, Divider, SegmentedButtons, Appbar, Avatar, List, Text, Snackbar, Chip } from 'react-native-paper';
import { doc, getDocs, collection, onSnapshot, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker'
import * as EmailValidator from 'email-validator';
const { width } = Dimensions.get('window');

const TaskScreen = () => {

  // get firebase storage
  const storage = getStorage();

  const navigation = useNavigation();

  // state variables
  const [settings, setSettings] = useState(false)
  const [userDetails, setUserDetails] = useState([])
  const [taskOrWish, setTaskOrWish] = useState('task')
  const [editProfile, setEditProfile] = useState(false)
  const [imageUpload, setImageUpload] = useState(null)

  // for editing profile
  const [userName, setUserName] = useState(null)
  const [email, setEmail] = useState(null)
  const [fId, setFId] = useState(null)

  // for snacks to appear when editing profile
  const [nameVisible, setNameVisible] = useState(false)
  const [emailErrorVisible, setEmailErrorVisible] = useState(false)

  // add task states
  const [modalVisible, setModalVisible] = useState(false)
  const [newTaskName, setNewTaskName] = useState(null)
  const [newTaskDescription, setNewTaskDescription] = useState(null)
  const [newTaskPoints, setNewTaskPoints] = useState(0)
  const [addTaskSnack, setAddTaskSnack] = useState(false)
  const [tasks, setTasks] = useState([])
  const [rewardModal, setRewardModal] = useState([false])
  const [wishlistModal, setWishlistModal] = useState(false)
  const [tasksModal, setTasksModal] = useState(false)


  // [ Wish List Section Starts Here ]
  const [wishListModalVisible, setWishListModalVisible] = useState(false)
  const [wishListInputValue, setWishListInputValue] = useState('')
  const [wishListItems, setWishListItems] = useState([])

  // Parent View States
  const [children, setChildren] = useState([])
  const [childTasks, setChildTasks] = useState([])
  const [childTasksName, setChildTasksName] = useState('')
  const [childTasksId, setChildTasksId] = useState('')
  const [childFamilyId, setChildFamilyId] = useState('')
  const [childTasksPoints, setChildTasksPoints] = useState(0)
  const [childWishlist, setChildWishlist] = useState([])

  //take the auth uid to bring in the user details object from firestore and setup snapshot listener
  useEffect(() => {
    const u = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
      setUserDetails(doc.data())
    })
  }, [])

  // after the useEffect above sets the userDetails state variable, need the userDetails.familyId to complete the firebase query. sometimes it works, sometimes it shows up as undefined because the userDetails isn't set yet
  useEffect(() => {
    const getChildren = async () => {
      let allChildren = []
      const childrenRef = collection(db, "users")
      const c = query(childrenRef, where("accountType", "==", "child"), where('familyId', '==', userDetails.familyId))
      const querySnapshot = await getDocs(c)
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        allChildren.push({ ...doc.data(), id: doc.id })
      })
      setChildren(allChildren)
    }
    if (userDetails.familyId) {
      getChildren()
    }
  }, [userDetails, tasksModal, childTasksPoints, setEditProfile])

  //snapshot listener to realtime update task list
  useLayoutEffect(() => {
    const tasksRef = collection(db, 'users', `${auth.currentUser.uid}`, 'Tasks')
    onSnapshot(tasksRef, (snapshot) => {
      let allTasks = []
      snapshot.docs.forEach((doc) => {
        allTasks.push({ ...doc.data(), id: doc.id })
      })
      setTasks(allTasks)
    })
  }, [userDetails])


  // ---------- Wish List Logic

  const toggleWishListView = () => {
    setWishListModalVisible(!wishListModalVisible)
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

  const parentHandleRemoveWishList = async (documentId, familyId) => {
    deleteDoc(doc(db, 'Families', familyId, 'Wish List', documentId));
    getChildWishlist(childTasksName, childTasksId, childFamilyId)
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
    if (newpoints < userDetails.pointsNeeded) {
      setDoc(doc(db, "users", auth.currentUser.uid), {
        points: newpoints
      }, { merge: true })
    }
    else if (newpoints >= userDetails.pointsNeeded) {
      setDoc(doc(db, "users", auth.currentUser.uid), {
        points: 0,
        reward: true,
      }, { merge: true })
      setRewardModal(true)
    }

    deleteDoc(doc(db, 'users', auth.currentUser.uid, 'Tasks', documentId));
  };

  const parentHandleRemoveTask = async (documentId) => {
    deleteDoc(doc(db, 'users', childTasksId, 'Tasks', documentId));
    getChildTasks(childTasksName, childTasksId, childTasksPoints)
  };


  const parentTaskCompleted = async (documentId, points, pointsNeeded) => {
    let currentpoints = childTasksPoints
    let newpoints = currentpoints += parseFloat(points)

    if (newpoints < pointsNeeded) {
      setDoc(doc(db, "users", childTasksId), {
        points: newpoints
      }, { merge: true })
    }
    else if (newpoints >= pointsNeeded) {
      setDoc(doc(db, "users", childTasksId), {
        points: 0,
        reward: true,
      }, { merge: true })
    }
    deleteDoc(doc(db, 'users', childTasksId, 'Tasks', documentId));
    getChildTasks(childTasksName, childTasksId, newpoints)
  };

  const resetReward = () => {
    setDoc(doc(db, "users", childTasksId), {
      reward: false,
    }, { merge: true })
  }

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

  // ----------- Update user details (minus photo) 

  const saveDetails = () => {
    if (userName !== null) {
      setDoc(doc(db, "users", auth.currentUser.uid), {
        name: userName,
      }, { merge: true })
      setUserName(null)
      setNameVisible(true)
    }

    if (email !== null) {

      if (EmailValidator.validate(email)) {
        setDoc(doc(db, "users", auth.currentUser.uid), {
          email: email,
        }, { merge: true })
      }
      else {
        setEmailErrorVisible(true)
      }
    }

    if (fId !== null) {
      setDoc(doc(db, "users", auth.currentUser.uid), {
        familyId: fId,
      }, { merge: true })
    }
  }

  const onDismissNameSnackBar = () => setNameVisible(false);

  const onDismissAppTaskSnackbar = () => setAddTaskSnack(false);

  const saveAndDismiss = () => {
    Keyboard.dismiss()
    saveDetails()
  }

  const getChildTasks = async (name, id, points) => {
    setTasksModal(true)
    setChildTasksPoints(points)
    let childtasks = []
    const querySnapshot = await getDocs(collection(db, "users", id, 'Tasks'));
    querySnapshot.forEach((doc) => {
      childtasks.push(doc.data());
    });
    setChildTasksName(name)
    setChildTasksId(id)
    setChildTasks(childtasks)
  }

  const getChildWishlist = async (name, id, familyId) => {
    setWishlistModal(true)
    setChildFamilyId(familyId)
    let childwishlist = []
    const wishListCollectionRef = collection(
      db,
      'Families',
      `${userDetails.familyId}`,
      'Wish List'
    )

    const q = query(collection(db, 'Families', familyId, 'Wish List'), where('userId', "==", id))
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
    childwishlist.push(doc.data());
    });
    setChildTasksName(name)
    setChildTasksId(id)
    setChildWishlist(childwishlist)
  }

  const closeTasksModal = () => {
    setTasksModal(false)
  }

  // ----------- Begin rendering -- Task List View

  if (!settings) {
    if (taskOrWish == 'task') {

      // ----------- Parent Task List -- NEED TouchableOpacity function to open up a new view with the child's tasks
      if (userDetails.accountType == 'parent') {

        // individual child tasklist view
        return (
          <>
            <Appbar
              style={styles.headerTasks}>
              <Appbar.Content title={<SegmentedButtons
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

            <View style={styles.taskList}>
              <Text variant="titleSmall">Select a Child below to view their Tasks</Text>
            </View>

            <ScrollView style={styles.childList}>

              {children.map((child, key) => {
                return (
                  <View key={key}>
                    <List.Section style={styles.itemRow} >
                      <View>
                        <TouchableOpacity
                          style={styles.child}
                          onPress={() => getChildTasks(child.name, child.id, child.points)}
                        ><Text variant="displaySmall"><Avatar.Image
                          size={40}
                          source={{ uri: child.photoURL }}
                        />  {child.name} {child.reward && <Text variant="titleMedium" style={styles.childTaskReward}>Reward</Text>}</Text>
                        </TouchableOpacity>
                      </View>
                    </List.Section>
                    <Modal
                      animationType="slide"
                      transparent={false}
                      visible={tasksModal}
                      onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setTasksModal(!tasksModal);
                      }}
                      style={styles.showTasksModal}
                    >
                      <ScrollView style={styles.scrollBox}>
                        <Text variant={'titleLarge'} style={styles.childTasksName}>{childTasksName}'s Tasks</Text>
                        <Text variant={'titleSmall'} style={styles.childTasksPoints}> {childTasksPoints} of {child.pointsNeeded} Reward Points Earned</Text> 
                        <Divider />

                        {!childTasks.length && <Text style={{marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto'}}variant='titleLarge'>No tasks for this child!</Text>}       
                        {childTasks.map((task, key) => {

                          return (
                            <>
                              <List.Section style={styles.itemRow} key={key}>
                                <View>
                                  <Text variant="titleMedium">{task.name}  <Text variant="labelMedium">{task.points} points</Text></Text>

                                  <Text variant="labelMedium">{task.description}</Text>
                                </View>
                                <View>
                                  <Button
                                    icon="check-outline"
                                    mode="text"
                                    onPress={() => {
                                      parentTaskCompleted(task.documentId, task.points, child.pointsNeeded);
                                    }}
                                  ></Button>
                                  <Button
                                    icon="trash-can-outline"
                                    mode="text"
                                    onPress={() => {
                                      parentHandleRemoveTask(task.documentId);
                                    }}
                                  ></Button>
                                </View>
                              </List.Section>
                              <Divider />

                            </>
                          );
                        })}
                        <Button style={styles.childTasksButton} onPress={() => resetReward()} mode="contained">Reset Reward</Button>
                        <Button style={styles.childTasksButton} onPress={() => {
                          setTasksModal(false)
                          closeTasksModal()
                        }} mode="contained">Return to Children</Button>

                      </ScrollView>

                    </Modal>
                  </View>
                )
              })
              }
            </ScrollView>
          </>
        )

      }
      // ----------- Child Task List 

      else if (userDetails.accountType == 'child') {
        return (
          <>

            <Appbar
              style={styles.headerTasks}>
              <Appbar.Content title={<SegmentedButtons
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
              visible={rewardModal}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setRewardModal(!rewardModal);
              }}
              style={styles.addTaskModal}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText} variant="bodyLarge">Congratulations! You earned enough points for your reward. Let your parent know!</Text>
                  <Button
                    mode="contained" style={styles.taskModalButton}
                    onPress={() => setRewardModal(false)}
                  >
                    <Text style={styles.buttonText}>OK</Text>
                  </Button>
                </View>
              </View>
            </Modal>
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
                      maxLength={35}
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
                      maxLength={45}
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
                      maxLength={2}
                    />
                  </View>


                  <Button
                    mode="contained" style={styles.taskModalButton}
                    onPress={() => addTask()}
                  >
                    <Text style={styles.buttonText}>Add Task</Text>
                  </Button>
                  <Button
                    mode="contained" style={styles.taskModalButton}
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
              <Text style={styles.pointsText}>{userDetails.points} of {userDetails.pointsNeeded} Reward Points</Text>

              <Button icon="checkbox-marked-circle-plus-outline" onPress={() => setModalVisible(true)} mode="contained" style={styles.addTaskButton}>Add a Task</Button>
            </View>

            <ScrollView style={styles.scrollBox}>
              {tasks.map((task, key) => {
                return (
                  <>
                    <List.Section style={styles.itemRow} key={key}>
                      <View>
                        <Text variant="titleMedium">{task.name}  <Text variant="labelMedium">{task.points} points</Text></Text>

                        <Text variant="labelMedium">{task.description}</Text>
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
    }

    // -----------  Wish List View 

    else if (taskOrWish == 'wish')

      // Parent Wish List View -- NEED TouchableOpacity function to open up a new view with the child's wishlist

      if (userDetails.accountType == 'parent') {
        return (
          <>
            <Appbar
              style={styles.headerTasks}>
              <Appbar.Content title={<SegmentedButtons
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
            <View style={styles.taskList}>
              <Text variant="titleSmall">Select a Child below to view their Wish List</Text>
            </View>

            <ScrollView style={styles.childList}>
            {children.map((child, key) => {
                return (
                  <>
                    <List.Section style={styles.itemRow} key={key}>
                      <View>
                        <TouchableOpacity
                          style={styles.child}
                          onPress={() => getChildWishlist(child.name, child.id, child.familyId)}
                        ><Text variant="displaySmall"><Avatar.Image
                          size={40}
                          source={{ uri: child.photoURL }}
                        />  {child.name} {child.reward && <Text variant="titleMedium" style={styles.childTaskReward}>Reward</Text>}</Text>
                        </TouchableOpacity>
                      </View>
                    </List.Section>
                    <Modal
                      animationType="slide"
                      transparent={false}
                      visible={wishlistModal}
                      onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setTasksModal(!wishlistModal);
                      }}
                      style={styles.showTasksModal}
                    >
                      <ScrollView style={styles.scrollBox}>
                        <Text variant={'titleLarge'} style={styles.childTasksName}>{childTasksName}'s Wishlist</Text>
                        <Divider />
                        {childWishlist.map((item, key) => {
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
                            parentHandleRemoveWishList(item.documentId, item.familyId);
                          }}
                        ></Button>
                      </List.Section>
                    );
                  })}
                        <Button style={styles.childTasksButton} onPress={() => {
                          setWishlistModal(false)
                        }} mode="contained">Return to Children</Button>


                      </ScrollView>


                    </Modal>
                  </>
                )
              })
              }
            </ScrollView>
          </>
        )
      }

      // ----------- WishList Child View

      else if (userDetails.accountType == 'child') {
        return (
          <>
            <Appbar
              style={styles.headerTasks}>
              <Appbar.Content title={<SegmentedButtons
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

            <View style={styles.taskList}>
              <Text>Wish List</Text>
            </View>
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
                    <View style={styles.mainView2}>
                      <Text style={styles.wishListHeading} variant="titleLarge">New Wish Item</Text>
                      <Divider />
                    </View>
                    <TextInput
                      placeholder={'Item Name Here'}
                      value={wishListInputValue}
                      style={styles.textInput}
                      onChangeText={(value) => setWishListInputValue(value)}
                      placeholderTextColor="gray"
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
            <Text style={styles.av}>
              <Avatar.Image
                size={170}
                source={{ uri: userDetails.photoURL }}
              />
            </Text>
            <Text variant="titleMedium">Name: {userDetails.name} </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'lightgray',
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
  addTaskButton: {
    width: 130,
    marginLeft: 'auto',
    marginRight: 'auto',
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
    borderRadius: 20,
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
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 35
  },
  textInput: {
    width: '80%',
    paddingHorizontal: 5,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 20,
    marginBottom: 20,
  },
  mainView2: {
    paddingBottom: 10,
    textAlign: 'center'
  },
  buttonView: {
    display: 'flex',
    width: '70%',
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
  },
  scrollBox: {
    marginBottom: 50,
  },
  pointsText: {
    marginTop: 10,
    marginLeft: 25
  },
  taskModalButton: {
    marginBottom: 10,
  },
  child: {
    marginLeft: 20,
    marginBottom: 5,
    padding: 5,
  },
  childList: {
    marginTop: 20,
  },
  showTasksModal: {
    margin: 100,
    paddingTop: 100,
  },
  childTasksName: {
    marginTop: 70,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  childTasksPoints: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  childTaskReward: {
    color: 'green',
  },
  childTasksButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '60%',
    marginBottom: 10,
    marginTop: 10,
  }

})
