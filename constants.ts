
import { TestPackage, LabPartner, Language } from './types';

const TESTS_BN: TestPackage[] = [
  {
    id: '1',
    name: 'কমপ্লিট ব্লাড কাউন্ট (CBC)',
    description: 'রক্তের সার্বিক অবস্থা এবং সংক্রমণ বা রক্তস্বল্পতা নির্ণয়ের জন্য।',
    price: 450,
    priceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_birdem': 400,
      'lab_bsmmu': 300
    },
    category: 'General',
    image: 'https://picsum.photos/id/10/400/300',
    turnaroundTime: '১২ ঘন্টা'
  },
  {
    id: '2',
    name: 'ডায়াবেটিস চেকআপ (HbA1c)',
    description: 'গত ৩ মাসের গড় ব্লাড সুগার নির্ণয়।',
    price: 850,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1000,
      'lab_birdem': 700,
      'lab_bsmmu': 600
    },
    category: 'Diabetes',
    image: 'https://picsum.photos/id/20/400/300',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '3',
    name: 'লিপিড প্রোফাইল',
    description: 'কোলেস্টেরল এবং হার্টের ঝুঁকি বোঝার জন্য।',
    price: 1200,
    priceByLab: {
      'lab_popular': 1400,
      'lab_labaid': 1500,
      'lab_birdem': 1000,
      'lab_bsmmu': 800
    },
    category: 'Heart',
    image: 'https://picsum.photos/id/30/400/300',
    turnaroundTime: '২৪ ঘন্টা'
  },
  {
    id: '4',
    name: 'থাইরয়েড প্রোফাইল (T3, T4, TSH)',
    description: 'থাইরয়েড হরমোনের ভারসাম্য পরীক্ষার জন্য।',
    price: 1500,
    priceByLab: {
      'lab_popular': 1800,
      'lab_labaid': 2000,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000
    },
    category: 'Thyroid',
    image: 'https://picsum.photos/id/40/400/300',
    turnaroundTime: '৪৮ ঘন্টা'
  },
  {
    id: '5',
    name: 'ভিটামিন ডি টেস্ট',
    description: 'হাড়ের শক্তি এবং ইমিউন সিস্টেমের জন্য।',
    price: 2500,
    priceByLab: {
      'lab_popular': 3000,
      'lab_labaid': 3200,
      'lab_birdem': 2200,
      'lab_bsmmu': 1800
    },
    category: 'Vitamin',
    image: 'https://picsum.photos/id/50/400/300',
    turnaroundTime: '৩ দিন'
  },
  {
    id: '6',
    name: 'কিডনি ফাংশন টেস্ট',
    description: 'কিডনির কার্যকারিতা (Creatinine, Urea) যাচাই।',
    price: 900,
    priceByLab: {
      'lab_popular': 1100,
      'lab_labaid': 1200,
      'lab_birdem': 800,
      'lab_bsmmu': 600
    },
    category: 'General',
    image: 'https://picsum.photos/id/60/400/300',
    turnaroundTime: '১০ ঘন্টা'
  }
];

