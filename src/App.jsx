import { useState, useEffect } from "react";
import {
  LayoutDashboard, Calendar, Shield, Dumbbell, Trophy, Clock,
  Video, Apple, Moon, MessageCircle, Users, User, LogOut, Plus,
  ChevronRight, Star, TrendingUp, CheckCircle2, XCircle, Edit2,
  Trash2, Send, Paperclip, Bell, BellOff, Menu, X, Home,
  BarChart2, Target, Zap, Weight, Activity, Coffee, Droplets,
  Bed, Search, Filter, ChevronDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { db, auth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "./firebase";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { enregistrerSeance, getCurrentUser, setCurrentUser, subscribeToNotifications, notifyNewChatMessage, saveOneSignalPlayerId, notifyNewContent } from "./notifications";

const C = {
  primary: "#7C3AED", accent: "#EC4899", red: "#EF4444",
  orange: "#F97316", blue: "#6366F1", green: "#10B981",
  yellow: "#F59E0B", bg: "#F1F5F9", card: "#FFFFFF",
  text: "#1E293B", muted: "#94A3B8", border: "#E2E8F0",
};

// ─── 106 SÉANCES ─────────────────────────────────────────────────────────────
const ALL_SESSIONS = [
  {id:1,date:"2026-06-09",type:"Collectif",coach:"",duration:120,satisfaction:7,katas:["Gojūshiho Dai", "Gojūshiho Shō", "Unsu", "Gankaku"],techniques:["Kihon (Bases)", "Yoko Geri"],notes:"Taper moins sur les pics, sur gankaku bien faire le premier coup de coude, attention iquité trop bas"},
  {id:2,date:"2026-06-07",type:"Collectif",coach:"Jonathan",duration:120,satisfaction:8,katas:["Unsu", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Ne pas trop m'écraser sur le kiba, Pose yuko plus rapide (gankaku) Bien tourner le talon sur le zen à la fin de la ligne goju Pieds bien parallèles sur la ligne kiba Attention main en griffe"},
  {id:3,date:"2026-06-04",type:"Collectif",coach:"Romain",duration:120,satisfaction:6,katas:["Gojūshiho Shō"],techniques:[],notes:"S'écraser sur les kiba, ouvrir plus l'armée, moins taper du pied sur la pose kiba de la ligne"},
  {id:4,date:"2026-06-03",type:"Collectif",coach:"Helvétia",duration:75,satisfaction:8,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu", "Supaenpei", "Kanku Shō"],techniques:[],notes:"Moins s'écraser sur les kiba de goju et les zen de supa, tendre la jambe arrière sur le zen de kanku sho"},
  {id:5,date:"2026-06-02",type:"Collectif",coach:"Romain",duration:120,satisfaction:6,katas:["Gojūshiho Shō", "Unsu"],techniques:["Kihon (Bases)"],notes:"Enchaîner plus les rotations sur goju, passer bien par le milieu avant les changements de direction"},
  {id:6,date:"2026-05-30",type:"Collectif",coach:"Helvétia, Olivier",duration:120,satisfaction:9,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Gankaku", "Unsu", "Kanku Shō"],techniques:[],notes:"Armer correctement sur ligne unsu, ne pas remonter sur ligne kiba, dynamique sur les déplacements, contrôler les temps lents"},
  {id:7,date:"2026-05-28",type:"Collectif",coach:"Olivier",duration:120,satisfaction:7,katas:["Kanku Shō", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku"],techniques:["Kihon (Bases)", "Mawashi Geri"],notes:"Rester droite à la fin de unsu après le saut, être plus dynamique"},
  {id:8,date:"2026-05-27",type:"Collectif",coach:"Helvétia",duration:90,satisfaction:8,katas:["Kanku Shō"],techniques:[],notes:"Pour le saut aller vite le sol au début, avant de chercher le premier saut kokutsu, zen et non fudo sur les positions à la fin"},
  {id:9,date:"2026-05-26",type:"Collectif",coach:"Helvétia",duration:120,satisfaction:8,katas:["Gojūshiho Shō"],techniques:[],notes:"Armer correctement, aller moins loin chercher sur le pic, rétrécir le zen, bien tourner le talon sur le zen inversé à la fin de la ligne"},
  {id:10,date:"2026-05-23",type:"Collectif",coach:"Hugo",duration:120,satisfaction:8,katas:["Gojūshiho Dai"],techniques:[],notes:"Lever les iquités"},
  {id:11,date:"2026-05-21",type:"Collectif",coach:"Hugo",duration:120,satisfaction:8,katas:["Unsu"],techniques:[],notes:"Ne pas trop bouger le haut du corps sur le début, jouer plus sur les temps carêmes"},
  {id:12,date:"2026-05-19",type:"Collectif",coach:"Hugo",duration:90,satisfaction:8,katas:["Gojūshiho Dai"],techniques:["Kihon (Bases)", "Yoko Geri"],notes:"Moins de bruit de bouche"},
  {id:13,date:"2026-05-17",type:"Perso",coach:"Helvétia",duration:75,satisfaction:8,katas:["Gojūshiho Dai", "Supaenpei"],techniques:[],notes:"Travail sur les corrections proposées par Helvétia"},
  {id:14,date:"2026-05-16",type:"Collectif",coach:"Hugo, Olivier",duration:120,satisfaction:8,katas:["Gojūshiho Dai"],techniques:["Kihon (Bases)"],notes:"Attention pied gauche qui se décale dans les rotations de goju, levier iquité, plus vite au sol après yuko"},
  {id:15,date:"2026-05-16",type:"Collectif",coach:"Olivier",duration:120,satisfaction:7,katas:["Unsu"],techniques:["Mae Geri", "Mawashi Geri", "Yoko Geri", "Kihon (Bases)"],notes:"Lever le iquité"},
  {id:16,date:"2026-05-13",type:"Perso",coach:"Helvétia",duration:75,satisfaction:8,katas:["Gojūshiho Dai"],techniques:[],notes:"Échauffement spécifique — travail sur positions et techniques"},
  {id:17,date:"2026-05-12",type:"Perso",coach:"Helvétia",duration:60,satisfaction:8,katas:["Supaenpei"],techniques:[],notes:"Exercices de préparation physique"},
  {id:18,date:"2026-05-07",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Unsu"],techniques:[],notes:"Ligne unsu ne pas regarder derrière sur le soto, attention kiba, équilibre le neko"},
  {id:19,date:"2026-05-06",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai"],techniques:[],notes:"Corrections pour l'Equipe"},
  {id:20,date:"2026-05-05",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai"],techniques:[],notes:"Attention iquité trop bas, être bien de face sur les pics"},
  {id:21,date:"2026-05-02",type:"Collectif",coach:"Romain, Helvétia",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu"],techniques:[],notes:"Attention rotation des poignet, sur goju bien armer le bras avant 2eme rotation"},
  {id:22,date:"2026-05-02",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:6,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu"],techniques:[],notes:"Être plus technique, attention iquité trop bas"},
  {id:23,date:"2026-04-30",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Sansai"],techniques:[],notes:"Moins taper du pied et revoir la fin"},
  {id:24,date:"2026-04-28",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Supaenpei"],techniques:[],notes:""},
  {id:25,date:"2026-04-25",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Gankaku"],techniques:[],notes:""},
  {id:26,date:"2026-04-21",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Gojūshiho Shō"],techniques:[],notes:"Penser à plus armer. Rotation bien"},
  {id:27,date:"2026-04-18",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Unsu"],techniques:[],notes:""},
  {id:28,date:"2026-04-16",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Gojūshiho Dai"],techniques:[],notes:"Moins sauter sur les pics"},
  {id:29,date:"2026-04-15",type:"Collectif",coach:"Helvétia",duration:90,satisfaction:7,katas:["Gojūshiho Shō"],techniques:[],notes:"Tourner que sur le talon pour la rotation, ne pas trop taper sur les bras"},
  {id:30,date:"2026-04-09",type:"Collectif",coach:"Romain",duration:90,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku", "Supaenpei"],techniques:[],notes:"Attention ne pas trop taper sur les pics, sur gankaku bien stopper le 2eme sur la ligne"},
  {id:31,date:"2026-04-08",type:"Collectif",coach:"Helvétia",duration:75,satisfaction:8,katas:["Empi", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Fermer le regard, ne pas trop taper les pics goju"},
  {id:32,date:"2026-04-07",type:"Collectif",coach:"Romain",duration:120,satisfaction:1,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu", "Gankaku", "Kanku Shō"],techniques:[],notes:"Rien — il ne s'est occupé que de Romane"},
  {id:33,date:"2026-04-02",type:"Collectif",coach:"",duration:120,satisfaction:6,katas:["Empi", "Gojūshiho Dai", "Gojūshiho Shō", "Unsu"],techniques:[],notes:"Postures"},
  {id:34,date:"2026-03-28",type:"Collectif",coach:"Olivier",duration:120,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku", "Supaenpei", "Kanku Shō"],techniques:[],notes:"Baisser les épaules, attention à pas rentrer les pieds sur kokutsu"},
  {id:35,date:"2026-03-26",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Gojūshiho Dai", "Gankaku", "Unsu"],techniques:[],notes:"Garder toujours la tête droite ! Dai : ne pas taper sur pics, descendre le bras"},
  {id:36,date:"2026-03-25",type:"Collectif",coach:"Helvétia",duration:75,satisfaction:8,katas:["Gojūshiho Shō", "Unsu"],techniques:[],notes:"Descendre moins, redresser le corps sur la ligne kiba"},
  {id:37,date:"2026-03-24",type:"Collectif",coach:"Romain",duration:120,satisfaction:2,katas:[],techniques:[],notes:"TOUT ! 2h à entendre que rien n'était bien…"},
  {id:38,date:"2026-03-21",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:7,katas:["Kanku Shō", "Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Tirer les iquités, stopper plus sur la ligne de unsu"},
  {id:39,date:"2026-03-19",type:"Collectif",coach:"Romain",duration:90,satisfaction:7,katas:["Unsu", "Gojūshiho Shō", "Empi"],techniques:[],notes:"Kiba centré, fudo jambe arrière moins plié"},
  {id:40,date:"2026-03-17",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Kanku Shō", "Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Unsu : stopper plus les shion tsuki, ramener de face sur la ligne sur les changements de jambes"},
  {id:41,date:"2026-03-14",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gankaku"],techniques:[],notes:"Goju : marquer plus les 2 tsuki, plus précis sur les mains"},
  {id:42,date:"2026-03-14",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Kanku Shō", "Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku", "Supaenpei"],techniques:[],notes:"Sho : plus sobre sur les temps lents du début. Unsu : marquer le troisième shion tsuki"},
  {id:43,date:"2026-03-12",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Kanku Shō", "Unsu"],techniques:[],notes:"Prendre son temps sur la ligne unsu"},
  {id:44,date:"2026-03-10",type:"Collectif",coach:"",duration:120,satisfaction:6,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku", "Kanku Shō"],techniques:[],notes:"Plus précise sur tout, descendre plus, rétrécir les positions"},
  {id:45,date:"2026-03-03",type:"Collectif",coach:"Autre",duration:90,satisfaction:7,katas:["Unsu", "Gojūshiho Shō", "Gankaku"],techniques:[],notes:"Plus d'expression, plus de rapidité"},
  {id:46,date:"2026-02-28",type:"Collectif",coach:"Jonathan",duration:150,satisfaction:8,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu"],techniques:[],notes:"Frapper pic droit, armer correctement dans dai"},
  {id:47,date:"2026-02-26",type:"Collectif",coach:"Romain",duration:120,satisfaction:6,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Kanku Shō", "Gankaku"],techniques:[],notes:""},
  {id:48,date:"2026-02-26",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Kanku Shō", "Gojūshiho Shō", "Unsu"],techniques:[],notes:""},
  {id:49,date:"2026-02-25",type:"Collectif",coach:"Helvétia",duration:150,satisfaction:7,katas:["Gojūshiho Shō", "Unsu"],techniques:[],notes:"Goju : attention ouverture pic et pic droit, temps lents, marquer plus le Mae gueri"},
  {id:50,date:"2026-02-24",type:"Collectif",coach:"Autre",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Kanku Shō", "Unsu", "Gankaku", "Gojūshiho Dai"],techniques:[],notes:"Ne pas remonter entre les positions, ouvrir les kiba, tirer les iquités"},
  {id:51,date:"2026-02-22",type:"Collectif",coach:"Jonathan",duration:90,satisfaction:7,katas:["Unsu"],techniques:[],notes:"Mae gueri et respiration, revoir timing dans le bunkai"},
  {id:52,date:"2026-02-21",type:"Collectif",coach:"Jonathan",duration:60,satisfaction:7,katas:["Gojūshiho Shō", "Gojūshiho Dai"],techniques:[],notes:"Les Mae gueri, temps des pics, demi tour haito en 2 temps"},
  {id:53,date:"2026-02-21",type:"Collectif",coach:"Olivier, Hugo, Romain",duration:120,satisfaction:7,katas:["Gojūshiho Shō", "Gankaku", "Kanku Shō"],techniques:[],notes:"Centrer les kiba, ouvrir plus grand armée des pics"},
  {id:54,date:"2026-02-19",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu", "Empi"],techniques:[],notes:"Kiba trop grand"},
  {id:55,date:"2026-02-18",type:"Perso",coach:"",duration:60,satisfaction:8,katas:["Unsu", "Gojūshiho Dai"],techniques:[],notes:"Corrections+sansei"},
  {id:56,date:"2026-02-17",type:"Perso",coach:"Perso",duration:60,satisfaction:8,katas:["Unsu", "Gojūshiho Dai"],techniques:[],notes:"Dai : coordonnées les temps lents, attention pic sur le côté"},
  {id:57,date:"2026-02-15",type:"Collectif",coach:"Jonathan",duration:120,satisfaction:8,katas:["Empi", "Gojūshiho Shō", "Gojūshiho Dai", "Unsu"],techniques:[],notes:"Revoir le mouvement après le 2eme Mae gueri de dai, attention respi trop shito"},
  {id:58,date:"2026-02-14",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu", "Gankaku"],techniques:[],notes:"Kiba, mains plus tendues, épaules en avant"},
  {id:59,date:"2026-02-14",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:8,katas:["Kanku Shō", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Taper plus, plus technique, revoir les kiba"},
  {id:60,date:"2026-02-12",type:"Collectif",coach:"",duration:120,satisfaction:6,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu", "Gankaku", "Kanku Shō"],techniques:[],notes:"Plus propre techniquement"},
  {id:61,date:"2026-02-11",type:"Collectif",coach:"Helvétia",duration:90,satisfaction:8,katas:["Kanku Shō"],techniques:[],notes:"Ne pas plié jambe arrière sur fudo, ne pas lever le pied en commençant, armer yuko correctement"},
  {id:62,date:"2026-02-03",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Unsu"],techniques:[],notes:"Attention épaules qui bougent, ouvrir plus avant de piquer goju"},
  {id:63,date:"2026-01-27",type:"Collectif",coach:"Hugo",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu", "Supaenpei"],techniques:[],notes:"Plus stopper rythme ligne unsu, gros stop après demi tour coup de pied supa"},
  {id:64,date:"2026-01-26",type:"Perso",coach:"Perso",duration:45,satisfaction:7,katas:["Empi", "Gojūshiho Shō"],techniques:[],notes:"Rythme équipe"},
  {id:65,date:"2026-01-22",type:"Collectif",coach:"Hugo",duration:120,satisfaction:9,katas:["Kanku Shō", "Gojūshiho Shō", "Unsu", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Stopper plus le rythme sur dai et sur la ligne de unsu"},
  {id:66,date:"2026-01-20",type:"Collectif",coach:"Romain",duration:120,satisfaction:9,katas:["Unsu", "Kanku Shō", "Gojūshiho Dai", "Gojūshiho Shō"],techniques:[],notes:"Les épaules vers l'avant, moins vite, pic linéaire"},
  {id:67,date:"2026-01-15",type:"Collectif",coach:"Romain",duration:90,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Épaule plus vers l'avant sur les pics, hanche de face sur dai"},
  {id:68,date:"2026-01-13",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Supaenpei"],techniques:[],notes:"Moins sur l'arrière, plus grand me avancée sur dai"},
  {id:69,date:"2026-01-12",type:"Perso",coach:"Perso",duration:45,satisfaction:8,katas:["Gojūshiho Shō"],techniques:[],notes:"Rythme équipe de France"},
  {id:70,date:"2026-01-05",type:"Perso",coach:"Perso, Helvétia",duration:60,satisfaction:8,katas:["Gojūshiho Dai"],techniques:[],notes:""},
  {id:71,date:"2026-01-04",type:"Perso",coach:"",duration:90,satisfaction:6,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Respi"},
  {id:72,date:"2026-01-02",type:"Visio",coach:"Perso, Helvétia",duration:70,satisfaction:8,katas:["Unsu"],techniques:[],notes:"Tomber mieux au sol, attention ramener bien avant changement de jambe sur la ligne"},
  {id:73,date:"2025-12-30",type:"Perso",coach:"",duration:70,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Rythme et respiration"},
  {id:74,date:"2025-12-14",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Gojūshiho Dai", "Unsu"],techniques:["Mae Geri", "Yoko Geri"],notes:"Sur unsu : plus percutant sur la ligne. Dai : marquer plus le coup de coude"},
  {id:75,date:"2025-12-14",type:"Collectif",coach:"Romain, Jonathan",duration:120,satisfaction:9,katas:["Unsu", "Gojūshiho Shō"],techniques:["Yoko Geri", "Mae Geri"],notes:"Unsu : balancer plus les shion tsuki plus vite et plus fort"},
  {id:76,date:"2025-12-11",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "Gojūshiho Shō"],techniques:[],notes:"Sur unsu : balancer les tsuki, pose pied fort. Sur goju: monter les pics"},
  {id:77,date:"2025-12-09",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Gojūshiho Shō"],techniques:["Kihon (Bases)"],notes:"Armer plus en bas, moins vite, épaule alignées"},
  {id:78,date:"2025-12-02",type:"Collectif",coach:"Romain",duration:90,satisfaction:7,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Gankaku", "Supaenpei", "Unsu"],techniques:[],notes:"Calibrer mieux kiba, plus gainer"},
  {id:79,date:"2025-12-01",type:"Perso",coach:"Perso",duration:60,satisfaction:8,katas:["Gojūshiho Shō", "Unsu"],techniques:[],notes:"Corrections"},
  {id:80,date:"2025-11-29",type:"Collectif",coach:"Olivier",duration:120,satisfaction:6,katas:["Gojūshiho Shō", "Unsu"],techniques:[],notes:"Attention genou qui rentre sur zen, placement hanche sur fudo. Malade"},
  {id:81,date:"2025-11-29",type:"Collectif",coach:"Olivier",duration:120,satisfaction:7,katas:["Gojūshiho Dai", "Unsu", "Gankaku"],techniques:[],notes:"Rétrécir kiba"},
  {id:82,date:"2025-11-27",type:"Perso",coach:"Helvétia",duration:90,satisfaction:7,katas:["Gojūshiho Shō", "Unsu", "Kanku Shō"],techniques:[],notes:"Routine d'échauffement compétition"},
  {id:83,date:"2025-11-25",type:"Collectif",coach:"Romain",duration:120,satisfaction:9,katas:["Gankaku", "Gojūshiho Shō"],techniques:[],notes:"Sur mandji mettre le bras arrière parallèle au sol, sur goju stopper avant de lancer le Mae gueri"},
  {id:84,date:"2025-11-22",type:"Collectif",coach:"Olivier, Yves",duration:120,satisfaction:7,katas:["Gojūshiho Dai", "Gojūshiho Shō", "Unsu", "Kanku Shō"],techniques:[],notes:"Lever le genoux pour Mae gueri, marquer plus les mandji"},
  {id:85,date:"2025-11-22",type:"Collectif",coach:"Yves, Olivier",duration:120,satisfaction:7,katas:["Gojūshiho Shō"],techniques:["Kihon (Bases)", "Mae Geri"],notes:"Ne pas remonter sur transitions"},
  {id:86,date:"2025-11-20",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu", "Kanku Shō", "Supaenpei"],techniques:[],notes:"Ne pas chercher le 2eme pic trop loin, descendre plus sur kiai des goju"},
  {id:87,date:"2025-11-19",type:"Collectif",coach:"Jonathan",duration:75,satisfaction:6,katas:[],techniques:[],notes:"Point linéaire, aller chercher moins loin sur gyaku tsuki"},
  {id:88,date:"2025-11-18",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Supaenpei"],techniques:[],notes:"Ne pas aller chercher trop loin sur 2eme pic goju"},
  {id:89,date:"2025-11-17",type:"Perso",coach:"Helvétia",duration:45,satisfaction:7,katas:["Unsu", "Kanku Shō"],techniques:[],notes:"En quart de kata -> Une fois doucement -> Une fois à fond"},
  {id:90,date:"2025-11-15",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Gojūshiho Dai", "Gojūshiho Shō", "Unsu", "Kanku Shō"],techniques:[],notes:"Ouvrir plus pic goju, avoir les hanches de face sur les pics dai"},
  {id:91,date:"2025-11-15",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Unsu", "Gojūshiho Dai"],techniques:["Kihon (Bases)"],notes:"Ne pas rentrer l'épaule sur Mae gueri, fermer les hanches sur les pics"},
  {id:92,date:"2025-11-12",type:"Perso",coach:"Jonathan",duration:60,satisfaction:7,katas:["Gojūshiho Shō"],techniques:[],notes:"Travail sur les corrections de Jonathan"},
  {id:93,date:"2025-11-11",type:"Collectif",coach:"Romain",duration:120,satisfaction:5,katas:[],techniques:["Gyaku Zuki", "Kihon (Bases)", "Shuto", "Uke"],notes:"Être plus carré sur tout, rétrécir tout, être gaine tout le temps"},
  {id:94,date:"2025-10-30",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku", "Supaenpei"],techniques:[],notes:"Sur suparinpei marquer plus le shuto, axer les pics des goju"},
  {id:95,date:"2025-10-30",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "Gojūshiho Shō", "Gojūshiho Dai", "Gankaku", "Supaenpei"],techniques:[],notes:"Sur suparinpei marquer plus le shuto, axer les pics des goju"},
  {id:96,date:"2025-10-29",type:"Privé",coach:"Helvétia",duration:60,satisfaction:8,katas:["Gojūshiho Shō", "Gankaku", "Kanku Shō"],techniques:[],notes:"Armer les yuko sur gankaku, pas de temps d'appel sur pics goju"},
  {id:97,date:"2025-10-28",type:"Collectif",coach:"Romain",duration:120,satisfaction:6,katas:["Kanku Shō", "Empi", "Gojūshiho Shō", "Unsu", "Gojūshiho Dai", "Gankaku"],techniques:[],notes:"Rotation plus rapide, taper plus"},
  {id:98,date:"2025-10-28",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Kanku Shō", "Empi", "Gojūshiho Shō", "Gojūshiho Dai"],techniques:[],notes:"Envoyer ++"},
  {id:99,date:"2025-10-26",type:"Collectif",coach:"Yves",duration:120,satisfaction:8,katas:["Gojūshiho Dai", "Unsu", "Empi"],techniques:[],notes:"Plus fort les rotations kiba"},
  {id:100,date:"2025-10-26",type:"Collectif",coach:"Yves",duration:120,satisfaction:8,katas:["Gojūshiho Shō", "Kanku Shō"],techniques:[],notes:"Attention au Mae gueri et aux alignements des épaules"},
  {id:101,date:"2025-10-24",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Supaenpei", "Gojūshiho Dai", "Gojūshiho Shō", "Unsu", "Empi"],techniques:[],notes:"Sur supa prendre moins de temps après le kiai"},
  {id:102,date:"2025-10-24",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Empi", "Gojūshiho Shō", "Unsu", "Gojūshiho Dai", "Gankaku", "Kanku Shō"],techniques:[],notes:"Attention kiba sur empi"},
  {id:103,date:"2025-10-22",type:"Privé",coach:"Helvétia",duration:45,satisfaction:8,katas:["Gojūshiho Shō", "Gojūshiho Dai", "Unsu", "Gankaku"],techniques:[],notes:"Plus épurer le travail au niveau des hanches"},
  {id:104,date:"2025-10-22",type:"Collectif",coach:"Helvétia",duration:120,satisfaction:8,katas:["Empi", "Unsu", "Gojūshiho Shō", "Gojūshiho Dai"],techniques:[],notes:"Posture"},
  {id:105,date:"2025-10-18",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:8,katas:["Kanku Shō", "Unsu", "Gojūshiho Dai", "Gojūshiho Shō", "Supaenpei", "Gankaku"],techniques:[],notes:"Mae gueri"},
  {id:106,date:"2025-10-18",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Kanku Shō", "Gankaku", "Gojūshiho Dai", "Unsu", "Gojūshiho Shō", "Supaenpei"],techniques:[],notes:"ma posture, Mes pics de goju avec la hanche du bon côté"}
];

const mockWeekActivity = [
  { day:"lun.", karate:0, physique:0 }, { day:"mar.", karate:120, physique:0 },
  { day:"mer.", karate:0, physique:0 }, { day:"jeu.", karate:0, physique:0 },
  { day:"ven.", karate:0, physique:0 }, { day:"sam.", karate:0, physique:0 },
  { day:"dim.", karate:0, physique:0 },
];

const mockCompetitions = [
  { id:1, date:"2026-05-09", name:"Championnat de France Équipe Sénior", lieu:"Cormeilles-En-Parisis", coach:"Olivier", result:"Médaille d'Argent", hasVideo:true,
    tours:[
      { num:1, name:"Demi Finale", kata:"Gojūshiho Shō", score:"5-0", ok:true, note:"Bonnes sensations" },
      { num:2, name:"Finale", kata:"Unsu", score:"1-4", ok:false, note:"un peu stressée et pas très stable mais bien sur le bunkai" },
    ]
  },
  { id:2, date:"2026-04-12", name:"Championnat de France Équipe", lieu:"Mulhouse", coach:"Romain", result:"Médaille d'Or", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"Gojūshiho Dai", score:"5-0", ok:true, note:"" },
      { num:2, name:"Demi Finale", kata:"Gojūshiho Shō", score:"3-2", ok:true, note:"" },
      { num:3, name:"Finale", kata:"Unsu", score:"5-0", ok:true, note:"" },
    ]
  },
  { id:3, date:"2026-04-11", name:"Championnat de France Indiv", lieu:"Mulhouse", coach:"Olivier", result:"Défaite au 3ème tour", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"Unsu", score:"5-0", ok:true, note:"" },
      { num:2, name:"2ème tour", kata:"Gojūshiho Shō", score:"5-0", ok:true, note:"" },
      { num:3, name:"Huitième de Finale", kata:"Gojūshiho Dai", score:"2-3", ok:false, note:"" },
    ]
  },
  { id:4, date:"2026-03-08", name:"Liga Nacional 2026", lieu:"Ciudad Real Espagne", coach:"Autre", result:"Perdu au 2ème tour", hasVideo:true,
    notes:"Pas de respi donc dur d'être a fond. Déçue d'avoir pas vraiment pu être a fond.",
    tours:[
      { num:1, name:"1er tour", kata:"Gojūshiho Shō", score:"3-2", ok:true, note:"Contente de mon Kata, j'ai réussi à appliquer des corrections. Peu d'énergie" },
      { num:2, name:"2ème tour", kata:"Unsu", score:"2-3", ok:false, note:"Très peu d'énergie mais contente de shion tsuki" },
    ]
  },
  { id:5, date:"2026-01-17", name:"Milon Cup Junior", lieu:"Luxembourg", coach:"Romain", result:"Médaille de Bronze", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"Gojūshiho Dai", score:"0-5", ok:false, note:"Contente de mon Kata malgré le déséquilibre" },
      { num:2, name:"Finale de Bronze", kata:"Supaenpei", score:"5-0", ok:true, note:"À part le retourner un peu raté je l'ai trouvé bien" },
    ]
  },
  { id:6, date:"2026-01-17", name:"Milon Cup Sénior", lieu:"Luxembourg", coach:"Romain", result:"Médaille d'argent", hasVideo:true,
    notes:"Pour l'échauffement j'ai fait ce qu'on a fait à Venise : mobilité, course, Kata entier doucement, puis petites parties a fond.",
    tours:[
      { num:1, name:"1er tour", kata:"Gojūshiho Dai", score:"3-2", ok:true, note:"Je suis contente pour un premier tour" },
      { num:2, name:"2ème tour", kata:"Supaenpei", score:"4-1", ok:true, note:"Très bonnes sensations" },
      { num:3, name:"Demi Finale", kata:"Gojūshiho Shō", score:"3-2", ok:true, note:"Pas fan du début et les pics un peu caca" },
      { num:4, name:"Finale", kata:"Gankaku", score:"2-3", ok:false, note:"Un peu lente peut être trop dans le boum boum" },
    ]
  },
  { id:7, date:"2025-12-04", name:"Youth League", lieu:"Venise", coach:"Helvétia", result:"11ème", hasVideo:false,
    notes:"Contente des mes 1ers tours mais je reste sur ma faim...",
    tours:[
      { num:1, name:"1er tour", kata:"Gojūshiho Shō", score:"23.3", ok:true, note:"Bonnes sensations, mais très stressée" },
      { num:2, name:"2ème tour", kata:"Gojūshiho Dai", score:"23.1", ok:true, note:"Très fière" },
      { num:3, name:"Huitième de Finale", kata:"Supaenpei", score:"22.8", ok:false, note:"Fatigue ressentie à la fin du kata" },
      { num:4, name:"1er tour de repêchage", kata:"Unsu", score:"21.4", ok:false, note:"Déçue" },
    ]
  },
  { id:8, date:"2025-11-09", name:"Championnat Départemental", lieu:"Épinay-Sous-Sénart", coach:"Hugo", result:"Médaille d'Or", hasVideo:true,
    tours:[
      { num:1, name:"Finale", kata:"Gojūshiho Shō", score:"5-0", ok:true, note:"" },
    ]
  },
  { id:9, date:"2025-11-02", name:"Coupe de France Équipe", lieu:"Lille", coach:"Romain", result:"Médaille d'Argent", hasVideo:false,
    tours:[
      { num:1, name:"Demi Finale", kata:"Gojūshiho Shō", score:"5-0", ok:true, note:"" },
      { num:2, name:"Finale", kata:"Kanku Shō", score:"0-5", ok:false, note:"" },
    ]
  },
  { id:10, date:"2025-11-01", name:"Coupe de France Junior", lieu:"Lille", coach:"Olivier", result:"Défaite au 1er tour", hasVideo:false,
    tours:[
      { num:1, name:"1er tour", kata:"Gojūshiho Shō", score:"2-3", ok:false, note:"" },
    ]
  },
  { id:11, date:"2025-10-05", name:"Liga Nacional", lieu:"Langreo", coach:"Autre", result:"Défaite au 1er tour", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"Gojūshiho Shō", score:"2-3", ok:false, note:"" },
    ]
  },
  { id:12, date:"2025-09-26", name:"Lion Cup", lieu:"Strassen", coach:"Olivier", result:"Médaille d'Argent", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"Gojūshiho Shō", score:"22.8", ok:true, note:"" },
      { num:2, name:"2ème tour", kata:"Supaenpei", score:"23", ok:true, note:"" },
      { num:3, name:"Demi Finale", kata:"Gojūshiho Dai", score:"23.6", ok:true, note:"" },
      { num:4, name:"Finale", kata:"Gankaku", score:"23.3", ok:false, note:"" },
    ]
  },
];

const mockCorrections = [
  { id:2, date:"2025-10-19", trainer:"Jonathan", kata:"Gankaku", content:"Premier coup de coude insuffisant, regarder en bas avant de tourner" },
  { id:3, date:"2025-10-18", trainer:"Olivier", kata:"Unsu", content:"Ikité trop bas, stabiliser le bunkai final" },
];

const mockTeam = {
  "Mère": [
    { name:"Isabelle Voratovic", email:"isaphoenix@hotmail.fr", phone:"06 10 03 68 28", online:true },
    { name:"Alexandre Voratovic", email:"a.voratovic@isipatrimoine.com", phone:"07 77 05 93 23", online:true },
  ],
  "Entraîneur": [
    { name:"Helvétia Taily", email:"helvetiataily@gmail.com", phone:"07 67 64 20 15", online:true },
  ],
  "Athlète": [
    { name:"Iliana Voratovic", email:"ilianavoratovic@gmail.com", phone:"06 36 49 01 70", online:false },
  ],
};

const mockPhysique = [
  // PPG / Full Body (Kevin) — 24 séances
  { id:1, date:"2026-06-05", type:"PPG", subType:"Full Body", duration:75, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:2, date:"2026-06-01", type:"PPG", subType:"Full Body", duration:80, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:3, date:"2026-05-25", type:"PPG", subType:"Full Body", duration:75, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:4, date:"2026-05-20", type:"PPG", subType:"Full Body", duration:75, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:5, date:"2026-05-18", type:"PPG", subType:"Full Body", duration:80, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:6, date:"2026-05-14", type:"PPG", subType:"Full Body", duration:75, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:7, date:"2026-05-11", type:"PPG", subType:"Full Body", duration:80, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:8, date:"2026-05-08", type:"PPG", subType:"Full Body", duration:85, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:9, date:"2026-05-04", type:"PPG", subType:"Full Body", duration:75, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:10, date:"2026-04-30", type:"PPG", subType:"Full Body", duration:60, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:11, date:"2026-04-29", type:"PPG", subType:"Full Body", duration:85, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:12, date:"2026-04-27", type:"PPG", subType:"Full Body", duration:85, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:13, date:"2026-04-24", type:"PPG", subType:"Full Body", duration:65, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:14, date:"2026-04-22", type:"PPG", subType:"Full Body", duration:85, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:15, date:"2026-04-20", type:"PPG", subType:"Full Body", duration:85, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:16, date:"2026-04-18", type:"PPG", subType:"Full Body", duration:65, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:17, date:"2026-04-14", type:"PPG", subType:"Full Body", duration:60, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:18, date:"2026-04-03", type:"PPG", subType:"Full Body", duration:65, satisfaction:7, coach:"Kevin", notes:"", programme:"" },
  { id:19, date:"2026-04-02", type:"PPG", subType:"Full Body", duration:60, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:20, date:"2026-03-29", type:"PPG", subType:"Full Body", duration:70, satisfaction:8, coach:"Kevin", notes:"", programme:"" },
  { id:21, date:"2026-03-23", type:"PPG", subType:"Full Body", duration:70, satisfaction:8, coach:"Kevin", notes:"Problème de grip", programme:"" },
  { id:22, date:"2026-03-20", type:"PPG", subType:"Full Body", duration:60, satisfaction:7, coach:"Kevin", notes:"", programme:"" },
  { id:23, date:"2026-03-18", type:"PPG", subType:"Full Body", duration:60, satisfaction:7, coach:"Kevin", notes:"", programme:"" },
  { id:24, date:"2025-12-31", type:"PPG", subType:"Full Body", duration:120, satisfaction:8, coach:"Helvétia", notes:"Séance Full Body", programme:"Séance Full Body - Gainage & Stabilité" },
  // Haltérophilie (6 séances)
  { id:25, date:"2026-03-11", type:"Haltérophilie", subType:"Haltérophilie", duration:60, satisfaction:8, coach:"Helvétia", notes:"Mal aux bras 😂", programme:"Haltérophilie" },
  { id:26, date:"2026-02-16", type:"Haltérophilie", subType:"Haltérophilie", duration:50, satisfaction:8, coach:"Helvétia", notes:"ça fait du bien de refaire du physique 😅", programme:"Haltérophilie" },
  { id:27, date:"2025-12-08", type:"Haltérophilie", subType:"Haltérophilie", duration:60, satisfaction:8, coach:"Helvétia", notes:"Mal aux mains 😂", programme:"Haltérophilie" },
  { id:28, date:"2025-11-26", type:"Haltérophilie", subType:"Haltérophilie", duration:60, satisfaction:8, coach:"Helvétia", notes:"", programme:"Haltérophilie" },
  { id:29, date:"2025-11-10", type:"Haltérophilie", subType:"Haltérophilie", duration:60, satisfaction:7, coach:"Helvétia", notes:"", programme:"Haltérophilie" },
  { id:30, date:"2025-10-21", type:"Haltérophilie", subType:"Haltérophilie", duration:60, satisfaction:7, coach:"Helvétia", notes:"", programme:"Haltérophilie" },
  // Endurance (5 séances)
  { id:31, date:"2026-03-02", type:"Endurance", subType:"Endurance", duration:60, satisfaction:8, coach:"Michel", distance:"6km", intensite:"Élevée", notes:"Intensité courte et répétée" },
  { id:32, date:"2026-02-24", type:"Endurance", subType:"Endurance", duration:120, satisfaction:8, coach:"Jérémie", notes:"Travail de vitesse sur courte distance, puis travail sur les 5 Kata" },
  { id:33, date:"2026-02-18", type:"Endurance", subType:"Endurance", duration:30, satisfaction:7, coach:"Michel", notes:"Relancer le cardio sans surcharge" },
  { id:34, date:"2025-10-27", type:"Endurance", subType:"Endurance", duration:60, satisfaction:6, coach:"Michel", notes:"Affûtage" },
  { id:35, date:"2025-10-20", type:"Endurance", subType:"Endurance", duration:60, satisfaction:7, coach:"Michel", notes:"Relancer le cardio sans surcharge" },
  // Explosivité (3 séances)
  { id:36, date:"2026-02-23", type:"Explosivité", subType:"Explosivité", duration:75, satisfaction:8, coach:"Helvétia", notes:"HALTÉRO + RENFO — Hang Power Clean, Front Squat, Push Press..." },
  { id:37, date:"2025-11-24", type:"Explosivité", subType:"Explosivité", duration:75, satisfaction:8, coach:"Helvétia", notes:"HALTÉRO + RENFO" },
  { id:38, date:"2025-10-23", type:"Explosivité", subType:"Explosivité", duration:60, satisfaction:7, coach:"Michel", notes:"Résistance Explosive — Circuit burpees/pompes/kihon" },
  // Technique (1 séance)
  { id:39, date:"2025-11-23", type:"Technique", subType:"Technique", duration:60, satisfaction:7, coach:"Michel", notes:"Tests Physiques — Epreuve 1=9'48 Epreuve 5=VMA 13,3km/h" },
  // Compét (1 séance)
  { id:40, date:"2026-02-24", type:"Compétition", subType:"Compétition", duration:120, satisfaction:7, coach:"Jérémie", notes:"Explo + Révisions gammes" },
  // Full Body séparé (2 séances déjà dans PPG mais avec type distinct)
  { id:41, date:"2025-12-12", type:"Full Body", subType:"Full Body", duration:60, satisfaction:7, coach:"", notes:"Travail de gainage : Élastique ou câble à hauteur de poitrine pour Pallof Press" },
  { id:42, date:"2026-05-31", type:"Full Body", subType:"Full Body", duration:120, satisfaction:8, coach:"Helvétia", notes:"" },
];

function useIsMobile() {
  const mq = window.matchMedia("(max-width: 767px)");
  const [isMobile, setIsMobile] = useState(mq.matches);
  useEffect(() => {
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

const Avatar = ({ name, size=36, bg=C.primary }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center",
    justifyContent:"center", color:"#fff", fontWeight:700, fontSize:size*0.35, flexShrink:0 }}>
    {name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
  </div>
);

const Badge = ({ label, color="#7C3AED" }) => (
  <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, background:color+"22",
    color, fontSize:12, fontWeight:600, marginRight:4 }}>{label}</span>
);

const Btn = ({ children, onClick, color=C.primary, outlined, small, style={} }) => (
  <button onClick={onClick} style={{
    background: outlined ? "transparent" : color, color: outlined ? color : "#fff",
    border:"2px solid "+color, borderRadius:8, padding: small ? "5px 14px" : "8px 18px",
    fontSize: small ? 12 : 13, fontWeight:600, cursor:"pointer",
    display:"inline-flex", alignItems:"center", gap:4, ...style
  }}>{children}</button>
);

const FilterPill = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{
    background: active ? C.primary : "#fff", color: active ? "#fff" : C.text,
    border:"1.5px solid "+(active ? C.primary : C.border),
    borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600,
    cursor:"pointer", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:5
  }}>
    {label}{count !== undefined && <span style={{ background: active ? "#ffffff33" : C.bg, borderRadius:10, padding:"1px 6px", fontSize:11 }}>{count}</span>}
  </button>
);

const SectionHeader = ({ icon, title, subtitle, color, action }) => (
  <div style={{ background:"linear-gradient(135deg, "+color+" 0%, "+color+"BB 100%)",
    borderRadius:16, padding:"20px 20px", color:"#fff", marginBottom:20,
    display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
    <div>
      <div style={{ fontSize:20, fontWeight:800 }}>{icon} {title}</div>
      {subtitle && <div style={{ fontSize:12, opacity:0.8, marginTop:2 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon, title, sub, action }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:12 }}>
    <div style={{ width:64, height:64, borderRadius:"50%", background:C.primary+"22", display:"flex", alignItems:"center", justifyContent:"center", color:C.primary }}>{icon}</div>
    <div style={{ fontWeight:700, fontSize:15 }}>{title}</div>
    {sub && <div style={{ color:C.muted, fontSize:13, textAlign:"center" }}>{sub}</div>}
    {action && <Btn onClick={action.fn}><Plus size={14}/>{action.label}</Btn>}
  </div>
);

const Toast = ({ message, onClose }) => (
  <div style={{ position:"fixed", bottom:80, right:16, left:16, background:C.primary, color:"#fff",
    borderRadius:14, padding:"14px 16px", zIndex:9999, boxShadow:"0 8px 32px rgba(124,58,237,0.4)",
    display:"flex", alignItems:"flex-start", gap:10 }}>
    <Bell size={16} style={{ flexShrink:0, marginTop:2 }}/>
    <div style={{ flex:1 }}>
      <div style={{ fontWeight:700, fontSize:13 }}>🥋 Séance enregistrée !</div>
      <div style={{ fontSize:12, opacity:0.85, marginTop:2 }}>{message}</div>
    </div>
    <button onClick={onClose} style={{ background:"none", border:"none", color:"#fff", cursor:"pointer" }}>✕</button>
  </div>
);

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = ({ sessions, competitions, onNavigate, plannings, physiqueSessions }) => {
  const _now = new Date();
  const _monOff = (_now.getDay() + 6) % 7;
  const startOfWeek = new Date(_now);
  startOfWeek.setDate(_now.getDate() - _monOff);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const thisWeek = sessions.filter(s => {
    const d = new Date(s.date);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const _MONTHS = ["jan.","fév.","mar.","avr.","mai","juin","juil.","août","sep.","oct.","nov.","déc."];
  const _fmt = (d) => `${d.getDate()} ${_MONTHS[d.getMonth()]}`;
  const weekLabel = `${_fmt(startOfWeek)} – ${_fmt(endOfWeek)} ${endOfWeek.getFullYear()}`;

  const _days = ["lun.","mar.","mer.","jeu.","ven.","sam.","dim."];
  const weekActivity = _days.map((day, i) => {
    const dd = new Date(startOfWeek);
    dd.setDate(startOfWeek.getDate() + i);
    const dStr = dd.toDateString();
    const ds = thisWeek.filter(s => new Date(s.date).toDateString() === dStr);
    const karate = ds
      .filter(s => ["Collectif","Club","Perso","Entr. Perso"].includes(s.type))
      .reduce((a, s) => a + (s.duration || 0), 0);
    const physique = (physiqueSessions||[])
      .filter(s => new Date(s.date).toDateString() === dStr)
      .reduce((a, s) => a + (s.duration || 0), 0);
    return { day, karate, physique };
  });

  const weekKey = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth()+1).padStart(2,"0")}-${String(startOfWeek.getDate()).padStart(2,"0")}`;
  const weekPlan = (plannings || []).find(p => p.debut === weekKey) || {};
  const clubCount     = Number(weekPlan.club)  || 0;
  const persoCount    = Number(weekPlan.perso) || 0;
  const physiqueCount = Number(weekPlan.prepa) || 0;
  const _today = new Date(); _today.setHours(0, 0, 0, 0);
  const upcomingComps = weekPlan.debut
    ? (Number(weekPlan.compet) || 0)
    : (competitions || []).filter(c => new Date(c.date) >= _today).length;
  const avgSat = (sessions.reduce((a,b) => a + b.satisfaction, 0) / sessions.length).toFixed(1);
  const avgDur = Math.round(sessions.reduce((a,b) => a + b.duration, 0) / sessions.length);

  return (
    <div>
      <div style={{ background:"linear-gradient(135deg, "+C.primary+" 0%, "+C.accent+" 100%)",
        borderRadius:16, padding:"24px 20px", color:"#fff", marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:800 }}>Bonjour Iliana 👋</div>
        <div style={{ fontSize:13, opacity:0.85, marginTop:4 }}>Continuez votre progression vers l'excellence</div>
      </div>

      <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:"1px solid "+C.border }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <Calendar size={15} color={C.accent}/> <strong style={{ fontSize:13 }}>Planning de la semaine</strong>
          <span style={{ color:C.muted, fontSize:11 }}>{weekLabel}</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:12 }}>
          {[{label:"Entr. Club",val:clubCount,color:C.red,page:"karate"},{label:"Prépa Physique",val:physiqueCount,color:C.blue,page:"physique"},
            {label:"Entr. Perso",val:persoCount,color:C.muted,page:"karate"},{label:"Compétitions",val:upcomingComps,color:C.yellow,page:"competitions"}].map(s=>(
            <div key={s.label} onClick={()=>onNavigate&&onNavigate(s.page)} style={{ background:s.color+"11", border:"1px solid "+s.color+"33", borderRadius:10, padding:"10px 12px", cursor:"pointer" }}>
              <div style={{ fontSize:10, color:s.color, fontWeight:600, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+C.green }}>
          <span style={{ color:C.green, fontSize:12 }}>🎯 <strong>Objectif :</strong> {weekPlan.objectif || "Aucun objectif défini"}</span>
        </div>
      </div>

      <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:"1px solid "+C.border }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="18" x2="19" y2="18"/><polyline points="9,12 11,10 14,14 16,12"/></svg>
          <strong style={{ fontSize:13 }}>Activité de la semaine</strong>
        </div>
        {/* Stats semaine */}
        {(() => {
        const now = new Date();
        const karateW = thisWeek.length;
        const physiqueW = (physiqueSessions||[]).filter(s=>new Date(s.date)>=startOfWeek).length;
        const corrW = mockCorrections.filter(c=>new Date(c.date)>=startOfWeek).length;
        const compAVenir = (competitions||[]).filter(c=>c.statut==="À venir"||(!c.statut&&new Date(c.date)>=now)).length;
        return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
            {[{icon:"🥋",label:"Karaté",val:karateW,c:C.red,pg:"karate"},{icon:"💪",label:"Prépa",val:physiqueW,c:"#7c3aed",pg:"physique"},{icon:"📝",label:"Corrections",val:corrW,c:C.primary,pg:"corrections"},{icon:"🏆",label:"Compét. à venir",val:compAVenir,c:C.yellow,pg:"competitions"}].map(s=>(
              <div key={s.label} onClick={()=>onNavigate&&onNavigate(s.pg)} style={{ background:s.c+"11", border:"1px solid "+s.c+"44", borderRadius:12, padding:"10px 8px", textAlign:"center", cursor:"pointer" }}>
                <div style={{ fontSize:22 }}>{s.icon}</div>
                <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.val}</div>
                <div style={{ fontSize:9, color:s.c, fontWeight:600, lineHeight:1.2, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        );
      })()}
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekActivity}>
            <XAxis dataKey="day" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis hide /><Tooltip />
            <Bar dataKey="karate" name="🥋 Karaté" fill={C.red} radius={[4,4,0,0]} />
            <Bar dataKey="physique" name="💪 Prépa" fill={C.blue} radius={[4,4,0,0]} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize:11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginTop:16 }}>
        {[{icon:"🥋",label:"Séances karaté",val:sessions.length,c:C.red,pg:"karate"},
          {icon:"💪",label:"Prépa physique",val:(physiqueSessions||[]).length,c:"#7c3aed",pg:"physique"},
          {icon:"🏅",label:"Stages EDF",val:mockStages.length,c:"#1d4ed8",pg:"stage"},
          {icon:"🏆",label:"Compétitions",val:(competitions||[]).length,c:"#f97316",pg:"competitions"}].map(s=>(
          <div key={s.label} onClick={()=>onNavigate&&onNavigate(s.pg)} style={{ background:s.c, borderRadius:14, padding:"14px", color:"#fff", cursor:"pointer" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:11, opacity:0.85 }}>{s.label}</div>
            <div style={{ fontSize:18, fontWeight:800 }}>{s.val}</div>
          </div>
        ))}
      </div>

    </div>
  );
};

// ─── SÉANCES KARATÉ ──────────────────────────────────────────────────────────
const COACHES = ["Helvétia","Romain","Olivier","Yves","Jonathan","Hugo","Fernando","Jérémie","Michel","Perso","Autres"];
const KATAS_LIST = ["Gojūshiho Dai","Gojūshiho Shō","Unsu","Gankaku","Kanku Shō","Kanku Dai","Supaenpei","Empi","Sōchin","Sansai","Bassai Dai","Bassai Shō","Jion","Jitte","Hangetsu","Nijūshiho","Chinte","Wankan","Gojūshiho"];
const TECHNIQUES_LIST = [
  "Mae Geri (Coup de pied avant)","Mawashi Geri (Coup de pied circulaire)","Ushiro Geri (Coup de pied arrière)",
  "Yoko Geri (Coup de pied latéral)","Oi Zuki (Coup de poing direct)","Gyaku Zuki (Coup de poing inverse)",
  "Uraken (Revers de poing)","Empi (Coup de coude)","Shuto (Tranchant de main)","Uke (Blocages)","Kihon (Bases)"
];
const RESSENTIS = ["😃 Excellent","😊 Très bon","🙂 Bon","😐 Moyen","😩 Difficile","😴 Fatigué"];
const ENERGIES = ["Très bas","Bas","Normal","Élevé","Très élevé"];

const MultiSelect = ({ label, options, selected, onAdd, onRemove, color=C.primary }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>{label}</label>
      {selected.length > 0 && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
          {selected.map(item => (
            <span key={item} style={{ background:color+"22", color, borderRadius:20, padding:"3px 10px", fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
              {item}
              <button onClick={()=>onRemove(item)} style={{ background:"none", border:"none", cursor:"pointer", color, fontSize:14, lineHeight:1, padding:0 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position:"relative" }}>
        <div style={{ display:"flex", gap:8 }}>
          <button type="button" onClick={()=>setOpen(!open)} style={{
            flex:1, border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13,
            background:"#fff", cursor:"pointer", textAlign:"left", color:C.muted, display:"flex", justifyContent:"space-between", alignItems:"center"
          }}>
            <span>Sélectionner {label.toLowerCase().replace("(s)","")}</span>
            <ChevronDown size={14}/>
          </button>
          <button type="button" onClick={()=>setOpen(!open)} style={{ background:color, border:"none", borderRadius:8, padding:"10px 14px", cursor:"pointer", color:"#fff", fontWeight:700, fontSize:16 }}>+</button>
        </div>
        {open && (
          <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1px solid "+C.border, borderRadius:10,
            boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:300, maxHeight:220, overflowY:"auto", marginTop:4 }}>
            {options.filter(o => !selected.includes(o)).map(option => (
              <button key={option} type="button" onClick={()=>{ onAdd(option); setOpen(false); }} style={{
                width:"100%", textAlign:"left", background:"none", border:"none", cursor:"pointer",
                padding:"10px 14px", fontSize:13, display:"block"
              }} onMouseEnter={e=>e.target.style.background=color+"11"} onMouseLeave={e=>e.target.style.background="none"}>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SeancesKarate = ({ sessions, setSessions, showToast }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedIdK, setExpandedIdK] = useState(null);
  const trackViewK = async (s) => {
    const u = getCurrentUser(); if (!u) return;
    try {
      const vRef = doc(db, "session_views", "karate_"+String(s.id)+"_"+u.id);
      const vDoc = await getDoc(vRef);
      if (!vDoc.exists()) {
        await setDoc(vRef, { viewedAt: serverTimestamp(), userId: u.id, sessionId: String(s.id), type: "karate" });
      }
    } catch(e) {}
  };
  const [feedbackEditIdK, setFeedbackEditIdK] = useState(null);
  const [feedbackTextK, setFeedbackTextK] = useState("");
  const saveKarateFeedback = async (sessionId, feedback) => {
    setSessions(prev => prev.map(s => s.id===sessionId ? {...s, coachFeedback:feedback} : s));
    if (typeof sessionId === "string") {
      try {
        await updateDoc(doc(db, "seances", sessionId), { coachFeedback: feedback });
        if (feedback.trim()) {
          const u = getCurrentUser();
          await notifyNewContent({ type:"notes_coach_seance", title:"💬 Retours du coach — séance karaté", body:feedback, createdBy:u?.id||"unknown" });
        }
      } catch(e) {}
    }
    setFeedbackEditIdK(null); setFeedbackTextK("");
  };
  const currentUser = getCurrentUser();
  const [sessionViews, setSessionViews] = useState({});
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "session_views"), (snap) => {
      const views = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.type === "karate") {
          const sid = data.sessionId;
          if (!views[sid]) views[sid] = [];
          if (!views[sid].includes(data.userId)) views[sid].push(data.userId);
        }
      });
      setSessionViews(views);
    }, () => {});
    return () => unsub();
  }, []);

  const emptyForm = {
    date: new Date().toISOString().split('T')[0],
    type: "Collectif", duration: "90",
    coaches: [], katas: [], techniques: [],
    focusPoints: "", corrections: "",
    ressenti: "🙂 Bon", energie: "Normal",
    satisfaction: 5, coachFeedback: "", notes: "", lienVideo: "",
  };
  const [form, setForm] = useState(emptyForm);

  const openEdit = (s) => {
    setEditingSession(s.id);
    setForm({
      date: s.date, type: s.type, duration: String(s.duration),
      coaches: s.coach ? s.coach.split(", ").filter(Boolean) : [],
      katas: s.katas || [], techniques: s.techniques || [],
      focusPoints: s.focusPoints || "", corrections: s.notes || "",
      ressenti: s.ressenti || "🙂 Bon", energie: s.energie || "Normal",
      satisfaction: s.satisfaction || 5,
      coachFeedback: s.coachFeedback || "", notes: s.additionalNotes || "",
      lienVideo: s.lienVideo || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSession(null);
    setForm(emptyForm);
  };

  const counts = {
    ALL: sessions.length,
    "Cette semaine": sessions.filter(s => { const d=new Date(s.date); const n=new Date(); const w=new Date(n); w.setDate(n.getDate()-n.getDay()); return d>=w; }).length,
    "Ce mois-ci": sessions.filter(s => { const d=new Date(s.date); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).length,
    "Mois dernier": sessions.filter(s => { const d=new Date(s.date); const n=new Date(); const lm=new Date(n.getFullYear(),n.getMonth()-1,1); return d.getMonth()===lm.getMonth()&&d.getFullYear()===lm.getFullYear(); }).length,
    Corrections: sessions.filter(s => s.notes && s.notes.length>0).length,
    Collectif: sessions.filter(s => s.type==="Collectif").length,
    Privé: sessions.filter(s => s.type==="Privé").length,
    Perso: sessions.filter(s => s.type==="Perso").length,
    Stage: sessions.filter(s => s.type==="Stage").length,
    Visio: sessions.filter(s => s.type==="Visio").length,
  };

  const filtered = sessions.filter(s => {
    const matchType = activeFilter === "ALL" ||
      s.type === activeFilter ||
      (activeFilter === "Cette semaine" && (() => { const d=new Date(s.date); const n=new Date(); const w=new Date(n); w.setDate(n.getDate()-n.getDay()); return d>=w; })()) ||
      (activeFilter === "Ce mois-ci" && (() => { const d=new Date(s.date); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); })()) ||
      (activeFilter === "Mois dernier" && (() => { const d=new Date(s.date); const n=new Date(); const lm=new Date(n.getFullYear(),n.getMonth()-1,1); return d.getMonth()===lm.getMonth()&&d.getFullYear()===lm.getFullYear(); })()) ||
      (activeFilter === "Corrections" && s.notes && s.notes.length>0);
    const matchSearch = !searchText ||
      s.katas?.some(k=>k.toLowerCase().includes(searchText.toLowerCase())) ||
      s.notes?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.coach?.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchSearch;
  }).sort((a,b) => (b.date||"").localeCompare(a.date||""));

  const avgSat = sessions.length ? (sessions.reduce((a,b)=>a+b.satisfaction,0)/sessions.length).toFixed(1) : 0;
  const avgDur = sessions.length ? Math.round(sessions.reduce((a,b)=>a+b.duration,0)/sessions.length) : 0;

  const handleSubmit = async () => {
    if (!form.date || !form.duration) { showToast("⚠️ Date et durée obligatoires"); return; }
    setSaving(true);
    try {
      const seance = {
        type: form.type, date: form.date, duration: parseInt(form.duration),
        satisfaction: form.satisfaction, katas: form.katas, techniques: form.techniques,
        notes: form.corrections, focusPoints: form.focusPoints,
        coachFeedback: form.coachFeedback, additionalNotes: form.notes,
        ressenti: form.ressenti, energie: form.energie, lienVideo: form.lienVideo,
        coach: form.coaches.join(", "), athlete: "Iliana Voratovic"
      };
      if (editingSession) {
        // Modifier séance existante
        setSessions(prev => prev.map(s => s.id === editingSession ? { ...s, ...seance } : s));
        // Sync séance complète dans Firestore (partage temps réel)
        try {
          if (typeof editingSession === "string") {
            const prevDoc = await getDoc(doc(db, "seances", editingSession));
            const prevFeedback = prevDoc.exists() ? (prevDoc.data().coachFeedback || "") : "";
            await updateDoc(doc(db, "seances", editingSession), seance);
            if (seance.coachFeedback?.trim() && seance.coachFeedback !== prevFeedback) {
              const u = getCurrentUser();
              await notifyNewContent({ type:"notes_coach_seance", title:"💬 Retours du coach — séance "+seance.type, body:seance.coachFeedback, createdBy:u?.id||"unknown" });
            }
          }
        } catch(fe) { console.warn("Firestore update skipped:", fe.code); }
        // Sync lienVideo dans Firestore si présent
        if (seance.lienVideo) {
          const videoId = "perso_" + editingSession;
          const q = query(collection(db, "video_links"), where("videoId", "==", videoId));
          const snap = await getDocs(q);
          if (snap.empty) await addDoc(collection(db, "video_links"), { videoId, lien: seance.lienVideo, updatedAt: serverTimestamp() });
          else await updateDoc(doc(db, "video_links", snap.docs[0].id), { lien: seance.lienVideo, updatedAt: serverTimestamp() });
        }
        showToast("Séance modifiée avec succès ✓");
      } else {
        // Nouvelle séance — sauvegarder localement d'abord (non-bloquant)
        const newId = Date.now();
        setSessions(prev => [{ id: newId, ...seance }, ...prev]);
        showToast("Séance "+form.type+" — "+form.duration+" min enregistrée ✓");
        // Firestore en arrière-plan (ne bloque pas si permission refusée)
        try {
          const uid = getCurrentUser()?.id;
          await enregistrerSeance(seance, uid);
          if (seance.lienVideo) {
            await addDoc(collection(db, "video_links"), { videoId: "perso_"+newId, lien: seance.lienVideo, updatedAt: serverTimestamp() });
          }
        } catch(fe) { console.warn("Firestore write skipped:", fe.code); }
      }
      closeForm();
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const emoji = (sat) => sat>=9?"😃":sat>=7?"😊":sat>=6?"🙂":sat>=4?"😐":"😔";

  const SelectField = ({ label, value, options, onChange, style={} }) => (
    <div style={style}>
      <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{
        width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px",
        fontSize:13, background:"#fff", cursor:"pointer", appearance:"none",
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%2394A3B8'/%3E%3C/svg%3E\")",
        backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center"
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <SectionHeader icon="🥋" title="Séances de Karaté" subtitle="Suivez votre progression technique et vos entraînements 🥷" color={C.red}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.red, fontSize:12 }}><Plus size={12}/> Nouvelle séance</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[{label:"Séances totales",val:sessions.length,c:C.red},{label:"Durée moyenne",val:avgDur+" min",c:C.orange},{label:"Satisfaction moy.",val:avgSat+"/10",c:C.yellow}].map(s=>(
          <div key={s.label} style={{ background:C.card, borderRadius:12, padding:"12px", border:"1px solid "+C.border, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.muted }}>{s.label}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.card, borderRadius:12, padding:"10px 12px", border:"1px solid "+C.border, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
        <Search size={15} color={C.muted}/>
        <input value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Rechercher un kata, coach, correction..."
          style={{ border:"none", outline:"none", fontSize:13, flex:1, background:"transparent" }}/>
      </div>

      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {["ALL","Cette semaine","Ce mois-ci","Mois dernier","Corrections","Collectif","Privé","Perso","Stage","Visio"].map(f=>(
          <FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} count={counts[f]} />
        ))}
      </div>

      <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>{filtered.length} séance{filtered.length>1?"s":""}</div>

      {filtered.map(s=>(
        <div key={s.id} style={{ background:C.card, borderRadius:14, border:"2px solid "+C.red+(expandedIdK===s.id?"99":"33"), padding:16, marginBottom:12, cursor:"pointer" }} onClick={()=>{ setExpandedIdK(expandedIdK===s.id?null:s.id); trackViewK(s); }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16 }}>{s.ressenti>=9?"🤩":s.ressenti>=7?"😃":s.ressenti>=5?"😐":s.ressenti>=3?"🫤":s.ressenti>=1?"😒":"😐"}</span>
                <span style={{ fontWeight:700, fontSize:14 }}>Entraînement {s.type}</span>
              </div>
              <div style={{ color:C.muted, fontSize:11 }}>{s.date}{s.coach?" · "+s.coach:""}</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {s.lienVideo && (
                <button onClick={(e)=>{e.stopPropagation();window.open(s.lienVideo,"_blank");}} title="Voir la vidéo" style={{ background:C.primary+"22", border:"1px solid "+C.primary+"44", borderRadius:6, padding:"3px 8px", cursor:"pointer", color:C.primary, fontSize:11, display:"flex", alignItems:"center", gap:3 }}>
                  <Video size={12}/> Vidéo
                </button>
              )}
              <button onClick={(e)=>{e.stopPropagation();openEdit(s);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary }}><Edit2 size={13}/></button>
              <button onClick={(e)=>{ e.stopPropagation(); deleteDoc(doc(db,"seances",String(s.id))).catch(console.error); setSessions(prev=>prev.filter(p=>p.id!==s.id)); }} style={{ background:"none", border:"none", cursor:"pointer", color:C.red }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:s.katas?.length>0||s.notes?8:0 }}>
            <span style={{ fontSize:12, color:C.muted }}>⏱ <strong style={{ color:C.text }}>{s.duration} min</strong></span>
            {s.ressenti?<span style={{ fontSize:12, color:C.muted }}>{s.ressenti>=9?"🤩":s.ressenti>=7?"😃":s.ressenti>=5?"😐":s.ressenti>=3?"🫤":s.ressenti>=1?"😒":"😐"} <strong style={{ color:C.text }}>{s.ressenti}/10</strong></span>:null}<span style={{ fontSize:12, color:C.muted }}>🥋 <strong style={{ color:C.text }}>{s.satisfaction}/10</strong></span>
          </div>
          {s.katas && s.katas.length>0 && (
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:11, fontWeight:600, marginBottom:4, color:C.muted }}>Katas pratiqués :</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{s.katas.map(k=><Badge key={k} label={k} color={C.primary}/>)}</div>
            </div>
          )}
          {s.techniques && s.techniques.length>0 && (
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:11, fontWeight:600, marginBottom:4, color:C.muted }}>Techniques :</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{s.techniques.map(t=><Badge key={t} label={t} color={C.blue}/>)}</div>
            </div>
          )}
          {s.notes && (
            <div style={{ background:C.orange+"15", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.orange }}>
              <div style={{ fontSize:11, color:C.orange, whiteSpace:"pre-wrap" }}>⚠ Corrections : {s.notes}</div>
            </div>
          )}
          {s.coachFeedback && expandedIdK!==s.id && (
            <div style={{ background:C.green+"15", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.green, marginTop:6 }}>
              <div style={{ fontSize:11, color:C.green, whiteSpace:"pre-wrap" }}>💬 Retours coach : {s.coachFeedback}</div>
            </div>
          )}
          {expandedIdK===s.id && (
            <div style={{ marginTop:10, borderTop:"1px solid "+C.border, paddingTop:10 }}>
              {s.energie && s.energie!=="Normal" && (
                <div style={{ marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:C.muted }}>⚡ Niveau de difficulté : </span>
                  <span style={{ fontSize:11, fontWeight:700, color:C.orange }}>{s.energie}</span>
                </div>
              )}
              {s.focusPoints && (
                <div style={{ background:C.blue+"11", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.blue, marginBottom:8 }}>
                  <div style={{ fontSize:11, color:C.blue, whiteSpace:"pre-wrap" }}>🎯 <strong>Points de focus :</strong> {s.focusPoints}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:4 }}>💬 Feedback du Coach</div>
                {feedbackEditIdK===s.id ? (
                  <div onClick={e=>e.stopPropagation()}>
                    <textarea value={feedbackTextK} onChange={e=>setFeedbackTextK(e.target.value)} placeholder="Écrire un feedback..." rows={3}
                      style={{ width:"100%", border:"1.5px solid "+C.primary, borderRadius:8, padding:"8px 10px", fontSize:12, boxSizing:"border-box", resize:"none", outline:"none" }}/>
                    <div style={{ display:"flex", gap:8, marginTop:6, justifyContent:"flex-end" }}>
                      <button onClick={()=>{setFeedbackEditIdK(null);setFeedbackTextK("");}} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:6, padding:"5px 12px", fontSize:11, cursor:"pointer" }}>Annuler</button>
                      <button onClick={()=>saveKarateFeedback(s.id, feedbackTextK)} style={{ background:C.primary, border:"none", borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={e=>{e.stopPropagation();setFeedbackEditIdK(s.id);setFeedbackTextK(s.coachFeedback||"");}} style={{ background:C.primary+"11", borderRadius:8, padding:"8px 10px", fontSize:11, color:s.coachFeedback?C.text:C.muted, cursor:"pointer", borderLeft:"3px solid "+C.primary, fontStyle:s.coachFeedback?"normal":"italic" }}>
                    {s.coachFeedback || "Ajouter un commentaire..."}
                  </div>
                )}
              </div>
              {currentUser&&(currentUser.id==="alexandre"||currentUser.id==="iliana")&&(sessionViews[String(s.id)]||[]).filter(uid=>uid!=="alexandre"&&uid!=="iliana").length>0&&(
                <div style={{fontSize:10,color:C.muted,marginTop:8,textAlign:"right"}}>👁 lu par {(sessionViews[String(s.id)]||[]).filter(uid=>uid!=="alexandre"&&uid!=="iliana").map(uid=>({"helvetia":"Helvétia","isabelle":"Isabelle","kevin":"Kevin"}[uid]||uid)).join(", ")}</div>
              )}
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }}
          onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }}
            onClick={e=>e.stopPropagation()}>

            {/* Header formulaire */}
            <div style={{ background:"linear-gradient(135deg, "+C.red+", "+C.orange+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:10 }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>{editingSession ? "Modifier la séance" : "Nouvelle séance de karaté"}</div>
              <button onClick={closeForm} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>

            <div style={{ padding:"20px 24px" }}>
              {/* Ligne 1: Date, Type, Durée */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box" }} />
                </div>
                <SelectField label="Type de séance *" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))}
                  options={["Collectif","Privé","Perso","Stage","Visio"]} />
                <div>
                  <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Durée (minutes) *</label>
                  <input type="number" placeholder="120" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box" }} />
                </div>
              </div>

              {/* Entraîneurs */}
              <MultiSelect label="Entraîneur(s)" options={COACHES} selected={form.coaches}
                onAdd={v=>setForm(f=>({...f,coaches:[...f.coaches,v]}))}
                onRemove={v=>setForm(f=>({...f,coaches:f.coaches.filter(c=>c!==v)}))}
                color={C.primary} />

              {/* Katas */}
              <MultiSelect label="Katas pratiqués" options={KATAS_LIST} selected={form.katas}
                onAdd={v=>setForm(f=>({...f,katas:[...f.katas,v]}))}
                onRemove={v=>setForm(f=>({...f,katas:f.katas.filter(k=>k!==v)}))}
                color={C.primary} />

              {/* Techniques */}
              <MultiSelect label="Techniques travaillées" options={TECHNIQUES_LIST} selected={form.techniques}
                onAdd={v=>setForm(f=>({...f,techniques:[...f.techniques,v]}))}
                onRemove={v=>setForm(f=>({...f,techniques:f.techniques.filter(t=>t!==v)}))}
                color={C.orange} />

              {/* Points de focus */}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Points de focus</label>
                <textarea rows={3} placeholder="Sur quoi vous êtes-vous concentré..." value={form.focusPoints}
                  onChange={e=>setForm(f=>({...f,focusPoints:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }} />
              </div>

              {/* Corrections */}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Corrections à travailler</label>
                <textarea rows={3} placeholder="Points techniques à améliorer..." value={form.corrections}
                  onChange={e=>setForm(f=>({...f,corrections:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }} />
              </div>

              {/* Ressenti + Niveau de Difficulté */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <label style={{ fontSize:13, fontWeight:600 }}>Ressenti</label>
                  <span style={{ fontSize:18, fontWeight:800, color:C.red }}>{form.ressenti||5}/10</span>
                </div>
                <input type="range" min={1} max={10} value={form.ressenti||5} onChange={e=>setForm(f=>({...f,ressenti:parseInt(e.target.value)}))} style={{ width:"100%", accentColor:C.red, marginBottom:12 }} />
                <SelectField label="Niveau de Difficulté" value={form.energie} onChange={v=>setForm(f=>({...f,energie:v}))} options={ENERGIES} />
              </div>

              {/* Satisfaction technique slider */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <label style={{ fontSize:13, fontWeight:600 }}>Satisfaction technique</label>
                  <span style={{ fontSize:20, fontWeight:800, color:C.red }}>{form.satisfaction}/10</span>
                </div>
                <input type="range" min={1} max={10} value={form.satisfaction}
                  onChange={e=>setForm(f=>({...f,satisfaction:parseInt(e.target.value)}))}
                  style={{ width:"100%", accentColor:C.red }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted }}>
                  <span>1 (Insatisfait)</span><span>10 (Excellent)</span>
                </div>
              </div>

              {/* Retours coach */}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Feedback du Coach</label>
                <textarea rows={3} placeholder="Commentaires du coach..." value={form.coachFeedback}
                  onChange={e=>setForm(f=>({...f,coachFeedback:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }} />
              </div>

              {/* Lien vidéo — Type Perso + coach Perso ou Helvétia */}
              {form.type === "Perso" && form.coaches.some(c => c === "Perso" || c === "Helvétia") && (
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>🔗 Lien Vidéo (Google Drive, YouTube…)</label>
                  <input type="text" placeholder="https://drive.google.com/..."
                    value={form.lienVideo||""}
                    onChange={e=>setForm(f=>({...f,lienVideo:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box" }} />
                </div>
              )}

              {/* Notes additionnelles */}
              <div style={{ marginBottom:24 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Notes additionnelles</label>
                <textarea rows={2} placeholder="Autres observations..." value={form.notes}
                  onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }} />
              </div>

              {/* Boutons */}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingBottom:8 }}>
                <button onClick={closeForm} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <X size={14}/> Annuler
                </button>
                <button onClick={handleSubmit} disabled={saving} style={{ background:C.red, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:saving?0.7:1 }}>
                  💾 {saving ? "Enregistrement..." : editingSession ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ─── TABLEAU DE VISUALISATION (Vision Board) ──────────────────────────────────
const VisionBoard = ({ sessions }) => {
  const byMonth = {};
  sessions.forEach(s => {
    const month = s.date.substring(0, 7);
    if (!byMonth[month]) byMonth[month] = { count:0, totalSat:0, totalDur:0 };
    byMonth[month].count++;
    byMonth[month].totalSat += s.satisfaction;
    byMonth[month].totalDur += s.duration;
  });
  const monthData = Object.entries(byMonth).sort().slice(-6).map(([m, v]) => ({
    month: m.substring(5)+" "+m.substring(0,4),
    séances: v.count,
    satisfaction: parseFloat((v.totalSat/v.count).toFixed(1)),
    durée: Math.round(v.totalDur/v.count),
  }));

  const kataCount = {};
  sessions.forEach(s => s.katas?.forEach(k => { kataCount[k] = (kataCount[k]||0)+1; }));
  const topKatas = Object.entries(kataCount).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const COLORS = [C.primary, C.accent, C.red, C.orange, C.blue, C.green];

  return (
    <div>
      <SectionHeader icon="📊" title="Tableau de visualisation" subtitle="Vue d'ensemble de votre progression" color={C.primary} />

      <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:"1px solid "+C.border }}>
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Séances par mois (6 derniers mois)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthData}>
            <XAxis dataKey="month" tick={{ fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis hide/><Tooltip/>
            <Bar dataKey="séances" fill={C.primary} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:"1px solid "+C.border }}>
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Satisfaction moyenne par mois</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={monthData}>
            <XAxis dataKey="month" tick={{ fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,10]} hide/><Tooltip/>
            <Line type="monotone" dataKey="satisfaction" stroke={C.yellow} strokeWidth={2} dot={{ fill:C.yellow }}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background:C.card, borderRadius:16, padding:16, border:"1px solid "+C.border }}>
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Katas les plus travaillés</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {topKatas.map(([kata, count], i) => (
            <div key={kata} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS[i], flexShrink:0 }}/>
              <div style={{ flex:1, fontSize:13 }}>{kata}</div>
              <div style={{ fontSize:12, color:C.muted }}>{count} fois</div>
              <div style={{ width:80, height:6, background:C.border, borderRadius:3 }}>
                <div style={{ width:(count/topKatas[0][1]*100)+"%", height:"100%", background:COLORS[i], borderRadius:3 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── STAGE ÉQUIPE ─────────────────────────────────────────────────────────────
const mockStages = [
  { id:1, date:"2026-01-31", satisfaction:9, katas:["Gojūshiho Shō","Gojūshiho Dai","Empi"], duration:240,
    focus:"Passage mode compétition en quart de Kata enchaînés",
    corrections:"Les mains plus tendus, tendre plus la jambe arrière",
    retours:"Très bien, corrigé" },
  { id:2, date:"2026-01-29", satisfaction:8, katas:["Empi","Gojūshiho Shō","Gojūshiho Dai"], duration:120,
    focus:"Parties importantes dans les kata",
    corrections:"Plus de frappe", retours:"" },
  { id:3, date:"2026-01-11", satisfaction:9, katas:["Gojūshiho Shō","Unsu"], duration:105,
    focus:"Partie importante dans unsu et goju",
    corrections:"Tendre plus jambe arrière", retours:"" },
  { id:4, date:"2026-01-10", satisfaction:8, katas:["Empi","Gojūshiho Shō","Gojūshiho Dai"], duration:150,
    focus:"Passage mode compétition avec Julia et Louise",
    corrections:"Empi : plus d'impact, pas d'appel avec pied arrière. Dai : revoir rythme ligne kiba, plus de maintien. Sho : attention Mae gueri du début", retours:"" },
  { id:5, date:"2026-01-09", satisfaction:7, katas:["Gojūshiho Shō","Gojūshiho Dai","Unsu"], duration:260,
    focus:"Le matin : les goju en quart 4 fois. L'aprem : dai entier+demi et unsu en quart 4 fois",
    corrections:"Attention trajectoires, plus d'impact, plus d'intention au bout des doigts", retours:"" },
  { id:6, date:"2026-01-08", satisfaction:8, katas:["Empi","Gojūshiho Shō"], duration:120,
    focus:"Travail commun sur empi, goju. Équipe sur empi chaque demi 4 fois",
    corrections:"Empi : tourner la tête sur gedan barai, regarder le poignet avant le 1er kiai", retours:"" },
  { id:7, date:"2025-12-21", satisfaction:8, katas:["Empi","Gojūshiho Dai","Unsu"], duration:240,
    focus:"Empi 2eme + dai, unsu + bunkai 2eme partie",
    corrections:"Empi : Tirer l'iquité sur le kokutsu avant le saut. Dai : plus d'intention sur les temps lents. Unsu 2: ne pas tordre le poignet sur le 1er mouvement",
    retours:"Travailler au club les bras sur empi et le coup de pied de unsu" },
  { id:8, date:"2025-12-20", satisfaction:8, katas:["Empi","Gojūshiho Shō","Unsu"], duration:240,
    focus:"Empi + sho, unsu 1ere partie + bunkai",
    corrections:"Empi : se laisser plus tomber sur la montée de genoux. Sho : ne pas aller chercher trop large au début. Unsu : tomber plus vite au sol",
    retours:"Très bien le unsu. Temps début de empi : 1 2,1 2,12" },
  { id:9, date:"2025-12-19", satisfaction:8, katas:["Empi"], duration:120,
    focus:"Harmonisation empi",
    corrections:"Tier les épaules en opposition, se laisser tomber apres monter de genoux en posant les pieds 12", retours:"" },
  { id:10, date:"2025-10-12", satisfaction:7, katas:["Gojūshiho Shō","Gojūshiho Dai","Unsu"], duration:240,
    focus:"Cours normalement avec tout le monde puis 3 katas : sho, dai, unsu",
    corrections:"Lucas m'a dit de rétrécir mes positions pour descendre plus, et de faire attention à mes axes au niveau du haut du corps (je tire trop les épaules)",
    retours:"" },
];

const EMPTY_STAGE = { date: new Date().toISOString().split("T")[0], satisfaction:8, katas:[], duration:"", focus:"", corrections:"", retours:"" };

const StageEquipe = () => {
  const [stages, setStages] = useState(mockStages);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_STAGE);
  const [expandedIdE, setExpandedIdE] = useState(null);
  const trackViewE = async (s) => {
    const u = getCurrentUser(); if (!u) return;
    try {
      const vRef = doc(db, "session_views", "edf_"+String(s.id)+"_"+u.id);
      const vDoc = await getDoc(vRef);
      if (!vDoc.exists()) {
        await setDoc(vRef, { viewedAt: serverTimestamp(), userId: u.id, sessionId: String(s.id), type: "edf" });
        await notifyNewContent({ type:"session_viewed", title:"👁 Stage EDF ouvert", body:(u.prenom||u.id)+" a ouvert le stage du "+(s.date||""), createdBy:u.id });
      }
    } catch(e) {}
  };

  const avgSat = stages.length ? (stages.reduce((a,b)=>a+b.satisfaction,0)/stages.length).toFixed(1) : 0;
  const avgDur = stages.length ? Math.round(stages.reduce((a,b)=>a+b.duration,0)/stages.length) : 0;
  const emoji = (s) => s>=9?"😃":s>=8?"😊":s>=7?"🙂":"😐";

  const openAdd = () => { setForm(EMPTY_STAGE); setEditingId(null); setShowForm(true); };
  const openEdit = (s) => { setForm({...s, duration:String(s.duration), katas:s.katas||[]}); setEditingId(s.id); setShowForm(true); };
  const openCopy = (s) => { setForm({...s, date:new Date().toISOString().split("T")[0], duration:String(s.duration), katas:s.katas||[]}); setEditingId(null); setShowForm(true); };
  const handleDelete = (id) => { if (!window.confirm("Supprimer ce stage ?")) return; setStages(prev=>prev.filter(s=>s.id!==id)); };
  const handleSave = () => {
    if (!form.date || !form.duration) return;
    const s = { ...form, duration: parseInt(form.duration), katas: form.katas||[] };
    if (editingId) { setStages(prev=>prev.map(x=>x.id===editingId?{...x,...s}:x)); }
    else { setStages(prev=>[{id:Date.now(),...s},...prev]); }
    setShowForm(false);
  };

  const StageSF = ({ label, value, options, onChange }) => (
    <div>
      <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <SectionHeader icon="🏅" title="Stages Équipe de France" subtitle="Suivez vos entraînements avec l'élite nationale 🇫🇷" color="#1D4ED8"
        action={<Btn onClick={openAdd} color="#fff" style={{ color:"#1D4ED8", fontSize:12 }}><Plus size={12}/> Nouveau stage</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[{l:"Stages totaux",v:stages.length,c:"#1D4ED8"},{l:"Durée moyenne",v:avgDur+" min",c:C.orange},{l:"Satisfaction moy.",v:avgSat+"/10",c:C.yellow}].map(s=>(
          <div key={s.l} style={{ background:C.card, borderRadius:12, padding:12, border:"1px solid "+C.border, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.muted }}>{s.l}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:C.orange }}>⚠ Corrections récentes à travailler</div>
        {stages.filter(s=>s.corrections).slice(0,3).map(s=>(
          <div key={s.id} style={{ background:C.orange+"11", borderRadius:8, padding:"8px 12px", marginBottom:8, borderLeft:"3px solid "+C.orange }}>
            <div style={{ fontSize:11, color:C.orange, fontWeight:600, marginBottom:2 }}>{s.date}</div>
            <div style={{ fontSize:12, whiteSpace:"pre-wrap" }}>{s.corrections}</div>
          </div>
        ))}
      </div>

      {stages.map(s=>(
        <div key={s.id} style={{ background:C.card, borderRadius:14, border:"2px solid "+(expandedIdE===s.id?"#1D4ED8":"#1D4ED833"), padding:16, marginBottom:12, cursor:"pointer" }} onClick={()=>{ setExpandedIdE(expandedIdE===s.id?null:s.id); trackViewE(s); }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16 }}>{s.ressenti>=9?"🤩":s.ressenti>=7?"😃":s.ressenti>=5?"😐":s.ressenti>=3?"🫤":s.ressenti>=1?"😒":"😐"}</span>
                <span style={{ fontWeight:700, fontSize:14 }}>Stage Équipe de France</span>
              </div>
              <div style={{ color:C.muted, fontSize:11 }}>{s.date}</div>
            </div>
            <div style={{ display:"flex", gap:5 }}>
              <button onClick={(e)=>{e.stopPropagation();openEdit(s);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:2 }}><Edit2 size={13}/></button>
              <button onClick={(e)=>{e.stopPropagation();openCopy(s);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, fontSize:11 }}>⧉</button>
              <button onClick={(e)=>{e.stopPropagation();handleDelete(s.id);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, padding:2 }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:8 }}>
            <span style={{ fontSize:12, color:C.muted }}>⏱ <strong style={{ color:C.text }}>{s.duration} min</strong></span>
            {s.ressenti?<span style={{ fontSize:12, color:C.muted }}>{s.ressenti>=9?"🤩":s.ressenti>=7?"😃":s.ressenti>=5?"😐":s.ressenti>=3?"🫤":s.ressenti>=1?"😒":"😐"} <strong style={{ color:C.text }}>{s.ressenti}/10</strong></span>:null}<span style={{ fontSize:12, color:C.muted }}>🥋 <strong style={{ color:C.text }}>{s.satisfaction}/10</strong></span>
          </div>
          {s.katas && s.katas.length>0 && (
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:11, fontWeight:600, marginBottom:4, color:C.muted }}>Katas pratiqués :</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{s.katas.map(k=><Badge key={k} label={k} color="#1D4ED8"/>)}</div>
            </div>
          )}
          {s.focus && <div style={{ background:C.blue+"11", borderRadius:8, padding:"6px 10px", marginBottom:6, borderLeft:"3px solid "+C.blue }}><div style={{ fontSize:11, color:C.blue, whiteSpace:"pre-wrap" }}>🎯 <strong>Focus :</strong> {s.focus}</div></div>}
          {s.corrections && <div style={{ background:C.orange+"15", borderRadius:8, padding:"6px 10px", marginBottom:6, borderLeft:"3px solid "+C.orange }}><div style={{ fontSize:11, color:C.orange, whiteSpace:"pre-wrap" }}>⚠ <strong>Corrections :</strong> {s.corrections}</div></div>}
          {s.retours && <div style={{ background:C.green+"15", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.green }}><div style={{ fontSize:11, color:C.green, whiteSpace:"pre-wrap" }}>💬 <strong>Retours :</strong> {s.retours}</div></div>}
        </div>
      ))}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, #1D4ED8, #3B82F6)", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>{editingId?"Modifier":"Nouveau"} stage</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Durée (min) *</label>
                  <input type="number" placeholder="240" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Ressenti</label>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="range" min={1} max={10} value={form.ressenti||5} onChange={e=>setForm(f=>({...f,ressenti:parseInt(e.target.value)}))} style={{ flex:1, accentColor:"#1D4ED8" }}/>
                    <span style={{ fontWeight:800, color:"#1D4ED8", minWidth:30 }}>{form.ressenti||5}/10</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Satisfaction Technique</label>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="range" min={1} max={10} value={form.satisfaction} onChange={e=>setForm(f=>({...f,satisfaction:parseInt(e.target.value)}))} style={{ flex:1, accentColor:"#1D4ED8" }}/>
                    <span style={{ fontWeight:800, color:"#1D4ED8", minWidth:30 }}>{form.satisfaction}/10</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <StageSF label="Niveau de Difficulté" value={form.niveauDiff||"Normal"} onChange={v=>setForm(f=>({...f,niveauDiff:v}))} options={["Très Bas","Bas","Normal","Élevé","Très Élevé"]} />
              </div>
              <MultiSelect label="Katas pratiqués" options={KATAS_LIST} selected={form.katas||[]}
                onAdd={v=>setForm(f=>({...f,katas:[...(f.katas||[]),v]}))}
                onRemove={v=>setForm(f=>({...f,katas:(f.katas||[]).filter(k=>k!==v)}))}
                color="#1D4ED8" />
              {[["Focus de la séance","focus","Points travaillés, objectifs..."],["Corrections","corrections","Points à corriger..."],["Feedback du Coach","retours","Feedback des coachs..."]].map(([l,k,p])=>(
                <div key={k} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                  <textarea rows={3} placeholder={p} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/>
                </div>
              ))}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:"#1D4ED8", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 {editingId?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PRÉPA PHYSIQUE ─────────────────────────────────────────────────────────
const PHYS_TYPES = ["PPG","Force","Explosivité","Full Body","Haltérophilie","Endurance","Vitesse","Technique","Récupération","Compétition"];
const PHYS_COACHES = ["Kevin","Helvétia","Romain","Olivier","Michel","Jérémie","Hugo","Jonathan","Yves","Autre"];
const INTENSITES = ["Faible","Moyenne","Élevée","Maximale"];
const STATUTS_PHYS = ["À venir","Terminée","Non réalisé"];
const RESSENTIS_PHYS = ["😃 Excellent","😊 Très bon","🙂 Bon","😐 Moyen","😔 Fatigué","😩 Épuisé"];
const EX_TYPES = ["Classique","Bi-set","Tri-set","Super-set","Circuit","HIIT"];
const EXERCISE_MODES = ["PPG","Force","Explosivité","Full Body","Haltérophilie","Circuit","HIIT"];

const mkSerie = () => ({ id: Date.now()+Math.random(), reps:"", poids:"" });
const mkSubEx = () => ({ id: Date.now()+Math.random(), nom:"", videoUrl:"", repsCibles:"", reposEntre:"", reposApres:"", series:[mkSerie()] });
const mkEx = () => ({ id: Date.now()+Math.random(), nom:"", typeEx:"Classique", videoUrl:"", repsCibles:"", reposEntre:"", reposApres:"", series:[mkSerie(),mkSerie(),mkSerie()], sousExercices:[] });

const PrepaPhysique = ({ physiqueSessions, setPhysiqueSessions, showToast }) => {
  const all = [...(physiqueSessions||[])].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const [activeFilter, setActiveFilter] = useState("Toutes");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedIdP, setExpandedIdP] = useState(null);
  const trackViewP = async (s) => {
    const u = getCurrentUser(); if (!u) return;
    try {
      const vRef = doc(db, "session_views", "physique_"+String(s.id)+"_"+u.id);
      const vDoc = await getDoc(vRef);
      if (!vDoc.exists()) {
        await setDoc(vRef, { viewedAt: serverTimestamp(), userId: u.id, sessionId: String(s.id), type: "physique" });
        await notifyNewContent({ type:"session_viewed", title:"👁 Séance physique ouverte", body:(u.prenom||u.id)+" a ouvert la séance du "+(s.date||"")+(s.type?" — "+s.type:"")+(s.duration?" · "+s.duration+"min":""), createdBy:u.id });
      }
    } catch(e) {}
  };
  const todayStr = new Date().toISOString().split("T")[0];
  const EMPTY = { date:todayStr, type:"PPG", duration:"", intensite:"Moyenne", statut:"À venir", programme:"", coach:"", exercises:[] };
  const [form, setForm] = useState(EMPTY);

  const FILTER_LABELS = ["Toutes","Semaine","🔥 PPG","💪 Force","⚡ Explosivité","🏋️ Haltéro","🔥 Full Body","🏃 Endurance","🧘 Récup","🏆 Compét","⚡ Vitesse","🎯 Technique"];
  const typeMap = { "🔥 PPG":"PPG","💪 Force":"Force","⚡ Explosivité":"Explosivité","🏋️ Haltéro":"Haltérophilie","🔥 Full Body":"Full Body","🏃 Endurance":"Endurance","🧘 Récup":"Récupération","🏆 Compét":"Compétition","⚡ Vitesse":"Vitesse","🎯 Technique":"Technique" };
  const filterCount = (f) => {
    if (f==="Toutes") return all.length;
    if (f==="Semaine") { const n=new Date(); const w=new Date(n); w.setDate(n.getDate()-n.getDay()); return all.filter(s=>new Date(s.date)>=w).length; }
    return all.filter(s=>s.type===(typeMap[f]||f)).length;
  };
  const filtered = all.filter(s => {
    if (activeFilter==="Toutes") return true;
    if (activeFilter==="Semaine") { const n=new Date(); const w=new Date(n); w.setDate(n.getDate()-n.getDay()); return new Date(s.date)>=w; }
    return s.type===(typeMap[activeFilter]||activeFilter);
  });

  const hasExMode = EXERCISE_MODES.includes(form.type);
  const G = "linear-gradient(135deg,#7c3aed,#db2777)";
  const inp = { width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, background:"#fff", boxSizing:"border-box" };
  const lbl = { fontSize:12, fontWeight:600, display:"block", marginBottom:4 };

  const updEx = (eid, field, val) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,[field]:val}:e)}));
  const addSerie = (eid) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,series:[...e.series,mkSerie()]}:e)}));
  const delSerie = (eid, sid) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,series:e.series.filter(s=>s.id!==sid)}:e)}));
  const updSerie = (eid, sid, fld, val) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,series:e.series.map(s=>s.id===sid?{...s,[fld]:val}:s)}:e)}));
  const addSubEx = (eid) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,sousExercices:[...e.sousExercices,mkSubEx()]}:e)}));
  const delSubEx = (eid, sid) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,sousExercices:e.sousExercices.filter(s=>s.id!==sid)}:e)}));
  const updSubEx = (eid, sid, fld, val) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,sousExercices:e.sousExercices.map(s=>s.id===sid?{...s,[fld]:val}:s)}:e)}));
  const addSubSerie = (eid, sid) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,sousExercices:e.sousExercices.map(s=>s.id===sid?{...s,series:[...s.series,mkSerie()]}:s)}:e)}));
  const delSubSerie = (eid, sid, srid) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,sousExercices:e.sousExercices.map(s=>s.id===sid?{...s,series:s.series.filter(r=>r.id!==srid)}:s)}:e)}));
  const updSubSerie = (eid, sid, srid, fld, val) => setForm(f=>({...f,exercises:f.exercises.map(e=>e.id===eid?{...e,sousExercices:e.sousExercices.map(s=>s.id===sid?{...s,series:s.series.map(r=>r.id===srid?{...r,[fld]:val}:r)}:s)}:e)}));

  const handleSave = async () => {
    if (!form.date || !form.duration) { showToast&&showToast("Date et durée obligatoires","error"); return; }
    setSaving(true);
    try {
      const data = {...form, duration:parseInt(form.duration)};
      if (editingId) {
        await setDoc(doc(db,"physique_sessions",String(editingId)), data, {merge:true});
        showToast&&showToast("Séance modifiée","success");
      } else {
        // v42: forcer le refresh du token Firebase Auth avant d'écrire
        try {
          const _fb = auth.currentUser;
          if (_fb) { await _fb.getIdToken(true); }
          else { console.error("[v42] auth.currentUser null — écriture sans auth!"); }
        } catch(te) { console.warn("[v42] token refresh failed:", te.code, te.message); }
        const _ref42 = await addDoc(collection(db,"physique_sessions"), {...data, createdAt:serverTimestamp()});
        // v44 — notification push séance physique
        await addDoc(collection(db, "notifications_queue"), {
          type: "nouvelle_seance_physique",
          athlete: "Iliana Voratovic",
          type_seance: form.type || "",
          duree: parseInt(form.duration) || 0,
          programme: form.programme || "",
          coach: form.coach || "",
          date: form.date || "",
          createdAt: serverTimestamp(),
          sent: false
        });
        console.log("[v42] addDoc OK id:", _ref42.id, "type:", data.type, "uid:", auth.currentUser?.uid);
        showToast&&showToast("Séance enregistrée ✓","success");
        try {
          const u = getCurrentUser();
          const statLabel = data.statut ? " · "+data.statut : "";
          await notifyNewContent({ type:"new_physique_session", title:"📅 Nouvelle séance physique — "+data.type, body:"Séance du "+(data.date||"")+" · "+(data.duration||"")+" min"+statLabel, createdBy:u?.id||"unknown" });
        } catch(ne) {}
      }
      if (data.statut === "Terminée" || data.statut === "Terminee") {
        try {
          const u = getCurrentUser();
          await notifyNewContent({ type:"seance_physique_terminee", title:"💪 Séance physique terminée — "+data.type, body:"Séance du "+(data.date||"")+" · "+(data.duration||"")+" min"+(data.programme?" · "+data.programme:""), createdBy:u?.id||"unknown" });
        } catch(ne) {}
      }
      setForm(EMPTY); setShowForm(false); setEditingId(null);
    } catch(e) {
      console.error("[v42] handleSave error:", e.code, e.message, e);
      showToast&&showToast("Erreur: "+(e.code||e.message||"inconnue"),"error");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    deleteDoc(doc(db,"physique_sessions",String(id))).catch(console.error);
  };

  const openEdit = (s) => {
    setForm({...EMPTY,...s, duration:String(s.duration||""), exercises:s.exercises||[]});
    setEditingId(s.id); setShowForm(true);
  };
  const handleDuplicate = async (s) => {
    const { id, ...copy } = s;
    await addDoc(collection(db, "physique_sessions"), { ...copy, date: new Date().toISOString().split("T")[0], _source: "duplicate" });
  };

  const typeColor = (t) => ({"PPG":"#7c3aed","Full Body":"#7c3aed","Force":C.blue,"Haltérophilie":C.blue,"Endurance":C.green,"Explosivité":C.orange,"Compétition":C.yellow,"Technique":C.primary}[t]||C.primary);

  const SeriesBlock = ({ series, onAdd, onDel, onUpd }) => (
    <div style={{marginTop:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:12,fontWeight:600}}>Séries</span>
        <button onClick={onAdd} style={{background:"none",border:"1.5px solid "+C.primary,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:600,color:C.primary,cursor:"pointer"}}>+ Ajouter une série</button>
      </div>
      {series.map(sr=>(
        <div key={sr.id} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
          <input placeholder="Reps effectuées" value={sr.reps} onChange={e=>onUpd(sr.id,"reps",e.target.value)} style={{...inp,flex:1}}/>
          <input placeholder="Poids (kg)" value={sr.poids} onChange={e=>onUpd(sr.id,"poids",e.target.value)} style={{...inp,flex:1}}/>
          <button onClick={()=>onDel(sr.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,padding:4}}><X size={14}/></button>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <SectionHeader icon="💪" title="Préparation Physique" subtitle="Suivez toutes vos séances de préparation physique" color="#7c3aed"
        action={<button onClick={()=>{setForm(EMPTY);setEditingId(null);setShowForm(true);}} style={{background:G,border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>+ Nouvelle séance</button>}/>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[{l:"Séances totales",v:all.length,c:"#7c3aed"},{l:"Cette semaine",v:filterCount("Semaine"),c:C.green},{l:"PPG / Full Body",v:all.filter(s=>["PPG","Full Body"].includes(s.type)).length,c:C.orange}].map(s=>(
          <div key={s.l} style={{background:C.card,borderRadius:12,padding:12,border:"1px solid "+C.border,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.muted}}>{s.l}</div>
            <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
        {FILTER_LABELS.map(f=><FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} count={filterCount(f)}/>)}
      </div>

      <div style={{color:C.muted,fontSize:12,marginBottom:12}}>{filtered.length} séance{filtered.length!==1?"s":""}</div>

      {filtered.length===0
        ? <EmptyState icon={<Dumbbell size={24}/>} title="Aucune séance" sub="Ajoutez votre première séance de prépa physique" action={{label:"Nouvelle séance",fn:()=>setShowForm(true)}}/>
        : filtered.map(s=>(
          <div key={s.id} style={{background:C.card,borderRadius:14,padding:14,border:"1px solid "+(expandedIdP===s.id?"#7c3aed":C.border),marginBottom:10,cursor:"pointer"}} onClick={()=>{ setExpandedIdP(expandedIdP===s.id?null:s.id); trackViewP(s); }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                  <span style={{background:typeColor(s.type),color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{s.type}</span>
                  {s.statut&&<span style={{background:s.statut==="Terminée"?C.green+"22":s.statut==="À venir"?C.primary+"22":C.muted+"22",color:s.statut==="Terminée"?C.green:s.statut==="À venir"?C.primary:C.muted,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600}}>{s.statut}</span>}
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{new Date(s.date).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>{s.duration} min{s.intensite?" · "+s.intensite:""}{s.coach?" · "+s.coach:""}{s.programme?" · "+s.programme:""}</div>
                {s.exercises&&s.exercises.length>0&&<div style={{fontSize:11,color:"#7c3aed",marginTop:4}}>💪 {s.exercises.length} exercice{s.exercises.length>1?"s":""}</div>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={(e)=>{e.stopPropagation();openEdit(s);}} style={{background:"none",border:"1.5px solid "+C.border,borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer"}}>✏️</button>
                <button onClick={(e)=>{e.stopPropagation();handleDuplicate(s);}} style={{background:"none",border:"1.5px solid #7c3aed",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",color:"#7c3aed"}} title="Dupliquer">⧉</button>
                <button onClick={(e)=>{e.stopPropagation();handleDelete(String(s.id));}} style={{background:"none",border:"none",cursor:"pointer",color:C.red}}><Trash2 size={14}/></button>
              </div>
            </div>
            {expandedIdP===s.id&&s.exercises&&s.exercises.length>0&&(
              <div style={{marginTop:12,borderTop:"1px solid "+C.border,paddingTop:12}}>
                {s.exercises.map((ex,idx)=>(
                  <div key={ex.id||idx} style={{marginBottom:10}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#7c3aed"}}>{idx+1}. {ex.nom}</div>
                    {ex.repsCibles&&<div style={{fontSize:11,color:C.muted,marginTop:2,whiteSpace:"pre-wrap"}}>{ex.repsCibles}</div>}
                    {ex.series&&ex.series.filter(sr=>sr.reps||sr.poids).length>0&&(
                      <div style={{fontSize:11,color:C.text,marginTop:2}}>{ex.series.filter(sr=>sr.reps||sr.poids).map((sr,si)=>"S"+(si+1)+": "+sr.reps+(sr.poids?" @"+sr.poids+"kg":"")).join(" · ")}</div>
                    )}
                    {ex.sousExercices&&ex.sousExercices.map(sx=>(
                      <div key={sx.id} style={{marginTop:4,paddingLeft:10,borderLeft:"2px solid #7c3aed44"}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#7c3aed99"}}>↳ {sx.nom}</div>
                        {sx.repsCibles&&<div style={{fontSize:10,color:C.muted}}>{sx.repsCibles}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      }

      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,overflowY:"auto",padding:"20px 0"}} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false);}}>
          <div style={{background:"#fff",borderRadius:16,width:"min(700px,95vw)",margin:"0 auto"}}>
            <div style={{background:G,borderRadius:"16px 16px 0 0",padding:"20px 24px"}}>
              <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{editingId?"Modifier la séance":"Nouvelle séance"}</div>
            </div>
            <div style={{padding:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
                <div><label style={lbl}>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inp}/></div>
                <div><label style={lbl}>Type *</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={inp}>
                    {PHYS_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Durée (minutes) *</label><input type="number" min="1" placeholder="ex: 60" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} style={inp}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div><label style={lbl}>Intensité</label>
                  <select value={form.intensite} onChange={e=>setForm(f=>({...f,intensite:e.target.value}))} style={inp}>
                    {INTENSITES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Statut *</label>
                  <select value={form.statut} onChange={e=>setForm(f=>({...f,statut:e.target.value}))} style={inp}>
                    {STATUTS_PHYS.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div><label style={lbl}>Nom du programme</label><input placeholder="Ex: Programme Semaine 1" value={form.programme} onChange={e=>setForm(f=>({...f,programme:e.target.value}))} style={inp}/></div>
                <div><label style={lbl}>Coach / Préparateur</label>
                  <select value={form.coach} onChange={e=>setForm(f=>({...f,coach:e.target.value}))} style={inp}>
                    <option value="">Sélectionner...</option>
                    {PHYS_COACHES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {hasExMode&&(
                <div style={{background:"#7c3aed11",border:"1.5px solid #7c3aed33",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#7c3aed"}}>💪 Mode Force/Explosivité/Full Body activé</div>
                  <div style={{fontSize:12,color:"#7c3aed99",marginTop:2}}>Vous pouvez maintenant ajouter votre programme d'exercices ci-dessous</div>
                </div>
              )}
              {hasExMode&&(
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                    <span style={{fontSize:16}}>📹</span>
                    <span style={{fontSize:15,fontWeight:700}}>Programme d'exercices</span>
                  </div>
                  {form.exercises.map((ex,ei)=>(
                    <div key={ex.id} style={{border:"1.5px solid "+C.border,borderRadius:12,padding:16,marginBottom:12,background:"#fafafa"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <span style={{fontWeight:700,fontSize:13}}>Exercice {ei+1}</span>
                        <button onClick={()=>setForm(f=>({...f,exercises:f.exercises.filter(e=>e.id!==ex.id)}))} style={{background:"none",border:"none",cursor:"pointer",color:C.red}}><X size={16}/></button>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                        <div><label style={lbl}>Nom de l'exercice *</label><input placeholder="Ex: Squats" value={ex.nom} onChange={e=>updEx(ex.id,"nom",e.target.value)} style={inp}/></div>
                        <div><label style={lbl}>Type d'exercice</label>
                          <select value={ex.typeEx} onChange={e=>updEx(ex.id,"typeEx",e.target.value)} style={inp}>
                            {EX_TYPES.map(t=><option key={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{marginBottom:12}}><label style={lbl}>Lien vidéo (optionnel)</label><input placeholder="URL YouTube/Vimeo" value={ex.videoUrl} onChange={e=>updEx(ex.id,"videoUrl",e.target.value)} style={inp}/></div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
                        <div><label style={lbl}>Reps cibles</label><input placeholder="Ex: 8-12, Max, 30s" value={ex.repsCibles} onChange={e=>updEx(ex.id,"repsCibles",e.target.value)} style={inp}/></div>
                        <div><label style={lbl}>Repos entre reps (s)</label><input type="number" value={ex.reposEntre} onChange={e=>updEx(ex.id,"reposEntre",e.target.value)} style={inp}/></div>
                        <div><label style={lbl}>Repos après exercice (s)</label><input type="number" value={ex.reposApres} onChange={e=>updEx(ex.id,"reposApres",e.target.value)} style={inp}/></div>
                      </div>
                      <SeriesBlock series={ex.series} onAdd={()=>addSerie(ex.id)} onDel={sid=>delSerie(ex.id,sid)} onUpd={(sid,fld,val)=>updSerie(ex.id,sid,fld,val)}/>
                      {["Bi-set","Tri-set","Super-set"].includes(ex.typeEx)&&(
                        <div style={{marginTop:14,borderTop:"1px solid "+C.border,paddingTop:14}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                            <span style={{fontSize:13,fontWeight:700,color:"#7c3aed"}}>Exercices secondaires</span>
                            <button onClick={()=>addSubEx(ex.id)} style={{background:"#7c3aed",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>+ Ajouter un sous-exercice</button>
                          </div>
                          {ex.sousExercices.map((sx,si)=>(
                            <div key={sx.id} style={{border:"1.5px solid #7c3aed33",borderRadius:10,padding:14,marginBottom:10,background:"#7c3aed05"}}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                                <span style={{fontSize:12,fontWeight:700}}>Sous-Exercice {si+1}</span>
                                <button onClick={()=>delSubEx(ex.id,sx.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.red}}><X size={14}/></button>
                              </div>
                              <input placeholder="Nom du sous-exercice" value={sx.nom} onChange={e=>updSubEx(ex.id,sx.id,"nom",e.target.value)} style={{...inp,marginBottom:8}}/>
                              <input placeholder="Lien vidéo (optionnel)" value={sx.videoUrl} onChange={e=>updSubEx(ex.id,sx.id,"videoUrl",e.target.value)} style={{...inp,marginBottom:8}}/>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:8}}>
                                <input placeholder="Reps cibles" value={sx.repsCibles} onChange={e=>updSubEx(ex.id,sx.id,"repsCibles",e.target.value)} style={inp}/>
                                <input type="number" placeholder="Repos entre (s)" value={sx.reposEntre} onChange={e=>updSubEx(ex.id,sx.id,"reposEntre",e.target.value)} style={inp}/>
                                <input type="number" placeholder="Repos après (s)" value={sx.reposApres} onChange={e=>updSubEx(ex.id,sx.id,"reposApres",e.target.value)} style={inp}/>
                              </div>
                              <SeriesBlock series={sx.series} onAdd={()=>addSubSerie(ex.id,sx.id)} onDel={srid=>delSubSerie(ex.id,sx.id,srid)} onUpd={(srid,fld,val)=>updSubSerie(ex.id,sx.id,srid,fld,val)}/>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={()=>setForm(f=>({...f,exercises:[...f.exercises,mkEx()]}))} style={{width:"100%",background:G,border:"none",borderRadius:10,padding:14,fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",marginTop:4}}>+ Ajouter un exercice</button>
                </div>
              )}
              <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16,paddingTop:16,borderTop:"1px solid "+C.border}}>
                <button onClick={()=>setShowForm(false)} style={{background:"none",border:"1.5px solid "+C.border,borderRadius:8,padding:"10px 20px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><X size={14}/> Annuler</button>
                <button onClick={handleSave} disabled={saving} style={{background:G,border:"none",borderRadius:8,padding:"10px 24px",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",opacity:saving?0.7:1}}>💾 {editingId?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── COMPÉTITIONS ─────────────────────────────────────────────────────────────
const COMP_COACHES = ["Helvétia","Romain","Olivier","Yves","Jonathan","Hugo","Jérémie","Michel","Autre"];
const TOUR_NOMS = ["1er tour","2ème tour","3ème tour","Huitième de Finale","Quart de Finale","Demi Finale","Finale","Finale de Bronze","1er tour de repêchage","2ème tour de repêchage"];
const FLAG_SCORES = ["5-0","4-1","3-2","2-3","1-4","0-5","7-0","6-1","5-2","4-3","3-4","2-5","1-6","0-7"];

const RESULT_COLOR = (r) => {
  if (!r) return C.muted;
  if (r.includes("Or")) return C.yellow;
  if (r.includes("Argent")) return "#94A3B8";
  if (r.includes("Bronze")) return "#CD7F32";
  if (r.includes("Défaite") || r.includes("Perdu")) return C.red;
  return C.orange;
};

const EMPTY_COMP = { nom:"", date:"", lieu:"", statut:"À venir", coach:"", resultat:"", recordPerso:false, tours:[], lienVideo:"", notes:"" };
const EMPTY_TOUR = { nom:"1er tour", kata:"Gojūshiho Shō", scoreType:"Drapeaux", score:"5-0", ok:true, note:"" };

const Competitions = ({ competitions, setCompetitions }) => {
  const allMonths = [...new Set(
    [...competitions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(c => {
        const d = new Date(c.date);
        return d.toLocaleDateString("fr-FR", { month:"long", year:"numeric" });
      })
  )];
  const [activeMois, setActiveMois] = useState(allMonths[0] || "");
  // Auto-sélectionner le mois le plus récent quand Firestore charge
  useEffect(() => {
    if (allMonths.length > 0 && !activeMois) setActiveMois(allMonths[0]);
  }, [allMonths.length]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_COMP);
  const [newTour, setNewTour] = useState(EMPTY_TOUR);

  const openAdd = () => { setForm(EMPTY_COMP); setEditId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({...c, nom: c.nom||c.name||"", resultat: c.resultat||c.result||""}); setEditId(c.id); setShowForm(true); };
  const openCopy = (c) => { setForm({...c, nom:(c.nom||c.name||"")+" (copie)", resultat:c.resultat||c.result||"", date: new Date().toISOString().split("T")[0]}); setEditId(null); setShowForm(true); };

  const addTour = () => {
    if (!newTour.nom || !newTour.kata) return;
    setForm(f=>({...f, tours:[...f.tours, { ...newTour, num: f.tours.length+1 }]}));
    setNewTour(EMPTY_TOUR);
  };

  const removeTour = (idx) => setForm(f=>({...f, tours: f.tours.filter((_,i)=>i!==idx).map((t,i)=>({...t,num:i+1}))}));

  const handleSave = async () => {
    if (!form.nom || !form.date) return;
    if (editId) {
      // v43: mettre à jour dans Firestore
      try {
        await setDoc(doc(db, "competitions", String(editId)), { ...form, updatedAt: serverTimestamp() }, { merge: true });
      } catch(e) { console.error("[v43] Erreur update compétition:", e.code, e.message); }
      setCompetitions(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
      // Sync lienVideo dans Firestore si présent
      if (form.lienVideo) {
        try {
          const videoId = "comp_" + editId;
          const q = query(collection(db, "video_links"), where("videoId", "==", videoId));
          const snap = await getDocs(q);
          if (snap.empty) await addDoc(collection(db, "video_links"), { videoId, lien: form.lienVideo, updatedAt: serverTimestamp() });
          else await updateDoc(doc(db, "video_links", snap.docs[0].id), { lien: form.lienVideo, updatedAt: serverTimestamp() });
        } catch(e) { console.error("Erreur sync vidéo compét:", e); }
      }
    } else {
      // v43: sauvegarder dans Firestore
      try {
        const ref = await addDoc(collection(db, "competitions"), { ...form, hasVideo: !!form.lienVideo, createdAt: serverTimestamp() });
        setCompetitions(prev => [{ id: ref.id, ...form, hasVideo: !!form.lienVideo }, ...prev]);
        if (form.lienVideo) {
          try {
            await addDoc(collection(db, "video_links"), { videoId: "comp_" + ref.id, lien: form.lienVideo, updatedAt: serverTimestamp() });
          } catch(e) { console.error("Erreur sync vidéo compét:", e); }
        }
      } catch(e) {
        console.error("[v43] Erreur save compétition:", e.code, e.message);
        const newId = Date.now();
        setCompetitions(prev => [{ id: newId, ...form, hasVideo: !!form.lienVideo }, ...prev]);
      }
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer cette compétition ?")) return;
    // v43: supprimer de Firestore
    deleteDoc(doc(db, "competitions", String(id))).catch(e => console.error("[v43] Erreur delete compétition:", e));
    setCompetitions(prev => prev.filter(c => c.id !== id));
  };

  const filteredComps = competitions
    .filter(c => {
      const d = new Date(c.date);
      const mois = d.toLocaleDateString("fr-FR", { month:"long", year:"numeric" });
      return mois === activeMois;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const CompSF = ({ label, value, options, onChange }) => (
    <div>
      <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <SectionHeader icon="🏆" title="Compétitions" subtitle="Suivez vos performances et résultats 🥇" color={C.orange}
        action={<Btn onClick={openAdd} color="#fff" style={{ color:C.orange, fontSize:12 }}><Plus size={12}/> Nouvelle compétition</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
        {[{l:"Compétitions",v:competitions.length,c:C.orange},{l:"Victoires",v:competitions.filter(c=>c.result?.includes("Or")||c.result?.includes("1er")).length,c:C.yellow},{l:"Avec vidéo",v:competitions.filter(c=>c.lienVideo||c.hasVideo).length,c:C.primary}].map(s=>(
          <div key={s.l} style={{ background:C.card, borderRadius:12, padding:12, border:"1px solid "+C.border, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.muted }}>{s.l}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ fontWeight:700, marginBottom:10, fontSize:14 }}>Historique</div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {allMonths.map(m=><FilterPill key={m} label={m} active={activeMois===m} onClick={()=>setActiveMois(m)} />)}
      </div>

      {filteredComps.length === 0 && <EmptyState icon={<Trophy size={24}/>} title="Aucune compétition ce mois" sub="Essayez un autre mois" action={{ label:"Ajouter", fn:openAdd }}/>}

      {filteredComps.map(c=>(
        <div key={c.id} style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
            <div style={{ fontWeight:700, fontSize:15, flex:1, marginRight:8 }}>{c.name || c.nom}</div>
            <div style={{ display:"flex", gap:5, flexShrink:0 }}>
              {(c.lienVideo || c.hasVideo) && (
                <button onClick={()=>c.lienVideo&&window.open(c.lienVideo,"_blank")} style={{ background:C.primary+"22", border:"1px solid "+C.primary+"44", borderRadius:8, padding:"4px 8px", fontSize:11, color:C.primary, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <Video size={12}/> Vidéo
                </button>
              )}
              <button onClick={()=>openEdit(c)} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:2 }}><Edit2 size={13}/></button>
              <button onClick={()=>openCopy(c)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, fontSize:11 }}>⧉</button>
              <button onClick={()=>handleDelete(c.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, padding:2 }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>📅 {c.date} · 📍 {c.lieu} · 👤 {c.coach}</div>
          {(c.result||c.resultat) && (
            <div style={{ background:RESULT_COLOR(c.result||c.resultat)+"22", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+RESULT_COLOR(c.result||c.resultat), marginBottom:12 }}>
              <span style={{ color:RESULT_COLOR(c.result||c.resultat), fontWeight:700, fontSize:13 }}>🏆 Résultat : {c.result||c.resultat}</span>
            </div>
          )}
          {c.tours && c.tours.length > 0 && (
            <>
              <div style={{ fontWeight:600, fontSize:12, marginBottom:8, color:C.muted }}>Tours de la compétition :</div>
              {c.tours.map((t,i)=>(
                <div key={i} style={{ background:C.bg, borderRadius:10, padding:"10px 12px", marginBottom:8, display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                      <Badge label={"Tour "+t.num} color={C.orange}/><span style={{ fontWeight:600, fontSize:13 }}>{t.name||t.nom}</span>
                    </div>
                    <div style={{ fontSize:12, color:C.muted }}>Kata: <strong style={{ color:C.text }}>{t.kata}</strong> · Score: <strong style={{ color:C.text }}>{t.score}</strong></div>
                    {t.note && <div style={{ fontSize:11, color:C.muted, marginTop:2, fontStyle:"italic" }}>{t.note}</div>}
                  </div>
                  {t.ok ? <CheckCircle2 color={C.green} size={18}/> : <XCircle color={C.red} size={18}/>}
                </div>
              ))}
            </>
          )}
          {(c.notes||c.note) && (
            <div style={{ background:C.primary+"11", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.primary, marginTop:6 }}>
              <div style={{ fontSize:11, color:C.primary }}>📝 {c.notes||c.note}</div>
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.orange+", "+C.yellow+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>{editId ? "Modifier" : "Nouvelle"} compétition</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Nom de la compétition *</label>
                <input type="text" value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Lieu</label>
                  <input type="text" value={form.lieu} onChange={e=>setForm(f=>({...f,lieu:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <CompSF label="Statut" value={form.statut} options={["À venir","Terminée","Annulée"]} onChange={v=>setForm(f=>({...f,statut:v}))} />
                <CompSF label="Coach" value={form.coach} options={["Sélectionner...", ...COMP_COACHES]} onChange={v=>setForm(f=>({...f,coach:v}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Résultat</label>
                  <input type="text" placeholder="Médaille d'or..." value={form.resultat} onChange={e=>setForm(f=>({...f,resultat:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:22 }}>
                  <input type="checkbox" checked={form.recordPerso} onChange={e=>setForm(f=>({...f,recordPerso:e.target.checked}))} style={{ width:16, height:16 }}/>
                  <label style={{ fontSize:13 }}>Record personnel</label>
                </div>
              </div>

              {/* Tours */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Tours de la compétition</div>
                {form.tours.map((t,i)=>(
                  <div key={i} style={{ background:C.bg, borderRadius:10, padding:"10px 12px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12 }}>
                    <span>Tour {t.num} · <strong>{t.nom}</strong> · {t.kata} · <strong>{t.score}</strong> · {t.ok?"✅":"❌"}</span>
                    <button onClick={()=>removeTour(i)} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:16 }}>×</button>
                  </div>
                ))}
                <div style={{ background:C.bg, borderRadius:10, padding:14, border:"1px dashed "+C.border }}>
                  <div style={{ fontWeight:600, fontSize:12, marginBottom:10, color:C.orange }}>+ Ajouter un tour</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                    <CompSF label="Nom du tour" value={newTour.nom} options={TOUR_NOMS} onChange={v=>setNewTour(t=>({...t,nom:v}))} />
                    <CompSF label="Kata" value={newTour.kata} options={KATAS_LIST} onChange={v=>setNewTour(t=>({...t,kata:v}))} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                    <CompSF label="Type de score" value={newTour.scoreType} options={["Drapeaux","Chiffré"]} onChange={v=>setNewTour(t=>({...t,scoreType:v,score:v==="Drapeaux"?"5-0":""}))} />
                    <div>
                      <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Score</label>
                      {newTour.scoreType === "Drapeaux" ? (
                        <select value={newTour.score} onChange={e=>setNewTour(t=>({...t,score:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                          {FLAG_SCORES.map(s=><option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <input type="text" placeholder="Ex: 23.3" value={newTour.score} onChange={e=>setNewTour(t=>({...t,score:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/>
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Note (optionnel)</label>
                    <input type="text" placeholder="Ressenti, observation..." value={newTour.note} onChange={e=>setNewTour(t=>({...t,note:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
                    <input type="checkbox" checked={newTour.ok} onChange={e=>setNewTour(t=>({...t,ok:e.target.checked}))} style={{ width:16, height:16 }}/>
                    <label style={{ fontSize:13 }}>Qualifié / Victoire</label>
                  </div>
                  <button onClick={addTour} style={{ background:C.orange+"22", border:"1px solid "+C.orange, borderRadius:8, padding:"8px 16px", fontSize:12, color:C.orange, cursor:"pointer", fontWeight:600 }}>+ Ajouter ce tour</button>
                </div>
              </div>

              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>🎬 Lien vidéo (Google Drive, YouTube…)</label>
                <input type="text" placeholder="https://..." value={form.lienVideo} onChange={e=>setForm(f=>({...f,lienVideo:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Notes</label>
                <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:C.orange, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 {editId?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CORRECTIONS ──────────────────────────────────────────────────────────────
const CORR_COACHES = ["Helvétia","Romain","Olivier","Yves","Jonathan","Hugo","Jérémie","Michel","Fernando","Perso","Autre"];
const CORR_CATEGORIES = ["Technique","Position","Rythme","Kimé","Autre"];

const Corrections = ({ sessions }) => {
  const [activeFilter, setActiveFilter] = useState("Toutes");
  const [showForm, setShowForm] = useState(false);
  const [editingCorr, setEditingCorr] = useState(null);
  const [form, setForm] = useState({ kata:"", entraineur:"", date:"", categorie:"Technique", commentaires:"", coachFeedback:"" });

  const sessionCorrs = sessions.filter(s=>s.notes&&s.notes.length>0).map((s,i)=>({
    id:1000+i, date:s.date, trainer:s.coach||"Entraîneur", kata:s.katas?.[0]||"", content:s.notes
  }));

  const [extraCorrs, setExtraCorrs] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const handleDeleteCorr = (id) => { setDeletedIds(prev=>[...prev,id]); setExtraCorrs(prev=>prev.filter(c=>c.id!==id)); };
  const allCorrections = [...mockCorrections, ...sessionCorrs, ...extraCorrs].filter(c=>!deletedIds.includes(c.id)).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const openEdit = (c) => {
    setEditingCorr(c.id);
    setForm({ kata:c.kata||"", entraineur:c.trainer||"", date:c.date||"", categorie:c.categorie||"Technique", commentaires:c.content||"", coachFeedback:c.coachFeedback||"" });
    setShowForm(true);
  };
  const openCopy = (c) => {
    setEditingCorr(null);
    setForm({ kata:c.kata||"", entraineur:c.trainer||"", date:new Date().toISOString().split("T")[0], categorie:c.categorie||"Technique", commentaires:c.content||"", coachFeedback:"" });
    setShowForm(true);
  };
  const handleSave = () => {
    if (!form.commentaires) return;
    const newC = { id: editingCorr || Date.now(), date:form.date, trainer:form.entraineur, kata:form.kata, content:form.commentaires, categorie:form.categorie };
    if (editingCorr && editingCorr >= 1000 && editingCorr < 2000) {
      // can't edit session-derived corrections
    } else if (editingCorr) {
      setExtraCorrs(prev => prev.map(c=>c.id===editingCorr?newC:c));
      // also update mockCorrections if needed
    } else {
      setExtraCorrs(prev => [newC, ...prev]);
    }
    setShowForm(false);
    setEditingCorr(null);
  };

  const getWeekKey = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay() || 7;
    const monday = new Date(d); monday.setDate(d.getDate() - day + 1);
    return monday.toISOString().split("T")[0];
  };

  const renderList = (list) => list.map((c,i)=>(
    <div key={i} style={{ background:C.card, borderRadius:12, border:"1px solid "+C.border, padding:14, marginBottom:10, display:"flex", gap:12 }}>
      <div style={{ width:3, borderRadius:4, background:C.orange, flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
          <Avatar name={c.trainer||"?"} size={26} bg={C.primary} />
          <strong style={{ fontSize:13 }}>{c.trainer}</strong>
          {c.kata && <Badge label={c.kata} color={C.blue}/>}
          <span style={{ color:C.muted, fontSize:11 }}>{c.date}</span>
        </div>
        <div style={{ fontSize:12, color:C.text, whiteSpace:"pre-wrap" }}>{c.content}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <button onClick={()=>openEdit(c)} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:2 }}><Edit2 size={12}/></button>
        <button onClick={()=>openCopy(c)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, fontSize:11 }}>⧉</button>
        <button onClick={()=>handleDeleteCorr(c.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, padding:2 }}><Trash2 size={12}/></button>
      </div>
    </div>
  ));

  const renderGrouped = (groupFn, labelFn) => {
    const groups = {};
    allCorrections.forEach(c => { const k = groupFn(c); if (!groups[k]) groups[k]=[]; groups[k].push(c); });
    return Object.entries(groups).sort((a,b)=>b[0].localeCompare(a[0])).map(([key,list])=>(
      <div key={key} style={{ marginBottom:20 }}>
        <div style={{ background:C.orange+"22", borderRadius:8, padding:"6px 12px", marginBottom:10, fontWeight:700, fontSize:12, color:C.orange, border:"1px solid "+C.orange+"44" }}>{labelFn(key, list)}</div>
        {renderList(list.sort((a,b)=>new Date(b.date)-new Date(a.date)))}
      </div>
    ));
  };

  return (
    <div>
      <SectionHeader icon="⏱" title="Corrections" subtitle="Points techniques à travailler" color={C.orange}
        action={<Btn onClick={()=>{setEditingCorr(null);setForm({kata:"",entraineur:"",date:new Date().toISOString().split("T")[0],categorie:"Technique",commentaires:"",coachFeedback:""});setShowForm(true);}} color="#fff" style={{ color:C.orange, fontSize:12 }}><Plus size={12}/> Nouvelle correction</Btn>} />
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {["Toutes","Par semaine","Par entraîneur","Par kata"].map(f=><FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} />)}
      </div>
      <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>{allCorrections.length} corrections</div>

      {activeFilter === "Toutes" && renderList(allCorrections)}
      {activeFilter === "Par semaine" && renderGrouped(
        c => getWeekKey(c.date),
        (key, list) => { const d = new Date(key); const end = new Date(d); end.setDate(d.getDate()+6); return `Semaine du ${d.toLocaleDateString("fr-FR")} au ${end.toLocaleDateString("fr-FR")} (${list.length})`; }
      )}
      {activeFilter === "Par entraîneur" && renderGrouped(
        c => c.trainer || "Non renseigné",
        (key, list) => `${key} — ${list.length} correction${list.length>1?"s":""}`
      )}
      {activeFilter === "Par kata" && renderGrouped(
        c => c.kata || "Non renseigné",
        (key, list) => `${key} — ${list.length} correction${list.length>1?"s":""}`
      )}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.orange+", "+C.red+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Nouvelle correction</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Kata *</label>
                  <select value={form.kata} onChange={e=>setForm(f=>({...f,kata:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    <option>Sélectionner un kata</option>
                    {KATAS_LIST.map(k=><option key={k}>{k}</option>)}
                  </select></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Entraîneur *</label>
                  <select value={form.entraineur} onChange={e=>setForm(f=>({...f,entraineur:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    <option>Sélectionner un entraîneur</option>
                    {CORR_COACHES.map(c=><option key={c}>{c}</option>)}
                  </select></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Catégorie</label>
                  <select value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {CORR_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select></div>
              </div>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Commentaires</label>
                <textarea rows={3} value={form.commentaires} onChange={e=>setForm(f=>({...f,commentaires:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Commentaires du Coach</label>
                <textarea rows={3} value={form.coachFeedback} onChange={e=>setForm(f=>({...f,coachFeedback:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:C.orange, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── VIDÉOS ───────────────────────────────────────────────────────────────────
const VIDEOS_CATEGORIES = ["Kata","Compétition","Entraînement","Technique","Autre"];
const mockVideos = {
  "🏆 Compétitions": [
    { id:1, titre:"9 mai 2026 – Championnat de France Équipe Sénior", date:"2026-05-09", cat:"Compét." },
    { id:2, titre:"12 avr. 2026 – Championnat de France Équipe", date:"2026-04-12", cat:"Compét." },
    { id:3, titre:"11 avr. 2026 – Championnat de France Indiv", date:"2026-04-11", cat:"Compét." },
    { id:4, titre:"8 mars 2026 – Liga Nacional 2026", date:"2026-03-08", cat:"Compét." },
    { id:5, titre:"17 janv. 2026 – Milon Cup Junior", date:"2026-01-17", cat:"Compét." },
    { id:6, titre:"17 janv. 2026 – Milon Cup Sénior", date:"2026-01-17", cat:"Compét." },
    { id:7, titre:"9 nov. 2025 – Championnat Départemental", date:"2025-11-09", cat:"Compét." },
    { id:8, titre:"5 oct. 2025 – Liga Nacional", date:"2025-10-05", cat:"Compét." },
    { id:9, titre:"26 sept. 2025 – Lion Cup", date:"2025-09-26", cat:"Compét." },
  ],
  "💪 Cours Persos": [
    { id:10, titre:"17 mai 2026 – Gojūshiho Dai, Supaenpei", date:"2026-05-17", cat:"Perso" },
    { id:11, titre:"13 mai 2026 – Gojūshiho Dai", date:"2026-05-13", cat:"Perso" },
    { id:12, titre:"12 mai 2026 – Supaenpei", date:"2026-05-12", cat:"Perso" },
    { id:13, titre:"6 mai 2026 – Unsu, Gojūshiho Shō, Gojūshiho Dai", date:"2026-05-06", cat:"Perso" },
    { id:14, titre:"30 avr. 2026 – Sansai", date:"2026-04-30", cat:"Perso" },
    { id:15, titre:"28 avr. 2026 – Supaenpei", date:"2026-04-28", cat:"Perso" },
    { id:16, titre:"25 avr. 2026 – Gankaku", date:"2026-04-25", cat:"Perso" },
    { id:17, titre:"21 avr. 2026 – Gojūshiho Shō", date:"2026-04-21", cat:"Perso" },
    { id:18, titre:"18 avr. 2026 – Unsu", date:"2026-04-18", cat:"Perso" },
    { id:19, titre:"16 avr. 2026 – Gojūshiho Dai", date:"2026-04-16", cat:"Perso" },
  ],
};

const Videos = ({ competitions, sessions }) => {
  const [showForm, setShowForm] = useState(false);
  const [extraVideos, setExtraVideos] = useState([]);
  const [form, setForm] = useState({ titre:"", categorie:"Kata", date:"", lien:"", description:"" });
  const [editLinkId, setEditLinkId] = useState(null);
  const [linkInput, setLinkInput] = useState("");
  // Liens stockés dans Firestore (partagés entre tous les utilisateurs)
  const [videoLinks, setVideoLinks] = useState({});

  useEffect(() => {
    // Charger localStorage en base (liens existants)
    let localLinks = {};
    try { localLinks = JSON.parse(localStorage.getItem("kp_video_links")||"{}"); } catch {}
    // Puis fusionner avec Firestore (liens partagés entre utilisateurs)
    getDocs(collection(db, "video_links")).then(snap => {
      const links = { ...localLinks };
      snap.docs.forEach(d => { if (d.data().videoId && d.data().lien) links[d.data().videoId] = d.data().lien; });
      setVideoLinks(links);
    }).catch(() => {
      setVideoLinks(localLinks);
    });
  }, []);

  // Toutes les séances Perso — lien depuis la séance OU depuis videoLinks local
  const persoVideos = (sessions || [])
    .filter(s => s.type === "Perso")
    .sort((a,b) => b.date.localeCompare(a.date))
    .map(s => ({
      id: "perso_"+s.id,
      titre: new Date(s.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})
             + " – " + (s.katas&&s.katas.length ? s.katas.join(", ") : "Séance perso"),
      date: s.date, cat: "Perso",
      lien: s.lienVideo || videoLinks["perso_"+s.id] || null,
    }));

  // Toutes les compétitions — lien depuis la compét OU depuis videoLinks local
  const compVideos = (competitions || [])
    .sort((a,b) => b.date.localeCompare(a.date))
    .map(c => ({
      id: "comp_"+c.id,
      titre: new Date(c.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})
             + " – " + (c.name||c.nom||"Compétition"),
      date: c.date, cat: "Compét.",
      lien: c.lienVideo || videoLinks["comp_"+c.id] || null,
    }));

  const handleSave = () => {
    if (!form.titre) return;
    setExtraVideos(prev => [{ id:Date.now(), ...form, cat:form.categorie }, ...prev]);
    setShowForm(false);
  };

  const openVideo = (v) => {
    if (v.lien) { window.open(v.lien, "_blank"); }
    else { setEditLinkId(v.id); setLinkInput(""); }
  };

  const saveVideoLink = async () => {
    if (!linkInput.trim()) return;
    const lien = linkInput.trim();
    const videoId = editLinkId;
    // Sauvegarder dans Firestore
    try {
      const q = query(collection(db, "video_links"), where("videoId", "==", videoId));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "video_links"), { videoId, lien, updatedAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, "video_links", snap.docs[0].id), { lien, updatedAt: serverTimestamp() });
      }
    } catch(e) {
      // Fallback localStorage
      const updated = { ...videoLinks, [videoId]: lien };
      localStorage.setItem("kp_video_links", JSON.stringify(updated));
    }
    setVideoLinks(prev => ({ ...prev, [videoId]: lien }));
    window.open(lien, "_blank");
    setEditLinkId(null);
  };

  const PERSO_VIDEOS = [...persoVideos, ...extraVideos.filter(v=>v.cat!=="Compét.")];

  const renderGrid = (videos) => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
      {videos.map(v=>(
        <div key={v.id} onClick={()=>openVideo(v)} style={{ background:"#1a1a2e", borderRadius:12, overflow:"hidden", cursor: (v.lien||v.url) ? "pointer" : "default", opacity:(v.lien||v.url)?1:0.7 }}>
          <div style={{ height:90, display:"flex", alignItems:"center", justifyContent:"center", color: (v.lien||v.url) ? "#ffffff88" : "#ffffff33", position:"relative" }}>
            <Video size={28}/>
            {(v.lien||v.url) && <div style={{ position:"absolute", bottom:6, right:6, background:"#ffffff22", borderRadius:4, padding:"2px 6px", fontSize:9, color:"#fff" }}>▶ Ouvrir</div>}
          </div>
          <div style={{ padding:"8px 10px", background:C.card, borderTop:"1px solid "+C.border }}>
            <div style={{ fontSize:11, fontWeight:600, marginBottom:3, color:C.text, lineHeight:1.3 }}>{v.titre}</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:10, color:C.muted }}>{v.date}</span>
              <Badge label={v.cat} color={C.orange}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <SectionHeader icon="🎬" title="Vidéos" subtitle="Bibliothèque de vidéos d'entraînement" color="#DC2626"
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:"#DC2626", fontSize:12 }}><Plus size={12}/> Ajouter une vidéo</Btn>} />

      {[["🏆 Compétitions", compVideos], ["💪 Cours Persos", PERSO_VIDEOS]].map(([section, videos])=>(
        <div key={section} style={{ marginBottom:24 }}>
          <div style={{ background:C.yellow+"22", borderRadius:12, padding:"12px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center", border:"1px solid "+C.yellow+"44" }}>
            <span style={{ fontWeight:700, fontSize:14, color:C.orange }}>{section}</span>
            <span style={{ background:C.yellow+"44", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{videos.length}</span>
          </div>
          {videos.length > 0 ? renderGrid(videos) : (
            <div style={{ background:C.bg, borderRadius:10, padding:"14px 16px", border:"1px dashed "+C.border }}>
              <div style={{ color:C.muted, fontSize:12 }}>Aucune vidéo pour l'instant.</div>
              <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>
                {section.includes("Compét") ? "→ Ajoutez un lien vidéo dans la fiche d'une compétition (onglet Compétitions)." : "→ Ajoutez un lien vidéo dans la fiche d'une séance Perso (onglet Séances Karaté)."}
              </div>
            </div>
          )}
        </div>
      ))}

      {editLinkId && (
        <div style={{ position:"fixed", inset:0, background:"#00000099", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={()=>setEditLinkId(null)}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:6 }}>🔗 Lien vidéo</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Colle le lien Google Drive ou YouTube.<br/>Tu peux aussi l'ajouter directement dans la fiche séance ou compétition.</div>
            <input autoFocus type="url" placeholder="https://drive.google.com/..." value={linkInput} onChange={e=>setLinkInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&saveVideoLink()}
              style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", marginBottom:14 }}/>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setEditLinkId(null)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer" }}>Annuler</button>
              <button onClick={saveVideoLink} style={{ background:"#DC2626", border:"none", borderRadius:8, padding:"8px 20px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Ouvrir ▶</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"85vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, #DC2626, #F97316)", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Nouvelle vidéo</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Titre *</label>
                <input type="text" value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Catégorie</label>
                  <select value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {VIDEOS_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>🔗 Lien vidéo (Google Drive, YouTube…)</label>
                <input type="text" placeholder="https://..." value={form.lien} onChange={e=>setForm(f=>({...f,lien:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Description</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:"#DC2626", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── NUTRITION ────────────────────────────────────────────────────────────────
const MEAL_TYPES = ["Petit déjeuner","Déjeuner","Dîner","Collation"];

const Nutrition = () => {
  const [showRepas, setShowRepas] = useState(false);
  const [showPesee, setShowPesee] = useState(false);
  const [formRepas, setFormRepas] = useState({ date:new Date().toISOString().split("T")[0], type:"Déjeuner", description:"", calories:"", proteines:"", glucides:"", lipides:"", hydratation:"" });
  const [formPesee, setFormPesee] = useState({ date:new Date().toISOString().split("T")[0], poids:"" });

  return (
    <div>
      <SectionHeader icon="🥗" title="Nutrition" subtitle="Suivez votre alimentation et hydratation" color={C.green}
        action={<div style={{ display:"flex", gap:8 }}>
          <Btn onClick={()=>setShowPesee(true)} color="#fff" style={{ color:C.green, fontSize:12 }}>⚖ Ajouter pesée</Btn>
          <Btn onClick={()=>setShowRepas(true)} color="#fff" style={{ color:C.green, fontSize:12 }}><Plus size={12}/> Ajouter un repas</Btn>
        </div>} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16 }}>
          <div style={{ fontWeight:600, marginBottom:10, fontSize:13 }}>Résumé du jour</div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid "+C.border }}>
            <span style={{ fontSize:12 }}>Calories</span><strong style={{ color:C.red }}>0</strong>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0" }}>
            <span style={{ fontSize:12 }}>💧 Hydratation</span><strong style={{ color:C.blue }}>0.0 L</strong>
          </div>
        </div>
        <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16 }}>
          <div style={{ fontWeight:600, marginBottom:10, fontSize:13 }}>Répartition des macros</div>
          <div style={{ color:C.muted, fontSize:12, textAlign:"center", paddingTop:10 }}>Aucune donnée pour aujourd'hui</div>
        </div>
        <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16 }}>
          <div style={{ fontWeight:600, marginBottom:10, fontSize:13 }}>⚖ Poids actuel</div>
          <div style={{ fontSize:28, fontWeight:800, color:C.primary, textAlign:"center" }}>54.2 kg</div>
          <div style={{ fontSize:11, color:C.green, textAlign:"center" }}>↘ -0.1 kg</div>
        </div>
      </div>
      <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16 }}>
        <div style={{ fontWeight:600, marginBottom:10, fontSize:13 }}>Historique des repas</div>
        <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:20 }}>Aucun repas enregistré</div>
      </div>

      {showRepas && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowRepas(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"90vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.green+", #059669)", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Nouveau repas</div>
              <button onClick={()=>setShowRepas(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date</label>
                  <input type="date" value={formRepas.date} onChange={e=>setFormRepas(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Type de repas</label>
                  <select value={formRepas.type} onChange={e=>setFormRepas(f=>({...f,type:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {MEAL_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select></div>
              </div>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Description</label>
                <textarea rows={2} value={formRepas.description} onChange={e=>setFormRepas(f=>({...f,description:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
                {[["Calories","calories"],["Protéines (g)","proteines"],["Glucides (g)","glucides"],["Lipides (g)","lipides"]].map(([l,k])=>(
                  <div key={k}><label style={{ fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                    <input type="number" value={formRepas[k]} onChange={e=>setFormRepas(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                ))}
              </div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Hydratation (litres)</label>
                <input type="number" step="0.1" value={formRepas.hydratation} onChange={e=>setFormRepas(f=>({...f,hydratation:e.target.value}))} style={{ width:"50%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowRepas(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={()=>setShowRepas(false)} style={{ background:C.green, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPesee && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setShowPesee(false)}>
          <div style={{ background:"#fff", borderRadius:20, padding:28, width:340 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:20 }}>⚖ Ajouter une pesée</div>
            <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date</label>
              <input type="date" value={formPesee.date} onChange={e=>setFormPesee(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
            <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Poids (kg)</label>
              <input type="number" step="0.1" placeholder="54.2" value={formPesee.poids} onChange={e=>setFormPesee(f=>({...f,poids:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowPesee(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>Annuler</button>
              <button onClick={()=>setShowPesee(false)} style={{ background:C.green, border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SOMMEIL ──────────────────────────────────────────────────────────────────
const QUALITE_SOMMEIL = ["😴 Excellent","😊 Bon","😐 Moyen","😕 Mauvais","😫 Très mauvais"];
const RESSENTI_REVEIL = ["🌟 Très reposé","✨ Reposé","👍 Correct","😴 Fatigué","😩 Épuisé"];

const Sommeil = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date:"", coucher:"", reveil:"", heures:"", qualite:"😊 Bon", reveils:"0", ressentiReveil:"✨ Reposé", sommeilProfond:false, facteurs:"", reves:"", notes:"" });

  return (
    <div>
      <SectionHeader icon="🌙" title="Suivi du Sommeil" subtitle="Optimisez votre récupération et vos performances 😴" color={C.primary}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Ajouter une nuit</Btn>} />
      <EmptyState icon={<Moon size={24}/>} title="Aucune nuit enregistrée" sub="Commencez à suivre votre sommeil pour optimiser votre récupération"
        action={{ label:"Enregistrer ma première nuit", fn:()=>setShowForm(true) }} />

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, #4C1D95, "+C.primary+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>🌙 Nouvelle nuit de sommeil</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                {[["Date *","date","date"],["Heure de coucher","coucher","time"],["Heure de réveil","reveil","time"],["Heures de sommeil *","heures","number"]].map(([l,k,t])=>(
                  <div key={k}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                    <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Qualité du sommeil</label>
                  <select value={form.qualite} onChange={e=>setForm(f=>({...f,qualite:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {QUALITE_SOMMEIL.map(q=><option key={q}>{q}</option>)}
                  </select></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Réveils nocturnes</label>
                  <input type="number" min="0" value={form.reveils} onChange={e=>setForm(f=>({...f,reveils:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Ressenti au réveil</label>
                  <select value={form.ressentiReveil} onChange={e=>setForm(f=>({...f,ressentiReveil:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {RESSENTI_REVEIL.map(r=><option key={r}>{r}</option>)}
                  </select></div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <input type="checkbox" checked={form.sommeilProfond} onChange={e=>setForm(f=>({...f,sommeilProfond:e.target.checked}))} style={{ width:16, height:16 }}/>
                <label style={{ fontSize:13 }}>Sensation de sommeil profond et réparateur 💤</label>
              </div>
              {[["Facteurs ayant influencé le sommeil","facteurs"],["Rêves / Cauchemars","reves"],["Notes","notes"]].map(([l,k])=>(
                <div key={k} style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                  <textarea rows={2} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              ))}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:C.primary, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 {editingPlan?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────
const Chat = ({ authUser }) => {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = { current: null };

  useEffect(() => {
    const q = query(collection(db, "chat_messages"), orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => {
        const el = document.getElementById("chat-end");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    return () => unsub();
  }, []);

  const send = async () => {
    if (!msg.trim()) return;
    const text = msg.trim();
    setMsg("");
    try {
      const senderName = (authUser?.displayName?.split(" ")[0]) || authUser?.email?.split("@")[0] || "Équipe";
      await addDoc(collection(db, "chat_messages"), {
        text,
        sender: senderName,
        senderId: authUser?.uid || "unknown",
        createdAt: serverTimestamp(),
      });
      // Notif push pour les autres membres
      try { await notifyNewChatMessage(text, senderName, authUser?.uid); } catch(_) {}
    } catch(e) { console.error("Erreur envoi message:", e); setMsg(text); }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
  };

  const isMe = (m) => m.senderId === authUser?.uid;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100dvh - 130px)" }}>
      <div style={{ background:"linear-gradient(135deg, "+C.blue+" 60%, "+C.primary+")", borderRadius:14, padding:"16px 18px", color:"#fff", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
        <MessageCircle size={20}/><div><div style={{ fontWeight:800, fontSize:16 }}>Chat Équipe</div><div style={{ fontSize:11, opacity:0.8 }}>{messages.length} message{messages.length!==1?"s":""}</div></div>
      </div>

      <div style={{ flex:1, background:C.card, borderRadius:14, border:"1px solid "+C.border, marginBottom:10, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
        {messages.length === 0 && (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:13 }}>
            Aucun message — soyez le premier à écrire 👋
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems: isMe(m) ? "flex-end" : "flex-start" }}>
            {!isMe(m) && <div style={{ fontSize:11, color:C.muted, marginBottom:3, paddingLeft:4 }}>{m.sender}</div>}
            <div style={{ maxWidth:"75%", background: isMe(m) ? C.primary : C.bg, color: isMe(m) ? "#fff" : C.text,
              borderRadius: isMe(m) ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding:"10px 14px", fontSize:13, lineHeight:1.4 }}>
              {m.text}
            </div>
            <div style={{ fontSize:10, color:C.muted, marginTop:3, paddingLeft:4, paddingRight:4 }}>{formatTime(m.createdAt)}</div>
          </div>
        ))}
        <div id="chat-end"/>
      </div>

      <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:10, display:"flex", gap:8, alignItems:"center" }}>
        <input value={msg} onChange={e=>setMsg(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="Écrivez votre message..."
          style={{ flex:1, border:"none", outline:"none", fontSize:14, background:"transparent" }} />
        <button style={{ background:C.primary, border:"none", borderRadius:8, padding:"8px 12px", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center" }}
          onClick={send}><Send size={15}/></button>
      </div>
    </div>
  );
};

// ─── ÉQUIPE ───────────────────────────────────────────────────────────────────
const ROLES = ["Athlète","Coach","Préparateur physique","Préparateur mental","Parent"];
const ROLE_EMOJI = { "Athlète":"🥋","Coach":"🏆","Préparateur physique":"💪","Préparateur mental":"🧠","Parent":"👨‍👩‍👧" };

const MEMBERS_DEFAULT = [
  { firestoreId:"default_iliana",    prenom:"Iliana",    nom:"Voratovic", role:"Athlète",  email:"ilianavoratovic@gmail.com",     telephone:"06 36 49 01 70" },
  { firestoreId:"default_isabelle",  prenom:"Isabelle",  nom:"Voratovic", role:"Parent",   email:"isaphoenix@hotmail.fr",         telephone:"06 10 03 68 28" },
  { firestoreId:"default_alexandre", prenom:"Alexandre", nom:"Voratovic", role:"Parent",   email:"a.voratovic@isipatrimoine.com", telephone:"07 77 05 93 23" },
  { firestoreId:"default_helvetia",  prenom:"Helvétia",  nom:"Taily",     role:"Coach",    email:"helvetiataily@gmail.com",       telephone:"07 67 64 20 15" },
];

const EMPTY_FORM = { prenom:"", nom:"", role:"Athlète", email:"", telephone:"" };

const Equipe = ({ currentUser, onIdentify }) => {
  const [members, setMembers] = useState(MEMBERS_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const APP_URL = "https://karate-pro.vercel.app";

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    getDocs(collection(db, "team_members")).then(snap => {
      if (!snap.empty) {
        setMembers(snap.docs.map(d => ({ firestoreId:d.id, ...d.data() })));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => forceUpdate(n=>n+1);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingMember(null); setShowForm(true); };
  const openEdit = (m) => { setForm({ prenom:m.prenom, nom:m.nom, role:m.role, email:m.email, telephone:m.telephone }); setEditingMember(m); setShowForm(true); };

  const handleSave = async () => {
    if (!form.prenom || !form.nom || !form.email) return;
    setSaving(true);
    try {
      if (editingMember && !editingMember.firestoreId.startsWith("default_")) {
        await updateDoc(doc(db, "team_members", editingMember.firestoreId), form);
        setMembers(prev => prev.map(m => m.firestoreId === editingMember.firestoreId ? { ...m, ...form } : m));
      } else {
        const ref = await addDoc(collection(db, "team_members"), { ...form, createdAt: serverTimestamp() });
        const newMember = { firestoreId:ref.id, ...form };
        if (editingMember) {
          setMembers(prev => prev.map(m => m.firestoreId === editingMember.firestoreId ? newMember : m));
        } else {
          setMembers(prev => [...prev, newMember]);
        }
      }
      setShowForm(false);
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (m) => {
    if (!window.confirm("Supprimer " + m.prenom + " " + m.nom + " ?")) return;
    if (!m.firestoreId.startsWith("default_")) {
      await deleteDoc(doc(db, "team_members", m.firestoreId));
    }
    setMembers(prev => prev.filter(x => x.firestoreId !== m.firestoreId));
  };

  const handleInvite = async (m) => {
    const emailNorm = (m.email || "").trim().toLowerCase();
    if (!emailNorm) return;
    // Ajouter à la liste blanche Firestore si pas déjà présent
    try {
      const q = query(collection(db, "allowed_emails"), where("email", "==", emailNorm));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "allowed_emails"), { email: emailNorm, invitedBy: "alexandre", invitedAt: serverTimestamp() });
      }
    } catch(e) { console.error("Erreur ajout allowlist:", e); }
    // Ouvrir Gmail
    const subject = encodeURIComponent("Invitation – Karaté Pro SKB Elite");
    const body = encodeURIComponent(
      "Bonjour " + m.prenom + ",\n\n" +
      "Tu es invité·e à accéder à l'application Karaté Pro SKB Elite.\n\n" +
      "🔗 Accéder à l'app : " + APP_URL + "\n\n" +
      "Pour créer ton compte :\n" +
      "• Clique sur « Continuer avec Google » si tu as un compte Google\n" +
      "• Ou clique sur « Connexion par email » pour créer un mot de passe\n\n" +
      "⚠️ Utilise bien cette adresse email : " + emailNorm + "\n\n" +
      "À bientôt !\n" +
      "Alexandre"
    );
    const gmailUrl = "https://mail.google.com/mail/?view=cm&to=" + encodeURIComponent(emailNorm) + "&su=" + subject + "&body=" + body;
    window.open(gmailUrl, "_blank");
  };

  const getIdentityId = (m) => m.firestoreId.replace("default_","");

  return (
    <div>
      <SectionHeader icon="👥" title="L'équipe" subtitle="Personnes ayant accès à l'application" color={C.primary}
        action={<Btn onClick={openAdd} color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Ajouter</Btn>} />

      {currentUser ? (
        <div style={{ background:C.primary+"15", border:"1px solid "+C.primary+"33", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:C.primary, fontWeight:600 }}>
          ✅ Identifié·e en tant que <strong>{currentUser.fullName || currentUser.name}</strong>
        </div>
      ) : (
        <div style={{ background:"#FEF3C7", border:"1px solid #F59E0B55", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#92400E" }}>
          👤 Appuyez sur <strong>"C'est moi"</strong> pour vous identifier
        </div>
      )}

      {loading ? <div style={{ textAlign:"center", color:C.muted, padding:20 }}>Chargement…</div> : members.map(m => {
        const identId = getIdentityId(m);
        const isMe = currentUser?.id === identId || currentUser?.firestoreId === m.firestoreId;
        const emoji = ROLE_EMOJI[m.role] || "👤";
        return (
          <div key={m.firestoreId} style={{ background:C.card, borderRadius:12, border:"2px solid "+(isMe?C.primary:C.border), padding:14, marginBottom:10, display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:isMe?C.primary:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, overflow:"hidden", position:"relative" }}>
              {(() => { const photo = localStorage.getItem("kp_member_photo_"+m.firestoreId); return photo ? <img src={photo} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : emoji; })()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>{m.prenom} {m.nom}</div>
              <Badge label={m.role} color={C.primary} />
              <div style={{ marginTop:5, fontSize:11, color:C.muted }}>✉ {m.email}</div>
              <div style={{ fontSize:11, color:C.muted }}>📞 {m.telephone}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5, flexShrink:0 }}>
              <button onClick={() => onIdentify({ id:identId, name:m.prenom, fullName:m.prenom+" "+m.nom, role:m.role })}
                style={{ background:isMe?C.primary:C.bg, color:isMe?"#fff":C.primary, border:"1.5px solid "+C.primary, borderRadius:8, padding:"5px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                {isMe ? "✓ Moi" : "C'est moi"}
              </button>
              <button onClick={() => handleInvite(m)}
                style={{ background:"none", color:C.muted, border:"1.5px solid "+C.border, borderRadius:8, padding:"5px 9px", fontSize:11, cursor:"pointer" }}>
                📧 Inviter
              </button>
              <button onClick={() => openEdit(m)}
                style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:"2px 0" }}>
                <Edit2 size={13}/>
              </button>

              <button onClick={() => handleDelete(m)}
                style={{ background:"none", border:"none", cursor:"pointer", color:C.red, padding:"2px 0" }}>
                <Trash2 size={13}/>
              </button>
              <button onClick={() => setViewMember(m)}
                style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:"2px 0", fontSize:11, fontWeight:600 }}>
                Fiche
              </button>
            </div>
          </div>
        );
      })}

      {viewMember && (() => {
        const m = viewMember;
        const photo = localStorage.getItem("kp_member_photo_"+m.firestoreId);
        const emoji = ROLE_EMOJI[m.role] || "👤";
        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"flex-end" }} onClick={()=>setViewMember(null)}>
            <div style={{ background:"#fff", width:"100%", maxHeight:"85vh", overflowY:"auto", borderRadius:"20px 20px 0 0", padding:"24px 20px" }} onClick={e=>e.stopPropagation()}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div style={{ fontWeight:800, fontSize:18 }}>Fiche membre</div>
                <button onClick={()=>setViewMember(null)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ position:"relative", display:"inline-block" }}>
                  <div style={{ width:90, height:90, borderRadius:"50%", border:"3px solid "+C.primary, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontSize:40, margin:"0 auto 8px" }}>
                    {photo ? <img src={photo} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : emoji}
                  </div>
                  <label style={{ position:"absolute", bottom:8, right:0, background:C.primary, borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"2px solid #fff" }}>
                    <span style={{ color:"#fff", fontSize:14 }}>📷</span>
                    <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{
                      const f=e.target.files[0]; if(!f)return;
                      const r=new FileReader(); r.onload=ev=>{
                        localStorage.setItem("kp_member_photo_"+m.firestoreId, ev.target.result);
                        window.dispatchEvent(new Event("storage"));
                        setViewMember({...m}); // force re-render
                      }; r.readAsDataURL(f);
                    }}/>
                  </label>
                </div>
                <div style={{ fontWeight:800, fontSize:18 }}>{m.prenom} {m.nom}</div>
                <Badge label={m.role} color={C.primary}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[["✉ Email",m.email],["📞 Téléphone",m.telephone]].map(([l,v])=>v?(
                  <div key={l} style={{ background:C.bg, borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>{l.split(" ")[0]+" "+l.split(" ").slice(1).join(" ")}</div>
                    <div style={{ fontSize:13, fontWeight:600, wordBreak:"break-all" }}>{v}</div>
                  </div>
                ):null)}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{openEdit(m); setViewMember(null);}}
                  style={{ flex:1, background:C.primary, border:"none", borderRadius:10, padding:"12px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>
                  ✏️ Modifier
                </button>
                <button onClick={()=>handleInvite(m)}
                  style={{ flex:1, background:"none", border:"1.5px solid "+C.border, borderRadius:10, padding:"12px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  📧 Inviter
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:480 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:17 }}>{editingMember ? "Modifier" : "Ajouter"} un membre</div>
              <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20}/></button>
            </div>
            {[["Prénom *","prenom","text"],["Nom *","nom","text"],["Email *","email","email"],["Téléphone","telephone","tel"]].map(([label,key,type]) => (
              <div key={key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:14, boxSizing:"border-box" }}/>
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>Rôle</label>
              <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}
                style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:14, background:"#fff" }}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_EMOJI[r]} {r}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowForm(false)} style={{ flex:1, padding:12, borderRadius:10, border:"1.5px solid "+C.border, background:"none", fontSize:14, cursor:"pointer" }}>Annuler</button>
              <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:12, borderRadius:10, border:"none", background:C.primary, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", opacity:saving?0.7:1 }}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PROFIL ───────────────────────────────────────────────────────────────────
const Profil = ({ sessions, competitions, authUser }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem("kp_profile_photo") || null);
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kp_profile") || "null") || { prenom:"Iliana", nom:"Voratovic", email:"ilianavoratovic@gmail.com", sport:"Karaté Kata", club:"SKB Elite", dateNaissance:"", ville:"" }; }
    catch { return { prenom:"Iliana", nom:"Voratovic", email:"ilianavoratovic@gmail.com", sport:"Karaté Kata", club:"SKB Elite", dateNaissance:"", ville:"" }; }
  });
  const [editForm, setEditForm] = useState(profile);

  const avgSat = sessions.length ? (sessions.reduce((a,b)=>a+b.satisfaction,0)/sessions.length).toFixed(1) : 0;

  useEffect(() => {
    const handler = () => setProfilePhoto(localStorage.getItem("kp_profile_photo") || null);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const b64 = ev.target.result; setProfilePhoto(b64); localStorage.setItem("kp_profile_photo", b64); window.dispatchEvent(new Event("storage")); };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    setProfile(editForm);
    localStorage.setItem("kp_profile", JSON.stringify(editForm));
    setShowEdit(false);
  };

  return (
    <div>
      <SectionHeader icon="👤" title="Profil" subtitle="Vos informations personnelles" color={C.primary} />
      <div style={{ background:C.card, borderRadius:16, border:"1px solid "+C.border, padding:24, textAlign:"center", marginBottom:16 }}>
        <div style={{ position:"relative", display:"inline-block", marginBottom:12 }}>
          {profilePhoto
            ? <img src={profilePhoto} alt="Profil" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid "+C.primary }}/>
            : <Avatar name={profile.prenom+" "+profile.nom} size={80} bg={C.primary} />
          }
          <label style={{ position:"absolute", bottom:0, right:0, background:C.primary, borderRadius:"50%", width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"2px solid #fff" }}>
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }}/>
            <span style={{ color:"#fff", fontSize:14 }}>📷</span>
          </label>
        </div>
        <div style={{ fontWeight:800, fontSize:20 }}>{profile.prenom} {profile.nom}</div>
        <Badge label={profile.sport} color={C.primary} />
        {profile.club && <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>🏛️ {profile.club}</div>}
        <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>{profile.email}</div>
        {profile.ville && <div style={{ color:C.muted, fontSize:12 }}>📍 {profile.ville}</div>}
        <Btn onClick={()=>{ setEditForm(profile); setShowEdit(true); }} color={C.primary} style={{ marginTop:14 }}><Edit2 size={13}/> Modifier le profil</Btn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {[{l:"Séances totales",v:sessions.length,c:C.red},{l:"Compétitions",v:(competitions||[]).length,c:C.yellow},{l:"Satisfaction moy.",v:avgSat+"/10",c:C.green}].map(s=>(
          <div key={s.l} style={{ background:C.card, borderRadius:12, border:"1px solid "+C.border, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {authUser?.email === ADMIN_EMAIL && <AdminUsers currentUserEmail={authUser.email} />}

      {showEdit && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowEdit(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"90vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.primary+", "+C.accent+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Modifier le profil</div>
              <button onClick={()=>setShowEdit(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                {[["Prénom","prenom"],["Nom","nom"],["Email","email"],["Club","club"],["Sport / Discipline","sport"],["Ville","ville"]].map(([l,k])=>(
                  <div key={k}>
                    <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                    <input type="text" value={editForm[k]||""} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))}
                      style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date de naissance</label>
                <input type="date" value={editForm.dateNaissance||""} onChange={e=>setEditForm(f=>({...f,dateNaissance:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowEdit(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSaveProfile} style={{ background:C.primary, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PLANNING ─────────────────────────────────────────────────────────────────
const Planning = ({ plannings, setPlannings, sessions, competitions, physiqueSessions }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("planning");
  const [form, setForm] = useState({ debut:"", club:0, prepa:0, perso:0, compet:0, objectif:"", commentaireCoach:"" });
  const [editingPlan, setEditingPlan] = useState(null);

  const handleSave = () => {
    if (!form.debut) return;
    setDoc(doc(db, "weekly_plannings", form.debut), { ...form, updatedAt: serverTimestamp() }).catch(console.error);
    (async () => { try { const u = getCurrentUser(); await notifyNewContent({ type:"nouveau_planning", title:"📅 Planning semaine mis à jour", body:"Semaine du "+form.debut+(form.objectif?" — Objectif : "+form.objectif:""), createdBy:u?.id||"unknown" }); } catch(e) {} })();
    if (editingPlan) {
      setPlannings(prev => prev.map(p => p.id===editingPlan ? {...p,...form} : p));
    } else {
      setPlannings(prev => [{ id:form.debut, ...form }, ...prev.filter(p => p.debut !== form.debut)]);
    }
    setForm({ debut:"", club:0, prepa:0, perso:0, compet:0, objectif:"", commentaireCoach:"" });
    setEditingPlan(null);
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader icon="📅" title="Planning" subtitle="Organisez vos entraînements et planifiez vos semaines 📅" color={C.primary}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Planifier semaine</Btn>} />

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["planning","📋 Planification"],["calendar","📅 Calendrier"]].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid "+(activeTab===id?C.primary:C.border), background:activeTab===id?C.primary+"15":"#fff", color:activeTab===id?C.primary:C.text, fontWeight:activeTab===id?700:400, cursor:"pointer", fontSize:13 }}>{label}</button>
        ))}
      </div>

      {activeTab === "calendar" && (
        <div>
          <div style={{ background:C.primary+"11", border:"1px solid "+C.primary+"33", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:12, color:C.primary }}>
            📅 Agenda Google de <strong>ilianavoratovic@gmail.com</strong> — Le calendrier doit être défini comme public dans les paramètres Google Calendar pour s'afficher.
          </div>
          <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid "+C.border }}>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=ilianavoratovic%40gmail.com&ctz=Europe%2FParis&bgcolor=%237C3AED&color=%237C3AED&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&mode=MONTH"
              style={{ border:0, width:"100%", height:480, display:"block" }}
              frameBorder="0"
              scrolling="no"
              title="Agenda Iliana"
            />
          </div>
        </div>
      )}

      {activeTab === "planning" && (<div>

      {/* Récapitulatif S-1 — dynamique */}
      {(()=>{
        const _lm=new Date(); const _ld=_lm.getDay(); _lm.setDate(_lm.getDate()-((_ld+6)%7)-7); _lm.setHours(0,0,0,0);
        const _le=new Date(_lm); _le.setDate(_le.getDate()+6);
        const pad=n=>String(n).padStart(2,"0");
        const toKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        const _lk=toKey(_lm); const _lke=toKey(_le);
        const inLw=d=>{ const s=(d||"").slice(0,10); return s>=_lk&&s<=_lke; };
        const _lp=(plannings||[]).find(p=>p.debut===_lk)||{};
        const M=["jan.","fév.","mars","avr.","mai","juin","juil.","août","sep.","oct.","nov.","déc."];
        const _lbl=`Semaine du ${_lm.getDate()} au ${_le.getDate()} ${M[_le.getMonth()]} ${_le.getFullYear()}`;
        const clubR=(sessions||[]).filter(s=>inLw(s.date)&&(s.type==="Collectif"||s.type==="Club")).length;
        const prepaR=(physiqueSessions||[]).filter(s=>inLw(s.date)).length;
        const persoR=(sessions||[]).filter(s=>inLw(s.date)&&(s.type==="Perso"||s.type==="Entr. Perso")).length;
        const competR=(competitions||[]).filter(c=>inLw(c.date)).length;
        const rows=[
          {l:"Entraînement Club",prevu:Number(_lp.club)||0,realise:clubR,c:C.red},
          {l:"Prépa Physique",prevu:Number(_lp.prepa)||0,realise:prepaR,c:C.blue},
          {l:"Entraînement Perso",prevu:Number(_lp.perso)||0,realise:persoR,c:C.primary},
          {l:"Compétitions",prevu:Number(_lp.compet)||0,realise:competR,c:C.yellow},
        ];
        return (
          <div style={{ background:C.card, borderRadius:16, border:"1px solid "+C.border, padding:16, marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>📊 Récapitulatif S-1</div>
            <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>{_lbl}</div>
            {!_lp.debut
              ? <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:8 }}>Aucune planification enregistrée pour cette semaine.</div>
              : <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                  {rows.map(s=>{ const pct=s.prevu===0?100:Math.round((s.realise/s.prevu)*100); const ok=s.realise>=s.prevu; return (
                    <div key={s.l} style={{ background:s.c+"11", border:"1px solid "+s.c+"33", borderRadius:12, padding:"12px 14px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:s.c }}>{s.l}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                          {ok?<CheckCircle2 size={14} color={C.green}/>:<XCircle size={14} color={C.red}/>}
                          <span style={{ fontSize:11, fontWeight:700, color:ok?C.green:C.red }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.muted }}>Prévu</div><div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.prevu}</div></div>
                        <span style={{ color:C.muted }}>→</span>
                        <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.muted }}>Réalisé</div><div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.realise}</div></div>
                      </div>
                    </div>
                  );})}
                </div>}
          </div>
        );
      })()}

      {/* Planifications à venir — dynamique */}
      {(()=>{
        const _m=new Date(); const _dow=_m.getDay(); _m.setDate(_m.getDate()-((_dow+6)%7)); _m.setHours(0,0,0,0);
        const _mk=`${_m.getFullYear()}-${String(_m.getMonth()+1).padStart(2,"0")}-${String(_m.getDate()).padStart(2,"0")}`;
        const _up=(plannings||[]).filter(p=>p.debut>=_mk).sort((a,b)=>a.debut.localeCompare(b.debut));
        const _wl=(debut)=>{ const d=new Date(debut+"T00:00:00"); const fin=new Date(d); fin.setDate(fin.getDate()+6); const M=["jan.","fév.","mars","avr.","mai","juin","juil.","août","sep.","oct.","nov.","déc."]; return `Semaine du ${d.getDate()} au ${fin.getDate()} ${M[fin.getMonth()]} ${fin.getFullYear()}`; };
        return (<>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Planifications à venir</div>
          {_up.length===0 && <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:12, color:C.muted, fontSize:13, textAlign:"center" }}>Aucune planification à venir.</div>}
          {_up.map(p=>(
            <div key={p.debut} style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div><div style={{ fontWeight:700, fontSize:14 }}>{_wl(p.debut)}</div>
                  <Badge label="📅 Planifié" color={C.primary} /></div>
                <div style={{ display:"flex", gap:6 }}>
                  <Btn small outlined color={C.primary} style={{ fontSize:10 }} onClick={()=>{ setEditingPlan(p.id); setForm({debut:p.debut,club:Number(p.club)||0,prepa:Number(p.prepa)||0,perso:Number(p.perso)||0,compet:Number(p.compet)||0,objectif:p.objectif||"",commentaireCoach:p.commentaireCoach||""}); setShowForm(true); }}>Modifier</Btn>
                  <Btn small outlined color={C.red} style={{ fontSize:10 }} onClick={()=>{ deleteDoc(doc(db,"weekly_plannings",p.debut)).catch(console.error); setPlannings(prev=>prev.filter(x=>x.debut!==p.debut)); }}>Supprimer</Btn>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, margin:"12px 0" }}>
                {[{l:"Club",v:Number(p.club)||0,c:C.red},{l:"Prépa",v:Number(p.prepa)||0,c:C.blue},{l:"Perso",v:Number(p.perso)||0,c:C.muted},{l:"Compét.",v:Number(p.compet)||0,c:C.yellow}].map(x=>(
                  <div key={x.l} style={{ textAlign:"center", padding:8, background:x.c+"11", borderRadius:8 }}>
                    <div style={{ fontSize:10, color:x.c }}>{x.l}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:x.c }}>{x.v}</div>
                  </div>
                ))}
              </div>
              {p.objectif && <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+C.green }}>
                <span style={{ fontSize:12, color:C.green }}>🎯 <strong>Objectif :</strong> {p.objectif}</span>
              </div>}
            </div>
          ))}
        </>);
      })()}

      </div>)}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"90vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.primary+", "+C.accent+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Planification de la semaine</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ marginBottom:16 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Début de semaine (Lundi) *</label>
                <input type="date" value={form.debut} onChange={e=>setForm(f=>({...f,debut:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>Nombre de séances prévues :</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                {[["🥋 Entraînement Club","club"],["💪 Prépa Physique","prepa"],["👤 Entraînement Perso","perso"],["🏆 Compétitions","compet"]].map(([l,k])=>(
                  <div key={k} style={{ background:C.bg, borderRadius:10, padding:"12px 14px" }}>
                    <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:8 }}>{l}</label>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <input type="range" min={0} max={10} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:parseInt(e.target.value)}))} style={{ flex:1, accentColor:C.primary }}/>
                      <span style={{ fontSize:20, fontWeight:800, color:C.primary, minWidth:24 }}>{form[k]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Objectif de la semaine *</label>
                <input type="text" placeholder="Ex: Prépa compétition" value={form.objectif} onChange={e=>setForm(f=>({...f,objectif:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Commentaire du coach</label>
                <textarea rows={3} value={form.commentaireCoach} onChange={e=>setForm(f=>({...f,commentaireCoach:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>{ setShowForm(false); setEditingPlan(null); }} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:C.primary, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 {editingPlan?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Tableau de bord", icon:<LayoutDashboard size={16}/>, bottomIcon:<Home size={20}/>, bottomLabel:"Accueil" },
  { id:"planning", label:"Planification", icon:<Calendar size={16}/> },
  { id:"visionboard", label:"Tableau de visualisation", icon:<BarChart2 size={16}/> },
  { id:"karate", label:"Séances Karaté", icon:<Shield size={16}/>, bottomIcon:<Shield size={20}/>, bottomLabel:"Séances" },
  { id:"stage", label:"Stage Équipe de F...", icon:<Users size={16}/> },
  { id:"physique", label:"Prépa Physique", icon:<Dumbbell size={16}/>, bottomIcon:<Dumbbell size={20}/>, bottomLabel:"Prépa" },
  { id:"competitions", label:"Compétitions", icon:<Trophy size={16}/> },
  { id:"corrections", label:"Corrections", icon:<Clock size={16}/>, bottomIcon:<Clock size={20}/>, bottomLabel:"Corrections" },
  { id:"videos", label:"Vidéos", icon:<Video size={16}/> },
  { id:"nutrition", label:"Nutrition", icon:<Apple size={16}/> },
  { id:"sommeil", label:"Sommeil", icon:<Moon size={16}/> },
  { id:"chat", label:"Chat", icon:<MessageCircle size={16}/>, bottomIcon:<MessageCircle size={20}/>, bottomLabel:"Chat" },
  { id:"equipe", label:"Équipe", icon:<Users size={16}/> },
  { id:"profil", label:"Profil", icon:<User size={16}/> },
];

const BOTTOM_NAV = NAV.filter(n => n.bottomIcon);

// ─── APP ──────────────────────────────────────────────────────────────────────
const TEAM_USERS = [
  { id:"iliana",    fullName:"Iliana Voratovic",   name:"Iliana",   role:"Sportive", emoji:"🥋" },
  { id:"isabelle",  fullName:"Isabelle Voratovic",  name:"Isabelle", role:"Maman",    emoji:"👩" },
  { id:"alexandre", fullName:"Alexandre Voratovic", name:"Alexandre",role:"Papa",     emoji:"👨" },
  { id:"helvetia",  fullName:"Helvetia",            name:"Helvetia", role:"Coach",    emoji:"🏆" },
];


// ─── AUTH ─────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "a.voratovic@gmail.com";

const LoginScreen = ({ onEmailLink }) => {
  const [tab, setTab] = useState("main"); // "main" | "email" | "link_sent"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch(e) {
      setError(e.code === "auth/popup-closed-by-user" ? "" : "Erreur Google : " + e.message);
    }
    setLoading(false);
  };

  const handleEmailPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch(er) {
      const codes = { "auth/user-not-found":"Email introuvable.", "auth/wrong-password":"Mot de passe incorrect.", "auth/invalid-credential":"Email ou mot de passe incorrect.", "auth/too-many-requests":"Trop de tentatives. Réessayez plus tard." };
      setError(codes[er.code] || "Erreur : " + er.message);
    }
    setLoading(false);
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await sendSignInLinkToEmail(auth, email, { url: window.location.origin, handleCodeInApp: true });
      localStorage.setItem("kp_signin_email", email);
      setTab("link_sent");
    } catch(er) {
      setError("Erreur : " + er.message);
    }
    setLoading(false);
  };

  const inp = { width:"100%", border:"1.5px solid #E2E8F0", borderRadius:10, padding:"12px 14px", fontSize:14, boxSizing:"border-box", marginBottom:10, outline:"none" };
  const btnPrimary = { width:"100%", background:"#7C3AED", border:"none", borderRadius:10, padding:"13px 20px", fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 };
  const btnSecondary = { width:"100%", background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:10, padding:"12px 20px", fontSize:14, fontWeight:600, color:"#1E293B", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <img src="/iliana.png" alt="Karaté Pro" style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", objectPosition:"top", marginBottom:12, border:"3px solid #7C3AED" }}/>
          <div style={{ fontWeight:900, fontSize:22, color:"#1E293B" }}>Karaté Pro</div>
          <div style={{ color:"#94A3B8", fontSize:13, marginTop:4 }}>Accès privé</div>
        </div>

        {tab === "link_sent" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📬</div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>Lien envoyé !</div>
            <div style={{ color:"#64748B", fontSize:13, marginBottom:20 }}>Vérifiez votre boîte mail <strong>{email}</strong> et cliquez sur le lien pour vous connecter.</div>
            <button onClick={()=>setTab("main")} style={{ ...btnSecondary }}>← Retour</button>
          </div>
        )}

        {tab === "main" && (
          <>
            <button onClick={handleGoogle} disabled={loading} style={btnSecondary}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuer avec Google
            </button>

            <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0" }}>
              <div style={{ flex:1, height:1, background:"#E2E8F0" }}/>
              <span style={{ color:"#94A3B8", fontSize:12 }}>ou</span>
              <div style={{ flex:1, height:1, background:"#E2E8F0" }}/>
            </div>

            <button onClick={()=>setTab("email")} style={{ ...btnSecondary, borderColor:"#7C3AED", color:"#7C3AED" }}>
              ✉️ Connexion par email
            </button>

            {error && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 14px", color:"#DC2626", fontSize:13, marginTop:8 }}>{error}</div>}

            <div style={{ textAlign:"center", color:"#CBD5E1", fontSize:11, marginTop:20 }}>
              Accès sur invitation uniquement
            </div>
          </>
        )}

        {tab === "email" && (
          <>
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              <button onClick={()=>setTab("password_form")} style={{ flex:1, padding:"9px 0", borderRadius:8, border:"none", background:tab==="password_form"?"#7C3AED":"#F1F5F9", color:tab==="password_form"?"#fff":"#64748B", fontWeight:600, fontSize:13, cursor:"pointer" }}>Mot de passe</button>
              <button onClick={()=>setTab("magic_link")} style={{ flex:1, padding:"9px 0", borderRadius:8, border:"none", background:tab==="magic_link"?"#7C3AED":"#F1F5F9", color:tab==="magic_link"?"#fff":"#64748B", fontWeight:600, fontSize:13, cursor:"pointer" }}>Lien magique</button>
            </div>

            <form onSubmit={handleEmailPassword}>
              <input type="email" placeholder="Adresse email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} required autoFocus/>
              <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} style={inp} required/>
              {error && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 14px", color:"#DC2626", fontSize:13, marginBottom:10 }}>{error}</div>}
              <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "Connexion…" : "🔐 Se connecter"}</button>
            </form>

            <div style={{ textAlign:"center", margin:"8px 0", color:"#94A3B8", fontSize:12 }}>Pas de mot de passe ?</div>
            <button onClick={()=>setTab("magic_link")} style={{ ...btnSecondary, fontSize:12, padding:"10px 20px" }}>📧 Recevoir un lien de connexion</button>
            <button onClick={()=>setTab("main")} style={{ background:"none", border:"none", color:"#94A3B8", fontSize:12, cursor:"pointer", width:"100%", marginTop:6 }}>← Retour</button>
          </>
        )}

        {tab === "magic_link" && (
          <>
            <div style={{ color:"#64748B", fontSize:13, marginBottom:16, textAlign:"center" }}>Entrez votre email. Vous recevrez un lien pour vous connecter instantanément, sans mot de passe.</div>
            <form onSubmit={handleMagicLink}>
              <input type="email" placeholder="Adresse email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} required autoFocus/>
              {error && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 14px", color:"#DC2626", fontSize:13, marginBottom:10 }}>{error}</div>}
              <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "Envoi…" : "📧 Envoyer le lien"}</button>
            </form>
            <button onClick={()=>setTab("main")} style={{ background:"none", border:"none", color:"#94A3B8", fontSize:12, cursor:"pointer", width:"100%", marginTop:6 }}>← Retour</button>
          </>
        )}
      </div>
    </div>
  );
};

const AdminUsers = ({ currentUserEmail }) => {
  const [users, setUsers] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "allowed_emails"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const invite = async () => {
    if (!newEmail.trim()) return;
    setLoading(true); setMsg("");
    try {
      // 1. Ajouter à la liste blanche Firestore
      const q = query(collection(db, "allowed_emails"), where("email", "==", newEmail.trim()));
      const existing = await getDocs(q);
      if (existing.empty) {
        await addDoc(collection(db, "allowed_emails"), { email: newEmail.trim().toLowerCase(), invitedBy: currentUserEmail, invitedAt: serverTimestamp() });
      }
      // 2. Ouvrir Gmail dans le navigateur avec l'email pré-rempli
      const appUrl = window.location.origin;
      const subject = encodeURIComponent("Invitation — Karaté Pro SKB Elite");
      const body = encodeURIComponent(
        "Bonjour,\n\n" +
        "Tu es invité(e) à accéder à l'application Karaté Pro de l'équipe SKB Elite.\n\n" +
        "🔗 Accéder à l'app : " + appUrl + "\n\n" +
        "Une fois sur l'app :\n" +
        "• Clique sur « Continuer avec Google » si tu as un compte Google\n" +
        "• Ou clique sur « Connexion par email » pour créer un mot de passe\n\n" +
        "⚠️ Utilise bien cette adresse email pour te connecter : " + newEmail.trim() + "\n\n" +
        "À bientôt !\n" +
        "Alexandre"
      );
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(newEmail.trim())}&su=${subject}&body=${body}`;
      window.open(gmailUrl, "_blank");
      setMsg("✅ " + newEmail.trim() + " ajouté. Gmail s'est ouvert — clique Envoyer.");
      setNewEmail("");
      loadUsers();
    } catch(e) {
      setMsg("❌ Erreur : " + e.message);
    }
    setLoading(false);
  };

  const remove = async (id, email) => {
    if (!window.confirm("Supprimer l'accès de " + email + " ?")) return;
    await deleteDoc(doc(db, "allowed_emails", id));
    loadUsers();
  };

  return (
    <div style={{ background:"#F8F7FF", border:"2px solid #7C3AED33", borderRadius:16, padding:20, marginTop:20 }}>
      <div style={{ fontWeight:800, fontSize:15, color:"#7C3AED", marginBottom:4 }}>🛡️ Gestion des accès</div>
      <div style={{ fontSize:12, color:"#94A3B8", marginBottom:16 }}>Invitez des personnes à accéder à l'app</div>

      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input type="email" placeholder="Email à inviter…" value={newEmail} onChange={e=>setNewEmail(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&invite()}
          style={{ flex:1, border:"1.5px solid #E2E8F0", borderRadius:8, padding:"10px 12px", fontSize:13 }}/>
        <button onClick={invite} disabled={loading || !newEmail.trim()} style={{ background:"#7C3AED", border:"none", borderRadius:8, padding:"10px 16px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          {loading ? "…" : "Inviter"}
        </button>
      </div>

      {msg && <div style={{ fontSize:12, color:msg.startsWith("✅")?"#10B981":"#EF4444", marginBottom:10 }}>{msg}</div>}

      <div style={{ borderTop:"1px solid #E2E8F0", paddingTop:12 }}>
        {users.length === 0 && <div style={{ color:"#94A3B8", fontSize:12, textAlign:"center" }}>Aucun utilisateur invité</div>}
        {users.map(u => (
          <div key={u.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F1F5F9" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{u.email}</div>
              <div style={{ fontSize:11, color:"#94A3B8" }}>Invité par {u.invitedBy}</div>
            </div>
            <button onClick={()=>remove(u.id, u.email)} style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:6, padding:"4px 10px", color:"#DC2626", fontSize:11, cursor:"pointer" }}>Retirer</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [authUser, setAuthUser] = useState(undefined); // undefined=chargement, null=non connecté
  const [authAllowed, setAuthAllowed] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [sessions, setSessions] = useState(ALL_SESSIONS);
  const [competitions, setCompetitions] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [physiqueSessions, setPhysiqueSessions] = useState([]);
  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadSeances, setUnreadSeances] = useState(0);
  const [currentUser, setCurrentUserState] = useState(() => { try { return JSON.parse(localStorage.getItem("kp_user")||"null"); } catch { return null; } });
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashOpacity, setSplashOpacity] = useState(1);
  const [notifPermission, setNotifPermission] = useState("default");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Détecter si l'URL contient un lien de connexion Firebase (invitation)
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = localStorage.getItem("kp_signin_email");
      if (!email) email = window.prompt("Confirmez votre adresse email pour terminer la connexion :");
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => { localStorage.removeItem("kp_signin_email"); window.history.replaceState({}, document.title, "/"); })
          .catch(e => console.error("Erreur lien email:", e));
      }
    }
    // Écouter les changements d'authentification
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setAuthUser(null); setAuthAllowed(false); return; }
      if (user.email === ADMIN_EMAIL) { setAuthUser(user); setAuthAllowed(true); return; }
      try {
        const q = query(collection(db, "allowed_emails"), where("email", "==", user.email.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) { setAuthUser(user); setAuthAllowed(true); }
        else { await signOut(auth); setAuthUser(null); setAuthAllowed(false); alert("Accès non autorisé. Contactez l'administrateur."); }
      } catch(e) { setAuthUser(user); setAuthAllowed(true); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser) return;
    // Désinscrire l'ancien SW Firebase qui bloque OneSignal, puis attendre avant d'init
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => {
          if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            reg.unregister();
          }
        });
      });
    }
    // Initialiser OneSignal
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: "0e17a9d1-8c6e-4131-9644-7ab407e46c75",
          notifyButton: { enable: false },
        });
        // Vérifier si déjà abonné
        const optedIn = OneSignal.User.PushSubscription.optedIn;
        if (optedIn) {
          setNotifPermission("granted");
          const playerId = OneSignal.User.PushSubscription.id;
          if (playerId) await saveOneSignalPlayerId(authUser.uid, playerId);
        }
        // Écouter les changements d'abonnement
        OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
          if (event.current.optedIn) {
            setNotifPermission("granted");
            const playerId = event.current.id;
            if (playerId) await saveOneSignalPlayerId(authUser.uid, playerId);
            showToast("✅ Notifications push activées");
          } else {
            setNotifPermission("default");
          }
        });
      } catch (err) {
        console.error("OneSignal init error:", err);
      }
    });
  }, [authUser]);

  // Notif in-app : nouveau message chat (hors onglet chat)
  useEffect(() => {
    if (!authUser) return;
    let initialized = false;
    const q = query(collection(db, "chat_messages"), orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (!initialized) { initialized = true; return; }
      snap.docChanges().forEach(change => {
        if (change.type === "added") {
          const d = change.doc.data();
          if (d.senderId !== authUser.uid && page !== "chat") {
            showToast("💬 Nouveau message de " + (d.sender || "?") + " — " + (d.text || ""));
          }
        }
      });
    });
    return () => unsub();
  }, [authUser, page]);

  useEffect(() => {
    const fadeT = setTimeout(() => setSplashOpacity(0), 2200);
    const hideT = setTimeout(() => setSplashVisible(false), 2800);
    return () => { clearTimeout(fadeT); clearTimeout(hideT); };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setAuthUser(null);
    setAuthAllowed(false);
  };

  // Sessions karaté : migration ALL_SESSIONS → Firestore (1 fois) puis source unique
  useEffect(() => {
    if (!authUser) return;
    const migKey = "kp_sess_migrated_" + authUser.uid;
    let unsub;
    const init = async () => {
      if (!localStorage.getItem(migKey)) {
        try {
          const migRef = doc(db, "meta", "sessions_migration_v1");
          const migDoc = await getDoc(migRef);
          if (!migDoc.exists()) {
            await setDoc(migRef, { startedAt: serverTimestamp(), uid: authUser.uid });
            const batchSize = 10;
            for (let i = 0; i < ALL_SESSIONS.length; i += batchSize) {
              await Promise.all(
                ALL_SESSIONS.slice(i, i + batchSize).map(s =>
                  addDoc(collection(db, "seances"), { ...s, _source: "mock" })
                )
              );
            }
            await setDoc(migRef, { completedAt: serverTimestamp(), count: ALL_SESSIONS.length }, { merge: true });
          }
          localStorage.setItem(migKey, "1");
        } catch(e) { console.error("Migration sessions:", e); }
      }
      unsub = onSnapshot(collection(db, "seances"), (snap) => {
        setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    };
    init();
    return () => unsub && unsub();
  }, [authUser]);

  // Physique : migration mockPhysique → Firestore (1 fois) puis onSnapshot
  // ─── Migration mockCompetitions → Firestore puis onSnapshot ─────────────────
  useEffect(() => {
    if (!authUser) return;
    const migKey = "kp_comp_migrated_" + authUser.uid;
    let unsub;
    const init = async () => {
      // 1. Seed si jamais migré et Firestore vide
      if (!localStorage.getItem(migKey)) {
        const snap = await getDocs(collection(db, "competitions"));
        if (snap.empty) {
          for (const c of mockCompetitions) {
            const { id: _id, ...rest } = c;
            await addDoc(collection(db, "competitions"), { ...rest, createdAt: serverTimestamp() });
          }
        }
        localStorage.setItem(migKey, "1");
      }
      // 2. onSnapshot en temps réel
      unsub = onSnapshot(collection(db, "competitions"), (snap) => {
        setCompetitions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => { console.error("[v43] onSnapshot competitions ERREUR:", err.code, err.message); });
    };
    init();
    return () => { if (unsub) unsub(); };
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    const migKey = "kp_phys_migrated_" + authUser.uid;
    let unsub;
    const init = async () => {
      if (!localStorage.getItem(migKey)) {
        try {
          const migRef = doc(db, "meta", "physique_migration_v1");
          const migDoc = await getDoc(migRef);
          if (!migDoc.exists()) {
            await setDoc(migRef, { startedAt: serverTimestamp(), uid: authUser.uid });
            const batchSize = 10;
            for (let i = 0; i < mockPhysique.length; i += batchSize) {
              await Promise.all(
                mockPhysique.slice(i, i + batchSize).map(s =>
                  addDoc(collection(db, "physique_sessions"), { ...s, _source: "mock" })
                )
              );
            }
            await setDoc(migRef, { completedAt: serverTimestamp(), count: mockPhysique.length }, { merge: true });
          }
          localStorage.setItem(migKey, "1");
        } catch(e) { console.error("Migration physique:", e); }
      }
      unsub = onSnapshot(collection(db, "physique_sessions"),
        { includeMetadataChanges: true },
        (snap) => {
          // v42: détecter les writes rejetés par le serveur
          snap.docChanges().forEach(ch => {
            if (ch.type === "removed" && !ch.doc.metadata.hasPendingWrites) {
              const d = ch.doc.data();
              console.warn("[v42] Doc SUPPRIMÉ/REJETÉ par serveur:", ch.doc.id, "type:", d?.type, "date:", d?.date);
            }
            if (ch.type === "added" && ch.doc.metadata.hasPendingWrites) {
              console.log("[v42] Write en attente serveur:", ch.doc.id, "type:", ch.doc.data()?.type);
            }
            if (ch.type === "modified" && !ch.doc.metadata.hasPendingWrites && !ch.doc.metadata.fromCache) {
              console.log("[v42] Write CONFIRMÉ serveur:", ch.doc.id, "type:", ch.doc.data()?.type);
            }
          });
          setPhysiqueSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (err) => { console.error("[v42] onSnapshot Firestore ERREUR:", err.code, err.message); }
      );
    };
    init();
    return () => unsub && unsub();
  }, [authUser]);

  // ─── SEED PPG SESSIONS (Iliana PPG 2.xlsx) ──────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const seedKey = "kp_ppg_seed_v1_" + authUser.uid;
    const init = async () => {
      if (localStorage.getItem(seedKey)) return;
      try {
        const seedRef = doc(db, "meta", "physique_seed_ppg_v1");
        const seedDoc = await getDoc(seedRef);
        if (!seedDoc.exists()) {
          await setDoc(seedRef, { startedAt: serverTimestamp(), uid: authUser.uid });
          const ppgData = [
            {
              date: "2026-06-10", type: "PPG", duration: 75, intensite: "Elevee",
              statut: "Terminee", coach: "Kevin", programme: "Full Body PPG",
              exercises: [
                { id:101, nom:"Velo", typeEx:"Classique", videoUrl:"", repsCibles:"4 min - echauffement progressif", reposEntre:"", reposApres:"", series:[], sousExercices:[] },
                { id:102, nom:"Trap Barre Deadlift", typeEx:"Bi-set", videoUrl:"Trap Barre Deadlift X Kb Swing Iliana", repsCibles:"3 reps @55-60kg - 4 Rds",
                  reposEntre:"", reposApres:"150",
                  series:[{id:1021,reps:"3",poids:"55"},{id:1022,reps:"3",poids:"55"},{id:1023,reps:"3",poids:"60"},{id:1024,reps:"3",poids:"60"}],
                  sousExercices:[{id:1025,nom:"Kb Swing Russe elastique",videoUrl:"",repsCibles:"8 reps @RPE 8 - focus explosivite",reposEntre:"",reposApres:"",series:[{id:10251,reps:"6",poids:""},{id:10252,reps:"6",poids:""},{id:10253,reps:"6",poids:""},{id:10254,reps:"6",poids:""}]}]
                },
                { id:103, nom:"Squats Smith Machine", typeEx:"Classique", videoUrl:"Squat Smith Machine Iliana", repsCibles:"4x20s isometrique @RPE 8",
                  reposEntre:"", reposApres:"120",
                  series:[{id:1031,reps:"20s",poids:"30"},{id:1032,reps:"20s",poids:"30"},{id:1033,reps:"20s",poids:"33"},{id:1034,reps:"20s",poids:"36"}],
                  sousExercices:[]
                },
                { id:104, nom:"Banded Lunges", typeEx:"Classique", videoUrl:"Banded lunges Iliana", repsCibles:"3x8/8 reps - tempo 2s excentrique",
                  reposEntre:"", reposApres:"60",
                  series:[{id:1041,reps:"8/8",poids:"20"},{id:1042,reps:"8/8",poids:"20"},{id:1043,reps:"8/8",poids:"20"}],
                  sousExercices:[]
                },
                { id:105, nom:"Smith Machine Bench Press", typeEx:"Bi-set", videoUrl:"Bloc Push Iliana", repsCibles:"5 reps - Every 2min30 x4",
                  reposEntre:"", reposApres:"150",
                  series:[{id:1051,reps:"5",poids:"20"},{id:1052,reps:"5",poids:"21.5"},{id:1053,reps:"5",poids:"21.5"},{id:1054,reps:"5",poids:"23"}],
                  sousExercices:[{id:1055,nom:"Med Ball Throw position allongee",videoUrl:"",repsCibles:"6 reps max hauteur",reposEntre:"",reposApres:"",series:[{id:10551,reps:"6",poids:""},{id:10552,reps:"6",poids:""},{id:10553,reps:"6",poids:""},{id:10554,reps:"6",poids:""}]}]
                },
                { id:106, nom:"Triceps Extension Poulie", typeEx:"Classique", videoUrl:"Triceps Extension Poulie Iliana", repsCibles:"3x10 reps @RPE 7-8 - 2s excentrique",
                  reposEntre:"", reposApres:"90",
                  series:[{id:1061,reps:"10",poids:"10"},{id:1062,reps:"10",poids:"10"},{id:1063,reps:"10",poids:"10"}],
                  sousExercices:[]
                },
                { id:107, nom:"Echo Bike Metcon", typeEx:"Bi-set", videoUrl:"Metcom Iliana", repsCibles:"2x20s on/10s off @RPE 10 - 4 Rds",
                  reposEntre:"", reposApres:"120",
                  series:[{id:1071,reps:"2x20s",poids:""},{id:1072,reps:"2x20s",poids:""},{id:1073,reps:"2x20s",poids:""},{id:1074,reps:"2x20s",poids:""}],
                  sousExercices:[{id:1075,nom:"Mawashs Pao avec retour en zenkutsu",videoUrl:"",repsCibles:"10/10 reps @RPE 10 max vitesse",reposEntre:"",reposApres:"",series:[{id:10751,reps:"10/10",poids:""},{id:10752,reps:"10/10",poids:""},{id:10753,reps:"10/10",poids:""},{id:10754,reps:"10/10",poids:""}]}]
                }
              ]
            },
            {
              date: "2026-06-12", type: "PPG", duration: 75, intensite: "Elevee",
              statut: "Terminee", coach: "Kevin", programme: "Full Body PPG",
              exercises: [
                { id:201, nom:"Ski Erg", typeEx:"Classique", videoUrl:"", repsCibles:"4 min - echauffement", reposEntre:"", reposApres:"", series:[], sousExercices:[] },
                { id:202, nom:"Hip Thrust", typeEx:"Bi-set", videoUrl:"Hip Trust Iliana", repsCibles:"3 reps @90-100kg @RPE 8-9 - 4 Rds",
                  reposEntre:"", reposApres:"150",
                  series:[{id:2021,reps:"3",poids:"90"},{id:2022,reps:"3",poids:"90"},{id:2023,reps:"3",poids:"100"},{id:2024,reps:"3",poids:"100"}],
                  sousExercices:[{id:2025,nom:"Kb SDHP",videoUrl:"",repsCibles:"6 reps @RPE 8 max vitesse",reposEntre:"",reposApres:"",series:[{id:20251,reps:"16",poids:""},{id:20252,reps:"16",poids:""},{id:20253,reps:"20",poids:""},{id:20254,reps:"20",poids:""}]}]
                },
                { id:203, nom:"Leg Curl", typeEx:"Classique", videoUrl:"Leg Curl Iliana", repsCibles:"3x10 reps @RPE 8 - 2s excentrique",
                  reposEntre:"", reposApres:"120",
                  series:[{id:2031,reps:"10",poids:"30"},{id:2032,reps:"10",poids:"35"},{id:2033,reps:"10",poids:"42.5"}],
                  sousExercices:[]
                },
                { id:204, nom:"Leg Extension", typeEx:"Classique", videoUrl:"Leg Extension Iliana", repsCibles:"2x12 reps Tempo @RPE 8 - 2s excentrique",
                  reposEntre:"", reposApres:"60",
                  series:[{id:2041,reps:"12",poids:"42.5"},{id:2042,reps:"12",poids:"47.5"}],
                  sousExercices:[]
                },
                { id:205, nom:"Tirage Horizontal Poulie", typeEx:"Classique", videoUrl:"Tirage Horizontal Poulie Iliana", repsCibles:"4x6 reps Tempo @RPE 8 - 2s excentrique",
                  reposEntre:"", reposApres:"120",
                  series:[{id:2051,reps:"6",poids:"25"},{id:2052,reps:"6",poids:"25"},{id:2053,reps:"6",poids:"30"},{id:2054,reps:"6",poids:"35"}],
                  sousExercices:[]
                },
                { id:206, nom:"Ski Erg Pull explosivite", typeEx:"Bi-set", videoUrl:"Pull Iliana", repsCibles:"10/8 Cals @RPE 10 - 3 Rds",
                  reposEntre:"", reposApres:"120",
                  series:[{id:2061,reps:"10 cals",poids:"5"},{id:2062,reps:"10 cals",poids:"5"},{id:2063,reps:"8 cals",poids:"5"}],
                  sousExercices:[{id:2065,nom:"Slam Balls",videoUrl:"",repsCibles:"10 reps @RPE 10 max impact",reposEntre:"",reposApres:"",series:[{id:20651,reps:"10",poids:"5"},{id:20652,reps:"10",poids:"5"},{id:20653,reps:"10",poids:"5"}]}]
                },
                { id:207, nom:"Rotation de Buste Poulie", typeEx:"Bi-set", videoUrl:"Rotation de buste poulie Iliana", repsCibles:"8/8 rotations @RPE 7 - 2-3 Rds",
                  reposEntre:"", reposApres:"90",
                  series:[{id:2071,reps:"8/8",poids:"7.5"},{id:2072,reps:"8/8",poids:"7.5"},{id:2073,reps:"8/8",poids:"7.5"}],
                  sousExercices:[{id:2075,nom:"Biceps Curl",videoUrl:"Biceps Curl Iliana",repsCibles:"8 reps @RPE 7",reposEntre:"",reposApres:"",series:[{id:20751,reps:"8",poids:"10"},{id:20752,reps:"8",poids:"14"},{id:20753,reps:"8",poids:"14"}]}]
                }
              ]
            }
          ];
          await Promise.all(ppgData.map(s => addDoc(collection(db, "physique_sessions"), { ...s, _source: "seed_ppg" })));
          await setDoc(seedRef, { completedAt: serverTimestamp(), count: ppgData.length }, { merge: true });
        }
        localStorage.setItem(seedKey, "1");
      } catch(e) { console.error("Seed PPG:", e); }
    };
    init();
  }, [authUser]);

  // ─── SEED PPG SESSION 17/06/2026 ─────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const seedKey = "kp_ppg_seed_v2_" + authUser.uid;
    const init = async () => {
      if (localStorage.getItem(seedKey)) return;
      try {
        const seedRef = doc(db, "meta", "physique_seed_ppg_v2");
        const seedDoc = await getDoc(seedRef);
        if (!seedDoc.exists()) {
          await setDoc(seedRef, { startedAt: serverTimestamp(), uid: authUser.uid });
          const ppgData = [
            {
              date: "2026-06-17", type: "PPG", duration: 75, intensite: "Elevee",
              statut: "Terminee", coach: "Kevin", programme: "Full Body PPG",
              exercises: [
                { id:301, nom:"Velo", typeEx:"Classique", videoUrl:"", repsCibles:"4 min - augmentation progressive du rythme toutes les minutes", reposEntre:"", reposApres:"", series:[], sousExercices:[] },
                { id:302, nom:"Trap Barre Deadlift", typeEx:"Bi-set", videoUrl:"Trap Barre Deadlift X Kb Squat Jump Iliana",
                  repsCibles:"4 reps Tempo @55-65kg @RPE 8 - 4 Rds - 2s excentrique + max vitesse montee",
                  reposEntre:"", reposApres:"150",
                  series:[{id:3021,reps:"4",poids:"55"},{id:3022,reps:"4",poids:"60"},{id:3023,reps:"4",poids:"60"},{id:3024,reps:"4",poids:"65"}],
                  sousExercices:[{id:3025,nom:"Kb Squats Jump",videoUrl:"",repsCibles:"6 reps - max hauteur sur chaque saut",reposEntre:"",reposApres:"",series:[{id:30251,reps:"6",poids:"6"},{id:30252,reps:"6",poids:"6"},{id:30253,reps:"6",poids:"10"},{id:30254,reps:"6",poids:"10"}]}]
                },
                { id:303, nom:"Squats Smith Machine", typeEx:"Classique", videoUrl:"Squat Smith Machine Iliana",
                  repsCibles:"4x6 reps Tempo - focus posture - 2s excentrique + max vitesse montee",
                  reposEntre:"", reposApres:"120",
                  series:[{id:3031,reps:"6",poids:"30"},{id:3032,reps:"6",poids:"35"},{id:3033,reps:"6",poids:"35"},{id:3034,reps:"6",poids:"40"}],
                  sousExercices:[]
                },
                { id:304, nom:"Banded Lunges", typeEx:"Classique", videoUrl:"Banded lunges Iliana",
                  repsCibles:"3x20s/20s isometrique @RPE 8 - leste avec 2 Kbs ou Dbs - 2s excentrique",
                  reposEntre:"", reposApres:"60",
                  series:[{id:3041,reps:"20s/20s",poids:"12"},{id:3042,reps:"20s/20s",poids:"12"},{id:3043,reps:"20s/20s",poids:"20"}],
                  sousExercices:[]
                },
                { id:305, nom:"Smith Machine Bench Press", typeEx:"Bi-set", videoUrl:"Bloc Push Iliana",
                  repsCibles:"4 reps Tempo @20-25kg @RPE 8 - 4 Rds",
                  reposEntre:"", reposApres:"150",
                  series:[{id:3051,reps:"4",poids:"20"},{id:3052,reps:"4",poids:"23"},{id:3053,reps:"4",poids:"23"},{id:3054,reps:"4",poids:"25"}],
                  sousExercices:[{id:3055,nom:"Med Ball Throw en fente yaku",videoUrl:"",repsCibles:"6/6 reps - max intensite + vitesse",reposEntre:"",reposApres:"",series:[{id:30551,reps:"6/6",poids:"5"},{id:30552,reps:"6/6",poids:"5"},{id:30553,reps:"6/6",poids:"5"},{id:30554,reps:"6/6",poids:"5"}]}]
                },
                { id:306, nom:"Triceps Extension Poulie", typeEx:"Classique", videoUrl:"Triceps Extension Poulie Iliana",
                  repsCibles:"3x10 reps @RPE 7 - 2s excentrique",
                  reposEntre:"", reposApres:"90",
                  series:[{id:3061,reps:"10",poids:"6.5"},{id:3062,reps:"10",poids:"6.5"},{id:3063,reps:"10",poids:"6.5"}],
                  sousExercices:[]
                },
                { id:307, nom:"Metcon Circuit", typeEx:"Circuit", videoUrl:"",
                  repsCibles:"2 min on / 2 min off x3 - garder min 30s sur la partie Karate",
                  reposEntre:"", reposApres:"120",
                  series:[{id:3071,reps:"3 Rds",poids:""},{id:3072,reps:"3 Rds",poids:""},{id:3073,reps:"3 Rds",poids:""}],
                  sousExercices:[
                    {id:3075,nom:"Echo Bike",videoUrl:"",repsCibles:"30s max effort @RPE 9-10",reposEntre:"",reposApres:"",series:[{id:30751,reps:"30s",poids:""},{id:30752,reps:"30s",poids:""},{id:30753,reps:"30s",poids:""}]},
                    {id:3076,nom:"Burpees Broad Jump",videoUrl:"",repsCibles:"10 reps",reposEntre:"",reposApres:"",series:[{id:30761,reps:"10",poids:""},{id:30762,reps:"10",poids:""},{id:30763,reps:"10",poids:""}]},
                    {id:3077,nom:"Techniques Karate sur Pao",videoUrl:"",repsCibles:"Max techniques dans le temps restant - mawashs/yoko/ura - max vitesse + retour zenkutsu",reposEntre:"",reposApres:"",series:[{id:30771,reps:"max",poids:""},{id:30772,reps:"max",poids:""},{id:30773,reps:"max",poids:""}]}
                  ]
                }
              ]
            }
          ];
          await Promise.all(ppgData.map(s => addDoc(collection(db, "physique_sessions"), { ...s, _source: "seed_ppg" })));
          await setDoc(seedRef, { completedAt: serverTimestamp(), count: ppgData.length }, { merge: true });
        }
        localStorage.setItem(seedKey, "1");
      } catch(e) { console.error("Seed PPG v2:", e); }
    };
    init();
  }, [authUser]);

  // ── Seed PPG v3 — séance 21/06/2026 ──────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const seedKey = 'kp_ppg_seed_v3_' + authUser.uid;
    if (localStorage.getItem(seedKey)) return;
    const init = async () => {
      try {
        const seedRef = doc(db, "meta", "physique_seed_ppg_v3");
        const seedDoc = await getDoc(seedRef);
        if (!seedDoc.exists()) {
          await setDoc(seedRef, { startedAt: serverTimestamp(), uid: authUser.uid });
          const ppgData = [
            {
              date: "2026-06-21", type: "PPG", duration: 75, intensite: "Elevee",
              statut: "Terminee", coach: "Kevin", programme: "PPG — Ski Erg · Hip Thrust · Leg Curl · Leg Extension · Tirage Vertical · Rotation Poulie · Extension Lombaire",
              exercises: [
                { id:401, nom:"Ski Erg", typeEx:"Classique", videoUrl:"",
                  repsCibles:"4 min — augmentation progressive du rythme",
                  reposEntre:"", reposApres:"",
                  series:[{id:4011,reps:"4 min",poids:""}],
                  sousExercices:[]
                },
                { id:402, nom:"Hip Thrust", typeEx:"Bi-set", videoUrl:"Hip Trust Iliana",
                  repsCibles:"4 Rds x 4 reps @RPE 8-9 — 2s excentrique",
                  reposEntre:"", reposApres:"150",
                  series:[{id:4021,reps:"4",poids:"100"},{id:4022,reps:"4",poids:"105"},{id:4023,reps:"4",poids:"105"},{id:4024,reps:"4",poids:"110"}],
                  sousExercices:[{id:4025,nom:"Kb Swing Russe Élastique",videoUrl:"",repsCibles:"6 reps @8kg — max vitesse sur chaque répétition",reposEntre:"",reposApres:"",series:[{id:40251,reps:"12",poids:"8"},{id:40252,reps:"12",poids:"8"},{id:40253,reps:"12",poids:"8"},{id:40254,reps:"12",poids:"8"}]}]
                },
                { id:403, nom:"Leg Curl", typeEx:"Classique", videoUrl:"Leg Curl Iliana",
                  repsCibles:"3 x 8 reps @RPE 8 — Tempo 2s excentrique",
                  reposEntre:"", reposApres:"120",
                  series:[{id:4031,reps:"8",poids:"30"},{id:4032,reps:"8",poids:"35"},{id:4033,reps:"8",poids:"42.5"}],
                  sousExercices:[]
                },
                { id:404, nom:"Leg Extension", typeEx:"Classique", videoUrl:"Leg Extension Iliana",
                  repsCibles:"3 x 10 reps @RPE 8 — Tempo 2s excentrique",
                  reposEntre:"", reposApres:"60",
                  series:[{id:4041,reps:"10",poids:"42.5"},{id:4042,reps:"10",poids:"47.5"},{id:4043,reps:"10",poids:"50"}],
                  sousExercices:[]
                },
                { id:405, nom:"Tirage Vertical Poulie", typeEx:"Classique", videoUrl:"Tirage Vertical Poulie Iliana",
                  repsCibles:"4 x 8 reps @RPE 7 — Tempo 2s excentrique",
                  reposEntre:"", reposApres:"120",
                  series:[{id:4051,reps:"8",poids:"25"},{id:4052,reps:"8",poids:"30"},{id:4053,reps:"8",poids:"30"},{id:4054,reps:"8",poids:"35"}],
                  sousExercices:[]
                },
                { id:406, nom:"Rotation de Buste Poulie", typeEx:"Classique", videoUrl:"Rotation Poulie Iliana",
                  repsCibles:"3 x 8/8 reps @RPE 7 — Tempo 2s excentrique",
                  reposEntre:"", reposApres:"120",
                  series:[{id:4061,reps:"8/8",poids:"7.5"},{id:4062,reps:"8/8",poids:"7.5"},{id:4063,reps:"8/8",poids:"7.5"}],
                  sousExercices:[]
                },
                { id:407, nom:"Extension Lombaire", typeEx:"Classique", videoUrl:"Extension Lombaire Iliana",
                  repsCibles:"3 x 15 reps — Lesté si trop facile · Focus fessiers",
                  reposEntre:"", reposApres:"60",
                  series:[{id:4071,reps:"15",poids:"PdC"},{id:4072,reps:"15",poids:"PdC"},{id:4073,reps:"15",poids:"PdC"}],
                  sousExercices:[]
                }
              ]
            }
          ];
          await Promise.all(ppgData.map(s => addDoc(collection(db, "physique_sessions"), { ...s, _source: "seed_ppg" })));
          await setDoc(seedRef, { completedAt: serverTimestamp(), count: ppgData.length }, { merge: true });
        }
        localStorage.setItem(seedKey, "1");
      } catch(e) { console.error("Seed PPG v3:", e); }
    };
    init();
  }, [authUser]);

  // ── Seed PPG v4 — séance 22/06/2026 ──────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const seedKey = 'kp_ppg_seed_v4_' + authUser.uid;
    if (localStorage.getItem(seedKey)) return;
    const init = async () => {
      try {
        const seedRef = doc(db, "meta", "physique_seed_ppg_v4");
        const seedDoc = await getDoc(seedRef);
        if (!seedDoc.exists()) {
          await setDoc(seedRef, { startedAt: serverTimestamp(), uid: authUser.uid });
          const ppgData = [
            {
              date: "2026-06-22", type: "PPG", duration: 75, intensite: "Elevee",
              statut: "Terminee", coach: "Kevin",
              programme: "PPG — Ski Erg · Leg Press · Hip Thrust · Leg Extension · Tirage Vertical · Kb Pull Through · Kb Biceps Curl",
              exercises: [
                { id:501, nom:"Ski Erg", typeEx:"Classique", videoUrl:"",
                  repsCibles:"4 min — échauffement progressif",
                  reposEntre:"", reposApres:"",
                  series:[{id:5011,reps:"4 min",poids:""}],
                  sousExercices:[]
                },
                { id:502, nom:"Leg Press", typeEx:"Classique", videoUrl:"Leg Press Iliana",
                  repsCibles:"4X6 reps Tempo @RPE 7 — 2/1/X/1 — Ne pas tendre complètement les jambes en fin de mouvement, garder une légère flexion",
                  reposEntre:"", reposApres:"120",
                  series:[{id:5021,reps:"6",poids:"100"},{id:5022,reps:"6",poids:"115"},{id:5023,reps:"6",poids:"115"},{id:5024,reps:"6",poids:"130"}],
                  sousExercices:[]
                },
                { id:503, nom:"Hip Thrust", typeEx:"Classique", videoUrl:"Hip Trust Iliana",
                  repsCibles:"3X8 reps @95-100kg (RPE 8) — 2'' excentrique",
                  reposEntre:"", reposApres:"120",
                  series:[{id:5031,reps:"8",poids:"100"},{id:5032,reps:"8",poids:"100"},{id:5033,reps:"8",poids:"105"}],
                  sousExercices:[]
                },
                { id:504, nom:"Leg Extension", typeEx:"Classique", videoUrl:"Leg Extension Iliana",
                  repsCibles:"3X8 reps + 10-15'' isométrique @42,5-47,5kg (RPE 7) — Adapter la charge · 15'' isométrique jambes tendues",
                  reposEntre:"", reposApres:"60",
                  series:[{id:5041,reps:"8",poids:"42.5"},{id:5042,reps:"8",poids:"47.5"},{id:5043,reps:"8",poids:"47.5"}],
                  sousExercices:[]
                },
                { id:505, nom:"Tirage Vertical Poulie", typeEx:"Classique", videoUrl:"Tirage Vertical Poulie Iliana",
                  repsCibles:"4X6 reps Tempo @RPE 7-8 — 2'' excentrique",
                  reposEntre:"", reposApres:"120",
                  series:[{id:5051,reps:"6",poids:"25"},{id:5052,reps:"6",poids:"30"},{id:5053,reps:"6",poids:"30"},{id:5054,reps:"6",poids:"35"}],
                  sousExercices:[]
                },
                { id:506, nom:"Kb Pull Through", typeEx:"Classique", videoUrl:"Kb Pull Through Iliana",
                  repsCibles:"3X16 reps (8 reps/côté) @RPE 7 — Focus dos droit, activation abdos ++",
                  reposEntre:"", reposApres:"90",
                  series:[{id:5061,reps:"8/8",poids:"4"},{id:5062,reps:"8/8",poids:"4"},{id:5063,reps:"8/8",poids:"4"}],
                  sousExercices:[]
                },
                { id:507, nom:"Kb Biceps Curl", typeEx:"Classique", videoUrl:"Kb Biceps Curl Iliana",
                  repsCibles:"3X10 reps Tempo @RPE 7 — 2'' excentrique",
                  reposEntre:"", reposApres:"60",
                  series:[{id:5071,reps:"10",poids:"12"},{id:5072,reps:"10",poids:"12"},{id:5073,reps:"10",poids:"12"}],
                  sousExercices:[]
                }
              ]
            }
          ];
          await Promise.all(ppgData.map(s => addDoc(collection(db, "physique_sessions"), { ...s, _source: "seed_ppg" })));
          await setDoc(seedRef, { completedAt: serverTimestamp(), count: ppgData.length }, { merge: true });
        }
        localStorage.setItem(seedKey, "1");
      } catch(e) { console.error("Seed PPG v4:", e); }
    };
    init();
  }, [authUser]);

  // ── Seed PPG v5 — séance 24/06/2026 ──────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const seedKey = 'kp_ppg_seed_v5_' + authUser.uid;
    if (localStorage.getItem(seedKey)) return;
    const init = async () => {
      try {
        const seedRef = doc(db, "meta", "physique_seed_ppg_v5");
        const seedDoc = await getDoc(seedRef);
        if (!seedDoc.exists()) {
          await setDoc(seedRef, { startedAt: serverTimestamp(), uid: authUser.uid });
          const ppgData = [
            {
              date: "2026-06-24", type: "PPG", duration: 90, intensite: "Elevee",
              statut: "Terminee", coach: "Kevin",
              programme: "PPG — Vélo · Trap Barre Deadlift · Squats Smith Machine · Banded Lunges · Bloc Push · Élévations latérales · Metcon",
              exercises: [
                {
                  id:601, nom:"Vélo", typeEx:"Classique", videoUrl:"",
                  repsCibles:"4' avec augmentation progressive du rythme toutes les minutes",
                  reposEntre:"", reposApres:"",
                  series:[{id:6011,reps:"4 min",poids:""}],
                  sousExercices:[]
                },
                {
                  id:602, nom:"Trap Barre Deadlift", typeEx:"Bi-set", videoUrl:"Trap Barre Deadlift X Box Jump Iliana",
                  repsCibles:"Force explosive — Cluster de potentialisation — 4 Rds (@RPE 8) : 4x(1 rep Trap Bar Deadlift @65kg+ + 1 Box Jump max hauteur) avec 20'' repos entre chaque rep — 2'30-3' entre les rounds",
                  reposEntre:"20", reposApres:"150",
                  series:[{id:6021,reps:"4x(1+BJ)",poids:"65"},{id:6022,reps:"4x(1+BJ)",poids:"65"},{id:6023,reps:"4x(1+BJ)",poids:"70"},{id:6024,reps:"4x(1+BJ)",poids:"65"}],
                  sousExercices:[{id:6025,nom:"Box Jump",videoUrl:"",repsCibles:"Max hauteur — 1 rep par cluster",reposEntre:"",reposApres:"",series:[{id:60251,reps:"4",poids:""},{id:60252,reps:"4",poids:""},{id:60253,reps:"4",poids:""},{id:60254,reps:"4",poids:""}]}]
                },
                {
                  id:603, nom:"Squats Smith Machine", typeEx:"Classique", videoUrl:"Squat Smith Machine Iliana",
                  repsCibles:"5X5 reps Tempo @40kg (RPE 7-8) — Focus posture — 2/1/X/1 : 2'' excentrique + 1'' pause en bas + max vitesse sur la montée",
                  reposEntre:"", reposApres:"120",
                  series:[{id:6031,reps:"5",poids:"25"},{id:6032,reps:"5",poids:"30"},{id:6033,reps:"5",poids:"30"},{id:6034,reps:"5",poids:"35"},{id:6035,reps:"5",poids:"35"}],
                  sousExercices:[]
                },
                {
                  id:604, nom:"Banded Lunges", typeEx:"Classique", videoUrl:"Banded Lunges Iliana",
                  repsCibles:"3 Rds : 30'' Banded Lunges Hold (focus fessiers) + 8/6 reps Banded Step Over Reverse Lunges — Jambe 1 puis Jambe 2 — 2'' excentrique sur la descente",
                  reposEntre:"", reposApres:"60",
                  series:[{id:6041,reps:"30''+8/6",poids:"12"},{id:6042,reps:"30''+8/6",poids:"12"},{id:6043,reps:"30''+8/6",poids:"12"}],
                  sousExercices:[]
                },
                {
                  id:605, nom:"Bloc Push (explosivité)", typeEx:"Bi-set", videoUrl:"Smith Machine Bench Press Iliana",
                  repsCibles:"EMOM 8' — 4 Rds : 1) 6/5 reps Smith Machine Bench Press Tempo @20kg (RPE 7) — Focus technique + tempo — 2) 20''-30'' Max Med Ball Chest Slam (max intensité, tension continue) — Si fatigue : réduire à 3 Rds (EMOM 6')",
                  reposEntre:"", reposApres:"",
                  series:[{id:6051,reps:"6",poids:"20"},{id:6052,reps:"6",poids:"23"},{id:6053,reps:"5",poids:"23"},{id:6054,reps:"5",poids:"25"}],
                  sousExercices:[{id:6055,nom:"Med Ball Chest Slam",videoUrl:"",repsCibles:"20-30'' max intensité en tension continue",reposEntre:"",reposApres:"",series:[{id:60551,reps:"20-30''",poids:""},{id:60552,reps:"20-30''",poids:""},{id:60553,reps:"20-30''",poids:""},{id:60554,reps:"20-30''",poids:""}]}]
                },
                {
                  id:606, nom:"Élévations latérales haltères", typeEx:"Classique", videoUrl:"Elevation Laterale Iliana",
                  repsCibles:"3X10 reps Tempo @RPE 6-7 — Charges légères — 2'' excentrique",
                  reposEntre:"", reposApres:"90",
                  series:[{id:6061,reps:"10",poids:"6"},{id:6062,reps:"10",poids:"6"},{id:6063,reps:"10",poids:"6"}],
                  sousExercices:[]
                },
                {
                  id:607, nom:"Metcon", typeEx:"Classique", videoUrl:"",
                  repsCibles:"AMRAP 10' (max tours) : 50 sauts à la corde (target 40'' max) + 2-4-6-etc...+2/Rds Enchâînements Blocage/poings en Zenkutsu (en avançant) + 10 Kb Swing Russe @RPE 7-8 (focus fessiers/abdos) + 2-4-6-etc...+2/Rds Mawashis Pao — Max intensité sur les techniques karaté",
                  reposEntre:"", reposApres:"",
                  series:[{id:6071,reps:"AMRAP 10'",poids:""}],
                  sousExercices:[{id:6075,nom:"Kb Swing Russe",videoUrl:"",repsCibles:"10 reps @RPE 7-8 — Focus fessiers/abdos",reposEntre:"",reposApres:"",series:[{id:60751,reps:"10",poids:"6"},{id:60752,reps:"10",poids:"6"},{id:60753,reps:"10",poids:"6"},{id:60754,reps:"10",poids:"6"},{id:60755,reps:"10",poids:"6"},{id:60756,reps:"10",poids:"6"}]}]
                }
              ]
            }
          ];
          await Promise.all(ppgData.map(s => addDoc(collection(db, "physique_sessions"), { ...s, _source: "seed_ppg" })));
          await setDoc(seedRef, { completedAt: serverTimestamp(), count: ppgData.length }, { merge: true });
        }
        localStorage.setItem(seedKey, "1");
      } catch(e) { console.error("Seed PPG v5:", e); }
    };
    init();
  }, [authUser]);

  // Plannings hebdos : charger depuis Firestore
  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(collection(db, "weekly_plannings"), (snap) => {
      const plans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlannings(plans);
    });
    return () => unsub();
  }, [authUser]);

  // Marquer chat comme lu à la navigation
  useEffect(() => {
    if (!authUser) return;
    if (page === "chat") {
      localStorage.setItem("kp_chatread_" + authUser.uid, Date.now().toString());
      setUnreadChat(0);
    }
  }, [page, authUser]);

  // Pastille chat : messages non-lus en temps réel
  useEffect(() => {
    if (!authUser) return;
    const q = query(collection(db, "chat_messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      if (page === "chat") { setUnreadChat(0); return; }
      const lastReadTs = parseInt(localStorage.getItem("kp_chatread_" + authUser.uid) || "0");
      const count = snap.docs.filter(d => {
        const data = d.data();
        if (data.senderId === authUser.uid) return false;
        const ts = data.createdAt?.toDate?.()?.getTime?.() || 0;
        return ts > lastReadTs;
      }).length;
      setUnreadChat(count);
    });
    return () => unsub();
  }, [authUser, page]);

  // Pastille séances : Firestore, cross-device, hors créateur
  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(collection(db, "seances"), (snap) => {
      const seenStr = localStorage.getItem("kp_seances_seen_" + authUser.uid);
      if (page === "karate" || seenStr === null) {
        // Première ouverture ou visite de la section : tout marquer comme vu
        const ids = snap.docs.map(d => d.id).join(",");
        localStorage.setItem("kp_seances_seen_" + authUser.uid, ids);
        setUnreadSeances(0);
        return;
      }
      const seenIds = new Set(seenStr.split(",").filter(Boolean));
      const count = snap.docs.filter(d => {
        if (seenIds.has(d.id)) return false;
        const data = d.data();
        return data.createdBy !== authUser.uid;
      }).length;
      setUnreadSeances(count);
    });
    return () => unsub();
  }, [authUser, page]);

  // Auth guards
  if (authUser === undefined) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#7C3AED,#EC4899)" }}>
      <div style={{ color:"#fff", fontWeight:700, fontSize:16 }}>Chargement…</div>
    </div>
  );

  if (!authUser || !authAllowed) return <LoginScreen />;

  const handleEnableNotifications = async () => {
    try {
      if (window.OneSignal) {
        await window.OneSignal.User.PushSubscription.optOut();
        await new Promise(r => setTimeout(r, 500));
        await window.OneSignal.User.PushSubscription.optIn();
      } else {
        showToast("OneSignal en cours de chargement, réessayez dans un instant");
      }
    } catch (err) {
      showToast("Erreur activation notifications: " + (err.message || String(err)).substring(0, 60));
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 6000);
  };

  const navigate = (id) => {
    setPage(id);
    setSidebarOpen(false);
    window.scrollTo(0,0);
  };

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard sessions={sessions} competitions={competitions} onNavigate={setPage} plannings={plannings} physiqueSessions={physiqueSessions}/>;
      case "planning": return <Planning plannings={plannings} setPlannings={setPlannings} sessions={sessions} competitions={competitions} physiqueSessions={physiqueSessions}/>;
      case "visionboard": return <VisionBoard sessions={sessions}/>;
      case "karate": return <SeancesKarate sessions={sessions} setSessions={setSessions} showToast={showToast}/>;
      case "stage": return <StageEquipe/>;
      case "physique": return <PrepaPhysique physiqueSessions={physiqueSessions} setPhysiqueSessions={setPhysiqueSessions} showToast={showToast}/>;
      case "competitions": return <Competitions competitions={competitions} setCompetitions={setCompetitions}/>;
      case "corrections": return <Corrections sessions={sessions}/>;
      case "videos": return <Videos competitions={competitions} sessions={sessions}/>;
      case "nutrition": return <Nutrition/>;
      case "sommeil": return <Sommeil/>;
      case "chat": return <Chat authUser={authUser}/>;
      case "equipe": return <Equipe currentUser={currentUser} onIdentify={(u)=>{setCurrentUser(u);setCurrentUserState(u);}}/>;
      case "profil": return <Profil sessions={sessions} competitions={competitions} authUser={authUser}/>;
      default: return <EmptyState icon={<LayoutDashboard size={24}/>} title="Section à venir"/>;
    }
  };

  const SidebarContent = () => (
    <>
      <div style={{ padding:"18px 16px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg, "+C.primary+", "+C.accent+")", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
            <TrendingUp size={16}/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:13, lineHeight:1.2 }}>Iliana<br/>Voratovic</div>
            <div style={{ fontSize:10, color:C.muted }}>Karaté Kata</div>
          </div>
        </div>
        {isMobile && <button onClick={()=>setSidebarOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}><X size={20}/></button>}
      </div>

      <div style={{ padding:"10px 12px", borderBottom:"1px solid "+C.border }}>
        {notifPermission === "granted" ? (
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.green }}><Bell size={13}/> Notifications actives</div>
        ) : (
          <button onClick={handleEnableNotifications} style={{ width:"100%", background:C.primary+"15", border:"1px solid "+C.primary+"33",
            borderRadius:8, padding:"8px 10px", fontSize:11, fontWeight:600, color:C.primary, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Bell size={13}/> Activer les notifications
          </button>
        )}
      </div>

      <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>navigate(n.id)} style={{
            width:"100%", textAlign:"left",
            background:page===n.id?C.primary+"15":"none",
            border:"none", cursor:"pointer",
            borderLeft:page===n.id?"3px solid "+C.primary:"3px solid transparent",
            color:page===n.id?C.primary:C.text,
            padding:"9px 16px", fontSize:isMobile?13.5:12.5,
            fontWeight:page===n.id?700:500,
            display:"flex", alignItems:"center", gap:10,
          }}>
            {withBadge(n.icon, getBadge(n.id))}
            <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.label}</span>
            {page===n.id && !isMobile && <ChevronRight size={12}/>}
          </button>
        ))}
      </nav>

      <div style={{ borderTop:"1px solid "+C.border, padding:12, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <Avatar name="Alexandre Voratovic" size={30} bg={C.muted} />
          <div style={{ fontSize:11 }}>
            <div style={{ fontWeight:600 }}>{authUser?.displayName || authUser?.email?.split("@")[0] || "Utilisateur"}</div>
            <div style={{ color:C.muted }}>{authUser?.email === ADMIN_EMAIL ? "Administrateur" : "Membre"}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", color:C.red, fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6, padding:"4px 2px" }}>
          <LogOut size={13}/> Déconnexion
        </button>
      </div>
    </>
  );

  const getBadge = (id) => {
    if (id === "chat") return unreadChat;
    if (id === "karate") return unreadSeances;
    return 0;
  };
  const withBadge = (icon, count) => {
    if (!count) return icon;
    return (
      <div style={{ position:"relative", display:"inline-flex" }}>
        {icon}
        <span style={{ position:"absolute", top:-5, right:-5, background:"#ef4444",
          color:"#fff", borderRadius:"50%", minWidth:14, height:14, fontSize:9,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:700, padding:"0 2px", lineHeight:1 }}>
          {count > 9 ? "9+" : count}
        </span>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:C.bg, fontFamily:"'Inter', -apple-system, sans-serif", color:C.text }}>
        {splashVisible && (
          <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"#0c0c14",zIndex:99999,transition:"opacity 0.6s ease",opacity:splashOpacity}}>
            <img src="/iliana.png" alt="Iliana" onError={e=>{e.target.style.display="none"}} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}/>
          </div>
        )}

        <div style={{ background:"#fff", borderBottom:"1px solid "+C.border, padding:"0 16px", height:56,
          display:"flex", alignItems:"center", gap:12, flexShrink:0, position:"sticky", top:0, zIndex:50 }}>
          <button onClick={()=>setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.text, padding:4 }}>
            <Menu size={22}/>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg, "+C.primary+", "+C.accent+")", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <TrendingUp size={14} color="#fff"/>
            </div>
            <span style={{ fontWeight:800, fontSize:14, color:C.primary }}>Karaté Pro</span>
          </div>
          <button onClick={handleEnableNotifications} style={{ background:"none", border:"none", cursor:"pointer", color:notifPermission==="granted"?C.green:C.muted }}>
            {notifPermission==="granted" ? <Bell size={20}/> : <BellOff size={20}/>}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <div style={{ position:"fixed", inset:0, background:"#00000055", zIndex:100 }} onClick={()=>setSidebarOpen(false)}/>
            <div style={{ position:"fixed", left:0, top:0, bottom:0, width:290, background:"#fff", zIndex:101,
              boxShadow:"4px 0 20px rgba(0,0,0,0.15)", display:"flex", flexDirection:"column", overflowY:"hidden" }}>
              <SidebarContent/>
            </div>
          </>
        )}

        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 80px" }}>
          {renderPage()}
        </div>

        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid "+C.border,
          display:"flex", height:60, zIndex:50 }}>
          {BOTTOM_NAV.map(n=>(
            <button key={n.id} onClick={()=>navigate(n.id)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              background:"none", border:"none", cursor:"pointer", gap:2,
              color:page===n.id?C.primary:C.muted
            }}>
              {withBadge(n.bottomIcon, getBadge(n.id))}
              <span style={{ fontSize:9, fontWeight:page===n.id?700:500 }}>{n.bottomLabel||n.label}</span>
            </button>
          ))}
        </div>

        {toast && <Toast message={toast} onClose={()=>setToast(null)} />}
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"'Inter', -apple-system, sans-serif", color:C.text, overflow:"hidden" }}>
      <div style={{ width:215, background:"#fff", borderRight:"1px solid "+C.border, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <SidebarContent/>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"#fff", borderBottom:"1px solid "+C.border, padding:"0 24px", height:52,
          display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <span style={{ fontWeight:700, color:C.primary }}>Iliana Voratovic</span>
          <div style={{ flex:1 }} />
          <button onClick={handleEnableNotifications} style={{ background:"none", border:"none", cursor:"pointer", color:notifPermission==="granted"?C.green:C.muted }}>
            {notifPermission==="granted" ? <Bell size={18}/> : <BellOff size={18}/>}
          </button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:24 }}>
          {renderPage()}
        </div>
      </div>
      {toast && <Toast message={toast} onClose={()=>setToast(null)} />}
    </div>
  );
}
