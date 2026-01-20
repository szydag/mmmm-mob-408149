import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext'; 

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'home'>;

// --- Theme and Colors ---
const THEME = {
  primary: '#2563EB',
  danger: '#EF4444',
  success: '#10B981',
  secondary: '#F3F4F6',
};

// --- Custom Components ---

interface HeaderProps {
    title: string;
    color: string;
    hasBackButton?: boolean;
    navigation: HomeScreenProps['navigation'];
}

const CustomHeader: React.FC<HeaderProps> = ({ title, color }) => (
    <View style={[styles.headerContainer, { backgroundColor: color }]}>
        <SafeAreaView edges={['top']} style={styles.headerContent}>
            <Text style={styles.headerTitle}>{title}</Text>
        </SafeAreaView>
    </View>
);

interface TaskCardProps {
    task: {
        id: string;
        title: string;
        status: string;
        dueDate: string | null;
    };
    onPressAction: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPressAction }) => {
    const statusColor = task.status === 'completed' ? THEME.success : '#F59E0B';
    const statusText = task.status === 'completed' ? 'Tamamlandı' : 'Beklemede';

    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => onPressAction(task.id)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{task.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{statusText}</Text>
                </View>
            </View>
            {task.dueDate && (
                <Text style={styles.cardDetail}>Bitiş Tarihi: {task.dueDate}</Text>
            )}
        </TouchableOpacity>
    );
};

interface FABProps {
    icon: string; 
    color: string;
    action: () => void;
}

const FloatingActionButton: React.FC<FABProps> = ({ icon, color, action }) => (
    <TouchableOpacity 
        style={[styles.fab, { backgroundColor: color }]}
        onPress={action}
    >
        <Feather name={icon as 'plus'} size={30} color="#FFF" />
    </TouchableOpacity>
);

// --- Screen Implementation ---

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { tasks, fetchTasks, isLoading } = useTasks();

    const handlePressTask = (taskId: string) => {
        navigation.navigate('taskDetail', { taskId });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomHeader 
                title="Yapılacaklar" 
                color={THEME.primary} 
                navigation={navigation} 
            />

            {/* List */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchTasks} />
                }
            >
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onPressAction={handlePressTask} 
                        />
                    ))
                ) : (
                    <Text style={styles.emptyText}>Henüz görev bulunmamaktadır.</Text>
                )}
            </ScrollView>

            {/* FAB */}
            <FloatingActionButton
                icon="plus"
                color={THEME.primary}
                action={() => navigation.navigate('addTask')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    headerContainer: {
        paddingTop: 0,
        backgroundColor: '#2563EB',
    },
    headerContent: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    content: {
        flex: 1,
        padding: 10,
    },
    card: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 8,
        marginVertical: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderLeftWidth: 5,
        borderLeftColor: THEME.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        flexShrink: 1,
    },
    cardDetail: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        borderRadius: 30,
        elevation: 5,
    },
});

export default HomeScreen;