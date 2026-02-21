import React, { useState, useEffect } from 'react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { Post, SliderImage, SiteSettings } from '../types';
import { Header, Footer, HeroSlider, PostCard } from '../components/Layout';
import { Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ExternalLink, ArrowLeft, Shield, FileText, Lock, Save, Trash2, Plus, Pin, LogOut, Edit } from 'lucide-react';
import { cn } from '../utils';

// --- Pages ---

const Home = ({ searchQuery }: { searchQuery: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const sliderRef = ref(db, 'slider');

    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val,
        }));
        setPosts(postList.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.createdAt - a.createdAt;
        }));
      } else {
        setPosts([]);
      }
    });

    onValue(sliderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sliderList = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val,
        }));
        setSliderImages(sliderList.sort((a, b) => a.order - b.order));
      } else {
        setSliderImages([]);
      }
    });
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <HeroSlider images={sliderImages} />

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-zinc-900">Portfolio Projects</h2>
          <div className="h-px flex-1 bg-zinc-200 ml-8 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {filteredPosts.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-400">
              No projects found matching your search.
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const postRef = ref(db, `posts/${id}`);
    onValue(postRef, (snapshot) => {
      setPost(snapshot.val());
    });
  }, [id]);

  if (!post) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Back to projects
      </button>

      <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
      </div>

      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900">{post.title}</h1>
        <div className="prose prose-zinc max-w-none">
          <p className="text-lg text-zinc-600 leading-relaxed whitespace-pre-wrap">
            {post.description}
          </p>
        </div>

        <div className="pt-8">
          <a
            href={post.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            View Website <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </motion.main>
  );
};

const LegalPage = ({ title, content }: { title: string; content: string }) => {
  return (
    <main className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-serif font-bold mb-12">{title}</h1>
      <div className="prose prose-zinc max-w-none whitespace-pre-wrap text-zinc-600 leading-relaxed">
        {content}
      </div>
    </main>
  );
};

