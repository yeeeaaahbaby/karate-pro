import { useState, useEffect } from "react";
import {
  LayoutDashboard, Calendar, Shield, Dumbbell, Trophy, Clock,
  Video, Apple, Moon, MessageCircle, Users, User, LogOut, Plus,
  ChevronRight, Star, TrendingUp, CheckCircle2, XCircle, Edit2,
  Trash2, Send, Paperclip, Bell, BellOff, Menu, X, Home
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { requestNotificationPermission, onForegroundMessage } from "./firebase";
import { enregistrerSeance } from "./notifications";

const C = {
  primary: "#7C3AED", accent: "#EC4899", red: "#EF4444",
  orange: "#F97316", blue: "#6366F1", green: "#10B981",
  yellow: "#F59E0B", bg: "#F1F5F9", card: "#FFFFFF",
  text: "#1E293B", muted: "#94A3B8", border: "#E2E8F0",
};

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

// Hook pour détecter mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
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
    <div style={{ width:64, height:64, borderRadius:"50%", background:C.primary+"22", display:"flex", alignItems:"center", justifyContent:"center", color:C.primary, fontSize:24 }}>{icon}</div>
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

// ─── PAGES ───────────────────────────────────────────────────────────────────

const Dashboard = ({ sessions, isMobile }) => (
  <div>
    <div style={{ background:`linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
      borderRadius:16, padding:"24px 20px", color:"#fff", marginBottom:20 }}>
      <div style={{ fontSize:22, fontWeight:800 }}>Bonjour Iliana 👋</div>
      <div style={{ fontSize:13, opacity:0.85, marginTop:4 }}>Continuez votre progression vers l'excellence</div>
    </div>

    <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <Calendar size={15} color={C.accent}/> <strong style={{ fontSize:13 }}>Planning de la semaine</strong>
        <span style={{ color:C.muted, fontSize:11 }}>8-14 juin 2026</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:12 }}>
        {[{label:"Club",val:4,color:C.red},{label:"Prépa Physique",val:2,color:C.blue},
          {label:"Entr. Perso",val:0,color:C.muted},{label:"Compétitions",val:0,color:C.yellow}].map(s=>(
          <div key={s.label} style={{ background:s.color+"11", border:`1px solid ${s.color}33`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:10, color:s.color, fontWeight:600, marginBottom:2 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 12px", borderLeft:`3px solid ${C.green}` }}>
        <span style={{ color:C.green, fontSize:12 }}>🎯 <strong>Objectif :</strong> Prépa Porec</span>
      </div>
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
      {[{icon:"🥋",label:"Séance Karaté",val:"0 cette sem.",c:C.red},{icon:"💪",label:"Prépa Physique",val:"0 cette sem.",c:C.blue},
        {icon:"⏱",label:"Corrections",val:"0 cette sem.",c:C.orange},{icon:"🏆",label:"Compétitions",val:"0 à venir",c:C.yellow}].map(s=>(
        <div key={s.label} style={{ background:s.c, borderRadius:14, padding:"14px 14px", color:"#fff" }}>
          <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
          <div style={{ fontSize:11, opacity:0.85 }}>{s.label}</div>
          <div style={{ fontSize:15, fontWeight:800 }}>{s.val}</div>
        </div>
      ))}
    </div>

    <div style={{ background:C.card, borderRadius:16, padding:16, marginBottom:16, border:`1px solid ${C.border}` }}>
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

    <div style={{ background:C.card, borderRadius:16, padding:16, border:`1px solid ${C.border}` }}>
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
            <div style={{ fontSize:11, color:C.muted }}>⏱ {s.duration} min</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SeancesKarate = ({ sessions, setSessions, showToast, isMobile }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [form, setForm] = useState({ type:"Collectif", date:"", duration:"", satisfaction:"", katas:"", notes:"" });
  const [saving, setSaving] = useState(false);

  const SESSION_TYPES = ["ALL","Collectif","Privé","Perso","Stage"];
  const counts = { ALL:sessions.length, Collectif:82, Privé:2, Perso:21, Stage:0 };

  const handleSubmit = async () => {
    if (!form.date || !form.duration) return;
    setSaving(true);
    try {
      const seance = {
        type: form.type, date: form.date, duration: parseInt(form.duration),
        satisfaction: parseInt(form.satisfaction) || 7,
        katas: form.katas.split(",").map(k=>k.trim()).filter(Boolean),
        notes: form.notes, athlete: "Iliana Voratovic"
      };
      await enregistrerSeance(seance);
      setSessions(prev => [{ id: Date.now(), ...seance }, ...prev]);
      showToast(`Séance ${form.type} — ${form.duration} min. Entraîneur et parents notifiés.`);
      setShowForm(false);
      setForm({ type:"Collectif", date:"", duration:"", satisfaction:"", katas:"", notes:"" });
    } catch (error) { console.error(error); }
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader icon="🥋" title="Séances Karaté" subtitle="Suivez votre progression 🥷" color={C.red}
        action={<Btn onClick={()=>setShowForm(true)} color="#fff" style={{ color:C.red, fontSize:12 }}><Plus size={12}/> Nouvelle</Btn>} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[{label:"Total",val:sessions.length,c:C.red},{label:"Durée moy.",val:"103 min",c:C.orange},{label:"Satisfaction",val:"7.4/10",c:C.yellow}].map(s=>(
          <div key={s.label} style={{ background:C.card, borderRadius:12, padding:"12px", border:`1px solid ${C.border}`, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.muted }}>{s.label}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
        {SESSION_TYPES.map(f=><FilterPill key={f} label={f} active={activeFilter===f} onClick={()=>setActiveFilter(f)} count={counts[f]} />)}
      </div>

      {sessions.map(s=>(
        <div key={s.id} style={{ background:C.card, borderRadius:14, border:`2px solid ${C.red}33`, padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:15 }}>Entraînement {s.type}</div>
              <div style={{ color:C.muted, fontSize:11 }}>{s.date}</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:C.primary }}><Edit2 size={13}/></button>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:C.red }}><Trash2 size={13}/></button>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:8 }}>
            <span style={{ fontSize:12, color:C.muted }}>⏱ <strong style={{ color:C.text }}>{s.duration} min</strong></span>
            <span style={{ fontSize:12, color:C.muted }}>🎯 <strong style={{ color:C.text }}>{s.satisfaction}/10</strong></span>
          </div>
          {s.katas && s.katas.length>0 && (
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:11, fontWeight:600, marginBottom:4 }}>Katas :</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{s.katas.map(k=><Badge key={k} label={k} color={C.primary}/>)}</div>
            </div>
          )}
          {s.notes && (
            <div style={{ background:C.orange+"15", borderRadius:8, padding:"6px 10px", borderLeft:`3px solid ${C.orange}` }}>
              <div style={{ fontSize:11, color:C.orange }}>⚠ {s.notes}</div>
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"#00000077", zIndex:200, display:"flex", alignItems:"flex-end" }}
          onClick={()=>setShowForm(false)}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxHeight:"90vh", overflowY:"auto" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={{ fontWeight:800, fontSize:17 }}>Nouvelle séance</div>
              <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={20}/></button>
            </div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>🔔 L'entraîneur et les parents seront <strong>notifiés automatiquement</strong></div>

            {[["Type","type","text","Collectif / Perso / Stage"],["Date","date","date",""],
              ["Durée (min)","duration","number","75"],["Satisfaction /10","satisfaction","number","7"]].map(([l,k,t,ph])=>(
              <div key={k} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{l}</label>
                <input type={t} placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"10px 12px", fontSize:14, boxSizing:"border-box" }} />
              </div>
            ))}

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Katas (séparés par des virgules)</label>
              <input type="text" placeholder="Gojūshiho Dai, Unsu..." value={form.katas} onChange={e=>setForm(f=>({...f,katas:e.target.value}))}
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"10px 12px", fontSize:14, boxSizing:"border-box" }} />
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Notes</label>
              <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"10px 12px", fontSize:14, boxSizing:"border-box", resize:"none" }} />
            </div>

            <Btn color={C.red} onClick={handleSubmit} style={{ width:"100%", justifyContent:"center", padding:"14px", fontSize:15, opacity:saving?0.7:1 }}>
              {saving ? "Enregistrement..." : "🔔 Enregistrer & notifier"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
};

const Competitions = () => (
  <div>
    <SectionHeader icon="🏆" title="Compétitions" subtitle="Résultats et performances 🥇" color={C.orange}
      action={<Btn color="#fff" style={{ color:C.orange, fontSize:12 }}><Plus size={12}/> Nouvelle</Btn>} />
    {mockCompetitions.map(c=>(
      <div key={c.id} style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:16, marginBottom:12 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{c.name}</div>
        <div style={{ color:C.muted, fontSize:11, marginBottom:10 }}>📅 {c.date} · 📍 {c.lieu} · 👤 {c.coach}</div>
        <div style={{ background:C.yellow+"22", borderRadius:8, padding:"8px 12px", borderLeft:`3px solid ${C.yellow}`, marginBottom:12 }}>
          <span style={{ color:C.yellow, fontWeight:700, fontSize:13 }}>🏆 {c.result}</span>
        </div>
        {c.tours.map(t=>(
          <div key={t.num} style={{ background:C.bg, borderRadius:10, padding:"12px", marginBottom:8, display:"flex", alignItems:"flex-start", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                <Badge label={`Tour ${t.num}`} color={C.orange} /><span style={{ fontWeight:600, fontSize:13 }}>{t.name}</span>
              </div>
              <div style={{ fontSize:12, color:C.muted }}>Kata: <strong style={{ color:C.text }}>{t.kata}</strong> · Score: <strong style={{ color:C.text }}>{t.score}</strong></div>
              {t.note && <div style={{ fontSize:11, color:C.muted, marginTop:2, fontStyle:"italic" }}>{t.note}</div>}
            </div>
            {t.ok ? <CheckCircle2 color={C.green} size={18}/> : <XCircle color={C.red} size={18}/>}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Corrections = () => (
  <div>
    <SectionHeader icon="⏱" title="Corrections" subtitle="Points techniques à travailler" color={C.orange}
      action={<Btn color="#fff" style={{ color:C.orange, fontSize:12 }}><Plus size={12}/> Nouvelle</Btn>} />
    {mockCorrections.map(c=>(
      <div key={c.id} style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:14, marginBottom:10, display:"flex", gap:12 }}>
        <div style={{ width:3, borderRadius:4, background:C.orange, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <Avatar name={c.trainer} size={26} bg={C.primary} />
            <strong style={{ fontSize:13 }}>{c.trainer}</strong>
            <span style={{ color:C.muted, fontSize:11 }}>{c.date}</span>
          </div>
          <div style={{ fontSize:13 }}>{c.content}</div>
        </div>
      </div>
    ))}
  </div>
);

const Equipe = () => (
  <div>
    <SectionHeader icon="👥" title="L'équipe" subtitle="Membres ayant accès à l'app" color={C.primary}
      action={<Btn color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Ajouter</Btn>} />
    {Object.entries(mockTeam).map(([role, members])=>(
      <div key={role} style={{ marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>{role}</div>
        {members.map(m=>(
          <div key={m.name} style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:14, marginBottom:8, display:"flex", alignItems:"flex-start", gap:10 }}>
            <Avatar name={m.name} size={38} bg={C.primary} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{m.name}</div>
              <Badge label={role} color={C.primary} />
              <div style={{ marginTop:6, fontSize:11, color:C.muted }}>✉ {m.email}</div>
              <div style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:4 }}>
                📞 {m.phone} <span style={{ width:7, height:7, borderRadius:"50%", background:m.online?C.green:C.muted, display:"inline-block" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

const Planning = () => (
  <div>
    <SectionHeader icon="📅" title="Planification" subtitle="Organisez vos entraînements" color={C.primary}
      action={<Btn color="#fff" style={{ color:C.primary, fontSize:12 }}><Plus size={12}/> Nouveau</Btn>} />
    <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:16 }}>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>Semaine du 8 au 14 juin 2026</div>
      <Badge label="📅 Planifié" color={C.primary} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, margin:"12px 0" }}>
        {[{l:"Club",v:4,c:C.red},{l:"Prépa",v:2,c:C.blue},{l:"Perso",v:0,c:C.muted},{l:"Compét.",v:0,c:C.yellow}].map(x=>(
          <div key={x.l} style={{ textAlign:"center", padding:8, background:x.c+"11", borderRadius:8 }}>
            <div style={{ fontSize:10, color:x.c }}>{x.l}</div>
            <div style={{ fontSize:20, fontWeight:800, color:x.c }}>{x.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.green+"15", borderRadius:8, padding:"8px 12px", borderLeft:`3px solid ${C.green}` }}>
        <span style={{ fontSize:12, color:C.green }}>🎯 <strong>Objectif :</strong> Prépa Porec</span>
      </div>
    </div>
  </div>
);

const Chat = () => {
  const [msg, setMsg] = useState("");
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 130px)" }}>
      <div style={{ background:`linear-gradient(135deg, ${C.blue} 60%, ${C.primary})`, borderRadius:14, padding:"16px 18px", color:"#fff", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
        <MessageCircle size={20}/><div><div style={{ fontWeight:800, fontSize:16 }}>Chat Équipe</div><div style={{ fontSize:11, opacity:0.8 }}>Communication avec votre équipe</div></div>
      </div>
      <div style={{ flex:1, background:C.card, borderRadius:14, border:`1px solid ${C.border}`, marginBottom:10 }} />
      <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:10, display:"flex", gap:8, alignItems:"center" }}>
        <button style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}><Paperclip size={18}/></button>
        <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Écrivez votre message..."
          style={{ flex:1, border:"none", outline:"none", fontSize:14, background:"transparent" }} />
        <button style={{ background:C.primary, border:"none", borderRadius:8, padding:"8px 10px", cursor:"pointer", color:"#fff" }}><Send size={15}/></button>
      </div>
    </div>
  );
};

const EmptyPage = ({ icon, title }) => (
  <EmptyState icon={icon} title={title} sub="Disponible prochainement" />
);

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Accueil", icon:<Home size={16}/>, bottomIcon:<Home size={20}/> },
  { id:"karate", label:"Séances", icon:<Shield size={16}/>, bottomIcon:<Shield size={20}/> },
  { id:"competitions", label:"Compétitions", icon:<Trophy size={16}/>, bottomIcon:<Trophy size={20}/> },
  { id:"corrections", label:"Corrections", icon:<Clock size={16}/>, bottomIcon:<Clock size={20}/> },
  { id:"planning", label:"Planning", icon:<Calendar size={16}/>, bottomIcon:<Calendar size={20}/> },
  { id:"physique", label:"Prépa Physique", icon:<Dumbbell size={16}/> },
  { id:"videos", label:"Vidéos", icon:<Video size={16}/> },
  { id:"nutrition", label:"Nutrition", icon:<Apple size={16}/> },
  { id:"sommeil", label:"Sommeil", icon:<Moon size={16}/> },
  { id:"chat", label:"Chat", icon:<MessageCircle size={16}/>, bottomIcon:<MessageCircle size={20}/> },
  { id:"equipe", label:"Équipe", icon:<Users size={16}/> },
  { id:"profil", label:"Profil", icon:<User size={16}/> },
];

const BOTTOM_NAV = NAV.filter(n => n.bottomIcon).slice(0, 5);

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sessions, setSessions] = useState(mockSessions);
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
  };

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <Dashboard sessions={sessions} isMobile={isMobile}/>;
      case "planning": return <Planning/>;
      case "karate": return <SeancesKarate sessions={sessions} setSessions={setSessions} showToast={showToast} isMobile={isMobile}/>;
      case "competitions": return <Competitions/>;
      case "corrections": return <Corrections/>;
      case "chat": return <Chat/>;
      case "equipe": return <Equipe/>;
      default: return <EmptyPage icon={<LayoutDashboard size={24}/>} title={NAV.find(n=>n.id===page)?.label || "Section à venir"}/>;
    }
  };

  // ─── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:C.bg, fontFamily:"'Inter', -apple-system, sans-serif", color:C.text }}>
        {/* Top bar mobile */}
        <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 16px", height:56,
          display:"flex", alignItems:"center", gap:12, flexShrink:0, position:"sticky", top:0, zIndex:50 }}>
          <button onClick={()=>setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.text, padding:4 }}>
            <Menu size={22}/>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg, ${C.primary}, ${C.accent})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <TrendingUp size={14} color="#fff"/>
            </div>
            <span style={{ fontWeight:800, fontSize:14, color:C.primary }}>Karaté Pro</span>
          </div>
          <button onClick={handleEnableNotifications} style={{ background:"none", border:"none", cursor:"pointer", color:notifPermission==="granted"?C.green:C.muted }}>
            {notifPermission==="granted" ? <Bell size={20}/> : <BellOff size={20}/>}
          </button>
        </div>

        {/* Drawer sidebar mobile */}
        {sidebarOpen && (
          <>
            <div style={{ position:"fixed", inset:0, background:"#00000055", zIndex:100 }} onClick={()=>setSidebarOpen(false)}/>
            <div style={{ position:"fixed", left:0, top:0, bottom:0, width:280, background:"#fff", zIndex:101,
              boxShadow:"4px 0 20px rgba(0,0,0,0.15)", display:"flex", flexDirection:"column", overflowY:"auto" }}>
              <div style={{ padding:"20px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar name="Iliana Voratovic" size={40} bg={C.primary}/>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14 }}>Iliana Voratovic</div>
                    <div style={{ fontSize:11, color:C.muted }}>Karaté Kata</div>
                  </div>
                </div>
                <button onClick={()=>setSidebarOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}><X size={20}/></button>
              </div>

              <div style={{ padding:"8px 8px" }}>
                {notifPermission === "granted" ? (
                  <div style={{ padding:"8px 12px", fontSize:12, color:C.green, display:"flex", alignItems:"center", gap:6 }}>
                    <Bell size={13}/> Notifications actives
                  </div>
                ) : (
                  <button onClick={handleEnableNotifications} style={{ width:"100%", background:C.primary+"15", border:`1px solid ${C.primary}33`,
                    borderRadius:8, padding:"10px 12px", fontSize:12, fontWeight:600, color:C.primary, cursor:"pointer",
                    display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <Bell size={13}/> Activer les notifications
                  </button>
                )}
              </div>

              <nav style={{ flex:1, padding:"0 8px" }}>
                {NAV.map(n=>(
                  <button key={n.id} onClick={()=>navigate(n.id)} style={{
                    width:"100%", textAlign:"left", background:page===n.id?C.primary+"15":"none",
                    border:"none", cursor:"pointer", borderRadius:10,
                    color:page===n.id?C.primary:C.text, padding:"11px 12px", fontSize:14,
                    fontWeight:page===n.id?700:500, display:"flex", alignItems:"center", gap:10, marginBottom:2
                  }}>
                    {n.icon}<span>{n.label}</span>
                  </button>
                ))}
              </nav>

              <div style={{ borderTop:`1px solid ${C.border}`, padding:16 }}>
                <button style={{ width:"100%", background:"none", border:"none", cursor:"pointer", color:C.red,
                  fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                  <LogOut size={14}/> Déconnexion
                </button>
              </div>
            </div>
          </>
        )}

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 80px" }}>
          {renderPage()}
        </div>

        {/* Bottom navigation */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:`1px solid ${C.border}`,
          display:"flex", height:64, zIndex:50, paddingBottom:"env(safe-area-inset-bottom)" }}>
          {BOTTOM_NAV.map(n=>(
            <button key={n.id} onClick={()=>navigate(n.id)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              background:"none", border:"none", cursor:"pointer", gap:3,
              color:page===n.id?C.primary:C.muted
            }}>
              {n.bottomIcon}
              <span style={{ fontSize:9, fontWeight:page===n.id?700:500 }}>{n.label}</span>
            </button>
          ))}
        </div>

        {toast && <Toast message={toast} onClose={()=>setToast(null)} />}
      </div>
    );
  }

  // ─── DESKTOP LAYOUT ───────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"'Inter', -apple-system, sans-serif", color:C.text, overflow:"hidden" }}>
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
        <div style={{ padding:"10px 12px", borderBottom:`1px solid ${C.border}` }}>
          {notifPermission === "granted" ? (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.green }}><Bell size={13}/> Notifications actives</div>
          ) : (
            <button onClick={handleEnableNotifications} style={{ width:"100%", background:C.primary+"15", border:`1px solid ${C.primary}33`,
              borderRadius:8, padding:"7px 10px", fontSize:11, fontWeight:600, color:C.primary, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Bell size={13}/> Activer les notifications
            </button>
          )}
        </div>
        <nav style={{ flex:1, padding:"8px 0" }}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>navigate(n.id)} style={{
              width:"100%", textAlign:"left", background:page===n.id?C.primary+"15":"none",
              border:"none", cursor:"pointer", borderLeft:page===n.id?`3px solid ${C.primary}`:"3px solid transparent",
              color:page===n.id?C.primary:C.text, padding:"9px 16px", fontSize:12.5,
              fontWeight:page===n.id?700:500, display:"flex", alignItems:"center", gap:10,
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

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:52,
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
