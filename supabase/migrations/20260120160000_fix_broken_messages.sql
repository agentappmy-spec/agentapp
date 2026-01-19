-- Migration: Fix All Messages (Prospect, Client, Reminders)
-- Purpose: 
-- 1. Wipe all system default templates (user_id IS NULL).
-- 2. Re-insert ALL templates with proper formatting for SMS, WhatsApp, and Email.
-- 3. Ensure WhatsApp content is explicitly populated with proper newlines and emojis.

-- ==========================================
-- 1. RESET DEFAULTS
-- ==========================================
DELETE FROM public.workflow_steps WHERE user_id IS NULL;

-- ==========================================
-- 2. PROSPECT WORKFLOW (10 Messages)
-- ==========================================
INSERT INTO public.workflow_steps (user_id, template_id, day, trigger_name, content_sms, content_whatsapp, content_email, subject, is_active)
VALUES
-- Message 1 (Day 0)
(NULL, 'prospect', 0, 'Instant Intro', 
 'Salam {name}, ini mesej ringkas sebab nombor anda baru direkodkan dalam sistem saya. Reply OK jika terima. TQ - {agent_name}',
 'Salam, hai {name}! 👋

Ini mesej ringkas sebab nombor {name} baru direkodkan dalam sistem saya.

Reply *OK* kalau terima ya. Terima kasih! 😊

- {agent_name}',
 'Assalamualaikum dan salam sejahtera {name},

Saya hantar email ringkas ini untuk maklumkan bahawa nombor telefon {name} baru sahaja direkodkan dalam sistem saya.

Untuk tujuan pengesahan, mohon reply email ini dengan perkataan **OK** ya.

Terima kasih dan saya hargai kerjasama {name}.

Salam hormat,
{agent_name}', 
 'Sila Buat Pengesahan', true),

-- Message 2 (Day 1)
(NULL, 'prospect', 1, 'Day 1 - Health Warning', 
 'Salam {name}. Ramai rasa sihat sbb tak pernah sakit. Tp penyakit serius selalu datang tanpa warning. Sekadar peringatan.',
 'Assalam {name},

Ramai orang rasa dia sihat sebab tak pernah masuk hospital. 🏥

Tapi, kebanyakan kes sakit serius tu terjadi tanpa ia bagi warning dulu.

Sekadar perkongsian ringkas untuk {name} fikirkan.

Salam,
{agent_name}',
 'Assalam {name},

Ramai orang rasa diri mereka sihat sebab tak pernah masuk hospital. Tetapi realitinya, kebanyakan kes sakit serius berlaku tanpa sebarang tanda awal.

Sebab itu perancangan awal sangat penting walaupun kita rasa badan masih kuat dan sihat.

Sekadar perkongsian ringkas untuk {name} fikirkan.

Salam,
{agent_name}', 
 'Ramai Orang Tak Sedar Perkara Ini', true),

-- Message 3 (Day 2)
(NULL, 'prospect', 2, 'Day 2 - Cost Reality', 
 'Tahu tak kos rawatan sakit kritikal boleh cecah puluhan ribu ringgit walau masuk wad sekejap? Kos makin meningkat.',
 'Assalam {name},

Tahu tak satu rawatan hospital untuk sakit kritikal boleh cecah puluhan ribu ringgit walaupun masuk wad tak lama? 💸

Ini antara sebab kenapa ramai mula sedar kepentingan perlindungan lebih awal.

Sekadar berkongsi info bermanfaat.

Salam,
{agent_name}',
 'Assalam {name},

Ramai orang terkejut bila tahu kos rawatan hospital untuk penyakit kritikal boleh mencecah puluhan ribu ringgit walaupun tempoh masuk wad tidak lama.

Ini antara sebab kenapa ramai mula sedar kepentingan perlindungan lebih awal.

Sekadar berkongsi info bermanfaat untuk {name}.

Salam,
{agent_name}', 
 'Kos Rawatan Yang Ramai Terkejut', true),

