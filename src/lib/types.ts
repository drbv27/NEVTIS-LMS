// src/lib/types.ts

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  stripe_price_id: string | null;
  created_at: string;
  status: "draft" | "published";
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "teacher" | "admin";
  bio: string | null;
  phone_number: string | null;
  social_links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
  followers_count: number;
  following_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_free: boolean;
  status: "published" | "draft";
  price: number | null;
  stripe_price_id: string | null;
  community_id: string | null;
  categories: {
    id: number;
    name: string;
    slug: string;
  } | null;
  category_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseDetails extends Course {
  teacherName: string | null;
  modules: Module[];
  isEnrolled: boolean;
  firstLessonId: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  lesson_type: "video" | "pdf" | "text" | "code" | "quiz";
  content_url: string | null;
  content_text: string | null;
  module_id: string;
  is_completed?: boolean;
  setup_code?: string | null;
  solution_code?: string | null;
  test_code?: string | null;
  lesson_order?: number;
  updated_at?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  module_order?: number;
}

export interface LessonPageData {
  courseTitle: string;
  modules: Module[];
  currentLesson: Lesson;
  prevLessonId: string | null;
  nextLessonId: string | null;
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_comment_id: number | null;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  author_full_name: string | null;
  author_avatar_url: string | null;
  followers_count: number;
  is_liked_by_me: boolean;
  is_followed_by_me: boolean;
  comments: Comment[];
  post_hashtags: { hashtags: { name: string }[] }[];
}
