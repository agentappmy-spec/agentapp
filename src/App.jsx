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
import Settings from './pages/Settings';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
import ResetPassword from './pages/ResetPassword';
import SuperAdmin from './pages/SuperAdmin';
import { supabase } from './services/supabaseClient';
import { ROLES, APP_PLANS } from './utils/constants';
import './App.css';
import './MobileStyles.css';

// Auth Guard Helper
const AuthGuard = ({ children, requiredRole }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [profile, setProfile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Always fetch from database (no localStorage)
    const check = async () => {
      try {
        // Check Supabase session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          console.log('Session found, loading profile from database...');
          const user = sessionData.session.user;

          // Fetch from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          // Construct profile object
          const recoveredProfile = {
            name: profileData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agent',
            role: profileData?.role || 'free',
            planId: profileData?.plan_id || 'free',
            email: user.email,
            id: user.id
          };

          setProfile(recoveredProfile);
          setIsChecking(false);
          return;
        }
      } catch (error) {
        console.error("Auth Guard Error:", error);
      }

      setIsChecking(false);
    };
    check();
  }, []);

  if (isChecking) {
    return <div className="flex-center" style={{ height: '100vh', background: '#f8fafc' }}>Loading...</div>; // Or a Spinner
  }

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
  if (!userProfile) {
    return <div className="flex-center" style={{ height: '100vh', background: '#f8fafc' }}>Loading Profile...</div>;
  }

  return (
    <div className="app-container">
      <Sidebar userProfile={userProfile} checkPermission={checkPermission} setUserProfile={setUserProfile} />
      <MobileHeader userProfile={userProfile} />
      <main className="main-content">
        <div className="page-content">
          <Outlet context={context} />
        </div>
      </main>
      <BottomNav onAddContact={openAddModal} checkPermission={checkPermission} userProfile={userProfile} />
    </div>
  );
};

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
  const [landingConfig, setLandingConfig] = useState(() => {
    const saved = localStorage.getItem('agent_landing_config');
    return saved ? JSON.parse(saved) : null;
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
          console.log('Fetched contacts from DB:', data);

          // KEY FIX: Map snake_case (DB) to camelCase (App)
          const mapToAppFormat = (c) => ({
            ...c,
            email: c.email, // Explicitly include email
            dealValue: c.deal_value,
            nextAction: c.next_action,
          });

          // AUTO-MIGRATION: REMOVED to prevent dummy data
          // If DB is empty, it should stay empty for new users.

          const mappedContacts = data.map(mapToAppFormat);
          console.log('Mapped contacts:', mappedContacts);
          setContacts(mappedContacts);
        }
      } else {
        // Fallback to local storage if not logged in
        const saved = localStorage.getItem('agent_contacts');
        if (saved) setContacts(JSON.parse(saved));
      }
    };

    loadContacts();

    // Subscribe to changes (Realtime)
    const channel = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, (payload) => {
        loadContacts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('agent_products', JSON.stringify(availableProducts));
  }, [availableProducts]);

  useEffect(() => {
    localStorage.setItem('agent_tags', JSON.stringify(availableTags));
  }, [availableTags]);

  // --- SaaS Configuration ---
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase.from('plans').select('*').eq('is_active', true);
        if (data) {
          const mapped = data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price_monthly,
            contactLimit: p.contact_limit,
            monthlyMessageLimit: p.monthly_message_limit || 0,
            features: Array.isArray(p.features) ? p.features : []
          }));
          setPackages(mapped);
        }
      } catch (e) { console.error('Error loading plans:', e); }
    };
    fetchPlans();
  }, []);

  // Database is the ONLY source of truth for user profile
  // No localStorage to prevent cache conflicts with role/plan_id
  const [userProfile, setUserProfile] = useState(null);

  // Initialize integrations and userGoals BEFORE syncProfile useEffect
  const [integrations, setIntegrations] = useState({
    whatsapp: { enabled: true, apiKey: '', instanceId: '' },
    email: { enabled: false, apiKey: '', sender: 'noreply@agent.com' },
    sms: { enabled: false, apiKey: '', senderId: 'AGENCY' }
  });

  // --- KPI / Goals ---
  const [userGoals, setUserGoals] = useState({
    monthlyRevenue: 5000,
    monthlyCases: 5,
    mdrtGoal: 600000 // Standard MDRT figure approx
  });

  // Sync Profile & Config with DB on load
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data: dbProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (dbProfile && !error) {
            // 1. Sync User Profile
            // 1. Sync User Profile
            setUserProfile(prev => {
              // AUTO-CORRECT: If plan is PRO but role is FREE, force PRO
              const dbRole = dbProfile.role || APP_PLANS.FREE;
              const dbPlan = dbProfile.plan_id || APP_PLANS.FREE;
              const effectiveRole = (dbPlan === APP_PLANS.PRO && dbRole === APP_PLANS.FREE) ? ROLES.PRO : dbRole;

              // If we fixed the role, update DB immediately
              if (effectiveRole !== dbRole) {
                supabase.from('profiles').update({ role: effectiveRole }).eq('id', session.user.id).then();
              }

              const fresh = {
                ...prev,
                planId: dbPlan,
                role: effectiveRole,
                id: session.user.id,
                email: session.user.email,
                name: dbProfile.full_name || prev?.name || 'User',
                expiryDate: dbProfile.subscription_end_date,
                username: dbProfile.username || prev?.username,
                is_published: dbProfile.is_published || prev?.is_published || false,
                title: dbProfile.title || prev?.title || '',
                phone: dbProfile.phone || prev?.phone || '',
                agencyName: dbProfile.agency_name || prev?.agencyName || '',
                licenseNo: dbProfile.license_no || prev?.licenseNo || '',
                bio: dbProfile.bio || prev?.bio || '',
                photoUrl: dbProfile.photo_url || prev?.photoUrl || ''
              };
              if (
                prev?.planId !== fresh.planId ||
                prev?.role !== fresh.role ||
                prev?.expiryDate !== fresh.expiryDate ||
                prev?.username !== fresh.username ||
                prev?.is_published !== fresh.is_published ||
                prev?.title !== fresh.title ||
                prev?.phone !== fresh.phone ||
                prev?.agencyName !== fresh.agencyName ||
                prev?.licenseNo !== fresh.licenseNo ||
                prev?.bio !== fresh.bio ||
                prev?.photoUrl !== fresh.photoUrl
              ) {
                return fresh;
              }
              return prev;
            });

            // 2. Sync Configs (Products & Tags & Landing) if they exist in DB
            if (dbProfile.products && Array.isArray(dbProfile.products) && dbProfile.products.length > 0) {
              setAvailableProducts(dbProfile.products);
            }
            if (dbProfile.tags && Array.isArray(dbProfile.tags) && dbProfile.tags.length > 0) {
              setAvailableTags(dbProfile.tags);
            }
            if (dbProfile.landing_config) {
              setLandingConfig(dbProfile.landing_config);
            }
            if (dbProfile.integrations) {
              setIntegrations(dbProfile.integrations);
            }
          }
        }
      } catch (err) {
        console.error('Profile sync failed:', err);
      }
    };

    syncProfile();
  }, []);

  // REMOVED: No longer saving userProfile to localStorage
  // Database is the single source of truth

  // Persist Products to DB
  useEffect(() => {
    localStorage.setItem('agent_products', JSON.stringify(availableProducts));
    if (userProfile?.id) {
      supabase.from('profiles').update({ products: availableProducts }).eq('id', userProfile.id).then(({ error }) => {
        if (error) console.warn('Failed to save products to DB (column might be missing):', error.message);
      });
    }
  }, [availableProducts, userProfile?.id]);

  // Persist Tags to DB
  useEffect(() => {
    localStorage.setItem('agent_tags', JSON.stringify(availableTags));
    if (userProfile?.id) {
      supabase.from('profiles').update({ tags: availableTags }).eq('id', userProfile.id).then(({ error }) => {
        if (error) console.warn('Failed to save tags to DB (column might be missing):', error.message);
      });
    }
  }, [availableTags, userProfile?.id]);

  // Persist Landing Config to DB
  useEffect(() => {
    localStorage.setItem('agent_landing_config', JSON.stringify(landingConfig));
    if (userProfile?.id && landingConfig) {
      supabase.from('profiles').update({ landing_config: landingConfig }).eq('id', userProfile.id).then(({ error }) => {
        if (error) console.warn('Failed to save landing config to DB:', error.message);
      });
    }
  }, [landingConfig, userProfile?.id]);

  // Persist Integrations to DB
  useEffect(() => {
    if (userProfile?.id) {
      supabase.from('profiles').update({ integrations }).eq('id', userProfile.id).then(({ error }) => {
        if (error) console.warn('Failed to save integrations to DB:', error.message);
      });
    }
  }, [integrations, userProfile?.id]);

  // Persist Profile Details to DB (Name, Title, Agency, Phone, etc.)
  // IMPORTANT: We do NOT persist role or plan_id here - those are managed separately
  useEffect(() => {
    if (userProfile?.id) {
      const timeoutId = setTimeout(() => {
        const payload = {
          full_name: userProfile.name,
          username: userProfile.username,
          title: userProfile.title,
          phone: userProfile.phone,
          agency_name: userProfile.agencyName,
          license_no: userProfile.licenseNo,
          bio: userProfile.bio,
          photo_url: userProfile.photoUrl
          // NOTE: role and plan_id are intentionally excluded
          // They should only be updated via redemption code or admin actions
        };

        supabase.from('profiles').update(payload).eq('id', userProfile.id).then(({ error }) => {
          if (error) console.warn('Failed to save profile details to DB:', error.message);
        });
      }, 2000); // 2 second debounce to prevent excessive writes

      return () => clearTimeout(timeoutId);
    }
  }, [
    userProfile?.name,
    userProfile?.username,
    userProfile?.title,
    userProfile?.phone,
    userProfile?.agencyName,
    userProfile?.licenseNo,
    userProfile?.bio,
    userProfile?.photoUrl,
    userProfile?.id
    // NOTE: role and planId are intentionally excluded from dependencies
  ]);


  const [followUpSchedules, setFollowUpSchedules] = useState({
    prospect: [],
    client: [],
    global: []
  });

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
        email: contactData.email || null,
        role: contactData.role,
        status: contactData.status,
        tags: contactData.tags || [],
        products: contactData.products || [],
        deal_value: contactData.dealValue || 0,
        next_action: contactData.nextAction || '',
        occupation: contactData.occupation || '',
        birthday: contactData.birthday || null,
        subscription_date: contactData.subscriptionDate || null,
        additional_info: contactData.additionalInfo || null,
        smoking: contactData.smoking || null,
        auto_follow_up: contactData.autoFollowUp !== false, // Default to true
        joined_at: contactData.joinedAt || (editingContact ? undefined : new Date().toISOString()), // Set on create only
        user_id: user?.id
      };

      console.log('Saving contact with payload:', payload);

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
    if (userProfile?.role === 'super_admin') return true;
    if (packages.length === 0) return false;

    const myPlan = packages.find(p => p.id === (userProfile.planId || 'free')) || packages.find(p => p.id === 'free') || packages[0];

    if (!myPlan?.features) return false;

    // Case-insensitive match for all features
    const normalizedKey = featureKey.toLowerCase();
    return myPlan.features.some(f => {
      const feat = f.toLowerCase();
      // Exact match (case-insensitive) OR fuzzy match for known robust keys
      if (feat === normalizedKey) return true;

      // Legacy/Robust handling
      if (normalizedKey === 'landing_page' || normalizedKey === 'landing_page_view') {
        return feat.includes('landing page') || feat.includes('landing_page');
      }
      return false;
    });
  };

  const contextValue = {
    contacts,
    setContacts,
    availableProducts,
    setAvailableProducts,
    availableTags,
    setAvailableTags,
    landingConfig,
    setLandingConfig,
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

          {/* Public Landing (legacy - for backward compatibility) */}
          <Route path="/p/public" element={<PublicLanding />} />

          {/* Public Bio Link - @username or slug */}
          <Route path="/:username" element={<PublicLanding />} />

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
