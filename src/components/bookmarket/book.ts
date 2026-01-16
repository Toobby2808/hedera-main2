

export interface Book {
    id: string | number;
    title: string;
    author?: string;
    uploader?: string;
    price: number | string;
    image?: string;
    description?: string;
    uploaded_by: {
        id: number;
        username: string;
    };
    is_free: boolean;
    progress?: number;
    category?: number;
    created_at: string;
    timeAgo?: string;
    file: string;
    chapter?: {
        current: number;
        total: number;
    };
    relatedBooks?: Book[];
}



