-- 1) Remove anonymous upload access to the private documents bucket
DROP POLICY IF EXISTS "anyone can upload registration documents" ON storage.objects;

-- 2) Replace always-true INSERT policies with validating policies
DROP POLICY IF EXISTS "anyone can submit registration" ON public.registrations;
CREATE POLICY "anyone can submit registration"
ON public.registrations FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(child_first_name)) BETWEEN 1 AND 100
  AND length(btrim(child_last_name)) BETWEEN 1 AND 100
  AND child_gender IN ('male','female')
  AND section IN ('nursery','preschool','kindergarten')
  AND child_birth_date > (CURRENT_DATE - INTERVAL '12 years')
  AND child_birth_date <= CURRENT_DATE
  AND length(btrim(parent_name)) BETWEEN 1 AND 150
  AND length(btrim(parent_phone)) BETWEEN 6 AND 30
  AND (parent_email IS NULL OR length(parent_email) <= 255)
  AND (parent_address IS NULL OR length(parent_address) <= 500)
  AND (notes IS NULL OR length(notes) <= 2000)
  AND birth_certificate_path IS NULL
  AND parent_id_path IS NULL
  AND child_photo_path IS NULL
  AND status = 'pending'::registration_status
);

DROP POLICY IF EXISTS "anyone can send message" ON public.contact_messages;
CREATE POLICY "anyone can send message"
ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 150
  AND length(btrim(phone)) BETWEEN 6 AND 30
  AND (email IS NULL OR length(email) <= 255)
  AND length(btrim(message)) BETWEEN 1 AND 2000
  AND is_read = false
);

-- 3) Restrict execution of SECURITY DEFINER / internal helper functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;