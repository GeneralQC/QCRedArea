
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PlusCircle, 
  History, 
  LayoutDashboard, 
  Search, 
  Clock, 
  X,
  PenTool,
  ShieldCheck,
  Eraser,
  RefreshCw,
  ExternalLink,
  Lock,
  CheckCircle2,
  CalendarDays,
  MapPin,
  Filter,
  UserPlus,
  Timer,
  Users,
  Settings as SettingsIcon,
  ShieldAlert,
  Save,
  FileSpreadsheet,
  Mail,
  FileJson,
  UserCheck,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const LOG_API_URL = 'https://script.google.com/macros/s/AKfycbwnHhjLpi-S4eLktl0A-cN3ZyxbXqlawQtzUSp-uIGWA6w-3V7ggrcqqsWn0RtQyJF2/exec';
const SETTINGS_API_URL = 'https://script.google.com/macros/s/AKfycbwk3ycqo3Tl2UyPp0GU32uDuHu98WO8yQaDbCCGvIgSIGwUL__bTETJsQbZTfTxNL0/exec';
const POWER_AUTOMATE_URL = 'https://default8c308e1514804168aed7b0f7a13520.95.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0848f28df139434e8528b42dbea3b761/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=JpAr7sXlj8KEoNUWYIBrafmryRyUdShkhmGCP999TSQ';
const ADMIN_PASSCODE = 'Admin';

const BRANCHES = [
  'BKF', 'BPF', 'KBF', 'KKF', 'KRF', 'LPF', 'PLF', 'PTF', 'RBF', 'SKF', 'SRF', 'TRF'
];

interface ManagerInfo {
  name: string;
  email: string;
}

