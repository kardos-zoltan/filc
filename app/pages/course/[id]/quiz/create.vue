<script setup lang="ts">
    import z from 'zod';
    import type { FieldEntry } from "vee-validate"

    definePageMeta({
        middleware: ["auth"]
    });

    const route = useRoute();

    const user = useUserStore();
    await callOnce(user.fetch);

    const course = useFetch(`/api/course/${route.params.id}` as "/api/course/:course_id");
    watch(course.error, async (v) => v != null ? await navigateTo("/courses") : null);

    const createQuizError = ref<string | null>(null);

    const dueActive = ref(false);

    const formInit = {
        title: "",
        date: undefined,
        questions: []
    };

    const formSchema = z.object({
        title: z.string().min(1).max(200),
        date: z.coerce.date().min(new Date()).optional(),
        questions: z.array(
            z.discriminatedUnion("type", [
                z.object({ 
                    type: z.literal("singularChoice"),
                    points: z.int(),
                    question: z.string().max(200).min(1),
                    choices: z.array(z.string().max(50).min(1)).max(10).min(1),
                    correctChoice: z.int().nonnegative()
                }),
                z.object({ 
                    type: z.literal("multipleChoice"),
                    points: z.int(),
                    question: z.string().max(200).min(1),
                    choices: z.array(z.string().max(50).min(1)).max(10).min(1),
                    correctChoices: z.array(z.int().nonnegative()).min(1)
                }),
                z.object({ 
                    type: z.literal("shortAnswer"),
                    points: z.int(),
                    question: z.string().max(200).min(1),
                    correctChoice: z.string().max(50).optional()
                }),
                z.object({ 
                    type: z.literal("longAnswer"),
                    points: z.int(),
                    question: z.string().max(200).min(1),
                })
            ])
        ).min(1)
    });
    type Question = z.infer<typeof formSchema>["questions"][0];

    async function submitQuiz(_values: unknown) {
        const values = _values as z.infer<typeof formSchema>;
        
        console.log(values)

        
        try {
            await $fetch(
                `/api/course/${route.params.id}/post/quiz` as "/api/course/:course_id/post/quiz",
                {
                    method: 'POST',
                    body: values
                }
            )

            await navigateTo(`/course/${route.params.id}`);
        } catch (e) {
            console.log(e)
        }
    }
</script>

