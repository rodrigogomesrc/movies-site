<script>    

    export let toggleScreen;
    export let logged;
    export let logout;
    
</script>

<main>
    {#if logged}
   <header id="header">
        <div id="header-center">
            <div id="header-content">
                <div class="header-link" on:click={()=> toggleScreen()}>Filmes</div>
                <div class="header-link" on:click={()=> toggleScreen()}>Inscrições</div>
            </div>
            
            
        </div>
        <div>
            <button id="header-logout" on:click={() => logout()}>Sair</button>
        </div>
       
   </header>
    {/if}
   
</main>

<style>

    #header {
        background-color: #000;
        color: #fff;
        text-align: center;
        font-weight: bold;
        padding-top: 7px;
        padding-bottom: 7px;
        padding-left: 100px;
        display: flex;
        justify-content: space-between;
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

    #header-logout {
        color: white;
        padding: 10px;
        margin: 0 auto;
        text-align: center;
        font-weight: bold;
        cursor: pointer;
        background-color: #000;
        margin-right: 50px;
        border: 0;
    }

</style>