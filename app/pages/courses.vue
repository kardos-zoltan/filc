<script setup lang="ts">
    import { FetchError } from "ofetch";

    definePageMeta({
        middleware: ["auth"]
    });

    useHead({
        title: 'Kurzusok',
    });

    const courses = await useFetch<Course[]>("/api/course");
    const coursesData = courses.data;

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
            <!-- Display average for this course, if it exists -->
            <div 
                class="
                    ms-2 px-2 w-auto border-0 bg-btn-secondary d-flex justify-content-center 
                    align-items-center user-select-none
                " 
                v-if="course.average != null"
            >
                <div 
                    class="bg-white average d-flex align-items-center justify-content-center rounded-pill"
                >
                    <div v-if="course.average !== 0">{{ course.average }}</div>
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

            <ul class="dropdown-menu bg-secondary bg-opacity-25 p-0 rounded-5">
                <li class="dropdown-item p-1">
                    <button 
                        class="btn btn-secondary text-link-secondary bg-opacity-0 px-2 w-100 rounded-pill"
                        @click="modal?.open()"
                    >
                        Kurzusba belépés
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