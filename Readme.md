[![Build Status](https://travis-ci.org/mihaerzen/project-bootstrap.svg?branch=master)](https://travis-ci.org/mihaerzen/project-bootstrap)

# Readme

## Why?
Better question is why not? I've created this project because I want to eliminate the time I spend bootstrapping my newest projects.

__project-bootstrap__ aims to give developer a clean bootstrapped project which he/she can then immediately use for building the next best thing.

## Requirements

NodeJs version ~5.3.0

Run `npm install && npm run bower`

## Development

When you are ready to start developing simply run:

`npm run dev`

This will bring up the node server on `http://localhost:3000/` and listen to all the changes you make in your code. If change is detected node server (nodemon) is restarted or frontend code (js, scss) is rebuilt.

## Ready to deploy?

You think you have finished and you are ready to deploy? Run:

`npm run build`

This will compile your frontend code from `src` and put it into `public` folder. It will also minify and copy all the images from `src/images` to `public/images`. Be aware that __build__ command reads the `NODE_ENV` variable and based on the setting it builds the appropriate version of your assets. Set `NODE_ENV=production` to deploy production version of your code.

You can force production build with `npm run build:prod`.

Differences between `development` and `production`:

|                       | development | production |
| --------------------- |:----------- |:---------- |
| compile js with babel | yes         | yes        |
| js source maps        | yes         | no         |
| minified compiled js  | no          | yes        |
| compile scss          | yes         | yes        |
| atuo-prefixed css     | no          | yes        |
| scss source maps      | yes         | no         |
| minified css          | no          | yes        |
| versioned assets      | no          | yes        |

## Docker

There is a `Dockerfile` which you can use for running this project in a docker container. If you don't know what docker is or how to use it I suggest you to have a look at this:

[Docker Tutorial - What is Docker & Docker Containers, Images, etc?](https://www.youtube.com/watch?v=pGYAg7TMmp0)

_Credits to [LearnCode.academy](https://www.youtube.com/user/learncodeacademy)_

## Todos
- [x] Add tests for controllers
- [ ] Find a good way to successfuly test the whole flow (BDD)
