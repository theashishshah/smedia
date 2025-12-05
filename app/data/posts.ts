export type Post = {
    id: string;
    author: { name: string; handle: string; avatar: string };
    createdAt: string;
    content: string;
    image?: string;
    stats: { replies: number; reposts: number; likes: number; views: number };
};

export const demoPosts: Post[] = [
    {
        id: "1",
        author: {
            name: "Ashish Shah",
            handle: "@theashishshahh",
            avatar: "https://avatars.githubusercontent.com/u/0?v=4",
        },
        createdAt: new Date().toISOString(),
        content: "Shipped auth + feed skeleton for smedia today. Next up: image upload & realtime!",
        image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop",
        stats: { replies: 12, reposts: 3, likes: 148, views: 5400 },
    },
    {
        id: "2",
        author: {
            name: "Piyush",
            handle: "@piyushcodes",
            avatar: "https://i.pravatar.cc/80?img=5",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        content: "RSC makes dashboards so much faster. Also trying out React 19!",
        stats: { replies: 4, reposts: 2, likes: 57, views: 2100 },
    },
    {
        id: "3",
        author: {
            name: "Build In Public",
            handle: "@bip",
            avatar: "https://i.pravatar.cc/80?img=12",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        content: "Tip: keep your components small and composable. Your future self will thank you.",
        stats: { replies: 1, reposts: 0, likes: 12, views: 800 },
    },
];
