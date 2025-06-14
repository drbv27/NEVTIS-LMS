// src/lib/types.ts
//REVISAR ESTA DESPUES
export interface CourseDetails extends Course {
  teacherName: string | null;
  modules: Module[];
  isEnrolled: boolean;
  firstLessonId: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null; // <-- CAMPO AÑADIDO
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
  // La relación con categories nos traerá el objeto completo
  categories: {
    id: number;
    name: string;
    slug: string;
  } | null;
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

export interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: PostAuthor | null; // El autor del post
}
