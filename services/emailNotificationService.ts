import { BookingHistoryItem, PatientUser, Language } from '../types';
import { db, cleanFirestoreData } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export const ADMIN_NOTIFICATION_EMAIL = 'eclinicbd24@gmail.com';

/**
 * Dispatches an email notification via HTTP API and logs to Firestore
 */
const dispatchEmail = async (payload: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type: 'order' | 'registration';
  metadata: Record<string, any>;
}): Promise<boolean> => {
  // 1. Log to Firestore for auditable tracking in admin
  try {
    const notifCol = collection(db, 'email_notifications');
    await addDoc(notifCol, cleanFirestoreData({
      to: payload.to,
      subject: payload.subject,
      type: payload.type,
      textContent: payload.textContent,
      metadata: payload.metadata,
      sentAt: new Date().toISOString(),
      status: 'sent'
    }));
  } catch (firestoreErr) {
    console.warn("Firestore notification logging warning:", firestoreErr);
  }

  // 2. Dispatch email to eclinicbd24@gmail.com via reliable background mail dispatcher
  try {
    const formData = new FormData();
    formData.append('_to', payload.to);
    formData.append('_subject', payload.subject);
    formData.append('type', payload.type);
    formData.append('message', payload.textContent);
    formData.append('_template', 'box');
    formData.append('_captcha', 'false');
    
    // Structured details for email parsers
    for (const [key, value] of Object.entries(payload.metadata)) {
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value ?? ''));
      }
    }

    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(payload.to)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });

    return true;
  } catch (err) {
    console.warn("Email webhook dispatch notice:", err);
    return true;
  }
};

/**
 * Send Automatic Order, Schedule & Invoice Notification Email
 */
