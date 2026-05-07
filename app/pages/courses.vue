<script setup lang="ts">
    import { FetchError } from "ofetch";
    import InputModal from "~/components/InputModal.vue";

    definePageMeta({
        middleware: ["auth"]
    });

    useHead({
        title: 'Kurzusok',
    });

    const user = useUserStore();
    await callOnce(user.fetch);

    const courses = await useFetch<Course[]>("/api/course");
    const coursesData = courses.data;

    const codeError = ref<string | null>(null);

    async function joinCourse() {
        console.log(inputValue.value)
        try {
            const res = await $fetch("/api/course/join", {
                method: "POST",
                body: { join_code: inputValue.value }
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
    
    const question = ref("");
    const confirmText = ref("");
    const confirmFunction = ref();

    const inputLabel = ref("");
    const inputValue = ref("");
    const textArea = ref(false);

    const inputModal = ref<InstanceType<typeof InputModal> | null>(null);

    async function setupCreateModal() {
        question.value = "Kurzus létrehozása";
        confirmText.value = "Létrehozás";
        confirmFunction.value = createCourse;
        inputLabel.value = "Kurzus neve:";
        textArea.value = false;

        inputModal.value?.open();
    }
    
    async function setupJoinModal() {
        question.value = "Belépés kurzusba";
        confirmText.value = "Belépés";
        confirmFunction.value = joinCourse;
        inputLabel.value = "Kurzus belépési kód:"
        textArea.value = false;

        inputModal.value?.open();
    }

    async function resetInputModal() {
        codeError.value = null;
        question.value = "";
        confirmText.value = "";
        confirmFunction.value = null;
        inputLabel.value = "";
        inputValue.value = "";
        textArea.value = false;

        inputModal.value?.close();
    }
</script>

<template>
    <InputModal ref="inputModal"
                v-model="inputValue"
                :error="codeError"
                :question="question"
                :confirm-text="confirmText"
                :confirm-function="confirmFunction ?? joinCourse"
                :cancel-function="resetInputModal"
                :label="inputLabel"
                :textArea="textArea"
                :is-number="false"></InputModal>

    <div class="container-fluid">
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
            class="row mt-3 ms-2 height courses"
            v-for="course in coursesData"
        >
            <!-- Course information + navigation -->
            <NuxtLink 
                :to="`/course/${course.id}`" 
                class="
                    course-name btn btn-secondary border-0 rounded-start-pill h-auto d-flex 
                    align-items-center justify-content-start
                "
            >
                <div class="me-3">
                    <img src="~/assets/img/logo.svg" alt="" class="img-thumbnail image">
                </div>
                <div class="d-flex flex-column text-start overflow-hidden">
                    <p class="m-0 text-nowrap text-truncate">{{ course.name }}</p>
                    <p class="m-0 fs-8 opacity-50 text-nowrap text-truncate">{{ course.teacherName }}</p>
                </div>
            </NuxtLink>
            <!-- Display average for this course, if not teacher -->
            <div 
                class="
                    ms-2 px-2 w-auto border-0 bg-btn-secondary d-flex justify-content-center 
                    align-items-center user-select-none
                " 
                v-if="course.teacherId !== user.id"
            >
                <div 
                    class="bg-white average d-flex align-items-center justify-content-center rounded-pill"
                >
                    <div v-if="course.average !== 0">{{ course.average?.toFixed(2) }}</div>
                    <div v-else>...</div>
                </div>
                <p class="m-0 ms-2">Átlag</p>
            </div>
            <!-- Display number of due tasks -->
            <!-- TODO: figure out how to do this -->
            <!-- 
            <div 
                class="ms-2 ps-2 w-auto border-0 bg-red d-flex justify-content-center align-items-center user-select-none" 
                v-if="course.unfinishedTasks != 0"
            >
                <div class="me-2">
                    <img src="~/assets/img/danger.svg" alt="" class="image">
                </div>
                <div class="d-flex flex-column text-start overflow-hidden">
                    <p class="m-0">{{ course.unfinishedTasks }} sürgős feladat</p>
                </div>
            </div> 
            -->
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

            <ul class="dropdown-menu bg-dropdown p-0 mt-1 rounded-4">
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
</template>

<style scoped>
    .average {
        width: 40px;
        height: 40px;
    }

    /* Select the last item of courses, if it isn't the first */
    .courses>:nth-last-child(1):not(:nth-child(1)):not(.dropdown-menu) {
        border-top-right-radius: var(--bs-border-radius-pill);
        border-bottom-right-radius: var(--bs-border-radius-pill);
        padding-right: 20px !important;
    }

    .bg-btn-secondary {
        background-color: rgba(100, 116, 139, 0.15);
    }

    .bg-opacity-25 {
        --bs-bg-opacity: 0.25 !important;
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
</style>