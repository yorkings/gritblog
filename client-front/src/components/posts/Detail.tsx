import { toast } from "react-toastify";
import { Api } from "../../lib/Api"
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthStore } from "../../lib/AuthStore";

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
    const [post,setPost]=useState<PostRecord>()
    const { postId } = useParams();
    const {currentUser,fetchProfile}=AuthStore();
    if (currentUser){
        const profile=fetchProfile(currentUser)
    }   
       
    const ObtainPosts=async()=>{
        try{
            const post_data=await Api.get(`/posts/${postId}`)
            setPost(post_data.data)
            console.log(post_data.data)

        }catch (error) {
              const axiosError = error as AxiosError<{ message: string }>;
              toast.error(
                axiosError.response?.data?.message || "Failed to create post"
              );
            } 
           }

  return (
    <div>
      
    </div>
  )
}

export default Detail
