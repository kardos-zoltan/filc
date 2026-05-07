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
    completed_at: null | Date
}

type Comment2 = {
    id: number,
    postId: number,
    author: string,
    content: string,
    userId: number
}

type Student = {
    user_id: number,
    name: string,
    average: number,
    grades: Grade[]
}

type Grade = {
    id: number,
    name: string,
    grade: number,
    weight: number,
    date: string
}