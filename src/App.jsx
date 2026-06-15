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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { enregistrerSeance, getCurrentUser, setCurrentUser, subscribeToNotifications, notifyNewChatMessage, saveOneSignalPlayerId } from "./notifications";

const C = {
  primary: "#7C3AED", accent: "#EC4899", red: "#EF4444",
  orange: "#F97316", blue: "#6366F1", green: "#10B981",
  yellow: "#F59E0B", bg: "#F1F5F9", card: "#FFFFFF",
  text: "#1E293B", muted: "#94A3B8", border: "#E2E8F0",
};

// âââ 106 SÃANCES âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const ALL_SESSIONS = [
  {id:1,date:"2026-06-09",type:"Collectif",coach:"",duration:120,satisfaction:7,katas:["GojÅ«shiho Dai", "GojÅ«shiho ShÅ", "Unsu", "Gankaku"],techniques:["Kihon (Bases)", "Yoko Geri"],notes:"Taper moins sur les pics, sur gankaku bien faire le premier coup de coude, attention iquitÃ© trop bas"},
  {id:2,date:"2026-06-07",type:"Collectif",coach:"Jonathan",duration:120,satisfaction:8,katas:["Unsu", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Ne pas trop m'Ã©craser sur le kiba, Pose yuko plus rapide (gankaku) Bien tourner le talon sur le zen Ã  la fin de la ligne goju Pieds bien parallÃ¨les sur la ligne kiba Attention main en griffe"},
  {id:3,date:"2026-06-04",type:"Collectif",coach:"Romain",duration:120,satisfaction:6,katas:["GojÅ«shiho ShÅ"],techniques:[],notes:"S'Ã©craser sur les kiba, ouvrir plus l'armÃ©e, moins taper du pied sur la pose kiba de la ligne"},
  {id:4,date:"2026-06-03",type:"Collectif",coach:"HelvÃ©tia",duration:75,satisfaction:8,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu", "Supaenpei", "Kanku ShÅ"],techniques:[],notes:"Moins s'Ã©craser sur les kiba de goju et les zen de supa, tendre la jambe arriÃ¨re sur le zen de kanku sho"},
  {id:5,date:"2026-06-02",type:"Collectif",coach:"Romain",duration:120,satisfaction:6,katas:["GojÅ«shiho ShÅ", "Unsu"],techniques:["Kihon (Bases)"],notes:"EnchaÃ®ner plus les rotations sur goju, passer bien par le milieu avant les changements de direction"},
  {id:6,date:"2026-05-30",type:"Collectif",coach:"HelvÃ©tia, Olivier",duration:120,satisfaction:9,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku", "Unsu", "Kanku ShÅ"],techniques:[],notes:"Armer correctement sur ligne unsu, ne pas remonter sur ligne kiba, dynamique sur les dÃ©placements, contrÃ´ler les temps lents"},
  {id:7,date:"2026-05-28",type:"Collectif",coach:"Olivier",duration:120,satisfaction:7,katas:["Kanku ShÅ", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku"],techniques:["Kihon (Bases)", "Mawashi Geri"],notes:"Rester droite Ã  la fin de unsu aprÃ¨s le saut, Ãªtre plus dynamique"},
  {id:8,date:"2026-05-27",type:"Collectif",coach:"HelvÃ©tia",duration:90,satisfaction:8,katas:["Kanku ShÅ"],techniques:[],notes:"Pour le saut aller vite le sol au dÃ©but, avant de chercher le premier saut kokutsu, zen et non fudo sur les positions Ã  la fin"},
  {id:9,date:"2026-05-26",type:"Collectif",coach:"HelvÃ©tia",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ"],techniques:[],notes:"Armer correctement, aller moins loin chercher sur le pic, rÃ©trÃ©cir le zen, bien tourner le talon sur le zen inversÃ© Ã  la fin de la ligne"},
  {id:10,date:"2026-05-23",type:"Collectif",coach:"Hugo",duration:120,satisfaction:8,katas:["GojÅ«shiho Dai"],techniques:[],notes:"Lever les iquitÃ©s"},
  {id:11,date:"2026-05-21",type:"Collectif",coach:"Hugo",duration:120,satisfaction:8,katas:["Unsu"],techniques:[],notes:"Ne pas trop bouger le haut du corps sur le dÃ©but, jouer plus sur les temps carÃªmes"},
  {id:12,date:"2026-05-19",type:"Collectif",coach:"Hugo",duration:90,satisfaction:8,katas:["GojÅ«shiho Dai"],techniques:["Kihon (Bases)", "Yoko Geri"],notes:"Moins de bruit de bouche"},
  {id:13,date:"2026-05-17",type:"Perso",coach:"HelvÃ©tia",duration:75,satisfaction:8,katas:["GojÅ«shiho Dai", "Supaenpei"],techniques:[],notes:"Travail sur les corrections proposÃ©es par HelvÃ©tia"},
  {id:14,date:"2026-05-16",type:"Collectif",coach:"Hugo, Olivier",duration:120,satisfaction:8,katas:["GojÅ«shiho Dai"],techniques:["Kihon (Bases)"],notes:"Attention pied gauche qui se dÃ©cale dans les rotations de goju, levier iquitÃ©, plus vite au sol aprÃ¨s yuko"},
  {id:15,date:"2026-05-16",type:"Collectif",coach:"Olivier",duration:120,satisfaction:7,katas:["Unsu"],techniques:["Mae Geri", "Mawashi Geri", "Yoko Geri", "Kihon (Bases)"],notes:"Lever le iquitÃ©"},
  {id:16,date:"2026-05-13",type:"Perso",coach:"HelvÃ©tia",duration:75,satisfaction:8,katas:["GojÅ«shiho Dai"],techniques:[],notes:"Ãchauffement spÃ©cifique â travail sur positions et techniques"},
  {id:17,date:"2026-05-12",type:"Perso",coach:"HelvÃ©tia",duration:60,satisfaction:8,katas:["Supaenpei"],techniques:[],notes:"Exercices de prÃ©paration physique"},
  {id:18,date:"2026-05-07",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Unsu"],techniques:[],notes:"Ligne unsu ne pas regarder derriÃ¨re sur le soto, attention kiba, Ã©quilibre le neko"},
  {id:19,date:"2026-05-06",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai"],techniques:[],notes:"Corrections pour l'Equipe"},
  {id:20,date:"2026-05-05",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai"],techniques:[],notes:"Attention iquitÃ© trop bas, Ãªtre bien de face sur les pics"},
  {id:21,date:"2026-05-02",type:"Collectif",coach:"Romain, HelvÃ©tia",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu"],techniques:[],notes:"Attention rotation des poignet, sur goju bien armer le bras avant 2eme rotation"},
  {id:22,date:"2026-05-02",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:6,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu"],techniques:[],notes:"Ãtre plus technique, attention iquitÃ© trop bas"},
  {id:23,date:"2026-04-30",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Sansai"],techniques:[],notes:"Moins taper du pied et revoir la fin"},
  {id:24,date:"2026-04-28",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Supaenpei"],techniques:[],notes:""},
  {id:25,date:"2026-04-25",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Gankaku"],techniques:[],notes:""},
  {id:26,date:"2026-04-21",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["GojÅ«shiho ShÅ"],techniques:[],notes:"Penser Ã  plus armer. Rotation bien"},
  {id:27,date:"2026-04-18",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["Unsu"],techniques:[],notes:""},
  {id:28,date:"2026-04-16",type:"Perso",coach:"Perso",duration:75,satisfaction:8,katas:["GojÅ«shiho Dai"],techniques:[],notes:"Moins sauter sur les pics"},
  {id:29,date:"2026-04-15",type:"Collectif",coach:"HelvÃ©tia",duration:90,satisfaction:7,katas:["GojÅ«shiho ShÅ"],techniques:[],notes:"Tourner que sur le talon pour la rotation, ne pas trop taper sur les bras"},
  {id:30,date:"2026-04-09",type:"Collectif",coach:"Romain",duration:90,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku", "Supaenpei"],techniques:[],notes:"Attention ne pas trop taper sur les pics, sur gankaku bien stopper le 2eme sur la ligne"},
  {id:31,date:"2026-04-08",type:"Collectif",coach:"HelvÃ©tia",duration:75,satisfaction:8,katas:["Empi", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Fermer le regard, ne pas trop taper les pics goju"},
  {id:32,date:"2026-04-07",type:"Collectif",coach:"Romain",duration:120,satisfaction:1,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu", "Gankaku", "Kanku ShÅ"],techniques:[],notes:"Rien â il ne s'est occupÃ© que de Romane"},
  {id:33,date:"2026-04-02",type:"Collectif",coach:"",duration:120,satisfaction:6,katas:["Empi", "GojÅ«shiho Dai", "GojÅ«shiho ShÅ", "Unsu"],techniques:[],notes:"Postures"},
  {id:34,date:"2026-03-28",type:"Collectif",coach:"Olivier",duration:120,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku", "Supaenpei", "Kanku ShÅ"],techniques:[],notes:"Baisser les Ã©paules, attention Ã  pas rentrer les pieds sur kokutsu"},
  {id:35,date:"2026-03-26",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["GojÅ«shiho Dai", "Gankaku", "Unsu"],techniques:[],notes:"Garder toujours la tÃªte droite ! Dai : ne pas taper sur pics, descendre le bras"},
  {id:36,date:"2026-03-25",type:"Collectif",coach:"HelvÃ©tia",duration:75,satisfaction:8,katas:["GojÅ«shiho ShÅ", "Unsu"],techniques:[],notes:"Descendre moins, redresser le corps sur la ligne kiba"},
  {id:37,date:"2026-03-24",type:"Collectif",coach:"Romain",duration:120,satisfaction:2,katas:[],techniques:[],notes:"TOUT ! 2h Ã  entendre que rien n'Ã©tait bienâ¦"},
  {id:38,date:"2026-03-21",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:7,katas:["Kanku ShÅ", "Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Tirer les iquitÃ©s, stopper plus sur la ligne de unsu"},
  {id:39,date:"2026-03-19",type:"Collectif",coach:"Romain",duration:90,satisfaction:7,katas:["Unsu", "GojÅ«shiho ShÅ", "Empi"],techniques:[],notes:"Kiba centrÃ©, fudo jambe arriÃ¨re moins pliÃ©"},
  {id:40,date:"2026-03-17",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Kanku ShÅ", "Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Unsu : stopper plus les shion tsuki, ramener de face sur la ligne sur les changements de jambes"},
  {id:41,date:"2026-03-14",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "Gankaku"],techniques:[],notes:"Goju : marquer plus les 2 tsuki, plus prÃ©cis sur les mains"},
  {id:42,date:"2026-03-14",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Kanku ShÅ", "Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku", "Supaenpei"],techniques:[],notes:"Sho : plus sobre sur les temps lents du dÃ©but. Unsu : marquer le troisiÃ¨me shion tsuki"},
  {id:43,date:"2026-03-12",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "Kanku ShÅ", "Unsu"],techniques:[],notes:"Prendre son temps sur la ligne unsu"},
  {id:44,date:"2026-03-10",type:"Collectif",coach:"",duration:120,satisfaction:6,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku", "Kanku ShÅ"],techniques:[],notes:"Plus prÃ©cise sur tout, descendre plus, rÃ©trÃ©cir les positions"},
  {id:45,date:"2026-03-03",type:"Collectif",coach:"Autre",duration:90,satisfaction:7,katas:["Unsu", "GojÅ«shiho ShÅ", "Gankaku"],techniques:[],notes:"Plus d'expression, plus de rapiditÃ©"},
  {id:46,date:"2026-02-28",type:"Collectif",coach:"Jonathan",duration:150,satisfaction:8,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu"],techniques:[],notes:"Frapper pic droit, armer correctement dans dai"},
  {id:47,date:"2026-02-26",type:"Collectif",coach:"Romain",duration:120,satisfaction:6,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Kanku ShÅ", "Gankaku"],techniques:[],notes:""},
  {id:48,date:"2026-02-26",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Kanku ShÅ", "GojÅ«shiho ShÅ", "Unsu"],techniques:[],notes:""},
  {id:49,date:"2026-02-25",type:"Collectif",coach:"HelvÃ©tia",duration:150,satisfaction:7,katas:["GojÅ«shiho ShÅ", "Unsu"],techniques:[],notes:"Goju : attention ouverture pic et pic droit, temps lents, marquer plus le Mae gueri"},
  {id:50,date:"2026-02-24",type:"Collectif",coach:"Autre",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "Kanku ShÅ", "Unsu", "Gankaku", "GojÅ«shiho Dai"],techniques:[],notes:"Ne pas remonter entre les positions, ouvrir les kiba, tirer les iquitÃ©s"},
  {id:51,date:"2026-02-22",type:"Collectif",coach:"Jonathan",duration:90,satisfaction:7,katas:["Unsu"],techniques:[],notes:"Mae gueri et respiration, revoir timing dans le bunkai"},
  {id:52,date:"2026-02-21",type:"Collectif",coach:"Jonathan",duration:60,satisfaction:7,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai"],techniques:[],notes:"Les Mae gueri, temps des pics, demi tour haito en 2 temps"},
  {id:53,date:"2026-02-21",type:"Collectif",coach:"Olivier, Hugo, Romain",duration:120,satisfaction:7,katas:["GojÅ«shiho ShÅ", "Gankaku", "Kanku ShÅ"],techniques:[],notes:"Centrer les kiba, ouvrir plus grand armÃ©e des pics"},
  {id:54,date:"2026-02-19",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu", "Empi"],techniques:[],notes:"Kiba trop grand"},
  {id:55,date:"2026-02-18",type:"Perso",coach:"",duration:60,satisfaction:8,katas:["Unsu", "GojÅ«shiho Dai"],techniques:[],notes:"Corrections+sansei"},
  {id:56,date:"2026-02-17",type:"Perso",coach:"Perso",duration:60,satisfaction:8,katas:["Unsu", "GojÅ«shiho Dai"],techniques:[],notes:"Dai : coordonnÃ©es les temps lents, attention pic sur le cÃ´tÃ©"},
  {id:57,date:"2026-02-15",type:"Collectif",coach:"Jonathan",duration:120,satisfaction:8,katas:["Empi", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu"],techniques:[],notes:"Revoir le mouvement aprÃ¨s le 2eme Mae gueri de dai, attention respi trop shito"},
  {id:58,date:"2026-02-14",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu", "Gankaku"],techniques:[],notes:"Kiba, mains plus tendues, Ã©paules en avant"},
  {id:59,date:"2026-02-14",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:8,katas:["Kanku ShÅ", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Taper plus, plus technique, revoir les kiba"},
  {id:60,date:"2026-02-12",type:"Collectif",coach:"",duration:120,satisfaction:6,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu", "Gankaku", "Kanku ShÅ"],techniques:[],notes:"Plus propre techniquement"},
  {id:61,date:"2026-02-11",type:"Collectif",coach:"HelvÃ©tia",duration:90,satisfaction:8,katas:["Kanku ShÅ"],techniques:[],notes:"Ne pas pliÃ© jambe arriÃ¨re sur fudo, ne pas lever le pied en commenÃ§ant, armer yuko correctement"},
  {id:62,date:"2026-02-03",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "Unsu"],techniques:[],notes:"Attention Ã©paules qui bougent, ouvrir plus avant de piquer goju"},
  {id:63,date:"2026-01-27",type:"Collectif",coach:"Hugo",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu", "Supaenpei"],techniques:[],notes:"Plus stopper rythme ligne unsu, gros stop aprÃ¨s demi tour coup de pied supa"},
  {id:64,date:"2026-01-26",type:"Perso",coach:"Perso",duration:45,satisfaction:7,katas:["Empi", "GojÅ«shiho ShÅ"],techniques:[],notes:"Rythme Ã©quipe"},
  {id:65,date:"2026-01-22",type:"Collectif",coach:"Hugo",duration:120,satisfaction:9,katas:["Kanku ShÅ", "GojÅ«shiho ShÅ", "Unsu", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Stopper plus le rythme sur dai et sur la ligne de unsu"},
  {id:66,date:"2026-01-20",type:"Collectif",coach:"Romain",duration:120,satisfaction:9,katas:["Unsu", "Kanku ShÅ", "GojÅ«shiho Dai", "GojÅ«shiho ShÅ"],techniques:[],notes:"Les Ã©paules vers l'avant, moins vite, pic linÃ©aire"},
  {id:67,date:"2026-01-15",type:"Collectif",coach:"Romain",duration:90,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Ãpaule plus vers l'avant sur les pics, hanche de face sur dai"},
  {id:68,date:"2026-01-13",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Supaenpei"],techniques:[],notes:"Moins sur l'arriÃ¨re, plus grand me avancÃ©e sur dai"},
  {id:69,date:"2026-01-12",type:"Perso",coach:"Perso",duration:45,satisfaction:8,katas:["GojÅ«shiho ShÅ"],techniques:[],notes:"Rythme Ã©quipe de France"},
  {id:70,date:"2026-01-05",type:"Perso",coach:"Perso, HelvÃ©tia",duration:60,satisfaction:8,katas:["GojÅ«shiho Dai"],techniques:[],notes:""},
  {id:71,date:"2026-01-04",type:"Perso",coach:"",duration:90,satisfaction:6,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Respi"},
  {id:72,date:"2026-01-02",type:"Visio",coach:"Perso, HelvÃ©tia",duration:70,satisfaction:8,katas:["Unsu"],techniques:[],notes:"Tomber mieux au sol, attention ramener bien avant changement de jambe sur la ligne"},
  {id:73,date:"2025-12-30",type:"Perso",coach:"",duration:70,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Rythme et respiration"},
  {id:74,date:"2025-12-14",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["GojÅ«shiho Dai", "Unsu"],techniques:["Mae Geri", "Yoko Geri"],notes:"Sur unsu : plus percutant sur la ligne. Dai : marquer plus le coup de coude"},
  {id:75,date:"2025-12-14",type:"Collectif",coach:"Romain, Jonathan",duration:120,satisfaction:9,katas:["Unsu", "GojÅ«shiho ShÅ"],techniques:["Yoko Geri", "Mae Geri"],notes:"Unsu : balancer plus les shion tsuki plus vite et plus fort"},
  {id:76,date:"2025-12-11",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ"],techniques:[],notes:"Sur unsu : balancer les tsuki, pose pied fort. Sur goju: monter les pics"},
  {id:77,date:"2025-12-09",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["GojÅ«shiho ShÅ"],techniques:["Kihon (Bases)"],notes:"Armer plus en bas, moins vite, Ã©paule alignÃ©es"},
  {id:78,date:"2025-12-02",type:"Collectif",coach:"Romain",duration:90,satisfaction:7,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku", "Supaenpei", "Unsu"],techniques:[],notes:"Calibrer mieux kiba, plus gainer"},
  {id:79,date:"2025-12-01",type:"Perso",coach:"Perso",duration:60,satisfaction:8,katas:["GojÅ«shiho ShÅ", "Unsu"],techniques:[],notes:"Corrections"},
  {id:80,date:"2025-11-29",type:"Collectif",coach:"Olivier",duration:120,satisfaction:6,katas:["GojÅ«shiho ShÅ", "Unsu"],techniques:[],notes:"Attention genou qui rentre sur zen, placement hanche sur fudo. Malade"},
  {id:81,date:"2025-11-29",type:"Collectif",coach:"Olivier",duration:120,satisfaction:7,katas:["GojÅ«shiho Dai", "Unsu", "Gankaku"],techniques:[],notes:"RÃ©trÃ©cir kiba"},
  {id:82,date:"2025-11-27",type:"Perso",coach:"HelvÃ©tia",duration:90,satisfaction:7,katas:["GojÅ«shiho ShÅ", "Unsu", "Kanku ShÅ"],techniques:[],notes:"Routine d'Ã©chauffement compÃ©tition"},
  {id:83,date:"2025-11-25",type:"Collectif",coach:"Romain",duration:120,satisfaction:9,katas:["Gankaku", "GojÅ«shiho ShÅ"],techniques:[],notes:"Sur mandji mettre le bras arriÃ¨re parallÃ¨le au sol, sur goju stopper avant de lancer le Mae gueri"},
  {id:84,date:"2025-11-22",type:"Collectif",coach:"Olivier, Yves",duration:120,satisfaction:7,katas:["GojÅ«shiho Dai", "GojÅ«shiho ShÅ", "Unsu", "Kanku ShÅ"],techniques:[],notes:"Lever le genoux pour Mae gueri, marquer plus les mandji"},
  {id:85,date:"2025-11-22",type:"Collectif",coach:"Yves, Olivier",duration:120,satisfaction:7,katas:["GojÅ«shiho ShÅ"],techniques:["Kihon (Bases)", "Mae Geri"],notes:"Ne pas remonter sur transitions"},
  {id:86,date:"2025-11-20",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu", "Kanku ShÅ", "Supaenpei"],techniques:[],notes:"Ne pas chercher le 2eme pic trop loin, descendre plus sur kiai des goju"},
  {id:87,date:"2025-11-19",type:"Collectif",coach:"Jonathan",duration:75,satisfaction:6,katas:[],techniques:[],notes:"Point linÃ©aire, aller chercher moins loin sur gyaku tsuki"},
  {id:88,date:"2025-11-18",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Supaenpei"],techniques:[],notes:"Ne pas aller chercher trop loin sur 2eme pic goju"},
  {id:89,date:"2025-11-17",type:"Perso",coach:"HelvÃ©tia",duration:45,satisfaction:7,katas:["Unsu", "Kanku ShÅ"],techniques:[],notes:"En quart de kata -> Une fois doucement -> Une fois Ã  fond"},
  {id:90,date:"2025-11-15",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["GojÅ«shiho Dai", "GojÅ«shiho ShÅ", "Unsu", "Kanku ShÅ"],techniques:[],notes:"Ouvrir plus pic goju, avoir les hanches de face sur les pics dai"},
  {id:91,date:"2025-11-15",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "Unsu", "GojÅ«shiho Dai"],techniques:["Kihon (Bases)"],notes:"Ne pas rentrer l'Ã©paule sur Mae gueri, fermer les hanches sur les pics"},
  {id:92,date:"2025-11-12",type:"Perso",coach:"Jonathan",duration:60,satisfaction:7,katas:["GojÅ«shiho ShÅ"],techniques:[],notes:"Travail sur les corrections de Jonathan"},
  {id:93,date:"2025-11-11",type:"Collectif",coach:"Romain",duration:120,satisfaction:5,katas:[],techniques:["Gyaku Zuki", "Kihon (Bases)", "Shuto", "Uke"],notes:"Ãtre plus carrÃ© sur tout, rÃ©trÃ©cir tout, Ãªtre gaine tout le temps"},
  {id:94,date:"2025-10-30",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku", "Supaenpei"],techniques:[],notes:"Sur suparinpei marquer plus le shuto, axer les pics des goju"},
  {id:95,date:"2025-10-30",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Gankaku", "Supaenpei"],techniques:[],notes:"Sur suparinpei marquer plus le shuto, axer les pics des goju"},
  {id:96,date:"2025-10-29",type:"PrivÃ©",coach:"HelvÃ©tia",duration:60,satisfaction:8,katas:["GojÅ«shiho ShÅ", "Gankaku", "Kanku ShÅ"],techniques:[],notes:"Armer les yuko sur gankaku, pas de temps d'appel sur pics goju"},
  {id:97,date:"2025-10-28",type:"Collectif",coach:"Romain",duration:120,satisfaction:6,katas:["Kanku ShÅ", "Empi", "GojÅ«shiho ShÅ", "Unsu", "GojÅ«shiho Dai", "Gankaku"],techniques:[],notes:"Rotation plus rapide, taper plus"},
  {id:98,date:"2025-10-28",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Kanku ShÅ", "Empi", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai"],techniques:[],notes:"Envoyer ++"},
  {id:99,date:"2025-10-26",type:"Collectif",coach:"Yves",duration:120,satisfaction:8,katas:["GojÅ«shiho Dai", "Unsu", "Empi"],techniques:[],notes:"Plus fort les rotations kiba"},
  {id:100,date:"2025-10-26",type:"Collectif",coach:"Yves",duration:120,satisfaction:8,katas:["GojÅ«shiho ShÅ", "Kanku ShÅ"],techniques:[],notes:"Attention au Mae gueri et aux alignements des Ã©paules"},
  {id:101,date:"2025-10-24",type:"Collectif",coach:"Romain",duration:120,satisfaction:8,katas:["Supaenpei", "GojÅ«shiho Dai", "GojÅ«shiho ShÅ", "Unsu", "Empi"],techniques:[],notes:"Sur supa prendre moins de temps aprÃ¨s le kiai"},
  {id:102,date:"2025-10-24",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Empi", "GojÅ«shiho ShÅ", "Unsu", "GojÅ«shiho Dai", "Gankaku", "Kanku ShÅ"],techniques:[],notes:"Attention kiba sur empi"},
  {id:103,date:"2025-10-22",type:"PrivÃ©",coach:"HelvÃ©tia",duration:45,satisfaction:8,katas:["GojÅ«shiho ShÅ", "GojÅ«shiho Dai", "Unsu", "Gankaku"],techniques:[],notes:"Plus Ã©purer le travail au niveau des hanches"},
  {id:104,date:"2025-10-22",type:"Collectif",coach:"HelvÃ©tia",duration:120,satisfaction:8,katas:["Empi", "Unsu", "GojÅ«shiho ShÅ", "GojÅ«shiho Dai"],techniques:[],notes:"Posture"},
  {id:105,date:"2025-10-18",type:"Collectif",coach:"Romain, Olivier",duration:120,satisfaction:8,katas:["Kanku ShÅ", "Unsu", "GojÅ«shiho Dai", "GojÅ«shiho ShÅ", "Supaenpei", "Gankaku"],techniques:[],notes:"Mae gueri"},
  {id:106,date:"2025-10-18",type:"Collectif",coach:"Romain",duration:120,satisfaction:7,katas:["Kanku ShÅ", "Gankaku", "GojÅ«shiho Dai", "Unsu", "GojÅ«shiho ShÅ", "Supaenpei"],techniques:[],notes:"ma posture, Mes pics de goju avec la hanche du bon cÃ´tÃ©"}
];

const mockWeekActivity = [
  { day:"lun.", karate:0, physique:0 }, { day:"mar.", karate:120, physique:0 },
  { day:"mer.", karate:0, physique:0 }, { day:"jeu.", karate:0, physique:0 },
  { day:"ven.", karate:0, physique:0 }, { day:"sam.", karate:0, physique:0 },
  { day:"dim.", karate:0, physique:0 },
];

const mockCompetitions = [
  { id:1, date:"2026-05-09", name:"Championnat de France Ãquipe SÃ©nior", lieu:"Cormeilles-En-Parisis", coach:"Olivier", result:"MÃ©daille d'Argent", hasVideo:true,
    tours:[
      { num:1, name:"Demi Finale", kata:"GojÅ«shiho ShÅ", score:"5-0", ok:true, note:"Bonnes sensations" },
      { num:2, name:"Finale", kata:"Unsu", score:"1-4", ok:false, note:"un peu stressÃ©e et pas trÃ¨s stable mais bien sur le bunkai" },
    ]
  },
  { id:2, date:"2026-04-12", name:"Championnat de France Ãquipe", lieu:"Mulhouse", coach:"Romain", result:"MÃ©daille d'Or", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"GojÅ«shiho Dai", score:"5-0", ok:true, note:"" },
      { num:2, name:"Demi Finale", kata:"GojÅ«shiho ShÅ", score:"3-2", ok:true, note:"" },
      { num:3, name:"Finale", kata:"Unsu", score:"5-0", ok:true, note:"" },
    ]
  },
  { id:3, date:"2026-04-11", name:"Championnat de France Indiv", lieu:"Mulhouse", coach:"Olivier", result:"DÃ©faite au 3Ã¨me tour", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"Unsu", score:"5-0", ok:true, note:"" },
      { num:2, name:"2Ã¨me tour", kata:"GojÅ«shiho ShÅ", score:"5-0", ok:true, note:"" },
      { num:3, name:"HuitiÃ¨me de Finale", kata:"GojÅ«shiho Dai", score:"2-3", ok:false, note:"" },
    ]
  },
  { id:4, date:"2026-03-08", name:"Liga Nacional 2026", lieu:"Ciudad Real Espagne", coach:"Autre", result:"Perdu au 2Ã¨me tour", hasVideo:true,
    notes:"Pas de respi donc dur d'Ãªtre a fond. DÃ©Ã§ue d'avoir pas vraiment pu Ãªtre a fond.",
    tours:[
      { num:1, name:"1er tour", kata:"GojÅ«shiho ShÅ", score:"3-2", ok:true, note:"Contente de mon Kata, j'ai rÃ©ussi Ã  appliquer des corrections. Peu d'Ã©nergie" },
      { num:2, name:"2Ã¨me tour", kata:"Unsu", score:"2-3", ok:false, note:"TrÃ¨s peu d'Ã©nergie mais contente de shion tsuki" },
    ]
  },
  { id:5, date:"2026-01-17", name:"Milon Cup Junior", lieu:"Luxembourg", coach:"Romain", result:"MÃ©daille de Bronze", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"GojÅ«shiho Dai", score:"0-5", ok:false, note:"Contente de mon Kata malgrÃ© le dÃ©sÃ©quilibre" },
      { num:2, name:"Finale de Bronze", kata:"Supaenpei", score:"5-0", ok:true, note:"Ã part le retourner un peu ratÃ© je l'ai trouvÃ© bien" },
    ]
  },
  { id:6, date:"2026-01-17", name:"Milon Cup SÃ©nior", lieu:"Luxembourg", coach:"Romain", result:"MÃ©daille d'argent", hasVideo:true,
    notes:"Pour l'Ã©chauffement j'ai fait ce qu'on a fait Ã  Venise : mobilitÃ©, course, Kata entier doucement, puis petites parties a fond.",
    tours:[
      { num:1, name:"1er tour", kata:"GojÅ«shiho Dai", score:"3-2", ok:true, note:"Je suis contente pour un premier tour" },
      { num:2, name:"2Ã¨me tour", kata:"Supaenpei", score:"4-1", ok:true, note:"TrÃ¨s bonnes sensations" },
      { num:3, name:"Demi Finale", kata:"GojÅ«shiho ShÅ", score:"3-2", ok:true, note:"Pas fan du dÃ©but et les pics un peu caca" },
      { num:4, name:"Finale", kata:"Gankaku", score:"2-3", ok:false, note:"Un peu lente peut Ãªtre trop dans le boum boum" },
    ]
  },
  { id:7, date:"2025-12-04", name:"Youth League", lieu:"Venise", coach:"HelvÃ©tia", result:"11Ã¨me", hasVideo:false,
    notes:"Contente des mes 1ers tours mais je reste sur ma faim...",
    tours:[
      { num:1, name:"1er tour", kata:"GojÅ«shiho ShÅ", score:"23.3", ok:true, note:"Bonnes sensations, mais trÃ¨s stressÃ©e" },
      { num:2, name:"2Ã¨me tour", kata:"GojÅ«shiho Dai", score:"23.1", ok:true, note:"TrÃ¨s fiÃ¨re" },
      { num:3, name:"HuitiÃ¨me de Finale", kata:"Supaenpei", score:"22.8", ok:false, note:"Fatigue ressentie Ã  la fin du kata" },
      { num:4, name:"1er tour de repÃªchage", kata:"Unsu", score:"21.4", ok:false, note:"DÃ©Ã§ue" },
    ]
  },
  { id:8, date:"2025-11-09", name:"Championnat DÃ©partemental", lieu:"Ãpinay-Sous-SÃ©nart", coach:"Hugo", result:"MÃ©daille d'Or", hasVideo:true,
    tours:[
      { num:1, name:"Finale", kata:"GojÅ«shiho ShÅ", score:"5-0", ok:true, note:"" },
    ]
  },
  { id:9, date:"2025-11-02", name:"Coupe de France Ãquipe", lieu:"Lille", coach:"Romain", result:"MÃ©daille d'Argent", hasVideo:false,
    tours:[
      { num:1, name:"Demi Finale", kata:"GojÅ«shiho ShÅ", score:"5-0", ok:true, note:"" },
      { num:2, name:"Finale", kata:"Kanku ShÅ", score:"0-5", ok:false, note:"" },
    ]
  },
  { id:10, date:"2025-11-01", name:"Coupe de France Junior", lieu:"Lille", coach:"Olivier", result:"DÃ©faite au 1er tour", hasVideo:false,
    tours:[
      { num:1, name:"1er tour", kata:"GojÅ«shiho ShÅ", score:"2-3", ok:false, note:"" },
    ]
  },
  { id:11, date:"2025-10-05", name:"Liga Nacional", lieu:"Langreo", coach:"Autre", result:"DÃ©faite au 1er tour", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"GojÅ«shiho ShÅ", score:"2-3", ok:false, note:"" },
    ]
  },
  { id:12, date:"2025-09-26", name:"Lion Cup", lieu:"Strassen", coach:"Olivier", result:"MÃ©daille d'Argent", hasVideo:true,
    tours:[
      { num:1, name:"1er tour", kata:"GojÅ«shiho ShÅ", score:"22.8", ok:true, note:"" },
      { num:2, name:"2Ã¨me tour", kata:"Supaenpei", score:"23", ok:true, note:"" },
      { num:3, name:"Demi Finale", kata:"GojÅ«shiho Dai", score:"23.6", ok:true, note:"" },
      { num:4, name:"Finale", kata:"Gankaku", score:"23.3", ok:false, note:"" },
    ]
  },
];

const mockCorrections = [
  { id:1, date:"2026-11-10", trainer:"Jonathan", kata:"GojÅ«shiho Dai", content:"Taper moins fort sur les pics, attention Ã  la posture lors du kiba dachi" },
  { id:2, date:"2025-10-19", trainer:"Jonathan", kata:"Gankaku", content:"Premier coup de coude insuffisant, regarder en bas avant de tourner" },
  { id:3, date:"2025-10-18", trainer:"Olivier", kata:"Unsu", content:"IkitÃ© trop bas, stabiliser le bunkai final" },
];

const mockTeam = {
  "MÃ¨re": [
    { name:"Isabelle Voratovic", email:"isaphoenix@hotmail.fr", phone:"06 10 03 68 28", online:true },
    { name:"Alexandre Voratovic", email:"a.voratovic@isipatrimoine.com", phone:"07 77 05 93 23", online:true },
  ],
  "EntraÃ®neur": [
    { name:"HelvÃ©tia Taily", email:"helvetiataily@gmail.com", phone:"07 67 64 20 15", online:true },
  ],
  "AthlÃ¨te": [
    { name:"Iliana Voratovic", email:"ilianavoratovic@gmail.com", phone:"06 36 49 01 70", online:false },
  ],
};

const mockPhysique = [
  // PPG / Full Body (Kevin) â 24 sÃ©ances
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
  { id:21, date:"2026-03-23", type:"PPG", subType:"Full Body", duration:70, satisfaction:8, coach:"Kevin", notes:"ProblÃ¨me de grip", programme:"" },
  { id:22, date:"2026-03-20", type:"PPG", subType:"Full Body", duration:60, satisfaction:7, coach:"Kevin", notes:"", programme:"" },
  { id:23, date:"2026-03-18", type:"PPG", subType:"Full Body", duration:60, satisfaction:7, coach:"Kevin", notes:"", programme:"" },
  { id:24, date:"2025-12-31", type:"PPG", subType:"Full Body", duration:120, satisfaction:8, coach:"HelvÃ©tia", notes:"SÃ©ance Full Body", programme:"SÃ©ance Full Body - Gainage & StabilitÃ©" },
  // HaltÃ©rophilie (6 sÃ©ances)
  { id:25, date:"2026-03-11", type:"HaltÃ©rophilie", subType:"HaltÃ©rophilie", duration:60, satisfaction:8, coach:"HelvÃ©tia", notes:"Mal aux bras ð", programme:"HaltÃ©rophilie" },
  { id:26, date:"2026-02-16", type:"HaltÃ©rophilie", subType:"HaltÃ©rophilie", duration:50, satisfaction:8, coach:"HelvÃ©tia", notes:"Ã§a fait du bien de refaire du physique ð", programme:"HaltÃ©rophilie" },
  { id:27, date:"2025-12-08", type:"HaltÃ©rophilie", subType:"HaltÃ©rophilie", duration:60, satisfaction:8, coach:"HelvÃ©tia", notes:"Mal aux mains ð", programme:"HaltÃ©rophilie" },
  { id:28, date:"2025-11-26", type:"HaltÃ©rophilie", subType:"HaltÃ©rophilie", duration:60, satisfaction:8, coach:"HelvÃ©tia", notes:"", programme:"HaltÃ©rophilie" },
  { id:29, date:"2025-11-10", type:"HaltÃ©rophilie", subType:"HaltÃ©rophilie", duration:60, satisfaction:7, coach:"HelvÃ©tia", notes:"", programme:"HaltÃ©rophilie" },
  { id:30, date:"2025-10-21", type:"HaltÃ©rophilie", subType:"HaltÃ©rophilie", duration:60, satisfaction:7, coach:"HelvÃ©tia", notes:"", programme:"HaltÃ©rophilie" },
  // Endurance (5 sÃ©ances)
  { id:31, date:"2026-03-02", type:"Endurance", subType:"Endurance", duration:60, satisfaction:8, coach:"Michel", distance:"6km", intensite:"ÃlevÃ©e", notes:"IntensitÃ© courte et rÃ©pÃ©tÃ©e" },
  { id:32, date:"2026-02-24", type:"Endurance", subType:"Endurance", duration:120, satisfaction:8, coach:"JÃ©rÃ©mie", notes:"Travail de vitesse sur courte distance, puis travail sur les 5 Kata" },
  { id:33, date:"2026-02-18", type:"Endurance", subType:"Endurance", duration:30, satisfaction:7, coach:"Michel", notes:"Relancer le cardio sans surcharge" },
  { id:34, date:"2025-10-27", type:"Endurance", subType:"Endurance", duration:60, satisfaction:6, coach:"Michel", notes:"AffÃ»tage" },
  { id:35, date:"2025-10-20", type:"Endurance", subType:"Endurance", duration:60, satisfaction:7, coach:"Michel", notes:"Relancer le cardio sans surcharge" },
  // ExplosivitÃ© (3 sÃ©ances)
  { id:36, date:"2026-02-23", type:"ExplosivitÃ©", subType:"ExplosivitÃ©", duration:75, satisfaction:8, coach:"HelvÃ©tia", notes:"HALTÃRO + RENFO â Hang Power Clean, Front Squat, Push Press..." },
  { id:37, date:"2025-11-24", type:"ExplosivitÃ©", subType:"ExplosivitÃ©", duration:75, satisfaction:8, coach:"HelvÃ©tia", notes:"HALTÃRO + RENFO" },
  { id:38, date:"2025-10-23", type:"ExplosivitÃ©", subType:"ExplosivitÃ©", duration:60, satisfaction:7, coach:"Michel", notes:"RÃ©sistance Explosive â Circuit burpees/pompes/kihon" },
  // Technique (1 sÃ©ance)
  { id:39, date:"2025-11-23", type:"Technique", subType:"Technique", duration:60, satisfaction:7, coach:"Michel", notes:"Tests Physiques â Epreuve 1=9'48 Epreuve 5=VMA 13,3km/h" },
  // CompÃ©t (1 sÃ©ance)
  { id:40, date:"2026-02-24", type:"CompÃ©tition", subType:"CompÃ©tition", duration:120, satisfaction:7, coach:"JÃ©rÃ©mie", notes:"Explo + RÃ©visions gammes" },
  // Full Body sÃ©parÃ© (2 sÃ©ances dÃ©jÃ  dans PPG mais avec type distinct)
  { id:41, date:"2025-12-12", type:"Full Body", subType:"Full Body", duration:60, satisfaction:7, coach:"", notes:"Travail de gainage : Ãlastique ou cÃ¢ble Ã  hauteur de poitrine pour Pallof Press" },
  { id:42, date:"2026-05-31", type:"Full Body", subType:"Full Body", duration:120, satisfaction:8, coach:"HelvÃ©tia", notes:"" },
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
      <div style={{ fontWeight:700, fontSize:13 }}>ð¥ SÃ©ance enregistrÃ©e !</div>
      <div style={{ fontSize:12, opacity:0.85, marginTop:2 }}>{message}</div>
    </div>
    <button onClick={onClose} style={{ background:"none", border:"none", color:"#fff", cursor:"pointer" }}>â</button>
  </div>
);

// âââ DASHBOARD âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const Dashboard = ({ sessions, competitions }) => {
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
        <div style={{ fontSize:22, fontWeight:800 }}>Bonjour Iliana ð</div>
        <div style={{ fontSize:13, opacity:0.85, marginTop:4 }}>Continuez votre progression vers l'excellence</div>
      </div>

      <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:"1px solid "+C.border }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <Calendar size={15} color={C.accent}/> <strong style={{ fontSize:13 }}>Planning de la semaine</strong>
          <span style={{ color:C.muted, fontSize:11 }}>8-14 juin 2026</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:12 }}>
          {[{label:"Club",val:4,color:C.red},{label:"PrÃ©pa Physique",val:2,color:C.blue},
            {label:"Entr. Perso",val:0,color:C.muted},{label:"CompÃ©titions",val:0,color:C.yellow}].map(s=>(
            <div key={s.label} style={{ background:s.color+"11", border:"1px solid "+s.color+"33", borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:10, color:s.color, fontWeight:600, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+C.green }}>
          <span style={{ color:C.green, fontSize:12 }}>ð¯ <strong>Objectif :</strong> PrÃ©pa Porec</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
        {[{icon:"ð¥",label:"SÃ©ances totales",val:sessions.length,c:C.red},
          {icon:"â±",label:"DurÃ©e moyenne",val:avgDur+" min",c:C.orange},
          {icon:"â­",label:"Satisfaction",val:avgSat+"/10",c:C.yellow},
          {icon:"ð",label:"CompÃ©titions",val:"1",c:C.blue}].map(s=>(
          <div key={s.label} style={{ background:s.c, borderRadius:14, padding:"14px", color:"#fff" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:11, opacity:0.85 }}>{s.label}</div>
            <div style={{ fontSize:18, fontWeight:800 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Stats semaine */}
      {(() => {
        const now = new Date(); const startW = new Date(now); startW.setDate(now.getDate()-now.getDay());
        const karateW = thisWeek.length;
        const physiqueW = mockPhysique.filter(s=>new Date(s.date)>=startW).length;
        const corrW = mockCorrections.filter(c=>new Date(c.date)>=startW).length;
        const compAVenir = (competitions||[]).filter(c=>c.statut==="Ã venir"||(!c.statut&&new Date(c.date)>=now)).length;
        return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
            {[{icon:"ð¥",label:"KaratÃ©",val:karateW,c:C.red},{icon:"ðª",label:"PrÃ©pa",val:physiqueW,c:C.blue},{icon:"ð",label:"Corrections",val:corrW,c:C.primary},{icon:"ð",label:"CompÃ©t. Ã  venir",val:compAVenir,c:C.yellow}].map(s=>(
              <div key={s.label} style={{ background:s.c+"11", border:"1px solid "+s.c+"44", borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                <div style={{ fontSize:22 }}>{s.icon}</div>
                <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.val}</div>
                <div style={{ fontSize:9, color:s.c, fontWeight:600, lineHeight:1.2, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        );
      })()}

      <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:"1px solid "+C.border }}>
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>ActivitÃ© de la semaine</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mockWeekActivity}>
            <XAxis dataKey="day" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis hide /><Tooltip />
            <Bar dataKey="karate" name="ð¥ KaratÃ©" fill={C.red} radius={[4,4,0,0]} />
            <Bar dataKey="physique" name="ðª PrÃ©pa" fill={C.blue} radius={[4,4,0,0]} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize:11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background:C.card, borderRadius:16, padding:16, border:"1px solid "+C.border }}>
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>ActivitÃ©s rÃ©centes</div>
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
              <div style={{ fontSize:11, color:C.muted }}>â± {s.duration} min Â· {s.coach && "Coach: "+s.coach}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// âââ SÃANCES KARATÃ ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const COACHES = ["HelvÃ©tia","Romain","Olivier","Yves","Jonathan","Hugo","Fernando","JÃ©rÃ©mie","Michel","Perso","Autres"];
const KATAS_LIST = ["GojÅ«shiho Dai","GojÅ«shiho ShÅ","Unsu","Gankaku","Kanku ShÅ","Kanku Dai","Supaenpei","Empi","SÅchin","Sansai","Bassai Dai","Bassai ShÅ","Jion","Jitte","Hangetsu","NijÅ«shiho","Chinte","Wankan","GojÅ«shiho"];
const TECHNIQUES_LIST = [
  "Mae Geri (Coup de pied avant)","Mawashi Geri (Coup de pied circulaire)","Ushiro Geri (Coup de pied arriÃ¨re)",
  "Yoko Geri (Coup de pied latÃ©ral)","Oi Zuki (Coup de poing direct)","Gyaku Zuki (Coup de poing inverse)",
  "Uraken (Revers de poing)","Empi (Coup de coude)","Shuto (Tranchant de main)","Uke (Blocages)","Kihon (Bases)"
];
const RESSENTIS = ["ð Excellent","ð TrÃ¨s bon","ð Bon","ð Moyen","ð© Difficile","ð´ FatiguÃ©"];
const ENERGIES = ["TrÃ¨s bas","Bas","Normal","ÃlevÃ©","TrÃ¨s Ã©levÃ©"];

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
              <button onClick={()=>onRemove(item)} style={{ background:"none", border:"none", cursor:"pointer", color, fontSize:14, lineHeight:1, padding:0 }}>Ã</button>
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
            <span>SÃ©lectionner {label.toLowerCase().replace("(s)","")}</span>
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

  const emptyForm = {
    date: new Date().toISOString().split('T')[0],
    type: "Collectif", duration: "",
    coaches: [], katas: [], techniques: [],
    focusPoints: "", corrections: "",
    ressenti: "ð Bon", energie: "Normal",
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
      ressenti: s.ressenti || "ð Bon", energie: s.energie || "Normal",
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
    PrivÃ©: sessions.filter(s => s.type==="PrivÃ©").length,
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
        ressenti: form.ressenti, energie: form.energie, lienVideo: form.lienVideo,
        coach: form.coaches.join(", "), athlete: "Iliana Voratovic"
      };
      if (editingSession) {
        // Modifier sÃ©ance existante
        setSessions(prev => prev.map(s => s.id === editingSession ? { ...s, ...seance } : s));
        // Sync lienVideo dans Firestore si prÃ©sent
        if (seance.lienVideo) {
          const videoId = "perso_" + editingSession;
          const q = query(collection(db, "video_links"), where("videoId", "==", videoId));
          const snap = await getDocs(q);
          if (snap.empty) await addDoc(collection(db, "video_links"), { videoId, lien: seance.lienVideo, updatedAt: serverTimestamp() });
          else await updateDoc(doc(db, "video_links", snap.docs[0].id), { lien: seance.lienVideo, updatedAt: serverTimestamp() });
        }
        showToast("SÃ©ance modifiÃ©e avec succÃ¨s â");
      } else {
        // Nouvelle sÃ©ance â sauvegarder localement d'abord (non-bloquant)
        const newId = Date.now();
        setSessions(prev => [{ id: newId, ...seance }, ...prev]);
        showToast("SÃ©ance "+form.type+" â "+form.duration+" min enregistrÃ©e â");
        // Firestore en arriÃ¨re-plan (ne bloque pas si permission refusÃ©e)
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

  const emoji = (sat) => sat>=9?"ð":sat>=7?"ð":sat>=6?"ð":sat>=4?"ð":"ð";

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
      <SectionHeader icon="ð¥" title="SÃ©ances de KaratÃ©" subtitle="Suivez votre progression technique et vos entraÃ®nements ð¥·" color={C.red}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.red, fontSize:12 }}><Plus size={12}/> Nouvelle sÃ©ance</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[{label:"SÃ©ances totales",val:sessions.length,c:C.red},{label:"DurÃ©e moyenne",val:avgDur+" min",c:C.orange},{label:"Satisfaction moy.",val:avgSat+"/10",c:C.yellow}].map(s=>(
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
        {["ALL","Cette semaine","Ce mois-ci","Mois dernier","Corrections","Collectif","PrivÃ©","Perso","Stage","Visio"].map(f=>(
          <FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} count={counts[f]} />
        ))}
      </div>

      <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>{filtered.length} sÃ©ance{filtered.length>1?"s":""}</div>

      {filtered.map(s=>(
        <div key={s.id} style={{ background:C.card, borderRadius:14, border:"2px solid "+C.red+"33", padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16 }}>{emoji(s.satisfaction)}</span>
                <span style={{ fontWeight:700, fontSize:14 }}>EntraÃ®nement {s.type}</span>
              </div>
              <div style={{ color:C.muted, fontSize:11 }}>{s.date}{s.coach?" Â· "+s.coach:""}</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {s.lienVideo && (
                <button onClick={()=>window.open(s.lienVideo,"_blank")} title="Voir la vidÃ©o" style={{ background:C.primary+"22", border:"1px solid "+C.primary+"44", borderRadius:6, padding:"3px 8px", cursor:"pointer", color:C.primary, fontSize:11, display:"flex", alignItems:"center", gap:3 }}>
                  <Video size={12}/> VidÃ©o
                </button>
              )}
              <button onClick={()=>openEdit(s)} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary }}><Edit2 size={13}/></button>
              <button onClick={()=>setSessions(prev=>prev.filter(p=>p.id!==s.id))} style={{ background:"none", border:"none", cursor:"pointer", color:C.red }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:s.katas?.length>0||s.notes?8:0 }}>
            <span style={{ fontSize:12, color:C.muted }}>â± <strong style={{ color:C.text }}>{s.duration} min</strong></span>
            <span style={{ fontSize:12, color:C.muted }}>â­ <strong style={{ color:C.text }}>{s.satisfaction}/10</strong></span>
          </div>
          {s.katas && s.katas.length>0 && (
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:11, fontWeight:600, marginBottom:4, color:C.muted }}>Katas pratiquÃ©s :</div>
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
              <div style={{ fontSize:11, color:C.orange }}>â  Corrections : {s.notes}</div>
            </div>
          )}
          {s.coachFeedback && (
            <div style={{ background:C.green+"15", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.green, marginTop:6 }}>
              <div style={{ fontSize:11, color:C.green }}>ð¬ Retours coach : {s.coachFeedback}</div>
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
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>{editingSession ? "Modifier la sÃ©ance" : "Nouvelle sÃ©ance de karatÃ©"}</div>
              <button onClick={closeForm} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>

            <div style={{ padding:"20px 24px" }}>
              {/* Ligne 1: Date, Type, DurÃ©e */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box" }} />
                </div>
                <SelectField label="Type de sÃ©ance *" value={form.type} onChange={v=>setForm(f=>({...f,type:v}))}
                  options={["Collectif","PrivÃ©","Perso","Stage","Visio"]} />
                <div>
                  <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>DurÃ©e (minutes) *</label>
                  <input type="number" placeholder="120" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box" }} />
                </div>
              </div>

              {/* EntraÃ®neurs */}
              <MultiSelect label="EntraÃ®neur(s)" options={COACHES} selected={form.coaches}
                onAdd={v=>setForm(f=>({...f,coaches:[...f.coaches,v]}))}
                onRemove={v=>setForm(f=>({...f,coaches:f.coaches.filter(c=>c!==v)}))}
                color={C.primary} />

              {/* Katas */}
              <MultiSelect label="Katas pratiquÃ©s" options={KATAS_LIST} selected={form.katas}
                onAdd={v=>setForm(f=>({...f,katas:[...f.katas,v]}))}
                onRemove={v=>setForm(f=>({...f,katas:f.katas.filter(k=>k!==v)}))}
                color={C.primary} />

              {/* Techniques */}
              <MultiSelect label="Techniques travaillÃ©es" options={TECHNIQUES_LIST} selected={form.techniques}
                onAdd={v=>setForm(f=>({...f,techniques:[...f.techniques,v]}))}
                onRemove={v=>setForm(f=>({...f,techniques:f.techniques.filter(t=>t!==v)}))}
                color={C.orange} />

              {/* Points de focus */}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Points de focus</label>
                <textarea rows={3} placeholder="Sur quoi vous Ãªtes-vous concentrÃ©..." value={form.focusPoints}
                  onChange={e=>setForm(f=>({...f,focusPoints:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }} />
              </div>

              {/* Corrections */}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Corrections Ã  travailler</label>
                <textarea rows={3} placeholder="Points techniques Ã  amÃ©liorer..." value={form.corrections}
                  onChange={e=>setForm(f=>({...f,corrections:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }} />
              </div>

              {/* Ressenti + Ãnergie */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <SelectField label="Ressenti" value={form.ressenti} onChange={v=>setForm(f=>({...f,ressenti:v}))} options={RESSENTIS} />
                <SelectField label="Niveau d'Ã©nergie" value={form.energie} onChange={v=>setForm(f=>({...f,energie:v}))} options={ENERGIES} />
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

              {/* Lien vidÃ©o â Type Perso + coach Perso ou HelvÃ©tia */}
              {form.type === "Perso" && form.coaches.some(c => c === "Perso" || c === "HelvÃ©tia") && (
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>ð Lien VidÃ©o (Google Drive, YouTubeâ¦)</label>
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
                  ð¾ {saving ? "Enregistrement..." : editingSession ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// âââ TABLEAU DE VISUALISATION (Vision Board) ââââââââââââââââââââââââââââââââââ
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
    sÃ©ances: v.count,
    satisfaction: parseFloat((v.totalSat/v.count).toFixed(1)),
    durÃ©e: Math.round(v.totalDur/v.count),
  }));

  const kataCount = {};
  sessions.forEach(s => s.katas?.forEach(k => { kataCount[k] = (kataCount[k]||0)+1; }));
  const topKatas = Object.entries(kataCount).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const COLORS = [C.primary, C.accent, C.red, C.orange, C.blue, C.green];

  return (
    <div>
      <SectionHeader icon="ð" title="Tableau de visualisation" subtitle="Vue d'ensemble de votre progression" color={C.primary} />

      <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:"1px solid "+C.border }}>
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>SÃ©ances par mois (6 derniers mois)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthData}>
            <XAxis dataKey="month" tick={{ fontSize:10 }} axisLine={false} tickLine={false}/>
            <YAxis hide/><Tooltip/>
            <Bar dataKey="sÃ©ances" fill={C.primary} radius={[4,4,0,0]}/>
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
        <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Katas les plus travaillÃ©s</div>
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

// âââ STAGE ÃQUIPE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const mockStages = [
  { id:1, date:"2026-01-31", satisfaction:9, katas:["GojÅ«shiho ShÅ","GojÅ«shiho Dai","Empi"], duration:240,
    focus:"Passage mode compÃ©tition en quart de Kata enchaÃ®nÃ©s",
    corrections:"Les mains plus tendus, tendre plus la jambe arriÃ¨re",
    retours:"TrÃ¨s bien, corrigÃ©" },
  { id:2, date:"2026-01-29", satisfaction:8, katas:["Empi","GojÅ«shiho ShÅ","GojÅ«shiho Dai"], duration:120,
    focus:"Parties importantes dans les kata",
    corrections:"Plus de frappe", retours:"" },
  { id:3, date:"2026-01-11", satisfaction:9, katas:["GojÅ«shiho ShÅ","Unsu"], duration:105,
    focus:"Partie importante dans unsu et goju",
    corrections:"Tendre plus jambe arriÃ¨re", retours:"" },
  { id:4, date:"2026-01-10", satisfaction:8, katas:["Empi","GojÅ«shiho ShÅ","GojÅ«shiho Dai"], duration:150,
    focus:"Passage mode compÃ©tition avec Julia et Louise",
    corrections:"Empi : plus d'impact, pas d'appel avec pied arriÃ¨re. Dai : revoir rythme ligne kiba, plus de maintien. Sho : attention Mae gueri du dÃ©but", retours:"" },
  { id:5, date:"2026-01-09", satisfaction:7, katas:["GojÅ«shiho ShÅ","GojÅ«shiho Dai","Unsu"], duration:260,
    focus:"Le matin : les goju en quart 4 fois. L'aprem : dai entier+demi et unsu en quart 4 fois",
    corrections:"Attention trajectoires, plus d'impact, plus d'intention au bout des doigts", retours:"" },
  { id:6, date:"2026-01-08", satisfaction:8, katas:["Empi","GojÅ«shiho ShÅ"], duration:120,
    focus:"Travail commun sur empi, goju. Ãquipe sur empi chaque demi 4 fois",
    corrections:"Empi : tourner la tÃªte sur gedan barai, regarder le poignet avant le 1er kiai", retours:"" },
  { id:7, date:"2025-12-21", satisfaction:8, katas:["Empi","GojÅ«shiho Dai","Unsu"], duration:240,
    focus:"Empi 2eme + dai, unsu + bunkai 2eme partie",
    corrections:"Empi : Tirer l'iquitÃ© sur le kokutsu avant le saut. Dai : plus d'intention sur les temps lents. Unsu 2: ne pas tordre le poignet sur le 1er mouvement",
    retours:"Travailler au club les bras sur empi et le coup de pied de unsu" },
  { id:8, date:"2025-12-20", satisfaction:8, katas:["Empi","GojÅ«shiho ShÅ","Unsu"], duration:240,
    focus:"Empi + sho, unsu 1ere partie + bunkai",
    corrections:"Empi : se laisser plus tomber sur la montÃ©e de genoux. Sho : ne pas aller chercher trop large au dÃ©but. Unsu : tomber plus vite au sol",
    retours:"TrÃ¨s bien le unsu. Temps dÃ©but de empi : 1 2,1 2,12" },
  { id:9, date:"2025-12-19", satisfaction:8, katas:["Empi"], duration:120,
    focus:"Harmonisation empi",
    corrections:"Tier les Ã©paules en opposition, se laisser tomber apres monter de genoux en posant les pieds 12", retours:"" },
  { id:10, date:"2025-10-12", satisfaction:7, katas:["GojÅ«shiho ShÅ","GojÅ«shiho Dai","Unsu"], duration:240,
    focus:"Cours normalement avec tout le monde puis 3 katas : sho, dai, unsu",
    corrections:"Lucas m'a dit de rÃ©trÃ©cir mes positions pour descendre plus, et de faire attention Ã  mes axes au niveau du haut du corps (je tire trop les Ã©paules)",
    retours:"" },
];

const EMPTY_STAGE = { date: new Date().toISOString().split("T")[0], satisfaction:8, katas:[], duration:"", focus:"", corrections:"", retours:"" };

const StageEquipe = () => {
  const [stages, setStages] = useState(mockStages);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_STAGE);

  const avgSat = stages.length ? (stages.reduce((a,b)=>a+b.satisfaction,0)/stages.length).toFixed(1) : 0;
  const avgDur = stages.length ? Math.round(stages.reduce((a,b)=>a+b.duration,0)/stages.length) : 0;
  const emoji = (s) => s>=9?"ð":s>=8?"ð":s>=7?"ð":"ð";

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
      <SectionHeader icon="ð" title="Stages Ãquipe de France" subtitle="Suivez vos entraÃ®nements avec l'Ã©lite nationale ð«ð·" color="#1D4ED8"
        action={<Btn onClick={openAdd} color="#fff" style={{ color:"#1D4ED8", fontSize:12 }}><Plus size={12}/> Nouveau stage</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[{l:"Stages totaux",v:stages.length,c:"#1D4ED8"},{l:"DurÃ©e moyenne",v:avgDur+" min",c:C.orange},{l:"Satisfaction moy.",v:avgSat+"/10",c:C.yellow}].map(s=>(
          <div key={s.l} style={{ background:C.card, borderRadius:12, padding:12, border:"1px solid "+C.border, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.muted }}>{s.l}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:C.orange }}>â  Corrections rÃ©centes Ã  travailler</div>
        {stages.filter(s=>s.corrections).slice(0,3).map(s=>(
          <div key={s.id} style={{ background:C.orange+"11", borderRadius:8, padding:"8px 12px", marginBottom:8, borderLeft:"3px solid "+C.orange }}>
            <div style={{ fontSize:11, color:C.orange, fontWeight:600, marginBottom:2 }}>{s.date}</div>
            <div style={{ fontSize:12 }}>{s.corrections}</div>
          </div>
        ))}
      </div>

      {stages.map(s=>(
        <div key={s.id} style={{ background:C.card, borderRadius:14, border:"2px solid #1D4ED833", padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16 }}>{emoji(s.satisfaction)}</span>
                <span style={{ fontWeight:700, fontSize:14 }}>Stage Ãquipe de France</span>
              </div>
              <div style={{ color:C.muted, fontSize:11 }}>{s.date}</div>
            </div>
            <div style={{ display:"flex", gap:5 }}>
              <button onClick={()=>openEdit(s)} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:2 }}><Edit2 size={13}/></button>
              <button onClick={()=>openCopy(s)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, fontSize:11 }}>â§</button>
              <button onClick={()=>handleDelete(s.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, padding:2 }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:8 }}>
            <span style={{ fontSize:12, color:C.muted }}>â± <strong style={{ color:C.text }}>{s.duration} min</strong></span>
            <span style={{ fontSize:12, color:C.muted }}>â­ <strong style={{ color:C.text }}>{s.satisfaction}/10</strong></span>
          </div>
          {s.katas && s.katas.length>0 && (
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:11, fontWeight:600, marginBottom:4, color:C.muted }}>Katas pratiquÃ©s :</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{s.katas.map(k=><Badge key={k} label={k} color="#1D4ED8"/>)}</div>
            </div>
          )}
          {s.focus && <div style={{ background:C.blue+"11", borderRadius:8, padding:"6px 10px", marginBottom:6, borderLeft:"3px solid "+C.blue }}><div style={{ fontSize:11, color:C.blue }}>ð¯ <strong>Focus :</strong> {s.focus}</div></div>}
          {s.corrections && <div style={{ background:C.orange+"15", borderRadius:8, padding:"6px 10px", marginBottom:6, borderLeft:"3px solid "+C.orange }}><div style={{ fontSize:11, color:C.orange }}>â  <strong>Corrections :</strong> {s.corrections}</div></div>}
          {s.retours && <div style={{ background:C.green+"15", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.green }}><div style={{ fontSize:11, color:C.green }}>ð¬ <strong>Retours :</strong> {s.retours}</div></div>}
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
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>DurÃ©e (min) *</label>
                  <input type="number" placeholder="240" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Satisfaction</label>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="range" min={1} max={10} value={form.satisfaction} onChange={e=>setForm(f=>({...f,satisfaction:parseInt(e.target.value)}))} style={{ flex:1, accentColor:"#1D4ED8" }}/>
                    <span style={{ fontWeight:800, color:"#1D4ED8", minWidth:30 }}>{form.satisfaction}/10</span>
                  </div>
                </div>
              </div>
              <MultiSelect label="Katas pratiquÃ©s" options={KATAS_LIST} selected={form.katas||[]}
                onAdd={v=>setForm(f=>({...f,katas:[...(f.katas||[]),v]}))}
                onRemove={v=>setForm(f=>({...f,katas:(f.katas||[]).filter(k=>k!==v)}))}
                color="#1D4ED8" />
              {[["Focus de la sÃ©ance","focus","Points travaillÃ©s, objectifs..."],["Corrections","corrections","Points Ã  corriger..."],["Retours de l'encadrement","retours","Feedback des coachs..."]].map(([l,k,p])=>(
                <div key={k} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                  <textarea rows={3} placeholder={p} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/>
                </div>
              ))}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:"#1D4ED8", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>ð¾ {editingId?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ PRÃPA PHYSIQUE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const PHYS_TYPES = ["Endurance","Force","ExplosivitÃ©","Vitesse","Technique","RÃ©cupÃ©ration","CompÃ©tition","HaltÃ©rophilie","PPG","Corps entier"];
const PHYS_COACHES = ["HelvÃ©tia","Romain","Olivier","Yves","Jonathan","Hugo","JÃ©rÃ©mie","Michel","Kevin","Autre"];
const INTENSITES = ["Faible","Moyenne","ÃlevÃ©e","Maximale"];
const STATUTS_PHYS = ["Ã venir","TerminÃ©e","Non rÃ©alisÃ©"];
const RESSENTIS_PHYS = ["ð Excellent","ð TrÃ¨s bon","ð Bon","ð Moyen","ð FatiguÃ©","ð© ÃpuisÃ©"];

const PrepaPhysique = () => {
  const [physique, setPhysique] = useState(mockPhysique);
  const [activeFilter, setActiveFilter] = useState("Toutes");
  const [showForm, setShowForm] = useState(false);
  const [editingPhys, setEditingPhys] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const EMPTY_PHYS = { date:new Date().toISOString().split("T")[0], type:"Endurance", duration:"", intensite:"Moyenne", statut:"TerminÃ©e", programme:"", coach:"", distance:"", calories:"", fcMoy:"", fcMax:"", ressenti:"ð Bon", notes:"" };
  const [form, setForm] = useState(EMPTY_PHYS);
  const TYPES_LABELS = ["Toutes","Semaine","ð Endurance","ðª Force","â¡ ExplosivitÃ©","ðï¸ HaltÃ©ro","ð¥ PPG","ð¥ Full Body","â¡ Vitesse","ð¯ Technique","ð§ RÃ©cup","ð CompÃ©t"];

  const openAdd = () => { setForm(EMPTY_PHYS); setEditingPhys(null); setShowForm(true); };
  const openEdit = (s) => { setForm({...s, duration: String(s.duration), distance: s.distance||"", calories: s.calories||"", fcMoy: s.fcMoy||"", fcMax: s.fcMax||""}); setEditingPhys(s.id); setShowForm(true); };
  const openCopy = (s) => { setForm({...s, date: new Date().toISOString().split("T")[0], duration: String(s.duration), distance: s.distance||"", calories: s.calories||"", fcMoy: s.fcMoy||"", fcMax: s.fcMax||""}); setEditingPhys(null); setShowForm(true); };
  const handleDelete = (id) => { if (!window.confirm("Supprimer ?")) return; setPhysique(prev=>prev.filter(p=>p.id!==id)); };
  const handleSave = () => {
    if (!form.date || !form.duration) return;
    const s = { ...form, duration: parseInt(form.duration) };
    if (editingPhys) { setPhysique(prev=>prev.map(p=>p.id===editingPhys?{...p,...s}:p)); }
    else { setPhysique(prev=>[{ id:Date.now(), ...s }, ...prev]); }
    setShowForm(false);
  };

  const SelectF = ({ label, value, options, onChange }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );

  const typeMap = { "ð Endurance":"Endurance","ðª Force":"Force","â¡ ExplosivitÃ©":"ExplosivitÃ©","ðï¸ HaltÃ©ro":"HaltÃ©rophilie","ð¥ PPG":"PPG","ð¥ Full Body":"Full Body","â¡ Vitesse":"Vitesse","ð¯ Technique":"Technique","ð§ RÃ©cup":"RÃ©cupÃ©ration","ð CompÃ©t":"CompÃ©tition" };

  const counts = {
    "Toutes": physique.length,
    "Semaine": physique.filter(s=>{ const d=new Date(s.date); const n=new Date(); const w=new Date(n); w.setDate(n.getDate()-n.getDay()); return d>=w; }).length,
    "ð Endurance": physique.filter(s=>s.type==="Endurance").length,
    "ðª Force": physique.filter(s=>s.type==="Force").length,
    "â¡ ExplosivitÃ©": physique.filter(s=>s.type==="ExplosivitÃ©").length,
    "ðï¸ HaltÃ©ro": physique.filter(s=>s.type==="HaltÃ©rophilie").length,
    "ð¥ PPG": physique.filter(s=>s.type==="PPG").length,
    "ð¥ Full Body": physique.filter(s=>s.type==="Full Body").length,
    "â¡ Vitesse": physique.filter(s=>s.type==="Vitesse").length,
    "ð¯ Technique": physique.filter(s=>s.type==="Technique").length,
    "ð§ RÃ©cup": physique.filter(s=>s.type==="RÃ©cupÃ©ration").length,
    "ð CompÃ©t": physique.filter(s=>s.type==="CompÃ©tition").length,
  };

  const filtered = physique.filter(s => {
    if (activeFilter === "Toutes") return true;
    if (activeFilter === "Semaine") { const d=new Date(s.date); const n=new Date(); const w=new Date(n); w.setDate(n.getDate()-n.getDay()); return d>=w; }
    return !typeMap[activeFilter] || s.type === typeMap[activeFilter];
  });

  const avgDurPhys = physique.length ? Math.round(physique.reduce((a,b)=>a+b.duration,0)/physique.length) : 0;

  const typeColor = (t) => ({ "PPG":C.red,"Full Body":C.red,"HaltÃ©rophilie":C.blue,"Endurance":C.green,"ExplosivitÃ©":C.orange,"Technique":C.primary,"CompÃ©tition":C.yellow,"Vitesse":C.accent }[t] || C.primary);

  return (
    <div>
      <SectionHeader icon="ðª" title="PrÃ©paration Physique" subtitle="Suivez toutes vos sÃ©ances de prÃ©paration physique" color={C.blue}
        action={<Btn onClick={openAdd} color="#fff" style={{ color:C.blue, fontSize:12 }}><Plus size={12}/> Nouvelle sÃ©ance</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
        {[{l:"SÃ©ances totales",v:physique.length,c:C.blue},{l:"DurÃ©e moyenne",v:avgDurPhys+" min",c:C.orange},{l:"Cette semaine",v:counts["Semaine"],c:C.green}].map(s=>(
          <div key={s.l} style={{ background:C.card, borderRadius:12, padding:12, border:"1px solid "+C.border, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.muted }}>{s.l}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {TYPES_LABELS.map(f=><FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} count={counts[f]} />)}
      </div>

      <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>{filtered.length} sÃ©ance{filtered.length>1?"s":""}</div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Dumbbell size={24}/>} title="Aucune sÃ©ance cette semaine" sub="Les sÃ©ances de cette semaine apparaÃ®tront ici" action={{ label:"CrÃ©er une sÃ©ance", fn:()=>setShowForm(true) }} />
      ) : filtered.map(s=>(
        <div key={s.id} style={{ background:C.card, borderRadius:14, border:"2px solid "+typeColor(s.type)+"33", padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div style={{ cursor:"pointer", flex:1 }} onClick={()=>setExpandedId(expandedId===s.id?null:s.id)}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Badge label={s.type} color={typeColor(s.type)}/>
                {s.subType && s.subType!==s.type && <span style={{ fontSize:11, color:C.muted }}>{s.subType}</span>}
                {s.programme && <span style={{ fontSize:11, color:C.muted }}>{s.programme}</span>}
              </div>
              <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{s.date}{s.coach?" Â· "+s.coach:""}</div>
            </div>
            <div style={{ display:"flex", gap:5, flexShrink:0 }}>
              <button onClick={()=>openEdit(s)} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:2 }}><Edit2 size={13}/></button>
              <button onClick={()=>openCopy(s)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, fontSize:11 }}>â§</button>
              <button onClick={()=>handleDelete(s.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, padding:2 }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:s.notes?8:0, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:C.muted }}>â± <strong style={{ color:C.text }}>{s.duration} min</strong></span>
            {s.distance && <span style={{ fontSize:12, color:C.muted }}>ð <strong style={{ color:C.text }}>{s.distance}</strong></span>}
            {s.intensite && <span style={{ fontSize:12, color:C.muted }}>â¡ <strong style={{ color:C.text }}>{s.intensite}</strong></span>}
            {s.satisfaction && <span style={{ fontSize:12, color:C.muted }}>â­ <strong style={{ color:C.text }}>{s.satisfaction}/10</strong></span>}
          </div>
          {s.notes && <div style={{ background:typeColor(s.type)+"15", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+typeColor(s.type) }}>
            <div style={{ fontSize:11, color:typeColor(s.type) }}>{s.notes}</div>
          </div>}
          {expandedId===s.id && (
            <div style={{ marginTop:10, borderTop:"1px solid "+C.border, paddingTop:10, fontSize:12, color:C.muted, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {s.satisfaction && <span>â­ Satisfaction: <strong style={{color:C.text}}>{s.satisfaction}/10</strong></span>}
              {s.coach && <span>ð¤ Coach: <strong style={{color:C.text}}>{s.coach}</strong></span>}
              {s.programme && s.programme!==s.type && <span style={{gridColumn:"span 2"}}>ð Programme: <strong style={{color:C.text}}>{s.programme}</strong></span>}
              {s.ressenti && <span>ð Ressenti: <strong style={{color:C.text}}>{s.ressenti}</strong></span>}
              {s.statut && <span>ð Statut: <strong style={{color:C.text}}>{s.statut}</strong></span>}
              {s.fcMoy && <span>â¤ï¸ FC moy: <strong style={{color:C.text}}>{s.fcMoy} bpm</strong></span>}
              {s.fcMax && <span>â¤ï¸ FC max: <strong style={{color:C.text}}>{s.fcMax} bpm</strong></span>}
              {s.calories && <span>ð¥ Calories: <strong style={{color:C.text}}>{s.calories}</strong></span>}
              {s.subType && s.subType!==s.type && <span>ð·ï¸ Sous-type: <strong style={{color:C.text}}>{s.subType}</strong></span>}
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.blue+", "+C.primary+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Nouvelle sÃ©ance</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <SelectF label="Type *" value={form.type} options={PHYS_TYPES} onChange={v=>setForm(f=>({...f,type:v}))} />
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>DurÃ©e (min) *</label>
                  <input type="number" placeholder="60" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <SelectF label="IntensitÃ©" value={form.intensite} options={INTENSITES} onChange={v=>setForm(f=>({...f,intensite:v}))} />
                <SelectF label="Statut *" value={form.statut} options={STATUTS_PHYS} onChange={v=>setForm(f=>({...f,statut:v}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Nom du programme</label>
                  <input type="text" placeholder="Ex: Programme Semaine 1" value={form.programme} onChange={e=>setForm(f=>({...f,programme:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <SelectF label="Coach / PrÃ©parateur" value={form.coach} options={["SÃ©lectionner...",...PHYS_COACHES]} onChange={v=>setForm(f=>({...f,coach:v}))} />
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
                <button onClick={handleSave} style={{ background:C.blue, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>ð¾ {editingPhys?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ COMPÃTITIONS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const COMP_COACHES = ["HelvÃ©tia","Romain","Olivier","Yves","Jonathan","Hugo","JÃ©rÃ©mie","Michel","Autre"];
const TOUR_NOMS = ["1er tour","2Ã¨me tour","3Ã¨me tour","HuitiÃ¨me de Finale","Quart de Finale","Demi Finale","Finale","Finale de Bronze","1er tour de repÃªchage","2Ã¨me tour de repÃªchage"];
const FLAG_SCORES = ["5-0","4-1","3-2","2-3","1-4","0-5","7-0","6-1","5-2","4-3","3-4","2-5","1-6","0-7"];

const RESULT_COLOR = (r) => {
  if (!r) return C.muted;
  if (r.includes("Or")) return C.yellow;
  if (r.includes("Argent")) return "#94A3B8";
  if (r.includes("Bronze")) return "#CD7F32";
  if (r.includes("DÃ©faite") || r.includes("Perdu")) return C.red;
  return C.orange;
};

const EMPTY_COMP = { nom:"", date:"", lieu:"", statut:"Ã venir", coach:"", resultat:"", recordPerso:false, tours:[], lienVideo:"", notes:"" };
const EMPTY_TOUR = { nom:"1er tour", kata:"GojÅ«shiho ShÅ", scoreType:"Drapeaux", score:"5-0", ok:true, note:"" };

const Competitions = ({ competitions, setCompetitions }) => {
  const allMonths = [...new Set(competitions.map(c => {
    const d = new Date(c.date);
    return d.toLocaleDateString("fr-FR", { month:"long", year:"numeric" });
  }))];
  const [activeMois, setActiveMois] = useState(allMonths[0] || "");
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
      setCompetitions(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
      // Sync lienVideo dans Firestore si prÃ©sent
      if (form.lienVideo) {
        try {
          const videoId = "comp_" + editId;
          const q = query(collection(db, "video_links"), where("videoId", "==", videoId));
          const snap = await getDocs(q);
          if (snap.empty) await addDoc(collection(db, "video_links"), { videoId, lien: form.lienVideo, updatedAt: serverTimestamp() });
          else await updateDoc(doc(db, "video_links", snap.docs[0].id), { lien: form.lienVideo, updatedAt: serverTimestamp() });
        } catch(e) { console.error("Erreur sync vidÃ©o compÃ©t:", e); }
      }
    } else {
      const newId = Date.now();
      setCompetitions(prev => [{ id: newId, ...form, hasVideo: !!form.lienVideo }, ...prev]);
      // Sync lienVideo dans Firestore si prÃ©sent
      if (form.lienVideo) {
        try {
          await addDoc(collection(db, "video_links"), { videoId: "comp_" + newId, lien: form.lienVideo, updatedAt: serverTimestamp() });
        } catch(e) { console.error("Erreur sync vidÃ©o compÃ©t:", e); }
      }
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer cette compÃ©tition ?")) return;
    setCompetitions(prev => prev.filter(c => c.id !== id));
  };

  const filteredComps = competitions.filter(c => {
    const d = new Date(c.date);
    const mois = d.toLocaleDateString("fr-FR", { month:"long", year:"numeric" });
    return mois === activeMois;
  });

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
      <SectionHeader icon="ð" title="CompÃ©titions" subtitle="Suivez vos performances et rÃ©sultats ð¥" color={C.orange}
        action={<Btn onClick={openAdd} color="#fff" style={{ color:C.orange, fontSize:12 }}><Plus size={12}/> Nouvelle compÃ©tition</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
        {[{l:"CompÃ©titions",v:competitions.length,c:C.orange},{l:"Victoires",v:competitions.filter(c=>c.result?.includes("Or")||c.result?.includes("1er")).length,c:C.yellow},{l:"Avec vidÃ©o",v:competitions.filter(c=>c.lienVideo||c.hasVideo).length,c:C.primary}].map(s=>(
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

      {filteredComps.length === 0 && <EmptyState icon={<Trophy size={24}/>} title="Aucune compÃ©tition ce mois" sub="Essayez un autre mois" action={{ label:"Ajouter", fn:openAdd }}/>}

      {filteredComps.map(c=>(
        <div key={c.id} style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
            <div style={{ fontWeight:700, fontSize:15, flex:1, marginRight:8 }}>{c.name || c.nom}</div>
            <div style={{ display:"flex", gap:5, flexShrink:0 }}>
              {(c.lienVideo || c.hasVideo) && (
                <button onClick={()=>c.lienVideo&&window.open(c.lienVideo,"_blank")} style={{ background:C.primary+"22", border:"1px solid "+C.primary+"44", borderRadius:8, padding:"4px 8px", fontSize:11, color:C.primary, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <Video size={12}/> VidÃ©o
                </button>
              )}
              <button onClick={()=>openEdit(c)} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:2 }}><Edit2 size={13}/></button>
              <button onClick={()=>openCopy(c)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, fontSize:11 }}>â§</button>
              <button onClick={()=>handleDelete(c.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, padding:2 }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>ð {c.date} Â· ð {c.lieu} Â· ð¤ {c.coach}</div>
          {(c.result||c.resultat) && (
            <div style={{ background:RESULT_COLOR(c.result||c.resultat)+"22", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+RESULT_COLOR(c.result||c.resultat), marginBottom:12 }}>
              <span style={{ color:RESULT_COLOR(c.result||c.resultat), fontWeight:700, fontSize:13 }}>ð RÃ©sultat : {c.result||c.resultat}</span>
            </div>
          )}
          {c.tours && c.tours.length > 0 && (
            <>
              <div style={{ fontWeight:600, fontSize:12, marginBottom:8, color:C.muted }}>Tours de la compÃ©tition :</div>
              {c.tours.map((t,i)=>(
                <div key={i} style={{ background:C.bg, borderRadius:10, padding:"10px 12px", marginBottom:8, display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                      <Badge label={"Tour "+t.num} color={C.orange}/><span style={{ fontWeight:600, fontSize:13 }}>{t.name||t.nom}</span>
                    </div>
                    <div style={{ fontSize:12, color:C.muted }}>Kata: <strong style={{ color:C.text }}>{t.kata}</strong> Â· Score: <strong style={{ color:C.text }}>{t.score}</strong></div>
                    {t.note && <div style={{ fontSize:11, color:C.muted, marginTop:2, fontStyle:"italic" }}>{t.note}</div>}
                  </div>
                  {t.ok ? <CheckCircle2 color={C.green} size={18}/> : <XCircle color={C.red} size={18}/>}
                </div>
              ))}
            </>
          )}
          {(c.notes||c.note) && (
            <div style={{ background:C.primary+"11", borderRadius:8, padding:"6px 10px", borderLeft:"3px solid "+C.primary, marginTop:6 }}>
              <div style={{ fontSize:11, color:C.primary }}>ð {c.notes||c.note}</div>
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.orange+", "+C.yellow+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>{editId ? "Modifier" : "Nouvelle"} compÃ©tition</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Nom de la compÃ©tition *</label>
                <input type="text" value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Lieu</label>
                  <input type="text" value={form.lieu} onChange={e=>setForm(f=>({...f,lieu:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <CompSF label="Statut" value={form.statut} options={["Ã venir","TerminÃ©e","AnnulÃ©e"]} onChange={v=>setForm(f=>({...f,statut:v}))} />
                <CompSF label="Coach" value={form.coach} options={["SÃ©lectionner...", ...COMP_COACHES]} onChange={v=>setForm(f=>({...f,coach:v}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>RÃ©sultat</label>
                  <input type="text" placeholder="MÃ©daille d'or..." value={form.resultat} onChange={e=>setForm(f=>({...f,resultat:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:22 }}>
                  <input type="checkbox" checked={form.recordPerso} onChange={e=>setForm(f=>({...f,recordPerso:e.target.checked}))} style={{ width:16, height:16 }}/>
                  <label style={{ fontSize:13 }}>Record personnel</label>
                </div>
              </div>

              {/* Tours */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Tours de la compÃ©tition</div>
                {form.tours.map((t,i)=>(
                  <div key={i} style={{ background:C.bg, borderRadius:10, padding:"10px 12px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12 }}>
                    <span>Tour {t.num} Â· <strong>{t.nom}</strong> Â· {t.kata} Â· <strong>{t.score}</strong> Â· {t.ok?"â":"â"}</span>
                    <button onClick={()=>removeTour(i)} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:16 }}>Ã</button>
                  </div>
                ))}
                <div style={{ background:C.bg, borderRadius:10, padding:14, border:"1px dashed "+C.border }}>
                  <div style={{ fontWeight:600, fontSize:12, marginBottom:10, color:C.orange }}>+ Ajouter un tour</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                    <CompSF label="Nom du tour" value={newTour.nom} options={TOUR_NOMS} onChange={v=>setNewTour(t=>({...t,nom:v}))} />
                    <CompSF label="Kata" value={newTour.kata} options={KATAS_LIST} onChange={v=>setNewTour(t=>({...t,kata:v}))} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                    <CompSF label="Type de score" value={newTour.scoreType} options={["Drapeaux","ChiffrÃ©"]} onChange={v=>setNewTour(t=>({...t,scoreType:v,score:v==="Drapeaux"?"5-0":""}))} />
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
                    <label style={{ fontSize:13 }}>QualifiÃ© / Victoire</label>
                  </div>
                  <button onClick={addTour} style={{ background:C.orange+"22", border:"1px solid "+C.orange, borderRadius:8, padding:"8px 16px", fontSize:12, color:C.orange, cursor:"pointer", fontWeight:600 }}>+ Ajouter ce tour</button>
                </div>
              </div>

              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>ð¬ Lien vidÃ©o (Google Drive, YouTubeâ¦)</label>
                <input type="text" placeholder="https://..." value={form.lienVideo} onChange={e=>setForm(f=>({...f,lienVideo:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Notes</label>
                <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:C.orange, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>ð¾ {editId?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ CORRECTIONS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const CORR_COACHES = ["HelvÃ©tia","Romain","Olivier","Yves","Jonathan","Hugo","JÃ©rÃ©mie","Michel","Fernando","Perso","Autre"];
const CORR_CATEGORIES = ["Technique","Position","Rythme","KimÃ©","Autre"];

const Corrections = ({ sessions }) => {
  const [activeFilter, setActiveFilter] = useState("Toutes");
  const [showForm, setShowForm] = useState(false);
  const [editingCorr, setEditingCorr] = useState(null);
  const [form, setForm] = useState({ kata:"", entraineur:"", date:"", categorie:"Technique", commentaires:"", coachFeedback:"" });

  const sessionCorrs = sessions.filter(s=>s.notes&&s.notes.length>0).map((s,i)=>({
    id:1000+i, date:s.date, trainer:s.coach||"EntraÃ®neur", kata:s.katas?.[0]||"", content:s.notes
  }));

  const [extraCorrs, setExtraCorrs] = useState([]);
  const allCorrections = [...mockCorrections, ...sessionCorrs, ...extraCorrs];

  const openEdit = (c) => {
    setEditingCorr(c.id);
    setForm({ kata:c.kata||"", entraineur:c.trainer||"", date:c.date||"", categorie:c.categorie||"Technique", commentaires:c.content||"", coachFeedback:"" });
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
        <div style={{ fontSize:12, color:C.text }}>{c.content}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <button onClick={()=>openEdit(c)} style={{ background:"none", border:"none", cursor:"pointer", color:C.primary, padding:2 }}><Edit2 size={12}/></button>
        <button onClick={()=>openCopy(c)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:2, fontSize:11 }}>â§</button>
      </div>
    </div>
  ));

  const renderGrouped = (groupFn, labelFn) => {
    const groups = {};
    allCorrections.forEach(c => { const k = groupFn(c); if (!groups[k]) groups[k]=[]; groups[k].push(c); });
    return Object.entries(groups).sort((a,b)=>b[0].localeCompare(a[0])).map(([key,list])=>(
      <div key={key} style={{ marginBottom:20 }}>
        <div style={{ background:C.orange+"22", borderRadius:8, padding:"6px 12px", marginBottom:10, fontWeight:700, fontSize:12, color:C.orange, border:"1px solid "+C.orange+"44" }}>{labelFn(key, list)}</div>
        {renderList(list)}
      </div>
    ));
  };

  return (
    <div>
      <SectionHeader icon="â±" title="Corrections" subtitle="Points techniques Ã  travailler" color={C.orange}
        action={<Btn onClick={()=>{setEditingCorr(null);setForm({kata:"",entraineur:"",date:new Date().toISOString().split("T")[0],categorie:"Technique",commentaires:"",coachFeedback:""});setShowForm(true);}} color="#fff" style={{ color:C.orange, fontSize:12 }}><Plus size={12}/> Nouvelle correction</Btn>} />
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {["Toutes","Par semaine","Par entraÃ®neur","Par kata"].map(f=><FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} />)}
      </div>
      <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>{allCorrections.length} corrections</div>

      {activeFilter === "Toutes" && renderList(allCorrections)}
      {activeFilter === "Par semaine" && renderGrouped(
        c => getWeekKey(c.date),
        (key, list) => { const d = new Date(key); const end = new Date(d); end.setDate(d.getDate()+6); return `Semaine du ${d.toLocaleDateString("fr-FR")} au ${end.toLocaleDateString("fr-FR")} (${list.length})`; }
      )}
      {activeFilter === "Par entraÃ®neur" && renderGrouped(
        c => c.trainer || "Non renseignÃ©",
        (key, list) => `${key} â ${list.length} correction${list.length>1?"s":""}`
      )}
      {activeFilter === "Par kata" && renderGrouped(
        c => c.kata || "Non renseignÃ©",
        (key, list) => `${key} â ${list.length} correction${list.length>1?"s":""}`
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
                    <option>SÃ©lectionner un kata</option>
                    {KATAS_LIST.map(k=><option key={k}>{k}</option>)}
                  </select></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>EntraÃ®neur *</label>
                  <select value={form.entraineur} onChange={e=>setForm(f=>({...f,entraineur:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    <option>SÃ©lectionner un entraÃ®neur</option>
                    {CORR_COACHES.map(c=><option key={c}>{c}</option>)}
                  </select></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>CatÃ©gorie</label>
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
                <button onClick={handleSave} style={{ background:C.orange, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>ð¾ Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ VIDÃOS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const VIDEOS_CATEGORIES = ["Kata","CompÃ©tition","EntraÃ®nement","Technique","Autre"];
const mockVideos = {
  "ð CompÃ©titions": [
    { id:1, titre:"9 mai 2026 â Championnat de France Ãquipe SÃ©nior", date:"2026-05-09", cat:"CompÃ©t." },
    { id:2, titre:"12 avr. 2026 â Championnat de France Ãquipe", date:"2026-04-12", cat:"CompÃ©t." },
    { id:3, titre:"11 avr. 2026 â Championnat de France Indiv", date:"2026-04-11", cat:"CompÃ©t." },
    { id:4, titre:"8 mars 2026 â Liga Nacional 2026", date:"2026-03-08", cat:"CompÃ©t." },
    { id:5, titre:"17 janv. 2026 â Milon Cup Junior", date:"2026-01-17", cat:"CompÃ©t." },
    { id:6, titre:"17 janv. 2026 â Milon Cup SÃ©nior", date:"2026-01-17", cat:"CompÃ©t." },
    { id:7, titre:"9 nov. 2025 â Championnat DÃ©partemental", date:"2025-11-09", cat:"CompÃ©t." },
    { id:8, titre:"5 oct. 2025 â Liga Nacional", date:"2025-10-05", cat:"CompÃ©t." },
    { id:9, titre:"26 sept. 2025 â Lion Cup", date:"2025-09-26", cat:"CompÃ©t." },
  ],
  "ðª Cours Persos": [
    { id:10, titre:"17 mai 2026 â GojÅ«shiho Dai, Supaenpei", date:"2026-05-17", cat:"Perso" },
    { id:11, titre:"13 mai 2026 â GojÅ«shiho Dai", date:"2026-05-13", cat:"Perso" },
    { id:12, titre:"12 mai 2026 â Supaenpei", date:"2026-05-12", cat:"Perso" },
    { id:13, titre:"6 mai 2026 â Unsu, GojÅ«shiho ShÅ, GojÅ«shiho Dai", date:"2026-05-06", cat:"Perso" },
    { id:14, titre:"30 avr. 2026 â Sansai", date:"2026-04-30", cat:"Perso" },
    { id:15, titre:"28 avr. 2026 â Supaenpei", date:"2026-04-28", cat:"Perso" },
    { id:16, titre:"25 avr. 2026 â Gankaku", date:"2026-04-25", cat:"Perso" },
    { id:17, titre:"21 avr. 2026 â GojÅ«shiho ShÅ", date:"2026-04-21", cat:"Perso" },
    { id:18, titre:"18 avr. 2026 â Unsu", date:"2026-04-18", cat:"Perso" },
    { id:19, titre:"16 avr. 2026 â GojÅ«shiho Dai", date:"2026-04-16", cat:"Perso" },
  ],
};

const Videos = ({ competitions, sessions }) => {
  const [showForm, setShowForm] = useState(false);
  const [extraVideos, setExtraVideos] = useState([]);
  const [form, setForm] = useState({ titre:"", categorie:"Kata", date:"", lien:"", description:"" });
  const [editLinkId, setEditLinkId] = useState(null);
  const [linkInput, setLinkInput] = useState("");
  // Liens stockÃ©s dans Firestore (partagÃ©s entre tous les utilisateurs)
  const [videoLinks, setVideoLinks] = useState({});

  useEffect(() => {
    // Charger localStorage en base (liens existants)
    let localLinks = {};
    try { localLinks = JSON.parse(localStorage.getItem("kp_video_links")||"{}"); } catch {}
    // Puis fusionner avec Firestore (liens partagÃ©s entre utilisateurs)
    getDocs(collection(db, "video_links")).then(snap => {
      const links = { ...localLinks };
      snap.docs.forEach(d => { if (d.data().videoId && d.data().lien) links[d.data().videoId] = d.data().lien; });
      setVideoLinks(links);
    }).catch(() => {
      setVideoLinks(localLinks);
    });
  }, []);

  // Toutes les sÃ©ances Perso â lien depuis la sÃ©ance OU depuis videoLinks local
  const persoVideos = (sessions || [])
    .filter(s => s.type === "Perso")
    .sort((a,b) => b.date.localeCompare(a.date))
    .map(s => ({
      id: "perso_"+s.id,
      titre: new Date(s.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})
             + " â " + (s.katas&&s.katas.length ? s.katas.join(", ") : "SÃ©ance perso"),
      date: s.date, cat: "Perso",
      lien: s.lienVideo || videoLinks["perso_"+s.id] || null,
    }));

  // Toutes les compÃ©titions â lien depuis la compÃ©t OU depuis videoLinks local
  const compVideos = (competitions || [])
    .sort((a,b) => b.date.localeCompare(a.date))
    .map(c => ({
      id: "comp_"+c.id,
      titre: new Date(c.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})
             + " â " + (c.name||c.nom||"CompÃ©tition"),
      date: c.date, cat: "CompÃ©t.",
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

  const PERSO_VIDEOS = [...persoVideos, ...extraVideos.filter(v=>v.cat!=="CompÃ©t.")];

  const renderGrid = (videos) => (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
      {videos.map(v=>(
        <div key={v.id} onClick={()=>openVideo(v)} style={{ background:"#1a1a2e", borderRadius:12, overflow:"hidden", cursor: (v.lien||v.url) ? "pointer" : "default", opacity:(v.lien||v.url)?1:0.7 }}>
          <div style={{ height:90, display:"flex", alignItems:"center", justifyContent:"center", color: (v.lien||v.url) ? "#ffffff88" : "#ffffff33", position:"relative" }}>
            <Video size={28}/>
            {(v.lien||v.url) && <div style={{ position:"absolute", bottom:6, right:6, background:"#ffffff22", borderRadius:4, padding:"2px 6px", fontSize:9, color:"#fff" }}>â¶ Ouvrir</div>}
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
      <SectionHeader icon="ð¬" title="VidÃ©os" subtitle="BibliothÃ¨que de vidÃ©os d'entraÃ®nement" color="#DC2626"
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:"#DC2626", fontSize:12 }}><Plus size={12}/> Ajouter une vidÃ©o</Btn>} />

      {[["ð CompÃ©titions", compVideos], ["ðª Cours Persos", PERSO_VIDEOS]].map(([section, videos])=>(
        <div key={section} style={{ marginBottom:24 }}>
          <div style={{ background:C.yellow+"22", borderRadius:12, padding:"12px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center", border:"1px solid "+C.yellow+"44" }}>
            <span style={{ fontWeight:700, fontSize:14, color:C.orange }}>{section}</span>
            <span style={{ background:C.yellow+"44", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{videos.length}</span>
          </div>
          {videos.length > 0 ? renderGrid(videos) : (
            <div style={{ background:C.bg, borderRadius:10, padding:"14px 16px", border:"1px dashed "+C.border }}>
              <div style={{ color:C.muted, fontSize:12 }}>Aucune vidÃ©o pour l'instant.</div>
              <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>
                {section.includes("CompÃ©t") ? "â Ajoutez un lien vidÃ©o dans la fiche d'une compÃ©tition (onglet CompÃ©titions)." : "â Ajoutez un lien vidÃ©o dans la fiche d'une sÃ©ance Perso (onglet SÃ©ances KaratÃ©)."}
              </div>
            </div>
          )}
        </div>
      ))}

      {editLinkId && (
        <div style={{ position:"fixed", inset:0, background:"#00000099", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={()=>setEditLinkId(null)}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:6 }}>ð Lien vidÃ©o</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Colle le lien Google Drive ou YouTube.<br/>Tu peux aussi l'ajouter directement dans la fiche sÃ©ance ou compÃ©tition.</div>
            <input autoFocus type="url" placeholder="https://drive.google.com/..." value={linkInput} onChange={e=>setLinkInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&saveVideoLink()}
              style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:13, boxSizing:"border-box", marginBottom:14 }}/>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setEditLinkId(null)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer" }}>Annuler</button>
              <button onClick={saveVideoLink} style={{ background:"#DC2626", border:"none", borderRadius:8, padding:"8px 20px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>Ouvrir â¶</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"85vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, #DC2626, #F97316)", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Nouvelle vidÃ©o</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Titre *</label>
                <input type="text" value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>CatÃ©gorie</label>
                  <select value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {VIDEOS_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>ð Lien vidÃ©o (Google Drive, YouTubeâ¦)</label>
                <input type="text" placeholder="https://..." value={form.lien} onChange={e=>setForm(f=>({...f,lien:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Description</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:"#DC2626", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>ð¾ Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ NUTRITION ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const MEAL_TYPES = ["Petit dÃ©jeuner","DÃ©jeuner","DÃ®ner","Collation"];

const Nutrition = () => {
  const [showRepas, setShowRepas] = useState(false);
  const [showPesee, setShowPesee] = useState(false);
  const [formRepas, setFormRepas] = useState({ date:new Date().toISOString().split("T")[0], type:"DÃ©jeuner", description:"", calories:"", proteines:"", glucides:"", lipides:"", hydratation:"" });
  const [formPesee, setFormPesee] = useState({ date:new Date().toISOString().split("T")[0], poids:"" });

  return (
    <div>
      <SectionHeader icon="ð¥" title="Nutrition" subtitle="Suivez votre alimentation et hydratation" color={C.green}
        action={<div style={{ display:"flex", gap:8 }}>
          <Btn onClick={()=>setShowPesee(true)} color="#fff" style={{ color:C.green, fontSize:12 }}>â Ajouter pesÃ©e</Btn>
          <Btn onClick={()=>setShowRepas(true)} color="#fff" style={{ color:C.green, fontSize:12 }}><Plus size={12}/> Ajouter un repas</Btn>
        </div>} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16 }}>
          <div style={{ fontWeight:600, marginBottom:10, fontSize:13 }}>RÃ©sumÃ© du jour</div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid "+C.border }}>
            <span style={{ fontSize:12 }}>Calories</span><strong style={{ color:C.red }}>0</strong>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0" }}>
            <span style={{ fontSize:12 }}>ð§ Hydratation</span><strong style={{ color:C.blue }}>0.0 L</strong>
          </div>
        </div>
        <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16 }}>
          <div style={{ fontWeight:600, marginBottom:10, fontSize:13 }}>RÃ©partition des macros</div>
          <div style={{ color:C.muted, fontSize:12, textAlign:"center", paddingTop:10 }}>Aucune donnÃ©e pour aujourd'hui</div>
        </div>
        <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16 }}>
          <div style={{ fontWeight:600, marginBottom:10, fontSize:13 }}>â Poids actuel</div>
          <div style={{ fontSize:28, fontWeight:800, color:C.primary, textAlign:"center" }}>54.2 kg</div>
          <div style={{ fontSize:11, color:C.green, textAlign:"center" }}>â -0.1 kg</div>
        </div>
      </div>
      <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16 }}>
        <div style={{ fontWeight:600, marginBottom:10, fontSize:13 }}>Historique des repas</div>
        <div style={{ color:C.muted, fontSize:12, textAlign:"center", padding:20 }}>Aucun repas enregistrÃ©</div>
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
                {[["Calories","calories"],["ProtÃ©ines (g)","proteines"],["Glucides (g)","glucides"],["Lipides (g)","lipides"]].map(([l,k])=>(
                  <div key={k}><label style={{ fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                    <input type="number" value={formRepas[k]} onChange={e=>setFormRepas(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                ))}
              </div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Hydratation (litres)</label>
                <input type="number" step="0.1" value={formRepas.hydratation} onChange={e=>setFormRepas(f=>({...f,hydratation:e.target.value}))} style={{ width:"50%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setShowRepas(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={()=>setShowRepas(false)} style={{ background:C.green, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>ð¾ Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPesee && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setShowPesee(false)}>
          <div style={{ background:"#fff", borderRadius:20, padding:28, width:340 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:20 }}>â Ajouter une pesÃ©e</div>
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

// âââ SOMMEIL ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const QUALITE_SOMMEIL = ["ð´ Excellent","ð Bon","ð Moyen","ð Mauvais","ð« TrÃ¨s mauvais"];
const RESSENTI_REVEIL = ["ð TrÃ¨s reposÃ©","â¨ ReposÃ©","ð Correct","ð´ FatiguÃ©","ð© ÃpuisÃ©"];

const Sommeil = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date:"", coucher:"", reveil:"", heures:"", qualite:"ð Bon", reveils:"0", ressentiReveil:"â¨ ReposÃ©", sommeilProfond:false, facteurs:"", reves:"", notes:"" });

  return (
    <div>
      <SectionHeader icon="ð" title="Suivi du Sommeil" subtitle="Optimisez votre rÃ©cupÃ©ration et vos performances ð´" color={C.primary}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Ajouter une nuit</Btn>} />
      <EmptyState icon={<Moon size={24}/>} title="Aucune nuit enregistrÃ©e" sub="Commencez Ã  suivre votre sommeil pour optimiser votre rÃ©cupÃ©ration"
        action={{ label:"Enregistrer ma premiÃ¨re nuit", fn:()=>setShowForm(true) }} />

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"92vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, #4C1D95, "+C.primary+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>ð Nouvelle nuit de sommeil</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                {[["Date *","date","date"],["Heure de coucher","coucher","time"],["Heure de rÃ©veil","reveil","time"],["Heures de sommeil *","heures","number"]].map(([l,k,t])=>(
                  <div key={k}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                    <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>QualitÃ© du sommeil</label>
                  <select value={form.qualite} onChange={e=>setForm(f=>({...f,qualite:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {QUALITE_SOMMEIL.map(q=><option key={q}>{q}</option>)}
                  </select></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>RÃ©veils nocturnes</label>
                  <input type="number" min="0" value={form.reveils} onChange={e=>setForm(f=>({...f,reveils:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
                <div><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Ressenti au rÃ©veil</label>
                  <select value={form.ressentiReveil} onChange={e=>setForm(f=>({...f,ressentiReveil:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, background:"#fff" }}>
                    {RESSENTI_REVEIL.map(r=><option key={r}>{r}</option>)}
                  </select></div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <input type="checkbox" checked={form.sommeilProfond} onChange={e=>setForm(f=>({...f,sommeilProfond:e.target.checked}))} style={{ width:16, height:16 }}/>
                <label style={{ fontSize:13 }}>Sensation de sommeil profond et rÃ©parateur ð¤</label>
              </div>
              {[["Facteurs ayant influencÃ© le sommeil","facteurs"],["RÃªves / Cauchemars","reves"],["Notes","notes"]].map(([l,k])=>(
                <div key={k} style={{ marginBottom:14 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                  <textarea rows={2} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              ))}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:C.primary, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>ð¾ {editingPlan?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ CHAT âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
      const senderName = (authUser?.displayName?.split(" ")[0]) || authUser?.email?.split("@")[0] || "Ãquipe";
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
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 130px)" }}>
      <div style={{ background:"linear-gradient(135deg, "+C.blue+" 60%, "+C.primary+")", borderRadius:14, padding:"16px 18px", color:"#fff", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
        <MessageCircle size={20}/><div><div style={{ fontWeight:800, fontSize:16 }}>Chat Ãquipe</div><div style={{ fontSize:11, opacity:0.8 }}>{messages.length} message{messages.length!==1?"s":""}</div></div>
      </div>

      <div style={{ flex:1, background:C.card, borderRadius:14, border:"1px solid "+C.border, marginBottom:10, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
        {messages.length === 0 && (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:13 }}>
            Aucun message â soyez le premier Ã  Ã©crire ð
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
          placeholder="Ãcrivez votre message..."
          style={{ flex:1, border:"none", outline:"none", fontSize:14, background:"transparent" }} />
        <button style={{ background:C.primary, border:"none", borderRadius:8, padding:"8px 12px", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center" }}
          onClick={send}><Send size={15}/></button>
      </div>
    </div>
  );
};

// âââ ÃQUIPE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const ROLES = ["AthlÃ¨te","Coach","PrÃ©parateur physique","PrÃ©parateur mental","Parent"];
const ROLE_EMOJI = { "AthlÃ¨te":"ð¥","Coach":"ð","PrÃ©parateur physique":"ðª","PrÃ©parateur mental":"ð§ ","Parent":"ð¨âð©âð§" };

const MEMBERS_DEFAULT = [
  { firestoreId:"default_iliana",    prenom:"Iliana",    nom:"Voratovic", role:"AthlÃ¨te",  email:"ilianavoratovic@gmail.com",     telephone:"06 36 49 01 70" },
  { firestoreId:"default_isabelle",  prenom:"Isabelle",  nom:"Voratovic", role:"Parent",   email:"isaphoenix@hotmail.fr",         telephone:"06 10 03 68 28" },
  { firestoreId:"default_alexandre", prenom:"Alexandre", nom:"Voratovic", role:"Parent",   email:"a.voratovic@isipatrimoine.com", telephone:"07 77 05 93 23" },
  { firestoreId:"default_helvetia",  prenom:"HelvÃ©tia",  nom:"Taily",     role:"Coach",    email:"helvetiataily@gmail.com",       telephone:"07 67 64 20 15" },
];

const EMPTY_FORM = { prenom:"", nom:"", role:"AthlÃ¨te", email:"", telephone:"" };

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
    // Ajouter Ã  la liste blanche Firestore si pas dÃ©jÃ  prÃ©sent
    try {
      const q = query(collection(db, "allowed_emails"), where("email", "==", emailNorm));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "allowed_emails"), { email: emailNorm, invitedBy: "alexandre", invitedAt: serverTimestamp() });
      }
    } catch(e) { console.error("Erreur ajout allowlist:", e); }
    // Ouvrir Gmail
    const subject = encodeURIComponent("Invitation â KaratÃ© Pro SKB Elite");
    const body = encodeURIComponent(
      "Bonjour " + m.prenom + ",\n\n" +
      "Tu es invitÃ©Â·e Ã  accÃ©der Ã  l'application KaratÃ© Pro SKB Elite.\n\n" +
      "ð AccÃ©der Ã  l'app : " + APP_URL + "\n\n" +
      "Pour crÃ©er ton compte :\n" +
      "â¢ Clique sur Â« Continuer avec Google Â» si tu as un compte Google\n" +
      "â¢ Ou clique sur Â« Connexion par email Â» pour crÃ©er un mot de passe\n\n" +
      "â ï¸ Utilise bien cette adresse email : " + emailNorm + "\n\n" +
      "Ã bientÃ´t !\n" +
      "Alexandre"
    );
    const gmailUrl = "https://mail.google.com/mail/?view=cm&to=" + encodeURIComponent(emailNorm) + "&su=" + subject + "&body=" + body;
    window.open(gmailUrl, "_blank");
  };

  const getIdentityId = (m) => m.firestoreId.replace("default_","");

  return (
    <div>
      <SectionHeader icon="ð¥" title="L'Ã©quipe" subtitle="Personnes ayant accÃ¨s Ã  l'application" color={C.primary}
        action={<Btn onClick={openAdd} color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Ajouter</Btn>} />

      {currentUser ? (
        <div style={{ background:C.primary+"15", border:"1px solid "+C.primary+"33", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:C.primary, fontWeight:600 }}>
          â IdentifiÃ©Â·e en tant que <strong>{currentUser.fullName || currentUser.name}</strong>
        </div>
      ) : (
        <div style={{ background:"#FEF3C7", border:"1px solid #F59E0B55", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#92400E" }}>
          ð¤ Appuyez sur <strong>"C'est moi"</strong> pour vous identifier
        </div>
      )}

      {loading ? <div style={{ textAlign:"center", color:C.muted, padding:20 }}>Chargementâ¦</div> : members.map(m => {
        const identId = getIdentityId(m);
        const isMe = currentUser?.id === identId || currentUser?.firestoreId === m.firestoreId;
        const emoji = ROLE_EMOJI[m.role] || "ð¤";
        return (
          <div key={m.firestoreId} style={{ background:C.card, borderRadius:12, border:"2px solid "+(isMe?C.primary:C.border), padding:14, marginBottom:10, display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:isMe?C.primary:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, overflow:"hidden", position:"relative" }}>
              {(() => { const photo = localStorage.getItem("kp_member_photo_"+m.firestoreId); return photo ? <img src={photo} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : emoji; })()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>{m.prenom} {m.nom}</div>
              <Badge label={m.role} color={C.primary} />
              <div style={{ marginTop:5, fontSize:11, color:C.muted }}>â {m.email}</div>
              <div style={{ fontSize:11, color:C.muted }}>ð {m.telephone}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5, flexShrink:0 }}>
              <button onClick={() => onIdentify({ id:identId, name:m.prenom, fullName:m.prenom+" "+m.nom, role:m.role })}
                style={{ background:isMe?C.primary:C.bg, color:isMe?"#fff":C.primary, border:"1.5px solid "+C.primary, borderRadius:8, padding:"5px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                {isMe ? "â Moi" : "C'est moi"}
              </button>
              <button onClick={() => handleInvite(m)}
                style={{ background:"none", color:C.muted, border:"1.5px solid "+C.border, borderRadius:8, padding:"5px 9px", fontSize:11, cursor:"pointer" }}>
                ð§ Inviter
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
        const emoji = ROLE_EMOJI[m.role] || "ð¤";
        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"flex-end" }} onClick={()=>setViewMember(null)}>
            <div style={{ background:"#fff", width:"100%", maxHeight:"85vh", overflowY:"auto", borderRadius:"20px 20px 0 0", padding:"24px 20px" }} onClick={e=>e.stopPropagation()}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div style={{ fontWeight:800, fontSize:18 }}>Fiche membre</div>
                <button onClick={()=>setViewMember(null)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer" }}>â</button>
              </div>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ position:"relative", display:"inline-block" }}>
                  <div style={{ width:90, height:90, borderRadius:"50%", border:"3px solid "+C.primary, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontSize:40, margin:"0 auto 8px" }}>
                    {photo ? <img src={photo} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : emoji}
                  </div>
                  <label style={{ position:"absolute", bottom:8, right:0, background:C.primary, borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"2px solid #fff" }}>
                    <span style={{ color:"#fff", fontSize:14 }}>ð·</span>
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
                {[["â Email",m.email],["ð TÃ©lÃ©phone",m.telephone]].map(([l,v])=>v?(
                  <div key={l} style={{ background:C.bg, borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>{l.split(" ")[0]+" "+l.split(" ").slice(1).join(" ")}</div>
                    <div style={{ fontSize:13, fontWeight:600, wordBreak:"break-all" }}>{v}</div>
                  </div>
                ):null)}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>{openEdit(m); setViewMember(null);}}
                  style={{ flex:1, background:C.primary, border:"none", borderRadius:10, padding:"12px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>
                  âï¸ Modifier
                </button>
                <button onClick={()=>handleInvite(m)}
                  style={{ flex:1, background:"none", border:"1.5px solid "+C.border, borderRadius:10, padding:"12px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  ð§ Inviter
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
            {[["PrÃ©nom *","prenom","text"],["Nom *","nom","text"],["Email *","email","email"],["TÃ©lÃ©phone","telephone","tel"]].map(([label,key,type]) => (
              <div key={key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:14, boxSizing:"border-box" }}/>
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>RÃ´le</label>
              <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}
                style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 12px", fontSize:14, background:"#fff" }}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_EMOJI[r]} {r}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowForm(false)} style={{ flex:1, padding:12, borderRadius:10, border:"1.5px solid "+C.border, background:"none", fontSize:14, cursor:"pointer" }}>Annuler</button>
              <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:12, borderRadius:10, border:"none", background:C.primary, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", opacity:saving?0.7:1 }}>
                {saving ? "Enregistrementâ¦" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ PROFIL âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const Profil = ({ sessions, competitions, authUser }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem("kp_profile_photo") || null);
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kp_profile") || "null") || { prenom:"Iliana", nom:"Voratovic", email:"ilianavoratovic@gmail.com", sport:"KaratÃ© Kata", club:"SKB Elite", dateNaissance:"", ville:"" }; }
    catch { return { prenom:"Iliana", nom:"Voratovic", email:"ilianavoratovic@gmail.com", sport:"KaratÃ© Kata", club:"SKB Elite", dateNaissance:"", ville:"" }; }
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
      <SectionHeader icon="ð¤" title="Profil" subtitle="Vos informations personnelles" color={C.primary} />
      <div style={{ background:C.card, borderRadius:16, border:"1px solid "+C.border, padding:24, textAlign:"center", marginBottom:16 }}>
        <div style={{ position:"relative", display:"inline-block", marginBottom:12 }}>
          {profilePhoto
            ? <img src={profilePhoto} alt="Profil" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid "+C.primary }}/>
            : <Avatar name={profile.prenom+" "+profile.nom} size={80} bg={C.primary} />
          }
          <label style={{ position:"absolute", bottom:0, right:0, background:C.primary, borderRadius:"50%", width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"2px solid #fff" }}>
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }}/>
            <span style={{ color:"#fff", fontSize:14 }}>ð·</span>
          </label>
        </div>
        <div style={{ fontWeight:800, fontSize:20 }}>{profile.prenom} {profile.nom}</div>
        <Badge label={profile.sport} color={C.primary} />
        {profile.club && <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>ðï¸ {profile.club}</div>}
        <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>{profile.email}</div>
        {profile.ville && <div style={{ color:C.muted, fontSize:12 }}>ð {profile.ville}</div>}
        <Btn onClick={()=>{ setEditForm(profile); setShowEdit(true); }} color={C.primary} style={{ marginTop:14 }}><Edit2 size={13}/> Modifier le profil</Btn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {[{l:"SÃ©ances totales",v:sessions.length,c:C.red},{l:"CompÃ©titions",v:(competitions||[]).length,c:C.yellow},{l:"Satisfaction moy.",v:avgSat+"/10",c:C.green}].map(s=>(
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
                {[["PrÃ©nom","prenom"],["Nom","nom"],["Email","email"],["Club","club"],["Sport / Discipline","sport"],["Ville","ville"]].map(([l,k])=>(
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
                <button onClick={handleSaveProfile} style={{ background:C.primary, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>ð¾ Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ PLANNING âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const Planning = () => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("planning");
  const [form, setForm] = useState({ debut:"", club:0, prepa:0, perso:0, compet:0, objectif:"", commentaireCoach:"" });
  const [plannings, setPlannings] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleSave = () => {
    if (!form.debut) return;
    if (editingPlan) {
      setPlannings(prev => prev.map(p => p.id===editingPlan ? {...p,...form} : p));
    } else {
      setPlannings(prev => [{ id:Date.now(), ...form }, ...prev]);
    }
    setForm({ debut:"", club:0, prepa:0, perso:0, compet:0, objectif:"", commentaireCoach:"" });
    setEditingPlan(null);
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader icon="ð" title="Planning" subtitle="Organisez vos entraÃ®nements et planifiez vos semaines ð" color={C.primary}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Planifier semaine</Btn>} />

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["planning","ð Planification"],["calendar","ð Calendrier"]].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid "+(activeTab===id?C.primary:C.border), background:activeTab===id?C.primary+"15":"#fff", color:activeTab===id?C.primary:C.text, fontWeight:activeTab===id?700:400, cursor:"pointer", fontSize:13 }}>{label}</button>
        ))}
      </div>

      {activeTab === "calendar" && (
        <div>
          <div style={{ background:C.primary+"11", border:"1px solid "+C.primary+"33", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:12, color:C.primary }}>
            ð Agenda Google de <strong>ilianavoratovic@gmail.com</strong> â Le calendrier doit Ãªtre dÃ©fini comme public dans les paramÃ¨tres Google Calendar pour s'afficher.
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

      {/* RÃ©capitulatif S-1 */}
      <div style={{ background:C.card, borderRadius:16, border:"1px solid "+C.border, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>ð RÃ©capitulatif S-1</div>
        <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>Semaine du 1 juin au 7 juin 2026</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
          {[{l:"EntraÃ®nement Club",prevu:3,realise:4,ok:true,pct:133,c:C.red},
            {l:"PrÃ©pa Physique",prevu:2,realise:2,ok:true,pct:100,c:C.blue},
            {l:"EntraÃ®nement Perso",prevu:1,realise:0,ok:false,pct:0,c:C.primary},
            {l:"CompÃ©titions",prevu:0,realise:0,ok:true,pct:100,c:C.yellow}].map(s=>(
            <div key={s.l} style={{ background:s.c+"11", border:"1px solid "+s.c+"33", borderRadius:12, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:s.c }}>{s.l}</span>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  {s.ok ? <CheckCircle2 size={14} color={C.green}/> : <XCircle size={14} color={C.red}/>}
                  <span style={{ fontSize:11, fontWeight:700, color:s.ok?C.green:C.red }}>{s.pct}%</span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.muted }}>PrÃ©vu</div><div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.prevu}</div></div>
                <span style={{ color:C.muted }}>â</span>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:10, color:C.muted }}>RÃ©alisÃ©</div><div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.realise}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planifications Ã  venir */}
      <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Planifications Ã  venir</div>
      <div style={{ background:C.card, borderRadius:14, border:"1px solid "+C.border, padding:16, marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div><div style={{ fontWeight:700, fontSize:14 }}>Semaine du 8 au 14 juin 2026</div>
            <Badge label="ð PlanifiÃ©" color={C.primary} /></div>
          <div style={{ display:"flex", gap:6 }}>
            <Btn small outlined color={C.primary} style={{ fontSize:10 }}>Modifier</Btn>
            <Btn small outlined color={C.red} style={{ fontSize:10 }}>Supprimer</Btn>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, margin:"12px 0" }}>
          {[{l:"Club",v:4,c:C.red},{l:"PrÃ©pa",v:2,c:C.blue},{l:"Perso",v:0,c:C.muted},{l:"CompÃ©t.",v:0,c:C.yellow}].map(x=>(
            <div key={x.l} style={{ textAlign:"center", padding:8, background:x.c+"11", borderRadius:8 }}>
              <div style={{ fontSize:10, color:x.c }}>{x.l}</div>
              <div style={{ fontSize:20, fontWeight:800, color:x.c }}>{x.v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 12px", borderLeft:"3px solid "+C.green }}>
          <span style={{ fontSize:12, color:C.green }}>ð¯ <strong>Objectif :</strong> PrÃ©pa Porec</span>
        </div>
      </div>

      </div>)}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", width:"100%", maxHeight:"90vh", overflowY:"auto", borderRadius:"20px 20px 0 0" }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:"linear-gradient(135deg, "+C.primary+", "+C.accent+")", padding:"18px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:800, fontSize:18, color:"#fff" }}>Planification de la semaine</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"#ffffff33", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ marginBottom:16 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>DÃ©but de semaine (Lundi) *</label>
                <input type="date" value={form.debut} onChange={e=>setForm(f=>({...f,debut:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>Nombre de sÃ©ances prÃ©vues :</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                {[["ð¥ EntraÃ®nement Club","club"],["ðª PrÃ©pa Physique","prepa"],["ð¤ EntraÃ®nement Perso","perso"],["ð CompÃ©titions","compet"]].map(([l,k])=>(
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
                <input type="text" placeholder="Ex: PrÃ©pa compÃ©tition" value={form.objectif} onChange={e=>setForm(f=>({...f,objectif:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box" }}/></div>
              <div style={{ marginBottom:20 }}><label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Commentaire du coach</label>
                <textarea rows={3} value={form.commentaireCoach} onChange={e=>setForm(f=>({...f,commentaireCoach:e.target.value}))} style={{ width:"100%", border:"1.5px solid "+C.border, borderRadius:8, padding:"9px 12px", fontSize:13, boxSizing:"border-box", resize:"none" }}/></div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>{ setShowForm(false); setEditingPlan(null); }} style={{ background:"none", border:"1.5px solid "+C.border, borderRadius:8, padding:"10px 20px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><X size={14}/> Annuler</button>
                <button onClick={handleSave} style={{ background:C.primary, border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>ð¾ {editingPlan?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// âââ NAV ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const NAV = [
  { id:"dashboard", label:"Tableau de bord", icon:<LayoutDashboard size={16}/>, bottomIcon:<Home size={20}/>, bottomLabel:"Accueil" },
  { id:"planning", label:"Planification", icon:<Calendar size={16}/> },
  { id:"visionboard", label:"Tableau de visualisation", icon:<BarChart2 size={16}/> },
  { id:"karate", label:"SÃ©ances KaratÃ©", icon:<Shield size={16}/>, bottomIcon:<Shield size={20}/>, bottomLabel:"SÃ©ances" },
  { id:"stage", label:"Stage Ãquipe de F...", icon:<Users size={16}/> },
  { id:"physique", label:"PrÃ©pa Physique", icon:<Dumbbell size={16}/>, bottomIcon:<Dumbbell size={20}/>, bottomLabel:"PrÃ©pa" },
  { id:"competitions", label:"CompÃ©titions", icon:<Trophy size={16}/> },
  { id:"corrections", label:"Corrections", icon:<Clock size={16}/>, bottomIcon:<Clock size={20}/>, bottomLabel:"Corrections" },
  { id:"videos", label:"VidÃ©os", icon:<Video size={16}/> },
  { id:"nutrition", label:"Nutrition", icon:<Apple size={16}/> },
  { id:"sommeil", label:"Sommeil", icon:<Moon size={16}/> },
  { id:"chat", label:"Chat", icon:<MessageCircle size={16}/>, bottomIcon:<MessageCircle size={20}/>, bottomLabel:"Chat" },
  { id:"equipe", label:"Ãquipe", icon:<Users size={16}/> },
  { id:"profil", label:"Profil", icon:<User size={16}/> },
];

const BOTTOM_NAV = NAV.filter(n => n.bottomIcon);

// âââ APP ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const TEAM_USERS = [
  { id:"iliana",    fullName:"Iliana Voratovic",   name:"Iliana",   role:"Sportive", emoji:"ð¥" },
  { id:"isabelle",  fullName:"Isabelle Voratovic",  name:"Isabelle", role:"Maman",    emoji:"ð©" },
  { id:"alexandre", fullName:"Alexandre Voratovic", name:"Alexandre",role:"Papa",     emoji:"ð¨" },
  { id:"helvetia",  fullName:"Helvetia",            name:"Helvetia", role:"Coach",    emoji:"ð" },
];


// âââ AUTH âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
      const codes = { "auth/user-not-found":"Email introuvable.", "auth/wrong-password":"Mot de passe incorrect.", "auth/invalid-credential":"Email ou mot de passe incorrect.", "auth/too-many-requests":"Trop de tentatives. RÃ©essayez plus tard." };
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
          <img src="/iliana.png" alt="KaratÃ© Pro" style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", objectPosition:"top", marginBottom:12, border:"3px solid #7C3AED" }}/>
          <div style={{ fontWeight:900, fontSize:22, color:"#1E293B" }}>KaratÃ© Pro</div>
          <div style={{ color:"#94A3B8", fontSize:13, marginTop:4 }}>SKB Elite â AccÃ¨s privÃ©</div>
        </div>

        {tab === "link_sent" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>ð¬</div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>Lien envoyÃ© !</div>
            <div style={{ color:"#64748B", fontSize:13, marginBottom:20 }}>VÃ©rifiez votre boÃ®te mail <strong>{email}</strong> et cliquez sur le lien pour vous connecter.</div>
            <button onClick={()=>setTab("main")} style={{ ...btnSecondary }}>â Retour</button>
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
              âï¸ Connexion par email
            </button>

            {error && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 14px", color:"#DC2626", fontSize:13, marginTop:8 }}>{error}</div>}

            <div style={{ textAlign:"center", color:"#CBD5E1", fontSize:11, marginTop:20 }}>
              AccÃ¨s sur invitation uniquement
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
              <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "Connexionâ¦" : "ð Se connecter"}</button>
            </form>

            <div style={{ textAlign:"center", margin:"8px 0", color:"#94A3B8", fontSize:12 }}>Pas de mot de passe ?</div>
            <button onClick={()=>setTab("magic_link")} style={{ ...btnSecondary, fontSize:12, padding:"10px 20px" }}>ð§ Recevoir un lien de connexion</button>
            <button onClick={()=>setTab("main")} style={{ background:"none", border:"none", color:"#94A3B8", fontSize:12, cursor:"pointer", width:"100%", marginTop:6 }}>â Retour</button>
          </>
        )}

        {tab === "magic_link" && (
          <>
            <div style={{ color:"#64748B", fontSize:13, marginBottom:16, textAlign:"center" }}>Entrez votre email. Vous recevrez un lien pour vous connecter instantanÃ©ment, sans mot de passe.</div>
            <form onSubmit={handleMagicLink}>
              <input type="email" placeholder="Adresse email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} required autoFocus/>
              {error && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 14px", color:"#DC2626", fontSize:13, marginBottom:10 }}>{error}</div>}
              <button type="submit" disabled={loading} style={btnPrimary}>{loading ? "Envoiâ¦" : "ð§ Envoyer le lien"}</button>
            </form>
            <button onClick={()=>setTab("main")} style={{ background:"none", border:"none", color:"#94A3B8", fontSize:12, cursor:"pointer", width:"100%", marginTop:6 }}>â Retour</button>
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
      // 1. Ajouter Ã  la liste blanche Firestore
      const q = query(collection(db, "allowed_emails"), where("email", "==", newEmail.trim()));
      const existing = await getDocs(q);
      if (existing.empty) {
        await addDoc(collection(db, "allowed_emails"), { email: newEmail.trim().toLowerCase(), invitedBy: currentUserEmail, invitedAt: serverTimestamp() });
      }
      // 2. Ouvrir Gmail dans le navigateur avec l'email prÃ©-rempli
      const appUrl = window.location.origin;
      const subject = encodeURIComponent("Invitation â KaratÃ© Pro SKB Elite");
      const body = encodeURIComponent(
        "Bonjour,\n\n" +
        "Tu es invitÃ©(e) Ã  accÃ©der Ã  l'application KaratÃ© Pro de l'Ã©quipe SKB Elite.\n\n" +
        "ð AccÃ©der Ã  l'app : " + appUrl + "\n\n" +
        "Une fois sur l'app :\n" +
        "â¢ Clique sur Â« Continuer avec Google Â» si tu as un compte Google\n" +
        "â¢ Ou clique sur Â« Connexion par email Â» pour crÃ©er un mot de passe\n\n" +
        "â ï¸ Utilise bien cette adresse email pour te connecter : " + newEmail.trim() + "\n\n" +
        "Ã bientÃ´t !\n" +
        "Alexandre"
      );
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(newEmail.trim())}&su=${subject}&body=${body}`;
      window.open(gmailUrl, "_blank");
      setMsg("â " + newEmail.trim() + " ajoutÃ©. Gmail s'est ouvert â clique Envoyer.");
      setNewEmail("");
      loadUsers();
    } catch(e) {
      setMsg("â Erreur : " + e.message);
    }
    setLoading(false);
  };

  const remove = async (id, email) => {
    if (!window.confirm("Supprimer l'accÃ¨s de " + email + " ?")) return;
    await deleteDoc(doc(db, "allowed_emails", id));
    loadUsers();
  };

  return (
    <div style={{ background:"#F8F7FF", border:"2px solid #7C3AED33", borderRadius:16, padding:20, marginTop:20 }}>
      <div style={{ fontWeight:800, fontSize:15, color:"#7C3AED", marginBottom:4 }}>ð¡ï¸ Gestion des accÃ¨s</div>
      <div style={{ fontSize:12, color:"#94A3B8", marginBottom:16 }}>Invitez des personnes Ã  accÃ©der Ã  l'app</div>

      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <input type="email" placeholder="Email Ã  inviterâ¦" value={newEmail} onChange={e=>setNewEmail(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&invite()}
          style={{ flex:1, border:"1.5px solid #E2E8F0", borderRadius:8, padding:"10px 12px", fontSize:13 }}/>
        <button onClick={invite} disabled={loading || !newEmail.trim()} style={{ background:"#7C3AED", border:"none", borderRadius:8, padding:"10px 16px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
          {loading ? "â¦" : "Inviter"}
        </button>
      </div>

      {msg && <div style={{ fontSize:12, color:msg.startsWith("â")?"#10B981":"#EF4444", marginBottom:10 }}>{msg}</div>}

      <div style={{ borderTop:"1px solid #E2E8F0", paddingTop:12 }}>
        {users.length === 0 && <div style={{ color:"#94A3B8", fontSize:12, textAlign:"center" }}>Aucun utilisateur invitÃ©</div>}
        {users.map(u => (
          <div key={u.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F1F5F9" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{u.email}</div>
              <div style={{ fontSize:11, color:"#94A3B8" }}>InvitÃ© par {u.invitedBy}</div>
            </div>
            <button onClick={()=>remove(u.id, u.email)} style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:6, padding:"4px 10px", color:"#DC2626", fontSize:11, cursor:"pointer" }}>Retirer</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [authUser, setAuthUser] = useState(undefined); // undefined=chargement, null=non connectÃ©
  const [authAllowed, setAuthAllowed] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [sessions, setSessions] = useState(ALL_SESSIONS);
  const [competitions, setCompetitions] = useState(mockCompetitions);
  const [currentUser, setCurrentUserState] = useState(() => { try { return JSON.parse(localStorage.getItem("kp_user")||"null"); } catch { return null; } });
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashOpacity, setSplashOpacity] = useState(1);
  const [notifPermission, setNotifPermission] = useState("default");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // DÃ©tecter si l'URL contient un lien de connexion Firebase (invitation)
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = localStorage.getItem("kp_signin_email");
      if (!email) email = window.prompt("Confirmez votre adresse email pour terminer la connexion :");
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => { localStorage.removeItem("kp_signin_email"); window.history.replaceState({}, document.title, "/"); })
          .catch(e => console.error("Erreur lien email:", e));
      }
    }
    // Ãcouter les changements d'authentification
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setAuthUser(null); setAuthAllowed(false); return; }
      if (user.email === ADMIN_EMAIL) { setAuthUser(user); setAuthAllowed(true); return; }
      try {
        const q = query(collection(db, "allowed_emails"), where("email", "==", user.email.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) { setAuthUser(user); setAuthAllowed(true); }
        else { await signOut(auth); setAuthUser(null); setAuthAllowed(false); alert("AccÃ¨s non autorisÃ©. Contactez l'administrateur."); }
      } catch(e) { setAuthUser(user); setAuthAllowed(true); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser) return;
    // Désinscrire l'ancien service worker Firebase qui bloque OneSignal
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => {
          if (reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')) {
            reg.unregister().then(() => console.log('firebase-messaging-sw.js désinscrit'));
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
        // VÃ©rifier si dÃ©jÃ  abonnÃ©
        const optedIn = OneSignal.User.PushSubscription.optedIn;
        if (optedIn) {
          setNotifPermission("granted");
          const playerId = OneSignal.User.PushSubscription.id;
          if (playerId) await saveOneSignalPlayerId(authUser.uid, playerId);
        }
        // Ãcouter les changements d'abonnement
        OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
          if (event.current.optedIn) {
            setNotifPermission("granted");
            const playerId = event.current.id;
            if (playerId) await saveOneSignalPlayerId(authUser.uid, playerId);
            showToast("â Notifications push activÃ©es");
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
            showToast("ð¬ Nouveau message de " + (d.sender || "?") + " â " + (d.text || ""));
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

  // Auth guards
  if (authUser === undefined) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#7C3AED,#EC4899)" }}>
      <div style={{ color:"#fff", fontWeight:700, fontSize:16 }}>Chargementâ¦</div>
    </div>
  );
  if (!authUser || !authAllowed) return <LoginScreen />;

  const handleEnableNotifications = async () => {
    try {
      if (window.OneSignal) {
        await window.OneSignal.User.PushSubscription.optIn();
      } else {
        showToast("OneSignal en cours de chargement, rÃ©essayez dans un instant");
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
      case "dashboard": return <Dashboard sessions={sessions} competitions={competitions}/>;
      case "planning": return <Planning/>;
      case "visionboard": return <VisionBoard sessions={sessions}/>;
      case "karate": return <SeancesKarate sessions={sessions} setSessions={setSessions} showToast={showToast}/>;
      case "stage": return <StageEquipe/>;
      case "physique": return <PrepaPhysique/>;
      case "competitions": return <Competitions competitions={competitions} setCompetitions={setCompetitions}/>;
      case "corrections": return <Corrections sessions={sessions}/>;
      case "videos": return <Videos competitions={competitions} sessions={sessions}/>;
      case "nutrition": return <Nutrition/>;
      case "sommeil": return <Sommeil/>;
      case "chat": return <Chat authUser={authUser}/>;
      case "equipe": return <Equipe currentUser={currentUser} onIdentify={(u)=>{setCurrentUser(u);setCurrentUserState(u);}}/>;
      case "profil": return <Profil sessions={sessions} competitions={competitions} authUser={authUser}/>;
      default: return <EmptyState icon={<LayoutDashboard size={24}/>} title="Section Ã  venir"/>;
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
            <div style={{ fontSize:10, color:C.muted }}>KaratÃ© Kata</div>
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
            <div style={{ fontWeight:600 }}>{authUser?.displayName || authUser?.email?.split("@")[0] || "Utilisateur"}</div>
            <div style={{ color:C.muted }}>{authUser?.email === ADMIN_EMAIL ? "Administrateur" : "Membre"}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", color:C.red, fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6, padding:"4px 2px" }}>
          <LogOut size={13}/> DÃ©connexion
        </button>
      </div>
    </>
  );

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
            <span style={{ fontWeight:800, fontSize:14, color:C.primary }}>KaratÃ© Pro</span>
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
