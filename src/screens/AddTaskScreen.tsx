import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { useTasks } from '../context/TaskContext';

type AddTaskScreenProps = NativeStackScreenProps<RootStackParamList, 'addTask'>;

// --- Theme and Colors ---
const THEME = {
  primary: '#2563EB',
  danger: '#EF4444',
  success: '#10B981',
};

// --- Custom Components ---

interface HeaderProps {
    title: string;
    color: string;
    hasBackButton?: boolean;
    navigation: AddTaskScreenProps['navigation'];
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

interface InputProps {
    label: string;
    placeholder: string;
    onChangeText: (text: string) => void;
    value: string;
}

const InputComponent: React.FC<InputProps> = ({ label, placeholder, onChangeText, value }) => (
    <View style={componentStyles.formGroup}>
        <Text style={componentStyles.label}>{label}</Text>
        <TextInput
            style={componentStyles.input}
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value}
            placeholderTextColor="#999"
        />
    </View>
);

const TextareaComponent: React.FC<InputProps> = ({ label, placeholder, onChangeText, value }) => (
    <View style={componentStyles.formGroup}>
        <Text style={componentStyles.label}>{label}</Text>
        <TextInput
            style={[componentStyles.input, componentStyles.textarea]}
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
        />
    </View>
);

interface DatePickerProps {
    label: string;
    date: Date;
    setDate: (date: Date) => void;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({ label, date, setDate }) => {
    const [open, setOpen] = useState(false);
    
    const displayDate = date.toLocaleDateString('tr-TR');

    return (
        <View style={componentStyles.formGroup}>
            <Text style={componentStyles.label}>{label}</Text>
            <TouchableOpacity onPress={() => setOpen(true)} style={componentStyles.dateInput}>
                <Text style={componentStyles.dateText}>{displayDate}</Text>
                <Feather name="calendar" size={20} color={THEME.primary} />
            </TouchableOpacity>
            
            <DatePicker
                modal
                open={open}
                date={date}
                mode="date"
                onConfirm={(newDate) => {
                    setOpen(false);
                    setDate(newDate);
                }}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </View>
    );
};

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


// --- Screen Implementation ---

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation }) => {
    const { createTask } = useTasks();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    // Default due date: Tomorrow
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    const [dueDate, setDueDate] = useState(defaultDate);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert("Hata", "Başlık alanı zorunludur.");
            return;
        }

        setIsSaving(true);
        try {
            // Backend expects YYYY-MM-DD format for date
            const dateToSend = dueDate.toISOString().split('T')[0];
            
            await createTask({
                title,
                description,
                dueDate: dateToSend,
            });
            
            navigation.goBack();
        } catch (e) {
            Alert.alert("Hata", "Görev kaydedilirken bir sorun oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={componentStyles.container}>
            <CustomHeader 
                title="Yeni Görev Oluştur" 
                color={THEME.primary} 
                hasBackButton={true}
                navigation={navigation}
            />
            
            <ScrollView style={componentStyles.content} keyboardShouldPersistTaps="handled">
                <InputComponent 
                    label="Başlık" 
                    placeholder="Görev Başlığını Girin" 
                    onChangeText={setTitle}
                    value={title}
                />
                
                <TextareaComponent 
                    label="Açıklama" 
                    placeholder="Detaylı açıklama"
                    onChangeText={setDescription}
                    value={description}
                />
                
                <DatePickerComponent 
                    label="Bitiş Tarihi"
                    date={dueDate}
                    setDate={setDueDate}
                />
                
                <View style={{ marginTop: 20 }}>
                    <CustomButton 
                        label={isSaving ? "Kaydediliyor..." : "Kaydet"}
                        color={THEME.primary}
                        action={handleSave}
                        disabled={isSaving}
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
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
    },
    textarea: {
        height: 100,
        paddingTop: 10,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 6,
        padding: 10,
        backgroundColor: '#F9F9F9',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
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

export default AddTaskScreen;