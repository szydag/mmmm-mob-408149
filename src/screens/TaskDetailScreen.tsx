import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { api } from '../../App'; 

type TaskDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'taskDetail'>;

// --- Theme and Colors ---
const THEME = {
  primary: '#2563EB',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#FBBF24', 
};

// --- Custom Components ---

interface HeaderProps {
    title: string;
    color: string;
    hasBackButton?: boolean;
    navigation: TaskDetailScreenProps['navigation'];
}

const CustomHeader: React.FC<HeaderProps> = ({ title, color, hasBackButton, navigation }) => (
    <View style={[componentStyles.headerContainer, { backgroundColor: color }]}>
        <SafeAreaView edges={['top']} style={componentStyles.headerContent}>
            {hasBackButton && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={componentStyles.backButton}>
                    <Feather name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
            )}
            <Text style={componentStyles.headerTitle}>{title}</Text>
        </SafeAreaView>
    </View>
);

interface ButtonProps {
    label: string;
    color: string;
    action: () => void;
    fullWidth?: boolean;
    disabled?: boolean;
}

const CustomButton: React.FC<ButtonProps> = ({ label, color, action, fullWidth = true, disabled = false }) => (
    <TouchableOpacity
        style={[
            componentStyles.button, 
            { backgroundColor: color }, 
            fullWidth && componentStyles.buttonFullWidth,
            disabled && { opacity: 0.6 }
        ]}
        onPress={action}
        disabled={disabled}
    >
        <Text style={componentStyles.buttonText}>{label}</Text>
    </TouchableOpacity>
);

interface DetailField {
    key: string;
    label: string;
    style?: 'h2' | 'normal';
    colorMap?: Record<string, string>;
}

interface DetailViewProps {
    data: any; 
    fields: DetailField[];
}

const DetailView: React.FC<DetailViewProps> = ({ data, fields }) => {
    if (!data) return <Text>Detaylar yüklenemedi.</Text>;

    const renderFieldValue = (key: string, value: any, style: 'h2' | 'normal', colorMap?: Record<string, string>) => {
        if (key === 'status' && colorMap) {
            const statusKey = value as string;
            const color = colorMap[statusKey] || '#888';
            const displayValue = statusKey === 'completed' ? 'Tamamlandı' : 'Beklemede';
            
            return (
                <View style={[componentStyles.statusDetailBadge, { backgroundColor: color }]}>
                    <Text style={componentStyles.statusDetailText}>{displayValue}</Text>
                </View>
            );
        }
        
        return (
            <Text style={style === 'h2' ? componentStyles.detailH2 : componentStyles.detailNormal}>
                {value || 'Belirtilmemiş'}
            </Text>
        );
    };

    return (
        <View style={componentStyles.detailContainer}>
            {fields.map((field) => (
                <View key={field.key} style={componentStyles.detailRow}>
                    <Text style={componentStyles.detailLabel}>{field.label}:</Text>
                    {renderFieldValue(field.key, data[field.key], field.style || 'normal', field.colorMap)}
                </View>
            ))}
            {data.dueDate && (
                <View style={componentStyles.detailRow}>
                    <Text style={componentStyles.detailLabel}>Bitiş Tarihi:</Text>
                    <Text style={componentStyles.detailNormal}>{data.dueDate}</Text>
                </View>
            )}
        </View>
    );
};

// --- Screen Implementation ---

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ route, navigation }) => {
    const { taskId } = route.params;
    const { updateTaskStatus, deleteTask } = useTasks();
    
    // Using separate state for full detail fetch, though context ensures basic data is available
    const [localTask, setLocalTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/tasks/${taskId}`);
            setLocalTask(response.data);
        } catch (e) {
            Alert.alert("Hata", "Görev detayları yüklenemedi.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [taskId, navigation]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);


    const handleToggleStatus = async () => {
        if (!localTask) return;
        const newStatus = localTask.status === 'completed' ? 'pending' : 'completed';
        
        try {
            await updateTaskStatus(taskId, newStatus);
            // Manually update local state for immediate feedback until context refresh catches up
            setLocalTask({...localTask, status: newStatus}); 
            Alert.alert("Başarılı", `Görev durumu ${newStatus === 'completed' ? 'tamamlandı' : 'beklemede'} olarak güncellendi.`);
        } catch (e) {
            Alert.alert("Hata", "Durum güncellenirken bir sorun oluştu.");
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Görevi Sil",
            "Bu görevi silmek istediğinizden emin misiniz?",
            [
                { text: "Hayır", style: 'cancel' },
                { 
                    text: "Evet, Sil", 
                    style: 'destructive', 
                    onPress: async () => {
                        try {
                            await deleteTask(taskId);
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert("Hata", "Silme işlemi başarısız oldu.");
                        } 
                    } 
                },
            ]
        );
    };
    
    const handleEdit = () => {
        Alert.alert("Düzenleme", "Düzenleme ekranı tanımlanmamıştır.");
    };


    if (loading || !localTask) {
        return (
            <View style={[componentStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    const isCompleted = localTask.status === 'completed';

    const detailFields = [
        { key: "title", label: "Başlık", style: "h2" },
        { key: "description", label: "Açıklama", style: "normal" },
        { 
            key: "status", 
            label: "Durum", 
            colorMap: {
                "pending": "#F59E0B",
                "completed": "#10B981"
            }
        }
    ];

    return (
        <View style={componentStyles.container}>
            <CustomHeader 
                title="Detaylar" 
                color={THEME.primary} 
                hasBackButton={true}
                navigation={navigation}
            />
            
            <ScrollView style={componentStyles.content}>
                <DetailView 
                    data={localTask} 
                    fields={detailFields}
                />

                <View style={componentStyles.buttonGroup}>
                    {/* Düzenle Button */}
                    <CustomButton 
                        label="Düzenle"
                        color={THEME.warning}
                        action={handleEdit}
                    />

                    {/* Tamamlandı/Beklemede Olarak İşaretle Button */}
                    <CustomButton 
                        label={isCompleted ? "Beklemede Olarak İşaretle" : "Tamamlandı Olarak İşaretle"}
                        color={isCompleted ? THEME.danger : THEME.success}
                        action={handleToggleStatus}
                    />
                    
                    {/* Sil Button */}
                    <CustomButton 
                        label="Sil"
                        color={THEME.danger}
                        action={handleDelete}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const componentStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    content: {
        padding: 20,
    },
    headerContainer: {
        paddingTop: 0,
        backgroundColor: '#2563EB',
    },
    headerContent: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginLeft: 10,
    },
    backButton: {
        paddingRight: 10,
    },
    detailContainer: {
        marginBottom: 30,
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: THEME.primary,
    },
    detailRow: {
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    detailNormal: {
        fontSize: 16,
        color: '#333',
        paddingLeft: 5,
        marginTop: 2,
    },
    detailH2: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },
    statusDetailBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    statusDetailText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    buttonGroup: {
        marginTop: 10,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    buttonFullWidth: {
        width: '100%',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TaskDetailScreen;