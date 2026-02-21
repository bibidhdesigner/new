export interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  isPinned: boolean;
  createdAt: number;
}

export interface SliderImage {
  id: string;
  imageUrl: string;
  order: number;
  postId?: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  threads: string;
}

export interface SiteSettings {
  footerDescription: string;
  phone: string;
  email: string;
  adminPassword: string;
  socialLinks: SocialLinks;
}
