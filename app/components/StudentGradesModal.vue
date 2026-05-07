<script setup lang="ts">
    import InputModal from '~/components/InputModal.vue';
    import Modal from './Modal.vue'
    import ConfirmModal from '~/components/ConfirmModal.vue';

    const modal = useTemplateRef("modal");
    const confirmModal = ref<InstanceType<typeof ConfirmModal> | null>(null);
    const inputModal = ref<InstanceType<typeof InputModal> | null>(null);

    function open() {
        modal.value?.open();
    }

    function close() {
        toggleBackground()
        modal.value?.close();
    }

    const {
        student,
        courseId,
        isTeacher,
    } = defineProps<{
        student: Student | undefined,
        courseId: number |undefined,
        isTeacher: boolean
    }>();

    defineExpose({ open, close });

    const question = ref("");
    const confirmText = ref("");
    const codeError = ref("");
    const selectedGrade = ref<Grade>();
    const inputValue = ref("1");
    const inputLabel = "Módosítás";
    const textArea = false;
    const isNumber = true;

    async function setupDeleteModal(grade: Grade) {
        selectedGrade.value = grade;
        question.value = "Biztos, hogy ki akarja törölni ezt a jegyet?";
        confirmText.value = "Törlés";

        confirmModal.value?.open();
    }

    async function setupEditModal(grade: Grade) {
        selectedGrade.value = grade;
        question.value = "Jegy módosítása";
        confirmText.value = "Módosítás";

        inputModal.value?.open();
    }

    async function deleteGrade() {
        try {
            $fetch(`/api/course/${courseId}/student/${student?.user_id}/grade`, {
            method:"DELETE",
                body: {grade_id: selectedGrade.value?.id}
            })
        }
        catch {
            codeError.value = "Hiba, próbálja úrja később!";
        }
    }

    const emit = defineEmits(['toggle-background'])

    function toggleBackground() {
        emit('toggle-background');
    }

    async function modifyGrade() {
       try {
           $fetch(`/api/course/${courseId}/student/${student?.user_id}/grade`, {
           method:"PATCH",
               body: {grade_id: selectedGrade.value?.id, grade: inputValue.value}
           })
           resetInputModal();  
           await refreshNuxtData();
           close();
        }
        catch {
            codeError.value = "Hiba, próbálja úrja később!"
        }
     }

    async function resetInputModal() {
        inputValue.value = "1";
        inputModal.value?.close();
    }

</script>

<template>
    <ConfirmModal ref="confirmModal"
                  :error="codeError"
                  :question="question"
                  :confirm-text="confirmText"
                  :confirm-function="deleteGrade"
                  :cancel-function="() => confirmModal?.close()"></ConfirmModal>

    <InputModal ref="inputModal"
                v-model="inputValue"
                :error="codeError"
                :question="question"
                :confirm-text="confirmText"
                :confirm-function="modifyGrade"
                :cancel-function="resetInputModal"
                :label="inputLabel"
                :textArea="textArea"
                :is-number="isNumber"></InputModal>

    <Modal ref="modal" class="w-50">
        <table class="table table-responsive table-striped text-center table-bordered">
            <thead>
                <tr>
                    <th>Név</th>
                    <th>Jegy</th>
                    <th>Jegy súlya</th>
                    <th>Dátum</th>
                    <th v-if="isTeacher"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="grade in student?.grades">
                    <td>{{ grade.name }}</td>
                    <td> {{ grade.grade }}</td>
                    <td> {{ grade.weight * 100 }}%</td>
                    <td> {{ Intl.DateTimeFormat(undefined, { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(grade.date)) }}</td>
                    <td v-if="isTeacher">
                        <button class="btn btn-primary bg-opacity-50 w-auto border text-link-primary me-2"
                                role="button"
                                @click="setupEditModal(grade)">
                            Jegy módosítása
                        </button>
                        <button class="btn bg-danger bg-opacity-50 w-auto border btn-secondary text-link-secondary me-2"
                                role="button"
                                @click="setupDeleteModal(grade)">
                            Jegy törlése
                        </button>
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