import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { db } from './firebase';
import { SiteSettings } from './types';
import { Header, Footer } from './components/Layout';
import { Home, PostDetails, LegalPage, AdminPanel } from './pages/Main';

const DEFAULT_SETTINGS: SiteSettings = {
  footerDescription: "Showcasing professional web solutions crafted for diverse clients. Focused on clean design, performance, and user experience.",
  phone: "9767253742",
  email: "bibidhbhandaraxettri@gmail.com",
  adminPassword: "Bibidh",
  socialLinks: {
    facebook: "https://www.facebook.com/bibidh.bhandara.xettri",
    instagram: "https://www.instagram.com/golu_bbe_1",
    tiktok: "https://www.tiktok.com/@melody_golu",
    youtube: "https://youtube.com/@bibidh_bhandara",
    threads: "https://www.threads.com/@golu_bbe_1"
  }
};

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Merge with defaults to ensure missing fields (like socialLinks) are present
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...data,
          socialLinks: {
            ...DEFAULT_SETTINGS.socialLinks,
            ...(data.socialLinks || {})
          }
        };
        setSettings(mergedSettings);
      } else {
        // Initialize default settings if none exist
        set(settingsRef, DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      }
    });
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header onSearch={setSearchQuery} />
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home searchQuery={searchQuery} />} />
            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/admin" element={<AdminPanel settings={settings} />} />
            <Route path="/terms" element={<LegalPage title="Terms & Conditions" content={`Welcome to Bibidh Bhandara's portfolio. By accessing this website, you agree to these terms.

1. Intellectual Property
The content, designs, and code showcased here are the property of Bibidh Bhandara or his clients. Unauthorized reproduction is prohibited.

2. Links to Third-Party Sites
This website contains links to client websites. We are not responsible for the content or practices of these external sites.

3. Disclaimer
The portfolio is provided "as is" for demonstration purposes. While we strive for accuracy, we do not guarantee that all information is up-to-date.

4. Changes to Terms
We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of the new terms.`} />} />
            <Route path="/privacy" element={<LegalPage title="Privacy Policy" content={`Your privacy is important to us. This policy explains how we handle information.

1. Information Collection
We do not collect personal data from regular visitors. If you contact us via email, we use your address only to respond to your inquiry.

2. Cookies
We may use basic session cookies to improve your browsing experience. These do not track personal information.

3. Data Security
We implement standard security measures to protect the integrity of this website and its data.

4. Contact
If you have questions about this policy, please contact us at bibidhbhandaraxettri@gmail.com.`} />} />
          </Routes>
        </div>

        <Footer settings={settings} />
      </div>
    </Router>
  );
}
