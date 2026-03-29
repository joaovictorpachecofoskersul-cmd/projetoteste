async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.sucesso) {
        document.getElementById('msg').innerText = "Login OK!";
        window.location.href = "/";
    } else {
        document.getElementById('msg').innerText = data.erro;
    }
}