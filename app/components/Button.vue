<script setup lang="ts">
    const props = defineProps<{
        class?: string
    }>();
</script>

<template>
    <button v-bind:class="`${props.class} btn w-auto`" v-bind="$attrs">
        <slot></slot>
    </button>
</template>

