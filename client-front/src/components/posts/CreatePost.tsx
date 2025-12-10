import type { AxiosError } from "axios";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Api } from "../../lib/Api";
import { AuthStore } from "../../lib/AuthStore";
import { Editor } from '@tinymce/tinymce-react';

interface CategoryInterface {
  id: number;
  name: string;
  slug:string;
}

type PostStatus = 'PUBLISHED' | 'DRAFTED' | 'ARCHIVED'; 

const CreatePost = () => {
  const currentuser = AuthStore((state) => state.currentUser);
  
  const [categories, setCategories] = useState<CategoryInterface[]>([]);
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [imagesBase64, setImagesBase64] = useState<string[]>([]); 
  const [selectedStatus, setSelectedStatus] = useState<PostStatus>('DRAFTED'); 
  
  const editorRef = useRef<any>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image.`);
          continue;
        }
        try {
          const base64String = await convertFileToBase64(file);
          newImages.push(base64String); 
        } catch (error) {
          toast.error(`Failed to process image: ${file.name}`);
          console.error(error);
        }
      }
      
      setImagesBase64((prev) => [...prev, ...newImages]);
    }
    e.target.value = ''; 
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
      setImagesBase64(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await Api.get<CategoryInterface[]>("/categories");
        const fetchedCategories = response.data;
        
        setCategories(fetchedCategories);
        
        if (fetchedCategories && fetchedCategories.length > 0) {
            setSelectedCategory(fetchedCategories[0].id); 
        }

      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(
          axiosError.response?.data?.message || "Failed to fetch categories"
        );
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = editorRef.current?.getContent(); 

    if (!title || !content || !selectedCategory) {
      toast.error("Please fill all required fields (Title, Content, Category)");
      return;
    }

    if (!currentuser?.id) {
        toast.error("Author information missing. Please log in.");
        return;
    }

    try {
      const payload = {
        title,
        content,
        categoryId: selectedCategory,
        userId: currentuser.id, 
        imageUrls: imagesBase64, 
        status: selectedStatus, 
      };

      const res = await Api.post("/posts", payload); 
      toast.success("Post created successfully!");
      setTitle("");
      setSelectedCategory(null);
      setImagesBase64([]); 
      setSelectedStatus('DRAFTED'); 
      editorRef.current?.setContent(''); 
      console.log("Created post:", res.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to create post"
      );
    }
  };

  return (
    <div className="w-full md:max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center dark:text-[var(--darktext-subheader)]">
        Create New Post
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" >
        <input type="text" placeholder="Enter post title..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded p-2 dark:bg-[var(--nav-bg-dark)] dark:text-[var(--darktext-subheader)] focus:outline-none focus:ring focus:ring-blue-300"/>
        
        <input 
          type="file" 
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full border rounded p-2 dark:bg-[var(--nav-bg-dark)] dark:text-[var(--darktext-subheader)] focus:outline-none focus:ring focus:ring-blue-300"
        />

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as PostStatus)}  className="w-full border rounded p-2 dark:bg-[var(--nav-bg-dark)] dark:text-[var(--darktext-subheader)]"  >
          <option value="DRAFTED">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option> 
        </select>
        
        {imagesBase64.length > 0 && (
            <div className="flex flex-wrap gap-4 border p-4 rounded bg-gray-100 dark:bg-gray-800">
                <p className="w-full text-sm font-semibold dark:text-gray-300">Selected Images ({imagesBase64.length}):</p>
                {imagesBase64.map((base64, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded overflow-hidden shadow-md">
                        <img 
                            src={base64} 
                            alt={`Preview ${index}`} 
                            className="w-full h-full object-cover" 
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 flex items-center justify-center text-xs font-bold rounded-bl-lg hover:bg-red-700 transition"
                            title="Remove image"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        )}

        <select value={selectedCategory ?? ""} onChange={(e) => setSelectedCategory(Number(e.target.value))}  className="w-full border rounded p-2 dark:bg-[var(--nav-bg-dark)] dark:text-[var(--darktext-subheader)]"  >
          <option value="">Select a category</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <Editor apiKey={import.meta.env.VITE_TINY_KEY}
          onInit={(_, editor) => (editorRef.current = editor)}
          initialValue="<p>Start writing your post...</p>"
          init={{ height: 400, menubar: false,
            plugins: [ "advlist","autolink", "lists","link", "image","charmap", "preview", "anchor","searchreplace",
              "visualblocks","code","fullscreen",   "insertdatetime", "media", "table",   "help",    "wordcount",
            ],
            toolbar:
              "undo redo | formatselect | bold italic underline | " +
              "alignleft aligncenter alignright | bullist numlist outdent indent | " +
              "removeformat | help",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Publish
        </button>
      </form>
    </div>
  );
};

export default CreatePost;