-- Message 4 (Day 3)
(NULL, 'prospect', 3, 'Day 3 - Young Patients', 
 'Salam {name}. Hospital bkn utk org tua je. Ramai muda umur 20-40an dah warded. Sakit tak tunggu tua.',
 'Salam {name},

Ramai warded kat hospital tu bukan orang tua. 
Umur 20-an dan 40-an yang penuh, sebab sakit ni tak tunggu dah berumur. 🏥

Sebab itu persediaan awal sangat penting.

Harap perkongsian ini beri sedikit kesedaran.

Salam hormat,
{agent_name}',
 'Salam {name},
 
Trend sekarang menunjukkan semakin ramai pesakit hospital datang daripada golongan muda berumur 20-an hingga 40-an.

Sakit memang tidak tunggu kita berumur. Sebab itu persediaan awal sangat penting.

Harap perkongsian ini beri sedikit kesedaran kepada {name}.

Salam hormat,
{agent_name}', 
 'Sakit Tak Tunggu Umur', true),

-- Message 5 (Day 5)
(NULL, 'prospect', 5, 'Day 5 - Family Burden', 
 'Salam {name}. Bila sakit, pesakit fokus rawat diri. Yg paling stress sebenarnya family yg nak cari duit rawatan.',
 'Assalam {name},

Dalam banyak kes yang saya jumpa, pesakit boleh fokus rawat diri. 😷

Yang paling tertekan sebenarnya ahli keluarga di rumah yang nak cari dana rawatan.

Inilah realiti yang ramai tak nampak dari awal.

Salam,
{agent_name}',
 'Assalam {name},

Dalam banyak situasi sebenar, pesakit boleh fokus kepada rawatan.
Tetapi beban kewangan dan emosi biasanya ditanggung oleh ahli keluarga di rumah.

Inilah realiti yang ramai tak nampak dari awal.

Salam,
{agent_name}', 
 'Beban Sebenar Selalunya Ditanggung Keluarga', true),

-- Message 6 (Day 7)
(NULL, 'prospect', 7, 'Day 7 - Savings Limit', 
 'Simpanan selalunya cepat susut bila sakit lama. Duit kecemasan pun ada limit. Persediaan takaful bantu lindungi simpanan.',
 'Salam {name},

Simpanan biasa selalunya cepat susut bila rawatan makin lama. 📉

Masa tu baru ramai sedar, duit kecemasan pun ada limit. Lama-lama habis la.

Ini sebab kenapa perlindungan perlu dibuat lebih awal.

Salam hormat,
{agent_name}',
 'Salam {name},

Ramai sangka simpanan kecemasan sudah cukup.
Hakikatnya, bila rawatan berpanjangan, simpanan boleh habis lebih cepat daripada jangkaan.

Ini antara sebab perancangan kewangan dan perlindungan perlu dibuat lebih awal.

Salam hormat,
{agent_name}', 
 'Simpanan Pun Ada Limit', true),

-- Message 7 (Day 10)
(NULL, 'prospect', 10, 'Day 10 - Crowdfunding', 
 'Pernah nampak family minta derma online utk kos rawatan? Situasi ni perit & kita tak nak ia jadi kat kita.',
 'Assalam {name},

Pernah nampak kes yang Family terpaksa post online menagih duit kepada netizen sebab kos rawatan terlalu besar untuk ditanggung sendiri? 😔

Situasi ini bukan untuk menakutkan, tetapi untuk beri kesedaran.

Salam,
{agent_name}',
 'Assalam {name},

Sekarang semakin banyak kes keluarga terpaksa meminta sumbangan awam kerana kos rawatan terlalu besar untuk ditanggung sendiri.

Situasi ini bukan untuk menakutkan, tetapi untuk beri kesedaran tentang pentingnya persediaan awal.

Salam,
{agent_name}', 
 'Situasi Yang Kita Semua Tak Mahu Berlaku', true),

