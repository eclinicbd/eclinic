import React, { useRef } from 'react';
import { EPrescription, Language, TestPackage } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  Stethoscope, 
  FlaskConical, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Building2, 
  Phone, 
  FileText, 
  Sparkles, 
  QrCode, 
  ShieldCheck, 
  ArrowRight,
  Plus,
  ShoppingBag
} from 'lucide-react';

interface EPrescriptionModalProps {
  prescription: EPrescription | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onBookAdvisedTest?: (testName: string, testId?: string) => void;
  onBookAllAdvisedTests?: (testNames: string[]) => void;
}

export const EPrescriptionModal: React.FC<EPrescriptionModalProps> = ({
  prescription,
  isOpen,
  onClose,
  lang,
  onBookAdvisedTest,
  onBookAllAdvisedTests
}) => {
  if (!isOpen || !prescription) return null;

  const isBn = lang === 'bn';
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-bold">
              {isBn ? 'ডিজিটাল ই-প্রেসক্রিপশন ভিউয়ার' : 'Digital E-Prescription Viewer'}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">({prescription.id})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={14} />
              <span>{isBn ? 'প্রিন্ট / ডাউনলোড' : 'Print / Download'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable E-Prescription Container */}
        <div ref={printRef} className="p-6 sm:p-8 bg-white text-slate-800 font-sans max-h-[82vh] overflow-y-auto print:max-h-none print:p-4 print:text-black">
          {/* Header: Doctor Details & Hospital */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                    {prescription.doctorName}
                  </h2>
                  <p className="text-xs font-bold text-sky-700">
                    {prescription.doctorSpecialty}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {prescription.doctorDegrees}
              </p>
              <p className="text-[11px] text-slate-500">
                {prescription.doctorHospital}
              </p>
              {prescription.doctorBmdcNo && (
                <span className="inline-block mt-1 text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  BMDC Reg No: {prescription.doctorBmdcNo}
                </span>
              )}
            </div>

            {/* Platform / Clinic Brand Stamp */}
            <div className="text-left sm:text-right">
              <span className="text-sm font-extrabold text-sky-600 tracking-tight block">
                LabHome BD Telemedicine
              </span>
              <span className="text-[10px] text-slate-400 block">
                Verified Digital E-Prescription
              </span>
              <div className="mt-2 text-[11px] font-mono text-slate-600">
                <span>Date: <strong>{prescription.date}</strong></span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                <span>Rx ID: {prescription.id}</span>
              </div>
            </div>
          </div>

          {/* Patient Details Row */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'রোগীর নাম:' : 'Patient Name:'}</span>
              <span className="font-bold text-slate-900">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'বয়স ও লিঙ্গ:' : 'Age / Gender:'}</span>
              <span className="font-bold text-slate-800">{prescription.patientAge} Yrs / {prescription.patientGender}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'মোবাইল:' : 'Phone:'}</span>
              <span className="font-mono text-slate-800">{prescription.patientPhone}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'অ্যাপয়েন্টমেন্ট আইডি:' : 'Appointment ID:'}</span>
              <span className="font-mono font-bold text-sky-700">{prescription.appointmentId}</span>
            </div>
          </div>

          {/* Main Prescription Body (Split Layout: Clinical Notes on Left, Rx on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
            {/* Left Column: Complaints, Vitals & Diagnosis (4 Cols) */}
            <div className="md:col-span-4 space-y-5 border-r border-slate-200/80 pr-4">
              {/* Chief Complaints */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <FileText size={13} className="text-sky-600" />
                  <span>{isBn ? 'প্রধান সমস্যা (Complaints):' : 'Chief Complaints:'}</span>
                </h4>
                <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
                  {prescription.chiefComplaints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Vitals */}
              {prescription.vitals && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                    {isBn ? 'শারীরিক ভাইটালস (Vitals):' : 'Clinical Vitals:'}
                  </h4>
                  <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                    {prescription.vitals.bloodPressure && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">BP:</span>
                        <span className="font-bold">{prescription.vitals.bloodPressure}</span>
                      </div>
                    )}
                    {prescription.vitals.pulse && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Pulse:</span>
                        <span>{prescription.vitals.pulse}</span>
                      </div>
                    )}
                    {prescription.vitals.bloodSugar && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Sugar:</span>
                        <span>{prescription.vitals.bloodSugar}</span>
                      </div>
                    )}
                    {prescription.vitals.temperature && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Temp:</span>
                        <span>{prescription.vitals.temperature}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {prescription.diagnosis && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    {isBn ? 'রোগ নির্ণয় (Diagnosis):' : 'Diagnosis:'}
                  </h4>
                  <p className="text-xs text-slate-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-900">
                    {prescription.diagnosis}
                  </p>
                </div>
              )}

              {/* Follow-up Date */}
              {prescription.followupDate && (
                <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200 text-xs">
                  <span className="text-[10px] text-sky-800 font-bold uppercase block">{isBn ? 'পরবর্তী ফলোআপ:' : 'Next Follow-up:'}</span>
                  <span className="font-bold text-sky-900">{prescription.followupDate}</span>
                </div>
              )}
            </div>

            {/* Right Column: Rx Medicines & Advised Tests (8 Cols) */}
            <div className="md:col-span-8 space-y-6">
              {/* Prescribed Medicines (Rx) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-serif font-black italic text-slate-900">Rx</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isBn ? '(প্রেসক্রাইবড ওষুধসমূহ)' : '(Prescribed Medicines)'}
                  </span>
                </div>

                <div className="space-y-3">
                  {prescription.medicines.map((med, idx) => (
                    <div 
                      key={med.id || idx} 
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900 text-sm">
                          {idx + 1}. {med.name}
                        </span>
                        <span className="text-sky-700 font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px] pt-1">
                        <span>{isBn ? 'খাওয়ার নিয়ম: ' : 'Instruction: '}<strong>{med.instruction}</strong></span>
                        <span>{isBn ? 'মেয়াদ: ' : 'Duration: '}<strong>{med.duration}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advised Lab Tests Section ("ইপ্রেসক্রিপশন এ টেস্ট এডভাইস") */}
              {prescription.advisedTests && prescription.advisedTests.length > 0 && (
                <div className="pt-4 border-t-2 border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FlaskConical size={14} className="text-sky-600" />
                      <span>{isBn ? 'প্রেসক্রাইবড টেস্ট এডভাইস (Advised Lab Tests):' : 'Advised Diagnostic Lab Tests:'}</span>
                    </h4>

                    {/* Book All Advised Tests Action */}
                    {onBookAllAdvisedTests && (
                      <button
                        onClick={() => onBookAllAdvisedTests(prescription.advisedTests.map(t => t.name))}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors print:hidden cursor-pointer"
                      >
                        <ShoppingBag size={12} />
                        <span>{isBn ? 'সকল টেস্ট বুক করুন' : 'Book All Tests'}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {prescription.advisedTests.map((test, i) => (
                      <div 
                        key={test.id || i}
                        className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 flex items-center justify-between text-xs gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {i + 1}
                            </span>
                            <span className="font-bold text-slate-900 truncate">{test.name}</span>
                          </div>
                          {test.instructions && (
                            <p className="text-[11px] text-slate-500 pl-7">{test.instructions}</p>
                          )}
                        </div>

                        {/* Individual Test Book Button */}
                        {onBookAdvisedTest && (
                          <button
                            onClick={() => onBookAdvisedTest(test.name, test.testId)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-300 font-bold text-[11px] flex items-center gap-1 transition-all shrink-0 print:hidden cursor-pointer shadow-xs"
                          >
                            <Plus size={12} />
                            <span>{isBn ? 'টেস্ট বুক করুন' : 'Book Test'}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Advice */}
              {prescription.advice && prescription.advice.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    {isBn ? 'বিশেষ পরামর্শ (Advice):' : 'Special Advice:'}
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
                    {prescription.advice.map((adv, idx) => (
                      <li key={idx}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Footer & Doctor Digital Signature */}
          <div className="pt-6 mt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-end gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-lg p-1 border border-slate-200 flex items-center justify-center">
                <QrCode size={44} className="text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500">
                <p className="font-bold text-slate-700">{isBn ? 'ডিজিটাল ভেরিফিকেশন কোড' : 'Verified QR Digital Stamp'}</p>
                <p>LabHome BD Health Network</p>
                <p className="font-mono">Security Hash: {prescription.id}-AUTH</p>
              </div>
            </div>

            {/* Doctor Signature Block */}
            <div className="text-right sm:text-right">
              <div className="font-serif italic text-base font-bold text-sky-800 border-b border-slate-400 pb-1 mb-1 inline-block">
                {prescription.doctorSignature || prescription.doctorName}
              </div>
              <p className="font-bold text-slate-900">{prescription.doctorName}</p>
              <p className="text-[10px] text-slate-500">{prescription.doctorSpecialty}</p>
              <p className="text-[10px] text-slate-500">{prescription.doctorHospital}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
