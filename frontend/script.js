const exploreButton = document.getElementById("exploreButton");

const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const button4 = document.getElementById("button4");

const details1 = document.getElementById("details1");
const details2 = document.getElementById("details2");
const details3 = document.getElementById("details3");
const details4 = document.getElementById("details4");

exploreButton.addEventListener(
    "click", function() {
    document.getElementById("members").scrollIntoView();
}
);

button1.addEventListener(
    "click", function() {
    details1.style.display = "block";
    details2.style.display = "none";
    details3.style.display = "none";
    details4.style.display = "none";
}
);

button2.addEventListener(
    "click", function() {
    details1.style.display = "none";
    details2.style.display = "block";
    details3.style.display = "none";
    details4.style.display = "none";
}
);

button3.addEventListener(
    "click", function() {
    details1.style.display = "none";
    details2.style.display = "none";
    details3.style.display = "block";
    details4.style.display = "none";
}
);

button4.addEventListener(
    "click", function() {
    details1.style.display = "none";
    details2.style.display = "none";
    details3.style.display = "none";
    details4.style.display = "block";
}
);