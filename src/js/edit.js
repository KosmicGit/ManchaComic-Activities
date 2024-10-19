import * as bootstrap from "bootstrap";

export function loadEdit() {
    const modal = document.getElementById('modalBox');
    const modalBox = new bootstrap.Modal(modal);

    document.getElementById('confirmDelete').addEventListener('click', function () {
        modalBox.hide();
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.removeAttribute('style');
        document.body.removeAttribute('class');
        document.body.removeAttribute('data-bs-overflow');
        document.body.removeAttribute('data-bs-padding-right');
        localStorage.clear();
    });
}
