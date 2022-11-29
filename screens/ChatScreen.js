import React, {
  useEffect,
  useCallback,
  useState,
  useLayoutEffect,
} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { Avatar } from 'react-native-elements';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { GiftedChat } from 'react-native-gifted-chat';
import { Appbar } from 'react-native-paper';

const Chat = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  // const signOutNow = () => {
  //     signOut(auth).then(() => {
  //         // Sign-out successful.
  //         navigation.replace('Login');
  //     }).catch((error) => {
  //         // An error happened.
  //     });
  // }
  //   useLayoutEffect(() => {
  //     navigation.setOptions({
  //       headerLeft: () => (
  //         <View style={{ marginLeft: 20 }}>
  //           {/* <Avatar
  //                         rounded
  //                         source={{
  //                             uri: auth?.currentUser?.photoURL,
  //                         }}
  //                     /> */}
  //         </View>
  //       ),
  //       headerRight: () => (
  //         <TouchableOpacity
  //           style={{
  //             marginRight: 10,
  //           }}
  //           onPress={signOutNow}
  //         >
  //           <Text>logout</Text>
  //         </TouchableOpacity>
  //       ),
  //     });
  //   }, [navigation]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);
  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
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
      onSend={(messages) => onSend(messages)}
      user={{
        _id: auth?.currentUser?.email,
        name: auth?.currentUser?.displayName,
        // avatar: auth?.currentUser?.photoURL
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
})
