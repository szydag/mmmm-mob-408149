import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';

// Type definitions for navigation params
export type RootStackParamList = {
  home: undefined;
  addTask: undefined;
  taskDetail: { taskId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{
        headerShown: false, // Use custom headers defined in screens
      }}
    >
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen name="addTask" component={AddTaskScreen} />
      <Stack.Screen name="taskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;