import { BrowserRouter, Routes, Route, Outlet, Navigate, useOutletContext, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import BottomNav from './components/BottomNav';
import AddContactModal from './components/AddContactModal';
import Dashboard from './pages/Dashboard';
import Databases from './pages/Databases';
import FollowUp from './pages/FollowUp';
import LandingPage from './pages/LandingPage';
import PublicLanding from './pages/PublicLanding';
import LinkWhatsApp from './pages/LinkWhatsApp';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
// ... (existing imports)
import ResetPassword from './pages/ResetPassword';
import SuperAdmin from './pages/SuperAdmin';
import './App.css';
import './MobileStyles.css';

// Auth Guard Helper
const AuthGuard = ({ children, requiredRole }) => {
  const profile = JSON.parse(localStorage.getItem('agent_user_profile') || 'null');
  const location = useLocation();

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    // Redirect unauthorized access to home/dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

// Takaful-specific data structure
const INITIAL_DATA = [];

const AppLayout = ({ context, userProfile, openAddModal, checkPermission, setUserProfile }) => {
  return (
    <div className="app-container">
      <Sidebar userProfile={userProfile} checkPermission={checkPermission} setUserProfile={setUserProfile} />
      <MobileHeader userProfile={userProfile} />
      <main className="main-content">
        <div className="page-content">
          <Outlet context={context} />
        </div>
      </main>
      <BottomNav onAddContact={openAddModal} checkPermission={checkPermission} />
    </div>
  );
};

import { supabase } from './services/supabaseClient';

// ... (existing imports)

function App() {
  const [contacts, setContacts] = useState([]); // Initialize empty for Supabase
  const [availableProducts, setAvailableProducts] = useState(() => {
    const saved = localStorage.getItem('agent_products');
    return saved ? JSON.parse(saved) : ['Hibah', 'Medical Card'];
  });
  const [availableTags, setAvailableTags] = useState(() => {
    const saved = localStorage.getItem('agent_tags');
    return saved ? JSON.parse(saved) : ['Referral', 'VIP', 'Good Paymaster', 'Late Payer', 'Low Budget', 'AgentApp Leads'];
  });

  // Fetch Contacts from Supabase
  useEffect(() => {
    const loadContacts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching contacts:', error);
        } else if (data) {
          setContacts(data);
        }
      } else {
        // Fallback to local storage if not logged in (or clear it)
        const saved = localStorage.getItem('agent_contacts');
        if (saved) setContacts(JSON.parse(saved));
      }
    };

    loadContacts();

    // Subscribe to changes (Realtime)
    const channel = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, (payload) => {
        // Simple reload or manual merge. Reload is safer for consistency.
        loadContacts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ... (products/tags effects remain)

  // ... (packages state remains)

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('agent_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // ... (useEffect for userProfile remains)

  // ... (integrations state remains)

  // ... (userGoals remains)
  // ... (followUpSchedules remains)

  // Global Add/Edit Contact Logic
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const openAddModal = () => {
    if (userProfile && userProfile.role !== 'super_admin') {
      const myPlan = packages.find(p => p.id === (userProfile.planId || 'free')) || packages[0];
      if (contacts.length >= myPlan.contactLimit) {
        alert(`You have reached the limit of ${myPlan.contactLimit} contacts for the ${myPlan.name} plan. Please upgrade to Pro.`);
        return;
      }
    }

    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (contactData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      // Prepare data for Supabase (map fields if necessary)
      // Ensure arrays are compatible
      const payload = {
        name: contactData.name,
        phone: contactData.phone,
        role: contactData.role,
        status: contactData.status,
        tags: contactData.tags || [],
        products: contactData.products || [],
        deal_value: contactData.dealValue || 0,
        next_action: contactData.nextAction || '',
        occupation: contactData.occupation || '',
        user_id: user?.id
      };

      if (editingContact) {
        // Update
        const { data, error } = await supabase
          .from('contacts')
          .update(payload)
          .eq('id', editingContact.id)
          .select();

        if (error) throw error;

        // Optimistic update
        setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, ...contactData, ...data[0] } : c));
      } else {
        // Insert
        const { data, error } = await supabase
          .from('contacts')
          .insert([payload])
          .select();

        if (error) throw error;

        if (data) {
          // Use the returned data which includes the real ID
          // Map back snake_case to camelCase for UI if needed, but we try to keep consistent
          const newContact = {
            ...contactData,
            id: data[0].id,
            dealValue: data[0].deal_value, // map back
            nextAction: data[0].next_action
          };
          setContacts([newContact, ...contacts]);
        }
      }
    } catch (err) {
      console.error('Error saving contact:', err);
      // Fallback to local state if offline (Demo mode)
      if (editingContact) {
        setContacts(contacts.map(c => c.id === editingContact.id ? { ...contactData, id: editingContact.id } : c));
      } else {
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        setContacts([{ ...contactData, id: newId }, ...contacts]);
      }
    }
  };

  // --- Check Permission Helper ---
  const checkPermission = (featureKey) => {
    if (userProfile.role === 'super_admin') return true;
    const myPlan = packages.find(p => p.id === (userProfile.planId || 'free')) || packages[0];
    return myPlan.features.includes(featureKey);
  };

  const contextValue = {
    contacts,
    setContacts,
    availableProducts,
    setAvailableProducts,
    availableTags,
    setAvailableTags,
    userProfile,
    setUserProfile,
    integrations,
    setIntegrations,
    followUpSchedules,
    setFollowUpSchedules,
    openAddModal,
    setEditingContact,
    setIsContactModalOpen,
    packages,       // Added
    setPackages,    // Added
    checkPermission, // Added
    userGoals,
    setUserGoals
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* ... existing Router content ... */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Public Landing (if kept separate) */}
          <Route path="/p/public" element={<PublicLanding />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <AppLayout
                  context={contextValue}
                  userProfile={userProfile}
                  openAddModal={openAddModal}
                  checkPermission={checkPermission}
                  setUserProfile={setUserProfile}
                />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="databases" element={<Databases />} />
            <Route path="contacts" element={<Databases />} />
            <Route path="follow-up" element={<FollowUp />} />
            <Route path="landing-page" element={<LandingPage />} />
            <Route path="link-whatsapp" element={<LinkWhatsApp />} />

            {/* Super Admin Route */}
            <Route
              path="super-admin"
              element={
                <AuthGuard requiredRole="super_admin">
                  <SuperAdmin />
                </AuthGuard>
              }
            />

            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div className="flex-center" style={{ height: '100%' }}>Page Not Found</div>} />
          </Route>
        </Routes>

        {/* ... Modal remains ... */}


        <AddContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSave={handleSaveContact}
          availableTags={availableTags}
          availableProducts={availableProducts}
          initialData={editingContact}
        />
      </BrowserRouter >
    </ErrorBoundary>
  );
}

export default App;
