import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Button, Divider, SegmentedButtons, Appbar, Avatar, List, Text } from 'react-native-paper';
import { doc, getDoc, setDoc, userDetails } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker'

const TaskScreen = () => {
  const storage = getStorage();

  useEffect(() => {
    (async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      setUserDetails(docSnap.data())
      })()
  }, [])

  const [settings, setSettings] = useState(false)
  const [userDetails, setUserDetails] = useState([])
  const [taskOrWish, setTaskOrWish] = useState('task')
  const [editProfile, setEditProfile] = useState(false)
  const [imageUpload, setImageUpload] = useState(null);
  const [profilePic, setProfilePic] = useState(null)

  const navigation = useNavigation();

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((error) => alert(error.message));
  };

  const navToSettings = () => {
    if (settings) {
      setSettings(false)
    }
    else if (!settings) {
      setSettings(true)
    }
  };

  const getBirthday = () => {
    return new Date(userDetails.birthday.seconds * 1000).toLocaleDateString()
  }

  const gotoEditProfile = () => {
    setEditProfile(true)
  }

  const profileEditBack = () => {
    setImageUpload(userDetails.photoURL)
    setEditProfile(false)
  }

  const uploadFile = async () => {
    const response = await fetch(imageUpload)
    const blob = await response.blob();
    const filename = imageUpload.substring(imageUpload.lastIndexOf('/')+1)
    const imageRef = ref(storage, filename);
    uploadBytes(imageRef, blob).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setDoc(doc(db, "users", auth.currentUser.uid), {
          photoURL: url,
        }, {merge: true}).then(() => {
          setProfilePic(imageUpload)
        })
        setImageUpload(null)
        setEditProfile(false);
      });
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Image,
      allowsEditing: true,
      aspect: [4,3],
    })

    if (!result.canceled) {
      setImageUpload(result.assets[0].uri);
    }
  }

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
    else if (taskOrWish == 'wish')
      return (
        <>
          <Appbar
            style={styles.header}>
            <Appbar.Content title={"Tim's Lists"} />
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
            <Button icon='pencil' onPress={gotoEditProfile}>Change Photo</Button>

            <ProPick/>

            <Text variant="titleMedium">Name: {userDetails.name} <Button icon='pencil' c></Button></Text>
            <Text variant="titleMedium">E-mail: {auth.currentUser.email} <Button icon='pencil' c></Button></Text>
            <Text variant="titleMedium">Family ID: {userDetails.familyId} <Button icon='pencil' c></Button></Text>
            <Text variant="titleMedium">Birthday: {getBirthday()} <Button icon='pencil' c></Button></Text>
            <Divider style={{ marginTop: 15 }} />
            <Button icon="logout" mode="contained" onPress={handleSignOut} style={styles.logoutButton}>
              Logout
            </Button>
          </View>
        </>
      )
    }
  }
  else if (settings && editProfile) {
    return (
      <>
        <Appbar
          style={styles.header}>
          <Appbar.Content title={'Edit Photo'} />
          <Appbar.Action icon="keyboard-backspace" onPress={profileEditBack} />
        </Appbar>

        <View style={styles.userInfo}>
          <Button onPress={pickImage}> Choose a New Photo </Button>
          {imageUpload && <Avatar.Image
            size={170}
            source={{ uri: imageUpload }}
            style={styles.av}
          />}
          <Button onPress={uploadFile} mode="contained" style={styles.saveButton}>Update Photo</Button>
        </View>
      </>
    )
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
    width: 170,
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
})
