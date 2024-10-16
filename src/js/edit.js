import * as bootstrap from "bootstrap";

export function loadEdit() {
    const modal = document.getElementById('modalBox');
    const modalBox = new bootstrap.Modal(modal);

    document.getElementById('confirmDelete').addEventListener('click', function () {
        modalBox.hide();
        localStorage.clear();
    });
}
