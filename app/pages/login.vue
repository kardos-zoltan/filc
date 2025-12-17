<script setup lang="ts">
    useHead({
        title: 'Bejelentkezés',
    });

    const showPassword = ref(false);
</script>

<template>
    <div class="container d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div class="row mb-4">
            <h1 class="text-center">Filc</h1>
        </div>
        <div class="row bg-form bg-opacity-25 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 border">
            <form name="loginForm">
                <div class="my-3">
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
                <div class="mb-1">
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
                <div class="mb-4">
                    <label 
                        for="remember" 
                        class="form-check-label mb-0 user-select-none"
                    >
                        Emlékezz rám:
                    </label>
                    <input 
                        type="checkbox"
                        class="form-check-input bg-form bg-opacity-25 mx-2 border-0"
                        id="remember"
                        name="remember"
                    >
                </div>

                <div class="d-flex justify-content-center my-3">
                    <Button class="btn btn-primary me-2 text-link-primary">Bejelentkezés</Button>
                    <Button 
                        class="btn-secondary" 
                        type="button" 
                        @click="navigateTo('/')"
                    >
                        <NuxtLink class="link text-link-secondary" to="/">Vissza</NuxtLink>
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>