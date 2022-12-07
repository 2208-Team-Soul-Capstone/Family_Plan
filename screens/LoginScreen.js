import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  AuthErrorCodes,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        navigation.replace('Home');
        // ...
      } else {
        // User is signed out
        // ...
      }
    });
    return unsubscribe;
  }, []);


  const registerScreen = () => {
    navigation.replace('Register');
  }

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('Logged in with: ', user.email);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  return (
    <>
        {/* <Appbar style={styles.header}>
    <Appbar.Content title={'Family Plan'} />  
    </Appbar> */}
<View style={styles.main}>
    <KeyboardAvoidingView style={styles.container} behavior="padding">
<View >  
  <Text>    
  <Image
        style={styles.logo}
        source={{
          uri: 'https://firebasestorage.googleapis.com/v0/b/familyplan-3d847.appspot.com/o/logo.jpg?alt=media&token=78d6580b-5e0c-406c-8fc7-10f801e91c3b',
        }}
      />
      </Text>
      </View>
      <View style={styles.inputContainer}>


        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          onEndEditing={handleLogin}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={registerScreen}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </View>
    </>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#F5F5F5',
    flex: 1,
    flexDirection: 'column',
  },
  container: {
    alignItems: 'center',
    top: 95,
  },
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: 'flex-end',
    fontSize: 30,
    backgroundColor: 'white',
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    borderColor: '#0782F9',
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: '#0782F9',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#0782F9',
    fontWeight: '700',
    fontSize: 16,
  },
  logo: {
    height: 275,
    width: 240,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});
