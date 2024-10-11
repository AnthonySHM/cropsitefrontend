<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { api } from '$lib/api';
  import Comment from '$lib/Comment.svelte';
  import { auth } from '$lib/stores/auth';

  let crop: any = null;
  let error: string | null = null;
  let activeTab = 'overview';
  let carousels: { [key: string]: any } = {};
  let bootstrapLoaded = false;
  let bootstrap: any;

  onMount(async () => {
    const cropId = $page.params.id;
    try {
      crop = await api.get(`api/crops/${cropId}`);
      console.log('Fetched crop data:', JSON.stringify(crop, null, 2));
      if (browser) {
        bootstrap = await import('bootstrap');
        bootstrapLoaded = true;
        initCarousels();
      }
    } catch (err) {
      console.error('Error fetching crop details:', err);
      error = 'Failed to load crop details. Please try again later.';
    }
  });

  function setActiveTab(tab: string) {
    activeTab = tab;
    setTimeout(() => {
      if (carousels[tab]) {
        carousels[tab].dispose();
      }
      initCarousel(tab);
    }, 0);
  }

  function initCarousels() {
    if (typeof document !== 'undefined') {
      ['overview', 'planting', 'care', 'harvest', 'economics'].forEach(initCarousel);
    }
  }

  function initCarousel(tab: string) {
    const carouselEl = document.querySelector(`#${tab}Carousel`);
    if (carouselEl && bootstrap) {
      carousels[tab] = new bootstrap.Carousel(carouselEl, {
        interval: 5000,
        wrap: true
      });
    }
  }

  function getYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
</script>

{#if crop && bootstrapLoaded}
  <div class="container mt-5 pt-4">
    <h1 class="mb-4">{@html crop.name}</h1>
    <div class="row">
      <div class="col-md-8">
        <ul class="nav nav-tabs mb-3">
          {#each ['overview', 'planting', 'care', 'harvest', 'economics'] as tab}
            <li class="nav-item">
              <button class="nav-link" class:active={activeTab === tab} on:click={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          {/each}
        </ul>

        <div class="tab-content">
          {#each ['overview', 'planting', 'care', 'harvest', 'economics'] as tab}
            <div class="tab-pane fade" class:show={activeTab === tab} class:active={activeTab === tab}>
              <div id="{tab}Carousel" class="carousel slide mb-4" data-bs-ride="carousel">
                <div class="carousel-inner">
                  {#if crop.images && crop.images[tab] && crop.images[tab].length > 0}
                    {#each crop.images[tab] as image, index}
                      <div class="carousel-item" class:active={index === 0}>
                        <img src={image.url} class="d-block w-100" alt={image.caption} style="max-height: 400px; object-fit: cover;">
                        <div class="carousel-caption d-none d-md-block">
                          <p>{image.caption}</p>
                        </div>
                      </div>
                    {/each}
                  {:else}
                    <div class="carousel-item active">
                      <img src={crop.image} class="d-block w-100" alt={crop.name} style="max-height: 400px; object-fit: cover;">
                    </div>
                  {/if}
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#{tab}Carousel" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#{tab}Carousel" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>
              <p>{@html crop[tab]}</p>
            </div>
          {/each}
        </div>
      </div>
      <div class="col-md-4">
        <div class="mt-4">
          <h3>Videos</h3>
          {#if crop.videos && crop.videos[activeTab] && crop.videos[activeTab].length > 0}
            <div style="max-height: 600px; overflow-y: auto;">
              {#each crop.videos[activeTab] as video}
                {#if getYoutubeId(video.url)}
                  <div class="mb-4">
                    <div class="ratio ratio-16x9">
                      <iframe
                        src="https://www.youtube.com/embed/{getYoutubeId(video.url)}"
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                    <h4 class="mt-2">{video.title}</h4>
                    {#if video.description}
                      <p>{video.description}</p>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          {:else}
            <p>No videos available for this section.</p>
          {/if}
        </div>
      </div>
    </div>
    <Comment cropId={crop._id} tab={activeTab} />
  </div>
{:else if error}
  <div class="alert alert-danger">{error}</div>
{:else}
  <div class="alert alert-info">Loading crop details...</div>
{/if}