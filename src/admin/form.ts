export const formString = (form: FormData, key: string) => String(form.get(key) || '').trim();
export const formNumber = (form: FormData, key: string) => Number(formString(form, key));
