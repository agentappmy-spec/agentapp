-- Migration: Update Monthly Renewal Message Content (Fixed Newlines)
-- Updates the previously inserted 'Monthly Renewal' template with proper formatting.

UPDATE public.workflow_steps
SET 
    subject = 'Peringatan: Polisi Takaful Anda',
    content_sms = 'Salam {name}, polisi anda akan tamat tempoh tidak lama lagi. Abaikan mesej ini jika pembayaran telah berjaya. TQ - {agent_name}',
    content_whatsapp = 'Salam {name}, peringatan mesra. Polisi anda akan tamat tempoh tidak lama lagi. Sila abaikan mesej ini jika pembayaran telah berjaya. Terima kasih. - {agent_name}',
    content_email = 'Salam {name},

Polisi anda akan tamat tempoh tidak lama lagi.

Sila abaikan mesej ini jika pembayaran adalah telah berjaya.

Sekiranya ada sebarang pertanyaan, boleh hubungi saya.

Salam hormat,
{agent_name}'
WHERE trigger_name = 'Monthly Renewal' AND template_id = 'global';
