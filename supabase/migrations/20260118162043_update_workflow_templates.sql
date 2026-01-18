-- Deactivate or delete existing prospect and client templates to avoid duplicates/confusion
DELETE FROM public.workflow_steps 
WHERE template_id IN ('prospect', 'client');

-- Insert new PROSPECT templates
INSERT INTO public.workflow_steps (template_id, day, trigger_name, content_email, content_sms, content_whatsapp) VALUES
-- Day 0
('prospect', 0, 'Day 0 - Intro', 
 'Salam {name},\n\nHai! Ini mesej ringkas untuk makluman bahawa nombor {name} baru sahaja direkodkan dalam sistem saya.\n\nJika anda menerima mesej ini, sila balas OK.\n\nTerima kasih.',
 'Salam, hai. Ini mesej ringkas sebab nombor {name} baru direkodkan dalam sistem saya. Reply OK kalau terima.',
 'Salam, hai {name}! 👋\n\nIni mesej ringkas sebab nombor {name} baru direkodkan dalam sistem saya. \n\nReply ''OK'' kalau terima ya. Terima kasih! 😊'
),
-- Day 1
('prospect', 1, 'Day 1 - Health Reality',
 'Assalam {name},\n\nHarap anda sihat.\n\nRamai orang berasa mereka sihat sepenuhnya kerana tidak pernah dimasukkan ke hospital. Namun, realitinya kebanyakan kes sakit serius berlaku tanpa sebarang amaran awal.\n\nPeringatan mesra untuk kita semua sentiasa berjaga-jaga.',
 'Assalam, Ramai orang rasa dia sihat sebab tak pernah masuk hospital. Tapi, kebanyakan kes sakit serius tu terjadi tanpa ia bagi warning dulu..',
 'Assalam {name} 🌿,\n\nRamai orang rasa dia sihat sebab tak pernah masuk hospital. Tapi, kebanyakan kes sakit serius tu terjadi tanpa ia bagi warning dulu.. 😨\n\nTake care!'
),
-- Day 2 (Day 1 + 1)
('prospect', 2, 'Day 2 - Cost Awareness',
 'Assalam {name},\n\nAdakah anda tahu bahawa kos satu rawatan hospital untuk penyakit kritikal boleh mencecah puluhan ribu ringgit, walaupun tempoh kemasukan ke wad adalah singkat?\n\nKos perubatan kian meningkat saban tahun.',
 'Assalam {name}, tahu tak satu rawatan hospital untuk sakit kritikal boleh cecah puluhan ribu walaupun masuk wad tak lama?',
 'Assalam {name}, tahu tak? 🤔\n\nSatu rawatan hospital untuk sakit kritikal boleh mencecah puluhan ribu ringgit walaupun masuk wad tak lama. 💸\n\nKos perubatan makin meningkat sekarang.'
),
-- Day 3 (Day 2 + 1)
('prospect', 3, 'Day 3 - Age Myth',
 'Salam {name},\n\nSekadar perkongsian, ramai pesakit di wad hospital hari ini bukanlah golongan warga emas.\n\nSebaliknya, wad dipenuhi dengan mereka yang berumur 20-an hingga 40-an. Penyakit tidak menunggu usia lanjut untuk menyerang.',
 'Salam {name}, Ramai warded kat hospital tu bukan orang tua. Umur 20-an dan 40-an yang penuh, sebab sakit ni tak tunggu dah berumur.',
 'Salam {name} 👋,\n\nRamai yang warded kat hospital sekarang bukan orang tua tau. Wad penuh dengan umur 20-an dan 40-an.\n\nSakit ni tak tunggu kita berumur. 🏥'
),
-- Day 5 (Day 3 + 2)
('prospect', 5, 'Day 5 - Family Impact',
 'Assalam {name},\n\nBerdasarkan pengalaman saya menguruskan banyak kes, pesakit biasanya boleh fokus untuk merawat diri.\n\nNamun, tekanan sebenar sering dirasai oleh ahli keluarga di rumah yang perlu menguruskan pelbagai hal lain termasuk kewangan.',
 'Assalam {name}, Dalam banyak kes yang saya jumpa, pesakit boleh fokus rawat diri. Yang paling tertekan sebenarnya ahli keluarga di rumah.',
 'Assalam {name},\n\nDalam banyak kes yang saya jumpa, pesakit boleh fokus rawat diri. Tapi yang paling tertekan sebenarnya ahli keluarga di rumah. 🏠😓'
),
-- Day 7 (Day 5 + 2)
('prospect', 7, 'Day 7 - Savings Limit',
 'Salam {name},\n\nIngin saya kongsikan bahawa simpanan peribadi selalunya cepat susut apabila tempoh rawatan menjadi panjang.\n\nKetika itulah ramai yang baru menyedari bahawa dana kecemasan juga mempunyai hadnya dan akhirnya mungkin akan habis digunakan.',
 'Salam {name}, Simpanan biasa selalunya cepat susut bila rawatan makin lama. Masa tu baru ramai sedar, duit kecemasan pun ada limit. Lama-lama habis la.',
 'Salam {name} 📉,\n\nSimpanan biasa selalunya cepat susut bila rawatan makin lama.\n\nMasa tu baru ramai sedar, duit kecemasan pun ada limit. Lama-lama boleh habis. 💸'
),
-- Day 10 (Day 7 + 3)
('prospect', 10, 'Day 10 - Crowdfunding',
 'Assalam {name},\n\nPernahkah anda melihat kes di mana keluarga terpaksa memohon sumbangan orang ramai di media sosial kerana kos rawatan yang terlalu tinggi untuk ditanggung sendiri?\n\nSituasi sebegini amat berat untuk dilalui oleh mana-mana keluarga.',
 'Assalam {name}, pernah nampak kes yang Family terpaksa post online menagih duit kepada netizan sebab kos rawatan terlalu besar untuk ditanggung sendiri?',
 'Assalam {name} 📱,\n\nPernah nampak kes Family terpaksa post online minta bantuan netizen sebab kos rawatan terlalu besar? 😢\n\nMemang sedih bila tengok situasi macam tu.'
),
-- Day 13 (Day 10 + 3)
('prospect', 13, 'Day 13 - Procrastination',
 'Salam {name},\n\nRamai orang menangguhkan pengambilan Takaful bukan kerana mereka rasa ia tidak penting, tetapi kerana sikap ''nanti dulu''.\n\nWalau bagaimanapun, penyakit tidak akan menunggu sehingga kita bersedia.',
 'Salam {name}, Kebanyakan orang tangguh nak ambil Takaful bukan sebab tak penting, tapi sebab “nanti dulu pun tak apa”. Cuma tu la, sakit ni yang tak boleh tunggu kita ready.',
 'Salam {name} 👋,\n\nKebanyakan orang tangguh nak ambil Takaful bukan sebab tak penting, tapi sebab rasa “nanti dulu pun tak apa”.\n\nCuma tu lah, sakit ni tak tunggu kita ready kan? ⏳'
),
-- Day 16 (Day 13 + 3)
('prospect', 16, 'Day 16 - Honest Question',
 'Assalam {name},\n\nSaya ingin bertanya secara jujur.\n\nSekiranya perkara yang tidak dijangka berlaku kepada {name} esok atau lusa, siapakah orang yang akan paling bersedih dan terkesan?',
 'Assalam {name}, Saya nak tanya dengan jujur. Kalau perkara tak dijangka terjadi kat {name} esok atau lusa, siapa yang paling sedih?',
 'Assalam {name},\n\nSaya nak tanya jujur sikit. 👉👈\n\nKalau perkara tak dijangka terjadi kat {name} esok atau lusa, agak-agak siapa yang paling sedih? 😔'
),
-- Day 18 (Day 16 + 2)
('prospect', 18, 'Day 18 - Preparation',
 'Salam {name},\n\nAdakah {name} seorang yang suka membuat persediaan awal, atau lebih cenderung menunggu sehingga sakit baru memikirkan tentang Takaful?\n\nMerancang awal adalah langkah yang bijak.',
 'Salam {name}, {name} jenis suka get ready awal atau jenis tunggu sakit dulu baru fikir Takaful?',
 'Salam {name} 🤔,\n\n{name} jenis suka get ready awal atau jenis tunggu sakit dulu baru fikir Takaful?\n\nBetter prepare awal kan? 🛡️'
);

