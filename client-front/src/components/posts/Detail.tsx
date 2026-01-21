import { toast } from "react-toastify";
import { Api } from "../../lib/Api";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthStore } from "../../lib/AuthStore";
import moment from "moment";
import { FaCalendar, FaUser, FaArrowLeft, FaImages, FaReply, FaTrash, FaPaperPlane, FaComment } from "react-icons/fa";

interface Comment {
    id: string;
    content: string;
    author: string
    replies?: Comment[];
}

interface PostRecord {
    id: string;
    title: string;
    content: string;
    slug: string;
    status: string;
    imageUrls: string[];
    createdAt: string; 
    updatedAt: string;
    authorUsername: string; 
    authorId: string;
}

const Detail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = AuthStore();

    // State
    const [post, setPost] = useState<PostRecord | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");

    // 1. Fetch Post and Comments
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const postRes = await Api.get<PostRecord>(`/posts/${postId}`);
                setPost(postRes.data);
                try {
                const commentRes = await Api.get<Comment[]>(`/comments/post?id=${postId}`);
                    // If backend returns null or undefined, default to []
                    setComments(commentRes.data || []);
                } catch (error) {
                    
                    setComments([]); // Set to empty array so map() doesn't break
                }
              
                
            } catch (error) {
                const axiosError = error as AxiosError<{ message: string }>;
                toast.error(axiosError.response?.data?.message || "Failed to fetch data");
                navigate("/");
            } finally {
                setIsLoading(false);
            }
        };
        if (postId) fetchData();
    }, [postId, navigate]);

    // 2. Comment Actions
    const handleAddComment = async (parentId: string | null = null, content: string) => {
        if (!content.trim() || !currentUser) return;
        try {
            const payload = {
                postId,
                authorId: currentUser.id,
                content,
                parentCommentId: parentId
            };
            const res = await Api.post("/comments/post", payload);
            
            if (parentId) {
                setComments(prev => prev.map(c => 
                    c.id === parentId ? { ...c, replies: [...(c.replies || []), res.data] } : c
                ));
                setReplyingTo(null);
                setReplyContent("");
            } else {
                setComments([res.data, ...comments]);
                setNewComment("");
            }
            toast.success("Posted!");
        } catch (error) {
           const axiosError = error as AxiosError<{ message: string }>;
           toast.error(axiosError.response?.data?.message || "Failed to post comment");
        }
    };

    const handleDeleteComment = async (id: string) => {
        try {
            await Api.delete(`/comments/${id}`);
            setComments(prev => prev.filter(c => c.id !== id));
            toast.info("Deleted");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
    );

    if (!post) return null;
    const [mainImage, ...otherImages] = post.imageUrls || [];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Section */}
            {mainImage && (
                <div className="max-w-full h-[45vh] md:h-[60vh] relative group overflow-hidden">
                    <img src={mainImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-3 bg-black/40 hover:bg-blue-600 rounded-full text-white transition-all"><FaArrowLeft /></button>
                    <div className="absolute bottom-10 left-8 right-8 max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight uppercase tracking-tighter">{post.title}</h1>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Meta */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b dark:border-gray-800 pb-6">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><FaCalendar className="text-blue-500" /> {moment(post.createdAt).format('DD MMM, YYYY')}</div>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold uppercase">{post.authorUsername[0]}</div>
                            <span className="font-bold dark:text-gray-300 uppercase tracking-widest">{post.authorUsername}</span>
                        </div>
                    </div>
                    {currentUser?.id === post.authorId && (
                        <button onClick={() => navigate(`/post/edit/${post.id}`)} className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-xs font-black hover:scale-105 transition-transform">EDIT RECORD</button>
                    )}
                </div>
                {/* Gallery */}
                {otherImages.length > 0 && (
                    <div className="mb-12">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-4"><FaImages /> Supplemental Gallery</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {otherImages.map((url, i) => (
                                <img key={i} src={url} className="aspect-square rounded-xl object-cover border dark:border-gray-800 hover:opacity-80 transition-opacity" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div 
                    className="prose prose-lg max-w-none prose-headings:font-black prose-a:text-blue-500"
                    style={{ color: 'var(--dark-text)', '--tw-prose-headings': 'var(--darktext-header)' } as any}
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                {/* Discussion Section */}
                <div className="mt-20 pt-10 border-t dark:border-gray-800">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3 dark:text-white uppercase tracking-tighter">
                        <FaComment className="text-blue-500" />type a comment
                    </h3>

                    {/* New Comment Input */}
                    {currentUser && (
                        <div className="mb-12 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border dark:border-gray-700 shadow-inner">
                            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Type your observation..." className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 resize-none min-h-[100px]" />
                            <div className="flex justify-end"><button onClick={() => handleAddComment(null, newComment)} className="bg-blue-600 text-white px-8 py-2 rounded-full font-black text-xs uppercase flex items-center gap-2 hover:bg-blue-700 transition-colors"><FaPaperPlane /> Post Update</button></div>
                        </div>
                    )}

                    {/* Comments Thread */}
                    <div className="space-y-10">
                        {comments.map((comment) => (
                            <div key={comment.id} className="group">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-blue-500 font-black border dark:border-gray-700">{comment.author.username[0].toUpperCase()}</div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-black text-[11px] dark:text-white uppercase tracking-wider">{comment.author.username}</span>
                                            <span className="text-[9px] text-gray-500 uppercase">{moment(comment.created).fromNow()}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{comment.content}</p>
                                        <div className="flex gap-6 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase hover:underline"><FaReply /> Reply</button>
                                            {currentUser?.id === comment.author.id && <button onClick={() => handleDeleteComment(comment.id)} className="flex items-center gap-1.5 text-[9px] font-black text-red-500 uppercase hover:underline"><FaTrash /> Delete</button>}
                                        </div>
                                        {/* Nested Reply Input */}
                                        {replyingTo === comment.id && (
                                            <div className="mt-4 animate-in slide-in-from-top-2">
                                                <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-sm dark:text-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="Write a reply..." />
                                                <div className="flex justify-end mt-2"><button onClick={() => handleAddComment(comment.id, replyContent)} className="text-[10px] font-bold bg-blue-600 text-white px-4 py-1.5 rounded-full uppercase">Send Reply</button></div>
                                            </div>
                                        )}
                                        {/* Sub-replies */}
                                        {comment.replies && comment.replies.map(reply => (
                                            <div key={reply.id} className="mt-6 flex gap-3 border-l-2 border-gray-100 dark:border-gray-800 pl-6">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold dark:text-gray-400">{reply.author.username[0]}</div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1"><span className="font-bold text-[10px] dark:text-gray-200 uppercase">{reply.author.username}</span></div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{reply.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => navigate("/")} className="mt-20 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] hover:text-blue-500 transition-colors"><FaArrowLeft /> Exit System</button>
            </div>
        </div>
    );
};

export default Detail;