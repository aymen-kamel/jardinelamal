CREATE POLICY "anyone can upload registration documents" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "admins read documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "anyone can view gallery files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'gallery');
CREATE POLICY "admins upload gallery files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete gallery files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(),'admin'));