-- Message 8 (Day 13)
(NULL, 'prospect', 13, 'Day 13 - Procrastination', 
 'Ramai tangguh ambil Takaful sbb rasa "nanti dulu". Tp sakit tak tunggu kita ready. Fikir-fikirkan.',
 'Salam {name},

Kebanyakan orang tangguh nak ambil Takaful bukan sebab tak penting, tapi sebab “nanti dulu pun tak apa”. ⏳

Cuma tu la, sakit ni yang tak boleh tunggu kita ready.

Salam hormat,
{agent_name}',
 'Salam {name},

Kebanyakan orang tangguh perlindungan bukan kerana tak penting.
Tetapi kerana rasa masih ada masa.

Hakikatnya, sakit dan musibah tidak tunggu kita bersedia.

Salam hormat,
{agent_name}', 
 'Nanti Dulu Yang Selalu Jadi Masalah', true),

-- Message 9 (Day 16)
(NULL, 'prospect', 16, 'Day 16 - Emotional Impact', 
 'Soalan jujur: Kalau perkara tak dijangka jadi esok, siapa yg paling susah hati & terkesan kewangan?',
 'Assalam {name},

Saya nak tanya dengan jujur.

Kalau perkara tak dijangka terjadi kat {name} esok atau lusa, siapa yang paling sedih & susah hati? 🤔

Soalan ini cuma untuk bantu kita berfikir lebih jauh.

Salam,
{agent_name}',
 'Assalam {name},

Saya ingin tanya secara jujur.
Jika perkara tak dijangka berlaku pada {name}, siapa yang paling terkesan dari segi emosi dan kewangan?

Soalan ini bukan untuk menakutkan, cuma untuk bantu kita berfikir lebih jauh.

Salam,
{agent_name}', 
 'Soalan Jujur Untuk Difikirkan', true),

-- Message 10 (Day 18)
(NULL, 'prospect', 18, 'Day 18 - Preparation Style', 
 '{name} jenis suka get ready awal atau tunggu sakit dulu? Mana satu lebih selamat utk masa depan?',
 'Salam {name},

{name} jenis suka get ready awal atau jenis tunggu sakit dulu baru fikir Takaful?

Persoalannya, yang mana lebih selamat untuk jangka panjang?

Salam hormat,
{agent_name}',
 'Assalam {name},

Setiap orang ada gaya berbeza.
Ada yang suka bersedia awal, ada yang tunggu berlaku dulu baru bertindak.

Persoalannya, yang mana lebih selamat untuk jangka panjang?

Salam hormat,
{agent_name}', 
 'Persediaan Awal Atau Tunggu Nanti?', true);


-- ==========================================
-- 3. CLIENT WORKFLOW (20 Messages)
-- ==========================================
INSERT INTO public.workflow_steps (user_id, template_id, day, trigger_name, content_sms, content_whatsapp, content_email, subject, is_active)
VALUES
-- Message 1 (Day 0)
(NULL, 'client', 0, 'Client Welcome', 
 'Tahniah {name} atas polisi baru anda! Terima kasih memilih saya. Reply OK utk pengesahan. TQ - {agent_name}',
 'Tahniah {name}! 🎉

Terima kasih sebab memilih saya sebagai Takaful Advisor anda.

Ini mesej auto dari sistem AgentApp saya.
Reply *OK* untuk pengesahan ya.

Terima kasih!',
 'Tahniah {name} 🎉
Terima kasih sebab memilih saya sebagai Takaful Advisor anda.
Ini mesej auto dari sistem AgentApp saya.
Reply **OK** untuk pengesahan ya.',
 'Pengesahan Akaun Client', true),

-- Message 2 (Day 5)
(NULL, 'client', 5, 'Policy Active', 
 'Hi {name}. Polisi anda dah aktif. Pastikan anda simpan nombor saya untuk rujukan kecemasan.',
 'Sekadar maklumkan, perlindungan {name} dah aktif seperti dibincangkan tempoh hari. ✅

Dah SAVE nombor saya kan?
Senang nak refer nanti.',
 'Hai {name},
Sekadar maklumkan perlindungan {name} dah aktif seperti dibincangkan sebelum ni.
Dah SAVE nombor saya kan?, senang rujuk nanti 🙂',
 'Perlindungan Anda Telah Aktif', true),

