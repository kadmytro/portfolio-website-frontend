let jobIdList = null;
let selectedJobId = null;

// logo morphing animation
class MorphingAnimation {
  constructor(svgSelector) {
    this.s = Snap(svgSelector);
    this.letterC = this.s.select("#letterC");
    this.slash = this.s.select("#slash");
    this.letterD = this.s.select("#letterD");

    this.finalC =
      "m 28.73516,10.328478 -7.026753,3.79148 -6.716184,3.623904 -6.866191,3.704845 -3.171778,1.711421 -0.01014,2.801457 0.0068,2.729386 3.100259,1.816729 6.806948,3.98882 7.396081,4.334048 6.527049,3.824802 -0.07236,-4.722451 -4.501769,-2.887418 -7.26687,-4.660943 -4.322962,-2.772733 -2.412595,-1.547429 2.638611,-1.598632 5.049944,-3.059565 6.146568,-3.723967 4.622525,-2.800608 z";
    this.finalD =
      "m 50.63984,10.328478 6.221074,3.356754 5.732668,3.093221 6.406774,3.456953 5.42039,2.924722 0.01014,2.801457 -0.0068,2.729386 -5.032895,2.949239 -6.030269,3.533692 -5.358811,3.140223 -7.408362,4.341245 0.07236,-4.722451 4.990974,-3.201192 5.337566,-3.423495 6.232386,-3.99743 1.94327,-1.246406 -2.178299,-1.319747 -6.204489,-3.759059 -5.981634,-3.624039 -4.093226,-2.479927 z";

    this.initialC = this.letterC.attr("d");
    this.initialD = this.letterD.attr("d");
    this.isMorphing = false;
    this.animationDone = false;

    this.duration = 600;
    this.pauseDuration = 400;

    this.maskC = this.s.select("#maskC");
    this.maskD = this.s.select("#maskD");
    this.maskSlash = this.s.select("#maskSlash");

    this.glowOverlay = this.s.select("#glowOverlay");
    this.maskC.attr({ d: this.initialC });
    this.maskD.attr({ d: this.initialD });
    this.maskSlash.attr({ d: this.slash.attr("d") });
  }

  morphToFinal() {
    if (!this.isMorphing) {
      return;
    }
    setTimeout(() => {
      this.letterC.animate({ d: this.finalC }, this.duration, mina.easeinout);
      this.letterD.animate({ d: this.finalD }, this.duration, mina.easeinout);
      this.maskC.animate({ d: this.finalC }, this.duration, mina.easeinout);
      this.maskD.animate({ d: this.finalD }, this.duration, mina.easeinout);
    }, this.pauseDuration);

    this.glowOverlay.animate({ x: "50%", y: "-50%" }, this.duration + this.pauseDuration, mina.easeinout, () => {
      setTimeout(() => this.morphToInitial());
    });
  }

  morphToInitial() {
    setTimeout(() => {
      this.letterC.animate({ d: this.initialC }, this.duration, mina.easeinout);
      this.letterD.animate({ d: this.initialD }, this.duration, mina.easeinout);
      this.maskC.animate({ d: this.initialC }, this.duration, mina.easeinout);
      this.maskD.animate({ d: this.initialD }, this.duration, mina.easeinout);

      if (!this.animationDone) {
        setTimeout(() => {
          this.animationDone = true;
        }, 1.3 * this.duration);
      }
    }, this.pauseDuration);

    this.glowOverlay.animate({ x: "-50%", y: "50%" }, this.duration + this.pauseDuration, mina.easeinout, () => {
      setTimeout(() => this.morphToFinal(), this.pauseDuration);
    });
  }

  startAnimation() {
    this.isMorphing = true;
    setTimeout(() => this.morphToFinal(), 2 * this.pauseDuration);
  }

  stopAnimation() {
    this.isMorphing = false;
    this.isGradientMoving = false;
  }

  isDone() {
    return this.animationDone;
  }
}

const logoAnimation = new MorphingAnimation("#morphingSvg");

// Recalculate UI variables and update styles
function recalculateVariables(noTransit = false) {
  const root = document.documentElement;
  const parent = document.getElementById("experience-names-wrapper");
  const selectedJobName = document.querySelector(`.job-name[job-id="${selectedJobId}"]`);
  const parentRect = parent.getBoundingClientRect();
  const rect = selectedJobName.getBoundingClientRect();
  const parentScrollLeft = parent.scrollLeft;

  const offsetTop = rect.top - parentRect.top;
  const offsetLeft = rect.left - parentRect.left + parentScrollLeft;
  const selectorWidth = window.innerWidth > 800 ? 2 : rect.width;
  const selectorHeight = window.innerWidth > 800 ? rect.height : 2;

  const selectedIndicator = document.getElementById("job-selected-indicator");
  if (noTransit) {
    selectedIndicator.classList.add("no-transit");
  }

  root.style.setProperty("--selected-indicator-offset", `${offsetLeft}px, ${offsetTop}px`);

  root.style.setProperty("--selected-indicator-height", `${selectorHeight}px`);

  root.style.setProperty("--selector-indicator-width", `${selectorWidth}px`);
  if (!noTransit) {
    selectedJobName.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }

  requestAnimationFrame(() => {
    selectedIndicator.classList.remove("no-transit");
  });
}

