-- Migration: Add Global Reminders (Holidays & Renewal)
-- Restore the global reminders that were accidentally deleted.

INSERT INTO public.workflow_steps (user_id, template_id, day, date, trigger_name, content_sms, content_email, subject, is_active)
VALUES
-- 1. Selamat Tahun Baru (2026-01-01)
(NULL, 'global', NULL, '2026-01-01', 'Selamat Tahun Baru', 
 'Salam {name}, Selamat Tahun Baru 2026! Semoga tahun ini membawa lebih kejayaan dan kebahagiaan.',
 'Salam {name},

Selamat Tahun Baru 2026! 🎆

Saya doakan agar tahun baru ini membuka lebih banyak pintu rezeki, kejayaan dan kebahagiaan untuk {name} sekeluarga.

Terima kasih kerana terus bersama saya.

Salam hormat,
{agent_name}', 
 'Selamat Tahun Baru 2026!', true),

-- 2. Tahun Baru Cina (2026-02-17)
(NULL, 'global', NULL, '2026-02-17', 'Tahun Baru Cina', 
 'Salam {name}, Gong Xi Fa Cai! Semoga tahun ini membawa kemakmuran dan kesihatan yang baik.',
 'Salam {name},

Gong Xi Fa Cai! 🧧

Sempena Tahun Baru Cina ini, saya ingin mengucapkan selamat menyambut perayaan yang penuh bermakna.
Semoga tahun ini membawa limpahan kemakmuran, kesihatan yang baik dan kegembiraan berpanjangan.

Salam hormat,
{agent_name}', 
 'Gong Xi Fa Cai!', true),

-- 3. Selamat Berpuasa (2026-02-18)
(NULL, 'global', NULL, '2026-02-18', 'Selamat Berpuasa', 
 'Salam {name}, Selamat menunaikan ibadah puasa. Semoga Ramadan kali ini penuh keberkatan.',
 'Salam {name},

Selamat menunaikan ibadah puasa Ramadhan Al-Mubarak. 🌙

Semoga Ramadan kali ini membawa seribu keberkatan, ketenangan dan keampunan buat {name} dan keluarga.

Salam ikhlas,
{agent_name}', 
 'Salam Ramadan Al-Mubarak', true),

-- 4. Hari Raya Aidilfitri (2026-03-20)
(NULL, 'global', NULL, '2026-03-20', 'Hari Raya Aidilfitri', 
 'Salam {name}, Selamat Hari Raya Aidilfitri! Maaf Zahir & Batin.',
 'Salam {name},

Selamat Hari Raya Aidilfitri! ✨
Maaf Zahir & Batin.

Semoga syawal ini mengeratkan lagi silaturrahim kita. Hati-hati di jalan raya jika pulang ke kampung.

Salam hormat,
{agent_name}', 
 'Selamat Hari Raya Aidilfitri', true),

-- 5. Hari Ibu (2026-05-10)
(NULL, 'global', NULL, '2026-05-10', 'Hari Ibu', 
 'Salam {name}, Selamat Hari Ibu! Terima kasih atas segala pengorbanan seorang ibu.',
 'Salam {name},

Selamat Hari Ibu! 💐

Hari ini kita meraikan insan yang paling istimewa dalam hidup kita.
Semoga {name} (atau ibu tersayang) sentiasa di bawah lindungan-Nya.

Salam,
{agent_name}', 
 'Selamat Hari Ibu', true),

-- 6. Hari Raya Aidiladha (2026-05-27)
(NULL, 'global', NULL, '2026-05-27', 'Hari Raya Aidiladha', 
 'Salam {name}, Selamat Hari Raya Aidiladha. Semoga pengorbanan kita diterimaNya.',
 'Salam {name},

Selamat Hari Raya Aidiladha! 🌙

Semoga kita sentiasa mencontohi erti pengorbanan dan keikhlasan yang sebenar.

Salam,
{agent_name}', 
 'Salam Aidiladha', true),

-- 7. Hari Merdeka (2026-08-31)
(NULL, 'global', NULL, '2026-08-31', 'Hari Merdeka', 
 'Salam {name}, Selamat Hari Merdeka ke-69! Semoga negara kita terus aman dan makmur.',
 'Salam {name},

Selamat Hari Kebangsaan yang ke-69! 🇲🇾

Semoga negara kita terus aman, makmur dan harmoni.

Salam patriotik,
{agent_name}', 
 'Selamat Hari Merdeka!', true),

-- 8. Deepavali (2026-11-08)
(NULL, 'global', NULL, '2026-11-08', 'Deepavali', 
 'Salam {name}, Happy Deepavali! Semoga cahaya perayaan membawa kebahagiaan.',
 'Salam {name},

Happy Deepavali! 🪔

May this festival of lights bring you peace, prosperity, and happiness.
Have a wonderful celebration with your loved ones.

Warm regards,
{agent_name}', 
 'Happy Deepavali', true),

-- 9. Monthly Renewal (Logic handled by Trigger Name)
(NULL, 'global', NULL, NULL, 'Monthly Renewal', 
 'Salam {name}, Terima kasih kerana kekal aktif. Polisi anda dalam keadaan baik bulan ini.',
 'Salam {name},

Sekadar makluman ringkas dan ucapan terima kasih kerana terus memastikan perlindungan anda kekal aktif.

Polisi anda berada dalam keadaan baik bulan ini.
Jika ada sebarang soalan, boleh terus hubungi saya.

Terima kasih atas komitmen {name}.

Salam hormat,
{agent_name}', 
 'Terima Kasih: Perlindungan Anda Aktif', true);
