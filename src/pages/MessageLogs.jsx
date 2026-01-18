import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import {
    Mail,
    MessageCircle,
    Clock,
    Search,
    Filter,
    FileText,
    ArrowUpRight,
    Smartphone
} from 'lucide-react';
import './Dashboard.css'; // Re-use dashboard styles for consistency

const LogBadge = ({ type }) => {
    if (type === 'email') return <span className="status-badge status-info"><Mail size={12} style={{ marginRight: 4 }} /> Email</span>;
    if (type === 'whatsapp') return <span className="status-badge status-success"><MessageCircle size={12} style={{ marginRight: 4 }} /> Whatsapp</span>;
    if (type === 'sms') return <span className="status-badge status-warning"><Smartphone size={12} style={{ marginRight: 4 }} /> SMS</span>;
    return <span className="status-badge status-default">{type}</span>;
}

const MessageLogs = ({ userProfile }) => {
    // const { userProfile } = useOutletContext(); // Context might not reach here if not direct child of Outlet
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // all, email, whatsapp
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [userProfile]);

    const fetchLogs = async () => {
        if (!userProfile?.id) return;
        setLoading(true);

        try {
            // Join with profiles using the correct column name 'full_name' 
            let query = supabase
                .from('message_logs')
                .select(`
                    *,
                    profiles:user_id (full_name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(100);

            // Explicitly filter for non-super admins
            if (userProfile.role !== 'super_admin') {
                query = query.eq('user_id', userProfile.id);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Fetch Logs Error:', error);
                throw error;
            }
            setLogs(data || []);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesType = filterType === 'all' || (log.type || '').toLowerCase() === filterType;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (log.recipient || '').toLowerCase().includes(searchLower) ||
            (log.content_snippet || '').toLowerCase().includes(searchLower) ||
            (log.profiles?.full_name || '').toLowerCase().includes(searchLower);

        return matchesType && matchesSearch;
    });

    return (
        <div className="message-logs-section fade-in">
            <h2 className="section-title">Message History</h2>
            <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
                Track all automated and manual communications.
            </p>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className={`tab-btn ${filterType === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterType('all')}
                        >
                            All
                        </button>
                        <button
                            className={`tab-btn ${filterType === 'email' ? 'active' : ''}`}
                            onClick={() => setFilterType('email')}
                        >
                            Emails
                        </button>
                        <button
                            className={`tab-btn ${filterType === 'whatsapp' ? 'active' : ''}`}
                            onClick={() => setFilterType('whatsapp')}
                        >
                            WhatsApp
                        </button>
                    </div>

                    <div className="search-bar" style={{ maxWidth: '300px' }}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search recipient or content..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Recipient</th>
                                <th>Type</th>
                                <th>Content</th>
                                {userProfile?.role === 'super_admin' && <th>Sent By</th>}
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="loading-spinner"></div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        No messages found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td style={{ whiteSpace: 'nowrap', color: '#666', fontSize: '0.85rem' }}>
                                            {new Date(log.created_at).toLocaleString('en-MY', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>
                                            {log.recipient}
                                        </td>
                                        <td>
                                            <LogBadge type={log.type} />
                                        </td>
                                        <td style={{ maxWidth: '300px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span className="text-truncate" style={{ maxWidth: '280px', display: 'inline-block' }}>
                                                    {log.content_snippet || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        {userProfile?.role === 'super_admin' && (
                                            <td>
                                                {log.profiles?.full_name || 'Unknown'}
                                            </td>
                                        )}
                                        <td>
                                            <span className="status-badge status-success" style={{ fontSize: '0.75rem' }}>
                                                Sent
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MessageLogs;
