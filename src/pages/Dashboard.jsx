import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, FileCheck, AlertCircle, TrendingUp, Gift, ChevronRight, Target, MessageCircle as MessageCheck, LogOut } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import './Dashboard.css';

const StatCard = ({ title, value, label, icon: Icon, color }) => (
    <div className="stat-card glass-panel card-hover">
        <div className="stat-icon" style={{ background: `rgba(${color}, 0.15)`, color: `rgb(${color})` }}>
            <Icon size={24} />
        </div>
        <div className="stat-info">
            <h3 className="stat-value">{value}</h3>
            <p className="stat-title">{title}</p>
            {label && <span className="stat-label">{label}</span>}
        </div>
    </div>
);

const ProgressBar = ({ label, current, target, unit = '' }) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
        <div className="goal-progress-container">
            <div className="goal-header">
                <span>{label}</span>
                <span className="text-muted">{unit}{current.toLocaleString()} / {unit}{target.toLocaleString()}</span>
            </div>
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%`, background: percentage >= 100 ? '#10b981' : 'var(--primary)' }}
                ></div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { contacts, userProfile, userGoals, openAddModal } = useOutletContext();
    const [saasStats, setSaasStats] = React.useState({
        totalUsers: 0,
        proUsers: 0,
        newThisWeek: 0,
        totalRevenue: 0,
        conversionRate: 0,
        recentSignups: []
    });

    React.useEffect(() => {
        const fetchSaaSMetrics = async () => {
            if (userProfile?.role !== 'super_admin') return;

            try {
                const { data: users, error } = await supabase.from('profiles').select('*');
                if (users) {
                    const total = users.length;
                    const pro = users.filter(u => u.plan_id === 'pro').length;

                    // New this week
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    const newUsers = users.filter(u => new Date(u.created_at) > oneWeekAgo).length;



                    // Recent Signups (Top 5)
                    const recent = [...users]
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .slice(0, 5)
                        .map(u => ({
                            id: u.id,
                            name: u.full_name || u.email?.split('@')[0] || 'User',
                            email: u.email,
                            plan: u.plan_id || 'free',
                            date: new Date(u.created_at || Date.now()).toLocaleDateString()
                        }));

                    setSaasStats({
                        totalUsers: total,
                        proUsers: pro,
                        newThisWeek: newUsers,
                        totalRevenue: pro * 99, // Assuming RM 99/mo
                        conversionRate: total > 0 ? Math.round((pro / total) * 100) : 0,
                        recentSignups: recent
                    });
                }
            } catch (err) {
                console.error("Error fetching SaaS stats:", err);
            }
        };
        fetchSaaSMetrics();
    }, [userProfile]);

    const navigate = useNavigate();

    // --- System Health Checks ---
    const [systemHealth, setSystemHealth] = React.useState({
        dbStatus: 'Checking...',
        authStatus: 'Checking...',
        realtimeStatus: 'Checking...',
        latency: 0,
        lastChecked: null,
        version: '1.2.0', // App Version
        environment: import.meta.env.MODE || 'production'
    });

    React.useEffect(() => {
        const checkSystemHealth = async () => {
            if (userProfile?.role !== 'super_admin') return;

            const start = performance.now();
            let db = 'Unknown';
            let auth = 'Unknown';

            // 1. Check DB & Latency
            try {
                const { error } = await supabase.from('profiles').select('id').limit(1);
                if (!error) db = 'Operational';
                else db = 'Degraded';
            } catch (e) {
                db = 'Downtime';
            }
            const end = performance.now();
            const latency = Math.round(end - start);

            // 2. Check Auth
            try {
                const { data, error } = await supabase.auth.getSession();
                if (data.session) auth = 'Operational';
                else if (error) auth = 'Issues Detected';
                else auth = 'Operational'; // No session but no error means service is up
            } catch (e) {
                auth = 'Down';
            }

            // 3. Realtime (Inferred from client socket state if accessible, else simplified)
            // Supabase v2 exposes connection state differently, often abstracted. 
            // We assume Operational if DB is up for now, or check a subscription.
            const rt = 'Operational'; // Placeholder for deep socket check

            setSystemHealth(prev => ({
                ...prev,
                dbStatus: db,
                authStatus: auth,
                realtimeStatus: rt,
                latency: latency,
                lastChecked: new Date().toLocaleTimeString()
            }));
        };

        checkSystemHealth();
        // Poll every 30 seconds
        const interval = setInterval(checkSystemHealth, 30000);
        return () => clearInterval(interval);
    }, [userProfile]);


    if (userProfile.role === 'super_admin') {
        return (
            <div className="dashboard-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Super Admin Dashboard</h1>
                        <p className="page-subtitle">Platform Overview & SaaS Metrics</p>
                    </div>
                </header>

                {/* SaaS Metrics Grid */}
                <div className="stats-grid">
                    <StatCard
                        title="Total Users"
                        value={saasStats.totalUsers}
                        label={saasStats.newThisWeek > 0 ? `+${saasStats.newThisWeek} this week` : "Stable"}
                        icon={Users}
                        color="37, 99, 235"
                    />
                    <StatCard
                        title="Active Pro Subs"
                        value={saasStats.proUsers}
                        label={`RM ${saasStats.proUsers * 99}.00 / mo`}
                        icon={Target}
                        color="16, 185, 129"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`RM ${saasStats.totalRevenue}`}
                        label="Monthly Recurring"
                        icon={TrendingUp}
                        color="124, 58, 237"
                    />
                    <StatCard
                        title="System Health"
                        value={systemHealth.dbStatus === 'Operational' ? '100% Uptime' : 'Issues'}
                        label={`Latency: ${systemHealth.latency}ms`}
                        icon={AlertCircle}
                        color="245, 158, 11"
                    />
                </div>

                <div className="dashboard-content">
                    {/* Left: Recent Activity */}
                    <div className="content-section glass-panel">
                        <h2 className="section-title">Recent Signups</h2>
                        <div className="attention-list">
                            {saasStats.recentSignups && saasStats.recentSignups.length > 0 ? (
                                saasStats.recentSignups.map(user => (
                                    <div key={user.id} className="attention-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{user.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email} • {user.date}</div>
                                        </div>
                                        <span className={`badge ${user.plan === 'pro' ? 'pro' : ''}`} style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{user.plan}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted" style={{ padding: '1rem', fontStyle: 'italic' }}>
                                    No recent signups found.
                                </div>
                            )}
                            <div className="text-center" style={{ marginTop: '1rem' }}>
                                <button
                                    onClick={() => navigate('/super-admin', { state: { activeTab: 'users' } })}
                                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
                                >
                                    View All Users →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: System Status & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="content-section glass-panel" style={{ minHeight: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 className="section-title" style={{ marginBottom: 0 }}>Live System Status</h2>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Last checked: {systemHealth.lastChecked}</span>
                            </div>

                            <div className="matrix-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Database Connection</span>
                                <span style={{ color: systemHealth.dbStatus === 'Operational' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                    {systemHealth.dbStatus}
                                </span>
                            </div>
                            <div className="matrix-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Auth Services</span>
                                <span style={{ color: systemHealth.authStatus === 'Operational' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                    {systemHealth.authStatus}
                                </span>
                            </div>
                            <div className="matrix-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>API Latency</span>
                                <span style={{ color: systemHealth.latency < 200 ? '#3b82f6' : '#eab308' }}>
                                    {systemHealth.latency}ms
                                </span>
                            </div>
                            <div className="matrix-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Environment</span>
                                <span style={{ color: '#64748b' }}>{systemHealth.environment}</span>
                            </div>
                            <div className="matrix-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>App Version</span>
                                <span style={{ color: '#64748b' }}>v{systemHealth.version}</span>
                            </div>
                        </div>

                        <div className="content-section glass-panel" style={{ minHeight: 'auto' }}>
                            <h2 className="section-title">Quick Actions</h2>
                            <div className="quick-actions-grid">
                                <button className="action-btn" onClick={() => navigate('/super-admin', { state: { activeTab: 'users' } })}>
                                    <Users size={16} style={{ marginRight: '8px', display: 'inline' }} /> User Management
                                </button>
                                <button className="action-btn" onClick={() => navigate('/super-admin', { state: { activeTab: 'followup' } })}>
                                    <MessageCheck size={16} style={{ marginRight: '8px', display: 'inline' }} /> Configure Automation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- AGENT DASHBOARD (Existing Logic) ---
    const stats = useMemo(() => {
        const activeClients = contacts.filter(c => c.role === 'Client' && c.status === 'Active');
        const prospects = contacts.filter(c => c.role === 'Prospect');
        const lapsed = contacts.filter(c => c.status === 'Lapsed' || c.status === 'Grace Period');

        // Financials (Simplified)
        const totalPortfolio = activeClients.reduce((sum, c) => sum + (Number(c.dealValue) || 0), 0);

        // Monthly Production (Mock based on subscription date matching current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyProduction = activeClients
            .filter(c => {
                if (!c.subscriptionDate) return false;
                const d = new Date(c.subscriptionDate);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, c) => sum + (Number(c.dealValue) || 0), 0);

        const monthlyCases = activeClients.filter(c => {
            if (!c.subscriptionDate) return false;
            const d = new Date(c.subscriptionDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        // YTD for MDRT
        const ytdProduction = activeClients
            .filter(c => {
                if (!c.subscriptionDate) return false;
                const d = new Date(c.subscriptionDate);
                return d.getFullYear() === currentYear;
            })
            .reduce((sum, c) => sum + (Number(c.dealValue) || 0), 0);

        return {
            prospectsCount: prospects.length,
            activeCount: activeClients.length,
            lapsedCount: lapsed.length,
            totalPortfolio,
            monthlyProduction,
            monthlyCases,
            ytdProduction,
            lapsedItems: lapsed
        };
    }, [contacts]);

    // --- Upcoming Birthdays (1-14 days) ---
    const upcomingBirthdays = useMemo(() => {
        const today = new Date();
        const nextTwoWeeks = new Date();
        nextTwoWeeks.setDate(today.getDate() + 14);

        return contacts.filter(c => {
            if (!c.birthday) return false;
            const bdate = new Date(c.birthday);
            // Set year to current to compare
            const thisYearBday = new Date(today.getFullYear(), bdate.getMonth(), bdate.getDate());

            if (thisYearBday < today) {
                thisYearBday.setFullYear(today.getFullYear());
            }

            // Check if within range
            if (thisYearBday < today) {
                thisYearBday.setFullYear(today.getFullYear() + 1);
            }

            return thisYearBday > today && thisYearBday <= nextTwoWeeks;
        }).sort((a, b) => {
            // Sort by date
            const dateA = new Date(a.birthday).setFullYear(2000);
            const dateB = new Date(b.birthday).setFullYear(2000);
            return dateA - dateB;
        });
    }, [contacts]);

    // --- Mobile Specific Metrics ---
    const mobileStats = useMemo(() => {
        const prospects = stats.prospectsCount;
        const clients = stats.activeCount;
        const production = stats.monthlyProduction;
        const attention = stats.lapsedCount;

        const total = prospects + clients;
        const conversionRate = total > 0 ? Math.round((clients / total) * 100) : 0;

        return { prospects, clients, production, attention, conversionRate };
    }, [stats]);

    return (
        <div className="dashboard-container">
            {/* --- Desktop Header --- */}
            <header className="page-header desktop-only">
                <div>
                    <h1 className="page-title">Welcome back, {userProfile.name.split(' ')[0]}</h1>
                    <p className="page-subtitle">Track your goals and stay on top of your clients.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="primary-btn" onClick={openAddModal}>
                        + Add New Prospect
                    </button>
                </div>
            </header>

            {/* --- Mobile Header New Design --- */}
            <div className="mobile-dashboard-header mobile-only">
                <div className="mobile-header-content">
                    <h1 style={{ color: 'white' }}>Salam, {userProfile.name.split(' ')[0]}!</h1>
                    <div className="tier-badge">
                        <Target size={12} />
                        {userProfile.role === 'super_admin' ? 'Super Admin' : userProfile.role === 'pro' ? 'PRO User' : 'FREE User'}
                    </div>

                </div>
                <button
                    className="icon-btn-glass"
                    onClick={async () => {
                        await supabase.auth.signOut();
                        localStorage.removeItem('agent_user_profile');
                        window.location.href = '/login';
                    }}
                    style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* --- Mobile Stats Matrix (Overlapping) --- */}
            <div className="mobile-stats-matrix mobile-only">
                <div className="stats-row">
                    {/* Top Left: Prospects */}
                    <div className="matrix-card">
                        <div className="matrix-value">{mobileStats.prospects}</div>
                        <div className="matrix-label">PROSPECTS</div>
                    </div>
                    {/* Top Right: Clients */}
                    <div className="matrix-card">
                        <div className="matrix-value">{mobileStats.clients}</div>
                        <div className="matrix-label">ACTIVE CLIENTS</div>
                    </div>
                </div>

                <div className="stats-row">
                    {/* Bottom Left: Production */}
                    <div className="matrix-card">
                        <div className="matrix-value">RM {(mobileStats.production / 1000).toFixed(1)}k</div>
                        <div className="matrix-label">PRODUCTION</div>
                    </div>
                    {/* Bottom Right: Attention */}
                    <div className="matrix-card" style={{
                        borderColor: mobileStats.attention > 0 ? '#f59e0b' : 'transparent',
                        borderWidth: mobileStats.attention > 0 ? '2px' : '0',
                        borderStyle: 'solid'
                    }}>
                        <div className="matrix-value" style={{ color: mobileStats.attention > 0 ? '#f59e0b' : 'inherit' }}>
                            {mobileStats.attention}
                        </div>
                        <div className="matrix-label">ATTENTION</div>
                    </div>
                </div>

                {/* Central Gauge */}
                <div className="central-gauge">
                    <div className="gauge-track" style={{ '--percentage': mobileStats.conversionRate }}>
                        <div className="gauge-inner">
                            <span className="gauge-value">{mobileStats.conversionRate}%</span>
                            <span className="gauge-label">CONVERSION</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="mobile-actions-row mobile-only">
                <button className="mobile-action-btn primary" onClick={openAddModal}>
                    <Users size={18} /> Tambah Lead
                </button>
                <button className="mobile-action-btn secondary" onClick={() => navigate('/databases')}>
                    <TrendingUp size={18} /> Cari
                </button>
            </div>

            {/* --- Desktop Stats Grid --- */}
            <div className="stats-grid desktop-only">
                <StatCard
                    title="Total Prospects"
                    value={stats.prospectsCount}
                    label="Potential Customers"
                    icon={Users}
                    color="124, 58, 237" // Purple
                />
                <StatCard
                    title="Active Clients"
                    value={stats.activeCount}
                    label={`RM ${(stats.totalPortfolio / 1000).toFixed(1)}k Portfolio`}
                    icon={FileCheck}
                    color="16, 185, 129" // Emerald
                />
                <StatCard
                    title="Production (MTD)"
                    value={`RM ${stats.monthlyProduction.toLocaleString()}`}
                    label={`${stats.monthlyCases} Cases this month`}
                    icon={TrendingUp}
                    color="14, 165, 233" // Sky
                />
                <StatCard
                    title="Attention Needed"
                    value={stats.lapsedCount}
                    label="Lapsed / Grace Period"
                    icon={AlertCircle}
                    color="245, 158, 11" // Orange
                />
            </div>

            <div className="dashboard-content">
                {/* Left Column: Progress & Metrics */}
                <div className="content-section glass-panel">
                    <h2 className="section-title">Goal Tracker (KPIs)</h2>

                    <ProgressBar
                        label="Monthly Production Target"
                        current={stats.monthlyProduction}
                        target={userGoals.monthlyRevenue}
                        unit="RM "
                    />

                    <ProgressBar
                        label="Monthly Case Count"
                        current={stats.monthlyCases}
                        target={userGoals.monthlyCases}
                    />

                    <ProgressBar
                        label="Yearly MDRT Progress"
                        current={stats.ytdProduction}
                        target={userGoals.mdrtGoal}
                        unit="RM "
                    />

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <h3 className="section-title" style={{ fontSize: '1rem' }}>Attention Needed</h3>
                        <div className="attention-list">
                            {stats.lapsedItems.length > 0 ? (
                                stats.lapsedItems.map(item => (
                                    <div key={item.id} className={`attention-item ${item.status === 'Lapsed' ? 'lapsed' : 'grace'}`}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.status} • {item.nextAction}</div>
                                        </div>
                                        <button className="icon-btn-sm" onClick={() => navigate('/databases')} title="View Contact">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted" style={{ fontStyle: 'italic' }}>Great job! No policies in critical status.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Qucik Actions & Birthdays */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="content-section glass-panel" style={{ minHeight: 'auto' }}>
                        <h2 className="section-title">Upcoming Birthdays</h2>
                        <div className="birthday-list">
                            {upcomingBirthdays.length > 0 ? (
                                upcomingBirthdays.map(c => (
                                    <div key={c.id} className="birthday-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Gift size={16} className="text-muted" />
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{c.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {(() => {
                                                        const d = new Date(c.birthday);
                                                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="gift-btn">Prepare Gift</button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted" style={{ fontSize: '0.9rem' }}>No birthdays in the next 14 days.</div>
                            )}
                        </div>
                    </div>

                    <div className="content-section glass-panel" style={{ minHeight: 'auto' }}>
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="quick-actions-grid">
                            <button className="action-btn" onClick={() => navigate('/settings')}>
                                <Target size={16} style={{ marginRight: '8px', display: 'inline' }} /> Update Targets
                            </button>
                            <button className="action-btn" onClick={() => navigate('/follow-up')}>
                                <TrendingUp size={16} style={{ marginRight: '8px', display: 'inline' }} /> Review Automation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
