
import { TestPackage, LabPartner, Language, SiteSettings, ServiceItem, NursingCareService, HealthPackage } from './types';

const TESTS_BN: TestPackage[] = [
  {
    id: '1',
    name: 'কমপ্লিট ব্লাড কাউন্ট (CBC)',
    description: 'রক্তের সার্বিক অবস্থা, হিমোগ্লোবিন, সংক্রমণ ও রক্তস্বল্পতা নির্ণয়ের জন্য।',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 480,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 700,
      'lab_labaid': 750,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 800,
      'lab_evercare': 1000,
      'lab_medinova': 550
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '2',
    name: 'ডায়াবেটিস চেকআপ (HbA1c)',
    description: 'গত ৩ মাসের গড় ব্লাড সুগার ও ডায়াবেটিস নিয়ন্ত্রণের নির্ভরযোগ্য পরিমাপ।',
    price: 850,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1000,
      'lab_ibnsina': 900,
      'lab_birdem': 700,
      'lab_bsmmu': 600,
      'lab_praava': 1100,
      'lab_evercare': 1300,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1200,
      'lab_labaid': 1300,
      'lab_ibnsina': 1150,
      'lab_birdem': 900,
      'lab_bsmmu': 750,
      'lab_praava': 1350,
      'lab_evercare': 1600,
      'lab_medinova': 1050
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '3',
    name: 'লিপিড প্রোফাইল (Lipid Profile)',
    description: 'কোলেস্টেরল, ট্রাইগ্লিসারাইড, এলডিএল ও হার্টের সার্বিক ঝুঁকি নির্ণয়।',
    price: 1200,
    originalPrice: 1600,
    priceByLab: {
      'lab_popular': 1400,
      'lab_labaid': 1500,
      'lab_ibnsina': 1300,
      'lab_birdem': 1000,
      'lab_bsmmu': 800,
      'lab_praava': 1600,
      'lab_evercare': 1900,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1800,
      'lab_labaid': 1900,
      'lab_ibnsina': 1650,
      'lab_birdem': 1300,
      'lab_bsmmu': 1000,
      'lab_praava': 2000,
      'lab_evercare': 2400,
      'lab_medinova': 1500
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '4',
    name: 'থাইরয়েড প্রোফাইল (T3, T4, TSH)',
    description: 'থাইরয়েড হরমোনের ভারসাম্য, মেটাবলিজম ও ওজন পরিবর্তনের কারণ নির্ণয়।',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1800,
      'lab_labaid': 2000,
      'lab_ibnsina': 1600,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000,
      'lab_praava': 2100,
      'lab_evercare': 2500,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 2300,
      'lab_labaid': 2500,
      'lab_ibnsina': 2050,
      'lab_birdem': 1600,
      'lab_bsmmu': 1300,
      'lab_praava': 2600,
      'lab_evercare': 3100,
      'lab_medinova': 1900
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '5',
    name: 'ভিটামিন ডি টেস্ট (25-OH Vitamin D)',
    description: 'হাড়ের শক্তি, পেশীর দুর্বলতা, ক্লান্তি ও রোগ প্রতিরোধ ক্ষমতা পর্যবেক্ষণ।',
    price: 2500,
    originalPrice: 3200,
    priceByLab: {
      'lab_popular': 3000,
      'lab_labaid': 3200,
      'lab_ibnsina': 2700,
      'lab_birdem': 2200,
      'lab_bsmmu': 1800,
      'lab_praava': 3400,
      'lab_evercare': 3900,
      'lab_medinova': 2500
    },
    originalPriceByLab: {
      'lab_popular': 3800,
      'lab_labaid': 4000,
      'lab_ibnsina': 3400,
      'lab_birdem': 2800,
      'lab_bsmmu': 2400,
      'lab_praava': 4200,
      'lab_evercare': 4800,
      'lab_medinova': 3200
    },
    category: 'Vitamin',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৩ দিন'
  },
  {
    id: '6',
    name: 'কিডনি ফাংশন টেস্ট (Serum Creatinine)',
    description: 'কিডনির ফিল্টারিং কার্যকারিতা ও রক্তে ক্রিয়েটিনিনের সঠিক মাত্রা যাচাই।',
    price: 450,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 800,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 850,
      'lab_evercare': 1050,
      'lab_medinova': 600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১০ ঘন্টা'
  },
  {
    id: '7',
    name: 'লিভার ফাংশন টেস্ট (SGPT / ALT)',
    description: 'লিভারের স্বাস্থ্য, ফ্যাটি লিভার ও এনজাইমের স্বাভাবিক কার্যকারিতা নিরীক্ষা।',
    price: 500,
    originalPrice: 700,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 650,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 800,
      'lab_labaid': 850,
      'lab_ibnsina': 700,
      'lab_birdem': 600,
      'lab_bsmmu': 500,
      'lab_praava': 900,
      'lab_evercare': 1100,
      'lab_medinova': 650
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '8',
    name: 'ফাস্টিং ব্লাড সুগার (FBS)',
    description: '৮-১০ ঘণ্টা না খেয়ে রক্তে গ্লুকোজের সঠিক মাত্রা ও তাৎক্ষণিক ডায়াবেটিস স্ক্রিনিং।',
    price: 180,
    originalPrice: 250,
    priceByLab: {
      'lab_popular': 220,
      'lab_labaid': 250,
      'lab_ibnsina': 200,
      'lab_birdem': 150,
      'lab_bsmmu': 100,
      'lab_praava': 280,
      'lab_evercare': 350,
      'lab_medinova': 180
    },
    originalPriceByLab: {
      'lab_popular': 300,
      'lab_labaid': 350,
      'lab_ibnsina': 260,
      'lab_birdem': 200,
      'lab_bsmmu': 150,
      'lab_praava': 380,
      'lab_evercare': 450,
      'lab_medinova': 250
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৬ ঘন্টা'
  },
  {
    id: '9',
    name: 'ইউরিন রুটিন এক্সামিনেশন (Urine R/E)',
    description: 'মূত্রনালীর ইনফেকশন (UTI), প্রোটিন নির্গমন ও কিডনির প্রাথমিক স্ক্রিনিং।',
    price: 300,
    originalPrice: 400,
    priceByLab: {
      'lab_popular': 380,
      'lab_labaid': 400,
      'lab_ibnsina': 340,
      'lab_birdem': 280,
      'lab_bsmmu': 200,
      'lab_praava': 450,
      'lab_evercare': 550,
      'lab_medinova': 300
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 550,
      'lab_ibnsina': 450,
      'lab_birdem': 380,
      'lab_bsmmu': 300,
      'lab_praava': 600,
      'lab_evercare': 750,
      'lab_medinova': 400
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৮ ঘন্টা'
  },
  {
    id: '10',
    name: 'সিরাম ইউরিক অ্যাসিড টেস্ট (Serum Uric Acid)',
    description: 'গেঁটেবাত, জয়েন্টে তীব্র ব্যথা ও রক্তে অতিরিক্ত ইউরিক অ্যাসিডের উপস্থিতি নির্ণয়।',
    price: 450,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 800,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 850,
      'lab_evercare': 1050,
      'lab_medinova': 600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '11',
    name: 'ডেঙ্গু এনএস১ ও অ্যান্টিবডি টেস্ট (Dengue NS1 & CBC)',
    description: 'জ্বরের প্রথম দিনেই ডেঙ্গু ভাইরাস শনাক্তকরণ ও প্লেটলেট কাউন্টের জরুরি ট্র্যাকিং।',
    price: 900,
    originalPrice: 1250,
    priceByLab: {
      'lab_popular': 1000,
      'lab_labaid': 1100,
      'lab_ibnsina': 950,
      'lab_birdem': 800,
      'lab_bsmmu': 600,
      'lab_praava': 1200,
      'lab_evercare': 1450,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1300,
      'lab_labaid': 1400,
      'lab_ibnsina': 1250,
      'lab_birdem': 1050,
      'lab_bsmmu': 850,
      'lab_praava': 1500,
      'lab_evercare': 1800,
      'lab_medinova': 1200
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪ ঘন্টা (জরুরি)'
  },
  {
    id: '12',
    name: 'সিরাম ইলেক্ট্রোলাইটস (Na+, K+, Cl-)',
    description: 'রক্তে সোডিয়াম, পটাশিয়াম ও ক্লোরাইডের ভারসাম্য এবং হার্ট ও রক্তচাপের সুরক্ষা।',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 1100,
      'lab_labaid': 1200,
      'lab_ibnsina': 1050,
      'lab_birdem': 850,
      'lab_bsmmu': 700,
      'lab_praava': 1300,
      'lab_evercare': 1600,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1450,
      'lab_labaid': 1550,
      'lab_ibnsina': 1350,
      'lab_birdem': 1150,
      'lab_bsmmu': 950,
      'lab_praava': 1650,
      'lab_evercare': 2000,
      'lab_medinova': 1300
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  }
];

const TESTS_EN: TestPackage[] = [
  {
    id: '1',
    name: 'Complete Blood Count (CBC)',
    description: 'To assess overall blood health, hemoglobin, and detect infection or anemia.',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 480,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 700,
      'lab_labaid': 750,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 800,
      'lab_evercare': 1000,
      'lab_medinova': 550
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '2',
    name: 'Diabetes Checkup (HbA1c)',
    description: 'Determines 3-month average blood sugar and precise glycemic control.',
    price: 850,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1000,
      'lab_ibnsina': 900,
      'lab_birdem': 700,
      'lab_bsmmu': 600,
      'lab_praava': 1100,
      'lab_evercare': 1300,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1200,
      'lab_labaid': 1300,
      'lab_ibnsina': 1150,
      'lab_birdem': 900,
      'lab_bsmmu': 750,
      'lab_praava': 1350,
      'lab_evercare': 1600,
      'lab_medinova': 1050
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '3',
    name: 'Lipid Profile',
    description: 'Measures total cholesterol, HDL, LDL, and cardiovascular risk factors.',
    price: 1200,
    originalPrice: 1600,
    priceByLab: {
      'lab_popular': 1400,
      'lab_labaid': 1500,
      'lab_ibnsina': 1300,
      'lab_birdem': 1000,
      'lab_bsmmu': 800,
      'lab_praava': 1600,
      'lab_evercare': 1900,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1800,
      'lab_labaid': 1900,
      'lab_ibnsina': 1650,
      'lab_birdem': 1300,
      'lab_bsmmu': 1000,
      'lab_praava': 2000,
      'lab_evercare': 2400,
      'lab_medinova': 1500
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '4',
    name: 'Thyroid Profile (T3, T4, TSH)',
    description: 'Evaluates thyroid hormone balance, metabolic rate, and fatigue.',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1800,
      'lab_labaid': 2000,
      'lab_ibnsina': 1600,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000,
      'lab_praava': 2100,
      'lab_evercare': 2500,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 2300,
      'lab_labaid': 2500,
      'lab_ibnsina': 2050,
      'lab_birdem': 1600,
      'lab_bsmmu': 1300,
      'lab_praava': 2600,
      'lab_evercare': 3100,
      'lab_medinova': 1900
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48 Hours'
  },
  {
    id: '5',
    name: 'Vitamin D Test (25-OH)',
    description: 'Essential for bone mineral density, immunity, and chronic fatigue detection.',
    price: 2500,
    originalPrice: 3200,
    priceByLab: {
      'lab_popular': 3000,
      'lab_labaid': 3200,
      'lab_ibnsina': 2700,
      'lab_birdem': 2200,
      'lab_bsmmu': 1800,
      'lab_praava': 3400,
      'lab_evercare': 3900,
      'lab_medinova': 2500
    },
    originalPriceByLab: {
      'lab_popular': 3800,
      'lab_labaid': 4000,
      'lab_ibnsina': 3400,
      'lab_birdem': 2800,
      'lab_bsmmu': 2400,
      'lab_praava': 4200,
      'lab_evercare': 4800,
      'lab_medinova': 3200
    },
    category: 'Vitamin',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '3 Days'
  },
  {
    id: '6',
    name: 'Kidney Function Test (Serum Creatinine)',
    description: 'Evaluates renal filtration rate and kidney health status.',
    price: 450,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 800,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 850,
      'lab_evercare': 1050,
      'lab_medinova': 600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '10 Hours'
  },
  {
    id: '7',
    name: 'Liver Function Test (SGPT / ALT)',
    description: 'Assesses liver enzyme levels, liver cell health, and fatty liver signs.',
    price: 500,
    originalPrice: 700,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 650,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 800,
      'lab_labaid': 850,
      'lab_ibnsina': 700,
      'lab_birdem': 600,
      'lab_bsmmu': 500,
      'lab_praava': 900,
      'lab_evercare': 1100,
      'lab_medinova': 650
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '8',
    name: 'Fasting Blood Sugar (FBS)',
    description: 'Baseline blood glucose measurement after 8-10 hours fasting.',
    price: 180,
    originalPrice: 250,
    priceByLab: {
      'lab_popular': 220,
      'lab_labaid': 250,
      'lab_ibnsina': 200,
      'lab_birdem': 150,
      'lab_bsmmu': 100,
      'lab_praava': 280,
      'lab_evercare': 350,
      'lab_medinova': 180
    },
    originalPriceByLab: {
      'lab_popular': 300,
      'lab_labaid': 350,
      'lab_ibnsina': 260,
      'lab_birdem': 200,
      'lab_bsmmu': 150,
      'lab_praava': 380,
      'lab_evercare': 450,
      'lab_medinova': 250
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '6 Hours'
  },
  {
    id: '9',
    name: 'Urine Routine Examination (R/E)',
    description: 'Screens for urinary tract infections (UTI), protein leakage, and kidney function.',
    price: 300,
    originalPrice: 400,
    priceByLab: {
      'lab_popular': 380,
      'lab_labaid': 400,
      'lab_ibnsina': 340,
      'lab_birdem': 280,
      'lab_bsmmu': 200,
      'lab_praava': 450,
      'lab_evercare': 550,
      'lab_medinova': 300
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 550,
      'lab_ibnsina': 450,
      'lab_birdem': 380,
      'lab_bsmmu': 300,
      'lab_praava': 600,
      'lab_evercare': 750,
      'lab_medinova': 400
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '8 Hours'
  },
  {
    id: '10',
    name: 'Serum Uric Acid Test',
    description: 'Diagnoses hyperuricemia, gout risk, and inflammatory joint disorders.',
    price: 450,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 800,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 850,
      'lab_evercare': 1050,
      'lab_medinova': 600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '11',
    name: 'Dengue NS1 Antigen & CBC',
    description: 'Rapid detection of acute Dengue fever alongside platelet count monitoring.',
    price: 900,
    originalPrice: 1250,
    priceByLab: {
      'lab_popular': 1000,
      'lab_labaid': 1100,
      'lab_ibnsina': 950,
      'lab_birdem': 800,
      'lab_bsmmu': 600,
      'lab_praava': 1200,
      'lab_evercare': 1450,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1300,
      'lab_labaid': 1400,
      'lab_ibnsina': 1250,
      'lab_birdem': 1050,
      'lab_bsmmu': 850,
      'lab_praava': 1500,
      'lab_evercare': 1800,
      'lab_medinova': 1200
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '4 Hours (Emergency)'
  },
  {
    id: '12',
    name: 'Serum Electrolytes (Na+, K+, Cl-)',
    description: 'Measures body fluid balance, hydration levels, and cardiovascular electrolyte safety.',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 1100,
      'lab_labaid': 1200,
      'lab_ibnsina': 1050,
      'lab_birdem': 850,
      'lab_bsmmu': 700,
      'lab_praava': 1300,
      'lab_evercare': 1600,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1450,
      'lab_labaid': 1550,
      'lab_ibnsina': 1350,
      'lab_birdem': 1150,
      'lab_bsmmu': 950,
      'lab_praava': 1650,
      'lab_evercare': 2000,
      'lab_medinova': 1300
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  }
];

const POPULAR_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#0284C7"/>
  <circle cx="60" cy="50" r="28" fill="#ffffff"/>
  <path d="M60 32v36M42 50h36" stroke="#0284C7" stroke-width="8" stroke-linecap="round"/>
  <circle cx="60" cy="50" r="10" fill="#10B981"/>
  <text x="60" y="102" fill="#ffffff" font-size="15" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1.5">POPULAR</text>
</svg>`);

const LABAID_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#E11D48"/>
  <circle cx="60" cy="48" r="28" fill="#ffffff"/>
  <path d="M44 48c0-8.837 7.163-16 16-16s16 7.163 16 16c0 10-16 22-16 22s-16-12-16-22z" fill="#E11D48"/>
  <path d="M48 48h24M60 38v20" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
  <text x="60" y="102" fill="#ffffff" font-size="15" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1.5">LABAID</text>
</svg>`);

const IBNSINA_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#059669"/>
  <circle cx="60" cy="48" r="28" fill="#ffffff"/>
  <path d="M48 60c0-6.627 5.373-12 12-12s12 5.373 12 12M60 34v12" stroke="#059669" stroke-width="5" stroke-linecap="round"/>
  <circle cx="60" cy="48" r="5" fill="#059669"/>
  <text x="60" y="102" fill="#ffffff" font-size="13" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">IBN SINA</text>
</svg>`);

const BIRDEM_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#0F766E"/>
  <circle cx="60" cy="48" r="28" fill="#ffffff"/>
  <path d="M50 36h20v24H50z" fill="#0F766E" rx="4"/>
  <circle cx="60" cy="48" r="6" fill="#F59E0B"/>
  <text x="60" y="102" fill="#ffffff" font-size="14" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1.5">BIRDEM</text>
</svg>`);

const BSMMU_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#1E3A8A"/>
  <circle cx="60" cy="48" r="28" fill="#ffffff"/>
  <path d="M60 32l16 12-16 12-16-12 16-12z" fill="#D97706"/>
  <path d="M50 56h20v10H50z" fill="#1E3A8A" rx="2"/>
  <text x="60" y="102" fill="#ffffff" font-size="14" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1.5">BSMMU</text>
</svg>`);

const PRAAVA_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#0D9488"/>
  <circle cx="60" cy="48" r="28" fill="#ffffff"/>
  <circle cx="52" cy="48" r="10" fill="#F43F5E" fill-opacity="0.8"/>
  <circle cx="68" cy="48" r="10" fill="#0D9488" fill-opacity="0.8"/>
  <text x="60" y="102" fill="#ffffff" font-size="14" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1.5">PRAAVA</text>
</svg>`);

const EVERCARE_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#4338CA"/>
  <circle cx="60" cy="48" r="28" fill="#ffffff"/>
  <path d="M60 32l6 12 13 2-10 9 3 13-12-6-12 6 3-13-10-9 13-2 6-12z" fill="#4338CA"/>
  <text x="60" y="102" fill="#ffffff" font-size="12" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">EVERCARE</text>
</svg>`);

const MEDINOVA_LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="24" fill="#EA580C"/>
  <circle cx="60" cy="48" r="28" fill="#ffffff"/>
  <path d="M46 48a14 14 0 1 0 28 0 14 14 0 1 0-28 0" stroke="#EA580C" stroke-width="6"/>
  <circle cx="60" cy="48" r="5" fill="#EA580C"/>
  <text x="60" y="102" fill="#ffffff" font-size="12" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">MEDINOVA</text>
</svg>`);

const LABS_BN: LabPartner[] = [
  { 
    id: 'lab_popular', 
    name: 'পপুলার ডায়াগনস্টিক সেন্টার লিঃ', 
    rating: 4.8, 
    logo: POPULAR_LOGO, 
    serviceCharge: 200,
    location: 'ধানমন্ডি, শান্তিনগর, উত্তরা ও সারা দেশ',
    discountBadge: '১০% বিশেষ ছাড়',
    accreditation: 'ISO 15189 সার্টিফাইড',
    accentColor: '#0284C7'
  },
  { 
    id: 'lab_labaid', 
    name: 'ল্যাবএইড ডায়াগনস্টিক সেন্টার', 
    rating: 4.9, 
    logo: LABAID_LOGO, 
    serviceCharge: 250,
    location: 'ধানমন্ডি, গুলশান, বনানী ও চট্টগ্রাম',
    discountBadge: '১৫% মেম্বার ছাড়',
    accreditation: 'JCI স্ট্যান্ডার্ড ল্যাব',
    accentColor: '#E11D48'
  },
  { 
    id: 'lab_ibnsina', 
    name: 'ইবনে সিনা ডায়াগনস্টিক সেন্টার', 
    rating: 4.8, 
    logo: IBNSINA_LOGO, 
    serviceCharge: 180,
    location: 'ধানমন্ডি, মিরপুর, বাড্ডা ও উত্তরা',
    discountBadge: '১২% সাশ্রয়ী অফার',
    accreditation: 'আন্তর্জাতিক মানসম্মত',
    accentColor: '#059669'
  },
  { 
    id: 'lab_birdem', 
    name: 'বারডেম জেনারেল হাসপাতাল', 
    rating: 4.7, 
    logo: BIRDEM_LOGO, 
    serviceCharge: 150,
    location: 'শাহবাগ ও সেগুনবাগিচা, ঢাকা',
    discountBadge: 'ডায়াবেটিস বিশেষজ্ঞ',
    accreditation: 'WHO কোলাবোরেটিং সেন্টার',
    accentColor: '#0F766E'
  },
  { 
    id: 'lab_bsmmu', 
    name: 'বিএসএমএমইউ (পিজি হাসপাতাল)', 
    rating: 4.6, 
    logo: BSMMU_LOGO, 
    serviceCharge: 100,
    location: 'শাহবাগ, ঢাকা',
    discountBadge: 'সরকারি ভর্তুকি রেট',
    accreditation: 'মেডিকেল বিশ্ববিদ্যালয় ল্যাব',
    accentColor: '#1E3A8A'
  },
  { 
    id: 'lab_praava', 
    name: 'প্রাভা হেলথ ডায়াগনস্টিকস', 
    rating: 4.9, 
    logo: PRAAVA_LOGO, 
    serviceCharge: 300,
    location: 'বনানী ও গুলশান, ঢাকা',
    discountBadge: 'ফাস্ট ট্র্যাক রিপোর্ট',
    accreditation: 'CAP অ্যাক্রিডিটেড',
    accentColor: '#0D9488'
  },
  { 
    id: 'lab_evercare', 
    name: 'এভারকেয়ার হাসপাতাল ল্যাব', 
    rating: 4.9, 
    logo: EVERCARE_LOGO, 
    serviceCharge: 350,
    location: 'বসুন্ধরা আ/এ, ঢাকা ও চট্টগ্রাম',
    discountBadge: 'প্রিমিয়াম কেয়ার',
    accreditation: 'JCI গোল্ড সিল ল্যাব',
    accentColor: '#4338CA'
  },
  { 
    id: 'lab_medinova', 
    name: 'মেডিনোভা মেডিকেল সার্ভিসেস', 
    rating: 4.7, 
    logo: MEDINOVA_LOGO, 
    serviceCharge: 180,
    location: 'ধানমন্ডি, মালিবাগ ও মিরপুর',
    discountBadge: '১০% ছাড়',
    accreditation: 'অভিজ্ঞ প্যাথলজি টিম',
    accentColor: '#EA580C'
  }
];

const LABS_EN: LabPartner[] = [
  { 
    id: 'lab_popular', 
    name: 'Popular Diagnostic Centre Ltd.', 
    rating: 4.8, 
    logo: POPULAR_LOGO, 
    serviceCharge: 200,
    location: 'Dhanmondi, Shantinagar, Uttara & Nationwide',
    discountBadge: '10% Discount',
    accreditation: 'ISO 15189 Certified',
    accentColor: '#0284C7'
  },
  { 
    id: 'lab_labaid', 
    name: 'Labaid Diagnostics Center', 
    rating: 4.9, 
    logo: LABAID_LOGO, 
    serviceCharge: 250,
    location: 'Dhanmondi, Gulshan, Banani & Ctg',
    discountBadge: '15% Discount',
    accreditation: 'JCI Standard Lab',
    accentColor: '#E11D48'
  },
  { 
    id: 'lab_ibnsina', 
    name: 'Ibn Sina Diagnostic & Consultation Centre', 
    rating: 4.8, 
    logo: IBNSINA_LOGO, 
    serviceCharge: 180,
    location: 'Dhanmondi, Mirpur, Badda & Uttara',
    discountBadge: '12% Special Off',
    accreditation: 'International Standard',
    accentColor: '#059669'
  },
  { 
    id: 'lab_birdem', 
    name: 'BIRDEM General Hospital', 
    rating: 4.7, 
    logo: BIRDEM_LOGO, 
    serviceCharge: 150,
    location: 'Shahbagh, Dhaka',
    discountBadge: 'Diabetes Specialist',
    accreditation: 'WHO Collaborating Center',
    accentColor: '#0F766E'
  },
  { 
    id: 'lab_bsmmu', 
    name: 'BSMMU (PG Hospital Diagnostics)', 
    rating: 4.6, 
    logo: BSMMU_LOGO, 
    serviceCharge: 100,
    location: 'Shahbagh, Dhaka',
    discountBadge: 'Govt. Subsidized',
    accreditation: 'University Medical Lab',
    accentColor: '#1E3A8A'
  },
  { 
    id: 'lab_praava', 
    name: 'Praava Health Diagnostics', 
    rating: 4.9, 
    logo: PRAAVA_LOGO, 
    serviceCharge: 300,
    location: 'Banani & Gulshan, Dhaka',
    discountBadge: 'Fast Track Reports',
    accreditation: 'CAP Accredited Lab',
    accentColor: '#0D9488'
  },
  { 
    id: 'lab_evercare', 
    name: 'Evercare Hospital Diagnostic Lab', 
    rating: 4.9, 
    logo: EVERCARE_LOGO, 
    serviceCharge: 350,
    location: 'Bashundhara R/A, Dhaka & Ctg',
    discountBadge: 'Premium Care',
    accreditation: 'JCI Gold Seal Lab',
    accentColor: '#4338CA'
  },
  { 
    id: 'lab_medinova', 
    name: 'Medinova Medical Services', 
    rating: 4.7, 
    logo: MEDINOVA_LOGO, 
    serviceCharge: 180,
    location: 'Dhanmondi, Malibagh & Mirpur',
    discountBadge: '10% Discount',
    accreditation: 'Senior Pathology Team',
    accentColor: '#EA580C'
  }
];

export const getTests = (lang: Language): TestPackage[] => {
  return lang === 'en' ? TESTS_EN : TESTS_BN;
};

export const getLabs = (lang: Language): LabPartner[] => {
  return lang === 'en' ? LABS_EN : LABS_BN;
};

export const DEFAULT_SERVICES_BN: ServiceItem[] = [
  {
    id: 'srv_1',
    title: 'হোম স্যাম্পল কালেকশন',
    description: 'অভিজ্ঞ ও সার্টিফাইড মেডিকেল টেকনোলজিস্ট আপনার বাসায় গিয়ে নিরাপদভাবে রক্তের ও অন্যান্য স্যাম্পল সংগ্রহ করবেন।',
    icon: 'Home',
    badge: 'সবচেয়ে জনপ্রিয়',
    isActive: true
  },
  {
    id: 'srv_2',
    title: 'শীর্ষস্থানীয় ল্যাবে টেস্ট',
    description: 'পপুলার, ল্যাবএইড, বারডেম এবং বিএসএমএমইউ-এর মতো নির্ভরযোগ্য ডায়াগনস্টিক সেন্টার থেকে শতভাগ নির্ভুল রিপোর্ট।',
    icon: 'FlaskConical',
    badge: '১০০% নির্ভুল',
    isActive: true
  },
  {
    id: 'srv_3',
    title: 'অনলাইন ও দ্রুত রিপোর্ট ডেলিভারি',
    description: 'টেস্ট সম্পন্ন হওয়ার সাথে সাথেই WhatsApp ও ইমেইলে সুরক্ষিত ডিজিটাল রিপোর্ট এবং ড্যাশবোর্ড থেকে ডাউনলোড।',
    icon: 'FileText',
    badge: 'দ্রুত ডেলিভারি',
    isActive: true
  },
  {
    id: 'srv_4',
    title: 'ডাক্তার কনসালটেশন ও গাইডলাইন',
    description: 'রিপোর্ট প্রাপ্তির পর অভিজ্ঞ চিকিৎসকদের সাথে অনলাইন টেলিমেডিসিন পরামর্শ ও প্রেসক্রিপশন সেবা।',
    icon: 'Stethoscope',
    badge: 'টেলিমেডিসিন',
    isActive: true
  },
  {
    id: 'srv_5',
    title: 'জরুরি ইসিজি ও ডায়াবেটিস চেকআপ',
    description: 'বাসায় পোর্টেবল ইসিজি মেশিন ও জরুরি ব্লাড সুগার মনিটরিং সেবা মাত্র ৬০ মিনিটে।',
    icon: 'HeartPulse',
    badge: 'জরুরি সেবা',
    isActive: true
  },
  {
    id: 'srv_6',
    title: 'প্রেসক্রিপশন আপলোড সুবিধা',
    description: 'ডাক্তারের প্রেসক্রিপশন ছবি তুলে আপলোড করুন, আমাদের স্বাস্থ্য প্রতিনিধি আপনার প্রয়োজনীয় টেস্ট স্বয়ংক্রিয়ভাবে বুক করে দেবে।',
    icon: 'ShieldCheck',
    badge: 'সহজ বুকিং',
    isActive: true
  }
];

export const DEFAULT_SERVICES_EN: ServiceItem[] = [
  {
    id: 'srv_1',
    title: 'Home Sample Collection',
    description: 'Certified medical phlebotomists collect blood & other samples right from the comfort and safety of your home.',
    icon: 'Home',
    badge: 'Most Popular',
    isActive: true
  },
  {
    id: 'srv_2',
    title: 'Tests by Top Diagnostic Labs',
    description: 'Partnered with premier labs like Popular, Labaid, BIRDEM & BSMMU ensuring 100% accurate results.',
    icon: 'FlaskConical',
    badge: '100% Accurate',
    isActive: true
  },
  {
    id: 'srv_3',
    title: 'Instant Online Report Delivery',
    description: 'Get verified digital lab reports delivered securely via WhatsApp, Email and your online patient portal.',
    icon: 'FileText',
    badge: 'Fast Delivery',
    isActive: true
  },
  {
    id: 'srv_4',
    title: 'Doctor Teleconsultation',
    description: 'Post-report expert physician consultation and guidance via secure telemedicine audio/video call.',
    icon: 'Stethoscope',
    badge: 'Telemedicine',
    isActive: true
  },
  {
    id: 'srv_5',
    title: 'Emergency ECG & Health Monitoring',
    description: 'At-home portable 12-lead ECG, blood sugar & vital signs monitoring within 60 minutes.',
    icon: 'HeartPulse',
    badge: 'Emergency',
    isActive: true
  },
  {
    id: 'srv_6',
    title: 'Prescription Upload & Auto-Booking',
    description: 'Snap a photo of your prescription and our medical team will automatically organize the required tests for you.',
    icon: 'ShieldCheck',
    badge: 'Easy Booking',
    isActive: true
  }
];

export const DEFAULT_NURSING_SERVICES_BN: NursingCareService[] = [
  {
    id: 'nurs_1',
    title: '১২/২৪ ঘণ্টা পেশেন্ট কেয়ার নার্স',
    description: 'দক্ষ ও ডিপ্লোমাধারী নার্সের মাধ্যমে বয়োবৃদ্ধ, শয্যাশায়ী ও গুরুতর অসুস্থ রোগীর জন্য ডে/নাইট শিফটে সার্বক্ষণিক নিবিড় পরিচর্যা।',
    category: 'হোম নার্সিং',
    price: 1500,
    duration: '১২ ঘণ্টা / শিফট (২৪ ঘণ্টা: ৳২,৮০০)',
    badge: 'সর্বাধিক জনপ্রিয়',
    icon: 'HeartPulse',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
    features: [
      'নিয়মিত ওষুধ সেবন ও ভাইটাল সাইন (BP, Pulse, SpO2) মনিটরিং',
      'ক্যাথেটার, রাইলস টিউব ও ইউরিন ব্যাগ কেয়ার',
      'স্যালাইন ও আইভি ইনজেকশন পুশ',
      'বিছানায় শোয়া রোগীর ব্যক্তিগত পরিচ্ছন্নতা ও পজিশনিং'
    ],
    isActive: true
  },
  {
    id: 'nurs_2',
    title: 'পোস্ট-অপারেটিভ সার্জারি কেয়ার',
    description: 'হাসপাতাল থেকে ডিসচার্জ পাওয়ার পর ঘরে ইনফেকশনমুক্ত দ্রুত সুস্থতা নিশ্চিত করতে অভিজ্ঞ সার্জিক্যাল নার্স সাপোর্ট।',
    category: 'সার্জারি পরবর্তী সেবা',
    price: 1800,
    duration: 'প্রতি শিফট / প্রয়োজনানুসারে',
    badge: 'বিশেষায়িত নার্সিং',
    icon: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    features: [
      'সার্জিক্যাল উন্ড ড্রেসিং ও সেলাই পরিচর্যা',
      'ব্যথানাশক ও অ্যান্টিবায়োটিক ইনজেকশন প্রয়োগ',
      'ড্রেন টিউব ও কলোস্টমি ব্যাগ হ্যান্ডলিং',
      'সংক্রমণ প্রতিরোধ ও দ্রুত আরোগ্য পরামর্শ'
    ],
    isActive: true
  },
  {
    id: 'nurs_3',
    title: 'ইনজেকশন, ক্যানুলা ও স্যালাইন পুশ',
    description: 'রেজিস্টার্ড নার্স বাসায় এসে শতভাগ জীবাণুমুক্ত পরিবেশে শর্ট ভিজিটে ইনজেকশন, ক্যানুলা ও ক্যাথেটার সেবা প্রদান করেন।',
    category: 'শর্ট ভিজিট প্রসিডিউর',
    price: 500,
    duration: 'প্রতি ভিজিট (৩০-৪৫ মিনিট)',
    badge: 'জরুরি সার্ভিস',
    icon: 'Stethoscope',
    imageUrl: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=800',
    features: [
      'আইভি/আইএম ইনজেকশন ও ক্যানুলা সেটআপ',
      'ইউরিন ক্যাথেটার প্রবেশ ও পরিবর্তন',
      'স্যালাইন পুশ ও নেবুলাইজেশন সাপোর্ট',
      'প্রেসক্রিপশন অনুযায়ী সুনির্দিষ্ট ডোজ প্রয়োগ'
    ],
    isActive: true
  },
  {
    id: 'nurs_4',
    title: 'প্রবীণ ও স্ট্রোক পেশেন্ট হোম কেয়ার',
    description: 'অচল বা শয্যাশায়ী প্রবীণ মা-বাবা ও স্বজনদের জন্য পরম যত্নশীল, সহানুভূতিশীল ও প্রশিক্ষিত কেয়ারগিভার সার্ভিস।',
    category: 'প্রবীণ সেবা',
    price: 1600,
    duration: '১২/২৪ ঘণ্টা শিফট বা মাসিক প্যাকেজ',
    badge: 'মমতাময়ী সেবা',
    icon: 'ShieldCheck',
    imageUrl: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800',
    features: [
      'স্ট্রোক পরবর্তী প্যারালাইজড রোগীর নিবিড় পরিচর্যা',
      'বেড সোর প্রতিরোধ ও স্পেশাল এয়ার ম্যাট্রেস কেয়ার',
      'ফিডিং টিউব ও পুষ্টিকর খাদ্য ব্যবস্থাপনা',
      'মানসিক প্রফুল্লতা ও সার্বক্ষণিক সঙ্গ প্রদান'
    ],
    isActive: true
  },
  {
    id: 'nurs_5',
    title: 'বাসায় ফিজিওথেরাপি ও রিহ্যাবিলিটেশন',
    description: 'অভিজ্ঞ গ্র্যাজুয়েট ফিজিওথেরাপিস্ট দ্বারা বাসায় রোগীর গতিশীলতা, ব্যথামুক্তি ও কর্মক্ষমতা ফিরিয়ে আনার চিকিৎসা।',
    category: 'ফিজিওথেরাপি',
    price: 800,
    duration: 'প্রতি সেশন (৪৫-৬০ মিনিট)',
    badge: 'দক্ষ থেরাপিস্ট',
    icon: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
    features: [
      'কোমর, হাঁটু ও ঘাড় ব্যথার আধুনিক ফিজিওথেরাপি',
      'স্ট্রোক পরবর্তী অঙ্গ-প্রত্যঙ্গের মোবিলাইজেশন এক্সারসাইজ',
      'পোস্ট-ফ্র্যাকচার রিহ্যাবিলিটেশন এক্সারসাইজ',
      'চেস্ট ফিজিওথেরাপি ও শ্বাসকষ্টের ব্যায়াম'
    ],
    isActive: true
  },
  {
    id: 'nurs_6',
    title: 'মেডিকেল ইকুইপমেন্ট ও অক্সিজেন সাপোর্ট',
    description: 'জরুরি প্রয়োজনে ঘরে বসেই হাসপাতালের মতো অক্সিজেন, সাকশন মেশিন ও আধুনিক মেডিকেল যন্ত্রাংশ সহায়তা ও সেটআপ।',
    category: 'ইকুইপমেন্ট সেবা',
    price: 1200,
    duration: 'দৈনিক / মাসিক ভাড়া ও ইনস্টলেশন',
    badge: 'জরুরি সেটআপ',
    icon: 'HeartPulse',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    features: [
      'অক্সিজেন সিলিন্ডার ও কনসেনট্রেটর সেটআপ',
      'সাকশন মেশিন ও আল্ট্রাসনিক নেবুলাইজার সাপোর্ট',
      'আইসিইউ/হাসপাতাল বেড ও এয়ার ম্যাট্রেস সার্ভিস',
      'পালস অক্সিমিটার ও বিপি মেশিন প্রশিক্ষণ'
    ],
    isActive: true
  }
];

export const DEFAULT_NURSING_SERVICES_EN: NursingCareService[] = [
  {
    id: 'nurs_1',
    title: '12/24 Hours Patient Care Nurse',
    description: 'Certified diploma & registered nurses providing round-the-clock intensive clinical care for bedridden and recovering patients.',
    category: 'Home Nursing',
    price: 1500,
    duration: '12 Hrs / Shift (24 Hrs: ৳2,800)',
    badge: 'Most Popular',
    icon: 'HeartPulse',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
    features: [
      'Medication administration & vital signs (BP, Pulse, SpO2) tracking',
      'Catheter, Ryle’s tube & urine bag maintenance',
      'Saline IV push & clinical infection control',
      'Bedbound patient positioning & personal hygiene'
    ],
    isActive: true
  },
  {
    id: 'nurs_2',
    title: 'Post-Operative Surgical Care',
    description: 'Specialized at-home surgical nurses to accelerate wound healing, manage drains, and prevent postoperative complications.',
    category: 'Post-Surgery',
    price: 1800,
    duration: 'Per Shift / On Demand',
    badge: 'Specialized Nursing',
    icon: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    features: [
      'Surgical wound dressing & suture care',
      'Analgesic & IV antibiotic administration',
      'Drainage tube & colostomy bag management',
      'Infection prevention & recovery counseling'
    ],
    isActive: true
  },
  {
    id: 'nurs_3',
    title: 'Injections, Cannula & IV Infusion',
    description: 'Sterile, on-demand quick home visits for injections, cannula insertion, and saline infusions by certified nurses.',
    category: 'Quick Visit',
    price: 500,
    duration: 'Per Visit (30-45 Mins)',
    badge: 'Fast Response',
    icon: 'Stethoscope',
    imageUrl: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=800',
    features: [
      'IV/IM Injections & IV cannula insertion',
      'Urinary catheter insertion & replacement',
      'Saline infusion & nebulizer support',
      'Strict adherence to doctor’s prescription'
    ],
    isActive: true
  },
  {
    id: 'nurs_4',
    title: 'Elderly & Stroke Patient Care',
    description: 'Compassionate and trained caregivers delivering patient-centric daily assistance and companionship for senior citizens.',
    category: 'Elderly Care',
    price: 1600,
    duration: '12/24 Hrs or Monthly Packages',
    badge: 'Compassionate Care',
    icon: 'ShieldCheck',
    imageUrl: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800',
    features: [
      'Post-stroke paralyzed patient specialized care',
      'Bed sore prevention & air mattress management',
      'Feeding tube support & nutritional guidance',
      'Emotional companionship & mobility assistance'
    ],
    isActive: true
  },
  {
    id: 'nurs_5',
    title: 'Home Physiotherapy & Rehabilitation',
    description: 'Graduate physiotherapists providing customized at-home movement therapy, pain relief, and mobility rehabilitation.',
    category: 'Physiotherapy',
    price: 800,
    duration: 'Per Session (45-60 Mins)',
    badge: 'Certified Therapists',
    icon: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
    features: [
      'Back, knee & cervical spine therapy',
      'Post-stroke neuro-rehab & motor retraining',
      'Post-fracture joint mobilization exercises',
      'Chest physiotherapy & breathing techniques'
    ],
    isActive: true
  },
  {
    id: 'nurs_6',
    title: 'Medical Equipment & Oxygen Setup',
    description: 'Doorstep delivery, setup, and maintenance of medical equipment, oxygen concentrators, and hospital beds.',
    category: 'Medical Equipment',
    price: 1200,
    duration: 'Daily / Monthly Rental & Setup',
    badge: 'Emergency Setup',
    icon: 'HeartPulse',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    features: [
      'Oxygen cylinder & concentrator delivery & setup',
      'Suction machine & ultrasonic nebulizers',
      'ICU hospital beds & medical air mattresses',
      'Vital sign monitors & device training'
    ],
    isActive: true
  }
];

export const DEFAULT_HERO_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&q=80&w=800"
];

export const PRESET_GALLERY_IMAGES: { url: string; label: string }[] = [
  { url: "https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800", label: "Lab Technician in Gloves" },
  { url: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=800", label: "Blood Sampling Tubes" },
  { url: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800", label: "Clinical Lab Workspace" },
  { url: "https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&q=80&w=800", label: "Modern Diagnostic Center" },
  { url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800", label: "Home Health Checkup" },
  { url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800", label: "Caring Doctor & Patient" },
  { url: "https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=800", label: "Microscope & Blood Slides" },
  { url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800", label: "Diagnostic Equipment" }
];

export const DEFAULT_SITE_SETTINGS_BN: SiteSettings = {
  siteName: 'LabHome BD',
  siteTagline: 'বাংলাদেশের বিশ্বস্ত হোম স্যাম্পল কালেকশন ও ডিজিটাল ডায়াগনস্টিক প্ল্যাটফর্ম',
  logoUrl: '',
  logoIcon: 'FlaskConical',
  
  // Hero Section
  heroBadge: '🚀 বাংলাদেশের বিশ্বস্ত হোম স্যাম্পল কালেকশন সার্ভিস',
  heroTitle: 'ঘরে বসেই বিশ্বস্ত ল্যাব টেস্ট ও',
  heroTitleHighlight: 'হোম স্যাম্পল কালেকশন',
  heroDesc: 'পপুলার, ল্যাবএইড, বারডেমসহ দেশের শীর্ষ ডায়াগনস্টিক সেন্টার থেকে বিশেষজ্ঞের মাধ্যমে রক্ত সংগ্রহ ও ডিজিটাল রিপোর্ট ডেলিভারি।',
  heroBtnBook: 'টেস্ট বুক করুন',
  heroImages: [...DEFAULT_HERO_IMAGES],

  // Partner Diagnostic Centers Section
  partnerBadge: 'বিশ্বস্ত ডায়াগনস্টিক নেটওয়ার্ক',
  partnerTitle: 'আমাদের অনুমোদিত ডায়াগনস্টিক পার্টনার্স',
  partnerDesc: 'ল্যাব সিলেক্ট করে সহজেই টেস্ট ও ক্যাটালগ ব্রাউজ করুন',
  partnerBtnText: 'সব দেখুন',

  // Popular Tests Section
  popularTestsBadge: 'জনপ্রিয় স্বাস্থ্য পরীক্ষা',
  popularTestsTitle: 'জনপ্রিয় ডায়াগনস্টিক টেস্টসমূহ',
  popularTestsDesc: 'একক টেস্টের বিস্তারিত তালিকা। অর্ডার করুন এবং দক্ষ স্যাম্পল কালেক্টরকে বাসায় ডাকুন।',
  popularTestsBtnText: 'সকল টেস্ট দেখুন (১০০+)',

  // Health Packages Section
  packagesBadge: 'বিশেষ সাশ্রয়ী প্যাকেজ',
  packagesTitle: 'এসেনশিয়াল হোম ডায়াগনস্টিক প্যাকেজ',
  packagesDesc: 'একক টেস্টের চেয়ে প্যাকেজে খরচ বাঁচান ৪০% পর্যন্ত। ৪টি টেস্টের প্রাথমিক স্ক্রিনিং থেকে ১০টি টেস্টের সম্পূর্ণ ফুল বডি চেকআপ।',
  packagesBtnText: 'সকল প্যাকেজ দেখুন',

  // Nursing & Care Section
  nursingBadge: 'হোম নার্সিং ও পেশেন্ট কেয়ার',
  nursingTitle: 'প্রফেশনাল নার্সিং ও হোম কেয়ার সার্ভিস',
  nursingDesc: 'দক্ষ রেজিস্টার্ড নার্স ও কেয়ারগিভারের মাধ্যমে আপনার প্রিয়জনের জন্য বাসায় বিশেষায়িত সেবা, পোস্ট-সার্জারি কেয়ার ও স্বাস্থ্য পরিচর্যা।',
  nursingHotline: '09612-000000',
  nursingWhatsApp: '01700000000',
  nursingServices: DEFAULT_NURSING_SERVICES_BN,

  // How It Works / Steps
  howItWorksTitle: 'সহজ ৩টি ধাপে ঘরে বসে ল্যাব টেস্ট',
  howItWorksSteps: [
    {
      title: 'টেস্ট বা প্যাকেজ সিলেক্ট করুন',
      desc: 'আপনার প্রয়োজনীয় ডায়াগনস্টিক টেস্ট বা প্যাকেজ বেছে নিয়ে পছন্দের ল্যাব সিলেক্ট করুন।',
      icon: 'Search'
    },
    {
      title: 'বাসায় স্যাম্পল কালেকশন',
      desc: 'আমাদের দক্ষ ফ্লেবোটোমিস্ট আপনার সুবিধাজনক সময়ে নিরাপদে বাসায় এসে স্যাম্পল সংগ্রহ করবেন।',
      icon: 'Home'
    },
    {
      title: 'অনলাইনে রিপোর্ট পান',
      desc: 'ল্যাব অ্যানালাইসিসের পর আপনার রেজিস্টার্ড ফোন, হোয়াটসঅ্যাপ ও ইমেইলে দ্রুত ডিজিটাল রিপোর্ট পান।',
      icon: 'Activity'
    }
  ],

  // Services Section
  servicesBadge: 'আমাদের সেবাসমূহ',
  servicesTitle: 'আমাদের স্বাস্থ্যসেবা সমূহ',
  servicesDesc: 'ঘরে বসেই উন্নত মানের ডায়াগনস্টিক ও ল্যাব টেস্ট সেবা নিশ্চিত করতে আমরা প্রতিজ্ঞাবদ্ধ।',

  // About Us
  aboutBadge: 'আমাদের সম্পর্কে',
  aboutTitle: 'আমাদের সম্পর্কে (About Us)',
  aboutDescription: 'LabHome BD হলো বাংলাদেশের একটি নির্ভরযোগ্য ডিজিটাল স্বাস্থ্যসেবা ও হোম ডায়াগনস্টিক প্ল্যাটফর্ম। ট্রাফিকের ভিড় এড়িয়ে ঘরে বসেই পপুলার, ল্যাবএইড, বারডেমসহ দেশের সেরা ল্যাব থেকে রক্ত পরীক্ষা ও ডায়াগনস্টিক টেস্টের সুবিধা দিতে আমরা বদ্ধপরিকর।',
  aboutStory: '২০২৪ সাল থেকে আমাদের দক্ষ মেডিকেল টেকনোলজিস্ট ও সার্টিফাইড ল্যাব পার্টনারদের মাধ্যমে ঢাকার হাজারো পরিবারের কাছে সহজে, নিরাপদে ও সাশ্রয়ী মূল্যে হোম স্যাম্পল কালেকশন ও ইনস্ট্যান্ট অনলাইন রিপোর্ট সেবা পৌঁছে দিচ্ছি।',
  aboutStats: [
    { label: 'সফল স্যাম্পল কালেকশন', value: '৫০,০০০+' },
    { label: 'ল্যাব পার্টনার', value: '১৫+ শীর্ষ ল্যাব' },
    { label: 'রিপোর্টের নির্ভুলতা', value: '৯৯.৯%' },
    { label: 'গড় রেসপন্স টাইম', value: '৪৫ মিনিট' }
  ],
  aboutImage: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800',

  // Contact Details
  contactAddress: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা - ১২০৫, বাংলাদেশ',
  contactPhone: '01700-000000',
  contactHotline: '09612-000000',
  contactEmail: 'support@labhomebd.com',
  contactWhatsApp: '01700000000',
  emergencyNumber: '01800-000000',
  workingHours: 'সকাল ৭:০০ টা - রাত ১০:০০ টা (প্রতিদিন)',
  facebookUrl: 'https://facebook.com/labhomebd',
  services: DEFAULT_SERVICES_BN,

  // Invoice & Money Receipt Defaults
  invoiceOrgName: 'LabHome BD - Smart Healthcare Services',
  invoiceOrgSubtitle: 'বিশ্বস্ত হোম ডায়াগনস্টিক ও ডিজিটাল ল্যাব কেয়ার নেটওয়ার্ক',
  invoiceAddress: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা - ১২০৫, বাংলাদেশ',
  invoiceHotline: '+880 9613-828282 / 01700-000000',
  invoiceEmail: 'support@labhomebd.com',
  invoiceWebsite: 'www.labhomebd.com',
  invoiceTermsTitle: 'স্যাম্পল কালেকশন ও রিপোর্ট নির্দেশিকা (Important Guidelines):',
  invoiceGuidelines: [
    'ফাস্টিং ব্লাড সুগার বা লিপিড প্রোফাইল টেস্ট থাকলে অনুগ্রহ করে ৮-১০ ঘণ্টা উপবাস থাকুন।',
    'আমাদের প্রশিক্ষিত মেডিকেল টেকনোলজিস্ট জীবাণুমুক্ত কিট নিয়ে আপনার ঠিকানায় নির্ধারিত সময়ে পৌঁছাবেন।',
    'ল্যাব টেস্ট সম্পন্ন হওয়ার পর আপনার পেশেন্ট ড্যাশবোর্ড ও এসএমএস/হোয়াটসঅ্যাপে ভেরিফাইড রিপোর্ট পাওয়া যাবে।',
    'যেকোনো সহায়তায় আমাদের হটলাইনে (+880 9613-828282) যোগাযোগ করুন।'
  ],
  invoiceFooterNote: '✓ Verified Digital Money Receipt • Computer Generated',
  invoiceWatermark: 'LabHome BD'
};

export const DEFAULT_SITE_SETTINGS_EN: SiteSettings = {
  siteName: 'LabHome BD',
  siteTagline: 'Trusted Home Sample Collection & Digital Diagnostic Platform in Bangladesh',
  logoUrl: '',
  logoIcon: 'FlaskConical',

  // Hero Section
  heroBadge: '🚀 Trusted Home Sample Collection Service in BD',
  heroTitle: 'Reliable Lab Tests Done at Home &',
  heroTitleHighlight: 'Doorstep Sample Collection',
  heroDesc: 'Book certified lab diagnostics from Popular, Labaid, BIRDEM & get fast digital reports delivered directly to your device.',
  heroBtnBook: 'Book Test Now',
  heroImages: [...DEFAULT_HERO_IMAGES],

  // Partner Diagnostic Centers Section
  partnerBadge: 'Trusted Diagnostic Network',
  partnerTitle: 'Accredited Diagnostic Lab Partners',
  partnerDesc: 'Select any partner lab to explore tests and diagnostic packages',
  partnerBtnText: 'View All',

  // Popular Tests Section
  popularTestsBadge: 'Popular Diagnostics',
  popularTestsTitle: 'Popular Diagnostic Tests',
  popularTestsDesc: 'Browse individual diagnostics with certified blood collection right at your home.',
  popularTestsBtnText: 'Browse All 100+ Tests',

  // Health Packages Section
  packagesBadge: 'Special Value Bundles',
  packagesTitle: 'Essential Home Diagnostic Packages',
  packagesDesc: 'Save up to 40% on standard packages. From 4-test routine screenings to 10-test full body diagnostic panels.',
  packagesBtnText: 'Explore All Packages',

  // Nursing & Care Section
  nursingBadge: 'Home Nursing & Care',
  nursingTitle: 'Professional Nursing & Home Care Services',
  nursingDesc: 'Certified registered nurses and compassionate caregivers providing clinical home care, post-surgery recovery, and elderly support.',
  nursingHotline: '09612-000000',
  nursingWhatsApp: '01700000000',
  nursingServices: DEFAULT_NURSING_SERVICES_EN,

  // How It Works / Steps
  howItWorksTitle: 'How It Works in 3 Simple Steps',
  howItWorksSteps: [
    {
      title: 'Choose Test or Package',
      desc: 'Browse individual diagnostics or value packages and choose your preferred accredited lab partner.',
      icon: 'Search'
    },
    {
      title: 'Doorstep Sample Collection',
      desc: 'Certified medical phlebotomist visits your home or office at your requested time slot.',
      icon: 'Home'
    },
    {
      title: 'Get Verified Online Reports',
      desc: 'Receive digital test reports quickly via WhatsApp, Email and your patient dashboard.',
      icon: 'Activity'
    }
  ],

  // Services Section
  servicesBadge: 'Our Services',
  servicesTitle: 'Our Specialized Healthcare Services',
  servicesDesc: 'Reliable, hospital-grade sample collection and diagnostics delivered right at your doorstep.',

  // About Us
  aboutBadge: 'About Us',
  aboutTitle: 'About LabHome BD',
  aboutDescription: 'LabHome BD is Bangladesh’s premier digital healthcare and doorstep diagnostic platform. Skip traffic jams and clinic queues by getting diagnostic tests done from top accredited labs directly from home.',
  aboutStory: 'Founded in 2024, we empower thousands of families across Dhaka with prompt, hygienic, and affordable blood sample collection, analyzed at accredited labs like Popular, Labaid, BIRDEM, and BSMMU.',
  aboutStats: [
    { label: 'Successful Collections', value: '50,000+' },
    { label: 'Lab Partners', value: '15+ Top Labs' },
    { label: 'Report Accuracy', value: '99.9%' },
    { label: 'Avg Arrival Time', value: '45 Mins' }
  ],
  aboutImage: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800',

  // Contact Details
  contactAddress: 'House #12, Road #5, Dhanmondi, Dhaka - 1205, Bangladesh',
  contactPhone: '01700-000000',
  contactHotline: '09612-000000',
  contactEmail: 'support@labhomebd.com',
  contactWhatsApp: '01700000000',
  emergencyNumber: '01800-000000',
  workingHours: '7:00 AM - 10:00 PM (Everyday)',
  facebookUrl: 'https://facebook.com/labhomebd',
  services: DEFAULT_SERVICES_EN,

  // Invoice & Money Receipt Defaults
  invoiceOrgName: 'LabHome BD - Healthcare Services',
  invoiceOrgSubtitle: 'Trusted Digital Diagnostic & Home Sample Collection Network',
  invoiceAddress: 'House #12, Road #5, Dhanmondi, Dhaka - 1205, Bangladesh',
  invoiceHotline: '+880 9613-828282 / +880 1700-000000',
  invoiceEmail: 'support@labhomebd.com',
  invoiceWebsite: 'www.labhomebd.com',
  invoiceTermsTitle: 'Sample Collection & Report Guidelines:',
  invoiceGuidelines: [
    'For fasting tests (FBS, Lipid Profile), ensure 8-10 hours overnight fasting.',
    'Our certified medical phlebotomist will arrive with sterilized collection kits at your selected slot.',
    'Digital verified reports will be available on your dashboard, SMS, and WhatsApp upon lab processing.',
    'For any immediate queries or assistance, contact our 24/7 customer helpline.'
  ],
  invoiceFooterNote: '✓ Verified Digital Money Receipt • Computer Generated',
  invoiceWatermark: 'LabHome BD'
};

export const DEFAULT_PACKAGES_BN: HealthPackage[] = [
  {
    id: 'pkg_basic_4',
    name: 'প্রাথমিক স্বাস্থ্য স্ক্রিনিং প্যাকেজ (Basic Health Screening)',
    tagline: 'নিয়মিত স্বাস্থ্য পর্যবেক্ষণ ও ৪টি প্রাথমিক স্বাস্থ্য পরীক্ষা',
    description: 'রক্তস্বল্পতা, ইনফেকশন, ডায়াবেটিসের ঝুঁকি, কিডনি কার্যকারিতা ও ইউরিন সমস্যা প্রাথমিক পর্যায়ে শনাক্ত করার আদর্শ প্যাকেজ।',
    testCount: 4,
    includededTests: [
      'কমপ্লিট ব্লাড কাউন্ট (CBC)',
      'ফাস্টিং ব্লাড সুগার (FBS)',
      'সিরাম ক্রিয়েটিনিন (Serum Creatinine)',
      'ইউরিন রুটিন এক্সামিনেশন (Urine R/E)'
    ],
    testDetails: [
      { name: 'কমপ্লিট ব্লাড কাউন্ট (CBC)', purpose: 'রক্তের সার্বিক অবস্থা, রক্তস্বল্পতা ও ইনফেকশন নির্ণয়', sample: 'রক্ত (Blood)' },
      { name: 'ফাস্টিং ব্লাড সুগার (FBS)', purpose: 'খালি পেটে রক্তের গ্লুকোজ ও ডায়াবেটিসের মাত্রা পরীক্ষা', sample: 'রক্ত (Blood)' },
      { name: 'সিরাম ক্রিয়েটিনিন', purpose: 'কিডনির ফিল্টারিং ক্ষমতা ও সুস্থতা মূল্যায়ন', sample: 'রক্ত (Blood)' },
      { name: 'ইউরিন রুটিন এক্সামিনেশন (Urine R/E)', purpose: 'ইউরিনারি ট্র্যাক্ট ইনফেকশন (UTI) ও প্রোটিন লিকেজ নির্ণয়', sample: 'ইউরিন (Urine)' }
    ],
    originalPrice: 1400,
    price: 950,
    discountPercent: 32,
    priceByLab: {
      'lab_popular': 1050,
      'lab_labaid': 1100,
      'lab_birdem': 850,
      'lab_bsmmu': 700
    },
    originalPriceByLab: {
      'lab_popular': 1550,
      'lab_labaid': 1600,
      'lab_birdem': 1250,
      'lab_bsmmu': 1050
    },
    category: 'Basic',
    sampleType: 'রক্ত ও ইউরিন (Blood & Urine)',
    fastingRequirement: '৮-১০ ঘণ্টা খালি পেটে থাকতে হবে',
    turnaroundTime: '১২-২৪ ঘন্টা',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'বেস্ট সেলার (Best Seller)',
    badgeColor: 'bg-emerald-600',
    recommendedFor: 'যেকোনো প্রাপ্তবয়স্ক ব্যক্তির বার্ষিক বা ষাণ্মাসিক স্বাস্থ্য পরীক্ষার জন্য',
    features: ['ফ্রি স্যাম্পল কালেকশন', 'অনলাইন রিপোর্ট ১২ ঘন্টায়', 'অভিজ্ঞ টেকনোলজিস্ট'],
    isPackage: true
  },
  {
    id: 'pkg_exec_10',
    name: 'এক্সিকিউটিভ ফুল বডি চেকআপ প্যাকেজ (Executive Full Body Package)',
    tagline: 'পুরো শরীরের ১০টি ভাইটাল টেস্ট ও অঙ্গপ্রত্যঙ্গের সম্পূর্ণ সুস্থতা পরীক্ষা',
    description: 'হার্ট, লিভার, কিডনি, থাইরয়েড, ডায়াবেটিস, ভিটামিন ও রক্তকণিকার সম্পূর্ণ স্বাস্থ্য প্রোফাইল যাচাই করার পূর্ণাঙ্গ প্যানেল।',
    testCount: 10,
    includededTests: [
      'কমপ্লিট ব্লাড কাউন্ট ও ESR (CBC with ESR)',
      'ডায়াবেটিস ৩ মাসের গড় সুগার (HbA1c)',
      'কমপ্লিট লিপিড প্রোফাইল (Lipid Profile - Cholesterol)',
      'লিভার এনজাইম টেস্ট (SGPT / ALT)',
      'কিডনি ফাংশন টেস্ট (Serum Creatinine)',
      'সিরাম ইউরিক অ্যাসিড (Serum Uric Acid)',
      'থাইরয়েড হরমোন টেস্ট (TSH - Ultrasensitive)',
      'ভিটামিন ডি ৩ (Vitamin D3 - 25 Hydroxy)',
      'সিরাম ক্যালসিয়াম (Serum Calcium)',
      'ইউরিন রুটিন ও মাইক্রোস্কোপিক (Urine R/E)'
    ],
    testDetails: [
      { name: 'CBC with ESR', purpose: 'রক্তস্বল্পতা, রোগ প্রতিরোধ ক্ষমতা ও প্রদাহের মাত্রা', sample: 'রক্ত (Blood)' },
      { name: 'HbA1c (গ্লাইকেটেড হিমোগ্লোবিন)', purpose: 'গত ৩ মাসের ডায়াবেটিস নিয়ন্ত্রণ ও গড় রক্ত শর্করার হিসাব', sample: 'রক্ত (Blood)' },
      { name: 'লিপিড প্রোফাইল (৫ প্যারামিটার)', purpose: 'ভালো-খারাপ কোলেস্টেরল ও হৃদরোগের ঝুঁকি নিরূপণ', sample: 'রক্ত (Blood)' },
      { name: 'SGPT / ALT', purpose: 'লিভারের কার্যকারিতা ও ফ্যাটি লিভার বা প্রদাহ পর্যবেক্ষণ', sample: 'রক্ত (Blood)' },
      { name: 'সিরাম ক্রিয়েটিনিন', purpose: 'কিডনি ফিল্ট্রেশন রেট ও রেচন ক্ষমতার নিখুঁত পরিমাপ', sample: 'রক্ত (Blood)' },
      { name: 'সিরাম ইউরিক অ্যাসিড', purpose: 'গেঁটেবাত (Gout) ও জয়েন্টের ব্যথার কারণ চিহ্নিতকরণ', sample: 'রক্ত (Blood)' },
      { name: 'থাইরয়েড TSH', purpose: 'থাইরয়েড গ্রন্থির হরমোন ভারসাম্য ও মেটাবলিজম', sample: 'রক্ত (Blood)' },
      { name: 'ভিটামিন ডি ৩ (Vitamin D3)', purpose: 'হাড়ের শক্তি, পেশীর সক্রিয়তা ও ইমিউনিটি লেভেল', sample: 'রক্ত (Blood)' },
      { name: 'সিরাম ক্যালসিয়াম', purpose: 'রক্তে ও হাড়ে ক্যালসিয়ামের স্বাভাবিক মাত্রা যাচাই', sample: 'রক্ত (Blood)' },
      { name: 'ইউরিন রুটিন ও মাইক্রোস্কোপিক', purpose: 'কিডনি ও মূত্রনালীর ইনফেকশন বা অস্বাভাবিক উপাদান', sample: 'ইউরিন (Urine)' }
    ],
    originalPrice: 5800,
    price: 3600,
    discountPercent: 38,
    priceByLab: {
      'lab_popular': 3900,
      'lab_labaid': 4100,
      'lab_birdem': 3200,
      'lab_bsmmu': 2800
    },
    originalPriceByLab: {
      'lab_popular': 6200,
      'lab_labaid': 6500,
      'lab_birdem': 5100,
      'lab_bsmmu': 4500
    },
    category: 'Full Body',
    sampleType: 'রক্ত ও ইউরিন (Blood & Urine)',
    fastingRequirement: '১০-১২ ঘণ্টা রাতের ফাস্টিং আবশ্যক',
    turnaroundTime: '২৪ ঘন্টা',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'সর্বাধিক জনপ্রিয় ও সাশ্রয়ী (Best Value)',
    badgeColor: 'bg-primary',
    recommendedFor: '৩০ বছরের ঊর্ধ্বে যেকোনো নারী-পুরুষ ও পরিবারের সার্বিক স্বাস্থ্যের জন্য',
    features: ['১০টি গুরুত্বপূর্ণ টেস্ট অন্তর্ভুক্ত', 'সাশ্রয় ৳ ২,২০০', 'ফ্রি ডিজিটাল রিপোর্ট'],
    isPackage: true
  },
  {
    id: 'pkg_diabetes_5',
    name: 'কম্প্রিহেনসিভ ডায়াবেটিস কেয়ার প্যাকেজ (Comprehensive Diabetes Care)',
    tagline: '৫টি বিশেষ টেস্ট দিয়ে ডায়াবেটিস ও আনুষঙ্গিক অঙ্গের সুরক্ষা',
    description: 'ডায়াবেটিস নিয়ন্ত্রণ এবং এর ফলে কিডনি ও হার্টে কোনো বিরূপ প্রভাব পড়ছে কি না তা পর্যবেক্ষণ করার বিশেষ প্যাকেজ।',
    testCount: 5,
    includededTests: [
      'গ্লাইকেটেড হিমোগ্লোবিন (HbA1c)',
      'ফাস্টিং ব্লাড গ্লুকোজ (Fasting Sugar)',
      'পোস্ট প্র্যান্ডিয়াল গ্লুকোজ (2 Hrs After Breakfast)',
      'লিপিড প্রোফাইল (Lipid Profile)',
      'সিরাম ক্রিয়েটিনিন (Serum Creatinine)'
    ],
    testDetails: [
      { name: 'HbA1c', purpose: '৩ মাসের গড় রক্তের গ্লুকোজের নির্ভরযোগ্য মাত্রা', sample: 'রক্ত (Blood)' },
      { name: 'ফাস্টিং ব্লাড গ্লুকোজ', purpose: 'খালি পেটে বেসাল সুগার লেভেল পরিমাপ', sample: 'রক্ত (Blood)' },
      { name: 'পোস্ট প্র্যান্ডিয়াল গ্লুকোজ (2PP)', purpose: 'নাস্তা বা খাবারের ঠিক ২ ঘণ্টা পর ইনসুলিন কার্যকারিতা', sample: 'রক্ত (Blood)' },
      { name: 'লিপিড প্রোফাইল', purpose: 'ডায়াবেটিসে কোলেস্টেরল বৃদ্ধি ও আর্টারি ব্লকেজের ঝুঁকি নিরূপণ', sample: 'রক্ত (Blood)' },
      { name: 'সিরাম ক্রিয়েটিনিন', purpose: 'ডায়াবেটিক নেফ্রোপ্যাথি ও কিডনি সুস্থতা যাচাই', sample: 'রক্ত (Blood)' }
    ],
    originalPrice: 2800,
    price: 1850,
    discountPercent: 34,
    priceByLab: {
      'lab_popular': 2000,
      'lab_labaid': 2100,
      'lab_birdem': 1600,
      'lab_bsmmu': 1400
    },
    originalPriceByLab: {
      'lab_popular': 3000,
      'lab_labaid': 3200,
      'lab_birdem': 2400,
      'lab_bsmmu': 2100
    },
    category: 'Diabetes',
    sampleType: 'রক্তের স্যাম্পল (Blood)',
    fastingRequirement: '১০-১২ ঘণ্টা ফাস্টিং এবং খাবারের ২ ঘণ্টা পরের স্যাম্পল',
    turnaroundTime: '১২-২৪ ঘন্টা',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'ডায়াবেটিস রোগীদের স্পেশাল',
    badgeColor: 'bg-sky-600',
    recommendedFor: 'ডায়াবেটিস আক্রান্ত রোগী এবং প্রি-ডায়াবেটিক ব্যক্তিদের নিয়মিত ফলোআপের জন্য',
    features: ['২ বারের ব্লাড কালেকশন সুবিধা', 'ফ্রি সুগার মনিটরিং চার্ট'],
    isPackage: true
  },
  {
    id: 'pkg_heart_6',
    name: 'কার্ডিয়াক ওয়েলনেস ও হার্ট কেয়ার প্যাকেজ (Cardiac Wellness Care)',
    tagline: '৬টি কার্ডিয়াক টেস্ট দিয়ে হার্ট ও রক্তনালীর স্বাস্থ্য বিশ্লেষণ',
    description: 'কোলেস্টেরল, হার্টের এনজাইম, ইলেক্ট্রোলাইট এবং কিডনির আর্লি ওয়ার্নিং নির্ণয়ের জন্য ডিজাইনকৃত।',
    testCount: 6,
    includededTests: [
      'লিপিড প্রোফাইল (Total, HDL, LDL, Triglycerides)',
      'হাই-সেনসিটিভিটি ট্রপোনিন আই (hs-Troponin I)',
      'সিরাম এসজিওটি / এএসটি (SGOT/AST)',
      'ইলেক্ট্রোলাইটস প্যানেল (Na+, K+, Cl-)',
      'ফাস্টিং ব্লাড সুগার (FBS)',
      'ইউরিন মাইক্রোঅ্যালবুমিন (Microalbumin)'
    ],
    testDetails: [
      { name: 'লিপিড প্রোফাইল কমপ্লিট', purpose: 'রক্তের চর্বি, এইচডিএল ও এলডিএল ব্যালেন্স পরীক্ষা', sample: 'রক্ত (Blood)' },
      { name: 'hs-Troponin I', purpose: 'হার্টের পেশীর ক্ষতি বা মায়োকার্ডিয়াল ইনজুরি শনাক্তকরণ', sample: 'রক্ত (Blood)' },
      { name: 'SGOT / AST', purpose: 'হার্ট ও লিভার সম্পর্কিত কোষের ক্ষতির অবস্থা', sample: 'রক্ত (Blood)' },
      { name: 'ইলেক্ট্রোলাইটস (সোডিয়াম, পটাসিয়াম, ক্লোরাইড)', purpose: 'হার্টবিট ছন্দ ও বডি ফ্লুইড ব্যালেন্স পর্যবেক্ষণ', sample: 'রক্ত (Blood)' },
      { name: 'ফাস্টিং ব্লাড সুগার', purpose: 'হৃদরোগের অন্যতম ঝুঁকি ব্লাড সুগার পরীক্ষা', sample: 'রক্ত (Blood)' },
      { name: 'ইউরিন মাইক্রোঅ্যালবুমিন', purpose: 'রক্তনালীর প্রদাহ ও আর্লি কার্ডিও-রেনাল সাইন', sample: 'ইউরিন (Urine)' }
    ],
    originalPrice: 3900,
    price: 2450,
    discountPercent: 37,
    priceByLab: {
      'lab_popular': 2650,
      'lab_labaid': 2750,
      'lab_birdem': 2200,
      'lab_bsmmu': 1900
    },
    originalPriceByLab: {
      'lab_popular': 4200,
      'lab_labaid': 4400,
      'lab_birdem': 3500,
      'lab_bsmmu': 3000
    },
    category: 'Heart',
    sampleType: 'রক্ত ও ইউরিন (Blood & Urine)',
    fastingRequirement: '১০-১২ ঘণ্টা ফাস্টিং আবশ্যক',
    turnaroundTime: '২৪ ঘন্টা',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'কার্ডিয়াক স্পেশাল',
    badgeColor: 'bg-rose-600',
    recommendedFor: 'উচ্চ রক্তচাপ, উচ্চ কোলেস্টেরল ও হৃদরোগের পারিবারিক ইতিহাস রয়েছে এমন ব্যক্তিদের জন্য',
    features: ['হার্ট রিস্ক স্কোরিং গাইড', 'ফ্রি রিপোর্ট কনসাল্টেশন টিপস'],
    isPackage: true
  },
  {
    id: 'pkg_women_7',
    name: 'উইমেনস ওয়েলনেস ও হরমোন প্যাকেজ (Women\'s Wellness Profile)',
    tagline: 'নারীদের রক্তস্বল্পতা, থাইরয়েড, ভিটামিন ও হাড়ের যত্নে ৭টি টেস্ট',
    description: 'ক্লান্তি, চুল পড়া, ওজন বৃদ্ধি, হরমোন তারতম্য ও ভিটামিনের ঘাটতি নির্ণয়ের জন্য বিশেষভাবে প্রস্তুত।',
    testCount: 7,
    includededTests: [
      'কমপ্লিট ব্লাড কাউন্ট (CBC with Hemoglobin)',
      'থাইরয়েড প্রোফাইল (T3, T4, TSH)',
      'ভিটামিন ডি ৩ (Vitamin D3)',
      'ভিটামিন বি ১২ (Vitamin B12)',
      'সিরাম আয়রন ও ফেরিটিন (Serum Iron & Ferritin)',
      'সিরাম ক্যালসিয়াম (Serum Calcium)',
      'র‌্যান্ডম ব্লাড সুগার (RBS)'
    ],
    testDetails: [
      { name: 'CBC with Hemoglobin', purpose: 'রক্তস্বল্পতা (Anemia) ও লোহিত রক্তকণিকার ঘাটতি নির্ণয়', sample: 'রক্ত (Blood)' },
      { name: 'থাইরয়েড প্যানেল (T3, T4, TSH)', purpose: 'হাইপো/হাইপার-থাইরয়েডিজম ও ওজন নিয়ন্ত্রণের হরমোন', sample: 'রক্ত (Blood)' },
      { name: 'ভিটামিন ডি ৩', purpose: 'নারীদের হাড়ের ঘনত্ব ও জয়েন্টের সুরক্ষায় ভিটামিন মাত্রা', sample: 'রক্ত (Blood)' },
      { name: 'ভিটামিন বি ১২', purpose: 'স্নায়ু শক্তি, মেজাজ ও ক্লান্তি দূরীকরণের প্রয়োজনীয় ভিটামিন', sample: 'রক্ত (Blood)' },
      { name: 'সিরাম আয়রন ও ফেরিটিন', purpose: 'শরীরে আয়রনের সঞ্চয় ও আয়রন ঘাটতিজনিত এনিমিয়া', sample: 'রক্ত (Blood)' },
      { name: 'সিরাম ক্যালসিয়াম', purpose: 'অস্টিওপোরোসিস ও হাড় ক্ষয়ের ঝুঁকি পরীক্ষা', sample: 'রক্ত (Blood)' },
      { name: 'র‌্যান্ডম ব্লাড সুগার', purpose: 'রক্ত শর্করার সাধারণ স্ক্রিনিং', sample: 'রক্ত (Blood)' }
    ],
    originalPrice: 4600,
    price: 2950,
    discountPercent: 36,
    priceByLab: {
      'lab_popular': 3200,
      'lab_labaid': 3350,
      'lab_birdem': 2650,
      'lab_bsmmu': 2300
    },
    originalPriceByLab: {
      'lab_popular': 4900,
      'lab_labaid': 5200,
      'lab_birdem': 4100,
      'lab_bsmmu': 3600
    },
    category: 'Women',
    sampleType: 'রক্তের স্যাম্পল (Blood)',
    fastingRequirement: 'ফাস্টিং প্রয়োজন নেই / সকালের নাস্তার পূর্বে উত্তম',
    turnaroundTime: '২৪-৩৬ ঘন্টা',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'নারী স্বাস্থ্য কেয়ার',
    badgeColor: 'bg-pink-600',
    recommendedFor: '১৮ থেকে ৬০ বছর বয়সী সকল কর্মজীবী ও গৃহিণী নারীদের জন্য',
    features: ['মহিলা টেকনোলজিস্ট সহায়তা সুবিধা', 'কমপ্লিট হরমোনাল ইনসাইট'],
    isPackage: true
  },
  {
    id: 'pkg_senior_8',
    name: 'সিনিয়র সিটিজেন গোল্ডেন হেলথ প্যাকেজ (Senior Citizen Geriatric Care)',
    tagline: 'বয়োজ্যেষ্ঠদের সার্বিক সুস্থতা ও গুরুত্বপূর্ণ অঙ্গের ৮টি পরীক্ষা',
    description: '৫০ ঊর্ধ্ব ব্যক্তিদের নিয়মিত স্বাস্থ্য পর্যবেক্ষণ, কিডনি, লিভার, ডায়াবেটিস, কোলেস্টেরল ও হাড়ের সুরক্ষায় আদর্শ।',
    testCount: 8,
    includededTests: [
      'কমপ্লিট ব্লাড কাউন্ট (CBC)',
      'ডায়াবেটিস গড় সুগার (HbA1c)',
      'কিডনি প্রোফাইল (Serum Creatinine + Urea)',
      'লিভার ফাংশন (SGPT + Total Bilirubin)',
      'কমপ্লিট লিপিড প্রোফাইল (Lipid Profile)',
      'সিরাম ইউরিক অ্যাসিড (Serum Uric Acid)',
      'সিরাম ক্যালসিয়াম (Serum Calcium)',
      'ইউরিন রুটিন এক্সামিনেশন (Urine R/E)'
    ],
    testDetails: [
      { name: 'CBC', purpose: 'বয়স্কদের রক্তের সেলুলার স্বাস্থ্য ও ইনফেকশন পরীক্ষা', sample: 'রক্ত (Blood)' },
      { name: 'HbA1c', purpose: 'দীর্ঘমেয়াদী ডায়াবেটিসের সঠিক স্থিতি পর্যবেক্ষণ', sample: 'রক্ত (Blood)' },
      { name: 'ক্রিয়েটিনিন ও ইউরিয়া', purpose: 'বয়সজনিত কিডনির ফিল্টারিং ক্ষমতার অবক্ষয় রোধ', sample: 'রক্ত (Blood)' },
      { name: 'লিভার ফাংশন (SGPT + Bilirubin)', purpose: 'লিভার ও পিত্তনালীর স্বাভাবিক কার্যক্রম', sample: 'রক্ত (Blood)' },
      { name: 'লিপিড প্রোফাইল', purpose: 'রক্তচাপ ও স্ট্রোকের ঝুঁকি কমাতে কোলেস্টেরল পরীক্ষা', sample: 'রক্ত (Blood)' },
      { name: 'ইউরিক অ্যাসিড', purpose: 'বয়স্কদের জয়েন্ট পেইন ও গেঁটেবাত সমস্যার কারণ', sample: 'রক্ত (Blood)' },
      { name: 'সিরাম ক্যালসিয়াম', purpose: 'বয়সকালে হাড়ের ভঙ্গুরতা প্রতিরোধে ক্যালসিয়াম লেভেল', sample: 'রক্ত (Blood)' },
      { name: 'ইউরিন R/E', purpose: 'প্রস্রাবে ইনফেকশন ও প্রোটিন নির্গমন পরীক্ষা', sample: 'ইউরিন (Urine)' }
    ],
    originalPrice: 4900,
    price: 3100,
    discountPercent: 37,
    priceByLab: {
      'lab_popular': 3350,
      'lab_labaid': 3500,
      'lab_birdem': 2800,
      'lab_bsmmu': 2400
    },
    originalPriceByLab: {
      'lab_popular': 5200,
      'lab_labaid': 5500,
      'lab_birdem': 4400,
      'lab_bsmmu': 3800
    },
    category: 'Senior',
    sampleType: 'রক্ত ও ইউরিন (Blood & Urine)',
    fastingRequirement: '১০-১২ ঘণ্টা রাতের ফাস্টিং আবশ্যক',
    turnaroundTime: '২৪ ঘন্টা',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    popularBadge: '৫০+ বয়স্কদের জন্য',
    badgeColor: 'bg-amber-600',
    recommendedFor: '৫০ বা তদূর্ধ্ব বয়সী প্রবীণ পিতা-মাতা ও আত্মীয়স্বজনের নিয়মিত চেকআপের জন্য',
    features: ['অগ্রাধিকার ভিত্তিতে হোম কালেকশন', 'সহজ ও ব্যথামুক্ত স্যাম্পল ড্র'],
    isPackage: true
  }
];

export const DEFAULT_PACKAGES_EN: HealthPackage[] = [
  {
    id: 'pkg_basic_4',
    name: 'Basic Health Screening Package (4 Tests)',
    tagline: 'Routine health assessment & 4 vital laboratory screenings',
    description: 'An essential diagnostic panel covering complete blood count, blood sugar, kidney screening, and urine profile.',
    testCount: 4,
    includededTests: [
      'Complete Blood Count (CBC)',
      'Fasting Blood Sugar (FBS)',
      'Serum Creatinine',
      'Urine Routine Examination (R/E)'
    ],
    testDetails: [
      { name: 'Complete Blood Count (CBC)', purpose: 'General health, anemia, infection screening', sample: 'Blood' },
      { name: 'Fasting Blood Sugar (FBS)', purpose: 'Baseline glucose and diabetes screening', sample: 'Blood' },
      { name: 'Serum Creatinine', purpose: 'Kidney filtration and renal function baseline', sample: 'Blood' },
      { name: 'Urine Routine Examination (R/E)', purpose: 'UTI, protein leakage & urinary tract health', sample: 'Urine' }
    ],
    originalPrice: 1400,
    price: 950,
    discountPercent: 32,
    priceByLab: {
      'lab_popular': 1050,
      'lab_labaid': 1100,
      'lab_birdem': 850,
      'lab_bsmmu': 700
    },
    originalPriceByLab: {
      'lab_popular': 1550,
      'lab_labaid': 1600,
      'lab_birdem': 1250,
      'lab_bsmmu': 1050
    },
    category: 'Basic',
    sampleType: 'Blood & Urine',
    fastingRequirement: '8-10 Hours Fasting Required',
    turnaroundTime: '12-24 Hours',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'Best Seller',
    badgeColor: 'bg-emerald-600',
    recommendedFor: 'Annual and semi-annual routine checkups for adults',
    features: ['Free Doorstep Collection', 'Online Digital Report in 12-24h', 'Certified Phlebotomist'],
    isPackage: true
  },
  {
    id: 'pkg_exec_10',
    name: 'Executive Full Body Health Package (10 Tests)',
    tagline: 'Comprehensive 10 vital tests for total body & major organ wellness',
    description: 'A complete head-to-toe preventive panel evaluating heart, liver, kidney, thyroid, diabetes, vitamins and blood health.',
    testCount: 10,
    includededTests: [
      'Complete Blood Count with ESR (CBC)',
      'Glycated Hemoglobin (HbA1c)',
      'Complete Lipid Profile (Cholesterol)',
      'Liver Function Test (SGPT / ALT)',
      'Kidney Function Test (Serum Creatinine)',
      'Serum Uric Acid',
      'Thyroid Stimulating Hormone (TSH)',
      'Vitamin D3 (25-Hydroxy)',
      'Serum Calcium',
      'Urine Routine & Microscopy (R/E)'
    ],
    testDetails: [
      { name: 'CBC with ESR', purpose: 'Blood cells, immunity, infection and inflammation levels', sample: 'Blood' },
      { name: 'HbA1c', purpose: '3-month average blood glucose control and diabetes management', sample: 'Blood' },
      { name: 'Lipid Profile (5 Parameters)', purpose: 'HDL, LDL, Triglycerides & coronary heart disease risk', sample: 'Blood' },
      { name: 'SGPT / ALT', purpose: 'Liver enzymes, fatty liver detection and liver cell health', sample: 'Blood' },
      { name: 'Serum Creatinine', purpose: 'Kidney filtration efficiency and renal health status', sample: 'Blood' },
      { name: 'Serum Uric Acid', purpose: 'Gout, joint inflammation & hyperuricemia screening', sample: 'Blood' },
      { name: 'Thyroid TSH', purpose: 'Thyroid gland hormone balance & metabolic rate check', sample: 'Blood' },
      { name: 'Vitamin D3', purpose: 'Bone density, muscle function and immune vitality', sample: 'Blood' },
      { name: 'Serum Calcium', purpose: 'Blood calcium balance and osteoporosis risk factor', sample: 'Blood' },
      { name: 'Urine R/E', purpose: 'Urinary tract infection, renal filtration & cellular analysis', sample: 'Urine' }
    ],
    originalPrice: 5800,
    price: 3600,
    discountPercent: 38,
    priceByLab: {
      'lab_popular': 3900,
      'lab_labaid': 4100,
      'lab_birdem': 3200,
      'lab_bsmmu': 2800
    },
    originalPriceByLab: {
      'lab_popular': 6200,
      'lab_labaid': 6500,
      'lab_birdem': 5100,
      'lab_bsmmu': 4500
    },
    category: 'Full Body',
    sampleType: 'Blood & Urine',
    fastingRequirement: '10-12 Hours Overnight Fasting Required',
    turnaroundTime: '24 Hours',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'Best Value Full Body',
    badgeColor: 'bg-primary',
    recommendedFor: 'All individuals above 30 and family members seeking total wellness checkup',
    features: ['10 Comprehensive Vital Tests', 'Save ৳2,200', 'Free Online PDF Report'],
    isPackage: true
  },
  {
    id: 'pkg_diabetes_5',
    name: 'Comprehensive Diabetes Care Package (5 Tests)',
    tagline: '5 specialized tests for blood sugar control & vital organ safety',
    description: 'Designed specifically to track glucose stability, lipid health, and prevent diabetic renal complications.',
    testCount: 5,
    includededTests: [
      'Glycated Hemoglobin (HbA1c)',
      'Fasting Blood Glucose (FBS)',
      'Post Prandial Blood Glucose (2PP)',
      'Lipid Profile',
      'Serum Creatinine'
    ],
    testDetails: [
      { name: 'HbA1c', purpose: 'Accurate 90-day average blood sugar monitoring', sample: 'Blood' },
      { name: 'Fasting Blood Glucose', purpose: 'Baseline fasting glycemic index', sample: 'Blood' },
      { name: 'Post Prandial Glucose (2PP)', purpose: 'Post-meal insulin response and spike levels', sample: 'Blood' },
      { name: 'Lipid Profile', purpose: 'Cardiovascular risk assessment in diabetic patients', sample: 'Blood' },
      { name: 'Serum Creatinine', purpose: 'Early diabetic nephropathy & kidney screening', sample: 'Blood' }
    ],
    originalPrice: 2800,
    price: 1850,
    discountPercent: 34,
    priceByLab: {
      'lab_popular': 2000,
      'lab_labaid': 2100,
      'lab_birdem': 1600,
      'lab_bsmmu': 1400
    },
    originalPriceByLab: {
      'lab_popular': 3000,
      'lab_labaid': 3200,
      'lab_birdem': 2400,
      'lab_bsmmu': 2100
    },
    category: 'Diabetes',
    sampleType: 'Blood Sample',
    fastingRequirement: '10-12h Fasting & 2h Post-Breakfast Sample',
    turnaroundTime: '12-24 Hours',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'Diabetes Specialized',
    badgeColor: 'bg-sky-600',
    recommendedFor: 'Individuals with Type 1/Type 2 diabetes or pre-diabetes',
    features: ['Two-time blood collection support', 'Free sugar log sheet'],
    isPackage: true
  },
  {
    id: 'pkg_heart_6',
    name: 'Cardiac Wellness & Heart Care Package (6 Tests)',
    tagline: '6 tests for cardiovascular health, lipid balance & cardiac markers',
    description: 'Identifies arterial block risk, cardiac muscle strain, and key electrolyte balances.',
    testCount: 6,
    includededTests: [
      'Complete Lipid Profile (5 Parameters)',
      'High Sensitivity Troponin I (hs-Troponin)',
      'Serum SGOT / AST',
      'Serum Electrolytes (Na, K, Cl)',
      'Fasting Blood Sugar (FBS)',
      'Urine Microalbumin'
    ],
    testDetails: [
      { name: 'Lipid Profile', purpose: 'Full cholesterol breakdown (HDL, LDL, Triglycerides)', sample: 'Blood' },
      { name: 'hs-Troponin I', purpose: 'High sensitivity myocardial cardiac stress marker', sample: 'Blood' },
      { name: 'SGOT / AST', purpose: 'Enzyme marker for heart and liver cell health', sample: 'Blood' },
      { name: 'Serum Electrolytes', purpose: 'Potassium and Sodium levels vital for heart rhythm', sample: 'Blood' },
      { name: 'Fasting Blood Sugar', purpose: 'Coronary risk cofactor screening', sample: 'Blood' },
      { name: 'Urine Microalbumin', purpose: 'Early indicator of vascular and endothelial stress', sample: 'Urine' }
    ],
    originalPrice: 3900,
    price: 2450,
    discountPercent: 37,
    priceByLab: {
      'lab_popular': 2650,
      'lab_labaid': 2750,
      'lab_birdem': 2200,
      'lab_bsmmu': 1900
    },
    originalPriceByLab: {
      'lab_popular': 4200,
      'lab_labaid': 4400,
      'lab_birdem': 3500,
      'lab_bsmmu': 3000
    },
    category: 'Heart',
    sampleType: 'Blood & Urine',
    fastingRequirement: '10-12 Hours Fasting Required',
    turnaroundTime: '24 Hours',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'Cardiac Care',
    badgeColor: 'bg-rose-600',
    recommendedFor: 'Individuals with hypertension, family history of heart disease, or stress',
    features: ['Heart wellness scoring report', 'Doorstep collection'],
    isPackage: true
  },
  {
    id: 'pkg_women_7',
    name: 'Women\'s Wellness & Hormone Package (7 Tests)',
    tagline: '7 vital tests for anemia, thyroid, vitamins & bone health',
    description: 'Customized for women to detect fatigue causes, hormonal imbalances, vitamin deficiencies, and calcium loss.',
    testCount: 7,
    includededTests: [
      'Complete Blood Count (CBC)',
      'Thyroid Profile (T3, T4, TSH)',
      'Vitamin D3 (25-Hydroxy)',
      'Vitamin B12',
      'Serum Iron & Ferritin',
      'Serum Calcium',
      'Random Blood Sugar (RBS)'
    ],
    testDetails: [
      { name: 'CBC with Hemoglobin', purpose: 'Screening for anemia and overall red blood cell vitality', sample: 'Blood' },
      { name: 'Thyroid Panel (T3, T4, TSH)', purpose: 'Metabolism, weight management & hormonal regulation', sample: 'Blood' },
      { name: 'Vitamin D3', purpose: 'Bone calcium absorption and musculoskeletal strength', sample: 'Blood' },
      { name: 'Vitamin B12', purpose: 'Nerve health, brain function and energy metabolism', sample: 'Blood' },
      { name: 'Serum Iron & Ferritin', purpose: 'Body iron storage and latent iron deficiency', sample: 'Blood' },
      { name: 'Serum Calcium', purpose: 'Prevention of osteoporosis and bone density loss', sample: 'Blood' },
      { name: 'Random Blood Sugar', purpose: 'General glucose level assessment', sample: 'Blood' }
    ],
    originalPrice: 4600,
    price: 2950,
    discountPercent: 36,
    priceByLab: {
      'lab_popular': 3200,
      'lab_labaid': 3350,
      'lab_birdem': 2650,
      'lab_bsmmu': 2300
    },
    originalPriceByLab: {
      'lab_popular': 4900,
      'lab_labaid': 5200,
      'lab_birdem': 4100,
      'lab_bsmmu': 3600
    },
    category: 'Women',
    sampleType: 'Blood Sample',
    fastingRequirement: 'No fasting strictly required / Morning sample preferred',
    turnaroundTime: '24-36 Hours',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'Women Health',
    badgeColor: 'bg-pink-600',
    recommendedFor: 'Women of all ages dealing with fatigue, hair fall, or routine wellness checks',
    features: ['Female Phlebotomist Support available', 'Complete hormonal insight'],
    isPackage: true
  },
  {
    id: 'pkg_senior_8',
    name: 'Senior Citizen Golden Health Package (8 Tests)',
    tagline: '8 comprehensive screenings for vitality & healthy aging',
    description: 'Tailored for seniors 50+ to assess kidney, liver, diabetes, lipid, uric acid and joint strength.',
    testCount: 8,
    includededTests: [
      'Complete Blood Count (CBC)',
      'Glycated Hemoglobin (HbA1c)',
      'Kidney Profile (Serum Creatinine + Urea)',
      'Liver Function (SGPT + Total Bilirubin)',
      'Complete Lipid Profile',
      'Serum Uric Acid',
      'Serum Calcium',
      'Urine Routine Examination (R/E)'
    ],
    testDetails: [
      { name: 'CBC', purpose: 'Cellular immunity, blood count and inflammation', sample: 'Blood' },
      { name: 'HbA1c', purpose: 'Long-term glycemic control and diabetes monitoring', sample: 'Blood' },
      { name: 'Creatinine & Urea', purpose: 'Age-related renal clearance and kidney health', sample: 'Blood' },
      { name: 'Liver Function (SGPT + Bilirubin)', purpose: 'Liver detoxification and bile clearance', sample: 'Blood' },
      { name: 'Lipid Profile', purpose: 'Cholesterol management and stroke prevention', sample: 'Blood' },
      { name: 'Uric Acid', purpose: 'Joint inflammation, arthritis and gout monitoring', sample: 'Blood' },
      { name: 'Serum Calcium', purpose: 'Bone strength and calcium balance in seniors', sample: 'Blood' },
      { name: 'Urine R/E', purpose: 'Kidney filtration and urinary tract wellness', sample: 'Urine' }
    ],
    originalPrice: 4900,
    price: 3100,
    discountPercent: 37,
    priceByLab: {
      'lab_popular': 3350,
      'lab_labaid': 3500,
      'lab_birdem': 2800,
      'lab_bsmmu': 2400
    },
    originalPriceByLab: {
      'lab_popular': 5200,
      'lab_labaid': 5500,
      'lab_birdem': 4400,
      'lab_bsmmu': 3800
    },
    category: 'Senior',
    sampleType: 'Blood & Urine',
    fastingRequirement: '10-12 Hours Overnight Fasting Required',
    turnaroundTime: '24 Hours',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    popularBadge: 'Seniors 50+',
    badgeColor: 'bg-amber-600',
    recommendedFor: 'Seniors and elderly parents for painless, at-home comprehensive health monitoring',
    features: ['Gentle & painless sample collection', 'Priority scheduling for seniors'],
    isPackage: true
  }
];

export const getPackages = (lang: Language): HealthPackage[] => {
  return lang === 'en' ? DEFAULT_PACKAGES_EN : DEFAULT_PACKAGES_BN;
};

export const getSiteSettings = (lang: Language): SiteSettings => {
  return lang === 'en' ? DEFAULT_SITE_SETTINGS_EN : DEFAULT_SITE_SETTINGS_BN;
};

// Backwards compatibility for existing imports (default to Bangla)
export const POPULAR_TESTS = TESTS_BN;
export const PARTNER_LABS = LABS_BN;

