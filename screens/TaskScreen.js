import { StyleSheet, TouchableOpacity, View, Image, TextInput, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Button, Divider, SegmentedButtons, Appbar, Avatar, List, Text, Snackbar } from 'react-native-paper';
import { doc, getDoc, setDoc, userDetails } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker'
import * as EmailValidator from 'email-validator';


const TaskScreen = () => {

  // get firebase storage
  const storage = getStorage();

  // take the auth uid to bring in the user details object from firestore
  useEffect(() => {
    (async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      setUserDetails(docSnap.data())
    })()
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
  const [currentName, setCurrentName] = useState(null)
  const [currentEmail, setCurrentEmail] = useState(null)
  const [currentFId, setCurrentFId] = useState(null)
  const [nameVisible, setNameVisible] = useState(false);
  const [emailErrorVisible, setEmailErrorVisible] = useState(false)
  const [emailVisible, setEmailVisible] = useState(false);
  const [fIdVisible, setFIdVisible] = useState(false);
  const [photoOrUser, setPhotoOrUser] = useState('photo')



  const navigation = useNavigation();

  // logout of firebase auth
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => alert(error.message));
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
    if (imageUpload !== null){
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
            style={styles.header}>
            <Appbar.Content title={`${userDetails.name}'s Lists`} />
            <Appbar.Action icon="cog-outline" onPress={navToSettings} />
          </Appbar>
          <View style={styles.taskMenu}>
            <SegmentedButtons
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
            />
            <Divider />

          </View>

          <View style={styles.taskList}>

            <List.Section>
              <List.Subheader>Current Points: 10 of 100 needed for reward!</List.Subheader>

              <List.Item title="Do the laundry"
                description="5 points"
                left={() => <List.Icon icon="checkbox-multiple-outline" />} />
              <List.Item title="Clean room"
                description="5 points"
                left={() => <List.Icon icon="checkbox-multiple-outline" />} />
              <List.Item title="Finish Science Project"
                description="10 points"
                left={() => <List.Icon icon="checkbox-multiple-outline" />} />
              <List.Item title="Take dog for walk"
                description="3 points"
                left={() => <List.Icon icon="checkbox-multiple-outline" />} />

            </List.Section>
          </View>
        </>
      )
    }

    // -----------  Wish List View

    else if (taskOrWish == 'wish')
      return (
        <>
          <Appbar
            style={styles.header}>
            <Appbar.Content title={`${userDetails.name}'s Lists`} />
            <Appbar.Action icon="cog-outline" onPress={navToSettings} />
          </Appbar>

          <View style={styles.taskMenu}>
            <SegmentedButtons
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
            />
            <Divider />
          </View>

          <View style={styles.taskList}>
            <List.Section>
              <List.Subheader>Wish List</List.Subheader>
              <List.Item title="Nerf Gun"
                left={() => <List.Icon icon="gift-outline" />} />
            </List.Section>
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

          <View style={styles.taskMenu}>
            <SegmentedButtons
              style={styles.segButtons}
              value={taskOrWish}
              onValueChange={setTaskOrWish}
              buttons={[
                {
                  value: 'photoSegButton',
                  label: 'Photo',
                  showSelectedCheck: true,
                },
                {
                  value: 'userdetailsSegButton',
                  label: 'User Details',
                  showSelectedCheck: true,
                },
              ]}
            />
            <Divider />

          </View>


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
    marginTop: 10,
    marginBottom: 10,
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
  }
})