// Handle job selection and update UI
function selectJob(element) {
  const jobId = element.getAttribute("job-id");
  if (!jobId) {
    console.error("Invalid job selection");
    return;
  }

  if (jobId === selectedJobId) {
    return;
  }

  document.querySelector(`.job-name[job-id="${selectedJobId}"]`).classList.remove("selected");
  element.classList.add("selected");

  document.querySelector(`.job-description[job-id="${selectedJobId}"]`)?.classList.remove("visible");
  document.querySelector(`.job-description[job-id="${jobId}"]`)?.classList.add("visible");

  selectedJobId = jobId;
  recalculateVariables();
}

// Fetch data from API
async function fetchData(maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      if (!window.env) {
        throw new Error(`Environmental variables not set. Make sure that script env.js is loaded`);
      }
      const response = await fetch(`${window.env.API_URL}/api/data`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data (status: ${response.status})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retries * 1000));
      } else {
        console.error("All retry attempts failed.");
        requestAnimationFrame(() => {
          document.getElementById("morphingSvg").classList.add("hidden");
          document.querySelector(".error-message p").innerHTML =
            "We encountered an error while loading the data. Please try again later.";
          document.querySelector(".error-container").classList.remove("hidden");
          logoAnimation.stopAnimation();
        });
        throw error;
      }
    }
  }
}

// Load page content and handle UI updates
async function loadPage() {
  try {
    const data = await fetchData();
    if (!data) return;

    await insertAboutMe(data.aboutMe);
    await insertExperience(data.experience);
    await insertProjects(data.projects);

    await new Promise((resolve) => {
      const checkAnimation = () => {
        if (logoAnimation.isDone()) {
          resolve();
        } else {
          requestAnimationFrame(checkAnimation);
        }
      };
      checkAnimation();
    });

    requestAnimationFrame(() => {
      document.getElementById("loading-container").classList.add("hidden");
      logoAnimation.stopAnimation();
      handleResize();
    });
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById("loading-container").classList.add("gone");
        document.getElementById("content").classList.remove("hidden");
        document.querySelector("footer.hidden").classList.remove("hidden");
        document.body.classList.add("loaded");
        startButtonAnimations();
      }, 400);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Insert "About Me" section data into the DOM
async function insertAboutMe(aboutMeData) {
  return new Promise((resolve) => {
    const aboutMeContainer = document.getElementById("aboutMe-container");
    aboutMeContainer.innerHTML = "";

    const socialMediaContainer = document.getElementById("social-media-container");
    socialMediaContainer.innerHTML = "";

    aboutMeContainer.innerHTML = `
    <img id="photo" src="${window.env.API_URL}/api/photo" alt="${aboutMeData.name}">
    <h1>${aboutMeData.name}</h1>
    <h3>${aboutMeData.position}</h3>
    <p>${aboutMeData.text}</p>
    <div class="button">
      <div class="button-inner-shell"></div>
      <a class="button-content" href="mailto:${aboutMeData.mailTo}">Say hello</a>
    </div>`;

    socialMediaContainer.innerHTML = `
      <a href="${aboutMeData.instagramUrl}" target="_blank" class="instagram icon"></a>
      <a href="${aboutMeData.githubUrl}" target="_blank" class="github icon"></a>
      <a href="${aboutMeData.linkedInUrl}" target="_blank" class="linked-in icon"></a>`;

    requestAnimationFrame(() => {
      resolve();
    });
  });
}

async function insertExperience(experienceData) {
  return new Promise((resolve) => {
    if (!experienceData || !Array.isArray(experienceData)) {
      return;
    }
    const namesContainer = document.getElementById("experience-names");
    namesContainer.innerHTML = "";
    const descriptionsContainer = document.getElementById("experience-descriptions");
    descriptionsContainer.innerHTML = "";
    jobIdList = experienceData.map((d) => d.jobId);

    for (let job of experienceData) {
      let isSelected = false;
      if (!selectedJobId) {
        selectedJobId = job.jobId;
        isSelected = true;
      }
      namesContainer.innerHTML += `
      <button class="job-name ${isSelected ? "selected" : ""}" job-id="${job.jobId}" onclick="selectJob(this)">${
        job.place
      }</button>`;

      descriptionsContainer.innerHTML += `
        <div class="job-description ${isSelected ? "visible" : ""}" job-id="${job.jobId}">
          <h4 class="job-title">${job.position}</h4>
          <div class="job-period">${job.period}</div>
          <div class="job-details">
            <ul>${job.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>
            <div class="job-stack">${job.stack.map((tech) => `<div class="item">${tech}</div>`).join("")}</div>
          </div>
        </div>`;
    }
    namesContainer.innerHTML += '<div id="job-selected-indicator"></div>';

    requestAnimationFrame(() => {
      resolve();
    });
  });
}

