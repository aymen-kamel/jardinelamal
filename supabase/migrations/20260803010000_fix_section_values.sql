-- The registration insert policy validated section against
-- ('nursery','preschool','kindergarten'), but the site's actual section
-- values (src/lib/site-data.ts SECTIONS) are 'nursery', 'middle', and
-- 'preparatory'. Only 'nursery' matched, so selecting either of the other
-- two sections always failed the database check. Correct the allowed list.

DROP POLICY IF EXISTS "anyone can submit registration" ON public.registrations;
CREATE POLICY "anyone can submit registration"
ON public.registrations FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(child_first_name)) BETWEEN 1 AND 100
  AND length(btrim(child_last_name)) BETWEEN 1 AND 100
  AND child_gender IN ('male','female')
  AND section IN ('nursery','middle','preparatory')
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
