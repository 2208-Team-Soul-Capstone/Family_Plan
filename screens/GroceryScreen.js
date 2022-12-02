import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Appbar,
  Checkbox,
  TextInput,
  Divider,
} from 'react-native-paper';
import { auth, db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

const GroceryScreen = () => {
  const [checked, setChecked] = React.useState(false);
  const [grocery, setGrocery] = React.useState('');
  const [userDetails, setUserDetails] = React.useState([]);
  const [items, setItems] = React.useState([]);

  useEffect(() => {
    (async () => {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      setUserDetails(docSnap.data());
    })();
  }, []);

  // const readDB = () => {
  // console.log('click');
  let collectionRef = collection(
    db,
    'Families',
    `${userDetails.familyId}`,
    'Grocery List'
  );

  onSnapshot(collectionRef, (querySnapshot) => {
    let newItems = [];
    querySnapshot.docs.forEach((doc) => {
      newItems.push(doc.data().item);
    });
    console.log('please no loop');
    helper(newItems);
  });

  /** THINGS TO TRY
   
      do a length check for both arrays
      sate v. db
      one time read option (some fb method)

  */

  const helper = (newItems) => {
    console.log('please no loop v2');
    if (newItems.length !== items.length) {
      setItems(newItems);
    }
  };

  // console.log();

  // };
  // console.log('testa', readDB());

  // useEffect(() => {
  //   let collectionRef = collection(
  //     db,
  //     'Families',
  //     `${userDetails.familyId}`,
  //     'Grocery List'
  //   );

  //   onSnapshot(collectionRef, (querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //       // test2.push(doc.data().item);
  //       console.log(doc.data().item);
  //     });
  //   });

  // }, [items]);

  const handleSubmit = () => {
    addDoc(
      collection(
        doc(collection(db, 'Families'), userDetails.familyId),
        'Grocery List'
      ),
      {
        name: userDetails.name,
        userId: auth.currentUser.uid,
        familyId: userDetails.familyId,
        item: grocery,
      }
    );
    // if we do unsub here we have to resub
    // console.log('readDB func', readDB());
  };

  return (
    <>
      <Appbar style={styles.header}>
        <Appbar.Content title={'Family Grocery List'} />
      </Appbar>

      <View>
        {items.map((item) => {
          return (
            <>
              <Checkbox.Item
                label={item}
                color="green"
                status={checked ? 'checked' : 'unchecked'}
                onPress={() => {
                  setChecked(!checked);
                }}
              />
              <Divider />
            </>
          );
        })}
      </View>
      <View style={styles.addGrocery}>
        <TextInput
          label="Add Grocery Item"
          value={grocery}
          onChangeText={(grocery) => setGrocery(grocery)}
          onSubmitEditing={handleSubmit}
        />
        {/* <TouchableHighlight onPress={readDB}>
          <Text>TEST BUTTON</Text>
        </TouchableHighlight> */}
      </View>
    </>
  );
};

export default GroceryScreen;

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
  },
});
