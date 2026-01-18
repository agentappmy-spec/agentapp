import { supabase } from '../services/supabaseClient';

// ... (existing imports)

// ...

const FollowUp = () => {
    // Note: We no longer rely on 'followUpSchedules' from context for the data source
    // We will fetch from Supabase 'workflow_steps' table.
    const { userProfile } = useOutletContext();
    const [activeTab, setActiveTab] = useState('prospect'); // 'prospect', 'client', 'global'
    const [editingNode, setEditingNode] = useState(null);
    const [deletingNode, setDeletingNode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dbSteps, setDbSteps] = useState({ prospect: [], client: [], global: [] });

    // Fetch Steps on Mount
    useEffect(() => {
        fetchSteps();
    }, []);

    const fetchSteps = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('workflow_steps')
                .select('*')
                .order('day', { ascending: true });

            if (error) throw error;

            // Group by template_id
            const grouped = {
                prospect: data.filter(d => d.template_id === 'prospect'),
                client: data.filter(d => d.template_id === 'client'),
                global: data.filter(d => d.template_id === 'global').sort((a, b) => {
                    // Custom sort for global (by date or trigger name)
                    if (a.date && b.date && a.date !== 'auto' && b.date !== 'auto') {
                        return new Date(a.date) - new Date(b.date);
                    }
                    return 0;
                })
            };
            setDbSteps(grouped);
        } catch (err) {
            console.error('Error fetching steps:', err);
            // Fallback? No, we want to know if it fails.
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNode = async (updatedNode) => {
        try {
            const { error } = await supabase
                .from('workflow_steps')
                .update({
                    day: updatedNode.day,
                    date: updatedNode.date,
                    content_sms: updatedNode.contentSms || updatedNode.content,
                    content_whatsapp: updatedNode.contentWhatsapp,
                    content_email: updatedNode.contentEmail,
                    trigger_name: updatedNode.trigger_name || updatedNode.label, // Ensure trigger_name is saved
                    updated_at: new Date()
                })
                .eq('id', updatedNode.id);

            if (error) throw error;

            // Refresh local state optimization
            fetchSteps();
            setEditingNode(null);
        } catch (err) {
            console.error('Error saving step:', err);
            alert('Failed to save changes.');
        }
    };

    // Add Step Logic (Insert to DB)
    const handleAddNode = async () => {
        const currentList = dbSteps[activeTab];
        const lastDay = currentList.length > 0 ? (currentList[currentList.length - 1].day || 0) : 0;

        try {
            const newNode = {
                template_id: activeTab,
                day: lastDay + 3,
                trigger_name: `Day ${lastDay + 3}`,
                content_sms: 'New message template...',
                content_whatsapp: 'New message template...',
                content_email: 'New message template...',
                is_active: true
            };

            const { data, error } = await supabase
                .from('workflow_steps')
                .insert([newNode])
                .select();

            if (error) throw error;

            fetchSteps();
            if (data && data[0]) {
                const created = data[0];
                // Map DB keys to UI expected keys if needed
                setEditingNode({
                    ...created,
                    contentSms: created.content_sms,
                    contentWhatsapp: created.content_whatsapp,
                    contentEmail: created.content_email
                });
            }
        } catch (err) {
            console.error('Error creating step:', err);
        }
    };

    const handleDeleteClick = (node) => {
        setDeletingNode(node);
    };

    const confirmDelete = async () => {
        if (!deletingNode) return;
        try {
            const { error } = await supabase
                .from('workflow_steps')
                .delete()
                .eq('id', deletingNode.id);

            if (error) throw error;
            fetchSteps();
            setDeletingNode(null);
        } catch (err) {
            console.error('Error deleting step:', err);
            alert('Failed to delete step.');
        }
    };

    // --- Mapper Function to Bridge DB Schema to UI Components ---
    // The UI components (FollowUpCard, EditNodeModal) expect specific props like `contentSms` not `content_sms`
    const mapDbToUi = (items) => {
        return items.map(item => ({
            ...item,
            label: item.trigger_name || `Day ${item.day}`,
            contentSms: item.content_sms,
            contentWhatsapp: item.content_whatsapp,
            contentEmail: item.content_email,
            content: item.content_sms // Fallback key
        }));
    };

    const activeList = mapDbToUi(dbSteps[activeTab] || []);

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading workflows...</div>;
    }

    return (
        <div className="followup-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Auto Follow Up</h1>
                    <p className="page-subtitle">Visual workflow builder for automated customer journeys.</p>
                </div>
            </header>

            <div className="content-wrapper glass-panel no-padding">
                <div className="std-tabs-container">
                    <button className={`std-tab-item ${activeTab === 'prospect' ? 'active' : ''}`} onClick={() => setActiveTab('prospect')}>
                        <User size={16} /> Prospect
                    </button>
                    <button className={`std-tab-item ${activeTab === 'client' ? 'active' : ''}`} onClick={() => setActiveTab('client')}>
                        <Check size={16} /> Client
                    </button>
                    <button className={`std-tab-item ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>
                        <Clock size={16} /> Reminders
                    </button>
                </div>

                <div className="tab-content no-padding" style={{ background: '#f9fafb', height: '100%', overflowY: 'auto' }}>
                    {activeTab === 'global' ? (
                        <div className="global-reminders-grid" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {activeList.map(item => (
                                <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {(item.trigger_name || '').includes('Birthday') ? <User size={20} /> : <Clock size={20} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{item.trigger_name || item.trigger}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {item.date ? (item.date === 'auto' ? 'Auto-detected' : (() => {
                                                    const [y, m, d] = item.date.split('-');
                                                    return `Date: ${d}-${m}-${y}`;
                                                })()) : 'Based on Contact Data'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badges for Client-Only and Mandatory */}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {item.client_only && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', fontWeight: 500, border: '1px solid #bfdbfe' }}>
                                                Clients Only
                                            </span>
                                        )}
                                        {item.mandatory && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', fontWeight: 500, border: '1px solid #fde68a' }}>
                                                Mandatory
                                            </span>
                                        )}
                                        {item.days_before && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7c3aed', fontWeight: 500, border: '1px solid #e9d5ff' }}>
                                                {item.days_before} days before
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        "{item.contentSms || item.content}"
                                    </div>
                                    <button
                                        className="secondary-btn"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        onClick={() => setEditingNode(item)}
                                    >
                                        <Edit2 size={16} /> Edit Message
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <WorkflowList
                                steps={activeList}
                                onEditNode={setEditingNode}
                                onDeleteNode={handleDeleteClick}
                                onAddStep={handleAddNode}
                            />
                        </>
                    )}
                </div>
            </div>

            {editingNode && (
                <EditNodeModal
                    node={editingNode}
                    onClose={() => setEditingNode(null)}
                    onSave={handleSaveNode}
                />
            )}

            {deletingNode && (
                <DeleteConfirmationModal
                    isOpen={!!deletingNode}
                    onClose={() => setDeletingNode(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
};

export default FollowUp;
