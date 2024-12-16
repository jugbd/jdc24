# JDC24 Conference Website

Welcome to the official repository for the Java Developers' Conference 2024 (JDC24) website.

## About

This repository contains the source code and assets for the JDC24 conference website. The site provides information about the event, including schedules, speakers, venue details, and more.

## Contributing

We welcome contributions to improve the website. Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute.

## License

This project is licensed under the [MIT License](LICENSE).



# Deployment 

NOTE: This is process is manual but for the control of cache to a server.

### Generating `manifest.json` for Deployment

To automate the process of generating a `manifest.json` file, you can use Node.js with a file-walking library. Follow the steps below:

---

### Step 1: Install Required Tools

Ensure you have the following prerequisites:

- **Node.js** and **npm** installed on your system.

---

### Step 2: Create a Script to Generate `manifest.json`

Run the following command to create a new script file:

```bash
touch generate-manifest.js
```

Then, write the logic for generating the `manifest.json` file in this script. When executed, the script will generate the `manifest.json` file in the root directory of your project.

---

### Step 3: Update the `CACHE_NAME` in the `service-worker.js` File

Locate the `service-worker.js` file in your project and ensure the `CACHE_NAME` is updated to reflect the current version or changes.

---

### Final Step: Upload Files to the Server

After generating the `manifest.json` file and updating the `service-worker.js` file, upload all the necessary files to your server to complete the deployment process.

---
