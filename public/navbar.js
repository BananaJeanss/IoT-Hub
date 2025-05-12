fetch('/navbar.html')
.then(response => response.text())
.then(data => {
    document.getElementById('navbar').innerHTML = data;

    // Responsive navbar toggle
    const toggle = document.getElementById('navbar-toggle');
    const container = document.querySelector('.navbar-container');
    if (toggle && container) {
        toggle.addEventListener('click', () => {
            container.classList.toggle('active');
        });
    }
});