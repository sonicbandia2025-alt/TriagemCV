-- Se o login automático não funcionar, rode isso no SQL Editor do Supabase:

-- 1. Insere ou Atualiza o perfil do adm@tri.app para ser Admin
INSERT INTO public.profiles (id, email, name, is_admin, max_credits)
SELECT 
    id, 
    email, 
    'Admin Principal', 
    true, 
    9999
FROM auth.users 
WHERE email = 'adm@tri.app'
ON CONFLICT (id) DO UPDATE 
SET is_admin = true, max_credits = 9999;
