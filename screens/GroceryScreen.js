import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useState, useEffect, memo } from 'react';
import {
  Button,
  Appbar,
  TextInput,
  Divider,
  Avatar,
  Checkbox,
} from 'react-native-paper';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

const GroceryScreen = () => {
  // will add checkbox later
  // const [checked, setChecked] = useState({});
  const [grocery, setGrocery] = useState('');
  const [userDetails, setUserDetails] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      setUserDetails(docSnap.data());
    })();
  }, []);

  let collectionRef = collection(
    db,
    'Families',
    `${userDetails.familyId}`,
    'Grocery List'
  );

  onSnapshot(collectionRef, (querySnapshot) => {
    let newItems = [];
    querySnapshot.docs.forEach((doc) => {
      let newHold = [];
      newHold.push(
        doc.data().item,
        doc.data().name,
        doc.data().userId,
        doc.data().photoURL,
        doc.data().documentId,
        doc.data().familyId
      );
      newItems.push(newHold);
    });
    if (newItems.length !== items.length) {
      setItems(newItems);
    }
  });

  const handleSubmit = async () => {
    const newDocRef = doc(
      collection(
        doc(collection(db, 'Families'), userDetails.familyId),
        'Grocery List'
      )
    );

    await setDoc(newDocRef, {
      familyId: userDetails.familyId,
      userId: auth.currentUser.uid,
      documentId: newDocRef.id,
      name: userDetails.name,
      item: grocery,
      photoURL: userDetails.photoURL,
    });

    setGrocery('');
  };

  const handleRemove = async (docId, familyId) => {
    deleteDoc(doc(db, 'Families', familyId, 'Grocery List', docId));
  };

  return (
    <>
      <Appbar style={styles.header}>
        <Appbar.Content title={'Family Grocery List'} />
      </Appbar>

      <ScrollView style={{ paddingBottom: 55 }}>
        {items.map((item, key) => {
          return (
            <ScrollView key={key}>
              <View style={styles.mainRow}>
                <View style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <Avatar.Image size={40} source={{ uri: item[3] }} />
                    <Text>{item[1]}</Text>
                  </View>
                  <Text>{item[0]}</Text>
                </View>
                <Button
                  icon="cart-remove"
                  style={styles.button}
                  mode="text"
                  onPress={() => {
                    handleRemove(item[4], item[5]);
                  }}
                ></Button>
              </View>
              <Divider />
            </ScrollView>
          );
        })}
      </ScrollView>
      <View style={styles.addGrocery}>
        <TextInput
          style={styles.keyboard}
          // removeClippedSubviews={false}
          label="Add Grocery Item"
          value={grocery}
          onChangeText={(grocery) => setGrocery(grocery)}
          onSubmitEditing={handleSubmit}
        />
      </View>
    </>
  );
};

export default memo(GroceryScreen);

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    fontSize: 30,
    backgroundColor: '#c4def6',
  },
  addGrocery: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 55,
  },
  userInfo: {
    paddingBottom: 10,
    paddingTop: 15,
    width: 90,
  },
  userRow: {
    paddingLeft: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
  },
  keyboard: {
    position: 'absolute',
    width: '100%',
  },
});
