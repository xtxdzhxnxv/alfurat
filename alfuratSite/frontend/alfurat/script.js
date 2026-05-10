

function shownav() {
    const nav = document.querySelector('nav');
    nav.style.display = (nav.style.display === 'block') ? 'none' : 'block';
}

function openModal() {
    const modal = document.querySelector('.callback-form-container');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
    const hiddenModal = document.querySelector('.hiddenModal');
    hiddenModal.style.display = (hiddenModal.style.display === 'block') ? 'none' : 'block';
    document.body.style.overflow = (document.body.style.overflow === 'hidden') ? 'auto' : 'hidden';

}


