<script>    

    export let toggleScreen;
    
</script>

<main>
   <header id="header">
        <div id="header-center">
            <div id="header-content">
                <div class="header-link" on:click={()=> toggleScreen()}>Filmes</div>
                <div class="header-link" on:click={()=> toggleScreen()}>Inscrições</div>
            </div>
        </div>
   </header>
</main>

<style>

    #header {
        background-color: #000;
        color: #fff;
        text-align: center;
        font-weight: bold;
        padding-top: 7px;
        padding-bottom: 7px;
    }

    #header-content {
        font-size: 1.2em;
        display: flex;
        justify-content: space-around;
        width: 250px;
        margin: 0 auto;
        text-align: center;
    }

    .header-link {
        color: #fff;
        text-decoration: none;
        padding: 10px;
        margin: 0 auto;
        text-align: center;
        font-weight: bold;
        cursor: pointer;
    }

    .header-link:hover {
        background-color: #fff;
        color: #000;
    }

</style>