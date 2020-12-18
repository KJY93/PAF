import { FormGroup } from '@angular/forms';

export const addValidators = (form: FormGroup, validationType:{}) => {
    for (const key in form.controls) {
        form.get(key).setValidators(validationType[key]);
        form.get(key).updateValueAndValidity();
    }
}

export const removeValidators = (form: FormGroup) => {
    for (const key in form.controls) {
        form.get(key).clearValidators();
        form.get(key).updateValueAndValidity();
    }
}