
// import { useEffect, useState } from "react";
// import type { Book } from "../book";

// function mapApiBook(apiBook: any): Book {
//     return {
//         ...apiBook,
//         coverUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiBook.title)}&background=ECFDF5&color=10B981`,
//         price: apiBook.is_free ? "Free" : apiBook.price,
//         uploaded_by: apiBook.uploaded_by || { id: 0, username: "Unknown" },
//     };
// }

// export function useBook(id: string) {
//     const [book, setBook] = useState<Book | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         if (!id) return;

//         async function fetchBook() {
//             try {
//                 setLoading(true);

//                 const res = await fetch(
//                     `https://team-7-api.onrender.com/library/books/${id}/`
//                 );

//                 if (!res.ok) throw new Error("Failed to fetch book");

//                 const data = await res.json();


//                 console.log("BOOK RESPONSE =>", data); // 👈 ADD THIS
//                 setBook(data);

//                 setBook(mapApiBook(data));
//             } catch (err) {
//                 setError("Could not load book");
//             } finally {
//                 setLoading(false);
//             }
//         }

//         fetchBook();
//     }, [id]);

//     return { book, loading, error };
// }


import { useEffect, useState } from "react";
import type { Book } from "../book";


// ✅ ⬇️ Add this function at the top (before mapApiBook)
function formatTimeAgo(created_at: string) {
    const now = new Date();
    const created = new Date(created_at);
    const diffSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 172800) return "Yesterday";

    const days = Math.floor(diffSeconds / 86400);
    return `${days} days ago`;
}


// ✅ Then this stays below it
function mapApiBook(apiBook: any): Book {
    return {
        id: apiBook.id,
        title: apiBook.title,
        author: apiBook.author,
        uploader: apiBook.uploaded_by?.username,
        price: apiBook.is_free ? "Free" : `₦${apiBook.price}`,
        image: apiBook.coverUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(apiBook.title)}&background=ECFDF5&color=10B981`,
        description: apiBook.description,
        uploaded_by: {
            id: apiBook.uploaded_by?.id || 0,
            username: apiBook.uploaded_by?.username || "Unknown",
        },
        is_free: apiBook.is_free,
        progress: apiBook.progress || 0,
        category: apiBook.book_type || 0,
        created_at: apiBook.created_at,
        timeAgo: formatTimeAgo(apiBook.created_at),
        file: apiBook.file,
        chapter: apiBook.chapter || { current: 0, total: 0 },
        relatedBooks: apiBook.relatedBooks || [],
    };

}


// ✅ The rest does not change
export function useBook(id: string | undefined) {
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        async function fetchBook() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`https://team-7-api.onrender.com/library/books/${id}/`);
                if (!res.ok) throw new Error(`Failed with HTTP ${res.status}`);

                const raw = await res.json();
                const normalized = mapApiBook(raw);
                setBook(normalized);

            } catch (err) {
                setError("Could not load book");
            } finally {
                setLoading(false);
            }
        }

        fetchBook();
    }, [id]);

    return { book, loading, error };
}