-- Message 3 (Day 15)
(NULL, 'client', 15, 'Small Favour', 
 'Salam {name}. Kalau free, nanti tag saya kat social media dgn buku polisi tu ye. TQ support!',
 'Salam {name},

Nanti kalau {name} ada masa, tag saya kat social media dengan gambar policy tu ya. 📸

Terima kasih support!',
 'Salam {name},
Kalau ada masa nanti, boleh tag saya kat social media dengan gambar policy tu ya 😄
Terima kasih support.',
 'Sokongan Kecil Dari Anda', true),

-- Message 4 (Day 35)
(NULL, 'client', 35, 'Direct Reference', 
 'Kalau ada apa2 pasal hospital atau claim, terus tanya sy. Tak perlu google. Itu kerja sy.',
 '{name}, kalau ada apa-apa pasal hospital, claim atau manfaat, terus tanya saya ya. 🏥

Tak perlu pening-pening google. Itu memang kerja saya.',
 '{name},
Kalau ada apa-apa berkaitan hospital, claim atau manfaat, tak perlu google.
Terus tanya saya ya. Itu memang kerja saya 😊',
 'Terus Rujuk Saya Jika Perlu', true),

-- Message 5 (Day 55)
(NULL, 'client', 55, 'Hospital Guide', 
 'Ada cara mudah urus kemasukan hospital. Kalau perlu nanti, sy boleh guide step-by-step.',
 'Salam, ada cara untuk mudahkan urusan hospital dari awal. 🏥

Kalau perlu nanti, saya boleh guide step by step. Jangan risau.',
 'Salam {name},
Sebenarnya ada cara untuk mudahkan urusan hospital dari awal.
Kalau satu hari nanti {name} perlukan, saya boleh guide step by step.',
 'Panduan Urusan Hospital', true),

-- Message 6 (Day 85)
(NULL, 'client', 85, 'Family Hibah', 
 'Salam. Nak tanya, ada family member {name} yg perlukan hibah? Boleh sy bantu check kan.',
 'Salam {name},

Saya nak tanya sikit ya.

Ada ke ahli keluarga {name} yang {name} rasa perlu ada hibah? 👨‍👩‍👧‍👦',
 'Salam {name},
Saya nak tanya sikit ya.
Ada ke ahli keluarga {name} yang {name} rasa patut ada hibah?',
 'Soalan Ringkas Tentang Family', true),

-- Message 7 (Day 115)
(NULL, 'client', 115, 'Claim Gratitude', 
 'Kebanyakan client syukur buat takaful awal. Masa sakit, boleh fokus sembuh, tak fikir kos.',
 'Salam {name},

Kebanyakan client bersyukur sebab buat awal. 🙏

Masa tu mereka boleh fokus sembuh, bukan fikir kos rawatan.',
 'Salam {name},
Kebanyakan kes claim yang saya urus, client bersyukur sebab buat awal.
Masa tu mereka boleh fokus sembuh, bukan fikir kos.',
 'Kelebihan Buat Awal', true),

-- Message 8 (Day 155)
(NULL, 'client', 155, 'Check In', 
 'Hi {name}. Sekadar check-in. Harap semua ok setakat ni. Kalau ada soalan bgtau ye.',
 'Hai, sekadar check in. Semua ok setakat ni? 👋',
 'Hai {name},
Saya check in sikit ya 🙂
Semua ok setakat ni?',
 'Sekadar Check In', true),

-- Message 9 (Day 205)
(NULL, 'client', 205, 'Always Available', 
 'Salam. Kalau ada apa2 nak tanya atau share pasal Takaful, boleh reply msj ni.',
 'Salam, kalau ada apa-apa nak tanya pasal Takaful, boleh reply mesej ni. 💬',
 'Salam {name},
Kalau ada apa-apa nak tanya atau nak share pasal Takaful, boleh reply mesej ni ya.',
 'Saya Sentiasa Sedia Bantu', true),

