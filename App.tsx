import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Alert } from 'react-native';
import axios from 'axios';

// API Configuration (Use 10.0.2.2 for Android emulator localhost)
const API_ROOT_URL = 'http://10.0.2.2:3000'; 
export const api = axios.create({ baseURL: API_ROOT_URL }); 

// --- Task Context Definition ---
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string | null; 
}

interface TaskContextType {
  tasks: Task[];
  fetchTasks: () => void;
  isLoading: boolean;
  createTask: (data: { title: string; description: string; dueDate: string | null }) => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'completed' | 'pending') => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
}

const TaskContext = React.createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = React.useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchTasks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (e) {
      console.error("Error fetching tasks:", e);
      Alert.alert("Bağlantı Hatası", "Görevler yüklenemedi. API'nin çalıştığından emin olun.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data) => {
    await api.post('/api/tasks', data);
    fetchTasks();
  };

  const updateTaskStatus = async (taskId, status) => {
    await api.patch(`/api/tasks/${taskId}/status`, { status });
    fetchTasks();
  };

  const deleteTask = async (taskId) => {
    await api.delete(`/api/tasks/${taskId}`);
    fetchTasks();
  };
  
  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks, isLoading, createTask, updateTaskStatus, deleteTask, getTaskById }}>
      {children}
    </TaskContext.Provider>
  );
};
// --- End Task Context ---

const App = () => {
  return (
    <SafeAreaProvider>
      <TaskProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </TaskProvider>
    </SafeAreaProvider>
  );
};

export default App;