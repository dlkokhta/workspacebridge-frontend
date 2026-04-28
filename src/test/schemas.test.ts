import { describe, it, expect } from 'vitest';
import { loginSchema } from '../schemas';
import { registrationSchema } from '../schemas';

describe('loginSchema', () => {
  const valid = { email: 'john@example.com', password: 'Password1!' };

  it('passes with valid email and password', async () => {
    await expect(loginSchema.validate(valid)).resolves.toBeDefined();
  });

  it('fails when email is empty', async () => {
    await expect(
      loginSchema.validate({ ...valid, email: undefined }),
    ).rejects.toThrow('email is required');
  });

  it('fails when email format is invalid', async () => {
    await expect(
      loginSchema.validate({ ...valid, email: 'not-an-email' }),
    ).rejects.toThrow(/email must be a valid/i);
  });

  it('fails when password is shorter than 8 characters', async () => {
    await expect(
      loginSchema.validate({ ...valid, password: 'abc' }),
    ).rejects.toThrow(/8 or more characters/i);
  });

  it('fails when password is missing', async () => {
    await expect(
      loginSchema.validate({ ...valid, password: undefined }),
    ).rejects.toThrow('password is required');
  });
});

describe('registrationSchema', () => {
  const valid = {
    firstName: 'John',
    lastName: 'Doee',
    email: 'john@example.com',
    password: 'Password1!',
    repeatPassword: 'Password1!',
  };

  it('passes with all valid fields', async () => {
    await expect(registrationSchema.validate(valid)).resolves.toBeDefined();
  });

  it('fails when firstName is shorter than 4 characters', async () => {
    await expect(
      registrationSchema.validate({ ...valid, firstName: 'Jo' }),
    ).rejects.toThrow(/4 or more characters/i);
  });

  it('fails when email is missing', async () => {
    await expect(
      registrationSchema.validate({ ...valid, email: undefined }),
    ).rejects.toThrow('Enter your email');
  });

  it('fails when password is too weak (no uppercase)', async () => {
    await expect(
      registrationSchema.validate({ ...valid, password: 'password1!', repeatPassword: 'password1!' }),
    ).rejects.toThrow(/uppercase/i);
  });

  it('fails when passwords do not match', async () => {
    await expect(
      registrationSchema.validate({ ...valid, repeatPassword: 'DifferentPass1!' }),
    ).rejects.toThrow('Passwords must match');
  });
});
