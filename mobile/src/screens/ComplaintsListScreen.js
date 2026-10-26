import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
} from 'react-native';
import { complaintService, userService, BASE_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';

const SERVER_HOST = BASE_URL.replace('/api', '');

export default function ComplaintsListScreen({ navigation, route }) {
    const { user } = useContext(AuthContext);
    const initialFilter = route?.params?.filter || 'All';
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState(initialFilter);

    const isSuperAdmin = user?.role === 'SuperAdmin';

    useEffect(() => {
        if (navigation?.setOptions) {
            navigation.setOptions({
                title: isSuperAdmin ? 'All Complaints & Tickets' : 'My Raised Tickets',
            });
        }
    }, [isSuperAdmin, navigation]);

    useEffect(() => {
        if (route?.params?.filter) {
            setStatusFilter(route.params.filter);
        }
    }, [route?.params?.filter]);

    // Image Modal
    const [previewImage, setPreviewImage] = useState(null);

    // Assign Staff Modal
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedComplaintId, setSelectedComplaintId] = useState(null);
    const [staffUsers, setStaffUsers] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    const fetchComplaints = async () => {
        try {
            const params = {};
            if (statusFilter !== 'All') {
                params.status = statusFilter;
            }
            const response = await complaintService.getAll(params);
            let data = response.data || [];

            // If not SuperAdmin, strictly ensure user only sees their own complaints
            if (!isSuperAdmin) {
                const currentUserId = String(user?.id || user?._id || '');
                data = data.filter((c) => {
                    const creatorId = String(c.createdBy?._id || c.createdBy || '');
                    const assignedId = String(c.assignedTo?._id || c.assignedTo || '');
                    if (user?.role === 'User') {
                        return creatorId === currentUserId;
                    }
                    return creatorId === currentUserId || assignedId === currentUserId;
                });
            }

            setComplaints(data);
        } catch (error) {
            console.log('Error fetching complaints:', error?.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [statusFilter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchComplaints();
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await complaintService.updateStatus(id, newStatus);
            Alert.alert('Status Updated', `Complaint marked as ${newStatus}`);
            fetchComplaints();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update status.');
        }
    };

    const openAssignModal = async (complaintId) => {
        setSelectedComplaintId(complaintId);
        setAssignModalVisible(true);
        setLoadingStaff(true);
        try {
            const res = await userService.getAll();
            const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            const staffOnly = list.filter(u => u.role !== 'User' && u.role !== 'SuperAdmin');
            setStaffUsers(staffOnly.length > 0 ? staffOnly : list);
        } catch (err) {
            console.log('Error fetching staff users:', err);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleAssignStaff = async (staffId) => {
        try {
            await complaintService.assign(selectedComplaintId, staffId);
            Alert.alert('Success', 'Complaint assigned successfully!');
            setAssignModalVisible(false);
            fetchComplaints();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to assign complaint.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return '#f59e0b';
            case 'Assigned':
                return '#8b5cf6';
            case 'In-Progress':
            case 'In Progress':
                return '#3b82f6';
            case 'Closed':
            case 'Resolved':
                return '#10b981';
            default:
                return '#94a3b8';
        }
    };

    const renderTicketCard = ({ item }) => {
        const isSuperAdmin = user?.role === 'SuperAdmin';
        const isAssignedStaff = item.assignedTo?._id === user?.id || item.assignedTo === user?.id;
        const isCreator = item.createdBy?._id === user?.id || item.createdBy === user?.id;
        const isClosed = item.status === 'Closed' || item.status === 'Resolved';

        const imageUri = item.attachment
            ? (item.attachment.startsWith('http') ? item.attachment : `${SERVER_HOST}${item.attachment}`)
            : null;

        const statusColor = getStatusColor(item.status);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.ticketTypeBox}>
                        <Text style={styles.ticketTypeIcon}>🎟️</Text>
                        <Text style={styles.ticketTitle}>{item.complaintType || 'General Issue'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            ● {item.status || 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* Location Box */}
                <View style={styles.locationContainer}>
                    <Text style={styles.locationText}>
                        🏢 <Text style={styles.locHighlight}>Block:</Text> {item.blockName || 'N/A'}
                    </Text>
                    <Text style={styles.locationText}>
                        🚪 <Text style={styles.locHighlight}>Room:</Text> {item.roomNumber || 'N/A'}
                    </Text>
                </View>

                {item.remarks ? (
                    <Text style={styles.description}>📝 {item.remarks}</Text>
                ) : null}

                {/* Meta info tags */}
                <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                        <Text style={styles.metaChipText}>
                            👤 Raised by: <Text style={{ color: '#f8fafc', fontWeight: '700' }}>{item.createdBy?.username || item.createdBy?.email || 'User'}</Text>
                        </Text>
                    </View>

                    {item.assignedTo && (
                        <View style={[styles.metaChip, { borderColor: '#8b5cf6' }]}>
                            <Text style={[styles.metaChipText, { color: '#c084fc' }]}>
                                🛠️ Staff: {item.assignedTo?.username || item.assignedTo?.email || 'Assigned'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Image attachment thumbnail */}
                {imageUri && (
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setPreviewImage(imageUri)}>
                        <Image source={{ uri: imageUri }} style={styles.attachmentImg} resizeMode="cover" />
                        <View style={styles.imageOverlayBadge}>
                            <Text style={styles.imageOverlayText}>🔍 Tap to View</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Footer and Actions */}
                <View style={styles.footerRow}>
                    <Text style={styles.dateText}>
                        📅 {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </Text>

                    {!isClosed && (
                        <View style={styles.actionBtns}>
                            {isSuperAdmin && (
                                <TouchableOpacity
                                    style={[styles.smallBtn, { backgroundColor: '#8b5cf6' }]}
                                    onPress={() => openAssignModal(item._id)}
                                >
                                    <Text style={styles.smallBtnText}>⚡ Assign</Text>
                                </TouchableOpacity>
                            )}

                            {(isSuperAdmin || isAssignedStaff) && item.status !== 'In-Progress' && (
                                <TouchableOpacity
                                    style={[styles.smallBtn, { backgroundColor: '#3b82f6' }]}
                                    onPress={() => handleUpdateStatus(item._id, 'In-Progress')}
                                >
                                    <Text style={styles.smallBtnText}>⚙️ In-Progress</Text>
                                </TouchableOpacity>
                            )}

                            {(isSuperAdmin || isAssignedStaff || isCreator) && (
                                <TouchableOpacity
                                    style={[styles.smallBtn, { backgroundColor: '#10b981' }]}
                                    onPress={() => handleUpdateStatus(item._id, 'Closed')}
                                >
                                    <Text style={styles.smallBtnText}>✓ Resolve</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Filter Scrollable Chips */}
            <View style={styles.filterBarContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                    {['All', 'Pending', 'Assigned', 'In-Progress', 'Closed'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.filterTab, statusFilter === tab && styles.filterTabActive]}
                            onPress={() => setStatusFilter(tab)}
                        >
                            <Text style={[styles.filterTabText, statusFilter === tab && styles.filterTabTextActive]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
            ) : (() => {
                const filteredComplaints = statusFilter === 'All'
                    ? complaints
                    : complaints.filter((c) => {
                        if (statusFilter === 'In-Progress') return c.status === 'In-Progress' || c.status === 'In Progress';
                        if (statusFilter === 'Closed') return c.status === 'Closed' || c.status === 'Resolved';
                        return c.status?.toLowerCase() === statusFilter?.toLowerCase();
                    });

                return filteredComplaints.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>
                            {isSuperAdmin ? 'No Complaints Found' : 'No Tickets Raised Yet'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {isSuperAdmin
                                ? `There are currently no tickets matching the "${statusFilter}" filter.`
                                : `You haven't raised any tickets matching the "${statusFilter}" filter.`}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredComplaints}
                        keyExtractor={(item) => item._id || Math.random().toString()}
                        renderItem={renderTicketCard}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
                    />
                );
            })()}

            {/* Image Full Preview Modal */}
            <Modal visible={!!previewImage} transparent animationType="fade">
                <View style={styles.fullImageOverlay}>
                    <TouchableOpacity style={styles.closeImageBtn} onPress={() => setPreviewImage(null)}>
                        <Text style={styles.closeImageText}>✕ Close Preview</Text>
                    </TouchableOpacity>
                    {previewImage && (
                        <Image source={{ uri: previewImage }} style={styles.fullImage} resizeMode="contain" />
                    )}
                </View>
            </Modal>

            {/* Assign Staff Modal */}
            <Modal visible={assignModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Staff Member</Text>
                        <Text style={styles.modalSubtitle}>Assign technician to resolve this complaint</Text>

                        {loadingStaff ? (
                            <ActivityIndicator color="#38bdf8" style={{ marginVertical: 20 }} />
                        ) : (
                            <FlatList
                                data={staffUsers}
                                keyExtractor={(u) => u._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.staffItem}
                                        onPress={() => handleAssignStaff(item._id)}
                                        activeOpacity={0.8}
                                    >
                                        <View>
                                            <Text style={styles.staffName}>{item.username || item.name || item.email}</Text>
                                            <Text style={styles.staffEmail}>{item.email}</Text>
                                        </View>
                                        <View style={styles.staffRoleBadge}>
                                            <Text style={styles.staffRoleText}>{item.role}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setAssignModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090d16',
    },
    filterBarContainer: {
        backgroundColor: '#141e33',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#24344d',
    },
    filterBar: {
        paddingHorizontal: 12,
        flexDirection: 'row',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#090d16',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    filterTabActive: {
        backgroundColor: '#0284c7',
        borderColor: '#38bdf8',
    },
    filterTabText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    },
    filterTabTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: '#141e33',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#24344d',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ticketTypeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    ticketTypeIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    ticketTitle: {
        color: '#f8fafc',
        fontSize: 17,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    locationContainer: {
        flexDirection: 'row',
        gap: 14,
        backgroundColor: '#090d16',
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    locationText: {
        color: '#cbd5e1',
        fontSize: 13,
    },
    locHighlight: {
        color: '#38bdf8',
        fontWeight: '700',
    },
    description: {
        color: '#cbd5e1',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    metaChip: {
        backgroundColor: '#090d16',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    metaChipText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    attachmentImg: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 12,
    },
    imageOverlayBadge: {
        position: 'absolute',
        bottom: 20,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    imageOverlayText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '700',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#24344d',
    },
    dateText: {
        color: '#64748b',
        fontSize: 12,
    },
    actionBtns: {
        flexDirection: 'row',
        gap: 6,
    },
    smallBtn: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 10,
    },
    smallBtnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '700',
    },
    emptySubtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    fullImageOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeImageBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#141e33',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#38bdf8',
        zIndex: 10,
    },
    closeImageText: {
        color: '#38bdf8',
        fontWeight: '700',
    },
    fullImage: {
        width: '95%',
        height: '80%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '75%',
        backgroundColor: '#141e33',
        borderRadius: 20,
        padding: 22,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#38bdf8',
        textAlign: 'center',
    },
    modalSubtitle: {
        color: '#94a3b8',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    staffItem: {
        backgroundColor: '#090d16',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#24344d',
    },
    staffName: {
        color: '#f8fafc',
        fontWeight: '700',
        fontSize: 15,
    },
    staffEmail: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    },
    staffRoleBadge: {
        backgroundColor: '#8b5cf620',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
    staffRoleText: {
        color: '#c084fc',
        fontSize: 12,
        fontWeight: '700',
    },
    modalCloseBtn: {
        backgroundColor: '#24344d',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 14,
    },
    modalCloseText: {
        color: '#ffffff',
        fontWeight: '700',
    },
});
