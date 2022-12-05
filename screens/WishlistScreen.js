import { StyleSheet, TouchableOpacity, View, Image, TextInput, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Button, Divider, SegmentedButtons, Appbar, Avatar, List, Text, Snackbar } from 'react-native-paper';
import { doc, getDoc, setDoc, userDetails } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker'
import * as EmailValidator from 'email-validator';

const WishlistScreen = () => {

    useEffect(() => {
        (async () => {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          setUserDetails(docSnap.data())
        })()
      }, [])

      const [userDetails, setUserDetails] = useState([])
      const [taskOrWish, setTaskOrWish] = useState('task')

      const navigation = useNavigation();

      const navToSettings = () => {
        if (settings) {
          setSettings(false)
        }
        else if (!settings) {
          setSettings(true)
        }
      };



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

export default WishlistScreen

const styles = StyleSheet.create({})