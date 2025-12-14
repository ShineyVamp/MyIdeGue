import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import IdeaCard from '../components/IdeaCard'; // Import dari folder sibling
import CommentSection from '../components/CommentSection'; // Import dari folder sibling
import { API_URL } from '../config/api';

const PostDetail = ({ post, onBack, onVote, onDelete, currentUser, onUserClick, onAddReply, onCommentVote, onDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]); 
  const [fullPost, setFullPost] = useState(post);

  useEffect(() => {
      setFullPost(post);
  }, [post]);

  const fetchComments = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/posts/${post.id}/comments`, {
              headers: { 'Authorization': token }
          });
          const data = await res.json();
          setComments(data);
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
      fetchComments();
  }, [post.id]);

  const handleLocalVote = (postId, type) => {
      setFullPost(prev => {
          let newVote = type;
          let newScore = parseInt(prev.upvotes);
          const currentVote = prev.userVote;

          if (currentVote === type) {
              newVote = null;
              newScore = type === 'up' ? newScore - 1 : newScore + 1;
          } else if (currentVote) {
              newScore = type === 'up' ? newScore + 2 : newScore - 2;
          } else {
              newScore = type === 'up' ? newScore + 1 : newScore - 1;
          }

          return { ...prev, userVote: newVote, upvotes: newScore };
      });
      onVote(postId, type);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    // Optimistic Update
    const tempComment = {
        id: Date.now(),
        post_id: post.id,
        user_id: currentUser.id,
        content: newComment,
        parent_id: null,
        created_at: new Date().toISOString(),
        replies: [],
        score: 0,
        userVote: null
    };
    setComments(prev => [tempComment, ...prev]);
    setNewComment('');

    const success = await onAddReply(post.id, null, newComment);
    if (success !== false) {
        fetchComments(); 
    }
  };

  const handleReplyNested = async (parentId, content) => {
      const success = await onAddReply(post.id, parentId, content);
      if (success !== false) fetchComments();
  };

  const handleVoteCommentWrapper = async (commentId, type) => {
      const success = await onCommentVote(commentId, type);
      if (success) fetchComments(); 
  };

  const handleDeleteCommentWrapper = async (commentId, isRoot) => {
      const success = await onDeleteComment(commentId, isRoot);
      if (success) fetchComments();
  };

  return (
    <div className="w-full max-w-8xl mx-auto pt-2 pb-20 animate-in slide-in-from-right duration-300">
      
      {/* HEADER TOMBOL BACK */}
      <div className="flex items-center gap-4 mb-6">
        <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-200 bg-white rounded-full transition-colors shadow-sm"
        >
            <ArrowLeft size={24} className="text-black" />
        </button>
        <h2 className="text-xl font-bold text-black hidden md:block">Back</h2>
      </div>

      <IdeaCard 
        post={fullPost} 
        isDetailView={true} 
        onVote={handleLocalVote} 
        onDelete={onDelete}
        currentUser={currentUser} 
        onUserClick={onUserClick} 
      />

      <div className="mt-4">
        <div className="bg-white rounded-[2rem] p-4 flex items-center gap-3 shadow-sm border border-gray-100 mb-4">
            <img src={currentUser?.avatar} alt="Me" className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
            <div className="flex-1 bg-[#E5E5E5] rounded-xl px-4 py-2 flex items-center justify-between">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    placeholder="What are your thoughts?"
                    className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-gray-500 text-black"
                />
            </div>
            <button onClick={handleSubmitComment} className="bg-white border border-gray-200 text-black text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50">
                Comment
            </button>
        </div>

        <div className="mb-0">
            <span className="bg-white border border-gray-200 text-black px-6 py-2 rounded-full text-sm font-bold shadow-sm inline-block">
                Comments
            </span>
        </div>

        <CommentSection 
            comments={comments} 
            currentUser={currentUser} 
            onUserClick={onUserClick}
            onReply={handleReplyNested}
            onVote={handleVoteCommentWrapper}
            onDelete={handleDeleteCommentWrapper}
        />
      </div>
    </div>
  );
};

export default PostDetail;