
import React, { useState, useEffect } from 'react';
import { getTests, getLabs } from './constants';
import { TestPackage, Language } from './types';
import { TRANSLATIONS } from './translations';
import { TestCard } from './components/TestCard';
import { BookingModal } from './components/BookingModal';
import { AIAssistant } from './components/AIAssistant';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import { Search, FlaskConical, Phone, Menu, Activity, Home, User, Globe, ShoppingCart, ChevronRight, Check, ShieldCheck, Filter, ArrowUpDown, Trash2, ShoppingBag } from 'lucide-react';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&q=80&w=800"
];

const CATEGORIES = ['All', 'General', 'Diabetes', 'Heart', 'Thyroid', 'Vitamin'];

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'admin'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated login state
  const [cart, setCart] = useState<string[]>([]); // Array of Test IDs
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  // Default to the first lab (Popular) instead of empty
  const [selectedLabId, setSelectedLabId] = useState<string>('lab_popular');

  const t = TRANSLATIONS[language];
  const allTests = getTests(language);
  const allLabs = getLabs(language);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'bn' ? 'en' : 'bn');
  };

  const toggleCart = (test: TestPackage) => {
    setCart(prev => {
      if (prev.includes(test.id)) {
        return prev.filter(id => id !== test.id);
      } else {
        return [...prev, test.id];
      }
    });
  };

  const addToCart = (test: TestPackage) => {
    setCart(prev => {
      if (!prev.includes(test.id)) {
        return [...prev, test.id];
      }
      return prev;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(itemId => itemId !== id));
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const openCartModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleLoginToggle = () => {
    if (isLoggedIn) {
      setCurrentView('dashboard');
    } else {
      setIsLoggedIn(true);
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('home');
  };

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
         // wait for render
         if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
         else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const filteredTests = allTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || test.category === activeCategory;
    const matchesLab = selectedLabId === '' || true; // Visual logic handled in card
    return matchesSearch && matchesCategory && matchesLab;
  });

  // Get full objects for selected tests
  const cartItems = allTests.filter(test => cart.includes(test.id));
  
  // Calculate total bill - if specific lab selected, use that price, otherwise default
  // Plus Service Charge if Lab is selected
  const selectedLab = allLabs.find(l => l.id === selectedLabId);
  const serviceCharge = selectedLab ? selectedLab.serviceCharge : 0;

  const subTotal = cartItems.reduce((sum, item) => {
    if (selectedLabId && item.priceByLab && item.priceByLab[selectedLabId]) {
      return sum + item.priceByLab[selectedLabId];
    }
    return sum + item.price;
  }, 0);

  const totalBill = subTotal + (cartItems.length > 0 ? serviceCharge : 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0 relative">
      
      {/* Navbar - Hide in Admin Mode */}
      {currentView !== 'admin' && (
        <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
                <div className="bg-primary p-2 rounded-lg">
                  <FlaskConical className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  {t.appTitle}
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-4 text-sm font-medium text-slate-600">
                <button onClick={() => scrollToSection('home')} className="hover:text-primary transition-colors">{t.navHome}</button>
                <button onClick={() => scrollToSection('tests')} className="hover:text-primary transition-colors">{t.navTests}</button>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors">{t.navHowItWorks}</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">{t.navContact}</button>

                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 hover:border-primary hover:text-primary transition-all"
                >
                  <Globe size={16} />
                  <span className="uppercase text-xs font-bold">{language}</span>
                </button>
                
                {/* Login / Dashboard Button */}
                <button 
                  onClick={handleLoginToggle}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${
                    isLoggedIn 
                      ? 'bg-sky-50 text-primary border border-sky-100' 
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <User size={18} />
                  <span>{isLoggedIn ? 'Profile' : t.navLogin}</span>
                </button>

                <Button onClick={() => scrollToSection('tests')} variant="primary" className="!py-1.5 !px-4 relative">
                  {t.navAppointment}
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cart.length}
                    </span>
                  )}
                </Button>
              </div>

              <div className="md:hidden flex items-center gap-4">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                >
                  <Globe size={18} />
                  <span className="uppercase text-xs font-bold">{language}</span>
                </button>
                <button onClick={handleLoginToggle} className="p-2 text-slate-600">
                   <User size={24} className={isLoggedIn ? 'text-primary' : ''} />
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* CONDITIONAL RENDERING: ADMIN vs DASHBOARD vs HOME */}
      {currentView === 'admin' ? (
        <AdminDashboard lang={language} onLogout={() => setCurrentView('home')} />
      ) : currentView === 'dashboard' ? (
        <UserDashboard lang={language} onLogout={handleLogout} />
      ) : (
        <>
          {/* Hero Section */}
          <section id="home" className="relative overflow-hidden bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-white z-0"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                  <span className="inline-block py-1 px-3 rounded-full bg-sky-100 text-primary text-sm font-bold mb-4 border border-sky-200">
                    {t.heroBadge}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold text-secondary leading-tight mb-6">
                    {t.heroTitle} <br/><span className="text-primary">{t.heroTitleHighlight}</span>
                  </h1>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                    {t.heroDesc}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Button onClick={() => scrollToSection('tests')} className="px-8 py-4 text-lg shadow-lg shadow-sky-200">
                      {t.heroBtnBook}
                    </Button>
                    <button className="px-8 py-4 text-lg font-medium text-slate-600 hover:text-primary flex items-center justify-center gap-2 transition-colors">
                      <Phone size={20} /> 01700-000000
                    </button>
                  </div>
                </div>
                
                {/* Image Slider */}
                <div className="relative h-[400px] w-full max-w-md mx-auto md:ml-auto">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl transform translate-x-10 translate-y-10"></div>
                  
                  <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                    {HERO_IMAGES.map((img, index) => (
                        <img 
                          key={index}
                          src={img} 
                          alt="Lab Service" 
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            index === currentHeroImage ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                    ))}
                    
                    {/* Slider Indicators */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {HERO_IMAGES.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setCurrentHeroImage(idx)}
                            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentHeroImage ? 'w-6 bg-primary' : 'w-2 bg-white/70 hover:bg-white'}`} 
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN TESTS SECTION - 3 COLUMNS */}
          <section id="tests" className="py-12 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <h2 className="text-3xl font-bold text-slate-800 mb-8">{t.sectionTestsTitle}</h2>

              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* LEFT SIDEBAR: FILTERS */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                  
                  {/* Lab Filter */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Filter size={18} /> {t.filterByCenter}
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!selectedLabId ? 'border-primary' : 'border-slate-300'}`}>
                           {!selectedLabId && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                        </div>
                        <input type="radio" className="hidden" checked={!selectedLabId} onChange={() => setSelectedLabId('')} />
                        <span className={`text-sm ${!selectedLabId ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-primary'}`}>{t.allCenters}</span>
                      </label>
                      {allLabs.map(lab => (
                        <label key={lab.id} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedLabId === lab.id ? 'border-primary' : 'border-slate-300'}`}>
                              {selectedLabId === lab.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                           </div>
                           <input type="radio" className="hidden" checked={selectedLabId === lab.id} onChange={() => setSelectedLabId(lab.id)} />
                           <span className={`text-sm ${selectedLabId === lab.id ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-primary'}`}>{lab.name.split(' ')[0]}...</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Filter size={18} /> {t.filterByCategory}
                    </h3>
                    <div className="space-y-3">
                      {CATEGORIES.map(cat => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${activeCategory === cat ? 'border-teal-500' : 'border-slate-300'}`}>
                              {activeCategory === cat && <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />}
                           </div>
                           <input type="radio" className="hidden" checked={activeCategory === cat} onChange={() => setActiveCategory(cat)} />
                           {/* @ts-ignore */}
                           <span className={`text-sm ${activeCategory === cat ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-teal-600'}`}>{t.categories[cat]}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

                {/* CENTER: SEARCH & GRID */}
                <div className="flex-1">
                  
                  {/* Search Bar Row */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                      <input 
                        type="text"
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-700 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 flex items-center gap-2 hover:bg-slate-50">
                      <ArrowUpDown size={18} /> <span className="hidden sm:inline">Default</span>
                    </button>
                  </div>

                  {/* Test Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTests.map(test => (
                      <div key={test.id} className="h-full">
                        <TestCard 
                          test={test} 
                          onToggleCart={toggleCart} 
                          isInCart={cart.includes(test.id)}
                          lang={language} 
                          labName={selectedLabId ? allLabs.find(l => l.id === selectedLabId)?.name : t.allCenters}
                          selectedLabId={selectedLabId}
                        />
                      </div>
                    ))}
                  </div>

                   {filteredTests.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                      <p className="text-slate-500">{t.noTestsFound}</p>
                    </div>
                  )}

                </div>

                {/* RIGHT: SELECTED TESTS (CART) */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-24">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <ShoppingBag size={20} className="text-primary" /> {t.selectedTests} ({cart.length})
                    </h3>
                    
                    {cartItems.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <FlaskConical size={48} className="mx-auto text-slate-300 mb-3 opacity-50" />
                        <p className="text-sm text-slate-400">{t.noTestsSelected}</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-sky-200 transition-colors">
                              <div>
                                <p className="text-sm font-bold text-slate-800 line-clamp-2">{item.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{selectedLabId ? (item.priceByLab?.[selectedLabId] || item.price) : item.price} ৳</p>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-slate-100 pt-4 space-y-2">
                           <div className="flex justify-between text-sm text-slate-500">
                             <span>{t.cartSubtotal}</span>
                             <span>৳ {subTotal}</span>
                           </div>
                           {serviceCharge > 0 && (
                            <div className="flex justify-between text-sm text-slate-500">
                              <span>{t.serviceCharge}</span>
                              <span>৳ {serviceCharge}</span>
                            </div>
                           )}
                           <div className="flex justify-between text-lg font-bold text-slate-800 pt-2">
                             <span>{t.cartTotal}</span>
                             <span className="text-primary">৳ {totalBill}</span>
                           </div>
                           
                           <Button onClick={openCartModal} fullWidth className="mt-4 !rounded-xl">
                             {t.checkoutBtn}
                           </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Features / How it Works */}
          <section id="how-it-works" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-secondary mb-4">{t.sectionHowTitle}</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { 
                    icon: <Search className="w-8 h-8 text-primary" />, 
                    title: t.step1Title, 
                    desc: t.step1Desc 
                  },
                  { 
                    icon: <Home className="w-8 h-8 text-primary" />, 
                    title: t.step2Title, 
                    desc: t.step2Desc 
                  },
                  { 
                    icon: <Activity className="w-8 h-8 text-primary" />, 
                    title: t.step3Title, 
                    desc: t.step3Desc 
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="p-8 bg-slate-50 rounded-2xl text-center hover:bg-sky-50 transition-colors duration-300">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* App Bar for Mobile (Bottom Navigation) - Only on Home View */}
      {currentView === 'home' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex justify-around py-3 pb-safe">
          <button onClick={() => scrollToSection('home')} className={`flex flex-col items-center ${currentView === 'home' ? 'text-primary' : 'text-slate-500'}`}>
            <Home size={24} />
            <span className="text-[10px] font-medium mt-1">{t.navHome}</span>
          </button>
          <button onClick={() => scrollToSection('tests')} className="flex flex-col items-center text-slate-500 hover:text-primary">
            <FlaskConical size={24} />
            <span className="text-[10px] font-medium mt-1">{t.navTests}</span>
          </button>
          <button 
            onClick={openCartModal} 
            className={`flex flex-col items-center ${cart.length > 0 ? 'text-primary' : 'text-slate-500'} hover:text-primary relative`}
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">Cart</span>
          </button>
        </div>
      )}

      {/* Components */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        lang={language}
        preSelectedLabId={selectedLabId}
        onClearCart={clearCart}
        allTests={allTests}
        onAddTest={addToCart}
      />
      
      {currentView !== 'admin' && <AIAssistant lang={language} />}
      
      {/* Footer */}
      {currentView !== 'dashboard' && currentView !== 'admin' && (
        <footer id="contact" className="bg-secondary text-slate-400 py-12 pb-24 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 text-center md:text-left grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="bg-primary p-1.5 rounded">
                  <FlaskConical className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-white">{t.appTitle}</span>
              </div>
              <p className="text-sm">{t.footerDesc}</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t.footerServices}</h4>
              <ul className="space-y-2 text-sm">
                <li>{t.footerLinks.labTest}</li>
                <li>{t.footerLinks.doctor}</li>
                <li>{t.footerLinks.healthPkg}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t.footerCompany}</h4>
              <ul className="space-y-2 text-sm">
                <li>{t.footerLinks.about}</li>
                <li>{t.footerLinks.privacy}</li>
                <li>{t.footerLinks.terms}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t.footerContact}</h4>
              <ul className="space-y-2 text-sm">
                <li>House #12, Road #5, Dhanmondi, Dhaka</li>
                <li>support@labhomebd.com</li>
                <li>+880 1700 000000</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2024 LabHome BD. All rights reserved.</p>
            <button onClick={() => setCurrentView('admin')} className="text-slate-600 hover:text-white flex items-center gap-1">
               <ShieldCheck size={12} /> Admin Login
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
