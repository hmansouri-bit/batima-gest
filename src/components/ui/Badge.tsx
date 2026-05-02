import React from 'react';

type BadgeType = 'priorite' | 'statut' | 'type_espace';
type BadgeVariant = string;

interface BadgeProps {
  type: BadgeType;
  value: string;
  className?: string;
}

export function Badge({ type, value, className = '' }: BadgeProps) {
  let bgColor = 'bg-slate-100 text-slate-800';
  let label = value;

  if (type === 'statut') {
    switch (value) {
      case 'en_attente':
        bgColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        label = 'En attente';
        break;
      case 'en_cours':
        bgColor = 'bg-blue-100 text-blue-800 border-blue-200';
        label = 'En cours';
        break;
      case 'resolu':
        bgColor = 'bg-green-100 text-green-800 border-green-200';
        label = 'Résolu';
        break;
      case 'rejete':
        bgColor = 'bg-red-100 text-red-800 border-red-200';
        label = 'Rejeté';
        break;
    }
  } else if (type === 'priorite') {
    switch (value) {
      case 'basse':
        bgColor = 'bg-slate-100 text-slate-700 border-slate-200';
        label = 'Basse';
        break;
      case 'normale':
        bgColor = 'bg-blue-50 text-blue-700 border-blue-200';
        label = 'Normale';
        break;
      case 'haute':
        bgColor = 'bg-orange-100 text-orange-800 border-orange-200';
        label = 'Haute';
        break;
      case 'urgente':
        bgColor = 'bg-red-100 text-red-800 border-red-200';
        label = 'Urgente';
        break;
    }
  } else if (type === 'type_espace') {
    bgColor = 'bg-primary-50 text-primary-700 border-primary-200';
    // Capitalize first letter and replace underscore with space
    label = value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ');
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgColor} ${className}`}>
      {label}
    </span>
  );
}
