# Batima-Gest

Extranet platform for residents of apartment buildings to report maintenance issues in common areas. Built with Next.js 14 and Supabase.

## Mapping du Thème
| Élément | Correspond à |
|---------|-------------|
| Table A (Utilisateurs) | Résidents (`auth.users` + `public.residents`) |
| Table B (Ressources) | Parties Communes (`public.parties_communes`) |
| Table C (Interactions) | Signalements de pannes (`public.signalements`) |
| Fichier Storage | Photo du problème (ascenseur en panne, etc.) téléchargée dans le bucket `signalement-photos` |

## Stack Technique
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend/BaaS**: Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Déploiement**: Vercel (CI/CD auto-deploy)

---

## Lancer en local

### Prérequis
- Node.js (v18+)
- Compte Supabase (gratuit)

### Étape 1 : Créer le projet Supabase
1. Allez sur [Supabase](https://supabase.com) et créez un nouveau projet.
2. Dans le SQL Editor de Supabase, copiez et exécutez le contenu du fichier `supabase.sql` inclus à la racine de ce projet. (Ce fichier crée les tables, les policies RLS, et insère les données de test).
3. Allez dans **Storage** > **Buckets** et créez un nouveau bucket public nommé `signalement-photos`.

### Étape 2 : Configurer l'application
1. Clonez ce dépôt.
2. Créez un fichier `.env.local` à la racine (voir `.env.example`).
3. Renseignez vos clés Supabase trouvées dans **Project Settings > API** :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   ```

### Étape 3 : Installer et Lancer
```bash
npm install
npm run dev
```
Accédez à `http://localhost:3000`

---

## Analyse d'Architecture (500 mots)

### 1. Pourquoi Vercel + Supabase est plus logique financièrement ?
Le choix d'une architecture combinant Vercel pour le frontend et Supabase pour le backend repose sur une optimisation fondamentale des coûts : le passage du modèle CAPEX (Capital Expenditure) au modèle OPEX (Operational Expenditure).
Traditionnellement, déployer une application nécessitait d'acheter ou de louer des serveurs physiques dédiés en permanence (CAPEX). Ce modèle est coûteux au démarrage et inefficace, car on paie pour une capacité maximale même lorsque l'application n'est pas utilisée (par exemple, la nuit pour une app de résidents).
Avec Vercel et Supabase, l'architecture est "Serverless" et "Backend-as-a-Service". Il n'y a aucun coût d'infrastructure initial. On fonctionne en pur OPEX : on paie exactement à l'usage (Pay-as-you-go). De plus, ces plateformes offrent des "Free Tiers" généreux, permettant de lancer et de valider le projet pour 0€ avant d'avoir une traction nécessitant un passage à l'échelle. Pour une copropriété, où le trafic est très prévisible et limité, les coûts resteront quasi nuls indéfiniment.

### 2. Comment Vercel gère-t-il la scalabilité ?
Contrairement à l'hébergement traditionnel qui requiert une gestion manuelle de baies de serveurs, de climatisation et de load balancers, Vercel délègue l'exécution du code à un réseau global de fonctions Serverless et Edge Functions. 
Lorsqu'un résident accède à Batima-Gest, la page est servie via un CDN (Content Delivery Network) global situé au plus proche de l'utilisateur. Si l'application demande une exécution dynamique (ex: rendu côté serveur pour le tableau de bord), Vercel lance "à la volée" une fonction qui exécute le code Next.js, renvoie le résultat, puis s'éteint. S'il y a soudainement 1000 connexions (ex: une panne de courant générale où tous les locataires se connectent en même temps), Vercel instancie automatiquement 1000 fonctions en parallèle. La scalabilité est donc horizontale, instantanée, infinie et complètement transparente pour le développeur.

### 3. Données structurées vs non-structurées
Dans ce projet, nous manipulons deux types de données très différentes :
**Les données structurées** : Elles sont hébergées dans la base de données relationnelle PostgreSQL de Supabase. Cela inclut nos tables `residents`, `parties_communes`, et `signalements`. Elles sont définies par un schéma strict (types de colonnes, clés étrangères). Cette structure garantit l'intégrité des données (ex: un signalement est toujours rattaché à un résident existant) et permet des requêtes complexes et rapides (ex: "compter les signalements 'en_attente' de type 'ascenseur'"). Le RLS (Row Level Security) protège l'accès à ces lignes avec précision.
**Les données non-structurées** : Ce sont les fichiers binaires bruts, ici les photos des incidents téléchargées par les utilisateurs. Elles n'ont pas de schéma de colonnes et leur taille peut varier de quelques Ko à plusieurs Mo. PostgreSQL n'est pas conçu pour stocker efficacement ces gros volumes binaires ("blob"). C'est pourquoi nous utilisons Supabase Storage (basé sur AWS S3), un service de stockage d'objets optimisé. La base PostgreSQL se contente alors de stocker le lien (l'URL) pointant vers ce fichier non-structuré, ce qui maintient la base de données légère et rapide tout en exploitant la puissance du CDN pour distribuer les images.
