import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import type { Produit } from './types';

export type LignePanier = { produit: Produit; quantite: number };

type EtatPanier = {
  lignes: LignePanier[];
  total: number;
  nombre: number;
  ajouter: (p: Produit) => void;
  changer: (id: string, quantite: number) => void;
  quantiteDe: (id: string) => number;
  vider: () => void;
};

const Contexte = createContext<EtatPanier | null>(null);

export function FournisseurPanier({ children }: { children: ReactNode }) {
  const [lignes, setLignes] = useState<LignePanier[]>([]);

  const valeur = useMemo<EtatPanier>(() => ({
    lignes,
    total: lignes.reduce((s, l) => s + l.produit.prix_vente * l.quantite, 0),
    nombre: lignes.reduce((s, l) => s + l.quantite, 0),
    ajouter: (p) => setLignes((ls) => {
      const ex = ls.find((l) => l.produit.id === p.id);
      if (ex) return ls.map((l) => l.produit.id === p.id
        ? { ...l, quantite: Math.min(l.quantite + 1, p.stock) } : l);
      return [...ls, { produit: p, quantite: 1 }];
    }),
    changer: (id, q) => setLignes((ls) => q <= 0
      ? ls.filter((l) => l.produit.id !== id)
      : ls.map((l) => l.produit.id === id ? { ...l, quantite: Math.min(q, l.produit.stock) } : l)),
    quantiteDe: (id) => lignes.find((l) => l.produit.id === id)?.quantite ?? 0,
    vider: () => setLignes([]),
  }), [lignes]);

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function usePanier() {
  const c = useContext(Contexte);
  if (!c) throw new Error('usePanier doit être utilisé dans FournisseurPanier');
  return c;
}