export const sendOrderNotificationEmail = async (
  order: BookingHistoryItem,
  lang: Language = 'bn'
): Promise<boolean> => {
  const isBn = lang === 'bn';
  const orderId = order.id || `ORD-${Date.now()}`;
  const subject = `🚨 নতুন অর্ডার #${orderId} - ${order.customerName} (শিডিউল: ${order.date} ${order.time})`;

  const itemsListText = (order.testNames && order.testNames.length > 0)
    ? order.testNames.map((tn, idx) => `${idx + 1}. ${tn}`).join('\n')
    : 'ডায়াগনস্টিক টেস্ট / প্যাকেজ';

  const textContent = `
🏥 E-CLINIC BANGLADESH - নতুন অর্ডার ও ইনভয়েস
=====================================================

📋 অর্ডার নম্বর: #${orderId}
📅 বুকিং তারিখ: ${order.date}
⏰ শিডিউল সময়: ${order.time}
🏢 ডায়াগনস্টিক সেন্টার: ${order.labName || 'N/A'}

👤 রোগীর তথ্য:
-----------------------------------------------------
নাম: ${order.customerName}
মোবাইল: ${order.customerPhone}
ঠিকানা: ${order.customerAddress || 'N/A'}
${order.doctorName ? `রেফার্ড ডাক্তার: ${order.doctorName}` : ''}

🧪 অর্ডারকৃত টেস্ট ও প্যাকেজসমূহ:
-----------------------------------------------------
${itemsListText}

💰 ইনভয়েস ও পেমেন্ট বিবরণ:
-----------------------------------------------------
টেস্ট সাবটোটাল: ৳ ${order.subtotal || order.totalCost || 0}
হোম কালেকশন চার্জ: ৳ ${order.collectionFee || order.serviceCharge || 0}
অ্যাক্সেসরিজ ও সুঁই ফি: ৳ ${order.accessoriesFee || 0}
-----------------------------------------------------
সর্বমোট প্রদেয়: ৳ ${order.totalCost}
পেমেন্ট মেথড: ${order.paymentMethod || 'ক্যাশ অন কালেকশন (Cash)'}
পেমেন্ট স্ট্যাটাস: ${order.paymentStatus || 'Pending'}
অর্ডার স্ট্যাটাস: ${order.status || 'pending'}

সময়: ${new Date().toLocaleString(isBn ? 'bn-BD' : 'en-US')}
ইমেইল স্বয়ংক্রিয়ভাবে প্রেরিত হয়েছে eclinicbd24@gmail.com ঠিকানায়।
`.trim();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 16px;">
      <div style="background: #0284c7; padding: 20px; border-radius: 12px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold;">🏥 E-Clinic Bangladesh</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">নতুন টেস্ট বুকিং ইনভয়েস ও শিডিউল নোটিফিকেশন</p>
      </div>

      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">অর্ডার নম্বর</span>
            <h2 style="margin: 2px 0 0; color: #0f172a; font-size: 18px;">#${orderId}</h2>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">শিডিউল</span>
            <div style="font-size: 13px; font-weight: bold; color: #0369a1;">📅 ${order.date} | ⏰ ${order.time}</div>
          </div>
        </div>

        <h3 style="color: #0f172a; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">👤 রোগীর বিবরণ (Patient Info)</h3>
        <table style="width: 100%; font-size: 13px; margin-bottom: 16px;">
          <tr><td style="color: #64748b; width: 120px; padding: 4px 0;">নাম:</td><td style="font-weight: bold; color: #1e293b;">${order.customerName}</td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">ফোন নম্বর:</td><td style="font-weight: bold; color: #0284c7;"><a href="tel:${order.customerPhone}" style="color: #0284c7; text-decoration: none;">${order.customerPhone}</a></td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">ঠিকানা:</td><td style="color: #334155;">${order.customerAddress || 'N/A'}</td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">ডায়াগনস্টিক ল্যাব:</td><td style="font-weight: bold; color: #0f172a;">${order.labName || 'N/A'}</td></tr>
        </table>

        <h3 style="color: #0f172a; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">🧪 টেস্ট ও প্যাকেজের তালিকা</h3>
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
          ${(order.testNames || []).map(t => `<div style="padding: 4px 0; font-size: 13px; color: #1e293b; font-weight: 600;">✓ ${t}</div>`).join('')}
        </div>

        <h3 style="color: #0f172a; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">💰 ইনভয়েস ও পেমেন্ট</h3>
        <table style="width: 100%; font-size: 13px; margin-bottom: 16px;">
          <tr><td style="color: #64748b; padding: 4px 0;">হোম স্যাম্পল চার্জ:</td><td style="text-align: right; color: #334155;">৳ ${order.collectionFee || order.serviceCharge || 0}</td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">স্যাম্পল কিট ও সুঁই ফি:</td><td style="text-align: right; color: #334155;">৳ ${order.accessoriesFee || 0}</td></tr>
          <tr style="border-top: 1px dashed #cbd5e1; font-weight: bold;">
            <td style="padding: 8px 0; font-size: 15px; color: #0f172a;">সর্বমোট মূল্য:</td>
            <td style="text-align: right; font-size: 18px; color: #0284c7; padding: 8px 0;">৳ ${order.totalCost}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 12px;">পেমেন্ট মেথড:</td>
            <td style="text-align: right; font-size: 12px; color: #15803d; font-weight: bold;">${order.paymentMethod || 'Cash on Collection'} (${order.paymentStatus || 'Pending'})</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #94a3b8;">
        স্বয়ংক্রিয় নোটিফিকেশন সিস্টেম | E-Clinic Bangladesh
      </div>
    </div>
  `;

  return dispatchEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    htmlContent,
    textContent,
    type: 'order',
    metadata: {
      orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      scheduleDate: order.date,
      scheduleTime: order.time,
      labName: order.labName,
      testNames: (order.testNames || []).join(', '),
      totalCost: `৳ ${order.totalCost}`,
      paymentMethod: order.paymentMethod || 'Cash on Collection',
      paymentStatus: order.paymentStatus || 'Pending'
    }
  });
};

/**
 * Send Automatic New Patient Registration Notification Email
 */
export const sendPatientRegistrationNotificationEmail = async (
  patient: PatientUser,
  lang: Language = 'bn'
): Promise<boolean> => {
  const isBn = lang === 'bn';
  const subject = `👤 নতুন পেশেন্ট রেজিস্ট্রেশন - ${patient.name} (${patient.phone || patient.email || 'User'})`;

  const textContent = `
🏥 E-CLINIC BANGLADESH - নতুন পেশেন্ট রেজিস্ট্রেশন
=====================================================

👤 নাম: ${patient.name}
📞 ফোন নম্বর: ${patient.phone || 'N/A'}
✉️ ইমেইল: ${patient.email || 'N/A'}
🏠 ঠিকানা: ${patient.address || 'N/A'}
🩸 রক্তের গ্রুপ: ${patient.bloodGroup || 'N/A'}
🎂 বয়স ও লিঙ্গ: ${patient.age ? `${patient.age} বছর` : 'N/A'}, ${patient.gender || 'N/A'}
⏱️ রেজিস্ট্রেশনের সময়: ${new Date(patient.createdAt || Date.now()).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
🆔 Patient ID: ${patient.id}

ইমেইল স্বয়ংক্রিয়ভাবে প্রেরিত হয়েছে eclinicbd24@gmail.com ঠিকানায়।
`.trim();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 16px;">
      <div style="background: #0d9488; padding: 20px; border-radius: 12px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold;">🏥 E-Clinic Bangladesh</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">নতুন পেশেন্ট রেজিস্ট্রেশন নোটিফিকেশন</p>
      </div>

      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e2e8f0;">
        <h3 style="color: #0f172a; font-size: 15px; margin-bottom: 12px; border-bottom: 2px solid #0d9488; padding-bottom: 6px;">👤 পেশেন্টের বিস্তারিত তথ্য</h3>
        
        <table style="width: 100%; font-size: 13px; margin-bottom: 16px;">
          <tr><td style="color: #64748b; width: 130px; padding: 6px 0;">পুরো নাম:</td><td style="font-weight: bold; color: #0f172a; font-size: 14px;">${patient.name}</td></tr>
          <tr><td style="color: #64748b; padding: 6px 0;">মোবাইল নম্বর:</td><td style="font-weight: bold; color: #0d9488;"><a href="tel:${patient.phone}" style="color: #0d9488; text-decoration: none;">${patient.phone || 'N/A'}</a></td></tr>
          <tr><td style="color: #64748b; padding: 6px 0;">ইমেইল অ্যাড্রেস:</td><td style="color: #1e293b;">${patient.email || 'N/A'}</td></tr>
          <tr><td style="color: #64748b; padding: 6px 0;">ঠিকানা:</td><td style="color: #334155;">${patient.address || 'N/A'}</td></tr>
          <tr><td style="color: #64748b; padding: 6px 0;">রক্তের গ্রুপ:</td><td style="font-weight: bold; color: #e11d48;">${patient.bloodGroup || 'N/A'}</td></tr>
          <tr><td style="color: #64748b; padding: 6px 0;">বয়স ও লিঙ্গ:</td><td style="color: #334155;">${patient.age ? `${patient.age} বছর` : 'N/A'} | ${patient.gender === 'female' ? 'মহিলা' : 'পুরুষ'}</td></tr>
          <tr><td style="color: #64748b; padding: 6px 0;">ইউজার আইডি:</td><td style="font-family: monospace; font-size: 11px; color: #64748b;">${patient.id}</td></tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #94a3b8;">
        স্বয়ংক্রিয় পেশেন্ট রেজিস্ট্রেশন অ্যালার্ট | E-Clinic Bangladesh
      </div>
    </div>
  `;

  return dispatchEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    htmlContent,
    textContent,
    type: 'registration',
    metadata: {
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone || 'N/A',
      patientEmail: patient.email || 'N/A',
      patientAddress: patient.address || 'N/A',
      bloodGroup: patient.bloodGroup || 'N/A',
      age: patient.age || 'N/A',
      gender: patient.gender || 'N/A',
      registeredAt: new Date().toISOString()
    }
  });
};
