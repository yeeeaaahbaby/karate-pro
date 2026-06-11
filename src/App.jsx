import { useState, useEffect } from "react";
import {
  LayoutDashboard, Calendar, BarChart2, Shield, Users2,
  Dumbbell, Trophy, Clock, Video, Apple, Moon, MessageCircle,
  Users, User, LogOut, Plus, ChevronRight, Star,
  TrendingUp, CheckCircle2, XCircle, Edit2, Trash2, Send,
  Paperclip, Bell, BellOff
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { requestNotificationPermission, onForegroundMessage } from "./firebase";
import { enregistrerSeance } from "./notifications";

// ─── Design System ──────────────────────────────────────────────────────────
const C = {
  primary: "#7C3AED", accent: "#EC4899", red: "#EF4444",
  orange: "#F97316", blue: "#6366F1", green: "#10B981",
  yellow: "#F59E0B", bg: "#F1F5F9", card: "#FFFFFF",
  text: "#1E293B", muted: "#94A3B8", border: "#E2E8F0",
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockSessions = [
  { id:1, date:"2026-06-09", type:"Collectif", duration:120, satisfaction:7, katas:["Gojūshiho Dai","Gojūshiho Shō","Unsu","Gankaku"], techniques:["Kihon (Bases)","Yoko Geri"], notes:"Taper moins sur les pics, sur gankaku bien faire le premier coup de coude" },
  { id:2, date:"2026-06-05", type:"Collectif", duration:75, satisfaction:8, katas:["Gojūshiho Dai","Sochin"], techniques:["Mae Geri","Gyaku Zuki"], notes:"" },
  { id:3, date:"2026-06-01", type:"Collectif", duration:80, satisfaction:9, katas:["Kanku Dai"], techniques:["Age Uke"], notes:"Très bonne séance" },
  { id:4, date:"2026-05-31", type:"Perso", duration:120, satisfaction:8, katas:["Gojūshiho Dai","Bassai Dai"], techniques:["Kihon (Bases)"], notes:"" },
  { id:5, date:"2026-05-25", type:"Collectif", duration:75, satisfaction:7, katas:["Gojūshiho Shō"], techniques:[], notes:"" },
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
  { id:1, date:"2026-11-10", trainer:"Jonathan", content:"Taper moins fort sur les pics, attention à la posture lors du kiba dachi" },
  { id:2, date:"2025-10-19", trainer:"Jonathan", content:"Premier coup de coude insuffisant, regarder en bas avant de tourner" },
  { id:3, date:"2025-10-18", trainer:"Olivier", content:"Ikité trop bas, stabiliser le bunkai final" },
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

// ─── Composants UI ──────────────────────────────────────────────────────────
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
    border:`2px solid ${color}`, borderRadius:8, padding: small ? "5px 14px" : "8px 18px",
    fontSize: small ? 12 : 13, fontWeight:600, cursor:"pointer",
    display:"inline-flex", alignItems:"center", gap:4, ...style
  }}>{children}</button>
);

const FilterPill = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{
    background: active ? C.primary : "#fff", color: active ? "#fff" : C.text,
    border:`1.5px solid ${active ? C.primary : C.border}`,
    borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600,
    cursor:"pointer", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:5
  }}>
    {label}{count !== undefined && <span style={{ background: active ? "#ffffff33" : C.bg, borderRadius:10, padding:"1px 6px", fontSize:11 }}>{count}</span>}
  </button>
);

