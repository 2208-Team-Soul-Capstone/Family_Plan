import React, {
  useEffect,
  useCallback,
  useState,
} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import { Bubble, GiftedChat, Send, isSameUser, isSameDay } from 'react-native-gifted-chat';
import { auth, db } from '../firebase';
import {
  doc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  addDoc,
  collection
} from 'firebase/firestore';

const Chat = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const uid = auth.currentUser.uid;

  useEffect(() => {
    (async () => {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      setUserDetails(docSnap.data());
    })();
  }, [navigation])

  let messagesRef = collection(
    db,
    'Families',
    `${userDetails.familyId}`,
    'Messages'
  );

  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) =>
      setMessages(
        snapshot.docs.map(doc => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        })),
      ));
    return () => {
      unsubscribe();
    };
  }, [navigation, userDetails]);

  function renderSend(props) {
    return (
      <Send {...props}>
        <View style={styles.sendingContainer}>
          <IconButton icon='send-circle' size={32} color='#6646ee' />
        </View>
      </Send>
    );
  }

  function renderBubble(props) {
    const { user = {} } = props.currentMessage
    const isSelf = user._id === uid
    if (isSameUser(props.currentMessage, props.previousMessage)
      && isSameDay(props.currentMessage, props.previousMessage)
      || isSelf) {
      return (
        <Bubble
          {...props}
        />
      );
    }
    return (
      <View>
        <Text style={styles.name}>{props.currentMessage.user.name}</Text>
        <Bubble
          {...props}
        />
      </View>
    );
  }

  function scrollToBottomComponent() {
    return (
      <View style={styles.bottomComponentContainer}>
        <IconButton icon='chevron-double-down' size={36} color='#6646ee' />
      </View>
    );
  }

  const onSend = useCallback((messages = []) => {
    const { _id, createdAt, text, user, } = messages[0]
    addDoc(collection(doc(collection(db, 'Families'), `${userDetails.familyId}`),
      'Messages'
    ),
      {
        _id,
        createdAt,
        text,
        user
      }
    )
  }, [userDetails]);
  return (
    <>
      <Appbar.Header
        style={styles.header}
      >
        <Appbar.Content title={'Group Chat'} />
      </Appbar.Header>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage
        renderBubble={renderBubble}
        renderSend={renderSend}
        alwaysShowSend
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: uid,
          name: userDetails.name,
          avatar: userDetails.photoURL
        }}
      />
    </>
  );
};

export default Chat;

const styles = StyleSheet.create({
  header: {
    marginTop: 0,
    marginBottom: 0,
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
