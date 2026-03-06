<script setup lang="ts">
    import { FetchError } from "ofetch";
    import QuizPost from '~/components/QuizPost.vue';

    const route = useRoute();

    const courses = await useFetch("/api/course");
    const coursesData = courses.data;

    const currentCourse = computed(
        () => coursesData.value?.find(x => x.id === Number(route.params.id))
    );

    const posts = await useFetch(`/api/course/${route.params.id}/post`);
    const postsData = computed(() => posts.data.value?.map(x => ({ ...x, posted_at: new Date(x.postedAt)})));

    function usePromise<T>(promise: Promise<T>): Ref<null | T> {
        const res = ref<any>(null)
        promise.then(x => res.value = x);

        return res;
    }

    const comments = computed(
        () => postsData.value?.map(
            x => ({ 
                post_id: x.id, 
                data: usePromise(
                    $fetch<unknown>(`/api/course/${route.params.id}/post/${x.id}/comment`) as Promise<Comment2[]>
                ) 
            })
        ) ?? []
    );

    const modal = useTemplateRef("modal");

    const courseCode = ref("");
    const codeError = ref<string | null>(null);

    async function joinCourse() {
        try {
            const res = await $fetch("/api/course/join", {
                method: "POST",
                body: { join_code: courseCode.value }
            });

            await navigateTo(`/course/${res}`);
        } catch (e: unknown) {
            const err = e as FetchError;
        
            if (err.status === 404) {
                codeError.value = "A kurzus nem található vagy nem létezik!";
            }
        }
    }
</script>

