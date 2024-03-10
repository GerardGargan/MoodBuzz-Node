# MoodBuzz Web App

This web app was developed as part of the CSC7082 Web Development Module at Queens University Belfast.

The App itself is an emotion recording app. For fun, it was themed around my favorite christmas movie, home alone.

URL for locally hosted server: http://localhost:3001

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Features](#features)

## Prerequisites

- Node JS
- Node Package Manager (NPM)
- MoodBuzz API Server [https://github.com/GerardGargan/MoodBuzz-API](https://github.com/GerardGargan/MoodBuzz-API)
- MoodBuzz API server database (see MoodBuzz-API README)

This project relies on an API for CRUD processes. Please install the API and corresponding database, details can be found on the MoodBuzz API Server Repo's README.md

## Installation

```bash
# Clone the repository
git clone https://github.com/GerardGargan/MoodBuzz-Node.git

# Navigate to the project directory
cd MoodBuzz-Node

# Install dependencies
npm install
```

## Configuration

1. Create a new file named config.env in the root directory of the project
2. Add the following code to config.env:

```plaintext
PORT = 3000
```

Change the port to suit your requirements

## Usage

```bash
npm start
```

## Features

- User registration
- Login
- Record an emotive snapshot
- Edit snapshots
- Delete snapshots
- View snapshots
- View analytics
