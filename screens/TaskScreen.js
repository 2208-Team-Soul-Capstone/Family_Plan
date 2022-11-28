import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';

const TaskScreen = () => {

  const [settings, setSettings] = useState(false);

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
    console.log(settings)
  };


  if (!settings) {
    return (
      <>
        <View style={styles.header}>
          <Text>Welcome {auth.currentUser.email}</Text>
          <TouchableOpacity onPress={navToSettings} style={styles.button}>

            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text>Top Task Menu</Text>
          <Text>Tasks or wishlist below</Text>



        </View>
      </>
    )
  }
  else if (settings) {
    return (
      <>
        <View style={styles.header}>
          <Text>Settings </Text>
        </View>
        <View>
          <Text>User Image</Text>
          <Text>Username: username</Text>
          <Text>E-mail: email@address.com</Text>
          <Text>Family: familyname</Text>
          <Text>Edit Settings - Link</Text>

          <TouchableOpacity onPress={navToSettings} style={styles.button}>
            <Text style={styles.buttonText}>Exit Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={styles.button}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        </View>
      </>
    )
  }
}

export default TaskScreen

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    marginLeft: 20,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
})