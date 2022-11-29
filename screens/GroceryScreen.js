import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button, Appbar, Checkbox, TextInput, Divider} from 'react-native-paper';


const GroceryScreen = () => {

  const [checked, setChecked] = React.useState(false);
  const [grocery, setGrocery] = React.useState('');


  const items = ['bananas', 'milk', 'eggs', 'steak', 'oreos']

 
  return (
    <>
    <Appbar
      style={styles.header}
      >    
      <Appbar.Content title={'Family Grocery List'} />      
      </Appbar>

    <View>
    {
      items.map((item) => {
        return (
          <>
          <Checkbox.Item 
          label={item} 
          color='green'
          status={checked ? 'checked' : 'unchecked'}
          onPress={() => {
            setChecked(!checked);
          }} />
          <Divider/>
          </>
        )
      })
    }
    </View>
    <View style={styles.addGrocery}> 
    <TextInput
      label="Add Grocery Item"
      value={grocery}
      onChangeText={grocery => setGrocery(grocery)}
    />
    </View>
  </>
  )
}

export default GroceryScreen

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: 'flex-end',
    marginBottom: 10,
    fontSize: 30,
    backgroundColor: '#c4def6',
  },
  addGrocery: {
    flex: 1,
    justifyContent: 'flex-end',
  }
})