const SectionHeader = ({ icon, title, subtitle, color, action }) => (
  <div style={{ background:`linear-gradient(135deg, ${color} 0%, ${color}BB 100%)`,
    borderRadius:16, padding:"24px 28px", color:"#fff", marginBottom:24,
    display:"flex", alignItems:"center", justifyContent:"space-between" }}>
    <div>
      <div style={{ fontSize:22, fontWeight:800 }}>{icon} {title}</div>
      {subtitle && <div style={{ fontSize:13, opacity:0.8, marginTop:4 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon, title, sub, action }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:60, gap:14 }}>
    <div style={{ width:72, height:72, borderRadius:"50%", background:C.primary+"22", display:"flex", alignItems:"center", justifyContent:"center", color:C.primary, fontSize:28 }}>{icon}</div>
    <div style={{ fontWeight:700, fontSize:16 }}>{title}</div>
    {sub && <div style={{ color:C.muted, fontSize:13, textAlign:"center" }}>{sub}</div>}
    {action && <Btn onClick={action.fn}><Plus size={14}/>{action.label}</Btn>}
  </div>
);

// ─── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => (
  <div style={{ position:"fixed", bottom:24, right:24, background:C.primary, color:"#fff",
    borderRadius:14, padding:"14px 20px", zIndex:9999, maxWidth:320, boxShadow:"0 8px 32px rgba(124,58,237,0.4)",
    display:"flex", alignItems:"flex-start", gap:12 }}>
    <Bell size={18} style={{ flexShrink:0, marginTop:2 }}/>
    <div style={{ flex:1 }}>
      <div style={{ fontWeight:700, fontSize:13 }}>Nouvelle séance enregistrée 🥋</div>
      <div style={{ fontSize:12, opacity:0.85, marginTop:2 }}>{message}</div>
    </div>
    <button onClick={onClose} style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", fontSize:16 }}>✕</button>
  </div>
);

