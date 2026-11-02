'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PostCard from '@/components/community/PostCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface PostItem {
  id: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export default function CommunityPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      await fetchPosts();
      setLoading(false);
    }
    init();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('id, user_id, content, likes, created_at, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as unknown as PostItem[]);
    }
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter something to share.');
      return;
    }

    if (!currentUser) {
      toast.error('Please sign in to post in the community.');
      return;
    }

    setPosting(true);
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: currentUser.id,
        content: content.trim(),
        likes: 0,
      });

      if (error) {
        toast.error(error.message || 'Failed to post.');
        return;
      }

      toast.success('Posted to community!');
      setContent('');
      await fetchPosts();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Community Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          BuildSphere Community
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask questions, showcase projects, seek advice, and connect with peers across India.
        </p>
      </div>

      {/* Create Post Box */}
      {currentUser ? (
        <Card className="p-5 border border-orange-100 shadow-sm">
          <form onSubmit={handlePost} className="space-y-3">
            <label htmlFor="post-content" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Share an update or question
            </label>
            <textarea
              id="post-content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are you building or learning today? Looking for guidance, hackathon partners, or job referrals?"
              className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              maxLength={1000}
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400">
                {content.length}/1000
              </span>
              <Button type="submit" size="sm" isLoading={posting}>
                Post Update
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 bg-orange-50/50 border border-orange-200 text-center">
          <h2 className="text-base font-semibold text-gray-900">Join the discussion</h2>
          <p className="text-xs text-gray-600 mt-1">
            Sign in to share updates, ask questions, and engage with India's fastest-growing talent pool.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/login?redirect=/community">
              <Button size="sm">Sign In to Post</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="secondary">Create Free Account</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent" />
            <p className="text-gray-400 text-xs mt-3">Loading community feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200 p-8">
            <span className="text-4xl mb-3 block" aria-hidden="true">💬</span>
            <h3 className="text-base font-bold text-gray-800">No posts yet</h3>
            <p className="text-xs text-gray-500 mt-1">Be the first to break the ice and start a conversation!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              content={post.content}
              authorName={post.profiles?.full_name || 'Community Member'}
              createdAt={post.created_at}
              likesCount={post.likes ?? 0}
              currentUserId={currentUser?.id ?? null}
              authorId={post.user_id}
            />
          ))
        )}
      </div>
    </div>
  );
}

