export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar_url: string;
  banner_url: string;
  subscribers: number;
  description: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  channel_id: string;
  views: number;
  likes: number;
  duration: string;
  category: string;
  created_at: string;
}

export interface VideoWithChannel extends Video {
  channel: Channel;
}

export interface Comment {
  id: string;
  video_id: string;
  author_name: string;
  author_avatar: string;
  text: string;
  likes: number;
  created_at: string;
}

export type Route =
  | { name: 'home' }
  | { name: 'watch'; videoId: string }
  | { name: 'channel'; channelId: string }
  | { name: 'search'; query: string }
  | { name: 'trending' };
