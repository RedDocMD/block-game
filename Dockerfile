FROM node:12.18.3-stretch
WORKDIR /classical_planner
COPY package.json .
RUN apt-get update
RUN apt-get install python3 git build-essential cmake -y
RUN npm install
RUN git clone https://github.com/aibasel/downward.git
WORKDIR /classical_planner/downward/
RUN python3 build.py -j4
WORKDIR /classical_planner
RUN mkdir src test
COPY src/*.ts src/
COPY data/*.txt data/
COPY src/config.json src/
RUN npm run start
CMD ["python3", "fast-downward.py", "data/problem-domain.pddl", "problem.pddl", "--search", "astar(lmcut())"]