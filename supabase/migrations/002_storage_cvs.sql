-- =============================================
-- Bucket y políticas para CVs
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================

-- Crear bucket 'cvs' (público para que los links funcionen directamente)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', true, 5242880, array['application/pdf'])
on conflict (id) do nothing;

-- Política: cada usuario solo puede subir a su propia carpeta (userId/...)
create policy "Usuarios suben su propio CV"
  on storage.objects for insert
  with check (
    bucket_id = 'cvs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: cada usuario puede actualizar/reemplazar su propio CV
create policy "Usuarios actualizan su propio CV"
  on storage.objects for update
  using (
    bucket_id = 'cvs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: lectura pública (bucket es público, pero por si acaso)
create policy "Lectura pública de CVs"
  on storage.objects for select
  using (bucket_id = 'cvs');

-- Política: cada usuario puede borrar su propio CV
create policy "Usuarios borran su propio CV"
  on storage.objects for delete
  using (
    bucket_id = 'cvs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
