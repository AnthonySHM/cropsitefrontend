<script lang="ts">
  export let videos: { title: string; description: string; url: string; }[];
  export let images: { url: string; caption: string; }[];
</script>

<div class="mb-3">
  <h5>Videos</h5>
  {#each videos as video, index}
    <div class="card mb-2">
      <div class="card-body">
        <input type="text" class="form-control mb-2" placeholder="Video Title" bind:value={video.title}>
        <textarea class="form-control mb-2" placeholder="Video Description" rows="2" bind:value={video.description}></textarea>
        <input type="text" class="form-control" placeholder="YouTube URL" bind:value={video.url}>
      </div>
    </div>
  {/each}
</div>

<div class="mb-3">
  <h5>Images</h5>
  {#each images as image, index}
    <div class="card mb-2">
      <div class="card-body">
        <input type="text" class="form-control mb-2" placeholder="Image URL" bind:value={image.url}>
        <input type="text" class="form-control" placeholder="Image Caption" bind:value={image.caption}>
      </div>
    </div>
  {/each}
</div>
