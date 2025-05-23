import { registerDecorator, type ValidationOptions } from "class-validator";

export const isValidCPF = (cpf: string): boolean => {
  if (!cpf) return false;

  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }

  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
};

export function IsCPF(options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "refinement",
      target: object.constructor,
      propertyName,
      constraints: ["CPF"],
      options,
      validator: {
        validate(value) {
          return isValidCPF(value);
        },
      },
    });
  };
}
