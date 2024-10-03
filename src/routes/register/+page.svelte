<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';

  let username = '';
  let email = '';
  let password = '';
  let error = '';

  async function handleSubmit() {
    try {
      const { token } = await api.post('/auth/register', { username, email, password });
      auth.setToken(token);
      goto('/');
    } catch (err) {
      error = 'Registration failed. Please try again.';
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
    {#if error}
      <div class="alert alert-danger">{error}</div>
    {/if}
    <button type="submit" class="btn btn-primary">Register</button>
  </form>
</div>