<template>
    <Modal ref="modal">
        <!-- Erorr message -->
        <div 
            class="row w-auto mb-4 bg-danger bg-opacity-50 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 border"
            v-if="codeError != null" 
        >
            <p class="m-0">{{ codeError }}</p>
        </div>

        <div class="rounded-4 border bg-secondary p-4 d-flex flex-column gap-2">
            <div class="row justify-content-center">
                <p class="w-auto fs-3 m-0 text-link-secondary">Kurzusba belépés</p>
            </div>
            <div class="row justify-content-center mb-2">
                <input type="text" class="form-control w-auto" v-model="courseCode">
            </div>

            <div class="row justify-content-center">
                <button 
                    class="btn w-auto border btn-primary text-link-primary me-2"
                    @click="joinCourse()"
                >
                    Belépés
                </button>

                <button 
                    class="btn w-auto border btn-secondary text-link-secondary border"
                    @click="modal?.close()"
                >
                    Mégsem
                </button>
            </div>
        </div>
    </Modal>

    <div class="container-fluid">
        <div class="d-flex">
            <div class="w-auto">
                <!-- Sidebar -->
                <div
                    class="row mt-3 ms-2 courses"
                    v-for="course in coursesData"
                >
                    <!-- Course information + navigation -->
                    <NuxtLink
                        :to="`/course/${course.id}`"
                        class="course-name btn border-0 rounded-start-pill h-auto d-flex align-items-center justify-content-start"
                        :class="course.id === currentCourse?.id ? 'btn-primary' : 'btn-secondary'"
                        :disabled="course.id !== currentCourse?.id"
                        :style="{
                            pointerEvents: course.id === currentCourse?.id ? 'none' : 'all',
                        }"
                    >
                        <div class="me-3">
                            <img src="~/assets/img/logo.svg" alt="" class="img-thumbnail image">
                        </div>
                        <div
                            class="d-flex flex-column text-start overflow-hidden"
                            :class="course.id === currentCourse?.id ? 'text-link-primary' : 'text-link-secondary'"
                        >
                            <p class="m-0 text-nowrap text-truncate">{{ course.name }}</p>
                            <p class="m-0 fs-8 opacity-50">{{ course.teacherName }}</p>
                        </div>
                    </NuxtLink>
                </div>
                <!-- Add course button -->
                <div class="row mt-3 ms-2 height courses">
                    <button 
                        class="
                            course-name btn btn-secondary border-0 rounded-pill h-auto d-flex 
                            align-items-center justify-content-center opacity-50
                        "
                        @click="modal?.open()"
                    >
                        <span 
                            class="text-center m-0 text-black d-flex align-items-center"
                            style="height: 40px;"
                        >
                            <span>+</span>
                        </span>
                    </button>
                </div>
            </div>
            <!-- Main course display -->
            <div class="container-fluid vh-100 py-3 px-2">
                <div
                    class="
                        bg-danger bg-opacity-25 h-100 rounded-end-5 border border-5 row overflow-y-auto
                        d-flex justify-content-center align-items-center
                    "
                    v-if="courses.error.value"
                >
                    <h1 class="w-auto">Hiba történt a kurzus betöltésével</h1>
                </div>

                <div
                    class="bg-secondary h-100 rounded-end-5 border border-5 row overflow-y-auto"
                    v-else
                >
                    <!-- Average or student count display -->
                    <div 
                        class="p-3"
                        style="max-width: 160px;"
                    >
                        <!-- Display average if student-->
                        <div 
                            class="bg-secondary rounded-4 border d-flex justify-content-center align-items-center flex-column py-2"
                            v-if="currentCourse?.role === 'student'"
                        >
                            <p class="fs-3 mb-0 text-center">Átlag</p>
                            <div class="bg-white average d-flex align-items-center justify-content-center rounded-circle fs-5">
                                <div v-if="currentCourse?.average !== 0">{{ currentCourse.average }}</div>
                                <div v-else>...</div>
                            </div>
                            <NuxtLink class="mt-2 text-center lh-sm">Jegyek megtekintése</NuxtLink>
                        </div>

                        <!-- Display student count if teacher-->
                        <div 
                            class="bg-secondary rounded-4 border d-flex justify-content-center align-items-center flex-column py-2"
                            v-if="currentCourse?.role === 'teacher'"
                        >
                            <p class="fs-3 mb-0 text-center">Tanulók</p>
                            <div class="bg-white average d-flex align-items-center justify-content-center rounded-circle fs-5">
                                <!-- <div>{{ currentCourse?.studentCount }}</div> -->
                            </div>
                            <NuxtLink class="mt-2 text-center lh-sm">Tanulók megtekintése</NuxtLink>
                        </div>
                    </div>

                    <!-- Posts -->
                    <div class="col p-3">
                        <!-- Post creator textbox -->
                        <div class="bg-primary rounded-4 d-flex flex-column" style="min-height: 200px;">
                            <textarea 
                                class="form-control bg-transparent rounded-4 rounded-bottom-0 flex-grow-1 text-link-primary border-0 textarea p-3" 
                                placeholder="Írj ide..."
                            />
                            <div class="border-top border-white mx-2 py-2 d-flex">
                                <button class="btn btn-transparent text-link-primary rounded-3">+</button>
                                <button class="btn btn-transparent text-link-primary rounded-3 ms-auto">Küldés</button>
                            </div>
                        </div>
                        <!-- Display posts -->
                        <div
                            class="bg-secondary rounded-4 mt-4"
                            v-for="post in postsData?.sort((a, b) => b.posted_at.getTime() - a.posted_at.getTime())"
                        >
                            <div class="bg-secondary p-2 fs-6 d-flex align-items-center rounded-4 rounded-bottom-0">
                                <img src="~/assets/img/logo.svg" alt="" class="img-thumbnail profile-image me-2">
                                {{ post.author }}
                                <div class="ms-auto me-1">{{ Intl.DateTimeFormat(undefined, { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).format(post.posted_at) }}</div>
                            </div>
                            <div class="p-3">
                                <!-- Display text post -->
                                <div v-if="post.type === 'text'">
                                    {{ post.content }}
                                    <hr class="my-2">
                        
                                    <div
                                        class="bg-secondary p-2 mb-1 rounded-3"
                                        v-for="comment in comments.find(x => x.post_id === post.id)?.data.value"
                                    >
                                        <span class="bgsecondary p-1 px-2 rounded-3 me-1">
                                            {{ comment.author }}
                                        </span>
                        
                                        <span>{{ comment.content }}</span>
                                    </div> 
                                    <a class="text-primary opacity-25">Komment hozzáadása</a>
                                </div>

                                <!- - Display quiz post - ->
                                <div class="" v-if="post.type === 'quiz'">
                                    <QuizPost :post />
                                </div>
                            </div>
                        </div> 
                    </div>

                    <!-- Display due tasks if student -->
                    <div 
                        class="p-3" 
                        style="width: 320px;"
                        v-if="currentCourse?.role === 'student'"
                    >
                        <div class="bg-secondary rounded-4 d-flex justify-content-center align-items-center flex-column">
                            <div class="bg-secondary text-center w-100 rounded-4 rounded-bottom-0 fs-4 py-2">Feladatok</div>
                            <div v-if="postsData?.filter(x => x.completedAt).length == 0">
                                <p class="my-3">Nincsenek megcsinálandó feladatok!</p>
                            </div>
                            <div
                                class="p-3 w-100"
                                v-for="post in postsData?.filter(x => x.completedAt)"
                            >
                                <QuizPost :post/>
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .textarea {
        resize: none;
    }

    .textarea::placeholder {
        color: var(--bs-body-bg);
        opacity: 0.5
    }

    .average {
        width: 50px;
        height: 50px;
    }

    /* Select the last item of courses, if it isn't the first */
    .courses>:nth-last-child(1):not(:nth-child(1)) {
        border-top-right-radius: var(--bs-border-radius-pill);
        border-bottom-right-radius: var(--bs-border-radius-pill);
        padding-right: 20px;
    }

    .bg-btn-secondary {
        background-color: rgba(100, 116, 139, 0.15);
    }

    .bg-red {
        background-color: #E18C8C;
    }

    .course-name {
        width: 225px;
    }

    .image {
        height: 40px;
        width: 40px;
        border-radius: 50%;
    }

    .profile-image {
        height: 30px;
        width: 30px;
        border-radius: 50%;
    }
</style>