-- Insert new CLIENT templates
INSERT INTO public.workflow_steps (template_id, day, trigger_name, client_only, content_email, content_sms, content_whatsapp) VALUES
-- Instant (Day 0)
('client', 0, 'Day 0 - Welcome', true,
 'Tahniah {name},\n\nTerima kasih kerana memilih saya sebagai Takaful Advisor anda.\n\nIni adalah mesej automatik dari sistem pengurusan AgentApp saya. Sila balas OK untuk pengesahan penerimaan.\n\nSaya sedia berkhidmat untuk anda.',
 'Tahniah {name} sebab memilih saya sebagai Takaful Advisor anda. Ini mesej auto dari sistem AgentApp saya. Reply OK untuk sahkan.',
 'Tahniah {name}! 🎉\n\nTerima kasih sebab memilih saya sebagai Takaful Advisor anda.\n\nIni mesej auto dari sistem AgentApp saya. Reply ''OK'' untuk sahkan ya. 👍'
),
-- +5 days (Day 5)
('client', 5, 'Day 5 - Policy Active', true,
 'Salam {name},\n\nSekadar makluman bahawa polisi perlindungan anda telah pun aktif seperti yang dibincangkan tempoh hari.\n\nSila simpan nombor telefon saya untuk memudahkan anda merujuk sebarang pertanyaan di masa hadapan.',
 'Sekadar nak maklumkan, perlindungan {name} dah aktif seperti yang dibincangkan tempoh hari. Simpan nombor saya, senang rujuk kalau perlu nanti.',
 'Hi {name} 👋,\n\nSekadar nak maklumkan, perlindungan {name} dah aktif seperti yang kita bincang hari tu. ✅\n\nSimpan nombor saya ye, senang nak rujuk kalau perlu nanti.'
),
-- +10 days (Day 15)
('client', 15, 'Day 15 - Social Proof', true,
 'Salam {name},\n\nJika anda mempunyai kelapangan, bolehlah tag saya di media sosial bersama gambar polisi anda.\n\nTerima kasih atas sokongan anda!',
 'Salam, Nanti kalau {name} ada masa, tag saya kat Social Media ye dengan gambar policy tu. hehe.',
 'Salam {name} 📸,\n\nNanti kalau ada masa, tag la saya kat Social Media dengan gambar policy tu. Hehe.\n\nThanks support! 🙏'
),
-- +20 days (Day 35)
('client', 35, 'Day 35 - Expert Help', true,
 'Salam {name},\n\nJika anda mempunyai sebarang pertanyaan mengenai hospital, tuntutan (claim), atau manfaat polisi, anda tidak perlu mencari di Google.\n\nTerus sahaja bertanya kepada saya, kerana tugas saya adalah untuk membantu anda.',
 '{name} Kalau ada apa-apa nak tahu berkaitan hospital, claim atau manfaat, tak perlu google. Terus tanya saya, itu memang kerja saya.',
 '{name}, kalau ada apa-apa nak tahu pasal hospital, claim atau manfaat, tak perlu Google tau. 🙅‍♂️\n\nTerus tanya saya je, itu memang kerja saya. 🫡'
),
-- +20 days (Day 55)
('client', 55, 'Day 55 - Admission Guide', true,
 'Salam {name},\n\nRamai yang tidak mengetahui bahawa terdapat cara untuk memudahkan urusan kemasukan ke hospital dari peringkat awal.\n\nJika satu hari nanti anda memerlukan maklumat ini, saya sedia membantu membimbing anda langkah demi langkah.',
 'Salam, ramai tak tahu, bila masuk hospital nanti, ada cara untuk mudahkan urusan dari awal. Kalau satu hari nanti {name} perlukan info ni, saya boleh guide step by step.',
 'Salam {name} 🏥,\n\nRamai tak tahu, bila masuk hospital nanti, ada cara untuk mudahkan urusan dari awal.\n\nKalau satu hari nanti {name} perlukan info ni, roger je. Saya boleh guide step by step. ✨'
),
-- +30 days (Day 85)
('client', 85, 'Day 85 - Hibah Check', true,
 'Salam {name},\n\nMaaf mengganggu.\n\nSaya ingin bertanya jika ada ahli keluarga anda yang mungkin memerlukan perlindungan hibah?',
 'Salam, Maaf ganggu. ada ke family {name} yang {name} rasa perlu ada hibah?',
 'Salam {name} 👋, maaf ganggu.\n\nAda ke family {name} yang {name} rasa perlu ada hibah? 🤔'
),
-- +30 days (Day 115)
('client', 115, 'Day 115 - Early Claims', true,
 'Salam {name},\n\nKebanyakan kes tuntutan yang saya uruskan, pelanggan amat bersyukur kerana telah membuat persediaan awal.\n\nIni membolehkan mereka fokus sepenuhnya kepada proses penyembuhan tanpa perlu memikirkan tentang kos rawatan.',
 'Salam, Kebanyakan kes claim yang saya urus, client bersyukur sebab buat awal. Masa tu mereka cuma fokus sembuh, bukan fikir kos.',
 'Salam {name} 🤲,\n\nKebanyakan kes claim yang saya urus, client bersyukur sangat sebab buat awal.\n\nMasa tu mereka cuma fokus untuk sembuh je, tak perlu fikir pasal kos dah.'
),
-- +40 days (Day 155)
('client', 155, 'Day 155 - Check In', true,
 'Salam {name},\n\nSaya sekadar bertanya khabar.\n\nBiasanya saya akan menghubungi pelanggan sekali-sekala untuk kekal berhubung dan memastikan semuanya dalam keadaan baik. Harap anda baik-baik sahaja.',
 'Biasanya saya akan check in sekali-sekala macam ni. Bukan sebab ada apa-apa, cuma nak kekal berhubung. Semua ok kan?',
 'Hi {name}! 👋\n\nBiasanya saya akan check in sekali-sekala macam ni. Bukan sebab ada apa-apa, cuma nak kekal berhubung je.\n\nSemua ok kan? 😊'
),
-- +50 days (Day 205)
('client', 205, 'Day 205 - Questions', true,
 'Salam {name},\n\nJika anda mempunyai sebarang perkongsian atau pertanyaan mengenai Takaful, jangan segan untuk membalas mesej ini.',
 'Salam, {name} Kalau ada apa-apa nak share, atau nak tanya pasal Takaful, boleh reply mesej saya.',
 'Salam {name} 💬,\n\nKalau ada apa-apa nak share, atau nak tanya pasal Takaful, boleh reply je mesej saya ni ya.'
),
-- +40 days (Day 245)
('client', 245, 'Day 245 - Trust', true,
 'Salam {name},\n\nTerima kasih kerana memberi kepercayaan kepada saya untuk menguruskan perlindungan Takaful anda.\n\nSaya memandang serius amanah yang diberikan ini.',
 'Terima kasih sebab percayakan saya untuk urus perlindungan {name}. Amanah macam ni saya ambil serius.',
 'Salam {name} 🙏,\n\nTerima kasih sebab percayakan saya untuk urus perlindungan {name}.\n\nAmanah macam ni saya ambil serius. 💪'
),
-- +50 days (Day 295)
('client', 295, 'Day 295 - Referrals Funnel', true,
 'Salam {name},\n\nSekiranya rakan atau ahli keluarga anda bertanya mengenai Takaful, anda tidak perlu bersusah payah menerangkan secara terperinci.\n\nBoleh minta mereka menghubungi saya terus? Saya sedia membantu.',
 'Salam, kawan atau ahli keluarga akan tanya pasal takaful. Tak perlu jawab detail, suruh mereka contact saya saja boleh?',
 'Salam {name},\n\nKalau kawan atau ahli keluarga tanya pasal takaful, tak perlu pening jawab detail tau.\n\nSuruh je mereka contact saya terus, boleh? 😁📞'
),
-- +60 days (Day 355)
('client', 355, 'Day 355 - Well Wishes', true,
 'Salam {name},\n\nSaya berharap agar anda dan seisi keluarga sentiasa berada dalam keadaan sihat.\n\nSaya sentiasa mendoakan kesejahteraan buat semua pelanggan saya.',
 'Salam, Harap {name} dan keluarga sentiasa sihat. Saya sentiasa doakan yang baik-baik untuk client saya.',
 'Salam {name} ✨,\n\nHarap {name} dan keluarga sentiasa sihat.\n\nSaya sentiasa doakan yang baik-baik untuk semua client saya. 🤲'
),
-- +40 days (Day 395)
('client', 395, 'Day 395 - Referrals Ask', true,
 'Salam {name},\n\nRamai pelanggan baharu saya datang daripada cadangan rakan atau ahli keluarga, kerana mereka lebih selesa berurusan dengan ejen yang sama.\n\nJika ada kenalan anda yang berminat untuk mendaftar, bolehlah kongsikan nombor telefon mereka kepada saya.',
 '{name}, ramai client saya dapat melalui recommendation kawan / family. Biasanya sebab mereka nak urus dengan orang yang sama, senang bincang katanya. Kalau ada kawan nak sign up, boleh share nombor phone dia kat saya ye.',
 '{name} 👋,\n\nRamai client saya dapat melalui recommendation kawan/family. Biasanya sebab mereka nak urus dengan orang yang sama, senang bincang katanya.\n\nKalau ada kawan nak sign up, boleh share nombor phone dia kat saya ye? 🤝'
),
-- +50 days (Day 445)
('client', 445, 'Day 445 - Well Wishes 2', true,
 'Salam {name},\n\nSalam sejahtera. Harap anda dan keluarga sentiasa sihat walafiat.\n\nSaya sentiasa mendoakan yang terbaik untuk anda.',
 'Salam, Harap {name} dan keluarga sentiasa sihat. Saya sentiasa doakan yang baik-baik untuk client saya.',
 'Salam {name} 🌟,\n\nJust dropping by to say hi!\n\nHarap {name} dan keluarga sentiasa sihat. Saya sentiasa doakan yang terbaik. 😊'
),
-- +60 days (Day 505)
('client', 505, 'Day 505 - Fever Season', true,
 'Salam {name},\n\nMemandangkan kes demam sedang meningkat sekarang, saya berharap agar anda dan keluarga sentiasa menjaga kesihatan.\n\nSemoga sentiasa dalam keadaan baik.',
 'Salam, sekarang kes demam tengah banyak. Semoga {name} dan keluarga sentiasa dalam keadaan sihat.',
 'Salam {name} 😷,\n\nSekarang kes demam tengah banyak kan?\n\nSemoga {name} dan keluarga sentiasa dalam keadaan sihat dan dilindungi. Take care!'
),
-- +40 days (Day 545)
('client', 545, 'Day 545 - Assurance', true,
 'Salam {name},\n\nIngatan mesra untuk memaklumkan kepada saya sekiranya berlaku sebarang perkara yang memerlukan perhatian.\n\nSaya akan memastikan segalanya diuruskan dengan sebaik mungkin.',
 'Salam, {name}. Jangan lupa update saya ye kalau ada apa-apa berlaku. Saya akan make sure akan uruskan dengan terbaik.',
 'Salam {name} 🛡️,\n\nJangan lupa update saya ye kalau ada apa-apa berlaku.\n\nSaya akan make sure saya uruskan dengan yang terbaik untuk anda.'
),
-- +50 days (Day 595)
('client', 595, 'Day 595 - Satisfaction Check', true,
 'Salam {name},\n\nAdakah anda berpuas hati dengan pelan perlindungan anda setakat ini?\n\nJika ada sebarang persoalan atau kemusykilan, jangan ragu untuk bertanya.',
 'Salam, {name}. Setakat ni semua ok ke dengan perlindungan {name}? Kalau ada apa-apa yang bermain di fikiran, boleh tanya saja.',
 'Salam {name} 👋,\n\nSetakat ni semua ok ke dengan perlindungan {name}?\n\nKalau ada apa-apa yang bermain di fikiran, boleh tanya saja tau. Saya sedia membantu. 🧐'
),
-- +60 days (Day 655)
('client', 655, 'Day 655 - Life Changes', true,
 'Salam {name},\n\nSekiranya terdapat sebarang perubahan status kehidupan seperti perkahwinan, kelahiran cahaya mata, atau masalah kesihatan, sila maklumkan kepada saya.\n\nSaya boleh memberikan nasihat dan penyesuaian pelan mengikut situasi semasa anda.',
 'Salam, {name}. Apa-apa perubahan hidup nanti, contoh kawen, anak, sakit jangan segan beritahu saya. saya advise ikut situasi.',
 'Salam {name} 💍👶,\n\nApa-apa perubahan hidup nanti, contohnya kahwin, dapat anak, atau sakit, jangan segan beritahu saya ye.\n\nSaya boleh advise plan ikut situasi semasa.'
),
-- +30 days (Day 685)
('client', 685, 'Day 685 - Agent Branding', true,
 'Salam {name},\n\nJika suatu hari nanti ada kenalan yang bertanya tentang ejen Takaful yang bagus, saya berharap and sudi mengesyorkan nama saya.\n\nTerima kasih atas sokongan anda.',
 'Salam, {name}. Kalau suatu hari nanti ada orang tanya, “agent mana ok?”, saya harap nama saya yang terlintas dalam kepala {name}.',
 'Salam {name} 💭,\n\nKalau suatu hari nanti ada orang tanya, “agent mana ok?”, saya harap nama saya yang terlintas dalam kepala {name} ya. hehe. 😁'
),
-- +40 days (Day 725)
('client', 725, 'Day 725 - Emergency Contact', true,
 'Salam {name},\n\nJangan lupa untuk berkongsi nombor telefon saya dengan ahli keluarga terdekat anda.\n\nIni penting supaya mereka boleh menghubungi saya dengan segera bagi pihak anda sekiranya berlaku sebarang kecemasan.',
 'Salam, {name}. Jangan lupa share nombor saya kat family. In case apa-apa mereka boleh cari saya bagi pihak {name}.',
 'Salam {name} 👨‍👩‍👧‍👦,\n\nJangan lupa share nombor saya kat family tau.\n\nIn case jadi apa-apa, mereka boleh cari saya terus bagi pihak {name}. Penting tu!'
);
