<script setup lang="ts">
    const dialog = useTemplateRef("dialog");

    function open() {
        emit("open");
        dialog.value?.showModal();
    }

    function close() {
        dialog.value?.close();
    }

    defineExpose({
        open,
        close
    });

    const emit = defineEmits(["open"]);
</script>

<template>
    <dialog ref="dialog" closedby="any">
        <slot></slot>
    </dialog>
</template>

<style scoped>
    dialog {
        border: 0;
        padding: 0;
        background: none;
    }
    
    dialog[open] {
        animation: fade-in 0.1s ease-in forwards;
    }

    @keyframes fade-in {
        0% {
            opacity: 0
        }

        100% {
            opacity: 1
        }
    }
</style>
