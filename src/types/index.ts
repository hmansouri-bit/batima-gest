export type PrioriteType = 'basse' | 'normale' | 'haute' | 'urgente';
export type StatutType = 'en_attente' | 'en_cours' | 'resolu' | 'rejete';
export type EspaceType = 'ascenseur' | 'couloir' | 'parking' | 'jardin' | 'toit' | 'local_poubelle' | 'local_velo' | 'escalier' | 'autre';

export interface Resident {
  id: string; // UUID from auth.users
  full_name: string;
  phone?: string | null;
  apartment_number: string;
  building_name: string;
  avatar_url?: string | null;
  created_at?: string;
}

export interface PartieCommune {
  id: string;
  nom: string;
  type: EspaceType;
  description?: string | null;
  etage?: string | null;
  image_url?: string | null;
  created_at?: string;
}

export interface Signalement {
  id: string;
  resident_id: string;
  espace_id: string;
  titre: string;
  description: string;
  priorite: PrioriteType;
  statut: StatutType;
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  resident?: Resident;
  espace?: PartieCommune;
}

export interface SignalementInsert {
  resident_id?: string; // Will be set by server or client context
  espace_id: string;
  titre: string;
  description: string;
  priorite: PrioriteType;
  photo_url?: string | null;
}
