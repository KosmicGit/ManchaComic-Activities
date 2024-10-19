import '../scss/styles.scss';
import 'toastify-js/src/toastify.css';
import './ajax.js';
import Toastify from "toastify-js";

export function showNotification(message) {
    Toastify({
        text: message,
        duration: 4000,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "#b11f6e",
        },
    }).showToast();
}