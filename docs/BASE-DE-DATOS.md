> **Note (octobre 2026)** : les boutons « Registro » / « Iniciar sesión » de l'ancien Joomla ont été retirés (le site
> d'origine n'existe plus). L'accès éditeur de Víctor est implémenté sans base de données : voir
> [`EDITOR.md`](EDITOR.md). Ce plan Supabase ne reste utile que si l'on veut un jour des comptes pour les étudiants.

# Base de données : remplacer « Registro » et « Iniciar sesión » de l'ancien Joomla

Objectif : que le nouveau site remplace complètement l'ancien, y compris l'espace utilisateurs (inscription,
connexion, contenus réservés). Le site est **statique** (un `index.html` déployé sur Vercel) : il n'y a pas de
serveur PHP comme sur Joomla. La solution la plus simple et gratuite est **Supabase** (base Postgres + module
d'authentification + API), pilotée directement depuis le navigateur avec une petite bibliothèque JS.

Pourquoi Supabase plutôt qu'autre chose :
- gratuit jusqu'à 50 000 utilisateurs actifs/mois, largement suffisant ;
- inscription / connexion / mot de passe oublié fournis clés en main (e-mails de confirmation inclus) ;
- pas de serveur à maintenir, compatible avec le déploiement Vercel actuel ;
- une vraie base Postgres derrière, exportable si un jour on veut migrer.

Alternatives équivalentes : Firebase (Google), Vercel Postgres + Auth.js (plus de code). Le plan ci-dessous est
pour Supabase ; le principe est le même ailleurs.

---

## 1. Créer le projet Supabase (10 min)

1. Créer un compte sur https://supabase.com et un **New project** (nom : `organizaciondeportiva`, région : `eu-west`,
   choisir un mot de passe de base de données et le garder).
2. Dans **Project Settings → API**, noter :
   - `Project URL` (ex. `https://abcd1234.supabase.co`)
   - `anon public` key (clé publique, elle **peut** être mise dans le HTML ; ne jamais y mettre la clé `service_role`).
3. Dans **Authentication → Providers → Email** : laisser *Enable email provider* activé, garder *Confirm email* activé.
4. Dans **Authentication → URL Configuration** : *Site URL* = `https://organization-deportiva.vercel.app`
   (puis le vrai domaine `https://organizaciondeportiva.org` quand le DNS sera basculé) et ajouter la même URL
   dans *Redirect URLs*.

## 2. Créer les tables (SQL Editor → New query → Run)

```sql
-- Profil public de chaque utilisateur (la table auth.users est gérée par Supabase)
create table public.perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text,
  universidad text,
  rol         text not null default 'estudiante' check (rol in ('estudiante','docente','admin')),
  creado_en   timestamptz not null default now()
);

-- Créer automatiquement le profil à l'inscription
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre) values (new.id, new.raw_user_meta_data->>'nombre');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Contenus réservés (apuntes complets, documents, etc.)
create table public.materiales (
  id          bigint generated always as identity primary key,
  titulo      text not null,
  descripcion text,
  tema        int,                       -- 1..5, correspond aux thèmes des apuntes
  archivo     text not null,             -- chemin dans le bucket Storage "materiales"
  publico     boolean not null default false,
  creado_en   timestamptz not null default now()
);

-- Sécurité (Row Level Security) : qui voit quoi
alter table public.perfiles   enable row level security;
alter table public.materiales enable row level security;

create policy "perfil: leer el propio"    on public.perfiles for select using (auth.uid() = id);
create policy "perfil: editar el propio"  on public.perfiles for update using (auth.uid() = id);

create policy "materiales: públicos para todos"       on public.materiales for select using (publico);
create policy "materiales: todo para usuarios logados" on public.materiales for select using (auth.role() = 'authenticated');
create policy "materiales: admin gestiona" on public.materiales for all
  using (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin'));
```

Fichiers (PDF des apuntes complets, etc.) : **Storage → New bucket** `materiales` (privé). Politique : lecture
autorisée aux utilisateurs authentifiés (`authenticated`), écriture réservée à l'admin.

Pour vous donner le rôle admin : **Table Editor → perfiles** → votre ligne → `rol` = `admin`.

## 3. Pages `registro.html` et `login.html`

Créer deux pages au même niveau que `index.html` (même en-tête/thème). Le cœur du code, avec la bibliothèque
officielle chargée depuis un CDN :

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const SUPABASE_URL = 'https://abcd1234.supabase.co';   // ← Project URL
  const SUPABASE_ANON_KEY = 'eyJ...';                     // ← anon public key
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Inscription (formulaire avec #email, #password, #nombre)
  async function registrar() {
    const { error } = await sb.auth.signUp({
      email: email.value, password: password.value,
      options: { data: { nombre: nombre.value } }
    });
    alert(error ? error.message : 'Revisa tu correo para confirmar la cuenta.');
  }

  // Connexion
  async function entrar() {
    const { error } = await sb.auth.signInWithPassword({ email: email.value, password: password.value });
    if (error) alert(error.message); else location.href = 'index.html#usuarios';
  }

  // Mot de passe oublié
  async function recuperar() {
    const { error } = await sb.auth.resetPasswordForEmail(email.value, { redirectTo: location.origin + '/login.html' });
    alert(error ? error.message : 'Te hemos enviado un enlace para restablecer la contraseña.');
  }
</script>
```

Dans `index.html`, remplacer les deux liens Joomla de la carte `#usuarios` par `registro.html` et `login.html`, et
afficher l'état de session :

```js
const { data: { session } } = await sb.auth.getSession();
if (session) { /* montrer "Hola, <nombre>" + bouton "Cerrar sesión" (sb.auth.signOut()) + lien vers los materiales */ }
```

## 4. Lister les contenus réservés

```js
const { data: materiales } = await sb.from('materiales').select('*').order('tema');
// Pour un fichier du bucket privé : URL temporaire valable 1 h
const { data } = await sb.storage.from('materiales').createSignedUrl(m.archivo, 3600);
```

## 5. Migrer les utilisateurs de Joomla (optionnel)

Joomla stocke les mots de passe hachés (bcrypt) : ils ne peuvent pas être copiés tels quels dans Supabase.
Deux options :
- **Simple** : exporter la liste des e-mails depuis Joomla (table `#__users`), les importer via
  *Authentication → Users → Invite* (Supabase envoie un e-mail « créez votre mot de passe ») ;
- **Avancée** : script d'import via l'API Admin (`auth.admin.createUser`) avec `email_confirm: true` puis envoi d'un
  lien de réinitialisation.

## 6. Basculer le domaine

Quand tout fonctionne : dans Vercel → *Domains* ajouter `organizaciondeportiva.org` et `www.`, puis modifier les DNS
chez le registrar (A → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`). Mettre à jour *Site URL* dans Supabase.
Garder l'ancien hébergement Joomla quelques semaines en lecture seule, le temps de vérifier que rien ne manque.

## Ce qu'il me faut pour l'implémenter

1. Le `Project URL` et la clé `anon public` du projet Supabase (elles sont publiques par nature : elles iront dans le HTML).
2. Décider ce qui est réservé aux utilisateurs connectés (ex. PDF complets des apuntes) et ce qui reste public.
3. Le texte des e-mails (confirmation, mot de passe oublié) si vous voulez les personnaliser en espagnol.

Avec ça, je crée `registro.html`, `login.html`, la carte « Área de usuarios » dynamique et la liste des materiales.
