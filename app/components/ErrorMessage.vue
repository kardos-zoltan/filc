<script setup lang="ts">
    const { error } = defineProps<{
        error?: string | null
    }>();
</script>

<!-- Erorr message -->
<template>
    <div 
        class="row w-auto mb-4 bg-danger bg-opacity-50 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 border"
        v-if="error != null" 
    >
        <p class="m-0">{{ error }}</p>
    </div>
</template>