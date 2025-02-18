import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function UploadProduct() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Generate image previews
    const filePreviews = selectedFiles.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
      });
    });

    Promise.all(filePreviews).then((results) => setPreviews(results));
  };

  const handleUpload = async () => {
    if (!productName || !description || !price || files.length === 0) {
      return alert("Please fill in all fields!");
    }

    setUploading(true);
    let imageUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("products")
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
      const { data: urlData } = supabase.storage.from("products").getPublicUrl(`images/${fileName}`);
      imageUrls.push(urlData.publicUrl);
    }

    // Save product details to Supabase Database
    const { error: dbError } = await supabase.from("products").insert([
      {
        name: productName,
        description: description,
        price: parseFloat(price),
        image_urls: imageUrls,
      },
    ]);

    if (dbError) {
      console.error("Database error:", dbError.message);
      alert("Failed to save product!");
    } else {
      alert("Product uploaded successfully!");
      setProductName("");
      setDescription("");
      setPrice("");
      setFiles([]);
      setPreviews([]);
    }

    setUploading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-20">
      <h2 className="text-2xl font-semibold text-center mb-4">Upload Product</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md h-24"
        />

        <input
          type="number"
          placeholder="Price ($)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full" />

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {previews.map((preview, index) => (
              <img key={index} src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition"
        >
          {uploading ? "Uploading..." : "Upload Product"}
        </button>
      </div>
    </div>
  );
}
