
export interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isPrivate: boolean;
  createdAt: string;
  memberCount: number;
  owner: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  tags?: string[];
}

export interface ClubPost {
  id: string;
  clubId: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface ClubMessage {
  id: string;
  clubId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  attachments?: string[];
}
