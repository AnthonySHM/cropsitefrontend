<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Editor from '@tinymce/tinymce-svelte';

  export let show = false;
  export let content: string = '';
  export let tabName = '';

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleSave() {
    dispatch('save', { content });
  }

  const editorConfig = {
    height: 500,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar: 'undo redo | formatselect | bold italic backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help'
  };
</script>

{#if show}
  <div class="modal" style="display: block;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Advanced Editing: {tabName}</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={handleClose}></button>
        </div>
        <div class="modal-body">
          <Editor 
            apiKey="4gkcijhy16rngti25nfeoha3keat82wri7v5svlsdcysnrdj"
            bind:value={content}
            on:init={(e) => {
              const editor = e.detail.editor;
              Object.assign(editor, editorConfig);
            }}
          />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" on:click={handleClose}>Close</button>
          <button type="button" class="btn btn-primary" on:click={handleSave}>Save changes</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
