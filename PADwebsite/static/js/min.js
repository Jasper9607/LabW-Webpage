$(document).ready(function() {
    function preload() {
        var body = document.getElementById("page-top")
        var width = $(window).width();
        if (width > 1000) { body.style.overflowX = "hidden"; } else { body.style.overflowX = "auto"; }
    }
    preload()
    $(window).resize(function() { preload(); });

    function checkOffset() { if ($(".fixed-top").offset().top > 50) { $(".fixed-top").addClass("top-nav-collapse"); } else { $(".fixed-top").removeClass("top-nav-collapse"); } }
    checkOffset();
    $(window).scroll(function() { checkOffset(); });
    $('#small-screen-menu').on("click", function() {
        $("#fullpage, #fp-nav, .brand-logo, footer").toggleClass("menu-opened");
        $("body, html").toggleClass("modal-open");
        $(this).toggleClass('open').toggleClass('custom-menu');
    });

    function footerWidth(t) {
        var width = $(window).width();
        var adpt_right = 110 + 110 * (t - width) / t
        if (width < t) { $(".footer-bg").css("width", adpt_right + "%") }
    }
    footerWidth(1000)
    $(window).resize(function() { var width = $(window).width(); if (width < 1100) { footerWidth(1100); } else { $(".footer-bg").css("width", "110%") } });

    function containerFluidStyle() {
        if ($(window).width() < 700) {
            $(".container-fluid").css("margin-left", "3.25rem");
            $(".container-fluid").css("margin-right", "0.75rem");
            $(".container-fluid").css("width", "155%");
        } else {
            $(".container-fluid").css("margin-left", "8rem");
            $(".container-fluid").css("margin-right", "8rem");
            $(".container-fluid").css("width", "100%");
        }
    }
    containerFluidStyle()
    $(window).resize(function() { containerFluidStyle(); });
});