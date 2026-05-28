import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  Bell,
  Bot,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Home,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  Navigation,
  Phone,
  Plus,
  Radio,
  Search,
  Send,
  Settings,
  Shield,
  Sun,
  User,
  Users,
  Wifi,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ThemeName = "light" | "dark";
type AuthView = "studentLogin" | "studentRegister" | "adminLogin";
type UserRole = "student" | "admin" | null;
type MScreen = "home" | "reports" | "reportform" | "sos" | "chat" | "updates" | "profile" | "anonymousReport";
type AScreen = "dashboard" | "alerts" | "messages" | "personnel" | "map" | "analytics" | "settings";
type Status = "Pending" | "Assigned" | "Resolved" | "CRITICAL" | "IN PROGRESS" | "URGENT" | "In Review";

type Location = { lat?: number; lng?: number; label: string };
type Report = {
  id: number;
  cat: string;
  title: string;
  desc: string;
  status: Status;
  date: string;
  loc: string;
  anonymous: boolean;
  userId?: number | null;
};
type Alert = {
  id: number;
  reportId?: number;
  cat: string;
  reporter: string;
  loc: string;
  status: Status;
  date: string;
  icon: string;
};
type Message = { id: number; s: "sec" | "usr"; c: string; t: string };
type Messages = Record<number, Message[]>;
type Update = { id: number; type: string; title: string; desc: string; time: string; read: boolean; icon: string };
type ThemeStyles = { bg: string; text: string; card: string; border: string; muted: string; input: string };

const R = "#C41E3A";
const DR = "#8B0000";
const LR = "#FEF2F2";
const RB = "#FCA5A5";
const BL = "#2563EB";
const GR = "#16A34A";
const PU = "#7C3AED";
const AM = "#D97706";
const BG = "#F8F9FA";
const WH = "#FFFFFF";
const TX = "#111827";
const MT = "#6B7280";
const DARK_BG = "#0F172A";
const DARK_CARD = "#1E293B";
const DARK_TX = "#F1F5F9";
const DARK_MT = "#94A3B8";
const DARK_BORDER = "#334155";

const statusColor = (s: Status | string) =>
  ({ Pending: AM, Assigned: PU, Resolved: GR, CRITICAL: R, "IN PROGRESS": PU, URGENT: R, "In Review": MT })[s] || MT;
const statusBg = (s: Status | string) =>
  ({
    Pending: "#FEF3C7",
    Assigned: "#EDE9FE",
    Resolved: "#D1FAE5",
    CRITICAL: "#FEE2E2",
    "IN PROGRESS": "#EDE9FE",
    URGENT: "#FEE2E2",
    "In Review": "#F3F4F6",
  })[s] || "#F3F4F6";
const catColor = (c: string) =>
  ({
    Theft: AM,
    Security: PU,
    Medical: BL,
    Facilities: MT,
    "Fire Alert": R,
    Harassment: PU,
    Vandalism: AM,
    SOS: R,
  })[c] || MT;

const STUDENT = {
  id: 1,
  name: "Adewale",
  fullName: "Adewale Okafor",
  matric: "20/27KA/01234",
  email: "adewale@kwasu.edu.ng",
  phone: "+234 803 456 7890",
  dept: "Computer Science",
};

const REPS0: Report[] = [
  { id: 1, cat: "Theft", title: "Missing Laptop in Library", desc: "My HP Pavilion laptop went missing.", status: "Pending", date: "Oct 24, 2023", loc: "Main Library", anonymous: false, userId: 1 },
  { id: 2, cat: "Security", title: "Suspicious Activity near Gate 2", desc: "Two individuals hanging around the gate.", status: "Assigned", date: "Oct 22, 2023", loc: "Gate 2", anonymous: false, userId: 1 },
  { id: 3, cat: "Medical", title: "First Aid Request - Faculty Block B", desc: "Student fainted during lecture.", status: "Resolved", date: "Oct 18, 2023", loc: "Faculty Block B", anonymous: false, userId: 1 },
  { id: 4, cat: "Facilities", title: "Broken Streetlight - Hostel Pathway", desc: "Light flickering and dark at night.", status: "Resolved", date: "Oct 15, 2023", loc: "Hostel Pathway", anonymous: false, userId: 1 },
];
const ALTS0: Alert[] = [
  { id: 101, cat: "Fire Alert", reporter: "Abiola Johnson", loc: "Hostel A, Room 302", status: "CRITICAL", date: "Oct 24, 09:12 AM", icon: "Fire" },
  { id: 102, cat: "Medical Emergency", reporter: "Tunde Adeleke", loc: "Faculty of Engineering", status: "IN PROGRESS", date: "Oct 24, 08:45 AM", icon: "Medical" },
  { id: 103, cat: "Suspicious Activity", reporter: "Grace Emmanuel", loc: "University Library Parking", status: "CRITICAL", date: "Oct 23, 08:15 PM", icon: "Alert" },
];
const MSGS0: Messages = {
  1: [],
  2: [
    { id: 1, s: "sec", c: "Good afternoon. This is S.A.F.E. Dispatch. How can we assist?", t: "14:02" },
    { id: 2, s: "usr", c: "I'm at Faculty of Engineering parking lot.", t: "14:05" },
    { id: 3, s: "sec", c: "Understood. Dispatching patrol unit.", t: "14:06" },
  ],
  3: [{ id: 5, s: "sec", c: "Your medical emergency report has been resolved.", t: "10:30" }],
  4: [],
};
const UPDS0: Update[] = [
  { id: 1, type: "assigned", title: "Report Assigned", desc: "'Suspicious Activity near Gate 2' assigned to officer.", time: "Oct 22, 14:30", read: false, icon: "Officer" },
  { id: 2, type: "resolved", title: "Report Resolved", desc: "'First Aid Request' resolved.", time: "Oct 19, 09:15", read: true, icon: "Done" },
  { id: 3, type: "alert", title: "Campus Alert", desc: "Enhanced security patrols near hostel area.", time: "Oct 17, 08:00", read: true, icon: "Alert" },
];
const PERSONNEL = [
  { id: 1, name: "Sgt. Bello Kamoru", role: "Patrol Officer", zone: "North Campus", status: "On Duty" },
  { id: 2, name: "Cpl. Fatima Danjuma", role: "Gate Officer", zone: "Main Gate", status: "On Duty" },
  { id: 3, name: "Sgt. James Adeyemi", role: "Response Officer", zone: "South Campus", status: "On Break" },
  { id: 4, name: "Insp. Grace Okonkwo", role: "Dispatch Officer", zone: "Command Center", status: "On Duty" },
];
const CHARTS = {
  cat: [{ n: "Theft", v: 42 }, { n: "Assault", v: 18 }, { n: "Medical", v: 25 }, { n: "Fire", v: 6 }, { n: "Harassment", v: 30 }, { n: "Vandalism", v: 12 }],
  mon: [{ m: "Jan", v: 12 }, { m: "Feb", v: 19 }, { m: "Mar", v: 8 }, { m: "Apr", v: 30 }, { m: "May", v: 22 }, { m: "Jun", v: 30 }, { m: "Jul", v: 14 }, { m: "Aug", v: 38 }, { m: "Sep", v: 28 }, { m: "Oct", v: 40 }, { m: "Nov", v: 35 }, { m: "Dec", v: 14 }],
};

