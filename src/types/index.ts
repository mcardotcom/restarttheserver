import { createClient } from '@/lib/supabase/client';

export interface Headline {
  id: string
  title: string
  summary: string
  source: string
  url: string
  category: string
  created_at: string
  updated_at: string
  flame_score: number
  published_at: string
  is_published: boolean
  is_pinned: boolean
  is_breaking: boolean
  approved_by: string | null
  metadata: Record<string, any>
  draft?: boolean
  published?: boolean
  moderation_status?: 'pending' | 'approved' | 'rejected'
  moderation_notes?: string
  is_sponsored?: boolean
}

export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface Ad {
  id: string
  title: string
  content: string
  url: string
  created_at: string
  updated_at: string
}

export interface ErrorLog {
  id: string
  message: string
  stack?: string
  created_at: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  user: UserProfile | null
  error?: string
}

export interface HeadlineCardProps {
  headline: Headline
  onApprove?: (headline: Headline) => void
  onReject?: (headline: Headline) => void
  onDelete?: (headline: Headline) => void
  isAdmin?: boolean
}

export interface HeadlineListProps {
  supabase: ReturnType<typeof createClient>;
  status?: 'published' | 'pending' | 'draft' | 'rejected';
  limit?: number;
  sectionTitle?: string;
  isAdmin?: boolean;
}

export interface SponsorCardProps {
  title?: string
  summary?: string
  url?: string
  category?: string
  partner?: string
  onEdit?: () => void
  onDelete?: () => void
}

export interface SponsorCardEditorProps {
  initialData?: {
    title?: string;
    summary?: string;
    url?: string;
    category?: string;
    partner?: string;
  };
  onSave: (data: {
    title: string;
    summary: string;
    url: string;
    category: string;
    partner: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface ErrorMessageProps {
  message: string;
  className?: string;
}

export interface ManualArticleProcessorProps {
  onSuccess?: () => void
}

export interface ManualYouTubeProcessorProps {
  onSuccess?: () => void
}

export interface AdminHeadlineCardProps {
  headline: Headline;
  onStatusChange: () => void;
} 