<script setup lang="ts">
    import z from 'zod';
    import { Form, type FieldEntry } from "vee-validate"

    definePageMeta({
        middleware: ["auth"]
    });

    const route = useRoute();

    const user = useUserStore();
    await callOnce(user.fetch);

    const course = useFetch(`/api/course/${route.params.id}` as "/api/course/:course_id");
    watch(course.error, async (v) => v != null ? await navigateTo("/courses") : null);
    
    const quiz = useFetch(`/api/course/${route.params.id}/post/${route.params.quiz_id}/quiz` as "/api/course/:course_id/post/:post_id/quiz");
    watch(quiz.error, async (v) => v != null ? await navigateTo("/courses") : null);

    const formInit = computed(() => {
        const questions = 
            quiz.data.value?.content.questions
                .map((x) => {
                    const answer = 
                        x.type === "singularChoice"
                            ? -1
                            : x.type === "multipleChoice"
                                ? []
                                : "";
                    
                    return { ...x, answer };
                });

        return { ...quiz.data.value?.content, questions };;
    });
    
    const createQuizError = ref<string | null>(null);

    const formSchema = z.object({
        title: z.string().min(1).max(200),
        date: z.coerce.date().min(new Date()).optional(),
        questions: z.array(
            z.discriminatedUnion("type", [
                z.object({ 
                    type: z.literal("singularChoice"),
                    answer: z.int().nonnegative()
                }),
                z.object({ 
                    type: z.literal("multipleChoice"),
                    answer: z.array(z.int().nonnegative()).min(1)
                }),
                z.object({ 
                    type: z.literal("shortAnswer"),
                    answer: z.string().max(100)
                }),
                z.object({ 
                    type: z.literal("longAnswer"),
                    answer: z.string().max(1000)
                })
            ])
        ).min(1)
    });
    type Question = {
        type: "singularChoice"
        points: number
        question: string
        choices: string[]
        correctChoice: number
        answer: number
    } | {
        type: "multipleChoice"
        points: number
        question: string
        choices: string[]
        correctChoices: number[]
        answer: number[]
    } | {
        type: "shortAnswer"
        points: number
        question: string
        correctChoice: string
        answer: string
    } | {
        type: "longAnswer"
        points: number
        question: string
        answer: string
    }

    async function submitQuiz(_values: unknown) {
        const values = _values as z.infer<typeof formSchema>;
        
        try {
            await $fetch(
                `/api/course/${route.params.id}/post/${route.params.quiz_id}/answer` as "/api/course/:course_id/post/:post_id/answer",
                {
                    method: 'POST',
                    body: { answers: values.questions }
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
        <div class="row gap-2 min-vh-100 justify-content-center">
            <div class="col-12 col-lg-3 col-xl-2 flex-shrink-1">
                <div class="row mt-2 ms-2 courses">
                    <button
                        class="
                            course-name btn btn-primary text-link-primary border-0 rounded-3 h-auto d-flex
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
            <template v-if="quiz.status.value === 'success'">
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
                        <p class="w-auto fs-3 m-0 text-link-secondary">{{ quiz.data.value?.content.title }}</p>
                    </div>
            
                    <FieldArray name="questions" v-slot="{ fields }"> 
                        <div class="row justify-content-center mb-2" v-for="(quiz, index) in (fields as FieldEntry<Question>[])">
                            <div class="row d-flex gap-1 mb-1">
                                <div class="fw-bold w-auto flex-grow-1">{{ quiz.value.question }}</div>
                                <div class="w-auto">/{{ quiz.value.points }}</div>
                            </div>
            
                            <div class="row mb-3" v-if="quiz.value.type === 'shortAnswer'">
                                <Field
                                    :name="`questions[${index}].answer`"
                                    class="form-control"
                                    type="text"
                                    placeholder="Válasz"
                                />
                            </div>
            
                            <div class="row mb-3" v-if="quiz.value.type === 'longAnswer'">
                                <Field
                                    :name="`questions[${index}].answer`"
                                    class="form-control"
                                    as="textarea"
                                    placeholder="Válasz"
                                />
                            </div>
            
                            <div class="row mb-3" v-if="quiz.value.type === 'singularChoice'">
                                <FieldArray :name="`questions[${index}].choices`" v-slot="{ fields }">
                                    <div class="d-flex flex-column mb-1" v-for="(choice, choiceIndex) in fields">
                                        <div class="row d-flex gap-1">
                                            <label class="form-check-label d-flex w-auto justify-content-center align-items-center">
                                                <Field
                                                    :name="`questions[${index}].answer`"
                                                    type="radio"
                                                    class="form-check-input m-0 me-1"
                                                    :value="choiceIndex"
                                                />
                                            
                                                {{ choice.value }}
                                            </label>
                                        </div>
                                    </div>
            
                                    <ErrorMessage :name="`questions[${index}].answer`">
                                        <div class="text-danger">Kötelező kiválasztani egy helyes választ!</div>
                                    </ErrorMessage>
                                </FieldArray>
                            </div>
                            
                            <div class="row mb-3" v-if="quiz.value.type === 'multipleChoice'">
                                <FieldArray :name="`questions[${index}].choices`" v-slot="{ fields }">
                                    <div class="d-flex flex-column mb-1" v-for="(choice, choiceIndex) in fields">
                                        <div class="row d-flex gap-1">
                                            <label class="form-check-label d-flex w-auto justify-content-center align-items-center">
                                                <Field
                                                    :name="`questions[${index}].answer`"
                                                    type="checkbox"
                                                    class="form-check-input m-0 me-1"
                                                    :value="choiceIndex"
                                                />
                                            
                                                {{ choice.value }}
                                            </label>
                                        </div>
                                    </div>
            
                                    <ErrorMessage :name="`questions[${index}].answer`">
                                        <div class="text-danger">Kötelező kiválasztani legalább egy választ!</div>
                                    </ErrorMessage>
                                </FieldArray>
                            </div>
                        </div>
                    </FieldArray>
            
                    <div class="row justify-content-center mt-3">
                        <button
                            class="btn w-auto border btn-primary text-link-primary me-2"
                            @click="handleSubmit($event, submitQuiz)"
                            :disabled="!(meta.dirty && meta.valid)"
                        >
                            Beküldés
                        </button>
            
                        <NuxtLink class="w-auto" :to="`/course/${route.params.id}`">
                            <button class="btn w-auto border btn-secondary text-link-secondary border">
                                Mégsem
                            </button>
                        </NuxtLink>
                    </div>
                </Form>
            </template>
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