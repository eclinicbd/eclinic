
import { TestPackage, LabPartner, Language, SiteSettings, ServiceItem, NursingCareService, HealthPackage, Doctor } from './types';

const TESTS_BN: TestPackage[] = [
  {
    id: '1',
    name: 'কমপ্লিট ব্লাড কাউন্ট (CBC / ESR)',
    description: 'রক্তের সার্বিক অবস্থা, হিমোগ্লোবিন, সংক্রমণ ও রক্তস্বল্পতা নির্ণয়ের জন্য।',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 480,
      'lab_labaid': 600,
      'lab_ibnsina': 480,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 600,
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
    turnaroundTime: '১২ ঘন্টা',
    orderCount: 0
  },
  {
    id: '2',
    name: 'ডায়াবেটিস চেকআপ (HbA1c)',
    description: 'গত ৩ মাসের গড় ব্লাড সুগার ও ডায়াবেটিস নিয়ন্ত্রণের নির্ভরযোগ্য পরিমাপ।',
    price: 850,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 900,
      'lab_labaid': 1000,
      'lab_ibnsina': 900,
      'lab_birdem': 700,
      'lab_bsmmu': 600,
      'lab_praava': 1100,
      'lab_evercare': 1300,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1150,
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
    turnaroundTime: '২৪ ঘন্টা',
    orderCount: 0
  },
  {
    id: '3',
    name: 'লিপিড প্রোফাইল (Lipid Profile)',
    description: 'কোলেস্টেরল, ট্রাইগ্লিসারাইড, এলডিএল ও হার্টের সার্বিক ঝুঁকি নির্ণয়।',
    price: 1200,
    originalPrice: 1600,
    priceByLab: {
      'lab_popular': 1300,
      'lab_labaid': 1500,
      'lab_ibnsina': 1300,
      'lab_birdem': 1000,
      'lab_bsmmu': 800,
      'lab_praava': 1600,
      'lab_evercare': 1900,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1650,
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
    turnaroundTime: '২৪ ঘন্টা',
    orderCount: 0
  },
  {
    id: '4',
    name: 'থাইরয়েড প্রোফাইল (T3, T4, TSH)',
    description: 'থাইরয়েড হরমোনের ভারসাম্য, মেটাবলিজম ও ওজন পরিবর্তনের কারণ নির্ণয়।',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1600,
      'lab_labaid': 2000,
      'lab_ibnsina': 1600,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000,
      'lab_praava': 2100,
      'lab_evercare': 2500,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 2050,
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
    turnaroundTime: '৪৮ ঘন্টা',
    orderCount: 0
  },
  {
    id: '5',
    name: 'ভিটামিন ডি টেস্ট (25-OH Vitamin D)',
    description: 'হাড়ের শক্তি, পেশীর দুর্বলতা, ক্লান্তি ও রোগ প্রতিরোধ ক্ষমতা পর্যবেক্ষণ।',
    price: 2500,
    originalPrice: 3200,
    priceByLab: {
      'lab_popular': 2700,
      'lab_labaid': 3200,
      'lab_ibnsina': 2700,
      'lab_birdem': 2200,
      'lab_bsmmu': 1800,
      'lab_praava': 3400,
      'lab_evercare': 3900,
      'lab_medinova': 2500
    },
    originalPriceByLab: {
      'lab_popular': 3400,
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
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 800,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 850,
      'lab_evercare': 1050,
      'lab_medinova': 600
    },
    category: 'Kidney',
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
      'lab_popular': 550,
      'lab_labaid': 650,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 700,
      'lab_labaid': 850,
      'lab_ibnsina': 700,
      'lab_birdem': 600,
      'lab_bsmmu': 500,
      'lab_praava': 900,
      'lab_evercare': 1100,
      'lab_medinova': 650
    },
    category: 'Liver',
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
      'lab_popular': 200,
      'lab_labaid': 250,
      'lab_ibnsina': 200,
      'lab_birdem': 150,
      'lab_bsmmu': 100,
      'lab_praava': 280,
      'lab_evercare': 350,
      'lab_medinova': 180
    },
    originalPriceByLab: {
      'lab_popular': 260,
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
      'lab_popular': 340,
      'lab_labaid': 400,
      'lab_ibnsina': 340,
      'lab_birdem': 280,
      'lab_bsmmu': 200,
      'lab_praava': 450,
      'lab_evercare': 550,
      'lab_medinova': 300
    },
    originalPriceByLab: {
      'lab_popular': 450,
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
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 800,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 850,
      'lab_evercare': 1050,
      'lab_medinova': 600
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '11',
    name: 'ডেঙ্গু এনএস১ ও অ্যান্টিবডি টেস্ট (Dengue NS1 & CBC)',
    description: 'জবরের প্রথম দিনেই ডেঙ্গু ভাইরাস শনাক্তকরণ ও প্লেটলেট কাউন্টের জরুরি ট্র্যাকিং।',
    price: 900,
    originalPrice: 1250,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1100,
      'lab_ibnsina': 950,
      'lab_birdem': 800,
      'lab_bsmmu': 600,
      'lab_praava': 1200,
      'lab_evercare': 1450,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1250,
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
      'lab_popular': 1050,
      'lab_labaid': 1200,
      'lab_ibnsina': 1050,
      'lab_birdem': 850,
      'lab_bsmmu': 700,
      'lab_praava': 1300,
      'lab_evercare': 1600,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1350,
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
  },
  {
    id: '13',
    name: 'সিরাম বিলিরুবিন টোটাল (Serum Bilirubin Total)',
    description: 'জন্ডিস, লিভারের স্বাস্থ্য ও পিত্তনালীর অবস্থা নির্ণয়।',
    price: 400,
    originalPrice: 500,
    priceByLab: {
      'lab_popular': 400,
      'lab_labaid': 450,
      'lab_ibnsina': 400,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 500,
      'lab_evercare': 600,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 650,
      'lab_evercare': 750,
      'lab_medinova': 500
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '14',
    name: 'এসজিওটি / এএসটি (SGOT / AST)',
    description: 'লিভার ও পেশীর কোষের ক্ষতি ও এনজাইম নিসরণ পর্যবেক্ষণ।',
    price: 500,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 500,
      'lab_labaid': 550,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 600,
      'lab_evercare': 750,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 700,
      'lab_ibnsina': 650,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 650
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '15',
    name: 'সিরাম অ্যালকালাইন ফসফেটেজ (ALP)',
    description: 'লিভার, পিত্তনালী ও হাড়ের রোগ নির্ণয়ে ব্যবহৃত গুরুত্বপূর্ণ এনজাইম পরীক্ষা।',
    price: 500,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 500,
      'lab_labaid': 550,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 600,
      'lab_evercare': 750,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 700,
      'lab_ibnsina': 650,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 650
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '16',
    name: 'সিরাম ইউরিয়া (Serum Urea)',
    description: 'রক্তে প্রোটিন মেটাবলিজমের বর্জ্য ও কিডনির ফিল্টারিং ক্ষমতা যাচাই।',
    price: 400,
    originalPrice: 550,
    priceByLab: {
      'lab_popular': 400,
      'lab_labaid': 450,
      'lab_ibnsina': 400,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 500,
      'lab_evercare': 650,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 550
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '17',
    name: 'সিরাম ক্যালসিয়াম (Serum Calcium)',
    description: 'হাড়, দাঁত, নার্ভ ও পেশীর সুস্থতায় রক্তে ক্যালসিয়ামের সঠিক মাত্রা।',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 450,
      'lab_labaid': 500,
      'lab_ibnsina': 450,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 550,
      'lab_evercare': 700,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 650,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '18',
    name: 'থাইরয়েড স্টিমুলেটিং হরমোন (TSH)',
    description: 'থাইরয়েড গ্রন্থির কার্যকারিতা ও হরমোন নিঃসরণের মাত্রা নির্ণয়।',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 700,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 900,
      'lab_ibnsina': 750,
      'lab_birdem': 650,
      'lab_bsmmu': 500,
      'lab_praava': 950,
      'lab_evercare': 1100,
      'lab_medinova': 750
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '19',
    name: 'ফ্রি টি৩ (Free T3 / FT3)',
    description: 'সক্রিয় থাইরয়েড হরমোন টি৩-এর মাত্রা ও হাইপার/হাইপোথাইরয়েডিজম পর্যবেক্ষণ।',
    price: 700,
    originalPrice: 900,
    priceByLab: {
      'lab_popular': 650,
      'lab_labaid': 750,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 800,
      'lab_evercare': 950,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 800,
      'lab_labaid': 950,
      'lab_ibnsina': 800,
      'lab_birdem': 700,
      'lab_bsmmu': 550,
      'lab_praava': 1000,
      'lab_evercare': 1200,
      'lab_medinova': 850
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '20',
    name: 'ফ্রি টি৪ (Free T4 / FT4)',
    description: 'সক্রিয় থাইরয়েড হরমোন টি৪-এর মাত্রা ও হরমোন ভারসাম্য নির্ধারণ।',
    price: 700,
    originalPrice: 900,
    priceByLab: {
      'lab_popular': 650,
      'lab_labaid': 750,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 800,
      'lab_evercare': 950,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 800,
      'lab_labaid': 950,
      'lab_ibnsina': 800,
      'lab_birdem': 700,
      'lab_bsmmu': 550,
      'lab_praava': 1000,
      'lab_evercare': 1200,
      'lab_medinova': 850
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '21',
    name: '২ ঘণ্টা পর ব্লাড সুগার (2hABF / 2PP)',
    description: 'খাবারের ২ ঘণ্টা পর ব্লাড গ্লুকোজের পরিমাপ ও ডায়াবেটিস নিয়ন্ত্রণ।',
    price: 200,
    originalPrice: 300,
    priceByLab: {
      'lab_popular': 200,
      'lab_labaid': 250,
      'lab_ibnsina': 200,
      'lab_birdem': 150,
      'lab_bsmmu': 100,
      'lab_praava': 280,
      'lab_evercare': 350,
      'lab_medinova': 200
    },
    originalPriceByLab: {
      'lab_popular': 260,
      'lab_labaid': 350,
      'lab_ibnsina': 260,
      'lab_birdem': 200,
      'lab_bsmmu': 150,
      'lab_praava': 380,
      'lab_evercare': 450,
      'lab_medinova': 250
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৬ ঘন্টা'
  },
  {
    id: '22',
    name: 'র‍্যান্ডম ব্লাড সুগার (RBS)',
    description: 'যেকোনো সময়ে রক্তে গ্লুকোজের তাৎক্ষণিক মাত্রা পর্যবেক্ষণ।',
    price: 180,
    originalPrice: 250,
    priceByLab: {
      'lab_popular': 200,
      'lab_labaid': 250,
      'lab_ibnsina': 200,
      'lab_birdem': 150,
      'lab_bsmmu': 100,
      'lab_praava': 280,
      'lab_evercare': 350,
      'lab_medinova': 180
    },
    originalPriceByLab: {
      'lab_popular': 260,
      'lab_labaid': 350,
      'lab_ibnsina': 260,
      'lab_birdem': 200,
      'lab_bsmmu': 150,
      'lab_praava': 380,
      'lab_evercare': 450,
      'lab_medinova': 250
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৬ ঘন্টা'
  },
  {
    id: '23',
    name: 'স্টুল রুটিন এক্সামিনেশন (Stool R/E)',
    description: 'পাচনতন্ত্রের সমস্যা, কৃমি, ইনফেকশন ও প্রচ্ছন্ন রক্তের উপস্থিতি নির্ণয়।',
    price: 300,
    originalPrice: 400,
    priceByLab: {
      'lab_popular': 300,
      'lab_labaid': 350,
      'lab_ibnsina': 300,
      'lab_birdem': 250,
      'lab_bsmmu': 200,
      'lab_praava': 400,
      'lab_evercare': 500,
      'lab_medinova': 300
    },
    originalPriceByLab: {
      'lab_popular': 400,
      'lab_labaid': 500,
      'lab_ibnsina': 400,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 550,
      'lab_evercare': 650,
      'lab_medinova': 400
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৮ ঘন্টা'
  },
  {
    id: '24',
    name: 'ব্লাড গ্রুপিং ও আরএইচ ফ্যাক্টর (Blood Grouping & Rh)',
    description: 'রক্তের গ্রুপ (A, B, AB, O) এবং আরএইচ ফ্যাক্টর (পজিটিভ/নেগেটিভ) নির্ণয়।',
    price: 250,
    originalPrice: 350,
    priceByLab: {
      'lab_popular': 250,
      'lab_labaid': 300,
      'lab_ibnsina': 250,
      'lab_birdem': 200,
      'lab_bsmmu': 150,
      'lab_praava': 350,
      'lab_evercare': 450,
      'lab_medinova': 250
    },
    originalPriceByLab: {
      'lab_popular': 350,
      'lab_labaid': 400,
      'lab_ibnsina': 350,
      'lab_birdem': 250,
      'lab_bsmmu': 200,
      'lab_praava': 450,
      'lab_evercare': 550,
      'lab_medinova': 350
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪ ঘন্টা'
  },
  {
    id: '25',
    name: 'ডেঙ্গু অ্যান্টিবডি টেস্ট (Dengue IgG & IgM)',
    description: 'ডেঙ্গু জ্বরের সাম্প্রতিক (IgM) বা পূর্ববর্তী (IgG) সংক্রমণের প্রতিরোধ ক্ষমতা যাচাই।',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 700,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 900,
      'lab_ibnsina': 750,
      'lab_birdem': 650,
      'lab_bsmmu': 500,
      'lab_praava': 950,
      'lab_evercare': 1100,
      'lab_medinova': 750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৬ ঘন্টা'
  },
  {
    id: '26',
    name: 'এইচবিএসএজি স্ক্রিনিং (HBsAg Hepatitis B)',
    description: 'হেপাটাইটিস বি ভাইরাসের সংক্রমণ ও লিভার সুরক্ষার প্রাথমিক স্ক্রিনিং।',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 450,
      'lab_labaid': 500,
      'lab_ibnsina': 450,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 550,
      'lab_evercare': 700,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 650,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '27',
    name: 'অ্যান্টি-এইচসিভি স্ক্রিনিং (Anti-HCV Hepatitis C)',
    description: 'হেপাটাইটিস সি ভাইরাস প্রতিরোধী অ্যান্টিবডির প্রাথমিক পরীক্ষা।',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 700,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 900,
      'lab_ibnsina': 750,
      'lab_birdem': 650,
      'lab_bsmmu': 500,
      'lab_praava': 950,
      'lab_evercare': 1100,
      'lab_medinova': 750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '28',
    name: 'এইচআইভি ১ ও ২ স্ক্রিনিং (HIV I & II)',
    description: 'এইচআইভি অ্যান্টিবডি ও প্রাথমিক ভাইরাস স্ক্রিনিং পরীক্ষা।',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 700,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 900,
      'lab_ibnsina': 750,
      'lab_birdem': 650,
      'lab_bsmmu': 500,
      'lab_praava': 950,
      'lab_evercare': 1100,
      'lab_medinova': 750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '29',
    name: 'ভিডিআরএল সিফিলিস স্ক্রিনিং (VDRL)',
    description: 'সিফিলিস জীবাণুর উপস্থিতি ও সেক্সুয়ালি ট্রান্সমিটেড ইনফেকশন নির্ণয়।',
    price: 400,
    originalPrice: 550,
    priceByLab: {
      'lab_popular': 400,
      'lab_labaid': 450,
      'lab_ibnsina': 400,
      'lab_birdem': 300,
      'lab_bsmmu': 200,
      'lab_praava': 500,
      'lab_evercare': 650,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 550
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '30',
    name: 'উইডাল টাইফয়েড টেস্ট (Widal Test)',
    description: 'টাইফয়েড জ্বর ও সালমোনেলা ব্যাকটেরিয়ার অ্যান্টিবডি টাইটার পরিমাপ।',
    price: 400,
    originalPrice: 550,
    priceByLab: {
      'lab_popular': 400,
      'lab_labaid': 450,
      'lab_ibnsina': 400,
      'lab_birdem': 300,
      'lab_bsmmu': 200,
      'lab_praava': 500,
      'lab_evercare': 650,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 550
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '31',
    name: 'সি-রিয়্যাক্টিভ প্রোটিন (CRP - Inflammation)',
    description: 'শরীরের যেকোনো টিস্যুতে তীব্র প্রদাহ, ব্যাকটেরিয়াল ইনফেকশন ও টিস্যু ইনজুরি পরিমাপ।',
    price: 500,
    originalPrice: 700,
    priceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 750,
      'lab_ibnsina': 650,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 800,
      'lab_evercare': 1000,
      'lab_medinova': 650
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '32',
    name: 'ভিটামিন বি ১২ (Vitamin B12)',
    description: 'স্নায়ুর সুস্থতা, স্মৃতিশক্তি, লোহিত রক্তকণিকা উৎপাদন ও শক্তির মাত্রা নির্ধারণ।',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1500,
      'lab_labaid': 1800,
      'lab_ibnsina': 1500,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000,
      'lab_praava': 1900,
      'lab_evercare': 2200,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 1850,
      'lab_labaid': 2200,
      'lab_ibnsina': 1850,
      'lab_birdem': 1500,
      'lab_bsmmu': 1250,
      'lab_praava': 2300,
      'lab_evercare': 2700,
      'lab_medinova': 1900
    },
    category: 'Vitamin',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '33',
    name: 'সিরাম অ্যালবুমিন / টোটাল প্রোটিন (Serum Albumin / Total Protein)',
    description: 'লিভারের কার্যক্ষমতা, পুষ্টির মাত্রা এবং কিডনি রোগের চিকিৎসায় প্রোটিনের মাত্রা পরিমাপ।',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 450,
      'lab_labaid': 500,
      'lab_ibnsina': 450,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 550,
      'lab_evercare': 700,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 550
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '34',
    name: 'আয়রন ও টিআইবিসি প্রোফাইল (Serum Iron & TIBC)',
    description: 'রক্তে আয়রনের পরিমাণ, রক্তস্বল্পতা (Anemia) ও আয়রন ঘাটতি নিখুঁতভাবে নিরূপণ।',
    price: 900,
    originalPrice: 1200,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1100,
      'lab_ibnsina': 950,
      'lab_birdem': 800,
      'lab_bsmmu': 650,
      'lab_praava': 1200,
      'lab_evercare': 1400,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1150,
      'lab_labaid': 1300,
      'lab_ibnsina': 1150,
      'lab_birdem': 950,
      'lab_bsmmu': 800,
      'lab_praava': 1400,
      'lab_evercare': 1650,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '35',
    name: 'সিরাম ফেরিটিন (Serum Ferritin - Iron Store)',
    description: 'শরীরের কোষে সংরক্ষিত আয়রনের প্রকৃত পরিমাণ এবং দীর্ঘমেয়াদী আয়রন ঘাটতি মূল্যায়ন।',
    price: 1100,
    originalPrice: 1400,
    priceByLab: {
      'lab_popular': 1100,
      'lab_labaid': 1300,
      'lab_ibnsina': 1100,
      'lab_birdem': 900,
      'lab_bsmmu': 750,
      'lab_praava': 1350,
      'lab_evercare': 1600,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1300,
      'lab_labaid': 1550,
      'lab_ibnsina': 1300,
      'lab_birdem': 1100,
      'lab_bsmmu': 900,
      'lab_praava': 1600,
      'lab_evercare': 1900,
      'lab_medinova': 1300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '36',
    name: 'পিএসএ - প্রোস্টেট স্পেসিফিক অ্যান্টিজেন (Total PSA)',
    description: 'পুরুষদের প্রোস্টেট গ্ল্যান্ডের স্বাস্থ্য পরীক্ষা ও প্রোস্টেট ক্যান্সার বা ইনফেকশন স্ক্রিনিং।',
    price: 1200,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1200,
      'lab_labaid': 1400,
      'lab_ibnsina': 1200,
      'lab_birdem': 1000,
      'lab_bsmmu': 800,
      'lab_praava': 1450,
      'lab_evercare': 1700,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1400,
      'lab_labaid': 1650,
      'lab_ibnsina': 1400,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000,
      'lab_praava': 1700,
      'lab_evercare': 2000,
      'lab_medinova': 1400
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '37',
    name: 'কার্ডিয়াক ট্রোপোনিন আই (Troponin I - Cardiac Marker)',
    description: 'হঠাৎ বুকব্যথা বা হার্ট অ্যাটাকের ঝুঁকি শনাক্তে অত্যন্ত সংবেদনশীল কার্ডিয়াক মার্কার।',
    price: 1400,
    originalPrice: 1800,
    priceByLab: {
      'lab_popular': 1400,
      'lab_labaid': 1600,
      'lab_ibnsina': 1400,
      'lab_birdem': 1200,
      'lab_bsmmu': 900,
      'lab_praava': 1700,
      'lab_evercare': 1950,
      'lab_medinova': 1400
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1900,
      'lab_ibnsina': 1650,
      'lab_birdem': 1400,
      'lab_bsmmu': 1100,
      'lab_praava': 2000,
      'lab_evercare': 2300,
      'lab_medinova': 1650
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪-৬ ঘন্টা'
  },
  {
    id: '38',
    name: 'সিরাম অ্যামাইলেজ ও লাইপেজ (Serum Amylase & Lipase)',
    description: 'তীব্র পেটব্যথা, অগ্ন্যাশয় প্রদাহ (Pancreatitis) ও পাচনতন্ত্রের স্বাস্থ্য মূল্যায়ন।',
    price: 900,
    originalPrice: 1200,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1100,
      'lab_ibnsina': 950,
      'lab_birdem': 800,
      'lab_bsmmu': 600,
      'lab_praava': 1150,
      'lab_evercare': 1350,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1150,
      'lab_labaid': 1300,
      'lab_ibnsina': 1150,
      'lab_birdem': 950,
      'lab_bsmmu': 750,
      'lab_praava': 1350,
      'lab_evercare': 1600,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '39',
    name: 'ইউরিন কালচার অ্যান্ড সেনসিটিভিটি (Urine C/S)',
    description: 'মূত্রনালীর ব্যাকটেরিয়াল সংক্রমণ (UTI) ও কার্যকর অ্যান্টিবায়োটিক নির্বাচন।',
    price: 650,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮-৭২ ঘন্টা'
  },
  {
    id: '40',
    name: 'ইউরিন মাইক্রোঅ্যালবুমিন ও এসিআর (Urine Microalbumin / ACR)',
    description: 'ডায়াবেটিস ও উচ্চ রক্তচাপজনিত প্রাথমিক কিডনি ক্ষতির পূর্বাভাস ও প্রস্রাবে প্রোটিন পরিমাপ।',
    price: 900,
    originalPrice: 1200,
    priceByLab: {
      'lab_popular': 945,
      'lab_labaid': 1035,
      'lab_ibnsina': 945,
      'lab_birdem': 810,
      'lab_bsmmu': 675,
      'lab_praava': 1080,
      'lab_evercare': 1260,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1320,
      'lab_labaid': 1440,
      'lab_ibnsina': 1320,
      'lab_birdem': 1140,
      'lab_bsmmu': 960,
      'lab_praava': 1500,
      'lab_evercare': 1740,
      'lab_medinova': 1200
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '41',
    name: '২৪ ঘণ্টার ইউরিন টোটাল প্রোটিন (24-Hour Urine Total Protein)',
    description: 'সারাদিনের প্রস্রাবে মোট প্রোটিনের সঠিক পরিমাণ ও নেফ্রোটিক সিন্ড্রোম মূল্যায়ন।',
    price: 800,
    originalPrice: 1050,
    priceByLab: {
      'lab_popular': 840,
      'lab_labaid': 920,
      'lab_ibnsina': 840,
      'lab_birdem': 720,
      'lab_bsmmu': 600,
      'lab_praava': 960,
      'lab_evercare': 1120,
      'lab_medinova': 800
    },
    originalPriceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1260,
      'lab_ibnsina': 1155,
      'lab_birdem': 998,
      'lab_bsmmu': 840,
      'lab_praava': 1313,
      'lab_evercare': 1523,
      'lab_medinova': 1050
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '42',
    name: 'ইউরিন প্রেগন্যান্সি টেস্ট (Urine Pregnancy Test - UPT)',
    description: 'প্রস্রাবে হিউম্যান কোরিওনিক গোনাডোট্রপিন (hCG) হরমোন সনাক্তকরণের মাধ্যমে গর্ভধারণ নিশ্চিতকরণ।',
    price: 200,
    originalPrice: 300,
    priceByLab: {
      'lab_popular': 210,
      'lab_labaid': 230,
      'lab_ibnsina': 210,
      'lab_birdem': 180,
      'lab_bsmmu': 150,
      'lab_praava': 240,
      'lab_evercare': 280,
      'lab_medinova': 200
    },
    originalPriceByLab: {
      'lab_popular': 330,
      'lab_labaid': 360,
      'lab_ibnsina': 330,
      'lab_birdem': 285,
      'lab_bsmmu': 240,
      'lab_praava': 375,
      'lab_evercare': 435,
      'lab_medinova': 300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২ ঘন্টা'
  },
  {
    id: '43',
    name: 'ইউরিন কিটোন বডিস (Urine Ketone Bodies)',
    description: 'ডায়াবেটিস কিটোঅ্যাসিডোসিস (DKA), দীর্ঘ উপবাস ও মেটাবলিক জটিলতা দ্রুত সনাক্তকরণ।',
    price: 250,
    originalPrice: 350,
    priceByLab: {
      'lab_popular': 263,
      'lab_labaid': 288,
      'lab_ibnsina': 263,
      'lab_birdem': 225,
      'lab_bsmmu': 188,
      'lab_praava': 300,
      'lab_evercare': 350,
      'lab_medinova': 250
    },
    originalPriceByLab: {
      'lab_popular': 385,
      'lab_labaid': 420,
      'lab_ibnsina': 385,
      'lab_birdem': 333,
      'lab_bsmmu': 280,
      'lab_praava': 438,
      'lab_evercare': 508,
      'lab_medinova': 350
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪ ঘন্টা'
  },
  {
    id: '44',
    name: 'ইউরিন ক্যালসিয়াম টেস্ট (Urine Calcium Test)',
    description: 'কিডনিতে পাথর হওয়ার ঝুঁকি ও ক্যালসিয়াম নিঃসরণ মূল্যায়ন।',
    price: 550,
    originalPrice: 750,
    priceByLab: {
      'lab_popular': 578,
      'lab_labaid': 633,
      'lab_ibnsina': 578,
      'lab_birdem': 495,
      'lab_bsmmu': 413,
      'lab_praava': 660,
      'lab_evercare': 770,
      'lab_medinova': 550
    },
    originalPriceByLab: {
      'lab_popular': 825,
      'lab_labaid': 900,
      'lab_ibnsina': 825,
      'lab_birdem': 713,
      'lab_bsmmu': 600,
      'lab_praava': 938,
      'lab_evercare': 1088,
      'lab_medinova': 750
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '45',
    name: 'ইউরিন সাইটোলজি (Urine Cytology for Malignant Cells)',
    description: 'মূত্রথলি ও মূত্রনালীর অস্বাভাবিক কোষ ও টিউমার স্ক্রিনিং।',
    price: 850,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 893,
      'lab_labaid': 977,
      'lab_ibnsina': 893,
      'lab_birdem': 765,
      'lab_bsmmu': 638,
      'lab_praava': 1020,
      'lab_evercare': 1190,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1210,
      'lab_labaid': 1320,
      'lab_ibnsina': 1210,
      'lab_birdem': 1045,
      'lab_bsmmu': 880,
      'lab_praava': 1375,
      'lab_evercare': 1595,
      'lab_medinova': 1100
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '46',
    name: 'স্টুল ওবিটি / অকাল্ট ব্লাড টেস্ট (Stool Occult Blood - FOBT)',
    description: 'মলে খালি চোখে অদৃশ্য রক্তক্ষরণ, পাইলস, পেপটিক আলসার ও কোলন পলিপ স্ক্রিনিং।',
    price: 350,
    originalPrice: 500,
    priceByLab: {
      'lab_popular': 368,
      'lab_labaid': 402,
      'lab_ibnsina': 368,
      'lab_birdem': 315,
      'lab_bsmmu': 263,
      'lab_praava': 420,
      'lab_evercare': 490,
      'lab_medinova': 350
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 550,
      'lab_birdem': 475,
      'lab_bsmmu': 400,
      'lab_praava': 625,
      'lab_evercare': 725,
      'lab_medinova': 500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '47',
    name: 'স্টুল কালচার অ্যান্ড সেনসিটিভিটি (Stool C/S)',
    description: 'তীব্র ডায়রিয়া, আমাশয়, সালমোনেলা/শিগেলা ব্যাক্টেরিয়া ও কার্যকর অ্যান্টিবায়োটিক নির্ণয়।',
    price: 650,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮-৭২ ঘন্টা'
  },
  {
    id: '48',
    name: 'স্টুল ক্যালপ্রোটেকটিন (Stool Calprotectin - IBD Test)',
    description: 'অন্ত্রের দীর্ঘস্থায়ী প্রদাহ, ক্রোনস ডিজিজ ও আলসারেটিভ কোলাইটিস (IBD বনাম IBS) পার্থক্যকরণ।',
    price: 2800,
    originalPrice: 3500,
    priceByLab: {
      'lab_popular': 2940,
      'lab_labaid': 3220,
      'lab_ibnsina': 2940,
      'lab_birdem': 2520,
      'lab_bsmmu': 2100,
      'lab_praava': 3360,
      'lab_evercare': 3920,
      'lab_medinova': 2800
    },
    originalPriceByLab: {
      'lab_popular': 3850,
      'lab_labaid': 4200,
      'lab_ibnsina': 3850,
      'lab_birdem': 3325,
      'lab_bsmmu': 2800,
      'lab_praava': 4375,
      'lab_evercare': 5075,
      'lab_medinova': 3500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '49',
    name: 'স্টুল রিডিউসিং সাবস্ট্যান্স টেস্ট (Stool Reducing Substance)',
    description: 'শিশুদের দুধ/ল্যাকটোজ হজমে সমস্যা (Lactose Intolerance) ও কার্বোহাইড্রেট শোষণ ত্রুটি নির্ণয়।',
    price: 350,
    originalPrice: 500,
    priceByLab: {
      'lab_popular': 368,
      'lab_labaid': 402,
      'lab_ibnsina': 368,
      'lab_birdem': 315,
      'lab_bsmmu': 263,
      'lab_praava': 420,
      'lab_evercare': 490,
      'lab_medinova': 350
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 550,
      'lab_birdem': 475,
      'lab_bsmmu': 400,
      'lab_praava': 625,
      'lab_evercare': 725,
      'lab_medinova': 500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '50',
    name: 'মলে হেলিকোব্যাক্টার পাইলোরি অ্যান্টিজেন (Stool H. Pylori Antigen)',
    description: 'পাকস্থলীর আলসার, গ্যাস্ট্রিক ও এসিডিটি সৃষ্টিকারী এইচ. পাইলোরি ব্যাকটেরিয়ার নির্ভরযোগ্য প্রমাণ।',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '51',
    name: 'ব্লাড কালচার অ্যান্ড সেনসিটিভিটি (Blood Culture & Sensitivity)',
    description: 'রক্তে বিপজ্জনক ব্যাকটেরিয়াল সংক্রমণ, সেপসিস (Sepsis) ও দীর্ঘস্থায়ী জ্বরের অ্যান্টিবায়োটিক নির্বাচন।',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৭২ ঘন্টা'
  },
  {
    id: '52',
    name: 'টাইফয়েড আইজিএম ও আইজিজি (Typhoid Typhidot IgM & IgG)',
    description: 'টাইফয়েড জ্বরের প্রাথমিক অবস্থায় (প্রথম ৩-৫ দিনেই) সঠিক অ্যান্টিবডি সনাক্তকরণ।',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 630,
      'lab_labaid': 690,
      'lab_ibnsina': 630,
      'lab_birdem': 540,
      'lab_bsmmu': 450,
      'lab_praava': 720,
      'lab_evercare': 840,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 880,
      'lab_labaid': 960,
      'lab_ibnsina': 880,
      'lab_birdem': 760,
      'lab_bsmmu': 640,
      'lab_praava': 1000,
      'lab_evercare': 1160,
      'lab_medinova': 800
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '53',
    name: 'ম্যালেরিয়া প্যারাসাইট রক্ত পরীক্ষা (Malaria ICT & MP Blood Film)',
    description: 'রক্তে ম্যালেরিয়া জীবাণু (Plasmodium vivax / falciparum) সনাক্তকরণ ও ধরণ নির্ণয়।',
    price: 450,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 473,
      'lab_labaid': 518,
      'lab_ibnsina': 473,
      'lab_birdem': 405,
      'lab_bsmmu': 338,
      'lab_praava': 540,
      'lab_evercare': 630,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 715,
      'lab_labaid': 780,
      'lab_ibnsina': 715,
      'lab_birdem': 618,
      'lab_bsmmu': 520,
      'lab_praava': 813,
      'lab_evercare': 943,
      'lab_medinova': 650
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৬ ঘন্টা'
  },
  {
    id: '54',
    name: 'চিকুনগুনিয়া আইজিএম অ্যান্টিবডি (Chikungunya IgM Antibody)',
    description: 'তীব্র জ্বর ও অস্থিসন্ধির প্রচণ্ড ব্যথা সম্পন্ন চিকুনগুনিয়া ভাইরাস সংক্রমণ সনাক্তকরণ।',
    price: 900,
    originalPrice: 1200,
    priceByLab: {
      'lab_popular': 945,
      'lab_labaid': 1035,
      'lab_ibnsina': 945,
      'lab_birdem': 810,
      'lab_bsmmu': 675,
      'lab_praava': 1080,
      'lab_evercare': 1260,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1320,
      'lab_labaid': 1440,
      'lab_ibnsina': 1320,
      'lab_birdem': 1140,
      'lab_bsmmu': 960,
      'lab_praava': 1500,
      'lab_evercare': 1740,
      'lab_medinova': 1200
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '55',
    name: 'হেপাটাইটিস বি সারফেস অ্যান্টিবডি (Anti-HBs Antibody Titre)',
    description: 'হেপাটাইটিস বি ভ্যাকসিনের কার্যকারিতা ও শরীরে রোগ প্রতিরোধ ক্ষমতার সুরক্ষা মাত্রা পরিমাপ।',
    price: 700,
    originalPrice: 950,
    priceByLab: {
      'lab_popular': 735,
      'lab_labaid': 805,
      'lab_ibnsina': 735,
      'lab_birdem': 630,
      'lab_bsmmu': 525,
      'lab_praava': 840,
      'lab_evercare': 980,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 1045,
      'lab_labaid': 1140,
      'lab_ibnsina': 1045,
      'lab_birdem': 903,
      'lab_bsmmu': 760,
      'lab_praava': 1188,
      'lab_evercare': 1378,
      'lab_medinova': 950
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '56',
    name: 'হেপাটাইটিস বি কোর অ্যান্টিবডি (Anti-HBc Total)',
    description: 'অতীতে বা বর্তমানে হেপাটাইটিস বি ভাইরাসের সংস্পর্শে আসার প্রমাণ নিশ্চিতকরণ।',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '57',
    name: 'হেপাটাইটিস এ ভাইরাস আইজিএম (Anti-HAV IgM for Acute Jaundice)',
    description: 'দূষিত পানি ও খাবারজনিত হঠাৎ জন্ডিস ও তীব্র লিভার প্রদাহের কারণ সনাক্তকরণ।',
    price: 900,
    originalPrice: 1250,
    priceByLab: {
      'lab_popular': 945,
      'lab_labaid': 1035,
      'lab_ibnsina': 945,
      'lab_birdem': 810,
      'lab_bsmmu': 675,
      'lab_praava': 1080,
      'lab_evercare': 1260,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1375,
      'lab_labaid': 1500,
      'lab_ibnsina': 1375,
      'lab_birdem': 1188,
      'lab_bsmmu': 1000,
      'lab_praava': 1563,
      'lab_evercare': 1813,
      'lab_medinova': 1250
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '58',
    name: 'হেপাটাইটিস ই ভাইরাস আইজিএম (Anti-HEV IgM)',
    description: 'জলবাহিত হেপাটাইটিস ই ভাইরাস সংক্রমণ (বিশেষ করে গর্ভবতীদের জন্য অত্যন্ত ঝুঁকিপূর্ণ)।',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '59',
    name: 'টিপিএইচএ সিফিলিস নিশ্চিতকরণ টেস্ট (TPHA Syphilis Confirmatory)',
    description: 'সিফিলিস রোগের সুনির্দিষ্ট ও নিশ্চিত ফলাফল নির্ধারণকারী বিশেষ রক্ত পরীক্ষা।',
    price: 600,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 630,
      'lab_labaid': 690,
      'lab_ibnsina': 630,
      'lab_birdem': 540,
      'lab_bsmmu': 450,
      'lab_praava': 720,
      'lab_evercare': 840,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '60',
    name: 'টর্চ প্যানেল ১০টি টেস্ট (TORCH Panel 10 Profile)',
    description: 'গর্ভবতীদের গর্ভপাত প্রতিরোধ ও ভ্রূণের জন্মগত ত্রুটি রোধে ৫টি প্রাণঘাতী সংক্রমণ স্ক্রিনিং।',
    price: 3600,
    originalPrice: 4800,
    priceByLab: {
      'lab_popular': 3780,
      'lab_labaid': 4140,
      'lab_ibnsina': 3780,
      'lab_birdem': 3240,
      'lab_bsmmu': 2700,
      'lab_praava': 4320,
      'lab_evercare': 5040,
      'lab_medinova': 3600
    },
    originalPriceByLab: {
      'lab_popular': 5280,
      'lab_labaid': 5760,
      'lab_ibnsina': 5280,
      'lab_birdem': 4560,
      'lab_bsmmu': 3840,
      'lab_praava': 6000,
      'lab_evercare': 6960,
      'lab_medinova': 4800
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '61',
    name: 'প্রোথ্রম্বিন টাইম ও আইএনআর (Prothrombin Time / PT with INR)',
    description: 'রক্ত জমাট বাঁধার সময়, রক্ত পাতলা করার ওষুধ (Warfarin) মনিটরিং ও লিভারের কার্যকারিতা।',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 630,
      'lab_labaid': 690,
      'lab_ibnsina': 630,
      'lab_birdem': 540,
      'lab_bsmmu': 450,
      'lab_praava': 720,
      'lab_evercare': 840,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 880,
      'lab_labaid': 960,
      'lab_ibnsina': 880,
      'lab_birdem': 760,
      'lab_bsmmu': 640,
      'lab_praava': 1000,
      'lab_evercare': 1160,
      'lab_medinova': 800
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '62',
    name: 'এপিটিটি টেস্ট (APTT - Activated Partial Thromboplastin Time)',
    description: 'রক্তক্ষরণ জনিত রোগ (যেমন: হিমোফিলিয়া) ও হেপারিন ইনজেকশনের প্রতিক্রিয়া মূল্যায়ন।',
    price: 650,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '63',
    name: 'ডি-ডাইমার টেস্ট (D-Dimer Test for Blood Clots)',
    description: 'রক্তনালীতে বিপজ্জনক রক্ত জমাট বাঁধা (DVT), ফুসফুসে রক্ত জমাট (PE) ও থ্রম্বোসিস নির্ণয়।',
    price: 1300,
    originalPrice: 1700,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1870,
      'lab_labaid': 2040,
      'lab_ibnsina': 1870,
      'lab_birdem': 1615,
      'lab_bsmmu': 1360,
      'lab_praava': 2125,
      'lab_evercare': 2465,
      'lab_medinova': 1700
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '64',
    name: 'হিমোগ্লোবিন ইলেক্ট্রোফোরেসিস (Hemoglobin Electrophoresis - Thalassemia)',
    description: 'থ্যালাসেমিয়া বাহক, থ্যালাসেমিয়া রোগ ও অস্বাভাবিক হিমোগ্লোবিন (HbE, Sickle Cell) সনাক্তকরণ।',
    price: 1400,
    originalPrice: 1900,
    priceByLab: {
      'lab_popular': 1470,
      'lab_labaid': 1610,
      'lab_ibnsina': 1470,
      'lab_birdem': 1260,
      'lab_bsmmu': 1050,
      'lab_praava': 1680,
      'lab_evercare': 1960,
      'lab_medinova': 1400
    },
    originalPriceByLab: {
      'lab_popular': 2090,
      'lab_labaid': 2280,
      'lab_ibnsina': 2090,
      'lab_birdem': 1805,
      'lab_bsmmu': 1520,
      'lab_praava': 2375,
      'lab_evercare': 2755,
      'lab_medinova': 1900
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪-৪৮ ঘন্টা'
  },
  {
    id: '65',
    name: 'পেরিফেরাল ব্লাড ফিল্ম (Peripheral Blood Film - PBF)',
    description: 'রক্তকোষের সূক্ষ্ম গঠন, অস্বাভাবিক আকার, অ্যানিমিয়ার ধরণ ও লিউকেমিয়া/ব্লাড ক্যান্সার স্ক্রিনিং।',
    price: 400,
    originalPrice: 550,
    priceByLab: {
      'lab_popular': 420,
      'lab_labaid': 460,
      'lab_ibnsina': 420,
      'lab_birdem': 360,
      'lab_bsmmu': 300,
      'lab_praava': 480,
      'lab_evercare': 560,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 605,
      'lab_labaid': 660,
      'lab_ibnsina': 605,
      'lab_birdem': 523,
      'lab_bsmmu': 440,
      'lab_praava': 688,
      'lab_evercare': 798,
      'lab_medinova': 550
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '66',
    name: 'রেটিকিউলোসাইট কাউন্ট (Reticulocyte Count)',
    description: 'অস্থিমজ্জার (Bone Marrow) নতুন লোহিত রক্তকণিকা তৈরির সক্ষমতা ও অ্যানিমিয়া চিকিৎসা মূল্যায়ন।',
    price: 350,
    originalPrice: 500,
    priceByLab: {
      'lab_popular': 368,
      'lab_labaid': 402,
      'lab_ibnsina': 368,
      'lab_birdem': 315,
      'lab_bsmmu': 263,
      'lab_praava': 420,
      'lab_evercare': 490,
      'lab_medinova': 350
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 550,
      'lab_birdem': 475,
      'lab_bsmmu': 400,
      'lab_praava': 625,
      'lab_evercare': 725,
      'lab_medinova': 500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '67',
    name: 'ব্লিডিং টাইম ও ক্লটিং টাইম (Bleeding Time & Clotting Time - BT/CT)',
    description: 'অপারেশন বা সার্জারির পূর্বে প্রাথমিক রক্তক্ষরণ ও রক্ত জমাট বাঁধার সময় পরীক্ষা।',
    price: 250,
    originalPrice: 350,
    priceByLab: {
      'lab_popular': 263,
      'lab_labaid': 288,
      'lab_ibnsina': 263,
      'lab_birdem': 225,
      'lab_bsmmu': 188,
      'lab_praava': 300,
      'lab_evercare': 350,
      'lab_medinova': 250
    },
    originalPriceByLab: {
      'lab_popular': 385,
      'lab_labaid': 420,
      'lab_ibnsina': 385,
      'lab_birdem': 333,
      'lab_bsmmu': 280,
      'lab_praava': 438,
      'lab_evercare': 508,
      'lab_medinova': 350
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২ ঘন্টা'
  },
  {
    id: '68',
    name: 'সেরাম টেস্টোস্টেরন (Total Testosterone Test)',
    description: 'পুরুষের যৌন হরমোন মাত্রা, ক্লান্তি, পেশী গঠন ও প্রজনন স্বাস্থ্যের নির্ভরযোগ্য পরিমাপ।',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '69',
    name: 'সেরাম প্রোল্যাক্টিন হরমোন (Serum Prolactin Test)',
    description: 'অনিয়মিত মাসিক, পিটুইটারি গ্রন্থির টিউমার ও বন্ধ্যাত্ব মূল্যায়নকারী গুরুত্বপূর্ণ হরমোন টেস্ট।',
    price: 850,
    originalPrice: 1150,
    priceByLab: {
      'lab_popular': 893,
      'lab_labaid': 977,
      'lab_ibnsina': 893,
      'lab_birdem': 765,
      'lab_bsmmu': 638,
      'lab_praava': 1020,
      'lab_evercare': 1190,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1265,
      'lab_labaid': 1380,
      'lab_ibnsina': 1265,
      'lab_birdem': 1093,
      'lab_bsmmu': 920,
      'lab_praava': 1438,
      'lab_evercare': 1668,
      'lab_medinova': 1150
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '70',
    name: 'এফএসএইচ - ফলিকল স্টিমুলেটিং হরমোন (Serum FSH)',
    description: 'ডিম্বাশয় ও শুক্রাশয়ের কার্যক্ষমতা, মেনোপজ এবং প্রজনন উর্বরতা পরিমাপক হরমোন।',
    price: 800,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 840,
      'lab_labaid': 920,
      'lab_ibnsina': 840,
      'lab_birdem': 720,
      'lab_bsmmu': 600,
      'lab_praava': 960,
      'lab_evercare': 1120,
      'lab_medinova': 800
    },
    originalPriceByLab: {
      'lab_popular': 1210,
      'lab_labaid': 1320,
      'lab_ibnsina': 1210,
      'lab_birdem': 1045,
      'lab_bsmmu': 880,
      'lab_praava': 1375,
      'lab_evercare': 1595,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '71',
    name: 'এলএইচ - লিউটিনাইজিং হরমোন (Serum LH)',
    description: 'ডিম্বস্ফোটন (Ovulation), পলিসিস্টিক ওভারি সিন্ড্রোম (PCOS) ও হরমোন ভারসাম্যহীনতা নির্ণয়।',
    price: 800,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 840,
      'lab_labaid': 920,
      'lab_ibnsina': 840,
      'lab_birdem': 720,
      'lab_bsmmu': 600,
      'lab_praava': 960,
      'lab_evercare': 1120,
      'lab_medinova': 800
    },
    originalPriceByLab: {
      'lab_popular': 1210,
      'lab_labaid': 1320,
      'lab_ibnsina': 1210,
      'lab_birdem': 1045,
      'lab_bsmmu': 880,
      'lab_praava': 1375,
      'lab_evercare': 1595,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '72',
    name: 'এএমএইচ - অ্যান্টি মুলারিয়ান হরমোন (Anti-Mullerian Hormone - AMH)',
    description: 'নারীদের ডিম্বাশয়ে ডিম্বাণুর মজুদ (Egg Reserve), উর্বরতা ও আইভিএফ (IVF) সম্ভাব্যতা মূল্যায়ন।',
    price: 2500,
    originalPrice: 3200,
    priceByLab: {
      'lab_popular': 2625,
      'lab_labaid': 2875,
      'lab_ibnsina': 2625,
      'lab_birdem': 2250,
      'lab_bsmmu': 1875,
      'lab_praava': 3000,
      'lab_evercare': 3500,
      'lab_medinova': 2500
    },
    originalPriceByLab: {
      'lab_popular': 3520,
      'lab_labaid': 3840,
      'lab_ibnsina': 3520,
      'lab_birdem': 3040,
      'lab_bsmmu': 2560,
      'lab_praava': 4000,
      'lab_evercare': 4640,
      'lab_medinova': 3200
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪-৪৮ ঘন্টা'
  },
  {
    id: '73',
    name: 'সেরাম কর্টিসল টেস্ট (Serum Cortisol - Morning/Evening)',
    description: 'অ্যাড্রিনাল গ্রন্থির স্ট্রেস হরমোন, কুশিং সিন্ড্রোম ও অ্যাডিসন রোগ নির্ণায়ক টেস্ট।',
    price: 900,
    originalPrice: 1250,
    priceByLab: {
      'lab_popular': 945,
      'lab_labaid': 1035,
      'lab_ibnsina': 945,
      'lab_birdem': 810,
      'lab_bsmmu': 675,
      'lab_praava': 1080,
      'lab_evercare': 1260,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1375,
      'lab_labaid': 1500,
      'lab_ibnsina': 1375,
      'lab_birdem': 1188,
      'lab_bsmmu': 1000,
      'lab_praava': 1563,
      'lab_evercare': 1813,
      'lab_medinova': 1250
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '74',
    name: 'বিটা এইচসিজি রক্তের টেস্ট (Beta hCG Quantitative Serum)',
    description: 'রক্তে গর্ভধারণের শতভাগ নির্ভুল নিশ্চয়তা, গর্ভের সঠিক সপ্তাহ ও একটোপিক প্রেগন্যান্সি সনাক্তকরণ।',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '75',
    name: 'সেরাম ইনসুলিন ফাস্টিং (Fasting Serum Insulin)',
    description: 'ইনসুলিন রেজিস্ট্যান্স, টাইপ-২ ডায়াবেটিস প্রবণতা ও ফ্যাটি লিভারের মূল কারণ নির্ণয়।',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '76',
    name: 'হোমা-আইআর টেস্ট (HOMA-IR Insulin Resistance Index)',
    description: 'রক্তের গ্লুকোজ ও ইনসুলিন সমন্বয়ে শরীরের ইনসুলিন অকার্যকারিতার সঠিক স্কোর।',
    price: 1300,
    originalPrice: 1750,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1925,
      'lab_labaid': 2100,
      'lab_ibnsina': 1925,
      'lab_birdem': 1663,
      'lab_bsmmu': 1400,
      'lab_praava': 2188,
      'lab_evercare': 2538,
      'lab_medinova': 1750
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '77',
    name: 'আরএ টেস্ট / রিউমাটয়েড ফ্যাক্টর (RA / RF Quantitative)',
    description: 'রিউমাটয়েড আর্থ্রাইটিস বা বাতজ্বর, তীব্র গিঁটে ব্যথা ও অটোইমিউন রোগ সনাক্তকরণ।',
    price: 600,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 630,
      'lab_labaid': 690,
      'lab_ibnsina': 630,
      'lab_birdem': 540,
      'lab_bsmmu': 450,
      'lab_praava': 720,
      'lab_evercare': 840,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '78',
    name: 'অ্যান্টি-সিসিপি টেস্ট (Anti-CCP Antibody - Arthritis)',
    description: 'রিউমাটয়েড আর্থ্রাইটিসের সবচেয়ে নিখুঁত ও নির্ভরযোগ্য আগাম প্রমাণকারী অটোইমিউন টেস্ট।',
    price: 1800,
    originalPrice: 2400,
    priceByLab: {
      'lab_popular': 1890,
      'lab_labaid': 2070,
      'lab_ibnsina': 1890,
      'lab_birdem': 1620,
      'lab_bsmmu': 1350,
      'lab_praava': 2160,
      'lab_evercare': 2520,
      'lab_medinova': 1800
    },
    originalPriceByLab: {
      'lab_popular': 2640,
      'lab_labaid': 2880,
      'lab_ibnsina': 2640,
      'lab_birdem': 2280,
      'lab_bsmmu': 1920,
      'lab_praava': 3000,
      'lab_evercare': 3480,
      'lab_medinova': 2400
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '79',
    name: 'এএনএ টেস্ট (ANA by IFA - Antinuclear Antibody)',
    description: 'লুপাস (SLE), ত্বক ও কিডনি আক্রান্তকারী অটোইমিউন রোগ সনাক্তকরণের গোল্ড স্ট্যান্ডার্ড টেস্ট।',
    price: 1200,
    originalPrice: 1600,
    priceByLab: {
      'lab_popular': 1260,
      'lab_labaid': 1380,
      'lab_ibnsina': 1260,
      'lab_birdem': 1080,
      'lab_bsmmu': 900,
      'lab_praava': 1440,
      'lab_evercare': 1680,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1760,
      'lab_labaid': 1920,
      'lab_ibnsina': 1760,
      'lab_birdem': 1520,
      'lab_bsmmu': 1280,
      'lab_praava': 2000,
      'lab_evercare': 2320,
      'lab_medinova': 1600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '80',
    name: 'অ্যান্টি-ডিএসডিএনএ (Anti-dsDNA Quantitative)',
    description: 'এসএলই (SLE) লুপাস নিশ্চিতকরণ ও কিডনির প্রদাহ (Lupus Nephritis) সক্রিয়তার মাত্রা নির্ণয়।',
    price: 1600,
    originalPrice: 2100,
    priceByLab: {
      'lab_popular': 1680,
      'lab_labaid': 1840,
      'lab_ibnsina': 1680,
      'lab_birdem': 1440,
      'lab_bsmmu': 1200,
      'lab_praava': 1920,
      'lab_evercare': 2240,
      'lab_medinova': 1600
    },
    originalPriceByLab: {
      'lab_popular': 2310,
      'lab_labaid': 2520,
      'lab_ibnsina': 2310,
      'lab_birdem': 1995,
      'lab_bsmmu': 1680,
      'lab_praava': 2625,
      'lab_evercare': 3045,
      'lab_medinova': 2100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪-৪৮ ঘন্টা'
  },
  {
    id: '81',
    name: 'সেরাম আইজিই টেস্ট (Total Serum IgE - Allergy Level)',
    description: 'অ্যালার্জি, হাঁপানি, অ্যালার্জিক রাইনাইটিস ও রক্তের সংবেদনশীলতার মাত্রা পরিমাপ।',
    price: 800,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 840,
      'lab_labaid': 920,
      'lab_ibnsina': 840,
      'lab_birdem': 720,
      'lab_bsmmu': 600,
      'lab_praava': 960,
      'lab_evercare': 1120,
      'lab_medinova': 800
    },
    originalPriceByLab: {
      'lab_popular': 1210,
      'lab_labaid': 1320,
      'lab_ibnsina': 1210,
      'lab_birdem': 1045,
      'lab_bsmmu': 880,
      'lab_praava': 1375,
      'lab_evercare': 1595,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '82',
    name: 'এএসও টাইটার (ASO Titre - Streptococcal Infection)',
    description: 'গলাব্যথা পরবর্তী বাতজ্বর (Rheumatic Fever) ও কিডনি প্রদাহের জীবাণু সংক্রমণ পরীক্ষা।',
    price: 550,
    originalPrice: 750,
    priceByLab: {
      'lab_popular': 578,
      'lab_labaid': 633,
      'lab_ibnsina': 578,
      'lab_birdem': 495,
      'lab_bsmmu': 413,
      'lab_praava': 660,
      'lab_evercare': 770,
      'lab_medinova': 550
    },
    originalPriceByLab: {
      'lab_popular': 825,
      'lab_labaid': 900,
      'lab_ibnsina': 825,
      'lab_birdem': 713,
      'lab_bsmmu': 600,
      'lab_praava': 938,
      'lab_evercare': 1088,
      'lab_medinova': 750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '83',
    name: 'সিইএ ক্যান্সার মার্কার (Carcinoembryonic Antigen - CEA)',
    description: 'কোলন, মলদ্বার, পাকস্থলী ও অন্ত্রের ক্যান্সার সনাক্তকরণ ও চিকিৎসা পর্যবেক্ষণ।',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '84',
    name: 'সিএ ১২৫ ওভারিয়ান ক্যান্সার মার্কার (CA 125 - Ovarian Tumor Marker)',
    description: 'ডিম্বাশয়ের টিউমার ও ওভারিয়ান ক্যান্সার স্ক্রিনিং এবং এন্ডোমেট্রিওসিস মূল্যায়ন।',
    price: 1300,
    originalPrice: 1750,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1925,
      'lab_labaid': 2100,
      'lab_ibnsina': 1925,
      'lab_birdem': 1663,
      'lab_bsmmu': 1400,
      'lab_praava': 2188,
      'lab_evercare': 2538,
      'lab_medinova': 1750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '85',
    name: 'সিএ ১৫-৩ ব্রেস্ট টিউমার মার্কার (CA 15-3 - Breast Cancer Marker)',
    description: 'স্তনের টিউমার ও ব্রেস্ট ক্যান্সার চিকিৎসাধীন রোগীদের থেরাপি রেসপন্স পর্যবেক্ষণ।',
    price: 1300,
    originalPrice: 1750,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1925,
      'lab_labaid': 2100,
      'lab_ibnsina': 1925,
      'lab_birdem': 1663,
      'lab_bsmmu': 1400,
      'lab_praava': 2188,
      'lab_evercare': 2538,
      'lab_medinova': 1750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '86',
    name: 'সিএ ১৯-৯ অগ্ন্যাশয় ও পিত্তথলি মার্কার (CA 19-9 - Pancreatic Marker)',
    description: 'অগ্ন্যাশয় (Pancreas), পিত্তথলি ও পিত্তনালীর টিউমার ও ক্যান্সার মার্কার টেস্ট।',
    price: 1300,
    originalPrice: 1750,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1925,
      'lab_labaid': 2100,
      'lab_ibnsina': 1925,
      'lab_birdem': 1663,
      'lab_bsmmu': 1400,
      'lab_praava': 2188,
      'lab_evercare': 2538,
      'lab_medinova': 1750
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '87',
    name: 'আলফা-ফেটোপ্রোটিন লিভার মার্কার (AFP - Alpha Fetoprotein)',
    description: 'লিভারের দীর্ঘস্থায়ী সিরোসিস রোগীদের লিভার ক্যান্সার (HCC) স্ক্রিনিং টেস্ট।',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '88',
    name: 'সিরাম ম্যাগনেসিয়াম টেস্ট (Serum Magnesium)',
    description: 'হৃৎস্পন্দনের অনিয়ম (Arrhythmia), মাংসপেশির খিঁচুনি ও স্নায়ুবিক দুর্বলতা মূল্যায়ন।',
    price: 650,
    originalPrice: 900,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 990,
      'lab_labaid': 1080,
      'lab_ibnsina': 990,
      'lab_birdem': 855,
      'lab_bsmmu': 720,
      'lab_praava': 1125,
      'lab_evercare': 1305,
      'lab_medinova': 900
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '89',
    name: 'সিরাম অজৈব ফসফেট (Serum Inorganic Phosphate)',
    description: 'হাড়ের ঘনত্ব, ভিটামিন ডি মেটাবলিজম ও কিডনি রোগের ফসফরাস মাত্রা পরিমাপ।',
    price: 550,
    originalPrice: 750,
    priceByLab: {
      'lab_popular': 578,
      'lab_labaid': 633,
      'lab_ibnsina': 578,
      'lab_birdem': 495,
      'lab_bsmmu': 413,
      'lab_praava': 660,
      'lab_evercare': 770,
      'lab_medinova': 550
    },
    originalPriceByLab: {
      'lab_popular': 825,
      'lab_labaid': 900,
      'lab_ibnsina': 825,
      'lab_birdem': 713,
      'lab_bsmmu': 600,
      'lab_praava': 938,
      'lab_evercare': 1088,
      'lab_medinova': 750
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '90',
    name: 'আয়োনাইজড ক্যালসিয়াম (Serum Ionized Free Calcium)',
    description: 'শরীরে শারীরবৃত্তীয়ভাবে সক্রিয় মুক্ত ক্যালসিয়ামের শতভাগ নির্ভুল মাত্রা।',
    price: 700,
    originalPrice: 950,
    priceByLab: {
      'lab_popular': 735,
      'lab_labaid': 805,
      'lab_ibnsina': 735,
      'lab_birdem': 630,
      'lab_bsmmu': 525,
      'lab_praava': 840,
      'lab_evercare': 980,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 1045,
      'lab_labaid': 1140,
      'lab_ibnsina': 1045,
      'lab_birdem': 903,
      'lab_bsmmu': 760,
      'lab_praava': 1188,
      'lab_evercare': 1378,
      'lab_medinova': 950
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '91',
    name: 'গামা-জিটি লিভার টেস্ট (Gamma-GT / GGT)',
    description: 'পিত্তনালীর বাধা, ফ্যাটি লিভার ও অ্যালকোহলজনিত লিভার ক্ষতির সবচেয়ে সংবেদনশীল এনজাইম।',
    price: 650,
    originalPrice: 900,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 990,
      'lab_labaid': 1080,
      'lab_ibnsina': 990,
      'lab_birdem': 855,
      'lab_bsmmu': 720,
      'lab_praava': 1125,
      'lab_evercare': 1305,
      'lab_medinova': 900
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '92',
    name: 'এলডিএইচ এনজাইম টেস্ট (Lactate Dehydrogenase - LDH)',
    description: 'কোষের ধ্বংস, ফুসফুসের সংক্রমণ, রক্তস্বল্পতা ও টিস্যু আঘাতের সাধারণ মার্কার।',
    price: 700,
    originalPrice: 950,
    priceByLab: {
      'lab_popular': 735,
      'lab_labaid': 805,
      'lab_ibnsina': 735,
      'lab_birdem': 630,
      'lab_bsmmu': 525,
      'lab_praava': 840,
      'lab_evercare': 980,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 1045,
      'lab_labaid': 1140,
      'lab_ibnsina': 1045,
      'lab_birdem': 903,
      'lab_bsmmu': 760,
      'lab_praava': 1188,
      'lab_evercare': 1378,
      'lab_medinova': 950
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '93',
    name: 'সিকে-এমবি হার্ট এনজাইম (CK-MB for Heart Attack)',
    description: 'হার্ট অ্যাটাক পরবর্তী হৃদপেশির ক্ষতি ও বুকে ব্যথার তীব্রতা নির্ণায়ক কার্ডিয়াক এনজাইম।',
    price: 850,
    originalPrice: 1150,
    priceByLab: {
      'lab_popular': 893,
      'lab_labaid': 977,
      'lab_ibnsina': 893,
      'lab_birdem': 765,
      'lab_bsmmu': 638,
      'lab_praava': 1020,
      'lab_evercare': 1190,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1265,
      'lab_labaid': 1380,
      'lab_ibnsina': 1265,
      'lab_birdem': 1093,
      'lab_bsmmu': 920,
      'lab_praava': 1438,
      'lab_evercare': 1668,
      'lab_medinova': 1150
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৬ ঘন্টা'
  },
  {
    id: '94',
    name: 'টোটাল সিপিকে / ক্রিয়েটিন কাইনেজ (Total CPK / CK)',
    description: 'মাংসপেশির ক্ষত, প্রদাহ (Myositis) ও অতিরিক্ত ব্যায়ামজনিত পেশী ক্ষয় মূল্যায়ন।',
    price: 700,
    originalPrice: 950,
    priceByLab: {
      'lab_popular': 735,
      'lab_labaid': 805,
      'lab_ibnsina': 735,
      'lab_birdem': 630,
      'lab_bsmmu': 525,
      'lab_praava': 840,
      'lab_evercare': 980,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 1045,
      'lab_labaid': 1140,
      'lab_ibnsina': 1045,
      'lab_birdem': 903,
      'lab_bsmmu': 760,
      'lab_praava': 1188,
      'lab_evercare': 1378,
      'lab_medinova': 950
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '95',
    name: 'সেরাম ফলিক অ্যাসিড বা ভিটামিন বি ৯ (Serum Folic Acid / Vitamin B9)',
    description: 'মেগালোব্লাস্টিক অ্যানিমিয়া, স্নায়বিক গঠন ত্রুটি ও পুষ্টিহীনতা নির্ণায়ক টেস্ট।',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'Vitamin',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '96',
    name: 'সেরাম জিঙ্ক টেস্ট (Serum Zinc Level)',
    description: 'রোগ প্রতিরোধ ক্ষমতা, চুলের স্বাস্থ্য, ত্বকের ক্ষত নিরাময় ও শিশুদের শারীরিক বৃদ্ধি পরিমাপ।',
    price: 1200,
    originalPrice: 1650,
    priceByLab: {
      'lab_popular': 1260,
      'lab_labaid': 1380,
      'lab_ibnsina': 1260,
      'lab_birdem': 1080,
      'lab_bsmmu': 900,
      'lab_praava': 1440,
      'lab_evercare': 1680,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1815,
      'lab_labaid': 1980,
      'lab_ibnsina': 1815,
      'lab_birdem': 1568,
      'lab_bsmmu': 1320,
      'lab_praava': 2063,
      'lab_evercare': 2393,
      'lab_medinova': 1650
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '97',
    name: 'সেরাম কপার টেস্ট (Serum Copper Level)',
    description: 'উইলসন রোগ (Wilson Disease) ও লিভারে তামার অস্বাভাবিক জমাট সনাক্তকরণ।',
    price: 1400,
    originalPrice: 1900,
    priceByLab: {
      'lab_popular': 1470,
      'lab_labaid': 1610,
      'lab_ibnsina': 1470,
      'lab_birdem': 1260,
      'lab_bsmmu': 1050,
      'lab_praava': 1680,
      'lab_evercare': 1960,
      'lab_medinova': 1400
    },
    originalPriceByLab: {
      'lab_popular': 2090,
      'lab_labaid': 2280,
      'lab_ibnsina': 2090,
      'lab_birdem': 1805,
      'lab_bsmmu': 1520,
      'lab_praava': 2375,
      'lab_evercare': 2755,
      'lab_medinova': 1900
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '98',
    name: 'সেরাম সেরুলোপ্লাজমিন (Serum Ceruloplasmin)',
    description: 'লিভার ও মস্তিষ্কে তামা বিপাকজনিত বংশগত জটিলতা (Wilson Disease) নিশ্চিতকরণ টেস্ট।',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1575,
      'lab_labaid': 1725,
      'lab_ibnsina': 1575,
      'lab_birdem': 1350,
      'lab_bsmmu': 1125,
      'lab_praava': 1800,
      'lab_evercare': 2100,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 2200,
      'lab_labaid': 2400,
      'lab_ibnsina': 2200,
      'lab_birdem': 1900,
      'lab_bsmmu': 1600,
      'lab_praava': 2500,
      'lab_evercare': 2900,
      'lab_medinova': 2000
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '99',
    name: 'সেরাম প্রোক্যালসিটোনিন (Procalcitonin - Sepsis Marker)',
    description: 'মারাত্মক ব্যাকটেরিয়াল সংক্রমণ, নিউমোনিয়া ও সেপসিসের তীব্রতা দ্রুততম সময়ে নির্ণয়।',
    price: 2400,
    originalPrice: 3200,
    priceByLab: {
      'lab_popular': 2520,
      'lab_labaid': 2760,
      'lab_ibnsina': 2520,
      'lab_birdem': 2160,
      'lab_bsmmu': 1800,
      'lab_praava': 2880,
      'lab_evercare': 3360,
      'lab_medinova': 2400
    },
    originalPriceByLab: {
      'lab_popular': 3520,
      'lab_labaid': 3840,
      'lab_ibnsina': 3520,
      'lab_birdem': 3040,
      'lab_bsmmu': 2560,
      'lab_praava': 4000,
      'lab_evercare': 4640,
      'lab_medinova': 3200
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '100',
    name: 'অ্যান্টি-টিপিও অ্যান্টিবডি (Anti-TPO Antibody - Autoimmune Thyroid)',
    description: 'হাশিমোটো থাইরয়েডাইটিস ও অটোইমিউন থাইরয়েড রোগের শতভাগ সুনির্দিষ্ট অ্যান্টিবডি টেস্ট।',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1575,
      'lab_labaid': 1725,
      'lab_ibnsina': 1575,
      'lab_birdem': 1350,
      'lab_bsmmu': 1125,
      'lab_praava': 1800,
      'lab_evercare': 2100,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 2200,
      'lab_labaid': 2400,
      'lab_ibnsina': 2200,
      'lab_birdem': 1900,
      'lab_bsmmu': 1600,
      'lab_praava': 2500,
      'lab_evercare': 2900,
      'lab_medinova': 2000
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '২৪ ঘন্টা'
  }
];

const TESTS_EN: TestPackage[] = [
  {
    id: '1',
    name: 'Complete Blood Count (CBC with ESR)',
    description: 'To assess overall blood health, hemoglobin, and detect infection or anemia.',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 480,
      'lab_labaid': 600,
      'lab_ibnsina': 480,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 600,
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
      'lab_popular': 900,
      'lab_labaid': 1000,
      'lab_ibnsina': 900,
      'lab_birdem': 700,
      'lab_bsmmu': 600,
      'lab_praava': 1100,
      'lab_evercare': 1300,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1150,
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
      'lab_popular': 1300,
      'lab_labaid': 1500,
      'lab_ibnsina': 1300,
      'lab_birdem': 1000,
      'lab_bsmmu': 800,
      'lab_praava': 1600,
      'lab_evercare': 1900,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1650,
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
      'lab_popular': 1600,
      'lab_labaid': 2000,
      'lab_ibnsina': 1600,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000,
      'lab_praava': 2100,
      'lab_evercare': 2500,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 2050,
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
      'lab_popular': 2700,
      'lab_labaid': 3200,
      'lab_ibnsina': 2700,
      'lab_birdem': 2200,
      'lab_bsmmu': 1800,
      'lab_praava': 3400,
      'lab_evercare': 3900,
      'lab_medinova': 2500
    },
    originalPriceByLab: {
      'lab_popular': 3400,
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
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 800,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 850,
      'lab_evercare': 1050,
      'lab_medinova': 600
    },
    category: 'Kidney',
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
      'lab_popular': 550,
      'lab_labaid': 650,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 700,
      'lab_labaid': 850,
      'lab_ibnsina': 700,
      'lab_birdem': 600,
      'lab_bsmmu': 500,
      'lab_praava': 900,
      'lab_evercare': 1100,
      'lab_medinova': 650
    },
    category: 'Liver',
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
      'lab_popular': 200,
      'lab_labaid': 250,
      'lab_ibnsina': 200,
      'lab_birdem': 150,
      'lab_bsmmu': 100,
      'lab_praava': 280,
      'lab_evercare': 350,
      'lab_medinova': 180
    },
    originalPriceByLab: {
      'lab_popular': 260,
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
      'lab_popular': 340,
      'lab_labaid': 400,
      'lab_ibnsina': 340,
      'lab_birdem': 280,
      'lab_bsmmu': 200,
      'lab_praava': 450,
      'lab_evercare': 550,
      'lab_medinova': 300
    },
    originalPriceByLab: {
      'lab_popular': 450,
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
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 800,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 850,
      'lab_evercare': 1050,
      'lab_medinova': 600
    },
    category: 'Kidney',
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
      'lab_popular': 950,
      'lab_labaid': 1100,
      'lab_ibnsina': 950,
      'lab_birdem': 800,
      'lab_bsmmu': 600,
      'lab_praava': 1200,
      'lab_evercare': 1450,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1250,
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
      'lab_popular': 1050,
      'lab_labaid': 1200,
      'lab_ibnsina': 1050,
      'lab_birdem': 850,
      'lab_bsmmu': 700,
      'lab_praava': 1300,
      'lab_evercare': 1600,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1350,
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
  },
  {
    id: '13',
    name: 'Serum Bilirubin (Total)',
    description: 'Assesses jaundice, hepatic clearance, and bile duct health.',
    price: 400,
    originalPrice: 500,
    priceByLab: {
      'lab_popular': 400,
      'lab_labaid': 450,
      'lab_ibnsina': 400,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 500,
      'lab_evercare': 600,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 650,
      'lab_evercare': 750,
      'lab_medinova': 500
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '14',
    name: 'SGOT / AST (Serum Glutamic Oxaloacetic Transaminase)',
    description: 'Evaluates liver cell strain, muscle tissue, and organ enzyme markers.',
    price: 500,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 500,
      'lab_labaid': 550,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 600,
      'lab_evercare': 750,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 700,
      'lab_ibnsina': 650,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 650
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '15',
    name: 'Serum Alkaline Phosphatase (ALP)',
    description: 'Screens for biliary duct flow, liver conditions, and bone metabolism.',
    price: 500,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 500,
      'lab_labaid': 550,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 600,
      'lab_evercare': 750,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 700,
      'lab_ibnsina': 650,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 650
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '16',
    name: 'Serum Urea',
    description: 'Measures blood urea nitrogen and protein breakdown for kidney evaluation.',
    price: 400,
    originalPrice: 550,
    priceByLab: {
      'lab_popular': 400,
      'lab_labaid': 450,
      'lab_ibnsina': 400,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 500,
      'lab_evercare': 650,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 550
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '17',
    name: 'Serum Calcium',
    description: 'Essential mineral measurement for bone strength and neuromuscular regulation.',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 450,
      'lab_labaid': 500,
      'lab_ibnsina': 450,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 550,
      'lab_evercare': 700,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 650,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '18',
    name: 'Thyroid Stimulating Hormone (TSH)',
    description: 'Primary hormone test to detect hypothyroidism or hyperthyroidism.',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 700,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 900,
      'lab_ibnsina': 750,
      'lab_birdem': 650,
      'lab_bsmmu': 500,
      'lab_praava': 950,
      'lab_evercare': 1100,
      'lab_medinova': 750
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '19',
    name: 'Free T3 (FT3)',
    description: 'Measures metabolically active free triiodothyronine hormone level.',
    price: 700,
    originalPrice: 900,
    priceByLab: {
      'lab_popular': 650,
      'lab_labaid': 750,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 800,
      'lab_evercare': 950,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 800,
      'lab_labaid': 950,
      'lab_ibnsina': 800,
      'lab_birdem': 700,
      'lab_bsmmu': 550,
      'lab_praava': 1000,
      'lab_evercare': 1200,
      'lab_medinova': 850
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '20',
    name: 'Free T4 (FT4)',
    description: 'Measures active unbound thyroxine hormone for precise thyroid monitoring.',
    price: 700,
    originalPrice: 900,
    priceByLab: {
      'lab_popular': 650,
      'lab_labaid': 750,
      'lab_ibnsina': 650,
      'lab_birdem': 550,
      'lab_bsmmu': 450,
      'lab_praava': 800,
      'lab_evercare': 950,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 800,
      'lab_labaid': 950,
      'lab_ibnsina': 800,
      'lab_birdem': 700,
      'lab_bsmmu': 550,
      'lab_praava': 1000,
      'lab_evercare': 1200,
      'lab_medinova': 850
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '21',
    name: 'Blood Sugar 2 Hours ABF (2hABF)',
    description: 'Measures glucose spikes 2 hours after breakfast for glycemic control.',
    price: 200,
    originalPrice: 300,
    priceByLab: {
      'lab_popular': 200,
      'lab_labaid': 250,
      'lab_ibnsina': 200,
      'lab_birdem': 150,
      'lab_bsmmu': 100,
      'lab_praava': 280,
      'lab_evercare': 350,
      'lab_medinova': 200
    },
    originalPriceByLab: {
      'lab_popular': 260,
      'lab_labaid': 350,
      'lab_ibnsina': 260,
      'lab_birdem': 200,
      'lab_bsmmu': 150,
      'lab_praava': 380,
      'lab_evercare': 450,
      'lab_medinova': 250
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '6 Hours'
  },
  {
    id: '22',
    name: 'Random Blood Sugar (RBS)',
    description: 'Immediate random blood glucose evaluation at any given time.',
    price: 180,
    originalPrice: 250,
    priceByLab: {
      'lab_popular': 200,
      'lab_labaid': 250,
      'lab_ibnsina': 200,
      'lab_birdem': 150,
      'lab_bsmmu': 100,
      'lab_praava': 280,
      'lab_evercare': 350,
      'lab_medinova': 180
    },
    originalPriceByLab: {
      'lab_popular': 260,
      'lab_labaid': 350,
      'lab_ibnsina': 260,
      'lab_birdem': 200,
      'lab_bsmmu': 150,
      'lab_praava': 380,
      'lab_evercare': 450,
      'lab_medinova': 250
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '6 Hours'
  },
  {
    id: '23',
    name: 'Stool Routine Examination (Stool R/E)',
    description: 'Detects digestive tract infections, parasites, and occult blood presence.',
    price: 300,
    originalPrice: 400,
    priceByLab: {
      'lab_popular': 300,
      'lab_labaid': 350,
      'lab_ibnsina': 300,
      'lab_birdem': 250,
      'lab_bsmmu': 200,
      'lab_praava': 400,
      'lab_evercare': 500,
      'lab_medinova': 300
    },
    originalPriceByLab: {
      'lab_popular': 400,
      'lab_labaid': 500,
      'lab_ibnsina': 400,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 550,
      'lab_evercare': 650,
      'lab_medinova': 400
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '8 Hours'
  },
  {
    id: '24',
    name: 'Blood Grouping & Rh Factor',
    description: 'Identifies ABO blood group and Rh D antigen factor.',
    price: 250,
    originalPrice: 350,
    priceByLab: {
      'lab_popular': 250,
      'lab_labaid': 300,
      'lab_ibnsina': 250,
      'lab_birdem': 200,
      'lab_bsmmu': 150,
      'lab_praava': 350,
      'lab_evercare': 450,
      'lab_medinova': 250
    },
    originalPriceByLab: {
      'lab_popular': 350,
      'lab_labaid': 400,
      'lab_ibnsina': 350,
      'lab_birdem': 250,
      'lab_bsmmu': 200,
      'lab_praava': 450,
      'lab_evercare': 550,
      'lab_medinova': 350
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '4 Hours'
  },
  {
    id: '25',
    name: 'Dengue Antibody Test (IgG & IgM)',
    description: 'Detects recent or previous immune exposure to dengue virus.',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 700,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 900,
      'lab_ibnsina': 750,
      'lab_birdem': 650,
      'lab_bsmmu': 500,
      'lab_praava': 950,
      'lab_evercare': 1100,
      'lab_medinova': 750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '6 Hours'
  },
  {
    id: '26',
    name: 'HBsAg (Hepatitis B Screening)',
    description: 'Screening test for active Hepatitis B viral surface antigen.',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 450,
      'lab_labaid': 500,
      'lab_ibnsina': 450,
      'lab_birdem': 350,
      'lab_bsmmu': 250,
      'lab_praava': 550,
      'lab_evercare': 700,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 650,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '27',
    name: 'Anti-HCV (Hepatitis C Screening)',
    description: 'Screening for Hepatitis C viral antibody response in blood.',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 700,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 900,
      'lab_ibnsina': 750,
      'lab_birdem': 650,
      'lab_bsmmu': 500,
      'lab_praava': 950,
      'lab_evercare': 1100,
      'lab_medinova': 750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '28',
    name: 'HIV I & II (Screening)',
    description: 'Primary screening test for Human Immunodeficiency Virus types 1 & 2.',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 600,
      'lab_labaid': 700,
      'lab_ibnsina': 600,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 750,
      'lab_evercare': 900,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 750,
      'lab_labaid': 900,
      'lab_ibnsina': 750,
      'lab_birdem': 650,
      'lab_bsmmu': 500,
      'lab_praava': 950,
      'lab_evercare': 1100,
      'lab_medinova': 750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '29',
    name: 'VDRL (Syphilis Screening)',
    description: 'Serological non-treponemal screening test for syphilis infection.',
    price: 400,
    originalPrice: 550,
    priceByLab: {
      'lab_popular': 400,
      'lab_labaid': 450,
      'lab_ibnsina': 400,
      'lab_birdem': 300,
      'lab_bsmmu': 200,
      'lab_praava': 500,
      'lab_evercare': 650,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 550
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '30',
    name: 'Widal Test (Typhoid Screening)',
    description: 'Detects agglutinating antibodies against Salmonella enterica serovars.',
    price: 400,
    originalPrice: 550,
    priceByLab: {
      'lab_popular': 400,
      'lab_labaid': 450,
      'lab_ibnsina': 400,
      'lab_birdem': 300,
      'lab_bsmmu': 200,
      'lab_praava': 500,
      'lab_evercare': 650,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 550
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '31',
    name: 'C-Reactive Protein (CRP)',
    description: 'Measures systemic acute phase inflammatory reaction and bacterial infection.',
    price: 500,
    originalPrice: 700,
    priceByLab: {
      'lab_popular': 500,
      'lab_labaid': 600,
      'lab_ibnsina': 500,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 650,
      'lab_evercare': 800,
      'lab_medinova': 500
    },
    originalPriceByLab: {
      'lab_popular': 650,
      'lab_labaid': 750,
      'lab_ibnsina': 650,
      'lab_birdem': 500,
      'lab_bsmmu': 400,
      'lab_praava': 800,
      'lab_evercare': 1000,
      'lab_medinova': 650
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '32',
    name: 'Vitamin B12 (Cyanocobalamin)',
    description: 'Essential for nerve cell health, DNA synthesis, and red blood cell formation.',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1500,
      'lab_labaid': 1800,
      'lab_ibnsina': 1500,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000,
      'lab_praava': 1900,
      'lab_evercare': 2200,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 1850,
      'lab_labaid': 2200,
      'lab_ibnsina': 1850,
      'lab_birdem': 1500,
      'lab_bsmmu': 1250,
      'lab_praava': 2300,
      'lab_evercare': 2700,
      'lab_medinova': 1900
    },
    category: 'Vitamin',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48 Hours'
  },
  {
    id: '33',
    name: 'Serum Albumin / Total Protein',
    description: 'Measures albumin and total protein levels to evaluate liver function, nutritional status, and kidney health.',
    price: 450,
    originalPrice: 600,
    priceByLab: {
      'lab_popular': 450,
      'lab_labaid': 500,
      'lab_ibnsina': 450,
      'lab_birdem': 400,
      'lab_bsmmu': 300,
      'lab_praava': 550,
      'lab_evercare': 700,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 550,
      'lab_birdem': 450,
      'lab_bsmmu': 350,
      'lab_praava': 700,
      'lab_evercare': 850,
      'lab_medinova': 550
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '34',
    name: 'Serum Iron & TIBC Profile',
    description: 'Evaluates total iron levels, iron binding capacity, and helps diagnose iron-deficiency anemia.',
    price: 900,
    originalPrice: 1200,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1100,
      'lab_ibnsina': 950,
      'lab_birdem': 800,
      'lab_bsmmu': 650,
      'lab_praava': 1200,
      'lab_evercare': 1400,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1150,
      'lab_labaid': 1300,
      'lab_ibnsina': 1150,
      'lab_birdem': 950,
      'lab_bsmmu': 800,
      'lab_praava': 1400,
      'lab_evercare': 1650,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '35',
    name: 'Serum Ferritin (Iron Storage Evaluation)',
    description: 'Measures ferritin protein levels in blood to evaluate body iron reserves and chronic deficiency.',
    price: 1100,
    originalPrice: 1400,
    priceByLab: {
      'lab_popular': 1100,
      'lab_labaid': 1300,
      'lab_ibnsina': 1100,
      'lab_birdem': 900,
      'lab_bsmmu': 750,
      'lab_praava': 1350,
      'lab_evercare': 1600,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1300,
      'lab_labaid': 1550,
      'lab_ibnsina': 1300,
      'lab_birdem': 1100,
      'lab_bsmmu': 900,
      'lab_praava': 1600,
      'lab_evercare': 1900,
      'lab_medinova': 1300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '36',
    name: 'Prostate Specific Antigen (Total PSA)',
    description: 'Screens and monitors prostate gland disorders, benign prostatic hyperplasia, and prostate health in men.',
    price: 1200,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1200,
      'lab_labaid': 1400,
      'lab_ibnsina': 1200,
      'lab_birdem': 1000,
      'lab_bsmmu': 800,
      'lab_praava': 1450,
      'lab_evercare': 1700,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1400,
      'lab_labaid': 1650,
      'lab_ibnsina': 1400,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000,
      'lab_praava': 1700,
      'lab_evercare': 2000,
      'lab_medinova': 1400
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '37',
    name: 'Troponin I (High-Sensitivity Cardiac Marker)',
    description: 'Crucial cardiac biomarker for rapid assessment of myocardial damage and acute coronary syndrome.',
    price: 1400,
    originalPrice: 1800,
    priceByLab: {
      'lab_popular': 1400,
      'lab_labaid': 1600,
      'lab_ibnsina': 1400,
      'lab_birdem': 1200,
      'lab_bsmmu': 900,
      'lab_praava': 1700,
      'lab_evercare': 1950,
      'lab_medinova': 1400
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1900,
      'lab_ibnsina': 1650,
      'lab_birdem': 1400,
      'lab_bsmmu': 1100,
      'lab_praava': 2000,
      'lab_evercare': 2300,
      'lab_medinova': 1650
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1582718134360-15949d0dd4ca?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '4-6 Hours'
  },
  {
    id: '38',
    name: 'Serum Amylase & Lipase (Pancreatic Enzymes)',
    description: 'Evaluates pancreatic function, acute or chronic pancreatitis, and digestive enzyme levels.',
    price: 900,
    originalPrice: 1200,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1100,
      'lab_ibnsina': 950,
      'lab_birdem': 800,
      'lab_bsmmu': 600,
      'lab_praava': 1150,
      'lab_evercare': 1350,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1150,
      'lab_labaid': 1300,
      'lab_ibnsina': 1150,
      'lab_birdem': 950,
      'lab_bsmmu': 750,
      'lab_praava': 1350,
      'lab_evercare': 1600,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '39',
    name: 'Urine Culture & Sensitivity (Urine C/S)',
    description: 'Identifies bacterial urinary tract infections (UTI) and antibiotic susceptibility.',
    price: 650,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48-72 Hours'
  },
  {
    id: '40',
    name: 'Urine Microalbumin & Creatinine Ratio (ACR)',
    description: 'Early detection of diabetic nephropathy and kidney microvascular damage.',
    price: 900,
    originalPrice: 1200,
    priceByLab: {
      'lab_popular': 945,
      'lab_labaid': 1035,
      'lab_ibnsina': 945,
      'lab_birdem': 810,
      'lab_bsmmu': 675,
      'lab_praava': 1080,
      'lab_evercare': 1260,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1320,
      'lab_labaid': 1440,
      'lab_ibnsina': 1320,
      'lab_birdem': 1140,
      'lab_bsmmu': 960,
      'lab_praava': 1500,
      'lab_evercare': 1740,
      'lab_medinova': 1200
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '41',
    name: '24-Hour Urine Total Protein',
    description: 'Quantifies daily protein excretion for nephrotic and glomerulonephritis assessment.',
    price: 800,
    originalPrice: 1050,
    priceByLab: {
      'lab_popular': 840,
      'lab_labaid': 920,
      'lab_ibnsina': 840,
      'lab_birdem': 720,
      'lab_bsmmu': 600,
      'lab_praava': 960,
      'lab_evercare': 1120,
      'lab_medinova': 800
    },
    originalPriceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1260,
      'lab_ibnsina': 1155,
      'lab_birdem': 998,
      'lab_bsmmu': 840,
      'lab_praava': 1313,
      'lab_evercare': 1523,
      'lab_medinova': 1050
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '42',
    name: 'Urine Pregnancy Test (UPT / hCG)',
    description: 'Detects human chorionic gonadotropin (hCG) in urine to confirm pregnancy.',
    price: 200,
    originalPrice: 300,
    priceByLab: {
      'lab_popular': 210,
      'lab_labaid': 230,
      'lab_ibnsina': 210,
      'lab_birdem': 180,
      'lab_bsmmu': 150,
      'lab_praava': 240,
      'lab_evercare': 280,
      'lab_medinova': 200
    },
    originalPriceByLab: {
      'lab_popular': 330,
      'lab_labaid': 360,
      'lab_ibnsina': 330,
      'lab_birdem': 285,
      'lab_bsmmu': 240,
      'lab_praava': 375,
      'lab_evercare': 435,
      'lab_medinova': 300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '2 Hours'
  },
  {
    id: '43',
    name: 'Urine Ketone Bodies',
    description: 'Screens for diabetic ketoacidosis (DKA) and starvation ketosis in urine.',
    price: 250,
    originalPrice: 350,
    priceByLab: {
      'lab_popular': 263,
      'lab_labaid': 288,
      'lab_ibnsina': 263,
      'lab_birdem': 225,
      'lab_bsmmu': 188,
      'lab_praava': 300,
      'lab_evercare': 350,
      'lab_medinova': 250
    },
    originalPriceByLab: {
      'lab_popular': 385,
      'lab_labaid': 420,
      'lab_ibnsina': 385,
      'lab_birdem': 333,
      'lab_bsmmu': 280,
      'lab_praava': 438,
      'lab_evercare': 508,
      'lab_medinova': 350
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '4 Hours'
  },
  {
    id: '44',
    name: 'Urine Calcium Test',
    description: 'Assesses kidney stone risk, parathyroid disorders, and calcium excretion.',
    price: 550,
    originalPrice: 750,
    priceByLab: {
      'lab_popular': 578,
      'lab_labaid': 633,
      'lab_ibnsina': 578,
      'lab_birdem': 495,
      'lab_bsmmu': 413,
      'lab_praava': 660,
      'lab_evercare': 770,
      'lab_medinova': 550
    },
    originalPriceByLab: {
      'lab_popular': 825,
      'lab_labaid': 900,
      'lab_ibnsina': 825,
      'lab_birdem': 713,
      'lab_bsmmu': 600,
      'lab_praava': 938,
      'lab_evercare': 1088,
      'lab_medinova': 750
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '45',
    name: 'Urine Cytology for Malignant Cells',
    description: 'Microscopic cellular evaluation for urinary tract and bladder neoplastic cells.',
    price: 850,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 893,
      'lab_labaid': 977,
      'lab_ibnsina': 893,
      'lab_birdem': 765,
      'lab_bsmmu': 638,
      'lab_praava': 1020,
      'lab_evercare': 1190,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1210,
      'lab_labaid': 1320,
      'lab_ibnsina': 1210,
      'lab_birdem': 1045,
      'lab_bsmmu': 880,
      'lab_praava': 1375,
      'lab_evercare': 1595,
      'lab_medinova': 1100
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48 Hours'
  },
  {
    id: '46',
    name: 'Stool Occult Blood Test (FOBT / OBT)',
    description: 'Detects microscopic occult blood in stool, screening for GI lesions and colorectal polyps.',
    price: 350,
    originalPrice: 500,
    priceByLab: {
      'lab_popular': 368,
      'lab_labaid': 402,
      'lab_ibnsina': 368,
      'lab_birdem': 315,
      'lab_bsmmu': 263,
      'lab_praava': 420,
      'lab_evercare': 490,
      'lab_medinova': 350
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 550,
      'lab_birdem': 475,
      'lab_bsmmu': 400,
      'lab_praava': 625,
      'lab_evercare': 725,
      'lab_medinova': 500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '47',
    name: 'Stool Culture & Sensitivity (Stool C/S)',
    description: 'Isolates enteric bacterial pathogens (Salmonella, Shigella) and antimicrobial response.',
    price: 650,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48-72 Hours'
  },
  {
    id: '48',
    name: 'Stool Calprotectin (IBD / IBS Marker)',
    description: 'Distinguishes inflammatory bowel disease (IBD) from irritable bowel syndrome (IBS).',
    price: 2800,
    originalPrice: 3500,
    priceByLab: {
      'lab_popular': 2940,
      'lab_labaid': 3220,
      'lab_ibnsina': 2940,
      'lab_birdem': 2520,
      'lab_bsmmu': 2100,
      'lab_praava': 3360,
      'lab_evercare': 3920,
      'lab_medinova': 2800
    },
    originalPriceByLab: {
      'lab_popular': 3850,
      'lab_labaid': 4200,
      'lab_ibnsina': 3850,
      'lab_birdem': 3325,
      'lab_bsmmu': 2800,
      'lab_praava': 4375,
      'lab_evercare': 5075,
      'lab_medinova': 3500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48 Hours'
  },
  {
    id: '49',
    name: 'Stool Reducing Substance Test',
    description: 'Screens for carbohydrate malabsorption and infant lactose intolerance.',
    price: 350,
    originalPrice: 500,
    priceByLab: {
      'lab_popular': 368,
      'lab_labaid': 402,
      'lab_ibnsina': 368,
      'lab_birdem': 315,
      'lab_bsmmu': 263,
      'lab_praava': 420,
      'lab_evercare': 490,
      'lab_medinova': 350
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 550,
      'lab_birdem': 475,
      'lab_bsmmu': 400,
      'lab_praava': 625,
      'lab_evercare': 725,
      'lab_medinova': 500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '50',
    name: 'Stool H. Pylori Antigen',
    description: 'Non-invasive stool antigen test for active gastric Helicobacter pylori infection.',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '51',
    name: 'Blood Culture & Sensitivity (Blood C/S)',
    description: 'Detects bloodstream infections and sepsis to determine effective antimicrobial therapy.',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '72 Hours'
  },
  {
    id: '52',
    name: 'Typhoid Typhidot IgM & IgG Rapid Test',
    description: 'Rapid and specific antibody test for early detection of Salmonella typhi infection.',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 630,
      'lab_labaid': 690,
      'lab_ibnsina': 630,
      'lab_birdem': 540,
      'lab_bsmmu': 450,
      'lab_praava': 720,
      'lab_evercare': 840,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 880,
      'lab_labaid': 960,
      'lab_ibnsina': 880,
      'lab_birdem': 760,
      'lab_bsmmu': 640,
      'lab_praava': 1000,
      'lab_evercare': 1160,
      'lab_medinova': 800
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '53',
    name: 'Malaria Parasite Antigen (MP ICT & Blood Film)',
    description: 'Detects Plasmodium parasites using rapid antigen ICT card and peripheral blood smear.',
    price: 450,
    originalPrice: 650,
    priceByLab: {
      'lab_popular': 473,
      'lab_labaid': 518,
      'lab_ibnsina': 473,
      'lab_birdem': 405,
      'lab_bsmmu': 338,
      'lab_praava': 540,
      'lab_evercare': 630,
      'lab_medinova': 450
    },
    originalPriceByLab: {
      'lab_popular': 715,
      'lab_labaid': 780,
      'lab_ibnsina': 715,
      'lab_birdem': 618,
      'lab_bsmmu': 520,
      'lab_praava': 813,
      'lab_evercare': 943,
      'lab_medinova': 650
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '6 Hours'
  },
  {
    id: '54',
    name: 'Chikungunya Virus IgM Antibody',
    description: 'Serological detection of acute Chikungunya viral infection antibodies in blood.',
    price: 900,
    originalPrice: 1200,
    priceByLab: {
      'lab_popular': 945,
      'lab_labaid': 1035,
      'lab_ibnsina': 945,
      'lab_birdem': 810,
      'lab_bsmmu': 675,
      'lab_praava': 1080,
      'lab_evercare': 1260,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1320,
      'lab_labaid': 1440,
      'lab_ibnsina': 1320,
      'lab_birdem': 1140,
      'lab_bsmmu': 960,
      'lab_praava': 1500,
      'lab_evercare': 1740,
      'lab_medinova': 1200
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '55',
    name: 'Anti-HBs Antibody Titre (Hepatitis B Immunity)',
    description: 'Measures immunity level and vaccine response against Hepatitis B virus.',
    price: 700,
    originalPrice: 950,
    priceByLab: {
      'lab_popular': 735,
      'lab_labaid': 805,
      'lab_ibnsina': 735,
      'lab_birdem': 630,
      'lab_bsmmu': 525,
      'lab_praava': 840,
      'lab_evercare': 980,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 1045,
      'lab_labaid': 1140,
      'lab_ibnsina': 1045,
      'lab_birdem': 903,
      'lab_bsmmu': 760,
      'lab_praava': 1188,
      'lab_evercare': 1378,
      'lab_medinova': 950
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '56',
    name: 'Anti-HBc Total (Hepatitis B Core Antibody)',
    description: 'Differentiates past resolved from ongoing Hepatitis B viral exposure.',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '57',
    name: 'Anti-HAV IgM (Acute Hepatitis A Viral)',
    description: 'Detects acute infectious Hepatitis A viral infection in patients with sudden jaundice.',
    price: 900,
    originalPrice: 1250,
    priceByLab: {
      'lab_popular': 945,
      'lab_labaid': 1035,
      'lab_ibnsina': 945,
      'lab_birdem': 810,
      'lab_bsmmu': 675,
      'lab_praava': 1080,
      'lab_evercare': 1260,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1375,
      'lab_labaid': 1500,
      'lab_ibnsina': 1375,
      'lab_birdem': 1188,
      'lab_bsmmu': 1000,
      'lab_praava': 1563,
      'lab_evercare': 1813,
      'lab_medinova': 1250
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '58',
    name: 'Anti-HEV IgM (Acute Hepatitis E)',
    description: 'Diagnoses acute waterborne Hepatitis E viral hepatitis in serum.',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '59',
    name: 'TPHA (Treponema Pallidum Hemagglutination Assay)',
    description: 'Specific confirmatory treponemal antibody test for Syphilis.',
    price: 600,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 630,
      'lab_labaid': 690,
      'lab_ibnsina': 630,
      'lab_birdem': 540,
      'lab_bsmmu': 450,
      'lab_praava': 720,
      'lab_evercare': 840,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '60',
    name: 'TORCH 10 Profile (Toxoplasma, Rubella, CMV, HSV)',
    description: 'Comprehensive prenatal screen for Toxoplasma, Rubella, Cytomegalovirus, and Herpes.',
    price: 3600,
    originalPrice: 4800,
    priceByLab: {
      'lab_popular': 3780,
      'lab_labaid': 4140,
      'lab_ibnsina': 3780,
      'lab_birdem': 3240,
      'lab_bsmmu': 2700,
      'lab_praava': 4320,
      'lab_evercare': 5040,
      'lab_medinova': 3600
    },
    originalPriceByLab: {
      'lab_popular': 5280,
      'lab_labaid': 5760,
      'lab_ibnsina': 5280,
      'lab_birdem': 4560,
      'lab_bsmmu': 3840,
      'lab_praava': 6000,
      'lab_evercare': 6960,
      'lab_medinova': 4800
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48 Hours'
  },
  {
    id: '61',
    name: 'Prothrombin Time with INR (PT-INR)',
    description: 'Monitors oral anticoagulant therapy (Warfarin) and liver extrinsic clotting factors.',
    price: 600,
    originalPrice: 800,
    priceByLab: {
      'lab_popular': 630,
      'lab_labaid': 690,
      'lab_ibnsina': 630,
      'lab_birdem': 540,
      'lab_bsmmu': 450,
      'lab_praava': 720,
      'lab_evercare': 840,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 880,
      'lab_labaid': 960,
      'lab_ibnsina': 880,
      'lab_birdem': 760,
      'lab_bsmmu': 640,
      'lab_praava': 1000,
      'lab_evercare': 1160,
      'lab_medinova': 800
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '62',
    name: 'Activated Partial Thromboplastin Time (APTT)',
    description: 'Screens intrinsic clotting pathway defects and monitors heparin therapy.',
    price: 650,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '63',
    name: 'D-Dimer Quantitative Assay',
    description: 'Aids in ruling out deep vein thrombosis (DVT) and pulmonary embolism (PE).',
    price: 1300,
    originalPrice: 1700,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1870,
      'lab_labaid': 2040,
      'lab_ibnsina': 1870,
      'lab_birdem': 1615,
      'lab_bsmmu': 1360,
      'lab_praava': 2125,
      'lab_evercare': 2465,
      'lab_medinova': 1700
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '64',
    name: 'Hemoglobin Electrophoresis (HPLC / Thalassemia)',
    description: 'Gold standard screening for Thalassemia trait and hemoglobin variants (Hb E, Hb S).',
    price: 1400,
    originalPrice: 1900,
    priceByLab: {
      'lab_popular': 1470,
      'lab_labaid': 1610,
      'lab_ibnsina': 1470,
      'lab_birdem': 1260,
      'lab_bsmmu': 1050,
      'lab_praava': 1680,
      'lab_evercare': 1960,
      'lab_medinova': 1400
    },
    originalPriceByLab: {
      'lab_popular': 2090,
      'lab_labaid': 2280,
      'lab_ibnsina': 2090,
      'lab_birdem': 1805,
      'lab_bsmmu': 1520,
      'lab_praava': 2375,
      'lab_evercare': 2755,
      'lab_medinova': 1900
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24-48 Hours'
  },
  {
    id: '65',
    name: 'Peripheral Blood Smear (PBF)',
    description: 'Microscopic morphology of RBCs, WBCs, and platelets to evaluate leukemia and anemia.',
    price: 400,
    originalPrice: 550,
    priceByLab: {
      'lab_popular': 420,
      'lab_labaid': 460,
      'lab_ibnsina': 420,
      'lab_birdem': 360,
      'lab_bsmmu': 300,
      'lab_praava': 480,
      'lab_evercare': 560,
      'lab_medinova': 400
    },
    originalPriceByLab: {
      'lab_popular': 605,
      'lab_labaid': 660,
      'lab_ibnsina': 605,
      'lab_birdem': 523,
      'lab_bsmmu': 440,
      'lab_praava': 688,
      'lab_evercare': 798,
      'lab_medinova': 550
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '66',
    name: 'Reticulocyte Count',
    description: 'Measures bone marrow erythropoietic production and response to anemia treatment.',
    price: 350,
    originalPrice: 500,
    priceByLab: {
      'lab_popular': 368,
      'lab_labaid': 402,
      'lab_ibnsina': 368,
      'lab_birdem': 315,
      'lab_bsmmu': 263,
      'lab_praava': 420,
      'lab_evercare': 490,
      'lab_medinova': 350
    },
    originalPriceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_ibnsina': 550,
      'lab_birdem': 475,
      'lab_bsmmu': 400,
      'lab_praava': 625,
      'lab_evercare': 725,
      'lab_medinova': 500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '67',
    name: 'Bleeding Time & Clotting Time (BT & CT)',
    description: 'Pre-operative screening of primary platelet plug formation and coagulation time.',
    price: 250,
    originalPrice: 350,
    priceByLab: {
      'lab_popular': 263,
      'lab_labaid': 288,
      'lab_ibnsina': 263,
      'lab_birdem': 225,
      'lab_bsmmu': 188,
      'lab_praava': 300,
      'lab_evercare': 350,
      'lab_medinova': 250
    },
    originalPriceByLab: {
      'lab_popular': 385,
      'lab_labaid': 420,
      'lab_ibnsina': 385,
      'lab_birdem': 333,
      'lab_bsmmu': 280,
      'lab_praava': 438,
      'lab_evercare': 508,
      'lab_medinova': 350
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '2 Hours'
  },
  {
    id: '68',
    name: 'Serum Total Testosterone Test',
    description: 'Measures total androgen testosterone level in men and women.',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '69',
    name: 'Serum Prolactin Hormone Test',
    description: 'Evaluates hyperprolactinemia, pituitary adenoma, irregular menses, and infertility.',
    price: 850,
    originalPrice: 1150,
    priceByLab: {
      'lab_popular': 893,
      'lab_labaid': 977,
      'lab_ibnsina': 893,
      'lab_birdem': 765,
      'lab_bsmmu': 638,
      'lab_praava': 1020,
      'lab_evercare': 1190,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1265,
      'lab_labaid': 1380,
      'lab_ibnsina': 1265,
      'lab_birdem': 1093,
      'lab_bsmmu': 920,
      'lab_praava': 1438,
      'lab_evercare': 1668,
      'lab_medinova': 1150
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '70',
    name: 'Follicle Stimulating Hormone (Serum FSH)',
    description: 'Evaluates ovarian reserve, menopausal status, and testicular function.',
    price: 800,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 840,
      'lab_labaid': 920,
      'lab_ibnsina': 840,
      'lab_birdem': 720,
      'lab_bsmmu': 600,
      'lab_praava': 960,
      'lab_evercare': 1120,
      'lab_medinova': 800
    },
    originalPriceByLab: {
      'lab_popular': 1210,
      'lab_labaid': 1320,
      'lab_ibnsina': 1210,
      'lab_birdem': 1045,
      'lab_bsmmu': 880,
      'lab_praava': 1375,
      'lab_evercare': 1595,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '71',
    name: 'Luteinizing Hormone (Serum LH)',
    description: 'Assesses ovulation triggers and aids in diagnosis of Polycystic Ovary Syndrome (PCOS).',
    price: 800,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 840,
      'lab_labaid': 920,
      'lab_ibnsina': 840,
      'lab_birdem': 720,
      'lab_bsmmu': 600,
      'lab_praava': 960,
      'lab_evercare': 1120,
      'lab_medinova': 800
    },
    originalPriceByLab: {
      'lab_popular': 1210,
      'lab_labaid': 1320,
      'lab_ibnsina': 1210,
      'lab_birdem': 1045,
      'lab_bsmmu': 880,
      'lab_praava': 1375,
      'lab_evercare': 1595,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '72',
    name: 'Anti-Mullerian Hormone (AMH - Ovarian Reserve)',
    description: 'Gold standard blood marker for female ovarian follicular reserve and fertility lifespan.',
    price: 2500,
    originalPrice: 3200,
    priceByLab: {
      'lab_popular': 2625,
      'lab_labaid': 2875,
      'lab_ibnsina': 2625,
      'lab_birdem': 2250,
      'lab_bsmmu': 1875,
      'lab_praava': 3000,
      'lab_evercare': 3500,
      'lab_medinova': 2500
    },
    originalPriceByLab: {
      'lab_popular': 3520,
      'lab_labaid': 3840,
      'lab_ibnsina': 3520,
      'lab_birdem': 3040,
      'lab_bsmmu': 2560,
      'lab_praava': 4000,
      'lab_evercare': 4640,
      'lab_medinova': 3200
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24-48 Hours'
  },
  {
    id: '73',
    name: 'Serum Cortisol Hormone Test',
    description: 'Measures adrenal gland function and assesses Cushing syndrome and Addison disease.',
    price: 900,
    originalPrice: 1250,
    priceByLab: {
      'lab_popular': 945,
      'lab_labaid': 1035,
      'lab_ibnsina': 945,
      'lab_birdem': 810,
      'lab_bsmmu': 675,
      'lab_praava': 1080,
      'lab_evercare': 1260,
      'lab_medinova': 900
    },
    originalPriceByLab: {
      'lab_popular': 1375,
      'lab_labaid': 1500,
      'lab_ibnsina': 1375,
      'lab_birdem': 1188,
      'lab_bsmmu': 1000,
      'lab_praava': 1563,
      'lab_evercare': 1813,
      'lab_medinova': 1250
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '74',
    name: 'Beta hCG Quantitative Serum Test',
    description: 'Quantitative blood test confirming early pregnancy and gestational development.',
    price: 950,
    originalPrice: 1300,
    priceByLab: {
      'lab_popular': 998,
      'lab_labaid': 1093,
      'lab_ibnsina': 998,
      'lab_birdem': 855,
      'lab_bsmmu': 713,
      'lab_praava': 1140,
      'lab_evercare': 1330,
      'lab_medinova': 950
    },
    originalPriceByLab: {
      'lab_popular': 1430,
      'lab_labaid': 1560,
      'lab_ibnsina': 1430,
      'lab_birdem': 1235,
      'lab_bsmmu': 1040,
      'lab_praava': 1625,
      'lab_evercare': 1885,
      'lab_medinova': 1300
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '75',
    name: 'Fasting Serum Insulin Test',
    description: 'Evaluates insulin resistance, metabolic syndrome, and prediabetes pathophysiology.',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '76',
    name: 'HOMA-IR Insulin Resistance Index',
    description: 'Calculates quantitative homeostatic model assessment of insulin resistance.',
    price: 1300,
    originalPrice: 1750,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1925,
      'lab_labaid': 2100,
      'lab_ibnsina': 1925,
      'lab_birdem': 1663,
      'lab_bsmmu': 1400,
      'lab_praava': 2188,
      'lab_evercare': 2538,
      'lab_medinova': 1750
    },
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '77',
    name: 'Rheumatoid Factor (RA / RF Quantitative)',
    description: 'Quantitative test for diagnosis of rheumatoid arthritis and autoimmune joint disease.',
    price: 600,
    originalPrice: 850,
    priceByLab: {
      'lab_popular': 630,
      'lab_labaid': 690,
      'lab_ibnsina': 630,
      'lab_birdem': 540,
      'lab_bsmmu': 450,
      'lab_praava': 720,
      'lab_evercare': 840,
      'lab_medinova': 600
    },
    originalPriceByLab: {
      'lab_popular': 935,
      'lab_labaid': 1020,
      'lab_ibnsina': 935,
      'lab_birdem': 808,
      'lab_bsmmu': 680,
      'lab_praava': 1063,
      'lab_evercare': 1233,
      'lab_medinova': 850
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '78',
    name: 'Anti-CCP Antibody (Rheumatoid Marker)',
    description: 'Highly specific diagnostic marker for early and aggressive rheumatoid arthritis.',
    price: 1800,
    originalPrice: 2400,
    priceByLab: {
      'lab_popular': 1890,
      'lab_labaid': 2070,
      'lab_ibnsina': 1890,
      'lab_birdem': 1620,
      'lab_bsmmu': 1350,
      'lab_praava': 2160,
      'lab_evercare': 2520,
      'lab_medinova': 1800
    },
    originalPriceByLab: {
      'lab_popular': 2640,
      'lab_labaid': 2880,
      'lab_ibnsina': 2640,
      'lab_birdem': 2280,
      'lab_bsmmu': 1920,
      'lab_praava': 3000,
      'lab_evercare': 3480,
      'lab_medinova': 2400
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '79',
    name: 'Antinuclear Antibody (ANA by IFA)',
    description: 'Screens for Systemic Lupus Erythematosus (SLE) and connective tissue autoimmune diseases.',
    price: 1200,
    originalPrice: 1600,
    priceByLab: {
      'lab_popular': 1260,
      'lab_labaid': 1380,
      'lab_ibnsina': 1260,
      'lab_birdem': 1080,
      'lab_bsmmu': 900,
      'lab_praava': 1440,
      'lab_evercare': 1680,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1760,
      'lab_labaid': 1920,
      'lab_ibnsina': 1760,
      'lab_birdem': 1520,
      'lab_bsmmu': 1280,
      'lab_praava': 2000,
      'lab_evercare': 2320,
      'lab_medinova': 1600
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '80',
    name: 'Anti-dsDNA Antibody (Quantitative)',
    description: 'Confirms diagnosis and monitors disease activity in Systemic Lupus Erythematosus (SLE).',
    price: 1600,
    originalPrice: 2100,
    priceByLab: {
      'lab_popular': 1680,
      'lab_labaid': 1840,
      'lab_ibnsina': 1680,
      'lab_birdem': 1440,
      'lab_bsmmu': 1200,
      'lab_praava': 1920,
      'lab_evercare': 2240,
      'lab_medinova': 1600
    },
    originalPriceByLab: {
      'lab_popular': 2310,
      'lab_labaid': 2520,
      'lab_ibnsina': 2310,
      'lab_birdem': 1995,
      'lab_bsmmu': 1680,
      'lab_praava': 2625,
      'lab_evercare': 3045,
      'lab_medinova': 2100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24-48 Hours'
  },
  {
    id: '81',
    name: 'Serum Total IgE (Allergy & Asthma Level)',
    description: 'Measures circulating immunoglobulin E to diagnose allergic conditions and atopy.',
    price: 800,
    originalPrice: 1100,
    priceByLab: {
      'lab_popular': 840,
      'lab_labaid': 920,
      'lab_ibnsina': 840,
      'lab_birdem': 720,
      'lab_bsmmu': 600,
      'lab_praava': 960,
      'lab_evercare': 1120,
      'lab_medinova': 800
    },
    originalPriceByLab: {
      'lab_popular': 1210,
      'lab_labaid': 1320,
      'lab_ibnsina': 1210,
      'lab_birdem': 1045,
      'lab_bsmmu': 880,
      'lab_praava': 1375,
      'lab_evercare': 1595,
      'lab_medinova': 1100
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '82',
    name: 'Antistreptolysin O (ASO Titre)',
    description: 'Measures antibodies against Group A Streptococcus to detect post-streptococcal complications.',
    price: 550,
    originalPrice: 750,
    priceByLab: {
      'lab_popular': 578,
      'lab_labaid': 633,
      'lab_ibnsina': 578,
      'lab_birdem': 495,
      'lab_bsmmu': 413,
      'lab_praava': 660,
      'lab_evercare': 770,
      'lab_medinova': 550
    },
    originalPriceByLab: {
      'lab_popular': 825,
      'lab_labaid': 900,
      'lab_ibnsina': 825,
      'lab_birdem': 713,
      'lab_bsmmu': 600,
      'lab_praava': 938,
      'lab_evercare': 1088,
      'lab_medinova': 750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '83',
    name: 'Carcinoembryonic Antigen (CEA Tumor Marker)',
    description: 'Tumor marker primarily used to monitor colorectal and gastrointestinal malignancies.',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '84',
    name: 'Cancer Antigen 125 (CA 125 - Ovarian Marker)',
    description: 'Serum biomarker for ovarian tumor screening and monitoring therapeutic response.',
    price: 1300,
    originalPrice: 1750,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1925,
      'lab_labaid': 2100,
      'lab_ibnsina': 1925,
      'lab_birdem': 1663,
      'lab_bsmmu': 1400,
      'lab_praava': 2188,
      'lab_evercare': 2538,
      'lab_medinova': 1750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '85',
    name: 'Cancer Antigen 15-3 (CA 15-3 - Breast Marker)',
    description: 'Monitors clinical course and recurrence of metastatic breast malignancy.',
    price: 1300,
    originalPrice: 1750,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1925,
      'lab_labaid': 2100,
      'lab_ibnsina': 1925,
      'lab_birdem': 1663,
      'lab_bsmmu': 1400,
      'lab_praava': 2188,
      'lab_evercare': 2538,
      'lab_medinova': 1750
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '86',
    name: 'Cancer Antigen 19-9 (CA 19-9 - Pancreatic/Biliary)',
    description: 'Tumor marker for pancreatic adenocarcinoma and hepatobiliary carcinoma evaluation.',
    price: 1300,
    originalPrice: 1750,
    priceByLab: {
      'lab_popular': 1365,
      'lab_labaid': 1495,
      'lab_ibnsina': 1365,
      'lab_birdem': 1170,
      'lab_bsmmu': 975,
      'lab_praava': 1560,
      'lab_evercare': 1820,
      'lab_medinova': 1300
    },
    originalPriceByLab: {
      'lab_popular': 1925,
      'lab_labaid': 2100,
      'lab_ibnsina': 1925,
      'lab_birdem': 1663,
      'lab_bsmmu': 1400,
      'lab_praava': 2188,
      'lab_evercare': 2538,
      'lab_medinova': 1750
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '87',
    name: 'Alpha-Fetoprotein (AFP Liver Tumor Marker)',
    description: 'Biomarker for hepatocellular carcinoma and germ cell testicular tumors.',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '88',
    name: 'Serum Magnesium Test',
    description: 'Evaluates neuromuscular excitability, cardiac arrhythmias, and electrolyte balance.',
    price: 650,
    originalPrice: 900,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 990,
      'lab_labaid': 1080,
      'lab_ibnsina': 990,
      'lab_birdem': 855,
      'lab_bsmmu': 720,
      'lab_praava': 1125,
      'lab_evercare': 1305,
      'lab_medinova': 900
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '89',
    name: 'Serum Inorganic Phosphate / Phosphorus',
    description: 'Evaluates bone mineral metabolism, renal clearance, and hyperparathyroidism.',
    price: 550,
    originalPrice: 750,
    priceByLab: {
      'lab_popular': 578,
      'lab_labaid': 633,
      'lab_ibnsina': 578,
      'lab_birdem': 495,
      'lab_bsmmu': 413,
      'lab_praava': 660,
      'lab_evercare': 770,
      'lab_medinova': 550
    },
    originalPriceByLab: {
      'lab_popular': 825,
      'lab_labaid': 900,
      'lab_ibnsina': 825,
      'lab_birdem': 713,
      'lab_bsmmu': 600,
      'lab_praava': 938,
      'lab_evercare': 1088,
      'lab_medinova': 750
    },
    category: 'Kidney',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '90',
    name: 'Serum Ionized Calcium (Free Calcium)',
    description: 'Measures physiologically active unbound free calcium in circulation.',
    price: 700,
    originalPrice: 950,
    priceByLab: {
      'lab_popular': 735,
      'lab_labaid': 805,
      'lab_ibnsina': 735,
      'lab_birdem': 630,
      'lab_bsmmu': 525,
      'lab_praava': 840,
      'lab_evercare': 980,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 1045,
      'lab_labaid': 1140,
      'lab_ibnsina': 1045,
      'lab_birdem': 903,
      'lab_bsmmu': 760,
      'lab_praava': 1188,
      'lab_evercare': 1378,
      'lab_medinova': 950
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '91',
    name: 'Gamma Glutamyl Transferase (Gamma-GT / GGT)',
    description: 'Sensitive hepatic enzyme marker for biliary obstruction and liver injury.',
    price: 650,
    originalPrice: 900,
    priceByLab: {
      'lab_popular': 683,
      'lab_labaid': 747,
      'lab_ibnsina': 683,
      'lab_birdem': 585,
      'lab_bsmmu': 488,
      'lab_praava': 780,
      'lab_evercare': 910,
      'lab_medinova': 650
    },
    originalPriceByLab: {
      'lab_popular': 990,
      'lab_labaid': 1080,
      'lab_ibnsina': 990,
      'lab_birdem': 855,
      'lab_bsmmu': 720,
      'lab_praava': 1125,
      'lab_evercare': 1305,
      'lab_medinova': 900
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '92',
    name: 'Lactate Dehydrogenase (Serum LDH)',
    description: 'Non-specific marker for tissue necrosis, hemolysis, and severe infections.',
    price: 700,
    originalPrice: 950,
    priceByLab: {
      'lab_popular': 735,
      'lab_labaid': 805,
      'lab_ibnsina': 735,
      'lab_birdem': 630,
      'lab_bsmmu': 525,
      'lab_praava': 840,
      'lab_evercare': 980,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 1045,
      'lab_labaid': 1140,
      'lab_ibnsina': 1045,
      'lab_birdem': 903,
      'lab_bsmmu': 760,
      'lab_praava': 1188,
      'lab_evercare': 1378,
      'lab_medinova': 950
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '93',
    name: 'Creatine Kinase-MB (CK-MB Cardiac Marker)',
    description: 'Myocardial specific enzyme for acute coronary syndrome and cardiac damage evaluation.',
    price: 850,
    originalPrice: 1150,
    priceByLab: {
      'lab_popular': 893,
      'lab_labaid': 977,
      'lab_ibnsina': 893,
      'lab_birdem': 765,
      'lab_bsmmu': 638,
      'lab_praava': 1020,
      'lab_evercare': 1190,
      'lab_medinova': 850
    },
    originalPriceByLab: {
      'lab_popular': 1265,
      'lab_labaid': 1380,
      'lab_ibnsina': 1265,
      'lab_birdem': 1093,
      'lab_bsmmu': 920,
      'lab_praava': 1438,
      'lab_evercare': 1668,
      'lab_medinova': 1150
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '6 Hours'
  },
  {
    id: '94',
    name: 'Total Creatine Phosphokinase (Total CPK)',
    description: 'Measures skeletal and cardiac muscle breakdown (myopathy evaluation).',
    price: 700,
    originalPrice: 950,
    priceByLab: {
      'lab_popular': 735,
      'lab_labaid': 805,
      'lab_ibnsina': 735,
      'lab_birdem': 630,
      'lab_bsmmu': 525,
      'lab_praava': 840,
      'lab_evercare': 980,
      'lab_medinova': 700
    },
    originalPriceByLab: {
      'lab_popular': 1045,
      'lab_labaid': 1140,
      'lab_ibnsina': 1045,
      'lab_birdem': 903,
      'lab_bsmmu': 760,
      'lab_praava': 1188,
      'lab_evercare': 1378,
      'lab_medinova': 950
    },
    category: 'Heart',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '95',
    name: 'Serum Folic Acid (Vitamin B9)',
    description: 'Evaluates megaloblastic anemia, neural tube defects prevention, and malnutrition.',
    price: 1100,
    originalPrice: 1500,
    priceByLab: {
      'lab_popular': 1155,
      'lab_labaid': 1265,
      'lab_ibnsina': 1155,
      'lab_birdem': 990,
      'lab_bsmmu': 825,
      'lab_praava': 1320,
      'lab_evercare': 1540,
      'lab_medinova': 1100
    },
    originalPriceByLab: {
      'lab_popular': 1650,
      'lab_labaid': 1800,
      'lab_ibnsina': 1650,
      'lab_birdem': 1425,
      'lab_bsmmu': 1200,
      'lab_praava': 1875,
      'lab_evercare': 2175,
      'lab_medinova': 1500
    },
    category: 'Vitamin',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
  },
  {
    id: '96',
    name: 'Serum Zinc Level Test',
    description: 'Essential trace mineral for wound healing, immune function, and pediatric growth.',
    price: 1200,
    originalPrice: 1650,
    priceByLab: {
      'lab_popular': 1260,
      'lab_labaid': 1380,
      'lab_ibnsina': 1260,
      'lab_birdem': 1080,
      'lab_bsmmu': 900,
      'lab_praava': 1440,
      'lab_evercare': 1680,
      'lab_medinova': 1200
    },
    originalPriceByLab: {
      'lab_popular': 1815,
      'lab_labaid': 1980,
      'lab_ibnsina': 1815,
      'lab_birdem': 1568,
      'lab_bsmmu': 1320,
      'lab_praava': 2063,
      'lab_evercare': 2393,
      'lab_medinova': 1650
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48 Hours'
  },
  {
    id: '97',
    name: 'Serum Copper Level Test',
    description: 'Trace element evaluation for hepatic copper overload and Wilson disease.',
    price: 1400,
    originalPrice: 1900,
    priceByLab: {
      'lab_popular': 1470,
      'lab_labaid': 1610,
      'lab_ibnsina': 1470,
      'lab_birdem': 1260,
      'lab_bsmmu': 1050,
      'lab_praava': 1680,
      'lab_evercare': 1960,
      'lab_medinova': 1400
    },
    originalPriceByLab: {
      'lab_popular': 2090,
      'lab_labaid': 2280,
      'lab_ibnsina': 2090,
      'lab_birdem': 1805,
      'lab_bsmmu': 1520,
      'lab_praava': 2375,
      'lab_evercare': 2755,
      'lab_medinova': 1900
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48 Hours'
  },
  {
    id: '98',
    name: 'Serum Ceruloplasmin Protein',
    description: 'Diagnostic protein assay for inborn copper metabolism defects (Wilson disease).',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1575,
      'lab_labaid': 1725,
      'lab_ibnsina': 1575,
      'lab_birdem': 1350,
      'lab_bsmmu': 1125,
      'lab_praava': 1800,
      'lab_evercare': 2100,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 2200,
      'lab_labaid': 2400,
      'lab_ibnsina': 2200,
      'lab_birdem': 1900,
      'lab_bsmmu': 1600,
      'lab_praava': 2500,
      'lab_evercare': 2900,
      'lab_medinova': 2000
    },
    category: 'Liver',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '48 Hours'
  },
  {
    id: '99',
    name: 'Serum Procalcitonin (PCT - Sepsis Marker)',
    description: 'Specific inflammatory marker distinguishing severe bacterial sepsis from viral infection.',
    price: 2400,
    originalPrice: 3200,
    priceByLab: {
      'lab_popular': 2520,
      'lab_labaid': 2760,
      'lab_ibnsina': 2520,
      'lab_birdem': 2160,
      'lab_bsmmu': 1800,
      'lab_praava': 2880,
      'lab_evercare': 3360,
      'lab_medinova': 2400
    },
    originalPriceByLab: {
      'lab_popular': 3520,
      'lab_labaid': 3840,
      'lab_ibnsina': 3520,
      'lab_birdem': 3040,
      'lab_bsmmu': 2560,
      'lab_praava': 4000,
      'lab_evercare': 4640,
      'lab_medinova': 3200
    },
    category: 'General',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '12 Hours'
  },
  {
    id: '100',
    name: 'Anti-Thyroid Peroxidase (Anti-TPO Antibody)',
    description: 'Identifies autoimmune etiology in Hashimoto thyroiditis and primary hypothyroidism.',
    price: 1500,
    originalPrice: 2000,
    priceByLab: {
      'lab_popular': 1575,
      'lab_labaid': 1725,
      'lab_ibnsina': 1575,
      'lab_birdem': 1350,
      'lab_bsmmu': 1125,
      'lab_praava': 1800,
      'lab_evercare': 2100,
      'lab_medinova': 1500
    },
    originalPriceByLab: {
      'lab_popular': 2200,
      'lab_labaid': 2400,
      'lab_ibnsina': 2200,
      'lab_birdem': 1900,
      'lab_bsmmu': 1600,
      'lab_praava': 2500,
      'lab_evercare': 2900,
      'lab_medinova': 2000
    },
    category: 'Thyroid',
    image: 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=400',
    turnaroundTime: '24 Hours'
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

export const DEFAULT_DOCTORS_BN: Doctor[] = [
  {
    id: 'doc_1',
    name: 'অধ্যাপক ডাঃ এস. এম. রফিকুল ইসলাম',
    title: 'অধ্যাপক ডাঃ',
    specialty: 'মেডিসিন, ডায়াবেটিস ও হরমোন রোগ বিশেষজ্ঞ',
    department: 'Medicine',
    degrees: 'MBBS (DMC), FCPS (Medicine), MD, MACP (USA)',
    bmdcRegNo: 'A-28491',
    hospital: 'ঢাকা মেডিকেল কলেজ ও হাসপাতাল',
    experienceYears: 18,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 600,
    originalFee: 1000,
    discountPercent: 40,
    followupFee: 350,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    languages: ['বাংলা', 'English'],
    availableDays: ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ'],
    availableTimeText: 'প্রতিদিন বিকাল ৫:০০ - রাত ৯:০০',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: '১৮ বছরের অভিজ্ঞতাসম্পন্ন প্রখ্যাত মেডিসিন ও ডায়াবেটিস কনসালটেন্ট। জটিল রোগ নির্ণয় ও আধুনিক চিকিৎসায় বিশেষজ্ঞ।',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_2',
    name: 'ডাঃ ফাহমিদা সুলতানা',
    title: 'ডাঃ',
    specialty: 'স্ত্রীরোগ ও প্রসূতিবিদ্যা (গাইনী) বিশেষজ্ঞ ও সার্জন',
    department: 'Gynecology',
    degrees: 'MBBS (DMC), FCPS (OBGYN), MS, Fellowship (Infertility)',
    bmdcRegNo: 'A-34190',
    hospital: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU)',
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 700,
    originalFee: 1200,
    discountPercent: 41,
    followupFee: 400,
    image: 'https://images.unsplash.com/photo-1594824813589-4b77f300184b?auto=format&fit=crop&q=80&w=600',
    gender: 'female',
    languages: ['বাংলা', 'English'],
    availableDays: ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'শুক্র'],
    availableTimeText: 'সন্ধ্যা ৬:০০ - রাত ৯:৩০',
    slotIntervalMinutes: 30,
    consultationTypes: ['video'],
    about: 'মহিলাদের প্রসূতি স্বাস্থ্য, বন্ধ্যাত্ব ও জটিল গাইনী সমস্যার বিশেষজ্ঞ পরামর্শ ও টেলিমেডিসিন সেবা।',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_3',
    name: 'ডাঃ মোঃ কামরুল হাসান',
    title: 'সহকারী অধ্যাপক ডাঃ',
    specialty: 'হৃদরোগ ও রক্তচাপ (কার্ডিওলজি) বিশেষজ্ঞ',
    department: 'Cardiology',
    degrees: 'MBBS (SSMC), D-Card, MD (Cardiology), FACC (USA)',
    bmdcRegNo: 'A-39820',
    hospital: 'জাতীয় হৃদরোগ ইনস্টিটিউট ও হাসপাতাল',
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 650,
    originalFee: 1000,
    discountPercent: 35,
    followupFee: 350,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    languages: ['বাংলা', 'English'],
    availableDays: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ'],
    availableTimeText: 'প্রতিদিন রাত ৭:০০ - রাত ১০:০০',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: 'উচ্চ রক্তচাপ, হার্ট অ্যাটাক পরবর্তী পুনর্বাসন, ইসিজি/ইকো ইন্টারপ্রিটেশন ও বুক ব্যথার নির্ভরযোগ্য পরামর্শ।',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_4',
    name: 'ডাঃ তাসনিম জাহান',
    title: 'ডাঃ',
    specialty: 'শিশু ও কিশোর রোগ বিশেষজ্ঞ (Pediatrics)',
    department: 'Pediatrics',
    degrees: 'MBBS, DCH (Child Health), FCPS (Pediatrics), MRCPCH (UK)',
    bmdcRegNo: 'A-45210',
    hospital: 'ঢাকা শিশু হাসপাতাল ও ইনস্টিটিউট',
    experienceYears: 10,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 500,
    originalFee: 800,
    discountPercent: 37,
    followupFee: 300,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    gender: 'female',
    languages: ['বাংলা', 'English'],
    availableDays: ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'],
    availableTimeText: 'সকাল ১০:০০ - দুপুর ১:০০ ও বিকাল ৫:০০ - ৮:০০',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: 'নবজাতক ও শিশুদের পুষ্টি, জ্বর, কাশি, বিকাশ ও জরুরি স্বাস্থ্য সমস্যায় মমতাময়ী ও আধুনিক চিকিৎসা।',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_5',
    name: 'ডাঃ তানভীর আহমেদ',
    title: 'ডাঃ',
    specialty: 'চর্ম, যৌন ও অ্যালার্জি রোগ বিশেষজ্ঞ (Dermatology)',
    department: 'Dermatology',
    degrees: 'MBBS (DMC), DDV, MD (Dermatology & Venereology)',
    bmdcRegNo: 'A-51204',
    hospital: 'বারডেম জেনারেল হাসপাতাল',
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 550,
    originalFee: 900,
    discountPercent: 38,
    followupFee: 300,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    languages: ['বাংলা', 'English'],
    availableDays: ['শনি', 'সোম', 'বুধ', 'বৃহঃ'],
    availableTimeText: 'বিকাল ৪:৩০ - রাত ৮:৩০',
    slotIntervalMinutes: 30,
    consultationTypes: ['video'],
    about: 'চর্মরোগ, এলার্জি, চুল পড়া ও স্কিন ইনফেকশন নির্ণয় এবং আধুনিক লেজার/মেডিকেল ট্রিটমেন্ট গাইডলাইন।',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_6',
    name: 'ডাঃ শামীমা নাসরিন',
    title: 'ডাঃ',
    specialty: 'জেনারেল ফিজিশিয়ান ও প্রাথমিক স্বাস্থ্য পরামর্শ',
    department: 'General Physician',
    degrees: 'MBBS, CCD (BIRDEM), PGT (Medicine)',
    bmdcRegNo: 'A-61842',
    hospital: 'স্যার সলিমুল্লাহ মেডিকেল কলেজ (মিটফোর্ড)',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 350,
    originalFee: 600,
    discountPercent: 41,
    followupFee: 200,
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600',
    gender: 'female',
    languages: ['বাংলা', 'English'],
    availableDays: ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'],
    availableTimeText: 'প্রতিদিন সকাল ৯:০০ - রাত ১০:০০ (তাৎক্ষণিক)',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: 'জরুরি স্বাস্থ্য পরামর্শ, সিজনাল জ্বর-সর্দি, গ্যাস্ট্রিক ও দীর্ঘমেয়াদী রোগের রুটিন চেকআপ।',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_7',
    name: 'ডাঃ জহিরুল হক',
    title: 'সহযোগী অধ্যাপক ডাঃ',
    specialty: 'ব্রেইন, নার্ভ ও নিউরোলজি বিশেষজ্ঞ (Neurology)',
    department: 'Neurology',
    degrees: 'MBBS, FCPS, MD (Neurology), Fellow Interventional Neurology',
    bmdcRegNo: 'A-32109',
    hospital: 'ন্যাশনাল ইনস্টিটিউট অব নিউরোসায়েন্সেস ও হাসপাতাল',
    experienceYears: 16,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 800,
    originalFee: 1500,
    discountPercent: 46,
    followupFee: 450,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    languages: ['বাংলা', 'English'],
    availableDays: ['রবি', 'মঙ্গল', 'বৃহঃ'],
    availableTimeText: 'সন্ধ্যা ৬:০০ - রাত ৯:০০',
    slotIntervalMinutes: 30,
    consultationTypes: ['video'],
    about: 'মাথাব্যথা, মাইগ্রেন, স্ট্রোক পরবর্তী পুনর্বাসন, খিঁচুনি ও হাত-পা অবশ রোগের উন্নত পরামর্শ।',
    isActive: true,
    orderCount: 0
  }
];

export const DEFAULT_DOCTORS_EN: Doctor[] = [
  {
    id: 'doc_1',
    name: 'Prof. Dr. S. M. Rafiqul Islam',
    title: 'Prof. Dr.',
    specialty: 'Medicine, Diabetes & Hormone Specialist',
    department: 'Medicine',
    degrees: 'MBBS (DMC), FCPS (Medicine), MD, MACP (USA)',
    bmdcRegNo: 'A-28491',
    hospital: 'Dhaka Medical College & Hospital',
    experienceYears: 18,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 600,
    originalFee: 1000,
    discountPercent: 40,
    followupFee: 350,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    languages: ['Bangla', 'English'],
    availableDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    availableTimeText: 'Everyday 5:00 PM - 9:00 PM',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: 'Renowned Medicine & Diabetes Consultant with 18+ years of clinical excellence in complex diagnosis.',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_2',
    name: 'Dr. Fahmida Sultana',
    title: 'Dr.',
    specialty: 'Gynecology & Obstetrics Specialist & Surgeon',
    department: 'Gynecology',
    degrees: 'MBBS (DMC), FCPS (OBGYN), MS, Fellowship (Infertility)',
    bmdcRegNo: 'A-34190',
    hospital: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 700,
    originalFee: 1200,
    discountPercent: 41,
    followupFee: 400,
    image: 'https://images.unsplash.com/photo-1594824813589-4b77f300184b?auto=format&fit=crop&q=80&w=600',
    gender: 'female',
    languages: ['Bangla', 'English'],
    availableDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Fri'],
    availableTimeText: '6:00 PM - 9:30 PM',
    slotIntervalMinutes: 30,
    consultationTypes: ['video'],
    about: 'Expert female healthcare, maternity guidance, infertility consultation and telemedicine support.',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_3',
    name: 'Dr. Md. Kamrul Hasan',
    title: 'Asst. Prof. Dr.',
    specialty: 'Cardiology & Hypertension Specialist',
    department: 'Cardiology',
    degrees: 'MBBS (SSMC), D-Card, MD (Cardiology), FACC (USA)',
    bmdcRegNo: 'A-39820',
    hospital: 'National Heart Foundation & Hospital',
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 650,
    originalFee: 1000,
    discountPercent: 35,
    followupFee: 350,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    languages: ['Bangla', 'English'],
    availableDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    availableTimeText: '7:00 PM - 10:00 PM',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: 'Expert clinical management for blood pressure, post-cardiac event recovery, and ECG evaluation.',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_4',
    name: 'Dr. Tasnim Jahan',
    title: 'Dr.',
    specialty: 'Pediatrics & Child Health Specialist',
    department: 'Pediatrics',
    degrees: 'MBBS, DCH (Child Health), FCPS (Pediatrics), MRCPCH (UK)',
    bmdcRegNo: 'A-45210',
    hospital: 'Dhaka Shishu (Children) Hospital & Institute',
    experienceYears: 10,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 500,
    originalFee: 800,
    discountPercent: 37,
    followupFee: 300,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    gender: 'female',
    languages: ['Bangla', 'English'],
    availableDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableTimeText: '10:00 AM - 1:00 PM & 5:00 PM - 8:00 PM',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: 'Dedicated pediatric care for newborn health, infant growth, immunizations, and seasonal sickness.',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_5',
    name: 'Dr. Tanvir Ahmed',
    title: 'Dr.',
    specialty: 'Dermatology & Skin Disease Specialist',
    department: 'Dermatology',
    degrees: 'MBBS (DMC), DDV, MD (Dermatology & Venereology)',
    bmdcRegNo: 'A-51204',
    hospital: 'BIRDEM General Hospital',
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 550,
    originalFee: 900,
    discountPercent: 38,
    followupFee: 300,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    languages: ['Bangla', 'English'],
    availableDays: ['Sat', 'Mon', 'Wed', 'Thu'],
    availableTimeText: '4:30 PM - 8:30 PM',
    slotIntervalMinutes: 30,
    consultationTypes: ['video'],
    about: 'Skin allergy, acne treatment, chronic eczema, and modern medical dermatology guidance.',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_6',
    name: 'Dr. Shamima Nasrin',
    title: 'Dr.',
    specialty: 'General Physician & Primary Telecare',
    department: 'General Physician',
    degrees: 'MBBS, CCD (BIRDEM), PGT (Medicine)',
    bmdcRegNo: 'A-61842',
    hospital: 'Sir Salimullah Medical College (Mitford)',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 350,
    originalFee: 600,
    discountPercent: 41,
    followupFee: 200,
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600',
    gender: 'female',
    languages: ['Bangla', 'English'],
    availableDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableTimeText: 'Daily 9:00 AM - 10:00 PM (Instant)',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: 'Instant virtual consultation for acute symptoms, fevers, seasonal cold, and routine lab advice.',
    isActive: true,
    orderCount: 0
  },
  {
    id: 'doc_7',
    name: 'Dr. Zahirul Haque',
    title: 'Assoc. Prof. Dr.',
    specialty: 'Brain, Nerve & Neurology Specialist',
    department: 'Neurology',
    degrees: 'MBBS, FCPS, MD (Neurology), Fellow Interventional Neurology',
    bmdcRegNo: 'A-32109',
    hospital: 'National Institute of Neurosciences & Hospital',
    experienceYears: 16,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    consultationFee: 800,
    originalFee: 1500,
    discountPercent: 46,
    followupFee: 450,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    languages: ['Bangla', 'English'],
    availableDays: ['Sun', 'Tue', 'Thu'],
    availableTimeText: '6:00 PM - 9:00 PM',
    slotIntervalMinutes: 30,
    consultationTypes: ['video'],
    about: 'Expert neuro consultation for headaches, migraine, seizure disorders, and stroke rehabilitation.',
    isActive: true,
    orderCount: 0
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

export const DEFAULT_HOME_SECTIONS_ORDER: string[] = [
  'partner',
  'popularTests',
  'packages',
  'doctorAtHome',
  'doctors',
  'nursing',
  'services',
  'appDownload',
  'howItWorks'
];

export const DEFAULT_SITE_SETTINGS_BN: SiteSettings = {
  siteName: 'LabHome BD',
  siteTagline: 'বাংলাদেশের বিশ্বস্ত হোম স্যাম্পল কালেকশন ও ডিজিটাল ডায়াগনস্টিক প্ল্যাটফর্ম',
  logoUrl: '',
  logoIcon: 'FlaskConical',
  faviconUrl: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
  
  // Hero Section
  heroBadge: '🚀 বাংলাদেশের বিশ্বস্ত হোম স্যাম্পল কালেকশন সার্ভিস',
  heroTitle: 'ঘরে বসেই বিশ্বস্ত ল্যাব টেস্ট ও',
  heroTitleHighlight: 'হোম স্যাম্পল কালেকশন',
  heroDesc: 'পপুলার, ল্যাবএইড, বারডেমসহ দেশের শীর্ষ ডায়াগনস্টিক সেন্টার থেকে বিশেষজ্ঞের মাধ্যমে রক্ত সংগ্রহ ও ডিজিটাল রিপোর্ট ডেলিভারি।',
  heroBtnBook: 'টেস্ট বুক করুন',
  heroImages: [...DEFAULT_HERO_IMAGES],

  // Homepage Sections Ordering
  homeSectionsOrder: [...DEFAULT_HOME_SECTIONS_ORDER],

  // Partner Diagnostic Centers Section
  showPartnerSection: true,
  partnerBadge: 'বিশ্বস্ত ডায়াগনস্টিক নেটওয়ার্ক',
  partnerTitle: 'আমাদের অনুমোদিত ডায়াগনস্টিক পার্টনার্স',
  partnerDesc: 'ল্যাব সিলেক্ট করে সহজেই টেস্ট ও ক্যাটালগ ব্রাউজ করুন',
  partnerBtnText: 'সব দেখুন',

  // Popular Tests Section
  showPopularTestsSection: true,
  popularTestsBadge: 'জনপ্রিয় স্বাস্থ্য পরীক্ষা',
  popularTestsTitle: 'জনপ্রিয় ডায়াগনস্টিক টেস্টসমূহ',
  popularTestsDesc: 'একক টেস্টের বিস্তারিত তালিকা। অর্ডার করুন এবং দক্ষ স্যাম্পল কালেক্টরকে বাসায় ডাকুন।',
  popularTestsBtnText: 'সকল টেস্ট দেখুন (১০০+)',

  // Health Packages Section
  showPackagesSection: true,
  packagesBadge: 'বিশেষ সাশ্রয়ী প্যাকেজ',
  packagesTitle: 'এসেনশিয়াল হোম ডায়াগনস্টিক প্যাকেজ',
  packagesDesc: 'একক টেস্টের চেয়ে প্যাকেজে খরচ বাঁচান ৪০% পর্যন্ত। ৪টি টেস্টের প্রাথমিক স্ক্রিনিং থেকে ১০টি টেস্টের সম্পূর্ণ ফুল বডি চেকআপ।',
  packagesBtnText: 'সকল প্যাকেজ দেখুন',

  // Doctor Consultation & Telemedicine Section
  showDoctorsSection: true,
  doctorsBadge: '👨‍⚕️ বিশেষজ্ঞ ডাক্তার কন্সালটেন্সি ও ভিডিও চ্যাট',
  doctorsTitle: 'দেশসেরা বিশেষজ্ঞ চিকিৎসকের অনলাইন কন্সালটেন্সি',
  doctorsDesc: 'ঘরে বসেই শীর্ষ হাসপাতালের অভিজ্ঞ ডাক্তারদের সাথে ৩০ মিনিট স্লটে অ্যাপয়েন্টমেন্ট, এইচডি লাইভ ভিডিও চ্যাটিং, কনসালটেন্সি ফি পেমেন্ট ও ডিজিটাল ই-প্রেসক্রিপশন সেবা।',
  doctorsBtnText: 'সকল বিশেষজ্ঞ ডাক্তার',
  doctorsEmergencyHotline: '09612-000000',

  // Doctor at Home (বাসায় ডাক্তার সেবা) Section
  showDoctorAtHomeSection: true,
  isDoctorAtHomeActive: true,
  doctorAtHomeBadge: '🚑 Doctor at Home সেবা',
  doctorAtHomeTitle: 'হাসপাতালে লাইন না ধরে ঘরে বসেই বিশেষজ্ঞ ডাক্তার দেখান',
  doctorAtHomeDesc: 'প্রবীণ সদস্য, অসুস্থ শিশু কিংবা তীব্র শারীরিক জটিলতায় বিএমডিসি রেজিস্টার্ড অভিজ্ঞ চিকিৎসকরা সরাসরি আপনার বাড়ি বা অফিসে গিয়ে সম্পূর্ণ শারীরিক পরীক্ষা ও চিকিৎসা প্রদান করেন।',
  doctorAtHomeFee: 1200,
  doctorAtHomeHotline: '09612-000000',

  // Nursing & Care Section
  showNursingSection: true,
  nursingBadge: 'হোম নার্সিং ও পেশেন্ট কেয়ার',
  nursingTitle: 'প্রফেশনাল নার্সিং ও হোম কেয়ার সার্ভিস',
  nursingDesc: 'দক্ষ রেজিস্টার্ড নার্স ও কেয়ারগিভারের মাধ্যমে আপনার প্রিয়জনের জন্য বাসায় বিশেষায়িত সেবা, পোস্ট-সার্জারি কেয়ার ও স্বাস্থ্য পরিচর্যা।',
  nursingHotline: '09612-000000',
  nursingWhatsApp: '01700000000',
  nursingServices: DEFAULT_NURSING_SERVICES_BN,

  // Mobile App Download Section
  showAppDownloadSection: true,
  appSectionBadge: '📱 গুগল প্লে ও অ্যাপ স্টোর',
  appSectionTitle: 'আমাদের মোবাইল অ্যাপ ডাউনলোড করুন',
  appSectionDesc: 'যে কোনো সময়, যে কোনো স্থান থেকে মাত্র এক ক্লিকে ল্যাব টেস্ট বুক করুন, প্রেসক্রিপশন আপলোড করুন এবং তাৎক্ষণিক রিপোর্ট নোটিফিকেশন পান।',
  androidAppUrl: 'https://play.google.com/store/apps/details?id=com.eclinicbd.app',
  iosAppUrl: 'https://apps.apple.com/app/eclinic-bd/id123456789',
  apkDownloadUrl: 'https://eclinicbd.com/download/eclinic-latest.apk',
  appDownloadCount: '৫০,০০০+ ডাউনলোড',
  appRating: '৪.৮ ★ (৫,০০০+ রিভিউ)',
  showAppButtonsInHero: true,
  showAppButtonsInFooter: true,

  // How It Works / Steps
  showHowItWorksSection: true,
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
  showServicesSection: true,
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
  linkedinUrl: 'https://linkedin.com/company/labhomebd',
  youtubeUrl: 'https://youtube.com/@labhomebd',
  instagramUrl: 'https://instagram.com/labhomebd',
  services: DEFAULT_SERVICES_BN,

  // Invoice & Money Receipt Defaults
  invoiceLogoUrl: '/icon.svg',
  invoiceOrgName: 'eClinic Bangladesh',
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
  faviconUrl: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',

  // Hero Section
  heroBadge: '🚀 Trusted Home Sample Collection Service in BD',
  heroTitle: 'Reliable Lab Tests Done at Home &',
  heroTitleHighlight: 'Doorstep Sample Collection',
  heroDesc: 'Book certified lab diagnostics from Popular, Labaid, BIRDEM & get fast digital reports delivered directly to your device.',
  heroBtnBook: 'Book Test Now',
  heroImages: [...DEFAULT_HERO_IMAGES],

  // Homepage Sections Ordering
  homeSectionsOrder: [...DEFAULT_HOME_SECTIONS_ORDER],

  // Partner Diagnostic Centers Section
  showPartnerSection: true,
  partnerBadge: 'Trusted Diagnostic Network',
  partnerTitle: 'Accredited Diagnostic Lab Partners',
  partnerDesc: 'Select any partner lab to explore tests and diagnostic packages',
  partnerBtnText: 'View All',

  // Popular Tests Section
  showPopularTestsSection: true,
  popularTestsBadge: 'Popular Diagnostics',
  popularTestsTitle: 'Popular Diagnostic Tests',
  popularTestsDesc: 'Browse individual diagnostics with certified blood collection right at your home.',
  popularTestsBtnText: 'Browse All 100+ Tests',

  // Health Packages Section
  showPackagesSection: true,
  packagesBadge: 'Special Value Bundles',
  packagesTitle: 'Essential Home Diagnostic Packages',
  packagesDesc: 'Save up to 40% on standard packages. From 4-test routine screenings to 10-test full body diagnostic panels.',
  packagesBtnText: 'Explore All Packages',

  // Doctor Consultation & Telemedicine Section
  showDoctorsSection: true,
  doctorsBadge: '👨‍⚕️ Expert Doctor Consultation & Video Chat',
  doctorsTitle: 'Online Consultation with Top Specialist Doctors',
  doctorsDesc: 'Book 30-minute virtual appointments, join HD live video chats, pay consultation fees online, and receive digital e-prescriptions with test advice from leading hospital specialists.',
  doctorsBtnText: 'View All Doctors',
  doctorsEmergencyHotline: '09612-000000',

  // Doctor at Home (Home Doctor Visit) Section
  showDoctorAtHomeSection: true,
  isDoctorAtHomeActive: true,
  doctorAtHomeBadge: '🚑 Doctor at Home Service',
  doctorAtHomeTitle: 'Consult Specialist Doctors Directly at Your Home',
  doctorAtHomeDesc: 'Certified BMDC registered doctors visit your residence for comprehensive physical checkups, vitals monitoring, and authorized medical prescriptions.',
  doctorAtHomeFee: 1200,
  doctorAtHomeHotline: '09612-000000',

  // Nursing & Care Section
  showNursingSection: true,
  nursingBadge: 'Home Nursing & Care',
  nursingTitle: 'Professional Nursing & Home Care Services',
  nursingDesc: 'Certified registered nurses and compassionate caregivers providing clinical home care, post-surgery recovery, and elderly support.',
  nursingHotline: '09612-000000',
  nursingWhatsApp: '01700000000',
  nursingServices: DEFAULT_NURSING_SERVICES_EN,

  // Mobile App Download Section
  showAppDownloadSection: true,
  appSectionBadge: '📱 Google Play & App Store',
  appSectionTitle: 'Download Our Official Mobile App',
  appSectionDesc: 'Book home blood tests in seconds, upload prescriptions, track phlebotomist arrival in real-time and access lifetime digital reports.',
  androidAppUrl: 'https://play.google.com/store/apps/details?id=com.eclinicbd.app',
  iosAppUrl: 'https://apps.apple.com/app/eclinic-bd/id123456789',
  apkDownloadUrl: 'https://eclinicbd.com/download/eclinic-latest.apk',
  appDownloadCount: '50,000+ Downloads',
  appRating: '4.8 ★ (5,000+ Reviews)',
  showAppButtonsInHero: true,
  showAppButtonsInFooter: true,

  // How It Works / Steps
  showHowItWorksSection: true,
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
  showServicesSection: true,
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
  linkedinUrl: 'https://linkedin.com/company/labhomebd',
  youtubeUrl: 'https://youtube.com/@labhomebd',
  instagramUrl: 'https://instagram.com/labhomebd',
  services: DEFAULT_SERVICES_EN,

  // Invoice & Money Receipt Defaults
  invoiceLogoUrl: '/icon.svg',
  invoiceOrgName: 'eClinic Bangladesh',
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

export const getDoctors = (lang: Language): Doctor[] => {
  return lang === 'en' ? DEFAULT_DOCTORS_EN : DEFAULT_DOCTORS_BN;
};

// Backwards compatibility for existing imports (default to Bangla)
export const POPULAR_TESTS = TESTS_BN;
export const PARTNER_LABS = LABS_BN;