const AdminPanel = ({ settings }: { settings: SiteSettings | null }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [posts, setPosts] = useState<Post[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'slider' | 'settings' | 'password'>('posts');

  // Form states
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [newSliderUrl, setNewSliderUrl] = useState('');
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (settings) setSiteSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const postsRef = ref(db, 'posts');
    const sliderRef = ref(db, 'slider');

    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPosts(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })));
      }
    });

    onValue(sliderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSliderImages(Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })).sort((a, b) => a.order - b.order));
      }
    });
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Bibidh Bhandara' && password === (settings?.adminPassword || 'Bibidh')) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleSavePost = async () => {
    if (!editingPost?.title || !editingPost?.imageUrl || !editingPost?.websiteUrl) return;
    
    const postData = {
      ...editingPost,
      createdAt: editingPost.createdAt || Date.now(),
      isPinned: editingPost.isPinned || false,
    };

    if (editingPost.id) {
      await update(ref(db, `posts/${editingPost.id}`), postData);
    } else {
      await push(ref(db, 'posts'), postData);
    }
    setEditingPost(null);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Delete this post?')) {
      await remove(ref(db, `posts/${id}`));
    }
  };

  const togglePin = async (post: Post) => {
    await update(ref(db, `posts/${post.id}`), { isPinned: !post.isPinned });
  };

  const handleAddSlider = async () => {
    if (!newSliderUrl) return;
    await push(ref(db, 'slider'), {
      imageUrl: newSliderUrl,
      order: sliderImages.length,
    });
    setNewSliderUrl('');
  };

  const handleDeleteSlider = async (id: string) => {
    await remove(ref(db, `slider/${id}`));
  };

  const handleSaveSettings = async () => {
    if (!siteSettings) return;
    await set(ref(db, 'settings'), siteSettings);
    alert('Settings saved!');
  };

  const handleChangePassword = async () => {
    if (passwords.current !== settings?.adminPassword) {
      alert('Current password incorrect');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    await update(ref(db, 'settings'), { adminPassword: passwords.new });
    alert('Password changed!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-zinc-100"
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-zinc-100 rounded-2xl mb-4">
              <Lock className="text-zinc-900" />
            </div>
            <h1 className="text-2xl font-serif font-bold">Admin Access</h1>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-zinc-900 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-2 focus:ring-zinc-900 transition-all"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all active:scale-95"
            >
              Login
            </button>
          </div>
        </motion.form>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-zinc-500">Manage your portfolio and site settings</p>
        </div>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 pb-4">
        {(['posts', 'slider', 'settings', 'password'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize",
              activeTab === tab ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100">
        {activeTab === 'posts' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage Posts</h2>
              <button
                onClick={() => setEditingPost({})}
                className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-zinc-800"
              >
                <Plus size={18} /> Add Post
              </button>
            </div>

            {editingPost && (
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Title"
                    value={editingPost.title || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-zinc-200"
                  />
                  <input
                    placeholder="Image URL"
                    value={editingPost.imageUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-zinc-200"
                  />
                  <input
                    placeholder="Website URL"
                    value={editingPost.websiteUrl || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, websiteUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-zinc-200"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pin"
                      checked={editingPost.isPinned || false}
                      onChange={(e) => setEditingPost({ ...editingPost, isPinned: e.target.checked })}
                    />
                    <label htmlFor="pin">Pin to top</label>
                  </div>
                </div>
                <textarea
                  placeholder="Description"
                  value={editingPost.description || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-zinc-200 h-32"
                />
                <div className="flex gap-2">
                  <button onClick={handleSavePost} className="bg-zinc-900 text-white px-6 py-2 rounded-lg">Save</button>
                  <button onClick={() => setEditingPost(null)} className="bg-zinc-200 px-6 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-4">
                    <img src={post.imageUrl} className="w-16 h-12 object-cover rounded-lg" />
                    <div>
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-xs text-zinc-500">{post.isPinned ? 'Pinned' : 'Normal'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => togglePin(post)} className="p-2 hover:bg-zinc-200 rounded-lg"><Pin size={18} className={post.isPinned ? 'fill-current' : ''} /></button>
                    <button onClick={() => setEditingPost(post)} className="p-2 hover:bg-zinc-200 rounded-lg"><Edit size={18} /></button>
                    <button onClick={() => handleDeletePost(post.id)} className="p-2 hover:bg-red-100 text-red-500 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'slider' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Hero Slider</h2>
            <div className="flex gap-2">
              <input
                placeholder="New Slider Image URL"
                value={newSliderUrl}
                onChange={(e) => setNewSliderUrl(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border-zinc-200"
              />
              <button onClick={handleAddSlider} className="bg-zinc-900 text-white px-6 py-2 rounded-xl">Add</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sliderImages.map((img) => (
                <div key={img.id} className="relative aspect-hero rounded-xl overflow-hidden group">
                  <img src={img.imageUrl} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteSlider(img.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && siteSettings && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Site Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  value={siteSettings.phone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-zinc-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  value={siteSettings.email}
                  onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-zinc-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Footer Description</label>
                <textarea
                  value={siteSettings.footerDescription}
                  onChange={(e) => setSiteSettings({ ...siteSettings, footerDescription: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-zinc-200 h-24"
                />
              </div>
              {siteSettings.socialLinks && Object.keys(siteSettings.socialLinks).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">{key} URL</label>
                  <input
                    value={(siteSettings.socialLinks as any)[key]}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      socialLinks: { ...siteSettings.socialLinks, [key]: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-xl border-zinc-200"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSaveSettings} className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-semibold">Save Settings</button>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="max-w-md space-y-6">
            <h2 className="text-xl font-bold">Change Password</h2>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border-zinc-200"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border-zinc-200"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border-zinc-200"
              />
              <button onClick={handleChangePassword} className="w-full bg-zinc-900 text-white py-3 rounded-xl font-semibold">Update Password</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export { Home, PostDetails, LegalPage, AdminPanel };
