/**
 * Test file for compatibility service
 * This file can be used to manually test the compatibility calculation logic
 */

import { compatibilityService } from './lib/compatibility'
import { User } from './types'

// Test users with different profiles
const user1: User = {
  id: 'user1',
  email: 'user1@test.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  createdAt: new Date(),
  updatedAt: new Date(),
  age: 28,
  birthDate: new Date('1996-01-01'),
  gender: 'male',
  city: 'Abidjan',
  country: 'Côte d\'Ivoire',
  profession: 'Ingénieur',
  education: 'Master',
  languages: ['Français', 'Anglais'],
  faithRelation: 'Je prie quotidiennement',
  faithImportance: 'very_important',
  community: 'Église protestante',
  faithInRelationship: 'Prier ensemble',
  values: ['Foi', 'Famille', 'Fidélité', 'Respect'],
  whyHere: 'Trouver un partenaire chrétien',
  seriousRelationship: 'Une relation basée sur la confiance',
  faithInCouple: 'Prier ensemble',
  wantsMarriage: true,
  wantsChildren: true,
  communicationImportance: 'Très important',
  livingLocation: 'Côte d\'Ivoire',
  lifeProjects: 'Fonder une famille',
  interests: ['Musique', 'Lecture', 'Sport', 'Voyages'],
  photos: [],
  mainPhoto: '',
  prefAgeMin: 25,
  prefAgeMax: 35,
  prefDistance: 50,
  prefObjective: 'marriage',
  prefFaithImportance: 'very_important',
  prefWantsChildren: true,
  profileCompletion: 100,
  isComplete: true,
  isActive: true
}

const user2: User = {
  id: 'user2',
  email: 'user2@test.com',
  firstName: 'Marie',
  lastName: 'Kouassi',
  createdAt: new Date(),
  updatedAt: new Date(),
  age: 26,
  birthDate: new Date('1998-01-01'),
  gender: 'female',
  city: 'Abidjan',
  country: 'Côte d\'Ivoire',
  profession: 'Enseignante',
  education: 'Licence',
  languages: ['Français'],
  faithRelation: 'Je vais à l\'église régulièrement',
  faithImportance: 'very_important',
  community: 'Église protestante',
  faithInRelationship: 'Aller à l\'église ensemble',
  values: ['Foi', 'Famille', 'Fidélité', 'Honnêteté'],
  whyHere: 'Trouver un partenaire chrétien',
  seriousRelationship: 'Un engagement durable',
  faithInCouple: 'Aller à l\'église ensemble',
  wantsMarriage: true,
  wantsChildren: true,
  communicationImportance: 'Important',
  livingLocation: 'Côte d\'Ivoire',
  lifeProjects: 'Élever une famille chrétienne',
  interests: ['Musique', 'Cuisine', 'Art', 'Nature'],
  photos: [],
  mainPhoto: '',
  prefAgeMin: 25,
  prefAgeMax: 35,
  prefDistance: 50,
  prefObjective: 'marriage',
  prefFaithImportance: 'very_important',
  prefWantsChildren: true,
  profileCompletion: 100,
  isComplete: true,
  isActive: true
}

const user3: User = {
  id: 'user3',
  email: 'user3@test.com',
  firstName: 'Paul',
  lastName: 'Martin',
  createdAt: new Date(),
  updatedAt: new Date(),
  age: 45,
  birthDate: new Date('1979-01-01'),
  gender: 'male',
  city: 'Paris',
  country: 'France',
  profession: 'Médecin',
  education: 'Doctorat',
  languages: ['Français'],
  faithRelation: 'Ma foi est importante',
  faithImportance: 'moderate',
  community: 'Église catholique',
  faithInRelationship: 'Partager la même foi',
  values: ['Travail', 'Succès', 'Indépendance'],
  whyHere: 'Faire des rencontres sérieuses',
  seriousRelationship: 'Une relation avec des valeurs communes',
  faithInCouple: 'Partager la même foi',
  wantsMarriage: false,
  wantsChildren: false,
  communicationImportance: 'Important',
  livingLocation: 'France',
  lifeProjects: 'Avancer dans ma carrière',
  interests: ['Cinéma', 'Voyages', 'Gastronomie'],
  photos: [],
  mainPhoto: '',
  prefAgeMin: 40,
  prefAgeMax: 50,
  prefDistance: 100,
  prefObjective: 'serious',
  prefFaithImportance: 'moderate',
  prefWantsChildren: false,
  profileCompletion: 100,
  isComplete: true,
  isActive: true
}

// Run tests
console.log('=== Compatibility Service Tests ===\n')

// Test 1: High compatibility (similar profiles)
console.log('Test 1: High compatibility (similar profiles)')
const score1 = compatibilityService.calculateCompatibility(user1, user2)
const factors1 = compatibilityService.getCompatibilityFactors(user1, user2)
console.log('User1 vs User2 Score:', score1)
console.log('Factors:', factors1)
console.log('Explanation:', compatibilityService.getCompatibilityExplanation(user1, user2))
console.log()

// Test 2: Low compatibility (different profiles)
console.log('Test 2: Low compatibility (different profiles)')
const score2 = compatibilityService.calculateCompatibility(user1, user3)
const factors2 = compatibilityService.getCompatibilityFactors(user1, user3)
console.log('User1 vs User3 Score:', score2)
console.log('Factors:', factors2)
console.log('Explanation:', compatibilityService.getCompatibilityExplanation(user1, user3))
console.log()

// Test 3: Medium compatibility
console.log('Test 3: Medium compatibility')
const score3 = compatibilityService.calculateCompatibility(user2, user3)
const factors3 = compatibilityService.getCompatibilityFactors(user2, user3)
console.log('User2 vs User3 Score:', score3)
console.log('Factors:', factors3)
console.log('Explanation:', compatibilityService.getCompatibilityExplanation(user2, user3))
console.log()

console.log('=== Tests Complete ===')
