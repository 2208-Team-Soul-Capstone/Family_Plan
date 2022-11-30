import { KeyboardAvoidingView, StyleSheet, TouchableOpacity, View, Platform, TextInput, Button }
    from 'react-native';
import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase'
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from 'react-native-paper';
import { doc, setDoc } from "firebase/firestore"; 


const RegisterScreen = () => {
    const navigation = useNavigation();

    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fId, setFId] = useState('');

    const [date, setDate] = useState(new Date(1598051730000));
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [text, setText] = useState('No date of birth selected')

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

    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                return setDoc(doc(db, "users", userCredential.user.uid), {
                    name: userName,
                    familyId: fId,
                    birthday: date
                  });
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                console.log(error);
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
    };

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
        setText(fDate)
        console.log(fDate)
    }

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    }

    const closeDate = () => {
        setShow(false);
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Name"
                    value={userName}
                    onChangeText={(text) => setUserName(text)}
                    style={styles.input}
                />
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
                    secureTextEntry
                />
                <Text>If you have a Family ID, enter it below. Otherwise a new family will be created for you.</Text>
                <TextInput
                    placeholder="Family ID"
                    value={fId}
                    onChangeText={(text) => setFId(text)}
                    style={styles.input}
                />

                <View style={styles.birthdayButton}>
                    <View>
                        {!show && (
                            <>
                                <Text variant='titleLarge' style={styles.birthdayButtonText}>Birthday: {text}</Text>

                                <Button title='Click to set Birthday' onPress={() => showMode('date')} />
                            </>
                        )}
                    </View>

                    {show && (
                        <>


                            <DateTimePicker
                                testID='dateTimePicker'
                                value={date}
                                mode={mode}
                                is24Hour={true}
                                display='spinner'
                                onChange={onChange}
                            />
                            <Button title='Set Date' onPress={() => closeDate()} />
                        </>
                    )}
                </View>
            </View>

            <View style={styles.buttonContainer}>

                <TouchableOpacity
                    onPress={handleSignUp}
                    style={[styles.button, styles.buttonOutline]}
                >
                    <Text style={styles.buttonOutlineText}>Sign up!</Text>
                </TouchableOpacity>
            </View>



        </KeyboardAvoidingView>
    )
}

export default RegisterScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    birthdayButton: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 15,
    },
    birthdayButtonText: {
        color: 'gray',
        textAlign: 'center',
    }
});
