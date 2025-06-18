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

export interface PostAuthor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// --- INICIO DE LA CORRECCIÓN ---
// Esta es la definición correcta y completa para un comentario
export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_comment_id: number | null;
  profiles: PostAuthor | null; // El autor del comentario
}

export interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: PostAuthor | null; // El autor del post
  likes: { user_id: string }[];
  comments: Comment[]; // El post ahora contiene un array de objetos Comment
  post_hashtags: { hashtags: { name: string }[] }[];
}
// --- FIN DE LA CORRECCIÓN ---
