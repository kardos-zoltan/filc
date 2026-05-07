<script setup lang="ts">
    import Modal from './Modal.vue'
    import ErrorMessage from './ErrorMessage.vue'

    const modal = useTemplateRef("modal");

    function open() {
        modal.value?.open();
    }

    function close() {
        modal.value?.close();
    }

    const {
        error,
        question,
        confirmText,
        label,
        modelValue,
        confirmFunction,
        cancelFunction,
        textArea,
        isNumber
    } = defineProps<{
        error: string | null
        question: string
        confirmText: string
        label: string
        modelValue: string
        confirmFunction: () => void
        cancelFunction: () => void
        textArea: boolean,
        isNumber: boolean
    }>();

    const emit = defineEmits<{
        (e: 'update:modelValue', value: string): void
    }>();

    defineExpose({ open, close });
</script>

<template>
    <Modal ref="modal">
        <ErrorMessage :error="error" />

        <div class="rounded-4 border bg-secondary bg-opacity-100 p-4 d-flex flex-column gap-2">
            <div class="row justify-content-center">
                <p class="w-auto fs-3 m-0 text-link-secondary">{{ question }}</p>
            </div>

            <div class="row justify-content-center mb-2">
                <label>
                    {{ label }}

                    <!-- Input type changes depending on textArea & isNumber for different uses-->
                    <textarea class="form-control" :value="modelValue" style="field-sizing: content;"
                              v-if="textArea && !isNumber"
                              @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />

                    <input class="form-control" type="text" :value="modelValue"
                           v-if="!textArea && !isNumber"
                           @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)">

                    <input class="form-control" type="number" :value="modelValue" min="1" max="5"
                           v-if="isNumber"
                           @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)">
                </label>
            </div>

            <div class="row justify-content-center">
                <button class="btn w-auto border btn-primary text-link-primary me-2" @click="confirmFunction()">
                    {{ confirmText }}
                </button>

                <button class="btn w-auto border btn-secondary text-link-secondary" @click="cancelFunction()">
                    Mégsem
                </button>
            </div>
        </div>
    </Modal>
</template>