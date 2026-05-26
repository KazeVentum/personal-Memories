# Supabase Setup

1. Crear proyecto en supabase.com
2. Copiar URL y anon key a `.env.local`
3. Ejecutar en SQL Editor: `schema.sql` → luego `storage.sql`
4. Authentication → Providers → Email → verificar que "Enable email provider" esté activo
   - No hay toggle separado para Magic Link — funciona automáticamente con el provider de email habilitado
5. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: agregar `http://localhost:3000/auth/callback`

## Notas

- El Magic Link se envía vía `supabase.auth.signInWithOtp({ email })`, no requiere configuración adicional
- Para producción: reemplazar `http://localhost:3000` por la URL real del deploy en ambos campos
