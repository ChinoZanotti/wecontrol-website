//Sticky Header
window.onscroll = function() {stickyHeader()};

function stickyHeader() {
    let header = document.getElementById("mainHeader");
    let sticky = header.offsetTop;
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}