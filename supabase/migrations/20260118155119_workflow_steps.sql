-- Create workflow_steps table
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id text NOT NULL, -- 'prospect', 'client', 'global'
    day int,                   -- Trigger day (0, 1, 5, etc.) or null for dates
    date text,                 -- Specific date (YYYY-MM-DD) or 'auto'
    trigger_name text,         -- Name of the event (e.g. 'Birthday', 'Day 5')
    content_email text,
    content_sms text,
    content_whatsapp text,
    is_active boolean DEFAULT true,
    client_only boolean DEFAULT false,
    mandatory boolean DEFAULT false, -- For system critical messages
    days_before int,           -- For reminders like '7 days before renewal'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

-- Policies (Viewable by everyone for now to generate templates, editable by admins)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.workflow_steps;
CREATE POLICY "Enable read access for authenticated users" ON public.workflow_steps FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable write access for super admins" ON public.workflow_steps;
CREATE POLICY "Enable write access for super admins" ON public.workflow_steps FOR ALL TO authenticated USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
);

-- Add tracking columns to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_followup_day int DEFAULT -1;

-- Seed Data (Default Templates from App.jsx)

-- PROSPECTS
INSERT INTO public.workflow_steps (template_id, day, trigger_name, content_email, content_sms, content_whatsapp) VALUES
('prospect', 0, 'Day 0', 
 'Salam {name},\n\nTerima kasih kerana berminat. Saya sedia membantu memberikan penerangan ringkas mengenai pelan yang sesuai untuk anda.',
 'Salam {name}. Terima kasih kerana berminat. Reply OK untuk saya bantu selanjutnya.',
 'Salam {name} 👋. Terima kasih sebab berminat! Boleh saya bantu explain sikit pasal plan ni? Reply "OK" ya.'
),
('prospect', 1, 'Day 1',
 'Salam {name},\n\nTahukah anda bahawa ramai yang terlepas pandang kepentingan perlindungan awal?\n\nJangan tunggu sehingga terlambat.',
 'Salam. Ramai yang terlepas pandang pentingnya ambil plan awal. Jangan tunggu sakit baru nak cari.',
 'Salam {name}. Just nak share, ramai orang terlepas pandang pentingnya ambil protection awal 🛡️.\n\nJangan tunggu sakit baru nak cari, masa tu susah dah. 😅'
),
('prospect', 2, 'Day 2',
 'Salam {name},\n\nAdakah anda tahu bahawa kos rawatan untuk penyakit kritikal boleh mencecah puluhan ribu ringgit, walaupun tempoh rawatan yang singkat?\n\nKos perubatan semakin meningkat setiap tahun.',
 'Salam {name}. Kos rawatan sakit kritikal sekarang boleh cecah puluhan ribu ringgit. Kos makin naik setiap tahun.',
 'Salam {name}. Tahu tak kos rawatan sakit kritikal sekarang boleh cecah puluhan ribu ringgit? 💸\n\nWalaupun masuk wad kejap je. Kos makin naik setiap tahun.'
),
('prospect', 3, 'Day 3',
 'Hai {name},\n\nStatistik menunjukkan wad hospital kini dipenuhi bukan sahaja oleh warga emas, tetapi juga golongan muda 20-an hingga 40-an.\n\nPenyakit tidak menunggu usia lanjut untuk menyerang.',
 'Ramai warded kat hospital tu bukan orang tua. Umur 20-an dan 40-an yang penuh, sebab sakit ni tak tunggu dah berumur.',
 'FYI, ramai yang warded kat hospital tu bukan orang tua je tau 👴👵.\n\nUmur 20-an dan 40-an pun ramai, sebab sakit ni tak tunggu kita tua. Jaga kesihatan! 🏃‍♂️'
),
('prospect', 5, 'Day 5',
 'Salam {name},\n\nMelalui pengalaman saya, pesakit selalunya menumpukan perhatian kepada rawatan.\n\nNamun, tekanan sebenar sering dirasai oleh ahli keluarga yang perlu menanggung beban kewangan dan emosi.',
 'Dalam banyak kes yang saya jumpa, pesakit boleh fokus rawat diri. Yang paling tertekan sebenarnya ahli keluarga di rumah.',
 'Dalam banyak kes yang saya handle, pesakit biasanya fokus nak sihat je 🛌.\n\nTapi yang sebenarnya paling tertekan adalah ahli keluarga di rumah, memikirkan kos dan penjagaan 😓.'
),
('prospect', 7, 'Day 7',
 'Salam {name},\n\nSimpanan tunai kita seringkali cepat susut apabila digunakan untuk kos rawatan jangka panjang.\n\nRamai yang terlambat menyedari bahawa dana kecemasan mempunyai had dan boleh habis digunakan.',
 'Simpanan biasa selalunya cepat susut bila rawatan makin lama. Masa tu baru ramai sedar, duit kecemasan pun ada limit. Lama-lama habis la.',
 'Duit simpanan memang kita ada 💰, tapi selalunya cepat susut bila rawatan ambil masa lama.\n\nMasa tu baru ramai sedar, duit kecemasan pun ada limitnya. Lama-lama boleh habis.. 💸'
),
('prospect', 10, 'Day 10',
 'Hai {name},\n\nPernahkah anda melihat kes di media sosial di mana keluarga terpaksa memohon sumbangan orang ramai kerana kos rawatan yang terlalu tinggi?\n\nIni adalah situasi sukar yang kita mahu elakkan.',
 '{name} pernah nampak kes yang Family terpaksa post online menagih duit kepada netizan sebab kos rawatan terlalu besar untuk ditanggung sendiri?',
 '{name}, mesti pernah nampak kan kat social media? 📱\n\nFamily terpaksa post online minta bantuan netizen sebab kos rawatan terlalu besar untuk ditanggung sendiri. Sedih kan? 😢'
),
('prospect', 13, 'Day 13',
 'Salam {name},\n\nRamai yang menangguh untuk mengambil Takaful bukan kerana ia tidak penting, tetapi kerana sikap bertangguh.\n\nNamun, penyakit tidak akan menunggu sehingga kita bersedia.',
 'Kebanyakan orang tangguh nak ambil Takaful bukan sebab tak penting, tapi sebab “nanti dulu pun tak apa”. Cuma tu la, sakit ni yang tak boleh tunggu kita ready.',
 'Ramai tangguh ambil Takaful bukan sebab tak penting 🛡️.\n\nTapi sebab mindset "nanti dulu pun tak apa". Masalahnya, sakit ni tak tunggu kita ready tau.. 🚑'
),
('prospect', 16, 'Day 16',
 'Salam {name},\n\nSatu soalan ikhlas dari saya.\n\nSekiranya perkara yang tidak diingini berlaku kepada anda dalam masa terdekat, siapakah yang akan paling terkesan dan bersedih?',
 'Saya nak tanya dengan jujur. Kalau perkara tak dijangka terjadi kat {name} esok atau lusa, siapa yang paling sedih?',
 'Saya nak tanya jujur dengan {name} 👉👈.\n\nKalau (nauzubillah) perkara tak dijangka jadi kat {name} esok atau lusa, siapa agaknya orang yang paling sedih dan terkesan? 🤔'
),
('prospect', 18, 'Day 18',
 'Hai {name},\n\nAdakah anda seorang yang  lebih suka bersedia awal (sedia payung sebelum hujan) atau menunggu sehingga musibah melanda baru memikirkan tentang perlindungan Takaful?\n\nSemoga kita sentiasa dilindungi.',
 '{name} jenis suka sedia awal atau jenis tunggu sakit dulu baru fikir Takaful?',
 '{name} jenis yang mana? 🤷‍♂️\n\nJenis suka sedia payung sebelum hujan ☂️, atau jenis dah basah kuyup baru nak cari payung? Fikir-fikirkan ya 😉.'
);

