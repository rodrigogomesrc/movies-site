<script>

    export let login;
    let user;
    let password;

    const userLogin = (user) => {
        login(user);
        user = "";
        password = ""; 
    }

</script>

<main>
    <div id="user-login">
        <input type="text" id="user-login-input" placeholder="Usuário" bind:value={user}/>
        <input type="password" id="user-login-password" placeholder="Senha" bind:value={password}/>
        <button id="user-login-button" on:click={() => userLogin(user)}>Entrar</button>
    </div>

</main>

<style>


</style>