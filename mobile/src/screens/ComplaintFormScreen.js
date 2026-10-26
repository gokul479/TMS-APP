import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { complaintService, departmentService, programmeService, blockService, roomService } from '../config/api';
import { AuthContext } from '../context/AuthContext';

const COMPLAINT_TYPES = [
    { label: 'PC Hardware', icon: '💻' },
    { label: 'PC Software', icon: '🖥️' },
    { label: 'Network & Wi-Fi', icon: '🌐' },
    { label: 'Electrical', icon: '⚡' },
    { label: 'Plumbing', icon: '🚰' },
    { label: 'Application Issues', icon: '⚙️' },
    { label: 'Other', icon: '📌' },
];

export default function ComplaintFormScreen({ navigation }) {
    const { user } = useContext(AuthContext);

    // Cascading dropdown states: Department -> Programme -> Block -> Room
    const [departments, setDepartments] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');

    const [programmes, setProgrammes] = useState([]);
    const [selectedProgId, setSelectedProgId] = useState('');

    const [blocks, setBlocks] = useState([]);
    const [selectedBlockId, setSelectedBlockId] = useState('');

    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [customRoomNumber, setCustomRoomNumber] = useState('');

    // Complaint details
    const [complaintType, setComplaintType] = useState('PC Hardware');
    const [remarks, setRemarks] = useState('');
    const [imageUri, setImageUri] = useState(null);

    // Loading indicators
    const [loadingMaster, setLoadingMaster] = useState(true);
    const [loadingProg, setLoadingProg] = useState(false);
    const [loadingBlocks, setLoadingBlocks] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // 1. Fetch departments on mount
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await departmentService.getAll();
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setDepartments(list);
            } catch (err) {
                console.log('Error fetching departments:', err);
            } finally {
                setLoadingMaster(false);
            }
        };
        fetchDepts();
    }, []);

    // 2. Fetch programmes when department changes
    useEffect(() => {
        if (!selectedDeptId) {
            setProgrammes([]);
            setSelectedProgId('');
            setBlocks([]);
            setSelectedBlockId('');
            setRooms([]);
            setSelectedRoomId('');
            setCustomRoomNumber('');
            return;
        }

        const fetchProg = async () => {
            try {
                setLoadingProg(true);
                const res = await programmeService.getAll({ departmentId: selectedDeptId });
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setProgrammes(list);
            } catch (err) {
                console.log('Error fetching programmes:', err);
            } finally {
                setLoadingProg(false);
            }
        };

        fetchProg();
        setSelectedProgId('');
        setBlocks([]);
        setSelectedBlockId('');
        setRooms([]);
        setSelectedRoomId('');
        setCustomRoomNumber('');
    }, [selectedDeptId]);

    // 3. Fetch blocks when programme changes
    useEffect(() => {
        if (!selectedProgId) {
            setBlocks([]);
            setSelectedBlockId('');
            setRooms([]);
            setSelectedRoomId('');
            setCustomRoomNumber('');
            return;
        }

        const fetchBlocks = async () => {
            try {
                setLoadingBlocks(true);
                const res = await blockService.getAll({ departmentId: selectedDeptId, programmeId: selectedProgId });
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setBlocks(list);
            } catch (err) {
                console.log('Error fetching blocks:', err);
            } finally {
                setLoadingBlocks(false);
            }
        };

        fetchBlocks();
        setSelectedBlockId('');
        setRooms([]);
        setSelectedRoomId('');
        setCustomRoomNumber('');
    }, [selectedDeptId, selectedProgId]);

    // 4. Fetch rooms when block changes
    useEffect(() => {
        if (!selectedBlockId) {
            setRooms([]);
            setSelectedRoomId('');
            setCustomRoomNumber('');
            return;
        }

        const fetchRooms = async () => {
            try {
                setLoadingRooms(true);
                const res = await roomService.getAll({ blockId: selectedBlockId, departmentId: selectedDeptId, programmeId: selectedProgId });
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setRooms(list);
            } catch (err) {
                console.log('Error fetching rooms:', err);
            } finally {
                setLoadingRooms(false);
            }
        };

        fetchRooms();
        setSelectedRoomId('');
        setCustomRoomNumber('');
    }, [selectedBlockId, selectedDeptId, selectedProgId]);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Gallery access permission is needed to attach images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (user?.role === 'SuperAdmin') {
            Alert.alert('Access Denied', 'Super Admin cannot raise complaints.');
            return;
        }

        if (!selectedDeptId) {
            Alert.alert('Validation Error', 'Please select a Department.');
            return;
        }

        if (!selectedProgId) {
            Alert.alert('Validation Error', 'Please select a Programme.');
            return;
        }

        if (!selectedBlockId) {
            Alert.alert('Validation Error', 'Please select a Block Name.');
            return;
        }

        const selectedDept = departments.find(d => String(d._id) === String(selectedDeptId));
        const selectedProg = programmes.find(p => String(p._id) === String(selectedProgId));
        const selectedBlock = blocks.find(b => String(b._id) === String(selectedBlockId));
        const selectedRoom = rooms.find(r => String(r._id) === String(selectedRoomId));

        const finalRoomNumber = selectedRoomId === '__custom__' ? customRoomNumber.trim() : (selectedRoom?.roomNumber || customRoomNumber.trim());

        if (!finalRoomNumber) {
            Alert.alert('Validation Error', 'Please select or enter a Room Number.');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('departmentName', selectedDept?.name || '');
            formData.append('programmeName', selectedProg?.name || '');
            formData.append('blockName', selectedBlock?.name || '');
            formData.append('roomNumber', finalRoomNumber);
            formData.append('complaintType', complaintType);
            formData.append('remarks', remarks);

            if (imageUri) {
                const filename = imageUri.split('/').pop() || 'attachment.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('attachment', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                });
            }

            await complaintService.create(formData);
            Alert.alert('Success', 'Complaint raised successfully!', [
                { text: 'View Tickets', onPress: () => navigation.navigate('ComplaintsList') },
            ]);
        } catch (error) {
            console.error('Error creating complaint:', error);
            const msg = error.response?.data?.message || 'Failed to submit complaint.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (user?.role === 'SuperAdmin') {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <View style={[styles.card, { alignItems: 'center', padding: 24, width: '100%' }]}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>🚫</Text>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 8, textAlign: 'center' }}>
                        Access Restricted
                    </Text>
                    <Text style={{ fontSize: 14, color: '#f87171', textAlign: 'center', marginBottom: 20 }}>
                        Super Admin cannot raise complaints.
                    </Text>
                    <TouchableOpacity
                        style={[styles.submitBtn, { paddingHorizontal: 24 }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.submitBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
                <View style={styles.headerBox}>
                    <Text style={styles.headerIcon}>🎟️</Text>
                    <Text style={styles.headerTitle}>Raise New Complaint</Text>
                    <Text style={styles.headerSubtitle}>Fill details below to notify maintenance team</Text>
                </View>

                {/* 1. Department Selection */}
                <Text style={styles.label}>1. Select Department *</Text>
                {loadingMaster ? (
                    <ActivityIndicator color="#38bdf8" style={{ marginVertical: 10 }} />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                        {departments.map((dept) => (
                            <TouchableOpacity
                                key={dept._id}
                                style={[styles.chip, selectedDeptId === dept._id && styles.chipActive]}
                                onPress={() => setSelectedDeptId(dept._id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, selectedDeptId === dept._id && styles.chipTextActive]}>
                                    🏢 {dept.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* 2. Programme Selection */}
                {selectedDeptId ? (
                    <>
                        <Text style={styles.label}>2. Select Programme *</Text>
                        {loadingProg ? (
                            <ActivityIndicator color="#38bdf8" style={{ marginVertical: 10 }} />
                        ) : programmes.length === 0 ? (
                            <Text style={styles.emptyNote}>⚠️ No programmes available for this department</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {programmes.map((prog) => (
                                    <TouchableOpacity
                                        key={prog._id}
                                        style={[styles.chip, selectedProgId === prog._id && styles.chipActive]}
                                        onPress={() => setSelectedProgId(prog._id)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.chipText, selectedProgId === prog._id && styles.chipTextActive]}>
                                            🎓 {prog.name} ({prog.shortName})
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </>
                ) : null}

                {/* 3. Block Selection */}
                {selectedProgId ? (
                    <>
                        <Text style={styles.label}>3. Select Block Name *</Text>
                        {loadingBlocks ? (
                            <ActivityIndicator color="#38bdf8" style={{ marginVertical: 10 }} />
                        ) : blocks.length === 0 ? (
                            <Text style={styles.emptyNote}>⚠️ No blocks found for this programme</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {blocks.map((b) => (
                                    <TouchableOpacity
                                        key={b._id}
                                        style={[styles.chip, selectedBlockId === b._id && styles.chipActive]}
                                        onPress={() => setSelectedBlockId(b._id)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.chipText, selectedBlockId === b._id && styles.chipTextActive]}>
                                            🧱 {b.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </>
                ) : null}

                {/* 4. Room Selection */}
                {selectedBlockId ? (
                    <>
                        <Text style={styles.label}>4. Select Room Number *</Text>
                        {loadingRooms ? (
                            <ActivityIndicator color="#38bdf8" style={{ marginVertical: 10 }} />
                        ) : (
                            <View style={styles.chipGrid}>
                                {rooms.map((r) => (
                                    <TouchableOpacity
                                        key={r._id}
                                        style={[styles.chip, selectedRoomId === r._id && styles.chipActive]}
                                        onPress={() => setSelectedRoomId(r._id)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.chipText, selectedRoomId === r._id && styles.chipTextActive]}>
                                            🚪 Room {r.roomNumber}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[styles.chip, selectedRoomId === '__custom__' && styles.chipActive]}
                                    onPress={() => setSelectedRoomId('__custom__')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.chipText, selectedRoomId === '__custom__' && styles.chipTextActive]}>
                                        ✏️ Custom Room
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                ) : null}

                {(selectedRoomId === '__custom__' || (selectedBlockId && !loadingRooms && rooms.length === 0)) && (
                    <View style={{ marginTop: 8 }}>
                        <Text style={styles.subLabel}>Enter Room Number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Lab 204 or R-101"
                            placeholderTextColor="#64748b"
                            value={customRoomNumber}
                            onChangeText={setCustomRoomNumber}
                        />
                    </View>
                )}

                {/* 5. Issue Category */}
                <Text style={styles.label}>5. Issue Category *</Text>
                <View style={styles.chipGrid}>
                    {COMPLAINT_TYPES.map((t) => (
                        <TouchableOpacity
                            key={t.label}
                            style={[styles.chip, complaintType === t.label && styles.chipActive]}
                            onPress={() => setComplaintType(t.label)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.chipText, complaintType === t.label && styles.chipTextActive]}>
                                {t.icon} {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 6. Description & Details */}
                <Text style={styles.label}>6. Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the issue (e.g. Projector not connecting, AC leaking, etc.)..."
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={4}
                    value={remarks}
                    onChangeText={setRemarks}
                />

                {/* 7. Photo Attachment */}
                <Text style={styles.label}>7. Attach Photo (Optional)</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage} activeOpacity={0.8}>
                    <Text style={styles.imagePickerText}>
                        {imageUri ? '📸 Change Attachment Photo' : '📷 Select Image from Gallery'}
                    </Text>
                </TouchableOpacity>

                {imageUri && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)}>
                            <Text style={styles.removeText}>🗑️ Remove Photo</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.8}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>🚀 Submit Complaint</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090d16',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#141e33',
        borderRadius: 20,
        padding: 22,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    headerBox: {
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#24344d',
    },
    headerIcon: {
        fontSize: 36,
        marginBottom: 6,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#f8fafc',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#cbd5e1',
        marginBottom: 10,
        marginTop: 18,
    },
    subLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 6,
    },
    emptyNote: {
        fontSize: 13,
        color: '#f59e0b',
        fontStyle: 'italic',
        marginVertical: 6,
    },
    input: {
        backgroundColor: '#090d16',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#f8fafc',
        borderWidth: 1,
        borderColor: '#24344d',
    },
    textArea: {
        height: 110,
        textAlignVertical: 'top',
    },
    chipScroll: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: '#090d16',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#24344d',
        marginRight: 8,
        marginBottom: 8,
    },
    chipActive: {
        backgroundColor: '#0284c7',
        borderColor: '#38bdf8',
    },
    chipText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },
    imagePickerBtn: {
        backgroundColor: '#090d16',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#38bdf8',
        borderStyle: 'dashed',
    },
    imagePickerText: {
        color: '#38bdf8',
        fontWeight: '700',
        fontSize: 14,
    },
    previewContainer: {
        alignItems: 'center',
        marginTop: 14,
        backgroundColor: '#090d16',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginBottom: 10,
    },
    removeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    removeText: {
        color: '#f87171',
        fontSize: 13,
        fontWeight: '700',
    },
    submitBtn: {
        backgroundColor: '#0284c7',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 28,
        shadowColor: '#0284c7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: '#0369a1',
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '800',
    },
});
