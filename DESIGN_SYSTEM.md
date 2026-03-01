# Killykeen Design System

Source de vérité pour tout le produit. Toute nouvelle page ou composant DOIT respecter ces règles.

## Fond & Surfaces

- **Body** : `#0B1426` avec gradient animé (`water-bg` / `water-drift`)
- **Cartes** : `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6`
- **Cartes internes** (éléments dans une carte) : `bg-white/[0.08] border border-white/10 rounded-xl p-4`
- Aucun fond blanc, aucun fond gris

## Typographie — Tailles

> Aucun texte sous 16px

| Token     | Taille | Usage                                              |
|-----------|--------|-----------------------------------------------------|
| `text-base` | 16px | Taille MINIMALE absolue pour tout texte visible      |
| `text-lg`   | 18px | Labels, descriptions, données secondaires, notes     |
| `text-xl`   | 20px | Titres de cartes, noms de features, sous-titres      |
| `text-2xl`  | 24px | Titres de sections, titres de pages                  |
| `text-3xl`  | 30px | Données chiffrées importantes (heures, scores)       |
| `text-4xl`  | 36px | Données chiffrées primaires (température)            |
| `text-5xl`  | 48px | Donnée hero si applicable                            |

## Typographie — Polices

- **Plus Jakarta Sans** (`font-sans`) : tout le texte (body, labels, titres, descriptions)
- **Space Grotesk** (`font-[family-name:var(--font-space)]`) : toutes les données chiffrées (température, profondeur, vent, heures, coordonnées, scores)

## Typographie — Couleurs & Poids

| Niveau | Usage               | Couleur                   | Poids          |
|--------|---------------------|---------------------------|----------------|
| 1      | Données primaires    | `#FFFFFF` blanc pur       | `font-bold`    |
| 2      | Données secondaires  | `#F1F5F9`                 | `font-semibold`|
| 3      | Contexte             | `rgba(255,255,255,0.75)` → `text-white/75` | `font-medium`  |
| 4      | Labels de champs     | `rgba(255,255,255,0.7)` → `text-white/70`  | `font-medium`  |

- **Titres de sections** : `text-[#F1F5F9] font-bold uppercase tracking-wide`
- **Notes/descriptions longues** : `text-white/80 font-normal text-lg`

## Couleurs d'accent

| Couleur         | Code      | Usage                                               |
|-----------------|-----------|-----------------------------------------------------|
| Ambre           | `#F59E0B` | Highlights, score 5/5, majeures solunar, données importantes |
| Vert            | `#22C55E` | Conditions favorables, pression hausse, mineures solunar |
| Rouge doux      | `#EF4444` à 80% opacité | Pression baisse, alertes          |
| Blanc atténué   | `text-white/70` à `text-white/80` | Tout le reste             |

## Badges & Pills

- Border-radius : `rounded-full`
- Padding : `px-3 py-1`
- Fond : couleur d'accent à 20% opacité, texte en couleur d'accent
- Taille texte : `text-base font-semibold`

## Espacement

| Élément                    | Valeur     |
|----------------------------|------------|
| Gap entre sections          | 32px (`gap-8`)  |
| Gap entre cartes            | 16px (`gap-4`)  |
| Padding interne des cartes  | 24px (`p-6`)    |
| Padding interne éléments    | 16px (`p-4`)    |

## Champs éditables (inputs)

```
bg-white/5 border border-white/10 rounded-xl
text-lg text-white placeholder:text-white/40
px-4 py-3 min-h-[48px]
focus:border-amber-500/50 focus:outline-none
```

## Navigation

- Sticky top avec `backdrop-blur`
- Logo : `text-xl font-bold`
- Tabs : `text-lg font-medium px-6 py-3 rounded-full`
- Tab active : `bg-white/15 text-white`
- Tab inactive : `text-white/70`
- Touch target minimum : 48px

## Responsive

- Mobile first (375px)
- Conteneur max-width desktop : `calc(100vw - 600px)`, minimum 800px
- Padding horizontal mobile : 16px (`px-4`)
- Padding horizontal desktop : 32px (`px-8`)

## Composants utilitaires partagés

Tous dans `components/ui/` :

- `GlassCard` : carte liquid glass standard (`children`, `className`)
- `SectionTitle` : titre de section (`children`)
- `DataValue` : donnée chiffrée en Space Grotesk (`value`, `unit`, `size`)
- `Badge` : pill colorée (`label`, `color`)
- `EditableField` : champ éditable avec auto-save (`value`, `onSave`, `placeholder`, `type`)
