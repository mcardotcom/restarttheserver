-- Add media_type column to headlines table
ALTER TABLE public.headlines
ADD COLUMN media_type TEXT DEFAULT 'article';

-- Add comment to explain the column
COMMENT ON COLUMN public.headlines.media_type IS 'Type of content: article, video, etc.'; 