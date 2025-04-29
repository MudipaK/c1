import { default as axiosInstance, postFormData } from "../utils/axios/axios";

export const uploadFile = async (file: File, type: string): Promise<string> => {
  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  
  try {
    const response = await postFormData<{filePath: string, message: string}>(
      "/upload/upload", 
      formData
    );
    
    if (response.status === 200 && response.data) {
      return response.data.filePath;
    } else {
      throw new Error(response.message || "File upload failed");
    }
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

export const getFileUrl = (filePath: string): string => {
  // Handle already complete URLs
  if (filePath.startsWith("http")) {
    return filePath;
  }
  
  // // For server paths starting with "/uploads/"
  // if (filePath.startsWith("/uploads/")) {
  //   // Use localhost URL for development - THIS IS THE KEY CHANGE
  //   return `http://localhost:5000${filePath}`;
  // }
  
  // Extract filename if nothing else matches
  const filename = filePath.split(/[\/\\]/).pop() || "";
  
  // Determine the appropriate folder based on filename or path info
  const folder = "documents";
  
  // Default case - use localhost server path with appropriate folder
  return `http://localhost:5000/uploads/${folder}/${filename}`;
};

// Helper function to extract just the filename from any path
export const getFileName = (filePath: string): string => {
  // Remove query parameters if present
  const pathWithoutQuery = filePath.split('?')[0];
  // Get the last part after slashes or backslashes
  return pathWithoutQuery.split(/[\/\\]/).pop() || "document.pdf";
};