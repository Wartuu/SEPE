const logout = document.getElementById("logout");

logout.addEventListener('click', () => {
    document.cookie = "auth=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.replace("/")
})