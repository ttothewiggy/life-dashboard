const button = document.getElementById("myButton");
button.style.backgroundColor = "green";

function buttonFunction(button) {
    if (button.style.backgroundColor === "green") {
        button.style.backgroundColor = "red";
    } else {
        button.style.backgroundColor = "green";
    }
}