async function insertProjects(projectsData) {
  return new Promise((resolve) => {
    const projectsContainer = document.getElementById("projects-list");
    if (!projectsContainer) {
      console.error("Projects container not found.");
      return;
    }

    projectsContainer.innerHTML = "";
    for (const project of projectsData) {
      projectsContainer.innerHTML += `
        <div class="project card">
          <div class="card-inner-shell"></div>
          <div class="card-content">
            <header>
              <div class="card-top">
                <div class="project-icon icon"></div>
                <div class="project-links">
                  ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="github icon"></a>` : ""}
                  ${
                    project.externalUrl
                      ? `<a href="${project.externalUrl}" target="_blank" class="external icon"></a>`
                      : ""
                  }
                </div>
              </div>
              <div>
                <h4>${project.name}</h4>
                <p>${project.details}</p>
              </div>
            </header>
            <footer>
              <div class="project-stack">
                ${project.stack.map((tech) => `<div class="item">${tech}</div>`).join("")}
              </div>
            </footer>
          </div>
        </div>
      `;
    }

    requestAnimationFrame(() => {
      resolve();
    });
  });
}

// Track mouse movement for UI effects
document.body.onmousemove = (e) => {
  for (const card of document.getElementsByClassName("card")) {
    const rect = card.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }

  for (const button of document.getElementsByClassName("button")) {
    const rect = button.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      button.style.setProperty("--mouse-x", `${x}px`);
      button.style.setProperty("--mouse-y", `${y}px`);
    }
  }
};

// Animate CTA to attract attention
function startButtonAnimations() {
  const buttons = document.querySelectorAll(".button");
  for (let button of buttons) {
    let initialX = Math.random() * button.clientWidth;
    let initialY = Math.random() * button.clientHeight;
    button.style.setProperty("--mouse-x", `${initialX}px`);
    button.style.setProperty("--mouse-y", `${initialY}px`);

    let velocityX = 0.5;
    let velocityY = 0.1;

    const initialVelocityX = velocityX;
    const initialVelocityY = velocityY;

    function updateGradientPosition() {
      if (button.dataset.mouseOver !== "true") {
        const rect = button.getBoundingClientRect();
        let x = parseFloat(button.style.getPropertyValue("--mouse-x"));
        let y = parseFloat(button.style.getPropertyValue("--mouse-y"));

        x += velocityX;
        y += velocityY;

        if (x < 0 || x > rect.width) {
          velocityX *= -1;
          velocityX = Math.sign(velocityX) * Math.abs(initialVelocityX);
        }
        if (y < 0 || y > rect.height) {
          velocityY *= -1;
          velocityY = Math.sign(velocityY) * Math.abs(initialVelocityY);
        }

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        button.style.setProperty("--mouse-x", `${x}px`);
        button.style.setProperty("--mouse-y", `${y}px`);
      }

      requestAnimationFrame(updateGradientPosition);
    }

    updateGradientPosition();

    button.addEventListener("mouseenter", () => {
      button.dataset.mouseOver = "true";
    });

    button.addEventListener("mouseleave", () => {
      button.dataset.mouseOver = "false";
      velocityX += Math.random() * 2;
      velocityY += Math.random() * 2;
    });

    document.body.addEventListener("mousemove", (e) => {
      if (button.dataset.mouseOver === "true") {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        button.style.setProperty("--mouse-x", `${x}px`);
        button.style.setProperty("--mouse-y", `${y}px`);
      }
    });
  }
}

window.addEventListener("load", async function () {
  const hash = window.location.hash;
  let targetElement = null;
  if (hash) {
    const targetId = hash.substring(1);
    targetElement = document.getElementById(targetId);
  }

  await new Promise((resolve) => {
    const checkAnimation = () => {
      if (logoAnimation.isDone()) {
        this.setTimeout(resolve, 250);
      } else {
        requestAnimationFrame(checkAnimation);
      }
    };
    checkAnimation();
  });

  requestAnimationFrame(() => {
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Adjust UI elements on window resize
function handleResize() {
  recalculateVariables(true);
}

logoAnimation.startAnimation();
loadPage();
