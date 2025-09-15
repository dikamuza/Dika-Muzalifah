import { supabase } from "./supabase.js";

document.getElementById("ganti-button").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!validatePassword(password)) {
        displayPasswordError(false);
        return;
    }

    try {
        // Cari data berdasarkan email
        const { data, error } = await supabase
            .from("login")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !data) {
            alert("Email tidak terdaftar!");
            return;
        }

        // Update username dan password
        const { error: updateError } = await supabase
            .from("login")
            .update({ username: username, password: password })
            .eq("email", email);

        if (updateError) {
            alert("Gagal mengganti username atau password!");
            return;
        }

        alert("Username dan password berhasil diganti! Anda akan diarahkan ke halaman login.");
        window.location.href = "index.html";
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan!");
    }
});

// Validasi password
function validatePassword(password) {
    const passwordError = document.getElementById("password-error");
    const regex = /^(?=.*[A-Z])(?=.*\d|.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!regex.test(password)) {
        displayPasswordError(false);
        return false;
    }

    displayPasswordError(true);
    return true;
}

function displayPasswordError(isValid) {
    const passwordError = document.getElementById("password-error");

    if (isValid) {
        passwordError.textContent = ""; // Kosongkan teks
        passwordError.hidden = true; // Sembunyikan elemen
    } else {
        passwordError.textContent =
            "*Password panjangnya harus 8-16 karakter dan mengandung min. 1 huruf besar dan 1 angka atau simbol khusus";
        passwordError.hidden = false; // Tampilkan elemen
    }
}
