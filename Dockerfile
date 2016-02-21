FROM node:5.6.0

ENV PORT 80
ENV NODE_ENV production

RUN mkdir -p /opt/app
ADD package.json /opt/app/package.json

WORKDIR /opt/app
ADD . /opt/app

CMD ["npm", "install"]
CMD ["npm", "run", "bower"]
CMD ["npm", "run", "build"]
CMD ["node", "index.js"]

EXPOSE 80
