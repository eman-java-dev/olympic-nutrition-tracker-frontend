
import { Injectable, inject, signal, DOCUMENT } from '@angular/core';

import { readLocalPreference, writeLocalPreference } from './browser-storage';

type Lang = 'en' | 'fr';
type Dictionary = Record<string, Record<Lang, string>>;

const translations: Dictionary = {
  'brand': { en: 'NUTRITION TRACKER', fr: 'NUTRITION TRACKER' },
  'nav.main': { en: 'Main navigation', fr: 'Navigation principale' },
  'nav.home': { en: 'Home', fr: 'Accueil' },
  'nav.athletes': { en: 'Athletes', fr: 'Athlètes' },
  'nav.nutrition': { en: 'Nutrition', fr: 'Nutrition' },
  'nav.consultations': { en: 'Consultations', fr: 'Consultations' },
  'nav.coaches': { en: 'Coaches', fr: 'Coachs' },
  'nav.signin': { en: 'Sign in', fr: 'Se connecter' },
  'nav.signout': { en: 'Sign out', fr: 'Se déconnecter' },
  'common.add': { en: 'Add', fr: 'Ajouter' },
  'common.edit': { en: 'Edit', fr: 'Modifier' },
  'common.delete': { en: 'Delete', fr: 'Supprimer' },
  'common.update': { en: 'Save changes', fr: 'Enregistrer les modifications' },
  'common.cancel': { en: 'Cancel', fr: 'Annuler' },
  'common.actions': { en: 'Actions', fr: 'Actions' },
  'common.date': { en: 'Date', fr: 'Date' },
  'common.name': { en: 'Name', fr: 'Nom' },
  'common.notes': { en: 'Notes', fr: 'Notes' },
  'common.refresh': { en: 'Refresh', fr: 'Rafraîchir' },
  'common.loading': { en: 'Loading…', fr: 'Chargement…' },
  'common.athlete': { en: 'Athlete', fr: 'Athlète' },
  'common.coach': { en: 'Coach', fr: 'Coach' },
  'common.selectAthlete': { en: 'Select an athlete', fr: 'Sélectionner un athlète' },
  'common.selectCoach': { en: 'Select a coach', fr: 'Sélectionner un coach' },
  'common.readOnlyAdmin': { en: 'Read-only access. Only administrators can make changes.', fr: 'Consultation uniquement. Seuls les administrateurs peuvent apporter des modifications.' },
  'common.readOnlyCoach': { en: 'Read-only access. Administrators and coaches can add and edit records.', fr: 'Consultation uniquement. Les administrateurs et les coachs peuvent ajouter et modifier des enregistrements.' },
  'common.adminOnly': { en: 'Only administrators can perform this action.', fr: 'Seuls les administrateurs peuvent effectuer cette action.' },
  'common.coachOnly': { en: 'Only administrators and coaches can perform this action.', fr: 'Seuls les administrateurs et les coachs peuvent effectuer cette action.' },
  'common.confirmDelete': { en: 'Delete this record?', fr: 'Supprimer cet enregistrement ?' },
  'common.created': { en: 'Record added.', fr: 'Enregistrement ajouté.' },
  'common.updated': { en: 'Changes saved.', fr: 'Modifications enregistrées.' },
  'common.deleted': { en: 'Record deleted.', fr: 'Enregistrement supprimé.' },
  'pager.label': { en: 'Pagination', fr: 'Pagination' },
  'pager.page': { en: 'Page', fr: 'Page' },
  'pager.of': { en: 'of', fr: 'sur' },
  'pager.previous': { en: 'Previous', fr: 'Précédente' },
  'pager.next': { en: 'Next', fr: 'Suivante' },
  'error.forbidden': { en: 'The server denied access to this action.', fr: 'Le serveur a refusé l’accès à cette action.' },
  'error.unauthorized': { en: 'Your session is no longer valid. Sign in again.', fr: 'Votre session n’est plus valide. Reconnectez-vous.' },
  'error.unavailable': { en: 'The server is unavailable. Try again.', fr: 'Le serveur est indisponible. Réessayez.' },
  'error.service': { en: 'A server error occurred. Try again.', fr: 'Une erreur est survenue sur le serveur. Réessayez.' },
  'error.invalidData': { en: 'The server rejected the submitted data. Check the form and try again.', fr: 'Le serveur a rejeté les données. Vérifiez le formulaire et réessayez.' },
  'error.conflict': { en: 'This action conflicts with existing data.', fr: 'Cette action est incompatible avec les données existantes.' },
  'error.missingId': { en: 'This record has no identifier. Refresh the list and try again.', fr: 'Cet enregistrement n’a pas d’identifiant. Rafraîchissez la liste et réessayez.' },
  'error.load': { en: 'Could not load the list. Try refreshing it.', fr: 'Impossible de charger la liste. Essayez de la rafraîchir.' },
  'error.lookups': { en: 'Could not load all form options. Refresh to try again.', fr: 'Impossible de charger toutes les options du formulaire. Rafraîchissez la page pour réessayer.' },
  'error.save': { en: 'Could not save the record.', fr: 'Impossible d’enregistrer les données.' },
  'error.delete': { en: 'Could not delete the record.', fr: 'Impossible de supprimer l’enregistrement.' },
  'athletes.deleteConflict': { en: 'This athlete cannot be deleted because records such as consultations or nutrition entries are linked to them.', fr: 'Impossible de supprimer cet athlète, car des dossiers comme des consultations ou des entrées nutritionnelles lui sont liés.' },
  'validation.form': { en: 'Check the required fields and valid formats.', fr: 'Vérifiez les champs obligatoires et les formats attendus.' },
  'validation.name': { en: 'Enter a name.', fr: 'Saisissez un nom.' },
  'validation.age': { en: 'Enter a whole number for age.', fr: 'Saisissez un nombre entier pour l’âge.' },
  'validation.email': { en: 'Enter a valid email address.', fr: 'Saisissez une adresse e-mail valide.' },
  'validation.nutrition': { en: 'Enter whole numbers for calories and macronutrients.', fr: 'Saisissez des nombres entiers pour les calories et les macronutriments.' },
  'validation.consultation': { en: 'Enter a date, an athlete, a coach, and a message of up to 300 characters.', fr: 'Saisissez une date, un athlète, un coach et un message de 300 caractères maximum.' },
  'home.kicker': { en: 'Track smarter', fr: 'Suivez mieux' },
  'home.title': { en: 'Track nutrition and athletic performance', fr: 'Suivez la nutrition et les performances sportives' },
  'home.subtitle': { en: 'Review athlete measurements, daily nutrition and consultations in one place.', fr: 'Retrouvez les mesures des athlètes, le suivi nutritionnel et les consultations au même endroit.' },
  'home.cta1': { en: 'Start tracking', fr: 'Commencer le suivi' },
  'home.cta2': { en: 'View consultations', fr: 'Voir les consultations' },
  'home.sections': { en: 'Main sections', fr: 'Sections principales' },
  'card.macros.badge': { en: 'Macros', fr: 'Macros' },
  'card.macros.title': { en: 'Nutrition tracking', fr: 'Suivi nutritionnel' },
  'card.macros.desc': { en: 'Review daily calories and macronutrients.', fr: 'Consultez les calories et les macronutriments quotidiens.' },
  'card.athletes.badge': { en: 'Team', fr: 'Équipe' },
  'card.athletes.title': { en: 'Athletes', fr: 'Athlètes' },
  'card.athletes.desc': { en: 'Review athlete records and measurements.', fr: 'Consultez les fiches et les mesures des athlètes.' },
  'card.consult.badge': { en: 'Coaching', fr: 'Accompagnement' },
  'card.consult.title': { en: 'Consultations', fr: 'Consultations' },
  'card.consult.desc': { en: 'View appointments between coaches and athletes.', fr: 'Consultez les rendez-vous entre les coachs et les athlètes.' },
  'athletes.title': { en: 'Athletes', fr: 'Athlètes' },
  'athletes.help': { en: 'View athlete records and measurements.', fr: 'Consultez les fiches et les mesures des athlètes.' },
  'athletes.age': { en: 'Age', fr: 'Âge' },
  'athletes.weight': { en: 'Weight (kg)', fr: 'Poids (kg)' },
  'athletes.height': { en: 'Height (cm)', fr: 'Taille (cm)' },
  'athletes.noData': { en: 'No athletes available.', fr: 'Aucun athlète disponible.' },
  'coaches.title': { en: 'Coaches', fr: 'Coachs' },
  'coaches.help': { en: 'View coach profiles and contact information.', fr: 'Consultez les profils et les coordonnées des coachs.' },
  'coaches.spec': { en: 'Specialty', fr: 'Spécialité' },
  'coaches.email': { en: 'Email', fr: 'E-mail' },
  'coaches.phone': { en: 'Phone', fr: 'Téléphone' },
  'coaches.noData': { en: 'No coaches available.', fr: 'Aucun coach disponible.' },
  'nutrition.title': { en: 'Nutrition', fr: 'Nutrition' },
  'nutrition.help': { en: 'Track daily nutrition for athletes.', fr: 'Suivez la nutrition quotidienne des athlètes.' },
  'nutrition.cal': { en: 'Calories', fr: 'Calories' },
  'nutrition.protein': { en: 'Protein', fr: 'Protéines' },
  'nutrition.carbs': { en: 'Carbs', fr: 'Glucides' },
  'nutrition.fat': { en: 'Fat', fr: 'Lipides' },
  'nutrition.summary': { en: 'Totals on this page', fr: 'Totaux de cette page' },
  'nutrition.noData': { en: 'No nutrition entries available.', fr: 'Aucune donnée nutritionnelle disponible.' },
  'consult.title': { en: 'Consultations', fr: 'Consultations' },
  'consult.help': { en: 'Plan and track appointments between coaches and athletes.', fr: 'Planifiez et suivez les rendez-vous entre les coachs et les athlètes.' },
  'consult.when': { en: 'Date and time', fr: 'Date et heure' },
  'consult.message': { en: 'Message', fr: 'Message' },
  'consult.placeholder': { en: 'Consultation message', fr: 'Message de la consultation' },
  'consult.assignmentRequired': { en: 'Choose your own coach profile and one of your assigned athletes.', fr: 'Choisissez votre propre profil de coach et un athlète qui vous est attribué.' },
  'consult.noData': { en: 'No consultations available.', fr: 'Aucune consultation disponible.' },
  'auth.title': { en: 'Sign in', fr: 'Se connecter' },
  'auth.lead': { en: 'Enter your credentials to continue.', fr: 'Entrez vos identifiants pour continuer.' },
  'auth.username': { en: 'Username', fr: 'Nom d’utilisateur' },
  'auth.password': { en: 'Password', fr: 'Mot de passe' },
  'auth.login': { en: 'Sign in', fr: 'Se connecter' },
  'auth.loading': { en: 'Signing in…', fr: 'Connexion…' },
  'auth.back': { en: 'Back', fr: 'Retour' },
  'auth.throttled': { en: 'Too many attempts. Wait before trying again.', fr: 'Trop de tentatives. Patientez avant de r?essayer.' },
  'auth.retryAfter': { en: 'Try again in about {seconds} seconds.', fr: 'R?essayez dans environ {seconds} secondes.' },
  'error.throttled': { en: 'Too many requests. Wait before trying again.', fr: 'Trop de requ?tes. Patientez avant de r?essayer.' },
  'error.writeTimeout': { en: 'The server did not confirm the change. Refresh to check before retrying.', fr: 'Le serveur n?a pas confirm? la modification. Actualisez les donn?es avant de r?essayer.' },
  'auth.credentials': { en: 'Incorrect username or password.', fr: 'Nom d’utilisateur ou mot de passe incorrect.' },
  'auth.forbidden': { en: 'The server denied sign-in for this account.', fr: 'Le serveur a refusé la connexion à ce compte.' },
  'auth.unavailable': { en: 'The server is unavailable. Check your connection and try again.', fr: 'Le serveur est indisponible. Vérifiez votre connexion et réessayez.' },
  'auth.failed': { en: 'Sign-in failed. Try again.', fr: 'La connexion a échoué. Réessayez.' },
  'auth.expired': { en: 'The server returned an expired session. Try again.', fr: 'Le serveur a renvoyé une session expirée. Réessayez.' },
  'auth.invalid-response': { en: 'The server returned an invalid session.', fr: 'Le serveur a renvoyé une session invalide.' },
  'auth.sessionExpired': { en: 'Your session has expired. Sign in again.', fr: 'Votre session a expiré. Reconnectez-vous.' },
  'auth.sessionRejected': { en: 'Your session is invalid. Sign in again.', fr: 'Votre session est invalide. Reconnectez-vous.' },
};

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<Lang>(readLocalPreference('lang') === 'fr' ? 'fr' : 'en');
  readonly lang = this.current.asReadonly();

  constructor() {
    this.document.documentElement.lang = this.lang();
  }

  setLang(language: Lang): void {
    this.current.set(language);
    this.document.documentElement.lang = language;
    writeLocalPreference('lang', language);
  }

  t(key: string): string {
    return translations[key]?.[this.lang()] ?? key;
  }
}
