<script setup lang="ts">
    definePageMeta({
        middleware: ["forward-auth"]
    });

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
            <NuxtLink class="link w-auto p-0" to="/login">
                <button 
                    class="btn w-auto border btn-secondary text-link-secondary me-2"
                >
                    Bejelentkezés
                </button>
            </NuxtLink>

            <NuxtLink class="link w-auto p-0" to="/register">
                <button 
                    class="btn w-auto border btn-primary text-link-primary border"
                >
                    Regisztráció
                </button>
            </NuxtLink>
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
