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
        <input type="text" id="user-login-input" placeholder="Usuário" bind:value={user}/><br>
        <input type="password" id="user-login-password" placeholder="Senha" bind:value={password}/><br>
        <button id="user-login-button" on:click={() => userLogin(user)}>Entrar</button>
    </div>

</main>

<style>

    #user-login {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60vh;
    }
    
    #user-login-input {
        width: 200px;
        height: 30px;
        border-radius: 5px;
        border: 1px solid #ccc;
        padding: 5px;
    }
    
    #user-login-password {
        width: 200px;
        height: 30px;
        border-radius: 5px;
        border: 1px solid #ccc;
        padding: 5px;
    }
    
    #user-login-button {
        width: 200px;
        height: 30px;
        border-radius: 5px;
        border: 1px solid #000;
        padding: 5px;
        background-color: #000;
        color: #fff;
        font-weight: bold;
    }
    
    #user-login-button:hover {
        background-color: #fff;
        color: #000;
        cursor: pointer;
    }


</style>