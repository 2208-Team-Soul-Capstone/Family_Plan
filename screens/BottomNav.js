import * as React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import ChatScreen from './ChatScreen';

const TaskRoute = () => <Text>Task</Text>;

const GroceryRoute = () => <Text>Grocery</Text>;

const ChatRoute = () => <ChatScreen />;

const CalendarRoute = () => <Text>Calendar</Text>;

const SettingsRoute = () => <Text>Settings</Text>;

const BottomNav = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'task',
      title: 'Tasks',
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
    {
      key: 'settings',
      title: 'Settings',
      focusedIcon: 'cog',
      unfocusedIcon: 'cog-outline',
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    task: TaskRoute,
    grocery: GroceryRoute,
    chat: ChatRoute,
    calendar: CalendarRoute,
    settings: SettingsRoute,
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