-- Message 10 (Day 245)
(NULL, 'client', 245, 'Trust Appreciation', 
 'Terima kasih sbb percayakan sy urus perlindungan {name}. Sy hargai amanah ni.',
 'Terima kasih sebab percayakan saya untuk urus perlindungan {name}. 🤝

Amanah ni saya ambil serius.',
 'Terima kasih {name} sebab percayakan saya untuk urus perlindungan {name}.
Amanah ni memang saya ambil serius 🙏',
 'Terima Kasih Atas Kepercayaan', true),

-- Message 11 (Day 295)
(NULL, 'client', 295, 'Referral Info', 
 'Kalau kawan/family tanya pasal takaful, minta mereka contact sy terus. Senang sy bantu.',
 'Salam, kalau kawan atau family tanya pasal takaful, suruh contact saya ya. 📞',
 'Salam {name},
Kalau kawan atau family tanya pasal takaful, tak perlu jawab panjang.
Suruh mereka contact saya saja boleh 🙂',
 'Jika Ada Kenalan Bertanya', true),

-- Message 12 (Day 355)
(NULL, 'client', 355, 'Well Wishes', 
 'Salam. Sy doakan {name} sekeluarga sentiasa sihat dan dipermudahkan urusan.',
 'Salam, saya doakan {name} dan keluarga sentiasa sihat. 🤲',
 'Salam {name},
Saya doakan {name} dan keluarga sentiasa sihat dan dipermudahkan urusan 🤲',
 'Doa Untuk Anda', true),

-- Message 13 (Day 395)
(NULL, 'client', 395, 'Referral Request', 
 'Ramai client dtg dari recommendation. Kalau ada kawan nak sign up, boleh share nombor dia.',
 '{name}, ramai client saya datang dari recommendation. 

Kalau ada kawan nak sign up, boleh share nombor dia ya. 🤝',
 '{name},
Ramai client saya datang melalui recommendation kawan dan family.
Kalau ada kawan nak sign up, boleh share nombor dia dengan saya ya.',
 'Recommendation Dari Client', true),

-- Message 14 (Day 445)
(NULL, 'client', 445, 'Good Wishes 2', 
 'Salam. Harap {name} & family sentiasa sihat dan ceria.',
 'Salam, harap {name} dan family sentiasa sihat. 😊',
 'Salam {name},
Harap {name} dan keluarga sentiasa sihat dan dalam keadaan baik 😊',
 'Salam & Doa', true),

-- Message 15 (Day 505)
(NULL, 'client', 505, 'Health Check', 
 'Salam. Skrg musim demam. Jaga kesihatan {name} & family ye.',
 'Salam {name}, sekarang kes demam tengah banyak. 🌡️

Jaga kesihatan ya.',
 'Salam {name},
Sekarang kes demam tengah banyak.
Semoga {name} dan keluarga sentiasa sihat.',
 'Jaga Kesihatan', true),

-- Message 16 (Day 545)
(NULL, 'client', 545, 'Life Update Request', 
 'Jgn lupa update sy kalau ada perubahan info peribadi/kesihatan. Sy uruskan.',
 'Salam, jangan lupa update saya kalau ada apa-apa berlaku ya. 📝',
 'Salam {name},
Jangan lupa update saya kalau ada apa-apa berlaku ya.
Saya akan uruskan sebaik mungkin.',
 'Jangan Segan Update Saya', true),

-- Message 17 (Day 595)
(NULL, 'client', 595, 'Coverage Check', 
 'Salam. Setakat ni semua ok ke dgn perlindungan {name}? Ada soalan boleh tanya.',
 'Salam, setakat ni semua ok ke dengan perlindungan {name}? 👍',
 'Salam {name},
Setakat ni semua ok ke dengan perlindungan {name}?
Kalau ada soalan, boleh tanya ya.',
 'Check In Perlindungan', true),

