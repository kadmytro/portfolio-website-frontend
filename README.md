# My Portfolio Website

This is my personal portfolio website, designed and built from scratch using pure HTML, CSS, and JavaScript. It's crafted to be lightweight, responsive, and provide a snappy user experience.

## Features

- **Pure Vanilla:** Built without any frameworks or libraries, ensuring optimal performance and a deep understanding of web fundamentals.
- **Responsive Design:** Fully responsive layout, providing a seamless experience across various devices and screen sizes.
- **Lightweight and Snappy:** Optimized for fast loading times and smooth interactions.
- **Custom Build Process:** Uses a simple build script (`build.js`) to manage environment variables and create a distribution build.
- **Data Driven:** Fetches data from a backend API defined in the `.env` file.
- **Logo Animation:** Utilizes Snap.svg for a custom logo animation.
- **All Custom Code:** All JavaScript, CSS, and HTML, excluding Snap.svg, are written by me.

## Getting Started

### Prerequisites

- Node.js and npm installed.
- A `.env` file with the `API_URL` variable set.

### Installation

1.  Clone the repository:

    ```bash
    git clone <https://github.com/kadmytro/portfolio-website-frontend>
    ```

2.  Navigate to the project directory:

    ```bash
    cd <portfolio-website-frontend>
    ```

3.  Install dependencies:

    ```bash
    npm install
    ```

4.  Create a `.env` file in the root directory and add your API URL:

    ```
    API_URL=your_backend_api_url
    ```

    Replace `your_backend_api_url` with the URL of your backend API.

### Build Process

1.  Build the project:

    ```bash
    npm run build
    ```

    This will:

    - Create a `dist` directory.
    - Generate `dist/env.js` containing your API URL.
    - Copy `index.html`, `style.css`, and `script.js` to `dist`.
    - Copy the `assets` and `lib` directories to `dist`.

### Running the Website

1.  Start a local server:

    ```bash
    npm start
    ```

    This will start a local server using `serve` and serve the contents of the `dist` directory.

2.  Open your browser and navigate to the URL provided by the `serve` command.

## Project Structure

```
portfolio-website-frontend/
├── index.html
├── style.css
├── script.js
├── assets/
│   └── ... (images, etc.)
├── lib/
│   └── ... (Snap.svg)
├── build.js
├── package.json
├── package-lock.json
└── .env
```

## Dependencies

- `dotenv`: Loads environment variables from a `.env` file.
- `serve`: Simple HTTP server for serving static files.
- `Snap.svg`: External script for SVG animations.

## Build Script (`build.js`)

The `build.js` script automates the build process by:

- Creating the `dist` directory.
- Reading the `API_URL` from the `.env` file and creating a `dist/env.js` file to make it accessible to the frontend JavaScript.
- Copying essential files and directories to the `dist` directory.

## Environmental Variables

- `API_URL`: The URL of the backend API that provides data to the website.
