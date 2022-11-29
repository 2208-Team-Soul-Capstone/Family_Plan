import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Appbar } from 'react-native-paper'

const IndividualTask = () => {
  return (
    <>
    <Appbar
    style={styles.header}>
    <Appbar.Content title={"Task Name"} />
  </Appbar>
    <View>
      <Text>Individual Task info/options here</Text>
    </View>
    </>
  )
}

export default IndividualTask

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