const TESTS_EN: TestPackage[] = [
  {
    id: '1',
    name: 'Complete Blood Count (CBC)',
    description: 'To assess overall blood health and detect infection or anemia.',
    price: 450,
    priceByLab: {
      'lab_popular': 550,
      'lab_labaid': 600,
      'lab_birdem': 400,
      'lab_bsmmu': 300
    },
    category: 'General',
    image: 'https://picsum.photos/id/10/400/300',
    turnaroundTime: '12 Hours'
  },
  {
    id: '2',
    name: 'Diabetes Checkup (HbA1c)',
    description: 'Determines average blood sugar over the last 3 months.',
    price: 850,
    priceByLab: {
      'lab_popular': 950,
      'lab_labaid': 1000,
      'lab_birdem': 700,
      'lab_bsmmu': 600
    },
    category: 'Diabetes',
    image: 'https://picsum.photos/id/20/400/300',
    turnaroundTime: '24 Hours'
  },
  {
    id: '3',
    name: 'Lipid Profile',
    description: 'To understand cholesterol levels and heart risk.',
    price: 1200,
    priceByLab: {
      'lab_popular': 1400,
      'lab_labaid': 1500,
      'lab_birdem': 1000,
      'lab_bsmmu': 800
    },
    category: 'Heart',
    image: 'https://picsum.photos/id/30/400/300',
    turnaroundTime: '24 Hours'
  },
  {
    id: '4',
    name: 'Thyroid Profile (T3, T4, TSH)',
    description: 'To check thyroid hormone balance.',
    price: 1500,
    priceByLab: {
      'lab_popular': 1800,
      'lab_labaid': 2000,
      'lab_birdem': 1200,
      'lab_bsmmu': 1000
    },
    category: 'Thyroid',
    image: 'https://picsum.photos/id/40/400/300',
    turnaroundTime: '48 Hours'
  },
  {
    id: '5',
    name: 'Vitamin D Test',
    description: 'For bone strength and immune system.',
    price: 2500,
    priceByLab: {
      'lab_popular': 3000,
      'lab_labaid': 3200,
      'lab_birdem': 2200,
      'lab_bsmmu': 1800
    },
    category: 'Vitamin',
    image: 'https://picsum.photos/id/50/400/300',
    turnaroundTime: '3 Days'
  },
  {
    id: '6',
    name: 'Kidney Function Test',
    description: 'Checks kidney function (Creatinine, Urea).',
    price: 900,
    priceByLab: {
      'lab_popular': 1100,
      'lab_labaid': 1200,
      'lab_birdem': 800,
      'lab_bsmmu': 600
    },
    category: 'General',
    image: 'https://picsum.photos/id/60/400/300',
    turnaroundTime: '10 Hours'
  }
];

const LABS_BN: LabPartner[] = [
  { id: 'lab_popular', name: 'পপুলার ডায়াগনস্টিক সেন্টার লিঃ', rating: 4.8, logo: 'https://picsum.photos/id/100/100/100', serviceCharge: 200 },
  { id: 'lab_labaid', name: 'ল্যাবএইড ডায়াগনস্টিক সেন্টার', rating: 4.9, logo: 'https://picsum.photos/id/101/100/100', serviceCharge: 250 },
  { id: 'lab_birdem', name: 'বারডেম জেনারেল হাসপাতাল', rating: 4.7, logo: 'https://picsum.photos/id/102/100/100', serviceCharge: 150 },
  { id: 'lab_bsmmu', name: 'বিএসএমএমইউ (পিজি হাসপাতাল)', rating: 4.6, logo: 'https://picsum.photos/id/103/100/100', serviceCharge: 100 }
];

const LABS_EN: LabPartner[] = [
  { id: 'lab_popular', name: 'Popular Diagnostic Centre Ltd.', rating: 4.8, logo: 'https://picsum.photos/id/100/100/100', serviceCharge: 200 },
  { id: 'lab_labaid', name: 'Labaid Diagnostics Center', rating: 4.9, logo: 'https://picsum.photos/id/101/100/100', serviceCharge: 250 },
  { id: 'lab_birdem', name: 'BIRDEM General Hospital', rating: 4.7, logo: 'https://picsum.photos/id/102/100/100', serviceCharge: 150 },
  { id: 'lab_bsmmu', name: 'BSMMU (PG)', rating: 4.6, logo: 'https://picsum.photos/id/103/100/100', serviceCharge: 100 }
];

export const getTests = (lang: Language): TestPackage[] => {
  return lang === 'en' ? TESTS_EN : TESTS_BN;
};

export const getLabs = (lang: Language): LabPartner[] => {
  return lang === 'en' ? LABS_EN : LABS_BN;
};

// Backwards compatibility for existing imports (default to Bangla)
export const POPULAR_TESTS = TESTS_BN;
export const PARTNER_LABS = LABS_BN;
