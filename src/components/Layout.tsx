import React from 'react';

export const Header = () => (
  <header className="syf-header no-print">
    <div className="max-w-[1140px] mx-auto w-full flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img src="https://www.synchrony.com/syc/img/2023_synchrony_basic_logo.svg" alt="Synchrony" className="h-8" />
        <div className="h-6 w-px bg-line hidden md:block"></div>
        <div className="text-syf-navy font-bold tracking-tight hidden md:block uppercase text-sm">Partner Center</div>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-syf-navy font-bold text-xs uppercase tracking-wider hover:opacity-70 transition-opacity hidden sm:block">Financing</button>
        <button className="text-syf-navy font-bold text-xs uppercase tracking-wider hover:opacity-70 transition-opacity hidden sm:block">Banking</button>
        <button className="text-syf-navy font-bold text-xs uppercase tracking-wider hover:opacity-70 transition-opacity hidden lg:block">Learning Center</button>
        <button className="bg-syf-navy text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-syf-navy/90 transition-colors">Log In</button>
      </div>
    </div>
  </header>
);

export const Footer = () => (
  <footer className="syf-footer no-print">
    <div className="max-w-[1140px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-1">
        <img src="https://www.synchrony.com/syc/img/synchrony_logo.svg" alt="Synchrony" className="h-6 mb-8" />
        <div className="flex gap-4 mb-8">
          {['Facebook', 'YouTube', 'Instagram', 'LinkedIn', 'Twitter'].map(social => (
            <div key={social} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-white/10">{social[0]}</div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-syf-gold">About Us</h4>
        <ul className="space-y-2 text-sm opacity-80">
          <li>Company Overview</li>
          <li>Our Brands</li>
          <li>Careers</li>
          <li>Newsroom</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-syf-gold">Partner With Us</h4>
        <ul className="space-y-2 text-sm opacity-80">
          <li>Retailers</li>
          <li>Health & Wellness</li>
          <li>Providers</li>
          <li>Developers</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-syf-gold">Support</h4>
        <ul className="space-y-2 text-sm opacity-80">
          <li>Contact Us</li>
          <li>Help Center</li>
          <li>Privacy Policy</li>
          <li>Terms of Use</li>
        </ul>
      </div>
    </div>
    <div className="max-w-[1140px] mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest opacity-60">
      <div>&copy; {new Date().getFullYear()} Synchrony Bank. All Rights Reserved.</div>
      <div className="flex gap-6 mt-4 md:mt-0">
        <span>Member FDIC</span>
        <span>Equal Housing Lender</span>
      </div>
    </div>
  </footer>
);
