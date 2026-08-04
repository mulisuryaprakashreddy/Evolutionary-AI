import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Channel, Video, VideoWithChannel, Comment } from './types';

export function useVideos(category?: string): { videos: VideoWithChannel[]; loading: boolean; error: string | null } {
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*, channel:channels(*)')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setVideos([]);
      } else {
        setError(null);
        const all = (data || []) as unknown as VideoWithChannel[];
        setVideos(category && category !== 'All' ? all.filter(v => v.category === category) : all);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [category]);

  return { videos, loading, error };
}

export function useTrendingVideos(): { videos: VideoWithChannel[]; loading: boolean } {
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('videos')
        .select('*, channel:channels(*)')
        .order('views', { ascending: false })
        .limit(20);
      if (cancelled) return;
      setVideos((data || []) as unknown as VideoWithChannel[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { videos, loading };
}

export function useVideo(videoId: string): { video: VideoWithChannel | null; loading: boolean; error: string | null } {
  const [video, setVideo] = useState<VideoWithChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*, channel:channels(*)')
        .eq('id', videoId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setVideo(null);
      } else {
        setError(null);
        setVideo(data as unknown as VideoWithChannel | null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [videoId]);

  return { video, loading, error };
}

export function useChannel(channelId: string): { channel: Channel | null; loading: boolean } {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .maybeSingle();
      if (cancelled) return;
      setChannel(data as Channel | null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [channelId]);

  return { channel, loading };
}

export function useChannelVideos(channelId: string): { videos: Video[]; loading: boolean } {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setVideos((data || []) as Video[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [channelId]);

  return { videos, loading };
}

export function useComments(videoId: string): {
  comments: Comment[];
  loading: boolean;
  addComment: (text: string) => Promise<void>;
  likeComment: (id: string) => void;
} {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setComments((data || []) as Comment[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [videoId]);

  const addComment = async (text: string) => {
    const avatars = [
      'https://images.pexels.com/photos/5308640/pexels-photo-5308640.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/33680700/pexels-photo-33680700.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/11156392/pexels-photo-11156392.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/6942776/pexels-photo-6942776.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    ];
    const names = ['You', 'Guest Viewer', 'Anonymous'];
    const { data } = await supabase
      .from('comments')
      .insert({
        video_id: videoId,
        author_name: names[Math.floor(Math.random() * names.length)],
        author_avatar: avatars[Math.floor(Math.random() * avatars.length)],
        text,
        likes: 0,
      })
      .select('*')
      .single();
    if (data) setComments(prev => [data as Comment, ...prev]);
  };

  const likeComment = (id: string) => {
    setComments(prev =>
      prev.map(c => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  return { comments, loading, addComment, likeComment };
}

export function useSearch(query: string): { results: VideoWithChannel[]; loading: boolean } {
  const [results, setResults] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('videos')
        .select('*, channel:channels(*)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('views', { ascending: false });
      if (cancelled) return;
      setResults((data || []) as unknown as VideoWithChannel[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [query]);

  return { results, loading };
}
