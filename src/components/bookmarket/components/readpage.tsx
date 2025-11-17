import { useParams, useNavigate } from "react-router-dom";
import { useBook } from "../hooks/usebookId";
import { ChevronLeft } from "lucide-react";

export default function BookReaderPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { book, loading, error } = useBook(id || "");

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-600">
            Loading book...
        </div>
    );

    if (error || !book) return (
        <div className="min-h-screen flex items-center justify-center text-red-600">
            Failed to load book
        </div>
    );

    const fileUrl = book.file; // ✅ your PDF URL from Supabase

    if (!fileUrl) return (
        <div className="min-h-screen flex items-center justify-center text-red-500 text-center p-4">
            This book has no readable file
        </div>
    );

    // ✅ Google PDF viewer
    const pdfViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;

    return (
        <div className="min-h-screen bg-white">

            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-full shadow"
                >
                    <ChevronLeft size={20} />
                </button>
                <h2 className="font-semibold text-lg">{book.title}</h2>
            </div>

            {/* PDF Viewer */}
            <iframe
                src={pdfViewerUrl}
                className="w-full h-[90vh]"
                title="PDF Reader"
            ></iframe>

        </div>
    );
}
// import { useParams, useNavigate } from "react-router-dom";
// import { useBook } from "../hooks/usebookId";
// import { Document, Page, pdfjs } from "react-pdf";
// import { useEffect, useRef, useState } from "react";
// import { ChevronLeft } from "lucide-react";

// // REQUIRED for react-pdf to work
// pdfjs.GlobalWorkerOptions.workerSrc =
//     `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// export default function BookReaderPage() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { book, loading, error } = useBook(id || "");

//     const [numPages, setNumPages] = useState(0);
//     const scrollContainerRef = useRef<HTMLDivElement | null>(null);

//     //  Restore progress
//     useEffect(() => {
//         const saved = localStorage.getItem(`reading-scroll-${id}`);
//         if (saved && scrollContainerRef.current) {
//             scrollContainerRef.current.scrollTop = parseInt(saved);
//         }
//     }, [id]);

//     if (loading) return <div>Loading...</div>;
//     if (error || !book) return <div>Failed to load book</div>;

//     const pdfUrl = book.file;

//     function onDocumentLoadSuccess({ numPages }: any) {
//         setNumPages(numPages);
//     }

//     // TRACK SCROLL + SAVE PROGRESS + SEND TO BACKEND
//     function handleScroll() {
//         const el = scrollContainerRef.current;
//         if (!el) return;

//         const scrollTop = el.scrollTop;
//         const scrollHeight = el.scrollHeight - el.clientHeight;

//         const progress = Math.floor((scrollTop / scrollHeight) * 100);

//         // Save exact scroll position
//         localStorage.setItem(`reading-scroll-${id}`, scrollTop.toString());

//         // Save % progress
//         localStorage.setItem(`reading-progress-${id}`, progress.toString());

//         // Send to backend (debounced for performance)
//         sendProgress(progress);
//     }

//     // DEBOUNCE BACKEND CALL
//     let timeout: any = null;
//     function sendProgress(progress: number) {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => {
//             fetch(`https://team-7-api.onrender.com/library/books/${id}/progress/`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ progress }),
//             });
//         }, 800); // send every 0.8 sec (not too often)
//     }

//     return (
//         <div className="min-h-screen bg-white">

//             {/* Header */}
//             <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
//                 <button
//                     onClick={() => navigate(-1)}
//                     className="p-2 bg-white rounded-full shadow"
//                 >
//                     <ChevronLeft size={20} />
//                 </button>
//                 <h2 className="font-semibold text-lg">{book.title}</h2>
//             </div>

//             {/* PDF Viewer */}
//             <div
//                 ref={scrollContainerRef}
//                 className="h-[90vh] overflow-y-auto p-2"
//                 onScroll={handleScroll}
//             >
//                 <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
//                     {Array.from({ length: numPages }, (_, i) => (
//                         <Page
//                             key={i}
//                             pageNumber={i + 1}
//                             width={window.innerWidth * 0.92}
//                             renderAnnotationLayer={false}
//                             renderTextLayer={false}
//                         />
//                     ))}
//                 </Document>
//             </div>
//         </div>
//     );
// }
