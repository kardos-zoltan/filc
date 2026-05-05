<script setup lang="ts">
    import { FetchError } from "ofetch";
    import QuizPost from '~/components/QuizPost.vue';
    import ConfirmModal from '~/components/ConfirmModal.vue';
    import InputModal from "~/components/InputModal.vue";
    import StudentsModal from "~/components/StudentsModal.vue";

    definePageMeta({
        middleware: ["auth"]
    });

    const route = useRoute();

    const user = useUserStore();
    await callOnce(user.fetch);

    const courses = await useFetch("/api/course");
    const coursesData = courses.data;

    const currentCourse = computed(
        () => coursesData.value?.find(x => x.id === Number(route.params.id))
    );

    const posts = await useFetch(`/api/course/${route.params.id}/post`);
    const postsData = computed(() => posts.data.value?.map(x => ({ ...x, posted_at: new Date(x.posted_at)})));
    const postContent = ref("");

    function usePromise<T>(promise: Promise<T>): Ref<null | T> {
        const res = ref<any>(null)
        promise.then(x => res.value = x);

        return res;
    };

    const students = 
        (currentCourse?.value?.role == "teacher") 
        ? useFetch(`/api/course/${route.params.id}/students` as "/api/course/:course_id/students")
        : ref(undefined);

    async function sendPost() {
        try {
            await $fetch(`/api/course/${route.params.id}/post/text`, {
                method: "POST",
                body: {content: postContent.value}
            })

            posts.refresh();
            postContent.value = "";
        } catch (e: unknown) {
            codeError.value = "Hiba a posztolás során!";
        }
    };

    const selectedId = ref(0);
    const selectedComment = ref(0);
    
    async function editPost() {
        if (inputValue.value == "") {
            resetInputModal(false);
            setupDeleteModal(selectedId.value);
        } else {
            try {
                await $fetch(`/api/course/${route.params.id}/post/${selectedId.value}/text`, {
                    method: "PATCH",
                    body: {content: inputValue.value}
                });
                resetInputModal();
                posts.refresh();
            } catch (e: unknown) {
                codeError.value = "Hiba a módosítás során!";
            }
        }
    }


    async function deletePost() {
        try {
            await $fetch(`/api/course/${route.params.id}/post/${selectedId.value}`, {
                method: "DELETE"
            });
            resetConfirmModal();
            posts.refresh();
        } catch (e: unknown) {
            codeError.value = "Hiba a törlés során!";
        }
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

    const isAddingComment = ref(false);
    const commentInput = ref("");

    async function toggleAddingComment() {
        if (isAddingComment.value) {
            isAddingComment.value = false;
        } else {
            isAddingComment.value = true;
        }

        commentInput.value = "";
    }

    async function submitComment(postId: number) {
        try{
            await $fetch(`/api/course/${route.params.id}/post/${postId}/comment`, {
                method: "POST",
                body: {content: commentInput.value}
            });
            toggleAddingComment();
            posts.refresh();
        } catch(e : unknown) {
            const err = e as FetchError;
        
            codeError.value = err.message;
            alert(codeError.value)
        }
    }

    const courseCode = ref("");
    const codeError = ref<string | null>(null);

    async function joinCourse() {
        try {
            const res = await $fetch("/api/course/join", {
                method: "POST",
                body: { join_code: courseCode.value }
            });

            await navigateTo(`/course/${res}`);

            courses.refresh();
        } catch (e: unknown) {
            const err = e as FetchError;
        
            if (err.status === 404) {
                codeError.value = "A kurzus nem található vagy nem létezik!";
            }
        }
    }

    async function createCourse() {
        try {
            const res = await $fetch("/api/course", {
                method: "POST",
                body: { name: inputValue.value }
            });

            await navigateTo(`/course/${res}`);

            courses.refresh();
        } catch (e: unknown) {
            const err = e as FetchError;
        
            if (err.status === 404) {
                codeError.value = "A kurzus nem található vagy nem létezik!";
            }
        }
    }

    async function logout() {
        try {
            await $fetch("/api/auth/logout");

            await navigateTo("/", {
                replace: true
            });

            window.location.reload();
        } catch {}
    }
    
    async function leaveCourse() {
        try {
            await $fetch(`/api/course/${route.params.id}/leave`, {
                method: "GET"
            });
            await navigateTo(`/courses/`)
        } catch (e: unknown) {
            codeError.value = "Hiba a kilépés során, próbálja újra!"
        }

    }

    async function deleteCourse() {
        try {
            await $fetch(`/api/course/${route.params.id}/`, {
                method: "DELETE"
            });
            await navigateTo(`/courses/`)
        } catch (e: unknown) {
            codeError.value = "Hiba a törlés során, próbálja újra!"
        }
    }


    async function editComment() {
        if (inputValue.value == "") {
            resetInputModal(false);
            setupDeleteModal(selectedId.value,selectedComment.value, "Komment");
        } else {
            try {
                await $fetch(`/api/course/${route.params.id}/post/${selectedId.value}/comment/${selectedComment.value}`, {
                    method: "PATCH",
                    body: {content: inputValue.value}
                });
                resetInputModal();
                posts.refresh();
            } catch (e: unknown) {
                codeError.value = "Hiba a módosítás során!";
            }
        }
    }

    async function deleteComment() {
        try {
            await $fetch(`/api/course/${route.params.id}/post/${selectedId.value}/comment/${selectedComment.value}`, {
                method: "DELETE"
            });
            resetConfirmModal();
            posts.refresh();
        } catch (e: unknown) {
            codeError.value = "Hiba a törlés során!";
        }
    }

    const question = ref("");
    const confirmText = ref("");
    const confirmFunction = ref();

    const confirmModal = ref<InstanceType<typeof ConfirmModal> | null>(null);

    const inputLabel = ref("");
    const inputValue = ref("");
    const textArea = ref(false);
    const isNumber = false;

    const inputModal = ref<InstanceType<typeof InputModal> | null>(null);

    async function resetConfirmModal() {
        codeError.value = null;
        question.value = "";
        confirmText.value = "";
        confirmFunction.value = null;
        selectedId.value = 0;

        confirmModal.value?.close();
    }

    async function resetInputModal(resetSelectedIds : boolean = true) {
        codeError.value = null;
        question.value = "";
        confirmText.value = "";
        confirmFunction.value = null;
        inputLabel.value = "";
        inputValue.value = "";
        textArea.value = false;

        if (resetSelectedIds) {
            selectedId.value = 0;
            selectedComment.value = 0;
        }

        inputModal.value?.close();
    }

        
    async function setupDeleteModal(id: number, commentId: number | null = null, type: string | null = "Poszt") {
        question.value = type + " törlése";
        confirmText.value = "Törlés";
        confirmFunction.value = type == "Poszt" ? deletePost : deleteComment;
        selectedComment.value = commentId ?? 0;
        selectedId.value = id;

        confirmModal.value?.open();
    }

    async function setupLeaveOrDeleteModal(role: string) {
        let isTeacher = role == "teacher";

        question.value = isTeacher ? "Biztos, hogy ki akarja törölni ezt a kurzust?" : "Biztos, hogy ki akar lépni ebből a kurzusból?";
        confirmText.value = isTeacher ? "Törlés" : "Kilépés";       
        confirmFunction.value = isTeacher ? deleteCourse : leaveCourse;

        confirmModal.value?.open();
    }

    async function setupJoinModal() {
        question.value = "Belépés kurzusba";
        confirmText.value = "Belépés";
        confirmFunction.value = joinCourse;
        inputLabel.value = "Kurzus belépési kód:"
        textArea.value = false;

        inputModal.value?.open();
    }

    async function setupCreateModal() {
        question.value = "Kurzus létrehozása";
        confirmText.value = "Létrehozás";
        confirmFunction.value = createCourse;
        inputLabel.value = "Kurzus neve:";
        textArea.value = false;

        inputModal.value?.open();
    }

    async function setupEditModal(id : number, commentId: number | null = null, content: string, type: string | null = "Poszt") {
        question.value = type + " módosítása";
        confirmText.value = "Módosítás";
        confirmFunction.value = type == "Poszt" ? editPost : editComment;
        inputLabel.value = "";
        inputValue.value = type == "Poszt" ? JSON.parse(content) : content; 
        textArea.value = type == "Poszt" ? true : false;
        selectedId.value = id;
        selectedComment.value = commentId ?? 0;

        inputModal.value?.open();
    }

    const studentsModal = ref<InstanceType<typeof ConfirmModal> | null>(null);
        
    async function showStudentsModal() {
        studentsModal.value?.open();
    } 
</script>

<template>

    <ConfirmModal ref="confirmModal"
                 :error="codeError"
                 :question="question"
                 :confirm-text="confirmText"
                 :confirm-function="confirmFunction ?? deletePost"
                 :cancel-function="resetConfirmModal"></ConfirmModal>

    <InputModal ref="inputModal"
                v-model="inputValue"
                :error="codeError"
                :question="question"
                :confirm-text="confirmText"
                :confirm-function="confirmFunction ?? joinCourse"
                :cancel-function="resetInputModal"
                :label="inputLabel"
                :textArea="textArea"
                :is-number="isNumber"></InputModal>

    <StudentsModal ref="studentsModal"
                   :students="students?.data.value"
                   :course-id="currentCourse?.id"></StudentsModal>
    
    <div class="container-fluid">
        <div class="d-flex">
            <div class="w-auto">
                <!-- user -->
                <div class="row mt-3 ms-2 courses dropend">
                    <button 
                        class="
                            course-name btn btn-primary text-link-primary border-0 rounded-3 h-auto d-flex 
                            align-items-center justify-content-start p-2 dropdown-toggle
                        "
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <div class="me-2">
                            <img 
                                src="~/assets/img/logo.svg" 
                                alt="" 
                                class="img-thumbnail" 
                                style="height: 30px; width: 30px;"
                            >
                        </div>
                        <div class="d-flex flex-column text-start overflow-hidden me-auto">
                            <span class="m-0 text-nowrap text-truncate text-link-primary">{{ user.name }}</span>
                        </div>
                    </button>

                    <ul class="dropdown-menu bg-dropdown p-0 ms-1 rounded-4 w-auto">
                        <li class="dropdown-item p-1">
                            <button 
                                class="btn btn-secondary bg-danger bg-opacity-50 border w-100 rounded-4"
                                @click="logout()"
                            >
                                <span class="text-link-secondary">Kijelentkezés</span>
                            </button>
                        </li>
                    </ul>
                </div>
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
                <div class="btn-group row mt-3 ms-2 height courses">
                    <button 
                        class="
                            course-name btn btn-secondary border-0 rounded-pill h-auto d-flex 
                            align-items-center justify-content-center opacity-50
                        "
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <span 
                            class="text-center m-0 text-black d-flex align-items-center"
                            style="height: 40px;"
                        >
                            <span>+</span>
                        </span>
                    </button>

                    <ul class="dropdown-menu bg-secondary bg-opacity-25 p-0 mt-1 rounded-4">
                        <li class="dropdown-item p-1 pb-0">
                            <button 
                                class="btn btn-secondary text-link-secondary bg-opacity-0 px-2 w-100 rounded-4 rounded-bottom-0"
                                @click="setupJoinModal()"
                            >
                                Kurzusba belépés
                            </button>
                        </li>
                        <li class="dropdown-item p-1">
                            <button 
                                class="btn btn-secondary text-link-secondary bg-opacity-0 px-2 w-100 rounded-4 rounded-top-0"
                                @click="setupCreateModal()"
                            >
                                Kurzus létrehozása
                            </button>
                        </li>
                    </ul>
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
                    <div 
                        class="p-3"
                        style="max-width: 160px;"
                    >
                        <!-- Average or student count display -->
                        <!-- Display average if student-->
                        <div 
                            class="bg-secondary rounded-4 border d-flex justify-content-center align-items-center flex-column py-2"
                            v-if="currentCourse?.role === 'student'"
                        >
                            <p class="fs-3 mb-0 text-center user-select-none">Átlag</p>
                            <div class="bg-amber-50 average d-flex align-items-center justify-content-center rounded-circle fs-5">
                                <div v-if="currentCourse?.average !== 0">{{ currentCourse.average }}</div>
                                <div v-else>...</div>
                            </div>
                            <NuxtLink class="mt-2 text-center lh-sm user-select-none">Jegyek megtekintése</NuxtLink>
                        </div>

                        <!-- Display student count if teacher-->
                        <div 
                            class="bg-secondary rounded-4 border d-flex justify-content-center align-items-center flex-column py-2"
                            v-if="currentCourse?.role === 'teacher'"
                        >
                            <p class="fs-3 mb-0 text-center user-select-none">Tanulók</p>
                            <div class="bg-amber-50 average d-flex align-items-center justify-content-center rounded-circle fs-5">
                                <div>{{ currentCourse?.studentCount ?? 0 }}</div>
                            </div>
                            <span class="mt-2 text-center lh-sm user-select-none"
                                  role="button"
                                  @click="showStudentsModal()"
                                  >
                                  Tanulók megtekintése
                                </span>
                        </div>
                        
                        <hr>

                        <!-- Leave or delete button -->
                        <button 
                            class="btn bg-danger bg-opacity-50 rounded-3 p-3 py-2 border w-100"
                            @click="setupLeaveOrDeleteModal(currentCourse?.role ?? 'student')"
                        >
                            {{ currentCourse?.role == 'teacher' ? 'Kurzus törlése' : 'Kilépés'}}
                        </button>

                    </div>


                    <!-- Posts -->
                    <div class="col p-3">
                        <!-- Post creator textbox -->
                        <div class="bg-primary rounded-4 d-flex flex-column" style="min-height: 200px;">
                            <textarea 
                                class="form-control bg-transparent rounded-4 rounded-bottom-0 flex-grow-1 text-link-primary border-0 textarea p-3" 
                                placeholder="Írj ide..."
                                v-model="postContent"
                            />
                            <div class="border-top border-white mx-2 py-2 d-flex">
                                <div 
                                    class="dropdown"
                                    v-if="user.id === currentCourse?.teacherId"
                                >
                                    <button
                                        class="btn btn-transparent text-link-primary rounded-3"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        +
                                    </button>
                                
                                    <ul class="dropdown-menu bg-dropdown p-0 rounded-4 w-auto">
                                        <li class="dropdown-item p-1">
                                            <NuxtLink 
                                                class="btn btn-secondary border w-100 rounded-4"
                                                :to="`/course/${route.params.id}/quiz/create`"
                                            >
                                                <span class="text-link-secondary">
                                                    <i class="fa-solid fa-clipboard"></i>
                                                    Kvíz létrehozása
                                                </span>
                                            </NuxtLink>
                                        </li>
                                    </ul>
                                </div>

                                <button class="btn btn-transparent text-link-primary rounded-3 ms-auto"
                                        @click="sendPost()">Küldés</button>
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
                                <div class="px-1">
                                    <i class="fa-solid fa-pen-to-square me-1"
                                       v-if="post.userId == user.id"
                                       @click="setupEditModal(post.id, null, post.content, 'Poszt')"
                                       role="button"></i>
                                    <i class="fa-solid fa-trash"
                                       v-if="post.userId == user.id ||
                                             currentCourse?.role == 'teacher'"
                                       @click="setupDeleteModal(post.id, null, 'Poszt')"
                                       role="button"></i>
                                </div>
                            </div>
                            <div class="p-3">
                                <!-- Display text post -->
                                <div v-if="post.type === 'text'">
                                    <p class="m-0" v-for="line in JSON.parse(post.content).split('\n')">
                                        {{ line }}
                                    </p>
                                    <hr class="my-2">
                        
                                    <div
                                        class="bg-secondary p-2 mb-1 rounded-3 d-flex"
                                        v-for="comment in comments.find(x => x.post_id === post.id)?.data.value"
                                    >
                                        <div class="col-9">
                                            <span class="bg-secondary p-1 px-2 rounded-3 me-1">
                                                {{ comment.author }}
                                            </span>
                                            <span>{{ comment.content }}</span>
                                        </div>
                                        <div class="d-flex justify-content-end col-3 align-items-end">
                                            
                                            <span>
                                                <i class="fa-solid fa-pen-to-square me-1"
                                                    v-if="comment.userId == user.id"
                                                    @click="setupEditModal(post.id, comment.id, comment.content, 'Komment')"
                                                    role="button"></i>
                                            
                                                <i class="fa-solid fa-trash"
                                                    v-if="comment.userId == user.id ||
                                                          currentCourse?.role == 'teacher'"
                                                @click="setupDeleteModal(post.id, comment.id, 'Komment')"
                                                role="button"></i>
                                            </span>
                                        </div>
                                    </div> 
                                    <a class="text-primary opacity-25 user-select-none"
                                       @click="toggleAddingComment()"
                                       role="button"
                                       v-if="!isAddingComment">
                                        Komment hozzáadása
                                    </a>
                                    <div v-if="isAddingComment" class="d-flex">
                                        <input type="text" v-if="isAddingComment" class="form-control" v-model="commentInput">
                                        <div class="d-flex justify-content-center align-items-center px-2 gap-2">
                                            <i class="fa-solid fa-paper-plane"
                                               @click="submitComment(post.id)"></i>
                                            <i class="fa-solid fa-x"
                                               @click="toggleAddingComment()"></i>
                                        </div>
                                    </div>
                                </div>

                                <!-- Display quiz post -->
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
                                <p class="my-3">Nincsenek teendő feladatok!</p>
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
    .add-question:hover {
        filter: brightness(0);
    }

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
    .courses>:nth-last-child(1):not(:nth-child(1)):not(.dropdown-menu) {
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

    .bg-amber-50 {
        background-color: rgba(255, 248, 225)
    }
</style>