const SignaturePad = ({ onSave, onClear, label = "ลายเซ็น" }: { onSave: (data: string) => void, onClear: () => void, label?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ปรับขนาด Canvas ให้ตรงกับขนาดที่แสดงผลจริง (Responsive Fix)
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // ตั้งค่าความกว้างตาม Container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 160; // ความสูงคงที่ที่เหมาะสม
    
    // ตั้งค่า Context ใหม่หลัง Resize
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    // ป้องกันการ Scroll ขณะเซ็นบนมือถือ
    if (e.type === 'touchstart') {
      // e.preventDefault(); // ใช้ touch-action: none ใน CSS แทนจะดีกว่า
    }
    
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <PenTool size={14} className="text-emerald-600" /> {label}
        </label>
        <button type="button" onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          onClear();
        }} className="text-[10px] font-bold text-rose-500 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors">
          <Eraser size={12} /> ล้างลายเซ็น
        </button>
      </div>
      <div ref={containerRef} className="relative w-full overflow-hidden">
        <canvas 
          ref={canvasRef} 
          onMouseDown={startDrawing} 
          onMouseUp={stopDrawing} 
          onMouseMove={draw} 
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing} 
          onTouchEnd={stopDrawing} 
          onTouchMove={draw} 
          className="w-full border-2 border-slate-100 rounded-2xl bg-white shadow-inner cursor-crosshair touch-none transition-all focus:border-emerald-500 block"
          style={{ touchAction: 'none' }} // สำคัญมาก: ป้องกัน browser เลื่อนหน้าจอขณะลากเส้น
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingSettings, setIsSyncingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'registration' | 'dashboard' | 'history' | 'settings'>('registration');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL'); 
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [passcode, setPasscode] = useState('');
  const [managerSignature, setManagerSignature] = useState('');
  
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [branchManagers, setBranchManagers] = useState<Record<string, ManagerInfo>>({});

  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    contact: '',
    activity: '',
    branch: 'BKF', 
    entry: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    exit: '',
    signature: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${LOG_API_URL}?t=${Date.now()}`, { method: 'GET', mode: 'cors', redirect: 'follow' });
      const data = await response.json();
      if (Array.isArray(data)) setEntries(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setIsSyncingSettings(true);
    try {
      const response = await fetch(`${SETTINGS_API_URL}?t=${Date.now()}`, { method: 'GET', mode: 'cors', redirect: 'follow' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const managers: Record<string, ManagerInfo> = {};
          data.forEach((item: any) => {
            if (item.plant) {
              managers[item.plant] = { 
                name: item.username || '', 
                email: item.mail || '' 
              };
            }
          });
          setBranchManagers(managers);
          localStorage.setItem('setupmap.json', JSON.stringify(managers));
        }
      }
    } catch (e) {
      const localSaved = localStorage.getItem('setupmap.json');
      if (localSaved) setBranchManagers(JSON.parse(localSaved));
    } finally {
      setIsSyncingSettings(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchSettings();

    // Auto-collapse sidebar after 2 seconds for cleaner UI
    const timer = setTimeout(() => {
      if (window.innerWidth > 768) setIsSidebarOpen(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleManagerUpdate = (branch: string, field: keyof ManagerInfo, value: string) => {
    const updated = { 
        ...branchManagers, 
        [branch]: { 
            ...(branchManagers[branch] || { name: '', email: '' }), 
            [field]: value 
        } 
    };
    setBranchManagers(updated);
  };

  const saveToSetupMap = async () => {
    setIsSyncingSettings(true);
    const jsonString = JSON.stringify(branchManagers);
    localStorage.setItem('setupmap.json', jsonString);
    
    try {
      const params = new URLSearchParams();
      params.append('action', 'saveSettings');
      params.append('data', jsonString);

      await fetch(SETTINGS_API_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString() 
      });
      alert("บันทึกข้อมูลการตั้งค่าลง Cloud สำเร็จ!");
    } catch (e) {
      alert("บันทึกสำเร็จเฉพาะในเบราว์เซอร์");
    } finally {
      setIsSyncingSettings(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.signature) return alert("กรุณาลงลายเซ็นก่อนบันทึก");
    
    setIsLoading(true);

    // ดึงเมลผู้จัดการจากสาขาที่เลือก
    const mappedManager = branchManagers[formData.branch];
    const targetEmail = mappedManager?.email || "No Email Defined";
    const targetName = mappedManager?.name || "No Name Defined";

    try {
      // 1. ส่งข้อมูลไปยัง Power Automate
      const paPayload = {
        type: "message",
        targetManagerEmail: targetEmail,
        targetManagerName: targetName,
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
              "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
              "type": "AdaptiveCard",
              "version": "1.2",
              "body": [
                {
                  "type": "TextBlock",
                  "text": "📊 แจ้งเตือน: มีการขอเข้าพื้นที่ Red Area ใหม่",
                  "size": "Medium",
                  "weight": "Bolder",
                  "color": "Accent"
                },
                {
                  "type": "FactSet",
                  "facts": [
                    { "title": "วันที่ (Date)", "value": formData.date },
                    { "title": "สาขา (Branch)", "value": formData.branch },
                    { "title": "ผู้ติดต่อ (Visitor)", "value": formData.contact },
                    { "title": "กิจกรรม (Activity)", "value": formData.activity },
                    { "title": "เวลาเข้า (In)", "value": formData.entry },
                    { "title": "เวลาออก (Out)", "value": formData.exit || "รอกรอกข้อมูล" },
                    { "title": "ผู้จัดการ (Manager)", "value": targetName },
                    { "title": "อีเมลผู้จัดการ (Email)", "value": targetEmail }
                  ]
                }
              ]
            }
          }
        ]
      };

      const paPromise = fetch(POWER_AUTOMATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paPayload)
      }).catch(err => console.error("Power Automate Sync Failed", err));

      // 2. ส่งข้อมูลไปยัง Google Sheet เดิม
      const sheetParams = new URLSearchParams();
      sheetParams.append('date', formData.date);
      sheetParams.append('contact', formData.contact);
      sheetParams.append('activity', formData.activity);
      sheetParams.append('branch', formData.branch);
      sheetParams.append('entry', formData.entry);
      sheetParams.append('exit', formData.exit || '-');
      sheetParams.append('signature', formData.signature);

      const gsPromise = fetch(LOG_API_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: sheetParams.toString() 
      });

      await Promise.allSettled([paPromise, gsPromise]);

      setFormData({
        date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        contact: '', activity: '', branch: formData.branch,
        entry: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        exit: '', signature: ''
      });

      alert(`บันทึกสำเร็จ! แจ้งเตือนถูกส่งไปยังคุณ ${targetName} เรียบร้อยแล้ว`);
      setTimeout(() => {
        fetchData();
        setActiveTab('dashboard');
      }, 500);

    } catch (e: any) { 
      alert("บันทึกล้มเหลว: " + e.message); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleStatusUpdateSubmit = async () => {
    const currentBranch = selectedEntry?.["สาขา"] || selectedEntry?.["branch"];
    const mappedManager = branchManagers[currentBranch]?.name;
    
    if (passcode !== '123456') return alert("รหัสผ่านไม่ถูกต้อง!");
    
    const finalSignature = mappedManager || managerSignature;
    if (!finalSignature) return alert("กรุณาลงลายเซ็นผู้จัดการหรือตรวจสอบการตั้งค่าสาขา!");

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('action', 'updateStatus');
      params.append('id', selectedEntry["ชื่อผู้ติดต่อ"] || selectedEntry["contact"] || selectedEntry["ชื่อ-นามสกุล"]);
      params.append('status', 'Approved');
      params.append('managerSignature', finalSignature);

      await fetch(LOG_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      alert("อนุมัติเรียบร้อย!");
      setIsStatusUpdateOpen(false);
      setPasscode('');
      setManagerSignature('');
      setTimeout(() => { fetchData(); }, 1000);
    } catch (e: any) { alert("ล้มเหลว: " + e.message); } finally { setIsLoading(false); }
  };

  const formatFriendlyTime = (timeStr: string) => {
    if (!timeStr || timeStr === "-") return "-";
    if (timeStr.includes('T') && timeStr.includes('Z')) {
      try {
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      } catch (e) { return timeStr; }
    }
    return timeStr.split(':').slice(0, 2).join(':');
  };

  const getOnlyDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return dateStr.split(/[ T]/)[0];
  };

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const name = String(e["ชื่อผู้ติดต่อ"] || e["contact"] || "").toLowerCase();
      const branch = String(e["สาขา"] || e["branch"] || "").toUpperCase();
      const matchSearch = name.includes(searchTerm.toLowerCase());
      const matchBranch = filterBranch === 'ALL' || branch === filterBranch;
      
      let matchDate = true;
      if (activeTab === 'history' && (filterStartDate || filterEndDate)) {
        const dateRaw = e["วันที่"] || e["date"] || "";
        const [d, m, y] = dateRaw.split('/');
        if (d && m && y) {
          const entryDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          if (filterStartDate && entryDate < filterStartDate) matchDate = false;
          if (filterEndDate && entryDate > filterEndDate) matchDate = false;
        }
      }
      return matchSearch && matchBranch && matchDate;
    }).reverse();
  }, [entries, searchTerm, filterStartDate, filterEndDate, filterBranch, activeTab]);

  const stats = useMemo(() => {
    const s: any = {
      total: filtered.length,
      pending: 0,
      approved: 0,
      branchStats: {} as Record<string, { total: number, pending: number, approved: number }>
    };
    BRANCHES.forEach(b => { s.branchStats[b] = { total: 0, pending: 0, approved: 0 }; });
    filtered.forEach(e => {
      const status = String(e["Status"] || e["status"] || "").toLowerCase();
      const branch = String(e["สาขา"] || e["branch"] || "").toUpperCase();
      const isApproved = status === 'approved';
      if (isApproved) s.approved++; else s.pending++;
      if (s.branchStats[branch]) {
        s.branchStats[branch].total++;
        if (isApproved) s.branchStats[branch].approved++; else s.branchStats[branch].pending++;
      }
    });
    return s;
  }, [filtered]);

  const exportToExcel = () => {
    if (filtered.length === 0) return alert("ไม่มีข้อมูล");
    const headers = ["วันที่", "สาขา", "ชื่อผู้ติดต่อ", "รายละเอียด", "เวลาเข้า", "เวลาออก", "สถานะ", "ลายเซ็นผู้ติดต่อ", "ลายเซ็นผู้อนุมัติ"];
    const csvRows = [headers.join(",")];
    
    filtered.forEach(entry => {
      const branch = entry["สาขา"] || entry["branch"] || "";
      const status = String(entry["Status"] || entry["status"] || "").toLowerCase();
      const visitorSig = entry["ชื่อผู้ติดต่อ"] || entry["contact"] || "-";
      let managerSig = entry["Manager Signature"] || entry["managerSignature"] || entry["ลายเซ็นผู้อนุมัติ"] || "-";
      
      if (status === 'approved' && (managerSig === '-' || managerSig === '' || managerSig.startsWith('data:image'))) {
          const mappedName = branchManagers[branch]?.name;
          if (mappedName) managerSig = mappedName;
      }
      
      csvRows.push([
        getOnlyDate(entry["วันที่"] || entry["date"]),
        `"${branch}"`,
        `"${entry["ชื่อผู้ติดต่อ"] || entry["contact"]}"`,
        `"${entry["กิจกรรม-รายละเอียด"] || entry["activity"]}"`,
        formatFriendlyTime(entry["เวลาเข้า"] || entry["entry"]),
        formatFriendlyTime(entry["เวลาออก"] || entry["exit"]),
        `"${entry["Status"] || entry["status"] || "Logged"}"`,
        `"${visitorSig}"`,
        `"${managerSig}"`
      ].join(","));
    });
    const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Lab_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const getBranchColor = (branch: string) => {
    const b = String(branch).toUpperCase();
    const colors: any = {
      'BKF': 'bg-blue-50 text-blue-600 border-blue-100',
      'BPF': 'bg-purple-50 text-purple-600 border-purple-100',
      'KBF': 'bg-orange-50 text-orange-600 border-orange-100',
      'KKF': 'bg-rose-50 text-rose-600 border-rose-100',
      'KRF': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'LPF': 'bg-teal-50 text-teal-600 border-teal-100',
      'PLF': 'bg-cyan-50 text-cyan-600 border-cyan-100',
      'PTF': 'bg-pink-50 text-pink-600 border-pink-100',
      'RBF': 'bg-amber-50 text-amber-600 border-amber-100',
      'SKF': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'SRF': 'bg-lime-50 text-lime-600 border-lime-100',
      'TRF': 'bg-violet-50 text-violet-600 border-violet-100'
    };
    return colors[b] || 'bg-slate-50 text-slate-500 border-slate-100';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] font-['Sarabun']">
      {/* Sidebar - Desktop */}
      <aside className={`bg-[#064E3B] text-white hidden md:flex flex-col p-6 shadow-xl shrink-0 z-20 transition-all duration-300 relative ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="absolute -right-4 top-10 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg z-30 hover:bg-emerald-400 transition-colors"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div className={`mb-10 flex items-center transition-all duration-300 ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/20 shrink-0"><ShieldCheck className="text-emerald-400" size={28} /></div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-xl font-black italic tracking-tighter">QC RED AREA</h1>
              <p className="text-[9px] text-emerald-300 font-bold tracking-[0.2em] uppercase opacity-60">Management Cloud</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'registration', label: 'Registration', icon: <UserPlus size={20} /> },
            { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
            { id: 'history', label: 'History Log', icon: <History size={20} /> },
            { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                if (item.id === 'settings') { setIsAdminUnlocked(false); setAdminInput(''); }
                setActiveTab(item.id as any);
              }} 
              className={`w-full flex items-center transition-all duration-300 px-5 py-4 rounded-2xl ${activeTab === item.id ? 'bg-emerald-700/80 shadow-lg' : 'hover:bg-emerald-800/40 opacity-70'} ${isSidebarOpen ? 'gap-3.5' : 'justify-center'}`}
            >
              <div className="shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="font-bold text-sm overflow-hidden whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Top Nav */}
      <nav className="md:hidden bg-[#064E3B] text-white p-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <ShieldCheck className="text-emerald-400" size={24} />
           <span className="font-black italic text-sm">QC RED AREA</span>
        </div>
        <div className="flex gap-2">
           {['registration', 'dashboard', 'history', 'settings'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`p-2 rounded-lg transition-all ${activeTab === tab ? 'bg-emerald-500 text-white' : 'text-emerald-200 opacity-60'}`}>
                {tab === 'registration' && <UserPlus size={18} />}
                {tab === 'dashboard' && <LayoutDashboard size={18} />}
                {tab === 'history' && <History size={18} />}
                {tab === 'settings' && <SettingsIcon size={18} />}
             </button>
           ))}
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto overflow-x-hidden">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight capitalize">{activeTab}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                System Status: <span className="text-slate-700">Online & Encrypted</span>
              </p>
            </div>
          </div>
          {(activeTab !== 'registration' && activeTab !== 'settings') && (
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="ค้นหาชื่อผู้ติดต่อ..." className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full shadow-sm focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          )}
        </header>

        {activeTab === 'registration' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-slate-100">
              <div className="bg-emerald-50/50 p-6 md:p-10 border-b border-emerald-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-emerald-950">Visitor Entry</h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Laboratory Access Form</p>
                </div>
                <div className="p-4 bg-white rounded-3xl shadow-sm hidden sm:block"><UserPlus className="text-emerald-600" size={32} /></div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">วันที่ (Date)</label><input type="text" readOnly value={formData.date} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-400" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">เวลาเข้า (Entry Time)</label><input type="text" readOnly value={formData.entry} className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-black text-emerald-700" /></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">เลือกสาขา (Branch)</label>
                  <select className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ชื่อ-นามสกุล (Full Name)</label>
                  <input required type="text" placeholder="ระบุชื่อ..." className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">กิจกรรม (Activity)</label>
                  <textarea required rows={3} placeholder="ระบุวัตถุประสงค์..." className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none resize-none" value={formData.activity} onChange={e => setFormData({...formData, activity: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">เวลาออก (Exit Time)</label>
                  <input type="time" className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none" value={formData.exit} onChange={e => setFormData({...formData, exit: e.target.value})} />
                </div>

                <SignaturePad onSave={sig => setFormData({...formData, signature: sig})} onClear={() => setFormData({...formData, signature: ''})} />

                <button type="submit" disabled={isLoading} className="w-full py-5 bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3">
                  {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                  <span>{isLoading ? 'Processing...' : 'บันทึกข้อมูลเข้าพื้นที่'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ... (Other Tabs follow the same structure but kept clean for signature fix focus) ... */}
        {activeTab === 'dashboard' && (
           <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="text-3xl font-black text-slate-800">{stats.total}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Logs</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="text-3xl font-black text-amber-600">{stats.pending}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Approval</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="text-3xl font-black text-emerald-600">{stats.approved}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Approved</p>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center">
                    <button onClick={fetchData} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all"><RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} /></button>
                 </div>
              </div>
              <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-x-auto">
                 <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                       <tr className="text-[10px] font-black text-slate-400 uppercase">
                          <th className="px-6 py-4">วันที่</th>
                          <th className="px-6 py-4">สาขา</th>
                          <th className="px-6 py-4">ผู้ติดต่อ</th>
                          <th className="px-6 py-4 text-center">เข้า/ออก</th>
                          <th className="px-6 py-4 text-center">สถานะ</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filtered.slice(0, 10).map((entry, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                             <td className="px-6 py-4 text-sm font-bold">{getOnlyDate(entry["วันที่"] || entry["date"])}</td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${getBranchColor(entry["สาขา"] || entry["branch"])}`}>{entry["สาขา"] || entry["branch"]}</span>
                             </td>
                             <td className="px-6 py-4 font-bold text-slate-700">{entry["ชื่อผู้ติดต่อ"] || entry["contact"]}</td>
                             <td className="px-6 py-4 text-center">
                                <div className="text-[10px] font-black text-emerald-600">IN: {formatFriendlyTime(entry["เวลาเข้า"] || entry["entry"])}</div>
                                <div className="text-[10px] font-black text-rose-500">OUT: {formatFriendlyTime(entry["เวลาออก"] || entry["exit"])}</div>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${String(entry["Status"] || entry["status"]).toLowerCase() === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{entry["Status"] || entry["status"] || 'Pending'}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === 'history' && (
           <div className="space-y-6">
              <div className="flex flex-wrap gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                 <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">สาขา</label>
                    <select className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none font-bold text-sm" value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                       <option value="ALL">All Branches</option>
                       {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                 </div>
                 <button onClick={exportToExcel} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 self-end"><FileSpreadsheet size={16} /> Export CSV</button>
              </div>
              <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-x-auto">
                 <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                       <tr className="text-[10px] font-black text-slate-400 uppercase">
                          <th className="px-6 py-4">วันที่</th>
                          <th className="px-6 py-4">สาขา</th>
                          <th className="px-6 py-4">ผู้ติดต่อ</th>
                          <th className="px-6 py-4">รายละเอียด</th>
                          <th className="px-6 py-4 text-center">ลายเซ็น</th>
                          <th className="px-6 py-4 text-right">การจัดการ</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filtered.map((entry, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 group">
                             <td className="px-6 py-4 text-sm font-bold">{getOnlyDate(entry["วันที่"] || entry["date"])}</td>
                             <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${getBranchColor(entry["สาขา"] || entry["branch"])}`}>{entry["สาขา"] || entry["branch"]}</span></td>
                             <td className="px-6 py-4 font-bold text-slate-700">{entry["ชื่อผู้ติดต่อ"] || entry["contact"]}</td>
                             <td className="px-6 py-4 text-xs text-slate-400 truncate max-w-[200px]">{entry["กิจกรรม-รายละเอียด"] || entry["activity"]}</td>
                             <td className="px-6 py-4 text-center">
                                {entry["ลายเซ็น"] ? <button onClick={() => window.open(entry["ลายเซ็น"])} className="text-emerald-500 hover:text-emerald-700"><ExternalLink size={16} /></button> : "-"}
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button onClick={() => { setSelectedEntry(entry); setIsStatusUpdateOpen(true); }} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${ String(entry["Status"] || entry["status"]).toLowerCase() === 'approved' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-amber-600 border-amber-200'}`}>
                                   {entry["Status"] || entry["status"] || 'Pending'}
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="max-w-4xl mx-auto">
              {!isAdminUnlocked ? (
                 <div className="bg-white rounded-[40px] shadow-xl p-12 text-center space-y-8 border border-slate-100">
                    <div className="p-6 bg-rose-50 rounded-full text-rose-500 inline-block"><ShieldAlert size={48} /></div>
                    <h3 className="text-2xl font-black">Admin Authentication</h3>
                    <input type="password" placeholder="Passcode" className="w-full max-w-xs px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl tracking-[0.5em] outline-none" value={adminInput} onChange={e => setAdminInput(e.target.value)} />
                    <button onClick={() => { if (adminInput === ADMIN_PASSCODE) setIsAdminUnlocked(true); else alert("Wrong Passcode!"); }} className="w-full max-w-xs py-4 bg-slate-800 text-white font-black rounded-2xl">Unlock Settings</button>
                 </div>
              ) : (
                 <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 bg-emerald-50/50 flex justify-between items-center">
                       <h3 className="text-2xl font-black">Cloud Manager Mapping</h3>
                       <button onClick={saveToSetupMap} disabled={isSyncingSettings} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs flex items-center gap-2">{isSyncingSettings ? 'Syncing...' : 'Save & Sync'}</button>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto">
                       {BRANCHES.map(b => (
                          <div key={b} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                             <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${getBranchColor(b)}`}>{b} Branch</span>
                             <div className="space-y-2">
                                <input type="text" placeholder="Manager Name" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold" value={branchManagers[b]?.name || ''} onChange={e => handleManagerUpdate(b, 'name', e.target.value)} />
                                <input type="email" placeholder="Manager Email" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold" value={branchManagers[b]?.email || ''} onChange={e => handleManagerUpdate(b, 'email', e.target.value)} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
           </div>
        )}
      </main>

      {/* Approval Modal */}
      {isStatusUpdateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
              <h3 className="font-black text-amber-950 flex items-center gap-2"><Lock size={18} /> Manager Approval</h3>
              <button onClick={() => setIsStatusUpdateOpen(false)} className="p-2 bg-white rounded-xl shadow-sm"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approving For</p>
                  <p className="text-lg font-black text-slate-800">{selectedEntry?.["ชื่อผู้ติดต่อ"] || selectedEntry?.["contact"]}</p>
               </div>
               {branchManagers[selectedEntry?.["สาขา"] || selectedEntry?.["branch"]]?.name ? (
                  <div className="p-4 bg-emerald-50 rounded-2xl text-center border border-emerald-100">
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Authorized Manager</p>
                     <p className="text-lg font-black text-emerald-700">{branchManagers[selectedEntry?.["สาขา"] || selectedEntry?.["branch"]]?.name}</p>
                  </div>
               ) : (
                  <SignaturePad label="ลงลายเซ็นผู้อนุมัติ" onSave={sig => setManagerSignature(sig)} onClear={() => setManagerSignature('')} />
               )}
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Passcode</label>
                  <input type="password" placeholder="••••••" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-black tracking-[1em]" value={passcode} onChange={e => setPasscode(e.target.value)} />
               </div>
               <button onClick={handleStatusUpdateSubmit} disabled={isLoading} className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black shadow-lg hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                  {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} Approve
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
