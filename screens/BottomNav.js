import * as React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import ChatScreen from './ChatScreen';
import TaskScreen from './TaskScreen';
import GroceryScreen from './GroceryScreen';
import CalendarScreen from './CalendarScreen';

const TaskRoute = () => <TaskScreen />;

const GroceryRoute = () => <GroceryScreen />;

const ChatRoute = () => <ChatScreen />;

const CalendarRoute = () => <CalendarScreen />;

const BottomNav = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'task',
      title: 'Lists',
      focusedIcon: 'clipboard-list',
      unfocusedIcon: 'clipboard-list-outline',
    },
    {
      key: 'grocery',
      title: 'Grocery',
      focusedIcon: 'cart',
      unfocusedIcon: 'cart-outline',
    },
    {
      key: 'chat',
      title: 'Chat',
      focusedIcon: 'chat',
      unfocusedIcon: 'chat-outline',
    },
    {
      key: 'calendar',
      title: 'Calendar',
      focusedIcon: 'calendar-account',
      unfocusedIcon: 'calendar-account-outline',
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    task: TaskRoute,
    grocery: GroceryRoute,
    chat: ChatRoute,
    calendar: CalendarRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

export default BottomNav;