// ─── Page: Dashboard ─────────────────────────────────────────────────────────
const Dashboard = ({ sessions }) => (
  <div>
    <div style={{ background:`linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
      borderRadius:20, padding:"28px 32px", color:"#fff", marginBottom:28 }}>
      <div style={{ fontSize:26, fontWeight:800 }}>Bonjour Iliana 👋</div>
      <div style={{ fontSize:14, opacity:0.85, marginTop:4 }}>Continuez votre progression vers l'excellence</div>
    </div>
    <div style={{ background:C.card, borderRadius:16, padding:24, marginBottom:20, border:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <Calendar size={16} color={C.accent}/> <strong style={{ fontSize:14 }}>Planning de la semaine</strong>
        <span style={{ color:C.muted, fontSize:12 }}>8 juin - 14 juin 2026</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
        {[{label:"Club d'entraînement",val:4,color:C.red},{label:"Prépa Physique",val:2,color:C.blue},
          {label:"Entraînement Perso",val:0,color:C.muted},{label:"Compétitions",val:0,color:C.yellow}].map(s=>(
          <div key={s.label} style={{ background:s.color+"11", border:`1px solid ${s.color}33`, borderRadius:12, padding:"12px 16px" }}>
            <div style={{ fontSize:11, color:s.color, fontWeight:600, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.green+"15", borderRadius:10, padding:"10px 16px", borderLeft:`3px solid ${C.green}` }}>
        <span style={{ color:C.green, fontSize:13 }}>🎯 <strong>Objectif de la semaine :</strong> Prépa Porec</span>
      </div>
    </div>
    <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
      {[{icon:"🥋",label:"Séance Karaté",val:"0 cette semaine",c:C.red},{icon:"💪",label:"Prépa Physique",val:"0 cette semaine",c:C.blue},
        {icon:"⏱",label:"Corrections",val:"0 cette semaine",c:C.orange},{icon:"🏆",label:"Compétitions",val:"0 à venir",c:C.yellow}].map(s=>(
        <div key={s.label} style={{ background:s.c, borderRadius:16, padding:"18px 22px", color:"#fff", flex:1, minWidth:150 }}>
          <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
          <div style={{ fontSize:13, opacity:0.85 }}>{s.label}</div>
          <div style={{ fontSize:18, fontWeight:800 }}>{s.val}</div>
        </div>
      ))}
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
      <div style={{ background:C.card, borderRadius:16, padding:24, border:`1px solid ${C.border}` }}>
        <div style={{ fontWeight:700, marginBottom:16 }}>Activité de la semaine</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mockWeekActivity}>
            <XAxis dataKey="day" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis hide /><Tooltip />
            <Bar dataKey="karate" name="🥋 Karaté" fill={C.red} radius={[4,4,0,0]} />
            <Bar dataKey="physique" name="💪 Prépa" fill={C.blue} radius={[4,4,0,0]} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize:12 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ background:C.card, borderRadius:16, padding:24, border:`1px solid ${C.border}` }}>
        <div style={{ fontWeight:700, marginBottom:16 }}>Activités récentes</div>
        {sessions.slice(0,5).map(s=>(
          <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:C.primary+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <TrendingUp size={16} color={C.primary}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <Badge label={s.type} color={C.primary} />
                <span style={{ fontSize:11, color:C.muted }}>{s.date}</span>
              </div>
              <div style={{ fontSize:12, color:C.muted }}>⏱ {s.duration} min</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Page: Séances Karaté avec notifications ──────────────────────────────────
const SeancesKarate = ({ sessions, setSessions, showToast }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [form, setForm] = useState({ type:"Collectif", date:"", duration:"", satisfaction:"", katas:"", notes:"" });
  const [saving, setSaving] = useState(false);

  const SESSION_TYPES = ["ALL","Cette semaine","Ce mois-ci","Collectif","Privé","Perso","Stage"];
  const counts = { ALL:sessions.length, "Cette semaine":1, "Ce mois-ci":5, Collectif:82, Privé:2, Perso:21, Stage:0 };

  const handleSubmit = async () => {
    if (!form.date || !form.duration) return;
    setSaving(true);
    try {
      const seance = {
        type: form.type,
        date: form.date,
        duration: parseInt(form.duration),
        satisfaction: parseInt(form.satisfaction) || 7,
        katas: form.katas.split(",").map(k=>k.trim()).filter(Boolean),
        notes: form.notes,
        athlete: "Iliana Voratovic"
      };

      // Sauvegarder dans Firestore + déclencher notification
      await enregistrerSeance(seance);

      // Ajouter localement
      setSessions(prev => [{ id: Date.now(), ...seance }, ...prev]);

      // Afficher toast
      showToast(`Séance ${form.type} du ${form.date} — ${form.duration} min enregistrée. L'entraîneur et les parents ont été notifiés.`);

      setShowForm(false);
      setForm({ type:"Collectif", date:"", duration:"", satisfaction:"", katas:"", notes:"" });
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader icon="🥋" title="Séances de Karaté" subtitle="Suivez votre progression technique et vos entraînements 🥷" color={C.red}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.red }}><Plus size={14}/> Nouvelle séance</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[{icon:<Shield size={20}/>,label:"Séances totales",val:sessions.length,c:C.red},
          {icon:<Clock size={20}/>,label:"Durée moyenne",val:"103 min",c:C.orange},
          {icon:<Star size={20}/>,label:"Satisfaction moy.",val:"7.4/10",c:C.yellow}].map(s=>(
          <div key={s.label} style={{ background:C.card, borderRadius:14, padding:"16px 20px", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ color:s.c }}>{s.icon}</div>
            <div><div style={{ fontSize:11, color:C.muted }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.val}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {SESSION_TYPES.map(f=><FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} count={counts[f]} />)}
      </div>

      {sessions.map(s=>(
        <div key={s.id} style={{ background:C.card, borderRadius:16, border:`2px solid ${C.red}33`, padding:20, marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ color:C.muted, fontSize:12 }}>{s.date}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:C.primary }}><Edit2 size={14}/></button>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:C.red }}><Trash2 size={14}/></button>
            </div>
          </div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:10 }}>Entraînement {s.type}</div>
          <div style={{ display:"flex", gap:24, marginBottom:10 }}>
            <span style={{ color:C.muted, fontSize:13 }}>⏱ <strong style={{ color:C.text }}>{s.duration} min</strong></span>
            <span style={{ color:C.muted, fontSize:13 }}>🎯 <strong style={{ color:C.text }}>{s.satisfaction}/10</strong></span>
          </div>
          {s.katas && s.katas.length>0 && <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>Katas pratiqués :</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{s.katas.map(k=><Badge key={k} label={k} color={C.primary}/>)}</div>
          </div>}
          {s.notes && <div style={{ background:C.orange+"15", borderRadius:8, padding:"8px 12px", borderLeft:`3px solid ${C.orange}` }}>
            <div style={{ fontSize:12, color:C.orange }}>⚠ {s.notes}</div>
          </div>}
        </div>
      ))}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000066", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", borderRadius:20, padding:32, width:520, maxWidth:"90vw" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>Nouvelle séance de karaté</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>
              🔔 L'entraîneur et les parents seront <strong>notifiés automatiquement</strong>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              {[["Type de séance","type","text","Collectif / Perso / Stage"],["Date","date","date",""],
                ["Durée (min)","duration","number","75"],["Satisfaction /10","satisfaction","number","7"]].map(([l,k,t,ph])=>(
                <div key={k}>
                  <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                  <input type={t} placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:13, boxSizing:"border-box" }} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Katas pratiqués (séparés par des virgules)</label>
              <input type="text" placeholder="Gojūshiho Dai, Unsu, Gankaku..." value={form.katas} onChange={e=>setForm(f=>({...f,katas:e.target.value}))}
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:13, boxSizing:"border-box" }} />
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Notes / corrections</label>
              <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:13, boxSizing:"border-box", resize:"vertical" }} />
            </div>

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn outlined color={C.muted} onClick={()=>setShowForm(false)}>Annuler</Btn>
              <Btn color={C.red} onClick={handleSubmit} style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Enregistrement..." : "🔔 Enregistrer & notifier"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Pages simples ───────────────────────────────────────────────────────────
