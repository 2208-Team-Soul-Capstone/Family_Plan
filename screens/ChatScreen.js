import React, {
  useEffect,
  useCallback,
  useState,
  useLayoutEffect,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebase';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import { Appbar, Avatar, IconButton } from 'react-native-paper';
import { doc, setDoc, query, orderBy, onSnapshot, getDoc, getDocs, addDoc, collection } from 'firebase/firestore';

const Chat = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  const uid = auth.currentUser.uid;

  useEffect(() => {
    (async () => {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      setUserDetails(docSnap.data())
    })();
  }, [])
//
  useLayoutEffect(() => {
    const messagesRef = collection(
      db,
      'Families',
      `${userDetails.familyId}`,
      'Messages',
    )//
    //     const potato = query(collection(doc(collection(db, 'Families'), userDetails.familyId), 'Messages'))
    // console.log('-----POTATO-----', potato)
    console.log('||||||||||||-messagesRef-|||||||||||||', messagesRef)

    const q = query(messagesRef, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => setMessages(
      snapshot.docs.map(doc => ({
        _id: doc.data()._id,
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: doc.data().user,
      }))
    ));
    console.log('setMessages has been fired')
    return () => {
      unsubscribe();
    };
  }, []);
console.log('after usubscribe')

  function renderSend(props) {
    return (
      <Send {...props}>
        <View style={styles.sendingContainer}>
          <IconButton icon='send-circle' size={32} color='#6646ee' />
        </View>
      </Send>
    );
  }

  function scrollToBottomComponent() {
    return (
      <View style={styles.bottomComponentContainer}>
        <IconButton icon='chevron-double-down' size={36} color='#6646ee' />
      </View>
    );
  }
console.log(userDetails.familyId)
  const onSend = useCallback((messages = []) => {
    // setMessages((previousMessages) =>
    //   GiftedChat.append(previousMessages, messages)
    // );
    const { _id, createdAt, text, user, } = messages[0]
if (userDetails.familyId) {
    addDoc(
      collection(
        doc(collection(db, 'Families'), userDetails.familyId),
        'Messages'
      ),
      {
        _id,
        createdAt,
        text,
        user,
      }
    )};
  }, []);


  return (
    <>
      <Appbar
        style={styles.header}
      >
        <Appbar.Content title={'FamilyName Group Chat'} />
      </Appbar>
      <GiftedChat
        messages={messages}  
        showAvatarForEveryMessage={true}
        renderSend={renderSend}
        alwaysShowSend
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth?.currentUser?.email,
          name: auth?.currentUser?.displayName,
          // avatar: "https://store.playstation.com/store/api/chihiro/00_09_000/container/US/en/99/UP0151-CUSA09971_00-AV00000000000004/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=720&h=720",
        }}
      />
    </>
  );
};

export default Chat;

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: 'flex-end',
    marginBottom: 10,
    fontSize: 30,
    backgroundColor: '#c4def6',
  },
  sendingContainer: {
    justifyContent: 'center',

  },
  bottomComponentContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
})