let nextId = 300;

function Badge({ s }: { s: Status | string }) {
  return (
    <span style={{ background: statusBg(s), color: statusColor(s), padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor(s), display: "inline-block" }} />
      {s}
    </span>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 13 }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>{icon}{children}</div>
    </label>
  );
}

const inputStyle = (theme: ThemeStyles): React.CSSProperties => ({
  width: "100%",
  padding: "12px 13px",
  borderRadius: 10,
  border: `1.5px solid ${theme.border}`,
  background: theme.input,
  color: theme.text,
  outline: "none",
});

function LiveMap({ onLocationSelect, compact = false, initialLocation, setParentLocation }: { onLocationSelect: (l: Location) => void; compact?: boolean; initialLocation?: Location | null; setParentLocation?: (l: Location) => void }) {
  const [pin, setPin] = useState<Location | null>(initialLocation || null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const selectLocation = (loc: Location) => {
    setPin(loc);
    onLocationSelect(loc);
    setParentLocation?.(loc);
  };
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      selectLocation({ label: "Geolocation not supported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => selectLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: `${pos.coords.latitude.toFixed(4)} N, ${pos.coords.longitude.toFixed(4)} E` }),
      () => selectLocation({ lat: 8.483, lng: 4.6728, label: "KWASU Campus (GPS unavailable)" }),
      { timeout: 5000 },
    );
  };
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const lat = 8.483 + (50 - py) * 0.002;
    const lng = 4.6728 + (px - 50) * 0.0015;
    selectLocation({ lat, lng, label: `${lat.toFixed(4)} N, ${lng.toFixed(4)} E` });
  };
  useEffect(() => {
    if (!initialLocation) getUserLocation();
  }, []);
  const left = pin?.lng ? ((pin.lng - 4.6728) / 0.0015 + 50) : 50;
  const top = pin?.lat ? 50 - (pin.lat - 8.483) / 0.002 : 50;
  return (
    <div>
      <div ref={mapRef} onClick={handleMapClick} style={{ width: "100%", height: compact ? 150 : 240, background: "#DCECDC", borderRadius: 12, position: "relative", overflow: "hidden", cursor: "crosshair", border: `1.5px solid ${RB}` }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <line x1="0" y1="38%" x2="100%" y2="38%" stroke="#fff" strokeWidth="9" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="rgba(255,255,255,.75)" strokeWidth="6" />
          <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#fff" strokeWidth="7" />
          <line x1="62%" y1="0" x2="62%" y2="100%" stroke="rgba(255,255,255,.8)" strokeWidth="5" />
          {["#d4e8d4", "#d4d4e8", "#e8d4d4", "#d4e8e8", "#e8e8d4", "#e8d4e8"].map((fill, i) => (
            <rect key={fill} x={`${8 + (i % 3) * 30}%`} y={`${12 + Math.floor(i / 3) * 40}%`} width="20%" height="17%" fill={fill} stroke="rgba(0,0,0,.15)" />
          ))}
        </svg>
        {pin && (
          <div style={{ position: "absolute", left: `${Math.max(2, Math.min(98, left))}%`, top: `${Math.max(2, Math.min(98, top))}%`, transform: "translate(-50%,-100%)" }}>
            <div style={{ background: R, color: WH, borderRadius: "50% 50% 50% 0", width: 28, height: 28, display: "grid", placeItems: "center", transform: "rotate(-45deg)", boxShadow: "0 3px 10px rgba(0,0,0,.3)" }}>
              <MapPin size={14} style={{ transform: "rotate(45deg)" }} />
            </div>
          </div>
        )}
        <div style={{ position: "absolute", top: 6, left: 8, background: "rgba(255,255,255,.86)", borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700, color: TX }}>KWASU Campus</div>
      </div>
      <button onClick={getUserLocation} style={{ marginTop: 8, background: R, color: WH, border: 0, borderRadius: 20, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        <Navigation size={13} /> Use My Live Location
      </button>
    </div>
  );
}

function AIChat({ userLocation, onClose }: { userLocation: Location | null; onClose: () => void }) {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hello. I am S.A.F.E. AI Assistant. How can I help you stay safe on campus today?" }]);
  const [input, setInput] = useState("");
  const btm = useRef<HTMLDivElement | null>(null);
  useEffect(() => btm.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((p) => [...p, { role: "user", text }]);
    setInput("");
    window.setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "Please stay calm. Use SOS for immediate danger or submit a report for non-emergency incidents.";
      if (lower.includes("theft")) reply = "Report theft immediately and include the exact location, item details, and any witnesses.";
      if (lower.includes("location")) reply = `Your current area is ${userLocation?.label || "KWASU campus"}. The closest security post is Main Gate.`;
      setMessages((p) => [...p, { role: "assistant", text: reply }]);
    }, 350);
  };
  return (
    <div className="ai-chat" style={{ position: "fixed", bottom: 80, right: 20, width: 330, height: 480, background: WH, color: TX, borderRadius: 18, boxShadow: "0 10px 40px rgba(0,0,0,.3)", display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden" }}>
      <div style={{ background: R, padding: "12px 16px", color: WH, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ display: "flex", alignItems: "center", gap: 8 }}><Bot size={18} /> S.A.F.E. AI Assistant</strong>
        <button onClick={onClose} style={{ background: "transparent", border: 0, color: WH, cursor: "pointer" }}><X size={18} /></button>
      </div>
      <div style={{ padding: 12, background: "#F1F5F9", borderBottom: "1px solid #E2E8F0", fontSize: 12 }}>
        <strong>Recent events near you</strong>
        <div style={{ color: MT, marginTop: 6 }}>Theft near Library (120m), suspicious persons near Gate 2 (450m)</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "82%", background: m.role === "user" ? R : "#E2E8F0", color: m.role === "user" ? WH : TX, borderRadius: 12, padding: "8px 12px", fontSize: 13 }}>{m.text}</div>
        ))}
        <div ref={btm} />
      </div>
      <div style={{ padding: 10, borderTop: "1px solid #E2E8F0", display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about safety..." style={{ ...inputStyle({ bg: "", text: TX, card: WH, border: "#CBD5E1", muted: MT, input: WH }), borderRadius: 20 }} />
        <button onClick={send} style={{ background: R, color: WH, border: 0, borderRadius: 20, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}

function StudentLogin({ onLogin, onRegister, onAdmin }: { onLogin: () => void; onRegister: () => void; onAdmin: () => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div style={{ flex: 1, background: R, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "50px 24px 28px", minHeight: "calc(100vh - 44px)" }}>
      <div style={{ textAlign: "center", color: WH }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: WH, display: "grid", placeItems: "center", margin: "0 auto 14px", boxShadow: "0 6px 24px rgba(0,0,0,.25)" }}><Shield size={48} color={R} /></div>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>S.A.F.E. KWASU</div>
        <div style={{ opacity: 0.82, fontSize: 12, fontStyle: "italic", marginTop: 4 }}>Smart Alert and Field Emergency System</div>
      </div>
      <div style={{ background: WH, color: TX, borderRadius: 20, padding: "26px 22px", width: "100%", maxWidth: 430, boxShadow: "0 8px 30px rgba(0,0,0,.2)" }}>
        <Field label="University Email" icon={<MessageSquare size={14} color={MT} />}><input defaultValue="adewale@kwasu.edu.ng" style={inputStyle({ bg: "", text: TX, card: WH, border: "#E5E7EB", muted: MT, input: "#F3F4F6" })} /></Field>
        <Field label="Secure Password" icon={<Lock size={14} color={MT} />}>
          <input type={showPw ? "text" : "password"} defaultValue="password" style={inputStyle({ bg: "", text: TX, card: WH, border: "#E5E7EB", muted: MT, input: "#F3F4F6" })} />
          <button onClick={() => setShowPw((p) => !p)} style={{ border: 0, background: "transparent", cursor: "pointer" }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </Field>
        <button onClick={onLogin} style={{ width: "100%", background: DR, color: WH, border: 0, borderRadius: 12, padding: 13, fontWeight: 800, cursor: "pointer" }}>Login</button>
        <div style={{ textAlign: "center", marginTop: 13, fontSize: 12, color: MT }}>New to S.A.F.E.? <button onClick={onRegister} style={{ color: R, fontWeight: 800, border: 0, background: "transparent", textDecoration: "underline", cursor: "pointer" }}>Register</button></div>
        <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 14, paddingTop: 12, textAlign: "center" }}>
          <button onClick={onAdmin} style={{ background: "none", border: 0, color: MT, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>Admin Access</button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.65, color: WH, fontSize: 10, letterSpacing: 2 }}><Shield size={11} /> ENCRYPTED CONNECTION</div>
    </div>
  );
}

function StudentRegister({ theme, onBack, onDone }: { theme: ThemeStyles; onBack: () => void; onDone: () => void }) {
  return (
    <Screen theme={theme} title="Create Account" subtitle="Join the campus safety network to receive alerts and stay protected." onBack={onBack}>
      {["Full Name", "University Email", "Phone Number", "Matric / Staff ID"].map((label) => (
        <Field key={label} label={label}><input placeholder={label} style={inputStyle(theme)} /></Field>
      ))}
      <Field label="Password"><input type="password" placeholder="Password" style={inputStyle(theme)} /></Field>
      <button onClick={onDone} style={primaryBtn(DR)}>Create Account</button>
    </Screen>
  );
}

function AdminLogin({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [showKey, setShowKey] = useState(false);
  return (
    <div style={{ flex: 1, minHeight: "calc(100vh - 44px)", display: "grid", placeItems: "center", background: `linear-gradient(135deg,${DR},${R})`, padding: 24 }}>
      <div style={{ background: WH, color: TX, borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 390, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <button onClick={onBack} style={{ border: 0, background: "transparent", color: R, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}><ArrowLeft size={16} /> Student login</button>
        <div style={{ textAlign: "center", marginBottom: 22 }}><Shield size={42} color={R} /><div style={{ fontWeight: 900, fontSize: 20, color: R }}>Admin Gateway</div><div style={{ fontSize: 12, color: MT }}>S.A.F.E. KWASU Management System</div></div>
        <Field label="Work Email"><input defaultValue="security@kwasu.edu.ng" style={inputStyle({ bg: "", text: TX, card: WH, border: "#E5E7EB", muted: MT, input: "#F3F4F6" })} /></Field>
        <Field label="Security Key" icon={<Lock size={14} color={MT} />}>
          <input type={showKey ? "text" : "password"} defaultValue="safe-admin" style={inputStyle({ bg: "", text: TX, card: WH, border: "#E5E7EB", muted: MT, input: "#F3F4F6" })} />
          <button onClick={() => setShowKey((p) => !p)} style={{ border: 0, background: "transparent", cursor: "pointer" }}>{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </Field>
        <button onClick={onLogin} style={primaryBtn(R)}>Access Dashboard</button>
      </div>
    </div>
  );
}

function Screen({ theme, title, subtitle, onBack, children }: { theme: ThemeStyles; title: string; subtitle?: string; onBack?: () => void; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, background: theme.bg, color: theme.text, overflowY: "auto" }}>
      <div style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 8, background: theme.card, borderBottom: `1px solid ${theme.border}` }}>
        {onBack && <button onClick={onBack} style={{ border: 0, background: "transparent", cursor: "pointer", color: theme.text }}><ArrowLeft size={18} /></button>}
        <Shield size={15} color={R} /><strong style={{ color: R, fontSize: 13 }}>S.A.F.E.KWASU</strong>
      </div>
      <div style={{ padding: "22px 18px", maxWidth: 820, width: "100%", margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 3px", fontSize: 24 }}>{title}</h1>
        {subtitle && <p style={{ margin: "0 0 22px", color: theme.muted, fontSize: 13 }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function primaryBtn(bg: string): React.CSSProperties {
  return { width: "100%", background: bg, color: WH, border: 0, borderRadius: 12, padding: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
}

function StudentHome({ theme, setMS, setShowAIChat }: { theme: ThemeStyles; setMS: (s: MScreen) => void; setShowAIChat: (v: boolean) => void }) {
  const actions: { l: string; s: string; bg: string; ic: React.ReactNode; to: MScreen }[] = [
    { l: "Report Incident", s: "Security or hazard", bg: BL, ic: <Radio size={18} />, to: "reportform" },
    { l: "SOS Alert", s: "Immediate response", bg: R, ic: <Activity size={18} />, to: "sos" },
    { l: "My Reports", s: "History and status", bg: GR, ic: <FileText size={18} />, to: "reports" },
    { l: "Messages", s: "Security chat", bg: PU, ic: <MessageSquare size={18} />, to: "chat" },
    { l: "Anonymous Report", s: "Private tip-off", bg: AM, ic: <Shield size={18} />, to: "anonymousReport" },
  ];
  return (
    <Screen theme={theme} title={`Hello, ${STUDENT.name}`} subtitle="Stay safe and alert on campus today.">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><button onClick={() => setShowAIChat(true)} style={{ border: 0, background: "#E2E8F0", color: TX, borderRadius: 20, padding: "7px 12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Bot size={15} color={R} /> AI Chat</button></div>
      <div style={{ background: R, borderRadius: 14, padding: 16, marginBottom: 20, color: WH, display: "flex", gap: 12, alignItems: "center" }}><Bell /><div><strong>CAMPUS STATUS: HIGH ALERT</strong><div style={{ fontSize: 12, opacity: 0.86, marginTop: 2 }}>Heavy rain expected. Avoid low-lying areas near Faculty of ICT.</div></div></div>
      <div className="student-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
        {actions.map((a) => (
          <button key={a.l} onClick={() => setMS(a.to)} style={{ background: a.bg, color: WH, border: 0, borderRadius: 14, padding: "16px 14px", textAlign: "left", cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", marginBottom: 9 }}>{a.ic}</div>
            <div style={{ fontWeight: 800 }}>{a.l}</div><div style={{ fontSize: 12, opacity: 0.8 }}>{a.s}</div>
          </button>
        ))}
      </div>
    </Screen>
  );
}

function ReportsScreen({ theme, reports, messages, setCRId, setMS }: { theme: ThemeStyles; reports: Report[]; messages: Messages; setCRId: (id: number) => void; setMS: (s: MScreen) => void }) {
  return (
    <Screen theme={theme} title="Reports" subtitle="Track the status of your reported incidents.">
      {reports.map((r) => (
        <div key={r.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 15, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}><span style={{ background: `${catColor(r.cat)}22`, color: catColor(r.cat), padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{r.cat}{r.anonymous ? " / Anonymous" : ""}</span><Badge s={r.status} /></div>
          <div style={{ color: theme.muted, fontSize: 11 }}>{r.date} - {r.loc}</div>
          <strong style={{ display: "block", marginTop: 5 }}>{r.title}</strong>
          <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.5 }}>{r.desc}</p>
          <button onClick={() => { setCRId(r.id); setMS("chat"); }} style={{ border: 0, background: "transparent", color: PU, padding: 0, fontWeight: 800, cursor: "pointer" }}>Messages ({messages[r.id]?.length || 0})</button>
        </div>
      ))}
      <button onClick={() => setMS("reportform")} style={primaryBtn(R)}><Plus size={16} /> New Report</button>
    </Screen>
  );
}

function ReportForm({ theme, setMS, submitReport, userLiveLocation, setUserLiveLocation, anonymous = false }: { theme: ThemeStyles; setMS: (s: MScreen) => void; submitReport: (f: { cat: string; title: string; desc: string; loc: string }, anonymous: boolean) => void; userLiveLocation: Location | null; setUserLiveLocation: (l: Location) => void; anonymous?: boolean }) {
  const [f, setF] = useState({ cat: "", desc: "", loc: userLiveLocation?.label || "Fetching location...", title: "" });
  useEffect(() => { if (userLiveLocation) setF((p) => ({ ...p, loc: userLiveLocation.label })); }, [userLiveLocation]);
  return (
    <Screen theme={theme} title={anonymous ? "Anonymous Report" : "Report Incident"} subtitle={anonymous ? "Your identity will not be recorded." : "Provide accurate details to assist campus security."} onBack={() => setMS("home")}>
      <Field label="Incident Category"><div style={{ position: "relative", width: "100%" }}><select value={f.cat} onChange={(e) => setF((p) => ({ ...p, cat: e.target.value }))} style={{ ...inputStyle(theme), appearance: "none" }}><option value="">Select category</option>{["Theft", "Medical", "Security", "Fire Alert", "Harassment", "Vandalism", "Facilities", "Other"].map((c) => <option key={c}>{c}</option>)}</select><ChevronDown size={15} color={R} style={{ position: "absolute", right: 12, top: 13 }} /></div></Field>
      <Field label="Incident Title"><input value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} placeholder="Brief title" style={inputStyle(theme)} /></Field>
      <Field label="Incident Description"><textarea value={f.desc} onChange={(e) => setF((p) => ({ ...p, desc: e.target.value }))} placeholder="Describe what happened..." style={{ ...inputStyle(theme), minHeight: 110, resize: "vertical" }} /></Field>
      <Field label="Current Location"><LiveMap onLocationSelect={(loc) => setF((p) => ({ ...p, loc: loc.label }))} compact initialLocation={userLiveLocation} setParentLocation={setUserLiveLocation} /></Field>
      <button onClick={() => submitReport(f, anonymous)} disabled={!f.cat || !f.desc.trim()} style={{ ...primaryBtn(f.cat && f.desc.trim() ? DR : "#9CA3AF"), cursor: f.cat && f.desc.trim() ? "pointer" : "not-allowed" }}>{anonymous ? "Submit Anonymous Report" : "Submit Report"}</button>
    </Screen>
  );
}

function ChatScreen({ theme, chatRepId, setCRId, messages, reports, sendMsg, setMS }: { theme: ThemeStyles; chatRepId: number | null; setCRId: (id: number | null) => void; messages: Messages; reports: Report[]; sendMsg: (id: number, msg: string, side: "student" | "admin") => void; setMS: (s: MScreen) => void }) {
  const [inp, setInp] = useState("");
  const rep = reports.find((r) => r.id === chatRepId);
  const send = () => { if (rep) { sendMsg(rep.id, inp, "student"); setInp(""); } };
  if (!rep) {
    return (
      <Screen theme={theme} title="Messages" subtitle="Select a report thread to message security." onBack={() => setMS("home")}>
        {reports.map((r) => <button key={r.id} onClick={() => setCRId(r.id)} style={{ width: "100%", textAlign: "left", background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, marginBottom: 8, cursor: "pointer" }}><strong>{r.title}</strong><div style={{ color: theme.muted, fontSize: 12 }}>{r.cat} - {messages[r.id]?.length || 0} messages</div></button>)}
      </Screen>
    );
  }
  return (
    <Screen theme={theme} title="Security Dispatch Chat" subtitle={`${rep.title} - ${rep.status}`} onBack={() => setCRId(null)}>
      <div style={{ minHeight: 320, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
        {(messages[rep.id] || []).map((m) => <div key={m.id} style={{ display: "flex", justifyContent: m.s === "usr" ? "flex-end" : "flex-start", marginBottom: 10 }}><div style={{ maxWidth: "76%", background: m.s === "usr" ? R : theme.input, color: m.s === "usr" ? WH : theme.text, borderRadius: 14, padding: "9px 12px" }}>{m.c}<div style={{ color: m.s === "usr" ? "rgba(255,255,255,.7)" : theme.muted, fontSize: 10, marginTop: 3 }}>{m.t}</div></div></div>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}><input value={inp} onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message..." style={inputStyle(theme)} /><button onClick={send} style={{ background: R, color: WH, border: 0, borderRadius: 12, padding: "0 16px", cursor: "pointer" }}><Send size={16} /></button></div>
    </Screen>
  );
}

function UpdatesScreen({ theme, updates, markUpdatesRead }: { theme: ThemeStyles; updates: Update[]; markUpdatesRead: () => void }) {
  return (
    <Screen theme={theme} title="Updates" subtitle="Your latest security notifications.">
      <button onClick={markUpdatesRead} style={{ ...primaryBtn(R), maxWidth: 180, marginBottom: 14 }}>Mark all read</button>
      {updates.map((u) => <div key={u.id} style={{ background: theme.card, borderLeft: `4px solid ${u.read ? theme.border : R}`, borderRadius: 12, padding: 14, marginBottom: 10 }}><strong>{u.title}</strong><p style={{ color: theme.muted, fontSize: 13 }}>{u.desc}</p><span style={{ color: theme.muted, fontSize: 11 }}><Clock size={11} /> {u.time}</span></div>)}
    </Screen>
  );
}

function ProfileScreen({ theme, reports, updates, logout }: { theme: ThemeStyles; reports: Report[]; updates: Update[]; logout: () => void }) {
  return (
    <Screen theme={theme} title={STUDENT.fullName} subtitle={`Student - ${STUDENT.dept}`}>
      {[["Matric Number", STUDENT.matric], ["Email Address", STUDENT.email], ["Phone Number", STUDENT.phone], ["Total Reports", reports.length], ["Unread Updates", updates.filter((u) => !u.read).length]].map(([l, v]) => <div key={l} style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: 13, borderRadius: 10, marginBottom: 8 }}><span style={{ color: theme.muted, fontSize: 12 }}>{l}</span><strong style={{ display: "block" }}>{v}</strong></div>)}
      <button onClick={logout} style={{ ...primaryBtn(LR), color: R }}><LogOut size={16} /> Sign Out</button>
    </Screen>
  );
}

function SOSSreen({ theme, userLiveLocation, setAlerts, notify, setMS }: { theme: ThemeStyles; userLiveLocation: Location | null; setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>; notify: (m: string, t?: string) => void; setMS: (s: MScreen) => void }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const sendSOS = () => {
    if (state !== "idle") return;
    setState("sending");
    window.setTimeout(() => {
      setState("sent");
      setAlerts((p) => [{ id: nextId++, cat: "SOS", reporter: STUDENT.fullName, loc: userLiveLocation?.label || "KWASU Main Campus", status: "CRITICAL", date: new Date().toLocaleString(), icon: "SOS" }, ...p]);
      notify("SOS Alert sent. Security dispatched.", "sos");
    }, 700);
  };
  return (
    <div style={{ flex: 1, background: R, color: WH, display: "grid", placeItems: "center", padding: 22, textAlign: "center" }}>
      <div style={{ maxWidth: 460 }}>
        <h1>EMERGENCY MODE</h1>
        <p style={{ opacity: 0.86 }}>Dispatch center is monitoring. Immediate response teams are on standby.</p>
        <button onClick={sendSOS} style={{ width: 170, height: 170, borderRadius: "50%", border: 0, background: WH, color: R, fontSize: 28, fontWeight: 900, cursor: "pointer", margin: "28px auto", display: "grid", placeItems: "center" }}>{state === "sent" ? <CheckCircle size={52} /> : state === "sending" ? "Sending" : "SOS"}</button>
        <div style={{ background: "rgba(0,0,0,.22)", borderRadius: 13, padding: 14, marginBottom: 14 }}><MapPin size={16} /> {userLiveLocation?.label || "Fetching location..."}</div>
        <button onClick={() => { setState("idle"); setMS("home"); }} style={{ ...primaryBtn("rgba(0,0,0,.22)"), border: "1px solid rgba(255,255,255,.35)" }}><X size={15} /> Cancel</button>
      </div>
    </div>
  );
}

function BottomNav({ theme, mScreen, setMS, updates }: { theme: ThemeStyles; mScreen: MScreen; setMS: (s: MScreen) => void; updates: Update[] }) {
  const active = mScreen === "chat" ? "reports" : ["reportform", "anonymousReport"].includes(mScreen) ? "reports" : mScreen;
  const items: { id: MScreen; l: string; ic: React.ReactNode; badge?: number }[] = [
    { id: "home", l: "Home", ic: <Home size={19} /> },
    { id: "reports", l: "Reports", ic: <Radio size={19} /> },
    { id: "updates", l: "Updates", ic: <Bell size={19} />, badge: updates.filter((u) => !u.read).length },
    { id: "profile", l: "Profile", ic: <User size={19} /> },
  ];
  return (
    <nav style={{ background: theme.card, borderTop: `1px solid ${theme.border}`, display: "flex" }}>
      {items.map((i) => <button key={i.id} onClick={() => setMS(i.id)} style={{ flex: 1, border: 0, background: active === i.id ? R : theme.card, color: active === i.id ? WH : theme.muted, padding: "9px 0 7px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>{i.ic}<span style={{ fontSize: 10, fontWeight: 700 }}>{i.l}</span>{Boolean(i.badge) && active !== i.id && <span style={{ position: "absolute", top: 5, right: "25%", background: R, color: WH, minWidth: 15, height: 15, borderRadius: 8, fontSize: 9 }}>{i.badge}</span>}</button>)}
    </nav>
  );
}

function AdminShell({ theme, aScreen, setAS, children }: { theme: ThemeStyles; aScreen: AScreen; setAS: (s: AScreen) => void; children: React.ReactNode }) {
  const items: { id: AScreen; icon: React.ReactNode }[] = [
    { id: "dashboard", icon: <BarChart2 size={15} /> },
    { id: "alerts", icon: <AlertTriangle size={15} /> },
    { id: "messages", icon: <MessageSquare size={15} /> },
    { id: "personnel", icon: <Users size={15} /> },
    { id: "map", icon: <MapPin size={15} /> },
    { id: "analytics", icon: <BarChart2 size={15} /> },
    { id: "settings", icon: <Settings size={15} /> },
  ];
  return (
    <div className="admin-shell" style={{ display: "flex", flex: 1, minHeight: 0, color: theme.text }}>
      <aside className="admin-sidebar" style={{ width: 230, background: theme.card, borderRight: `1px solid ${theme.border}`, padding: "18px 10px" }}>
        <strong style={{ color: R, fontSize: 13, display: "block", margin: "0 8px 14px" }}>S.A.F.E. COMMAND</strong>
        {items.map((i) => <button key={i.id} onClick={() => setAS(i.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, textAlign: "left", padding: "9px 12px", marginBottom: 4, background: aScreen === i.id ? R : "transparent", color: aScreen === i.id ? WH : theme.text, border: 0, borderRadius: 8, cursor: "pointer", fontWeight: aScreen === i.id ? 800 : 500 }}>{i.icon}{i.id[0].toUpperCase() + i.id.slice(1)}</button>)}
      </aside>
      <main style={{ flex: 1, overflow: "auto", padding: 18, background: theme.bg }}>{children}</main>
    </div>
  );
}

function StatCard({ theme, icon, label, value, color }: { theme: ThemeStyles; icon: React.ReactNode; label: string; value: number; color: string }) {
  return <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 13, padding: 16 }}>{icon}<div style={{ fontSize: 28, fontWeight: 900, color, marginTop: 4 }}>{value}</div><div style={{ fontSize: 12, color: theme.muted }}>{label}</div></div>;
}

function Dashboard({ theme, reports, alerts, assignRep, resolveRep, setAS }: { theme: ThemeStyles; reports: Report[]; alerts: Alert[]; assignRep: (id: number) => void; resolveRep: (id: number) => void; setAS: (s: AScreen) => void }) {
  return (
    <div>
      <h2 style={{ marginTop: 0, color: R }}>Incident Control Dashboard</h2>
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
        <StatCard theme={theme} icon={<FileText size={18} color={theme.muted} />} label="Total Reports" value={reports.length} color={theme.text} />
        <StatCard theme={theme} icon={<AlertTriangle size={18} color={R} />} label="Pending" value={reports.filter((r) => r.status === "Pending").length} color={R} />
        <StatCard theme={theme} icon={<Users size={18} color={PU} />} label="Assigned" value={reports.filter((r) => r.status === "Assigned").length} color={PU} />
        <StatCard theme={theme} icon={<CheckCircle size={18} color={GR} />} label="Resolved" value={reports.filter((r) => r.status === "Resolved").length} color={GR} />
      </div>
      <AdminTable theme={theme} reports={reports.slice(0, 5)} assignRep={assignRep} resolveRep={resolveRep} />
      {alerts.some((a) => a.status === "CRITICAL") && <div style={{ background: R, color: WH, borderRadius: 13, padding: 15, marginTop: 14 }}><strong>ACTIVE EMERGENCY</strong><p>{alerts.filter((a) => a.status === "CRITICAL").length} critical alert(s) require response.</p><button onClick={() => setAS("alerts")} style={{ ...primaryBtn(WH), color: R, maxWidth: 160 }}>Respond</button></div>}
    </div>
  );
}

function AdminTable({ theme, reports, assignRep, resolveRep }: { theme: ThemeStyles; reports: Report[]; assignRep: (id: number) => void; resolveRep: (id: number) => void }) {
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 13, padding: 16, overflowX: "auto" }}>
      <strong>Recent Incidents</strong>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, minWidth: 620 }}>
        <thead><tr>{["Category", "Title", "Location", "Status", "Action"].map((h) => <th key={h} style={{ textAlign: "left", fontSize: 11, color: theme.muted, borderBottom: `1px solid ${theme.border}`, padding: 9 }}>{h}</th>)}</tr></thead>
        <tbody>{reports.map((r) => <tr key={r.id}><td style={{ padding: 9 }}>{r.cat}</td><td style={{ padding: 9 }}>{r.title}</td><td style={{ padding: 9, color: theme.muted }}>{r.loc}</td><td style={{ padding: 9 }}><Badge s={r.status} /></td><td style={{ padding: 9 }}>{r.status === "Pending" && <button onClick={() => assignRep(r.id)} style={{ marginRight: 5, background: PU, color: WH, border: 0, borderRadius: 6, padding: "5px 9px", cursor: "pointer" }}>Assign</button>}{r.status !== "Resolved" && <button onClick={() => resolveRep(r.id)} style={{ background: GR, color: WH, border: 0, borderRadius: 6, padding: "5px 9px", cursor: "pointer" }}>Resolve</button>}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function AlertsAdmin({ theme, alerts, ackAlert, resolveAlert }: { theme: ThemeStyles; alerts: Alert[]; ackAlert: (id: number) => void; resolveAlert: (id: number) => void }) {
  return <div><h2 style={{ color: R }}>Live Alerts</h2>{alerts.map((a) => <div key={a.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderLeft: `4px solid ${statusColor(a.status)}`, borderRadius: 12, padding: 14, marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><strong>{a.cat}</strong><Badge s={a.status} /></div><p style={{ color: theme.muted }}>{a.reporter} - {a.loc} - {a.date}</p>{a.status !== "Resolved" && <><button onClick={() => ackAlert(a.id)} style={{ background: PU, color: WH, border: 0, borderRadius: 7, padding: "7px 11px", marginRight: 8, cursor: "pointer" }}>Acknowledge</button><button onClick={() => resolveAlert(a.id)} style={{ background: GR, color: WH, border: 0, borderRadius: 7, padding: "7px 11px", cursor: "pointer" }}>Resolve</button></>}</div>)}</div>;
}

function AdminMessages({ theme, reports, messages, sendMsg }: { theme: ThemeStyles; reports: Report[]; messages: Messages; sendMsg: (id: number, msg: string, side: "student" | "admin") => void }) {
  const [active, setActive] = useState(reports[0]?.id || 0);
  const [draft, setDraft] = useState("");
  const rep = reports.find((r) => r.id === active);
  return (
    <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12 }}>
      <div>{reports.map((r) => <button key={r.id} onClick={() => setActive(r.id)} style={{ width: "100%", textAlign: "left", padding: 12, marginBottom: 8, borderRadius: 10, border: `1px solid ${theme.border}`, background: active === r.id ? LR : theme.card, color: active === r.id ? R : theme.text, cursor: "pointer" }}><strong>{r.title}</strong><div style={{ fontSize: 12 }}>{messages[r.id]?.length || 0} messages</div></button>)}</div>
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14 }}>{rep ? <><h2 style={{ marginTop: 0 }}>{rep.title}</h2><div style={{ minHeight: 300 }}>{(messages[rep.id] || []).map((m) => <p key={m.id} style={{ textAlign: m.s === "sec" ? "right" : "left" }}><span style={{ display: "inline-block", background: m.s === "sec" ? R : theme.input, color: m.s === "sec" ? WH : theme.text, borderRadius: 12, padding: "8px 11px" }}>{m.c}</span></p>)}</div><div style={{ display: "flex", gap: 8 }}><input value={draft} onChange={(e) => setDraft(e.target.value)} style={inputStyle(theme)} placeholder="Reply to student..." /><button onClick={() => { sendMsg(rep.id, draft, "admin"); setDraft(""); }} style={{ background: R, color: WH, border: 0, borderRadius: 10, padding: "0 14px" }}>Send</button></div></> : "No report selected"}</div>
    </div>
  );
}

function PersonnelAdmin({ theme }: { theme: ThemeStyles }) {
  return <div><h2 style={{ color: R }}>Personnel</h2>{PERSONNEL.map((p) => <div key={p.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 12 }}><div><strong>{p.name}</strong><div style={{ color: theme.muted, fontSize: 13 }}>{p.role} - {p.zone}</div></div><Badge s={p.status} /></div>)}</div>;
}

function AnalyticsAdmin({ theme, reports }: { theme: ThemeStyles; reports: Report[] }) {
  const pieData = [
    { name: "Resolved", value: reports.filter((r) => r.status === "Resolved").length || 1 },
    { name: "Open", value: reports.filter((r) => r.status !== "Resolved").length || 1 },
  ];
  return <div><h2 style={{ color: R }}>Analytics</h2><div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, height: 320 }}><ResponsiveContainer><BarChart data={CHARTS.cat}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="n" /><YAxis /><Tooltip /><Bar dataKey="v" fill={R} /></BarChart></ResponsiveContainer></div><div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, height: 320 }}><ResponsiveContainer><AreaChart data={CHARTS.mon}><XAxis dataKey="m" /><YAxis /><Tooltip /><Area type="monotone" dataKey="v" fill={RB} stroke={R} /></AreaChart></ResponsiveContainer></div><div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, height: 300 }}><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" outerRadius={90}>{pieData.map((_, i) => <Cell key={i} fill={[GR, AM][i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div></div>;
}

export default function App() {
  const [theme, setTheme] = useState<ThemeName>("light");
  const themeStyles: ThemeStyles = theme === "light"
    ? { bg: BG, text: TX, card: WH, border: "#E5E7EB", muted: MT, input: "#F9FAFB" }
    : { bg: DARK_BG, text: DARK_TX, card: DARK_CARD, border: DARK_BORDER, muted: DARK_MT, input: "#0F172A" };
  const [reports, setReports] = useState<Report[]>(REPS0);
  const [alerts, setAlerts] = useState<Alert[]>(ALTS0);
  const [messages, setMessages] = useState<Messages>(MSGS0);
  const [updates, setUpdates] = useState<Update[]>(UPDS0);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [userLiveLocation, setUserLiveLocation] = useState<Location | null>(null);
  const [authView, setAuthView] = useState<AuthView>("studentLogin");
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [mScreen, setMS] = useState<MScreen>("home");
  const [aScreen, setAS] = useState<AScreen>("dashboard");
  const [chatRepId, setCRId] = useState<number | null>(2);
  const notify = (msg: string, type = "ok") => { setToast({ msg, type }); window.setTimeout(() => setToast(null), 3000); };
  const generateId = () => nextId++;

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLiveLocation({ label: "Geolocation not supported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLiveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: `${pos.coords.latitude.toFixed(4)} N, ${pos.coords.longitude.toFixed(4)} E` }),
      () => setUserLiveLocation({ lat: 8.483, lng: 4.6728, label: "KWASU Campus (GPS unavailable)" }),
      { timeout: 5000 },
    );
  }, []);

  const submitReport = (f: { cat: string; title: string; desc: string; loc: string }, anonymous = false) => {
    if (!f.cat || !f.desc.trim()) {
      notify("Please fill in category and description.", "warn");
      return;
    }
    const reportId = generateId();
    const r: Report = {
      id: reportId,
      cat: f.cat,
      title: f.title.trim() || `New ${f.cat} Report`,
      desc: f.desc.trim(),
      status: "Pending",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      loc: f.loc || userLiveLocation?.label || "KWASU Campus",
      anonymous,
      userId: anonymous ? null : STUDENT.id,
    };
    setReports((p) => [r, ...p]);
    setMessages((p) => ({ ...p, [reportId]: [] }));
    setAlerts((p) => [{ id: generateId(), reportId, cat: r.cat, reporter: anonymous ? "Anonymous" : STUDENT.fullName, loc: r.loc, status: "URGENT", date: new Date().toLocaleString(), icon: "Report" }, ...p]);
    setMS("reports");
    notify(anonymous ? "Anonymous report submitted." : "Report submitted. Admin alerted.");
  };

  const assignRep = (id: number) => {
    setReports((p) => p.map((r) => r.id === id ? { ...r, status: "Assigned" } : r));
    setUpdates((p) => [{ id: generateId(), type: "assigned", title: "Report Assigned", desc: "Your report has been assigned to a security officer.", time: new Date().toLocaleTimeString(), read: false, icon: "Officer" }, ...p]);
    notify("Report assigned.");
  };
  const resolveRep = (id: number) => {
    setReports((p) => p.map((r) => r.id === id ? { ...r, status: "Resolved" } : r));
    setAlerts((p) => p.map((a) => a.reportId === id ? { ...a, status: "Resolved" } : a));
    setUpdates((p) => [{ id: generateId(), type: "resolved", title: "Report Resolved", desc: "Your report has been marked resolved by security.", time: new Date().toLocaleTimeString(), read: false, icon: "Done" }, ...p]);
    notify("Report resolved.");
  };
  const resolveAlert = (id: number) => { setAlerts((p) => p.map((a) => a.id === id ? { ...a, status: "Resolved" } : a)); notify("Alert resolved."); };
  const ackAlert = (id: number) => { setAlerts((p) => p.map((a) => a.id === id ? { ...a, status: "IN PROGRESS" } : a)); notify("Alert acknowledged."); };
  const sendMsg = (repId: number, content: string, side: "student" | "admin") => {
    const text = content.trim();
    if (!text) return;
    const m: Message = { id: generateId(), s: side === "admin" ? "sec" : "usr", c: text, t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((p) => ({ ...p, [repId]: [...(p[repId] || []), m] }));
    if (side === "admin") setUpdates((p) => [{ id: generateId(), type: "message", title: "New Message", desc: `Security replied to your Report #${repId}.`, time: new Date().toLocaleTimeString(), read: false, icon: "Message" }, ...p]);
    notify(side === "admin" ? "Message sent to reporter." : `New message on Report #${repId}.`);
  };
  const markUpdatesRead = () => setUpdates((p) => p.map((u) => ({ ...u, read: true })));
  const logout = () => { setUserRole(null); setAuthView("studentLogin"); setMS("home"); setAS("dashboard"); setShowAIChat(false); };

  const studentScreen = useMemo(() => {
    const map: Record<MScreen, React.ReactNode> = {
      home: <StudentHome theme={themeStyles} setMS={setMS} setShowAIChat={setShowAIChat} />,
      reports: <ReportsScreen theme={themeStyles} reports={reports} messages={messages} setCRId={(id) => setCRId(id)} setMS={setMS} />,
      reportform: <ReportForm theme={themeStyles} setMS={setMS} submitReport={submitReport} userLiveLocation={userLiveLocation} setUserLiveLocation={setUserLiveLocation} />,
      anonymousReport: <ReportForm theme={themeStyles} setMS={setMS} submitReport={submitReport} userLiveLocation={userLiveLocation} setUserLiveLocation={setUserLiveLocation} anonymous />,
      sos: <SOSSreen theme={themeStyles} userLiveLocation={userLiveLocation} setAlerts={setAlerts} notify={notify} setMS={setMS} />,
      chat: <ChatScreen theme={themeStyles} chatRepId={chatRepId} setCRId={setCRId} messages={messages} reports={reports} sendMsg={sendMsg} setMS={setMS} />,
      updates: <UpdatesScreen theme={themeStyles} updates={updates} markUpdatesRead={markUpdatesRead} />,
      profile: <ProfileScreen theme={themeStyles} reports={reports} updates={updates} logout={logout} />,
    };
    return map[mScreen];
  }, [mScreen, themeStyles, reports, messages, updates, chatRepId, userLiveLocation]);

  const adminScreen = {
    dashboard: <Dashboard theme={themeStyles} reports={reports} alerts={alerts} assignRep={assignRep} resolveRep={resolveRep} setAS={setAS} />,
    alerts: <AlertsAdmin theme={themeStyles} alerts={alerts} ackAlert={ackAlert} resolveAlert={resolveAlert} />,
    messages: <AdminMessages theme={themeStyles} reports={reports} messages={messages} sendMsg={sendMsg} />,
    personnel: <PersonnelAdmin theme={themeStyles} />,
    map: <div><h2 style={{ color: R }}>Live Campus Map</h2><LiveMap onLocationSelect={setUserLiveLocation} initialLocation={userLiveLocation} setParentLocation={setUserLiveLocation} /><p style={{ color: themeStyles.muted }}>Student live location: {userLiveLocation?.label || "Unknown"}</p></div>,
    analytics: <AnalyticsAdmin theme={themeStyles} reports={reports} />,
    settings: <div><h2 style={{ color: R }}>Settings</h2><p style={{ color: themeStyles.muted }}>Theme, dispatch rules, alert routing, and access controls can be configured here.</p><button onClick={() => setTheme((t) => t === "light" ? "dark" : "light")} style={{ ...primaryBtn(R), maxWidth: 180 }}>Toggle Theme</button></div>,
  } satisfies Record<AScreen, React.ReactNode>;

  return (
    <div style={{ minHeight: "100vh", background: themeStyles.bg, color: themeStyles.text, display: "flex", flexDirection: "column", ["--border" as string]: themeStyles.border }}>
      <header style={{ background: DR, padding: "9px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Shield size={18} color={WH} /><span className="topbar-title" style={{ color: WH, fontWeight: 900, fontSize: 15, letterSpacing: 1.2 }}>S.A.F.E. KWASU</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button title="Toggle theme" onClick={() => setTheme((t) => t === "light" ? "dark" : "light")} style={{ background: "rgba(255,255,255,.2)", border: 0, borderRadius: 20, padding: "5px 8px", color: WH, cursor: "pointer" }}>{theme === "light" ? <Moon size={14} /> : <Sun size={14} />}</button>
          <Wifi size={13} color={WH} /><span style={{ color: "rgba(255,255,255,.75)", fontSize: 11 }}>Live</span>
          {userRole && <button onClick={logout} style={{ background: "rgba(255,255,255,.2)", border: 0, borderRadius: 20, padding: "5px 12px", color: WH, cursor: "pointer", fontSize: 11 }}>Logout</button>}
        </div>
      </header>

      {!userRole && authView === "studentLogin" && <StudentLogin onLogin={() => setUserRole("student")} onRegister={() => setAuthView("studentRegister")} onAdmin={() => setAuthView("adminLogin")} />}
      {!userRole && authView === "studentRegister" && <StudentRegister theme={themeStyles} onBack={() => setAuthView("studentLogin")} onDone={() => setUserRole("student")} />}
      {!userRole && authView === "adminLogin" && <AdminLogin onLogin={() => setUserRole("admin")} onBack={() => setAuthView("studentLogin")} />}

      {userRole === "student" && <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}><div style={{ flex: 1, overflow: "auto" }}>{studentScreen}</div>{!["sos", "reportform", "anonymousReport"].includes(mScreen) && <BottomNav theme={themeStyles} mScreen={mScreen} setMS={setMS} updates={updates} />}</div>}
      {userRole === "admin" && <AdminShell theme={themeStyles} aScreen={aScreen} setAS={setAS}>{adminScreen[aScreen]}</AdminShell>}

      {toast && <div style={{ position: "fixed", top: 56, right: 14, zIndex: 9999, background: toast.type === "sos" ? R : toast.type === "warn" ? AM : GR, color: WH, padding: "11px 16px", borderRadius: 11, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,.2)", maxWidth: 320 }}>{toast.msg}</div>}
      {showAIChat && userRole === "student" && <AIChat userLocation={userLiveLocation} onClose={() => setShowAIChat(false)} />}
    </div>
  );
}
