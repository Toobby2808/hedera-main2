

import { useState } from "react";
import { X } from "lucide-react";
import type { Book } from "../types";

export default function UploadBookForm({ onClose, onUploadSuccess }: any) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        book_type: "past_question",
        file: null as File | null,
        is_free: true,
        price: "0",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}"); // ✅ read logged in user

    const handleInputChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
            ...(name === "is_free" && checked ? { price: "0" } : {})
        }));
    };

    const handleFileChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, file: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("authToken");
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("book_type", formData.book_type);
            if (formData.file) fd.append("file", formData.file);
            fd.append("is_free", formData.is_free.toString());
            fd.append("price", formData.is_free ? "0" : formData.price);

            const res = await fetch(
                "https://team-7-api.onrender.com/library/books/upload/",
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd
                }
            );

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.detail || "Upload failed");
            }

            const result = await res.json();

            // ✅ Use real file url from backend
            const newBook: Book = {
                ...result,
                uploaded_by: {
                    id: user?.id || 0,
                    username: user?.username || "You"
                },
            };

            // ✅ Save locally to show instantly
            const savedBooks = JSON.parse(localStorage.getItem("uploadedBooks") || "[]");
            localStorage.setItem("uploadedBooks", JSON.stringify([newBook, ...savedBooks]));

            onUploadSuccess?.(newBook);
            onClose?.();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Upload Book</h2>
                <button onClick={onClose}><X /></button>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <div className="space-y-3">
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Book title"
                    className="w-full border p-2 rounded"
                />

                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="w-full border p-2 rounded"
                />

                <select
                    name="book_type"
                    value={formData.book_type}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                >
                    <option value="past_question">Past Question</option>
                    <option value="textbook">Textbook</option>
                    <option value="reference">Reference</option>
                    <option value="novel">Novel</option>
                </select>

                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full"
                />

                <label className="flex gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="is_free"
                        checked={formData.is_free}
                        onChange={handleInputChange}
                    />
                    Make free
                </label>

                {!formData.is_free && (
                    <input
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="Price"
                        className="w-full border p-2 rounded"
                    />
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-green-600 text-white p-2 rounded"
                >
                    {loading ? "Uploading..." : "Upload Book"}
                </button>
            </div>
        </div>
    );
}
