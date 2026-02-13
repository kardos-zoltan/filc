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
    teacherName: string
}

type Post = {
    id: number,
    content: string,
    type: string,
    user_id: number
}