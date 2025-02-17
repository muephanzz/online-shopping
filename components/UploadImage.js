import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadProduct() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Show image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!productName || !price || !file) {
      return alert("Please fill in all fields!");
    }

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    
    // Upload image to Supabase Storage
    const { data, error } = await supabase.storage
      .from("products") // Bucket name
      .upload(`images/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error.message);
      alert("Image upload failed!");
      setUploading(false);
      return;
    }

    // Get public image URL
    const imageUrl = supabase.storage.from("products").getPublicUrl(`images/${fileName}`).publicUrl;

    // Save product details to Supabase Database
    const { error: dbError } = await supabase
      .from("products")
      .insert([{ 
        name: productName,  
        price: parseFloat(price),  
        image_url: imageUrl  
      }]);

    if (dbError) {
      console.error("Database error:", dbError.message);
      alert("Failed to save product!");
    } else {
      alert("Product uploaded successfully!");
      setProductName("");
      setPrice("");
      setFile(null);
      setPreview(null);
    }

    setUploading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h2>Upload Product</h2>
      
      <input 
        type="text" 
        placeholder="Product Name" 
        value={productName} 
        onChange={(e) => setProductName(e.target.value)} 
        required 
      />
      
      <input 
        type="number" 
        placeholder="Price" 
        value={price} 
        onChange={(e) => setPrice(e.target.value)} 
        required 
      />
      
      <input type="file" accept="image/*" onChange={handleFileChange} required />
      
      {preview && <img src={preview} alt="Preview" width="200" />}
      
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Product"}
      </button>
    </div>
  );
}
