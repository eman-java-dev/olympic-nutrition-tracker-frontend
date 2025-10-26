import { Injectable, signal } from '@angular/core';
type Lang = 'en' | 'fr';
type Dict = Record<string,{en:string,fr:string}>;
const D: Dict = {
  'brand':{en:'NUTRITION TRACKER',fr:'NUTRITION TRACKER'},
  'nav.home':{en:'Home',fr:'Accueil'}, 'nav.athletes':{en:'Athletes',fr:'Athlètes'},
  'nav.nutrition':{en:'Nutrition',fr:'Nutrition'}, 'nav.consultations':{en:'Consultations',fr:'Consultations'},
  'nav.coaches':{en:'Coaches',fr:'Coachs'}, 'nav.dashboard':{en:'Dashboard',fr:'Tableau de bord'},
  'cta.signin':{en:'Sign in',fr:'Se connecter'}, 'cta.start':{en:'Start now',fr:'Commencer'},

  'home.kicker':{en:'Track smarter',fr:'Suivez mieux'},
  'home.title':{en:'Your nutrition, your performance — tracked precisely',fr:'Votre nutrition, vos performances — suivies précisément'},
  'home.subtitle':{en:'Flexible meal plans, macro tracking, water & sleep, and a clean dashboard.',fr:'Plans de repas flexibles, suivi des macros, eau & sommeil, et un tableau de bord clair.'},
  'home.cta1':{en:'Start tracking',fr:'Commencer le suivi'},
  'home.cta2':{en:'Explore features',fr:'Découvrir les fonctionnalités'},
  'home.sections':{en:'Main Sections',fr:'Sections principales'},
  'card.macros.title':{en:'Macro Calculator',fr:'Calculateur de macros'},
  'card.macros.desc':{en:'Set daily targets for protein/carbs/fats.',fr:'Définissez des objectifs quotidiens pour protéines/glucides/lipides.'},
  'card.athletes.title':{en:'Athletes',fr:'Athlètes'},
  'card.athletes.desc':{en:'Manage athletes & measurements (CRUD).',fr:'Gérez les athlètes & mesures (CRUD).'},
  'card.consult.title':{en:'Consultations',fr:'Consultations'},
  'card.consult.desc':{en:'Book a session with a nutritionist.',fr:'Réservez une séance avec un nutritionniste.'},

  'athletes.title':{en:'Athletes',fr:'Athlètes'}, 'athletes.help':{en:'Add / Edit / Delete — works locally, API later.',fr:'Ajouter / Modifier / Supprimer — local pour l’instant, API plus tard.'},
  'athletes.name':{en:'Name*',fr:'Nom*'}, 'athletes.age':{en:'Age',fr:'Âge'},
  'athletes.weight':{en:'Weight (kg)',fr:'Poids (kg)'}, 'athletes.height':{en:'Height (cm)',fr:'Taille (cm)'},
  'athletes.add':{en:'Add',fr:'Ajouter'}, 'athletes.update':{en:'Update',fr:'Mettre à jour'},
  'athletes.cancel':{en:'Cancel',fr:'Annuler'}, 'athletes.actions':{en:'Actions',fr:'Actions'}, 'athletes.noData':{en:'No data yet.',fr:'Pas de données.'},

  'nutrition.title':{en:'Nutrition',fr:'Nutrition'},
  'nutrition.help':{en:'Log meals locally with macro summary.',fr:'Consignez localement les repas avec résumé des macros.'},
  'nutrition.date':{en:'Date',fr:'Date'}, 'nutrition.cal':{en:'Calories',fr:'Calories'},
  'nutrition.p':{en:'Protein (g)',fr:'Protéines (g)'}, 'nutrition.c':{en:'Carbs (g)',fr:'Glucides (g)'},
  'nutrition.f':{en:'Fat (g)',fr:'Lipides (g)'}, 'nutrition.notes':{en:'Notes',fr:'Notes'},
  'nutrition.add':{en:'Add',fr:'Ajouter'}, 'nutrition.update':{en:'Update',fr:'Mettre à jour'}, 'nutrition.cancel':{en:'Cancel',fr:'Annuler'},
  'nutrition.summary':{en:'Summary',fr:'Résumé'},

  'consult.title':{en:'Consultations',fr:'Consultations'},
  'consult.help':{en:'Book & manage appointments (local).',fr:'Réservez & gérez les rendez-vous (local).'},
  'consult.name':{en:'Your name',fr:'Votre nom'}, 'consult.when':{en:'Date & time',fr:'Date & heure'},
  'consult.note':{en:'Note',fr:'Note'}, 'consult.book':{en:'Book',fr:'Réserver'}, 'consult.noData':{en:'No bookings.',fr:'Aucune réservation.'},

  'coaches.title':{en:'Coaches',fr:'Coachs'},
  'coaches.help':{en:'Add / Edit / Delete coaches — local.',fr:'Ajouter / Modifier / Supprimer des coachs — local.'},
  'coaches.name':{en:'Name*',fr:'Nom*'}, 'coaches.spec':{en:'Specialty',fr:'Spécialité'},
  'coaches.email':{en:'Email',fr:'E-mail'}, 'coaches.phone':{en:'Phone',fr:'Téléphone'},
  'coaches.add':{en:'Add',fr:'Ajouter'}, 'coaches.update':{en:'Update',fr:'Mettre à jour'}, 'coaches.cancel':{en:'Cancel',fr:'Annuler'},
  'coaches.noData':{en:'No data yet.',fr:'Pas de données.'}
};
@Injectable({providedIn:'root'})
export class LangService {
  lang = signal<Lang>((localStorage.getItem('lang') as Lang) || 'en');
  setLang(l:Lang){ this.lang.set(l); localStorage.setItem('lang', l); }
  t(key:string){ const l=this.lang(); return (D[key]?.[l]) ?? key; }
}
