<script setup lang="ts">
    import { ref } from 'vue'
    import Modal from './Modal.vue'

    const modal = useTemplateRef("modal");

    function open() {
        modal.value?.open();
    }

    function close() {
        modal.value?.close();
    }

    defineExpose({
        open,
        close
    })

    const {
        error, 
        question, 
        confirmText, 
        confirmFunction, 
        cancelFunction,
    } = defineProps<{
        error: string | null,
        question: string,
        confirmText: string,
        confirmFunction: () => void,
        cancelFunction: () => void,
    }>();
</script>
<template>
    <Modal ref="modal"> 
        <ErrorMessage :error="error"></ErrorMessage>

        <div class="rounded-4 border bg-secondary p-4 d-flex flex-column gap-2">
            <div class="row justify-content-center">
                <p class="w-auto fs-3 m-0 text-link-secondary">
                    {{ question }}
                </p>
            </div>

            <div class="row justify-content-center">
                <button 
                    class="btn bg-danger bg-opacity-50 w-auto border btn-secondary text-link-secondary me-2"
                    @click="confirmFunction()"
                >
                    {{ confirmText }}
                </button>

                <button 
                    class="btn w-auto border btn-secondary text-link-secondary border"
                    @click="cancelFunction()"
                >
                    Mégsem
                </button>
            </div>
        </div>
    </Modal>
</template>