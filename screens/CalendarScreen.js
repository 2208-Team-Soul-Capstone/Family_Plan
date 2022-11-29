import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Button, Appbar, List, Text} from 'react-native-paper';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import { Divider } from 'react-native-paper';



const CalendarScreen = () => {
  return (
    <>
      <Appbar
        style={styles.header}
        >    
        <Appbar.Content title={'Family Events Calendar'} />      
        </Appbar>

      <View>
      <Calendar
  // Initially visible month. Default = now
  initialDate={'2012-03-01'}
  // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
  minDate={'2012-05-10'}
  // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
  maxDate={'2012-05-30'}
  // Handler which gets executed on day press. Default = undefined
  onDayPress={day => {
    console.log('selected day', day);
  }}
  // Handler which gets executed on day long press. Default = undefined
  onDayLongPress={day => {
    console.log('selected day', day);
  }}
  // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
  monthFormat={'yyyy MM'}
  // Handler which gets executed when visible month changes in calendar. Default = undefined
  onMonthChange={month => {
    console.log('month changed', month);
  }}
  // Hide month navigation arrows. Default = false
  hideArrows={true}
  // Replace default arrows with custom ones (direction can be 'left' or 'right')
  renderArrow={direction => <Arrow />}
  // Do not show days of other months in month page. Default = false
  hideExtraDays={true}
  // If hideArrows = false and hideExtraDays = false do not switch month when tapping on greyed out
  // day from another month that is visible in calendar page. Default = false
  disableMonthChange={false}
  // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
  firstDay={1}
  // Hide day names. Default = false
  hideDayNames={false}
  // Show week numbers to the left. Default = false
  showWeekNumbers={true}
  // Handler which gets executed when press arrow icon left. It receive a callback can go back month
  onPressArrowLeft={subtractMonth => subtractMonth()}
  // Handler which gets executed when press arrow icon right. It receive a callback can go next month
  onPressArrowRight={addMonth => addMonth()}
  // Disable left arrow. Default = false
  disableArrowLeft={false}
  // Disable right arrow. Default = false
  disableArrowRight={false}
  // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
  disableAllTouchEventsForDisabledDays={false}
  // Replace default month and year title with custom one. the function receive a date as parameter
  renderHeader={date => {
    /*Return JSX*/
  }}
  // Enable the option to swipe between months. Default = false
  enableSwipeMonths={true}
/>
      </View>
      <Divider />
      <View style={styles.events}>
        <Text variant="headlineSmall">Upcoming Events:</Text>
        <List.Item
    title="Tim's Birthday"
    description="12-3-2022"
    left={props => <List.Icon {...props} icon="calendar" />}
  />
    <List.Item
    title="Christmas with the family!"
    description="12-25-2022"
    left={props => <List.Icon {...props} icon="calendar" />}
  />
      </View>
      <View style={styles.addEvent}>

      </View>
    </>
  )
}

export default CalendarScreen

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: 'flex-end',
    marginBottom: 10,
    fontSize: 30,
    backgroundColor: '#c4def6',
  },
  events:{
    marginTop: 20,
    marginLeft: 20,
  },
  addEvent: {
    flex: 1,
    justifyContent: 'flex-end',
  }
})