// Redirect to portfolio on footer click
document.addEventListener('DOMContentLoaded', function () {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.cursor = 'pointer';
        footer.addEventListener('click', function () {
            window.open('https://sk-mallick.github.io/SK-Mallick-Portfolio', '_blank');
        });
    }
});
