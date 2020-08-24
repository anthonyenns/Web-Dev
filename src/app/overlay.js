const element = document.getElementById("overlay");
let visible = true;

const overlay = {
  get visible() {
    return visible;
  },

  get text() {
    return document.getElementById("loadstatus").innerHTML;
  },
  set text(t) {
    return (document.getElementById("loadstatus").innerHTML = t);
  },

  fadeOut: () => {
    var op = 1; // initial opacity
    var timer = setInterval(function () {
      if (op <= 0.1) {
        clearInterval(timer);
        element.style.zIndex = -1;
        element.style.display = "none";
        visible = false;
      }
      element.style.opacity = op;
      element.style.filter = "alpha(opacity=" + op * 100 + ")";
      op -= op * 0.1;
    }, 50);
  },

  fadeIn: () => {
    var op = 0.1; // initial opacity
    element.style.zIndex = 1;
    visible = true;
    element.style.display = "block";
    var timer = setInterval(function () {
      if (op >= 1) {
        clearInterval(timer);
      }
      element.style.opacity = op;
      element.style.filter = "alpha(opacity=" + op * 100 + ")";
      op += op * 0.1;
    }, 10);
  },

  remove: () => {
    element.remove();
  },
};

export default overlay;
