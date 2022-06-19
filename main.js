// html elements
const html = document.documentElement;
const changeThemeButton = document.querySelector("button");
const themeSwitcherView = document.querySelector(".theme-switcher-view");
const buttons = document.querySelectorAll("button");
const classButtons = document.querySelectorAll(".button");

let lastDarkThemeScreenshot = null;

// add event listeners
changeThemeButton.addEventListener("click", changeTheme);

for (const button of buttons) {
  button.addEventListener("click", createRipple);
}

for (const button of classButtons) {
  button.addEventListener("click", createRipple);
}

/**
 * takes a screenshot of a given element
 * @returns {Promise<string>}
 */
async function takeScreenshot() {
  try {
    return window.domtoimage.toPng(html);
  } catch (error) {
    console.error("oops, something went wrong!", error);
  }
}

/**
 * create ripple effect on click
 * @param {*} event button click event
 */
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");

  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - (button.offsetLeft + radius)}px`;
  circle.style.top = `${event.clientY - (button.offsetTop + radius)}px`;
  circle.classList.add("ripple");
  circle.classList.add("ripple-light");

  const ripple = button.getElementsByClassName("ripple.ripple-light")[0];

  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}

/**
 * get current theme
 * @returns {string} current theme
 */
function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme");
}

/**
 * set dark theme screenshot to lastDarkThemeScreenshot variable
 * @param {string} givenScreenshot screenshot of the current theme
 */
async function setDarkThemeScreenshot(givenScreenshot) {
  const currentTheme = getCurrentTheme();
  let screenshot = givenScreenshot;

  if (!givenScreenshot) {
    screenshot = await takeScreenshot();
  }

  if (currentTheme === "dark") {
    lastDarkThemeScreenshot = screenshot;
  }
}

/**
 * create circle reveal effect
 * @param {number} x x coordinate of the click event
 * @param {number} y y coordinate of the click event
 */
async function createCircleReveal(x, y) {
  // get current theme to determine effect position and type
  const currentTheme = getCurrentTheme();
  const revealType =
    currentTheme === "light" ? "circle-enter-active" : "circle-leave-active";
  const revealPosition = {
    x: `${x}px`,
    y: `${y}px`,
  };

  // get screenshot
  const screenshot = await takeScreenshot();
  setDarkThemeScreenshot(screenshot);

  // add background image to reveal
  const backgroundImage =
    currentTheme === "light"
      ? `url(${lastDarkThemeScreenshot})`
      : `url(${screenshot})`;

  // set the position of the circle
  themeSwitcherView.style.setProperty("--circle-position-x", revealPosition.x);
  themeSwitcherView.style.setProperty("--circle-position-y", revealPosition.y);

  // turn view visible and put content image in it
  themeSwitcherView.style.display = "block";
  // themeSwitcherView.style.backgroundColor = "brown";
  themeSwitcherView.style.backgroundImage = backgroundImage;

  // disable changeThemeButton to prevent multiple clicks
  changeThemeButton.disabled = true;

  // add reveal effect based on current theme
  themeSwitcherView.classList.add(revealType);

  // toggle theme
  const toggleThemeTimeout = 500;
  const toggleThemeLightOrDarkTimeout = currentTheme === "light" ? 250 : 50;

  setTimeout(() => {
    toggleTheme();
    changeThemeButton.disabled = false;
  }, toggleThemeLightOrDarkTimeout);

  // wait for reveal effect to finish and then hide view
  setTimeout(() => {
    themeSwitcherView.classList.remove(revealType);
    themeSwitcherView.style.display = "none";
  }, toggleThemeTimeout);
}

/**
 * toggle theme
 */
function toggleTheme() {
  const currentTheme = getCurrentTheme();
  let targetTheme = "light";

  if (currentTheme === "light") {
    targetTheme = "dark";
  }

  document.documentElement.setAttribute("data-theme", targetTheme);
}

/**
 * change theme and create reveal effect
 * @param {*} event button click event
 */
function changeTheme(event) {
  createCircleReveal(event.clientX, event.clientY);
}

function setDefaultTheme() {
  document.documentElement.setAttribute("data-theme", "dark");
}

async function init() {
  setDefaultTheme();
  await setDarkThemeScreenshot();
}

init();
