<script setup lang="ts">
    useHead({
        title: 'Regisztráció',
    });

    const showPassword = ref(false);
</script>

<template>
    <div class="container d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div class="row">
            <h1 class="text-center">Filc</h1>
        </div>
        <div class="row bg-form bg-opacity-25 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 mx-auto border">
            <form name="registerForm">
                <div class="my-3">
                    <label 
                        for="Név"
                        class="form-label mb-0"
                    >
                        Név:
                    </label>
                    <input 
                        type="text" 
                        class="form-control bg-form bg-opacity-25 border-0" 
                        id="name" 
                        name="name" 
                        required
                    >
                </div>
                <div class="mb-3">
                    <label 
                        for="email" 
                        class="form-label mb-0"
                    >
                        Email cím:
                    </label>
                    <input 
                        type="email" 
                        class="form-control bg-form bg-opacity-25 border-0"
                        id="email" 
                        name="email" 
                        required
                    >
                </div>
                <div class="mb-3">
                    <label 
                        for="password" 
                        class="form-label mb-0"
                    >
                        Jelszó:
                    </label>
                    <input 
                        :type="showPassword ? 'text' : 'password'" 
                        class="form-control bg-form bg-opacity-25 border-0" 
                        id="password" 
                        name="password" 
                        required
                    >
                </div>
                <div class="mb-3">
                    <label 
                        for="confirmPassword" 
                        class="form-label mb-0"
                    >
                        Jelszó megerősítése:
                    </label>
                    <input 
                        :type="showPassword ? 'text' : 'password'" 
                        class="form-control bg-form bg-opacity-25 border-0" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        required
                    >
                </div>
                <div class="mb-3">
                    <label 
                        for="showPass" 
                        class="form-check-label mb-0 user-select-none"
                    >
                        Jelszó megjelenítése:
                    </label>
                    <input 
                        type="checkbox"
                        class="form-check-input bg-form bg-opacity-25 mx-2 border-0"
                        id="showPass"
                        name="showPass"
                        v-model="showPassword"
                    >
                </div>
                <div class="d-flex justify-content-center my-3 mt-4">
                    <button class="btn w-auto border btn-primary me-2 text-link-primary">Regisztráció</button>
                    <NuxtLink class="link text-link-secondary" to="/">
                        <button 
                            class="btn w-auto border btn-secondary" 
                            type="button"
                        >
                            Vissza
                        </button>
                    </NuxtLink>
                </div>
            </form>
        </div>
    </div>
</template>