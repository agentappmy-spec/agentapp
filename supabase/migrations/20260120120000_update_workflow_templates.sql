-- Migration: Update Global Workflow Templates
-- Description: Replaces all system default workflow steps (user_id IS NULL) with the new Prospect and Client templates provided by the user.

-- 1. clear existing global steps
DELETE FROM public.workflow_steps WHERE user_id IS NULL;

-- 2. Insert Prospect Steps
INSERT INTO public.workflow_steps (user_id, template_id, day, trigger_name, content_sms, content_email, subject, is_active)
VALUES
-- Message 1 (Day 0)
(NULL, 'prospect', 0, 'Instant Intro', 
 'Salam, hai. Ini mesej ringkas sebab nombor {name} baru direkodkan dalam sistem saya. Reply OK kalau terima.',
 'Assalamualaikum dan salam sejahtera {name},

Saya hantar email ringkas ini untuk maklumkan bahawa nombor telefon {name} baru sahaja direkodkan dalam sistem saya.

Untuk tujuan pengesahan, mohon reply email ini dengan perkataan **OK** ya.

Terima kasih dan saya hargai kerjasama {name}.

Salam hormat,
{agent_name}', 
 'Sila Buat Pengesahan', true),

-- Message 2 (Day 1)
(NULL, 'prospect', 1, 'Day 1 - Health Warning', 
 'Assalam, Ramai orang rasa dia sihat sebab tak pernah masuk hospital. Tapi, kebanyakan kes sakit serius tu terjadi tanpa ia bagi warning dulu..',
 'Assalam {name},

Ramai orang rasa diri mereka sihat sebab tak pernah masuk hospital. Tetapi realitinya, kebanyakan kes sakit serius berlaku tanpa sebarang tanda awal.

Sebab itu perancangan awal sangat penting walaupun kita rasa badan masih kuat dan sihat.

Sekadar perkongsian ringkas untuk {name} fikirkan.

Salam,
{agent_name}', 
 'Ramai Orang Tak Sedar Perkara Ini', true),

-- Message 3 (Day 2) (1+1)
(NULL, 'prospect', 2, 'Day 2 - Cost Reality', 
 'Assalam {name}, tahu tak satu rawatan hospital untuk sakit kritikal boleh cecah puluhan ribu walaupun masuk wad tak lama?',
 'Assalam {name},

Ramai orang terkejut bila tahu kos rawatan hospital untuk penyakit kritikal boleh mencecah puluhan ribu ringgit walaupun tempoh masuk wad tidak lama.

Ini antara sebab kenapa ramai mula sedar kepentingan perlindungan lebih awal.

Sekadar berkongsi info bermanfaat untuk {name}.

Salam,
{agent_name}', 
 'Kos Rawatan Yang Ramai Terkejut', true),

-- Message 4 (Day 3) (2+1)
(NULL, 'prospect', 3, 'Day 3 - Young Patients', 
 'Salam {name}, Ramai warded kat hospital tu bukan orang tua. Umur 20-an dan 40-an yang penuh, sebab sakit ni tak tunggu dah berumur.',
 'Salam {name},
 
Trend sekarang menunjukkan semakin ramai pesakit hospital datang daripada golongan muda berumur 20-an hingga 40-an.

Sakit memang tidak tunggu kita berumur. Sebab itu persediaan awal sangat penting.

Harap perkongsian ini beri sedikit kesedaran kepada {name}.

Salam hormat,
{agent_name}', 
 'Sakit Tak Tunggu Umur', true),

-- Message 5 (Day 5) (3+2)
(NULL, 'prospect', 5, 'Day 5 - Family Burden', 
 'Assalam {name}, Dalam banyak kes yang saya jumpa, pesakit boleh fokus rawat diri. Yang paling tertekan sebenarnya ahli keluarga di rumah.',
 'Assalam {name},

Dalam banyak situasi sebenar, pesakit boleh fokus kepada rawatan.
Tetapi beban kewangan dan emosi biasanya ditanggung oleh ahli keluarga di rumah.

Inilah realiti yang ramai tak nampak dari awal.

Salam,
{agent_name}', 
 'Beban Sebenar Selalunya Ditanggung Keluarga', true),

