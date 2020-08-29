FROM node:12.18.3-stretch
WORKDIR /classical_planner
COPY package.json .
RUN apt-get update
RUN apt-get install python3 git build-essential cmake -y
RUN npm install
RUN git clone https://github.com/danfis/fast-downward.git
WORKDIR /classical_planner/fast-downward/
RUN python3 build.py release64
WORKDIR /classical_planner
RUN mkdir src test
COPY src/*.ts src/*.ts
COPY src/config.json src/config.json
COPY data/*.txt data/*.txt
RUN npm run start