-- Message 18 (Day 655)
(NULL, 'client', 655, 'Life Changes', 
 'Kalau ada perubahan hidup (kahwin/anak), bgtau sy. Polisi mungkin perlu update.',
 'Salam, kalau ada perubahan hidup macam kahwin atau anak, beritahu saya ya. 👶💍',
 'Salam {name},
Kalau ada perubahan hidup nanti macam kahwin, anak atau kesihatan, beritahu saya ya.
Saya advise ikut situasi.',
 'Update Perubahan Hidup', true),

-- Message 19 (Day 685)
(NULL, 'client', 685, 'Agent Reputation', 
 'Kalau org tanya agent mana ok, harap nama sy yg {name} ingat. TQ support!',
 'Salam, kalau orang tanya agent mana ok, saya harap nama saya yang {name} ingat. 😄',
 'Salam {name},
Kalau suatu hari nanti ada orang tanya “agent mana ok?”, saya harap nama saya yang terlintas dulu 😄',
 'Harapan Kecil Dari Saya', true),

-- Message 20 (Day 725)
(NULL, 'client', 725, 'Family Contact', 
 'Share nombor sy pada family. Kalau jadi apa2 pd {name}, senang mereka cari sy.',
 'Salam {name}, jangan lupa share nombor saya kat family ya. 👨‍👩‍👧‍👦',
 'Salam {name},
Jangan lupa share nombor saya kat family ya.
Kalau apa-apa jadi, senang mereka hubungi saya bagi pihak {name}.',
 'Kongsi Nombor Dengan Family', true);


-- ==========================================
-- 4. GLOBAL REMINDERS WORKFLOW (9 Messages)
-- ==========================================
INSERT INTO public.workflow_steps (user_id, template_id, day, date, trigger_name, content_sms, content_whatsapp, content_email, subject, is_active)
VALUES
-- 1. Selamat Tahun Baru
(NULL, 'global', NULL, '2026-01-01', 'Selamat Tahun Baru', 
 'Salam {name}, Selamat Tahun Baru 2026! Semoga tahun ini membawa lebih kejayaan.',
 'Salam {name}, Selamat Tahun Baru 2026! 🎆
 
Semoga tahun ini membawa lebih kejayaan dan kebahagiaan.',
 'Salam {name},

Selamat Tahun Baru 2026! 🎆

Saya doakan agar tahun baru ini membuka lebih banyak pintu rezeki, kejayaan dan kebahagiaan untuk {name} sekeluarga.

Terima kasih kerana terus bersama saya.

Salam hormat,
{agent_name}', 
 'Selamat Tahun Baru 2026!', true),

-- 2. Tahun Baru Cina
(NULL, 'global', NULL, '2026-02-17', 'Tahun Baru Cina', 
 'Salam {name}, Gong Xi Fa Cai! Semoga tahun ini membawa kemakmuran.',
 'Salam {name}, Gong Xi Fa Cai! 🧧

Semoga tahun ini membawa kemakmuran dan kesihatan yang baik.',
 'Salam {name},

Gong Xi Fa Cai! 🧧

Sempena Tahun Baru Cina ini, saya ingin mengucapkan selamat menyambut perayaan yang penuh bermakna.

Semoga tahun ini membawa limpahan kemakmuran, kesihatan yang baik dan kegembiraan berpanjangan.

Salam hormat,
{agent_name}', 
 'Gong Xi Fa Cai!', true),

-- 3. Selamat Berpuasa
(NULL, 'global', NULL, '2026-02-18', 'Selamat Berpuasa', 
 'Salam {name}, Selamat menunaikan ibadah puasa. Moga Ramadan penuh berkat.',
 'Salam {name}, Selamat menunaikan ibadah puasa. 🌙

Semoga Ramadan kali ini penuh keberkatan.',
 'Salam {name},

Selamat menunaikan ibadah puasa Ramadhan Al-Mubarak. 🌙

Semoga Ramadan kali ini membawa seribu keberkatan, ketenangan dan keampunan buat {name} dan keluarga.

Salam ikhlas,
{agent_name}', 
 'Salam Ramadan Al-Mubarak', true),