-- CLIENTS
INSERT INTO public.workflow_steps (template_id, day, trigger_name, content_email, content_sms, content_whatsapp) VALUES
('client', 0, 'Instant',
 'Salam Tahniah {name}!\n\nTerima kasih kerana memberi kepercayaan kepada saya sebagai Penasihat Takaful anda.\n\nIni adalah pengesahan bahawa anda kini berada dalam senarai keutamaan saya.',
 'Tahniah {name} sebab memilih saya sebagai Takaful Advisor anda. Ini mesej auto dari sistem AgentApp saya. Reply OK kalau dah baca ya.',
 'Tahniah {name}! 🎉 Terima kasih sebab memilih saya sebagai Takaful Advisor anda 🤝.\n\nIni mesej auto dari sistem saja. Kalau dah baca, boleh reply "OK" ya? 👍'
),
('client', 5, 'Day 5',
 'Salam {name},\n\nIngin dimaklumkan bahawa polisi Takaful anda kini telah aktif sepenuhnya.\n\nSila simpan nombor saya untuk rujukan segera jika berlaku sebarang kecemasan.',
 'Sekadar nak maklumkan, perlindungan {name} dah aktif seperti yang dibincangkan tempoh hari. Simpan nombor saya, senang rujuk kalau perlu nanti.',
 'Hi {name} 👋! Sekadar nak update, perlindungan Takaful anda dah AKTIF ✅ seperti kita bincang hari tu.\n\nSimpan nombor saya ni elok-elok ya, senang nanti kalau ada kecemasan terus call saya. 📞'
),
('client', 15, 'Day 15',
 'Salam {name},\n\nJika anda berkesempatan, saya amat menghargai jika anda dapat kongsikan gambar polisi anda di media sosial dan tag saya.\n\nSokongan anda amat bermakna!',
 'Salam, Nanti kalau {name} ada masa, tag saya kat Social Media ye dengan gambar policy tu. hehe.',
 'Salam {name} 😁. Nanti kalau free, boleh la post gambar booklet policy tu kat IG/FB and tag saya sekali! hehe 🙏. Support member sikit!'
),
('client', 35, 'Day 35',
 'Hai {name},\n\nJika anda mempunyai sebarang pertanyaan mengenai hospital, tuntutan, atau manfaat polisi, sila hubungi saya terus.\n\nJangan peningkan kepala mencari di Google, biarkan saya bantu anda.',
 '{name} Kalau ada apa-apa nak tahu berkaitan hospital, claim atau manfaat, tak perlu google. Terus tanya saya, itu memang kerja saya.',
 '{name}, kalau ada apa-apa tak faham pasal hospital, claim atau manfaat, JANGAN google tau! 🙅‍♂️.\n\nTerus tanya saya je. Memang kerja saya untuk explain kat client saya. 🤓'
),
('client', 55, 'Day 55',
 'Salam {name},\n\nRamai tidak mengetahui prosedur sebenar untuk memudahkan urusan kemasukan ke hospital.\n\nJika anda perlukan panduan ini di masa hadapan, saya bersedia membantu langkah demi langkah.',
 'Salam, ramai tak tahu, bila masuk hospital nanti, ada cara untuk mudahkan urusan dari awal. Kalau satu hari nanti {name} perlukan info ni, saya boleh guide step by step.',
 'Salam! Ramai tak tahu, bila admit wad ni ada tips untuk mudahkan urusan GL dari awal 🏥.\n\nKalau satu hari nanti {name} perlukan info ni, roger je. Saya guide A to Z. ✨'
),
('client', 85, 'Day 85',
 'Salam {name},\n\nMaaf mengganggu masa anda. Saya ingin bertanya jika ada ahli keluarga anda yang mungkin memerlukan perlindungan Hibah buat masa ini?',
 'Salam, Maaf ganggu. ada ke family {name} yang {name} rasa perlu ada hibah?',
 'Salam {name}, maaf ganggu jap 🙏.\n\nSaja nak tanya, ada tak ahli keluarga {name} yang {name} rasa PERLU sangat ada Hibah Takaful macam {name}? 🤔'
),
('client', 115, 'Day 115',
 'Salam {name},\n\nBerdasarkan pengalaman saya menguruskan tuntutan, ramai pelanggan bersyukur kerana telah bersedia awal.\n\nIni membolehkan mereka menumpukan sepenuh perhatian kepada proses penyembuhan tanpa memikirkan beban kos.',
 'Salam, Kebanyakan kes claim yang saya urus, client bersyukur sebab buat awal. Masa tu mereka cuma fokus sembuh, bukan fikir kos.',
 'Salam {name}. Kebanyakan kes claim yang saya urus, client semua bersyukur sangat sebab sign up awal 🙏.\n\nMasa sakit, mereka cuma fokus nak sembuh je, takyah pening fikir pasal bil hospital dah. 😌'
),
('client', 155, 'Day 155',
 'Hai {name},\n\nSaya sekadar ingin bertanya khabar. Saya sentiasa memastikan saya kekal berhubung dengan semua pelanggan saya.\n\nHarap semuanya baik-baik sahaja di sana.',
 'Biasanya saya akan check in sekali-sekala macam ni. Bukan sebab ada apa-apa, cuma nak kekal berhubung. Semua ok kan?',
 'Just checking in! 👋 Saya memang akan selalu hello-hello client macam ni.\n\nBukan apa, nak pastikan kita keep in touch. Semua ok kan? Sihat? 😁'
),
('client', 205, 'Day 205',
 'Salam {name},\n\nJika anda mempunyai sebarang perkongsian atau pertanyaan mengenai Takaful, jangan segan untuk membalas email ini.\n\nPintu saya sentiasa terbuka.',
 'Salam, {name} Kalau ada apa-apa nak share, atau nak tanya pasal Takaful, boleh reply mesej saya.',
 'Salam {name} 👋. Kalau ada apa-apa nak share, atau tetiba teringat soalan pasal Takaful, boleh terus reply mesej ni tau.\n\nSaya sentiasa ready nak bantu. 😊'
),
('client', 245, 'Day 245',
 'Salam {name},\n\nSaya ingin mengucapkan terima kasih sekali lagi kerana mempercayai saya untuk menguruskan perlindungan anda.\n\nSaya memandang serius amanah yang diberikan ini.',
 'Terima kasih sebab percayakan saya untuk urus perlindungan {name}. Amanah macam ni saya ambil serius.',
 'Terima kasih tau {name} sebab percayakan saya untuk urus perlindungan anda 🙏.\n\nAmanah ni bukan benda main-main, saya memang ambil serius. Doakan saya terus istiqamah ye! 🤲'
),
('client', 295, 'Day 295',
 'Salam {name},\n\nJika ada rakan atau ahli keluarga yang bertanya mengenai Takaful, anda tidak perlu bersusah payah menerangkan secara terperinci.\n\nBenarkan saya membantu dengan meminta mereka menghubungi saya secara terus.',
 'Salam, kawan atau ahli keluarga akan tanya pasal takaful. Tak perlu jawab detail, suruh mereka contact saya saja boleh?',
 'Salam {name}. Selalunya kawan-kawan atau family akan mula tanya pasal takaful bila nampak kita ada agent best 😎.\n\nTak perlu pening jawab detail, pass je contact saya kat dorang. Boleh? 👌'
),
('client', 355, 'Day 355',
 'Salam sejahtera {name},\n\nSaya berharap anda dan sekeluarga sentiasa berada dalam keadaan sihat.\n\nSaya sentiasa mendoakan kesejahteraan dan kebaikan untuk semua pelanggan saya.',
 'Salam, Harap {name} dan keluarga sentiasa sihat. Saya sentiasa doakan yang baik-baik untuk client saya.',
 'Salam {name} ✨. Harap {name} & family sentiasa sihat walafiat.\n\nSaya sentiasa doakan yang baik-baik untuk semua client saya. Take care! ❤️'
),
('client', 395, 'Day 395',
 'Salam {name},\n\nRamai pelanggan saya hadir melalui cadangan daripada rakan dan keluarga.\n\nJika ada kenalan anda yang berminat untuk mendaftar, boleh kongsikan nombor telefon mereka kepada saya untuk saya bantu.',
 '{name}, ramai client saya dapat melalui recommendation kawan / family. Biasanya sebab mereka nak urus dengan orang yang sama, senang bincang katanya. Kalau ada kawan nak sign up, boleh share nombor phone dia kat saya ye.',
 '{name}, ramai client baru saya datang dari recommendation client sedia ada.\n\nKatanya senang bila urus dengan agent yang sama. Kalau ada kawan-kawan tengah survey, boleh share nombor dorang kat saya? 🙏'
),
('client', 445, 'Day 445',
 'Salam {name},\n\nHarap anda dan keluarga sentiasa sihat. Saya sentiasa mendoakan yang terbaik buat anda sekeluarga.',
 'Salam, Harap {name} dan keluarga sentiasa sihat. Saya sentiasa doakan yang baik-baik untuk client saya.',
 'Salam! Just dropping by to say Hi 👋.\n\nSemoga {name} dan family sentiasa murah rezeki dan sihat. Have a great week ahead! 🌈'
),
('client', 505, 'Day 505',
 'Salam {name},\n\nMutakhir ini banyak kes demam dan virus dilaporkan.\n\nSemoga anda dan keluarga sentiasa berada dalam keadaan sihat dan terpelihara.',
 'Salam, sekarang kes demam tengah banyak. Semoga {name} dan keluarga sentiasa dalam keadaan sihat.',
 'Salam {name}. Sekarang musim kes demam/virus berjangkit 😷.\n\nJaga diri dan family elok-elok ye. Semoga sentiasa dilindungi. 🛡️'
),
('client', 545, 'Day 545',
 'Salam {name},\n\nPeringatan mesra, sila maklumkan kepada saya jika berlaku sebarang kejadian yang memerlukan tuntutan.\n\nSaya komited untuk menguruskan keperluan anda dengan sebaiknya.',
 'Salam, {name}. Jangan lupa update saya ye kalau ada apa-apa berlaku. Saya akan make sure akan uruskan dengan terbaik.',
 'Salam {name} 👋. Reminder mesra: Jangan lupa update saya terus kalau ada apa-apa berlaku (masuk wad dsb).\n\nSaya akan pastikan saya urus yang terbaik untuk {name}! 💪'
),
('client', 595, 'Day 595',
 'Salam {name},\n\nAdakah anda berpuas hati dengan perlindungan Takaful anda setakat ini?\n\nJika ada sebarang persoalan, sila ajukan kepada saya.',
 'Salam, {name}. Setakat ni semua ok ke dengan perlindungan {name}? Kalau ada apa-apa yang bermain di fikiran, boleh tanya saja.',
 'Salam {name}. Setakat ni semua OK dengan plan Takaful? 👍👎\n\nKalau ada apa-apa musykil atau nak tanya, roger je. Jangan simpan dalam hati! 😄'
),
('client', 655, 'Day 655',
 'Salam {name},\n\nSebarang perubahan hidup seperti perkahwinan, kelahiran cahaya mata, atau pertukaran kerjaya mungkin memerlukan semakan semula polisi.\n\nMaklumkan kepada saya untuk nasihat yang bersesuaian.',
 'Salam, {name}. Apa-apa perubahan hidup nanti, contoh kawen, anak, sakit jangan segan beritahu saya. saya advise ikut situasi.',
 'Salam {name}. Life update sikit? 😁\n\nKalau ada perubahan besar (kahwin, dapat baby, tukar kerja), bagitahu saya tau. Boleh saya review balik protection ikut situation semasa. 🔄'
),
('client', 685, 'Day 685',
 'Salam {name},\n\nJika pada masa akan datang ada yang bertanya mengenai ejen Takaful yang boleh dipercayai, saya berharap and sudi mengesyorkan perkhidmatan saya.',
 'Salam, {name}. Kalau suatu hari nanti ada orang tanya, “agent mana ok?”, saya harap nama saya yang terlintas dalam kepala {name}.',
 'Salam {name} 👋.\n\nKalau satu hari nanti ada kawan tanya, "Eh, agent mana yang OK eh?", saya harap sangat nama saya yang {name} sebut dulu! hehe 😍.'
),
('client', 725, 'Day 725',
 'Salam {name},\n\nPenting: Sila kongsikan nombor saya kepada ahli keluarga terdekat anda.\n\nIni bagi memudahkan mereka menghubungi saya bagi pihak anda sekiranya berlaku sebarang kecemasan.',
 'Salam, {name}. Jangan lupa share nombor saya kat family. In case apa-apa mereka boleh cari saya bagi pihak {name}.',
 'Salam {name} important message ⚠️.\n\nJangan lupa share nombor saya kat spouse/family terdekat. In case jadi apa-apa kat {name}, dorang tahu siapa nak cari untuk uruskan pampasan nanti. 👨‍👩‍👧‍👦'
);

