<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import HomeButton from '$lib/HomeButton.svelte';
  import 'bootstrap/dist/css/bootstrap.min.css';

  let bootstrapLoaded = false;

  onMount(async () => {
    if (browser) {
      const bootstrap = await import('bootstrap');
      await bootstrap.Carousel.getOrCreateInstance(document.body); // This line ensures Bootstrap is fully initialized
      bootstrapLoaded = true;
      auth.init();
    }
  });

  function handleLogout() {
    auth.clearToken();
  }
</script>

{#if bootstrapLoaded}
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <HomeButton />
      <div class="navbar-nav ms-auto">
        {#if $auth.user}
          <span class="nav-item nav-link">Welcome, {($auth.user as any).username}</span>
          {#if ($auth.user as any).isAdmin}
            <a class="nav-item nav-link" href="/admin">Admin</a>
          {/if}
          <button class="btn btn-outline-primary" on:click={handleLogout}>Logout</button>
        {:else}
          <a class="nav-item nav-link" href="/login">Login</a>
          <a class="nav-item nav-link" href="/register">Register</a>
        {/if}
      </div>
    </div>
  </nav>

  <main>
    <slot />
  </main>
{:else}
  <div>Loading...</div>
{/if}