-- 4. Hari Raya Aidilfitri
(NULL, 'global', NULL, '2026-03-20', 'Hari Raya Aidilfitri', 
 'Salam {name}, Selamat Hari Raya Aidilfitri! Maaf Zahir & Batin.',
 'Salam {name}, Selamat Hari Raya Aidilfitri! ✨

Maaf Zahir & Batin.',
 'Salam {name},

Selamat Hari Raya Aidilfitri! ✨
Maaf Zahir & Batin.

Semoga syawal ini mengeratkan lagi silaturrahim kita. Hati-hati di jalan raya jika pulang ke kampung.

Salam hormat,
{agent_name}', 
 'Selamat Hari Raya Aidilfitri', true),

-- 5. Hari Ibu
(NULL, 'global', NULL, '2026-05-10', 'Hari Ibu', 
 'Salam {name}, Selamat Hari Ibu! Terima kasih atas segala pengorbanan.',
 'Salam {name}, Selamat Hari Ibu! 💐

Terima kasih atas segala pengorbanan seorang ibu.',
 'Salam {name},

Selamat Hari Ibu! 💐

Hari ini kita meraikan insan yang paling istimewa dalam hidup kita.
Semoga {name} (atau ibu tersayang) sentiasa di bawah lindungan-Nya.

Salam,
{agent_name}', 
 'Selamat Hari Ibu', true),

-- 6. Hari Raya Aidiladha
(NULL, 'global', NULL, '2026-05-27', 'Hari Raya Aidiladha', 
 'Salam {name}, Selamat Hari Raya Aidiladha.',
 'Salam {name}, Selamat Hari Raya Aidiladha. 🌙',
 'Salam {name},

Selamat Hari Raya Aidiladha! 🌙

Semoga kita sentiasa mencontohi erti pengorbanan dan keikhlasan yang sebenar.

Salam,
{agent_name}', 
 'Salam Aidiladha', true),

-- 7. Hari Merdeka
(NULL, 'global', NULL, '2026-08-31', 'Hari Merdeka', 
 'Salam {name}, Selamat Hari Merdeka ke-69!',
 'Salam {name}, Selamat Hari Merdeka ke-69! 🇲🇾',
 'Salam {name},

Selamat Hari Kebangsaan yang ke-69! 🇲🇾

Semoga negara kita terus aman, makmur dan harmoni.

Salam patriotik,
{agent_name}', 
 'Selamat Hari Merdeka!', true),

-- 8. Deepavali
(NULL, 'global', NULL, '2026-11-08', 'Deepavali', 
 'Salam {name}, Happy Deepavali!',
 'Salam {name}, Happy Deepavali! 🪔',
 'Salam {name},

Happy Deepavali! 🪔

May this festival of lights bring you peace, prosperity, and happiness.
Have a wonderful celebration with your loved ones.

Warm regards,
{agent_name}', 
 'Happy Deepavali', true),

-- 9. Monthly Renewal (FIXED)
(NULL, 'global', NULL, NULL, 'Monthly Renewal', 
 'Salam {name}, polisi anda akan tamat tempoh tidak lama lagi. Abaikan mesej ini jika pembayaran telah berjaya. TQ - {agent_name}',
 'Salam {name}, peringatan mesra. 
 
Polisi anda akan tamat tempoh tidak lama lagi. 
Sila abaikan mesej ini jika pembayaran telah berjaya. 
 
Terima kasih. 
- {agent_name}',
 'Salam {name},

Polisi anda akan tamat tempoh tidak lama lagi.

Sila abaikan mesej ini jika pembayaran adalah telah berjaya.

Sekiranya ada sebarang pertanyaan, boleh hubungi saya.

Salam hormat,
{agent_name}', 
 'Peringatan: Polisi Takaful Anda', true);