-- Message 6 (Day 7) (5+2)
(NULL, 'prospect', 7, 'Day 7 - Savings Limit', 
 'Salam {name}, Simpanan biasa selalunya cepat susut bila rawatan makin lama. Masa tu baru ramai sedar, duit kecemasan pun ada limit. Lama-lama habis la.',
 'Salam {name},

Ramai sangka simpanan kecemasan sudah cukup.
Hakikatnya, bila rawatan berpanjangan, simpanan boleh habis lebih cepat daripada jangkaan.

Ini antara sebab perancangan kewangan dan perlindungan perlu dibuat lebih awal.

Salam hormat,
{agent_name}', 
 'Simpanan Pun Ada Limit', true),

-- Message 7 (Day 10) (7+3)
(NULL, 'prospect', 10, 'Day 10 - Crowdfunding', 
 'Assalam {name}, pernah nampak kes yang Family terpaksa post online menagih duit kepada netizan sebab kos rawatan terlalu besar untuk ditanggung sendiri?',
 'Assalam {name},

Sekarang semakin banyak kes keluarga terpaksa meminta sumbangan awam kerana kos rawatan terlalu besar untuk ditanggung sendiri.

Situasi ini bukan untuk menakutkan, tetapi untuk beri kesedaran tentang pentingnya persediaan awal.

Salam,
{agent_name}', 
 'Situasi Yang Kita Semua Tak Mahu Berlaku', true),

-- Message 8 (Day 13) (10+3)
(NULL, 'prospect', 13, 'Day 13 - Procrastination', 
 'Salam {name}, Kebanyakan orang tangguh nak ambil Takaful bukan sebab tak penting, tapi sebab “nanti dulu pun tak apa”. Cuma tu la, sakit ni yang tak boleh tunggu kita ready.',
 'Salam {name},

Kebanyakan orang tangguh perlindungan bukan kerana tak penting.
Tetapi kerana rasa masih ada masa.

Hakikatnya, sakit dan musibah tidak tunggu kita bersedia.

Salam hormat,
{agent_name}', 
 'Nanti Dulu Yang Selalu Jadi Masalah', true),

-- Message 9 (Day 16) (13+3)
(NULL, 'prospect', 16, 'Day 16 - Emotional Impact', 
 'Assalam {name}, Saya nak tanya dengan jujur. Kalau perkara tak dijangka terjadi kat {name} esok atau lusa, siapa yang paling sedih?',
 'Assalam {name},

Saya ingin tanya secara jujur.
Jika perkara tak dijangka berlaku pada {name}, siapa yang paling terkesan dari segi emosi dan kewangan?

Soalan ini bukan untuk menakutkan, cuma untuk bantu kita berfikir lebih jauh.

Salam,
{agent_name}', 
 'Soalan Jujur Untuk Difikirkan', true),

-- Message 10 (Day 18) (16+2)
(NULL, 'prospect', 18, 'Day 18 - Preparation Style', 
 'Salam {name}, {name} jenis suka get ready awal atau jenis tunggu sakit dulu baru fikir Takaful?',
 'Assalam {name},

Setiap orang ada gaya berbeza.
Ada yang suka bersedia awal, ada yang tunggu berlaku dulu baru bertindak.

Persoalannya, yang mana lebih selamat untuk jangka panjang?

Salam hormat,
{agent_name}', 
 'Persediaan Awal Atau Tunggu Nanti?', true);


