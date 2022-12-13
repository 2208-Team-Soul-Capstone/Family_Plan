import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import React, { useState, useEffect, memo, useLayoutEffect } from 'react';
import {
  Button,
  Appbar,
  TextInput,
  Divider,
  Avatar,
  SegmentedButtons,
  Card,
  IconButton,
} from 'react-native-paper';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
const { width } = Dimensions.get('window');
const itemPlaceholder = ' Items';

const GroceryScreen = () => {
  const [grocery, setGrocery] = useState('');
  const [userDetails, setUserDetails] = useState([]);
  const [items, setItems] = useState([]);
  const [groceryOrComplete, setGroceryOrComplete] = useState('grocery');
  const [history, setHistory] = useState(false);
  const [cart, setCart] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);
  const [tripHistoryModalVisible, setTripHistoryModalVisible] = useState(false);
  const [historyDetails, setHistoryDetails] = useState([]);

  const toggleTripHistoryView = () => {
    setTripHistoryModalVisible(!tripHistoryModalVisible);
  };

  useEffect(() => {
    (async () => {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      setUserDetails(docSnap.data());
    })();
  }, []);

  useLayoutEffect(() => {
    let collectionRef = collection(
      db,
      'Families',
      `${userDetails.familyId}`,
      'Grocery List'
    );

    onSnapshot(collectionRef, (snapshot) => {
      let newItems = [];
      snapshot.docs.forEach((doc) => {
        newItems.push({ ...doc.data(), id: doc.id });
      });
      setItems(newItems);
    });
  }, [userDetails]);

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

  useLayoutEffect(() => {
    let collectionRef = collection(
      db,
      'Families',
      `${userDetails.familyId}`,
      'Cart List'
    );

    onSnapshot(collectionRef, (snapshot) => {
      let newHistoryItem = [];
      snapshot.docs.forEach((doc) => {
        newHistoryItem.push({ ...doc.data(), id: doc.id });
      });
      setCart(newHistoryItem);
    });
  }, [userDetails]);

  const handleRemoveCart = async (docId, familyId) => {
    deleteDoc(doc(db, 'Families', familyId, 'Cart List', docId));
  };

  const handleAdd = async (docId, familyId, name, item, userId) => {
    const newDocRef2 = doc(
      collection(doc(collection(db, 'Families'), familyId), 'Cart List')
    );

    await setDoc(newDocRef2, {
      familyId: familyId,
      userId: userId,
      documentId: newDocRef2.id,
      name: name,
      item: item,
    });
  };

  const deleteCartItems = (familyId) => {
    for (let id of cart) {
      deleteDoc(doc(db, 'Families', familyId, 'Cart List', id.id));
    }
  };

  const confirmCart = async (familyId, cartItems) => {
    let result = cartItems.map((a) => a.item);

    const newDocRef3 = doc(
      collection(doc(collection(db, 'Families'), familyId), 'Trip History')
    );

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    await setDoc(newDocRef3, {
      quantity: cart.length,
      date: today,
      items: result,
    });
    // setCart([]);
    deleteCartItems(familyId);
  };

  useLayoutEffect(() => {
    let collectionRef = collection(
      db,
      'Families',
      `${userDetails.familyId}`,
      'Trip History'
    );

    onSnapshot(collectionRef, (snapshot) => {
      let newHistoryItem = [];
      snapshot.docs.forEach((doc) => {
        newHistoryItem.push({ ...doc.data(), id: doc.id });
      });
      setTripHistory(newHistoryItem);
    });
  }, [userDetails]);

  const cartHistoryDetails = (items) => {
    setHistoryDetails(items);
  };

  const navToHistory = () => {
    if (history) {
      setHistory(false);
    } else if (!history) {
      setHistory(true);
    }
  };

  if (!history) {
    if (groceryOrComplete == 'grocery') {
      return (
        <>
          <Appbar style={styles.headerGrocery}>
            <Appbar.Content
              title={
                <SegmentedButtons
                  style={styles.segButtons}
                  value={groceryOrComplete}
                  onValueChange={setGroceryOrComplete}
                  buttons={[
                    {
                      value: 'grocery',
                      label: 'Grocery List',
                      showSelectedCheck: true,
                    },
                    {
                      value: 'complete',
                      label: `In Cart (${cart.length})`,
                      showSelectedCheck: true,
                    },
                  ]}
                />
              }
            />
            <Appbar.Action icon="history" onPress={navToHistory} />
          </Appbar>
          <Divider />
          <View style={styles.taskList}>
            <Text>Items for your next Grocery Trip!</Text>
          </View>
          <ScrollView style={{ paddingBottom: 55 }}>
            {items.map((item, key) => {
              return (
                <ScrollView key={key}>
                  <View style={styles.mainRow}>
                    <View style={styles.userRow}>
                      <View style={styles.userInfo}>
                        <Avatar.Image
                          size={40}
                          source={{ uri: item.photoURL }}
                        />
                        <Text>{item.name}</Text>
                      </View>
                      <Text>{item.item}</Text>
                    </View>
                    <View style={styles.addDelete}>
                      <Button
                        icon="playlist-plus"
                        mode="text"
                        onPress={() => {
                          handleAdd(
                            item.documentId,
                            item.familyId,
                            item.name,
                            item.item,
                            item.userId
                          );
                        }}
                      ></Button>
                      <Button
                        icon="trash-can-outline"
                        mode="text"
                        onPress={() => {
                          handleRemove(item.documentId, item.familyId);
                        }}
                      ></Button>
                    </View>
                  </View>
                  <Divider />
                </ScrollView>
              );
            })}
          </ScrollView>
          <View style={styles.addGrocery}>
            <TextInput
              style={styles.keyboard}
              removeClippedSubviews={false}
              label="Add Grocery Item"
              value={grocery}
              onChangeText={(grocery) => setGrocery(grocery)}
              onSubmitEditing={handleSubmit}
            />
          </View>
        </>
      );
    } else if (groceryOrComplete == 'complete') {
      return (
        <>
          <Appbar style={styles.headerGrocery}>
            <Appbar.Content
              title={
                <SegmentedButtons
                  style={styles.segButtons}
                  value={groceryOrComplete}
                  onValueChange={setGroceryOrComplete}
                  buttons={[
                    {
                      value: 'grocery',
                      label: 'Grocery List',
                      showSelectedCheck: true,
                    },
                    {
                      value: 'complete',
                      label: `In Cart (${cart.length})`,
                      showSelectedCheck: true,
                    },
                  ]}
                />
              }
            />
            <Appbar.Action icon="history" onPress={navToHistory} />
          </Appbar>
          <Divider />
          <View style={styles.taskList}>
            <Text>Items in Cart</Text>
          </View>
          <ScrollView style={{ paddingBottom: 55 }}>
            {cart.map((cart, key) => {
              return (
                <ScrollView key={key}>
                  <View style={styles.mainRow}>
                    <View style={styles.userRow}>
                      <Text>{cart.item}</Text>
                    </View>

                    <View style={styles.cartDelete}>
                      <Button
                        icon="cart-remove"
                        mode="text"
                        onPress={() => {
                          handleRemoveCart(cart.documentId, cart.familyId);
                        }}
                      ></Button>
                    </View>
                  </View>
                  <Divider />
                </ScrollView>
              );
            })}
          </ScrollView>
          <View style={styles.screen}>
            <Button
              onPress={() => {
                confirmCart(userDetails.familyId, cart);
              }}
            >
              Checkout Cart
            </Button>
          </View>
        </>
      );
    }
  } else if (history) {
    return (
      <>
        <Appbar style={styles.header}>
          <Appbar.Content title={'Cart History'} />
          <Appbar.Action icon="keyboard-backspace" onPress={navToHistory} />
        </Appbar>
        <View style={styles.taskList}>
          <Text>Previous Carts</Text>
        </View>
        <ScrollView style={{ paddingBottom: 55 }}>
          {tripHistory.map((history, key) => {
            return (
              <ScrollView key={key}>
                <Card.Title
                  title={history.date}
                  subtitle={history.quantity + itemPlaceholder}
                  left={(props) => <Avatar.Icon {...props} icon="shopping" />}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="table-of-contents"
                      onPress={() => {
                        cartHistoryDetails(history.items);
                        toggleTripHistoryView();
                      }}
                    />
                  )}
                />
                <Divider />
              </ScrollView>
            );
          })}
        </ScrollView>
        <View>
          <Modal
            animationType="fade"
            transparent
            visible={tripHistoryModalVisible}
            presentationStyle="overFullScreen"
          >
            <View style={styles.mainModal}>
              <View style={styles.mainView}>
                <Text style={styles.baseText}>
                  {historyDetails.length + itemPlaceholder}
                </Text>
                <View style={styles.lineStyle} />
                {historyDetails.map((item, key) => {
                  return (
                    <View style={styles.modalDetails} key={key}>
                      <Text>{item}</Text>
                    </View>
                  );
                })}
                <View style={styles.lineStyle} />
                <View style={styles.buttonView}>
                  <Button
                    onPress={toggleTripHistoryView}
                    style={styles.closeButton}
                  >
                    Close
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </>
    );
  }
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
  headerGrocery: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    fontSize: 30,
    backgroundColor: 'white',
  },
  screen: {
    width: '50%',
    borderRadius: 30,
    backgroundColor: '#c4def6',
    position: 'absolute',
    bottom: 10,
    left: '25%',
  },
  taskList: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'lightgray',
  },
  addDelete: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 140,
  },
  cartDelete: {
    display: 'flex',
    // flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'center',
    // width: 140,
    padding: 10,
  },
  mainModal: {
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
    // height: auto,
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 7,
    padding: 15,
  },
  baseText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  modalDetails: {
    alignSelf: 'center',
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: '#c4def6',
    width: 80,
  },
  lineStyle: {
    borderWidth: 0.5,
    borderColor: 'black',
    margin: 10,
    width: '50%',
  },
});
