-- Migration: Update Prospect Day 0 Message
-- Purpose: Update the content for the instant intro message based on user request.

UPDATE public.workflow_steps
SET
    content_sms = 'Terima kasih sebab tunjukkan minat dengan Takaful. Insyaallah, semoga dipermudahkan urusan. Apa-boleh tanya saya di sini ye?',
    content_whatsapp = 'Salam {name} 😊

Terima kasih sebab tunjukkan minat dengan Takaful. Insyaallah, semoga dipermudahkan urusan. Apa-boleh tanya saya di sini ye?',
    content_email = 'Assalamualaikum dan salam sejahtera {name},

Saya hantar email ringkas ini untuk ucap terima kasih sebab tunjukkan minat dengan Takaful.

Insyaallah, semoga dipermudahkan urusan. Apa-boleh tanya saya di WhatsApp ye? 

Terima kasih dan saya hargai kerjasama {name}.

Salam hormat,
{agent_name}',
    subject = 'Terima kasih sebab tunjukkan minat dengan Takaful.'
WHERE
    template_id = 'prospect' 
    AND day = 0 
    AND user_id IS NULL;
