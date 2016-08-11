FROM node:5.8.0

ENV PORT 80
ENV NODE_ENV production

CMD ["npm", "install"]
CMD ["npm", "start"]

EXPOSE 80
