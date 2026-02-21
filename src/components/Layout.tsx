import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Post, SliderImage, SiteSettings } from '../types';
import { Search, Menu, X, Phone, Mail, Facebook, Instagram, Youtube, MessageCircle, ExternalLink, Shield, FileText, Lock, ChevronLeft, ChevronRight, Pin, Trash2, Plus, Edit, Save, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation, Routes, Route, useParams } from 'react-router-dom';
import { cn } from '../utils';

// --- Components ---

const Header = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold font-serif tracking-tight text-zinc-900">
            Bibidh Bhandara
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-full text-sm focus:ring-2 focus:ring-zinc-200 transition-all"
              />
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-zinc-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t border-zinc-100 p-4"
          >
            <div className="relative w-full mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-full text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Footer = ({ settings }: { settings: SiteSettings | null }) => {
  if (!settings) return null;

  return (
    <footer className="bg-zinc-900 text-zinc-400 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-white font-serif text-xl mb-4">Bibidh Bhandara</h3>
          <p className="text-sm leading-relaxed mb-6">
            {settings.footerDescription}
          </p>
          <div className="flex gap-4">
            <a href={settings.socialLinks?.facebook} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Facebook size={20} /></a>
            <a href={settings.socialLinks?.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href={settings.socialLinks?.tiktok} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><MessageCircle size={20} /></a>
            <a href={settings.socialLinks?.youtube} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Youtube size={20} /></a>
            <a href={settings.socialLinks?.threads} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Lock size={20} /></a>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Contact Info</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone size={16} /> {settings.phone}
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} /> {settings.email}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>© 2026 <a href="https://www.bibidhb.com.np" target="_blank" rel="noreferrer" className="hover:text-white">Bibidh</a> <Link to="/admin" className="hover:text-white">Bhandara</Link></p>
        <p>All rights reserved.</p>
      </div>
    </footer>
  );
};

const HeroSlider = ({ images }: { images: SliderImage[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full aspect-hero overflow-hidden bg-zinc-200 rounded-2xl shadow-lg">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[current].id}
          src={images[current].imageUrl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full object-cover"
          alt="Hero"
        />
      </AnimatePresence>
      
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  current === i ? "bg-white w-6" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-zinc-100"
    >
      <Link to={`/post/${post.id}`} className="block relative aspect-video overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {post.isPinned && (
          <div className="absolute top-3 right-3 bg-zinc-900 text-white p-1.5 rounded-full shadow-lg">
            <Pin size={14} className="fill-current" />
          </div>
        )}
      </Link>
      <div className="p-5">
        <Link to={`/post/${post.id}`} className="block">
          <h3 className="text-lg font-semibold text-zinc-900 mb-2 group-hover:text-zinc-600 transition-colors line-clamp-1">
            {post.title}
          </h3>
        </Link>
        <p className="text-zinc-500 text-sm line-clamp-2 mb-4">
          {post.description}
        </p>
        <div className="flex items-center justify-between">
          <Link
            to={`/post/${post.id}`}
            className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            Read More
          </Link>
          <a
            href={post.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded-full transition-all"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export { Header, Footer, HeroSlider, PostCard };
