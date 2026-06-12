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
import { requestNotificationPermission, onForegroundMessage } from "./firebase";
import { enregistrerSeance } from "./notifications";

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
  { id:1, date:"2026-05-09", name:"Championnat de France Équipe Sénior", lieu:"Cormeilles-En-Parisis", coach:"Olivier", result:"Médaille d'Argent",
    tours:[
      { num:1, name:"Demi Finale", kata:"Gojūshiho Shō", score:"5-0", ok:true, note:"Bonnes sensations" },
      { num:2, name:"Finale", kata:"Unsu", score:"1-4", ok:false, note:"un peu stressée et pas très stable mais bien sur le bunkai" },
    ]
  },
];

const mockCorrections = [
  { id:1, date:"2026-11-10", trainer:"Jonathan", kata:"Gojūshiho Dai", content:"Taper moins fort sur les pics, attention à la posture lors du kiba dachi" },
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
  { id:1, date:"2026-06-05", type:"PPG", duration:60, satisfaction:8, notes:"Bonne séance de prépa générale" },
  { id:2, date:"2026-06-03", type:"Endurance", duration:45, satisfaction:7, notes:"Course 5km" },
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
const Dashboard = ({ sessions }) => {
  const thisWeek = sessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return d >= startOfWeek;
  });
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
          <span style={{ color:C.muted, fontSize:11 }}>8-14 juin 2026</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:12 }}>
          {[{label:"Club",val:4,color:C.red},{label:"Prépa Physique",val:2,color:C.blue},
            {label:"Entr. Perso",val:0,color:C.muted},{label:"Compétitions",val:0,color:C.yellow}].map(s=>(
            <div key={s.label} style={{ background:s.color+"11", border:"1px solid "+s.color+"33", borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:10, color:s.color, fontWeight:600, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+C.green }}>
          <span style={{ color:C.green, fontSize:12 }}>🎯 <strong>Objectif :</strong> Prépa Porec</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
        {[{icon:"🥋",label:"Séances totales",val:sessions.length,c:C.red},
          {icon:"⏱",label:"Durée moyenne",val:avgDur+" min",c:C.orange},
          {icon:"⭐",label:"Satisfaction",val:avgSat+"/10",c:C.yellow},
          {icon:"🏆",label:"Compétitions",val:"1",c:C.blue}].map(s=>(
          <div key={s.label} style={{ background:s.c, borderRadius:14, padding:"14px", color:"#fff" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:11, opacity:0.85 }}>{s.label}</div>
            <div style={{ fontSize:18, fontWeight:800 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:"1px solid "+C.border }}>
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Activité de la semaine</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mockWeekActivity}>
            <XAxis dataKey="day" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis hide /><Tooltip />
            <Bar dataKey="karate" name="🥋 Karaté" fill={C.red} radius={[4,4,0,0]} />
            <Bar dataKey="physique" name="💪 Prépa" fill={C.blue} radius={[4,4,0,0]} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize:11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background:C.card, borderRadius:16, padding:16, border:"1px solid "+C.border }}>
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Activités récentes</div>
        {sessions.slice(0,5).map(s=>(
          <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:C.primary+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <TrendingUp size={14} color={C.primary}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                <Badge label={s.type} color={C.primary} />
                <span style={{ fontSize:11, color:C.muted }}>{s.date}</span>
              </div>
              <div style={{ fontSize:11, color:C.muted }}>⏱ {s.duration} min · {s.coach && "Coach: "+s.coach}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── SÉANCES KARATÉ ──────────────────────────────────────────────────────────
const COACHES = ["Helvétia","Romain","Olivier","Yves","Jonathan","Hugo","Fernando","Perso","Autre"];
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
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "Collectif",
    duration: "",
    coaches: [],
    katas: [],
    techniques: [],
    focusPoints: "",
    corrections: "",
    ressenti: "🙂 Bon",
    energie: "Normal",
    satisfaction: 5,
    coachFeedback: "",
    notes: "",
  });

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
  });

  const avgSat = sessions.length ? (sessions.reduce((a,b)=>a+b.satisfaction,0)/sessions.length).toFixed(1) : 0;
  const avgDur = sessions.length ? Math.round(sessions.reduce((a,b)=>a+b.duration,0)/sessions.length) : 0;

  const handleSubmit = async () => {
    if (!form.date || !form.duration) return;
    setSaving(true);
    try {
      const seance = {
        type: form.type, date: form.date, duration: parseInt(form.duration),
        satisfaction: form.satisfaction, katas: form.katas, techniques: form.techniques,
        notes: form.corrections, focusPoints: form.focusPoints,
        coachFeedback: form.coachFeedback, additionalNotes: form.notes,
        ressenti: form.ressenti, energie: form.energie,
        coach: form.coaches.join(", "), athlete: "Iliana Voratovic"
      };
      await enregistrerSeance(seance);
      setSessions(prev => [{ id: Date.now(), ...seance }, ...prev]);
      showToast("Séance "+form.type+" — "+form.duration+" min. Entraîneur et parents notifiés.");
      setShowForm(false);
      setForm({ date:new Date().toISOString().split('T')[0], type:"Collectif", duration:"", coaches:[], katas:[], techniques:[], focusPoints:"", corrections:"", ressenti:"🙂 Bon", energie:"Normal", satisfaction:5, coachFeedback:"", notes:"" });
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
        <div key={s.id} style={{ background:C.card, borderRadius:14, border:"2px solid "+C.red+"33", padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16 }}>{emoji(s.satisfaction)}</span>
                <span style={{ fontWeight:700, fontSize:14 }}>Entraînement {s.type}</span>
              </div>
              <div style={{ color:C.muted, fontSize:11 }}>{s.date}{s.coach?" · "+s.coach:""}</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:C.primary }}><Edit2 size={13}/></button>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:C.red }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:s.katas?.length>0||s.notes?8:0 }}>
            <span style={{ fontSize:12, color:C.muted }}>⏱ <strong style={{ color:C.text }}>{s.duration} min</strong></span>
            <span style={{ fontSize:12, color:C.muted }}>⭐ <strong style={{ color:C.text }}>{s.satisfaction}/10</strong></span>
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
              <div style={{ fontSize:11, color:C.orange }}>⚠ Corrections : {s.notes}</div>
            </div>
          )}
          {s.coachFeedback && (
            <div style={{ background:C.green+"15", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.green, marginTop:6 }}>
              <div style={{ fontSize:11, color:C.green }}>💬 Retours coach : {s.coachFeedback}</div>
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
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Nouvelle séance de karaté</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
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

              {/* Ressenti + Énergie */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <SelectField label="Ressenti" value={form.ressenti} onChange={v=>setForm(f=>({...f,ressenti:v}))} options={RESSENTIS} />
                <SelectField label="Niveau d'énergie" value={form.energie} onChange={v=>setForm(f=>({...f,energie:v}))} options={ENERGIES} />
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
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Retours du Coach</label>
                <textarea rows={3} placeholder="Commentaires du coach..." value={form.coachFeedback}
                  onChange={e=>setForm(f=>({...f,coachFeedback:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }} />
              </div>

              {/* Notes additionnelles */}
              <div style={{ marginBottom:24 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Notes additionnelles</label>
                <textarea rows={2} placeholder="Autres observations..." value={form.notes}
                  onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }} />
              </div>

              {/* Boutons */}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingBottom:8 }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <X size={14}/> Annuler
                </button>
                <button onClick={handleSubmit} disabled={saving} style={{ background:C.red, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:saving?0.7:1 }}>
                  💾 {saving ? "Enregistrement..." : "Enregistrer"}
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
const StageEquipe = () => (
  <div>
    <SectionHeader icon="🏕️" title="Stage Équipe de France" subtitle="Stages et événements équipe" color="#DC2626" />
    <EmptyState icon={<Users size={24}/>} title="Aucun stage enregistré" sub="Les stages de l'équipe de France apparaîtront ici"
      action={{ label:"Ajouter un stage", fn:()=>{} }} />
  </div>
);

// ─── PRÉPA PHYSIQUE ─────────────────────────────────────────────────────────
const PHYS_TYPES = ["Endurance","Force","Explosivité","Vitesse","Technique","Récupération","Compétition","Haltérophilie","PPG","Corps entier"];
const PHYS_COACHES = ["Helvétia","Romain","Olivier","Yves","Jonathan","Hugo","Jérémie","Michel","Kevin","Autre"];
const INTENSITES = ["Faible","Moyenne","Élevée","Maximale"];
const STATUTS_PHYS = ["À venir","Terminée","Non réalisé"];
const RESSENTIS_PHYS = ["😃 Excellent","😊 Très bon","🙂 Bon","😐 Moyen","😔 Fatigué","😩 Épuisé"];

const PrepaPhysique = () => {
  const [activeFilter, setActiveFilter] = useState("Semaine");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date:new Date().toISOString().split("T")[0], type:"Endurance", duration:"", intensite:"Moyenne", statut:"À venir", programme:"", coach:"", distance:"", calories:"", fcMoy:"", fcMax:"", ressenti:"🙂 Bon", notes:"" });
  const TYPES_LABELS = ["Semaine","🏃 Endurance","💪 Force","⚡ Explosivité","🏋️ Haltéro","🔥 PPG","🔥 Corps entier","⚡ Vitesse","🎯 Technique","🧘 Récup","🏆 Compét"];

  const SelectF = ({ label, value, options, onChange }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <SectionHeader icon="💪" title="Préparation Physique" subtitle="Suivez toutes vos séances de préparation physique" color={C.blue}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.blue, fontSize:12 }}><Plus size={12}/> Nouvelle séance</Btn>} />
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {TYPES_LABELS.map(f=><FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} />)}
      </div>
      <EmptyState icon={<Dumbbell size={24}/>} title="Aucune séance cette semaine" sub="Les séances de cette semaine apparaîtront ici" action={{ label:"Créer une séance", fn:()=>setShowForm(true) }} />

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.blue+", "+C.primary+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Nouvelle séance</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <SelectF label="Type *" value={form.type} options={PHYS_TYPES} onChange={v=>setForm(f=>({...f,type:v}))} />
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Durée (min) *</label>
                  <input type="number" placeholder="60" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <SelectF label="Intensité" value={form.intensite} options={INTENSITES} onChange={v=>setForm(f=>({...f,intensite:v}))} />
                <SelectF label="Statut *" value={form.statut} options={STATUTS_PHYS} onChange={v=>setForm(f=>({...f,statut:v}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Nom du programme</label>
                  <input type="text" placeholder="Ex: Programme Semaine 1" value={form.programme} onChange={e=>setForm(f=>({...f,programme:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <SelectF label="Coach / Préparateur" value={form.coach} options={["Sélectionner...",...PHYS_COACHES]} onChange={v=>setForm(f=>({...f,coach:v}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                {[["Distance (km)","distance"],["Calories","calories"],["FC moyenne (bpm)","fcMoy"],["FC max (bpm)","fcMax"]].map(([l,k])=>(
                  <div key={k}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                    <input type="number" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                ))}
              </div>
              <SelectF label="Ressenti" value={form.ressenti} options={RESSENTIS_PHYS} onChange={v=>setForm(f=>({...f,ressenti:v}))} />
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Notes</label>
                <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={()=>setShowForm(false)} style={{ background:C.blue, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>💾 Enregistrer</button>
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
const COMP_MONTHS = ["Mai 2026","Avril 2026","Mars 2026","Janvier 2026","Décembre 2025","Novembre 2025","Octobre 2025","Septembre 2025"];

const Competitions = () => {
  const [activeMois, setActiveMois] = useState("Mai 2026");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom:"", date:"", lieu:"", statut:"À venir", coach:"", resultat:"", recordPerso:false, tours:[], lienVideo:"", notes:"" });
  const [newTour, setNewTour] = useState({ nom:"", kata:"", score:"", ok:true, note:"" });

  const addTour = () => {
    setForm(f=>({...f, tours:[...f.tours, { ...newTour, num: f.tours.length+1 }]}));
    setNewTour({ nom:"", kata:"", score:"", ok:true, note:"" });
  };

  return (
    <div>
      <SectionHeader icon="🏆" title="Compétitions" subtitle="Suivez vos performances et résultats 🥇" color={C.orange}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.orange, fontSize:12 }}><Plus size={12}/> Nouvelle compétition</Btn>} />
      <div style={{ fontWeight:700, marginBottom:10, fontSize:14 }}>Historique</div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {COMP_MONTHS.map(m=><FilterPill key={m} label={m} active={activeMois===m} onClick={()=>setActiveMois(m)} />)}
      </div>
      {mockCompetitions.map(c=>(
        <div key={c.id} style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:12 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{c.name}</div>
          <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>📅 {c.date} · 📍 {c.lieu} · 👤 {c.coach}</div>
          <div style={{ background:C.yellow+"22", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+C.yellow, marginBottom:12 }}>
            <span style={{ color:C.yellow, fontWeight:700, fontSize:13 }}>🏆 Résultat : {c.result}</span>
          </div>
          <div style={{ fontWeight:600, fontSize:12, marginBottom:8, color:C.muted }}>Tours de la compétition :</div>
          {c.tours.map(t=>(
            <div key={t.num} style={{ background:C.bg, borderRadius:10, padding:"12px", marginBottom:8, display:"flex", alignItems:"flex-start", gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                  <Badge label={"Tour "+t.num} color={C.orange}/><span style={{ fontWeight:600, fontSize:13 }}>{t.name}</span>
                </div>
                <div style={{ fontSize:12, color:C.muted }}>Kata: <strong style={{ color:C.text }}>{t.kata}</strong> · Score: <strong style={{ color:C.text }}>{t.score}</strong></div>
                {t.note && <div style={{ fontSize:11, color:C.muted, marginTop:2, fontStyle:"italic" }}>{t.note}</div>}
                <button style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, fontSize:11, marginTop:4, display:"flex", alignItems:"center", gap:3 }}><Video size={11}/> Voir la vidéo</button>
              </div>
              {t.ok ? <CheckCircle2 color={C.green} size={18}/> : <XCircle color={C.red} size={18}/>}
            </div>
          ))}
        </div>
      ))}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.orange+", "+C.yellow+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Nouvelle compétition</div>
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
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Statut *</label>
                  <select value={form.statut} onChange={e=>setForm(f=>({...f,statut:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {["À venir","Terminée","Annulée"].map(o=><option key={o}>{o}</option>)}
                  </select></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Nom du coach</label>
                  <select value={form.coach} onChange={e=>setForm(f=>({...f,coach:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    <option>Sélectionner un coach</option>
                    {COMP_COACHES.map(o=><option key={o}>{o}</option>)}
                  </select></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Résultat</label>
                  <input type="text" placeholder="Médaille d'or, 1ère place..." value={form.resultat} onChange={e=>setForm(f=>({...f,resultat:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:22 }}>
                  <input type="checkbox" checked={form.recordPerso} onChange={e=>setForm(f=>({...f,recordPerso:e.target.checked}))} style={{ width:16, height:16 }}/>
                  <label style={{ fontSize:13 }}>Record personnel battu</label>
                </div>
              </div>

              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Tours de la compétition</div>
                {form.tours.map((t,i)=>(
                  <div key={i} style={{ background:C.bg, borderRadius:10, padding:12, marginBottom:8, fontSize:12 }}>
                    Tour {t.num} · {t.nom} · Kata: {t.kata} · Score: {t.score}
                  </div>
                ))}
                <div style={{ background:C.bg, borderRadius:10, padding:12, border:"1px dashed "+C.border }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
                    {[["Nom du tour","nom"],["Kata","kata"],["Score","score"]].map(([l,k])=>(
                      <div key={k}><label style={{ fontSize:11, display:"block", marginBottom:3 }}>{l}</label>
                        <input type="text" placeholder={l} value={newTour[k]} onChange={e=>setNewTour(t=>({...t,[k]:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:6, padding:"7px 10px", fontSize:12, boxSizing:"border-box" }}/></div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                    <input type="checkbox" checked={newTour.ok} onChange={e=>setNewTour(t=>({...t,ok:e.target.checked}))}/>
                    <label style={{ fontSize:12 }}>Qualifié / Victoire</label>
                  </div>
                  <button onClick={addTour} style={{ background:C.orange+"22", border:"1px solid "+C.orange, borderRadius:8, padding:"6px 14px", fontSize:12, color:C.orange, cursor:"pointer" }}>+ Ajouter ce tour</button>
                </div>
              </div>

              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Lien vidéo</label>
                <input type="text" placeholder="https://..." value={form.lienVideo} onChange={e=>setForm(f=>({...f,lienVideo:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Notes</label>
                <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={()=>setShowForm(false)} style={{ background:C.orange, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
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
  const [form, setForm] = useState({ kata:"", entraineur:"", date:"", categorie:"Technique", commentaires:"", coachFeedback:"" });

  const allCorrections = [
    ...mockCorrections,
    ...sessions.filter(s=>s.notes&&s.notes.length>0).slice(0,20).map((s,i)=>({ id:1000+i, date:s.date, trainer:s.coach||"Entraîneur", kata:s.katas?.[0]||"", content:s.notes }))
  ];

  return (
    <div>
      <SectionHeader icon="⏱" title="Corrections" subtitle="Points techniques à travailler" color={C.orange}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.orange, fontSize:12 }}><Plus size={12}/> Nouvelle correction</Btn>} />
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {["Toutes","Par semaine","Par entraîneur","Par kata"].map(f=><FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} />)}
      </div>
      <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>{allCorrections.length} corrections</div>
      {allCorrections.slice(0,25).map((c,i)=>(
        <div key={i} style={{ background:C.card, borderRadius:12, border:"1px solid "+C.border, padding:14, marginBottom:10, display:"flex", gap:12 }}>
          <div style={{ width:3, borderRadius:4, background:C.orange, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
              <Avatar name={c.trainer||"?"} size={26} bg={C.primary} />
              <strong style={{ fontSize:13 }}>{c.trainer}</strong>
              {c.kata && <Badge label={c.kata} color={C.blue}/>}
              <span style={{ color:C.muted, fontSize:11 }}>{c.date}</span>
            </div>
            <div style={{ fontSize:12, color:C.text }}>{c.content}</div>
          </div>
          <button style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}><X size={14}/></button>
        </div>
      ))}

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
                <button onClick={()=>setShowForm(false)} style={{ background:C.orange, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
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

const Videos = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre:"", categorie:"Kata", date:"", uploadePar:"", description:"" });

  return (
    <div>
      <SectionHeader icon="🎬" title="Vidéos" subtitle="Bibliothèque de vidéos d'entraînement" color="#DC2626"
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:"#DC2626", fontSize:12 }}><Plus size={12}/> Ajouter une vidéo</Btn>} />

      {Object.entries(mockVideos).map(([section, videos])=>(
        <div key={section} style={{ marginBottom:24 }}>
          <div style={{ background:C.yellow+"22", borderRadius:12, padding:"12px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center", border:"1px solid "+C.yellow+"44" }}>
            <span style={{ fontWeight:700, fontSize:14, color:C.orange }}>{section}</span>
            <span style={{ background:C.yellow+"44", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{videos.length}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {videos.map(v=>(
              <div key={v.id} style={{ background:"#1a1a2e", borderRadius:12, overflow:"hidden", cursor:"pointer" }}>
                <div style={{ height:100, display:"flex", alignItems:"center", justifyContent:"center", color:"#ffffff44" }}>
                  <Video size={32}/>
                </div>
                <div style={{ padding:"10px 12px", background:C.card, borderTop:"1px solid "+C.border }}>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:4, color:C.text }}>{v.titre}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:10, color:C.muted }}>{v.date}</span>
                    <Badge label={v.cat} color={C.orange}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

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
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Catégorie</label>
                  <select value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {VIDEOS_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Uploadé par</label>
                  <input type="text" value={form.uploadePar} onChange={e=>setForm(f=>({...f,uploadePar:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Description</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Vidéo *</label>
                <div style={{ border:"2px dashed "+C.border, borderRadius:10, padding:"24px", textAlign:"center", color:C.muted, fontSize:13 }}>🎬 Cliquez pour ajouter une vidéo</div>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={()=>setShowForm(false)} style={{ background:"#DC2626", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
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
                <button onClick={()=>setShowForm(false)} style={{ background:C.primary, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────
const Chat = () => {
  const [msg, setMsg] = useState("");
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 130px)" }}>
      <div style={{ background:"linear-gradient(135deg, "+C.blue+" 60%, "+C.primary+")", borderRadius:14, padding:"16px 18px", color:"#fff", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
        <MessageCircle size={20}/><div><div style={{ fontWeight:800, fontSize:16 }}>Chat Équipe</div><div style={{ fontSize:11, opacity:0.8 }}>Communication avec votre équipe</div></div>
      </div>
      <div style={{ flex:1, background:C.card, borderRadius:14, border:"1px solid "+C.border, marginBottom:10 }} />
      <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:10, display:"flex", gap:8, alignItems:"center" }}>
        <button style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}><Paperclip size={18}/></button>
        <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Écrivez votre message..."
          style={{ flex:1, border:"none", outline:"none", fontSize:14, background:"transparent" }} />
        <button style={{ background:C.primary, border:"none", borderRadius:8, padding:"8px 10px", cursor:"pointer", color:"#fff" }}><Send size={15}/></button>
      </div>
    </div>
  );
};

// ─── ÉQUIPE ───────────────────────────────────────────────────────────────────
const Equipe = () => (
  <div>
    <SectionHeader icon="👥" title="L'équipe" subtitle="Personnes ayant accès à l'application" color={C.primary}
      action={<Btn color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Ajouter</Btn>} />
    {Object.entries(mockTeam).map(([role, members])=>(
      <div key={role} style={{ marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>{role}</div>
        {members.map(m=>(
          <div key={m.name} style={{ background:C.card, borderRadius:12, border:"1px solid "+C.border, padding:14, marginBottom:8, display:"flex", alignItems:"flex-start", gap:10 }}>
            <Avatar name={m.name} size={38} bg={C.primary} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{m.name}</div>
              <Badge label={role} color={C.primary} />
              <div style={{ marginTop:6, fontSize:11, color:C.muted }}>✉ {m.email}</div>
              <div style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:4 }}>
                📞 {m.phone} <span style={{ width:7, height:7, borderRadius:"50%", background:m.online?C.green:C.muted, display:"inline-block" }} />
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <Btn small outlined color={C.muted} style={{ fontSize:10 }}>Inviter</Btn>
              <div style={{ display:"flex", gap:4 }}>
                <button style={{ background:"none", border:"none", cursor:"pointer", color:C.primary }}><Edit2 size={12}/></button>
                <button style={{ background:"none", border:"none", cursor:"pointer", color:C.red }}><Trash2 size={12}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ─── PROFIL ───────────────────────────────────────────────────────────────────
const Profil = ({ sessions }) => {
  const avgSat = sessions.length ? (sessions.reduce((a,b)=>a+b.satisfaction,0)/sessions.length).toFixed(1) : 0;
  return (
    <div>
      <SectionHeader icon="👤" title="Profil" subtitle="Vos informations personnelles" color={C.primary} />
      <div style={{ background:C.card, borderRadius:16, border:"1px solid "+C.border, padding:24, textAlign:"center", marginBottom:16 }}>
        <Avatar name="Iliana Voratovic" size={80} bg={C.primary} />
        <div style={{ fontWeight:800, fontSize:20, marginTop:12 }}>Iliana Voratovic</div>
        <Badge label="Karaté Kata" color={C.primary} />
        <div style={{ color:C.muted, fontSize:12, marginTop:6 }}>ilianavoratovic@gmail.com</div>
        <Btn color={C.primary} style={{ marginTop:14 }}><Edit2 size={13}/> Modifier le profil</Btn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {[{l:"Séances totales",v:sessions.length,c:C.red},{l:"Compétitions",v:"9",c:C.yellow},{l:"Satisfaction moy.",v:avgSat+"/10",c:C.green}].map(s=>(
          <div key={s.l} style={{ background:C.card, borderRadius:12, border:"1px solid "+C.border, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PLANNING ─────────────────────────────────────────────────────────────────
const Planning = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ debut:"", club:0, prepa:0, perso:0, compet:0, objectif:"", commentaireCoach:"" });

  return (
    <div>
      <SectionHeader icon="📅" title="Planning" subtitle="Organisez vos entraînements et planifiez vos semaines 📅" color={C.primary}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Planifier semaine</Btn>} />

      {/* Récapitulatif S-1 */}
      <div style={{ background:C.card, borderRadius:16, border:"1px solid "+C.border, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>📊 Récapitulatif S-1</div>
        <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>Semaine du 1 juin au 7 juin 2026</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
          {[{l:"Entraînement Club",prevu:3,realise:4,ok:true,pct:133,c:C.red},
            {l:"Prépa Physique",prevu:2,realise:2,ok:true,pct:100,c:C.blue},
            {l:"Entraînement Perso",prevu:1,realise:0,ok:false,pct:0,c:C.primary},
            {l:"Compétitions",prevu:0,realise:0,ok:true,pct:100,c:C.yellow}].map(s=>(
            <div key={s.l} style={{ background:s.c+"11", border:"1px solid "+s.c+"33", borderRadius:12, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:s.c }}>{s.l}</span>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  {s.ok ? <CheckCircle2 size={14} color={C.green}/> : <XCircle size={14} color={C.red}/>}
                  <span style={{ fontSize:11, fontWeight:700, color:s.ok?C.green:C.red }}>{s.pct}%</span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.muted }}>Prévu</div><div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.prevu}</div></div>
                <span style={{ color:C.muted }}>→</span>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.muted }}>Réalisé</div><div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.realise}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planifications à venir */}
      <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Planifications à venir</div>
      <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div><div style={{ fontWeight:700, fontSize:14 }}>Semaine du 8 au 14 juin 2026</div>
            <Badge label="📅 Planifié" color={C.primary} /></div>
          <div style={{ display:"flex", gap:6 }}>
            <Btn small outlined color={C.primary} style={{ fontSize:10 }}>Modifier</Btn>
            <Btn small outlined color={C.red} style={{ fontSize:10 }}>Supprimer</Btn>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, margin:"12px 0" }}>
          {[{l:"Club",v:4,c:C.red},{l:"Prépa",v:2,c:C.blue},{l:"Perso",v:0,c:C.muted},{l:"Compét.",v:0,c:C.yellow}].map(x=>(
            <div key={x.l} style={{ textAlign:"center", padding:8, background:x.c+"11", borderRadius:8 }}>
              <div style={{ fontSize:10, color:x.c }}>{x.l}</div>
              <div style={{ fontSize:20, fontWeight:800, color:x.c }}>{x.v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+C.green }}>
          <span style={{ fontSize:12, color:C.green }}>🎯 <strong>Objectif :</strong> Prépa Porec</span>
        </div>
      </div>

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
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={()=>setShowForm(false)} style={{ background:C.primary, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>💾 Enregistrer</button>
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
  { id:"physique", label:"Prépa Physique", icon:<Dumbbell size={16}/> },
  { id:"competitions", label:"Compétitions", icon:<Trophy size={16}/>, bottomIcon:<Trophy size={20}/>, bottomLabel:"Compét." },
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
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sessions, setSessions] = useState(ALL_SESSIONS);
  const [notifPermission, setNotifPermission] = useState("default");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if ("Notification" in window) setNotifPermission(Notification.permission);
    onForegroundMessage(payload => setToast(payload.notification?.body || "Nouvelle notification"));
  }, []);

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) setNotifPermission("granted");
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
      case "dashboard": return <Dashboard sessions={sessions}/>;
      case "planning": return <Planning/>;
      case "visionboard": return <VisionBoard sessions={sessions}/>;
      case "karate": return <SeancesKarate sessions={sessions} setSessions={setSessions} showToast={showToast}/>;
      case "stage": return <StageEquipe/>;
      case "physique": return <PrepaPhysique/>;
      case "competitions": return <Competitions/>;
      case "corrections": return <Corrections sessions={sessions}/>;
      case "videos": return <Videos/>;
      case "nutrition": return <Nutrition/>;
      case "sommeil": return <Sommeil/>;
      case "chat": return <Chat/>;
      case "equipe": return <Equipe/>;
      case "profil": return <Profil sessions={sessions}/>;
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
            {n.icon}
            <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.label}</span>
            {page===n.id && !isMobile && <ChevronRight size={12}/>}
          </button>
        ))}
      </nav>

      <div style={{ borderTop:"1px solid "+C.border, padding:12, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <Avatar name="Alexandre Voratovic" size={30} bg={C.muted} />
          <div style={{ fontSize:11 }}>
            <div style={{ fontWeight:600 }}>Alexandre Vorat...</div>
            <div style={{ color:C.muted }}>Karatéka</div>
          </div>
        </div>
        <button style={{ width:"100%", background:"none", border:"none", cursor:"pointer", color:C.red, fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6, padding:"4px 2px" }}>
          <LogOut size={13}/> Déconnexion
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:C.bg, fontFamily:"'Inter', -apple-system, sans-serif", color:C.text }}>
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
              {n.bottomIcon}
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
