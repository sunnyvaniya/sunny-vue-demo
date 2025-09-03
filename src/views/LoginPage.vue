<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
        <MDBContainer class="py-5">
            <MDBRow class="justify-content-center">
                <MDBCol xl="4" lg="5" md="6" sm="8" cols="12">
                    <MDBCard class="shadow-5-strong border-0">
                        <MDBCardBody class="p-5">
                            <!-- Header -->
                            <div class="text-center mb-5">
                                <div class="mb-3">
                                    <MDBIcon icon="lock" size="3x" class="text-primary mb-3" />
                                </div>
                                <h3 class="fw-bold mb-2 text-primary">Welcome Back</h3>
                                <p class="text-muted">Please sign in to your account</p>
                            </div>

                            <!-- Login Form -->
                            <form @submit.prevent="handleLogin" novalidate>
                                <!-- Email Field -->
                                <!-- Email Field -->
                                <div class="mb-4">
                                    <MDBInput v-model="email" label="Email Address" type="email" size="lg" :class="{
                                        'is-invalid': (emailTouched || formSubmitted) && emailError,
                                        'is-valid': emailTouched && !emailError && email,
                                    }" @blur="emailTouched = true" @input="onEmailInput" autocomplete="email" required>

                                    </MDBInput>
                                    <div v-if="(emailTouched || formSubmitted) && emailError">

                                        <span style="color: red;">
                                            {{ emailError }}
                                        </span>
                                    </div>
                                    <!-- Proper error placement -->
                                    <!-- <div v-if="(emailTouched || formSubmitted) && emailError"
                    class="invalid-feedback d-flex align-items-center mt-1">
                    <MDBIcon icon="exclamation-triangle" class="me-1" />
                    <span>{{ emailError }}</span>
                  </div> -->
                                </div>

                                <!-- Password Field -->
                                <div class="mb-4">
                                    <MDBInput v-model="password" :label="'Password'"
                                        :type="showPassword ? 'text' : 'password'" size="lg" :class="{
                                            'is-invalid': (passwordTouched || formSubmitted) && passwordError,
                                            'is-valid': passwordTouched && !passwordError && password,
                                        }" @blur="passwordTouched = true" @input="onPasswordInput"
                                        autocomplete="current-password" required>

                                    </MDBInput>

                                    <div v-if="(passwordTouched || formSubmitted) && passwordError">

                                        <span style="color: red;">
                                            {{ passwordError }}
                                        </span>
                                    </div>

                                    <!-- Proper error placement -->
                                    <!-- <div v-if="(passwordTouched || formSubmitted) && passwordError"
                    class="invalid-feedback d-flex align-items-center mt-1">
                    <MDBIcon icon="exclamation-triangle" class="me-1" />
                    <span>{{ passwordError }}</span>
                  </div> -->
                                </div>


                                <!-- Submit Button -->
                                <MDBBtn color="primary" size="lg" class="w-100 mb-3 shadow-3" type="submit"
                                    :disabled="!isFormValid || loading" rounded>
                                    <span v-if="loading" class="d-flex align-items-center justify-content-center">
                                        <MDBSpinner size="sm" class="me-2" />
                                        Signing in...
                                    </span>
                                    <span v-else class="d-flex align-items-center justify-content-center">
                                        <MDBIcon icon="sign-in-alt" class="me-2" />
                                        Sign In
                                    </span>
                                </MDBBtn>

                                <!-- Success/Error Messages -->
                                <MDBAlert v-if="successMessage" color="success" class="mt-3" dismissible
                                    @close="successMessage = ''">
                                    <MDBIcon icon="check-circle" class="me-2" />
                                    {{ successMessage }}
                                </MDBAlert>

                                <MDBAlert v-if="error" color="danger" class="mt-3" dismissible @close="clearError">
                                    <MDBIcon icon="exclamation-triangle" class="me-2" />
                                    {{ error }}
                                </MDBAlert>
                            </form>



                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import {
    MDBCard,
    MDBCardBody,
    MDBBtn,
    MDBInput,
    MDBAlert,
    MDBSpinner,
    MDBIcon,
    MDBContainer,
    MDBRow,
    MDBCol,
} from "mdb-vue-ui-kit";
import { useRouter } from "vue-router";

