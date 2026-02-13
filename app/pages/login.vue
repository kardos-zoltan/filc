<script setup lang="ts">
    import z from 'zod';

    definePageMeta({
        middleware: ["forward-auth"]
    });

    useHead({
        title: 'Bejelentkezés',
    });

    // Define the schema for the form
    const formSchema = z.object({
        email: z.email("Érvénytelen email cím").max(255),
        password: z
                    .coerce
                    .string("Érvénytelen jelszó! (6-20 karakter)")
                    .min(6, "Érvénytelen jelszó! (6-20 karakter)")
                    .max(20, "Érvénytelen jelszó! (6-20 karakter)"),

    });

    const showPassword = ref(false);

    const error = ref<string | null>(null);

    async function onSubmit(value: Record<string, any>) {
        try {
            const res = await $fetch("/api/auth/login", {
                method: 'POST',
                body: value
            });

            await navigateTo("/courses");
        } catch (e) {
            error.value = (e as any).data;
        }
    }
</script>

<template>
    <div class="container d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div class="row mb-3">
            <h1 class="text-center mb-1">Filc</h1>
            <h2 class="text-center h3">Bejelentkezés</h2>
        </div>

        <!-- Erorr message -->
        <div 
            class="row w-auto mb-4 bg-danger bg-opacity-50 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 border"
            v-if="error != null" 
        >
            <p class="m-0">{{ error }}</p>
        </div>
        
        <!-- Login Form -->
        <div class="row bg-form bg-opacity-25 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 border">
            <Form @submit="onSubmit" :validation-schema="formSchema">            
                <div class="my-3">
                    <label class="form-label mb-0 w-100">
                        Email cím:
                        <Field name="email" type="email" class="form-control bg-form bg-opacity-25 border-0" />
                        <ErrorMessage name="email" class="fs-7 text-danger" />
                    </label>
                </div>
                
                <!-- Password input -->
                <div class="mb-3">
                    <label class="form-label mb-0 w-100">
                        Jelszó:
                        <Field 
                            name="password"
                            :type="showPassword ? 'text' : 'password'"
                            class="form-control bg-form bg-opacity-25 border-0" 
                        />
                        <ErrorMessage name="password" class="fs-7 text-danger" />
                    </label>
                </div>

                <!-- Show password -->
                <div class="mb-1">
                    <label class="form-check-label mb-0 user-select-none">
                        Jelszó megjelenítése:
                        <input 
                            type="checkbox"
                            class="form-check-input bg-form bg-opacity-25 mx-2 border-0"
                            v-model="showPassword"
                        >
                    </label>
                </div>

                <!-- Buttons -->
                <div class="d-flex justify-content-center my-3">
                    <button class="btn btn-primary border w-auto me-2 text-link-primary">Bejelentkezés</button>
                    <NuxtLink to="/">                   
                        <button 
                            class="btn btn-secondary border w-auto text-link-secondary" 
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