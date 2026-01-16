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
        conversionRate: 0
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

                    setSaasStats({
                        totalUsers: total,
                        proUsers: pro,
                        newThisWeek: newUsers,
                        totalRevenue: pro * 99, // Assuming RM 99/mo
                        conversionRate: total > 0 ? Math.round((pro / total) * 100) : 0
                    });
                }
            } catch (err) {
                console.error("Error fetching SaaS stats:", err);
            }
        };
        fetchSaaSMetrics();
    }, [userProfile]);

    const navigate = useNavigate();

    // --- SUPER ADMIN DASHBOARD ---
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
                        color="37, 99, 235" // Blue
                    />
                    <StatCard
                        title="Active Pro Subs"
                        value={saasStats.proUsers}
                        label={`RM ${saasStats.proUsers * 99}.00 / mo`}
                        icon={Target}
                        color="16, 185, 129" // Emerald
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`RM ${saasStats.totalRevenue}`}
                        label="Monthly Recurring"
                        icon={TrendingUp}
                        color="124, 58, 237" // Purple
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${saasStats.conversionRate}%`}
                        label="Free to Pro"
                        icon={TrendingUp}
                        color="245, 158, 11" // Orange
                    />
                </div>

                <div className="dashboard-content">
                    {/* Left: Recent Activity */}
                    <div className="content-section glass-panel">
                        <h2 className="section-title">Recent Signups</h2>
                        <div className="attention-list">
                            <div className="attention-item">
                                <div>
                                    <div style={{ fontWeight: 600 }}>Ali Baba</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free Plan • Joined 2 hours ago</div>
                                </div>
                                <span className="status-dot active"></span>
                            </div>
                            <div className="attention-item">
                                <div>
                                    <div style={{ fontWeight: 600 }}>Siti Sarah</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pro Plan • Upgraded yesterday</div>
                                </div>
                                <span className="status-dot active"></span>
                            </div>
                            <div className="attention-item">
                                <div>
                                    <div style={{ fontWeight: 600 }}>John Doe</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free Plan • Inactive</div>
                                </div>
                                <span className="status-dot inactive"></span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="content-section glass-panel" style={{ minHeight: 'auto' }}>
                            <h2 className="section-title">System Status</h2>
                            <div className="matrix-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Database</span>
                                <span style={{ color: '#10b981' }}>Operational</span>
                            </div>
                            <div className="matrix-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Email Service</span>
                                <span style={{ color: '#10b981' }}>Operational</span>
                            </div>
                            <div className="matrix-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>API Latency</span>
                                <span style={{ color: '#3b82f6' }}>24ms</span>
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
                    <h1>Salam, {userProfile.name.split(' ')[0]}!</h1>
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
