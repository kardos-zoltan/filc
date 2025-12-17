<script setup lang="ts">
    useHead({
        title: 'Filc főoldal',
    })
</script>


<template>
    <div class="container d-flex vh-100 align-items-center justify-content-center flex-column">
        <div class="row align-items-center justify-content-center">
            <img src="../assets/img/logo.svg" alt="Filc logo" class="logo">
            <h1 class="fw-bold text-center">Filc</h1>
            <p class="text-center">E-napló és oktatási rendszer</p>
        </div>

        <div class="row mb-5">
            <Button 
                class="btn-secondary me-2"
                @click="navigateTo('/login')"
            >
                <NuxtLink class="link text-link-secondary" to="/login">Bejelentkezés</NuxtLink>
            </Button>

            <Button 
                class="btn-primary border"
                @click="navigateTo('/register')"
                >
                <NuxtLink class="link text-link-primary" to="/register">Regisztráció</NuxtLink>
            </Button>
        </div>

        <div class="row mt-5">
            <p class="text-center text-text">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit inventore blanditiis amet perspiciatis, deserunt ipsam dolorem reiciendis laborum deleniti, voluptates, ut magnam rerum modi! Animi hic mollitia nostrum repellendus earum!
            </p>
        </div>
    </div>
</template>

<style scoped>
.logo {
    width: 8rem;
    height: 8rem;
}
</style>
