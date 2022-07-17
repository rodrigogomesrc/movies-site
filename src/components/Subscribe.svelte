<script>
    let genre;
    export let subscribe;

    const createNewSubscription = () => {
        subscribe(genre);
        genre = "";
    };

</script>

<main>
    <div id="subscribe">
        <input type="text" placeholder="Gênero" bind:value={genre}>
        <button on:click={() => createNewSubscription()}>Inscrever-se</button>
    </div>

</main>

<style>
    #subscribe {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ccc;
        border-top: 1px solid #ccc;
        padding-top: 20px;
    }
    
</style>