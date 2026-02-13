<script setup lang="ts">
    import z from 'zod';

    definePageMeta({
        middleware: ["forward-auth"]
    });

    useHead({
        title: 'Regisztráció',
    });

    // Define the schema for the form
    const formSchema = z.object({
        name: z.coerce.string().max(255),
        email: z.email("Érvénytelen email cím").max(255),
        password: z
                    .coerce
                    .string("Érvénytelen jelszó! (6-20 karakter)")
                    .min(6, "Érvénytelen jelszó! (6-20 karakter)")
                    .max(20, "Érvénytelen jelszó! (6-20 karakter)"),
    });

    // Set password confirm helper
    const password = ref({
        password: "",
        confirmPassword: ""
    });

    const showPassword = ref(false);

    const error = ref<string | null>(null);

    // Send POST to register api
    async function onSubmit(value: Record<string, any>) {
        try {
            await $fetch("/api/auth/register", {
                method: 'POST',
                body: value
            });

            await navigateTo("/login");
        } catch (e) {
            error.value = (e as any).data;
        }
    }
</script>

<template>
    <div class="container d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div class="row mb-3">
            <h1 class="text-center mb-1">Filc</h1>
            <h2 class="text-center h3">Regisztráció</h2>
        </div>
        
        <!-- Erorr message -->
        <div 
            class="row w-auto mb-4 bg-danger bg-opacity-50 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 border"
            v-if="error != null" 
        >
            <p class="m-0">{{ error }}</p>
        </div>

        <!-- Register Form -->
        <div class="row bg-form bg-opacity-25 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 mx-auto border">
            <Form @submit="onSubmit" :validation-schema="formSchema">
                
                <!-- Name -->
                <div class="my-3">
                    <label class="form-label mb-0 w-100">
                        Név:
                        <Field 
                            class="form-control bg-form bg-opacity-25 border-0" 
                            name="name" 
                        />
                        <ErrorMessage name="name" class="fs-7 text-danger"/>
                    </label>
                </div>

                <!-- Email -->
                <div class="mb-3">
                    <label class="form-label mb-0 w-100">
                        Email cím:
                        <Field 
                            type="email"
                            class="form-control bg-form bg-opacity-25 border-0"
                            name="email" 
                        />
                        <ErrorMessage name="email" class="fs-7 text-danger" />
                    </label>
                </div>
                
                <!-- Password -->
                <div class="mb-3">
                    <label class="form-label mb-0 w-100">
                        Jelszó:
                        <Field 
                            :type="showPassword ? 'text' : 'password'" 
                            class="form-control bg-form bg-opacity-25 border-0" 
                            v-model="password.password"
                            name="password" 
                        />
                        <ErrorMessage name="password" class="fs-7 text-danger" />
                    </label>
                </div>
                
                <!-- Confirm Password -->
                <div class="mb-3">
                    <label class="form-label mb-0 w-100">
                        Jelszó megerősítése:
                        <input 
                            :type="showPassword ? 'text' : 'password'" 
                            class="form-control bg-form bg-opacity-25 border-0" 
                            v-model="password.confirmPassword"
                        />
                        <div 
                            class="fs-7 text-danger" 
                            v-if="password.password !== password.confirmPassword"
                        >
                            A jelszavak nem egyeznek!
                        </div>
                    </label>
                </div>
                
                <!-- Show password -->
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
                
                <!-- Buttons -->
                <div class="d-flex justify-content-center my-3 mt-4">
                    <button class="btn w-auto border btn-primary me-2 text-link-primary">Regisztráció</button>
                    <NuxtLink class="link" to="/">
                        <button 
                            class="btn w-auto border btn-secondary text-link-secondary" 
                            type="button"
                        >
                            Vissza
                        </button>
                    </NuxtLink>
                </div>
            </Form>
        </div>
    </div>
</template>