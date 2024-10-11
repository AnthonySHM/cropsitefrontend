<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';

  let username = '';
  let email = '';
  let password = '';
  let error = '';
  let isAdmin = false;
  let adminKey = '';

  async function handleSubmit() {
    try {
      console.log('Submitting registration:', { username, email, password, isAdmin, adminKey });
      const response = await api.post('/api/auth/register', { username, email, password, isAdmin, adminKey });
      console.log('Registration successful, token:', response.token);
      auth.setToken(response.token);
      goto('/');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      if (err instanceof Error && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          error = apiError.response.data.message;
        } else {
          error = 'Registration failed. Please try again.';
        }
      } else {
        error = 'Registration failed. Please try again.';
      }
    }
  }
</script>

<div class="container mt-5">
  <h1>Register</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-3">
      <label for="username" class="form-label">Username</label>
      <input type="text" class="form-control" id="username" bind:value={username} required>
    </div>
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input type="email" class="form-control" id="email" bind:value={email} required>
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input type="password" class="form-control" id="password" bind:value={password} required>
    </div>
    <div class="mb-3 form-check">
      <input type="checkbox" class="form-check-input" id="isAdmin" bind:checked={isAdmin}>
      <label class="form-check-label" for="isAdmin">Register as Admin</label>
    </div>
    {#if isAdmin}
      <div class="mb-3">
        <label for="adminKey" class="form-label">Admin Key</label>
        <input type="password" class="form-control" id="adminKey" bind:value={adminKey} required>
      </div>
    {/if}
    {#if error}
      <div class="alert alert-danger">{error}</div>
    {/if}
    <button type="submit" class="btn btn-primary">Register</button>
  </form>
</div>