-- 3. Insert Client Steps
INSERT INTO public.workflow_steps (user_id, template_id, day, trigger_name, content_sms, content_email, subject, is_active)
VALUES
-- Message 1 (Instant) (Day 0)
(NULL, 'client', 0, 'Client Welcome', 
 'Tahniah {name} sebab memilih saya sebagai Takaful Advisor anda. Ini mesej auto dari sistem AgentApp saya.',
 'Tahniah {name} 🎉
Terima kasih sebab memilih saya sebagai Takaful Advisor anda.
Ini mesej auto dari sistem AgentApp saya.
Reply **OK** untuk pengesahan ya.',
 'Pengesahan Akaun Client', true),

-- Message 2 (Day 5)
(NULL, 'client', 5, 'Policy Active', 
 'Sekadar maklumkan, perlindungan {name} dah aktif seperti dibincangkan tempoh hari. Dah SAVE nombor saya kan?.',
 'Hai {name},
Sekadar maklumkan perlindungan {name} dah aktif seperti dibincangkan sebelum ni.
Dah SAVE nombor saya kan?, senang rujuk nanti 🙂',
 'Perlindungan Anda Telah Aktif', true),

-- Message 3 (Day 15) (5+10)
(NULL, 'client', 15, 'Small Favour', 
 'Salam, nanti kalau {name} ada masa, tag saya kat social media dengan gambar policy tu ya.',
 'Salam {name},
Kalau ada masa nanti, boleh tag saya kat social media dengan gambar policy tu ya 😄
Terima kasih support.',
 'Sokongan Kecil Dari Anda', true),

-- Message 4 (Day 35) (15+20)
(NULL, 'client', 35, 'Direct Reference', 
 '{name} kalau ada apa-apa pasal hospital, claim atau manfaat, terus tanya saya ya.',
 '{name},
Kalau ada apa-apa berkaitan hospital, claim atau manfaat, tak perlu google.
Terus tanya saya ya. Itu memang kerja saya 😊',
 'Terus Rujuk Saya Jika Perlu', true),

-- Message 5 (Day 55) (35+20)
(NULL, 'client', 55, 'Hospital Guide', 
 'Salam, ada cara untuk mudahkan urusan hospital dari awal. Kalau perlu nanti, saya boleh guide.',
 'Salam {name},
Sebenarnya ada cara untuk mudahkan urusan hospital dari awal.
Kalau satu hari nanti {name} perlukan, saya boleh guide step by step.',
 'Panduan Urusan Hospital', true),

-- Message 6 (Day 85) (55+30)
(NULL, 'client', 85, 'Family Hibah', 
 'Salam, ada ke family {name} yang {name} rasa perlu ada hibah?',
 'Salam {name},
Saya nak tanya sikit ya.
Ada ke ahli keluarga {name} yang {name} rasa patut ada hibah?',
 'Soalan Ringkas Tentang Family', true),

-- Message 7 (Day 115) (85+30)
(NULL, 'client', 115, 'Claim Gratitude', 
 'Salam, kebanyakan client bersyukur sebab buat awal. Masa tu mereka fokus sembuh, bukan kos.',
 'Salam {name},
Kebanyakan kes claim yang saya urus, client bersyukur sebab buat awal.
Masa tu mereka boleh fokus sembuh, bukan fikir kos.',
 'Kelebihan Buat Awal', true),

-- Message 8 (Day 155) (115+40)
(NULL, 'client', 155, 'Check In', 
 'Hai, sekadar check in. Semua ok setakat ni?',
 'Hai {name},
Saya check in sikit ya 🙂
Semua ok setakat ni?',
 'Sekadar Check In', true),

-- Message 9 (Day 205) (155+50)
(NULL, 'client', 205, 'Always Available', 
 'Salam, kalau ada apa-apa nak tanya pasal Takaful, boleh reply mesej ni.',
 'Salam {name},
Kalau ada apa-apa nak tanya atau nak share pasal Takaful, boleh reply mesej ni ya.',
 'Saya Sentiasa Sedia Bantu', true),

-- Message 10 (Day 245) (205+40)
(NULL, 'client', 245, 'Trust Appreciation', 
 'Terima kasih sebab percayakan saya untuk urus perlindungan {name}.',
 'Terima kasih {name} sebab percayakan saya untuk urus perlindungan {name}.
Amanah ni memang saya ambil serius 🙏',
 'Terima Kasih Atas Kepercayaan', true),

