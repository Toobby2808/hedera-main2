import { useParams, useNavigate } from "react-router-dom";
import { useBook } from "./hooks/usebookId";
import ProgressBar from "./components/progressBar";
import CTAButton from "./components/CTAButton";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Trophy } from "lucide-react";
import type { Book } from "./book";

export default function BookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { book: apiBook, loading } = useBook(id || "");
    const [localBook, setLocalBook] = useState<any>(null);
    const [hasPaid, setHasPaid] = useState(false);




    // ✅ Check API and fallback to localStorage
    useEffect(() => {
        if (apiBook) return;
        const saved = JSON.parse(localStorage.getItem("uploadedBooks") || "[]");
        const found = saved.find((b: any) => b.id === id);
        if (found) setLocalBook(found);
    }, [apiBook, id]);

    const book = apiBook || localBook;

    // ✅ Check if user has already paid
    useEffect(() => {
        const paidBooks = JSON.parse(localStorage.getItem("paidBooks") || "[]");
        if (paidBooks.includes(id)) {
            setHasPaid(true);
        }
    }, [id]);


    useEffect(() => {
        if (book && !book.relatedBooks) {
            const allBooks = JSON.parse(localStorage.getItem("uploadedBooks") || "[]");

            const related = allBooks
                .filter(
                    (b: Book) =>
                        b.category === book.category && b.id !== book.id
                )
                .slice(0, 3);

            setLocalBook({ ...book, relatedBooks: related });
        }
    }, [book]);

    // ✅ Download handler
    const handleDownload = useCallback(() => {
        if (!book?.file && !book?.coverUrl)
            return alert("No file available");
        window.open(book.file || book.coverUrl, "_blank");
    }, [book]);

    // ✅ Payment handler (simulate)
    const handlePayment = useCallback(() => {
        // Simulate payment success
        alert("✅ Payment successful! You can now read this book.");
        const paidBooks = JSON.parse(localStorage.getItem("paidBooks") || "[]");
        if (!paidBooks.includes(id)) {
            paidBooks.push(id);
            localStorage.setItem("paidBooks", JSON.stringify(paidBooks));
        }
        setHasPaid(true);
    }, [id]);

    // ✅ Continue reading
    const handleContinueReading = useCallback(() => {
        if (!hasPaid && !book.is_free) {
            return alert("⚠️ You need to complete payment before reading this book.");
        }
        navigate(`/reader/${book?.id}`);
    }, [navigate, book, hasPaid]);

    if (loading && !localBook)
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!book)
        return <div className="min-h-screen flex items-center justify-center text-red-600">Book not found</div>;

    const isFree = book.price === "Free" || book.is_free === true;
    const uploader = book.uploader || book.uploaded_by?.username || "Unknown uploader";
    const priceDisplay = isFree ? "Free" : book.price;
    const image =
        book.coverUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=ECFDF5&color=10B981`;

    const progress = Number(localStorage.getItem(`reading-progress-${book.id}`)) || 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E8FFF4] to-white">
            <div className="max-w-md mx-auto py-6 px-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/60">
                        <ChevronLeft size={22} />
                    </button>
                    <div className="text-sm text-gray-700">Book Marketplace</div>
                </div>

                {/* Book Card */}
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div>
                        <img src={image} alt={book.title} className="w-full h-[24.5rem] rounded-lg object-cover" />
                        <div className="flex justify-between mt-2">
                            <div>
                                <h1 className="font-bold text-lg">{book.title}</h1>
                                <div className="text-xs text-gray-500 mt-1">Uploaded by: {uploader}</div>
                            </div>
                            <div className="mt-2 text-xs font-semibold bg-[#0576E6] py-2 px-4 text-white rounded-lg">
                                {priceDisplay}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-sm bg-[#D9D9D9] rounded-lg p-4 text-gray-700">
                        <p>{book.description || "No description available."}</p>
                    </div>

                    <div className="mt-4">
                        <CTAButton
                            label={isFree ? "Download" : hasPaid ? "Paid ✅" : "Make Payment"}
                            onClick={isFree ? handleDownload : handlePayment}
                            disabled={isFree ? false : hasPaid}
                        />
                    </div>

                    {/* Reading Section */}
                    <div className="mt-5 p-3 bg-[#D9D9D9] rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-lg">Read Online</div>
                                <div className="text-xs text-gray-500">
                                    Online reading comes with token rewards. Complete the book to claim your tokens and
                                    monitor your progress as you read.
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 p-4 bg-white rounded-lg shadow-md">
                            <h4 className="text-[#00C317] mb-2 text-sm font-semibold">Your progress</h4>
                            <ProgressBar percent={progress} />
                        </div>

                        <div className="mt-3">
                            <CTAButton
                                label="Start Reading"
                                onClick={handleContinueReading}
                                disabled={!isFree && !hasPaid}
                            />
                        </div>
                        <div className="w-full text-right mt-2">
                            <a href="#" className="text-sm text-[#1976D2]">Claim rewards?</a>
                        </div>



                    </div>

                    {/* Assessment Section */}
                    <div className="mt-5 p-3 bg-[#D9D9D9] rounded-lg">
                        <div className="flex gap-2 items-center mb-4">
                            <Trophy size={24} color="#FBBF24" />
                            <p className="text-sm">
                                Earn <span className="text-[#00C317] font-semibold">100 tokens</span> after completing
                                this book and passing the short reading assessment.
                            </p>
                        </div>
                        <CTAButton
                            label="Take Assessment"
                            onClick={handleContinueReading}
                            disabled={!isFree && !hasPaid}
                        />
                    </div>
                    {/* Related books section */}
                    <div className="mt-6">
                        <h1 className="font-bold text-lg mb-3">Related books</h1>

                        {book.relatedBooks && book.relatedBooks.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {book.relatedBooks.slice(0, 3).map((related: any) => (
                                    <div
                                        key={related.id}
                                        onClick={() => navigate(`/book/${related.id}`)}
                                        className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer p-2"
                                    >
                                        <img
                                            src={
                                                related.image ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    related.title
                                                )}&background=E0F2FE&color=0284C7`
                                            }
                                            alt={related.title}
                                            className="w-full h-28 object-cover rounded-md"
                                        />
                                        <p className="text-xs font-semibold mt-2 truncate">{related.title}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">No related books found.</div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
