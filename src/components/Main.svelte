<script>    
    import { onMount } from 'svelte';
    import { getData } from '../services/api';

    let from = "main component";
    onMount(async () => {
        let data = await getData();
        
    });

</script>

<main>
    <div id="container">
        <h1>Hello from {from}!</h1>
        <p>this is the subtitle</p>
    </div>
  
</main>

<style>

    #container {
        padding: 15px;
        max-width: 1200px;
        margin: 0 auto;
    }

</style>