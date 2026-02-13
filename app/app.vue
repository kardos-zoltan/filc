<script>
    import z from 'zod';
    import { hu } from 'zod/v4/locales';

    // Set Zod to Hungarian
    z.config(hu());
</script>

<template>
    <NuxtPage />
</template>
