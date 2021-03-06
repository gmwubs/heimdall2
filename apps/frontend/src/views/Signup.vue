<template>
  <v-app id="inspire">
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title id="registration_form_title">
                  Register to Heimdall Server
                </v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <v-form ref="form" name="signup_form">
                  <v-text-field
                    id="email_field"
                    v-model="email"
                    :error-messages="emailErrors($v.email)"
                    name="email"
                    label="Email"
                    prepend-icon="mdi-account"
                    type="text"
                    @keyup.enter="$refs.password.focus"
                    @blur="$v.email.$touch()"
                  />
                  <br />
                  <v-text-field
                    id="password"
                    ref="password"
                    v-model="password"
                    :error-messages="
                      requiredFieldError($v.password, 'Password')
                    "
                    prepend-icon="mdi-lock"
                    name="password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    loading
                    @keyup.enter="$refs.passwordConfirmation.focus"
                    @click:append="showPassword = !showPassword"
                    @blur="$v.password.$touch()"
                  >
                    <template #progress>
                      <v-progress-linear
                        :value="passwordStrengthPercent"
                        :color="passwordStrengthColor"
                        absolute
                        height="7"
                      />
                    </template>
                  </v-text-field>
                  <br />
                  <v-text-field
                    id="passwordConfirmation"
                    ref="passwordConfirmation"
                    v-model="passwordConfirmation"
                    name="passwordConfirmation"
                    :error-messages="
                      requiredFieldError(
                        $v.passwordConfirmation,
                        'Password Confirmation'
                      )
                    "
                    label="Confirm Password"
                    prepend-icon="mdi-lock-alert"
                    type="password"
                    @keyup.enter="register"
                    @blur="$v.passwordConfirmation.$touch()"
                  />
                  <br />
                  <v-btn
                    id="register"
                    depressed
                    large
                    :disabled="$v.$invalid"
                    color="primary"
                    @click="register"
                  >
                    Register
                  </v-btn>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />

                <div class="my-2">
                  <router-link to="/login">
                    <v-btn id="login_button" depressed small>Login</v-btn>
                  </router-link>
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import zxcvbn from 'zxcvbn';
import {ServerModule} from '@/store/server';
import {required, email, sameAs} from 'vuelidate/lib/validators';
import UserValidatorMixin from '@/mixins/UserValidatorMixin';
import {SnackbarModule} from '@/store/snackbar';

export interface SignupHash {
  email: string;
  password: string;
  passwordConfirmation: string;
  role: string;
  creationMethod: string;
}

@Component({
  mixins: [UserValidatorMixin],
  validations: {
    email: {
      required,
      email
    },
    password: {
      required
    },
    passwordConfirmation: {
      required,
      sameAsPassword: sameAs('password')
    }
  }
})
export default class Signup extends Vue {
  email: string = '';
  password: string = '';
  passwordConfirmation: string = '';
  showPassword: boolean = false;

  login() {
    this.$router.push('/login');
  }

  async register(): Promise<void> {
    // checking if the input is valid
    if ((this.$refs.form as any).validate()) {
      let creds: SignupHash = {
        email: this.email,
        password: this.password,
        passwordConfirmation: this.passwordConfirmation,
        role: 'user',
        creationMethod: 'local'
      };

      ServerModule.Register(creds)
        .then(() => {
          this.$router.push('/login');
          SnackbarModule.notify(
            'You have successfully registered, please sign in'
          );
        })
        .catch((error) => {
          SnackbarModule.notify(error.response.data.message);
          if (typeof error.response.data.message === 'object') {
            SnackbarModule.notify(
              error.response.data.message
                .map(function capitalize(c: string) {
                  return c.charAt(0).toUpperCase() + c.slice(1);
                })
                .join(', ')
            );
          } else {
            SnackbarModule.notify(error.response.data.message);
          }
        });
    }
  }

  // zxcvbn returns 0-4, and the progress bar expects a percentage
  // 25 is used since 25 * 0 = 0 and 25 * 4 = 100
  get passwordStrengthPercent() {
    return zxcvbn(this.password).score * 25;
  }

  // Since there are 3 colors available, 0-49% displays red, 50% displays yellow, and 51-100% displays green
  get passwordStrengthColor() {
    return ['error', 'warning', 'success'][
      Math.floor(this.passwordStrengthPercent / 50)
    ];
  }

  get passwordConfirmationErrors() {
    const errors: Array<string> = [];
    if (!this.$v.passwordConfirmation.$dirty) return errors;
    !this.$v.passwordConfirmation.sameAsPassword &&
      errors.push('Password and password confirmation must match.');
    return errors;
  }
}
</script>
