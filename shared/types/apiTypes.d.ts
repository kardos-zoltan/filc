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