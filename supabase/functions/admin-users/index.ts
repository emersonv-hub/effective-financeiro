import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verificar identidade do chamador via getUser()
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callerId = user.id;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verificar se o chamador é admin
    const { data: callerProfile, error: profErr } = await admin
      .from('fisio_profiles').select('role').eq('id', callerId).maybeSingle();
    if (profErr || callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string;

    // ── Criar usuário ──────────────────────────────────────────────────────────
    if (action === 'create') {
      const { email, password, full_name, role, color } = body;
      if (!email || !password || !full_name) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name },
      });
      if (createErr || !created?.user) {
        return new Response(JSON.stringify({ error: createErr?.message ?? 'Create failed' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      await admin.from('fisio_profiles').upsert({
        id: created.user.id, email, full_name,
        role: role ?? 'fisioterapeuta', color: color ?? '#10b981',
      });
      return new Response(JSON.stringify({ id: created.user.id }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Excluir usuário ────────────────────────────────────────────────────────
    if (action === 'delete') {
      const userId = body?.user_id as string;
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing user_id' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (userId === callerId) {
        return new Response(JSON.stringify({ error: 'Cannot delete self' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      await admin.from('fisio_profiles').delete().eq('id', userId);
      const { error: delErr } = await admin.auth.admin.deleteUser(userId);
      if (delErr) {
        return new Response(JSON.stringify({ error: delErr.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Redefinir senha de outro usuário (admin) ───────────────────────────────
    if (action === 'reset_password') {
      const { user_id, password } = body;
      if (!user_id || !password) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (user_id === callerId) {
        return new Response(JSON.stringify({ error: 'Use o formulário de troca de senha para alterar a própria senha.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if ((password as string).length < 6) {
        return new Response(JSON.stringify({ error: 'A senha deve ter pelo menos 6 caracteres.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { error: updErr } = await admin.auth.admin.updateUserById(user_id, { password });
      if (updErr) {
        return new Response(JSON.stringify({ error: updErr.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