const Planning = () => (
  <div>
    <SectionHeader icon="📅" title="Planification" subtitle="Organisez vos entraînements à venir" color={C.primary}
      action={<Btn color="#fff" style={{ color:C.primary }}><Plus size={14}/> Nouvelle planification</Btn>} />
    <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:24 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>Semaine du 8 juin au 14 juin 2026</div>
      <Badge label="📅 Planifié" color={C.primary} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, margin:"16px 0" }}>
        {[{l:"Club",v:4,c:C.red},{l:"Prépa",v:2,c:C.blue},{l:"Perso",v:0,c:C.muted},{l:"Compét.",v:0,c:C.yellow}].map(x=>(
          <div key={x.l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, color:x.c }}>{x.l}</div>
            <div style={{ fontSize:22, fontWeight:800, color:x.c }}>{x.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 14px", borderLeft:`3px solid ${C.green}` }}>
        <span style={{ fontSize:13, color:C.green }}>🎯 <strong>Objectif :</strong> Prépa Porec</span>
      </div>
    </div>
  </div>
);

const Competitions = () => (
  <div>
    <SectionHeader icon="🏆" title="Compétitions" subtitle="Suivez vos performances et résultats 🥇" color={C.orange}
      action={<Btn color="#fff" style={{ color:C.orange }}><Plus size={14}/> Nouvelle compétition</Btn>} />
    {mockCompetitions.map(c=>(
      <div key={c.id} style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:24 }}>
        <div style={{ fontWeight:700, fontSize:17, marginBottom:6 }}>{c.name}</div>
        <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>📅 {c.date} &nbsp;📍 {c.lieu} &nbsp;👤 Coach: {c.coach}</div>
        <div style={{ background:C.yellow+"22", borderRadius:10, padding:"8px 14px", borderLeft:`3px solid ${C.yellow}`, marginBottom:14 }}>
          <span style={{ color:C.yellow, fontWeight:700 }}>🏆 Résultat : {c.result}</span>
        </div>
        {c.tours.map(t=>(
          <div key={t.num} style={{ background:C.bg, borderRadius:12, padding:"14px 18px", marginBottom:10, display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                <Badge label={`Tour ${t.num}`} color={C.orange} /><span style={{ fontWeight:600 }}>{t.name}</span>
              </div>
              <div style={{ fontSize:13, color:C.muted }}>Kata: <strong style={{ color:C.text }}>{t.kata}</strong> &nbsp; Score: <strong style={{ color:C.text }}>{t.score}</strong></div>
              {t.note && <div style={{ fontSize:12, color:C.muted, marginTop:4, fontStyle:"italic" }}>{t.note}</div>}
            </div>
            {t.ok ? <CheckCircle2 color={C.green} size={20}/> : <XCircle color={C.red} size={20}/>}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Corrections = () => (
  <div>
    <SectionHeader icon="⏱" title="Corrections" subtitle="Points techniques à travailler" color={C.orange}
      action={<Btn color="#fff" style={{ color:C.orange }}><Plus size={14}/> Nouvelle correction</Btn>} />
    {mockCorrections.map(c=>(
      <div key={c.id} style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:18, marginBottom:12, display:"flex", gap:14 }}>
        <div style={{ width:4, borderRadius:4, background:C.orange, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <Avatar name={c.trainer} size={28} bg={C.primary} />
            <strong style={{ fontSize:14 }}>{c.trainer}</strong>
            <span style={{ color:C.muted, fontSize:12 }}>{c.date}</span>
          </div>
          <div style={{ fontSize:13 }}>{c.content}</div>
        </div>
      </div>
    ))}
  </div>
);

const Equipe = () => (
  <div>
    <SectionHeader icon="👥" title="L'équipe" subtitle="Personnes ayant accès à l'application" color={C.primary}
      action={<Btn color="#fff" style={{ color:C.primary }}><Plus size={14}/> Ajouter un membre</Btn>} />
    {Object.entries(mockTeam).map(([role, members])=>(
      <div key={role} style={{ marginBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>{role}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {members.map(m=>(
            <div key={m.name} style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:18, display:"flex", alignItems:"flex-start", gap:12 }}>
              <Avatar name={m.name} size={40} bg={C.primary} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, marginBottom:4 }}>{m.name}</div>
                <Badge label={role} color={C.primary} />
                <div style={{ marginTop:8, fontSize:12, color:C.muted }}>✉ {m.email}</div>
                <div style={{ fontSize:12, color:C.muted, display:"flex", alignItems:"center", gap:4 }}>
                  📞 {m.phone} <span style={{ width:8, height:8, borderRadius:"50%", background: m.online ? C.green : C.muted, display:"inline-block" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const Chat = () => {
  const [msg, setMsg] = useState("");
  return (
    <div>
      <div style={{ background:`linear-gradient(135deg, ${C.blue} 60%, ${C.primary})`, borderRadius:16, padding:"20px 24px", color:"#fff", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
        <MessageCircle size={22}/><div><div style={{ fontWeight:800, fontSize:18 }}>Chat Équipe</div><div style={{ fontSize:12, opacity:0.8 }}>Communication avec votre équipe</div></div>
      </div>
      <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ minHeight:400, padding:20 }} />
        <div style={{ borderTop:`1px solid ${C.border}`, padding:12, display:"flex", gap:10, alignItems:"center" }}>
          <button style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}><Paperclip size={18}/></button>
          <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Écrivez votre message..."
            style={{ flex:1, border:"none", outline:"none", fontSize:13, background:"transparent" }} />
          <button style={{ background:C.primary, border:"none", borderRadius:8, padding:"8px 12px", cursor:"pointer", color:"#fff" }}><Send size={16}/></button>
        </div>
      </div>
    </div>
  );
};

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Tableau de bord", icon:<LayoutDashboard size={16}/> },
  { id:"planning", label:"Planification", icon:<Calendar size={16}/> },
  { id:"karate", label:"Séances Karaté", icon:<Shield size={16}/> },
  { id:"physique", label:"Prépa Physique", icon:<Dumbbell size={16}/> },
  { id:"competitions", label:"Compétitions", icon:<Trophy size={16}/> },
  { id:"corrections", label:"Corrections", icon:<Clock size={16}/> },
  { id:"videos", label:"Vidéos", icon:<Video size={16}/> },
  { id:"nutrition", label:"Nutrition", icon:<Apple size={16}/> },
  { id:"sommeil", label:"Sommeil", icon:<Moon size={16}/> },
  { id:"chat", label:"Chat", icon:<MessageCircle size={16}/> },
  { id:"equipe", label:"Équipe", icon:<Users size={16}/> },
  { id:"profil", label:"Profil", icon:<User size={16}/> },
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sessions, setSessions] = useState(mockSessions);
  const [notifPermission, setNotifPermission] = useState("default");
  const [toast, setToast] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);

  // Demander permission notifications au démarrage
  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
    // Écouter les messages en foreground
    onForegroundMessage((payload) => {
      setToast(payload.notification?.body || "Nouvelle notification");
    });
  }, []);

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setFcmToken(token);
      setNotifPermission("granted");
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 6000);
  };

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard sessions={sessions}/>;
      case "planning": return <Planning/>;
      case "karate": return <SeancesKarate sessions={sessions} setSessions={setSessions} showToast={showToast}/>;
      case "competitions": return <Competitions/>;
      case "corrections": return <Corrections/>;
      case "chat": return <Chat/>;
      case "equipe": return <Equipe/>;
      default: return <EmptyState icon={<LayoutDashboard size={28}/>} title="Section à venir" sub="Disponible prochainement"/>;
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"'Inter', -apple-system, sans-serif", color:C.text, overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:210, background:"#fff", borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" }}>
        <div style={{ padding:"18px 16px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${C.primary}, ${C.accent})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
              <TrendingUp size={18}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:13, lineHeight:1.2 }}>Iliana<br/>Voratovic</div>
              <div style={{ fontSize:10, color:C.muted }}>Karaté Kata</div>
            </div>
          </div>
        </div>

        {/* Bouton notifications */}
        <div style={{ padding:"10px 12px", borderBottom:`1px solid ${C.border}` }}>
          {notifPermission === "granted" ? (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.green }}>
              <Bell size={13}/> Notifications actives
            </div>
          ) : (
            <button onClick={handleEnableNotifications} style={{ width:"100%", background:C.primary+"15", border:`1px solid ${C.primary}33`,
              borderRadius:8, padding:"7px 10px", fontSize:11, fontWeight:600, color:C.primary, cursor:"pointer",
              display:"flex", alignItems:"center", gap:6 }}>
              <Bell size={13}/> Activer les notifications
            </button>
          )}
        </div>

        <nav style={{ flex:1, padding:"8px 0" }}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{
              width:"100%", textAlign:"left", background: page===n.id ? C.primary+"15" : "none",
              border:"none", cursor:"pointer", borderLeft: page===n.id ? `3px solid ${C.primary}` : "3px solid transparent",
              color: page===n.id ? C.primary : C.text, padding:"9px 16px", fontSize:12.5,
              fontWeight: page===n.id ? 700 : 500, display:"flex", alignItems:"center", gap:10,
            }}>
              {n.icon}<span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.label}</span>
              {page===n.id && <ChevronRight size={12}/>}
            </button>
          ))}
        </nav>

        <div style={{ borderTop:`1px solid ${C.border}`, padding:12 }}>
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
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:52, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <LayoutDashboard size={16} color={C.muted}/>
          <span style={{ fontWeight:700, color:C.primary }}>Iliana Voratovic</span>
          <div style={{ flex:1 }} />
          <button onClick={handleEnableNotifications} style={{ background:"none", border:"none", cursor:"pointer", color: notifPermission==="granted" ? C.green : C.muted }}>
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
