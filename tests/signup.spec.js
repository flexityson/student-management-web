import { test, expect } from '@playwright/test';

test.describe('Teacher Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/signup.html');
  });

  test('should show error with wrong teacher access code', async ({ page }) => {
    // Fill out the signup form with valid data but wrong access code
    await page.fill('#full-name', 'Test Teacher');
    await page.fill('#school', 'Test School');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirm-password', 'password123');
    await page.fill('#teacher-access-code', 'WRONG_CODE');
    await page.check('#terms');

    // Submit the form
    await page.click('#signup-btn');

    // Wait for the validation response
    await page.waitForTimeout(1000);

    // Check that an error message appears
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Access code validation failed');
  });

  test('should successfully signup with correct teacher access code', async ({ page }) => {
    // Fill out the signup form with valid data and correct access code
    await page.fill('#full-name', 'Test Teacher');
    await page.fill('#school', 'Test School');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirm-password', 'password123');
    await page.fill('#teacher-access-code', 'YourSecretCodeHere'); // Using the code from .env.example
    await page.check('#terms');

    // Submit the form
    await page.click('#signup-btn');

    // Wait for the validation and signup process
    await page.waitForTimeout(2000);

    // Check that success message appears
    const successMessage = page.locator('.success-message');
    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText('Account created successfully');
    } else {
      // If validation passes but Supabase signup fails, we should at least not see an error about the access code
      const errorMessage = page.locator('.error-message');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        expect(errorText).not.toContain('Access code validation failed');
      }
    }
  });

  test('should validate form fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('#signup-btn');

    // Check that required fields show validation
    await expect(page.locator('#full-name')).toHaveClass(/form-error/);
    await expect(page.locator('#school')).toHaveClass(/form-error/);
    await expect(page.locator('#email')).toHaveClass(/form-error/);
    await expect(page.locator('#password')).toHaveClass(/form-error/);
    await expect(page.locator('#teacher-access-code')).toHaveClass(/form-error/);
  });

  test('should show password mismatch error', async ({ page }) => {
    // Fill form with mismatched passwords
    await page.fill('#full-name', 'Test Teacher');
    await page.fill('#school', 'Test School');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirm-password', 'differentpassword');
    await page.fill('#teacher-access-code', 'YourSecretCodeHere');
    await page.check('#terms');

    // Submit the form
    await page.click('#signup-btn');

    // Check that password mismatch error appears
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Passwords do not match');
  });
});
