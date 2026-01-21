import type { AxiosError } from "axios";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Api } from "../lib/Api";
import { FaCalendar } from "react-icons/fa";
import moment from 'moment';
import { useNavigate, useSearchParams } from "react-router-dom";

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

const ITEMS_PER_PAGE = 20;

const Home = () => {
    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    // Using SearchParams ensures the page number is in the URL (e.g., /?page=2)
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;

    // 1. DATA FETCHING
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const post_res = await Api.get<PostRecord[]>('/posts');
                setPosts(post_res.data);
            } catch (error) {
                const axiosError = error as AxiosError<{ message: string }>;
                toast.error(axiosError.response?.data?.message || "Failed to fetch posts.");          
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // 2. PAGINATION CALCULATIONS
    // useMemo prevents re-slicing unless posts or page change
    const { posts_per_page, total_pages } = useMemo(() => {
        const index_of_lastItem = currentPage * ITEMS_PER_PAGE;
        const index_of_firstItem = index_of_lastItem - ITEMS_PER_PAGE;
        return {
            posts_per_page: posts.slice(index_of_firstItem, index_of_lastItem),
            total_pages: Math.ceil(posts.length / ITEMS_PER_PAGE)
        };
    }, [posts, currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= total_pages) {
            setSearchParams({ page: page.toString() });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePostId = (postId: string) => {
        navigate(`post/detail/${postId}`);
    };

    // 3. RENDER HELPERS
    const renderPagination = () => {
        const pageButtons = [];
        const maxvisibleBtns = 5;
        let start = Math.max(1, currentPage - Math.floor(maxvisibleBtns / 2));
        const end = Math.min(start + maxvisibleBtns - 1, total_pages);

        if (end - start < maxvisibleBtns - 1) {
            start = Math.max(1, end - maxvisibleBtns + 1);
        }

        const PageButton = ({ page, isActive }: { page: number; isActive: boolean }) => (
            <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 mx-1 rounded text-sm transition duration-150 ease-in-out ${
                    isActive 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                {page}
            </button>
        );

        if (start > 1) {
            pageButtons.push(<PageButton key={1} page={1} isActive={currentPage === 1} />);
            if (start > 2) pageButtons.push(<span key="ell-start" className="px-3 py-1 mx-1 text-gray-500">...</span>);
        }

        for (let i = start; i <= end; i++) {
            pageButtons.push(<PageButton key={i} page={i} isActive={i === currentPage} />);
        }

        if (end < total_pages) {
            if (end < total_pages - 1) pageButtons.push(<span key="ell-end" className="px-3 py-1 mx-1 text-gray-500">...</span>);
            pageButtons.push(<PageButton key={total_pages} page={total_pages} isActive={currentPage === total_pages} />);
        }

        return (
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    className="text-center text-gray-700 dark:text-gray-200 transition-all hover:bg-blue-600 hover:text-white py-1.5 px-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {"< Prev"}
                </button>
                {pageButtons}
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === total_pages} 
                    className="text-center text-gray-700 dark:text-gray-200 transition-all hover:bg-blue-600 hover:text-white py-1.5 px-3 rounded-full disabled:opacity-50"
                >
                    {">>"}
                </button>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-white border-b-2 border-blue-500 pb-2">
                Latest Articles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {posts_per_page.map((post) => (
                    <article 
                        key={post.id} 
                        onClick={() => handlePostId(post.id)}
                        className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer flex flex-col"
                    >
                        {post.imageUrls?.[0] && (
                            <img 
                                src={post.imageUrls[0]} 
                                alt={post.title}  
                                className="w-full h-48 object-cover" 
                                loading="lazy"
                            />
                        )}
                        
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700 italic">
                                <div className="flex items-center">
                                    <FaCalendar className="mr-1 text-blue-500" />
                                    <span>{moment(post.createdAt).format('DD MMM, YYYY')}</span>
                                </div>
                                <span className="font-medium">@{post.authorUsername}</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-3">
                                {post.title}
                            </h3>
                            
                            <p  
                                className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4"
                                dangerouslySetInnerHTML={{ 
                                    __html: post.content.replace(/<[^>]*>/g, '').substring(0, 120) + (post.content.length > 120 ? '...' : '') 
                                }} 
                            />
                        </div>
                    </article>
                ))}
            </div>

            {total_pages > 1 && (
                <div className="flex justify-center items-center mt-12 py-8">
                    {renderPagination()}
                </div>
            )}
        </div>
    );
};

export default Home;