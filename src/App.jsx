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
// ... (existing imports)
import ResetPassword from './pages/ResetPassword';
import SuperAdmin from './pages/SuperAdmin';
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
          // KEY FIX: Map snake_case (DB) to camelCase (App)
          const mapToAppFormat = (c) => ({
            ...c,
            dealValue: c.deal_value,
            nextAction: c.next_action,
          });

          // AUTO-MIGRATION: If DB is empty but Local Storage has data, migrate it!
          if (data.length === 0) {
            const local = localStorage.getItem('agent_contacts');
            if (local) {
              const parsedLocal = JSON.parse(local);
              if (parsedLocal.length > 0) {
                console.log(`Starting migration of ${parsedLocal.length} contacts...`);
                // alert('Migrating your offline data to the cloud... Please wait.'); // Optional: Visual feedback

                const payload = parsedLocal.map(c => ({
                  user_id: session.user.id,
                  name: c.name,
                  phone: c.phone,
                  role: c.role,
                  status: c.status,
                  tags: c.tags || [],
                  products: c.products || [],
                  deal_value: c.dealValue || 0,
                  next_action: c.nextAction || '',
                  occupation: c.occupation || ''
                }));

                const { data: inserted, error: insertError } = await supabase
                  .from('contacts')
                  .insert(payload)
                  .select();

                if (!insertError && inserted) {
                  console.log('Migration successful:', inserted.length);
                  setContacts(inserted.map(mapToAppFormat));
                  return;
                } else {
                  console.error('Migration failed:', insertError);
                }
              }
            }
          }

          setContacts(data.map(mapToAppFormat));
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
              const dbRole = dbProfile.role || 'free';
              const dbPlan = dbProfile.plan_id || 'free';
              const effectiveRole = (dbPlan === 'pro' && dbRole === 'free') ? 'pro' : dbRole;

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

  const [followUpSchedules, setFollowUpSchedules] = useState({
    prospect: [
      {
        id: 'p1', day: 0, label: 'Instant', type: 'Unified',
        contentSms: 'Salam, hai. Ini mesej ringkas sebab nombor {name} baru direkodkan dalam sistem saya. Reply OK kalau terima.',
        contentWhatsapp: 'Salam {name} 👋. Hai! Nombor anda baru saja direkodkan dalam sistem AgentApp saya.\n\nKalau anda terima mesej ni, boleh reply "OK"? 😊',
        contentEmail: 'Salam {name},\n\nTerima kasih kerana berminat. Nombor anda telah selamat direkodkan dalam sistem kami.\n\nSila balas email ini jika anda menerimanya.\n\nTerima kasih!'
      },
      {
        id: 'p2', day: 1, label: 'Day 1', type: 'Unified',
        contentSms: 'Ramai orang rasa dia sihat sebab tak pernah masuk hospital. Tapi, kebanyakan kes sakit serius tu terjadi tanpa ia bagi warning dulu..',
        contentWhatsapp: 'Hai {name}, ramai orang rasa dia sihat sebab tak pernah masuk hospital 🏥.\n\nTapi kan, kebanyakan kes sakit serius tu terjadi tanpa bagi warning dulu.. Hati-hati ya! 💪',
        contentEmail: 'Salam {name},\n\nRamai yang beranggapan mereka sihat kerana tidak pernah dimasukkan ke hospital.\n\nNamun realitinya, kebanyakan penyakit serius menyerang tanpa amaran awal.\n\nSentiasa jaga diri!'
      },
      {
        id: 'p3', day: 2, label: 'Day 2', type: 'Unified',
        contentSms: '{name} pernah tahu tak, satu rawatan hospital untuk sakit kritikal boleh cecah puluhan ribu walaupun masuk tak lama?',
        contentWhatsapp: '{name}, pernah tahu tak? 🤔\n\nSatu rawatan hospital untuk sakit kritikal boleh cecah puluhan ribu (RM) walaupun masuk sekejap je. Kos perubatan makin naik sekarang 📈.',
        contentEmail: 'Salam {name},\n\nAdakah anda tahu bahawa kos rawatan untuk penyakit kritikal boleh mencecah puluhan ribu ringgit, walaupun tempoh rawatan yang singkat?\n\nKos perubatan semakin meningkat setiap tahun.'
      },
      {
        id: 'p4', day: 3, label: 'Day 3', type: 'Unified',
        contentSms: 'Ramai warded kat hospital tu bukan orang tua. Umur 20-an dan 40-an yang penuh, sebab sakit ni tak tunggu dah berumur.',
        contentWhatsapp: 'FYI, ramai yang warded kat hospital tu bukan orang tua je tau 👴👵.\n\nUmur 20-an dan 40-an pun ramai, sebab sakit ni tak tunggu kita tua. Jaga kesihatan! 🏃‍♂️',
        contentEmail: 'Hai {name},\n\nStatistik menunjukkan wad hospital kini dipenuhi bukan sahaja oleh warga emas, tetapi juga golongan muda 20-an hingga 40-an.\n\nPenyakit tidak menunggu usia lanjut untuk menyerang.'
      },
      {
        id: 'p5', day: 5, label: 'Day 5', type: 'Unified',
        contentSms: 'Dalam banyak kes yang saya jumpa, pesakit boleh fokus rawat diri. Yang paling tertekan sebenarnya ahli keluarga di rumah.',
        contentWhatsapp: 'Dalam banyak kes yang saya handle, pesakit biasanya fokus nak sihat je 🛌.\n\nTapi yang sebenarnya paling tertekan adalah ahli keluarga di rumah, memikirkan kos dan penjagaan 😓.',
        contentEmail: 'Salam {name},\n\nMelalui pengalaman saya, pesakit selalunya menumpukan perhatian kepada rawatan.\n\nNamun, tekanan sebenar sering dirasai oleh ahli keluarga yang perlu menanggung beban kewangan dan emosi.'
      },
      {
        id: 'p6', day: 7, label: 'Day 7', type: 'Unified',
        contentSms: 'Simpanan biasa selalunya cepat susut bila rawatan makin lama. Masa tu baru ramai sedar, duit kecemasan pun ada limit. Lama-lama habis la.',
        contentWhatsapp: 'Duit simpanan memang kita ada 💰, tapi selalunya cepat susut bila rawatan ambil masa lama.\n\nMasa tu baru ramai sedar, duit kecemasan pun ada limitnya. Lama-lama boleh habis.. 💸',
        contentEmail: 'Salam {name},\n\nSimpanan tunai kita seringkali cepat susut apabila digunakan untuk kos rawatan jangka panjang.\n\nRamai yang terlambat menyedari bahawa dana kecemasan mempunyai had dan boleh habis digunakan.'
      },
      {
        id: 'p7', day: 10, label: 'Day 10', type: 'Unified',
        contentSms: '{name} pernah nampak kes yang Family terpaksa post online menagih duit kepada netizan sebab kos rawatan terlalu besar untuk ditanggung sendiri?',
        contentWhatsapp: '{name}, mesti pernah nampak kan kat social media? 📱\n\nFamily terpaksa post online minta bantuan netizen sebab kos rawatan terlalu besar untuk ditanggung sendiri. Sedih kan? 😢',
        contentEmail: 'Hai {name},\n\nPernahkah anda melihat kes di media sosial di mana keluarga terpaksa memohon sumbangan orang ramai kerana kos rawatan yang terlalu tinggi?\n\nIni adalah situasi sukar yang kita mahu elakkan.'
      },
      {
        id: 'p8', day: 13, label: 'Day 13', type: 'Unified',
        contentSms: 'Kebanyakan orang tangguh nak ambil Takaful bukan sebab tak penting, tapi sebab “nanti dulu pun tak apa”. Cuma tu la, sakit ni yang tak boleh tunggu kita ready.',
        contentWhatsapp: 'Ramai tangguh ambil Takaful bukan sebab tak penting 🛡️.\n\nTapi sebab mindset "nanti dulu pun tak apa". Masalahnya, sakit ni tak tunggu kita ready tau.. 🚑',
        contentEmail: 'Salam {name},\n\nRamai yang menangguh untuk mengambil Takaful bukan kerana ia tidak penting, tetapi kerana sikap bertangguh.\n\nNamun, penyakit tidak akan menunggu sehingga kita bersedia.'
      },
      {
        id: 'p9', day: 16, label: 'Day 16', type: 'Unified',
        contentSms: 'Saya nak tanya dengan jujur. Kalau perkara tak dijangka terjadi kat {name} esok atau lusa, siapa yang paling sedih?',
        contentWhatsapp: 'Saya nak tanya jujur dengan {name} 👉👈.\n\nKalau (nauzubillah) perkara tak dijangka jadi kat {name} esok atau lusa, siapa agaknya orang yang paling sedih dan terkesan? 🤔',
        contentEmail: 'Salam {name},\n\nSatu soalan ikhlas dari saya.\n\nSekiranya perkara yang tidak diingini berlaku kepada anda dalam masa terdekat, siapakah yang akan paling terkesan dan bersedih?'
      },
      {
        id: 'p10', day: 18, label: 'Day 18', type: 'Unified',
        contentSms: '{name} jenis suka sedia awal atau jenis tunggu sakit dulu baru fikir Takaful?',
        contentWhatsapp: '{name} jenis yang mana? 🤷‍♂️\n\nJenis suka sedia payung sebelum hujan ☂️, atau jenis dah basah kuyup baru nak cari payung? Fikir-fikirkan ya 😉.',
        contentEmail: 'Hai {name},\n\nAdakah anda seorang yang  lebih suka bersedia awal (sedia payung sebelum hujan) atau menunggu sehingga musibah melanda baru memikirkan tentang perlindungan Takaful?\n\nSemoga kita sentiasa dilindungi.'
      },
    ],
    client: [
      {
        id: 'c1', day: 0, label: 'Instant', type: 'Unified',
        contentSms: 'Tahniah {name} sebab memilih saya sebagai Takaful Advisor anda. Ini mesej auto dari sistem AgentApp saya. Reply OK kalau dah baca ya.',
        contentWhatsapp: 'Tahniah {name}! 🎉 Terima kasih sebab memilih saya sebagai Takaful Advisor anda 🤝.\n\nIni mesej auto dari sistem saja. Kalau dah baca, boleh reply "OK" ya? 👍',
        contentEmail: 'Salam Tahniah {name}!\n\nTerima kasih kerana memberi kepercayaan kepada saya sebagai Penasihat Takaful anda.\n\nIni adalah pengesahan bahawa anda kini berada dalam senarai keutamaan saya.'
      },
      {
        id: 'c2', day: 5, label: 'Day 5', type: 'Unified',
        contentSms: 'Sekadar nak maklumkan, perlindungan {name} dah aktif seperti yang dibincangkan tempoh hari. Simpan nombor saya, senang rujuk kalau perlu nanti.',
        contentWhatsapp: 'Hi {name} 👋! Sekadar nak update, perlindungan Takaful anda dah AKTIF ✅ seperti kita bincang hari tu.\n\nSimpan nombor saya ni elok-elok ya, senang nanti kalau ada kecemasan terus call saya. 📞',
        contentEmail: 'Salam {name},\n\nIngin dimaklumkan bahawa polisi Takaful anda kini telah aktif sepenuhnya.\n\nSila simpan nombor saya untuk rujukan segera jika berlaku sebarang kecemasan.'
      },
      {
        id: 'c3', day: 15, label: 'Day 15', type: 'Unified',
        contentSms: 'Salam, Nanti kalau {name} ada masa, tag saya kat Social Media ye dengan gambar policy tu. hehe.',
        contentWhatsapp: 'Salam {name} 😁. Nanti kalau free, boleh la post gambar booklet policy tu kat IG/FB and tag saya sekali! hehe 🙏. Support member sikit!',
        contentEmail: 'Salam {name},\n\nJika anda berkesempatan, saya amat menghargai jika anda dapat kongsikan gambar polisi anda di media sosial dan tag saya.\n\nSokongan anda amat bermakna!'
      },
      {
        id: 'c4', day: 35, label: 'Day 35', type: 'Unified',
        contentSms: '{name} Kalau ada apa-apa nak tahu berkaitan hospital, claim atau manfaat, tak perlu google. Terus tanya saya, itu memang kerja saya.',
        contentWhatsapp: '{name}, kalau ada apa-apa tak faham pasal hospital, claim atau manfaat, JANGAN google tau! 🙅‍♂️.\n\nTerus tanya saya je. Memang kerja saya untuk explain kat client saya. 🤓',
        contentEmail: 'Hai {name},\n\nJika anda mempunyai sebarang pertanyaan mengenai hospital, tuntutan, atau manfaat polisi, sila hubungi saya terus.\n\nJangan peningkan kepala mencari di Google, biarkan saya bantu anda.'
      },
      {
        id: 'c5', day: 55, label: 'Day 55', type: 'Unified',
        contentSms: 'Salam, ramai tak tahu, bila masuk hospital nanti, ada cara untuk mudahkan urusan dari awal. Kalau satu hari nanti {name} perlukan info ni, saya boleh guide step by step.',
        contentWhatsapp: 'Salam! Ramai tak tahu, bila admit wad ni ada tips untuk mudahkan urusan GL dari awal 🏥.\n\nKalau satu hari nanti {name} perlukan info ni, roger je. Saya guide A to Z. ✨',
        contentEmail: 'Salam {name},\n\nRamai tidak mengetahui prosedur sebenar untuk memudahkan urusan kemasukan ke hospital.\n\nJika anda perlukan panduan ini di masa hadapan, saya bersedia membantu langkah demi langkah.'
      },
      {
        id: 'c6', day: 85, label: 'Day 85', type: 'Unified',
        contentSms: 'Salam, Maaf ganggu. ada ke family {name} yang {name} rasa perlu ada hibah?',
        contentWhatsapp: 'Salam {name}, maaf ganggu jap 🙏.\n\nSaja nak tanya, ada tak ahli keluarga {name} yang {name} rasa PERLU sangat ada Hibah Takaful macam {name}? 🤔',
        contentEmail: 'Salam {name},\n\nMaaf mengganggu masa anda. Saya ingin bertanya jika ada ahli keluarga anda yang mungkin memerlukan perlindungan Hibah buat masa ini?'
      },
      {
        id: 'c7', day: 115, label: 'Day 115', type: 'Unified',
        contentSms: 'Salam, Kebanyakan kes claim yang saya urus, client bersyukur sebab buat awal. Masa tu mereka cuma fokus sembuh, bukan fikir kos.',
        contentWhatsapp: 'Salam {name}. Kebanyakan kes claim yang saya urus, client semua bersyukur sangat sebab sign up awal 🙏.\n\nMasa sakit, mereka cuma fokus nak sembuh je, takyah pening fikir pasal bil hospital dah. 😌',
        contentEmail: 'Salam {name},\n\nBerdasarkan pengalaman saya menguruskan tuntutan, ramai pelanggan bersyukur kerana telah bersedia awal.\n\nIni membolehkan mereka menumpukan sepenuh perhatian kepada proses penyembuhan tanpa memikirkan beban kos.'
      },
      {
        id: 'c8', day: 155, label: 'Day 155', type: 'Unified',
        contentSms: 'Biasanya saya akan check in sekali-sekala macam ni. Bukan sebab ada apa-apa, cuma nak kekal berhubung. Semua ok kan?',
        contentWhatsapp: 'Just checking in! 👋 Saya memang akan selalu hello-hello client macam ni.\n\nBukan apa, nak pastikan kita keep in touch. Semua ok kan? Sihat? 😁',
        contentEmail: 'Hai {name},\n\nSaya sekadar ingin bertanya khabar. Saya sentiasa memastikan saya kekal berhubung dengan semua pelanggan saya.\n\nHarap semuanya baik-baik sahaja di sana.'
      },
      {
        id: 'c9', day: 205, label: 'Day 205', type: 'Unified',
        contentSms: 'Salam, {name} Kalau ada apa-apa nak share, atau nak tanya pasal Takaful, boleh reply mesej saya.',
        contentWhatsapp: 'Salam {name} 👋. Kalau ada apa-apa nak share, atau tetiba teringat soalan pasal Takaful, boleh terus reply mesej ni tau.\n\nSaya sentiasa ready nak bantu. 😊',
        contentEmail: 'Salam {name},\n\nJika anda mempunyai sebarang perkongsian atau pertanyaan mengenai Takaful, jangan segan untuk membalas email ini.\n\nPintu saya sentiasa terbuka.'
      },
      {
        id: 'c10', day: 245, label: 'Day 245', type: 'Unified',
        contentSms: 'Terima kasih sebab percayakan saya untuk urus perlindungan {name}. Amanah macam ni saya ambil serius.',
        contentWhatsapp: 'Terima kasih tau {name} sebab percayakan saya untuk urus perlindungan anda 🙏.\n\nAmanah ni bukan benda main-main, saya memang ambil serius. Doakan saya terus istiqamah ye! 🤲',
        contentEmail: 'Salam {name},\n\nSaya ingin mengucapkan terima kasih sekali lagi kerana mempercayai saya untuk menguruskan perlindungan anda.\n\nSaya memandang serius amanah yang diberikan ini.'
      },
      {
        id: 'c11', day: 295, label: 'Day 295', type: 'Unified',
        contentSms: 'Salam, kawan atau ahli keluarga akan tanya pasal takaful. Tak perlu jawab detail, suruh mereka contact saya saja boleh?',
        contentWhatsapp: 'Salam {name}. Selalunya kawan-kawan atau family akan mula tanya pasal takaful bila nampak kita ada agent best 😎.\n\nTak perlu pening jawab detail, pass je contact saya kat dorang. Boleh? 👌',
        contentEmail: 'Salam {name},\n\nJika ada rakan atau ahli keluarga yang bertanya mengenai Takaful, anda tidak perlu bersusah payah menerangkan secara terperinci.\n\nBenarkan saya membantu dengan meminta mereka menghubungi saya secara terus.'
      },
      {
        id: 'c12', day: 355, label: 'Day 355', type: 'Unified',
        contentSms: 'Salam, Harap {name} dan keluarga sentiasa sihat. Saya sentiasa doakan yang baik-baik untuk client saya.',
        contentWhatsapp: 'Salam {name} ✨. Harap {name} & family sentiasa sihat walafiat.\n\nSaya sentiasa doakan yang baik-baik untuk semua client saya. Take care! ❤️',
        contentEmail: 'Salam sejahtera {name},\n\nSaya berharap anda dan sekeluarga sentiasa berada dalam keadaan sihat.\n\nSaya sentiasa mendoakan kesejahteraan dan kebaikan untuk semua pelanggan saya.'
      },
      {
        id: 'c13', day: 395, label: 'Day 395', type: 'Unified',
        contentSms: '{name}, ramai client saya dapat melalui recommendation kawan / family. Biasanya sebab mereka nak urus dengan orang yang sama, senang bincang katanya. Kalau ada kawan nak sign up, boleh share nombor phone dia kat saya ye.',
        contentWhatsapp: '{name}, ramai client baru saya datang dari recommendation client sedia ada.\n\nKatanya senang bila urus dengan agent yang sama. Kalau ada kawan-kawan tengah survey, boleh share nombor dorang kat saya? 🙏',
        contentEmail: 'Salam {name},\n\nRamai pelanggan saya hadir melalui cadangan daripada rakan dan keluarga.\n\nJika ada kenalan anda yang berminat untuk mendaftar, boleh kongsikan nombor telefon mereka kepada saya untuk saya bantu.'
      },
      {
        id: 'c14', day: 445, label: 'Day 445', type: 'Unified',
        contentSms: 'Salam, Harap {name} dan keluarga sentiasa sihat. Saya sentiasa doakan yang baik-baik untuk client saya.',
        contentWhatsapp: 'Salam! Just dropping by to say Hi 👋.\n\nSemoga {name} dan family sentiasa murah rezeki dan sihat. Have a great week ahead! 🌈',
        contentEmail: 'Salam {name},\n\nHarap anda dan keluarga sentiasa sihat. Saya sentiasa mendoakan yang terbaik buat anda sekeluarga.'
      },
      {
        id: 'c15', day: 505, label: 'Day 505', type: 'Unified',
        contentSms: 'Salam, sekarang kes demam tengah banyak. Semoga {name} dan keluarga sentiasa dalam keadaan sihat.',
        contentWhatsapp: 'Salam {name}. Sekarang musim kes demam/virus berjangkit 😷.\n\nJaga diri dan family elok-elok ye. Semoga sentiasa dilindungi. 🛡️',
        contentEmail: 'Salam {name},\n\nMutakhir ini banyak kes demam dan virus dilaporkan.\n\nSemoga anda dan keluarga sentiasa berada dalam keadaan sihat dan terpelihara.'
      },
      {
        id: 'c16', day: 545, label: 'Day 545', type: 'Unified',
        contentSms: 'Salam, {name}. Jangan lupa update saya ye kalau ada apa-apa berlaku. Saya akan make sure akan uruskan dengan terbaik.',
        contentWhatsapp: 'Salam {name} 👋. Reminder mesra: Jangan lupa update saya terus kalau ada apa-apa berlaku (masuk wad dsb).\n\nSaya akan pastikan saya urus yang terbaik untuk {name}! 💪',
        contentEmail: 'Salam {name},\n\nPeringatan mesra, sila maklumkan kepada saya jika berlaku sebarang kejadian yang memerlukan tuntutan.\n\nSaya komited untuk menguruskan keperluan anda dengan sebaiknya.'
      },
      {
        id: 'c17', day: 595, label: 'Day 595', type: 'Unified',
        contentSms: 'Salam, {name}. Setakat ni semua ok ke dengan perlindungan {name}? Kalau ada apa-apa yang bermain di fikiran, boleh tanya saja.',
        contentWhatsapp: 'Salam {name}. Setakat ni semua OK dengan plan Takaful? 👍👎\n\nKalau ada apa-apa musykil atau nak tanya, roger je. Jangan simpan dalam hati! 😄',
        contentEmail: 'Salam {name},\n\nAdakah anda berpuas hati dengan perlindungan Takaful anda setakat ini?\n\nJika ada sebarang persoalan, sila ajukan kepada saya.'
      },
      {
        id: 'c18', day: 655, label: 'Day 655', type: 'Unified',
        contentSms: 'Salam, {name}. Apa-apa perubahan hidup nanti, contoh kawen, anak, sakit jangan segan beritahu saya. saya advise ikut situasi.',
        contentWhatsapp: 'Salam {name}. Life update sikit? 😁\n\nKalau ada perubahan besar (kahwin, dapat baby, tukar kerja), bagitahu saya tau. Boleh saya review balik protection ikut situation semasa. 🔄',
        contentEmail: 'Salam {name},\n\nSebarang perubahan hidup seperti perkahwinan, kelahiran cahaya mata, atau pertukaran kerjaya mungkin memerlukan semakan semula polisi.\n\nMaklumkan kepada saya untuk nasihat yang bersesuaian.'
      },
      {
        id: 'c19', day: 685, label: 'Day 685', type: 'Unified',
        contentSms: 'Salam, {name}. Kalau suatu hari nanti ada orang tanya, “agent mana ok?”, saya harap nama saya yang terlintas dalam kepala {name}.',
        contentWhatsapp: 'Salam {name} 👋.\n\nKalau satu hari nanti ada kawan tanya, "Eh, agent mana yang OK eh?", saya harap sangat nama saya yang {name} sebut dulu! hehe 😍.',
        contentEmail: 'Salam {name},\n\nJika pada masa akan datang ada yang bertanya mengenai ejen Takaful yang boleh dipercayai, saya berharap and sudi mengesyorkan perkhidmatan saya.'
      },
      {
        id: 'c20', day: 725, label: 'Day 725', type: 'Unified',
        contentSms: 'Salam, {name}. Jangan lupa share nombor saya kat family. In case apa-apa mereka boleh cari saya bagi pihak {name}.',
        contentWhatsapp: 'Salam {name} important message ⚠️.\n\nJangan lupa share nombor saya kat spouse/family terdekat. In case jadi apa-apa kat {name}, dorang tahu siapa nak cari untuk uruskan pampasan nanti. 👨‍👩‍👧‍👦',
        contentEmail: 'Salam {name},\n\nPenting: Sila kongsikan nombor saya kepada ahli keluarga terdekat anda.\n\nIni bagi memudahkan mereka menghubungi saya bagi pihak anda sekiranya berlaku sebarang kecemasan.'
      }
    ],
    global: [
      { id: 'g1', trigger: 'Birthday', type: 'Unified', clientOnly: true, contentSms: 'Happy Birthday {name}!', contentWhatsapp: 'Happy Birthday {name}! 🎂', contentEmail: 'Happy Birthday {name}!' },
      { id: 'g2', trigger: 'Chinese New Year', date: '2026-02-17', type: 'Unified', clientOnly: true, contentSms: 'Gong Xi Fa Cai {name}!', contentWhatsapp: 'Happy CNY {name}! 🍊', contentEmail: 'Happy Chinese New Year {name}!' },
      { id: 'g3', trigger: 'Ramadan', date: '2026-02-18', type: 'Unified', clientOnly: true, contentSms: 'Salam Ramadan {name}!', contentWhatsapp: 'Salam Ramadan {name} 🌙', contentEmail: 'Salam Ramadan Al-Mubarak {name}!' },
      { id: 'g4', trigger: 'Hari Raya Aidilfitri', date: '2026-03-20', type: 'Unified', clientOnly: true, contentSms: 'Selamat Hari Raya {name}!', contentWhatsapp: 'Selamat Hari Raya {name} ✨', contentEmail: 'Selamat Hari Raya Aidilfitri {name}!' },
      { id: 'g5', trigger: 'Deepavali', date: '2026-11-11', type: 'Unified', clientOnly: true, contentSms: 'Happy Deepavali {name}!', contentWhatsapp: 'Happy Deepavali {name}! 🪔', contentEmail: 'Happy Deepavali {name}!' },
      { id: 'g6', trigger: 'Mother\'s Day', date: '2026-05-10', type: 'Unified', clientOnly: true, contentSms: 'Happy Mother\'s Day {name}!', contentWhatsapp: 'Happy Mother\'s Day {name}! 💐', contentEmail: 'Happy Mother\'s Day {name}!' },
      { id: 'g7', trigger: 'Father\'s Day', date: '2026-06-21', type: 'Unified', clientOnly: true, contentSms: 'Happy Father\'s Day {name}!', contentWhatsapp: 'Happy Father\'s Day {name}! 👔', contentEmail: 'Happy Father\'s Day {name}!' },
      { id: 'g8', trigger: 'Hari Merdeka', date: '2026-08-31', type: 'Unified', clientOnly: true, contentSms: 'Selamat Hari Merdeka {name}!', contentWhatsapp: 'Selamat Hari Merdeka {name}! 🇲🇾', contentEmail: 'Selamat Hari Merdeka {name}!' },
      { id: 'g9', trigger: 'Signup Anniversary', type: 'Unified', clientOnly: true, mandatory: true, contentSms: 'Happy {years} year anniversary with us, {name}!', contentWhatsapp: 'Happy {years} year anniversary {name}! 🎉 Thank you for your continued trust.', contentEmail: 'Happy {years} year anniversary {name}! We appreciate your loyalty.' },
      { id: 'g10', trigger: 'Renewal Reminder', type: 'Unified', clientOnly: true, mandatory: true, daysBefore: 7, contentSms: 'Hi {name}, your policy renewal is coming up on {renewalDate}. Please ensure payment is ready.', contentWhatsapp: 'Hi {name}, reminder that your policy renews on {renewalDate}. 📅 Please prepare your payment.', contentEmail: 'Dear {name},\n\nThis is a reminder that your policy will be renewed on {renewalDate}.\n\nPlease ensure your payment is ready.' }
    ]
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
    if (userProfile?.role === 'super_admin') return true;
    if (packages.length === 0) return false;

    // Normalize keys
    if (featureKey === 'landing_page') featureKey = 'landing_page_view';

    const myPlan = packages.find(p => p.id === (userProfile.planId || 'free')) || packages.find(p => p.id === 'free') || packages[0];
    return myPlan?.features?.includes(featureKey);
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
