import React, { useContext, useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { complaintService } from '../config/api';

export default function DashboardScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, complaintsRes] = await Promise.all([
                complaintService.getStats().catch(() => ({ data: {} })),
                complaintService.getAll({ limit: 3 }).catch(() => ({ data: [] })),
            ]);

            if (statsRes.data) {
                setStats({
                    total: statsRes.data.total || 0,
                    pending: statsRes.data.pending || 0,
                    inProgress: statsRes.data.assigned ?? statsRes.data.inProgress ?? 0,
                    resolved: statsRes.data.closed ?? statsRes.data.resolved ?? 0,
                });
            }

            const list = Array.isArray(complaintsRes.data) ? complaintsRes.data : [];
            setRecentTickets(list.slice(0, 3));
        } catch (error) {
            console.log('Error fetching dashboard data:', error?.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const isSuperAdmin = user?.role === 'SuperAdmin';

    // Role-specific avatar initials, logos, colors, and badges
    const getRoleMeta = (role, username) => {
        const r = (role || '').toLowerCase().trim();
        if (r.includes('super') || r.includes('admin')) {
            return {
                code: 'SA',
                icon: '👑',
                name: 'SuperAdmin',
                bgColor: '#7c3aed',
                borderColor: '#a855f7',
                textColor: '#c084fc',
                badgeBg: 'rgba(124, 58, 237, 0.25)',
            };
        }
        if (r.includes('plumb')) {
            return {
                code: 'PL',
                icon: '🔧',
                name: 'Plumber',
                bgColor: '#0284c7',
                borderColor: '#38bdf8',
                textColor: '#38bdf8',
                badgeBg: 'rgba(2, 132, 199, 0.25)',
            };
        }
        if (r.includes('elect')) {
            return {
                code: 'EL',
                icon: '⚡',
                name: 'Electrician',
                bgColor: '#d97706',
                borderColor: '#f59e0b',
                textColor: '#fbbf24',
                badgeBg: 'rgba(217, 119, 6, 0.25)',
            };
        }
        if (r.includes('network')) {
            return {
                code: 'NS',
                icon: '🌐',
                name: 'Network Staff',
                bgColor: '#4f46e5',
                borderColor: '#818cf8',
                textColor: '#a5b4fc',
                badgeBg: 'rgba(79, 70, 229, 0.25)',
            };
        }
        if (r.includes('hardware')) {
            return {
                code: 'HW',
                icon: '💻',
                name: 'PC Hardware',
                bgColor: '#0d9488',
                borderColor: '#2dd4bf',
                textColor: '#5eead4',
                badgeBg: 'rgba(13, 148, 136, 0.25)',
            };
        }
        if (r.includes('software') || r.includes('dev')) {
            return {
                code: 'SD',
                icon: '👨‍💻',
                name: 'Software Dev',
                bgColor: '#9333ea',
                borderColor: '#c084fc',
                textColor: '#d8b4fe',
                badgeBg: 'rgba(147, 51, 234, 0.25)',
            };
        }
        if (r === 'user' || r.includes('student') || r.includes('faculty')) {
            return {
                code: 'US',
                icon: '👤',
                name: 'User',
                bgColor: '#0ea5e9',
                borderColor: '#38bdf8',
                textColor: '#38bdf8',
                badgeBg: 'rgba(14, 165, 233, 0.25)',
            };
        }
        const words = (role || 'User').split(' ');
        const code = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : (role || 'US').substring(0, 2).toUpperCase();
        return {
            code,
            icon: '🛡️',
            name: role || 'Member',
            bgColor: '#334155',
            borderColor: '#64748b',
            textColor: '#94a3b8',
            badgeBg: 'rgba(51, 65, 85, 0.3)',
        };
    };

    const roleMeta = getRoleMeta(user?.role, user?.username);

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

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        >
            {/* Header Profile Banner with Clickable Profile Icon */}
            <TouchableOpacity
                style={styles.profileBanner}
                onPress={() => setProfileModalVisible(true)}
                activeOpacity={0.8}
            >
                <View style={styles.profileLeft}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarCircle, { backgroundColor: roleMeta.bgColor, borderColor: roleMeta.borderColor }]}>
                            <Text style={styles.avatarText}>{roleMeta.code}</Text>
                        </View>
                        <View style={[styles.avatarEmblemBadge, { borderColor: roleMeta.borderColor }]}>
                            <Text style={styles.avatarEmblemIcon}>{roleMeta.icon}</Text>
                        </View>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.welcomeSub}>Welcome back 👋</Text>
                        <Text style={styles.userName}>{user?.username || user?.name || user?.email || 'User'}</Text>
                    </View>
                </View>
                <View style={styles.profileRightArea}>
                    <View style={[styles.roleTag, { backgroundColor: roleMeta.badgeBg, borderColor: roleMeta.borderColor }]}>
                        <Text style={styles.roleTagIcon}>{roleMeta.icon}</Text>
                        <Text style={[styles.roleTagText, { color: roleMeta.textColor }]}>{user?.role || roleMeta.name}</Text>
                    </View>
                    <View style={styles.viewProfilePill}>
                        <Text style={styles.viewProfilePillText}>👤 Profile ❯</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Overview Section Header */}
            <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Dashboard Overview</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Text style={styles.refreshLink}>🔄 Refresh</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#38bdf8" style={{ marginVertical: 30 }} />
            ) : (
                <View style={styles.statsGrid}>
                    <TouchableOpacity
                        style={[styles.statCard, { borderTopColor: '#38bdf8' }]}
                        onPress={() => navigation.navigate('ComplaintsList', { filter: 'All' })}
                    >
                        <Text style={styles.statIcon}>📊</Text>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>{isSuperAdmin ? 'Total System' : 'My Raised'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, { borderTopColor: '#f59e0b' }]}
                        onPress={() => navigation.navigate('ComplaintsList', { filter: 'Pending' })}
                    >
                        <Text style={styles.statIcon}>⏳</Text>
                        <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.pending}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, { borderTopColor: '#3b82f6' }]}
                        onPress={() => navigation.navigate('ComplaintsList', { filter: 'In-Progress' })}
                    >
                        <Text style={styles.statIcon}>⚙️</Text>
                        <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{stats.inProgress}</Text>
                        <Text style={styles.statLabel}>In Progress</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, { borderTopColor: '#10b981' }]}
                        onPress={() => navigation.navigate('ComplaintsList', { filter: 'Closed' })}
                    >
                        <Text style={styles.statIcon}>✅</Text>
                        <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.resolved}</Text>
                        <Text style={styles.statLabel}>Resolved</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>

            <View style={styles.actionGrid}>
                {!isSuperAdmin && (
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('CreateTicket')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIconBox, { backgroundColor: '#0284c720', borderColor: '#0284c7' }]}>
                            <Text style={styles.actionIcon}>➕</Text>
                        </View>
                        <View style={styles.actionBody}>
                            <Text style={styles.actionTitle}>Raise New Ticket</Text>
                            <Text style={styles.actionDesc}>Submit a new maintenance or IT issue</Text>
                        </View>
                        <Text style={styles.arrowIcon}>❯</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('ComplaintsList')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.actionIconBox, { backgroundColor: '#8b5cf620', borderColor: '#8b5cf6' }]}>
                        <Text style={styles.actionIcon}>📋</Text>
                    </View>
                    <View style={styles.actionBody}>
                        <Text style={styles.actionTitle}>{isSuperAdmin ? 'View All Tickets' : 'My Raised Tickets'}</Text>
                        <Text style={styles.actionDesc}>
                            {isSuperAdmin
                                ? 'Track all system tickets, status & assign staff'
                                : 'Track the status and progress of your tickets'}
                        </Text>
                    </View>
                    <Text style={styles.arrowIcon}>❯</Text>
                </TouchableOpacity>

                {isSuperAdmin && (
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('AdminMaster')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIconBox, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' }]}>
                            <Text style={styles.actionIcon}>⚙️</Text>
                        </View>
                        <View style={styles.actionBody}>
                            <Text style={styles.actionTitle}>Admin Master</Text>
                            <Text style={styles.actionDesc}>Roles, Users, Departments, Programmes, Blocks & Rooms</Text>
                        </View>
                        <Text style={styles.arrowIcon}>❯</Text>
                    </TouchableOpacity>
                )}

                {isSuperAdmin && (
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Reports')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIconBox, { backgroundColor: '#10b98120', borderColor: '#10b981' }]}>
                            <Text style={styles.actionIcon}>📈</Text>
                        </View>
                        <View style={styles.actionBody}>
                            <Text style={styles.actionTitle}>Analytics & Reports</Text>
                            <Text style={styles.actionDesc}>Resolution rates & department metrics</Text>
                        </View>
                        <Text style={styles.arrowIcon}>❯</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Recent Activity */}
            {recentTickets.length > 0 && (
                <>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Recent Tickets</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ComplaintsList')}>
                            <Text style={styles.seeAllLink}>See All ➔</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.recentList}>
                        {recentTickets.map((ticket) => (
                            <TouchableOpacity
                                key={ticket._id}
                                style={styles.recentItem}
                                onPress={() => navigation.navigate('ComplaintsList')}
                            >
                                <View style={styles.recentHeader}>
                                    <Text style={styles.recentTitle}>{ticket.complaintType || 'Issue'}</Text>
                                    <View
                                        style={[
                                            styles.miniStatusBadge,
                                            { backgroundColor: getStatusColor(ticket.status) + '20' },
                                        ]}
                                    >
                                        <Text style={[styles.miniStatusText, { color: getStatusColor(ticket.status) }]}>
                                            {ticket.status || 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.recentDesc} numberOfLines={1}>
                                    📍 Block: {ticket.blockName || 'N/A'} • Room: {ticket.roomNumber || 'N/A'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
                <Text style={styles.logoutText}>🚪 Sign Out</Text>
            </TouchableOpacity>

            {/* Profile Details Modal */}
            <Modal
                visible={profileModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderTitleBox}>
                                <Text style={styles.modalHeaderIcon}>👤</Text>
                                <Text style={styles.modalHeaderTitle}>Account Profile</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseBtn}
                                onPress={() => setProfileModalVisible(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.modalCloseBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Avatar & Badges */}
                        <View style={styles.modalProfileHero}>
                            <View style={styles.modalAvatarWrapper}>
                                <View style={[styles.modalAvatarCircle, { backgroundColor: roleMeta.bgColor, borderColor: roleMeta.borderColor }]}>
                                    <Text style={styles.modalAvatarText}>{roleMeta.code}</Text>
                                </View>
                                <View style={[styles.modalEmblemBadge, { borderColor: roleMeta.borderColor }]}>
                                    <Text style={styles.modalEmblemIcon}>{roleMeta.icon}</Text>
                                </View>
                            </View>
                            <Text style={styles.modalUsername}>{user?.username || 'User'}</Text>
                            <View style={[
                                styles.modalRoleTag,
                                {
                                    backgroundColor: roleMeta.badgeBg,
                                    borderColor: roleMeta.borderColor,
                                }
                            ]}>
                                <Text style={[
                                    styles.modalRoleTagText,
                                    { color: roleMeta.textColor }
                                ]}>
                                    {roleMeta.icon} {user?.role || roleMeta.name}
                                </Text>
                            </View>
                        </View>

                        {/* Details Table */}
                        <View style={styles.modalDetailTable}>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>📧 Email</Text>
                                <Text style={styles.modalDetailValue} numberOfLines={1}>{user?.email || 'N/A'}</Text>
                            </View>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>📱 Phone</Text>
                                <Text style={styles.modalDetailValue}>{user?.phone || 'N/A'}</Text>
                            </View>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>🏢 Department</Text>
                                <Text style={styles.modalDetailValue}>
                                    {typeof user?.department === 'object' ? (user?.department?.name || 'Admin Dept') : (user?.department || 'General')}
                                </Text>
                            </View>
                            <View style={[styles.modalDetailRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.modalDetailLabel}>🟢 Status</Text>
                                <Text style={[styles.modalDetailValue, { color: '#10b981', fontWeight: '700' }]}>● Active</Text>
                            </View>
                        </View>

                        {/* Action Buttons: Exit & Close */}
                        <View style={styles.modalFooterActions}>
                            <TouchableOpacity
                                style={styles.modalExitButton}
                                onPress={() => {
                                    setProfileModalVisible(false);
                                    logout();
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalExitButtonText}>🚪 Exit / Sign Out</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalDismissButton}
                                onPress={() => setProfileModalVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalDismissButtonText}>✕ Close Window</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090d16',
    },
    contentContainer: {
        padding: 18,
        paddingBottom: 40,
    },
    profileBanner: {
        backgroundColor: '#141e33',
        padding: 18,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: 14,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    avatarEmblemBadge: {
        position: 'absolute',
        bottom: -4,
        right: -6,
        backgroundColor: '#090d16',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    avatarEmblemIcon: {
        fontSize: 11,
    },
    avatarText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 17,
    },
    userInfo: {
        justifyContent: 'center',
    },
    welcomeSub: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },
    userName: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 2,
    },
    roleTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#0284c7',
    },
    roleTagIcon: {
        fontSize: 13,
        marginRight: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
        marginRight: 6,
    },
    roleTagText: {
        color: '#38bdf8',
        fontSize: 12,
        fontWeight: '700',
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        marginTop: 4,
    },
    sectionTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '700',
    },
    refreshLink: {
        color: '#38bdf8',
        fontSize: 13,
        fontWeight: '600',
    },
    seeAllLink: {
        color: '#38bdf8',
        fontSize: 13,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#141e33',
        width: '48%',
        padding: 16,
        borderRadius: 16,
        marginBottom: 14,
        borderTopWidth: 4,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 8,
    },
    statNumber: {
        color: '#f8fafc',
        fontSize: 26,
        fontWeight: '800',
    },
    statLabel: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
    },
    actionGrid: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 24,
    },
    actionCard: {
        backgroundColor: '#141e33',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#24344d',
    },
    actionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 1,
    },
    actionIcon: {
        fontSize: 20,
    },
    actionBody: {
        flex: 1,
    },
    actionTitle: {
        color: '#f8fafc',
        fontSize: 15,
        fontWeight: '700',
    },
    actionDesc: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    },
    arrowIcon: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    recentList: {
        gap: 10,
        marginBottom: 24,
    },
    recentItem: {
        backgroundColor: '#141e33',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    recentTitle: {
        color: '#f8fafc',
        fontSize: 15,
        fontWeight: '700',
    },
    recentDesc: {
        color: '#94a3b8',
        fontSize: 13,
    },
    miniStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    miniStatusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    logoutBtn: {
        backgroundColor: '#7f1d1d20',
        borderColor: '#ef4444',
        borderWidth: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    logoutText: {
        color: '#f87171',
        fontSize: 15,
        fontWeight: '700',
    },
    profileRightArea: {
        alignItems: 'flex-end',
        gap: 6,
    },
    viewProfilePill: {
        backgroundColor: '#0284c720',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0284c740',
    },
    viewProfilePillText: {
        color: '#38bdf8',
        fontSize: 11,
        fontWeight: '700',
    },
    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#141e33',
        borderRadius: 24,
        padding: 22,
        borderWidth: 1,
        borderColor: '#24344d',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#24344d',
        paddingBottom: 14,
        marginBottom: 16,
    },
    modalHeaderTitleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalHeaderIcon: {
        fontSize: 18,
    },
    modalHeaderTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '800',
    },
    modalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#090d16',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#24344d',
    },
    modalCloseBtnText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '700',
    },
    modalProfileHero: {
        alignItems: 'center',
        marginBottom: 18,
    },
    modalAvatarWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    modalAvatarCircle: {
        width: 68,
        height: 68,
        borderRadius: 24,
        backgroundColor: '#0284c7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#38bdf8',
        shadowColor: '#0284c7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    modalEmblemBadge: {
        position: 'absolute',
        bottom: -2,
        right: -6,
        backgroundColor: '#090d16',
        borderRadius: 14,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    modalEmblemIcon: {
        fontSize: 16,
    },
    modalAvatarText: {
        color: '#ffffff',
        fontSize: 26,
        fontWeight: '800',
    },
    modalUsername: {
        color: '#f8fafc',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 6,
    },
    modalRoleTag: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
    },
    modalRoleTagText: {
        fontSize: 12,
        fontWeight: '700',
    },
    modalDetailTable: {
        backgroundColor: '#090d16',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#24344d',
        marginBottom: 20,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    modalDetailLabel: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    },
    modalDetailValue: {
        color: '#f8fafc',
        fontSize: 13,
        fontWeight: '700',
        maxWidth: 200,
        textAlign: 'right',
    },
    modalFooterActions: {
        gap: 10,
    },
    modalExitButton: {
        backgroundColor: '#dc2626',
        paddingVertical: 13,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalExitButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    modalDismissButton: {
        backgroundColor: '#090d16',
        borderColor: '#334155',
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
    },
    modalDismissButtonText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
});
