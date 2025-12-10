import type { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Api } from "../lib/Api"
import { FaCalendar, FaUser } from "react-icons/fa"
import moment from 'moment';


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

const Home = () => {
    const [posts,setPosts]=useState<PostRecord[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    const items_per_page=20;
    const index_of_lastItem=currentPage * items_per_page
    const index_of_firstItem=index_of_lastItem - items_per_page
    const posts_per_page=posts?.slice(index_of_firstItem,index_of_lastItem)
    const total_pages=Math.ceil(posts?.length/items_per_page)
    
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= total_pages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderPagination=()=>{
         const pageButtons=[]
         const maxvisibleBtns=5
         let start=Math.max(1,currentPage-Math.floor(maxvisibleBtns/2))
         let end =Math.min(start+maxvisibleBtns-1,total_pages)
         if(end - start < maxvisibleBtns-1){
            start=Math.max( 1,end-maxvisibleBtns+1)
         }
         const PageButton = ({ page, isActive }: { page: number, isActive: boolean }) => (
            <button key={page}  onClick={() => handlePageChange(page)}  className={`px-3 py-1 mx-1 rounded text-sm transition duration-150 ease-in-out ${isActive ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                {page}
            </button>
        );
        if (start > 1) {
            pageButtons.push(<PageButton key={1} page={1} isActive={currentPage === 1} />);
            if (start > 2) {
                pageButtons.push(<span key="ell-start" className="px-3 py-1 mx-1 text-gray-500">...</span>);
            }
        }
        for (let i = start; i <= end; i++) {
            pageButtons.push(<PageButton key={i} page={i} isActive={i === currentPage} />);
        }
        if (end < total_pages) {
            if (end < total_pages - 1) {
                pageButtons.push(<span  key="ell-end" className="px-3 py-1 mx-1 text-gray-500">...</span>);
            }
            pageButtons.push(<PageButton key={total_pages} page={total_pages} isActive={currentPage === total_pages} />);
        }
        return(
            <div className="flex items-center space-x-2">
                <button onClick={()=>handlePageChange(currentPage-1)} disabled={currentPage === 1} className="text-center text-[var(--lighttext-text)] dark:text-[var(--dark-text)] transition-all delay-75 ease-in-out hover:bg-blue-600 hover:text-white py-1.5 px-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" >{"< Prev"}</button>
                 {pageButtons}
                 <button onClick={()=>handlePageChange(currentPage+1)} disabled={currentPage === total_pages} className="text-center text-[var(--lighttext-text)] dark:text-[var(--dark-text)] transition-all delay-75 ease-in-out hover:bg-blue-600 hover:text-white py-1.5 px-3 rounded-full  ">{">>"}</button>
            </div>
        )
    }

    useEffect(()=>{
        const fetchPosts=async()=>{
            setIsLoading(true);
            try {
                const post_res = await Api.get('/posts');
                setPosts(post_res.data)
            } catch (error) {
                const axiosError = error as AxiosError<{ message: string }>;
                toast.error(axiosError.response?.data?.message || "failed to fetch posts.");          
            } finally {
                setIsLoading(false);
            }
        }
        fetchPosts()
    },[])

    if (isLoading) {
        return <div className="min-h-screen flex justify-center items-center text-xl text-gray-600 dark:text-gray-300">Loading posts...</div>;
    }

  return (
      <div className="min-h-full flex flex-col p-4 md:p-8">
        <h2 className="text-3xl font-extrabold mb-8 text-[var(--lighttext-text)] dark:text-[var(--dark-text)] border-b-2 border-blue-500 pb-2">Latest Articles</h2>

        <div className="grid grid-cols-1  sm:grid-cols-2  lg:grid-cols-4 gap-8">
            {posts_per_page.map((post)=>(
                <div 
                    className="bg-[var(--nav-link-dark)] dark:bg-[var(--nav-link-light)] shadow-xl rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
                    key={post.id}>
                    
                    {post.imageUrls && post.imageUrls.length > 0 && (
                        <img 
                            src={post.imageUrls[0]} 
                            alt={post.title}  
                            className="w-full h-auto md:h-56 object-cover" 
                        />
                    )}
                    
                    <div className="p-2 md:p-4">
                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700 italic">
                            <div className="flex items-center">
                                <FaCalendar className="mr-1 text-blue-500" />
                                <span>{moment(post.createdAt).format('DD MMM, YYYY')}</span>
                            </div>
                            
                            <div className="flex items-center font-medium text-gray-600 dark:text-gray-300">
                                <span>author:</span>
                                <span>{post.authorUsername}</span>
                            </div>
                        </div>
                         <h3 className="text-xl font-bold  text-[var(--lighttext-subheader)] dark:text-white line-clamp-2 text-center">{post.title}</h3>
                        <p  
                            className="text-base text-[var(--lighttext-text)] dark:text-gray-300 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>/g, '').substring(0, 120) + (post.content.length > 120 ? '...' : '') }} 
                        />
                    </div>

                </div>
            ))}
        </div>
        {total_pages > 1 && (
            <div className="flex justify-center items-center mt-12">
               {renderPagination()}
            </div>
        )}
        
    </div>
  )
}

export default Home