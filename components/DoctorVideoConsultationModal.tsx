import React, { useState, useEffect, useRef } from 'react';
import { DoctorAppointment, Language, EPrescription } from '../types';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Send, 
  FileText, 
  ShieldCheck, 
  Share2, 
  Maximize2, 
  Sparkles, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  Paperclip,
  Activity,
  ChevronRight
} from 'lucide-react';
import { saveEPrescription } from '../services/dataStorage';

interface DoctorVideoConsultationModalProps {
  appointment: DoctorAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenPrescription: (prescription: EPrescription) => void;
}

interface ChatItem {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  time: string;
}

export const DoctorVideoConsultationModal: React.FC<DoctorVideoConsultationModalProps> = ({
  appointment,
  isOpen,
  onClose,
  lang,
  onOpenPrescription
}) => {
  const isBn = lang === 'bn';
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatList, setChatList] = useState<ChatItem[]>(() => [
    {
      id: '1',
      sender: 'doctor',
      text: isBn 
        ? `আসসালামু আলাইকুম ${appointment?.patientName || ''}, আমি ডাঃ ${appointment?.doctorName || ''}। আপনার শারীরিক সমস্যাটি বিস্তারিত বলুন।` 
        : `Hello ${appointment?.patientName || ''}, I am Dr. ${appointment?.doctorName || ''}. Please tell me more about your symptoms.`,
      time: 'Just now'
    }
  ]);

  const [prescriptionGenerated, setPrescriptionGenerated] = useState<EPrescription | null>(() => appointment?.prescription || null);

  // Timer counter
  useEffect(() => {
    if (!isOpen || !appointment) return;
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMsg: ChatItem = {
      id: Date.now().toString(),
      sender: 'patient',
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatList(prev => [...prev, newMsg]);
    setChatMessage('');

    // Simulate doctor intelligent response after 1.5s
    setTimeout(() => {
      const docReply: ChatItem = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: isBn
          ? `ধন্যবাদ জানানোর জন্য। আমি আপনার লক্ষণ পর্যবেক্ষণ করছি এবং প্রয়োজনীয় ওষুধ ও ল্যাব টেস্ট প্রেসক্রাইব করছি। নিচের 'ই-প্রেসক্রিপশন' বাটনে ক্লিক করে ভেরিফাইড প্রেসক্রিপশন দেখতে পারেন।`
          : `Thank you for the update. I have noted your symptoms and prepared your digital prescription and recommended lab tests. Click 'View E-Prescription' below.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatList(prev => [...prev, docReply]);
    }, 1500);
  };

  const handleGenerateAndOpenPrescription = () => {
    let presc = prescriptionGenerated;
    if (!presc) {
      presc = {
        id: `RX-${Date.now().toString().slice(-6)}`,
        appointmentId: appointment.id,
        date: new Date().toISOString().split('T')[0],
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        doctorDegrees: 'MBBS, FCPS, MD (Specialist)',
        doctorSpecialty: appointment.doctorSpecialty,
        doctorHospital: appointment.doctorHospital,
        doctorBmdcNo: 'A-28491',
        doctorSignature: 'Dr. Signed (Verified Digital Stamp)',
        patientName: appointment.patientName,
        patientAge: appointment.patientAge,
        patientGender: appointment.patientGender,
        patientPhone: appointment.patientPhone,
        chiefComplaints: [
          appointment.problemDescription || (isBn ? 'জ্বর ও দুর্বলতা' : 'Fever & Weakness'),
          isBn ? 'খাবারে অরুচি ও মাথাব্যথা' : 'Loss of appetite & headache'
        ],
        vitals: {
          bloodPressure: '120/80 mmHg',
          pulse: '76 bpm',
          temperature: '99.2 °F',
          weight: '68 kg',
          bloodSugar: '6.4 mmol/L'
        },
        diagnosis: isBn ? 'তীব্র ভাইরাসজনিত সংক্রমণ ও সিজনাল ফ্লু (Viral Fever / Acute URTI)' : 'Viral Syndrome & Acute URTI',
        medicines: [
          {
            id: 'med_1',
            name: 'Tab. Napa Extra (Paracetamol 500mg + Caffeine 65mg)',
            type: 'Tab',
            dosage: '১ + ১ + ১',
            duration: '৫ দিন',
            instruction: 'খাবারের পর ভরা পেটে'
          },
          {
            id: 'med_2',
            name: 'Cap. Seclo 20mg (Omeprazole)',
            type: 'Cap',
            dosage: '১ + ০ + ১',
            duration: '১৪ দিন',
            instruction: 'খাবারের ২০ মিনিট আগে'
          },
          {
            id: 'med_3',
            name: 'Tab. Fexo 120mg (Fexofenadine HCl)',
            type: 'Tab',
            dosage: '০ + ০ + ১',
            duration: '৭ দিন',
            instruction: 'রাতে ঘুমানোর আগে'
          },
          {
            id: 'med_4',
            name: 'Syp. Tusca Plus 100ml',
            type: 'Syp',
            dosage: '২ চামচ করে দিনে ৩ বার',
            duration: '৭ দিন',
            instruction: 'হালকা কুসুম গরম পানিতে'
          }
        ],
        advisedTests: [
          {
            id: 'test_adv_1',
            testId: '1',
            name: 'Complete Blood Count (CBC with ESR)',
            estimatedPrice: 450,
            instructions: 'রক্তের সার্বিক অবস্থা ও ইনফেকশন লেভেল জানতে'
          },
          {
            id: 'test_adv_2',
            testId: '2',
            name: 'Fasting Blood Sugar (FBS)',
            estimatedPrice: 200,
            instructions: '৮-১০ ঘণ্টা না খেয়ে খালি পেটে রক্ত দিতে হবে'
          },
          {
            id: 'test_adv_3',
            testId: '6',
            name: 'Serum Creatinine',
            estimatedPrice: 400,
            instructions: 'কিডনি ফাংশন মূল্যায়নের জন্য'
          }
        ],
        advice: [
          'প্রচুর পরিমাণে বিশুদ্ধ পানি ও পুষ্টিকর তরল খাবার গ্রহণ করুন।',
          'পর্যাপ্ত বিশ্রাম নিন ও ধুলোবালি এড়িয়ে চলুন।',
          'প্রেসক্রিপশন অনুযায়ী নিয়মিত ওষুধ সেবন করুন।',
          '৭ দিন পর ফলোআপ চেকআপের পরামর্শ দেওয়া হলো।'
        ],
        followupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      saveEPrescription(presc);
      setPrescriptionGenerated(presc);
    }

    onOpenPrescription(presc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
        {/* Video Call Top Bar */}
        <div className="p-3 sm:p-4 px-3.5 sm:px-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                <span className="truncate">{appointment.doctorName}</span>
                <span className="hidden sm:inline text-[10px] font-normal text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800 shrink-0">
                  {appointment.doctorSpecialty}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{appointment.hospital}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Live Call Duration */}
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-[11px] sm:text-xs font-mono text-emerald-400">
              <Clock size={12} className="shrink-0" />
              <span>{formatTimer(callDuration)}</span>
            </div>

            {/* View E-Prescription button in header */}
            <button
              onClick={handleGenerateAndOpenPrescription}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <FileText size={13} className="shrink-0" />
              <span className="hidden sm:inline">{isBn ? 'ই-প্রেসক্রিপশন দেখুন' : 'E-Prescription'}</span>
              <span className="sm:hidden">{isBn ? 'প্রেসক্রিপশন' : 'Rx'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Video Call Center Layout (Video Stream + Side Panel) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Main Video Screen Area (8 Cols) */}
          <div className="lg:col-span-8 bg-black relative flex items-center justify-center overflow-hidden p-2 sm:p-4">
            {/* Doctor Simulated Stream */}
            <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center bg-slate-900 border border-slate-800">
              <img 
                src={appointment.doctorImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800'} 
                alt="Doctor Video" 
                className="w-full h-full object-cover opacity-90"
              />

              {/* Overlay Doctor Name Tag */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/60 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-none">{appointment.doctorName}</span>
                <span className="text-[10px] text-slate-300 hidden sm:inline">(HD Video)</span>
              </div>

              {/* Patient PIP (Self Video View) */}
              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-28 sm:w-44 h-20 sm:h-32 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-2xl z-20">
                {isVideoOn ? (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-sky-900 flex flex-col items-center justify-center text-center p-1.5 sm:p-2 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300" 
                      alt="You" 
                      className="w-full h-full object-cover absolute inset-0 opacity-85"
                    />
                    <div className="absolute bottom-1 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold text-white truncate max-w-[90%]">
                      {appointment.patientName} (You)
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                    <VideoOff size={18} className="mb-1" />
                    <span className="text-[9px] sm:text-[10px]">Camera Off</span>
                  </div>
                )}
              </div>
            </div>

            {/* In-Video Bottom Controls Bar */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-slate-900/90 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-slate-700 shadow-2xl z-30 max-w-[95%]">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer shrink-0 ${
                  isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white shadow-lg'
                }`}
                title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2.5 sm:p-3 rounded-full transition-all cursor-pointer shrink-0 ${
                  isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white shadow-lg'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`hidden sm:flex p-2.5 sm:p-3 rounded-full transition-all cursor-pointer shrink-0 ${
                  isScreenSharing ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Share Screen / Reports"
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={onClose}
                className="p-2.5 sm:p-3 px-3.5 sm:px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer whitespace-nowrap shrink-0"
                title="End Consultation Call"
              >
                <PhoneOff size={15} />
                <span>{isBn ? 'কল শেষ' : 'End'}</span>
              </button>
            </div>
          </div>

          {/* Right Side Panel: Live Chat & Medical Notes (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 flex flex-col h-full">
            {/* Tab Header */}
            <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 text-xs font-bold text-center">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'chat' 
                    ? 'bg-sky-600 text-white shadow-xs' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <MessageSquare size={13} />
                  <span>{isBn ? 'লাইভ চ্যাট' : 'Live Chat'}</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'notes' 
                    ? 'bg-sky-600 text-white shadow-xs' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <FileText size={13} />
                  <span>{isBn ? 'ডাক্তারের নোট' : 'Doctor Notes'}</span>
                </span>
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'chat' ? (
              <div className="flex-1 flex flex-col justify-between overflow-hidden p-3">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {chatList.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                        <span>{msg.sender === 'patient' ? appointment.patientName : appointment.doctorName}</span>
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'patient'
                            ? 'bg-sky-600 text-white rounded-br-xs'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Field */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder={isBn ? 'ডাক্তারকে মেসেজ বা রিপোর্ট তথ্য লিখুন...' : 'Type message to doctor...'}
                    className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition-colors cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                {/* Patient Summary Card */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1.5">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                    {isBn ? 'রোগীর বিবরণ' : 'Patient Information'}
                  </span>
                  <p className="text-white font-bold">{appointment.patientName} ({appointment.patientAge} yrs, {appointment.patientGender})</p>
                  <p className="text-slate-300 text-[11px]">{appointment.problemDescription}</p>
                </div>

                {/* Clinical Findings & Vitals */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    {isBn ? 'গুরুত্বপূর্ণ ভাইটালস' : 'Recorded Vitals'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                      <span className="font-bold text-white">120/80 mmHg</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Pulse / Heart Rate</span>
                      <span className="font-bold text-white">76 bpm</span>
                    </div>
                  </div>
                </div>

                {/* E-Prescription Trigger Card */}
                <div className="bg-gradient-to-br from-emerald-950 to-slate-900 p-4 rounded-xl border border-emerald-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Sparkles size={16} />
                    <span>{isBn ? 'ডিজিটাল ই-প্রেসক্রিপশন প্রস্তুত' : 'Digital E-Prescription Ready'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isBn 
                      ? 'ডাক্তার প্রেসক্রিপশনে প্রয়োজনীয় মেডিসিন এবং ডায়াগনস্টিক টেস্টের তালিকা যুক্ত করেছেন।' 
                      : 'Doctor has prepared medicines and diagnostic lab test advice.'}
                  </p>
                  <button
                    onClick={handleGenerateAndOpenPrescription}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <FileText size={14} />
                    <span>{isBn ? 'প্রেসক্রিপশন ওপেন করুন' : 'Open E-Prescription'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
