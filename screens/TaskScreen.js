import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Button, Divider, SegmentedButtons, Appbar, Avatar, List } from 'react-native-paper';
import { doc, getDoc } from "firebase/firestore";

const TaskScreen = () => {

  // temp state for adding segmented buttons
  const [value, setValue] = React.useState('');
  const [settings, setSettings] = useState(false);
  const [userDetails, setUserDetails] = useState([])
  
  useEffect(() => {
    (async () => { 
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    setUserDetails(docSnap.data())
  })() 
  }, [])
 

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

 //const birthday = userDetails.birthday.toDate().toDateString()

    
  if (!settings) {
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
            value={value}
            onValueChange={setValue}
            buttons={[
              {
                value: 'task',
                label: 'Task List',
              },
              {
                value: 'wishList',
                label: 'Wish List',
              },
            ]}
          />
          <Text>Points: 10 of 100 for next Reward!</Text>
          <Divider />

        </View>
        <View style={styles.taskList}>
          <List.Section>
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
  else if (settings) {
    return (
      <>

        <Appbar
          style={styles.header}>
          <Appbar.Content title={'Settings'} />
          <Appbar.Action icon="keyboard-backspace" onPress={navToSettings} />
        </Appbar>
        <View style={styles.userInfo}>
          <Text style={styles.av}>
            <Avatar.Image
              size={130}
              source={{ uri: 'https://scontent-msp1-1.xx.fbcdn.net/v/t39.30808-6/273873496_10106286086005355_6120426208304554129_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=q5432tTCbXIAX9YmUX-&_nc_ht=scontent-msp1-1.xx&oh=00_AfCQ12AZxGj389XacfKheoxe2vBz-M7Xa2ED23L68DMf_w&oe=63899248' }}
            />
          </Text>
          <Text>Name: {userDetails.name}</Text>
          <Text>E-mail: {auth.currentUser.email}</Text>
          <Text>Family ID: {userDetails.familyId}</Text>
          <Text>Birthday: birthday - update</Text>
          <Text>Edit Settings - Link</Text>
          <Button icon="logout" mode="contained" onPress={handleSignOut} style={styles.logoutButton}>
            Logout
          </Button>
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