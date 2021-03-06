<template>
  <v-stepper-content step="2">
    <v-form v-model="valid">
      <v-text-field
        :value="mfa_token"
        label="MFA Token"
        :rules="[req_rule, mfa_rule]"
        @input="change_mfa_token"
        @keyup.enter="proceed"
      />
      <v-text-field
        :value="mfa_serial"
        label="MFA Device ARN (Optional)"
        hint="Defaults to virtual IAM device"
        @input="change_mfa_serial"
        @keyup.enter="proceed"
      />
      <v-btn
        color="primary"
        :disabled="!valid"
        class="my-2 mr-2"
        @click="$emit('auth-mfa')"
      >
        Login
      </v-btn>
      <v-btn color="red" class="my-2 ml-2" @click="proceed"> Cancel </v-btn>
    </v-form>
  </v-stepper-content>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {PropSync} from 'vue-property-decorator';

import {LocalStorageVal} from '@/utilities/helper_util';

/** Localstorage keys */
const local_mfa_serial = new LocalStorageVal<string>('aws_s3_mfa_serial');

/**
 * File reader component for taking in inspec JSON data.
 * Uploads data to the store with unique IDs asynchronously as soon as data is entered.
 * Emits "got-files" with a list of the unique_ids of the loaded files.
 */
@Component
export default class S3Reader extends Vue {
  @PropSync('mfa_token', {type: String}) token!: string;
  @PropSync('mfa_serial', {type: String}) serial!: string;
  /** Models if currently displayed form is valid.
   * Shouldn't be used to interpret literally anything else as valid - just checks fields filled
   */
  valid: boolean = false;

  /** Form required field rules. Maybe eventually expand to other stuff */
  req_rule = (v: string | null | undefined) =>
    (v || '').trim().length > 0 || 'Field is Required';
  mfa_rule = (v: string | null | undefined) =>
    (v || '').trim().match('^\\d{6}$') !== null ||
    'Field must be the 6 number code from a valid authenticator device';

  /** On mount, try to look up stored auth info */
  mounted() {
    this.change_mfa_serial(local_mfa_serial.get_default(''));
  }

  /** Handles changes to mfa serial */
  change_mfa_token(new_value: string) {
    this.token = new_value;
  }

  /** Handles changes to mfa token */
  change_mfa_serial(new_value: string) {
    local_mfa_serial.set(new_value);
    this.serial = new_value;
  }

  /** When button is pressed or enter is pressed */
  proceed() {
    this.$emit('exit-mfa');
  }
}
</script>
