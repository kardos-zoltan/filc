<script setup lang="ts">
    useHead({
        title: 'Filc főoldal',
    });

    const user = useUserStore();
    await callOnce(user.fetch);
    
    const explanationItems = ref([
        { 
            text: "Gyors, hatékony, és egyszerű.", 
            path: "/images/explanation_0.png" 
        }, 
        { 
            text: "Digitális naplózás és modern oktatásszervezés egy rendszerben.",
            path: "/images/explanation_1.png" 
        },
        {
            text: "Átlátható információk, erősebb együttműködés.",
            path: "/images/explanation_2.png"
        },
    ])
</script>


<template>
    <div class="container d-flex vh-100 align-items-center justify-content-center flex-column">

        <!-- Title segment  -->
        <div class="row align-items-center justify-content-center">
            <img src="../assets/img/logo.svg" alt="Filc logo" class="logo">
            <h1 class="fw-bold text-center">Filc</h1>
            <p class="text-center">E-napló és oktatási rendszer</p>
        </div>

        <!-- Buttons -->
        <ClientOnly>
            <template v-if="user.id == -1">
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
            </template>

            <template v-else>
                <div class="row mb-5">
                    <NuxtLink class="link w-auto p-0" to="/login">
                        <button 
                            class="btn w-auto border btn-primary text-link-primary me-2"
                        >
                            Belépés
                        </button>
                    </NuxtLink>
                </div>
            </template>
        </ClientOnly>

        <!-- Explanation segment -->
        <div class="row mt-5">
            <div v-for="item in explanationItems" class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-8">
                        <div class="card-body">
                            <p class="card-text">
                                {{item.text}}
                            </p>
                        </div> 
                    </div>
                    <div class="col-md-4">
                        <img v-bind:src="item.path" class="img-fluid rounded-start" alt="Image">
                    </div>
                </div>
            </div> 
        </div>
    </div>
</template>

<style scoped>
.logo {
    width: 8rem;
    height: 8rem;
}
</style>
