// src/lib/types.ts

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
  categories: {
    id: number;
    name: string;
    slug: string;
  } | null;
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
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface LessonPageData {
  courseTitle: string;
  modules: Module[];
  currentLesson: Lesson;
  prevLessonId: string | null;
  nextLessonId: string | null;
}

// Ya no necesitamos PostAuthor porque la información viene directamente en Post

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_comment_id: number | null;
  profiles: {
    // El autor del comentario sí es una relación anidada
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

// --- INICIO DE LA MODIFICACIÓN IMPORTANTE EN 'Post' ---
export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;

  // Datos del autor, ahora directamente en el objeto Post gracias a la vista
  author_full_name: string | null;
  author_avatar_url: string | null;
  followers_count: number;

  // Datos calculados por la vista para el usuario actual
  is_liked_by_me: boolean;
  is_followed_by_me: boolean;

  // Las relaciones que aún necesitamos traer por separado
  comments: Comment[];
  post_hashtags: { hashtags: { name: string }[] }[];
}
// --- FIN DE LA MODIFICACIÓN IMPORTANTE ---