<template>
    <div class="container min-vh-100">
        <div class="row gap-lg-2 min-vh-100 justify-content-center">
            <div class="col-12 col-lg-3 col-xl-2 flex-shrink-1 h-auto">
                <div class="row mt-2 ms-lg-2 courses">
                    <button
                        class="
                            course-name btn btn-primary text-link-primary border-0 rounded-top-3 rounded-bottom-3 h-auto d-flex
                            align-items-center justify-content-start p-2
                        "
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <div class="me-2">
                            <img
                                src="~/assets/img/logo.svg"
                                alt=""
                                class="img-thumbnail"
                                style="height: 30px; width: 30px;"
                            >
                        </div>
                        <div class="d-flex flex-column text-start overflow-hidden me-auto">
                            <span class="m-0 text-nowrap text-truncate text-link-primary">{{ user.name }}</span>
                        </div>
                    </button>
                </div>
            </div>
            <Form
                :validation-schema="formSchema"
                :initial-values="formInit"
                class="
                    border border-top-0 border-bottom-0
                    bg-secondary
                    p-4
                    d-flex flex-column gap-2
                    col-12 col-md-8 col-lg-6
                "
                v-slot="{ meta, handleSubmit }"
            >
                <!-- Erorr message -->
                <div
                    class="row w-auto mb-4 bg-danger bg-opacity-50 p-2 rounded-4 col-xl-4 col-lg-6 col-md-8 col-sm-10 col-12 border"
                    v-if="createQuizError != null"
                >
                    <p class="m-0">{{ createQuizError }}</p>
                </div>
                <div class="row justify-content-center">
                    <p class="w-auto fs-3 m-0 text-link-secondary">Dolgozat létrehozása</p>
                    <label>
                        Dolgozat címe
                        <Field
                            name="title"
                            type="text"
                            class="form-control mb-1"
                            placeholder="Dolgozat címe"
                        />
                        <ErrorMessage name="title"><div class="text-danger">Kötelező a dolgozatnak címet adni!</div></ErrorMessage>
                    </label>
                    <label class="text-link-secondary m-0" for="date">Határidő</label>
                    <div class="d-flex gap-1">
                        <Field name="date" v-slot="{ field, setValue }">
                            <div class="d-flex justify-content-center align-items-center ps-2 pe-1">
                                <input
                                    type="checkbox"
                                    class="form-check-input"
                                    v-model="dueActive"
                                    @change="setValue(undefined)"
                                >
                            </div>
        
                            <input
                                id="date"
                                type="datetime-local"
                                class="form-control"
                                :disabled="!dueActive"
                                placeholder="Határidő"
                                v-bind="field"
                                @emptied="setValue(undefined)"
                            >
                        </Field>
                    </div>
                    <ErrorMessage name="date">
                        <div class="text-danger">Nem lehet határidő a múltbeli időpont!</div>
                    </ErrorMessage>
                </div>
        
                <FieldArray name="questions" v-slot="{ fields, insert, remove }">
                    <div class="dropdown">
                        <div
                            class="row justify-content-center text-link-secondary add-question"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <hr class="w-auto flex-grow-1 my-auto">
                            <span class="w-auto flex-shrink-1 mx-auto px-2 opacity-50">
                                <i class="fa-solid fa-circle-plus"></i>
                                Feladat létrehozása
                            </span>
                            <hr class="w-auto flex-grow-1 my-auto">
                        </div>
        
                        <ul class="dropdown-menu dropdown-menu-dark">
                                <li>
                                    <a
                                        class="dropdown-item text-link-primary"
                                        role="button"
                                        @click="insert(0, {
                                            type: 'shortAnswer',
                                            question: '',
                                        })"
                                    >
                                        Rövid válasz
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item text-link-primary"
                                        role="button"
                                        @click="insert(0, {
                                            type: 'longAnswer',
                                            question: '',
                                        })"
                                    >
                                        Hosszú válasz
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item text-link-primary"
                                        role="button"
                                        @click="insert(0, {
                                            type: 'singularChoice',
                                            question: '',
                                            choices: [],
                                            correctChoice: null
                                        })"
                                    >
                                        Egyszeres feleletválasztás
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item text-link-primary"
                                        role="button"
                                        @click="insert(0, {
                                            type: 'multipleChoice',
                                            question: '',
                                            choices: [],
                                            correctChoices: []
                                        })"
                                    >
                                        Többszörös feleletválasztás
                                    </a>
                                </li>
                            </ul>
                    </div>
        
                    <div class="row justify-content-center mb-2" v-for="(quiz, index) in (fields as FieldEntry<Question>[])">
                        <div class="row">
                            <p class="fs-6 m-0" v-if="quiz.value.type === 'shortAnswer'">Rövid válasz</p>
                            <p class="fs-6 m-0" v-if="quiz.value.type === 'longAnswer'">Hosszú válasz</p>
                            <p class="fs-6 m-0" v-if="quiz.value.type === 'singularChoice'">Egyszeres feleletválasztás</p>
                            <p class="fs-6 m-0" v-if="quiz.value.type === 'multipleChoice'">Többszörös feleletválasztás</p>
                        </div>
        
                        <div class="row d-flex gap-1 mb-1">
                            <Field
                                :name="`questions[${index}].question`"
                                class="form-control w-auto flex-grow-1"
                                type="text"
                                placeholder="Kérdés"
                            />
                            <Field
                                :name="`questions[${index}].points`"
                                class="form-control text-center"
                                style="width: 15% !important;"
                                type="number"
                                placeholder="Pont"
                            />
                            <button class="btn btn-danger w-auto" @click="remove(index)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        <ErrorMessage :name="`questions[${index}].question`">
                            <div class="text-danger">Kötelező megadni kérdést!</div>
                        </ErrorMessage>
                        <ErrorMessage :name="`questions[${index}].points`">
                            <div class="text-danger">Kötelező megadni pontszámot!</div>
                        </ErrorMessage>
        
                        <div class="row mb-3" v-if="quiz.value.type === 'shortAnswer'">
                            <Field
                                :name="`questions[${index}].correctChoice`"
                                class="form-control"
                                type="text"
                                placeholder="Helyes válasz (ha van)"
                            />
                        </div>
        
                        <div class="row mb-3" v-if="quiz.value.type === 'longAnswer'"></div>
        
                        <div class="row mb-3" v-if="quiz.value.type === 'singularChoice'">
                            <FieldArray :name="`questions[${index}].choices`" v-slot="{ fields, push, remove }">
                                <div class="d-flex flex-column mb-1" v-for="(choice, choiceIndex) in fields">
                                    <div class="row d-flex gap-1">
                                        <div class="d-flex w-auto justify-content-center align-items-center ps-2 pe-1">
                                            <Field
                                                :name="`questions[${index}].correctChoice`"
                                                type="radio"
                                                class="form-check-input m-0"
                                                :value="choiceIndex"
                                            />
                                        </div>
                                        <Field
                                            :name="`questions[${index}].choices[${choiceIndex}]`"
                                            type="text"
                                            class="form-control w-auto flex-grow-1"
                                            placeholder="Választási lehetőség"
                                        />
                                        <button class="btn btn-primary w-auto" @click="remove(choiceIndex)">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
        
                                    <div class="row">
                                        <ErrorMessage
                                            :name="`questions[${index}].choices[${choiceIndex}]`"
                                        >
                                            <div class="text-danger">Kötelező megadni egy választ!</div>
                                        </ErrorMessage>
                                    </div>
                                </div>
        
                                <ErrorMessage :name="`questions[${index}].correctChoice`">
                                    <div class="text-danger">Kötelező kiválasztani egy helyes választ!</div>
                                </ErrorMessage>
                                <button class="btn btn-primary" @click="push('')">+ Válasz</button>
                            </FieldArray>
                        </div>
        
                        <div class="row mb-3" v-if="quiz.value.type === 'multipleChoice'">
                            <FieldArray :name="`questions[${index}].choices`" v-slot="{ fields, push, remove }">
                                <div class="d-flex flex-column mb-1" v-for="(choice, choiceIndex) in fields">
                                    <div class="row d-flex gap-1">
                                        <div class="d-flex w-auto justify-content-center align-items-center ps-2 pe-1">
                                            <Field
                                                :name="`questions[${index}].correctChoices`"
                                                type="checkbox"
                                                class="form-check-input m-0"
                                                :value="choiceIndex"
                                            />
                                        </div>
                                        <Field
                                            :name="`questions[${index}].choices[${choiceIndex}]`"
                                            type="text"
                                            class="form-control w-auto flex-grow-1"
                                            placeholder="Választási lehetőség"
                                        />
                                        <button class="btn btn-primary w-auto" @click="remove(choiceIndex)">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
        
                                    <div class="row">
                                        <ErrorMessage
                                            :name="`questions[${index}].choices[${choiceIndex}]`"
                                        >
                                            <div class="text-danger">Kötelező megadni egy választ!</div>
                                        </ErrorMessage>
                                    </div>
                                </div>
        
                                <ErrorMessage :name="`questions[${index}].correctChoices`">
                                    <div class="text-danger">Kötelező kiválasztani legalább egy helyes választ!</div>
                                </ErrorMessage>
                                <button class="btn btn-primary" @click="push('')">+ Válasz</button>
                            </FieldArray>
                        </div>
        
                        <div class="dropdown">
                            <div
                                class="row justify-content-center text-link-secondary add-question"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <hr class="w-auto flex-grow-1 my-auto">
                                <span class="w-auto flex-shrink-1 mx-auto px-2 opacity-50">
                                    <i class="fa-solid fa-circle-plus"></i>
                                    Feladat létrehozása
                                </span>
                                <hr class="w-auto flex-grow-1 my-auto">
                            </div>
        
                            <ul class="dropdown-menu dropdown-menu-dark">
                                <li>
                                    <a
                                        class="dropdown-item text-link-primary"
                                        role="button"
                                        @click="insert(index + 1, {
                                            type: 'shortAnswer',
                                            question: '',
                                        })"
                                    >
                                        Rövid válasz
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item text-link-primary"
                                        role="button"
                                        @click="insert(index + 1, {
                                            type: 'longAnswer',
                                            question: '',
                                        })"
                                    >
                                        Hosszú válasz
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item text-link-primary"
                                        role="button"
                                        @click="insert(index + 1, {
                                            type: 'singularChoice',
                                            question: '',
                                            choices: [],
                                            correctChoice: null
                                        })"
                                    >
                                        Egyszeres feleletválasztás
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item text-link-primary"
                                        role="button"
                                        @click="insert(index + 1, {
                                            type: 'multipleChoice',
                                            question: '',
                                            choices: [],
                                            correctChoices: []
                                        })"
                                    >
                                        Többszörös feleletválasztás
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </FieldArray>
        
                <div class="row justify-content-center mt-3">
                    <button
                        class="btn w-auto border btn-primary text-link-primary me-2"
                        @click="handleSubmit($event, submitQuiz)"
                        :disabled="!(meta.dirty && meta.valid)"
                    >
                        Létrehozás
                    </button>
        
                    <NuxtLink class="w-auto" :to="`/course/${route.params.id}`">
                        <button class="btn w-auto border btn-secondary text-link-secondary border">
                            Mégsem
                        </button>
                    </NuxtLink>
                </div>
            </Form>
        </div>
    </div>
</template>

<style scoped>
    input[type='number'] {
        appearance: textfield;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
</style>