-- Message 11 (Day 295) (245+50)
(NULL, 'client', 295, 'Referral Info', 
 'Salam, kalau kawan atau family tanya pasal takaful, suruh contact saya ya.',
 'Salam {name},
Kalau kawan atau family tanya pasal takaful, tak perlu jawab panjang.
Suruh mereka contact saya saja boleh 🙂',
 'Jika Ada Kenalan Bertanya', true),

-- Message 12 (Day 355) (295+60)
(NULL, 'client', 355, 'Well Wishes', 
 'Salam, saya doakan {name} dan keluarga sentiasa sihat.',
 'Salam {name},
Saya doakan {name} dan keluarga sentiasa sihat dan dipermudahkan urusan 🤲',
 'Doa Untuk Anda', true),

-- Message 13 (Day 395) (355+40)
(NULL, 'client', 395, 'Referral Request', 
 '{name}, ramai client saya datang dari recommendation. Kalau ada kawan nak sign up, boleh share nombor dia.',
 '{name},
Ramai client saya datang melalui recommendation kawan dan family.
Kalau ada kawan nak sign up, boleh share nombor dia dengan saya ya.',
 'Recommendation Dari Client', true),

-- Message 14 (Day 445) (395+50)
(NULL, 'client', 445, 'Good Wishes 2', 
 'Salam, harap {name} dan family sentiasa sihat.',
 'Salam {name},
Harap {name} dan keluarga sentiasa sihat dan dalam keadaan baik 😊',
 'Salam & Doa', true),

-- Message 15 (Day 505) (445+60)
(NULL, 'client', 505, 'Health Check', 
 'Salam, sekarang kes demam tengah banyak. Jaga kesihatan ya.',
 'Salam {name},
Sekarang kes demam tengah banyak.
Semoga {name dan keluarga sentiasa sihat.',
 'Jaga Kesihatan', true),

-- Message 16 (Day 545) (505+40)
(NULL, 'client', 545, 'Life Update Request', 
 'Salam, jangan lupa update saya kalau ada apa-apa berlaku ya.',
 'Salam {name},
Jangan lupa update saya kalau ada apa-apa berlaku ya.
Saya akan uruskan sebaik mungkin.',
 'Jangan Segan Update Saya', true),

-- Message 17 (Day 595) (545+50)
(NULL, 'client', 595, 'Coverage Check', 
 'Salam, setakat ni semua ok ke dengan perlindungan {name}?',
 'Salam {name},
Setakat ni semua ok ke dengan perlindungan {name}?
Kalau ada soalan, boleh tanya ya.',
 'Check In Perlindungan', true),

-- Message 18 (Day 655) (595+60)
(NULL, 'client', 655, 'Life Changes', 
 'Salam, kalau ada perubahan hidup macam kahwin atau anak, beritahu saya ya.',
 'Salam {name},
Kalau ada perubahan hidup nanti macam kahwin, anak atau kesihatan, beritahu saya ya.
Saya advise ikut situasi.',
 'Update Perubahan Hidup', true),

-- Message 19 (Day 685) (655+30)
(NULL, 'client', 685, 'Agent Reputation', 
 'Salam, kalau orang tanya agent mana ok, saya harap nama saya yang {name} ingat.',
 'Salam {name},
Kalau suatu hari nanti ada orang tanya “agent mana ok?”, saya harap nama saya yang terlintas dulu 😄',
 'Harapan Kecil Dari Saya', true),

-- Message 20 (Day 725) (685+40)
(NULL, 'client', 725, 'Family Contact', 
 'Salam, jangan lupa share nombor saya kat family ya.',
 'Salam {name},
Jangan lupa share nombor saya kat family ya.
Kalau apa-apa jadi, senang mereka hubungi saya bagi pihak {name}.',
 'Kongsi Nombor Dengan Family', true);
