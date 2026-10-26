import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { complaintService } from '../config/api';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS = {
    'PC Hardware': '#38bdf8',
    'PC Software': '#6366f1',
    'Network & Wi-Fi': '#a855f7',
    'Network': '#a855f7',
    'Electrical': '#f59e0b',
    'Electronics': '#f59e0b',
    'Plumbing': '#06b6d4',
    'Application Issues': '#ec4899',
    'Other': '#64748b',
};

const CATEGORY_ICONS = {
    'PC Hardware': '💻',
    'PC Software': '🖥️',
    'Network & Wi-Fi': '🌐',
    'Network': '🌐',
    'Electrical': '⚡',
    'Electronics': '⚡',
    'Plumbing': '🚰',
    'Application Issues': '⚙️',
    'Other': '📌',
};

// Interactive Native SVG Donut / Pie Chart Component
const MobilePieChart = ({ data, size = 210, innerRadius = 58, selectedIndex, onSelect }) => {
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    const center = size / 2;
    const radius = size / 2 - 10;

    if (total === 0) {
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: size }}>
                <Svg width={size} height={size}>
                    <Circle cx={center} cy={center} r={radius} fill="none" stroke="#24344d" strokeWidth={16} />
                    <Circle cx={center} cy={center} r={innerRadius} fill="#141e33" />
                    <SvgText x={center} y={center + 5} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700">
                        No Data
                    </SvgText>
                </Svg>
            </View>
        );
    }

    let accumulatedAngle = -Math.PI / 2;

    const slices = data.map((item, idx) => {
        const angle = (item.value / total) * 2 * Math.PI;
        const startAngle = accumulatedAngle;
        const endAngle = accumulatedAngle + angle;
        accumulatedAngle += angle;

        const isFull = item.value === total;
        const isSelected = selectedIndex === idx;
        const currentRadius = isSelected ? radius + 5 : radius;

        const x1 = center + currentRadius * Math.cos(startAngle);
        const y1 = center + currentRadius * Math.sin(startAngle);
        const x2 = center + currentRadius * Math.cos(endAngle);
        const y2 = center + currentRadius * Math.sin(endAngle);

        const largeArc = angle > Math.PI ? 1 : 0;
        const pathData = isFull
            ? `M ${center} ${center - currentRadius} A ${currentRadius} ${currentRadius} 0 1 1 ${center} ${center + currentRadius} A ${currentRadius} ${currentRadius} 0 1 1 ${center} ${center - currentRadius}`
            : `M ${center} ${center} L ${x1} ${y1} A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        const percent = Math.round((item.value / total) * 100);

        return {
            ...item,
            pathData,
            percent,
            index: idx,
            isSelected,
        };
    });

    const activeItem = selectedIndex !== null && selectedIndex !== undefined ? slices[selectedIndex] : null;

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                <G>
                    {slices.map((slice) => (
                        <Path
                            key={slice.label || slice.index}
                            d={slice.pathData}
                            fill={slice.color}
                            opacity={selectedIndex === null || selectedIndex === undefined || slice.isSelected ? 1 : 0.45}
                            onPress={() => onSelect && onSelect(slice.isSelected ? null : slice.index)}
                        />
                    ))}
                    {/* Inner Donut Cutout */}
                    <Circle
                        cx={center}
                        cy={center}
                        r={innerRadius}
                        fill="#141e33"
                        stroke="#24344d"
                        strokeWidth={2}
                    />
                    {/* Donut Center Display */}
                    <SvgText
                        x={center}
                        y={activeItem ? center - 6 : center - 4}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="22"
                        fontWeight="900"
                    >
                        {activeItem ? String(activeItem.value) : String(total)}
                    </SvgText>
                    <SvgText
                        x={center}
                        y={activeItem ? center + 14 : center + 14}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="10"
                        fontWeight="700"
                    >
                        {activeItem ? `${activeItem.label} (${activeItem.percent}%)` : 'TOTAL TICKETS'}
                    </SvgText>
                </G>
            </Svg>
            <Text style={styles.chartTipText}>👆 Tap any slice to inspect details</Text>
        </View>
    );
};

export default function ReportsScreen() {
    const [stats, setStats] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Chart mode: 'status' | 'category'
    const [chartMode, setChartMode] = useState('status');
    const [selectedSliceIdx, setSelectedSliceIdx] = useState(null);
    const [selectedTab, setSelectedTab] = useState('overview'); // 'overview' | 'departments'

    const fetchReports = async () => {
        try {
            const [statsRes, listRes] = await Promise.all([
                complaintService.getStats().catch(() => ({ data: {} })),
                complaintService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
            ]);
            setStats(statsRes.data || {});
            const list = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data || []);
            setComplaints(list);
        } catch (err) {
            console.log('Error loading reports:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    const total = stats?.total || complaints.length || 0;
    const pending = stats?.pending ?? complaints.filter((c) => c.status === 'Pending').length;
    const assigned = stats?.assigned ?? complaints.filter((c) => c.status === 'Assigned').length;
    const inProgress = complaints.filter((c) => c.status === 'In-Progress' || c.status === 'In Progress').length || (stats?.inProgress ?? 0);
    const resolved = stats?.closed ?? stats?.resolved ?? complaints.filter((c) => c.status === 'Closed' || c.status === 'Resolved').length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

    // Status Pie Data
    const statusPieData = useMemo(() => {
        return [
            { label: 'Pending', value: pending, color: '#f59e0b', icon: '⏳' },
            { label: 'Assigned', value: assigned, color: '#8b5cf6', icon: '👤' },
            { label: 'In Progress', value: inProgress, color: '#38bdf8', icon: '⚙️' },
            { label: 'Closed / Done', value: resolved, color: '#10b981', icon: '✅' },
        ].filter((item) => item.value > 0);
    }, [pending, assigned, inProgress, resolved]);

    // Category Pie Data
    const categoryPieData = useMemo(() => {
        const counts = {};
        complaints.forEach((c) => {
            const type = c.complaintType || 'Other';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.keys(counts).map((type) => ({
            label: type,
            value: counts[type],
            color: CATEGORY_COLORS[type] || '#8b5cf6',
            icon: CATEGORY_ICONS[type] || '📌',
        })).sort((a, b) => b.value - a.value);
    }, [complaints]);

    // Department Breakdown
    const departmentStats = useMemo(() => {
        const counts = {};
        complaints.forEach((c) => {
            const dept = c.departmentName || c.createdBy?.department?.name || 'General';
            counts[dept] = (counts[dept] || 0) + 1;
        });
        return Object.keys(counts).map((name) => ({
            name,
            count: counts[name],
            percent: total > 0 ? Math.round((counts[name] / total) * 100) : 0,
        })).sort((a, b) => b.count - a.count);
    }, [complaints, total]);

    const currentPieData = chartMode === 'status' ? statusPieData : categoryPieData;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        >
            <View style={styles.card}>
                {/* Header Badge & Title */}
                <View style={styles.headerBox}>
                    <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>📈 REAL-TIME METRICS</Text>
                    </View>
                    <Text style={styles.title}>System Analytics & Reports</Text>
                    <Text style={styles.subtitle}>
                        Visual pie charts, resolution velocity, and departmental ticket distribution
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#38bdf8" style={{ marginVertical: 40 }} />
                ) : (
                    <>
                        {/* Health & Resolution Banner */}
                        <View style={styles.healthHeroCard}>
                            <View style={styles.healthLeft}>
                                <Text style={styles.healthRate}>{resolutionRate}%</Text>
                                <Text style={styles.healthRateSub}>Resolved Rate</Text>
                            </View>
                            <View style={styles.healthRight}>
                                <View style={styles.healthStatusTag}>
                                    <View style={[styles.statusDot, { backgroundColor: resolutionRate >= 70 ? '#10b981' : '#f59e0b' }]} />
                                    <Text style={styles.healthStatusText}>
                                        {resolutionRate >= 70 ? 'Optimal Efficiency' : 'Backlog Action Needed'}
                                    </Text>
                                </View>
                                <Text style={styles.healthDetail}>
                                    {resolved} tickets resolved out of {total} total tickets registered.
                                </Text>
                            </View>
                        </View>

                        {/* 4-KPI Metric Strip */}
                        <View style={styles.kpiGrid}>
                            <View style={[styles.kpiCard, { borderTopColor: '#38bdf8' }]}>
                                <Text style={styles.kpiVal}>{total}</Text>
                                <Text style={styles.kpiTxt}>Total Tickets</Text>
                            </View>
                            <View style={[styles.kpiCard, { borderTopColor: '#f59e0b' }]}>
                                <Text style={[styles.kpiVal, { color: '#f59e0b' }]}>{pending}</Text>
                                <Text style={styles.kpiTxt}>Pending ({pendingRate}%)</Text>
                            </View>
                            <View style={[styles.kpiCard, { borderTopColor: '#8b5cf6' }]}>
                                <Text style={[styles.kpiVal, { color: '#a78bfa' }]}>{assigned + inProgress}</Text>
                                <Text style={styles.kpiTxt}>In Progress</Text>
                            </View>
                            <View style={[styles.kpiCard, { borderTopColor: '#10b981' }]}>
                                <Text style={[styles.kpiVal, { color: '#10b981' }]}>{resolved}</Text>
                                <Text style={styles.kpiTxt}>Resolved</Text>
                            </View>
                        </View>

                        {/* Interactive Pie Chart Mode Switcher */}
                        <View style={styles.chartToggleContainer}>
                            <TouchableOpacity
                                style={[styles.chartToggleBtn, chartMode === 'status' && styles.chartToggleBtnActive]}
                                onPress={() => {
                                    setChartMode('status');
                                    setSelectedSliceIdx(null);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chartToggleText, chartMode === 'status' && styles.chartToggleTextActive]}>
                                    🥧 Status Pie Chart
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.chartToggleBtn, chartMode === 'category' && styles.chartToggleBtnActive]}
                                onPress={() => {
                                    setChartMode('category');
                                    setSelectedSliceIdx(null);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chartToggleText, chartMode === 'category' && styles.chartToggleTextActive]}>
                                    💻 Category Pie Chart
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* The Visual SVG Pie / Donut Chart Box */}
                        <View style={styles.pieContainerCard}>
                            <View style={styles.pieCardHeader}>
                                <Text style={styles.pieCardTitle}>
                                    {chartMode === 'status' ? '🥧 Ticket Status Distribution' : '💻 Issue Category Distribution'}
                                </Text>
                                <Text style={styles.pieCardSub}>
                                    {chartMode === 'status' ? 'Breakdown across ticket lifecycle' : 'Categorized by technical domain'}
                                </Text>
                            </View>

                            <MobilePieChart
                                data={currentPieData}
                                size={220}
                                innerRadius={60}
                                selectedIndex={selectedSliceIdx}
                                onSelect={(idx) => setSelectedSliceIdx(idx)}
                            />

                            {/* Interactive Legend List */}
                            <View style={styles.legendWrapper}>
                                {currentPieData.map((item, idx) => {
                                    const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                    const isSelected = selectedSliceIdx === idx;
                                    return (
                                        <TouchableOpacity
                                            key={item.label}
                                            style={[styles.legendCard, isSelected && styles.legendCardSelected]}
                                            onPress={() => setSelectedSliceIdx(isSelected ? null : idx)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.legendTop}>
                                                <View style={styles.legendLeft}>
                                                    <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                                                    <Text style={styles.legendTitle}>
                                                        {item.icon ? `${item.icon} ` : ''}{item.label}
                                                    </Text>
                                                </View>
                                                <View style={styles.legendRight}>
                                                    <Text style={[styles.legendNumber, { color: item.color }]}>
                                                        {item.value}
                                                    </Text>
                                                    <Text style={styles.legendPercentBadge}>
                                                        {percent}%
                                                    </Text>
                                                </View>
                                            </View>
                                            {/* Progress meter bar */}
                                            <View style={styles.legendTrack}>
                                                <View style={[styles.legendFill, { width: `${percent}%`, backgroundColor: item.color }]} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Department Density & Comparison */}
                        <View style={styles.deptCard}>
                            <View style={styles.deptCardHeader}>
                                <Text style={styles.deptCardTitle}>🏢 Department Workload</Text>
                                <Text style={styles.deptCardSub}>Volume of tickets raised by each department</Text>
                            </View>

                            {departmentStats.length === 0 ? (
                                <Text style={styles.emptyText}>No department logs found</Text>
                            ) : (
                                departmentStats.map((d, index) => (
                                    <View key={d.name} style={styles.deptRow}>
                                        <View style={styles.deptRowTop}>
                                            <View style={styles.deptRowLeft}>
                                                <View style={styles.rankPill}>
                                                    <Text style={styles.rankPillText}>#{index + 1}</Text>
                                                </View>
                                                <Text style={styles.deptRowName}>{d.name}</Text>
                                            </View>
                                            <Text style={styles.deptRowCount}>
                                                <Text style={{ fontWeight: '800', color: '#f8fafc' }}>{d.count}</Text> tickets ({d.percent}%)
                                            </Text>
                                        </View>
                                        <View style={styles.deptProgressTrack}>
                                            <View style={[styles.deptProgressFill, { width: `${d.percent}%` }]} />
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>

                        {/* Refresh Button */}
                        <TouchableOpacity style={styles.refreshBtn} onPress={fetchReports} activeOpacity={0.8}>
                            <Text style={styles.refreshBtnText}>🔄 Refresh Analytics Data</Text>
                        </TouchableOpacity>
                    </>
                )}
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
        borderRadius: 22,
        padding: 20,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    headerBox: {
        marginBottom: 20,
    },
    badgePill: {
        backgroundColor: '#0284c725',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0284c750',
        marginBottom: 8,
    },
    badgeText: {
        color: '#38bdf8',
        fontSize: 11,
        fontWeight: '800',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#f8fafc',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 13,
        marginTop: 4,
    },
    healthHeroCard: {
        backgroundColor: '#090d16',
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0284c7',
        marginBottom: 16,
    },
    healthLeft: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: '#1e293b',
    },
    healthRate: {
        fontSize: 34,
        fontWeight: '900',
        color: '#10b981',
    },
    healthRateSub: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    healthRight: {
        flex: 1,
        paddingLeft: 16,
    },
    healthStatusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    healthStatusText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '800',
    },
    healthDetail: {
        color: '#94a3b8',
        fontSize: 12,
        lineHeight: 16,
    },
    kpiGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    kpiCard: {
        backgroundColor: '#090d16',
        width: '23%',
        paddingVertical: 12,
        paddingHorizontal: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#24344d',
        borderTopWidth: 3,
        alignItems: 'center',
    },
    kpiVal: {
        fontSize: 18,
        fontWeight: '800',
        color: '#f8fafc',
    },
    kpiTxt: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 3,
        textAlign: 'center',
    },
    chartToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#090d16',
        borderRadius: 14,
        padding: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    chartToggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    chartToggleBtnActive: {
        backgroundColor: '#0284c7',
    },
    chartToggleText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '700',
    },
    chartToggleTextActive: {
        color: '#ffffff',
    },
    pieContainerCard: {
        backgroundColor: '#090d16',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#24344d',
        marginBottom: 18,
    },
    pieCardHeader: {
        marginBottom: 14,
        alignItems: 'center',
    },
    pieCardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#f8fafc',
    },
    pieCardSub: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    chartTipText: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 8,
        fontWeight: '600',
    },
    legendWrapper: {
        marginTop: 18,
        gap: 10,
    },
    legendCard: {
        backgroundColor: '#141e33',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#24344d',
    },
    legendCardSelected: {
        borderColor: '#38bdf8',
        backgroundColor: '#1e293b',
    },
    legendTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendColorBox: {
        width: 12,
        height: 12,
        borderRadius: 4,
    },
    legendTitle: {
        color: '#f8fafc',
        fontSize: 13,
        fontWeight: '700',
    },
    legendRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendNumber: {
        fontSize: 14,
        fontWeight: '800',
    },
    legendPercentBadge: {
        backgroundColor: '#090d16',
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    legendTrack: {
        height: 6,
        backgroundColor: '#090d16',
        borderRadius: 3,
        overflow: 'hidden',
    },
    legendFill: {
        height: '100%',
        borderRadius: 3,
    },
    deptCard: {
        backgroundColor: '#090d16',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#24344d',
        marginBottom: 16,
    },
    deptCardHeader: {
        marginBottom: 14,
    },
    deptCardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#f8fafc',
    },
    deptCardSub: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    deptRow: {
        marginBottom: 12,
    },
    deptRowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    deptRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rankPill: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    rankPillText: {
        color: '#38bdf8',
        fontSize: 11,
        fontWeight: '800',
    },
    deptRowName: {
        color: '#f8fafc',
        fontSize: 13,
        fontWeight: '700',
    },
    deptRowCount: {
        color: '#94a3b8',
        fontSize: 12,
    },
    deptProgressTrack: {
        height: 6,
        backgroundColor: '#1e293b',
        borderRadius: 3,
        overflow: 'hidden',
    },
    deptProgressFill: {
        height: '100%',
        backgroundColor: '#38bdf8',
        borderRadius: 3,
    },
    emptyText: {
        color: '#64748b',
        fontSize: 13,
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 10,
    },
    refreshBtn: {
        backgroundColor: '#0284c720',
        borderColor: '#0284c7',
        borderWidth: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    refreshBtnText: {
        color: '#38bdf8',
        fontSize: 14,
        fontWeight: '700',
    },
});