-- GLOBAL REMINDERS
INSERT INTO public.workflow_steps (template_id, trigger_name, date, client_only, content_email, content_sms, content_whatsapp) VALUES
('global', 'Birthday', 'auto', true, 'Happy Birthday {name}!', 'Happy Birthday {name}!', 'Happy Birthday {name}! 🎂'),
('global', 'Chinese New Year', '2026-02-17', true, 'Happy Chinese New Year {name}!', 'Gong Xi Fa Cai {name}!', 'Happy CNY {name}! 🍊'),
('global', 'Ramadan', '2026-02-18', true, 'Salam Ramadan Al-Mubarak {name}!', 'Salam Ramadan {name}!', 'Salam Ramadan {name} 🌙'),
('global', 'Hari Raya Aidilfitri', '2026-03-20', true, 'Selamat Hari Raya Aidilfitri {name}!', 'Selamat Hari Raya {name}!', 'Selamat Hari Raya {name} ✨'),
('global', 'Deepavali', '2026-11-11', true, 'Happy Deepavali {name}!', 'Happy Deepavali {name}!', 'Happy Deepavali {name}! 🪔'),
('global', 'Mother''s Day', '2026-05-10', true, 'Happy Mother''s Day {name}!', 'Happy Mother''s Day {name}!', 'Happy Mother''s Day {name}! 💐'),
('global', 'Father''s Day', '2026-06-21', true, 'Happy Father''s Day {name}!', 'Happy Father''s Day {name}!', 'Happy Father''s Day {name}! 👔'),
('global', 'Pesta Kaamatan', '2026-05-30', true, 'Kotobian Tadau Tagazo Do Kaamatan {name}!', 'Happy Kaamatan {name}!', 'Happy Harvest Festival {name}! 🌾'),
('global', 'Gawai Dayak', '2026-06-01', true, 'Gayu Guru Gerai Nyamai {name}!', 'Happy Gawai {name}!', 'Happy Gawai Dayak {name}! 🌿'),
('global', 'Christmas', '2026-12-25', true, 'Merry Christmas {name}!', 'Merry Christmas {name}!', 'Merry Christmas {name}! 🎄'),
('global', 'Hari Merdeka', '2026-08-31', true, 'Selamat Hari Merdeka {name}!', 'Selamat Hari Merdeka {name}!', 'Selamat Hari Merdeka {name}! 🇲🇾');