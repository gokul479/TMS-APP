import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    Animated,
    Dimensions,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    departmentService,
    programmeService,
    blockService,
    roomService,
    userService,
    roleService,
} from '../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

const AVAILABLE_ROLES = [
    'Plumber',
    'Electrician',
    'Networking Staff',
    'Software Developer',
    'PC Hardware',
    'User',
    'SuperAdmin',
];

const MENU_TABS = [
    { key: 'Roles', label: 'Roles', icon: '🛡️', singular: 'Role' },
    { key: 'Users', label: 'Users', icon: '👥', singular: 'User' },
    { key: 'Departments', label: 'Departments', icon: '🏢', singular: 'Department' },
    { key: 'Programmes', label: 'Programmes', icon: '📚', singular: 'Programme' },
    { key: 'Blocks', label: 'Blocks', icon: '🧱', singular: 'Block' },
    { key: 'Rooms', label: 'Rooms', icon: '🚪', singular: 'Room' },
];

export default function AdminMasterScreen({ route, navigation }) {
    const initialTab = route?.params?.tab || 'Roles';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

    // Master Data States
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form Modal State (Add / Edit)
    const [formModalVisible, setFormModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form Fields - Roles
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [rolePermissions, setRolePermissions] = useState('');

    // Form Fields - Others
    const [deptName, setDeptName] = useState('');
    const [deptShortName, setDeptShortName] = useState('');

    const [progName, setProgName] = useState('');
    const [progShortName, setProgShortName] = useState('');
    const [progDeptId, setProgDeptId] = useState('');

    const [blockName, setBlockName] = useState('');
    const [blockDeptId, setBlockDeptId] = useState('');
    const [blockProgId, setBlockProgId] = useState('');

    const [roomNumber, setRoomNumber] = useState('');
    const [roomDeptId, setRoomDeptId] = useState('');
    const [roomBlockId, setRoomBlockId] = useState('');
    const [roomFloor, setRoomFloor] = useState('1');
    const [roomCapacity, setRoomCapacity] = useState('60');

    const [userUsername, setUserUsername] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userRole, setUserRole] = useState('Plumber');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    useEffect(() => {
        if (route?.params?.tab) {
            setActiveTab(route.params.tab);
        }
        if (route?.params?.openAdd) {
            setTimeout(() => {
                handleOpenAdd();
            }, 350);
        }
    }, [route?.params]);

    const openSidebar = () => {
        setSidebarOpen(true);
        Animated.timing(drawerAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const closeSidebar = () => {
        Animated.timing(drawerAnim, {
            toValue: -DRAWER_WIDTH,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setSidebarOpen(false));
    };

    const loadData = async () => {
        try {
            setLoadingData(true);
            const [deptRes, progRes, blockRes, roomRes, userRes, roleRes] = await Promise.all([
                departmentService.getAll().catch(() => ({ data: [] })),
                programmeService.getAll().catch(() => ({ data: [] })),
                blockService.getAll().catch(() => ({ data: [] })),
                roomService.getAll().catch(() => ({ data: [] })),
                userService.getAll().catch(() => ({ data: [] })),
                roleService.getAll().catch(() => ({ data: [] })),
            ]);

            setDepartments(Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data?.data || []));
            setProgrammes(Array.isArray(progRes.data) ? progRes.data : (progRes.data?.data || []));
            setBlocks(Array.isArray(blockRes.data) ? blockRes.data : (blockRes.data?.data || []));
            setRooms(Array.isArray(roomRes.data) ? roomRes.data : (roomRes.data?.data || []));
            setUsers(Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []));
            setRoles(Array.isArray(roleRes.data) ? roleRes.data : (roleRes.data?.data || []));
        } catch (err) {
            console.log('Error loading data:', err);
        } finally {
            setLoadingData(false);
        }
    };

    // Open Add Form Modal
    const handleOpenAdd = () => {
        setEditingItem(null);
        // Clear all inputs
        setRoleName('');
        setRoleDescription('');
        setRolePermissions('');

        setDeptName('');
        setDeptShortName('');

        setProgName('');
        setProgShortName('');
        setProgDeptId(departments[0]?._id || '');

        setBlockName('');
        setBlockDeptId(departments[0]?._id || '');
        setBlockProgId(programmes[0]?._id || '');

        setRoomNumber('');
        setRoomDeptId(departments[0]?._id || '');
        setRoomBlockId(blocks[0]?._id || '');
        setRoomFloor('1');
        setRoomCapacity('60');

        setUserUsername('');
        setUserEmail('');
        setUserPhone('');
        setUserPassword('');
        setUserRole('Plumber');

        setFormModalVisible(true);
    };

    // Open Edit Form Modal
    const handleOpenEdit = (item) => {
        setEditingItem(item);

        if (activeTab === 'Roles') {
            setRoleName(item.name || '');
            setRoleDescription(item.description || '');
            setRolePermissions(item.permissions?.join(', ') || '');
        } else if (activeTab === 'Departments') {
            setDeptName(item.name || '');
            setDeptShortName(item.shortName || '');
        } else if (activeTab === 'Programmes') {
            setProgName(item.name || '');
            setProgShortName(item.shortName || '');
            setProgDeptId(item.department?._id || item.department || departments[0]?._id || '');
        } else if (activeTab === 'Blocks') {
            setBlockName(item.name || '');
            setBlockDeptId(item.department?._id || item.department || departments[0]?._id || '');
            setBlockProgId(item.programme?._id || item.programme || programmes[0]?._id || '');
        } else if (activeTab === 'Rooms') {
            setRoomNumber(item.roomNumber || '');
            setRoomDeptId(item.department?._id || item.department || departments[0]?._id || '');
            setRoomBlockId(item.block?._id || item.block || blocks[0]?._id || '');
            setRoomFloor(String(item.floor ?? '1'));
            setRoomCapacity(String(item.capacity ?? '60'));
        } else if (activeTab === 'Users') {
            setUserUsername(item.username || '');
            setUserEmail(item.email || '');
            setUserPhone(item.phone || '');
            setUserPassword(''); // optional on edit
            setUserRole(item.role || 'User');
        }

        setFormModalVisible(true);
    };

    // Submit Save / Update
    const handleSave = async () => {
        try {
            setSubmitting(true);

            if (activeTab === 'Roles') {
                if (!roleName.trim()) {
                    Alert.alert('Required', 'Please enter a Role Name.');
                    return;
                }
                const permissions = rolePermissions
                    .split(',')
                    .map((p) => p.trim())
                    .filter((p) => p);
                const payload = {
                    name: roleName.trim(),
                    description: roleDescription.trim(),
                    permissions,
                };
                if (editingItem) {
                    await roleService.update(editingItem._id, payload);
                    Alert.alert('Updated', 'Role updated successfully!');
                } else {
                    await roleService.create(payload);
                    Alert.alert('Created', `Role "${roleName.trim()}" created successfully!`);
                }
            } else if (activeTab === 'Departments') {
                if (!deptName.trim() || !deptShortName.trim()) {
                    Alert.alert('Required', 'Please enter Department Name and Short Code.');
                    return;
                }
                const payload = { name: deptName.trim(), shortName: deptShortName.trim().toUpperCase() };
                if (editingItem) {
                    await departmentService.update(editingItem._id, payload);
                    Alert.alert('Updated', 'Department updated successfully!');
                } else {
                    await departmentService.create(payload);
                    Alert.alert('Created', 'Department created successfully!');
                }
            } else if (activeTab === 'Programmes') {
                if (!progName.trim() || !progShortName.trim() || !progDeptId) {
                    Alert.alert('Required', 'Please select Department and enter Name & Short Code.');
                    return;
                }
                const payload = {
                    name: progName.trim(),
                    shortName: progShortName.trim().toUpperCase(),
                    department: progDeptId,
                };
                if (editingItem) {
                    await programmeService.update(editingItem._id, payload);
                    Alert.alert('Updated', 'Programme updated successfully!');
                } else {
                    await programmeService.create(payload);
                    Alert.alert('Created', 'Programme created successfully!');
                }
            } else if (activeTab === 'Blocks') {
                if (!blockName.trim() || !blockDeptId) {
                    Alert.alert('Required', 'Please enter Block Name and select Department.');
                    return;
                }
                const payload = {
                    name: blockName.trim(),
                    department: blockDeptId,
                    programme: blockProgId || programmes[0]?._id,
                };
                if (editingItem) {
                    await blockService.update(editingItem._id, payload);
                    Alert.alert('Updated', 'Block updated successfully!');
                } else {
                    await blockService.create(payload);
                    Alert.alert('Created', 'Block created successfully!');
                }
            } else if (activeTab === 'Rooms') {
                if (!roomNumber.trim() || !roomBlockId || !roomDeptId) {
                    Alert.alert('Required', 'Please enter Room Number, select Department and Block.');
                    return;
                }
                const payload = {
                    roomNumber: roomNumber.trim(),
                    department: roomDeptId,
                    block: roomBlockId,
                    programme: blockProgId || programmes[0]?._id,
                    floor: parseInt(roomFloor) || 1,
                    capacity: parseInt(roomCapacity) || 60,
                };
                if (editingItem) {
                    await roomService.update(editingItem._id, payload);
                    Alert.alert('Updated', 'Room updated successfully!');
                } else {
                    await roomService.create(payload);
                    Alert.alert('Created', 'Room created successfully!');
                }
            } else if (activeTab === 'Users') {
                if (!userUsername.trim() || !userEmail.trim() || !userPhone.trim()) {
                    Alert.alert('Required', 'Please fill username, email, and phone.');
                    return;
                }
                if (!editingItem && !userPassword.trim()) {
                    Alert.alert('Required', 'Password is required for new users.');
                    return;
                }
                const payload = {
                    username: userUsername.trim(),
                    email: userEmail.trim().toLowerCase(),
                    phone: userPhone.trim(),
                    role: userRole,
                };
                if (userPassword.trim()) {
                    payload.password = userPassword.trim();
                }
                if (editingItem) {
                    await userService.update(editingItem._id, payload);
                    Alert.alert('Updated', 'User updated successfully!');
                } else {
                    await userService.create(payload);
                    Alert.alert('Created', `User with role "${userRole}" created!`);
                }
            }

            setFormModalVisible(false);
            loadData();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Operation failed.');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Entity
    const handleDelete = async (id, name) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete "${name || activeTab}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (activeTab === 'Roles') await roleService.delete(id);
                            if (activeTab === 'Departments') await departmentService.delete(id);
                            if (activeTab === 'Programmes') await programmeService.delete(id);
                            if (activeTab === 'Blocks') await blockService.delete(id);
                            if (activeTab === 'Rooms') await roomService.delete(id);
                            if (activeTab === 'Users') await userService.delete(id);
                            Alert.alert('Deleted', `${activeTab} item deleted.`);
                            loadData();
                        } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete.');
                        }
                    },
                },
            ]
        );
    };

    const getItemsForActiveTab = () => {
        if (activeTab === 'Roles') return roles;
        if (activeTab === 'Departments') return departments;
        if (activeTab === 'Programmes') return programmes;
        if (activeTab === 'Blocks') return blocks;
        if (activeTab === 'Rooms') return rooms;
        if (activeTab === 'Users') return users;
        return [];
    };

    const activeItems = getItemsForActiveTab();
    const currentTabMeta = MENU_TABS.find((t) => t.key === activeTab) || MENU_TABS[0];

    return (
        <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
            {/* Top Navigation Bar with Hamburger Icon */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.hamburgerBtn} onPress={openSidebar} activeOpacity={0.7}>
                    <Text style={styles.hamburgerIcon}>☰</Text>
                </TouchableOpacity>

                <View style={styles.topBarTitleBox}>
                    <Text style={styles.topBarTitle}>Manage {activeTab}</Text>
                </View>

                <TouchableOpacity style={styles.topBarReloadBtn} onPress={loadData} activeOpacity={0.7}>
                    <Text style={styles.topBarReloadIcon}>🔄</Text>
                </TouchableOpacity>
            </View>

            {/* Section Header with Title & "+ Add" Pill Button (Figure 15 Style) */}
            <View style={styles.subHeader}>
                <View style={styles.subHeaderLeft}>
                    <Text style={styles.sectionHeading}>{activeTab}</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{activeItems.length}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.addPillBtn} onPress={handleOpenAdd} activeOpacity={0.8}>
                    <Text style={styles.addPillBtnText}>
                        {activeTab === 'Roles' ? '➕ Create Role' : `+ Add ${currentTabMeta.singular}`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List of Cards (Figure 15 Style) */}
            {loadingData ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>Loading {activeTab}...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {activeItems.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyIcon}>{currentTabMeta.icon}</Text>
                            <Text style={styles.emptyTitle}>No {activeTab} Found</Text>
                            <Text style={styles.emptySubtitle}>Tap "+ Add" above to create your first {currentTabMeta.singular}.</Text>
                        </View>
                    ) : (
                        activeItems.map((item) => {
                            // Extract details per entity
                            let subTag = `${currentTabMeta.singular.toUpperCase()} RECORD`;
                            let mainTitle = item.name || item.username || item.roomNumber;
                            let chips = [];

                            if (activeTab === 'Roles') {
                                subTag = 'ACCESS ROLE RECORD';
                                mainTitle = item.name;
                                chips = [
                                    { icon: '📝', text: item.description || 'System Role' },
                                    { icon: '🔑', text: item.permissions?.length ? `${item.permissions.length} Permissions: ${item.permissions.join(', ')}` : 'Standard Permissions', isHighlight: true },
                                ];
                            } else if (activeTab === 'Users') {
                                subTag = 'USER ACCOUNT';
                                mainTitle = item.username || item.name;
                                chips = [
                                    { icon: '✉️', text: item.email },
                                    { icon: '📞', text: item.phone },
                                    { icon: '🛡️', text: item.role, isHighlight: true },
                                ];
                            } else if (activeTab === 'Departments') {
                                subTag = 'DEPARTMENT RECORD';
                                chips = [
                                    { icon: '🏷️', text: `Code: ${item.shortName}` },
                                    { icon: '📝', text: item.description || 'Academic Department' },
                                ];
                            } else if (activeTab === 'Programmes') {
                                subTag = 'PROGRAMME SPEC';
                                chips = [
                                    { icon: '🏷️', text: `Code: ${item.shortName}` },
                                    { icon: '🏢', text: item.department?.name || 'Department' },
                                ];
                            } else if (activeTab === 'Blocks') {
                                subTag = 'INFRASTRUCTURE BLOCK';
                                chips = [
                                    { icon: '🏢', text: `Dept: ${item.department?.name || 'General'}` },
                                    { icon: '📚', text: `Prog: ${item.programme?.name || 'All Degrees'}` },
                                ];
                            } else if (activeTab === 'Rooms') {
                                subTag = 'FACILITY ROOM';
                                mainTitle = `Room ${item.roomNumber}`;
                                chips = [
                                    { icon: '🧱', text: `Block: ${item.block?.name || 'Main'}` },
                                    { icon: '🏢', text: `Dept: ${item.department?.name || 'General'}` },
                                    { icon: '👥', text: `Capacity: ${item.capacity || 60}` },
                                ];
                            }

                            return (
                                <View key={item._id} style={styles.cardContainer}>
                                    {/* Card Top: Icon, Tag & Title */}
                                    <View style={styles.cardTopRow}>
                                        <View style={styles.cardIconBox}>
                                            <Text style={styles.cardCategoryIcon}>{currentTabMeta.icon}</Text>
                                        </View>
                                        <View style={styles.cardMetaBox}>
                                            <Text style={styles.cardSubTag}>{subTag}</Text>
                                            <Text style={styles.cardMainTitle} numberOfLines={1}>
                                                {mainTitle}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Card Middle: Info Chips */}
                                    <View style={styles.chipsRow}>
                                        {chips.filter(c => c.text).map((chip, idx) => (
                                            <View
                                                key={idx}
                                                style={[
                                                    styles.infoChip,
                                                    chip.isHighlight && styles.infoChipHighlight,
                                                ]}
                                            >
                                                <Text style={styles.chipIcon}>{chip.icon}</Text>
                                                <Text
                                                    style={[
                                                        styles.chipValue,
                                                        chip.isHighlight && styles.chipValueHighlight,
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {chip.text}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Card Bottom: Action Buttons (Edit & Delete - Figure 15 Style) */}
                                    <View style={styles.cardActionRow}>
                                        <TouchableOpacity
                                            style={styles.editBtn}
                                            onPress={() => handleOpenEdit(item)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.editBtnText}>✎ Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => handleDelete(item._id, mainTitle)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}

            {/* ============================================================
                SIDEBAR DRAWER (Animated Slide-in Menu)
            ============================================================ */}
            {sidebarOpen && (
                <Pressable style={styles.drawerBackdrop} onPress={closeSidebar}>
                    <Animated.View
                        style={[
                            styles.drawerContainer,
                            { transform: [{ translateX: drawerAnim }] },
                        ]}
                    >
                        <Pressable onPress={() => {}} style={{ flex: 1 }}>
                            {/* Drawer Header */}
                            <View style={styles.drawerHeader}>
                                <View style={styles.drawerHeaderLogo}>
                                    <Text style={styles.drawerLogoIcon}>⚙️</Text>
                                    <View>
                                        <Text style={styles.drawerLogoTitle}>Master Console</Text>
                                        <Text style={styles.drawerLogoSubtitle}>Category Selector</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.drawerCloseBtn} onPress={closeSidebar}>
                                    <Text style={styles.drawerCloseText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Drawer Menu Items */}
                            <ScrollView style={styles.drawerMenuScroll}>
                                {MENU_TABS.map((tab) => {
                                    const isActive = activeTab === tab.key;
                                    let count = 0;
                                    if (tab.key === 'Roles') count = roles.length;
                                    if (tab.key === 'Departments') count = departments.length;
                                    if (tab.key === 'Programmes') count = programmes.length;
                                    if (tab.key === 'Blocks') count = blocks.length;
                                    if (tab.key === 'Rooms') count = rooms.length;
                                    if (tab.key === 'Users') count = users.length;

                                    return (
                                        <TouchableOpacity
                                            key={tab.key}
                                            style={[
                                                styles.drawerMenuItem,
                                                isActive && styles.drawerMenuItemActive,
                                            ]}
                                            onPress={() => {
                                                setActiveTab(tab.key);
                                                closeSidebar();
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.drawerItemLeft}>
                                                <Text style={styles.drawerItemIcon}>{tab.icon}</Text>
                                                <Text
                                                    style={[
                                                        styles.drawerItemText,
                                                        isActive && styles.drawerItemTextActive,
                                                    ]}
                                                >
                                                    {tab.label}
                                                </Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.drawerBadge,
                                                    isActive && styles.drawerBadgeActive,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.drawerBadgeText,
                                                        isActive && styles.drawerBadgeTextActive,
                                                    ]}
                                                >
                                                    {count}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Drawer Bottom Return Action */}
                            <View style={styles.drawerFooter}>
                                <TouchableOpacity
                                    style={styles.drawerReturnBtn}
                                    onPress={() => {
                                        closeSidebar();
                                        navigation.goBack();
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.drawerReturnText}>❮ Return to Dashboard</Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            )}

            {/* ============================================================
                FORM MODAL (Add / Edit Sheet)
            ============================================================ */}
            <Modal
                visible={formModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFormModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <Text style={styles.modalTitleIcon}>{currentTabMeta.icon}</Text>
                                <Text style={styles.modalSheetTitle}>
                                    {editingItem ? `Edit ${currentTabMeta.singular}` : `Add New ${currentTabMeta.singular}`}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseCircle}
                                onPress={() => setFormModalVisible(false)}
                            >
                                <Text style={styles.modalCloseCircleText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
                            {/* ROLES FORM */}
                            {activeTab === 'Roles' && (
                                <>
                                    <Text style={styles.formLabel}>Role Name *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. Electrician, PC Hardware, Security"
                                        placeholderTextColor="#64748b"
                                        value={roleName}
                                        onChangeText={setRoleName}
                                    />

                                    <Text style={styles.formLabel}>Description</Text>
                                    <TextInput
                                        style={[styles.formInput, { height: 75, textAlignVertical: 'top' }]}
                                        placeholder="e.g. Responsible for electrical maintenance & troubleshooting"
                                        placeholderTextColor="#64748b"
                                        multiline
                                        numberOfLines={3}
                                        value={roleDescription}
                                        onChangeText={setRoleDescription}
                                    />

                                    <Text style={styles.formLabel}>Permissions (comma-separated)</Text>
                                    <TextInput
                                        style={[styles.formInput, { height: 75, textAlignVertical: 'top' }]}
                                        placeholder="e.g. view_complaints, assign_tasks, resolve_issues"
                                        placeholderTextColor="#64748b"
                                        multiline
                                        numberOfLines={2}
                                        value={rolePermissions}
                                        onChangeText={setRolePermissions}
                                    />
                                </>
                            )}

                            {/* DEPARTMENTS FORM */}
                            {activeTab === 'Departments' && (
                                <>
                                    <Text style={styles.formLabel}>Department Name *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. Computer Science Engineering"
                                        placeholderTextColor="#64748b"
                                        value={deptName}
                                        onChangeText={setDeptName}
                                    />
                                    <Text style={styles.formLabel}>Short Code *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. CSE"
                                        placeholderTextColor="#64748b"
                                        autoCapitalize="characters"
                                        value={deptShortName}
                                        onChangeText={setDeptShortName}
                                    />
                                </>
                            )}

                            {/* PROGRAMMES FORM */}
                            {activeTab === 'Programmes' && (
                                <>
                                    <Text style={styles.formLabel}>Select Department *</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {departments.map((d) => (
                                            <TouchableOpacity
                                                key={d._id}
                                                style={[styles.formChip, progDeptId === d._id && styles.formChipActive]}
                                                onPress={() => setProgDeptId(d._id)}
                                            >
                                                <Text style={[styles.formChipText, progDeptId === d._id && styles.formChipTextActive]}>
                                                    🏢 {d.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <Text style={styles.formLabel}>Programme Name *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. B.Tech Artificial Intelligence"
                                        placeholderTextColor="#64748b"
                                        value={progName}
                                        onChangeText={setProgName}
                                    />
                                    <Text style={styles.formLabel}>Short Code *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. BTECH-AI"
                                        placeholderTextColor="#64748b"
                                        autoCapitalize="characters"
                                        value={progShortName}
                                        onChangeText={setProgShortName}
                                    />
                                </>
                            )}

                            {/* BLOCKS FORM */}
                            {activeTab === 'Blocks' && (
                                <>
                                    <Text style={styles.formLabel}>Select Department *</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {departments.map((d) => (
                                            <TouchableOpacity
                                                key={d._id}
                                                style={[styles.formChip, blockDeptId === d._id && styles.formChipActive]}
                                                onPress={() => setBlockDeptId(d._id)}
                                            >
                                                <Text style={[styles.formChipText, blockDeptId === d._id && styles.formChipTextActive]}>
                                                    🏢 {d.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <Text style={styles.formLabel}>Block Name *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. Block A or Main Complex"
                                        placeholderTextColor="#64748b"
                                        value={blockName}
                                        onChangeText={setBlockName}
                                    />
                                </>
                            )}

                            {/* ROOMS FORM */}
                            {activeTab === 'Rooms' && (
                                <>
                                    <Text style={styles.formLabel}>Select Department *</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {departments.map((d) => (
                                            <TouchableOpacity
                                                key={d._id}
                                                style={[styles.formChip, roomDeptId === d._id && styles.formChipActive]}
                                                onPress={() => setRoomDeptId(d._id)}
                                            >
                                                <Text style={[styles.formChipText, roomDeptId === d._id && styles.formChipTextActive]}>
                                                    🏢 {d.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <Text style={styles.formLabel}>Select Block *</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {blocks
                                            .filter(b => !roomDeptId || (b.department?._id || b.department) === roomDeptId)
                                            .map((b) => (
                                                <TouchableOpacity
                                                    key={b._id}
                                                    style={[styles.formChip, roomBlockId === b._id && styles.formChipActive]}
                                                    onPress={() => setRoomBlockId(b._id)}
                                                >
                                                    <Text style={[styles.formChipText, roomBlockId === b._id && styles.formChipTextActive]}>
                                                        🧱 {b.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                    </ScrollView>

                                    <Text style={styles.formLabel}>Room Number *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. 101 or Lab 3"
                                        placeholderTextColor="#64748b"
                                        value={roomNumber}
                                        onChangeText={setRoomNumber}
                                    />

                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.formLabel}>Floor</Text>
                                            <TextInput
                                                style={styles.formInput}
                                                placeholder="1"
                                                placeholderTextColor="#64748b"
                                                keyboardType="numeric"
                                                value={roomFloor}
                                                onChangeText={setRoomFloor}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.formLabel}>Capacity</Text>
                                            <TextInput
                                                style={styles.formInput}
                                                placeholder="60"
                                                placeholderTextColor="#64748b"
                                                keyboardType="numeric"
                                                value={roomCapacity}
                                                onChangeText={setRoomCapacity}
                                            />
                                        </View>
                                    </View>
                                </>
                            )}

                            {/* USERS FORM */}
                            {activeTab === 'Users' && (
                                <>
                                    <Text style={styles.formLabel}>Select Role *</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {AVAILABLE_ROLES.map((r) => (
                                            <TouchableOpacity
                                                key={r}
                                                style={[styles.formChip, userRole === r && styles.formChipActive]}
                                                onPress={() => setUserRole(r)}
                                            >
                                                <Text style={[styles.formChipText, userRole === r && styles.formChipTextActive]}>
                                                    {r === 'Plumber' ? '🔧' : r === 'Electrician' ? '⚡' : r === 'SuperAdmin' ? '👑' : '👤'} {r}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <Text style={styles.formLabel}>Username *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. electrician_sarah"
                                        placeholderTextColor="#64748b"
                                        value={userUsername}
                                        onChangeText={setUserUsername}
                                    />

                                    <Text style={styles.formLabel}>Email Address *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. sarah@example.com"
                                        placeholderTextColor="#64748b"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={userEmail}
                                        onChangeText={setUserEmail}
                                    />

                                    <Text style={styles.formLabel}>Phone Number *</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. 9876543210"
                                        placeholderTextColor="#64748b"
                                        keyboardType="phone-pad"
                                        value={userPhone}
                                        onChangeText={setUserPhone}
                                    />

                                    <Text style={styles.formLabel}>
                                        Password {editingItem ? '(leave blank to keep current)' : '*'}
                                    </Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="Enter account password"
                                        placeholderTextColor="#64748b"
                                        secureTextEntry
                                        value={userPassword}
                                        onChangeText={setUserPassword}
                                    />
                                </>
                            )}

                            {/* Modal Action Buttons */}
                            <View style={styles.modalActionButtons}>
                                <TouchableOpacity
                                    style={[styles.modalSaveBtn, submitting && styles.modalSaveBtnDisabled]}
                                    onPress={handleSave}
                                    disabled={submitting}
                                    activeOpacity={0.8}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.modalSaveBtnText}>
                                            {editingItem ? '💾 Update Changes' : (activeTab === 'Roles' ? '➕ Create Role' : '➕ Save & Create')}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalCancelBtn}
                                    onPress={() => setFormModalVisible(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#090d16',
    },
    // Top Bar Header
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#090d16',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    hamburgerBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#131b2e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#24344d',
    },
    hamburgerIcon: {
        fontSize: 20,
        color: '#f8fafc',
    },
    topBarTitleBox: {
        flex: 1,
        paddingHorizontal: 12,
    },
    topBarTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '800',
    },
    topBarReloadBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#131b2e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#24344d',
    },
    topBarReloadIcon: {
        fontSize: 16,
    },

    // Sub-header (Figure 15 Style)
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 12,
    },
    subHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionHeading: {
        color: '#f8fafc',
        fontSize: 22,
        fontWeight: '800',
    },
    countBadge: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    countBadgeText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '700',
    },
    addPillBtn: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    addPillBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '800',
    },

    // List Content
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        paddingTop: 4,
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 12,
    },

    // Card Container (Figure 15 Style)
    cardContainer: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1e293b',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 4,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    cardIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardCategoryIcon: {
        fontSize: 20,
    },
    cardMetaBox: {
        flex: 1,
    },
    cardSubTag: {
        color: '#818cf8',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    cardMainTitle: {
        color: '#f8fafc',
        fontSize: 17,
        fontWeight: '800',
    },

    // Middle Info Chips
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    infoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a2234',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#29354d',
        gap: 6,
    },
    infoChipHighlight: {
        backgroundColor: '#3b82f618',
        borderColor: '#3b82f640',
    },
    chipIcon: {
        fontSize: 11,
    },
    chipValue: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },
    chipValueHighlight: {
        color: '#60a5fa',
        fontWeight: '700',
    },

    // Bottom Action Row (Figure 15 Style)
    cardActionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        paddingTop: 12,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0c1b33',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#0284c7',
    },
    editBtnText: {
        color: '#38bdf8',
        fontSize: 13,
        fontWeight: '700',
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2b1019',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    deleteBtnText: {
        color: '#f87171',
        fontSize: 13,
        fontWeight: '700',
    },

    // Empty State
    emptyCard: {
        alignItems: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptySubtitle: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
    },

    // Sidebar Drawer
    drawerBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 999,
        justifyContent: 'flex-start',
    },
    drawerContainer: {
        width: DRAWER_WIDTH,
        height: '100%',
        backgroundColor: '#0d1322',
        borderRightWidth: 1,
        borderRightColor: '#1e293b',
        paddingTop: 45,
        paddingHorizontal: 16,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 20,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        paddingBottom: 18,
        marginBottom: 18,
    },
    drawerHeaderLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    drawerLogoIcon: {
        fontSize: 26,
    },
    drawerLogoTitle: {
        color: '#f8fafc',
        fontSize: 17,
        fontWeight: '800',
    },
    drawerLogoSubtitle: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '500',
    },
    drawerCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#161f33',
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerCloseText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '700',
    },
    drawerMenuScroll: {
        flex: 1,
    },
    drawerMenuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 14,
        marginBottom: 8,
    },
    drawerMenuItemActive: {
        backgroundColor: '#1e1b4b',
        borderWidth: 1,
        borderColor: '#6366f1',
    },
    drawerItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    drawerItemIcon: {
        fontSize: 20,
    },
    drawerItemText: {
        color: '#94a3b8',
        fontSize: 15,
        fontWeight: '600',
    },
    drawerItemTextActive: {
        color: '#ffffff',
        fontWeight: '800',
    },
    drawerBadge: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 10,
    },
    drawerBadgeActive: {
        backgroundColor: '#6366f1',
    },
    drawerBadgeText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '700',
    },
    drawerBadgeTextActive: {
        color: '#ffffff',
    },
    drawerFooter: {
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        paddingTop: 16,
    },
    drawerReturnBtn: {
        backgroundColor: '#161f33',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#24344d',
    },
    drawerReturnText: {
        color: '#38bdf8',
        fontSize: 13,
        fontWeight: '700',
    },

    // Modal Sheet (Add / Edit)
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#111827',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        maxHeight: '85%',
        borderTopWidth: 1,
        borderTopColor: '#24344d',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        paddingBottom: 14,
        marginBottom: 16,
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modalTitleIcon: {
        fontSize: 22,
    },
    modalSheetTitle: {
        color: '#f8fafc',
        fontSize: 19,
        fontWeight: '800',
    },
    modalCloseCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseCircleText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '700',
    },
    modalFormScroll: {
        marginBottom: 10,
    },
    formLabel: {
        color: '#cbd5e1',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 6,
        marginTop: 10,
    },
    formInput: {
        backgroundColor: '#090d16',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#f8fafc',
        borderWidth: 1,
        borderColor: '#24344d',
        marginBottom: 4,
    },
    chipScroll: {
        marginBottom: 8,
    },
    formChip: {
        backgroundColor: '#090d16',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#24344d',
        marginRight: 8,
    },
    formChipActive: {
        backgroundColor: '#6366f1',
        borderColor: '#818cf8',
    },
    formChipText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },
    formChipTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },
    modalActionButtons: {
        marginTop: 20,
        gap: 10,
        marginBottom: 16,
    },
    modalSaveBtn: {
        backgroundColor: '#6366f1',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    modalSaveBtnDisabled: {
        backgroundColor: '#4338ca',
    },
    modalSaveBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
    },
    modalCancelBtn: {
        backgroundColor: '#090d16',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    modalCancelBtnText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
});
