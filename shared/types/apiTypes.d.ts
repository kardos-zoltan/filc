type User = {
    id: number,
    name: string
};

type Course = {
    id: number,
    name: string,
    role: string
    average: number | null,
    teacherId: number,
    teacherName: string,
    studentCount: number
}

type Post = {
    id: number,
    content: string,
    type: string,
    userId: number,
    posted_at: string,
    author: string,
    completedAt: null | Date
}

type Comment2 = {
    id: number,
    postId: number,
    author: string
    content: string
}