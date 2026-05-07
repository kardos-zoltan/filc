<script setup lang="ts">
    import Modal from './Modal.vue'
    import StudentGradesModal from "~/components/StudentGradesModal.vue";
    import ConfirmModal from '~/components/ConfirmModal.vue';

    const modal = useTemplateRef("modal");
    const studentGradesModal = ref<InstanceType<typeof StudentGradesModal> | null>(null);
    const confirmModal = ref<InstanceType<typeof ConfirmModal> | null>(null);

    function open() {
        modal.value?.open();
    }

    function close() {
        modal.value?.close();
    }

    async function removeStudent() {
        try {
            $fetch(`/api/course/${props.courseId}/student/${selectedStudent.value?.user_id}/kick`, {
                method : "POST"
            })
            confirmModal.value?.close();
            close();
            await refreshNuxtData();
        }
        catch {
            codeError.value = "Hiba, próbálja újra később!"
        }
    }

    const selectedStudent = ref<Student>();
    const question = "Biztos, hogy ki akarja rúgni ezt a tanulót?";
    const confirmText = "Kirúgás";
    const codeError = ref("");

    defineExpose({
        open,
        close
    })

    const props = defineProps<{
        students: Student[] | undefined,
        courseId: number | undefined,
        studentToBeViewed: number
    }>();
    
    const inBackground = ref(false);
    const isTeacher = ref(true);

    const emit = defineEmits(["reset-student"]);

    // Make modal invisible when the other opens on top of it
    async function toggleBackground() {
        inBackground.value = !inBackground.value;
    }

    async function showStudentGradeModal(student: Student) {
        student.grades = (await $fetch(`/api/course/${props.courseId}/student/${student.user_id}/grades`)) as unknown as Grade[];
        
        selectedStudent.value = student;
        toggleBackground();
        studentGradesModal.value?.open();
    }

    async function setupConfirmModal(student: Student) {
        selectedStudent.value = student;
        confirmModal.value?.open();
    }

    // Show the student's own grades, not the overview meant for teachers
    watch(props, () => {
        if (props.studentToBeViewed != 0) {
            isTeacher.value = false;
            showStudentGradeModal(props.students?.find(student =>student.user_id == props.studentToBeViewed)!)
            emit("reset-student");
            close();
        }
    })
</script>
<template>
    <ConfirmModal ref="confirmModal"
                  :error="codeError"
                  :question="question"
                  :confirm-text="confirmText"
                  :confirm-function="removeStudent"
                  :cancel-function="() => confirmModal?.close()"></ConfirmModal>


    <StudentGradesModal ref="studentGradesModal"
                        :student="selectedStudent"
                        :course-id="courseId"
                        :is-teacher="isTeacher"
                        @toggle-background="toggleBackground()"
                        ></StudentGradesModal>

    <Modal ref="modal" class="w-50" :class="{'d-none': inBackground}"> 
        <table class="table table-responsive table-striped text-center table-bordered" v-if="isTeacher">
            <thead>
                <tr>
                    <th>Tanuló</th>
                    <th>Átlag</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="student in students" v-if="students?.length">
                    <td>{{ student.name }}</td>
                    <td>{{ student.average == 0 ? "-" : student.average }}</td>
                    <td>
                        <button class="btn btn-primary bg-opacity-50 w-auto border text-link-primary me-2"
                                role="button"
                                v-bind:disabled="student.average == 0"
                                @click="showStudentGradeModal(student)">
                            Jegyek megtekintése
                        </button>
                        <button class="btn bg-danger bg-opacity-50 w-auto border btn-secondary text-link-secondary me-2"
                                role="button"
                                @click="setupConfirmModal(student)">
                            Kirugás
                        </button>
                    </td>
                </tr>
                <tr v-if="!students?.length">
                    <td colspan="9999">
                        <h1 class="text-center mt-1">Nincs tanuló a kurzusban.</h1>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="d-flex justify-content-end">
            <button class="btn w-auto border btn-primary text-link-primary w-100 "
                    role="button"
                    @click="close()">
                Bezárás
            </button>
        </div>
    </Modal>
</template>