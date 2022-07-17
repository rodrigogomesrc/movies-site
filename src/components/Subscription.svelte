<script>

    export let genre;
    export let unsubscribe;

</script>

<main>

    <div class="subscription">
        <div id="subscription-genre">
            {genre}  
        </div>
        <button on:click={() => unsubscribe(genre)}>
            Excluir
        </button>
    </div>

</main>

<style>

    .subscription {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ccc;
    }

</style>