export default {
    name: "MaterialLoginForm",
    components: {
        MDBCard,
        MDBCardBody,
        MDBBtn,
        MDBInput,
        MDBAlert,
        MDBSpinner,
        MDBIcon,
        MDBContainer,
        MDBRow,
        MDBCol,
    },
    setup() {
        const store = useStore();

        const router = useRouter();


        // Form reactive data
        const email = ref("admin@gmail.com");
        const password = ref("password123");
        const rememberMe = ref(false);
        const showPassword = ref(false);
        const successMessage = ref("");

        // Validation state
        const emailTouched = ref(false);
        const passwordTouched = ref(false);

        // Email validation
        const emailError = computed(() => {
            if (!emailTouched.value && !email.value) return null;
            if (!email.value.trim()) return "Email is required";

            // Enhanced email validation pattern
            const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

            if (!emailPattern.test(email.value.trim())) {
                return "Please enter a valid email address";
            }

            return null;
        });

        // Password validation
        const passwordError = computed(() => {
            if (!passwordTouched.value && !password.value) return null;
            if (!password.value) return "Password is required";
            if (password.value.length < 8) return "Password must be at least 8 characters";

            return null;
        });





        // Form validation
        const isFormValid = computed(() => {
            return email.value.trim() &&
                password.value &&
                !emailError.value &&
                !passwordError.value;
        });

        // Store state
        const loading = computed(() => store.state.auth?.loading || false);
        const error = computed(() => store.state.auth?.error || null);


        const onEmailInput = () => {
            if (error.value) clearError();
            if (successMessage.value) successMessage.value = "";
        };

        const onPasswordInput = () => {
            if (error.value) clearError();
            if (successMessage.value) successMessage.value = "";
        };

        const togglePasswordVisibility = () => {
            showPassword.value = !showPassword.value;
        };

        const clearError = () => {
            // store.dispatch("auth/clearError").catch(() => { });
        };

        const handleLogin = async () => {
            // Mark fields as touched for validation
            emailTouched.value = true;
            passwordTouched.value = true;

            if (!isFormValid.value) {
                return;
            }

            try {
                const result = await store.dispatch("auth/login", {
                    email: email.value.trim(),
                    password: password.value,
                    rememberMe: rememberMe.value,
                });

                console.log(result);

                if (result?.success == true) {


                    successMessage.value = "Login successful! Redirecting...";
                    router.push({ name: "Stocks" });


                }
            } catch (err) {


                console.error("Login error:", err);
            }
        };

        const handleForgotPassword = () => {
            console.log("Navigate to forgot password");
        };



        watch([email, password], () => {
            if (successMessage.value) successMessage.value = "";
        });

        watch(error, (newError) => {
            if (newError) {
                setTimeout(clearError, 8000); // Auto-clear after 8 seconds
            }
        });

        return {
            // Reactive data
            email,
            password,
            rememberMe,
            showPassword,
            emailTouched,
            passwordTouched,
            successMessage,

            // Validation
            emailError,
            passwordError,
            // Computed
            isFormValid,
            loading,
            error,

            // Methods
            onEmailInput,
            onPasswordInput,
            togglePasswordVisibility,
            clearError,
            handleLogin,
            handleForgotPassword,

        };
    },
};
</script>

<style scoped>
.bg-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.shadow-5-strong {
    box-shadow: 0 8px 42px 0 rgba(0, 0, 0, 0.2) !important;
    border-radius: 16px !important;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
}

.divider::before,
.divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #dee2e6, transparent);
}

/* Enhanced input styling */
.form-outline .form-control {
    transition: all 0.3s ease;
    border-radius: 8px;
}

.form-outline .form-control:focus {
    box-shadow: 0 4px 20px rgba(0, 123, 255, 0.15);
    transform: translateY(-1px);
}

/* Custom checkbox styling */
.form-check-primary .form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

/* Button hover effects */
.btn {
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
}

.btn:active {
    transform: translateY(0);
}

/* Validation feedback styling */
.valid-feedback,
.invalid-feedback {
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    min-height: 1.2em;
}

.is-valid {
    border-color: #198754 !important;
    box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.15) !important;
}

.is-invalid {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.15) !important;
}

/* Loading animation */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    animation: fadeIn 0.5s ease-out;
}

/* Progress bar styling */
.progress {
    border-radius: 10px;
    background-color: #e9ecef;
}

.progress-bar {
    transition: width 0.6s ease, background-color 0.3s ease;
    border-radius: 10px;
}

/* Mobile responsiveness */
@media (max-width: 576px) {
    .p-5 {
        padding: 2rem !important;
    }

    .shadow-5-strong {
        margin: 1rem !important;
        border-radius: 12px !important;
    }

    .bg-gradient {
        padding: 1rem 0;
    }
}

/* Social button improvements */
.btn-outline-danger:hover {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
}

.btn-outline-dark:hover {
    background-color: #212529;
    border-color: #212529;
    color: white;
}

/* Icon animations */
.fa-eye,
.fa-eye-slash {
    transition: all 0.3s ease;
}

/* Requirements list styling */
.col-6 small {
    display: flex;
    align-items: center;
    transition: color 0.3s ease;
}
</style>
